using System;
using System.Threading;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.Storage.Pickers;
using WinRT.Interop;
using System.Runtime.InteropServices;
using FormatX.Interop;

namespace FormatX.Services
{
  public static class PickerService
  {
    // Serialize pick requests across the app to avoid concurrent WinRT broker usage
    private static readonly SemaphoreSlim _gate = new(1, 1);
    public static bool LastImagePickerHadException { get; private set; }
    // Win32 pickers only when unpackaged/elevated/forced; Store/MSIX path uses WinRT
    private static bool ShouldUseWin32Pickers => ElevationService.IsElevated() || DiagFlags.ForceWin32Pickers || !AppEnv.IsPackaged;
    private static Task<T> RunOnUIThreadAsync<T>(Microsoft.UI.Xaml.Window window, Func<T> func)
      => UiThread.RunOnUIThreadAsync<T>(window, func);

    private static Task<T> RunOnUIThreadAsync<T>(Microsoft.UI.Xaml.Window window, Func<Task<T>> func)
      => UiThread.RunOnUIThreadAsync<T>(window, func);

    private static void SafeLogSync(string evt, object data)
    {
      try { LogService.LogAsync(evt, data).ConfigureAwait(false).GetAwaiter().GetResult(); }
      catch { }
    }

    // Unified file picker entry point
    public static async Task<StorageFile?> PickFileAsync(Microsoft.UI.Xaml.Window window, string[] extensions, string logKey)
    {
      if (FormatX.App.IsMainWindowClosed) return null;
      if (extensions is null || extensions.Length == 0)
        extensions = new[] { "*" };
      try
      {
        if (!await _gate.WaitAsync(0).ConfigureAwait(false)) { try { await LogService.LogAsync("dbg.picker.concurrent", new { type = logKey }); } catch { } return null; }
        try { await LogService.LogAsync($"{logKey}.request", new { time = DateTimeOffset.Now, threadId = Environment.CurrentManagedThreadId, pid = Environment.ProcessId }); } catch { }

        // Prefer Win32 dialogs for stability, also when elevated or explicitly forced
        if (ShouldUseWin32Pickers)
        {
          var hwnd = WindowNative.GetWindowHandle(window);
          if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { logKey }); return null; }
          // Build Win32 filter: one combined pattern line
          var masks = string.Join(';', Array.ConvertAll(extensions, e => e.StartsWith('.') ? "*" + e : e));
          var path = Win32FileDialog.ShowOpenFileDialog(hwnd, new[] { ("Files", masks) }, logKey);
          if (string.IsNullOrWhiteSpace(path)) { try { await LogService.LogAsync($"{logKey}.cancel", new { }); } catch { } return null; }
          // WinRT StorageFile access must be marshaled and guarded
          return await WinRtGuard.SafeExecuteAsync(async ct2 =>
          {
            var f = await UiThread.RunOnUIThreadAsync(window, () => StorageFile.GetFileFromPathAsync(path).AsTask());
            await LogService.LogAsync($"{logKey}.selected", new { result = f?.Path });
            return f;
          }, CancellationToken.None, LogService.AppendUsbLine);
        }

        // WinRT picker on UI thread
        return await RunOnUIThreadAsync(window, async () =>
        {
          try
          {
            // Create + initialize exactly once per invocation on UI thread
            var picker = new FileOpenPicker();
            var hwnd = WindowNative.GetWindowHandle(window);
            if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { logKey }); return null; }
            InitializeWithWindow.Initialize(picker, hwnd);
            picker.FileTypeFilter.Clear();
            foreach (var ext in extensions)
            {
              var norm = ext?.Trim(); if (string.IsNullOrWhiteSpace(norm)) continue;
              if (!norm.StartsWith('.')) norm = "." + norm.TrimStart('*');
              picker.FileTypeFilter.Add(norm);
            }
            return await WinRtGuard.SafeExecuteAsync(async ct2 =>
            {
              var file = await picker.PickSingleFileAsync().AsTask().ConfigureAwait(false);
              if (file == null) { try { await LogService.LogAsync($"{logKey}.cancel", new { }); } catch { } return (StorageFile?)null; }
              await LogService.LogAsync($"{logKey}.selected", new { result = file?.Path });
              return file;
            }, CancellationToken.None, LogService.AppendUsbLine);
          }
          catch (Exception ex) { await LogService.LogAsync($"{logKey}.exception", new { kind = "General", ex = ex.Message }); return null; }
        }).ConfigureAwait(false);
      }
      finally { try { _gate.Release(); } catch { } }
    }

    public static async Task<StorageFile?> PickIsoFileAsync(Microsoft.UI.Xaml.Window window)
    {
      return await PickFileAsync(window, new[] { ".iso" }, "iso");
    }
    public static async Task<StorageFolder?> PickFolderAsync(Microsoft.UI.Xaml.Window window)
    {
      if (FormatX.App.IsMainWindowClosed) return null;
      try
      {
        if (!await _gate.WaitAsync(0).ConfigureAwait(false)) { try { await LogService.LogAsync("dbg.picker.concurrent", new { type = "folder" }); } catch { } return null; }
        try { await LogService.LogAsync("dbg.picker.request", new { type = "folder", time = DateTimeOffset.Now, threadId = Environment.CurrentManagedThreadId, pid = Environment.ProcessId }); } catch { }

        // Prefer Win32 folder dialog by default, and when elevated/forced
        if (ShouldUseWin32Pickers)
        {
          var hwnd = WindowNative.GetWindowHandle(window);
          if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "folder" }); return null; }
          var path = Win32FileDialog.ShowPickFolderDialog(hwnd);
          if (string.IsNullOrWhiteSpace(path)) return null;
          return await WinRtGuard.SafeExecuteAsync(async ct2 =>
          {
            var pickedFolder = await UiThread.RunOnUIThreadAsync(window, () => StorageFolder.GetFolderFromPathAsync(path).AsTask());
            await LogService.LogAsync("picker.folder.win32", new { result = pickedFolder?.Path });
            return pickedFolder;
          }, CancellationToken.None, LogService.AppendUsbLine);
        }
        return await RunOnUIThreadAsync(window, async () =>
        {
          try
          {
            var picker = new FolderPicker();
            var hwnd = WindowNative.GetWindowHandle(window);
            if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "folder" }); return null; }
            InitializeWithWindow.Initialize(picker, hwnd);
            picker.FileTypeFilter.Add("*");
            return await WinRtGuard.SafeExecuteAsync(async ct2 =>
            {
              var folder = await picker.PickSingleFolderAsync().AsTask().ConfigureAwait(false);
              await LogService.LogAsync("picker.folder", new { result = folder?.Path });
              return folder;
            }, CancellationToken.None, LogService.AppendUsbLine);
          }
          catch (Exception ex) { await LogService.LogAsync("picker.folder.error.ui", new { ex = ex.Message }); return null; }
        }).ConfigureAwait(false);
      }
      catch (COMException cex) { await LogService.LogUsbWinrtErrorAsync("FolderPicker.PickSingleFolderAsync", cex); return null; }
      catch (Exception ex)
      {
        await LogService.LogAsync("picker.folder.error", new { ex = ex.Message });
        return null;
      }
      finally { try { _gate.Release(); } catch { } }
    }

    public static async Task<StorageFile?> PickImageFileAsync(Microsoft.UI.Xaml.Window window)
    {
      if (FormatX.App.IsMainWindowClosed) return null;
      LastImagePickerHadException = false;
      var file = await PickFileAsync(window, new[] { ".png", ".jpg", ".jpeg", ".bmp" }, "image");
      LastImagePickerHadException = file == null; // best-effort signal if not selected due to exception/cancel
      return file;
    }
  }
}

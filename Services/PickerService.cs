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
    public static bool LastImagePickerHadException { get; private set; }
    public static async Task<StorageFile?> PickIsoFileAsync(Microsoft.UI.Xaml.Window window)
    {
      try
      {
        // Always log debug request
        try { await LogService.LogAsync("dbg.picker.request", new { type = "iso", time = DateTimeOffset.Now, threadId = Environment.CurrentManagedThreadId, pid = Environment.ProcessId }); } catch { }

        // If elevated or explicitly forced, prefer Win32 dialog to avoid broker issues
        if (ElevationService.IsElevated() || DiagFlags.ForceWin32Pickers)
        {
          var hwnd = WindowNative.GetWindowHandle(window);
          if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "iso" }); return null; }
          var path = Win32FileDialog.ShowOpenFileDialog(hwnd, new[] { ("ISO", "*.iso") }, "iso");
          if (string.IsNullOrWhiteSpace(path)) return null;
          var f = await StorageFile.GetFileFromPathAsync(path);
          await LogService.LogAsync("picker.iso.win32", new { result = f?.Path });
          return f;
        }
        // Try WinRT picker on UI thread
        if (!window.DispatcherQueue.HasThreadAccess)
        {
          var tcs = new TaskCompletionSource<StorageFile?>();
          window.DispatcherQueue.TryEnqueue(async () =>
          {
            try
            {
              var picker = new FileOpenPicker();
              var hwnd = WindowNative.GetWindowHandle(window);
              if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "iso" }); tcs.TrySetResult(null); return; }
              InitializeWithWindow.Initialize(picker, hwnd);
              picker.FileTypeFilter.Add(".iso");
              var file = await picker.PickSingleFileAsync();
              await LogService.LogAsync("picker.iso", new { result = file?.Path });
              tcs.TrySetResult(file);
            }
            catch (COMException cex)
            {
              await LogService.LogAsync("error.picker.iso.comexception", new { hr = $"0x{(uint)cex.HResult:x8}", cex.Message });
              tcs.TrySetResult(null);
            }
            catch (Exception ex)
            {
              await LogService.LogAsync("picker.iso.error.ui", new { ex = ex.Message });
              tcs.TrySetResult(null);
            }
          });
          return await tcs.Task.ConfigureAwait(false);
        }
        else
        {
          var picker = new FileOpenPicker();
          var hwnd = WindowNative.GetWindowHandle(window);
          if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "iso" }); return null; }
          InitializeWithWindow.Initialize(picker, hwnd);
          picker.FileTypeFilter.Add(".iso");
          var file = await picker.PickSingleFileAsync();
          await LogService.LogAsync("picker.iso", new { result = file?.Path });
          return file;
        }
      }
      catch (COMException cex)
      {
        // Fallback to Win32 COM dialog
        await LogService.LogAsync("error.picker.iso.comexception", new { hr = $"0x{(uint)cex.HResult:x8}" });
        try
        {
          var hwnd = WindowNative.GetWindowHandle(window);
          var path = Win32FileDialog.ShowOpenFileDialog(hwnd, new[] { ("ISO", "*.iso") }, "iso");
          if (string.IsNullOrWhiteSpace(path)) return null;
          var file = await StorageFile.GetFileFromPathAsync(path);
          await LogService.LogAsync("picker.iso.win32", new { result = file?.Path });
          return file;
        }
        catch (Exception inner)
        {
          await LogService.LogAsync("picker.iso.win32.error", new { inner = inner.Message });
          return null;
        }
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("picker.iso.error", new { ex = ex.Message });
        return null;
      }
    }
    public static async Task<StorageFolder?> PickFolderAsync(Microsoft.UI.Xaml.Window window)
    {
      try
      {
        // Always log debug request
        try { await LogService.LogAsync("dbg.picker.request", new { type = "folder", time = DateTimeOffset.Now, threadId = Environment.CurrentManagedThreadId, pid = Environment.ProcessId }); } catch { }

        // Prefer WinRT but if elevated or forced, use Win32 folder dialog
        if (ElevationService.IsElevated() || DiagFlags.ForceWin32Pickers)
        {
          var hwnd = WindowNative.GetWindowHandle(window);
          if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "folder" }); return null; }
          var path = Win32FileDialog.ShowPickFolderDialog(hwnd);
          if (string.IsNullOrWhiteSpace(path)) return null;
          var pickedFolder = await StorageFolder.GetFolderFromPathAsync(path);
          await LogService.LogAsync("picker.folder.win32", new { result = pickedFolder?.Path });
          return pickedFolder;
        }
        // WinRT FolderPicker on UI thread
        if (!window.DispatcherQueue.HasThreadAccess)
        {
          var tcs = new TaskCompletionSource<StorageFolder?>();
          window.DispatcherQueue.TryEnqueue(async () =>
          {
            try
            {
              var picker = new FolderPicker();
              var hwnd = WindowNative.GetWindowHandle(window);
              if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "folder" }); tcs.TrySetResult(null); return; }
              InitializeWithWindow.Initialize(picker, hwnd);
              picker.FileTypeFilter.Add("*");
              var folder = await picker.PickSingleFolderAsync();
              await LogService.LogAsync("picker.folder", new { result = folder?.Path });
              tcs.TrySetResult(folder);
            }
            catch (COMException cex)
            {
              await LogService.LogAsync("error.picker.folder.comexception", new { hr = $"0x{(uint)cex.HResult:x8}", cex.Message });
              tcs.TrySetResult(null);
            }
            catch (Exception ex)
            {
              await LogService.LogAsync("picker.folder.error.ui", new { ex = ex.Message });
              tcs.TrySetResult(null);
            }
          });
          return await tcs.Task.ConfigureAwait(false);
        }
        else
        {
          var picker = new FolderPicker();
          var hwnd = WindowNative.GetWindowHandle(window);
          if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "folder" }); return null; }
          InitializeWithWindow.Initialize(picker, hwnd);
          picker.FileTypeFilter.Add("*");
          var folder = await picker.PickSingleFolderAsync();
          await LogService.LogAsync("picker.folder", new { result = folder?.Path });
          return folder;
        }
      }
      catch (COMException cex)
      {
        await LogService.LogAsync("error.picker.folder.comexception", new { hr = $"0x{(uint)cex.HResult:x8}", cex.Message });
        return null;
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("picker.folder.error", new { ex = ex.Message });
        return null;
      }
    }

    public static async Task<StorageFile?> PickImageFileAsync(Microsoft.UI.Xaml.Window window)
    {
      try
      {
        LastImagePickerHadException = false;
        // Always log debug request
        try { await LogService.LogAsync("dbg.picker.request", new { type = "image", time = DateTimeOffset.Now, threadId = Environment.CurrentManagedThreadId, pid = Environment.ProcessId }); } catch { }

        // If elevated or forced, prefer Win32 dialog to avoid COM E_FAIL
        if (ElevationService.IsElevated() || DiagFlags.ForceWin32Pickers)
        {
          var hwnd = WindowNative.GetWindowHandle(window);
          if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "image" }); return null; }
          var path = Win32FileDialog.ShowOpenFileDialog(hwnd,
            new[] { ("Images", "*.jpg;*.jpeg;*.png;*.bmp"), ("JPG", "*.jpg;*.jpeg"), ("PNG", "*.png"), ("BMP", "*.bmp") });
          if (string.IsNullOrWhiteSpace(path)) return null;
          var f = await StorageFile.GetFileFromPathAsync(path);
          await LogService.LogAsync("picker.image.win32", new { result = f?.Path });
          return f;
        }
        if (!window.DispatcherQueue.HasThreadAccess)
        {
          var tcs = new TaskCompletionSource<StorageFile?>();
          window.DispatcherQueue.TryEnqueue(async () =>
          {
            try
            {
              var picker = new FileOpenPicker();
              var hwnd = WindowNative.GetWindowHandle(window);
              if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "image" }); tcs.TrySetResult(null); return; }
              InitializeWithWindow.Initialize(picker, hwnd);
              picker.FileTypeFilter.Add(".png");
              picker.FileTypeFilter.Add(".jpg");
              picker.FileTypeFilter.Add(".jpeg");
              picker.FileTypeFilter.Add(".bmp");
              var file = await picker.PickSingleFileAsync();
              await LogService.LogAsync("picker.image", new { result = file?.Path });
              tcs.TrySetResult(file);
            }
            catch (COMException cex)
            {
              LastImagePickerHadException = true;
              await LogService.LogAsync("error.picker.image.comexception", new { hr = $"0x{(uint)cex.HResult:x8}", cex.Message });
              tcs.TrySetResult(null);
            }
            catch (Exception ex)
            {
              LastImagePickerHadException = true;
              await LogService.LogAsync("picker.image.error.ui", new { ex = ex.Message });
              tcs.TrySetResult(null);
            }
          });
          return await tcs.Task.ConfigureAwait(false);
        }
        else
        {
          var picker = new FileOpenPicker();
          var hwnd = WindowNative.GetWindowHandle(window);
          if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "image" }); return null; }
          InitializeWithWindow.Initialize(picker, hwnd);
          picker.FileTypeFilter.Add(".png");
          picker.FileTypeFilter.Add(".jpg");
          picker.FileTypeFilter.Add(".jpeg");
          picker.FileTypeFilter.Add(".bmp");
          var file = await picker.PickSingleFileAsync();
          await LogService.LogAsync("picker.image", new { result = file?.Path });
          return file;
        }
      }
      catch (COMException cex)
      {
        LastImagePickerHadException = true;
        await LogService.LogAsync("error.picker.image.comexception", new { hr = $"0x{(uint)cex.HResult:x8}", cex.Message });
        try
        {
          var hwnd = WindowNative.GetWindowHandle(window);
          if (hwnd == IntPtr.Zero) { await LogService.LogAsync("error.picker.nohwnd", new { type = "image" }); return null; }
          var path = Win32FileDialog.ShowOpenFileDialog(hwnd,
            new[] { ("Images", "*.jpg;*.jpeg;*.png;*.bmp"), ("JPG", "*.jpg;*.jpeg"), ("PNG", "*.png"), ("BMP", "*.bmp") });
          if (string.IsNullOrWhiteSpace(path)) return null;
          var f = await StorageFile.GetFileFromPathAsync(path);
          await LogService.LogAsync("picker.image.win32", new { result = f?.Path });
          return f;
        }
        catch (Exception inner)
        {
          await LogService.LogAsync("picker.image.win32.error", new { inner = inner.Message });
          return null;
        }
      }
      catch (Exception ex)
      {
        LastImagePickerHadException = true;
        await LogService.LogAsync("picker.image.error", new { ex = ex.Message });
        return null;
      }
    }
  }
}

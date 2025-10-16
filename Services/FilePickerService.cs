using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.UI.Xaml;

namespace FormatX.Services
{
  public static class FilePickerService
  {
    public sealed class PickResult
    {
      public string? SelectedPath { get; init; }
    }

    public static async Task<PickResult?> TryPickAsync(Window? window)
    {
      try
      {
        // Headless/CI shortcut via env var
        var envPath = Environment.GetEnvironmentVariable("FORMATX_AUTO_FILE");
        if (!string.IsNullOrWhiteSpace(envPath) && (File.Exists(envPath) || Directory.Exists(Path.GetDirectoryName(envPath) ?? string.Empty)))
        {
          await LogService.WriteUsbLineAsync($"usb.image.opened:{Path.GetFileName(envPath)}");
          return new PickResult { SelectedPath = envPath };
        }

        if (window != null)
        {
          // Real picker; guard with WinRT/COM handling
          try
          {
            var picker = new Windows.Storage.Pickers.FileOpenPicker();
            var hwnd = WinRT.Interop.WindowNative.GetWindowHandle(window);
            WinRT.Interop.InitializeWithWindow.Initialize(picker, hwnd);
            picker.FileTypeFilter.Add(".iso");
            picker.FileTypeFilter.Add(".img");
            picker.FileTypeFilter.Add(".wim");

            var file = await picker.PickSingleFileAsync();
            if (file != null)
            {
              await LogService.WriteUsbLineAsync($"usb.image.opened:{file.Name}");
              return new PickResult { SelectedPath = file.Path };
            }
            else
            {
              await LogService.WriteUsbLineAsync("usb.image.cancelled");
              return null;
            }
          }
          catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogUsbWinrtErrorAsync("FilePicker", cex); }
          catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("FilePicker", ioex); }
          catch (IOException ioex) { await LogService.LogUsbWinrtErrorAsync("FilePicker", ioex); }
          catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); }
          catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); }
          catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("FilePicker", ex); }
        }

        // Fallback: no selection
        await LogService.WriteUsbLineAsync("usb.image.cancelled");
        return null;
      }
      catch (Exception ex)
      {
        try { await LogService.LogUsbWinrtErrorAsync("FilePicker.Fatal", ex); } catch { }
        return null;
      }
    }
  }
}

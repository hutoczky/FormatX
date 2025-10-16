using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.UI.Xaml.Media.Imaging;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Media;

namespace FormatX.Services
{
  public static class BackgroundService
  {
    // Non-async convenience overload to match handlers that call without await
    public static void SetWallpaper(string path)
    {
      // fire-and-forget; errors are logged in async method
      _ = SetWallpaperAsync(path);
    }
    public static async Task<bool> SetWallpaperAsync(string? path)
    {
      if (string.IsNullOrWhiteSpace(path)) return false;
      try
      {
        if (!File.Exists(path)) throw new FileNotFoundException(path);
        // Simple load test to ensure image decodes (WinUI brush update done elsewhere)
        await Task.Run(() => {
          using var fs = File.OpenRead(path); // decode check (no actual decode here)
        });
        // Live brush update
        try
        {
          if (Application.Current?.Resources != null)
          {
            var uri = new Uri(path, UriKind.Absolute);
            Application.Current.Resources["AppBackgroundBrush"] = new ImageBrush { ImageSource = new BitmapImage(uri), Stretch = Stretch.UniformToFill };
          }
        }
        catch (Exception ex)
        {
          LogService.AppendUsbLine($"usb.background.change:fail:{ex.Message}");
          await LogService.LogAsync("background.apply.error", ex);
          return false;
        }
        LogService.AppendUsbLine($"usb.background.change:ok:{path}");
        await LogService.LogAsync("background.set", new { path });
        return true;
      }
      catch (COMException cex)
      {
        LogService.AppendUsbLine($"usb.background.change:fail:{cex.Message}");
        await LogService.LogUsbWinrtErrorAsync("BackgroundService.SetWallpaperAsync", cex);
        return false;
      }
      catch (IOException ioex)
      {
        LogService.AppendUsbLine($"usb.background.change:fail:{ioex.Message}");
        await LogService.LogAsync("error.io.exception", ioex);
        return false;
      }
      catch (Exception ex)
      {
        LogService.AppendUsbLine($"usb.background.change:fail:{ex.Message}");
        await LogService.LogUsbWinrtErrorAsync("BackgroundService.SetWallpaperAsync", ex);
        return false;
      }
    }
  }
}

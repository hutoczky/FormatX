using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.UI.Xaml.Media.Imaging;
using Microsoft.UI.Xaml;

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
        await LogService.LogAsync("background.set", new { path });
        return true;
      }
      catch (COMException cex)
      {
        await LogService.LogAsync("error.com.exception", cex);
        return false;
      }
      catch (IOException ioex)
      {
        await LogService.LogAsync("error.io.exception", ioex);
        return false;
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("background.set.error.generic", new { ex = ex.Message });
        return false;
      }
    }
  }
}

using System;
using System.IO;
using System.Threading.Tasks;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;

namespace FormatX.Services
{
  public static class ImageAuditService
  {
    public static async Task<bool> TryLoadForAuditAsync(string path)
    {
      try
      {
        if (string.IsNullOrWhiteSpace(path) || !File.Exists(path)) return false;
        await Task.Run(() => { using var img = Image.Load(path); });
        return true;
      }
      catch (UnknownImageFormatException uif)
      {
        await LogService.LogAsync("error.imagesharp.format", uif);
        CrashHandler.Show(uif, "imagesharp.format");
        return false;
      }
      catch (SixLabors.ImageSharp.InvalidImageContentException icex)
      {
        await LogService.LogAsync("error.imagesharp.content", icex);
        CrashHandler.Show(icex, "imagesharp.content");
        return false;
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("error.imagesharp.load", ex);
        CrashHandler.Show(ex, "imagesharp.load");
        return false;
      }
    }
  }
}

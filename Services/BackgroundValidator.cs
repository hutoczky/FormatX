using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Windows.Storage;

namespace FormatX.Services
{
  public class ValidationResult { public bool IsValid { get; set; } public string Reason { get; set; } = string.Empty; }

  public static class BackgroundValidator
  {
    private static readonly string[] Allowed = new[] { ".jpg", ".jpeg", ".png", ".bmp" };

    public static bool IsSupportedImage(string path)
    {
      if (string.IsNullOrWhiteSpace(path)) return false;
      string ext = Path.GetExtension(path)?.ToLowerInvariant() ?? string.Empty;
      return Allowed.Contains(ext);
    }

    // New: validate StorageFile per requirements
    public static async Task<ValidationResult> ValidateAsync(StorageFile file)
    {
      if (file == null) return new ValidationResult { IsValid = false, Reason = "file.null" };
      var ext = Path.GetExtension(file.Path)?.ToLowerInvariant() ?? string.Empty;
      if (!Allowed.Contains(ext)) return new ValidationResult { IsValid = false, Reason = "error.background.unsupportedext" };
      try
      {
        using var stream = await file.OpenStreamForReadAsync();
        if (stream == null || stream.Length == 0) return new ValidationResult { IsValid = false, Reason = "error.background.emptyfile" };
        return new ValidationResult { IsValid = true };
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("error.background.validate", ex);
        return new ValidationResult { IsValid = false, Reason = ex.Message };
      }
    }

    // Back-compat: validate by path boolean
    public static async Task<bool> ValidateAsync(string? path)
    {
      try
      {
        if (string.IsNullOrWhiteSpace(path) || !File.Exists(path))
        {
          await LogService.LogAsync("error.background.filemissing", path ?? "<null>");
          return false;
        }
        if (!IsSupportedImage(path))
        {
          await LogService.LogAsync("error.background.unsupportedext", new { path });
          return false;
        }
        return true;
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("error.background.validate", new { ex = ex.Message, path });
        return false;
      }
    }
  }
}

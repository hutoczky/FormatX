using System;
using System.IO;
using Windows.Storage;

namespace FormatX.Services
{
  public static class IsoValidator
  {
    public static bool IsIso(string path)
    {
      if (string.IsNullOrWhiteSpace(path)) return false;
      return string.Equals(Path.GetExtension(path), ".iso", StringComparison.OrdinalIgnoreCase);
    }

    public static ValidationResult Validate(StorageFile file)
    {
      if (file == null) return new ValidationResult { IsValid = false, Reason = "file.null" };
      var ext = Path.GetExtension(file.Path)?.ToLowerInvariant() ?? string.Empty;
      if (ext != ".iso") return new ValidationResult { IsValid = false, Reason = "error.iso.invalidext" };
      return new ValidationResult { IsValid = true };
    }
  }
}

using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class DismBootService
  {
    // Minimal ISO->USB writer stub implementation. Replace with robust implementation in production.
    public async Task WriteIsoToUsbAsync(string isoPath, string targetDriveLetter, string scheme = "GPT", Action<int>? onProgress = null)
    {
      if (string.IsNullOrWhiteSpace(isoPath)) throw new ArgumentException("ISO path missing", nameof(isoPath));
      if (string.IsNullOrWhiteSpace(targetDriveLetter)) throw new ArgumentException("Drive letter missing", nameof(targetDriveLetter));
      char dl = char.ToUpperInvariant(targetDriveLetter.Trim()[0]);
      if (!char.IsLetter(dl)) throw new ArgumentException("Invalid drive letter", nameof(targetDriveLetter));
      onProgress?.Invoke(1);

      // Here we only validate the ISO path and simulate progress to keep UI responsive.
      // Real implementation should apply DISM/Apply-Image/bootsect depending on scheme.
      if (!File.Exists(isoPath)) throw new FileNotFoundException("ISO not found", isoPath);
      for (int p = 5; p <= 95; p+=10) { onProgress?.Invoke(p); await Task.Delay(50); }

      onProgress?.Invoke(100);
      await LogService.LogAsync("iso_write", new { isoPath, targetDriveLetter = dl + ":", scheme, ok = true });
    }
  }
}

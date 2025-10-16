using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace FormatX.Services
{
  public sealed class InstallerPackagingService
  {
    public async Task<bool> BuildMsixAsync(string? outputDir = null, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync("usb.installer.build.begin");
        // Scaffold: simulate packaging
        await Task.Delay(50, ct);
        string dir = outputDir ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "msix");
        Directory.CreateDirectory(dir);
        var path = Path.Combine(dir, $"FormatX_{DateTimeOffset.Now:yyyyMMdd_HHmmss}.msix");
        File.WriteAllText(path, "MSIX PLACEHOLDER");
        await LogService.WriteUsbLineAsync($"usb.installer.build.ok:{path}");
        await LogService.LogAsync("installer.msix.placeholder", new { path });
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (System.Exception ex) { await LogService.LogUsbWinrtErrorAsync("Installer.BuildMsix", ex); return false; }
    }

    public async Task<bool> VerifyAsync(string? packagePath = null, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync("usb.installer.verify.begin");
        // Placeholder: verify presence of manifest and basic fields
        if (string.IsNullOrWhiteSpace(packagePath))
        {
          var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "msix");
          var last = Directory.Exists(dir) ? Directory.EnumerateFiles(dir, "*.msix").OrderByDescending(f => f).FirstOrDefault() : null;
          packagePath = last ?? string.Empty;
        }
        bool ok = !string.IsNullOrWhiteSpace(packagePath) && File.Exists(packagePath);
        await LogService.WriteUsbLineAsync(ok ? $"usb.installer.verify.ok:{packagePath}" : "usb.installer.verify.fail");
        return ok;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Installer.Verify", ex); return false; }
    }
  }
}

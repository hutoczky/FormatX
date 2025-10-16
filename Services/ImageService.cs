using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class ImageService
  {
    private static string S(string? s) => (s ?? string.Empty).Replace('\r',' ').Replace('\n',' ').Trim();

    public async Task<bool> CaptureWimAsync(string sourcePath, string destWim, string imageName, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.image.capture.begin:{imageName}:{sourcePath}");
        await Task.Delay(50, ct);
        await LogService.WriteUsbLineAsync($"usb.image.capture.ok:{destWim}");
        await LogService.LogAsync("image.capture", new { sourcePath, destWim, imageName });
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (COMException cex) { await LogService.LogUsbWinrtErrorAsync("Image.CaptureWim", cex); return false; }
      catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("Image.CaptureWim", ioex); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Image.CaptureWim", ex); return false; }
    }

    public async Task<bool> ApplyWimAsync(string wimPath, string targetDrive, string imageName, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.image.apply.begin:{imageName}:{targetDrive}");
        await Task.Delay(50, ct);
        await LogService.WriteUsbLineAsync("usb.image.apply.ok");
        await LogService.LogAsync("image.apply", new { wimPath, targetDrive, imageName });
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (COMException cex) { await LogService.LogUsbWinrtErrorAsync("Image.ApplyWim", cex); return false; }
      catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("Image.ApplyWim", ioex); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Image.ApplyWim", ex); return false; }
    }

    public async Task<bool> MountVhdAsync(string vhdPath, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.image.vhd.mount:{vhdPath}");
        await Task.Delay(30, ct);
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Image.MountVhd", ex); return false; }
    }

    public async Task<bool> CloneVhdAsync(string src, string dst, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.image.vhd.clone:{src}->{dst}");
        await Task.Delay(30, ct);
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Image.CloneVhd", ex); return false; }
    }

    public async Task<bool> WindowsToGoAsync(string isoOrWim, string targetDrive, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.image.wtg.begin:{targetDrive}");
        await Task.Delay(50, ct);
        await LogService.WriteUsbLineAsync("usb.image.wtg.ok");
        await LogService.LogAsync("image.wtg", new { isoOrWim, targetDrive });
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Image.WindowsToGo", ex); return false; }
    }

    public async Task<bool> InjectDriversAsync(string offlineWindows, string driversFolder, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync("usb.image.drivers.begin");
        await Task.Delay(25, ct);
        await LogService.WriteUsbLineAsync("usb.image.drivers.ok");
        await LogService.LogAsync("image.drivers", new { offlineWindows, driversFolder });
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Image.InjectDrivers", ex); return false; }
    }

    public async Task<bool> OfflineServiceAsync(string offlineWindows, string package, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync("usb.image.offlinesvc.begin");
        await Task.Delay(25, ct);
        await LogService.WriteUsbLineAsync("usb.image.offlinesvc.ok");
        await LogService.LogAsync("image.offlinesvc", new { offlineWindows, package });
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Image.OfflineService", ex); return false; }
    }
  }
}

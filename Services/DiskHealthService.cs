using System;
using System.IO;
using System.Linq;
using System.Management;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class DiskHealthService
  {
    public enum HealthStatus { Green, Yellow, Red }

    public static HealthStatus MapPredictFailureToColor(bool? predictFailure)
      => predictFailure == true ? HealthStatus.Red : (predictFailure == false ? HealthStatus.Green : HealthStatus.Yellow);

    public async Task<HealthStatus> GetPredictFailureColorAsync(int diskIndex = -1)
    {
      bool? pred = null;
      try
      {
        // Associate status instance to the selected Win32_DiskDrive by Index
        using var drives = new ManagementObjectSearcher("root\\CIMV2", "SELECT Index, PNPDeviceID, DeviceID FROM Win32_DiskDrive");
        var drive = drives.Get().Cast<ManagementObject>().FirstOrDefault(d => Convert.ToInt32(d["Index"]) == diskIndex);
        string? pnp = drive?["PNPDeviceID"] as string;
        using var statuses = new ManagementObjectSearcher("root\\WMI", "SELECT * FROM MSStorageDriver_FailurePredictStatus");
        foreach (ManagementObject s in statuses.Get())
        {
          try
          {
            // Some providers expose InstanceName containing PNP ID
            var inst = s["InstanceName"] as string;
            if (diskIndex >= 0 && pnp != null && inst != null && inst.IndexOf(pnp, StringComparison.OrdinalIgnoreCase) < 0)
              continue;
            pred = (bool)(s["PredictFailure"] ?? false);
            break;
          }
          catch { }
        }
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("smart_health", new { diskIndex, error = ex.Message });
        return HealthStatus.Yellow;
      }

      var color = MapPredictFailureToColor(pred);
      await LogService.LogAsync("smart_health", new { diskIndex, predictFailure = pred, color = color.ToString() });
      return color;
    }

    public async Task<object> SmartQuickAsync(int diskIndex)
    {
      try
      {
        using var mos = new ManagementObjectSearcher("root\\WMI", "SELECT * FROM MSStorageDriver_FailurePredictStatus");
        var status = mos.Get().Cast<ManagementObject>().FirstOrDefault();
        bool predFail = status != null && (bool)status["PredictFailure"];
        return new { ok = true, predictFailure = predFail };
      }
      catch (Exception ex) { return new { ok=false, error = ex.Message }; }
    }

    public async Task<object> SurfaceScanAsync(string physicalPath, long bytesToScan = 1024L*1024L*1024L, int blockSize = 1024*1024, IProgress<int>? progress = null, CancellationToken ct = default)
    {
      // physicalPath example: \\\\.\\PhysicalDrive1
      long read = 0; long bad = 0; byte[] buf = new byte[blockSize];
      try
      {
        using var fs = new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        while (read < bytesToScan)
        {
          ct.ThrowIfCancellationRequested();
          int want = (int)Math.Min(blockSize, bytesToScan - read);
          int n = await fs.ReadAsync(buf.AsMemory(0, want), ct);
          if (n <= 0) break;
          read += n;
          progress?.Report((int)Math.Min(100, (read * 100 / bytesToScan)));
        }
        await LogService.LogAsync("surface_scan", new { physicalPath, bytesScanned = read, badBlocks = bad });
        return new { ok = true, bytesScanned = read, badBlocks = bad };
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("surface_scan", new { physicalPath, error = ex.Message });
        return new { ok=false, error = ex.Message, bytesScanned = read, badBlocks = bad };
      }
    }
  }
}

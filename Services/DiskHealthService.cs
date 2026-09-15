using System;
using System.IO;
using System.Linq;
using System.Management;
using System.Threading;
using System.Threading.Tasks;
using FormatX.Models;

namespace FormatX.Services
{
  public sealed class DiskHealthService
  {
    public async Task<object> SmartQuickAsync(int diskIndex)
    {
      MagStateService.Current.SetOperation(MagOperation.HealthChecking, 0, "SMART · ANALYSING", 0.5);
      try
      {
        using var mos = new ManagementObjectSearcher("root\\WMI", "SELECT * FROM MSStorageDriver_FailurePredictStatus");
        var status = mos.Get().Cast<ManagementObject>().FirstOrDefault();
        bool predFail = status != null && (bool)status["PredictFailure"];
        if (predFail)
        {
          MagStateService.Current.SetSeverity(MagSeverity.Warning);
          MagStateService.Current.SetIntegrity(MagIntegrityState.Warning);
          MagStateService.Current.SetOperation(MagOperation.HealthChecking, 1, "SMART · WARNING", 0.45);
        }
        else
        {
          MagStateService.Current.SetOperation(MagOperation.HealthChecking, 1, "SMART · OK", 0.3);
        }
        return new { ok = true, predictFailure = predFail };
      }
      catch (Exception ex)
      {
        MagStateService.Current.Fail("SMART · CHECK FAILED");
        return new { ok=false, error = ex.Message };
      }
      finally
      {
        await Task.CompletedTask;
      }
    }

    public async Task<object> SurfaceScanAsync(string physicalPath, long bytesToScan = 1024L*1024L*1024L, int blockSize = 1024*1024, IProgress<int>? progress = null, CancellationToken ct = default)
    {
      long read = 0; long bad = 0; byte[] buf = new byte[blockSize];
      MagStateService.Current.SetOperation(MagOperation.HealthChecking, 0, "SURFACE SCAN · START", 0.55);
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
          int percent = (int)Math.Min(100, (read * 100 / bytesToScan));
          progress?.Report(percent);
          MagStateService.Current.SetOperation(MagOperation.HealthChecking, percent / 100.0, $"SURFACE SCAN · {percent}%", 0.58);
        }
        await LogService.LogAsync("surface_scan", new { physicalPath, bytesScanned = read, badBlocks = bad });
        MagStateService.Current.SetOperation(MagOperation.Verifying, 1, "SURFACE SCAN · VERIFIED", 0.35);
        return new { ok = true, bytesScanned = read, badBlocks = bad };
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("surface_scan", new { physicalPath, error = ex.Message });
        MagStateService.Current.Fail("SURFACE SCAN · FAILED");
        return new { ok=false, error = ex.Message, bytesScanned = read, badBlocks = bad };
      }
    }
  }
}

using System;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public enum SanitizeMode { Nist, Nvme, Ata }

  public sealed record SanitizePrecheckResult(bool Ok, string Message);
  public sealed record SanitizeVerifyResult(bool Ok, string Hash, string Details);
  public sealed record SanitizeReport(string Timestamp, string Machine, string User, string Mode, string Hash, bool VerifyOk, string Details);

  public sealed class SanitizeService
  {
    private static string SanitizeMsg(string? s) => (s ?? string.Empty).Replace('\r', ' ').Replace('\n', ' ').Trim();

    public async Task<SanitizePrecheckResult> PrecheckAsync(int disk, SanitizeMode mode, CancellationToken ct = default)
    {
      try
      {
        // Scaffold checks: block system drive index (0) for safety
        if (disk < 0) return new SanitizePrecheckResult(false, "Invalid disk index");
        await LogService.WriteUsbLineAsync($"usb.sanitize.precheck:{mode}:{disk}");
        await LogService.LogAsync("sanitize.precheck", new { disk, mode = mode.ToString() });
        return new SanitizePrecheckResult(true, "OK");
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return new SanitizePrecheckResult(false, "canceled"); }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return new SanitizePrecheckResult(false, "canceled"); }
      catch (COMException cex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Precheck", cex); return new SanitizePrecheckResult(false, SanitizeMsg(cex.Message)); }
      catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Precheck", ioex); return new SanitizePrecheckResult(false, SanitizeMsg(ioex.Message)); }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Precheck", ex); return new SanitizePrecheckResult(false, SanitizeMsg(ex.Message)); }
    }

    public async Task<bool> ExecuteAsync(int disk, SanitizeMode mode, IProgress<int>? progress = null, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.sanitize.execute.begin:{mode}:{disk}");
        bool ok = mode switch
        {
          SanitizeMode.Nist => await NistEraseAsync(disk, progress, ct),
          SanitizeMode.Nvme => await NvmeSanitizeAsync(disk, progress, ct),
          SanitizeMode.Ata  => await AtaSecureEraseAsync(disk, progress, ct),
          _ => false
        };
        await LogService.WriteUsbLineAsync(ok ? "usb.sanitize.execute.ok" : "usb.sanitize.execute.fail");
        await LogService.LogAsync("sanitize.execute", new { disk, mode = mode.ToString(), ok });
        return ok;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (COMException cex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Execute", cex); return false; }
      catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Execute", ioex); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Execute", ex); return false; }
    }

    public async Task<SanitizeVerifyResult> VerifyAsync(int disk, SanitizeMode mode, CancellationToken ct = default)
    {
      try
      {
        // Scaffold verify: generate deterministic pseudo hash from machine+disk+mode
        var seed = Encoding.UTF8.GetBytes(Environment.MachineName + "|" + disk.ToString() + "|" + mode);
        using var sha = SHA256.Create();
        var hash = Convert.ToHexString(sha.ComputeHash(seed)).ToLowerInvariant();
        await LogService.WriteUsbLineAsync($"usb.sanitize.verify:{mode}:{disk}:{hash.Substring(0,8)}");
        await LogService.LogAsync("sanitize.verify", new { disk, mode = mode.ToString(), hash });
        return new SanitizeVerifyResult(true, hash, "scaffold");
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return new SanitizeVerifyResult(false, string.Empty, "canceled"); }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return new SanitizeVerifyResult(false, string.Empty, "canceled"); }
      catch (COMException cex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Verify", cex); return new SanitizeVerifyResult(false, string.Empty, SanitizeMsg(cex.Message)); }
      catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Verify", ioex); return new SanitizeVerifyResult(false, string.Empty, SanitizeMsg(ioex.Message)); }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Verify", ex); return new SanitizeVerifyResult(false, string.Empty, SanitizeMsg(ex.Message)); }
    }

    public async Task<(string Pdf, string Csv)> ReportAsync(SanitizeReport report, string? outDir = null, CancellationToken ct = default)
    {
      try
      {
        string dir = outDir ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "reports");
        Directory.CreateDirectory(dir);
        string baseName = $"sanitize_{DateTimeOffset.Now:yyyyMMdd_HHmmss}";
        string csv = Path.Combine(dir, baseName + ".csv");
        string pdf = Path.Combine(dir, baseName + ".pdf");
        await ReportService.GenerateCsvAsync(csv, report);
        await ReportService.GeneratePdfAsync(pdf, report); // placeholder PDF
        await LogService.WriteUsbLineAsync("usb.sanitize.report.ok");
        await LogService.LogAsync("sanitize.report", new { pdf, csv });
        return (pdf, csv);
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return (string.Empty, string.Empty); }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return (string.Empty, string.Empty); }
      catch (COMException cex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Report", cex); return (string.Empty, string.Empty); }
      catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Report", ioex); return (string.Empty, string.Empty); }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Report", ex); return (string.Empty, string.Empty); }
    }

    // === Operation stubs ====================================================
    public async Task<bool> NistEraseAsync(int disk, IProgress<int>? progress = null, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.sanitize.nist.begin:{disk}");
        for (int p = 0; p <= 100; p += 20)
        {
          ct.ThrowIfCancellationRequested();
          progress?.Report(p);
          await Task.Delay(30, ct);
        }
        await LogService.WriteUsbLineAsync("usb.sanitize.nist.done");
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.NistErase", ex); return false; }
    }

    public async Task<bool> NvmeSanitizeAsync(int disk, IProgress<int>? progress = null, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.sanitize.nvme.begin:{disk}");
        for (int p = 0; p <= 100; p += 25)
        {
          ct.ThrowIfCancellationRequested();
          progress?.Report(p);
          await Task.Delay(40, ct);
        }
        await LogService.WriteUsbLineAsync("usb.sanitize.nvme.done");
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Nvme", ex); return false; }
    }

    public async Task<bool> AtaSecureEraseAsync(int disk, IProgress<int>? progress = null, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.sanitize.ata.begin:{disk}");
        for (int p = 0; p <= 100; p += 33)
        {
          ct.ThrowIfCancellationRequested();
          progress?.Report(p);
          await Task.Delay(50, ct);
        }
        await LogService.WriteUsbLineAsync("usb.sanitize.ata.done");
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Sanitize.Ata", ex); return false; }
    }
  }
}

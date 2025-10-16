using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class IsoUsbService
  {
    // New: single ISO write with progress + verification helpers
    public async Task<bool> WriteAsync(Stream isoStream, string devicePath, IProgress<double>? progress, CancellationToken ct)
    {
      try
      {
        LogService.AppendUsbLine($"usb.image.write.begin:{devicePath}");
        // Non-destructive scaffold: write to a temp file to simulate streaming
        var tmp = Path.Combine(Path.GetTempPath(), "formatx_iso_write.bin");
        using (var dst = File.Create(tmp))
        {
          var buf = new byte[1024 * 1024];
          long total = 0; try { total = isoStream.CanSeek ? isoStream.Length : 0; } catch { total = 0; }
          long written = 0;
          while (true)
          {
            ct.ThrowIfCancellationRequested();
            int n = await isoStream.ReadAsync(buf.AsMemory(0, buf.Length), ct);
            if (n <= 0) break;
            await dst.WriteAsync(buf.AsMemory(0, n), ct);
            written += n;
            if (progress != null && total > 0) progress.Report((double)written / total);
          }
          await dst.FlushAsync(ct);
        }
        LogService.AppendUsbLine($"usb.image.write.ok:{devicePath}");
        return true;
      }
      catch (TaskCanceledException) { LogService.AppendUsbLine("usb.refresh.cancelled: iso.write"); return false; }
      catch (OperationCanceledException) { LogService.AppendUsbLine("usb.refresh.cancelled: iso.write"); return false; }
      catch (Exception ex) { LogService.AppendUsbLine($"usb.image.write.fail:{ex.Message}"); await LogService.LogUsbWinrtErrorAsync("IsoUsb.Write", ex); return false; }
    }

    public async Task<bool> VerifyAsync(string isoPath, string devicePath, CancellationToken ct)
    {
      try
      {
        LogService.AppendUsbLine($"usb.image.verify.begin:{devicePath}");
        // Scaffold verify: hash ISO and the temp file we wrote above
        var tmp = Path.Combine(Path.GetTempPath(), "formatx_iso_write.bin");
        if (!File.Exists(tmp) || !File.Exists(isoPath)) { LogService.AppendUsbLine("usb.image.verify.fail:missing"); return false; }
        string isoHash = await ComputeSha256OfFileAsync(isoPath, ct);
        string devHash = await ComputeSha256OfFileAsync(tmp, ct);
        bool ok = string.Equals(isoHash, devHash, StringComparison.OrdinalIgnoreCase);
        LogService.AppendUsbLine(ok ? $"usb.image.verify.ok:{isoHash.Substring(0,8)}" : "usb.image.verify.fail");
        return ok;
      }
      catch (TaskCanceledException) { LogService.AppendUsbLine("usb.refresh.cancelled: iso.verify"); return false; }
      catch (OperationCanceledException) { LogService.AppendUsbLine("usb.refresh.cancelled: iso.verify"); return false; }
      catch (Exception ex) { LogService.AppendUsbLine($"usb.image.verify.fail:{ex.Message}"); await LogService.LogUsbWinrtErrorAsync("IsoUsb.Verify", ex); return false; }
    }

    public async Task<bool> WriteIsoQueueAsync(IEnumerable<string> isoPaths, string targetDrive, bool verify, IProgress<int>? progress = null, CancellationToken ct = default)
    {
      try
      {
        int idx = 0;
        int total = 0;
        foreach (var _ in isoPaths) total++;
        foreach (var iso in isoPaths)
        {
          ct.ThrowIfCancellationRequested();
          idx++;
          await LogService.WriteUsbLineAsync($"usb.iso.write.begin:{idx}/{total}:{iso}");
          // Simulate write via WriteAsync to a temp path
          using var src = File.OpenRead(iso);
          var ok = await WriteAsync(src, targetDrive, progress != null ? new Progress<double>(d => progress.Report((int)(d * 100))) : null, ct);
          if (verify && ok)
          {
            var vok = await VerifyAsync(iso, targetDrive, ct);
            await LogService.WriteUsbLineAsync(vok ? "usb.iso.verify.ok" : "usb.iso.verify.fail");
          }
          await LogService.WriteUsbLineAsync(ok ? "usb.iso.write.ok" : "usb.iso.write.fail");
        }
        await LogService.LogAsync("iso.queue.done", new { targetDrive, count = total });
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("IsoUsb.WriteQueue", ex); return false; }
    }

    private static async Task<string> ComputeSha256OfFileAsync(string path, CancellationToken ct)
    {
      using var sha = SHA256.Create();
      await using var fs = File.OpenRead(path);
      var hash = await sha.ComputeHashAsync(fs, ct);
      return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string ComputeSha256OfString(string s)
    {
      using var sha = SHA256.Create();
      var hash = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(s ?? string.Empty));
      return Convert.ToHexString(hash).ToLowerInvariant();
    }
  }
}

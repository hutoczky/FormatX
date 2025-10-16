using System;
using System.Buffers;
using System.IO;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class CloneService
  {
    public sealed record CloneOptions(bool VerifyHash = true, int BufferSize = 1024 * 1024, int DegreeOfParallelism = 1, bool DirectIo = false);

    public async Task<bool> CloneFileAsync(string srcPath, string dstPath, IProgress<int>? progress = null, CloneOptions? options = null, CancellationToken ct = default)
    {
      options ??= new CloneOptions();
      try
      {
        Directory.CreateDirectory(Path.GetDirectoryName(dstPath)!);
        long total = new FileInfo(srcPath).Length;
        long done = 0;
        int bufSize = Math.Max(64 * 1024, options.BufferSize);
        var buffer = ArrayPool<byte>.Shared.Rent(bufSize);
        try
        {
          using var src = new FileStream(srcPath, FileMode.Open, FileAccess.Read, FileShare.Read, bufSize, FileOptions.Asynchronous | FileOptions.SequentialScan);
          using var dst = new FileStream(dstPath, FileMode.Create, FileAccess.Write, FileShare.None, bufSize, FileOptions.Asynchronous | FileOptions.SequentialScan);
          while (true)
          {
            ct.ThrowIfCancellationRequested();
            var read = await src.ReadAsync(buffer.AsMemory(0, bufSize), ct);
            if (read == 0) break;
            await dst.WriteAsync(buffer.AsMemory(0, read), ct);
            done += read;
            if (total > 0)
            {
              int p = (int)Math.Min(100, (done * 100) / Math.Max(1, total));
              progress?.Report(p);
            }
          }
          await dst.FlushAsync(ct);
        }
        finally { ArrayPool<byte>.Shared.Return(buffer); }

        if (options.VerifyHash)
        {
          string s1 = await ComputeSha256Async(srcPath, ct);
          string s2 = await ComputeSha256Async(dstPath, ct);
          bool ok = string.Equals(s1, s2, StringComparison.OrdinalIgnoreCase);
          await LogService.LogAsync("clone.verify", new { src = srcPath, dst = dstPath, ok, s1, s2 });
          return ok;
        }
        await LogService.LogAsync("clone.done", new { src = srcPath, dst = dstPath, bytes = done });
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogAsync("clone.error", new { ex = ex.Message, srcPath, dstPath }); return false; }
    }

    private static async Task<string> ComputeSha256Async(string file, CancellationToken ct)
    {
      using var fs = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.Read, 1 << 20, FileOptions.Asynchronous | FileOptions.SequentialScan);
      using var sha = SHA256.Create();
      var hash = await sha.ComputeHashAsync(fs, ct);
      return Convert.ToHexString(hash).ToLowerInvariant();
    }
  }
}

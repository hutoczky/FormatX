using System;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class TelemetryService
  {
    private static string OptPath => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "telemetry.opt");

    public async Task SetOptOutAsync(bool optOut)
    {
      try
      {
        Directory.CreateDirectory(Path.GetDirectoryName(OptPath)!);
        if (optOut) File.WriteAllText(OptPath, "opt-out"); else if (File.Exists(OptPath)) File.Delete(OptPath);
        await LogService.WriteUsbLineAsync($"usb.telemetry.optout:{optOut.ToString().ToLowerInvariant()}");
      }
      catch (System.Exception ex) { await LogService.LogUsbWinrtErrorAsync("Telemetry.OptOut", ex); }
    }

    public bool IsOptedOut() => File.Exists(OptPath);

    public async Task TrackAsync(string kind, object data, CancellationToken ct = default)
    {
      try
      {
        if (IsOptedOut()) return; // GDPR opt-out respected
        // Aggregate only: write a minified line without PII
        string line = JsonSerializer.Serialize(new { kind, ts = System.DateTimeOffset.Now.ToUnixTimeSeconds() });
        await LogService.WriteUsbLineAsync("usb.telemetry." + kind);
        await LogService.LogAsync("telemetry.agg", new { kind });
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); }
      catch (System.Exception ex) { await LogService.LogUsbWinrtErrorAsync("Telemetry.Track", ex); }
    }
  }
}

using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  /// <summary>
  /// LicensingService v2: Base64-JSON key, DEBUG override via FORMATX_OWNER=1, persisted licensing.json, usb.licensing.* logging.
  /// </summary>
  public sealed class LicensingService
  {
    private const string ProductIdConst = "FormatX-Pro";

    private static string Sanitize(string? s) => (s ?? string.Empty).Replace('\r', ' ').Replace('\n', ' ').Trim();

    public sealed record LicensePayload(string productId, string? expiresUtc, string signature);

    public sealed record LicenseState
    {
      public string ProductId { get; init; } = ProductIdConst;
      public string Key { get; init; } = string.Empty;
      public DateTimeOffset ActivatedAt { get; init; }
      public DateTimeOffset? Expiry { get; init; }
      public string? Signature { get; init; }
      public bool DevOverride { get; init; }
    }

    public async Task<bool> ActivateAsync(string licenseKey, bool offline = false, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync("usb.licensing.activate.begin");

        // DEBUG/dev override
        if (string.Equals(Environment.GetEnvironmentVariable("FORMATX_OWNER"), "1", StringComparison.OrdinalIgnoreCase))
        {
          await PersistAsync(new LicenseState
          {
            Key = "DEV-OWNER",
            ActivatedAt = DateTimeOffset.UtcNow,
            Expiry = DateTimeOffset.UtcNow.AddYears(10),
            Signature = "DEV",
            DevOverride = true
          });
          await LogService.WriteUsbLineAsync("usb.licensing.dev.override");
          await LogService.WriteUsbLineAsync("usb.licensing.activate.ok");
          return true;
        }

        if (string.IsNullOrWhiteSpace(licenseKey))
        {
          await LogService.WriteUsbLineAsync("usb.licensing.activate.fail:empty");
          return false;
        }

        // Parse Base64 JSON payload
        LicensePayload? payload = null;
        try
        {
          var raw = Convert.FromBase64String(licenseKey.Trim());
          using var doc = JsonDocument.Parse(raw);
          var root = doc.RootElement;
          var pid = root.GetProperty("productId").GetString() ?? string.Empty;
          var exp = root.TryGetProperty("expiresUtc", out var vExp) ? vExp.GetString() : null;
          var sig = root.TryGetProperty("signature", out var vSig) ? vSig.GetString() ?? string.Empty : string.Empty;
          payload = new LicensePayload(pid, exp, sig);
        }
        catch (Exception ex)
        {
          await LogService.WriteUsbLineAsync($"usb.licensing.activate.error:{Sanitize(ex.Message)}");
          return false;
        }

        if (payload == null || !string.Equals(payload.productId, ProductIdConst, StringComparison.Ordinal))
        {
          await LogService.WriteUsbLineAsync("usb.licensing.activate.fail:productId");
          return false;
        }

        // Offline expiry validation
        DateTimeOffset? expUtc = null;
        if (!string.IsNullOrWhiteSpace(payload.expiresUtc)
            && DateTimeOffset.TryParse(payload.expiresUtc, out var expParsed))
        {
          expUtc = expParsed.ToUniversalTime();
          if (offline && expUtc <= DateTimeOffset.UtcNow)
          {
            await LogService.WriteUsbLineAsync("usb.licensing.activate.fail:expired");
            return false;
          }
        }

        // Stub signature check
        var sigOk = string.Equals(payload.signature, "DEV", StringComparison.Ordinal)
                    || (payload.signature?.StartsWith("sig_", StringComparison.Ordinal) ?? false);
        if (!sigOk)
        {
          await LogService.WriteUsbLineAsync("usb.licensing.activate.fail:signature");
          return false;
        }

        await PersistAsync(new LicenseState
        {
          ProductId = payload.productId,
          Key = licenseKey.Trim(),
          ActivatedAt = DateTimeOffset.UtcNow,
          Expiry = expUtc,
          Signature = payload.signature,
          DevOverride = false
        });

        await LogService.WriteUsbLineAsync("usb.licensing.activate.ok");
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex)
      {
        await LogService.WriteUsbLineAsync($"usb.licensing.activate.error:{Sanitize(ex.Message)}");
        return false;
      }
    }

    public async Task<(bool Valid, TimeSpan Remaining)> CheckExpiryAsync(CancellationToken ct = default)
    {
      try
      {
        var st = await LoadAsync();
        if (st == null)
        {
          await LogService.WriteUsbLineAsync("usb.licensing.expired");
          return (false, TimeSpan.Zero);
        }
        if (st.DevOverride)
        {
          await LogService.WriteUsbLineAsync("usb.licensing.valid:dev");
          return (true, TimeSpan.FromDays(3650));
        }
        if (st.Expiry.HasValue)
        {
          if (st.Expiry.Value <= DateTimeOffset.UtcNow)
          {
            await LogService.WriteUsbLineAsync("usb.licensing.expired");
            return (false, TimeSpan.Zero);
          }
          var rem = st.Expiry.Value - DateTimeOffset.UtcNow;
          await LogService.WriteUsbLineAsync($"usb.licensing.valid:{(int)Math.Floor(rem.TotalDays)}d");
          return (true, rem);
        }
        // No expiry -> treat as perpetual
        await LogService.WriteUsbLineAsync("usb.licensing.valid:perpetual");
        return (true, TimeSpan.MaxValue);
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return (false, TimeSpan.Zero); }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return (false, TimeSpan.Zero); }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Licensing.CheckExpiry", ex); return (false, TimeSpan.Zero); }
    }

    private static string StatePath => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "licensing.json");

    private static async Task PersistAsync(LicenseState st)
    {
      Directory.CreateDirectory(Path.GetDirectoryName(StatePath)!);
      var json = JsonSerializer.Serialize(st, new JsonSerializerOptions { WriteIndented = true });
      await FileUtil.AtomicWriteAsync(StatePath, json);
    }

    private static async Task<LicenseState?> LoadAsync()
    {
      try
      {
        if (!File.Exists(StatePath)) return null;
        using var fs = File.OpenRead(StatePath);
        return await JsonSerializer.DeserializeAsync<LicenseState>(fs);
      }
      catch { return null; }
    }
  }
}

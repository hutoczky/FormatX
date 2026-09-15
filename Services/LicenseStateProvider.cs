using System;
using System.Text.Json;
using FormatX.Models;

namespace FormatX.Services
{
  public static class LicenseStateProvider
  {
    private static readonly TimeSpan ExpiringThreshold = TimeSpan.FromDays(7);

    public static MagLicenseInfo FromSignedStatusJson(string json, DateTimeOffset? now = null)
    {
      using var document = JsonDocument.Parse(json);
      var root = document.RootElement;
      var current = now ?? DateTimeOffset.UtcNow;

      string type = GetString(root, "license_type") ?? GetString(root, "package") ?? string.Empty;
      string status = GetString(root, "status") ?? string.Empty;
      DateTimeOffset? validUntil = TryDate(root, "valid_until");
      int used = TryInt(root, "devices_used");
      int max = TryInt(root, "max_devices");

      var tier = ParseTier(type);
      var state = ParseState(status);

      if (state == MagLicenseState.Active && validUntil is { } expiry && expiry > current && expiry - current <= ExpiringThreshold)
        state = MagLicenseState.Expiring;

      int? days = validUntil is { } until
        ? Math.Max(0, (int)Math.Ceiling((until - current).TotalDays))
        : null;

      return new MagLicenseInfo
      {
        Tier = tier,
        State = state,
        DisplayName = DisplayName(tier),
        ValidUntil = validUntil,
        DaysRemaining = days,
        DevicesUsed = Math.Max(0, used),
        MaxDevices = Math.Max(0, max),
        RemainingRatio = null
      };
    }

    public static MagLicenseInfo AsOfflineGrace(MagLicenseInfo lastVerified, DateTimeOffset graceUntil, DateTimeOffset? now = null)
    {
      var current = now ?? DateTimeOffset.UtcNow;
      return lastVerified with
      {
        State = graceUntil > current ? MagLicenseState.OfflineGrace : MagLicenseState.Expired
      };
    }

    public static MagLicenseTier ParseTier(string? value)
      => (value ?? string.Empty).Trim().ToLowerInvariant() switch
      {
        "trial" => MagLicenseTier.Trial,
        "business_lite" or "business" => MagLicenseTier.BusinessLite,
        "business_pro" or "pro" or "lifetime" => MagLicenseTier.BusinessPro,
        "technician_team" or "technician" => MagLicenseTier.TechnicianTeam,
        "owner_master" or "owner" => MagLicenseTier.OwnerMaster,
        _ => MagLicenseTier.Unknown
      };

    public static MagLicenseState ParseState(string? value)
      => (value ?? string.Empty).Trim().ToLowerInvariant() switch
      {
        "active" => MagLicenseState.Active,
        "expired" => MagLicenseState.Expired,
        "suspended" => MagLicenseState.Suspended,
        "revoked" => MagLicenseState.Revoked,
        "device_limit_reached" => MagLicenseState.DeviceLimitReached,
        "checking" => MagLicenseState.Checking,
        _ => MagLicenseState.Unknown
      };

    public static string DisplayName(MagLicenseTier tier)
      => tier switch
      {
        MagLicenseTier.Trial => "Trial",
        MagLicenseTier.BusinessLite => "Business Lite",
        MagLicenseTier.BusinessPro => "Business Pro",
        MagLicenseTier.TechnicianTeam => "Technician Team",
        MagLicenseTier.OwnerMaster => "Owner Master",
        _ => "Unknown"
      };

    private static string? GetString(JsonElement root, string name)
      => root.TryGetProperty(name, out var property) && property.ValueKind == JsonValueKind.String
        ? property.GetString()
        : null;

    private static int TryInt(JsonElement root, string name)
      => root.TryGetProperty(name, out var property) && property.TryGetInt32(out int value) ? value : 0;

    private static DateTimeOffset? TryDate(JsonElement root, string name)
      => GetString(root, name) is { Length: > 0 } raw && DateTimeOffset.TryParse(raw, out var value) ? value : null;
  }
}

using FormatX.Models;
using FormatX.Services;

namespace FormatX.Update.Tests;

public sealed class MagStateTests
{
    [Theory]
    [InlineData("trial", MagLicenseTier.Trial)]
    [InlineData("business_lite", MagLicenseTier.BusinessLite)]
    [InlineData("business_pro", MagLicenseTier.BusinessPro)]
    [InlineData("technician_team", MagLicenseTier.TechnicianTeam)]
    [InlineData("owner_master", MagLicenseTier.OwnerMaster)]
    [InlineData("future_package", MagLicenseTier.Unknown)]
    public void LicenseTierMapping_IsStable(string raw, MagLicenseTier expected)
    {
        Assert.Equal(expected, LicenseStateProvider.ParseTier(raw));
    }

    [Theory]
    [InlineData("active", MagLicenseState.Active)]
    [InlineData("expired", MagLicenseState.Expired)]
    [InlineData("suspended", MagLicenseState.Suspended)]
    [InlineData("revoked", MagLicenseState.Revoked)]
    [InlineData("device_limit_reached", MagLicenseState.DeviceLimitReached)]
    public void LicenseStateMapping_IsStable(string raw, MagLicenseState expected)
    {
        Assert.Equal(expected, LicenseStateProvider.ParseState(raw));
    }

    [Fact]
    public void SignedPayload_ActiveNearExpiry_BecomesExpiringDisplayState()
    {
        var now = new DateTimeOffset(2026, 8, 21, 8, 0, 0, TimeSpan.Zero);
        string json = $$"""
        {
          "status":"active",
          "license_type":"business_pro",
          "valid_until":"{{now.AddDays(3):O}}",
          "devices_used":1,
          "max_devices":3
        }
        """;

        var license = LicenseStateProvider.FromSignedStatusJson(json, now);

        Assert.Equal(MagLicenseTier.BusinessPro, license.Tier);
        Assert.Equal(MagLicenseState.Expiring, license.State);
        Assert.Equal(1, license.DevicesUsed);
        Assert.Equal(3, license.MaxDevices);
        Assert.Equal(3, license.DaysRemaining);
    }

    [Fact]
    public void Pro_UsesMoreEntitlementLayersThanLite()
    {
        var lite = MagStateResolver.Resolve(Snapshot(MagLicenseTier.BusinessLite, MagLicenseState.Active));
        var pro = MagStateResolver.Resolve(Snapshot(MagLicenseTier.BusinessPro, MagLicenseState.Active));

        Assert.True(pro.LicenseRingCount > lite.LicenseRingCount);
    }

    [Fact]
    public void Team_UsesDeviceAwareSegmentTopology()
    {
        var snapshot = Snapshot(MagLicenseTier.TechnicianTeam, MagLicenseState.Active) with
        {
            License = new MagLicenseInfo
            {
                Tier = MagLicenseTier.TechnicianTeam,
                State = MagLicenseState.Active,
                DisplayName = "Technician Team",
                DevicesUsed = 3,
                MaxDevices = 5
            }
        };

        var profile = MagStateResolver.Resolve(snapshot);

        Assert.Equal(5, profile.LicenseSegments);
        Assert.True(profile.LicenseRingCount >= 2);
    }

    [Fact]
    public void OwnerMaster_HasRichestEntitlementGeometry()
    {
        var profile = MagStateResolver.Resolve(Snapshot(MagLicenseTier.OwnerMaster, MagLicenseState.Active));

        Assert.Equal(3, profile.LicenseRingCount);
        Assert.True(profile.LicenseSegments >= 8);
    }

    [Fact]
    public void RevokedLicense_IsCriticalWithoutRemovingOperationProgress()
    {
        var snapshot = Snapshot(MagLicenseTier.BusinessPro, MagLicenseState.Revoked) with
        {
            Operation = MagOperation.Formatting,
            OperationProgress = 0.72
        };

        var profile = MagStateResolver.Resolve(snapshot);

        Assert.True(profile.IsCritical);
        Assert.Equal("#EF4444", profile.LicenseColor);
        Assert.Equal(0.72, snapshot.OperationProgress, 3);
    }

    [Fact]
    public void DeviceLimit_IsWarningNotCritical()
    {
        var profile = MagStateResolver.Resolve(Snapshot(MagLicenseTier.TechnicianTeam, MagLicenseState.DeviceLimitReached));

        Assert.True(profile.IsWarning);
        Assert.False(profile.IsCritical);
        Assert.Equal("#F59E0B", profile.LicenseColor);
    }

    [Fact]
    public void ReducedMotion_DisablesContinuousMotion()
    {
        var profile = MagStateResolver.Resolve(Snapshot(MagLicenseTier.BusinessPro, MagLicenseState.Active) with
        {
            ReducedMotion = true
        });

        Assert.Equal(0, profile.MotionFactor);
    }

    private static MagSnapshot Snapshot(MagLicenseTier tier, MagLicenseState state)
        => new()
        {
            Operation = MagOperation.Idle,
            License = new MagLicenseInfo
            {
                Tier = tier,
                State = state,
                DisplayName = LicenseStateProvider.DisplayName(tier)
            }
        };
}

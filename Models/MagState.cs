using System;

namespace FormatX.Models
{
  public enum MagOperation
  {
    Booting,
    Idle,
    Discovering,
    Analysing,
    Planning,
    Executing,
    Formatting,
    Partitioning,
    SecureErasing,
    HealthChecking,
    Verifying,
    Updating,
    ShuttingDown
  }

  public enum MagLicenseTier
  {
    Unknown,
    Trial,
    BusinessLite,
    BusinessPro,
    TechnicianTeam,
    OwnerMaster
  }

  public enum MagLicenseState
  {
    Unknown,
    Checking,
    Active,
    Expiring,
    OfflineGrace,
    DeviceLimitReached,
    Expired,
    Suspended,
    Revoked,
    Error
  }

  public enum MagUpdateState
  {
    Idle,
    Checking,
    Current,
    Available,
    Downloading,
    ChecksumVerification,
    SignatureVerification,
    Extracting,
    Staging,
    Installing,
    RestartRequired,
    Completed,
    Failed
  }

  public enum MagIntegrityState
  {
    Unknown,
    Checking,
    Sha256Verified,
    SignatureVerified,
    Verified,
    Warning,
    Failed
  }

  public enum MagSeverity
  {
    Normal,
    Info,
    Warning,
    Critical
  }

  public sealed record MagLicenseInfo
  {
    public static MagLicenseInfo Unknown { get; } = new();

    public MagLicenseTier Tier { get; init; } = MagLicenseTier.Unknown;
    public MagLicenseState State { get; init; } = MagLicenseState.Unknown;
    public string DisplayName { get; init; } = "Unknown";
    public DateTimeOffset? ValidUntil { get; init; }
    public int? DaysRemaining { get; init; }
    public double? RemainingRatio { get; init; }
    public int DevicesUsed { get; init; }
    public int MaxDevices { get; init; }
  }

  public sealed record MagSnapshot
  {
    public MagOperation Operation { get; init; } = MagOperation.Booting;
    public double OperationProgress { get; init; }
    public MagLicenseInfo License { get; init; } = MagLicenseInfo.Unknown;
    public MagUpdateState UpdateState { get; init; } = MagUpdateState.Idle;
    public double UpdateProgress { get; init; }
    public MagIntegrityState IntegrityState { get; init; } = MagIntegrityState.Unknown;
    public MagSeverity Severity { get; init; } = MagSeverity.Normal;
    public double Activity { get; init; } = 0.25;
    public string StatusText { get; init; } = "CORE BOOT";
    public long Sequence { get; init; }
    public DateTimeOffset Timestamp { get; init; } = DateTimeOffset.UtcNow;
    public bool ReducedMotion { get; init; }
    public bool EnergySaver { get; init; }
  }

  public sealed record MagUpdateProgressInfo(
    MagUpdateState Stage,
    double Progress,
    string StatusText,
    string? TargetVersion = null);

  public sealed record MagVisualProfile(
    string CoreColor,
    string LicenseColor,
    string IntegrityColor,
    string UpdateColor,
    int LicenseRingCount,
    int LicenseSegments,
    double MotionFactor,
    bool IsWarning,
    bool IsCritical);
}

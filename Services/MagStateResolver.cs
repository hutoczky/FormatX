using FormatX.Models;

namespace FormatX.Services
{
  public static class MagStateResolver
  {
    public static MagVisualProfile Resolve(MagSnapshot snapshot)
    {
      var license = snapshot.License;
      var (licenseColor, rings, segments) = license.Tier switch
      {
        MagLicenseTier.Trial => ("#8B5CF6", 1, 1),
        MagLicenseTier.BusinessLite => ("#22D3EE", 1, 1),
        MagLicenseTier.BusinessPro => ("#8B5CF6", 2, 1),
        MagLicenseTier.TechnicianTeam => ("#22D3EE", 2, license.MaxDevices > 1 ? license.MaxDevices : 5),
        MagLicenseTier.OwnerMaster => ("#C4B5FD", 3, 8),
        _ => ("#64748B", 1, 1)
      };

      var warning = snapshot.Severity == MagSeverity.Warning ||
                    license.State is MagLicenseState.Expiring or MagLicenseState.OfflineGrace or MagLicenseState.DeviceLimitReached or MagLicenseState.Expired or MagLicenseState.Suspended;
      var critical = snapshot.Severity == MagSeverity.Critical ||
                     snapshot.IntegrityState == MagIntegrityState.Failed ||
                     license.State == MagLicenseState.Revoked;

      if (critical) licenseColor = "#EF4444";
      else if (warning) licenseColor = "#F59E0B";

      string coreColor = critical ? "#EF4444" : warning ? "#F59E0B" : "#22D3EE";
      string integrityColor = snapshot.IntegrityState switch
      {
        MagIntegrityState.Failed => "#EF4444",
        MagIntegrityState.Warning => "#F59E0B",
        MagIntegrityState.Sha256Verified or MagIntegrityState.SignatureVerified or MagIntegrityState.Verified => "#E0F2FE",
        MagIntegrityState.Checking => "#38BDF8",
        _ => "#475569"
      };
      string updateColor = snapshot.UpdateState switch
      {
        MagUpdateState.Failed => "#EF4444",
        MagUpdateState.Available => "#A78BFA",
        MagUpdateState.Downloading or MagUpdateState.ChecksumVerification or MagUpdateState.Extracting or MagUpdateState.Installing => "#22D3EE",
        MagUpdateState.Completed or MagUpdateState.Current => "#67E8F9",
        _ => "#475569"
      };

      double motion = snapshot.ReducedMotion ? 0 : snapshot.EnergySaver ? 0.28 : 1.0;
      return new MagVisualProfile(coreColor, licenseColor, integrityColor, updateColor, rings, segments, motion, warning, critical);
    }
  }
}

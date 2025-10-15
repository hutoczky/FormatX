using System;

namespace FormatX.Services
{
  internal static class DiagFlags
  {
    public static bool DeepDiagnostics { get; } =
      string.Equals(Environment.GetEnvironmentVariable("FORMATX_DEEP_DIAGNOSTICS"), "1", StringComparison.OrdinalIgnoreCase);

    public static bool ForceWin32Pickers { get; } =
      string.Equals(Environment.GetEnvironmentVariable("FORMATX_PICKER_FORCE_WIN32"), "1", StringComparison.OrdinalIgnoreCase);
  }
}

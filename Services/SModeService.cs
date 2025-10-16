using System;

namespace FormatX.Services
{
  public static class SModeService
  {
    // Placeholder heuristic – real S-mode detection may need Windows APIs not available in all contexts
    public static bool IsSMode()
    {
      try
      {
        // If running unpackaged and elevation is required for critical ops, treat as not S-mode.
        // In Store/S-mode, features requiring admin or direct disk access are considered unavailable.
        return Environment.GetEnvironmentVariable("FORMATX_SMODE") == "1";
      }
      catch { return false; }
    }
  }
}

using System;
using System.Collections.Generic;

namespace FormatX.Services
{
  internal static class AppSettings
  {
    // Global dev flag: never redirect to Microsoft Store automatically
    public static bool DisableStoreRedirect { get; } = true;
    // Protocol -> fallback EXE relative path (to app base or LocalAppData\FormatX)
    private static readonly Dictionary<string, string> ProtocolFallbacks = new(StringComparer.OrdinalIgnoreCase)
    {
      // Test/debug protocol mapping to avoid Store prompt
      { "invalid", "FormatXProtocolHandler.exe" }
    };

    public static string? GetFallbackForProtocol(string scheme)
      => ProtocolFallbacks.TryGetValue(scheme ?? string.Empty, out var exe) ? exe : null;
  }
}

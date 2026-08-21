using System;
using System.Reflection;

namespace FormatX.Services
{
  public static class VersionService
  {
    public static string CurrentVersion { get; } = ResolveCurrentVersion();

    public static string DisplayVersion => CurrentVersion.StartsWith("v", StringComparison.OrdinalIgnoreCase)
      ? CurrentVersion
      : "v" + CurrentVersion;

    private static string ResolveCurrentVersion()
    {
      var assembly = typeof(VersionService).Assembly;
      var informational = assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion;
      if (!string.IsNullOrWhiteSpace(informational))
      {
        int metadata = informational.IndexOf('+');
        return metadata > 0 ? informational[..metadata] : informational;
      }

      return assembly.GetName().Version?.ToString(3) ?? "0.0.0";
    }
  }
}

using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Security.Principal;

namespace FormatX.Services
{
  public static class ElevationService
  {
    public static bool IsElevated()
    {
      try
      {
        using var id = WindowsIdentity.GetCurrent();
        var principal = new WindowsPrincipal(id);
        return principal.IsInRole(WindowsBuiltInRole.Administrator);
      }
      catch { return false; }
    }

    public static bool RelaunchElevated(string exePath, string arguments)
    {
      try
      {
        var psi = new ProcessStartInfo(exePath, arguments){ Verb = "runas", UseShellExecute = true };
        Process.Start(psi);
        return true;
      }
      catch (Win32Exception wex) when (wex.NativeErrorCode == 1223) { return false; }
      catch { return false; }
    }
  }
}
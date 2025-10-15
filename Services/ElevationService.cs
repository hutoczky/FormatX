using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Security.Principal;
using System.Threading.Tasks;

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

    public static async Task<bool> EnsureAdminAsync(string operation, bool tryElevate = true, bool throwIfDenied = true)
    {
      try
      {
        if (IsElevated())
        {
          await LogService.LogAsync("admin.ok", new { op = operation });
          return true;
        }

        await LogService.LogAsync("admin.missing", new { op = operation });

        if (tryElevate)
        {
          string exe = Environment.ProcessPath ?? Process.GetCurrentProcess().MainModule?.FileName ?? string.Empty;
          string[] args = Environment.GetCommandLineArgs();
          string arguments = args.Length > 1 ? string.Join(" ", args, 1, args.Length - 1) : string.Empty;
          bool started = !string.IsNullOrWhiteSpace(exe) && RelaunchElevated(exe, arguments);
          await LogService.LogAsync("admin.relaunch", new { op = operation, started });
          return false; // caller should stop current operation when relaunch initiated or denied
        }

        if (throwIfDenied)
          throw new InvalidOperationException("Admin jogosultság szükséges a mûvelethez.");
        return false;
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("admin.error", new { op = operation, ex = ex.Message });
        if (throwIfDenied) throw;
        return false;
      }
    }
  }
}
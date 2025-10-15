using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class FormatService
  {
    public static bool IsSystemDrive(string dl)
    {
      try
      {
        if (string.IsNullOrWhiteSpace(dl)) return false;
        char letter = char.ToUpperInvariant(dl.Trim()[0]);
        string sysRoot = Path.GetPathRoot(Environment.GetFolderPath(Environment.SpecialFolder.System)) ?? "C:\\";
        return char.ToUpperInvariant(sysRoot[0]) == letter;
      }
      catch (Exception ex)
      {
        _ = LogService.LogAsync("format.systemdrive.check.error", ex);
        return false;
      }
    }

    // Legacy 3-parameter overload retained for compatibility
    public async Task FormatVolumeAsync(string driveLetter, string fileSystem, bool quick)
      => await FormatVolumeAsync(driveLetter, fileSystem, label: "", quick: quick);

    // New 4-parameter overload used by UI
    public async Task FormatVolumeAsync(string driveLetter, string fileSystem, string label, bool quick, System.Action<int,string>? report = null)
    {
      if (!await ElevationService.EnsureAdminAsync("format.volume", tryElevate: true, throwIfDenied: true))
        return;
      if (string.IsNullOrWhiteSpace(driveLetter)) throw new ArgumentException(nameof(driveLetter));
      char dl = char.ToUpperInvariant(driveLetter.Trim().TrimEnd(':','\\','/')[0]);
      if (!char.IsLetter(dl)) throw new ArgumentException("Invalid drive", nameof(driveLetter));

      report?.Invoke(5, "Preparing");

      string safeLabel = (label ?? string.Empty).Replace("'", "''");
      string ps =
        "$drive='{DL}'; $fs='{FS}'; $label='{LB}'; $quick={Q}; " +
        "$p=@{DriveLetter=$drive; FileSystem=$fs; Force=$true; Confirm=$false}; " +
        "if($label -ne ''){$p.NewFileSystemLabel=$label}; " +
        "if($quick){$p.Full=$false}else{$p.Full=$true}; " +
        "Format-Volume @p";

      ps = ps.Replace("{DL}", dl.ToString())
             .Replace("{FS}", fileSystem)
             .Replace("{LB}", safeLabel)
             .Replace("{Q}", quick ? "$true" : "$false");

      report?.Invoke(15, "Starting");
      var psi = new ProcessStartInfo("powershell.exe")
      {
        UseShellExecute = false,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        CreateNoWindow = true
      };
      psi.ArgumentList.Add("-NoProfile");
      psi.ArgumentList.Add("-ExecutionPolicy"); psi.ArgumentList.Add("Bypass");
      psi.ArgumentList.Add("-Command"); psi.ArgumentList.Add(ps);

      using var p = Process.Start(psi)!;
      report?.Invoke(25, "Running");
      // simple polling loop to show activity
      while (!p.HasExited)
      {
        await Task.Delay(500);
        report?.Invoke(Math.Min(95, (int)(DateTimeOffset.Now.ToUnixTimeMilliseconds()%7000/70)+25), "Formatting");
      }
      string stdout = await p.StandardOutput.ReadToEndAsync();
      string stderr = await p.StandardError.ReadToEndAsync();
      await p.WaitForExitAsync();
      report?.Invoke(98, "Finalizing");
      if (p.ExitCode != 0)
        throw new InvalidOperationException($"Format error ({p.ExitCode}): {stderr}\n{stdout}");
      report?.Invoke(100, "Done");
    }
  }
}

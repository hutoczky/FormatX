using System;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class DiskPartService
  {
    public async Task RunScriptAsync(string script)
    {
      var tmp = System.IO.Path.GetTempFileName();
      await System.IO.File.WriteAllTextAsync(tmp, script, Encoding.ASCII);

      var psi = new ProcessStartInfo("diskpart.exe", $"/s \"{tmp}\"")
      {
        UseShellExecute = false,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        CreateNoWindow = true
      };

      using var p = Process.Start(psi)!;
      string stdout = await p.StandardOutput.ReadToEndAsync();
      string stderr = await p.StandardError.ReadToEndAsync();
      await p.WaitForExitAsync();
      System.IO.File.Delete(tmp);

      if (p.ExitCode != 0) throw new InvalidOperationException($"DiskPart hiba ({p.ExitCode}): {stderr}\n{stdout}");
    }

    public async Task CleanCreatePartitionFormatAsync(string diskNumber, string driveLetter, string fs, string label, bool gpt, bool quick)
    {
      if (string.IsNullOrWhiteSpace(diskNumber)) throw new ArgumentException("diskNumber is required");
      if (string.IsNullOrWhiteSpace(fs)) fs = "NTFS";
      label ??= string.Empty;
      driveLetter ??= string.Empty;

      var sb = new StringBuilder();
      sb.AppendLine($"select disk {diskNumber}");
      sb.AppendLine("detail disk");
      sb.AppendLine("online disk noerr");
      sb.AppendLine("attributes disk clear readonly noerr");
      sb.AppendLine("clean");
      sb.AppendLine(gpt ? "convert gpt" : "convert mbr");
      sb.AppendLine("create partition primary");
      sb.AppendLine($"format fs={fs.ToLower()} label=\"{label.Replace("\"","'")}\" {(quick ? "quick" : "")}");
      if (!string.IsNullOrWhiteSpace(driveLetter)) sb.AppendLine($"assign letter={driveLetter.TrimEnd(':')}");
      else sb.AppendLine("assign");
      sb.AppendLine("exit");

      await RunScriptAsync(sb.ToString());
    }

    public Task CleanCreatePartitionFormatAsync(string diskNumber, string fs, string label, bool gpt, bool quick)
      => CleanCreatePartitionFormatAsync(diskNumber, string.Empty, fs, label, gpt, quick);

    public Task CleanCreatePartitionFormatAsync(string diskNumber, bool gpt, bool quick)
      => CleanCreatePartitionFormatAsync(diskNumber, string.Empty, "NTFS", string.Empty, gpt, quick);
  }
}
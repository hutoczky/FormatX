using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class SecureEraseService
  {
    public async Task<string> ClearDiskAsync(int diskNumber, bool fullFormat = true, IProgress<int>? progress = null)
    {
      progress?.Report(5);
      // diskpart clean all
      string dp = $"select disk {diskNumber}\nclean all\n";
      string tmp = Path.GetTempFileName();
      await File.WriteAllTextAsync(tmp, dp, Encoding.ASCII);
      var p1 = Process.Start(new ProcessStartInfo("diskpart.exe", $"/s \"{tmp}\"")
      {
        UseShellExecute = false, RedirectStandardOutput = true, RedirectStandardError = true, CreateNoWindow = true
      });
      string so1 = await p1!.StandardOutput.ReadToEndAsync();
      string se1 = await p1!.StandardError.ReadToEndAsync();
      await p1.WaitForExitAsync();
      progress?.Report(60);
      if (p1.ExitCode != 0) throw new InvalidOperationException($"diskpart hiba: {se1}\n{so1}");

      // Optional full format to force media scan (NTFS)
      if (fullFormat)
      {
        string ps = $"Get-Partition -DiskNumber {diskNumber} | Where-Object {{$_.Type -eq 'Basic'}} | " +
                    "ForEach-Object { Format-Volume -Partition $_ -FileSystem NTFS -Full -Confirm:$false }";
        var p2 = Process.Start(new ProcessStartInfo("powershell.exe", $"-NoProfile -Command \"{ps}\"")
        {
          UseShellExecute = false, RedirectStandardOutput = true, RedirectStandardError = true, CreateNoWindow = true
        });
        string so2 = await p2!.StandardOutput.ReadToEndAsync();
        string se2 = await p2!.StandardError.ReadToEndAsync();
        await p2.WaitForExitAsync();
        progress?.Report(90);
        if (p2.ExitCode != 0) throw new InvalidOperationException($"Full format hiba: {se2}\n{so2}");
      }

      // Certificate JSON
      var cert = new {
        ts = DateTimeOffset.Now.ToString("o"),
        user = Environment.UserName,
        machine = Environment.MachineName,
        disk = diskNumber,
        method = fullFormat ? "clean all + full format" : "clean all",
        result = "success"
      };
      string dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "cert");
      Directory.CreateDirectory(dir);
      string path = Path.Combine(dir, $"clear_{diskNumber}_{DateTimeOffset.Now:yyyyMMdd_HHmmss}.json");
      await File.WriteAllTextAsync(path, JsonSerializer.Serialize(cert, new JsonSerializerOptions{WriteIndented=true}), new UTF8Encoding(false));
      progress?.Report(100);
      await LogService.LogAsync("secure_erase", cert);
      return path;
    }
  }
}

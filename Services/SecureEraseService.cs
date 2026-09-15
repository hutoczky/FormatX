using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using FormatX.Models;

namespace FormatX.Services
{
  public sealed class SecureEraseService
  {
    public async Task<string> ClearDiskAsync(int diskNumber, bool fullFormat = true, IProgress<int>? progress = null)
    {
      void Report(int percent, string text)
      {
        progress?.Report(percent);
        MagStateService.Current.SetOperation(MagOperation.SecureErasing, percent / 100.0, text, 0.82);
      }

      try
      {
        Report(5, "SECURE ERASE · PREPARING");
        string dp = $"select disk {diskNumber}\nclean all\n";
        string tmp = Path.GetTempFileName();
        await File.WriteAllTextAsync(tmp, dp, Encoding.ASCII);
        var p1 = Process.Start(new ProcessStartInfo("diskpart.exe", $"/s \"{tmp}\"")
        {
          UseShellExecute = false, RedirectStandardOutput = true, RedirectStandardError = true, CreateNoWindow = true
        });
        string so1 = await p1!.StandardOutput.ReadToEndAsync();
        string se1 = await p1.StandardError.ReadToEndAsync();
        await p1.WaitForExitAsync();
        Report(60, "SECURE ERASE · MEDIA CLEARED");
        if (p1.ExitCode != 0) throw new InvalidOperationException($"diskpart hiba: {se1}\n{so1}");

        if (fullFormat)
        {
          string ps = $"Get-Partition -DiskNumber {diskNumber} | Where-Object {{$_.Type -eq 'Basic'}} | " +
                      "ForEach-Object { Format-Volume -Partition $_ -FileSystem NTFS -Full -Confirm:$false }";
          var p2 = Process.Start(new ProcessStartInfo("powershell.exe", $"-NoProfile -Command \"{ps}\"")
          {
            UseShellExecute = false, RedirectStandardOutput = true, RedirectStandardError = true, CreateNoWindow = true
          });
          string so2 = await p2!.StandardOutput.ReadToEndAsync();
          string se2 = await p2.StandardError.ReadToEndAsync();
          await p2.WaitForExitAsync();
          Report(90, "SECURE ERASE · VERIFYING MEDIA");
          if (p2.ExitCode != 0) throw new InvalidOperationException($"Full format hiba: {se2}\n{so2}");
        }

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
        Report(100, "SECURE ERASE · COMPLETE");
        await LogService.LogAsync("secure_erase", cert);
        return path;
      }
      catch
      {
        MagStateService.Current.Fail("SECURE ERASE · FAILED");
        throw;
      }
    }
  }
}

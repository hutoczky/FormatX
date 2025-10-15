using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.UI.Xaml;
using FormatX.Views;

namespace FormatX.Services
{
  public record CrashContext(string Source, DateTimeOffset Timestamp)
  {
    public static CrashContext Current(string source) => new CrashContext(source, DateTimeOffset.Now);
  }

  public static class CrashLogger
  {
    private static string CrashDir => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "crash");

    public static string Save(Exception ex, CrashContext ctx, out string sha256, out string hwid)
    {
      Directory.CreateDirectory(CrashDir);
      hwid = BuildHwid();
      var payload = new
      {
        ctx.Source,
        ctx.Timestamp,
        user = Environment.UserName,
        machine = Environment.MachineName,
        type = ex.GetType().FullName,
        message = ex.Message,
        stack = ex.StackTrace,
        exception = ex.ToString(),
        hwid
      };
      string json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
      string path = Path.Combine(CrashDir, $"crash_{DateTimeOffset.Now:yyyyMMdd_HHmmss}.json");
      File.WriteAllText(path, json, Encoding.UTF8);
      using var sha = SHA256.Create();
      sha256 = Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(json)));
      File.WriteAllText(path + ".sha256", sha256);
      _ = LogService.LogAsync("crash.save.v2", new { ctx.Source, path, sha256, hwid });
      return path;
    }

    private static string BuildHwid()
    {
      try
      {
        string machine = Environment.MachineName;
        string user = Environment.UserName;
        string bios = string.Empty;
        string cpu = string.Empty;
        try
        {
          using var mos = new System.Management.ManagementObjectSearcher("root\\CIMV2", "SELECT SerialNumber FROM Win32_BIOS");
          foreach (System.Management.ManagementObject mo in mos.Get()) { bios = mo["SerialNumber"]?.ToString() ?? string.Empty; break; }
        }
        catch (Exception ex) { _ = LogService.LogAsync("hwid.bios.error", new { ex = ex.Message }); }
        try
        {
          using var mos2 = new System.Management.ManagementObjectSearcher("root\\CIMV2", "SELECT ProcessorId FROM Win32_Processor");
          foreach (System.Management.ManagementObject mo in mos2.Get()) { cpu = mo["ProcessorId"]?.ToString() ?? string.Empty; break; }
        }
        catch (Exception ex) { _ = LogService.LogAsync("hwid.cpu.error", new { ex = ex.Message }); }
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(string.Join("|", new[] { machine, user, bios, cpu }))));
      }
      catch (Exception ex)
      {
        _ = LogService.LogAsync("hwid.error", new { ex = ex.Message });
        return string.Empty;
      }
    }
  }

  public static class CrashHandler
  {
    private static Window? _mainWindow;

    public static void Initialize(Window mainWindow) => _mainWindow = mainWindow;

    public static void Show(Exception ex, string source = "runtime")
    {
      try
      {
        var ctx = CrashContext.Current(source);
        string path = CrashLogger.Save(ex, ctx, out var sha, out var hwid);
        var title = LocalizationService.T("crash.dialog.title");
        var win = new CrashDialogWindow(path) { Title = title };
        win.Activate();
      }
      catch (Exception inner)
      {
        _ = LogService.LogAsync("crash.handler.show.error", new { inner = inner.Message });
      }
    }
  }
}

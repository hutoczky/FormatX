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
      int hresult = ex.HResult;
      var payload = new
      {
        kind = "last-exit",
        ctx.Source,
        ctx.Timestamp,
        user = Environment.UserName,
        machine = Environment.MachineName,
        type = ex.GetType().FullName,
        message = ex.Message,
        hresult = $"0x{(uint)hresult:x8}",
        stack = ex.StackTrace,
        exception = ex.ToString(),
        inner = ex.InnerException?.ToString(),
        hwid
      };
      string json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
      string path = Path.Combine(CrashDir, "last-exit.json");
      try { FileUtil.AtomicWriteAsync(path, json).GetAwaiter().GetResult(); }
      catch (Exception ioex) { _ = LogService.LogAsync("crash.save.io.error", new { error = ioex.Message }); }
      using var sha = SHA256.Create();
      sha256 = Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(json)));
      try { FileUtil.AtomicWriteAsync(path + ".sha256", sha256).GetAwaiter().GetResult(); } catch (Exception ioex2) { _ = LogService.LogAsync("crash.save.sha.error", new { error = ioex2.Message }); }
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
    private static readonly object _gate = new();
    private static DateTimeOffset _lastShownAt;
    private static string? _lastSha;

    public static void Initialize(Window mainWindow) => _mainWindow = mainWindow;

    public static void Show(Exception ex, string source = "runtime")
    {
      try
      {
        if (FormatX.App.IsMainWindowClosed) return;
        var ctx = CrashContext.Current(source);
        var path = CrashLogger.Save(ex, ctx, out var sha, out var hwid);
        // De-dup within a short window to avoid dialog spam from cascaded errors
        lock (_gate)
        {
          if (_lastSha == sha && (DateTimeOffset.Now - _lastShownAt) < TimeSpan.FromSeconds(5))
          {
            _ = LogService.LogAsync("crash.skip.duplicate", new { sha });
            return;
          }
          _lastSha = sha; _lastShownAt = DateTimeOffset.Now;
        }
        var title = LocalizationService.T("crash.dialog.title");

        // Ensure window creation/activation happens on UI thread
        try
        {
          if (_mainWindow != null)
          {
            _ = UiThread.RunOnUIThreadAsync(_mainWindow, () =>
            {
              var win = new CrashDialogWindow(path) { Title = title };
              win.Activate();
            });
          }
          else
          {
            var win = new CrashDialogWindow(path) { Title = title };
            win.Activate();
          }
        }
        catch (Exception mx)
        {
          _ = LogService.LogAsync("crash.handler.marshal.error", new { mx = mx.Message });
        }
      }
      catch (Exception inner)
      {
        _ = LogService.LogAsync("crash.handler.show.error", new { inner = inner.Message });
      }
    }
  }
}

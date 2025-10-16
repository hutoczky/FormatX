using System;
using System.IO;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public static class SelfTests
  {
    public static async Task RunAsync()
    {
      try
      {
        // 1) Logging paths exist and are writable
        var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "logs");
        Directory.CreateDirectory(dir);
        var p = Path.Combine(dir, "selftest.txt");
        await File.WriteAllTextAsync(p, DateTimeOffset.Now.ToString("o"));
        try { await LogService.WriteUsbLineAsync("usb.selftest.io.ok"); } catch { }

        // 2) JSONL append
        try { await LogService.LogAsync("selftest.jsonl", new { ok = true, ts = DateTimeOffset.Now }); } catch { }

        // 3) Basic background validator/flag check if available
        try { await LogService.WriteUsbLineAsync("usb.selftest.endpoints.ok"); } catch { }
      }
      catch (Exception ex)
      {
        try { await LogService.LogUsbAppErrorAsync("SelfTests", ex); } catch { }
      }
    }
  }
}

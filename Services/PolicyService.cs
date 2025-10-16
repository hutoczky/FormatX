using System;
using System.IO;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class PolicyService
  {
    public async Task<string> ExportAdmxTemplateAsync(string? outDir = null)
    {
      try
      {
        string dir = outDir ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "policy");
        Directory.CreateDirectory(dir);
        string path = Path.Combine(dir, "FormatX.admx");
        string xml = "<!-- ADMX TEMPLATE PLACEHOLDER: Intune/ADMX scaffold -->\n" +
                     "<policyDefinitions revision='1.0' schemaVersion='1.0'>\n" +
                     "  <policyNamespaces>\n    <target prefix='FormatX' namespace='FormatX.Policies' />\n  </policyNamespaces>\n" +
                     "</policyDefinitions>\n";
        await File.WriteAllTextAsync(path, xml);
        await LogService.WriteUsbLineAsync($"usb.policy.admx:{path}");
        return path;
      }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Policy.ExportAdmx", ex); return string.Empty; }
    }
  }
}

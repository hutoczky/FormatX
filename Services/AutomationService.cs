using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public sealed class AutomationService
  {
    public async Task<bool> RunJobAsync(string jsonOrYamlPath, CancellationToken ct = default)
    {
      try
      {
        await LogService.WriteUsbLineAsync($"usb.automation.job.begin:{Path.GetFileName(jsonOrYamlPath)}");
        // Scaffold: read file and log minimal info
        string txt = await File.ReadAllTextAsync(jsonOrYamlPath, ct);
        await LogService.LogAsync("automation.job.content", new { len = txt?.Length ?? 0 });
        await Task.Delay(40, ct);
        await LogService.WriteUsbLineAsync("usb.automation.job.ok");
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("Automation.RunJob", ex); return false; }
    }
  }
}

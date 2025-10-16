using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using Microsoft.UI.Xaml;
using Windows.System;

namespace FormatX.Services
{
  public static class LauncherService
  {
    // Central launcher that avoids Microsoft Store prompts and optionally runs a local fallback exe.
    public static async Task<bool> TryLaunchUriOrLocalFallbackAsync(Uri uri, string? fallbackExeRelativePath = null)
    {
      try
      {
        if (AppSettings.DisableStoreRedirect)
        {
          try { await LogService.WriteUsbLineAsync($"usb.store.prompt.skipped:{uri.Scheme}"); } catch { }
          return false;
        }
        var win = App.MainWindow as Window;
        if (win == null || App.IsMainWindowClosed)
        {
          try { await LogService.WriteUsbLineAsync($"usb.store.prompt.skipped:{uri.Scheme}"); } catch { }
          return false;
        }
        return await UiThread.RunOnUIThreadAsync(win, async () =>
        {
            try
            {
              var support = await Launcher.QueryUriSupportAsync(uri, LaunchQuerySupportType.Uri).AsTask().ConfigureAwait(false);
              if (support == LaunchQuerySupportStatus.Available)
              {
                var ok = await Launcher.LaunchUriAsync(uri).AsTask().ConfigureAwait(false);
                if (!ok)
                {
                  await LogService.LogUsbWinrtErrorAsync("Launcher:LaunchFailed", new InvalidOperationException(Sanitize(uri.ToString())));
                  try { await LogService.WriteUsbLineAsync($"usb.store.prompt.skipped:{uri.Scheme}"); } catch { }
                }
                return ok;
              }

            // Resolve fallback path
            string? rel = fallbackExeRelativePath;
            if (string.IsNullOrWhiteSpace(rel)) rel = AppSettings.GetFallbackForProtocol(uri.Scheme);

            if (!string.IsNullOrWhiteSpace(rel))
            {
              string full = rel!;
              try
              {
                if (!Path.IsPathRooted(full))
                {
                  var baseDir = AppContext.BaseDirectory;
                  var localDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX");
                  var first = Path.Combine(baseDir, rel!);
                  var second = Path.Combine(localDir, rel!);
                  full = File.Exists(first) ? first : (File.Exists(second) ? second : first);
                }
              }
              catch { }

              if (File.Exists(full))
              {
                try
                {
                  var psi = new ProcessStartInfo(full) { UseShellExecute = true };
                  Process.Start(psi);
                  try { await LogService.WriteUsbLineAsync($"usb.launch.fallback:{uri.Scheme}:{full}"); } catch { }
                  return true;
                }
                catch (Exception ex2)
                {
                  await LogService.LogUsbWinrtErrorAsync("Launcher.FallbackStart", ex2);
                  try { await LogService.WriteUsbLineAsync($"usb.store.prompt.skipped:{uri.Scheme}"); } catch { }
                  return false;
                }
              }
            }

            try { await LogService.WriteUsbLineAsync($"usb.store.prompt.skipped:{uri.Scheme}"); } catch { }
            // Optional UX: small dialog informing no handler (safe to ignore failures)
            try
            {
              if (win.Content is FrameworkElement fe)
              {
                var dlg = new Microsoft.UI.Xaml.Controls.ContentDialog
                {
                  XamlRoot = fe.XamlRoot,
                  Title = "Handler not installed",
                  Content = $"No handler for '{uri.Scheme}://'. Store prompt skipped. Configure a local handler in Settings.",
                  CloseButtonText = "OK"
                };
                _ = await dlg.ShowAsync();
              }
            }
            catch { }
            return false;
          }
          catch (System.Runtime.InteropServices.COMException cex)
          {
            await LogService.LogUsbWinrtErrorAsync("Launcher.COMException", cex);
            try { await LogService.WriteUsbLineAsync($"usb.store.prompt.skipped:{uri.Scheme}"); } catch { }
            return false;
          }
          catch (InvalidOperationException ioex)
          {
            await LogService.LogUsbWinrtErrorAsync("Launcher.InvalidOperation", ioex);
            try { await LogService.WriteUsbLineAsync($"usb.store.prompt.skipped:{uri.Scheme}"); } catch { }
            return false;
          }
          catch (Exception ex)
          {
            await LogService.LogUsbWinrtErrorAsync("Launcher.Exception", ex);
            try { await LogService.WriteUsbLineAsync($"usb.store.prompt.skipped:{uri.Scheme}"); } catch { }
            return false;
          }
        });
      }
      catch (Exception ex)
      {
        try { await LogService.WriteUsbLineAsync($"usb.winrt.error:Launcher:{ex.GetType().Name}:{Sanitize(ex.Message)}"); } catch { }
        try { await LogService.WriteUsbLineAsync($"usb.store.prompt.skipped:{uri.Scheme}"); } catch { }
        return false;
      }
    }

    private static string Sanitize(string? s)
      => (s ?? string.Empty).Replace('\n', ' ').Replace('\r', ' ').Trim();
  }
}

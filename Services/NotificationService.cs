using System;
using System.Threading.Tasks;
using Microsoft.Windows.AppNotifications;
using Microsoft.Windows.AppNotifications.Builder;

namespace FormatX.Services
{
  public static class NotificationService
  {
    private static bool _registered;
    private static Microsoft.UI.Xaml.Window? _window;
    private const string ActionOpenStartup = "action.open.startup";
    private static bool _hooked;

    public static void Initialize(Microsoft.UI.Xaml.Window? window = null)
    {
      try
      {
        if (FormatX.App.IsMainWindowClosed) { _registered = false; return; }
        // Skip registration when running unpackaged or explicitly disabled
        if (Environment.GetEnvironmentVariable("FORMATX_DISABLE_TOASTS") == "1" || !AppEnv.IsPackaged)
        {
          _registered = false;
          return;
        }

        _window = window;

        // Marshal to UI thread and wrap exceptions per-call
        _ = UiThread.RunOnUIThreadAsync(_window!, async () =>
        {
          try
          {
            var mgr = AppNotificationManager.Default;
            if (!_hooked)
            {
              mgr.NotificationInvoked += OnNotificationInvoked;
              _hooked = true;
            }
            try { mgr.Register(); }
            catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Register", cex); }
            catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Register", ioex); }
            catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Register", ex); }
            _registered = true;
          }
          catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Register", ex); }
        });
      }
      catch { _registered = false; }
    }

    public static async Task<bool> ShowToastAsync(string title, string? body = null)
    {
      try
      {
        if (!_registered || FormatX.App.IsMainWindowClosed)
        {
          // No registration -> treat as no-op success; UI already shows inline status text elsewhere
          await LogService.LogAsync("toast.skip.unregistered", new { title });
          return false;
        }
        await UiThread.RunOnUIThreadAsync(_window!, async () =>
        {
          try
          {
            var builder = new AppNotificationBuilder().AddText(title);
            if (!string.IsNullOrWhiteSpace(body)) builder.AddText(body!);
            var notification = builder.BuildNotification();
            try { AppNotificationManager.Default.Show(notification); }
            catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Show", cex); }
            catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Show", ioex); }
            catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Show", ex); }
          }
          catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Show", ex); }
        });
        await LogService.LogAsync("toast.show", new { title, body, registered = _registered });
        return true;
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("toast.error", new { title, error = ex.Message });
        return false;
      }
    }

    public static Task<bool> ShowSettingsSavedAsync()
      => ShowToastAsync("Beállítások mentve", "A beállítások sikeresen elmentve.");

    public static async Task<bool> ShowStartupRejectedAsync()
    {
      try
      {
        if (!_registered || FormatX.App.IsMainWindowClosed) return false;
        await UiThread.RunOnUIThreadAsync(_window!, async () =>
        {
          try
          {
            var builder = new AppNotificationBuilder()
              .AddText("Startup disabled")
              .AddText("Open Startup settings to enable auto-start.")
              .AddButton(new AppNotificationButton("Open Startup settings").AddArgument("action", ActionOpenStartup));
            var n = builder.BuildNotification();
            try { AppNotificationManager.Default.Show(n); }
            catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Show", cex); }
            catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Show", ioex); }
            catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Show", ex); }
          }
          catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("AppNotification.Show", ex); }
        });
        await LogService.LogAsync("toast.show.startup.settings", new { });
        return true;
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("toast.error", new { title = "startup", error = ex.Message });
        return false;
      }
    }

    private static async void OnNotificationInvoked(AppNotificationManager sender, AppNotificationActivatedEventArgs args)
    {
      try
      {
        if (FormatX.App.IsMainWindowClosed) return;
        var arg = args.Argument ?? string.Empty; // format: key=value pairs
        if (arg.Contains(ActionOpenStartup, StringComparison.OrdinalIgnoreCase))
        {
          try { await LauncherService.TryLaunchUriOrLocalFallbackAsync(new Uri("ms-settings:startupapps")); }
          catch (Exception ex) { _ = LogService.LogUsbWinrtErrorAsync("Launcher.LaunchUriAsync", ex); }
        }
      }
      catch { }
    }
  }
}

using System;
using System.Threading.Tasks;
using Microsoft.Windows.AppNotifications;
using Microsoft.Windows.AppNotifications.Builder;

namespace FormatX.Services
{
  public static class NotificationService
  {
    private static bool _registered;

    public static void Initialize()
    {
      try
      {
        var mgr = AppNotificationManager.Default;
        mgr.NotificationInvoked += (_, __) => { };
        mgr.Register();
        _registered = true;
      }
      catch { _registered = false; }
    }

    public static async Task<bool> ShowToastAsync(string title, string? body = null)
    {
      try
      {
        var builder = new AppNotificationBuilder()
          .AddText(title);
        if (!string.IsNullOrWhiteSpace(body)) builder.AddText(body!);
        var notification = builder.BuildNotification();
        AppNotificationManager.Default.Show(notification);
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
  }
}

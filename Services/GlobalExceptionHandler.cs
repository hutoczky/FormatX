using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public static class GlobalExceptionHandler
  {
    private static bool _wired;

    public static void WireUp()
    {
      if (_wired) return; _wired = true;
      try
      {
        AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;
        TaskScheduler.UnobservedTaskException += TaskScheduler_UnobservedTaskException;
        AppDomain.CurrentDomain.ProcessExit += CurrentDomain_ProcessExit;
        if (Microsoft.UI.Xaml.Application.Current is Microsoft.UI.Xaml.Application app)
        {
          app.UnhandledException += App_UnhandledException;
        }
      }
      catch { }
    }

    private static async void App_UnhandledException(object sender, Microsoft.UI.Xaml.UnhandledExceptionEventArgs e)
    {
      try
      {
        var ex = e.Exception;
        try { await LogService.LogUsbAppErrorAsync("App", ex); } catch { }
        await LogService.WriteUsbLineAsync($"usb.winrt.error:Global:{ex.GetType().Name}:{Sanitize(ex.Message)}");
        await WriteCrashLastExitAsync(ex);
        e.Handled = true;
      }
      catch { }
    }

    private static async void CurrentDomain_UnhandledException(object? sender, UnhandledExceptionEventArgs e)
    {
      try
      {
        if (e.ExceptionObject is Exception ex)
        {
          try { await LogService.LogUsbAppErrorAsync("Unhandled", ex); } catch { }
          await LogService.WriteUsbLineAsync($"usb.winrt.error:Global:{ex.GetType().Name}:{Sanitize(ex.Message)}");
          await WriteCrashLastExitAsync(ex);
        }
      }
      catch { }
    }

    private static async void TaskScheduler_UnobservedTaskException(object? sender, UnobservedTaskExceptionEventArgs e)
    {
      try
      {
        var ex = e.Exception?.Flatten();
        if (ex != null)
        {
          try { await LogService.LogUsbAppErrorAsync("Task", ex); } catch { }
          await LogService.WriteUsbLineAsync($"usb.winrt.error:Global:{ex.GetType().Name}:{Sanitize(ex.Message)}");
          await WriteCrashLastExitAsync(ex);
        }
        e.SetObserved();
      }
      catch { }
    }

    private static void CurrentDomain_ProcessExit(object? sender, EventArgs e)
    {
      try
      {
        // Ensure exit code 0 and write last-exit.json atomically
        try { Environment.ExitCode = 0; } catch { }
        try
        {
          var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "crash");
          Directory.CreateDirectory(dir);
          var payload = JsonSerializer.Serialize(new { kind = "process.exit", timestamp = DateTimeOffset.Now.ToString("o"), exitCode = 0, hex = "0x00000000" });
          FileUtil.AtomicWriteAsync(Path.Combine(dir, "last-exit.json"), payload).GetAwaiter().GetResult();
        }
        catch { }
      }
      catch { }
    }

    private static async Task WriteCrashLastExitAsync(Exception ex)
    {
      try
      {
        var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "crash");
        Directory.CreateDirectory(dir);
        var payload = JsonSerializer.Serialize(new
        {
          kind = "last-exit",
          timestamp = DateTimeOffset.Now.ToString("o"),
          exceptionType = ex.GetType().FullName,
          message = Sanitize(ex.Message),
          stack = ex.StackTrace
        }, new JsonSerializerOptions { WriteIndented = true });
        // atomic write to avoid partial files
        await FileUtil.AtomicWriteAsync(Path.Combine(dir, "last-exit.json"), payload);
        // Do not terminate the process automatically; allow app to continue running
      }
      catch { }
    }

    private static string Sanitize(string? s)
      => (s ?? string.Empty).Replace('\r', ' ').Replace('\n', ' ').Trim();
  }
}

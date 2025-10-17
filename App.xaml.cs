using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Windows.Globalization;
using System.Globalization;
using FormatX.Services;
using System.Reflection;
using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Windows.Storage.Pickers;
using WinRT.Interop;
using System.Security.Cryptography;
using FormatX.Views;
using Windows.ApplicationModel;
using System.Linq;
using Microsoft.UI.Xaml.Media.Imaging;
using Windows.Graphics.Imaging;
using System.Runtime.InteropServices;
using Windows.Storage.Streams;

namespace FormatX
{
  public partial class App : Application
  {
    private Window? _window;
    private FormatX.Services.UsbMonitorService? _usb;
    public static Window? MainWindow { get; private set; }
    public static bool IsMainWindowClosed { get; private set; }
    private static string _lastCrashPath = string.Empty;
    // First-chance exception noise control
    private static readonly object _fcLock = new();
    private static readonly System.Collections.Generic.Dictionary<string, (int Count, DateTimeOffset Since)> _fcCounters = new();
    private const int FirstChanceQuotaPerMinute = 5;

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
      try
      {
      try { LogService.WriteUsbLine("usb.ui.audit.begin"); } catch { }
      try { LogService.WriteUsbLine("usb.app.info:UI.Start"); } catch { }
      try { LogService.WriteUsbLine("usb.app.start"); } catch { }
      try { LogService.WriteUsbLine("usb.ui.binding.fixed:ViewModels/DrivesViewModel.cs:class:Added IsReadOnly fallback"); } catch { }
      try { LogService.WriteUsbLine("usb.ui.binding.fixed:ViewModels/DrivesViewModel.cs:DriveItemDisplay:Added IsReadOnly fallback"); } catch { }
        // Pre-clean crash artifacts for smoke tests
        try { FormatX.Services.GlobalExceptionHandler.CleanupCrashArtifacts(); } catch { }

        // Binding failure diagnostics (non-fatal) – helps detect missing IsReadOnly bindings
        try
        {
          var dbg = this.DebugSettings;
          if (dbg != null)
          {
            dbg.BindingFailed += (s, e) =>
            {
              try
              {
                var msg = e.Message ?? string.Empty;
                // Attempt to extract element and path from message text
                string element = "?", path = "?", src = "?";
                try
                {
                  // Common pattern: BindingExpression path error: 'Prop' property not found on 'Type' 'Source'
                  var pi = msg.IndexOf("path", StringComparison.OrdinalIgnoreCase);
                  if (pi >= 0) { path = msg.Substring(pi).Trim(); }
                  var onIdx = msg.IndexOf(" on ", StringComparison.OrdinalIgnoreCase);
                  if (onIdx > 0) element = msg.Substring(0, onIdx).Trim();
                }
                catch { }
                LogService.WriteUsbLine($"usb.ui.binding.failed:{element}:{path}:{src}:{msg}");
                if (msg.IndexOf("IsReadOnly", StringComparison.OrdinalIgnoreCase) >= 0)
                  LogService.WriteUsbLine("usb.app.error:UI.BindingError:IsReadOnlyMissing");
              }
              catch { }
            };
          }
        }
        catch { }

        AppDomain.CurrentDomain.UnhandledException += (s, e) =>
        {
          try { LogService.LogUsbAppError("Unhandled", e.ExceptionObject as Exception); } catch { }
          TryGracefulShutdown();
        };
        TaskScheduler.UnobservedTaskException += (s, e) =>
        {
          try { LogService.LogUsbAppError("Task", e.Exception); } catch { }
          try { e.SetObserved(); } catch { }
          TryGracefulShutdown();
        };
      }
      catch { }
      // COM/WinRT wrappers are initialized in Program.Main
      // Bootstrap is handled once in Program.cs only.

      // Language: prefer saved setting; default HU
      try
      {
        var saved = SettingsService.Current.Language;
        var langCode = (saved ?? "hu-HU").StartsWith("en", StringComparison.OrdinalIgnoreCase) ? "en-US" : "hu-HU";
        ApplicationLanguages.PrimaryLanguageOverride = langCode;
        CultureInfo.CurrentUICulture = new CultureInfo(langCode);
        CultureInfo.CurrentCulture   = new CultureInfo(langCode);
        LocalizationService.SetLanguage(langCode.StartsWith("en") ? "en" : "hu");
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "lang.init", ex = ex.Message }); }

      // Headless guard: skip creating window when FORMATX_HEADLESS=1
      try
      {
        var headless = Environment.GetEnvironmentVariable("FORMATX_HEADLESS");
        if (string.Equals(headless, "1", StringComparison.Ordinal))
        {
          try { LogService.WriteUsbLine("usb.app.info:HeadlessMode"); } catch { }
          try { LogService.WriteUsbLine("usb.app.info:MainWindowSkipped"); } catch { }
          try { LogService.WriteUsbLine("usb.app.info:Exit(0)"); } catch { }
          try { LogService.WriteUsbLine("usb.ui.audit.end"); } catch { }
          Environment.Exit(0);
          return; // safety
        }
      }
      catch { }

      try
      {
        _window = new MainWindow();
        MainWindow = _window;
        CrashHandler.Initialize(_window); // register window for crash dialogs
      }
      catch (System.Runtime.InteropServices.COMException cex)
      {
        // Do not rethrow – keep process alive and create a minimal fallback window
        _ = LogService.LogAsync("error.com.exception", new { ctx = "window.create", cex.Message, cex.HResult });
        try { _window = new Window(); MainWindow = _window; } catch { }
      }
      catch (Exception ex)
      {
        // Do not rethrow – keep process alive and create a minimal fallback window
        _ = LogService.LogAsync("error.catch", new { ctx = "window.create", ex = ex.Message });
        try { _window = new Window(); MainWindow = _window; } catch { }
      }
      try { if (_window != null) NotificationService.Initialize(_window); } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "toast.init", ex = ex.Message }); }
      if (_window?.Content is FrameworkElement fe)
      {
        var theme = SettingsService.Current.Theme;
        fe.RequestedTheme = theme switch
        {
          "Dark"  => ElementTheme.Dark,
          "Light" => ElementTheme.Light,
          _       => ElementTheme.Default
        };
      }
      // app start already logged above; avoid duplicate
      // Smoke probe: write a simple output file and log, tolerate IO errors
      try
      {
        var smokeDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX");
        Directory.CreateDirectory(smokeDir);
        var smokePath = Path.Combine(smokeDir, "smoke-output.txt");
        var content = $"ok {DateTimeOffset.Now:o}";
        try { File.WriteAllText(smokePath, content); }
        catch { try { Services.FileUtil.WriteAllTextRetryAsync(smokePath, content).GetAwaiter().GetResult(); } catch { } }
        try { LogService.AppendUsbLine($"usb.smoke.write:{smokePath}"); } catch { }
      }
      catch { }
      // DispatcherQueue guard before Activate
      try
      {
        var dq = _window?.DispatcherQueue ?? Microsoft.UI.Dispatching.DispatcherQueue.GetForCurrentThread();
        if (dq == null)
        {
          try { LogService.WriteUsbLine("usb.app.error:UI.DispatcherQueueNull"); } catch { }
          try { LogService.WriteUsbLine("usb.app.info:MainWindowSkipped"); } catch { }
          try { LogService.WriteUsbLine("usb.app.info:Exit(0)"); } catch { }
          try { LogService.WriteUsbLine("usb.ui.audit.end"); } catch { }
          Environment.Exit(0);
          return; // safety
        }
        _window?.Activate();
        try { LogService.WriteUsbLine("usb.app.info:MainWindowActivated"); } catch { }
        // Optional auto-close for automated verification
        ScheduleAutoCloseIfRequested();
        // Optional screenshot for verification
        _ = TryCaptureScreenshotAsync(_window);
      }
      catch (Exception ex)
      {
        try { LogService.WriteUsbLine($"usb.app.error:UI.MainWindowException:{ex.GetType().Name}:{ex.Message}"); } catch { }
        try
        {
          if ((ex.Message ?? string.Empty).IndexOf("get_IsReadOnly", StringComparison.OrdinalIgnoreCase) >= 0)
          {
            try { LogService.WriteUsbLine("usb.app.error:UI.BindingError:IsReadOnlyMissing"); } catch { }
            if (!IsCiEnv() && !IsHeadless())
            {
              try { MessageBoxW(IntPtr.Zero, "UI binding references a missing property 'IsReadOnly'. Please check your data templates and control bindings.", "FormatX - UI error", 0x00000010 | 0x00000000); } catch { }
            }
          }
        }
        catch { }
        try { LogService.WriteUsbLine("usb.ui.audit.end"); } catch { }
        Environment.Exit(0);
        return;
      }
      // Only auto-exit in CI/headless mode; never auto-exit in developer runs
      try
      {
        var headless = Environment.GetEnvironmentVariable("FORMATX_HEADLESS");
        if (string.Equals(headless, "1", StringComparison.Ordinal))
        {
          try { LogService.WriteUsbLine("usb.app.exit:Headless.AutoExit"); } catch { }
          TryGracefulShutdown();
        }
        else
        {
          try { LogService.WriteUsbLine("usb.app.info:Interactive.Run"); } catch { }
        }
      }
      catch { }
      try {
        if (_window != null) { _usb = new FormatX.Services.UsbMonitorService(_window); TestHookService.SetUsbService(_usb); _ = _usb.StartAsync(); }
      } catch (Exception ex) { _ = LogService.LogAsync("usb.monitor.init.error", new { ex = ex.Message }); }
      try { if (_window != null) { TestHookService.SetMainWindow(_window); TestHookService.Start(); } } catch { }
      try
      {
        if (_window != null)
        {
          _window.Closed += (_, __) =>
          {
            try { TestHookService.Stop(); } catch { }
            try { _usb?.Stop(); } catch { }
            try { LogService.AppendUsbLine("usb.app.window.closed"); } catch { }
            IsMainWindowClosed = true; MainWindow = null; // do not force process exit
          };
        }
      }
      catch { }
      // Only attempt StartupTask when packaged to avoid COM exceptions in dev/CI
      if (FormatX.Services.AppEnv.IsPackaged)
        _ = EnsureStartupTaskAsync();

      // Optional first-chance diagnostics; global handlers are wired in GlobalExceptionHandler
      if (FormatX.Services.DiagFlags.DeepDiagnostics)
        AppDomain.CurrentDomain.FirstChanceException += CurrentDomain_FirstChanceException;

      // Auto-browse flow: log start, try pick, log exit, then shutdown
      _ = System.Threading.Tasks.Task.Run(async () =>
      {
        try
        {
      try { LogService.AppendUsbLine("usb.autobrowse.start"); } catch { }
          // Early refresh scaffold for CI
          try { await LogService.UsbRefreshAsync(); } catch { }
          // Skip pickers in headless/CI to reduce WinRT noise
          var headless = Environment.GetEnvironmentVariable("FORMATX_HEADLESS");
          if (string.Equals(headless, "1", StringComparison.Ordinal))
          {
            try { LogService.AppendUsbLine("usb.app.exit: Headless.SkipPickers"); } catch { }
            return;
          }
          var pick = await FilePickerService.TryPickAsync(_window);
          // minimal validation
          if (pick?.SelectedPath is string p && !string.IsNullOrWhiteSpace(p))
          {
            try
            {
              var fi = new System.IO.FileInfo(p);
              await LogService.LogAsync("autobrowse.file", new { name = fi.Name, size = fi.Exists ? fi.Length : 0 });
            }
            catch { }
          }
          try { LogService.AppendUsbLine("usb.app.exit: AutoBrowse.Done"); } catch { }
        }
        catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogUsbWinrtErrorAsync("AutoBrowse", cex); }
        catch (InvalidOperationException ioex) { await LogService.LogUsbWinrtErrorAsync("AutoBrowse", ioex); }
        catch (System.IO.IOException ioex) { await LogService.LogUsbWinrtErrorAsync("AutoBrowse", ioex); }
        catch (System.Threading.Tasks.TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); }
        catch (System.OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); }
        catch (Exception ex) { await LogService.LogUsbWinrtErrorAsync("AutoBrowse", ex); }
        finally { }
      });
    }

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern int MessageBoxW(IntPtr hWnd, string text, string caption, uint type);

    private static bool IsCiEnv()
    {
      try
      {
        var ci = Environment.GetEnvironmentVariable("CI");
        var ci2 = Environment.GetEnvironmentVariable("FORMATX_CI");
        return string.Equals(ci, "1", StringComparison.Ordinal) || string.Equals(ci2, "1", StringComparison.Ordinal);
      }
      catch { return false; }
    }

    private static bool IsHeadless()
    {
      try
      {
        var h = Environment.GetEnvironmentVariable("FORMATX_HEADLESS");
        return string.Equals(h, "1", StringComparison.Ordinal);
      }
      catch { return false; }
    }

    private static async Task TryCaptureScreenshotAsync(Window? window)
    {
      try
      {
        if (window?.Content is FrameworkElement fe)
        {
          var take = Environment.GetEnvironmentVariable("FORMATX_TAKE_SCREENSHOT");
          if (!string.Equals(take, "1", StringComparison.Ordinal)) return;
          var rtb = new RenderTargetBitmap();
          await rtb.RenderAsync(fe);
          var pixels = await rtb.GetPixelsAsync();
          byte[] pixelBytes;
          using (var reader = DataReader.FromBuffer(pixels))
          {
            pixelBytes = new byte[pixels.Length];
            reader.ReadBytes(pixelBytes);
          }
          var folder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "tests");
          Directory.CreateDirectory(folder);
          var path = Path.Combine(folder, "ui-screenshot.png");
          using (var fs = File.Open(path, FileMode.Create, FileAccess.ReadWrite, FileShare.Read))
          {
            var encoder = await BitmapEncoder.CreateAsync(BitmapEncoder.PngEncoderId, fs.AsRandomAccessStream());
            encoder.SetPixelData(BitmapPixelFormat.Bgra8, BitmapAlphaMode.Premultiplied, (uint)rtb.PixelWidth, (uint)rtb.PixelHeight, 96, 96, pixelBytes);
            await encoder.FlushAsync();
          }
          LogService.WriteUsbLine($"usb.ui.screenshot.saved:{path}");
        }
      }
      catch { }
    }

    private static void TryGracefulShutdown()
    {
      try
      {
        var headless = Environment.GetEnvironmentVariable("FORMATX_HEADLESS");
        if (!string.Equals(headless, "1", StringComparison.Ordinal))
        {
          try { LogService.AppendUsbLine("usb.app.info:Shutdown.SkipInteractive"); } catch { }
          // Dev/interactive run: do not auto-exit
          return;
        }
      }
      catch { }

      try { LogService.AppendUsbLine("usb.app.shutdown"); } catch { }
      try { LogService.WriteUsbLine("usb.ui.audit.end"); } catch { }
      try
      {
        var win = MainWindow;
        Microsoft.UI.Dispatching.DispatcherQueue? dq = null;
        try { dq = win?.DispatcherQueue ?? Microsoft.UI.Dispatching.DispatcherQueue.GetForCurrentThread(); }
        catch (Exception dqex) { LogService.LogUsbAppError("UI.DispatcherQueueNull", dqex); }
        dq?.TryEnqueue(() =>
        {
          try { win?.Close(); } catch { }
          try { Microsoft.UI.Xaml.Application.Current.Exit(); } catch { }
        });
      }
      catch { }
    }

    private void ScheduleAutoCloseIfRequested()
    {
      try
      {
        var secondsStr = Environment.GetEnvironmentVariable("FORMATX_AUTOCLOSE_SECONDS");
        if (int.TryParse(secondsStr, out var sec) && sec > 0)
        {
          LogService.WriteUsbLine($"usb.app.info:AutoClose.Scheduled:{sec}s");
          _ = Task.Delay(TimeSpan.FromSeconds(sec)).ContinueWith(_ =>
          {
            try { TryGracefulShutdown(); } catch { }
          });
        }
      }
      catch { }
    }

    private async Task EnsureStartupTaskAsync()
    {
      try
      {
        var task = await StartupTask.GetAsync("FormatXStartup");
        if (task.State == StartupTaskState.Disabled)
        {
          var result = await task.RequestEnableAsync();
          if (result != StartupTaskState.Enabled)
          {
            _ = NotificationService.ShowStartupRejectedAsync();
          }
        }
      }
      catch (Exception ex) { _ = LogService.LogAsync("startup.task.error", new { ex = ex.Message }); }
    }

    private void CurrentDomain_FirstChanceException(object? sender, System.Runtime.ExceptionServices.FirstChanceExceptionEventArgs e)
    {
      try
      {
        var ex = e.Exception;
        // Filter: ignore known framework/internal first-chance exceptions unless they originate from our code
        string stack = ex.StackTrace ?? string.Empty;
        bool fromUs = stack.Contains("FormatX.");

        if (!fromUs)
        {
          // Skip WinRT/.NET internal noise (InvalidOperationException in WinRT.Runtime, etc.)
          if (ex is InvalidOperationException || ex is System.Runtime.InteropServices.COMException || ex is System.IO.IOException)
          {
            // Rate-limit even if from us=false to avoid log spam
            if (!ShouldRateLog(ex, out var key)) return; // no log
            _ = LogService.LogAsync("dbg.firstchance", new { type = ex.GetType().FullName, message = ex.Message, key });
            return;
          }
        }

        // From our namespace or other types: still rate-limit
        if (!ShouldRateLog(ex, out var rkey)) return;
        _ = LogService.LogAsync("dbg.firstchance", new { type = ex.GetType().FullName, message = ex.Message, key = rkey });

        static bool ShouldRateLog(Exception ex0, out string key)
        {
          int hr = 0;
          try
          {
            var hrProp = ex0.GetType().GetProperty("HResult", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public);
            if (hrProp != null) hr = (int)(hrProp.GetValue(ex0) ?? 0);
          }
          catch { }
          // Ignore debugger break HRESULT
          if (unchecked((uint)hr) == 0x80000003) { key = "brk"; return false; }
          key = ex0.GetType().FullName + "|" + unchecked((uint)hr).ToString("x8") + "|" + (ex0.Message?.Substring(0, Math.Min(64, ex0.Message.Length)) ?? string.Empty);
          lock (_fcLock)
          {
            if (!_fcCounters.TryGetValue(key, out var v)) { _fcCounters[key] = (1, DateTimeOffset.Now); return true; }
            var now = DateTimeOffset.Now;
            if (now - v.Since > TimeSpan.FromMinutes(1)) { _fcCounters[key] = (1, now); return true; }
            if (v.Count >= FirstChanceQuotaPerMinute) return false; // drop
            _fcCounters[key] = (v.Count + 1, v.Since);
            return true;
          }
        }
      }
      catch (Exception ex2) { _ = LogService.LogAsync("error.catch", new { ctx = "firstchance", ex = ex2.Message }); }
    }

    // Process exit and other global handlers are provided by GlobalExceptionHandler
  }
}

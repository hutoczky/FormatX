using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Windows.Globalization;
using System.Globalization;
using FormatX.Services;
using System.Reflection;
using System;
using System.IO;
using System.Text.Json;
using Windows.Storage.Pickers;
using WinRT.Interop;
using System.Security.Cryptography;
using FormatX.Views;

namespace FormatX
{
  public partial class App : Application
  {
    private Window? _window;
    public static Window? MainWindow { get; private set; }
    private static string _lastCrashPath = string.Empty;

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
      try { WinRT.ComWrappersSupport.InitializeComWrappers(); }
      catch (System.Runtime.InteropServices.COMException cex) { _ = LogService.LogAsync("error.com.exception", new { ctx = "ComWrappers", cex.Message, cex.HResult }); }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "ComWrappers", ex = ex.Message }); }
      // Optional: Bootstrap Windows App SDK in UNPACKAGED mode (no-op if packaged or missing)
      try
      {
        var t = Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppSDK", throwOnError: false);
        if (t != null)
        {
          var initWithVer = t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, new Type[] { typeof(uint) });
          var initNoArg   = t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, Type.EmptyTypes);
          if (initWithVer != null) initWithVer.Invoke(null, new object[] { 0x00010800u }); // 1.8
          else initNoArg?.Invoke(null, null);
        }
      }
      catch (System.Runtime.InteropServices.COMException cex) { _ = LogService.LogAsync("error.com.exception", new { ctx = "bootstrap", cex.Message, cex.HResult }); }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "bootstrap", ex = ex.Message }); }

      // Language (default HU)
      var lang = SettingsService.Current.Language;
      try
      {
        ApplicationLanguages.PrimaryLanguageOverride = lang;
        CultureInfo.CurrentUICulture = new CultureInfo(lang);
        CultureInfo.CurrentCulture   = new CultureInfo(lang);
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "lang.init", ex = ex.Message }); }

      try
      {
        _window = new MainWindow();
        MainWindow = _window;
        CrashHandler.Initialize(_window); // register window for crash dialogs
      }
      catch (System.Runtime.InteropServices.COMException cex) { _ = LogService.LogAsync("error.com.exception", new { ctx = "window.create", cex.Message, cex.HResult }); throw; }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "window.create", ex = ex.Message }); throw; }
      try { NotificationService.Initialize(); } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "toast.init", ex = ex.Message }); }
      if (_window.Content is FrameworkElement fe)
      {
        var theme = SettingsService.Current.Theme;
        fe.RequestedTheme = theme switch
        {
          "Dark"  => ElementTheme.Dark,
          "Light" => ElementTheme.Light,
          _       => ElementTheme.Default
        };
      }
      try { _window.Activate(); } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "window.activate", ex = ex.Message }); }

      // Global exception hooks
      this.UnhandledException += App_UnhandledException;
      AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;
      AppDomain.CurrentDomain.FirstChanceException += CurrentDomain_FirstChanceException;
      AppDomain.CurrentDomain.ProcessExit += CurrentDomain_ProcessExit;
    }

    private static string SaveCrash(Exception ex, string source)
    {
      try
      {
        var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "crash");
        Directory.CreateDirectory(dir);
        string hwid = "";
        try
        {
          // Compose a pseudo-HWID (no external dependencies). Best-effort.
          string machine = Environment.MachineName;
          string user = Environment.UserName;
          string bios = string.Empty;
          try
          {
            using var mos = new System.Management.ManagementObjectSearcher("root\\CIMV2", "SELECT SerialNumber FROM Win32_BIOS");
            foreach (System.Management.ManagementObject mo in mos.Get()) { bios = mo["SerialNumber"]?.ToString() ?? string.Empty; break; }
          }
          catch (Exception inner) { _ = LogService.LogAsync("hwid.bios.error", new { inner = inner.Message }); }
          string cpu = string.Empty;
          try
          {
            using var mos2 = new System.Management.ManagementObjectSearcher("root\\CIMV2", "SELECT ProcessorId FROM Win32_Processor");
            foreach (System.Management.ManagementObject mo2 in mos2.Get()) { cpu = mo2["ProcessorId"]?.ToString() ?? string.Empty; break; }
          }
          catch (Exception inner2) { _ = LogService.LogAsync("hwid.cpu.error", new { inner2 = inner2.Message }); }
          using var shaTmp = SHA256.Create();
          hwid = Convert.ToHexString(shaTmp.ComputeHash(System.Text.Encoding.UTF8.GetBytes(string.Join("|", new [] { machine, user, bios, cpu }))));
        }
        catch (Exception idEx) { _ = LogService.LogAsync("hwid.error", new { idEx.Message }); }
        var payload = new
        {
          ts = DateTimeOffset.Now.ToString("o"),
          user = Environment.UserName,
          machine = Environment.MachineName,
          source,
          type = ex.GetType().FullName,
          message = ex.Message,
          stack = ex.StackTrace,
          exception = ex.ToString(),
          hwid
        };
        string json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
        string path = Path.Combine(dir, $"crash_{DateTimeOffset.Now:yyyyMMdd_HHmmss}.json");
        try { File.WriteAllText(path, json); }
        catch (IOException ioex) { _ = LogService.LogAsync("error.io.exception", ioex); throw; }
        string sha256;
        using (var sha = SHA256.Create())
        {
          sha256 = Convert.ToHexString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(json)));
        }
        try { File.WriteAllText(path + ".sha256", sha256); }
        catch (IOException ioex2) { _ = LogService.LogAsync("error.io.exception", ioex2); }
        _ = LogService.LogAsync("crash.save", new { source, path, sha256, hwid });
        _lastCrashPath = path;
        return path;
      }
      catch
      {
        _ = LogService.LogAsync("crash.save.error", new { source });
        return string.Empty;
      }
    }

    private async void OfferCrashExportAsync(string crashPath)
    {
      if (string.IsNullOrWhiteSpace(crashPath) || !File.Exists(crashPath)) return;
      try
      {
        _window?.DispatcherQueue.TryEnqueue(() =>
        {
          try
          {
            var crashWin = new CrashDialogWindow(crashPath);
            crashWin.Activate();
          }
          catch (Exception ex2) { _ = LogService.LogAsync("error.catch", new { ctx = "crash.dialog.window", ex = ex2.Message }); }
        });
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "crash.dialog", ex = ex.Message }); }
    }

    private void App_UnhandledException(object sender, Microsoft.UI.Xaml.UnhandledExceptionEventArgs e)
    {
      try
      {
        string p = SaveCrash(e.Exception, "App.UnhandledException");
        OfferCrashExportAsync(p);
        _ = LogService.LogAsync("error.unhandled", new { type = e.Exception.GetType().FullName, e.Exception.Message });
        CrashHandler.Show(e.Exception, "app.unhandled");
        e.Handled = true; // try keep app responsive after logging
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "crash.handler.app", ex = ex.Message }); }
    }

    private void CurrentDomain_UnhandledException(object sender, System.UnhandledExceptionEventArgs e)
    {
      try
      {
        var ex = e.ExceptionObject as Exception;
        if (ex == null) return;
        string p = SaveCrash(ex, "AppDomain.UnhandledException");
        OfferCrashExportAsync(p);
        _ = LogService.LogAsync("error.unhandled", new { type = ex.GetType().FullName, ex.Message });
        CrashHandler.Show(ex, "AppDomain.UnhandledException");
      }
      catch (Exception ex2) { _ = LogService.LogAsync("error.catch", new { ctx = "crash.handler.domain", ex = ex2.Message }); }
    }

    private void CurrentDomain_FirstChanceException(object? sender, System.Runtime.ExceptionServices.FirstChanceExceptionEventArgs e)
    {
      try
      {
        if (e.Exception is System.Runtime.InteropServices.COMException cex)
          _ = LogService.LogAsync("error.com.exception", cex);
        else if (e.Exception is System.IO.IOException ioex)
          _ = LogService.LogAsync("error.io.exception", ioex);
        // Debugger break code (0x80000003) surfaces as COM/SEH sometimes; ensure audit
        var hrProp = e.Exception.GetType().GetProperty("HResult", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public);
        if (hrProp != null)
        {
          int hr = (int)(hrProp.GetValue(e.Exception) ?? 0);
          if (unchecked((uint)hr) == 0x80000003)
          {
            _ = LogService.LogAsync("debug.break", new { type = e.Exception.GetType().FullName, e.Exception.Message, hr });
          }
        }
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "firstchance", ex = ex.Message }); }
    }

    private void CurrentDomain_ProcessExit(object? sender, EventArgs e)
    {
      try
      {
        int code = Environment.ExitCode;
        if (code == -1 || unchecked((uint)code) == 0xFFFFFFFF)
        {
          _ = LogService.LogAsync("process.exit.anomaly", new { exitCode = code, lastCrash = _lastCrashPath });
          // Best-effort final UI hint before shutdown (may not show if teardown progressed)
          if (!string.IsNullOrWhiteSpace(_lastCrashPath) && _window != null)
          {
            try { OfferCrashExportAsync(_lastCrashPath); } catch { }
          }
        }
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "process.exit", ex = ex.Message }); }
    }
  }
}

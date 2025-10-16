using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.UI.Xaml;
using Windows.Devices.Enumeration;

namespace FormatX.Services
{
  /// <summary>
  /// Monitors removable (USB) drives and triggers a predefined action on arrival.
  /// Uses DeviceWatcher with a debounced DriveInfo diff to be battery-friendly on laptops.
  /// </summary>
  public sealed class UsbMonitorService : IDisposable
  {
    private readonly Window _window;
    private DeviceWatcher? _watcher;
    private readonly SemaphoreSlim _gate = new(1, 1);
    private HashSet<string> _knownRemovable = new(StringComparer.OrdinalIgnoreCase);
    private readonly string _logDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "logs");
    private bool _started;
    private CancellationTokenSource? _cts;
    private System.Threading.Tasks.Task? _pollTask;
    private System.Threading.Tasks.Task? _powerTask;
    private int _stopping = 0;

    public UsbMonitorService(Window window)
    {
      _window = window;
      Directory.CreateDirectory(_logDir);
    }

    // Internal smoke-test hook
    internal async Task Internal_ToggleWatcher(bool start)
    {
      try
      {
        if (start) await StartAsync(); else Stop();
      }
      catch (TaskCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } }
      catch (OperationCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } }
    }

    public async Task StartAsync()
    {
      if (FormatX.App.IsMainWindowClosed) return;
      if (_started) return;
      _started = true;
      _cts = new CancellationTokenSource();
      await RefreshKnownRemovableAsync();

      try
      {
        // Skip watcher while energy saver is on
        if (Windows.System.Power.PowerManager.EnergySaverStatus == Windows.System.Power.EnergySaverStatus.On)
        {
          await LogAsync("usb.watcher.skipped.energysaver", new { });
          return;
        }
      }
      catch { }

      try
      {
        // TODO: Event-based API limits wrapping; using UI-thread adapter + guarded creation/start
        await WinRtGuard.SafeExecuteAsync(async _ =>
        {
          await UiThread.RunOnUIThreadAsync(_window, () =>
          {
            try { _watcher = DeviceInformation.CreateWatcher(DeviceClass.PortableStorageDevice); }
            catch (System.Runtime.InteropServices.COMException cex) { LogService.AppendUsbLine($"usb.winrt.error: {cex.GetType().Name} {cex.Message}"); return Task.CompletedTask; }
            catch (InvalidOperationException ioex) { LogService.AppendUsbLine($"usb.winrt.error: {ioex.GetType().Name} {ioex.Message}"); return Task.CompletedTask; }

            _watcher.Added += Watcher_Added;
            _watcher.Removed += Watcher_Removed;
            _watcher.Updated += Watcher_Updated;
            _watcher.Stopped += Watcher_Stopped;
            _watcher.EnumerationCompleted += Watcher_EnumerationCompleted;
            try { _watcher.Start(); }
            catch (System.Runtime.InteropServices.COMException cex) { LogService.AppendUsbLine($"usb.winrt.error: {cex.GetType().Name} {cex.Message}"); }
            catch (InvalidOperationException ioex) { LogService.AppendUsbLine($"usb.winrt.error: {ioex.GetType().Name} {ioex.Message}"); }
            return Task.CompletedTask;
          });
        }, CancellationToken.None, LogService.AppendUsbLine);
        await LogAsync("usb.watcher.start", new { });
      }
      catch (System.Runtime.InteropServices.COMException cex)
      {
        await LogService.LogUsbWinrtErrorAsync("DeviceWatcher.Start", cex);
      }
      catch (InvalidOperationException ioex)
      {
        await LogService.LogUsbWinrtErrorAsync("DeviceWatcher.Start", ioex);
      }
      catch (Exception ex)
      {
        await LogService.LogUsbWinrtErrorAsync("DeviceWatcher.Start", ex);
      }

      // Background, low-cost DriveInfo diff every 30s (no WinRT access here)
      _pollTask = Task.Run(() => DrivePollLoopAsync(_cts!.Token));
      // Power/energy saver checks every 5 minutes
      _powerTask = Task.Run(() => PowerLoopAsync(_cts!.Token));
    }

    public void Stop()
    {
      if (System.Threading.Interlocked.Exchange(ref _stopping, 1) == 1) return; // reentrancy guard
      try
      {
        try { _cts?.Cancel(); } catch { }
        if (_watcher != null)
        {
          try
          {
            WinRtGuard.SafeExecuteAsync(async _ =>
            {
              await UiThread.RunOnUIThreadAsync(_window, () =>
              {
                if (_watcher.Status == DeviceWatcherStatus.Started || _watcher.Status == DeviceWatcherStatus.EnumerationCompleted)
                  _watcher.Stop();
                return Task.CompletedTask;
              });
            }, CancellationToken.None, LogService.AppendUsbLine).GetAwaiter().GetResult();
          }
          catch (Exception ex) { _ = LogService.LogUsbWinrtErrorAsync("DeviceWatcher.Stop", ex); }
          try
          {
            _watcher.Added -= Watcher_Added;
            _watcher.Removed -= Watcher_Removed;
            _watcher.Updated -= Watcher_Updated;
            _watcher.Stopped -= Watcher_Stopped;
            _watcher.EnumerationCompleted -= Watcher_EnumerationCompleted;
          }
          catch (Exception ex) { _ = LogService.LogUsbWinrtErrorAsync("DeviceWatcher.Unhook", ex); }
        }
      }
      catch { }
      finally { _watcher = null; _started = false; System.Threading.Interlocked.Exchange(ref _stopping, 0); }
    }

    private async void Watcher_Updated(DeviceWatcher sender, DeviceInformationUpdate args)
    {
      if (FormatX.App.IsMainWindowClosed) return;
      try { await LogService.UsbUpdatedAsync(args?.Id ?? string.Empty); } catch { }
      try { await RefreshKnownRemovableAsync(); } catch (Exception ex) { LogService.AppendUsbLine($"usb.winrt.error: {ex.GetType().Name} {ex.Message}"); }
    }
    private async void Watcher_Removed(DeviceWatcher sender, DeviceInformationUpdate args)
    {
      if (FormatX.App.IsMainWindowClosed) return;
      try { await LogService.UsbRemovedAsync(args?.Id ?? string.Empty); } catch { }
      try { await RefreshKnownRemovableAsync(); } catch (Exception ex) { LogService.AppendUsbLine($"usb.winrt.error: {ex.GetType().Name} {ex.Message}"); }
    }
    private async void Watcher_Added(DeviceWatcher sender, DeviceInformation args) => await OnPossibleArrivalAsync();

    private async void Watcher_Stopped(DeviceWatcher sender, object args)
    {
      if (FormatX.App.IsMainWindowClosed) return;
      try { await LogAsync("usb.watcher.stopped", new { status = sender?.Status.ToString() }); } catch { }
    }
    private async void Watcher_EnumerationCompleted(DeviceWatcher sender, object args)
    {
      if (FormatX.App.IsMainWindowClosed) return;
      try { await LogAsync("usb.watcher.enum", new { }); } catch { }
    }

    private async Task OnPossibleArrivalAsync()
    {
      await Task.Delay(400); // let the volume mount
      await _gate.WaitAsync();
      try
      {
        var before = new HashSet<string>(_knownRemovable, StringComparer.OrdinalIgnoreCase);
        await RefreshKnownRemovableAsync();
        var added = _knownRemovable.Except(before).ToList();
        foreach (var letter in added)
        {
          await OnUsbDriveArrivedAsync(letter);
        }
      }
      finally { _gate.Release(); }
    }

    private Task RefreshKnownRemovableAsync()
    {
      try
      {
        _knownRemovable = new HashSet<string>(
          DriveInfo.GetDrives().Where(d => d.DriveType == DriveType.Removable && d.IsReady)
                                 .Select(d => d.Name.TrimEnd('\\').ToUpperInvariant()),
          StringComparer.OrdinalIgnoreCase);
      }
      catch (Exception ex) { _ = LogAsync("usb.refresh.error", new { ex = ex.Message }); }
      return Task.CompletedTask;
    }

    private async Task OnUsbDriveArrivedAsync(string driveRoot)
    {
      var ts = DateTimeOffset.Now.ToString("o");
      await LogAsync("usb.arrival", new { drive = driveRoot, ts });
      // Example action: write marker file into the root (retry for slow mounts)
      string marker = Path.Combine(driveRoot + Path.DirectorySeparatorChar, "FormatX_Auto.txt");
      for (int i = 0; i < 3; i++)
      {
        try
        {
          if (!File.Exists(marker))
          {
            await File.WriteAllTextAsync(marker, $"FormatX Pro auto action at {ts}\n");
          }
          break;
        }
        catch (IOException) { await Task.Delay(300); }
        catch (UnauthorizedAccessException) { await Task.Delay(300); }
        catch (Exception ex) { await LogAsync("usb.copy.error", new { drive = driveRoot, ex = ex.Message, attempt = i + 1 }); break; }
      }
      // Only notify when user is present (battery friendly)
      try
      {
        bool userPresent = IsUserPresent();
        if (userPresent)
          _ = await NotificationService.ShowToastAsync("USB detected", driveRoot);
      }
      catch { }
    }

    private async Task LogAsync(string evt, object data)
    {
      try
      {
        var line = $"{DateTimeOffset.Now:o}\t{evt}\t{System.Text.Json.JsonSerializer.Serialize(data)}";
        var path = Path.Combine(_logDir, "usb.log");
        await FileUtil.AppendAllTextRetryAsync(path, line + Environment.NewLine);
      }
      catch { }
    }

    public void Dispose()
    {
      Stop();
      _gate.Dispose();
      _cts?.Dispose();
    }

    private static bool IsUserPresent()
    {
      try
      {
        // Use reflection to avoid compile-time dependency on newer SDK members
        var pmType = Type.GetType("Windows.System.Power.PowerManager, Windows", throwOnError: false);
        var prop = pmType?.GetProperty("UserPresenceStatus", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
        var val = prop?.GetValue(null);
        if (val != null)
        {
          var name = val.ToString(); // Expected to be "Present" when user is active
          return string.Equals(name, "Present", StringComparison.OrdinalIgnoreCase);
        }
      }
      catch { }
      // Default to true to keep UX responsive when API not available
      return true;
    }

    private async Task DrivePollLoopAsync(CancellationToken ct)
    {
      try
      {
        var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        while (await timer.WaitForNextTickAsync(ct))
        {
          if (ct.IsCancellationRequested) break;
          var before = new HashSet<string>(_knownRemovable, StringComparer.OrdinalIgnoreCase);
          await RefreshKnownRemovableAsync();
          var added = _knownRemovable.Except(before).ToList();
          foreach (var letter in added) { await OnUsbDriveArrivedAsync(letter); }
        }
      }
      catch (TaskCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } }
      catch (OperationCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } }
      catch (Exception ex) { await LogAsync("usb.poll.error", new { ex = ex.Message }); }
    }

    private async Task PowerLoopAsync(CancellationToken ct)
    {
      try
      {
        var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
        while (await timer.WaitForNextTickAsync(ct))
        {
          if (ct.IsCancellationRequested) break;
          bool saver = false;
          try { saver = Windows.System.Power.PowerManager.EnergySaverStatus == Windows.System.Power.EnergySaverStatus.On; } catch { }

          bool lowBattery = false;
          try
          {
            using var mos = new System.Management.ManagementObjectSearcher("root\\CIMV2", "SELECT EstimatedChargeRemaining, BatteryStatus FROM Win32_Battery");
            foreach (System.Management.ManagementObject mo in mos.Get())
            {
              int remaining = Convert.ToInt32(mo["EstimatedChargeRemaining"] ?? 100);
              int status = Convert.ToInt32(mo["BatteryStatus"] ?? 0); // 1=Discharging
              if (remaining < 25 || status == 1) { lowBattery = true; break; }
            }
          }
          catch { }

          if (saver || lowBattery)
          {
            await LogAsync("usb.power.saver", new { saver, lowBattery });
            // Stop watcher to save power; DriveInfo poll remains with 30s cadence
            try
            {
              if (FormatX.App.IsMainWindowClosed) continue;
              if (_watcher != null && (_watcher.Status == DeviceWatcherStatus.Started || _watcher.Status == DeviceWatcherStatus.EnumerationCompleted))
                await UiThread.RunOnUIThreadAsync(_window, () => { _watcher.Stop(); });
            }
            catch { }
          }
          else
          {
            // Ensure watcher started
            try
            {
              if (FormatX.App.IsMainWindowClosed) continue;
              if (_watcher != null && _watcher.Status == DeviceWatcherStatus.Stopped)
                await UiThread.RunOnUIThreadAsync(_window, () => { _watcher.Start(); });
            }
            catch { }
          }
        }
      }
      catch (TaskCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } }
      catch (OperationCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } }
      catch (Exception ex) { await LogAsync("usb.power.error", new { ex = ex.Message }); }
    }
  }
}

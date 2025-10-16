using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.UI.Dispatching;

namespace FormatX.ViewModels
{
  public sealed class DriveItemDisplay
  {
    public string Letter { get; init; } = string.Empty; // e.g. "E:"
    public string Label { get; init; } = string.Empty;  // display text
    public override string ToString() => Label;
  }

  public sealed class DrivesViewModel
  {
    public ObservableCollection<DriveItemDisplay> FormatDrives { get; } = new();
    public ObservableCollection<DriveItemDisplay> IsoDrives { get; } = new();

    private readonly SemaphoreSlim _gate = new(1, 1);
    private CancellationTokenSource? _cts;

    public async Task RefreshDrivesAsync(DispatcherQueue dispatcher, string? prevFormatLetter, string? prevIsoLetter, bool includeFixedForIso, CancellationToken externalCt = default)
    {
      // Energy saver skip
      try
      {
        if (Windows.System.Power.PowerManager.EnergySaverStatus == Windows.System.Power.EnergySaverStatus.On)
        {
          await Services.LogService.UsbRefreshSkippedEnergySaverAsync();
          return;
        }
      }
      catch { }

      CancellationTokenSource? local = null;
      bool acquired = false;
      try
      {
        acquired = await _gate.WaitAsync(0); // debounce concurrent clicks
        if (!acquired) return;

        // cancel any in-flight work
        var old = Interlocked.Exchange(ref _cts, new CancellationTokenSource());
        try { old?.Cancel(); old?.Dispose(); } catch { }
        local = _cts;
        using var linked = CancellationTokenSource.CreateLinkedTokenSource(local.Token, externalCt);

        var proc = Process.GetCurrentProcess();
        var prevPrio = proc.PriorityClass;
        try { proc.PriorityClass = ProcessPriorityClass.Idle; } catch { }
        try
        {
          var drives = DriveInfo.GetDrives();
          // Format list: ALL ready drives (Fixed + Removable)
          var nowFormat = drives.Where(d => (d.DriveType == DriveType.Fixed || d.DriveType == DriveType.Removable) && d.IsReady)
                                .Select(d => new DriveItemDisplay { Letter = d.Name.TrimEnd('\\').ToUpperInvariant(), Label = $"{d.Name.TrimEnd('\\')} – {Safe(d.VolumeLabel)} • {d.DriveFormat} • {(d.TotalSize / (1024*1024*1024))} GB" })
                                .ToArray();

          // ISO list: ONLY removable + ready (USB)
          var nowIso = drives.Where(d => d.DriveType == DriveType.Removable && d.IsReady)
                              .Select(d => new DriveItemDisplay { Letter = d.Name.TrimEnd('\\').ToUpperInvariant(), Label = $"{d.Name.TrimEnd('\\')} – {Safe(d.VolumeLabel)} • {d.DriveFormat} • {(d.TotalSize / (1024*1024*1024))} GB" })
                              .ToArray();

          // UI update on dispatcher
          void UpdateUI()
          {
            try
            {
              ReplaceCollection(FormatDrives, nowFormat);
              ReplaceCollection(IsoDrives, nowIso);
            }
            catch { }
          }

          if (dispatcher != null && !dispatcher.HasThreadAccess) dispatcher.TryEnqueue(UpdateUI);
          else UpdateUI();

          await Services.LogService.UsbRefreshAsync();
        }
        catch (OperationCanceledException)
        {
          await Services.LogService.UsbRefreshCancelledAsync();
        }
        catch (Exception ex)
        {
          await Services.LogService.UsbRefreshErrorAsync(ex.Message);
        }
        finally
        {
          try { proc.PriorityClass = prevPrio; } catch { }
        }
      }
      finally
      {
        if (acquired) _gate.Release();
      }

      static string Safe(string? s) => string.IsNullOrWhiteSpace(s) ? "" : s;
    }

    private static void ReplaceCollection(ObservableCollection<DriveItemDisplay> target, DriveItemDisplay[] items)
    {
      // Patch-in-place to preserve selection and bindings
      // Remove items not present
      for (int i = target.Count - 1; i >= 0; i--)
      {
        var t = target[i];
        if (!items.Any(x => string.Equals(x.Letter, t.Letter, StringComparison.OrdinalIgnoreCase)))
          target.RemoveAt(i);
      }
      // Add or update items
      foreach (var src in items)
      {
        var existing = target.FirstOrDefault(x => string.Equals(x.Letter, src.Letter, StringComparison.OrdinalIgnoreCase));
        if (existing == null) target.Add(src);
        else
        {
          int idx = target.IndexOf(existing);
          if (idx >= 0) target[idx] = src; // simple replace to update label
        }
      }
    }

    // Smoke test trigger helper
    public async Task Internal_TriggerRefreshForSmokeTest(DispatcherQueue dispatcher)
      => await RefreshDrivesAsync(dispatcher, null, null, includeFixedForIso: false, CancellationToken.None);
  }
}

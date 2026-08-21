using System;
using FormatX.Models;

namespace FormatX.Services
{
  public sealed class MagStateService
  {
    private readonly object _gate = new();
    private MagSnapshot _snapshot = new();
    private long _sequence;

    public static MagStateService Current { get; } = new();

    private MagStateService() { }

    public event EventHandler<MagSnapshot>? SnapshotChanged;

    public MagSnapshot Snapshot
    {
      get
      {
        lock (_gate) return _snapshot;
      }
    }

    public void SetOperation(MagOperation operation, double progress, string statusText, double activity = 0.55)
      => Mutate(s => s with
      {
        Operation = operation,
        OperationProgress = Clamp01(progress),
        Activity = Clamp01(activity),
        StatusText = string.IsNullOrWhiteSpace(statusText) ? operation.ToString().ToUpperInvariant() : statusText
      });

    public void SetLicense(MagLicenseInfo license)
      => Mutate(s => s with { License = license ?? MagLicenseInfo.Unknown });

    public void SetUpdate(MagUpdateState state, double progress, string? statusText = null)
      => Mutate(s => s with
      {
        UpdateState = state,
        UpdateProgress = Clamp01(progress),
        StatusText = string.IsNullOrWhiteSpace(statusText) ? s.StatusText : statusText!,
        Operation = state switch
        {
          MagUpdateState.Downloading or MagUpdateState.ChecksumVerification or MagUpdateState.Extracting or MagUpdateState.Installing => MagOperation.Updating,
          MagUpdateState.Current or MagUpdateState.Completed => MagOperation.Idle,
          _ => s.Operation
        },
        OperationProgress = state is MagUpdateState.Current or MagUpdateState.Completed ? 0 : s.OperationProgress,
        Activity = state is MagUpdateState.Current or MagUpdateState.Completed ? 0.28 : s.Activity
      });

    public void SetIntegrity(MagIntegrityState state)
      => Mutate(s => s with { IntegrityState = state });

    public void SetSeverity(MagSeverity severity)
      => Mutate(s => s with { Severity = severity });

    public void SetRuntimePreferences(bool reducedMotion, bool energySaver)
      => Mutate(s => s with { ReducedMotion = reducedMotion, EnergySaver = energySaver });

    public void SetActivity(double activity)
      => Mutate(s => s with { Activity = Clamp01(activity) });

    public void Ready(string statusText = "SYSTEM READY")
      => Mutate(s => s with
      {
        Operation = MagOperation.Idle,
        OperationProgress = 0,
        Activity = 0.28,
        StatusText = statusText,
        Severity = MagSeverity.Normal
      });

    public void Fail(string statusText, bool critical = false)
      => Mutate(s => s with
      {
        Severity = critical ? MagSeverity.Critical : MagSeverity.Warning,
        StatusText = statusText,
        Activity = 0.4
      });

    private void Mutate(Func<MagSnapshot, MagSnapshot> mutation)
    {
      MagSnapshot next;
      lock (_gate)
      {
        next = mutation(_snapshot) with
        {
          Sequence = ++_sequence,
          Timestamp = DateTimeOffset.UtcNow
        };
        _snapshot = next;
      }

      SnapshotChanged?.Invoke(this, next);
    }

    private static double Clamp01(double value)
      => double.IsNaN(value) ? 0 : Math.Max(0, Math.Min(1, value));
  }
}

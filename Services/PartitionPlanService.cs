using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  // Sprint 1: Partition plan scaffolding with precheck/dry-run/rollback logging
  public enum PartitionOpKind { Resize, Move, Merge, Split, ConvertTable, Align4K }

  public sealed record PartitionOp(PartitionOpKind Kind, int Disk, int? Partition, long? NewSizeBytes = null, long? NewOffsetBytes = null, string? ConvertTo = null);

  public sealed record PartitionPlan(IReadOnlyList<PartitionOp> Operations)
  {
    public static PartitionPlan Empty { get; } = new(new List<PartitionOp>());
  }

  public sealed record PlanPrecheckResult(bool Ok, string Message, IReadOnlyList<string> Warnings);
  public sealed record PlanDryRunResult(string DiskPartScript, IReadOnlyList<string> Notes);

  public sealed class PartitionPlanService
  {
    public async Task<PlanPrecheckResult> PrecheckAsync(PartitionPlan plan, CancellationToken ct = default)
    {
      try
      {
        if (plan == null || plan.Operations == null || plan.Operations.Count == 0)
          return new PlanPrecheckResult(false, "Üres partícióterv.", Array.Empty<string>());

        var warns = new List<string>();
        foreach (var op in plan.Operations)
        {
          ct.ThrowIfCancellationRequested();
          // Simple sanity checks; full validation comes later (Sprint continuation)
          if (op.Kind is PartitionOpKind.Resize or PartitionOpKind.Move)
          {
            if (op.NewSizeBytes <= 0) warns.Add($"Op {op.Kind}: méret nincs megadva vagy 0.");
          }
          if (op.Kind == PartitionOpKind.ConvertTable && string.IsNullOrWhiteSpace(op.ConvertTo))
            warns.Add("MBR?GPT konverzió: cél nincs megadva.");
        }
        await LogService.LogAsync("partitions.precheck", new { count = plan.Operations.Count, warns = warns.Count });
        return new PlanPrecheckResult(true, "Precheck OK", warns);
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return new PlanPrecheckResult(false, "Megszakítva.", Array.Empty<string>()); }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return new PlanPrecheckResult(false, "Megszakítva.", Array.Empty<string>()); }
      catch (Exception ex) { await LogService.LogAsync("partitions.precheck.error", new { ex = ex.Message }); return new PlanPrecheckResult(false, ex.Message, Array.Empty<string>()); }
    }

    public async Task<PlanDryRunResult> DryRunAsync(PartitionPlan plan, CancellationToken ct = default)
    {
      try
      {
        var sb = new StringBuilder();
        var notes = new List<string>();
        foreach (var g in plan.Operations.GroupBy(p => p.Disk))
        {
          ct.ThrowIfCancellationRequested();
          sb.AppendLine($"select disk {g.Key}");
          sb.AppendLine("detail disk");
          foreach (var op in g)
          {
            switch (op.Kind)
            {
              case PartitionOpKind.ConvertTable:
                sb.AppendLine(op.ConvertTo?.Equals("gpt", StringComparison.OrdinalIgnoreCase) == true ? "convert gpt" : "convert mbr");
                break;
              case PartitionOpKind.Align4K:
                notes.Add("4K align: végrehajtási logika késõbbi sprintben; itt csak jegyzet.");
                break;
              case PartitionOpKind.Resize:
                notes.Add($"Resize p{op.Partition} ? {op.NewSizeBytes} B (elõnézet)");
                break;
              case PartitionOpKind.Move:
                notes.Add($"Move p{op.Partition} ? offset {op.NewOffsetBytes} (elõnézet)");
                break;
              case PartitionOpKind.Merge:
                notes.Add("Merge: elõnézet – végrehajtás késõbb");
                break;
              case PartitionOpKind.Split:
                notes.Add("Split: elõnézet – végrehajtás késõbb");
                break;
            }
          }
        }
        var script = sb.ToString();
        await LogService.LogAsync("partitions.dryrun", new { lines = script.Split('\n').Length });
        return new PlanDryRunResult(script, notes);
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return new PlanDryRunResult(string.Empty, Array.Empty<string>()); }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return new PlanDryRunResult(string.Empty, Array.Empty<string>()); }
      catch (Exception ex) { await LogService.LogAsync("partitions.dryrun.error", new { ex = ex.Message }); return new PlanDryRunResult(string.Empty, new[] { ex.Message }); }
    }

    public async Task<bool> ExecuteAsync(PartitionPlan plan, bool createRollbackSnapshot, CancellationToken ct = default)
    {
      try
      {
        // Snapshot current layout for rollback – already partly implemented in UI flows
        await LogService.LogAsync("partitions.exec.begin", new { count = plan.Operations.Count, rollback = createRollbackSnapshot });
        // For Sprint 1, execution uses DiskPart script from DryRun as placeholder
        var dry = await DryRunAsync(plan, ct);
        if (string.IsNullOrWhiteSpace(dry.DiskPartScript)) return false;
        await LogService.LogAsync("partitions.exec.script", new { script = dry.DiskPartScript });
        // Delegate to existing DiskPartService (referenced elsewhere)
        await new DiskPartService().RunScriptAsync(dry.DiskPartScript);
        await LogService.LogAsync("partitions.exec.done", new { });
        return true;
      }
      catch (TaskCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (OperationCanceledException) { await LogService.UsbRefreshCancelledAsync(); return false; }
      catch (Exception ex) { await LogService.LogAsync("partitions.exec.error", new { ex = ex.Message }); return false; }
    }
  }
}

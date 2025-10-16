using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace FormatX.Services
{
  // Sprint 1 – Partition manager scaffold with precheck + dry-run + rollback
  public sealed class PartitionService
  {
    private readonly PartitionPlanService _plan = new();

    private static string Sanitize(string? s)
      => (s ?? string.Empty).Replace('\r', ' ').Replace('\n', ' ').Trim();

    // High-level helpers to build a plan for common ops ======================
    public PartitionPlan BuildResizePlan(int disk, int partition, long newSizeBytes)
      => new(new[] { new PartitionOp(PartitionOpKind.Resize, disk, partition, NewSizeBytes: newSizeBytes) });

    public PartitionPlan BuildMovePlan(int disk, int partition, long newOffsetBytes)
      => new(new[] { new PartitionOp(PartitionOpKind.Move, disk, partition, NewOffsetBytes: newOffsetBytes) });

    public PartitionPlan BuildConvertPlan(int disk, bool toGpt)
      => new(new[] { new PartitionOp(PartitionOpKind.ConvertTable, disk, null, ConvertTo: (toGpt ? "gpt" : "mbr")) });

    public PartitionPlan BuildMergePlan(int disk, params int[] partitions)
    {
      var ops = new List<PartitionOp>();
      foreach (var p in partitions) ops.Add(new PartitionOp(PartitionOpKind.Merge, disk, p));
      return new PartitionPlan(ops);
    }

    public PartitionPlan BuildSplitPlan(int disk, int partition, long firstSizeBytes)
      => new(new[] { new PartitionOp(PartitionOpKind.Split, disk, partition, NewSizeBytes: firstSizeBytes) });

    public PartitionPlan BuildAlign4KPlan(int disk, params int[] partitions)
    {
      var ops = new List<PartitionOp>();
      foreach (var p in partitions) ops.Add(new PartitionOp(PartitionOpKind.Align4K, disk, p));
      return new PartitionPlan(ops);
    }

    // Core lifecycle: Precheck -> DryRun -> Execute -> Rollback ==============
    public async Task<PlanPrecheckResult> PrecheckAsync(PartitionPlan plan, CancellationToken ct = default)
    {
      try
      {
        var res = await _plan.PrecheckAsync(plan, ct);
        try { await LogService.WriteUsbLineAsync($"usb.partition.precheck:{(res.Ok ? "ok" : "fail")}"); } catch { }
        try { await LogService.LogAsync("partition.precheck", new { ok = res.Ok, msg = res.Message, warns = res.Warnings }); } catch { }
        return res;
      }
      catch (TaskCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } return new PlanPrecheckResult(false, "canceled", Array.Empty<string>()); }
      catch (OperationCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } return new PlanPrecheckResult(false, "canceled", Array.Empty<string>()); }
      catch (COMException cex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.Precheck", cex); } catch { } return new PlanPrecheckResult(false, Sanitize(cex.Message), Array.Empty<string>()); }
      catch (InvalidOperationException ioex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.Precheck", ioex); } catch { } return new PlanPrecheckResult(false, Sanitize(ioex.Message), Array.Empty<string>()); }
      catch (Exception ex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.Precheck", ex); } catch { } return new PlanPrecheckResult(false, Sanitize(ex.Message), Array.Empty<string>()); }
    }

    public async Task<PlanDryRunResult> DryRunAsync(PartitionPlan plan, CancellationToken ct = default)
    {
      try
      {
        var res = await _plan.DryRunAsync(plan, ct);
        try { await LogService.WriteUsbLineAsync("usb.partition.dryrun"); } catch { }
        try { await LogService.LogAsync("partition.dryrun", new { script = res.DiskPartScript, notes = res.Notes }); } catch { }
        return res;
      }
      catch (TaskCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } return new PlanDryRunResult(string.Empty, Array.Empty<string>()); }
      catch (OperationCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } return new PlanDryRunResult(string.Empty, Array.Empty<string>()); }
      catch (COMException cex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.DryRun", cex); } catch { } return new PlanDryRunResult(string.Empty, new [] { Sanitize(cex.Message) }); }
      catch (InvalidOperationException ioex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.DryRun", ioex); } catch { } return new PlanDryRunResult(string.Empty, new [] { Sanitize(ioex.Message) }); }
      catch (Exception ex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.DryRun", ex); } catch { } return new PlanDryRunResult(string.Empty, new [] { Sanitize(ex.Message) }); }
    }

    public async Task<bool> ExecuteAsync(PartitionPlan plan, bool snapshotRollback = true, CancellationToken ct = default)
    {
      try
      {
        try { await LogService.WriteUsbLineAsync("usb.partition.execute.begin"); } catch { }
        var ok = await _plan.ExecuteAsync(plan, snapshotRollback, ct);
        try { await LogService.WriteUsbLineAsync(ok ? "usb.partition.execute.ok" : "usb.partition.execute.fail"); } catch { }
        try { await LogService.LogAsync("partition.execute", new { ok }); } catch { }
        return ok;
      }
      catch (TaskCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } return false; }
      catch (OperationCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } return false; }
      catch (COMException cex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.Execute", cex); } catch { } return false; }
      catch (InvalidOperationException ioex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.Execute", ioex); } catch { } return false; }
      catch (Exception ex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.Execute", ex); } catch { } return false; }
    }

    public async Task<bool> RollbackAsync(int disk, CancellationToken ct = default)
    {
      try
      {
        var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "rollback");
        if (!Directory.Exists(dir)) { try { await LogService.WriteUsbLineAsync("usb.partition.rollback.none"); } catch { } return false; }
        var last = Directory.EnumerateFiles(dir, $"disk_{disk}_*.json").OrderByDescending(f => f).FirstOrDefault();
        if (string.IsNullOrWhiteSpace(last)) { try { await LogService.WriteUsbLineAsync("usb.partition.rollback.none"); } catch { } return false; }
        // Placeholder rollback: clean + convert gpt (assume GPT; real impl should reconstruct exact state)
        var sb = new StringBuilder();
        sb.AppendLine($"select disk {disk}");
        sb.AppendLine("clean");
        sb.AppendLine("convert gpt");
        await new DiskPartService().RunScriptAsync(sb.ToString());
        try { await LogService.WriteUsbLineAsync("usb.partition.rollback.ok"); } catch { }
        try { await LogService.LogAsync("partition.rollback", new { disk, file = last }); } catch { }
        return true;
      }
      catch (TaskCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } return false; }
      catch (OperationCanceledException) { try { await LogService.UsbRefreshCancelledAsync(); } catch { } return false; }
      catch (COMException cex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.Rollback", cex); } catch { } return false; }
      catch (InvalidOperationException ioex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.Rollback", ioex); } catch { } return false; }
      catch (Exception ex) { try { await LogService.LogUsbWinrtErrorAsync("PartitionService.Rollback", ex); } catch { } return false; }
    }
  }
}

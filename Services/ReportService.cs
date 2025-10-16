using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace FormatX.Services
{
  public static class ReportService
  {
    private static (string App, string Version) GetAppInfo()
    {
      try
      {
        var asm = typeof(ReportService).Assembly;
        var ver = asm.GetName().Version?.ToString() ?? "1.0.0";
        return ("FormatX", ver);
      } catch { return ("FormatX", "1.0.0"); }
    }

    public static async Task<(string Csv, string Pdf)> GenerateFromLogAsync(string outDir)
    {
      Directory.CreateDirectory(outDir);
      var csv = Path.Combine(outDir, $"report_{DateTimeOffset.Now:yyyyMMdd_HHmmss}.csv");
      var pdf = Path.Combine(outDir, $"report_{DateTimeOffset.Now:yyyyMMdd_HHmmss}.pdf");
      // Build a summarized SanitizeReport-like placeholder from events
      var sr = await BuildSanitizeLikeAsync();
      await GenerateCsvAsync(csv, sr);
      await GeneratePdfAsync(pdf, sr);
      return (csv, pdf);
    }

    private static async Task<SanitizeReport> BuildSanitizeLikeAsync()
    {
      var logDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "logs");
      var jsonl = Path.Combine(logDir, "events.jsonl");
      var machine = Environment.MachineName;
      var user = Environment.UserName;
      string mode = "mixed"; string hash = "-"; bool verify = true; string details = "events";
      if (!File.Exists(jsonl))
        return new SanitizeReport(DateTimeOffset.Now.ToString("o"), machine, user, hash, mode, verify, details);

      string[] lines = await File.ReadAllLinesAsync(jsonl, Encoding.UTF8);
      // very small summarize
      var cats = new[] { "partition", "sanitize", "image", "iso", "automation", "diagnostics", "clone", "installer" };
      var found = cats.Where(c => lines.Any(ln => ln.Contains(c, StringComparison.OrdinalIgnoreCase))).ToArray();
      mode = string.Join("+", found);
      verify = !lines.Any(ln => ln.Contains("error", StringComparison.OrdinalIgnoreCase));
      details = $"events: {lines.Length}";
      hash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(Encoding.UTF8.GetBytes(string.Join("\n", lines)))).Substring(0,16);
      return new SanitizeReport(DateTimeOffset.Now.ToString("o"), machine, user, hash, mode, verify, details);
    }

    public static async Task GenerateCsvAsync(string path, SanitizeReport report)
    {
      Directory.CreateDirectory(Path.GetDirectoryName(path)!);
      var sb = new StringBuilder();
      sb.AppendLine("timestamp,machine,user,hash,mode,verify_ok,details");
      sb.AppendLine(string.Join(',',
        Escape(report.Timestamp),
        Escape(report.Machine),
        Escape(report.User),
        Escape(report.Hash),
        Escape(report.Mode),
        report.VerifyOk ? "true" : "false",
        Escape(report.Details)));
      await File.WriteAllTextAsync(path, sb.ToString(), new UTF8Encoding(false));
      try { await LogService.LogAsync("report.csv", new { path }); } catch { }
    }

    public static async Task GeneratePdfAsync(string path, SanitizeReport report)
    {
      Directory.CreateDirectory(Path.GetDirectoryName(path)!);
      var (app, ver) = GetAppInfo();
      string build = TryGitHash();
      string timestamp = report.Timestamp;

      Document.Create(container =>
      {
        container.Page(page =>
        {
          page.Margin(36);
          page.Header().Row(row =>
          {
            row.RelativeItem().Column(col =>
            {
              col.Item().Text(app).SemiBold().FontSize(16);
              col.Item().Text($"Verzió: {ver} • Build: {build}").FontSize(10);
              col.Item().Text($"Idõ: {timestamp}").FontSize(10);
            });
          });

          page.Content().Column(col =>
          {
            col.Spacing(8);
            col.Item().Border(1).Padding(8).Column(sum =>
            {
              sum.Spacing(4);
              sum.Item().Text("Összegzés").Bold();
              sum.Item().Text($"Mód: {report.Mode}");
              sum.Item().Text($"Verify: {(report.VerifyOk?"OK":"FAIL")}");
              sum.Item().Text($"Hash: {report.Hash}");
              sum.Item().Text($"Gép: {report.Machine} • Felhasználó: {report.User}");
            });

            // Events table from events.jsonl (subset for PDF)
            col.Item().Element(e =>
            {
              var logDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "logs");
              var jsonl = Path.Combine(logDir, "events.jsonl");
              var rows = File.Exists(jsonl) ? File.ReadLines(jsonl).Take(300).Select(ParseEventRow).ToList() : new System.Collections.Generic.List<(string,string,string,string,string)>();
              e.Table(t =>
              {
                t.ColumnsDefinition(c => { c.RelativeColumn(2); c.RelativeColumn(2); c.RelativeColumn(2); c.RelativeColumn(2); c.RelativeColumn(6); });
                t.Header(h => { h.Cell().Text("Idõ"); h.Cell().Text("Mûvelet"); h.Cell().Text("Objektum"); h.Cell().Text("Eredmény"); h.Cell().Text("Részletek"); });
                foreach (var r in rows)
                {
                  t.Cell().Text(r.Item1);
                  t.Cell().Text(r.Item2);
                  t.Cell().Text(r.Item3);
                  t.Cell().Text(r.Item4);
                  t.Cell().Text(r.Item5);
                }
              });
            });
          });

          page.Footer().AlignCenter().Text("FormatX riport").FontSize(10).Light();
        });
      }).GeneratePdf(path);

      await LogService.LogAsync("report.pdf", new { path });

      static (string, string, string, string, string) ParseEventRow(string ln)
      {
        try
        {
          using var doc = JsonDocument.Parse(ln);
          var root = doc.RootElement;
          string ts = root.GetProperty("ts").GetString() ?? string.Empty;
          string kind = root.GetProperty("kind").GetString() ?? string.Empty;
          string device = "-";
          string result = kind.Contains("error", StringComparison.OrdinalIgnoreCase) ? "error" : "ok";
          string details = root.TryGetProperty("data", out var vd) ? vd.GetRawText() : string.Empty;
          return (ts, kind, device, result, details);
        }
        catch { return ("", "", "", "", ""); }
      }
      static string TryGitHash()
      {
        try
        {
          var gitDir = AppContext.BaseDirectory;
          return System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
          {
            FileName = "git",
            Arguments = "rev-parse --short HEAD",
            WorkingDirectory = gitDir,
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true
          })?.StandardOutput.ReadLine() ?? "-";
        } catch { return "-"; }
      }
    }

    private static string Escape(string s)
      => "\"" + (s ?? string.Empty).Replace("\"", "\"\"") + "\"";
  }
}

using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace FormatX.Services
{
  public static class LogService
  {
    private static readonly string LogDir =
      Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "logs");
    private static readonly string JsonlPath = Path.Combine(LogDir, "events.jsonl");

    public static async Task LogAsync(string kind, object data)
    {
      try
      {
        Directory.CreateDirectory(LogDir);
        var rec = new
        {
          ts = DateTimeOffset.Now.ToString("o"),
          user = Environment.UserName,
          kind,
          data
        };
        string line = JsonSerializer.Serialize(rec) + Environment.NewLine;
        await File.AppendAllTextAsync(JsonlPath, line, Encoding.UTF8);
      }
      catch { /* best-effort */ }
    }

    public static Task LogAsync(string kind, Exception ex)
      => LogAsync(kind, new { type = ex.GetType().FullName, ex.Message, ex.HResult, stack = ex.StackTrace });

    public static async Task<string> ExportCsvAsync(string destCsv)
    {
      try
      {
        if (!File.Exists(JsonlPath)) return "Nincs napló.";
        var lines = await File.ReadAllLinesAsync(JsonlPath, Encoding.UTF8);
        using var sw = new StreamWriter(destCsv, false, new UTF8Encoding(false));
        await sw.WriteLineAsync("ts,user,kind,json");
        foreach (var ln in lines)
        {
          await sw.WriteLineAsync($"\"{ln.Replace("\"","\"\"")}\"");
        }
        await LogAsync("export.csv.legacy", new { file = destCsv, count = lines.Length });
        return "CSV export kész: " + destCsv;
      }
      catch (Exception ex) { return ex.Message; }
    }

    public static async Task<string> ExportParsedCsvAsync(string destCsv)
    {
      try
      {
        if (!File.Exists(JsonlPath)) return "Nincs napló.";
        Directory.CreateDirectory(Path.GetDirectoryName(destCsv)!);
        var lines = await File.ReadAllLinesAsync(JsonlPath, Encoding.UTF8);
        using var sw = new StreamWriter(destCsv, false, new UTF8Encoding(false));
        await sw.WriteLineAsync("timestamp,user,kind,data");
        int ok = 0; int fail = 0;
        foreach (var ln in lines)
        {
          if (string.IsNullOrWhiteSpace(ln)) continue;
          try
          {
            using var doc = JsonDocument.Parse(ln);
            var root = doc.RootElement;
            string ts = root.TryGetProperty("ts", out var vts) ? vts.GetString() ?? string.Empty : string.Empty;
            string user = root.TryGetProperty("user", out var vu) ? vu.GetString() ?? string.Empty : string.Empty;
            string kind = root.TryGetProperty("kind", out var vk) ? vk.GetString() ?? string.Empty : string.Empty;
            string data = root.TryGetProperty("data", out var vd) ? vd.GetRawText() : string.Empty;
            string esc(string s) => "\"" + (s ?? string.Empty).Replace("\"", "\"\"") + "\"";
            await sw.WriteLineAsync(string.Join(",", new[] { esc(ts), esc(user), esc(kind), esc(data) }));
            ok++;
          }
          catch { fail++; }
        }
        await LogAsync("export.csv.parsed", new { file = destCsv, ok, fail });
        return $"CSV export kész: {destCsv} (sorok: {ok}, hibás: {fail})";
      }
      catch (Exception ex)
      {
        await LogAsync("export.csv.parsed.error", new { file = destCsv, error = ex.Message });
        return ex.Message;
      }
    }

    public static async Task<string> ExportHtmlAsync(string destHtml)
    {
      try
      {
        if (!File.Exists(JsonlPath)) return "Nincs napló.";
        Directory.CreateDirectory(Path.GetDirectoryName(destHtml)!);
        var lines = await File.ReadAllLinesAsync(JsonlPath, Encoding.UTF8);

        static string HtmlEncode(string s)
          => (s ?? string.Empty)
              .Replace("&", "&amp;")
              .Replace("<", "&lt;")
              .Replace(">", "&gt;")
              .Replace("\"", "&quot;")
              .Replace("'", "&#39;");

        var sb = new StringBuilder();
        sb.AppendLine("<!doctype html><html lang=\"hu\"><head><meta charset=\"utf-8\">");
        sb.AppendLine("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">");
        sb.AppendLine("<title>FormatX napló</title>");
        sb.AppendLine("<style>body{background:#0b0f17;color:#e5e7eb;font-family:Segoe UI,SegoeUI,Helvetica,Arial,sans-serif;margin:16px}" +
                      "table{width:100%;border-collapse:collapse;margin-top:12px}" +
                      "th,td{border:1px solid #22304a;padding:8px 10px;font-size:14px}" +
                      "th{position:sticky;top:0;background:#111827}" +
                      "input{background:#0f172a;border:1px solid #334155;color:#e5e7eb;padding:6px 8px;border-radius:6px;width:100%}" +
                      "tr:nth-child(even){background:#0f172a}" +
                      "tr:nth-child(odd){background:#0b1220}" +
                      "caption{font-weight:600;text-align:left}") ;
        sb.AppendLine("</style>");
        sb.AppendLine("<script>function f(){var q=document.getElementById('q').value.toLowerCase();var rows=document.querySelectorAll('tbody tr');rows.forEach(function(r){var t=r.innerText.toLowerCase();r.style.display=t.indexOf(q)>=0?'':'none';});}</script>");
        sb.AppendLine("</head><body>");
        sb.AppendLine("<h2>FormatX napló</h2><input id=\"q\" placeholder=\"Szűrés...\" oninput=\"f()\">");
        sb.AppendLine("<table><thead><tr><th>timestamp</th><th>user</th><th>kind</th><th>data</th></tr></thead><tbody>");

        int ok = 0; int fail = 0;
        foreach (var ln in lines)
        {
          if (string.IsNullOrWhiteSpace(ln)) continue;
          try
          {
            using var doc = JsonDocument.Parse(ln);
            var root = doc.RootElement;
            string ts = root.TryGetProperty("ts", out var vts) ? vts.GetString() ?? string.Empty : string.Empty;
            string user = root.TryGetProperty("user", out var vu) ? vu.GetString() ?? string.Empty : string.Empty;
            string kind = root.TryGetProperty("kind", out var vk) ? vk.GetString() ?? string.Empty : string.Empty;
            string data = root.TryGetProperty("data", out var vd) ? vd.GetRawText() : string.Empty;
            sb.Append("<tr><td>").Append(HtmlEncode(ts)).Append("</td><td>")
              .Append(HtmlEncode(user)).Append("</td><td>")
              .Append(HtmlEncode(kind)).Append("</td><td><pre style=\"margin:0;white-space:pre-wrap;word-break:break-word\">")
              .Append(HtmlEncode(data)).Append("</pre></td></tr>\n");
            ok++;
          }
          catch { fail++; }
        }
        sb.AppendLine("</tbody></table></body></html>");

        await File.WriteAllTextAsync(destHtml, sb.ToString(), new UTF8Encoding(false));
        await LogAsync("export.html", new { file = destHtml, ok, fail });
        return $"HTML export kész: {destHtml} (sorok: {ok}, hibás: {fail})";
      }
      catch (Exception ex)
      {
        await LogAsync("export.html.error", new { file = destHtml, error = ex.Message });
        return ex.Message;
      }
    }
  }
}

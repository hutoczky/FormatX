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
        return "CSV export kész: " + destCsv;
      }
      catch (Exception ex) { return ex.Message; }
    }
  }
}

using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.System;

using System.Security.Cryptography;
using FormatX.Services; // for LogService self-reference when logging
namespace FormatX.Services
{
  public sealed class UpdateService
  {
    private static string ComputeSHA256(string path)
    {
      using var fs = File.OpenRead(path);
      using var sha = SHA256.Create();
      var hash = sha.ComputeHash(fs);
      return string.Concat(Array.ConvertAll(hash, b => b.ToString("x2")));
    }

    private const string ReleasesUrl = "https://github.com/hutoczky/formatui/releases";

    private static (int major, int minor, int patch)? ParseVersion(ReadOnlySpan<char> s)
    {
      try
      {
        var m = Regex.Match(s.ToString(), @"v?(\d+)\.(\d+)\.(\d+)");
        if (!m.Success) return null;
        return (int.Parse(m.Groups[1].Value), int.Parse(m.Groups[2].Value), int.Parse(m.Groups[3].Value));
      }
      catch { return null; }
    }

    private static int Cmp((int,int,int) a, (int,int,int) b)
      => a.Item1!=b.Item1 ? a.Item1.CompareTo(b.Item1)
       : (a.Item2!=b.Item2 ? a.Item2.CompareTo(b.Item2)
       :  a.Item3.CompareTo(b.Item3));

    private static string? FindBestAssetUrlForNewer(string html, (int,int,int) minVersion)
    {
      var rx = new Regex(@"href=""(/hutoczky/formatui/releases/download/[^""]+)""", RegexOptions.IgnoreCase);
      var links = rx.Matches(html).Select(m => m.Groups[1].Value).ToList();
      var candidates = links
        .Select(l => new { Link = l, Ver = ParseVersion(l.AsSpan()) })
        .Where(x => x.Ver.HasValue && Cmp(x.Ver.Value, minVersion) >= 0)
        .Select(x => x.Link)
        .ToList();
      if (candidates.Count == 0) return null;

      string[] exts = new[] { ".msixbundle", ".msix", ".appinstaller", ".zip" };
      foreach (var ext in exts)
      {
        var hit = candidates.FirstOrDefault(l => l.EndsWith(ext, StringComparison.OrdinalIgnoreCase));
        if (hit != null) return "https://github.com" + hit;
      }
      return "https://github.com" + candidates.First();
    }

    public async Task<string> CheckAndUpdateAsync(Action<int,string>? progress = null, CancellationToken ct = default)
    {
      progress ??= (_ , __) => { };
      using var http = new HttpClient();
      http.DefaultRequestHeaders.UserAgent.ParseAdd("FormatX-Updater/1.0 (+Windows)");

      string html = await http.GetStringAsync(ReleasesUrl, ct);
      var assetUrl = FindBestAssetUrlForNewer(html, (1,1,0));
      if (assetUrl is null)
        return "Nincs új frissítés.";

      var updatesFolder = await ApplicationData.Current.LocalFolder.CreateFolderAsync("Updates", CreationCollisionOption.OpenIfExists);
      var fileName = Path.GetFileName(new Uri(assetUrl).LocalPath);
      var destPath = Path.Combine(updatesFolder.Path, fileName);

      progress(1, "Letöltés indul...");
      try
      {
        using (var msg = await http.GetAsync(assetUrl, HttpCompletionOption.ResponseHeadersRead, ct))
        {
          msg.EnsureSuccessStatusCode();
          var total = msg.Content.Headers.ContentLength ?? -1L;
          using var src = await msg.Content.ReadAsStreamAsync(ct);
          using var dst = File.Create(destPath);
          var buffer = new byte[81920];
          long done = 0;
          while (true)
          {
            int read = await src.ReadAsync(buffer.AsMemory(0, buffer.Length), ct);
            if (read == 0) break;
            await dst.WriteAsync(buffer.AsMemory(0, read), ct);
            done += read;
            if (total > 0)
            {
              int p = (int)(done * 100 / total);
              progress(p, $"Letöltés: {p}%");
            }
          }
        }
      }
      catch (System.IO.IOException ioex) { await LogService.LogAsync("error.io.exception", ioex); return ioex.Message; }
      catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogAsync("error.com.exception", cex); return cex.Message; }
      catch (Exception ex) { await LogService.LogAsync("error.catch", new { ctx = "update.download", ex = ex.Message }); return ex.Message; }
      progress(96, "Letöltés kész. SHA-256 ellenőrzés...");
      try
      {
        // Keressük a sha256-et a release oldalon, ha van
        string htmlForHash = html;
        var rxsha = new Regex(@"sha256\s*[:=]\s*([a-f0-9]{64})", RegexOptions.IgnoreCase);
        var m = rxsha.Match(htmlForHash);
        if (m.Success)
        {
          string expect = m.Groups[1].Value.ToLowerInvariant();
          string actual = ComputeSHA256(destPath).ToLowerInvariant();
          if (expect != actual)
            return $"Letöltve: {destPath}\nHASH eltérés! Várt: {expect}\nKapott: {actual}";
        }
      }
      catch (System.IO.IOException ioex) { await LogService.LogAsync("error.io.exception", ioex); }
      catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogAsync("error.com.exception", cex); }
      catch (System.Exception ex) { await LogService.LogAsync("update.hash.error", new { ex = ex.Message }); }
      progress(100, "Ellenőrizve. Telepítő indítása...");
      try
      {
        var file = await StorageFile.GetFileFromPathAsync(destPath);
        await Launcher.LaunchFileAsync(file);
        return "Frissítés letöltve és indítva.";
      }
      catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogAsync("error.com.exception", cex); return "Letöltve: " + destPath + Environment.NewLine + cex.Message; }
      catch (System.IO.IOException ioex) { await LogService.LogAsync("error.io.exception", ioex); return "Letöltve: " + destPath + Environment.NewLine + ioex.Message; }
      catch (Exception ex)
      {
        await LogService.LogAsync("error.catch", new { ctx = "update.launch", ex = ex.Message });
        return "Letöltve: " + destPath + Environment.NewLine + "Indítás sikertelen: " + ex.Message;
      }
    }
  }
}
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.Json;

namespace FormatX.Services
{
  internal enum UpdateFailureKind
  {
    Download,
    Checksum,
    Extraction,
    Launch
  }

  internal sealed class UpdateStageException : Exception
  {
    internal UpdateStageException(UpdateFailureKind kind, string message, Exception? innerException = null)
      : base(message, innerException)
    {
      Kind = kind;
    }

    internal UpdateFailureKind Kind { get; }
  }

  internal sealed record UpdateReleaseSelection(
    string Tag,
    string AssetName,
    string AssetUrl,
    string? EmbeddedChecksum,
    string? ChecksumAssetUrl);

  internal static class UpdateSecurity
  {
    internal const string CanonicalReleaseApiUrl = "https://api.github.com/repos/hutoczky/FormatX-Updates/releases/latest";
    internal const string CanonicalDownloadPrefix = "https://github.com/hutoczky/FormatX-Updates/releases/download/";

    private sealed record AssetMeta(string Name, string Url, string? Digest);

    internal static UpdateReleaseSelection? SelectReleaseFromMetadata(string json)
    {
      using var doc = JsonDocument.Parse(json);
      var root = doc.RootElement;

      if ((root.TryGetProperty("draft", out var draft) && draft.GetBoolean()) ||
          (root.TryGetProperty("prerelease", out var prerelease) && prerelease.GetBoolean()))
      {
        return null;
      }

      string tag = root.TryGetProperty("tag_name", out var tagProp) ? (tagProp.GetString() ?? string.Empty).Trim() : string.Empty;
      if (string.IsNullOrWhiteSpace(tag))
      {
        return null;
      }

      string expectedZipName = $"FormatX-Suite-Pro-{NormalizeTag(tag)}.zip";

      var assets = ReadTrustedAssets(root).ToList();
      var selectedZip = assets.FirstOrDefault(a => string.Equals(a.Name, expectedZipName, StringComparison.OrdinalIgnoreCase))
        ?? assets.FirstOrDefault(a => a.Name.EndsWith(".zip", StringComparison.OrdinalIgnoreCase));
      if (selectedZip is null)
      {
        return null;
      }

      string? embeddedChecksum = ExtractDigestChecksum(selectedZip.Digest);
      string? checksumAssetUrl = assets
        .Where(a => a.Name.EndsWith(".sha256", StringComparison.OrdinalIgnoreCase))
        .Where(a =>
          string.Equals(a.Name, selectedZip.Name + ".sha256", StringComparison.OrdinalIgnoreCase) ||
          string.Equals(a.Name, Path.GetFileNameWithoutExtension(selectedZip.Name) + ".sha256", StringComparison.OrdinalIgnoreCase) ||
          string.Equals(a.Name, "checksums.txt", StringComparison.OrdinalIgnoreCase))
        .Select(a => a.Url)
        .FirstOrDefault();

      if (embeddedChecksum is null && checksumAssetUrl is null)
      {
        throw new UpdateStageException(
          UpdateFailureKind.Checksum,
          "A kiadáshoz nem található publikus SHA-256 metaadat vagy .sha256 ellenőrző fájl.");
      }

      return new UpdateReleaseSelection(tag, selectedZip.Name, selectedZip.Url, embeddedChecksum, checksumAssetUrl);
    }

    internal static string ResolveExpectedChecksum(string checksumText, string assetName)
    {
      if (TryGetSha256(checksumText, out var exact))
      {
        return exact;
      }

      foreach (var rawLine in checksumText.Split('\n'))
      {
        string line = rawLine.Trim();
        if (line.Length == 0) continue;

        var parts = line.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) continue;

        if (!IsSha256(parts[0])) continue;

        if (parts.Length == 1)
        {
          return parts[0].ToLowerInvariant();
        }

        string fileToken = parts[^1].Trim().TrimStart('*');
        if (string.Equals(fileToken, assetName, StringComparison.OrdinalIgnoreCase))
        {
          return parts[0].ToLowerInvariant();
        }
      }

      throw new UpdateStageException(UpdateFailureKind.Checksum, $"A checksum fájl nem tartalmaz SHA-256 értéket ehhez: {assetName}");
    }

    internal static string ResolveExtractionDirectory(string updatesRootPath, string releaseTag)
    {
      string safeTag = string.Concat(releaseTag.Where(ch => char.IsLetterOrDigit(ch) || ch == '.' || ch == '_' || ch == '-'));
      if (safeTag.Length == 0) safeTag = "latest";
      string candidate = Path.Combine(updatesRootPath, "extracted", safeTag + "-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture));
      return EnsurePathUnderRoot(updatesRootPath, candidate);
    }

    internal static IReadOnlyList<string> ExtractZipSecurely(string zipPath, string destinationDirectory)
    {
      Directory.CreateDirectory(destinationDirectory);
      var launchCandidates = new List<string>();
      string destinationRoot = Path.GetFullPath(destinationDirectory);
      if (!destinationRoot.EndsWith(Path.DirectorySeparatorChar.ToString(), StringComparison.Ordinal))
      {
        destinationRoot += Path.DirectorySeparatorChar;
      }

      using var archive = ZipFile.OpenRead(zipPath);
      foreach (var entry in archive.Entries)
      {
        string destinationPath = EnsurePathUnderRoot(destinationRoot, Path.Combine(destinationRoot, entry.FullName));

        if (string.IsNullOrEmpty(entry.Name))
        {
          Directory.CreateDirectory(destinationPath);
          continue;
        }

        Directory.CreateDirectory(Path.GetDirectoryName(destinationPath)!);
        using var source = entry.Open();
        using var target = File.Create(destinationPath);
        source.CopyTo(target);

        if (destinationPath.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
        {
          launchCandidates.Add(destinationPath);
        }
      }

      return launchCandidates;
    }

    internal static string SelectExecutableToLaunch(IReadOnlyList<string> extractedExecutables, string extractionRootPath)
    {
      var preferred = extractedExecutables.FirstOrDefault(path =>
        string.Equals(Path.GetFileName(path), "FormatX.exe", StringComparison.OrdinalIgnoreCase));
      var chosen = preferred ?? extractedExecutables.FirstOrDefault();
      if (chosen is null)
      {
        throw new UpdateStageException(UpdateFailureKind.Extraction, "A ZIP csomag nem tartalmaz futtatható .exe fájlt.");
      }

      return EnsurePathUnderRoot(extractionRootPath, chosen);
    }

    internal static bool IsWindowsDefenderBlocked(Exception ex)
    {
      for (Exception? current = ex; current is not null; current = current.InnerException)
      {
        if (current.HResult == unchecked((int)0x800700E1))
        {
          return true;
        }

        if (current is Win32Exception win32 && win32.NativeErrorCode == 225)
        {
          return true;
        }

        string message = current.Message ?? string.Empty;
        if (message.IndexOf("ERROR_VIRUS_INFECTED", StringComparison.OrdinalIgnoreCase) >= 0 ||
            message.IndexOf("0x800700E1", StringComparison.OrdinalIgnoreCase) >= 0)
        {
          return true;
        }
      }

      return false;
    }

    internal static string BuildFailureMessage(UpdateFailureKind kind, Exception ex)
    {
      if (kind == UpdateFailureKind.Launch && IsWindowsDefenderBlocked(ex))
      {
        return "A frissítést a Windows biztonsági ellenőrzés blokkolta (ERROR_VIRUS_INFECTED / 225). " +
               "Ellenőrizd, hogy a hivatalos, aláírt kiadást töltötted le a hutoczky/FormatX-Updates tárolóból, majd próbáld újra.";
      }

      return kind switch
      {
        UpdateFailureKind.Download =>
          "Frissítési letöltési hiba: " + ex.Message + Environment.NewLine +
          "Ellenőrizd az internetkapcsolatot és hogy a hutoczky/FormatX-Updates kiadás elérhető.",
        UpdateFailureKind.Checksum =>
          "A frissítés SHA-256 ellenőrzése sikertelen: " + ex.Message + Environment.NewLine +
          "A csomag biztonsági okból nem kerül elindításra.",
        UpdateFailureKind.Extraction =>
          "A frissítőcsomag kicsomagolása sikertelen: " + ex.Message + Environment.NewLine +
          "Csak hivatalos, ZIP formátumú csomag támogatott.",
        _ =>
          "A frissítő indítása sikertelen: " + ex.Message
      };
    }

    internal static string EnsurePathUnderRoot(string rootPath, string candidatePath)
    {
      string fullRoot = Path.GetFullPath(rootPath);
      if (!fullRoot.EndsWith(Path.DirectorySeparatorChar.ToString(), StringComparison.Ordinal))
      {
        fullRoot += Path.DirectorySeparatorChar;
      }

      string fullCandidate = Path.GetFullPath(candidatePath);
      if (!fullCandidate.StartsWith(fullRoot, StringComparison.OrdinalIgnoreCase))
      {
        throw new UpdateStageException(UpdateFailureKind.Extraction, "Érvénytelen archívum útvonal (path traversal).");
      }

      return fullCandidate;
    }

    private static IEnumerable<AssetMeta> ReadTrustedAssets(JsonElement root)
    {
      if (!root.TryGetProperty("assets", out var assetsProp) || assetsProp.ValueKind != JsonValueKind.Array)
      {
        yield break;
      }

      foreach (var asset in assetsProp.EnumerateArray())
      {
        string name = asset.TryGetProperty("name", out var nameProp) ? (nameProp.GetString() ?? string.Empty) : string.Empty;
        string url = asset.TryGetProperty("browser_download_url", out var urlProp) ? (urlProp.GetString() ?? string.Empty) : string.Empty;
        string? digest = asset.TryGetProperty("digest", out var digestProp) ? digestProp.GetString() : null;
        if (string.IsNullOrWhiteSpace(name) || !IsTrustedAssetUrl(url))
        {
          continue;
        }

        yield return new AssetMeta(name, url, digest);
      }
    }

    private static bool IsTrustedAssetUrl(string url)
      => url.StartsWith(CanonicalDownloadPrefix, StringComparison.OrdinalIgnoreCase);

    private static string NormalizeTag(string tag)
      => tag.StartsWith("v", StringComparison.OrdinalIgnoreCase) ? "V" + tag.Substring(1) : tag.ToUpperInvariant();

    private static string? ExtractDigestChecksum(string? digest)
    {
      if (string.IsNullOrWhiteSpace(digest)) return null;

      string normalized = digest.Trim();
      if (normalized.StartsWith("sha256:", StringComparison.OrdinalIgnoreCase))
      {
        normalized = normalized.Substring("sha256:".Length).Trim();
      }

      return IsSha256(normalized) ? normalized.ToLowerInvariant() : null;
    }

    private static bool TryGetSha256(string text, out string checksum)
    {
      checksum = string.Empty;
      string normalized = text.Trim();
      if (normalized.StartsWith("sha256:", StringComparison.OrdinalIgnoreCase))
      {
        normalized = normalized.Substring("sha256:".Length).Trim();
      }

      if (IsSha256(normalized))
      {
        checksum = normalized.ToLowerInvariant();
        return true;
      }

      return false;
    }

    private static bool IsSha256(string value)
      => value.Length == 64 && value.All(c => Uri.IsHexDigit(c));
  }
}

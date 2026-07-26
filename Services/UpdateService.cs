using System;
using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.System;

using System.Security.Cryptography;
using System.IO.Compression;
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

    public async Task<string> CheckAndUpdateAsync(Action<int,string>? progress = null, CancellationToken ct = default)
    {
      progress ??= (_ , __) => { };
      using var http = new HttpClient();
      http.DefaultRequestHeaders.UserAgent.ParseAdd("FormatX-Updater/1.0 (+Windows)");
      UpdateReleaseSelection? selectedRelease;
      try
      {
        string releaseJson = await http.GetStringAsync(UpdateSecurity.CanonicalReleaseApiUrl, ct);
        selectedRelease = UpdateSecurity.SelectReleaseFromMetadata(releaseJson);
      }
      catch (Exception ex)
      {
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Download, ex);
      }

      if (selectedRelease is null)
        return "Nincs új frissítés.";

      var updatesRootFolder = await ApplicationData.Current.LocalFolder.CreateFolderAsync("Updates", CreationCollisionOption.OpenIfExists);
      var updatesFolder = await updatesRootFolder.CreateFolderAsync("Windows", CreationCollisionOption.OpenIfExists);
      string downloadsPath = Path.Combine(updatesFolder.Path, "downloads");
      Directory.CreateDirectory(downloadsPath);
      string archivePath = Path.Combine(downloadsPath, selectedRelease.AssetName);

      progress(1, "Letöltés indul...");
      try
      {
        using var msg = await http.GetAsync(selectedRelease.AssetUrl, HttpCompletionOption.ResponseHeadersRead, ct);
        msg.EnsureSuccessStatusCode();
        long total = msg.Content.Headers.ContentLength ?? -1L;
        using var src = await msg.Content.ReadAsStreamAsync(ct);
        using var dst = File.Create(archivePath);
        byte[] buffer = new byte[81920];
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
      catch (Exception ex)
      {
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Download, ex);
      }

      try
      {
        progress(96, "Letöltés kész. SHA-256 ellenőrzés...");
        string expectedChecksum = selectedRelease.EmbeddedChecksum ?? string.Empty;
        if (expectedChecksum.Length == 0)
        {
          if (selectedRelease.ChecksumAssetUrl is null)
          {
            throw new UpdateStageException(UpdateFailureKind.Checksum, "A kiadáshoz nem található checksum asset.");
          }

          string checksumText = await http.GetStringAsync(selectedRelease.ChecksumAssetUrl, ct);
          expectedChecksum = UpdateSecurity.ResolveExpectedChecksum(checksumText, selectedRelease.AssetName);
        }
        string actualChecksum = ComputeSHA256(archivePath).ToLowerInvariant();
        if (!string.Equals(expectedChecksum, actualChecksum, StringComparison.OrdinalIgnoreCase))
        {
          throw new UpdateStageException(UpdateFailureKind.Checksum, $"Checksum eltérés. Várt: {expectedChecksum}, kapott: {actualChecksum}");
        }
      }
      catch (UpdateStageException ex)
      {
        return UpdateSecurity.BuildFailureMessage(ex.Kind, ex);
      }
      catch (Exception ex)
      {
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Checksum, ex);
      }

      string launchPath;
      try
      {
        progress(98, "Kicsomagolás indul...");
        if (!selectedRelease.AssetName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
        {
          throw new UpdateStageException(UpdateFailureKind.Extraction, "A kiadás nem ZIP formátumú.");
        }

        string extractionPath = UpdateSecurity.ResolveExtractionDirectory(updatesFolder.Path, selectedRelease.Tag);
        var executables = UpdateSecurity.ExtractZipSecurely(archivePath, extractionPath);
        launchPath = UpdateSecurity.SelectExecutableToLaunch(executables, extractionPath);
      }
      catch (UpdateStageException ex)
      {
        return UpdateSecurity.BuildFailureMessage(ex.Kind, ex);
      }
      catch (InvalidDataException ex)
      {
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Extraction, ex);
      }
      catch (Exception ex)
      {
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Extraction, ex);
      }

      progress(100, "Ellenőrizve. Telepítő indítása...");
      try
      {
        var file = await StorageFile.GetFileFromPathAsync(launchPath);
        bool launched = await Launcher.LaunchFileAsync(file);
        if (!launched)
        {
          throw new UpdateStageException(UpdateFailureKind.Launch, "A Windows nem indította el a frissítőt.");
        }

        return "Frissítés letöltve, ellenőrizve és indítva.";
      }
      catch (UpdateStageException ex)
      {
        return UpdateSecurity.BuildFailureMessage(ex.Kind, ex);
      }
      catch (Exception ex)
      {
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Launch, ex);
      }
    }
  }
}
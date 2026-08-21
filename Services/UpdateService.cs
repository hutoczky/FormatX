using System;
using System.IO;
using System.IO.Compression;
using System.Net.Http;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using FormatX.Models;
using Windows.Storage;
using Windows.System;

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

    public async Task<string> CheckAndUpdateAsync(
      Action<int, string>? progress = null,
      CancellationToken ct = default,
      Action<MagUpdateProgressInfo>? stateProgress = null)
    {
      progress ??= (_, __) => { };

      void Report(MagUpdateState stage, double ratio, string text, string? target = null)
      {
        ratio = Math.Clamp(ratio, 0, 1);
        stateProgress?.Invoke(new MagUpdateProgressInfo(stage, ratio, text, target));
        MagStateService.Current.SetUpdate(stage, ratio, text);
      }

      using var http = new HttpClient();
      http.DefaultRequestHeaders.UserAgent.ParseAdd("FormatX-Updater/1.0 (+Windows)");
      UpdateReleaseSelection? selectedRelease;

      Report(MagUpdateState.Checking, 0, "Frissítések keresése...");
      try
      {
        string releaseJson = await http.GetStringAsync(UpdateSecurity.CanonicalReleaseApiUrl, ct);
        selectedRelease = UpdateSecurity.SelectReleaseFromMetadata(releaseJson);
      }
      catch (Exception ex)
      {
        Report(MagUpdateState.Failed, 0, "Frissítési metaadat hiba");
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Download, ex);
      }

      if (selectedRelease is null)
      {
        Report(MagUpdateState.Current, 1, "A program naprakész.");
        return "Nincs új frissítés.";
      }

      Report(MagUpdateState.Available, 0, $"Frissítés elérhető: {selectedRelease.Tag}", selectedRelease.Tag);

      var updatesRootFolder = await ApplicationData.Current.LocalFolder.CreateFolderAsync("Updates", CreationCollisionOption.OpenIfExists);
      var updatesFolder = await updatesRootFolder.CreateFolderAsync("Windows", CreationCollisionOption.OpenIfExists);
      string downloadsPath = Path.Combine(updatesFolder.Path, "downloads");
      Directory.CreateDirectory(downloadsPath);
      string archivePath = Path.Combine(downloadsPath, selectedRelease.AssetName);

      progress(1, "Letöltés indul...");
      Report(MagUpdateState.Downloading, 0.01, "Letöltés indul...", selectedRelease.Tag);
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
            Report(MagUpdateState.Downloading, p / 100.0, $"Letöltés: {p}%", selectedRelease.Tag);
          }
        }
      }
      catch (Exception ex)
      {
        Report(MagUpdateState.Failed, 0, "Frissítés letöltési hiba", selectedRelease.Tag);
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Download, ex);
      }

      try
      {
        progress(96, "Letöltés kész. SHA-256 ellenőrzés...");
        MagStateService.Current.SetIntegrity(MagIntegrityState.Checking);
        Report(MagUpdateState.ChecksumVerification, 0.96, "SHA-256 ellenőrzés...", selectedRelease.Tag);

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

        MagStateService.Current.SetIntegrity(MagIntegrityState.Sha256Verified);
      }
      catch (UpdateStageException ex)
      {
        MagStateService.Current.SetIntegrity(MagIntegrityState.Failed);
        Report(MagUpdateState.Failed, 0.96, "SHA-256 ellenőrzési hiba", selectedRelease.Tag);
        return UpdateSecurity.BuildFailureMessage(ex.Kind, ex);
      }
      catch (Exception ex)
      {
        MagStateService.Current.SetIntegrity(MagIntegrityState.Failed);
        Report(MagUpdateState.Failed, 0.96, "SHA-256 ellenőrzési hiba", selectedRelease.Tag);
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Checksum, ex);
      }

      string launchPath;
      try
      {
        progress(98, "Kicsomagolás indul...");
        Report(MagUpdateState.Extracting, 0.98, "Frissítőcsomag kibontása...", selectedRelease.Tag);
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
        Report(MagUpdateState.Failed, 0.98, "Frissítőcsomag kibontási hiba", selectedRelease.Tag);
        return UpdateSecurity.BuildFailureMessage(ex.Kind, ex);
      }
      catch (InvalidDataException ex)
      {
        Report(MagUpdateState.Failed, 0.98, "Frissítőcsomag kibontási hiba", selectedRelease.Tag);
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Extraction, ex);
      }
      catch (Exception ex)
      {
        Report(MagUpdateState.Failed, 0.98, "Frissítőcsomag kibontási hiba", selectedRelease.Tag);
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Extraction, ex);
      }

      progress(100, "Ellenőrizve. Telepítő indítása...");
      Report(MagUpdateState.Installing, 1, "Ellenőrizve. Telepítő indítása...", selectedRelease.Tag);
      try
      {
        var file = await StorageFile.GetFileFromPathAsync(launchPath);
        bool launched = await Launcher.LaunchFileAsync(file);
        if (!launched)
        {
          throw new UpdateStageException(UpdateFailureKind.Launch, "A Windows nem indította el a frissítőt.");
        }

        Report(MagUpdateState.Completed, 1, "Frissítés ellenőrizve és elindítva.", selectedRelease.Tag);
        return "Frissítés letöltve, ellenőrizve és indítva.";
      }
      catch (UpdateStageException ex)
      {
        Report(MagUpdateState.Failed, 1, "A frissítő indítása sikertelen", selectedRelease.Tag);
        return UpdateSecurity.BuildFailureMessage(ex.Kind, ex);
      }
      catch (Exception ex)
      {
        Report(MagUpdateState.Failed, 1, "A frissítő indítása sikertelen", selectedRelease.Tag);
        return UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Launch, ex);
      }
    }
  }
}

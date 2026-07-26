using FormatX.Services;
using System.IO.Compression;

namespace FormatX.Update.Tests;

public class UnitTest1
{
    [Fact]
    public void SelectReleaseFromMetadata_UsesCanonicalDownloadAssetOnly()
    {
        string json = """
        {
          "tag_name": "v92",
          "draft": false,
          "prerelease": false,
          "assets": [
            {
              "name": "FormatX-Suite-Pro-V92.zip",
              "browser_download_url": "https://github.com/hutoczky/formatui/releases/download/v92/FormatX-Suite-Pro-V92.zip",
              "digest": "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            },
            {
              "name": "FormatX-Suite-Pro-V92.zip",
              "browser_download_url": "https://github.com/hutoczky/FormatX-Updates/releases/download/v92/FormatX-Suite-Pro-V92.zip",
              "digest": "sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
            }
          ]
        }
        """;

        var selected = UpdateSecurity.SelectReleaseFromMetadata(json);

        Assert.NotNull(selected);
        Assert.Equal("https://github.com/hutoczky/FormatX-Updates/releases/download/v92/FormatX-Suite-Pro-V92.zip", selected!.AssetUrl);
        Assert.Equal(new string('b', 64), selected.EmbeddedChecksum);
    }

    [Fact]
    public void SelectReleaseFromMetadata_FailsClosedWhenChecksumMissing()
    {
        string json = """
        {
          "tag_name": "v93",
          "draft": false,
          "prerelease": false,
          "assets": [
            {
              "name": "FormatX-Suite-Pro-V93.zip",
              "browser_download_url": "https://github.com/hutoczky/FormatX-Updates/releases/download/v93/FormatX-Suite-Pro-V93.zip"
            }
          ]
        }
        """;

        var ex = Assert.Throws<UpdateStageException>(() => UpdateSecurity.SelectReleaseFromMetadata(json));

        Assert.Equal(UpdateFailureKind.Checksum, ex.Kind);
        Assert.Contains("SHA-256", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void ResolveExpectedChecksum_ReadsSha256AssetFormat()
    {
        string checksumText = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc  FormatX-Suite-Pro-V93.zip";

        string checksum = UpdateSecurity.ResolveExpectedChecksum(checksumText, "FormatX-Suite-Pro-V93.zip");

        Assert.Equal(new string('c', 64), checksum);
    }

    [Fact]
    public void ExtractZipSecurely_BlocksPathTraversal()
    {
        string tempRoot = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(tempRoot);
        string zipPath = Path.Combine(tempRoot, "bad.zip");
        string extractDir = Path.Combine(tempRoot, "extract");

        using (var archive = ZipFile.Open(zipPath, ZipArchiveMode.Create))
        {
            var entry = archive.CreateEntry("../outside.exe");
            using var writer = new StreamWriter(entry.Open());
            writer.Write("bad");
        }

        var ex = Assert.Throws<UpdateStageException>(() => UpdateSecurity.ExtractZipSecurely(zipPath, extractDir));
        Assert.Equal(UpdateFailureKind.Extraction, ex.Kind);

        Directory.Delete(tempRoot, recursive: true);
    }

    [Fact]
    public void BuildFailureMessage_ContainsDefender225Hint()
    {
        var ex = new InvalidOperationException("The operation failed with 0x800700E1.");

        string message = UpdateSecurity.BuildFailureMessage(UpdateFailureKind.Launch, ex);

        Assert.Contains("225", message, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("ERROR_VIRUS_INFECTED", message, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("kikapcsol", message, StringComparison.OrdinalIgnoreCase);
    }
}

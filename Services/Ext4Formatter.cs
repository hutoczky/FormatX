
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;

namespace FormatX.Services
{
    public static class Ext4Formatter
    {
        public const int Ext4LabelMax = 16;

        static int Run(string file, string args, out string output, int timeoutMs = 120_000)
        {
            var psi = new ProcessStartInfo
            {
                FileName = file,
                Arguments = args,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };
            using var p = new Process { StartInfo = psi };
            var sb = new StringBuilder();
            p.OutputDataReceived += (_, e) => { if (!string.IsNullOrEmpty(e.Data)) sb.AppendLine(e.Data); };
            p.ErrorDataReceived  += (_, e) => { if (!string.IsNullOrEmpty(e.Data)) sb.AppendLine(e.Data); };
            p.Start();
            p.BeginOutputReadLine();
            p.BeginErrorReadLine();
            if (!p.WaitForExit(timeoutMs)) try { p.Kill(entireProcessTree: true); } catch { }
            output = sb.ToString();
            return p.ExitCode;
        }

        public static bool IsAdmin()
        {
            try
            {
                using var id = WindowsIdentity.GetCurrent();
                var pr = new WindowsPrincipal(id);
                return pr.IsInRole(WindowsBuiltInRole.Administrator);
            }
            catch { return false; }
        }

        public static bool HasWsl()
        {
            try { return Run("wsl.exe", "--status", out _) == 0; } catch { return false; }
        }

        public static bool TryGetPhysicalDriveFromLetter(string driveLetter, out int diskNumber)
        {
            diskNumber = -1;
            if (string.IsNullOrWhiteSpace(driveLetter)) return false;
            driveLetter = driveLetter.Trim().TrimEnd('\\').ToUpperInvariant();
            if (!driveLetter.EndsWith(":")) driveLetter += ":";

            try
            {
                // 1) Map logical disk -> partition
                using var q1 = new ManagementObjectSearcher("ASSOCIATORS OF {Win32_LogicalDisk.DeviceID='" + driveLetter + "'} WHERE AssocClass = Win32_LogicalDiskToPartition");
                foreach (ManagementObject p in q1.Get())
                {
                    var partDeviceId = (p["DeviceID"] as string) ?? "";
                    // 2) Map partition -> disk drive
                    using var q2 = new ManagementObjectSearcher("ASSOCIATORS OF {Win32_DiskPartition.DeviceID='" + partDeviceId.Replace("\\", "\\\\") + "'} WHERE AssocClass = Win32_DiskDriveToDiskPartition");
                    foreach (ManagementObject d in q2.Get())
                    {
                        // Example: \\.\PHYSICALDRIVE2
                        var pnp = (d["DeviceID"] as string) ?? "";
                        if (pnp.StartsWith(@"\\.\PHYSICALDRIVE", StringComparison.OrdinalIgnoreCase))
                        {
                            var tail = pnp.Substring(@"\\.\PHYSICALDRIVE".Length);
                            if (int.TryParse(tail, out var idx)) { diskNumber = idx; return true; }
                        }
                    }
                }
            }
            catch { }
            return false;
        }

        public static async Task FormatExt4FromDriveLetterAsync(string driveLetter, string label, IProgress<string>? log = null)
        {
            if (!IsAdmin()) throw new InvalidOperationException("Admin jogosultság szükséges.");
            if (!HasWsl()) throw new InvalidOperationException("WSL2 nincs telepítve.");
            if (!TryGetPhysicalDriveFromLetter(driveLetter, out var diskNo)) throw new InvalidOperationException("A fizikai lemez nem azonosítható.");

            await FormatExt4FromPhysicalAsync(diskNo, label, log);
        }

        public static async Task FormatExt4FromPhysicalAsync(int diskNumber, string label, IProgress<string>? log = null)
        {
            if (!IsAdmin()) throw new InvalidOperationException("Admin jogosultság szükséges.");
            if (!HasWsl()) throw new InvalidOperationException("WSL2 nincs telepítve.");

            string Log(string s) { log?.Report(s); return s; }

            // 1) DiskPart – clean + GPT + Linux part GUID
            var dp = $@"
select disk {diskNumber}
detail disk
clean
convert gpt
create partition primary
set id=0FC63DAF-8483-4772-8E79-3D69D8477DE4
";
            var dpFile = Path.Combine(Path.GetTempPath(), $"fx_dp_{Guid.NewGuid():N}.txt");
            File.WriteAllText(dpFile, dp, Encoding.ASCII);
            Log($"DiskPart indul (PHYSICALDRIVE{diskNumber})...");
            if (Run("diskpart.exe", $"/s \"{dpFile}\"", out var dpOut, timeoutMs: 180_000) != 0)
                throw new Exception("DiskPart hiba:\n" + dpOut);

            // 2) WSL mount bare
            var phys = $@"\\.\PHYSICALDRIVE{diskNumber}";
            Run("wsl.exe", $"--unmount {phys}", out _);
            Log("WSL mount...");
            if (Run("wsl.exe", $"--mount {phys} --partition 1 --bare", out var mntOut, timeoutMs: 120_000) != 0)
                throw new Exception("WSL mount hiba:\n" + mntOut);

            // 3) mkfs.ext4 – find the last added partition device under /dev
            var safeLabel = (label ?? "").Replace("'", "").Trim();
            if (safeLabel.Length > Ext4LabelMax) safeLabel = safeLabel.Substring(0, Ext4LabelMax);
            var mk = "bash -lc \"set -e; dev=$(lsblk -o PATH,TYPE | awk '/part/ {print $1}' | tail -n1); sudo -n true 2>/dev/null || echo 'sudo password may be needed'; sudo mkfs.ext4 -F -L '" + safeLabel + "' $dev && echo OK\"";
            Log("mkfs.ext4...");
            if (Run("wsl.exe", mk, out var mkOut, timeoutMs: 300_000) != 0 || !mkOut.Contains("OK"))
            {
                Run("wsl.exe", $"--unmount {phys}", out _);
                throw new Exception("mkfs.ext4 hiba:\n" + mkOut);
            }

            // 4) Unmount WSL
            Log("WSL unmount...");
            Run("wsl.exe", $"--unmount {phys}", out _);
            Log("Kész.");
            await Task.CompletedTask;
        }
    }
}

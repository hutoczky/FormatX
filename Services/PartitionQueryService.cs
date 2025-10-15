using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Management;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using FormatX.Models;

namespace FormatX.Services
{
    public sealed class PartitionQueryService
    {
        public async Task<IList<PartitionInfo>> GetPartitionsAsync(int diskIndex)
        {
            try
            {
                var list = new List<PartitionInfo>();

                string drivePredicate = "Win32_DiskDrive.DeviceID='\\\\\\\\.\\\\PHYSICALDRIVE" + diskIndex + "'";
                using var q = new ManagementObjectSearcher("root\\CIMV2", $"ASSOCIATORS OF {{{drivePredicate}}} WHERE AssocClass = Win32_DiskDriveToDiskPartition");
                var parts = q.Get().Cast<ManagementObject>().ToList();
                int idx = 0;
                foreach (var p in parts)
                {
                    var pi = new PartitionInfo
                    {
                        Index = ++idx,
                        Type = (p["Type"] as string) ?? "",
                        SizeBytes = Convert.ToInt64(p["Size"] ?? 0),
                        OffsetBytes = Convert.ToInt64(p["StartingOffset"] ?? 0),
                        IsGpt = ((p["Type"] as string)?.IndexOf("GPT", StringComparison.OrdinalIgnoreCase) ?? -1) >= 0
                    };

                    using var q2 = new ManagementObjectSearcher("root\\CIMV2", $"ASSOCIATORS OF {{Win32_DiskPartition.DeviceID='{((string)p["DeviceID"]).Replace("\\", "\\\\")}'}} WHERE AssocClass = Win32_LogicalDiskToPartition");
                    var log = q2.Get().Cast<ManagementObject>().FirstOrDefault();
                    if (log != null)
                    {
                        pi.DriveLetter = (log["DeviceID"] as string) ?? "";
                        pi.FileSystem = (log["FileSystem"] as string) ?? "";
                        pi.Label = (log["VolumeName"] as string) ?? "";
                    }

                    list.Add(pi);
                }

                await LogService.LogAsync("partitions.list", new { disk = diskIndex, count = list.Count });
                return list;
            }
            catch
            {
                try
                {
                    var psi = new ProcessStartInfo("diskpart.exe")
                    {
                        RedirectStandardInput = true,
                        RedirectStandardOutput = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };
                    using var p = Process.Start(psi)!;
                    await p.StandardInput.WriteLineAsync($"select disk {diskIndex}\nlist partition\nexit\n");
                    string output = await p.StandardOutput.ReadToEndAsync();
                    await p.WaitForExitAsync();

                    var list = new List<PartitionInfo>();
                    var rx = new Regex(@"Partition\s+(\d+)\s+(\S+)\s+(\d+\s+\S+)", RegexOptions.IgnoreCase);
                    foreach (Match m in rx.Matches(output))
                    {
                        list.Add(new PartitionInfo
                        {
                            Index = int.Parse(m.Groups[1].Value),
                            Type = m.Groups[2].Value,
                        });
                    }
                    await LogService.LogAsync("partitions.list.fallback", new { disk = diskIndex, count = list.Count });
                    return list;
                }
                catch (Exception ex)
                {
                    await LogService.LogAsync("partitions.list.error", new { disk = diskIndex, error = ex.Message });
                    return Array.Empty<PartitionInfo>();
                }
            }
        }
    }
}

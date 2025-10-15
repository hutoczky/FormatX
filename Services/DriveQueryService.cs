using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Management;
using FormatX.Models;

namespace FormatX.Services
{
  /// <summary>Provides methods to query drive and volume information.</summary>
  public sealed class DriveQueryService
  {
    public IEnumerable<VolumeInfo> GetVolumes()
    {
      foreach (var d in DriveInfo.GetDrives())
      {
        if (d.DriveType == DriveType.Removable || d.DriveType == DriveType.Fixed)
        {
          bool ready = d.IsReady;
          yield return new VolumeInfo
          {
            DriveLetter = ready ? d.Name.TrimEnd(Path.DirectorySeparatorChar) : null,
            FileSystem  = ready ? d.DriveFormat : null,
            Label       = ready ? d.VolumeLabel : null,
            TotalBytes  = ready ? d.TotalSize : 0,
            FreeBytes   = ready ? d.TotalFreeSpace : 0,
            IsRemovable = d.DriveType == DriveType.Removable
          };
        }
      }
    }

    public IReadOnlyList<DriveItem> ListPhysicalDrives(bool preferRemovableFirst = true)
    {
      var list = new List<DriveItem>();
      try
      {
        using (var searcher = new ManagementObjectSearcher("SELECT DeviceID, Model, Size, MediaType, InterfaceType FROM Win32_DiskDrive"))
        {
          foreach (ManagementObject d in searcher.Get())
          {
            var deviceId = (d["DeviceID"] as string) ?? string.Empty;
            var model = (d["Model"] as string) ?? "Unknown";
            ulong size = 0;
            var sizeObj = d["Size"];
            if (sizeObj != null) ulong.TryParse(sizeObj.ToString(), out size);

            int num = ParsePhysicalNumber(deviceId);
            bool isRemovable = IsLikelyRemovable(d);

            if (num >= 0)
            {
              list.Add(new DriveItem
              {
                Number = num,
                DevicePath = deviceId,
                Model = model,
                SizeBytes = size,
                IsRemovable = isRemovable
              });
            }
          }
        }
      }
      catch { /* ignore WMI errors on restricted systems */ }

      // Sort: removable first (optional), then by disk number
      list.Sort((a, b) =>
      {
        if (preferRemovableFirst && a.IsRemovable != b.IsRemovable)
          return a.IsRemovable ? -1 : 1;
        return a.Number.CompareTo(b.Number);
      });

      return list.AsReadOnly();
    }

    private static int ParsePhysicalNumber(string deviceId)
    {
      if (string.IsNullOrEmpty(deviceId)) return -1;
      // Expect pattern like \\.\PHYSICALDRIVE0
      var digits = string.Empty;
      for (int i = deviceId.Length - 1; i >= 0; i--)
      {
        if (char.IsDigit(deviceId[i])) digits = deviceId[i] + digits;
        else if (!string.IsNullOrEmpty(digits)) break;
      }
      if (int.TryParse(digits, out var n)) return n;
      return -1;
    }

    private static bool IsLikelyRemovable(ManagementObject d)
    {
      var media = (d["MediaType"] as string) ?? string.Empty;
      var iface = (d["InterfaceType"] as string) ?? string.Empty;
      if (media.IndexOf("Removable", StringComparison.OrdinalIgnoreCase) >= 0) return true;
      if (iface.Equals("USB", StringComparison.OrdinalIgnoreCase)) return true;
      return false;
    }
  }

  public sealed class DriveItem
  {
    public int Number { get; init; }
    public string DevicePath { get; init; }
    public string Model { get; init; }
    public ulong SizeBytes { get; init; }
    public bool IsRemovable { get; init; }
    public string Display => $"Disk {Number} — {Model} — {FormatSize(SizeBytes)}";

    private static string FormatSize(ulong bytes)
    {
      const double GB = 1024d * 1024d * 1024d;
      const double TB = GB * 1024d;
      if (bytes >= (ulong)TB) return (bytes / TB).ToString("0.0", CultureInfo.InvariantCulture) + " TB";
      return (bytes / GB).ToString("0.0", CultureInfo.InvariantCulture) + " GB";
    }
  }
}

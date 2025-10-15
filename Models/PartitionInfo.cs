using System;

namespace FormatX.Models
{
    public class PartitionInfo
    {
        public int Index { get; set; }
        public string Type { get; set; } = "";
        public string FileSystem { get; set; } = "";
        public string Label { get; set; } = "";
        public string DriveLetter { get; set; } = "";
        public long SizeBytes { get; set; }
        public long OffsetBytes { get; set; }
        public bool IsGpt { get; set; }

        public string SizeDisplay => SizeBytes <= 0 ? "Auto" : FormatSize(SizeBytes);
        public string Display => $"#{Index} {Type} — {SizeDisplay} — {FileSystem} {Label}".Trim();

        private static string FormatSize(long bytes)
        {
            string[] units = { "B", "KB", "MB", "GB", "TB" };
            double v = bytes; int i = 0;
            while (v >= 1024 && i < units.Length - 1) { v /= 1024; i++; }
            return bytes <= 0 ? "0 B" : $"{v:0.#} {units[i]}";
        }
    }
}

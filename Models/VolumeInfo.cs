namespace FormatX.Models
{
  /// <summary>
  /// Represents a logical volume and its properties.
  /// </summary>
  public sealed class VolumeInfo
  {
    public string? DriveLetter { get; set; }
    public string? FileSystem { get; set; }
    public string? Label { get; set; }
    public long TotalBytes { get; set; }
    public long FreeBytes { get; set; }
    public bool IsRemovable { get; set; }
  }
}
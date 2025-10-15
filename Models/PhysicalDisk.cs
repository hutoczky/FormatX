namespace FormatX.Models
{
  /// <summary>
  /// Represents a physical disk device.
  /// </summary>
  public sealed class PhysicalDisk
  {
    public uint Number { get; set; }
    public string? FriendlyName { get; set; }
    public ulong Size { get; set; }
    public string? BusType { get; set; }
    public string? MediaType { get; set; }
  }
}
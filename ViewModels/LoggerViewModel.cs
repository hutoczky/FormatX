using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace FormatX.ViewModels
{
  public sealed class LogItem
  {
    public string Text { get; init; } = string.Empty;
    public string Level { get; init; } = "info"; // success|cancel|error|info
  }

  public sealed class LoggerViewModel : INotifyPropertyChanged
  {
    public ObservableCollection<LogItem> Items { get; } = new();

    public event PropertyChangedEventHandler? PropertyChanged;
    private void Raise([CallerMemberName] string? name=null) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

    public void Add(string line)
    {
      var lvl = Classify(line);
      Items.Add(new LogItem{ Text = line, Level = lvl });
    }

    private static string Classify(string line)
    {
      if (string.IsNullOrWhiteSpace(line)) return "info";
      if (line.Contains("usb.refresh.cancelled")) return "cancel";
      if (line.Contains("usb.winrt.error") || line.Contains(".fail") || line.Contains("error")) return "error";
      if (line.EndsWith(".ok") || line.Contains(":ok")) return "success";
      return "info";
    }
  }
}

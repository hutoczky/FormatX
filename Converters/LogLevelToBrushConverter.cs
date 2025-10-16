using Microsoft.UI;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Media;
using System;

namespace FormatX.Converters
{
  public sealed class LogLevelToBrushConverter : IValueConverter
  {
    public object Convert(object value, Type targetType, object parameter, string language)
    {
      var level = (value?.ToString() ?? "").ToLowerInvariant();
      return level switch
      {
        "success" => new SolidColorBrush(Windows.UI.Color.FromArgb(0xFF, 0x8F, 0xFF, 0x8F)),
        "cancel"  => new SolidColorBrush(Windows.UI.Color.FromArgb(0xFF, 0xFF, 0xF5, 0x9E)),
        "error"   => new SolidColorBrush(Windows.UI.Color.FromArgb(0xFF, 0xFF, 0x8F, 0x8F)),
        _          => new SolidColorBrush(Colors.White)
      };
    }

    public object ConvertBack(object value, Type targetType, object parameter, string language)
      => throw new NotSupportedException();
  }
}

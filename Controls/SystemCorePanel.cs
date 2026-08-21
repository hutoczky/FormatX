using System;
using FormatX.Models;
using FormatX.Services;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Windows.UI;

namespace FormatX.Controls
{
  public sealed class SystemCorePanel : UserControl
  {
    private readonly TextBlock _core = Value();
    private readonly TextBlock _license = Value();
    private readonly TextBlock _devices = Value();
    private readonly TextBlock _validUntil = Value();
    private readonly TextBlock _update = Value();
    private readonly TextBlock _integrity = Value();
    private readonly TextBlock _operation = Value();
    private readonly TextBlock _version = Value();

    public SystemCorePanel()
    {
      MinWidth = 420;
      var root = new StackPanel { Spacing = 12, Padding = new Thickness(4) };
      root.Children.Add(Header("FORMATX SYSTEM CORE"));
      root.Children.Add(Row("CORE", _core));
      root.Children.Add(Row("LICENSE", _license));
      root.Children.Add(Row("DEVICES", _devices));
      root.Children.Add(Row("VALID UNTIL", _validUntil));
      root.Children.Add(Row("UPDATE", _update));
      root.Children.Add(Row("INTEGRITY", _integrity));
      root.Children.Add(Row("CURRENT OPERATION", _operation));
      root.Children.Add(Row("VERSION", _version));
      Content = root;

      Loaded += (_, _) =>
      {
        MagStateService.Current.SnapshotChanged += OnSnapshotChanged;
        Refresh(MagStateService.Current.Snapshot);
      };
      Unloaded += (_, _) => MagStateService.Current.SnapshotChanged -= OnSnapshotChanged;
      Refresh(MagStateService.Current.Snapshot);
    }

    private void OnSnapshotChanged(object? sender, MagSnapshot snapshot)
    {
      if (DispatcherQueue.HasThreadAccess) Refresh(snapshot);
      else DispatcherQueue.TryEnqueue(() => Refresh(snapshot));
    }

    public void Refresh(MagSnapshot snapshot)
    {
      _core.Text = snapshot.Operation == MagOperation.ShuttingDown ? "SLEEPING" : "ONLINE";
      _license.Text = $"{snapshot.License.DisplayName.ToUpperInvariant()} · {snapshot.License.State.ToString().ToUpperInvariant()}";
      _devices.Text = snapshot.License.MaxDevices > 0 ? $"{snapshot.License.DevicesUsed} / {snapshot.License.MaxDevices}" : "—";
      _validUntil.Text = snapshot.License.ValidUntil?.ToLocalTime().ToString("yyyy.MM.dd") ?? "—";
      _update.Text = snapshot.UpdateState == MagUpdateState.Downloading
        ? $"DOWNLOADING · {snapshot.UpdateProgress:P0}"
        : snapshot.UpdateState.ToString().ToUpperInvariant();
      _integrity.Text = snapshot.IntegrityState == MagIntegrityState.Sha256Verified
        ? "SHA-256 VERIFIED"
        : snapshot.IntegrityState.ToString().ToUpperInvariant();
      _operation.Text = snapshot.OperationProgress > 0
        ? $"{snapshot.Operation.ToString().ToUpperInvariant()} · {snapshot.OperationProgress:P0}"
        : snapshot.Operation.ToString().ToUpperInvariant();
      _version.Text = VersionService.DisplayVersion;
    }

    private static TextBlock Header(string text) => new()
    {
      Text = text,
      FontSize = 20,
      FontWeight = Microsoft.UI.Text.FontWeights.Bold,
      Foreground = new SolidColorBrush(Color.FromArgb(255, 224, 242, 254))
    };

    private static TextBlock Value() => new()
    {
      FontSize = 13,
      FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
      Foreground = new SolidColorBrush(Color.FromArgb(255, 103, 232, 249)),
      TextWrapping = TextWrapping.Wrap
    };

    private static UIElement Row(string label, TextBlock value)
    {
      var border = new Border
      {
        Padding = new Thickness(12, 9, 12, 9),
        CornerRadius = new CornerRadius(8),
        Background = new SolidColorBrush(Color.FromArgb(28, 34, 211, 238)),
        BorderBrush = new SolidColorBrush(Color.FromArgb(65, 34, 211, 238)),
        BorderThickness = new Thickness(1)
      };
      var grid = new Grid { ColumnSpacing = 12 };
      grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(150) });
      grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
      var key = new TextBlock
      {
        Text = label,
        FontSize = 11,
        Foreground = new SolidColorBrush(Color.FromArgb(255, 148, 163, 184)),
        VerticalAlignment = VerticalAlignment.Center
      };
      Grid.SetColumn(value, 1);
      grid.Children.Add(key);
      grid.Children.Add(value);
      border.Child = grid;
      return border;
    }
  }
}

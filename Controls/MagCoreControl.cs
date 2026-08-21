using System;
using FormatX.Models;
using FormatX.Services;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Automation;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using Windows.Foundation;
using Windows.UI;
using XamlPath = Microsoft.UI.Xaml.Shapes.Path;

namespace FormatX.Controls
{
  public sealed class MagCoreControl : UserControl
  {
    private readonly Canvas _canvas;
    private readonly Ellipse _halo;
    private readonly Ellipse _licenseOuter;
    private readonly Ellipse _licenseMiddle;
    private readonly Ellipse _licenseInner;
    private readonly Ellipse _integrityRing;
    private readonly XamlPath _operationArc;
    private readonly XamlPath _updateArc;
    private readonly Ellipse _coreOuter;
    private readonly Ellipse _coreInner;
    private readonly TextBlock _status;
    private readonly TextBlock _license;
    private readonly TextBlock _substatus;
    private readonly RotateTransform _licenseRotation = new();
    private readonly RotateTransform _integrityRotation = new();
    private readonly RotateTransform _haloRotation = new();
    private readonly DispatcherTimer _timer;

    private MagSnapshot _snapshot = MagStateService.Current.Snapshot;
    private double _phase;

    public event EventHandler? CorePanelRequested;

    public MagCoreControl()
    {
      Width = 264;
      MinWidth = 190;
      HorizontalAlignment = HorizontalAlignment.Center;
      VerticalAlignment = VerticalAlignment.Top;
      AutomationProperties.SetName(this, "FormatX rendszerállapot");

      var panel = new StackPanel
      {
        Spacing = 7,
        HorizontalAlignment = HorizontalAlignment.Center
      };

      var coreButton = new Button
      {
        Padding = new Thickness(0),
        Background = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0)),
        BorderThickness = new Thickness(0),
        HorizontalAlignment = HorizontalAlignment.Center
      };
      ToolTipService.SetToolTip(coreButton, "FormatX System Core");
      coreButton.Click += (_, __) => CorePanelRequested?.Invoke(this, EventArgs.Empty);

      _canvas = new Canvas { Width = 240, Height = 240 };
      coreButton.Content = _canvas;
      panel.Children.Add(coreButton);

      _halo = Ring(224, 1.5, "#2638BDF8", new DoubleCollection { 1, 8 });
      _halo.RenderTransform = _haloRotation;
      AddCentered(_halo, 224);

      _licenseOuter = Ring(204, 3.0, "#AA22D3EE", new DoubleCollection { 8, 3 });
      _licenseOuter.RenderTransform = _licenseRotation;
      AddCentered(_licenseOuter, 204);

      _licenseMiddle = Ring(188, 2.2, "#888B5CF6", new DoubleCollection { 4, 3 });
      AddCentered(_licenseMiddle, 188);

      _licenseInner = Ring(174, 1.5, "#66C4B5FD", new DoubleCollection { 2, 5 });
      AddCentered(_licenseInner, 174);

      _integrityRing = Ring(154, 2.0, "#887DD3FC", new DoubleCollection { 2, 2 });
      _integrityRing.RenderTransform = _integrityRotation;
      AddCentered(_integrityRing, 154);

      _updateArc = Arc(166, "#22D3EE", 3.0);
      _canvas.Children.Add(_updateArc);

      _operationArc = Arc(138, "#67E8F9", 6.0);
      _canvas.Children.Add(_operationArc);

      _coreOuter = Disc(96, "#4422D3EE", "#CC8B5CF6");
      AddCentered(_coreOuter, 96);
      _coreInner = Disc(62, "#CC67E8F9", "#FF312E81");
      AddCentered(_coreInner, 62);

      var coreLabel = new TextBlock
      {
        Text = "FX",
        FontSize = 19,
        FontWeight = Microsoft.UI.Text.FontWeights.Bold,
        Foreground = new SolidColorBrush(Color.FromArgb(255, 255, 255, 255)),
        HorizontalAlignment = HorizontalAlignment.Center,
        VerticalAlignment = VerticalAlignment.Center
      };
      Canvas.SetLeft(coreLabel, 109);
      Canvas.SetTop(coreLabel, 106);
      _canvas.Children.Add(coreLabel);

      _status = new TextBlock
      {
        Text = "CORE BOOT",
        FontSize = 13,
        FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
        Foreground = Brush("#FFE0F2FE"),
        HorizontalAlignment = HorizontalAlignment.Center,
        TextAlignment = TextAlignment.Center,
        TextWrapping = TextWrapping.Wrap,
        MaxWidth = 250
      };
      panel.Children.Add(_status);

      _license = new TextBlock
      {
        Text = "LICENSE · CHECKING",
        FontSize = 11,
        Foreground = Brush("#FF94A3B8"),
        HorizontalAlignment = HorizontalAlignment.Center,
        TextAlignment = TextAlignment.Center
      };
      panel.Children.Add(_license);

      _substatus = new TextBlock
      {
        Text = "INTEGRITY · STARTING",
        FontSize = 10,
        Foreground = Brush("#FF64748B"),
        HorizontalAlignment = HorizontalAlignment.Center,
        TextAlignment = TextAlignment.Center
      };
      panel.Children.Add(_substatus);

      var open = new Button
      {
        Content = "SYSTEM CORE",
        FontSize = 10,
        HorizontalAlignment = HorizontalAlignment.Center,
        Padding = new Thickness(14, 5, 14, 5)
      };
      open.Click += (_, __) => CorePanelRequested?.Invoke(this, EventArgs.Empty);
      panel.Children.Add(open);

      Content = panel;

      _timer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(50) };
      _timer.Tick += (_, __) => Animate();
      Loaded += OnLoaded;
      Unloaded += OnUnloaded;
      ApplySnapshot(_snapshot);
    }

    public void SetActive(bool active)
    {
      if (active)
      {
        if (!_timer.IsEnabled) _timer.Start();
      }
      else
      {
        _timer.Stop();
      }
    }

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
      MagStateService.Current.SnapshotChanged += OnSnapshotChanged;
      ApplySnapshot(MagStateService.Current.Snapshot);
      _timer.Start();
    }

    private void OnUnloaded(object sender, RoutedEventArgs e)
    {
      MagStateService.Current.SnapshotChanged -= OnSnapshotChanged;
      _timer.Stop();
    }

    private void OnSnapshotChanged(object? sender, MagSnapshot snapshot)
    {
      if (DispatcherQueue.HasThreadAccess) ApplySnapshot(snapshot);
      else DispatcherQueue.TryEnqueue(() => ApplySnapshot(snapshot));
    }

    private void ApplySnapshot(MagSnapshot snapshot)
    {
      _snapshot = snapshot;
      var visual = MagStateResolver.Resolve(snapshot);

      _halo.Stroke = Brush(WithAlpha(visual.UpdateColor, 0x55));
      _licenseOuter.Stroke = Brush(WithAlpha(visual.LicenseColor, 0xDD));
      _licenseMiddle.Stroke = Brush(WithAlpha(visual.LicenseColor, 0x99));
      _licenseInner.Stroke = Brush(WithAlpha(visual.LicenseColor, 0x66));
      _licenseMiddle.Visibility = visual.LicenseRingCount >= 2 ? Visibility.Visible : Visibility.Collapsed;
      _licenseInner.Visibility = visual.LicenseRingCount >= 3 ? Visibility.Visible : Visibility.Collapsed;

      if (snapshot.License.Tier == MagLicenseTier.TechnicianTeam)
      {
        int segments = Math.Clamp(visual.LicenseSegments, 2, 16);
        _licenseOuter.StrokeDashArray = new DoubleCollection { 2.2, Math.Max(1.1, 13.0 / segments) };
      }
      else
      {
        _licenseOuter.StrokeDashArray = new DoubleCollection { 8, 3 };
      }

      _integrityRing.Stroke = Brush(WithAlpha(visual.IntegrityColor, 0xCC));
      _coreOuter.Fill = Brush(WithAlpha(visual.CoreColor, visual.IsCritical ? 0x77 : 0x44));
      _coreOuter.Stroke = Brush(WithAlpha(visual.CoreColor, 0xDD));
      _coreInner.Fill = Brush(WithAlpha(visual.CoreColor, 0xCC));
      _coreInner.Stroke = Brush("#FFE0F2FE");

      UpdateArc(_operationArc, 138, snapshot.OperationProgress > 0 ? snapshot.OperationProgress : OperationActivity(snapshot.Operation), visual.CoreColor, 6.0);
      double updateProgress = snapshot.UpdateState == MagUpdateState.Downloading ? snapshot.UpdateProgress : UpdateActivity(snapshot.UpdateState);
      UpdateArc(_updateArc, 166, updateProgress, visual.UpdateColor, 3.0);

      _status.Text = snapshot.StatusText.ToUpperInvariant();
      _license.Text = $"{snapshot.License.DisplayName.ToUpperInvariant()} · {snapshot.License.State.ToString().ToUpperInvariant()}";
      _license.Foreground = Brush(visual.LicenseColor);
      _substatus.Text = $"INTEGRITY · {IntegrityText(snapshot.IntegrityState)}   UPDATE · {snapshot.UpdateState.ToString().ToUpperInvariant()}";

      string accessible = $"FormatX rendszerállapot. {snapshot.License.DisplayName} licenc: {snapshot.License.State}. " +
                          $"Művelet: {snapshot.Operation}. Frissítés: {snapshot.UpdateState}. Integritás: {snapshot.IntegrityState}.";
      AutomationProperties.SetHelpText(this, accessible);
    }

    private void Animate()
    {
      var visual = MagStateResolver.Resolve(_snapshot);
      if (visual.MotionFactor <= 0) return;

      double activity = Math.Max(0.15, _snapshot.Activity);
      _phase += 0.45 * visual.MotionFactor * activity;
      _licenseRotation.Angle = _phase % 360;
      _integrityRotation.Angle = (-_phase * 0.72) % 360;
      _haloRotation.Angle = (_phase * 0.32) % 360;

      double pulse = 0.72 + Math.Sin(_phase * Math.PI / 45.0) * 0.12 * activity;
      _coreOuter.Opacity = Math.Clamp(pulse, 0.5, 0.95);
      _coreInner.Opacity = Math.Clamp(0.82 + Math.Sin((_phase + 18) * Math.PI / 38.0) * 0.1 * activity, 0.62, 1.0);
    }

    private void AddCentered(FrameworkElement element, double size)
    {
      Canvas.SetLeft(element, (240 - size) / 2);
      Canvas.SetTop(element, (240 - size) / 2);
      _canvas.Children.Add(element);
    }

    private static Ellipse Ring(double size, double thickness, string color, DoubleCollection? dash = null)
      => new()
      {
        Width = size,
        Height = size,
        StrokeThickness = thickness,
        Stroke = Brush(color),
        StrokeDashArray = dash,
        RenderTransformOrigin = new Point(0.5, 0.5),
        Fill = new SolidColorBrush(Color.FromArgb(0, 0, 0, 0))
      };

    private static Ellipse Disc(double size, string fill, string stroke)
      => new()
      {
        Width = size,
        Height = size,
        Fill = Brush(fill),
        Stroke = Brush(stroke),
        StrokeThickness = 2
      };

    private static XamlPath Arc(double size, string color, double thickness)
    {
      var path = new XamlPath
      {
        Width = 240,
        Height = 240,
        Stroke = Brush(color),
        StrokeThickness = thickness,
        StrokeStartLineCap = PenLineCap.Round,
        StrokeEndLineCap = PenLineCap.Round
      };
      UpdateArc(path, size, 0.001, color, thickness);
      return path;
    }

    private static void UpdateArc(XamlPath path, double size, double progress, string color, double thickness)
    {
      progress = Math.Clamp(progress, 0.001, 0.9999);
      double radius = size / 2;
      double cx = 120;
      double cy = 120;
      double startAngle = -90;
      double endAngle = startAngle + 360 * progress;
      Point start = PointOnCircle(cx, cy, radius, startAngle);
      Point end = PointOnCircle(cx, cy, radius, endAngle);

      var figure = new PathFigure { StartPoint = start, IsClosed = false };
      figure.Segments.Add(new ArcSegment
      {
        Point = end,
        Size = new Size(radius, radius),
        SweepDirection = SweepDirection.Clockwise,
        IsLargeArc = progress > 0.5
      });
      var geometry = new PathGeometry();
      geometry.Figures.Add(figure);
      path.Data = geometry;
      path.Stroke = Brush(color);
      path.StrokeThickness = thickness;
    }

    private static Point PointOnCircle(double cx, double cy, double radius, double angleDegrees)
    {
      double radians = angleDegrees * Math.PI / 180.0;
      return new Point(cx + radius * Math.Cos(radians), cy + radius * Math.Sin(radians));
    }

    private static double OperationActivity(MagOperation operation)
      => operation switch
      {
        MagOperation.Idle => 0.10,
        MagOperation.Booting => 0.28,
        MagOperation.Discovering or MagOperation.Analysing or MagOperation.HealthChecking => 0.36,
        MagOperation.Verifying => 0.48,
        MagOperation.Updating => 0.58,
        MagOperation.Formatting or MagOperation.Partitioning or MagOperation.SecureErasing or MagOperation.Executing => 0.72,
        MagOperation.ShuttingDown => 0.12,
        _ => 0.24
      };

    private static double UpdateActivity(MagUpdateState state)
      => state switch
      {
        MagUpdateState.Checking => 0.22,
        MagUpdateState.Available => 0.42,
        MagUpdateState.ChecksumVerification or MagUpdateState.SignatureVerification => 0.60,
        MagUpdateState.Extracting or MagUpdateState.Staging or MagUpdateState.Installing => 0.74,
        MagUpdateState.Completed => 0.98,
        _ => 0.001
      };

    private static string IntegrityText(MagIntegrityState state)
      => state switch
      {
        MagIntegrityState.Sha256Verified => "SHA-256 VERIFIED",
        MagIntegrityState.SignatureVerified => "SIGNATURE VERIFIED",
        _ => state.ToString().ToUpperInvariant()
      };

    private static SolidColorBrush Brush(string hex) => new(ParseColor(hex));

    private static Color ParseColor(string hex)
    {
      string value = hex.TrimStart('#');
      if (value.Length == 6) value = "FF" + value;
      return Color.FromArgb(
        Convert.ToByte(value[0..2], 16),
        Convert.ToByte(value[2..4], 16),
        Convert.ToByte(value[4..6], 16),
        Convert.ToByte(value[6..8], 16));
    }

    private static string WithAlpha(string hex, int alpha)
    {
      string rgb = hex.TrimStart('#');
      if (rgb.Length == 8) rgb = rgb[2..];
      byte safeAlpha = (byte)Math.Clamp(alpha, 0, 255);
      return $"#{safeAlpha:X2}{rgb}";
    }
  }
}

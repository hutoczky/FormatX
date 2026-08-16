using System;
using FormatX.Services;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Automation;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using Windows.Foundation;
using Windows.UI;

namespace FormatX;

/// <summary>
/// Product-side expression of the FormatX signature MAG.
/// It lives in the top-right title region, breathes while idle, reacts to work,
/// and opens the same six-part system architecture used by the public site.
/// </summary>
internal sealed class SignatureMagController
{
    private readonly Window _window;
    private readonly FrameworkElement _root;
    private readonly Button _button;
    private readonly Grid _visual;
    private readonly Polygon _core;
    private readonly Polygon _innerCore;
    private readonly Ellipse _ringA;
    private readonly Ellipse _ringB;
    private readonly Ellipse _statusDot;
    private readonly CompositeTransform _coreTransform;
    private readonly CompositeTransform _ringATransform;
    private readonly CompositeTransform _ringBTransform;
    private readonly DispatcherTimer _timer;
    private readonly TextBlock _flyoutState;
    private readonly ProgressBar? _progress;
    private readonly bool _english;
    private double _time;
    private double _boost;
    private double _activity;

    private SignatureMagController(Window window, FrameworkElement root, Grid titleGrid)
    {
        _window = window;
        _root = root;
        _english = SettingsService.Current.Language.StartsWith("en", StringComparison.OrdinalIgnoreCase);

        _visual = new Grid
        {
            Width = 38,
            Height = 38,
            IsHitTestVisible = false
        };

        _ringBTransform = NewTransform();
        _ringA = new Ellipse
        {
            Width = 31,
            Height = 31,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center,
            StrokeThickness = 1,
            Stroke = Brush(96, 111, 234, 255),
            Opacity = 0.42,
            RenderTransformOrigin = new Point(.5, .5),
            RenderTransform = _ringBTransform
        };

        _ringATransform = NewTransform();
        _ringB = new Ellipse
        {
            Width = 25,
            Height = 25,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center,
            StrokeThickness = 1,
            Stroke = Brush(122, 177, 102, 255),
            Opacity = 0.52,
            RenderTransformOrigin = new Point(.5, .5),
            RenderTransform = _ringATransform
        };

        _coreTransform = NewTransform();
        _core = Star(30, new LinearGradientBrush
        {
            StartPoint = new Point(0, 0),
            EndPoint = new Point(1, 1),
            GradientStops =
            {
                new GradientStop { Color = Color.FromArgb(255, 235, 255, 255), Offset = 0 },
                new GradientStop { Color = Color.FromArgb(235, 82, 229, 255), Offset = .38 },
                new GradientStop { Color = Color.FromArgb(215, 91, 109, 255), Offset = .68 },
                new GradientStop { Color = Color.FromArgb(225, 188, 91, 255), Offset = 1 }
            }
        });
        _core.Opacity = .92;
        _core.RenderTransformOrigin = new Point(.5, .5);
        _core.RenderTransform = _coreTransform;

        _innerCore = Star(15, Brush(232, 232, 255, 255));
        _innerCore.Opacity = .78;

        var reactor = new Ellipse
        {
            Width = 5,
            Height = 5,
            Fill = Brush(255, 244, 255, 255),
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center
        };

        _statusDot = new Ellipse
        {
            Width = 5,
            Height = 5,
            Fill = Brush(255, 104, 242, 255),
            HorizontalAlignment = HorizontalAlignment.Right,
            VerticalAlignment = VerticalAlignment.Bottom,
            Margin = new Thickness(0, 0, 2, 2)
        };

        _visual.Children.Add(_ringA);
        _visual.Children.Add(_ringB);
        _visual.Children.Add(_core);
        _visual.Children.Add(_innerCore);
        _visual.Children.Add(reactor);
        _visual.Children.Add(_statusDot);

        _button = new Button
        {
            Width = 46,
            Height = 46,
            MinWidth = 46,
            MinHeight = 46,
            Padding = new Thickness(4),
            Margin = new Thickness(0, 0, 10, 0),
            HorizontalAlignment = HorizontalAlignment.Right,
            VerticalAlignment = VerticalAlignment.Center,
            Background = Brush(0, 0, 0, 0),
            BorderBrush = Brush(38, 112, 228, 255),
            BorderThickness = new Thickness(1),
            CornerRadius = new CornerRadius(23),
            Content = _visual
        };
        AutomationProperties.SetName(_button, _english
            ? "FormatX Core – system state and architecture"
            : "FormatX MAG – rendszerállapot és rendszerarchitektúra");
        ToolTipService.SetToolTip(_button, _english
            ? "FormatX Core • System state • Open architecture"
            : "FormatX MAG • Rendszerállapot • Architektúra megnyitása");
        Grid.SetColumn(_button, 1);
        titleGrid.Children.Add(_button);

        _flyoutState = new TextBlock
        {
            Text = "SYSTEM / NOMINAL",
            FontSize = 11,
            CharacterSpacing = 140,
            Opacity = .72,
            Margin = new Thickness(4, 0, 4, 8)
        };
        _button.Flyout = BuildArchitectureFlyout();
        _button.Click += (_, _) => _boost = 1;
        _button.PointerEntered += (_, _) => _boost = Math.Max(_boost, .34);
        _button.PointerPressed += (_, _) => _boost = 1;

        _progress = _root.FindName("GlobalProgressBar") as ProgressBar;
        if (_progress != null)
        {
            _activity = NormalizeProgress(_progress.Value);
            _progress.ValueChanged += (_, e) =>
            {
                _activity = NormalizeProgress(e.NewValue);
                if (e.NewValue > 0 && e.NewValue < 100) _boost = 1;
                UpdateStateLabel(e.NewValue);
            };
        }

        _timer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(33) };
        _timer.Tick += (_, _) => Tick();
        _timer.Start();
        _window.Closed += (_, _) => _timer.Stop();
    }

    public static void Attach(Window window)
    {
        try
        {
            if (window.Content is not FrameworkElement root) return;
            var titleBar = root.FindName("AppTitleBar") as Border;
            if (titleBar?.Child is not Grid titleGrid) return;
            if (titleGrid.FindName("FormatXSignatureMag") != null) return;

            var controller = new SignatureMagController(window, root, titleGrid);
            controller._button.Name = "FormatXSignatureMag";
            // Keep the controller alive for the window lifetime through Tag.
            controller._button.Tag = controller;
        }
        catch
        {
            // Signature UI must never block the core disk-management application.
        }
    }

    private Flyout BuildArchitectureFlyout()
    {
        var panel = new StackPanel
        {
            Width = 278,
            Spacing = 5,
            Padding = new Thickness(8)
        };
        panel.Children.Add(new TextBlock
        {
            Text = "FORMATX / LIVING ARCHITECTURE",
            FontSize = 12,
            FontWeight = Microsoft.UI.Text.FontWeights.SemiBold,
            CharacterSpacing = 100,
            Margin = new Thickness(4, 2, 4, 2)
        });
        panel.Children.Add(_flyoutState);

        string[] hu = { "MAG / ISO → USB", "IDEGRENDSZER / FORMÁZÁS", "SZERVEK / PARTÍCIÓK", "BIZTONSÁGI SZÍV / SECURE ERASE", "VÁZ / LEMEZ EGÉSZSÉG", "JELADÓ / BEÁLLÍTÁSOK" };
        string[] en = { "CORE / ISO → USB", "NERVOUS SYSTEM / FORMAT", "ORGANS / PARTITIONS", "SECURITY HEART / SECURE ERASE", "SKELETON / DISK HEALTH", "BEACON / SETTINGS" };
        var labels = _english ? en : hu;
        for (var i = 0; i < 6; i++)
        {
            var index = i;
            var b = new Button
            {
                HorizontalAlignment = HorizontalAlignment.Stretch,
                HorizontalContentAlignment = HorizontalAlignment.Left,
                MinHeight = 44,
                Padding = new Thickness(12, 8, 12, 8),
                Content = $"0{i + 1}   {labels[i]}"
            };
            AutomationProperties.SetName(b, $"{en[i]} / {hu[i]}");
            b.Click += (_, _) => Navigate(index);
            panel.Children.Add(b);
        }

        return new Flyout
        {
            Content = panel,
            Placement = Microsoft.UI.Xaml.Controls.Primitives.FlyoutPlacementMode.BottomEdgeAlignedRight
        };
    }

    private void Navigate(int index)
    {
        try
        {
            if (_root.FindName("MainTabView") is Microsoft.UI.Xaml.Controls.TabView tabs && index >= 0 && index < tabs.TabItems.Count)
            {
                tabs.SelectedIndex = index;
                _boost = 1;
            }
            _button.Flyout?.Hide();
        }
        catch { }
    }

    private void Tick()
    {
        _time += .033;
        _boost *= .91;
        if (_boost < .002) _boost = 0;

        // Organic double-beat (lub-dub) + slower breathing, matching the website signature motion.
        var cycle = (_time % 1.72) / 1.72;
        var lub = Gaussian(cycle, .12, .038);
        var dub = Gaussian(cycle, .265, .052);
        var beat = Math.Min(1, lub + dub * .72);
        var breathe = .5 + .5 * Math.Sin(_time * 1.55);
        var live = Math.Min(1.3, _activity * .72 + _boost * .64);

        var coreScale = .94 + beat * .075 + breathe * .018 + live * .035;
        _coreTransform.ScaleX = coreScale;
        _coreTransform.ScaleY = coreScale;
        _coreTransform.Rotation = Math.Sin(_time * .42) * 1.6;

        var ringA = .91 + beat * .16 + live * .045;
        _ringATransform.ScaleX = ringA;
        _ringATransform.ScaleY = ringA;
        _ringATransform.Rotation = (_time * 12) % 360;

        var ringB = .95 + dub * .12 + breathe * .025 + live * .035;
        _ringBTransform.ScaleX = ringB;
        _ringBTransform.ScaleY = ringB;
        _ringBTransform.Rotation = -(_time * 8.5) % 360;

        _core.Opacity = Math.Clamp(.73 + beat * .18 + live * .08, .70, 1);
        _innerCore.Opacity = Math.Clamp(.56 + dub * .22 + live * .13, .54, .96);
        _ringA.Opacity = Math.Clamp(.27 + beat * .32 + live * .13, .25, .88);
        _ringB.Opacity = Math.Clamp(.22 + dub * .30 + live * .11, .20, .76);
        _statusDot.Opacity = Math.Clamp(.55 + beat * .35 + live * .10, .5, 1);
    }

    private void UpdateStateLabel(double value)
    {
        if (value > 0 && value < 100)
        {
            _flyoutState.Text = $"SYSTEM / ACTIVE / {value:0}%";
            _statusDot.Fill = Brush(255, 238, 253, 255);
        }
        else if (value >= 100)
        {
            _flyoutState.Text = "SYSTEM / VERIFIED";
            _statusDot.Fill = Brush(255, 126, 255, 190);
        }
        else
        {
            _flyoutState.Text = "SYSTEM / NOMINAL";
            _statusDot.Fill = Brush(255, 104, 242, 255);
        }
    }

    private static double NormalizeProgress(double value) => value > 0 && value < 100 ? .35 + value / 100 * .65 : value >= 100 ? .24 : .08;
    private static double Gaussian(double x, double mean, double sigma)
    {
        var d = (x - mean) / sigma;
        return Math.Exp(-.5 * d * d);
    }

    private static CompositeTransform NewTransform() => new() { CenterX = 19, CenterY = 19 };
    private static SolidColorBrush Brush(byte a, byte r, byte g, byte b) => new(Color.FromArgb(a, r, g, b));

    private static Polygon Star(double size, Brush fill)
    {
        var s = size;
        var c = s / 2;
        var a = s * .34;
        var b = s * .66;
        return new Polygon
        {
            Width = s,
            Height = s,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center,
            Stretch = Stretch.Fill,
            Fill = fill,
            Points = new PointCollection
            {
                new(c, 0), new(b, a), new(s, c), new(b, b), new(c, s), new(a, b), new(0, c), new(a, a)
            }
        };
    }
}

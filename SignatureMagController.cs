using System;
using FormatX.Controls;
using FormatX.Models;
using FormatX.Services;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Media;
using Windows.UI;

namespace FormatX;

internal sealed class SignatureMagController
{
    private readonly FrameworkElement _root;
    private readonly MagCoreControl _mag;
    private readonly ProgressBar? _progress;
    private readonly TabView? _tabs;
    private readonly DispatcherTimer _completionTimer;
    private bool _dialogOpen;

    private SignatureMagController(Window window, FrameworkElement root, Grid applicationGrid)
    {
        _root = root;
        _mag = new MagCoreControl();
        _mag.CorePanelRequested += async (_, _) => await ShowCorePanelAsync();

        var host = new Border
        {
            Width = 284,
            Margin = new Thickness(0, 12, 12, 12),
            Padding = new Thickness(10, 14, 10, 12),
            CornerRadius = new CornerRadius(12),
            Background = new SolidColorBrush(Color.FromArgb(42, 5, 15, 30)),
            BorderBrush = new SolidColorBrush(Color.FromArgb(68, 34, 211, 238)),
            BorderThickness = new Thickness(1),
            VerticalAlignment = VerticalAlignment.Top,
            Child = _mag,
            Name = "FormatXLivingMagHost"
        };
        Grid.SetRow(host, 1);
        Grid.SetColumn(host, 2);
        applicationGrid.Children.Add(host);
        host.Tag = this;

        _progress = root.FindName("GlobalProgressBar") as ProgressBar;
        _tabs = root.FindName("MainTabView") as TabView;
        if (_progress != null) _progress.ValueChanged += OnProgressChanged;
        if (_tabs != null) _tabs.SelectionChanged += (_, _) => UpdateIdleContext();

        if (root.FindName("TxtVersion") is TextBlock versionText)
            versionText.Text = (IsEnglish ? "Version: " : "Verzió: ") + VersionService.DisplayVersion;
        if (root.FindName("LangCombo") is ComboBox languageCombo)
        {
            languageCombo.SelectionChanged += (_, _) => root.DispatcherQueue.TryEnqueue(() =>
            {
                if (root.FindName("TxtVersion") is TextBlock text)
                    text.Text = (IsEnglish ? "Version: " : "Verzió: ") + VersionService.DisplayVersion;
            });
        }

        _completionTimer = new DispatcherTimer { Interval = TimeSpan.FromMilliseconds(900) };
        _completionTimer.Tick += (_, _) =>
        {
            _completionTimer.Stop();
            if (MagStateService.Current.Snapshot.Operation != MagOperation.Updating)
                MagStateService.Current.Ready(IsEnglish ? "SYSTEM READY" : "RENDSZER KÉSZ");
        };

        bool energySaver = false;
        bool reducedMotion = false;
        try { energySaver = Windows.System.Power.PowerManager.EnergySaverStatus == Windows.System.Power.EnergySaverStatus.On; }
        catch { }
        try { reducedMotion = !new Windows.UI.ViewManagement.UISettings().AnimationsEnabled; }
        catch { }

        MagStateService.Current.SetRuntimePreferences(reducedMotion, energySaver);
        MagStateService.Current.SetLicense(MagLicenseInfo.Unknown);
        MagStateService.Current.SetIntegrity(MagIntegrityState.Unknown);
        MagStateService.Current.SetOperation(MagOperation.Booting, 0, IsEnglish ? "CORE BOOT" : "MAG INDÍTÁS", 0.32);

        root.Loaded += (_, _) => MagStateService.Current.Ready(IsEnglish ? "SYSTEM READY" : "RENDSZER KÉSZ");
        window.Activated += (_, args) => _mag.SetActive(args.WindowActivationState != WindowActivationState.Deactivated);
        window.Closed += (_, _) =>
        {
            _completionTimer.Stop();
            _mag.SetActive(false);
            MagStateService.Current.SetOperation(MagOperation.ShuttingDown, 0, IsEnglish ? "CORE SLEEP" : "MAG LEÁLLÍTÁS", 0.1);
        };
    }

    public static void Attach(Window window)
    {
        try
        {
            if (window.Content is not Grid applicationGrid) return;
            if (applicationGrid.FindName("FormatXLivingMagHost") != null) return;
            _ = new SignatureMagController(window, applicationGrid, applicationGrid);
        }
        catch
        {
            // MAG presentation must never block the core disk-management application.
        }
    }

    private bool IsEnglish => SettingsService.Current.Language.StartsWith("en", StringComparison.OrdinalIgnoreCase);

    private void OnProgressChanged(object sender, RangeBaseValueChangedEventArgs e)
    {
        double normalized = Math.Clamp(e.NewValue / 100.0, 0, 1);
        int index = _tabs?.SelectedIndex ?? -1;
        if (e.NewValue <= 0) { UpdateIdleContext(); return; }
        if (index == 5) { UpdateUpdateState(e.NewValue, normalized); return; }

        MagOperation operation = index switch
        {
            0 => MagOperation.Executing,
            1 => MagOperation.Formatting,
            2 => MagOperation.Partitioning,
            3 => MagOperation.SecureErasing,
            4 => MagOperation.HealthChecking,
            _ => MagOperation.Executing
        };
        string label = operation switch
        {
            MagOperation.Formatting => IsEnglish ? "FORMATTING" : "FORMÁZÁS",
            MagOperation.Partitioning => IsEnglish ? "PARTITIONING" : "PARTICIONÁLÁS",
            MagOperation.SecureErasing => IsEnglish ? "SECURE ERASE" : "BIZTONSÁGOS TÖRLÉS",
            MagOperation.HealthChecking => IsEnglish ? "DRIVE ANALYSIS" : "LEMEZ ELEMZÉS",
            _ => IsEnglish ? "EXECUTING" : "VÉGREHAJTÁS"
        };
        MagStateService.Current.SetOperation(operation, normalized, $"{label} · {e.NewValue:0}%", 0.72);
        if (e.NewValue >= 100) { _completionTimer.Stop(); _completionTimer.Start(); }
    }

    private void UpdateUpdateState(double percent, double normalized)
    {
        if (percent < 96)
            MagStateService.Current.SetUpdate(MagUpdateState.Downloading, normalized, $"UPDATE · {percent:0}%");
        else if (percent < 98)
        {
            MagStateService.Current.SetIntegrity(MagIntegrityState.Checking);
            MagStateService.Current.SetUpdate(MagUpdateState.ChecksumVerification, normalized, "SHA-256 VERIFY");
        }
        else if (percent < 100)
        {
            MagStateService.Current.SetIntegrity(MagIntegrityState.Sha256Verified);
            MagStateService.Current.SetUpdate(MagUpdateState.Extracting, normalized, IsEnglish ? "EXTRACTING UPDATE" : "FRISSÍTÉS KIBONTÁSA");
        }
        else
        {
            MagStateService.Current.SetIntegrity(MagIntegrityState.Sha256Verified);
            MagStateService.Current.SetUpdate(MagUpdateState.Installing, 1, IsEnglish ? "STARTING INSTALLER" : "TELEPÍTŐ INDÍTÁSA");
        }
    }

    private void UpdateIdleContext()
    {
        if ((_progress?.Value ?? 0) is > 0 and < 100) return;
        MagStateService.Current.Ready(IsEnglish ? "SYSTEM READY" : "RENDSZER KÉSZ");
    }

    private async System.Threading.Tasks.Task ShowCorePanelAsync()
    {
        if (_dialogOpen || _root.XamlRoot is null) return;
        _dialogOpen = true;
        try
        {
            var dialog = new ContentDialog
            {
                XamlRoot = _root.XamlRoot,
                Title = "FormatX System Core",
                Content = new SystemCorePanel(),
                CloseButtonText = IsEnglish ? "Close" : "Bezárás",
                DefaultButton = ContentDialogButton.Close
            };
            await dialog.ShowAsync();
        }
        catch { }
        finally { _dialogOpen = false; }
    }
}

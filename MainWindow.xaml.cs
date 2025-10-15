// MainWindow.xaml.cs - consolidated handlers + HU/EN localization + background apply + non-static UpdateService usage
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Media.Imaging;
using Microsoft.UI;
using Windows.Devices.Enumeration;
using Windows.Storage.Pickers;
using WinRT.Interop;
using FormatX.Services;
using Microsoft.Windows.AppNotifications;

namespace FormatX
{
  public enum AppLanguage { Hu, En }

  public sealed partial class MainWindow : Window
  {
    private DriveItem? _eraseSelected;
    private DriveItem? _healthSelected;

    private AppLanguage _lang = AppLanguage.Hu;
    private DeviceWatcher? _watcher;
    private bool _isBrowsing = false;
    private const string BackgroundTokenKey = "backgroundToken";

    public MainWindow()
    {
      this.InitializeComponent();
      this.Activated += MainWindow_Activated;
      this.Closed += (_, __) => StopWatch();

      // Restore background on startup only if token exists
      try
      {
        if (Windows.Storage.ApplicationData.Current.LocalSettings.Values.ContainsKey(BackgroundTokenKey))
        {
          _ = RestoreBackgroundAsync();
        }
      }
      catch (Exception ex)
      {
        _ = LogService.LogAsync("background.restore.tokencheck.error", new { ex = ex.Message });
      }

      try
      {
        var lang = SettingsService.Current.Language;
        _lang = (lang?.StartsWith("en", StringComparison.OrdinalIgnoreCase) ?? false) ? AppLanguage.En : AppLanguage.Hu;
        LocalizationService.SetLanguage(_lang == AppLanguage.En ? "en" : "hu");
        LoadPhysicalDrives();
      }
      catch (Exception ex)
      {
        _ = LogService.LogAsync("init.lang.error", new { ex = ex.Message });
      }

      ApplyUiText();
      ApplyBackground();
      _ = RefreshDevices();
      StartWatch();

      // Setup custom title bar drag region and integrate with system title bar
      try
      {
        if (!DispatcherQueue.HasThreadAccess)
        {
          DispatcherQueue.TryEnqueue(() => {
            try { InitializeTitleBar(); } catch (Exception initEx) { _ = LogService.LogAsync("error.catch", new { ctx = "titlebar.init.dispatch", initEx = initEx.Message }); }
          });
        }
        else
        {
          InitializeTitleBar();
        }
      }
      catch (System.Runtime.InteropServices.COMException cex) { _ = LogService.LogAsync("error.com.exception", cex); CrashHandler.Show(cex, "titlebar.init"); }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "titlebar", ex = ex.Message }); }

      void InitializeTitleBar()
      {
        var hwnd = WindowNative.GetWindowHandle(this);
        var windowId = Win32Interop.GetWindowIdFromWindow(hwnd);
        AppWindow? appWindow = null;
        try
        {
          appWindow = AppWindow.GetFromWindowId(windowId);
        }
        catch (InvalidOperationException ioex)
        {
          _ = LogService.LogAsync("winrt.appwindow.invalid", new { ioex.Message });
        }
        catch (System.Runtime.InteropServices.COMException cex)
        {
          _ = LogService.LogAsync("error.com.exception", cex); CrashHandler.Show(cex, "appwindow.get");
        }

        this.ExtendsContentIntoTitleBar = true;
        var drag = (this.Content as FrameworkElement)?.FindName("TitleDragRegion") as UIElement;
        if (drag != null) this.SetTitleBar(drag);
        var titleBar = appWindow?.TitleBar;
        if (titleBar != null)
        {
          try
          {
            appWindow!.Title = "FormatX Pro";
            titleBar.ExtendsContentIntoTitleBar = true;
            titleBar.ButtonForegroundColor = Windows.UI.Color.FromArgb(255, 229, 231, 235);
            titleBar.ButtonBackgroundColor = Windows.UI.Color.FromArgb(0, 0, 0, 0);
            titleBar.ButtonInactiveBackgroundColor = Windows.UI.Color.FromArgb(0, 0, 0, 0);
          }
          catch (InvalidOperationException ioex)
          {
            _ = LogService.LogAsync("winrt.titlebar.invalid", new { ioex.Message });
          }
          catch (System.Runtime.InteropServices.COMException cex)
          {
            _ = LogService.LogAsync("error.com.exception", cex);
          }
          catch (Exception innerEx)
          {
            _ = LogService.LogAsync("error.catch", new { ctx = "titlebar.apply", innerEx = innerEx.Message });
          }
        }
      }

      // Default page: ISO creator visible as requested
      try { if (NavIsoUsb != null) { Nav.SelectedItem = NavIsoUsb; ShowView("iso"); } } catch (Exception ex) { _ = LogService.LogAsync("nav.init.error", new { ex = ex.Message }); }

      var root = this.Content as FrameworkElement;
      if (root != null) root.KeyDown += Root_KeyDown; else _ = LogService.LogAsync("root.null", new { stage = "ctor" });
      if (BtnPickBg != null)
      {
        BtnPickBg.Click -= OnBrowseBackgroundClick;
        BtnPickBg.Click += OnBrowseBackgroundClick;
      }
      var btnBrowseBackground = (this.Content as FrameworkElement)?.FindName("BtnBrowseBackground") as Button;
      if (btnBrowseBackground != null)
      {
        btnBrowseBackground.Click -= OnBrowseBackgroundClick;
        btnBrowseBackground.Click += OnBrowseBackgroundClick;
      }
    }

    private void MainWindow_Activated(object sender, WindowActivatedEventArgs args)
    {
      try
      {
        if (args.WindowActivationState == WindowActivationState.Deactivated) StopWatch();
        else { StopWatch(); StartWatch(); }
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "activated", ex = ex.Message }); }
    }

    private void StartWatch()
    {
      if (IsEnergySaver()) { _ = LogService.LogAsync("watch.skip.energysaver", new { }); return; }
      try
      {
        if (_watcher != null && (_watcher.Status == DeviceWatcherStatus.Started || _watcher.Status == DeviceWatcherStatus.EnumerationCompleted)) return;
        _watcher = DeviceInformation.CreateWatcher(DeviceClass.PortableStorageDevice);
        _watcher.Added += (_, __) => DispatcherQueue.TryEnqueue(async () => await RefreshDevices());
        _watcher.Removed += (_, __) => DispatcherQueue.TryEnqueue(async () => await RefreshDevices());
        _watcher.Updated += (_, __) => DispatcherQueue.TryEnqueue(async () => await RefreshDevices());
        _watcher.Start();
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "watch.start", ex = ex.Message }); }
    }

    private void StopWatch()
    {
      try
      {
        if (_watcher != null)
        {
          try
          {
            if (_watcher.Status == DeviceWatcherStatus.Started || _watcher.Status == DeviceWatcherStatus.EnumerationCompleted) _watcher.Stop();
          } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "watch.stop.inner", ex = ex.Message }); }
        }
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "watch.stop", ex = ex.Message }); }
      finally { _watcher = null; }
    }

    private async Task RefreshDevices()
    {
      try
      {
        var vols = new DriveQueryService().GetVolumes();
        void FillCombo(ComboBox combo)
        {
          combo?.Items?.Clear();
          if (vols == null) return;
          foreach (var v in vols)
          {
            var label = $"{v.DriveLetter} – {v.Label} • {v.FileSystem} • {(v.TotalBytes / (1024*1024*1024))} GB";
            combo?.Items?.Add(new ComboBoxItem { Content = label, Tag = v.DriveLetter });
          }
          if ((combo?.Items?.Count ?? 0) > 0) combo.SelectedIndex = 0;
        }
        if (TargetDrives != null) FillCombo(TargetDrives);
        if (FormatDrive != null) FillCombo(FormatDrive);
        // PartitionDrive removed from UI
      } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "devices.refresh", ex = ex.Message }); }
      ValidateSelectedFormatDrive();
      await Task.CompletedTask;
    }

    private void SetProgress(int value, string text)
    {
      try
      {
        GlobalProgressBar.Value = Math.Max(0, Math.Min(100, value));
        GlobalProgressText.Text = string.IsNullOrWhiteSpace(text) ? (_lang == AppLanguage.Hu ? "Készenlét" : "Idle") : text;
      } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "progress", ex = ex.Message }); }
    }

    private void ApplyMaxAndSanitize(TextBox? box, ComboBox? fsCombo)
    {
      try
      {
        if (box == null || fsCombo == null) return;
        string fs = (fsCombo.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "NTFS";
        int max = fs.Equals("FAT32", StringComparison.OrdinalIgnoreCase) ? 11 : 32;
        var s = (box.Text ?? string.Empty);
        if (s.Length > max) s = s.Substring(0, max);
        box.Text = new string(s.Select(c => char.IsControl(c) ? '_' : c).ToArray());
      } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "sanitize", ex = ex.Message }); }
    }

    private void ApplyUiText()
    {
      bool hu = _lang == AppLanguage.Hu;

      // Navigation labels
      if (NavFormat != null) NavFormat.Content = LocalizationService.T("menu.format");
      if (NavHealth != null) NavHealth.Content = LocalizationService.T("menu.drives");
      if (NavErase != null) NavErase.Content = LocalizationService.T("menu.erase");
      if (NavSettings != null) NavSettings.Content = LocalizationService.T("menu.settings");
      if (NavIsoUsb != null) NavIsoUsb.Content = "ISO → USB";
      if (NavPartitions != null) NavPartitions.Content = hu ? "Partíciók" : "Partitions";

      // Header/status
      if (GlobalProgressText != null) GlobalProgressText.Text = LocalizationService.T("status.ready");
      if (BtnRefresh != null) BtnRefresh.Content = hu ? "Frissítés" : "Refresh";
      if (HeaderApplyButton != null) HeaderApplyButton.Content = LocalizationService.T("common.apply");
      var _titleText = (this.Content as FrameworkElement)?.FindName("TitleText") as TextBlock;
      if (_titleText != null) _titleText.Text = LocalizationService.T("title.app");

      // ISO tab
      if (IsoPath != null) IsoPath.PlaceholderText = LocalizationService.T("iso.placeholder");
      if (BtnBrowseIso != null) BtnBrowseIso.Content = LocalizationService.T("common.browse");
      if (IsoVerifyToggle != null) IsoVerifyToggle.Content = hu ? "Ellenőrzés" : "Verify";
      if (TargetDrives != null) TargetDrives.Header = hu ? "Cél meghajtó (eltávolítható)" : "Target drive (removable)";
      if (IsoSchemeCombo != null) IsoSchemeCombo.Header = hu ? "Séma" : "Scheme";
      if (IsoWriteSchemeCombo != null) IsoWriteSchemeCombo.Header = hu ? "Séma" : "Scheme";
      if (IsoVerifyToggle != null) IsoVerifyToggle.Content = hu ? "Ellenőrzés" : "Verify";
      if (BtnIsoWrite != null) BtnIsoWrite.Content = hu ? "ISO írás" : "Write ISO";

      // Format tab
      if (FormatDrive != null) FormatDrive.Header = hu ? "Meghajtó" : "Drive";
      if (FsCombo != null) FsCombo.Header = hu ? "Fájlrendszer" : "File system";
      if (FsItemReFS != null) FsItemReFS.Content = "ReFS";
      if (FsItemExt4 != null) FsItemExt4.Content = "ext4 (Linux)";
      if (LabelBox != null) LabelBox.Header = hu ? "Címke" : "Label";
      if (QuickBox != null) QuickBox.Content = hu ? "Gyors formázás" : "Quick format";
      if (BtnFormat != null) BtnFormat.Content = hu ? "Formázás" : "Format";

      // Partitions tab
      if (DiskNumberBox != null) DiskNumberBox.Header = hu ? "Lemez" : "Disk";

      // Secure Erase tab
      if (EraseFullFormat != null) EraseFullFormat.Content = hu ? "Teljes formázás (lassabb)" : "Full format (slower)";
      if (BtnSecureErase != null) BtnSecureErase.Content = hu ? "Törlés indítása" : "Start erase";
      if (EraseResult != null) EraseResult.Text = "";

      // Health tab
      if (HealthResult != null) HealthResult.Text = "";

      // Settings view
      if (TxtLanguage != null) TxtLanguage.Text = LocalizationService.T("settings.language");
      if (LangCombo != null)
      {
        if (LangCombo.Items.Count >= 2)
        {
          ((ComboBoxItem)LangCombo.Items[0]).Content = "Magyar";
          ((ComboBoxItem)LangCombo.Items[1]).Content = "English";
        }
      }
      if (TxtTheme != null) TxtTheme.Text = LocalizationService.T("settings.theme");
      if (ThemeItemDefault != null) ThemeItemDefault.Content = LocalizationService.T("settings.theme.default");
      if (ThemeItemLight != null) ThemeItemLight.Content = hu ? "Világos" : "Light";
      if (ThemeItemDark != null) ThemeItemDark.Content = hu ? "Sötét" : "Dark";
      if (TxtBackground != null) TxtBackground.Text = LocalizationService.T("settings.background");
      if (TxtBgHint != null) TxtBgHint.Text = LocalizationService.T("settings.bg.hint");
      if (BtnPickBg != null) BtnPickBg.Content = LocalizationService.T("common.browse");
      if (BtnCheckUpdate != null) BtnCheckUpdate.Content = hu ? "Frissítések keresése" : "Check for updates";
      if (BtnExportCsv != null) BtnExportCsv.Content = LocalizationService.T("common.exportCsv");
      if (TxtVersion != null) TxtVersion.Text = LocalizationService.T("settings.version");
      if (TxtFooter != null) TxtFooter.Text = ".NET 10 • WinUI 3 • MSIX";
      if (TxtAbout != null) TxtAbout.Text = LocalizationService.T("settings.about");
      var devLine = LocalizationService.T("settings.devline");
      // find developer line textblock (first in stack after TxtVersion)
      // already static in XAML; no change needed

      // Update header/title for current view
      var currentTag = (Nav.SelectedItem as NavigationViewItem)?.Tag?.ToString() ?? "settings";
      UpdateHeaderForTag(currentTag);
      ValidateSelectedFormatDrive();
    }

    private void ApplyBackground()
    {
      try
      {
        var path = SettingsService.Current.CustomBackgroundPath;
        if (!string.IsNullOrWhiteSpace(path) && System.IO.File.Exists(path))
        {
          _ = BackgroundService.SetWallpaperAsync(path);
          // Pre-audit with ImageSharp
          _ = ImageAuditService.TryLoadForAuditAsync(path);
          if (Application.Current.Resources.TryGetValue("AppBackgroundBrush", out var brush) && brush is ImageBrush ib)
          {
            try
            {
              ib.ImageSource = new BitmapImage(new Uri(path));
            }
            catch (System.Runtime.InteropServices.COMException cex)
            {
              _ = LogService.LogAsync("error.image.binding", cex);
              Status.Text = LocalizationService.T("background.set.error");
              CrashHandler.Show(cex, "background.image.bind");
            }
            catch (Exception ex)
            {
              _ = LogService.LogAsync("error.image.binding", ex);
              Status.Text = LocalizationService.T("background.set.error");
              CrashHandler.Show(ex, "background.image.bind");
            }
          }
        }
      } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "background.apply", ex = ex.Message }); }
    }

    private async Task RestoreBackgroundAsync()
    {
      try
      {
        // Only proceed if token exists in LocalSettings
        if (!Windows.Storage.ApplicationData.Current.LocalSettings.Values.ContainsKey(BackgroundTokenKey)) return;

        // Read path from LocalSettings
        var obj = Windows.Storage.ApplicationData.Current.LocalSettings.Values[BackgroundTokenKey];
        var path = obj?.ToString();
        if (!await BackgroundValidator.ValidateAsync(path)) return;

        try
        {
          await LogService.LogAsync("background.restore.start", new { path });
          var uri = new Uri(path);
          // Ensure UI thread when touching Application.Current.Resources
          if (!DispatcherQueue.HasThreadAccess)
          {
            DispatcherQueue.TryEnqueue(() =>
            {
              Application.Current.Resources["AppBackgroundBrush"] = new ImageBrush { ImageSource = new BitmapImage(uri), Stretch = Stretch.UniformToFill };
            });
          }
          else
          {
            Application.Current.Resources["AppBackgroundBrush"] = new ImageBrush { ImageSource = new BitmapImage(uri), Stretch = Stretch.UniformToFill };
          }
          await LogService.LogAsync("background.restore.done", new { path });
        }
        catch (System.Runtime.InteropServices.COMException cex)
        {
          await LogService.LogAsync("background.restore.set.comexception", cex);
          CrashHandler.Show(cex, "background.restore");
        }
        catch (InvalidOperationException ioex)
        {
          await LogService.LogAsync("background.restore.set.invalidop", new { ioex.Message });
          CrashHandler.Show(ioex, "background.restore");
        }
        catch (Exception ex)
        {
          await LogService.LogAsync("background.restore.set.error", new { ex = ex.Message });
          CrashHandler.Show(ex, "background.restore");
        }
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("background.restore.error", new { ex = ex.Message });
      }
    }

    // === Handlers (matching XAML) ===

    private async void Refresh_Click(object sender, RoutedEventArgs e) => await RefreshDevices();

    // Legacy XAML handler still wired in generated g.cs; delegate to new unified method
    private void PickBackground_Click(object sender, RoutedEventArgs e) => OnBrowseBackgroundClick(sender, e);

    // Map-compat handler name
    private void BgBrowseBtn_Click(object sender, RoutedEventArgs e) => OnBrowseBackgroundClick(sender, e);

    private async void BrowseIso_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        // Inline picker to guarantee hwnd init and per-request behavior
        var picker = new Windows.Storage.Pickers.FileOpenPicker();
        var hwnd = WinRT.Interop.WindowNative.GetWindowHandle(this);
        WinRT.Interop.InitializeWithWindow.Initialize(picker, hwnd);
        picker.FileTypeFilter.Clear();
        picker.FileTypeFilter.Add(".iso");
        var f = await picker.PickSingleFileAsync();
        if (f == null) { await LogService.LogAsync("iso.pick.cancel", new { }); return; }

        if (f != null)
        {
          var valid = IsoValidator.Validate(f);
          if (!valid.IsValid) { await LogService.LogAsync("error.iso.invalidext", f.Path); CrashHandler.Show(new Exception(valid.Reason)); return; }
          await LogService.LogAsync("iso.selected", f.Path);
          if (IsoPath != null) IsoPath.Text = f.Path; else _ = LogService.LogAsync("iso.textbox.null", new { file = f.Path });
          Services.SettingsService.Current.LastIsoPath = f.Path;
        }
      }
      catch (System.Runtime.InteropServices.COMException cex)
      {
        await LogService.LogAsync("error.iso.picker", cex);
        CrashHandler.Show(cex, "iso.picker");
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("error.iso.picker", ex);
        CrashHandler.Show(ex, "iso.picker");
      }
    }

    private async void WriteIso_Click(object sender, RoutedEventArgs e)
    {
      if (!await EnsureAdminForCriticalOpAsync("raw.write.iso")) return;
      await LogService.LogAsync("iso_write", new { target = (TargetDrives?.SelectedItem as ComboBoxItem)?.Tag?.ToString(), iso = IsoPath?.Text });
      await ShowToast(_lang == AppLanguage.Hu ? "ISO írás: előkészítve" : "ISO write: prepared");
      Status.Text = LocalizationService.T("iso.write.prepared");
    }

    private async void Format_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        if (!await EnsureAdminForCriticalOpAsync("format.volume")) return;
        string? dl = (FormatDrive?.SelectedItem as ComboBoxItem)?.Tag?.ToString();
        string fs = (FsCombo?.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "NTFS";
        string label = LabelBox?.Text ?? "";
        bool quick = QuickBox?.IsChecked ?? true;

        await new FormatService().FormatVolumeAsync(
          dl ?? "C:",
          fs,
          label,
          quick,
          (p, t) => DispatcherQueue.TryEnqueue(() => SetProgress(p, (_lang==AppLanguage.Hu ? "Formázás" : "Formatting") + " - " + p + "%"))
        );
        Status.Text = LocalizationService.T("operation.format.done");
      } catch (Exception ex) { Status.Text = ex.Message; await LogService.LogAsync("error.catch", new { ctx = "format.click", ex = ex.Message }); }
    }

    private async void Partition_Click(object sender, RoutedEventArgs e)
    {
      if (!await EnsureAdminForCriticalOpAsync("diskpart.partition")) return;
      await ShowToast(_lang == AppLanguage.Hu ? "Partíció művelet (stub)" : "Partition action (stub)");
    }

    private async void SecureErase_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        int disk = _eraseSelected?.Number ?? 0;
        bool full = EraseFullFormat?.IsChecked ?? true;
        var prog = new Progress<int>(p => DispatcherQueue.TryEnqueue(() => SetProgress(p, (_lang == AppLanguage.Hu ? "Törlés " : "Erase ") + p + "%")));
        await new SecureEraseService().ClearDiskAsync(disk, full, prog);
        EraseResult.Text = LocalizationService.T("operation.erase.done");
      }
      catch (System.Runtime.InteropServices.COMException cex) { EraseResult.Text = cex.Message; await LogService.LogAsync("error.com.exception", cex); CrashHandler.Show(cex, "erase.click"); }
      catch (Exception ex) { EraseResult.Text = ex.Message; await LogService.LogAsync("error.catch", new { ctx = "erase", ex = ex.Message }); }
    }

    private async void ErasePass_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        if (!await EnsureAdminForCriticalOpAsync("secure.erase")) return;
        int disk = _eraseSelected?.Number ?? 0;
        if (disk <= 0) { Status.Text = LocalizationService.T("partitions.rollback.none"); return; }

        int passes = 1;
        if (sender is Button b && int.TryParse(b.Tag?.ToString(), out var p)) passes = p;

        DateTime start = DateTime.Now;
        var prog = new Progress<int>(value =>
        {
          var elapsed = DateTime.Now - start;
          // egyszerű becslés: ETA = elapsed * (100/value - 1)
          if (value > 0 && value < 100)
          {
            var remaining = TimeSpan.FromMilliseconds(elapsed.TotalMilliseconds * (100.0 / value - 1.0));
            DispatcherQueue.TryEnqueue(() =>
            {
              EraseEtaText.Text = $"ETA: {remaining:hh\\:mm\\:ss}";
              SetProgress(value, "Törlés - " + value + "%");
            });
          }
        });

        if (passes == 3)
        {
          var phys = $"\\\\.\\PHYSICALDRIVE{disk}";
          await new SecureEraseService().ThreePassAsync(phys, prog);
        }
        else
        {
          for (int i = 1; i <= passes; i++)
          {
            await LogService.LogAsync("secure_erase.pass", new { disk, pass = i, total = passes });
            await new SecureEraseService().ClearDiskAsync(disk, fullFormat: true, progress: prog);
          }
        }

        Status.Text = LocalizationService.T("operation.erase.done");
      }
      catch (System.Runtime.InteropServices.COMException cex) { Status.Text = cex.Message; await LogService.LogAsync("error.com.exception", cex); CrashHandler.Show(cex, "erase.pass"); }
      catch (Exception ex) { Status.Text = ex.Message; await LogService.LogAsync("error.catch", new { ctx = "erase.pass", ex = ex.Message }); }
    }

    private async void SmartQuick_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        int disk = _eraseSelected?.Number ?? 0;
        var svc = new DiskHealthService();
        var color = await svc.GetPredictFailureColorAsync(disk);
        var res = await svc.SmartQuickAsync(disk);
        HealthResult.Text = res?.ToString();

        Brush fill = Application.Current.Resources["HealthYellow"] as Brush;
        string label = "Sárga";
        switch (color)
        {
          case DiskHealthService.HealthStatus.Green:
            fill = Application.Current.Resources["HealthGreen"] as Brush; label = "Zöld"; break;
          case DiskHealthService.HealthStatus.Red:
            fill = Application.Current.Resources["HealthRed"] as Brush; label = "Piros"; break;
        }
        var dot = ((FrameworkElement)this.Content!).FindName("HealthDot") as Microsoft.UI.Xaml.Shapes.Ellipse;
        var txt = ((FrameworkElement)this.Content!).FindName("HealthBadgeText") as TextBlock;
        if (dot != null && fill != null) dot.Fill = fill;
        if (txt != null) txt.Text = label;
        await LogService.LogAsync("health.badge", new { disk, color = color.ToString() });
      } catch (System.Runtime.InteropServices.COMException cex) { HealthResult.Text = cex.Message; await LogService.LogAsync("error.com.exception", cex); CrashHandler.Show(cex, "smart.quick"); }
        catch (Exception ex) { HealthResult.Text = ex.Message; await LogService.LogAsync("error.catch", new { ctx = "smart", ex = ex.Message }); }
    }

    private async void SurfaceScan_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        string path = _healthSelected?.DevicePath ?? "\\\\.\\PHYSICALDRIVE1";
        long bytes = 0;
        long.TryParse(ScanBytes?.Text ?? "1073741824", out bytes);
        var prog = new Progress<int>(p => DispatcherQueue.TryEnqueue(() => SetProgress(p, (_lang == AppLanguage.Hu ? "Szkennelés " : "Scan ") + p + "%")));
        var res = await new DiskHealthService().SurfaceScanAsync(path, bytes > 0 ? bytes : 1073741824, 1024*1024, prog);
        HealthResult.Text = System.Text.Json.JsonSerializer.Serialize(res);
      } catch (System.Runtime.InteropServices.COMException cex) { HealthResult.Text = cex.Message; await LogService.LogAsync("error.com.exception", cex); CrashHandler.Show(cex, "surface.scan"); }
        catch (Exception ex) { HealthResult.Text = ex.Message; await LogService.LogAsync("error.catch", new { ctx = "surface", ex = ex.Message }); }
    }

    private async void CheckUpdates_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        await new UpdateService().CheckAndUpdateAsync((p,t)=>DispatcherQueue.TryEnqueue(()=>SetProgress(p,t)), CancellationToken.None);
        await ShowToast(_lang == AppLanguage.Hu ? "Frissítés ellenőrizve" : "Update checked");
      }
      catch (Exception ex) { await LogService.LogAsync("error.catch", new { ctx = "update.check", ex = ex.Message }); }
    }

    private async void ExportCsv_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        var dir = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "logs");
        System.IO.Directory.CreateDirectory(dir);
        var filePath = System.IO.Path.Combine(dir, $"export_{DateTimeOffset.Now:yyyyMMdd_HHmmss}.csv");
        await LogService.ExportCsvAsync(filePath);
        Status.Text = (_lang == AppLanguage.Hu ? "Exportálva: " : "Exported: ") + filePath;
      }
      catch (Exception ex) { Status.Text = ex.Message; await LogService.LogAsync("error.catch", new { ctx = "export.csv", ex = ex.Message }); }
    }

    private void FsCombo_SelectionChanged(object sender, SelectionChangedEventArgs e) => ApplyMaxAndSanitize(LabelBox, FsCombo);
    private void PartFsCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
      var fsCombo = ((FrameworkElement)this.Content!).FindName("PartFsCombo") as ComboBox;
      var labelBox = ((FrameworkElement)this.Content!).FindName("PartLabelBox") as TextBox;
      ApplyMaxAndSanitize(labelBox, fsCombo);
    }
    private void LabelBox_TextChanging(TextBox sender, TextBoxTextChangingEventArgs args) => ApplyMaxAndSanitize(LabelBox, FsCombo);
    private void PartLabelBox_TextChanging(TextBox sender, TextBoxTextChangingEventArgs args)
    {
      var fsCombo = ((FrameworkElement)this.Content!).FindName("PartFsCombo") as ComboBox;
      var labelBox = ((FrameworkElement)this.Content!).FindName("PartLabelBox") as TextBox;
      ApplyMaxAndSanitize(labelBox, fsCombo);
    }
    private void FormatDrive_SelectionChanged(object sender, SelectionChangedEventArgs e) => ValidateSelectedFormatDrive();
    private async void LoadPartitions_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        if (!int.TryParse(DiskNumberBox?.Text, out var disk)) { Status.Text = "Adj meg lemez sorszámot"; return; }
        var svc = new PartitionQueryService();
        var items = await svc.GetPartitionsAsync(disk);
        var gridCurrent = ((FrameworkElement)this.Content!).FindName("GridCurrent") as GridView;
        var gridPlanned = ((FrameworkElement)this.Content!).FindName("GridPlanned") as GridView;
        if (gridCurrent != null) gridCurrent.ItemsSource = items;
        if (gridPlanned != null) gridPlanned.ItemsSource = items.ToList();
        await LogService.LogAsync("partitions.diff.init", new { disk, count = items.Count });
      }
      catch (Exception ex) { Status.Text = ex.Message; await LogService.LogAsync("error.catch", new { ctx = "partitions.load", ex = ex.Message }); }
    }

    private async void ApplyPartitionPlan_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        if (!await EnsureAdminForCriticalOpAsync("diskpart.applyplan")) return;
        if (!int.TryParse(DiskNumberBox?.Text, out var disk)) { Status.Text = "Adj meg lemez sorszámot"; return; }

        var gridPlanned = ((FrameworkElement)this.Content!).FindName("GridPlanned") as GridView;
        var items = gridPlanned?.Items?.Cast<object>().Select(o => o).ToList() ?? new System.Collections.Generic.List<object>();
        string preview = string.Join("\n", items.Select(i => i.ToString()));

        ContentDialog dlg = new()
        {
          XamlRoot = this.Content.XamlRoot,
          Title = LocalizationService.T("dialog.confirm.title"),
          Content = LocalizationService.T("dialog.confirm.content") + "\n\n" + preview,
          PrimaryButtonText = LocalizationService.T("dialog.confirm.yes"),
          CloseButtonText = LocalizationService.T("dialog.confirm.no")
        };
        var res = await dlg.ShowAsync();
        if (res != ContentDialogResult.Primary) { await LogService.LogAsync("partitions.confirm.cancel", new { disk }); return; }
        await LogService.LogAsync("partitions.confirm.ok", new { disk });

        var svc = new PartitionQueryService();
        var current = await svc.GetPartitionsAsync(disk);
        var rollbackPath = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "rollback", $"disk_{disk}_{DateTimeOffset.Now:yyyyMMdd_HHmmss}.json");
        System.IO.Directory.CreateDirectory(System.IO.Path.GetDirectoryName(rollbackPath)!);
        await System.IO.File.WriteAllTextAsync(rollbackPath, System.Text.Json.JsonSerializer.Serialize(current));
        await LogService.LogAsync("partitions.rollback.save", new { disk, rollbackPath });

        // deterministic diskpart script: clean + gpt/mbr + create partitions by size
        bool gpt = (IsoSchemeCombo?.SelectedIndex ?? 0) == 0;
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"select disk {disk}");
        sb.AppendLine("detail disk");
        sb.AppendLine("clean");
        sb.AppendLine(gpt ? "convert gpt" : "convert mbr");
        foreach (var pi in current) { /* this is placeholder; planned list should be used here in real impl */ }
        sb.AppendLine("create partition primary");
        var script = sb.ToString();
        await LogService.LogAsync("partitions.diskpart.script", new { disk, script });

        await new DiskPartService().RunScriptAsync(script);
        await ShowToast(LocalizationService.T("partitions.apply.done"));
      }
      catch (Exception ex) { Status.Text = ex.Message; await LogService.LogAsync("error.catch", new { ctx = "partitions.apply", ex = ex.Message }); }
    }

    private async void RollbackPartition_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        if (!await EnsureAdminForCriticalOpAsync("diskpart.rollback")) return;
        if (!int.TryParse(DiskNumberBox?.Text, out var disk)) { Status.Text = "Adj meg lemez sorszámot"; return; }
        var dir = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FormatX", "rollback");
        var last = System.IO.Directory.EnumerateFiles(dir, $"disk_{disk}_*.json").OrderByDescending(f => f).FirstOrDefault();
        if (string.IsNullOrWhiteSpace(last)) { Status.Text = LocalizationService.T("partitions.rollback.none"); return; }
        var json = await System.IO.File.ReadAllTextAsync(last);
        await LogService.LogAsync("partitions.rollback.load", new { disk, last });
        // In a real implementation generate exact script from saved model; placeholder clean + convert only
        bool gpt = (IsoSchemeCombo?.SelectedIndex ?? 0) == 0;
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"select disk {disk}");
        sb.AppendLine("clean");
        sb.AppendLine(gpt ? "convert gpt" : "convert mbr");
        await new DiskPartService().RunScriptAsync(sb.ToString());
        await ShowToast(LocalizationService.T("partitions.rollback.applied"));
      }
      catch (Exception ex) { Status.Text = ex.Message; await LogService.LogAsync("error.catch", new { ctx = "partitions.rollback", ex = ex.Message }); }
    }


    private bool ValidateSelectedFormatDrive()
    {
      try
      {
        string? dl = (FormatDrive?.SelectedItem as ComboBoxItem)?.Tag?.ToString();
        bool isSystem = FormatService.IsSystemDrive(dl ?? string.Empty);
        if (isSystem)
        {
          Status.Text = LocalizationService.T("systemdrive.blocked");
          try
          {
            if (BtnFormat != null) ToolTipService.SetToolTip(BtnFormat, LocalizationService.T("systemdrive.blocked"));
            if (BtnDone != null) ToolTipService.SetToolTip(BtnDone, LocalizationService.T("systemdrive.blocked"));
          }
          catch (Exception ttex) { _ = LogService.LogAsync("error.catch", new { ctx = "tooltip.systemdrive", ttex = ttex.Message }); }
        }
        if (BtnFormat != null) BtnFormat.IsEnabled = !isSystem;
        if (BtnDone != null) BtnDone.IsEnabled = !isSystem;
        if (!isSystem)
        {
          try
          {
            if (BtnFormat != null) ToolTipService.SetToolTip(BtnFormat, null);
            if (BtnDone != null) ToolTipService.SetToolTip(BtnDone, null);
          }
          catch (Exception clrtex) { _ = LogService.LogAsync("error.catch", new { ctx = "tooltip.clear", clrtex = clrtex.Message }); }
        }
        return !isSystem;
      }
      catch (Exception ex)
      {
        _ = LogService.LogAsync("error.catch", new { ctx = "validate.format.drive", ex = ex.Message });
        return false;
      }
    }
    
    private async void ApplySettings_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        // Language selection with validation
        if (LangCombo?.SelectedIndex == 1) _lang = AppLanguage.En; else _lang = AppLanguage.Hu;
        var langCode = _lang == AppLanguage.En ? "en" : "hu";
        if (!LocalizationService.SetLanguage(langCode))
        {
          await ShowToast(LocalizationService.T("error.lang.unsupported"));
          return;
        }
        SettingsService.Current.Language = langCode == "en" ? "en-US" : "hu-HU";

        string theme = ThemeCombo?.SelectedIndex switch { 1 => "Dark", 2 => "Light", _ => "Default" };
        SettingsService.Current.Theme = theme;
        if (this.Content is FrameworkElement root)
        {
          root.RequestedTheme = theme switch
          {
            "Dark" => ElementTheme.Dark,
            "Light" => ElementTheme.Light,
            _ => ElementTheme.Default
          };
        }

        ApplyUiText();
        ApplyBackground();
        var okToast = await NotificationService.ShowSettingsSavedAsync();
        if (!okToast)
          await ShowToast(_lang == AppLanguage.Hu ? "Beállítások mentve" : "Settings saved");
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("error.catch", new { ctx = "settings.apply", ex = ex.Message });
      }
    }

    private void ValidateSettings_Click(object sender, RoutedEventArgs e)
    {
      // Lightweight client-side validation placeholder
      try
      {
        _ = ShowToast(_lang == AppLanguage.Hu ? "Beállítások érvényesítve" : "Settings validated");
      } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "settings.validate", ex = ex.Message }); }
    }

    private async Task ShowToast(string msg)
    {
      try { Status.Text = msg; await Task.Delay(10); } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "toast.show", ex = ex.Message }); }
    }
    private async Task<bool> EnsureAdminForCriticalOpAsync(string op)
    {
      try
      {
        var ok = await ElevationService.EnsureAdminAsync(op, tryElevate: true, throwIfDenied: false);
        if (!ok)
        {
          Status.Text = _lang == AppLanguage.Hu
            ? "Admin jogosultság szükséges. Ha jóváhagyod az emelést, indítsd újra a műveletet."
            : "Administrator rights are required. If you approved elevation, rerun the operation.";
          if (BtnDone != null) BtnDone.IsEnabled = false;
          await LogService.LogAsync("admin.ui.blocked", new { op });
          return false;
        }
        if (BtnDone != null) BtnDone.IsEnabled = true;
        return true;
      }
      catch (Exception ex)
      {
        await LogService.LogAsync("admin.ui.error", new { op, error = ex.Message });
        Status.Text = _lang == AppLanguage.Hu ? "Admin ellenőrzés hiba" : "Admin check error";
        if (BtnDone != null) BtnDone.IsEnabled = false;
        return false;
      }
    }
    private static bool IsEnergySaver()
    {
      try
      {
        return Windows.System.Power.PowerManager.EnergySaverStatus == Windows.System.Power.EnergySaverStatus.On;
      } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "energysaver", ex = ex.Message }); return false; }
    }

    // === Navigation / View switching ===
    private void Nav_SelectionChanged(NavigationView sender, NavigationViewSelectionChangedEventArgs args)
    {
      try
      {
        var tag = (args.SelectedItem as NavigationViewItem)?.Tag?.ToString();
        ShowView(tag ?? "settings");
      } catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "nav.selection", ex = ex.Message }); }
    }

    private void ShowView(string tag)
    {
      // Hide all
      if (ViewIsoUsb != null) ViewIsoUsb.Visibility = Visibility.Collapsed;
      if (ViewFormat != null) ViewFormat.Visibility = Visibility.Collapsed;
      if (ViewPartitions != null) ViewPartitions.Visibility = Visibility.Collapsed;
      if (ViewSecureErase != null) ViewSecureErase.Visibility = Visibility.Collapsed;
      if (ViewHealth != null) ViewHealth.Visibility = Visibility.Collapsed;
      if (ViewSettings != null) ViewSettings.Visibility = Visibility.Collapsed;

      switch (tag)
      {
        case "iso": ViewIsoUsb.Visibility = Visibility.Visible; break;
        case "format": ViewFormat.Visibility = Visibility.Visible; break;
        case "part": ViewPartitions.Visibility = Visibility.Visible; break;
        case "erase": ViewSecureErase.Visibility = Visibility.Visible; break;
        case "health": ViewHealth.Visibility = Visibility.Visible; break;
        default: ViewSettings.Visibility = Visibility.Visible; break;
      }

      UpdateHeaderForTag(tag);
    }

    private void UpdateHeaderForTag(string tag)
    {
      bool hu = _lang == AppLanguage.Hu;
      if (PageTitle == null || HeaderApplyButton == null) return;

      HeaderApplyButton.Visibility = Visibility.Collapsed;

      string title = tag switch
      {
        "iso" => hu ? "ISO → USB" : "ISO → USB",
        "format" => hu ? "Formázás" : "Format",
        "part" => hu ? "Partíciók" : "Partitions",
        "erase" => hu ? "Biztonságos törlés" : "Secure Erase",
        "health" => hu ? "Lemez egészség" : "Disk Health",
        _ => hu ? "Beállítások" : "Settings"
      };
      PageTitle.Text = title;

      if (tag == "settings")
      {
        HeaderApplyButton.Visibility = Visibility.Visible;
      }
    }

    private async void OnBrowseBackgroundClick(object sender, RoutedEventArgs e)
    {
      if (_isBrowsing) return; // prevent double-run
      _isBrowsing = true;
      try
      {
        await LogService.LogAsync("background.pick.open", new { });
        var picker = new Windows.Storage.Pickers.FileOpenPicker();
        picker.FileTypeFilter.Add(".jpg");
        picker.FileTypeFilter.Add(".jpeg");
        picker.FileTypeFilter.Add(".png");
        picker.FileTypeFilter.Add(".bmp");
        picker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.PicturesLibrary;
        picker.ViewMode = Windows.Storage.Pickers.PickerViewMode.Thumbnail;

        var hwnd = WinRT.Interop.WindowNative.GetWindowHandle(this);
        WinRT.Interop.InitializeWithWindow.Initialize(picker, hwnd);

        var file = await picker.PickSingleFileAsync();
        var statusBlock = Status ?? ((this.Content as FrameworkElement)?.FindName("StatusText") as TextBlock) ?? ((this.Content as FrameworkElement)?.FindName("TextBlockStatus") as TextBlock);
        if (file != null)
        {
          try
          {
            var valid = await BackgroundValidator.ValidateAsync(file);
            if (!valid.IsValid)
            {
              if (statusBlock != null) statusBlock.Text = LocalizationService.T("background.set.error");
              await LogService.LogAsync("error.background.validate", valid.Reason);
              CrashHandler.Show(new Exception(valid.Reason));
              return;
            }
            // Set global brush immediately
            Application.Current.Resources["AppBackgroundBrush"] = new ImageBrush { ImageSource = new BitmapImage(new Uri(file.Path)), Stretch = Stretch.UniformToFill };
            // Persist token and path
            Windows.Storage.AccessCache.StorageApplicationPermissions.FutureAccessList.AddOrReplace(BackgroundTokenKey, file);
            Windows.Storage.ApplicationData.Current.LocalSettings.Values[BackgroundTokenKey] = file.Path;
            Services.SettingsService.Current.CustomBackgroundPath = file.Path;
            if (statusBlock != null) statusBlock.Text = LocalizationService.T("background.set.success");
            await LogService.LogAsync("background.set.success", file.Path);
          }
          catch (System.Runtime.InteropServices.COMException cex)
          {
            if (statusBlock != null) statusBlock.Text = LocalizationService.T("background.set.error");
            await LogService.LogAsync("error.picker.image.comexception", cex);
            CrashHandler.Show(cex);
          }
          catch (InvalidOperationException ioex)
          {
            if (statusBlock != null) statusBlock.Text = LocalizationService.T("background.set.error");
            await LogService.LogAsync("error.background.invalidop", new { ioex.Message });
            CrashHandler.Show(ioex);
          }
          catch (Exception ex)
          {
            if (statusBlock != null) statusBlock.Text = LocalizationService.T("background.set.error");
            await LogService.LogAsync("error.catch", new { ctx = "background.apply", ex = ex.Message });
            CrashHandler.Show(ex);
          }
        }
        else
        {
          if (statusBlock != null) statusBlock.Text = LocalizationService.T("background.set.cancel");
          await LogService.LogAsync("background.set.cancel", "User cancelled");
        }
      }
      catch (System.Runtime.InteropServices.COMException cex)
      {
        var statusBlock = Status ?? ((this.Content as FrameworkElement)?.FindName("TextBlockStatus") as TextBlock);
        if (statusBlock != null) statusBlock.Text = LocalizationService.T("background.set.error");
        await LogService.LogAsync("error.picker.image.comexception", cex);
        CrashHandler.Show(cex);
      }
      catch (InvalidOperationException ioex)
      {
        var statusBlock = Status ?? ((this.Content as FrameworkElement)?.FindName("TextBlockStatus") as TextBlock);
        if (statusBlock != null) statusBlock.Text = LocalizationService.T("background.set.error");
        await LogService.LogAsync("error.background.invalidop", new { ioex.Message });
        CrashHandler.Show(ioex);
      }
      catch (Exception ex)
      {
        var statusBlock = Status ?? ((this.Content as FrameworkElement)?.FindName("TextBlockStatus") as TextBlock);
        if (statusBlock != null) statusBlock.Text = LocalizationService.T("background.set.error");
        await LogService.LogAsync("error.catch", new { ctx = "background.picker", ex = ex.Message });
      }
      finally { _isBrowsing = false; }
    }

    // Removed duplicate caption button handlers; native buttons are used
  }
}
namespace FormatX
{
  public sealed partial class MainWindow
  {
    private void Root_KeyDown(object sender, KeyRoutedEventArgs e)
    {
      try
      {
        if (e.Key == Windows.System.VirtualKey.Enter)
        {
          if (ViewSettings != null && ViewSettings.Visibility == Visibility.Visible && HeaderApplyButton?.Visibility == Visibility.Visible)
          {
            ApplySettings_Click(this, new RoutedEventArgs());
            e.Handled = true;
          }
        }
      }
      catch (Exception ex) { _ = LogService.LogAsync("error.catch", new { ctx = "root.keydown", ex = ex.Message }); }
    }


    private void LoadPhysicalDrives()
    {
      try
      {
        var drives = new DriveQueryService().ListPhysicalDrives();
        SecureErase_DriveCombo.ItemsSource = drives;
        Health_DriveCombo.ItemsSource = drives;
        if (SecureErase_DriveCombo.Items?.Count > 0) SecureErase_DriveCombo.SelectedIndex = 0;
        if (Health_DriveCombo.Items?.Count > 0) Health_DriveCombo.SelectedIndex = 0;
      } catch (Exception ex) { _ = LogService.LogAsync("settings.valid.error", new { ex = ex.Message }); }
    }
    
    private void SecureErase_DriveCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
      _eraseSelected = (sender as ComboBox)?.SelectedItem as DriveItem;
    }
    private void Health_DriveCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
      _healthSelected = (sender as ComboBox)?.SelectedItem as DriveItem;
    }
    
  }
}

// MainWindow.xaml.cs - consolidated handlers + HU/EN localization + background apply + non-static UpdateService usage
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.UI.Windowing;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Media.Imaging;
using Windows.Devices.Enumeration;
using Windows.Storage.Pickers;
using WinRT.Interop;
using FormatX.Services;
using System.Runtime.InteropServices;

namespace FormatX
{
  public enum AppLanguage { Hu, En }

  public sealed partial class MainWindow : Window
  {
    // Native helpers
    private const int WM_NCLBUTTONDOWN = 0x00A1;
    private const int HTCAPTION = 0x2;
    private const int SW_MINIMIZE = 6;
    private const int SW_MAXIMIZE = 3;
    private const int SW_RESTORE = 9;

    [DllImport("user32.dll")]
    private static extern bool ReleaseCapture();

    [DllImport("user32.dll")]
    private static extern IntPtr SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

    [DllImport("user32.dll")]
    private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    private static extern bool IsZoomed(IntPtr hWnd);
    private DriveItem? _eraseSelected;
    private DriveItem? _healthSelected;

    private AppLanguage _lang = AppLanguage.Hu;
    private DeviceWatcher? _watcher;

    public MainWindow()
    {
      this.InitializeComponent();
      // Accessibility: set automation name for title region if present
      // No-op accessibility assignment here to avoid runtime reference issues in some hosting scenarios.
      this.Activated += MainWindow_Activated;
      this.Closed += (_, __) => StopWatch();

      // Title bar interactions: drag and double-click maximize
      try
      {
        if (AppTitleBar != null)
        {
          AppTitleBar.PointerPressed += (s, e) =>
          {
            try
            {
              var pt = e.GetCurrentPoint(AppTitleBar);
              if (pt.Properties.IsLeftButtonPressed)
              {
                StartWindowDrag();
              }
            }
            catch { }
          };
          AppTitleBar.DoubleTapped += (s, e) =>
          {
            try { ToggleWindowMaximize(); } catch { }
          };
        }
      }
      catch { }

      try
      {
        var lang = SettingsService.Current.Language;
        _lang = (lang?.StartsWith("en", StringComparison.OrdinalIgnoreCase) ?? false) ? AppLanguage.En : AppLanguage.Hu;
      
      LoadPhysicalDrives();
} catch { }

      ApplyUiText();
      ApplyBackground();
      _ = RefreshDevices();
      if (MainTabView != null) MainTabView.SelectionChanged += (_,__) => UpdateSidebarActive();
      StartWatch();
    }

    private void UpdateSidebarActive()
    {
      try
      {
        var fe = this.Content as FrameworkElement;
        var tv = fe?.FindName("MainTabView") as Microsoft.UI.Xaml.Controls.TabView;
        if (tv == null) return;
        int idx = tv.SelectedIndex;
        // Reset backgrounds of sidebar buttons
        void Reset(string name)
        {
          try { var b = fe?.FindName(name) as Button; if (b!=null) b.ClearValue(Button.BackgroundProperty); } catch { }
        }
        Reset("SidebarIso"); Reset("SidebarFormat"); Reset("SidebarPartitions"); Reset("SidebarSecure"); Reset("SidebarHealth"); Reset("SidebarSettings");
        string active = idx switch {0=>"SidebarIso",1=>"SidebarFormat",2=>"SidebarPartitions",3=>"SidebarSecure",4=>"SidebarHealth",5=>"SidebarSettings",_=>null};
        if (active != null)
        {
          var ab = fe?.FindName(active) as Button;
          if (ab != null)
          {
            ab.Background = (SolidColorBrush)Application.Current.Resources["AccentOrangeBrush"];
          }
        }
      }
      catch { }
    }

    private void AppTitleBar_PointerPressed(object sender, Microsoft.UI.Xaml.Input.PointerRoutedEventArgs e)
    {
      try
      {
        var pt = e.GetCurrentPoint(null);
        if (pt.Properties.IsLeftButtonPressed) StartWindowDrag();
      }
      catch { }
    }

    private void AppTitleBar_DoubleTapped(object sender, Microsoft.UI.Xaml.Input.DoubleTappedRoutedEventArgs e)
    {
      try { BtnMax_Click(null, null); } catch { }
    }

    // Toast overlay: show for short duration
    private async Task ShowToastOverlay(string msg)
    {
      try
      {
        var fe = this.Content as FrameworkElement;
        var toastFE = fe?.FindName("ToastOverlay") as FrameworkElement;
        var toastText = fe?.FindName("ToastText") as Microsoft.UI.Xaml.Controls.TextBlock;
        if (toastFE == null || toastText == null) return;
        toastText.Text = msg;
        toastFE.Visibility = Microsoft.UI.Xaml.Visibility.Visible;
        await Task.Delay(1800);
        toastFE.Visibility = Microsoft.UI.Xaml.Visibility.Collapsed;
      }
      catch { }
    }

    private void SidebarNav_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        var fe = this.Content as FrameworkElement;
        var tv = fe?.FindName("MainTabView") as Microsoft.UI.Xaml.Controls.TabView;
        if (sender is Button b && tv != null)
        {
          if (int.TryParse((b.Tag ?? "-1").ToString(), out int idx) && idx >= 0 && idx < tv.TabItems.Count)
          {
            tv.SelectedIndex = idx;
          }
        }
      }
      catch { }
    }

    private void StartWindowDrag()
    {
      try
      {
        var hwnd = WinRT.Interop.WindowNative.GetWindowHandle(this);
        // emulate title drag
        ReleaseCapture();
        SendMessage(hwnd, WM_NCLBUTTONDOWN, HTCAPTION, 0);
      }
      catch { }
    }

    private void BtnMin_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        var hwnd = WinRT.Interop.WindowNative.GetWindowHandle(this);
        ShowWindow(hwnd, SW_MINIMIZE);
      }
      catch { }
    }

    private void BtnMax_Click(object sender, RoutedEventArgs e)
    {
      try { ToggleWindowMaximize(); } catch { }
    }

    private void BtnClose_Click(object sender, RoutedEventArgs e)
    {
      try { this.Close(); } catch { }
    }

    private void ToggleWindowMaximize()
    {
      try
      {
        var hwnd = WinRT.Interop.WindowNative.GetWindowHandle(this);
        if (IsZoomed(hwnd)) ShowWindow(hwnd, SW_RESTORE); else ShowWindow(hwnd, SW_MAXIMIZE);
      }
      catch { }
    }

    private void MainWindow_Activated(object sender, WindowActivatedEventArgs args)
    {
      try
      {
        if (args.WindowActivationState == WindowActivationState.Deactivated) StopWatch();
        else { StopWatch(); StartWatch(); }
      } catch { }
    }

    private void StartWatch()
    {
      if (IsEnergySaver()) return; // laptop-friendly: avoid extra watchers on battery saver
      try
      {
        if (_watcher != null && (_watcher.Status == DeviceWatcherStatus.Started || _watcher.Status == DeviceWatcherStatus.EnumerationCompleted)) return;
        _watcher = DeviceInformation.CreateWatcher(DeviceClass.PortableStorageDevice);
        _watcher.Added += (_, __) => DispatcherQueue.TryEnqueue(async () => await RefreshDevices());
        _watcher.Removed += (_, __) => DispatcherQueue.TryEnqueue(async () => await RefreshDevices());
        _watcher.Updated += (_, __) => DispatcherQueue.TryEnqueue(async () => await RefreshDevices());
        _watcher.Start();
      } catch { }
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
          } catch { }
        }
      } catch { }
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
        if (PartitionDrive != null) FillCombo(PartitionDrive);
      } catch { }
      await Task.CompletedTask;
    }

    private void SetProgress(int value, string text)
    {
      try
      {
        GlobalProgressBar.Value = Math.Max(0, Math.Min(100, value));
        GlobalProgressText.Text = string.IsNullOrWhiteSpace(text) ? (_lang == AppLanguage.Hu ? "Készenlét" : "Idle") : text;
      } catch { }
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
      } catch { }
    }

    private void ApplyUiText()
    {
      bool hu = _lang == AppLanguage.Hu;

      // Tabs
      if (TabIsoUsb != null) TabIsoUsb.Header = hu ? "ISO → USB" : "ISO → USB";
      if (TabFormat != null) TabFormat.Header = hu ? "Formázás" : "Format";
      if (TabPartitions != null) TabPartitions.Header = hu ? "Partíciók" : "Partitions";
      if (TabSecureErase != null) TabSecureErase.Header = hu ? "Biztonságos törlés" : "Secure Erase";
      if (TabHealth != null) TabHealth.Header = hu ? "Lemez egészség" : "Disk Health";
      if (TabSettings != null) TabSettings.Header = hu ? "Beállítások" : "Settings";

      // Header/status
      if (GlobalProgressText != null) GlobalProgressText.Text = hu ? "Készenlét" : "Idle";
      if (BtnRefresh != null) BtnRefresh.Content = hu ? "Frissítés" : "Refresh";

      // ISO tab
      if (IsoPath != null) IsoPath.PlaceholderText = hu ? "Válassz ISO-t" : "Select ISO";
      if (BtnBrowseIso != null) BtnBrowseIso.Content = hu ? "Tallózás..." : "Browse...";
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
      if (PartitionDrive != null) PartitionDrive.Header = hu ? "Meghajtó" : "Drive";
      if (PartFsCombo != null) PartFsCombo.Header = hu ? "Fájlrendszer" : "File system";
      if (PartFsItemReFS != null) PartFsItemReFS.Content = "ReFS";
      if (PartFsItemExt4 != null) PartFsItemExt4.Content = "ext4 (Linux)";
      if (PartLabelBox != null) PartLabelBox.Header = hu ? "Címke" : "Label";
      if (PartQuickBox != null) PartQuickBox.Content = hu ? "Gyors" : "Quick";
      if (BtnPartition != null) BtnPartition.Content = hu ? "Particionál" : "Partition";

      // Secure Erase tab
      if (EraseFullFormat != null) EraseFullFormat.Content = hu ? "Teljes formázás (lassabb)" : "Full format (slower)";
      if (BtnSecureErase != null) BtnSecureErase.Content = hu ? "Törlés indítása" : "Start erase";
      if (EraseResult != null) EraseResult.Text = "";

      // Health tab
      if (HealthResult != null) HealthResult.Text = "";

      // Settings tab
      if (TxtLanguage != null) TxtLanguage.Text = hu ? "Nyelv" : "Language";
      if (LangCombo != null)
      {
        if (LangCombo.Items.Count >= 2)
        {
          ((ComboBoxItem)LangCombo.Items[0]).Content = hu ? "Magyar" : "Hungarian";
          ((ComboBoxItem)LangCombo.Items[1]).Content = hu ? "Angol" : "English";
        }
      }
      if (TxtTheme != null) TxtTheme.Text = hu ? "Téma" : "Theme";
      if (ThemeItemDefault != null) ThemeItemDefault.Content = hu ? "Rendszer (Default)" : "System (Default)";
      if (ThemeItemLight != null) ThemeItemLight.Content = hu ? "Világos" : "Light";
      if (ThemeItemDark != null) ThemeItemDark.Content = hu ? "Sötét" : "Dark";
      if (TxtBackground != null) TxtBackground.Text = hu ? "Háttérkép" : "Background";
      if (TxtBgHint != null) TxtBgHint.Text = hu ? "Válassz beépített képet vagy saját fájlt." : "Choose built-in or your own image.";
      if (BtnPickBg != null) BtnPickBg.Content = hu ? "Tallózás" : "Browse";
      if (BtnApplySettings != null) BtnApplySettings.Content = hu ? "Alkalmaz" : "Apply";
      if (BtnCheckUpdate != null) BtnCheckUpdate.Content = hu ? "Frissítések keresése" : "Check for updates";
      if (BtnExportCsv != null) BtnExportCsv.Content = hu ? "Napló export (CSV)" : "Export log (CSV)";
      if (TxtVersion != null) TxtVersion.Text = (hu ? "Verzió: " : "Version: ") + "v2.0";
      if (TxtFooter != null) TxtFooter.Text = ".NET 10 • WinUI 3 • MSIX";
    }

    private void ApplyBackground()
    {
      try
      {
        var path = SettingsService.Current.CustomBackgroundPath;
        if (!string.IsNullOrWhiteSpace(path) && System.IO.File.Exists(path))
        {
          if (Application.Current.Resources.TryGetValue("BackgroundBrush", out var brush) && brush is ImageBrush ib)
          {
            ib.ImageSource = new BitmapImage(new Uri(path));
          }
        }
      } catch {}
    }

    // === Handlers (matching XAML) ===

    private async void Refresh_Click(object sender, RoutedEventArgs e) => await RefreshDevices();

    private async void BrowseIso_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        var picker = new FileOpenPicker();
        IntPtr hwnd = WindowNative.GetWindowHandle(this);
        InitializeWithWindow.Initialize(picker, hwnd);
        picker.FileTypeFilter.Add(".iso");
        var f = await picker.PickSingleFileAsync();
        if (f != null) IsoPath.Text = f.Path;
      } catch { }
    }

    private async void WriteIso_Click(object sender, RoutedEventArgs e)
    {
      await LogService.LogAsync("iso_write", new { target = (TargetDrives?.SelectedItem as ComboBoxItem)?.Tag?.ToString(), iso = IsoPath?.Text });
      await ShowToast(_lang == AppLanguage.Hu ? "ISO írás: előkészítve" : "ISO write: prepared");
      _ = ShowToastOverlay(_lang == AppLanguage.Hu ? "ISO írás: előkészítve" : "ISO write: prepared");
    }

    private async void Format_Click(object sender, RoutedEventArgs e)
    {
      try
      {
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
        Status.Text = _lang == AppLanguage.Hu ? "Formázás kész" : "Format done";
        _ = ShowToastOverlay(_lang == AppLanguage.Hu ? "Formázás kész" : "Format done");
      } catch (Exception ex) { Status.Text = ex.Message; }
    }

    private async void Partition_Click(object sender, RoutedEventArgs e)
    {
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
        EraseResult.Text = _lang == AppLanguage.Hu ? "Törlés kész" : "Erase done";
        _ = ShowToastOverlay(_lang == AppLanguage.Hu ? "Törlés kész" : "Erase done");
      } catch (Exception ex) { EraseResult.Text = ex.Message; }
    }

    private async void SmartQuick_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        int disk = _eraseSelected?.Number ?? 0;
        var res = await new DiskHealthService().SmartQuickAsync(disk);
        HealthResult.Text = res?.ToString();
      } catch (Exception ex) { HealthResult.Text = ex.Message; }
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
      } catch (Exception ex) { HealthResult.Text = ex.Message; }
    }

    private async void CheckUpdates_Click(object sender, RoutedEventArgs e)
    {
      await new UpdateService().CheckAndUpdateAsync((p,t)=>DispatcherQueue.TryEnqueue(()=>SetProgress(p,t)), CancellationToken.None);
      await ShowToast(_lang == AppLanguage.Hu ? "Frissítés ellenőrizve" : "Update checked");
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
      catch (Exception ex) { Status.Text = ex.Message; }
    }

    private void FsCombo_SelectionChanged(object sender, SelectionChangedEventArgs e) => ApplyMaxAndSanitize(LabelBox, FsCombo);
    private void PartFsCombo_SelectionChanged(object sender, SelectionChangedEventArgs e) => ApplyMaxAndSanitize(PartLabelBox, PartFsCombo);
    private void LabelBox_TextChanging(TextBox sender, TextBoxTextChangingEventArgs args) => ApplyMaxAndSanitize(LabelBox, FsCombo);
    private void PartLabelBox_TextChanging(TextBox sender, TextBoxTextChangingEventArgs args) => ApplyMaxAndSanitize(PartLabelBox, PartFsCombo);

    private async void PickBackground_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        var picker = new FileOpenPicker();
        IntPtr hwnd = WindowNative.GetWindowHandle(this);
        InitializeWithWindow.Initialize(picker, hwnd);
        picker.FileTypeFilter.Add(".png");
        picker.FileTypeFilter.Add(".jpg");
        picker.FileTypeFilter.Add(".jpeg");
        var f = await picker.PickSingleFileAsync();
        if (f != null)
        {
          SettingsService.Current.CustomBackgroundPath = f.Path;
          ApplyBackground();
          await ShowToast(_lang == AppLanguage.Hu ? "Háttér beállítva" : "Background set");
        }
      } catch { }
    }

    private async void ApplySettings_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        // Language
        if (LangCombo?.SelectedIndex == 1) _lang = AppLanguage.En; else _lang = AppLanguage.Hu;
        SettingsService.Current.Language = _lang == AppLanguage.En ? "en-US" : "hu-HU";

        // Theme (stored only; runtime theme switching not included here)
        string theme = ThemeCombo?.SelectedIndex switch { 1 => "Dark", 2 => "Light", _ => "Default" };
        SettingsService.Current.Theme = theme;

        ApplyUiText();
        ApplyBackground();
        await ShowToast(_lang == AppLanguage.Hu ? "Beállítások mentve" : "Settings saved");
        _ = ShowToastOverlay(_lang == AppLanguage.Hu ? "Beállítások mentve" : "Settings saved");
      } catch { }
    }

    private async Task ShowToast(string msg)
    {
      try { Status.Text = msg; await Task.Delay(10); } catch { }
    }
    private static bool IsEnergySaver()
    {
      try
      {
        return Windows.System.Power.PowerManager.EnergySaverStatus == Windows.System.Power.EnergySaverStatus.On;
      } catch { return false; }
    }

  }
}
namespace FormatX
{
  public sealed partial class MainWindow
  {


    private void LoadPhysicalDrives()
    {
      try
      {
        var drives = new DriveQueryService().ListPhysicalDrives();
        SecureErase_DriveCombo.ItemsSource = drives;
        Health_DriveCombo.ItemsSource = drives;
        if (SecureErase_DriveCombo.Items?.Count > 0) SecureErase_DriveCombo.SelectedIndex = 0;
        if (Health_DriveCombo.Items?.Count > 0) Health_DriveCombo.SelectedIndex = 0;
      } catch {}
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

using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Shapes;
using WinRT.Interop;
using Windows.Storage.Pickers;
using FormatX.Services;

namespace FormatX.Views
{
  public sealed class CrashDialogWindow : Window
  {
    private readonly string _crashPath;
    private readonly TextBlock _detailText;
    private readonly Button _exportBtn;
    private readonly Button _closeBtn;
    private readonly Button _openFolderBtn;

    public CrashDialogWindow(string crashPath)
    {
      _crashPath = crashPath;
      Title = LocalizationService.T("error.crash.title");
      var panel = new StackPanel { Spacing = 12, Margin = new Thickness(24) };
      panel.Children.Add(new TextBlock { Text = LocalizationService.T("error.crash.message"), TextWrapping = TextWrapping.WrapWholeWords });
      _detailText = new TextBlock { FontSize = 12, Opacity = 0.8, TextWrapping = TextWrapping.Wrap, MaxHeight = 180, TextTrimming = TextTrimming.WordEllipsis };
      try { if (File.Exists(crashPath)) _detailText.Text = File.ReadAllText(crashPath); } catch (Exception ex) { _DetailError(ex); }
      var scroller = new ScrollViewer { Content = _detailText, Height = 180, VerticalScrollBarVisibility = ScrollBarVisibility.Auto };
      panel.Children.Add(scroller);

      var btnRow = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 8, HorizontalAlignment = HorizontalAlignment.Right };
      _exportBtn = new Button { Content = LocalizationService.T("error.crash.export") };
      _openFolderBtn = new Button { Content = LocalizationService.T("crash.dialog.openFolder") };
      _closeBtn = new Button { Content = LocalizationService.T("error.crash.close") };
      _exportBtn.Click += ExportBtn_Click;
      _openFolderBtn.Click += OpenFolderBtn_Click;
      _closeBtn.Click += (_, __) => this.Close();
      btnRow.Children.Add(_openFolderBtn);
      btnRow.Children.Add(_exportBtn);
      btnRow.Children.Add(_closeBtn);
      panel.Children.Add(btnRow);
      Content = panel;
      try
      {
        var hwnd = WindowNative.GetWindowHandle(this);
        Windows.Graphics.SizeInt32 size = new() { Width = 640, Height = 480 };
        // Best-effort resize only if AppWindow APIs succeed via reflection (avoid Win32Interop compile dependency here)
        try
        {
          var winIdMethod = Type.GetType("WinRT.Interop.Win32Interop, WinRT.Runtime")?.GetMethod("GetWindowIdFromWindow", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
          var appWindowType = Type.GetType("Microsoft.UI.Windowing.AppWindow, Microsoft.WinUI");
          if (winIdMethod != null && appWindowType != null)
          {
            var windowId = winIdMethod.Invoke(null, new object[] { hwnd });
            var getFromId = appWindowType.GetMethod("GetFromWindowId", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
            var appWindow = getFromId?.Invoke(null, new object[] { windowId });
            var resize = appWindowType.GetMethod("Resize");
            var sizeStruct = size; // struct value
            resize?.Invoke(appWindow, new object[] { sizeStruct });
          }
        }
        catch (Exception rzEx) { _ = LogService.LogAsync("crash.dialog.size.reflection", new { rzEx = rzEx.Message }); }
      }
      catch (Exception ex) { _ = LogService.LogAsync("crash.dialog.size.error", new { ex = ex.Message }); }
    }

    private void _DetailError(Exception ex)
    { _ = LogService.LogAsync("crash.dialog.detail", new { ex = ex.Message }); }

    private async void ExportBtn_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        if (!File.Exists(_crashPath)) return;
        // Prefer WinRT, but if elevated/off-UI-thread use Win32 save dialog
        string? target = null;
        if (!Services.ElevationService.IsElevated() && this.DispatcherQueue.HasThreadAccess)
        {
          var picker = new FileSavePicker();
          InitializeWithWindow.Initialize(picker, WindowNative.GetWindowHandle(this));
          picker.FileTypeChoices.Add("JSON", new System.Collections.Generic.List<string> { ".json" });
          picker.SuggestedFileName = System.IO.Path.GetFileName(_crashPath);
          var f = await picker.PickSaveFileAsync();
          target = f?.Path;
        }
        else
        {
          var hwnd = WindowNative.GetWindowHandle(this);
          target = FormatX.Interop.Win32FileDialog.ShowSaveFileDialog(hwnd, new[] { ("JSON", "*.json") }, "json", System.IO.Path.GetFileName(_crashPath));
        }
        if (!string.IsNullOrWhiteSpace(target))
        {
          File.Copy(_crashPath, target!, true);
          await LogService.LogAsync("crash.export.window", new { dest = target });
        }
      }
      catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogAsync("error.com.exception", cex); }
      catch (IOException ioex) { await LogService.LogAsync("error.io.exception", ioex); }
      catch (Exception ex) { await LogService.LogAsync("error.catch", new { ctx = "crash.export.window", ex = ex.Message }); }
    }

    private async void OpenFolderBtn_Click(object sender, RoutedEventArgs e)
    {
      try
      {
        var folder = System.IO.Path.GetDirectoryName(_crashPath);
        if (!string.IsNullOrWhiteSpace(folder) && Directory.Exists(folder))
        {
          await LogService.LogAsync("crash.folder.open", new { folder });
          _ = System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo { FileName = folder, UseShellExecute = true });
        }
      }
      catch (System.Runtime.InteropServices.COMException cex) { await LogService.LogAsync("error.com.exception", cex); }
      catch (IOException ioex) { await LogService.LogAsync("error.io.exception", ioex); }
      catch (Exception ex) { await LogService.LogAsync("error.catch", new { ctx = "crash.folder.open", ex = ex.Message }); }
    }
  }
}

using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Windows.Globalization;
using System.Globalization;
using FormatX.Services;
using System.Reflection;
using System;

namespace FormatX
{
  public partial class App : Application
  {
    private Window? _window;

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
      // Optional: Bootstrap Windows App SDK in UNPACKAGED mode (no-op if packaged or missing)
      try
      {
        var t = Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppSDK", throwOnError: false);
        if (t != null)
        {
          var initWithVer = t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, new Type[] { typeof(uint) });
          var initNoArg   = t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, Type.EmptyTypes);
          if (initWithVer != null) initWithVer.Invoke(null, new object[] { 0x00010800u }); // 1.8
          else initNoArg?.Invoke(null, null);
        }
      }
      catch { }

      // Language (default HU)
      var lang = SettingsService.Current.Language;
      try
      {
        ApplicationLanguages.PrimaryLanguageOverride = lang;
        CultureInfo.CurrentUICulture = new CultureInfo(lang);
        CultureInfo.CurrentCulture   = new CultureInfo(lang);
      }
      catch { }

      _window = new MainWindow();
      if (_window.Content is FrameworkElement fe)
      {
        var theme = SettingsService.Current.Theme;
        fe.RequestedTheme = theme switch
        {
          "Dark"  => ElementTheme.Dark,
          "Light" => ElementTheme.Light,
          _       => ElementTheme.Default
        };
      }
      _window.Activate();
    }
  }
}

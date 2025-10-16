using System;
using System.Reflection;
using Microsoft.UI.Xaml;

namespace FormatX
{
  public static class Startup
  {
    [STAThread]
    public static void Main()
    {
      // 1) COM/WinRT marshalling once
      try { WinRT.ComWrappersSupport.InitializeComWrappers(); } catch { }

    // Global exception handler wiring
    try { FormatX.Services.GlobalExceptionHandler.WireUp(); } catch { }

      // 2) Windows App SDK bootstrap via reflection (works packaged/unpackaged, avoids compile-time dependency)
      try
      {
        // Bootstrap Windows App SDK 2.0 (0x00020000) for unpackaged runs
        // The bootstrap type resides in Microsoft.WindowsAppRuntime.Bootstrap.Net
        var t = Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppRuntime.Bootstrap.Net", throwOnError: false)
                ?? Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppSDK", throwOnError: false);
        if (t != null)
        {
          var initWithVer = t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, new Type[] { typeof(uint) });
          var initNoArg   = t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, Type.EmptyTypes);
          if (initWithVer != null) initWithVer.Invoke(null, new object[] { 0x00020000u }); // 2.0
          else initNoArg?.Invoke(null, null);
        }
      }
      catch (Exception)
      {
        // Swallow bootstrap errors to avoid debugger break; WinUI will fail gracefully if runtime truly missing
      }

      Application.Start(_ => new App());

      try
      {
        var t = Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppRuntime.Bootstrap.Net", throwOnError: false)
              ?? Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppSDK", throwOnError: false);
        var shutdown = t?.GetMethod("Shutdown", BindingFlags.Public | BindingFlags.Static, Type.EmptyTypes);
        shutdown?.Invoke(null, null);
      }
      catch { }
    }
  }
}

using System;
using System.Reflection;
using Microsoft.UI.Xaml;
using System.Runtime.InteropServices;

namespace FormatX
{
  public static class Startup
  {
    [STAThread]
    public static void Main()
    {
      try { FormatX.Services.LogService.AppendUsbLine("usb.app.process.entry"); } catch { }
      // 1) COM/WinRT marshalling once
      try { WinRT.ComWrappersSupport.InitializeComWrappers(); } catch { }

    // Global exception handler wiring
    try { FormatX.Services.GlobalExceptionHandler.WireUp(); } catch { }

      // 2) Single, guarded bootstrap for UNPACKAGED runs via parameterless Initialize.
      TryBootstrapOnce();

      Application.Start(_ => new App());
      try { FormatX.Services.LogService.AppendUsbLine("usb.app.process.afterStart"); } catch { }

      // No explicit Bootstrap.Shutdown(); let App.xaml.cs handle lifecycle if it initialized.
    }

    private static void TryBootstrapOnce()
    {
      try
      {
        // Only attempt when not packaged; if packaged, WinAppSDK is activated by the system.
        if (FormatX.Services.AppEnv.IsPackaged)
        {
          try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.skip:Packaged"); } catch { }
          return;
        }

        // Prefer the Microsoft.WindowsAppSDK assembly's Bootstrap
        var t = Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppSDK", throwOnError: false)
                ?? Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppRuntime.Bootstrap.Net", throwOnError: false);
        if (t == null)
        {
          try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.skip:Bootstrap.NotFound"); } catch { }
          return;
        }
        var initNoArg = t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, Type.EmptyTypes);
        if (initNoArg != null) initNoArg.Invoke(null, null);
        else { try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.skip:NoParamless"); } catch { } }
        try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.ok"); } catch { }
      }
      catch (DllNotFoundException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } }
      catch (EntryPointNotFoundException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } }
      catch (COMException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } }
      catch (InvalidOperationException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } }
      catch (Exception ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } }
    }
  }
}

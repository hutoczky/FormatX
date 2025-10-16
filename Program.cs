using System;
using System.Reflection;
using Microsoft.UI.Xaml;
using System.Runtime.InteropServices;
using System.Linq;

namespace FormatX
{
  public static class Startup
  {
    [STAThread]
    public static void Main()
    {
      try { FormatX.Services.LogService.AppendUsbLine("usb.app.process.entry"); } catch { }
      // 0) Global exception handler wiring as early as possible
      try { FormatX.Services.GlobalExceptionHandler.WireUp(); } catch { }

      // 1) Bootstrap Windows App SDK for unpackaged runs BEFORE any WinRT/WinUI usage
      var bootOk = TryBootstrapOnce();
      // Always proceed to Application.Start; App.OnLaunched handles headless/exit
      if (!FormatX.Services.AppEnv.IsPackaged && !bootOk)
      {
        try { FormatX.Services.LogService.AppendUsbLine("usb.app.warn:Bootstrap.Initialize.Failed.Continuing"); } catch { }
      }

      // 2) COM/WinRT marshalling once (after bootstrap)
      try { WinRT.ComWrappersSupport.InitializeComWrappers(); } catch { }

      // Optional lightweight self-tests (no external runner). Set FORMATX_SELFTEST=1 to run.
      try
      {
        var st = Environment.GetEnvironmentVariable("FORMATX_SELFTEST");
        if (string.Equals(st, "1", StringComparison.Ordinal))
        {
          try { FormatX.Services.LogService.AppendUsbLine("usb.selftest.begin"); } catch { }
          try { FormatX.Services.SelfTests.RunAsync().GetAwaiter().GetResult(); } catch { }
          try { FormatX.Services.LogService.AppendUsbLine("usb.selftest.end"); } catch { }
        }
      }
      catch { }

      // 3) Start WinUI application
      try { Application.Start(p => new App()); }
      catch (Exception ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.app.error:Application.Start:{ex.GetType().Name}:{ex.Message}"); } catch { } throw; }
      try { FormatX.Services.LogService.AppendUsbLine("usb.app.process.afterStart"); } catch { }

      // No explicit Bootstrap.Shutdown(); let App.xaml.cs handle lifecycle if it initialized.
    }

    private static bool TryBootstrapOnce()
    {
      try
      {
        // Only attempt when not packaged; if packaged, WinAppSDK is activated by the system.
        if (FormatX.Services.AppEnv.IsPackaged)
        {
          try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.skip:Packaged"); } catch { }
          return true;
        }

        // Developer override to skip bootstrap entirely
        var skip = Environment.GetEnvironmentVariable("FORMATX_SKIP_WASDK_BOOTSTRAP");
        if (string.Equals(skip, "1", StringComparison.Ordinal))
        {
          try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.skip:Env"); } catch { }
          return false;
        }

        // Assembly may already be loaded by tooling or probing; still attempt Initialize safely.
        var already = AppDomain.CurrentDomain.GetAssemblies()
          .Any(a => string.Equals(a.GetName().Name, "Microsoft.WindowsAppRuntime.Bootstrap.Net", StringComparison.OrdinalIgnoreCase));
        if (already) { try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.info:AssemblyLoaded"); } catch { } }

        // Prefer the Microsoft.WindowsAppSDK assembly's Bootstrap
        // Try multiple known bootstrap types and also scan loaded assemblies
        var t = Type.GetType("Microsoft.WindowsAppRuntime.Bootstrap, Microsoft.WindowsAppRuntime.Bootstrap.Net", throwOnError: false)
                ?? Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppSDK", throwOnError: false)
                ?? Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppRuntime.Bootstrap.Net", throwOnError: false)
                ?? ResolveBootstrapTypeFromAssemblies();
        if (t == null)
        {
          try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.skip:Bootstrap.NotFound"); } catch { }
          return false;
        }
        var initNoArg = t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, Type.EmptyTypes);
        if (initNoArg != null)
        {
          try { initNoArg.Invoke(null, null); }
          catch (Exception ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
        }
        else
        {
          try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.skip:NoParamless"); } catch { }
          return false;
        }
        try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.ok"); } catch { }
        return true;
      }
      catch (DllNotFoundException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (EntryPointNotFoundException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (COMException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (BadImageFormatException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (TypeLoadException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (InvalidOperationException ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (Exception ex) { try { FormatX.Services.LogService.AppendUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
    }

    private static Type? ResolveBootstrapTypeFromAssemblies()
    {
      try
      {
        foreach (var asm in AppDomain.CurrentDomain.GetAssemblies())
        {
          var name = asm.GetName().Name;
          if (!string.Equals(name, "Microsoft.WindowsAppRuntime.Bootstrap.Net", StringComparison.OrdinalIgnoreCase)
              && !string.Equals(name, "Microsoft.WindowsAppSDK", StringComparison.OrdinalIgnoreCase))
            continue;
          try
          {
            var t = asm.GetType("Microsoft.WindowsAppRuntime.Bootstrap")
                    ?? asm.GetType("Microsoft.WindowsAppRuntime.Bootstrap.Net.Bootstrap")
                    ?? asm.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap");
            if (t != null)
            {
              var hasInit = t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, Type.EmptyTypes) != null
                            || t.GetMethod("Initialize", BindingFlags.Public | BindingFlags.Static, new Type[] { typeof(uint) }) != null;
              if (hasInit) return t;
            }
          }
          catch { }
        }
      }
      catch { }
      return null;
    }
  }
}

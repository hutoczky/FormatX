using System;
using System.Diagnostics;
using System.Reflection;
using Microsoft.UI.Xaml;
using System.Runtime.InteropServices;
using System.Linq;

namespace FormatX
{
  public static class Startup
  {
    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern int MessageBoxW(IntPtr hWnd, string text, string caption, uint type);

    [STAThread]
    public static void Main()
    {
      try { FormatX.Services.LogService.WriteUsbLine("usb.app.process.entry"); } catch { }
      // 0) Global exception handler wiring as early as possible
      try { FormatX.Services.GlobalExceptionHandler.WireUp(); } catch { }

      // 1) Bootstrap Windows App SDK for unpackaged runs BEFORE any WinRT/WinUI usage
      // Always attempt Initialize, except when explicitly skipped
      var skip = false;
      try
      {
        var env = Environment.GetEnvironmentVariable("FORMATX_SKIP_WASDK_BOOTSTRAP");
        if (string.Equals(env, "1", StringComparison.Ordinal) || Debugger.IsAttached)
        {
          skip = true;
          try { FormatX.Services.LogService.WriteUsbLine("usb.app.bootstrap.skip:EnvOrDebugger"); } catch { }
        }
      }
      catch { }

      var bootOk = true;
      if (!skip)
      {
        bootOk = TryBootstrapOnce();
        // If REGDB_E_CLASSNOTREG, inform the user and exit(0)
        if (!bootOk && unchecked((uint)_lastBootstrapHresult) == 0x80040154u)
        {
          try { FormatX.Services.LogService.WriteUsbLine("usb.winrt.error:Bootstrap.ClassNotRegistered"); } catch { }
          try
          {
            MessageBoxW(IntPtr.Zero,
              "Windows App Runtime is not installed or not registered. Please install the correct version.",
              "FormatX - Startup error",
              0x00000010 /* MB_ICONERROR */ | 0x00000000 /* MB_OK */);
          }
          catch { }
          Environment.Exit(0);
          return;
        }
        // For other errors, continue to Application.Start per spec
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
      try { FormatX.Services.LogService.WriteUsbLine("usb.app.info:UI.Start"); } catch { }
      try { Application.Start(p => new App()); }
      catch (Exception ex)
      {
        try { FormatX.Services.LogService.WriteUsbLine($"usb.app.error:Application.Start:{ex.GetType().Name}:{ex.Message}"); } catch { }
        Environment.Exit(0);
        return; // do not rethrow to avoid hard crash during debug
      }
      try { FormatX.Services.LogService.WriteUsbLine("usb.app.process.afterStart"); } catch { }

      // No explicit Bootstrap.Shutdown(); let App.xaml.cs handle lifecycle if it initialized.
    }

    private static volatile int _lastBootstrapHresult = 0;

    private static bool TryBootstrapOnce()
    {
      try
      {
        // If packaged, Bootstrap is unnecessary. Skip but continue startup.
        if (FormatX.Services.AppEnv.IsPackaged)
        {
          try { FormatX.Services.LogService.WriteUsbLine("usb.app.bootstrap.skip:Packaged"); } catch { }
          return true;
        }

        // Ensure the bootstrap assembly is loaded from the app directory if available
        try
        {
          var baseDir = AppContext.BaseDirectory;
          var bootstrapPath = System.IO.Path.Combine(baseDir, "Microsoft.WindowsAppRuntime.Bootstrap.Net.dll");
          if (System.IO.File.Exists(bootstrapPath))
          {
            var loaded = AppDomain.CurrentDomain.GetAssemblies()
              .Any(a => string.Equals(System.IO.Path.GetFileName(a.Location), "Microsoft.WindowsAppRuntime.Bootstrap.Net.dll", StringComparison.OrdinalIgnoreCase));
            if (!loaded)
            {
              try
              {
                System.Reflection.Assembly.LoadFrom(bootstrapPath);
                try { FormatX.Services.LogService.WriteUsbLine($"usb.app.bootstrap.load:{bootstrapPath}"); } catch { }
              }
              catch (Exception lex)
              {
                try { FormatX.Services.LogService.WriteUsbLine($"usb.app.bootstrap.load.error:{lex.GetType().Name}:{lex.Message}"); } catch { }
              }
            }
          }
        }
        catch { }

        // Assembly may already be loaded by tooling or probing; still attempt Initialize safely.
        var already = AppDomain.CurrentDomain.GetAssemblies()
          .Any(a => string.Equals(a.GetName().Name, "Microsoft.WindowsAppRuntime.Bootstrap.Net", StringComparison.OrdinalIgnoreCase));
        if (already) { try { FormatX.Services.LogService.WriteUsbLine("usb.app.bootstrap.info:AssemblyLoaded"); } catch { } }

        // Try multiple known bootstrap types and also scan loaded assemblies
        var t = Type.GetType("Microsoft.WindowsAppRuntime.Bootstrap, Microsoft.WindowsAppRuntime.Bootstrap.Net", throwOnError: false)
                ?? Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppSDK", throwOnError: false)
                ?? Type.GetType("Microsoft.WindowsAppSDK.AppModel.DynamicDependency.Bootstrap, Microsoft.WindowsAppRuntime.Bootstrap.Net", throwOnError: false)
                ?? ResolveBootstrapTypeFromAssemblies();
        if (t == null)
        {
          // Even if the assembly/type isn't directly found, attempt to load and proceed to Application.Start gracefully.
          try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.skip:Bootstrap.NotFound"); } catch { }
          return false;
        }
        // Try multiple Initialize overloads across WinAppSDK versions
        var methods = t.GetMethods(BindingFlags.Public | BindingFlags.Static)
                       .Where(m => string.Equals(m.Name, "Initialize", StringComparison.Ordinal))
                       .ToArray();
        if (methods.Length == 0)
        {
          try { FormatX.Services.LogService.AppendUsbLine("usb.app.bootstrap.skip:Initialize.Missing"); } catch { }
          return false;
        }

        Exception? lastInitEx = null;
        foreach (var m in methods)
        {
          var ps = m.GetParameters();
          object?[]? args = null;
          try
          {
            if (ps.Length == 0)
            {
              args = Array.Empty<object?>();
            }
            else if (ps.Length == 1 && ps[0].ParameterType == typeof(uint))
            {
              // e.g. Initialize(0x00020000) for WinAppSDK 2.0; value is MajorMinor version
              const uint MajorMinor_2_0 = (2u << 16) | 0u;
              args = new object?[] { MajorMinor_2_0 };
            }
            else if (ps.Length == 2 && ps[0].ParameterType == typeof(uint) && ps[1].ParameterType == typeof(uint))
            {
              // Fallback for potential (majorMinor, versionTagId) shapes; pass zeros
              args = new object?[] { 0u, 0u };
            }
            else
            {
              continue; // unsupported signature
            }

            m.Invoke(null, args);
            lastInitEx = null; // success
            break;
          }
          catch (System.Runtime.InteropServices.COMException cex)
          {
            lastInitEx = cex;
            _lastBootstrapHresult = cex.HResult;
            if ((uint)cex.HResult == 0x80040154)
            {
              try { FormatX.Services.LogService.WriteUsbLine("usb.winrt.error:Bootstrap.ClassNotRegistered"); } catch { }
            }
          }
          catch (Exception ex)
          {
            lastInitEx = ex;
          }
        }

        if (lastInitEx != null)
        {
          try { FormatX.Services.LogService.WriteUsbLine($"usb.winrt.error:Bootstrap.Initialize:{lastInitEx.GetType().Name}:{lastInitEx.Message}"); } catch { }
          return false;
        }
        try { FormatX.Services.LogService.WriteUsbLine("usb.winrt.info:Bootstrap.Initialize.Success"); } catch { }
        return true;
      }
      catch (DllNotFoundException ex) { _lastBootstrapHresult = ex.HResult; try { FormatX.Services.LogService.WriteUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (EntryPointNotFoundException ex) { _lastBootstrapHresult = ex.HResult; try { FormatX.Services.LogService.WriteUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (COMException ex)
      {
        _lastBootstrapHresult = ex.HResult;
        if ((uint)ex.HResult == 0x80040154)
        {
          try { FormatX.Services.LogService.WriteUsbLine("usb.winrt.error:Bootstrap.ClassNotRegistered"); } catch { }
        }
        try { FormatX.Services.LogService.WriteUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { }
        return false;
      }
      catch (BadImageFormatException ex) { _lastBootstrapHresult = ex.HResult; try { FormatX.Services.LogService.WriteUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (TypeLoadException ex) { _lastBootstrapHresult = ex.HResult; try { FormatX.Services.LogService.WriteUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (InvalidOperationException ex) { _lastBootstrapHresult = ex.HResult; try { FormatX.Services.LogService.WriteUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
      catch (Exception ex) { _lastBootstrapHresult = ex.HResult; try { FormatX.Services.LogService.WriteUsbLine($"usb.winrt.error:Bootstrap.Initialize:{ex.GetType().Name}:{ex.Message}"); } catch { } return false; }
    }

    // Preflight checks removed to ensure Initialize is always attempted.

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

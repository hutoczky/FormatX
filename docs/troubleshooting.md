# Troubleshooting: Windows App Runtime and UI Startup

This app uses WinUI 3 and Windows App Runtime when running unpackaged. If the Windows App Runtime is missing or not registered, starting the UI may fail unless the app is packaged. The app now detects and handles this, showing a friendly message and exiting with code 0 instead of crashing.

## Symptoms
- Native crash 0xC000027B when starting the app unpackaged.
- COM error REGDB_E_CLASSNOTREG (0x80040154) during bootstrap/activation.
- UI does not appear when running unpackaged on a clean machine.

## Quick checks
- Is the app running packaged (MSIX) or unpackaged? Packaged apps do not require bootstrap.
- Is Windows App Runtime installed? Open Apps & Features and search for "Windows App Runtime".
- Are you forcing bootstrap skip? Ensure `FORMATX_SKIP_WASDK_BOOTSTRAP` is not set to `1`.

## What the app does now
- Always attempts Windows App Runtime bootstrap.
- If REGDB_E_CLASSNOTREG occurs, it logs `usb.winrt.error:Bootstrap.ClassNotRegistered` and shows a message box explaining that Windows App Runtime must be installed or registered; the app exits gracefully (code 0).
- Any other bootstrap failure in unpackaged mode results in a similar friendly message and exit (no native crash).

## How to fix on your machine
1. Install or repair Windows App Runtime (latest 2.x):
   - https://aka.ms/windowsappsdk/Stable
2. Do not skip bootstrap unless you know what you're doing:
   - Clear `FORMATX_SKIP_WASDK_BOOTSTRAP` environment variable.
3. If you need to run headless/CI:
   - Set `FORMATX_HEADLESS=1` to skip creating a window. The app will log and exit cleanly.

## Developer guidance
- Debugger should NOT skip bootstrap by default. Only the env var enforces skipping.
- For unpackaged debugging, ensure Windows App Runtime is installed locally.
- If you must test without bootstrap: set `FORMATX_SKIP_WASDK_BOOTSTRAP=1`; the app will exit safely (no UI) with an explanatory message.

## Logs to look for
- `usb.app.info:UI.Start`
- `usb.app.info:MainWindowActivated` or `usb.app.info:MainWindowSkipped`
- `usb.winrt.error:Bootstrap.ClassNotRegistered`
- `usb.app.error:Bootstrap.Initialize.Failed.Unpackaged.Exit`

## FAQ
- Q: Why does it exit without a window?  
  A: Because bootstrap failed in unpackaged mode or it was explicitly skipped. This avoids a native crash.
- Q: Does packaged MSIX need bootstrap?  
  A: No, it carries its own registration.

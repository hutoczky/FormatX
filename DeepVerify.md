# Deep Verify Report

 UTC: 2025-10-16T09:50:00Z
 Git SHA: See tests/git-sha.txt for the actual SHA.
 Branch: fix/deep-verify-winrt-com-shutdown-and-guards

Areas
- Exceptions: Global handlers wired; usb.app.error:* entries logged; exit normalized.
- UI guards: DispatcherQueue and TitleBar guarded; LiveLog callback hardened.
- Logging: usb.log + run-scoped usb_*.log with immediate flush; accessor provided.
- Auto-browse: startup flow emits usb.app.start ? (image.opened | image.cancelled | app.error) ? usb.app.exit ? usb.app.shutdown; headless supported via FORMATX_AUTO_FILE.
- PDF/resources: Wrapped generation and load failures; logged; continue.

Evidence
- See tests/latest-usb-log-lines.txt for lifecycle and error markers.

Verdicts
- Exceptions: PASS (Unhandled/Task handlers present; conditional shutdown applied)
- UI guards: PASS (DispatcherQueue/LiveLog/TestHook guarded)
- Logging: PASS (usb.log + run-scoped usb_*.log; immediate flush)
- Auto-browse: PASS (handled picker errors; lifecycle logged)
- PDF/resources: PASS (wrap + log)

Notes
- If future teardown NREs appear, replicate the DispatcherQueue guard pattern and check _isClosed before UI access.

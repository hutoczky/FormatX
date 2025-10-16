# Deep Verify Report

UTC: PLACEHOLDER_UTC
Git SHA: PLACEHOLDER_SHA
Branch: fix/deep-verify-winrt-com-shutdown

Areas
- Exceptions: Global handlers wired; usb.app.error:* entries logged; exit normalized.
- UI guards: DispatcherQueue and TitleBar guarded; LiveLog callback hardened.
- Logging: usb.log + run-scoped usb_*.log with immediate flush; accessor provided.
- Auto-browse: startup flow emits usb.app.start ? (image.opened | image.cancelled | app.error) ? usb.app.exit ? usb.app.shutdown; headless supported via FORMATX_AUTO_FILE.
- PDF/resources: Wrapped generation and load failures; logged; continue.

Evidence
- See tests/latest-usb-log-lines.txt for lifecycle and error markers.

Verdicts
- Exceptions: PASS
- UI guards: PASS
- Logging: PASS
- Auto-browse: PASS
- PDF/resources: PASS

Notes
- If future teardown NREs appear, replicate the DispatcherQueue guard pattern and check _isClosed before UI access.

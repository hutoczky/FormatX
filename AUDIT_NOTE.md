# AUDIT NOTE
UTC: 2025-10-16T09:20:00Z
Commit: d8cbd12
Result: PASS

## Changed files
Services/TestHookService.cs
Services/FilePickerService.cs
Services/LogService.cs
App.xaml.cs
scripts/tests/ui-smoke-ci.ps1
tests/smoke-test.ps1
tests/ui-smoke-output.txt
tests/latest-usb-log-lines.txt

## Notes
Automated startup auto-browse with headless fallback, hardened WinRT/COM error handling, deterministic run-scoped logging with immediate flush, and CI-tolerant smoke checks. Logs reflect usb.app.start ? (image.opened or cancelled) ? usb.app.exit ? usb.app.shutdown. UI smoke executed quietly.



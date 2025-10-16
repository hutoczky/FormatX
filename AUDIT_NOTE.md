# AUDIT NOTE
UTC: 2025-10-16T09:36:00Z
Commit: a18e713
Result: PASS

## Changed files
Services/TestHookService.cs
Services/FilePickerService.cs
Services/LogService.cs
Services/GlobalExceptionHandler.cs
Services/ReportService.cs
App.xaml.cs
scripts/tests/ui-smoke-ci.ps1
tests/smoke-test.ps1
tests/ui-smoke-output.txt
tests/latest-usb-log-lines.txt

## Notes
Added global exception hardening with usb.app.error logging, wrapped QuestPDF generation to avoid crashes, and kept auto-browse with headless fallback. Deterministic logging preserved. Smoke scripts pass and UI smoke ran quietly.



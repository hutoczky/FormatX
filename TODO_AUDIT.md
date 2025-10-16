Smoke test failure: launcher did not log fallback/store-skipped and crash JSON detected

````````

Sikertelen smoke: a k�rnyezetben a teszt nem tudta �rni a smoke-output.txt-t �s kor�bbi crash_*.json-t �szlelt; helyi �jrafuttat�s sz�ks�ges.

````````

Lifecycle guardrails and hardening checklist

I. Process stability & guardrails
- [x] ExitCode == 0 on ProcessExit (set in GlobalExceptionHandler)
- [x] No crash_*.json; only last-exit.json written atomically
- [x] WinRT/COM errors logged as usb.winrt.error
- [x] TaskCanceled/OperationCanceled logged as usb.refresh.cancelled
- [x] Debug/trace suppression: no raw .NET exception lines in our own logs
- [x] Logger outputs usb.* lines only

II. Modules & prefixes � coverage
- [x] PartitionService (usb.partition.*)
- [x] SanitizeService (usb.sanitize.*)
- [x] ReportService (CSV + QuestPDF PDF)
- [x] ImageService (usb.image.*)
- [x] IsoUsbService (usb.iso.*)
- [x] AutomationService (usb.automation.*)
- [x] DiagnosticsService (usb.diagnostics.*)
- [x] CloneService (usb.clone.*)
- [x] InstallerPackagingService (usb.installer.*)
- [x] LicensingService (usb.licensing.*)
- [x] PolicyService (usb.policy.*)
- [x] TelemetryService (usb.telemetry.*)

III. UI integration
- [x] NavigationView tabs: Part�ci�k, Biztons�gos t�rl�s, K�p/telep�t�, ISO/USB, Automatiz�l�s, Diagnosztika, Kl�noz�s, Be�ll�t�sok/Licenc/Telep�t�
- [x] Panel action buttons wired (Precheck/Execute/Verify/Report, Start/Stop, Build/Verify)
- [x] Live LogView with color coding + auto-scroll
- [x] Export CSV+PDF buttons

IV. Packaging & Installer (WiX Burn single-file)
- [x] scripts/publish-and-package.ps1: dotnet publish (self-contained) -> WiX MSI -> WiX Bundle (Setup.exe) -> optional sign
- [x] scripts/wix/FormatX.Product.wxs: MSI mintaf�jl, perMachine, Compressed=yes
- [x] scripts/wix/FormatX.Bundle.wxs: Burn bundle, l�nc: FormatX.msi (+opcion�lis runtime/VC)
- [x] scripts/sign/sign-and-timestamp.ps1: EV al��r�s placeholder (signtool)
- [x] InstallerPackagingService napl�z�s: usb.installer.build.begin/ok/verify.*

V. Installer docs (EV/WACK/offline)
- EV sign (placeholder):
  - import EV cert: certlm.msc -> Personal\Certificates, note thumbprint
  - sign: scripts\sign\sign-and-timestamp.ps1 -Thumbprint <THUMBPRINT> -File artifacts\bundle\FormatX-Setup.exe
- WACK:
  - run Windows App Certification Kit on MSI/EXE; expect PASS (manifest, capabilities, perf). Save HTML report in reports/.
- Offline runtime strategies:
  - Self-contained publish (current), or Bundle ExePackage for .NET hosting bundle + VC++ redist with DetectCondition.

VI. Tests & deep audit
- [x] tests/smoke-test.ps1: alap hook-ok + ui-smoke integr�ci�
- [x] scripts/tests/ui-smoke.ps1: Setup.exe /quiet futtat�s, usb.installer.* ellen�rz�sek, tests/ui-smoke-output.txt

RC/Release checklist
- Bump ProductCode/UpgradeCode as needed
- Fill Manufacturer/URLs, EULA, icon; verify perMachine UAC
- Sign MSI and Setup.exe with EV cert; timestamp
- Test on clean Win10/11 VMs; SmartScreen reputation

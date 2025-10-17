# PR Title
Full fix: finalize WASDK bootstrap, runtime detection, simulator/hypervisor guidance, and code signing

# PR Description
This PR completes the full atomic fix-and-verification workflow for FormatX, covering all runtime, bootstrap, simulator, hypervisor, and signing issues. It is CI-safe, audit-proof, and includes structured logging and verification artifacts.

## Changes
• WASDK bootstrap: Assembly probing (Load/LoadFrom), Initialize overloads with tag support, structured logs.
• REGDB_E_CLASSNOTREG handling: MessageBox + WASDK link (interactive), log-only + audit end (CI/headless).
• Simulator/SDK/hypervisor checks: FORMATX_SIMULATOR=1 triggers SDK and Hypervisor validation; logs usb.sys.error:WindowsSDK.Missing / Hypervisor.NotRunning.
• UI stability: Application.Start guard, DispatcherQueue check, FORMATX_AUTOCLOSE_SECONDS support.
• WinRtGuard: Pickers and WinRT APIs wrapped with timeout and structured error logging.
• Logging: WriteUsbLine with flush; usb.ui.audit.begin/end on all exit paths.
• Tests: verify-bootstrap.ps1 (interactive), verify-bootstrap-ci.ps1 (CI-safe).
• CI workflow: .github/workflows/verify-and-sign.yml — matrix (dev/headless/energy), artifact upload.
• Signing: ci/signing/sign-and-publish.ps1 — PFX import, signtool sign/verify, artifact copy.
• Docs: SIGNING.md usage guide.

## Verification
• Debug build: OK
• Headless verification: PASS
• CI matrix: verify-bootstrap-ci.ps1 used; no GUI; audit end + exit 0 required

## Artifacts
• tests/final-result.txt
• artifacts/latest-usb-last-200.log
• artifacts/run-stdout.txt
• artifacts/run-stderr.txt
• artifacts/AUDIT_RUN_SUMMARY.txt

## PASS criteria
• No 0xC000027B or REGDB_E_CLASSNOTREG unhandled
• Audit markers present
• Exit code 0 in all accepted flows
• Signed binaries verified and uploaded

Ready to merge once CI passes.

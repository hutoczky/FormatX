# Code Signing and Publishing

This repository supports optional code signing in CI using a password-protected PFX provided via secrets.

## CI secrets
- `SIGNING_PFX`: Base64-encoded PFX contents
- `SIGNING_PFX_PASSWORD`: Password for the PFX

## How it works
- The workflow runs `ci/signing/sign-and-publish.ps1` after a successful verification matrix.
- The script decodes the PFX, signs `FormatX.exe` and any `*.msix` packages it finds, verifies signatures, and copies signed binaries into `artifacts/`.

## Local usage
```
pwsh -File ci/signing/sign-and-publish.ps1 -PfxBase64 (Get-Content .\cert.b64) -PfxPassword 'pass'
```

## Tips
- Ensure the certificate has a valid code signing EKU.
- Use RFC3161 timestamping (e.g., Digicert) for long-term validity.
- Keep your PFX secure; never commit it to the repo.

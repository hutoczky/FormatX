param(
  [ValidateSet("dev","headless","energy")]
  [string]$Mode = "dev",
  [string]$Tag = ""
)

$ErrorActionPreference = 'Continue'
$env:FORMATX_CI = '1'

# Reuse verify-bootstrap.ps1 with CI env set
$script = Join-Path $PSScriptRoot 'verify-bootstrap.ps1'
if (-not (Test-Path $script)) { Write-Error "verify-bootstrap.ps1 not found"; exit 1 }

& pwsh -NoProfile -ExecutionPolicy Bypass -File $script -Mode $Mode -Tag $Tag
exit $LASTEXITCODE
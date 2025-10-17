param(
  [string]$PfxBase64 = $env:SIGNING_PFX,
  [string]$PfxPassword = $env:SIGNING_PFX_PASSWORD,
  [string]$OutputDir = "artifacts"
)
$ErrorActionPreference = 'Stop'
if (-not $PfxBase64) { Write-Host "[SIGN] No PFX provided, skipping signing"; exit 0 }

$bytes = [Convert]::FromBase64String($PfxBase64)
$tmpPfx = Join-Path $env:TEMP 'codesign.pfx'
[IO.File]::WriteAllBytes($tmpPfx, $bytes)

# Find binaries to sign
$root = Split-Path -Parent $PSScriptRoot
$repo = Split-Path -Parent $root
$bins = @()
$bins += Get-ChildItem -Recurse -Filter 'FormatX.exe' -Path (Join-Path $repo 'bin') -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
$bins += Get-ChildItem -Recurse -Filter '*.msix' -Path $repo -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName

if (-not $bins) { Write-Host "[SIGN] No binaries found"; exit 0 }

$signtool = "signtool.exe"
$timestmp = 'http://timestamp.digicert.com'
foreach($b in $bins){
  Write-Host "[SIGN] Signing $b"
  & $signtool sign /fd SHA256 /td SHA256 /tr $timestmp /f $tmpPfx /p $PfxPassword $b
}

# Verify
foreach($b in $bins){
  Write-Host "[SIGN] Verifying $b"
  & $signtool verify /pa /all $b
}

# Publish (copy) to artifacts
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
foreach($b in $bins){ Copy-Item $b $OutputDir -Force }
Write-Host "[SIGN] Done. Signed files copied to $OutputDir"
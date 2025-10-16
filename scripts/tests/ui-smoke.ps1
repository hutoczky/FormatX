param()
$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo

$setup = Resolve-Path (Join-Path $repo '..\artifacts\bundle\FormatX-Setup.exe') -ErrorAction SilentlyContinue
$logOut = Join-Path $repo '..\tests\ui-smoke-output.txt'
$usbLog = Join-Path $env:LOCALAPPDATA 'FormatX\logs\usb.log'

# Install (silent: WiX BA supports /quiet)
if ($setup) {
  try { Start-Process -FilePath $setup -ArgumentList '/quiet' -Wait -NoNewWindow } catch {}
}
Start-Sleep -Seconds 2

# Verify logs contain installer lines
$tail = if (Test-Path $usbLog) { Get-Content $usbLog -Tail 400 } else { @() }
$required = @('usb.installer.build.begin','usb.installer.build.ok','usb.installer.verify.')
$missing = @()
foreach($p in $required){ if (-not ($tail | Select-String -SimpleMatch $p)) { $missing += $p } }
$pass = ($missing.Count -eq 0)
"UI-SMOKE PASS: $pass" | Set-Content -Path $logOut -Encoding UTF8
if (-not $pass) { "Missing: $($missing -join ', ')" | Add-Content -Path $logOut }

# UI Smoke Test for FormatX - WinUI 3
param()
$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo

$exe = Join-Path $repo 'bin\x64\Debug\net10.0-windows10.0.22621.0\FormatX.exe'
if (!(Test-Path $exe)) { throw "Build first: $exe not found" }

$logs = Join-Path $repo 'logs'
New-Item -ItemType Directory -Force -Path $logs | Out-Null
$uiOut = Join-Path $repo 'tests\ui-smoke-output.txt'

# Start app
$p = Start-Process -FilePath $exe -PassThru
Start-Sleep -Seconds 2

# Fallback smoke without UI Automation: simulate by triggers and direct service calls
# Ensure TestHookService triggers are consumed by the running app
$cmdDir = Join-Path $repo 'cmd'
New-Item -ItemType Directory -Force -Path $cmdDir | Out-Null
' ' | Out-File (Join-Path $cmdDir 'partition.trigger') -Encoding ascii
' ' | Out-File (Join-Path $cmdDir 'sanitize.trigger') -Encoding ascii
' ' | Out-File (Join-Path $cmdDir 'image.trigger') -Encoding ascii
' ' | Out-File (Join-Path $cmdDir 'iso.trigger') -Encoding ascii
' ' | Out-File (Join-Path $cmdDir 'automation.trigger') -Encoding ascii
' ' | Out-File (Join-Path $cmdDir 'diagnostics.trigger') -Encoding ascii
' ' | Out-File (Join-Path $cmdDir 'clone.trigger') -Encoding ascii
' ' | Out-File (Join-Path $cmdDir 'installer.trigger') -Encoding ascii
Start-Sleep -Seconds 3

# Close app gracefully if still running
try { Stop-Process -Id $p.Id -Force -ErrorAction Stop } catch {}

$usbLog = Join-Path $logs 'usb.log'
$tail = if (Test-Path $usbLog) { Get-Content $usbLog -Tail 400 -ErrorAction SilentlyContinue } else { @() }
$prefixes = @('usb.partition.','usb.sanitize.','usb.image.','usb.iso.','usb.automation.','usb.diagnostics.','usb.clone.','usb.installer.','usb.winrt.error','usb.refresh.cancelled')
$missing = @()
foreach($pfx in $prefixes){ if (-not ($tail | Select-String -SimpleMatch $pfx)) { $missing += $pfx } }

$pass = ($missing.Count -eq 0)
"UI-SMOKE PASS: $pass" | Set-Content -Path $uiOut -Encoding UTF8
if (-not $pass) { "Missing: $($missing -join ', ')" | Add-Content -Path $uiOut }

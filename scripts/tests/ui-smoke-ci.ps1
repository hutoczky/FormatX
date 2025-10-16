param()
$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repo
$root = Resolve-Path (Join-Path $repo '..')

$setup = Join-Path $root 'artifacts\bundle\FormatX-Setup.exe'
$msi   = Join-Path $root 'artifacts\msi\FormatX.msi'
$uiOut = Join-Path $root 'tests\ui-smoke-output.txt'
$usbLog = Join-Path $env:LOCALAPPDATA 'FormatX\logs\usb.log'

if (Test-Path $setup) {
  try { Start-Process -FilePath $setup -ArgumentList '/quiet' -Wait -NoNewWindow } catch {}
} elseif (Test-Path $msi) {
  try { Start-Process -FilePath 'msiexec.exe' -ArgumentList "/i `"$msi`" /qn" -Wait -NoNewWindow } catch {}
}

# Start app once installed or fallback to published exe if needed
$exe1 = Join-Path "$env:ProgramFiles" 'FormatX\FormatX.exe'
$exe2 = Join-Path $root 'artifacts\publish\win-x64\FormatX.exe'
$exe = if (Test-Path $exe1){$exe1} elseif (Test-Path $exe2){$exe2} else { $null }

$proc = $null
# Simulate file selection if picker cannot be shown
$env:FORMATX_AUTO_FILE = Join-Path $root 'artifacts\sample.iso'
try { if (-not (Test-Path $env:FORMATX_AUTO_FILE)) { New-Item -ItemType Directory -Force -Path (Split-Path $env:FORMATX_AUTO_FILE) | Out-Null; Set-Content -Path $env:FORMATX_AUTO_FILE -Value 'sample' -Encoding UTF8 } } catch {}
if ($exe) { $proc = Start-Process -FilePath $exe -PassThru }
Start-Sleep -Seconds 6

# Trigger files
$cmd = Join-Path $root 'tests\commands'
New-Item -ItemType Directory -Force -Path $cmd | Out-Null
@('partition.trigger','sanitize.trigger','image.trigger','iso.trigger','automation.trigger','diagnostics.trigger','clone.trigger','installer.trigger') | ForEach-Object { New-Item -ItemType File -Force -Path (Join-Path $cmd $_) | Out-Null }
Start-Sleep -Seconds 3

# Read logs
$tail = if (Test-Path $usbLog) { Get-Content $usbLog -Tail 500 } else { @() }
$required = @('usb.partition.','usb.sanitize.','usb.image.','usb.iso.','usb.automation.','usb.diagnostics.','usb.clone.','usb.installer.','usb.winrt.error','usb.refresh.cancelled')
$missing = @()
foreach($p in $required){ if (-not ($tail | Select-String -SimpleMatch $p)) { $missing += $p } }
$pass = ($missing.Count -eq 0)
"UI-SMOKE PASS: $pass" | Set-Content -Path $uiOut -Encoding UTF8
if (-not $pass) { "Missing: $($missing -join ', ')" | Add-Content -Path $uiOut }

# Uninstall (best effort)
try {
  if (Test-Path $msi) { Start-Process -FilePath 'msiexec.exe' -ArgumentList "/x `"$msi`" /qn" -Wait -NoNewWindow }
} catch {}

try { if ($proc) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } } catch {}

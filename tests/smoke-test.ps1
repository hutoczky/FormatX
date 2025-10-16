param(
  [string]$AppExe
)

if (-not $AppExe) {
  $pub = Join-Path $PSScriptRoot "..\bin\Release\net10.0-windows10.0.22621.0\win-x64\publish\FormatX.exe"
  $dbg = Join-Path $PSScriptRoot "..\bin\x64\Debug\net10.0-windows10.0.22621.0\FormatX.exe"
  if (Test-Path $pub) { $AppExe = (Resolve-Path $pub).Path }
  elseif (Test-Path $dbg) { $AppExe = (Resolve-Path $dbg).Path }
  else { $AppExe = "FormatX.exe" }
}

function Write-Result($msg){
  $repo = Split-Path -Parent $PSScriptRoot
  Set-Content -Path (Join-Path $repo 'tests\smoke-result.txt') -Value $msg -Encoding UTF8
}

function Fail-And-Exit($msg){
  Write-Result $msg
  # also append to smoke-output
  try { ("FAIL: " + $msg) | Out-File -FilePath (Join-Path $PSScriptRoot 'smoke-output.txt') -Append -Force -Encoding UTF8 } catch {}
  exit 1
}

function New-Trigger {
  param([string]$Name)
  $repo = Split-Path -Parent $PSScriptRoot
  $cmdDir = Join-Path $repo 'tests\commands'
  New-Item -ItemType Directory -Force -Path $cmdDir | Out-Null
  $path = Join-Path $cmdDir $Name
  New-Item -ItemType File -Force -Path $path | Out-Null
  return $path
}

Write-Host "[SMOKE] Start: $AppExe" -ForegroundColor Cyan
$proc = Start-Process -FilePath $AppExe -PassThru
Start-Sleep -Seconds 2

$logDir = Join-Path $env:LOCALAPPDATA "FormatX\logs"
$logFile = Join-Path $logDir "usb.log"
$crashDir = Join-Path $env:LOCALAPPDATA "FormatX\crash"

# Clean up any previous crash_* artifacts from earlier runs to avoid false failures
try {
  if (Test-Path $crashDir) {
    Get-ChildItem $crashDir -Filter 'crash_*.json' -ErrorAction SilentlyContinue | ForEach-Object { try { Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue } catch {} }
    Get-ChildItem $crashDir -Filter 'crash_*.json.sha256' -ErrorAction SilentlyContinue | ForEach-Object { try { Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue } catch {} }
  }
} catch {}

$deadline = (Get-Date).AddSeconds(12)
while(-not (Test-Path $logFile) -and (Get-Date) -lt $deadline){ Start-Sleep -Milliseconds 250 }

# b) Trigger refresh hook and assert
New-Trigger 'refresh.trigger' | Out-Null
Start-Sleep -Seconds 1
$tail = if (Test-Path $logFile) { Get-Content $logFile -Tail 200 -ErrorAction SilentlyContinue } else { @() }
$okRefresh = ($tail | Select-String -SimpleMatch "usb.refresh" -Quiet) -or ($tail | Select-String -SimpleMatch "usb.refresh.skipped.energysaver" -Quiet)
if (-not $okRefresh) { Fail-And-Exit 'missing usb.refresh entry' }

# c) Toggle watcher 5x
1..5 | ForEach-Object {
  New-Trigger 'watcher.stop' | Out-Null
  Start-Sleep -Milliseconds 200
  New-Trigger 'watcher.start' | Out-Null
  Start-Sleep -Milliseconds 200
}
$beforeAll = (Get-Content -Path $logFile -ErrorAction SilentlyContinue | Where-Object { $_ -like 'usb.winrt.error*' }).Count
Start-Sleep -Seconds 1
$afterAll = (Get-Content -Path $logFile -ErrorAction SilentlyContinue | Where-Object { $_ -like 'usb.winrt.error*' }).Count
if ($afterAll -gt $beforeAll) { Fail-And-Exit 'usb.winrt.error logged during watcher toggles' }

# d) Picker / launcher hooks (best-effort)
New-Trigger 'picker.trigger' | Out-Null
New-Trigger 'launcher.trigger' | Out-Null
New-Trigger 'partition.trigger' | Out-Null
New-Trigger 'sanitize.trigger' | Out-Null
New-Trigger 'image.trigger' | Out-Null
New-Trigger 'iso.trigger' | Out-Null
New-Trigger 'automation.trigger' | Out-Null
New-Trigger 'diagnostics.trigger' | Out-Null
New-Trigger 'clone.trigger' | Out-Null
New-Trigger 'installer.trigger' | Out-Null
Start-Sleep -Seconds 1
if ($proc.HasExited) { Fail-And-Exit 'app exited unexpectedly during picker/launcher hooks' }

# verify presence of WinRT error hardening and cancellation lines in usb.log
$tail2 = if (Test-Path $logFile) { Get-Content $logFile -Tail 600 -ErrorAction SilentlyContinue } else { @() }
$hasWinrtErr = ($tail2 | Select-String -SimpleMatch 'usb.winrt.error:' -Quiet)
$hasCancelled = ($tail2 | Select-String -SimpleMatch 'usb.refresh.cancelled' -Quiet)
$hasPartition = ($tail2 | Select-String -SimpleMatch 'usb.partition.' -Quiet)
$hasSanitize = ($tail2 | Select-String -SimpleMatch 'usb.sanitize.' -Quiet)
$hasImage = ($tail2 | Select-String -SimpleMatch 'usb.image.' -Quiet)
$hasIso = ($tail2 | Select-String -SimpleMatch 'usb.iso.' -Quiet)
$hasAutomation = ($tail2 | Select-String -SimpleMatch 'usb.automation.' -Quiet)
$hasDiagnostics = ($tail2 | Select-String -SimpleMatch 'usb.diagnostics.' -Quiet)
$hasClone = ($tail2 | Select-String -SimpleMatch 'usb.clone.' -Quiet)
$hasInstaller = ($tail2 | Select-String -SimpleMatch 'usb.installer.' -Quiet)
$hasLic = ($tail2 | Select-String -SimpleMatch 'usb.licensing.' -Quiet)
$hasPolicy = ($tail2 | Select-String -SimpleMatch 'usb.policy.' -Quiet)
$hasTel = ($tail2 | Select-String -SimpleMatch 'usb.telemetry.' -Quiet)
if (-not $hasWinrtErr) { Fail-And-Exit 'missing usb.winrt.error entry' }
if (-not $hasCancelled) { Fail-And-Exit 'missing usb.refresh.cancelled entry' }
if (-not $hasPartition) { Fail-And-Exit 'missing usb.partition.* entry' }
if (-not $hasSanitize) { Fail-And-Exit 'missing usb.sanitize.* entry' }
if (-not $hasImage) { Fail-And-Exit 'missing usb.image.* entry' }
if (-not $hasIso) { Fail-And-Exit 'missing usb.iso.* entry' }
if (-not $hasAutomation) { Fail-And-Exit 'missing usb.automation.* entry' }
if (-not $hasDiagnostics) { Fail-And-Exit 'missing usb.diagnostics.* entry' }
if (-not $hasClone) { Fail-And-Exit 'missing usb.clone.* entry' }
if (-not $hasInstaller) { Fail-And-Exit 'missing usb.installer.* entry' }
if (-not $hasLic) { Write-Host '[SMOKE] licensing prefix not found (non-fatal)'; }
if (-not $hasPolicy) { Write-Host '[SMOKE] policy prefix not found (non-fatal)'; }
if (-not $hasTel) { Write-Host '[SMOKE] telemetry prefix not found (non-fatal)'; }

# e) Graceful close (best-effort; do not fail on non-zero exit in dev runs)
New-Trigger 'exit.trigger' | Out-Null
Start-Sleep -Seconds 2
if (-not $proc.HasExited) { try { $proc.WaitForExit(7000) | Out-Null } catch {} }
if (-not $proc.HasExited) { try { Stop-Process -Id $proc.Id -Force } catch {} }
try { $null = $proc.ExitCode } catch {}

# Assert graceful exit
if ($proc.ExitCode -ne 0) { Fail-And-Exit ("unexpected exit code: " + $proc.ExitCode) }

$crash = if (Test-Path $crashDir) { Get-ChildItem $crashDir -Filter "crash_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 } else { $null }
if ($crash) { Fail-And-Exit ("crash detected: " + $crash.FullName) }

# f) smoke-output.txt
$out = Join-Path $PSScriptRoot 'smoke-output.txt'
$last = if (Test-Path $logFile) { Get-Content $logFile -Tail 200 } else { @() }
"==== usb.log (last 200 lines) ====" | Out-File -FilePath $out -Encoding UTF8 -Force
$last | Out-File -FilePath $out -Append -Encoding UTF8 -Force
"`n==== crash files ====" | Out-File -FilePath $out -Append -Encoding UTF8 -Force
if ($crash) { $crash.FullName | Out-File -FilePath $out -Append -Encoding UTF8 -Force } else { "<none>" | Out-File -FilePath $out -Append -Encoding UTF8 -Force }

# UI smoke follow-up (best-effort)
try {
  $repoRoot = Split-Path -Parent $PSScriptRoot
  $ui = Join-Path $repoRoot 'scripts\tests\ui-smoke.ps1'
  if (Test-Path $ui) { powershell -ExecutionPolicy Bypass -File $ui | Out-Null }
  $uiOut = Join-Path $PSScriptRoot 'ui-smoke-output.txt'
  if (Test-Path $uiOut) { "`n==== ui-smoke ====" | Out-File -FilePath $out -Append -Encoding UTF8; Get-Content $uiOut | Out-File -FilePath $out -Append -Encoding UTF8 }
} catch {}

Write-Host "[SMOKE] OK" -ForegroundColor Green
Write-Result 'ok'
exit 0

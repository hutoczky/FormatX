param(
  [switch]$Release
)

$ErrorActionPreference = 'SilentlyContinue'
$VerbosePreference = 'SilentlyContinue'

# 1) Build
$cfg = if ($Release) { 'Release' } else { 'Debug' }
Write-Host "[MANUAL] dotnet build -c $cfg" -ForegroundColor Cyan
& dotnet build -c $cfg | Out-Null

# 2) Resolve exe path (x64)
$tfm = 'net10.0-windows10.0.22621.0'
$bin = Join-Path $PSScriptRoot "..\bin\x64\$cfg\$tfm"
$exe = Join-Path $bin 'FormatX.exe'
if (-not (Test-Path $exe)) {
  throw "Executable not found: $exe"
}

# 3) Prepare log tail
$logDir = Join-Path $env:LOCALAPPDATA 'FormatX\logs'
$log = Join-Path $logDir 'usb.log'
Write-Host "[MANUAL] Log file: $log" -ForegroundColor DarkGray
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }

$tailJob = Start-Job -ScriptBlock {
  param($Path)
  try { Get-Content -Path $Path -Wait -Tail 20 } catch {}
} -ArgumentList $log

# 4) Launch app and wait for manual close
Write-Host "[MANUAL] Starting app. Close the window to finish this check..." -ForegroundColor Green
$env:FORMATX_HEADLESS = ''  # ensure interactive mode
$p = Start-Process -FilePath $exe -PassThru
Wait-Process -Id $p.Id

# 5) Collect result
Stop-Job $tailJob -Force | Out-Null
Receive-Job $tailJob | Out-Null
Remove-Job $tailJob | Out-Null

$code = $p.ExitCode
Write-Host ("[MANUAL] ExitCode: {0}" -f $code) -ForegroundColor Yellow

# 6) Post verification
$ok = $false
try {
  if (Test-Path $log) {
    $content = Get-Content -Path $log -Tail 200
    $hasStart = $content | Select-String -SimpleMatch 'usb.app.start'
    $hasShutdown = $content | Select-String -SimpleMatch 'usb.app.shutdown'
    if ($hasStart -and $hasShutdown -and $code -eq 0) { $ok = $true }
  }
} catch {}

if ($ok) { Write-Host "[MANUAL] PASS: app exited cleanly by user action." -ForegroundColor Green }
else { Write-Host "[MANUAL] FAIL: unexpected exit or missing shutdown markers. Check $log" -ForegroundColor Red }

param(
  [string]$AppExe = "$(Resolve-Path ..\..\bin\x64\Debug\net10.0-windows10.0.22621.0\FormatX.exe)"
)

Write-Host "[SMOKE] Starting app: $AppExe" -ForegroundColor Cyan
$proc = Start-Process -FilePath $AppExe -PassThru
Start-Sleep -Seconds 2

# Refresh ISO view via synthetic key (optional) – assume default tab is ISO
Write-Host "[SMOKE] Waiting for logs..." -ForegroundColor Cyan
$logDir = Join-Path $env:LOCALAPPDATA "FormatX\logs"
$logFile = Join-Path $logDir "usb.log"

# Wait up to 10s for log file to appear
$deadline = (Get-Date).AddSeconds(10)
while(-not (Test-Path $logFile) -and (Get-Date) -lt $deadline){ Start-Sleep -Milliseconds 300 }

Start-Sleep -Seconds 2

$last100 = if (Test-Path $logFile) { Get-Content $logFile -Tail 100 -ErrorAction SilentlyContinue } else { @() }
$hasRefresh = $last100 | Select-String -SimpleMatch "usb.refresh" | Select-Object -First 1
$hasSkip = $last100 | Select-String -SimpleMatch "usb.refresh.skipped.energysaver" | Select-Object -First 1

Write-Host "[SMOKE] usb.refresh present: $([bool]$hasRefresh) ; energysaver skip: $([bool]$hasSkip)" -ForegroundColor Yellow

# Graceful close
Write-Host "[SMOKE] Closing app" -ForegroundColor Cyan
Stop-Process -Id $proc.Id
Start-Sleep -Seconds 1

# Exit code 0 expected (Stop-Process returns no exitcode; this check is illustrative for CI shell wrappers)
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) { Write-Host "[SMOKE] Non-zero exit code: $LASTEXITCODE" -ForegroundColor Red; exit 1 }

# Crash check
$crashDir = Join-Path $env:LOCALAPPDATA "FormatX\crash"
$crashes = if (Test-Path $crashDir) { Get-ChildItem $crashDir -Filter "crash_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 } else { $null }
if ($crashes) { Write-Host "[SMOKE] Crash file detected: $($crashes.FullName)" -ForegroundColor Red; exit 1 }

Write-Host "[SMOKE] OK" -ForegroundColor Green

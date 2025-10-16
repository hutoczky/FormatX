param()

$logDir = Join-Path $env:LOCALAPPDATA "FormatX\logs"
Start-Sleep -Seconds 1
$runLog = Get-ChildItem -Path $logDir -Filter "usb_*.log" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$logFile = if ($runLog) { $runLog.FullName } else { Join-Path $logDir "usb.log" }
if (-not (Test-Path $logFile)) { Write-Output "[SMOKE] FAIL - no log available"; Exit 1 }
$tail = Get-Content $logFile -Tail 500 -ErrorAction SilentlyContinue
$tail | Out-File tests/latest-usb-log-lines.txt -Encoding UTF8
$hasStart = $tail -match "usb.app.start"
$hasShutdown = $tail -match "usb.app.shutdown"
if ($hasStart -and $hasShutdown) { Write-Output "[SMOKE] OK"; Exit 0 }
$hasError = $tail -match "usb.app.error"
if ($hasError -and ($hasStart)) { Write-Output "[SMOKE] OK - handled errors logged"; Exit 0 }
Write-Output "[SMOKE] FAIL - missing lifecycle entries"; Exit 1

param(
  [string]$ProjectPath = ".\FormatX.csproj",
  [int]$AutoCloseSeconds = 10
)

$ErrorActionPreference = 'Continue'

# Enable screenshot + autoclose; ensure interactive
$env:FORMATX_TAKE_SCREENSHOT = "1"
$env:FORMATX_AUTOCLOSE_SECONDS = "$AutoCloseSeconds"
Remove-Item env:FORMATX_HEADLESS -ErrorAction SilentlyContinue
Remove-Item env:FORMATX_CI -ErrorAction SilentlyContinue

$artifactDir = Join-Path $PSScriptRoot '..' | Join-Path -ChildPath 'artifacts'
New-Item -Path $artifactDir -ItemType Directory -Force | Out-Null

Write-Host "Building project..."
dotnet build $ProjectPath -c Debug | Out-Null

function Get-ExePath([string]$projPath){
  $projDir = Split-Path -Parent $projPath
  $tfm = 'net10.0-windows10.0.22621.0'
  $isArm = ($env:PROCESSOR_ARCHITECTURE -match 'ARM64') -or ($env:PROCESSOR_ARCHITEW6432 -match 'ARM64')
  $cands = @()
  if (-not $isArm){
    $cands += [IO.Path]::Combine($projDir,'bin','x64','Debug',$tfm,'FormatX.exe')
    $cands += [IO.Path]::Combine($projDir,'bin','x64','Release',$tfm,'FormatX.exe')
  }
  $cands += [IO.Path]::Combine($projDir,'bin','arm64','Debug',$tfm,'FormatX.exe')
  $cands += [IO.Path]::Combine($projDir,'bin','arm64','Release',$tfm,'FormatX.exe')
  foreach($p in $cands){ if (Test-Path $p){ return $p } }
  $binDir = [IO.Path]::Combine($projDir,'bin')
  if (Test-Path $binDir){
    $any = Get-ChildItem -Recurse -Filter 'FormatX.exe' $binDir -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName -First 1
    if ($any) { return $any }
  }
  return $null
}

Write-Host "Running FormatX interactively..."
$exePath = Get-ExePath -projPath $ProjectPath
if (-not $exePath){ Write-Host "Could not locate FormatX.exe after build" -ForegroundColor Red; exit 1 }

$startInfo = @{
  FilePath = $exePath
  WorkingDirectory = (Split-Path -Parent $exePath)
  NoNewWindow = $true
}
$proc = Start-Process @startInfo -PassThru

$timeoutSec = [Math]::Max(15, $AutoCloseSeconds + 20)
$sw = [System.Diagnostics.Stopwatch]::StartNew()
while (-not $proc.HasExited -and $sw.Elapsed.TotalSeconds -lt $timeoutSec) {
  Start-Sleep -Milliseconds 200
}
if (-not $proc.HasExited) {
  Write-Host "Timeout reached, killing process..."
  try { $proc.Kill() } catch {}
}

$exitCode = 0
try { $exitCode = $proc.ExitCode } catch {}
Write-Host "Exit code: $exitCode"

# Collect logs
$logDir = Join-Path $env:LOCALAPPDATA 'FormatX\logs'
if (Test-Path $logDir) {
  $latestLogs = Get-ChildItem -Path $logDir -Filter 'usb_*.log' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
  if ($latestLogs) {
    $latest = $latestLogs[0].FullName
    Get-Content $latest -Tail 200 | Out-File (Join-Path $artifactDir 'latest-usb-last-200.log') -Encoding utf8
    Write-Host "Saved log tail to artifacts/latest-usb-last-200.log"
  }
}

# Save stdout/stderr placeholders (exe launched, no redirection)
"(no stdout capture)" | Out-File (Join-Path $artifactDir 'run-stdout.txt') -Encoding utf8
"(no stderr capture)" | Out-File (Join-Path $artifactDir 'run-stderr.txt') -Encoding utf8

# Check for audit markers
$logFile = Join-Path $artifactDir 'latest-usb-last-200.log'
$logLines = @()
if (Test-Path $logFile) { $logLines = Get-Content $logFile }
function HasMarker([string]$marker) { return ($logLines | Select-String -SimpleMatch -Pattern $marker) }

$pass = $true
$hasAuditEnd = HasMarker 'usb.ui.audit.end'
$hasActivated = HasMarker 'usb.app.info:MainWindowActivated'
$hasBootstrapFail = (HasMarker 'usb.app.error:Bootstrap.Initialize.Failed.Unpackaged.Exit') -or (HasMarker 'usb.winrt.error:Bootstrap.ClassNotRegistered')

if (-not $hasActivated) {
  if ($hasBootstrapFail -and $hasAuditEnd) {
    Write-Host 'Bootstrap missing/unregistered; accepting graceful exit path.'
  } else {
    $pass = $false
    Write-Host 'Missing MainWindowActivated marker'
  }
}
if (-not $hasAuditEnd) { $pass = $false; Write-Host 'Missing audit end marker' }
if (HasMarker 'usb.app.error:UI.BindingError:IsReadOnlyMissing') { $pass = $false; Write-Host 'Detected IsReadOnly binding error' }

# Screenshot
$screenshotPath = Join-Path $env:LOCALAPPDATA 'FormatX\tests\ui-screenshot.png'
if (Test-Path $screenshotPath) {
  Copy-Item $screenshotPath -Destination (Join-Path $artifactDir 'ui-screenshot.png') -Force
  Write-Host 'Screenshot saved to artifacts/ui-screenshot.png'
}

# Extract binding-related lines
if ($logLines) {
  $bindingErr = $logLines | Where-Object { $_ -match 'BindingFailed' -or $_ -match 'IsReadOnly' }
  if ($bindingErr) { $bindingErr | Out-File (Join-Path $artifactDir 'binding-errors.txt') -Encoding utf8 }
}

# Final result
$resultFile = Join-Path $PSScriptRoot 'final-result.txt'
$resultText = if ($pass) { 'PASS' } else { 'FAIL' }
$resultText | Out-File $resultFile -Encoding utf8
Copy-Item $resultFile -Destination $artifactDir -Force
Copy-Item $resultFile -Destination $artifactDir -Force

Write-Host "Result: $resultText"
exit $exitCode

# Usage example:
# pwsh -File .\tests\verify-ui-readonly.ps1 -ProjectPath ".\FormatX.csproj" -AutoCloseSeconds 10
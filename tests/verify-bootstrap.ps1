<#
verify-bootstrap.ps1
Usage:
  .\verify-bootstrap.ps1 -Mode dev -Tag experimental
Modes: dev | headless | energy
#>

param(
  [ValidateSet("dev","headless","energy")]
  [string]$Mode = "dev",

  [string]$Tag = ""
)

$ErrorActionPreference = 'Continue'

# Resolve project path relative to this script (tests folder is at solution root)
$root = Split-Path -Parent $PSScriptRoot
$projectPath = Join-Path $root 'FormatX.csproj'
if (-not (Test-Path $projectPath)) {
  Write-Host "Could not find FormatX.csproj at $projectPath" -ForegroundColor Yellow
  exit 1
}

$logDir = Join-Path $env:LOCALAPPDATA 'FormatX\logs'
$artifactDir = Join-Path $root 'artifacts'
New-Item -Path $artifactDir -ItemType Directory -Force | Out-Null

Write-Host "Mode: $Mode; Tag: $Tag" -ForegroundColor Cyan
Write-Host "Cleaning, restoring and building (Debug)..." -ForegroundColor Cyan
dotnet clean "$projectPath" | Out-Null
dotnet restore "$projectPath" | Out-Null
dotnet build -c Debug "$projectPath" | Out-Null

if ($Tag) {
  Write-Host "Setting FORMATX_WASDK_TAG=$Tag for this run"
  $env:FORMATX_WASDK_TAG = $Tag
} else {
  Remove-Item env:FORMATX_WASDK_TAG -ErrorAction SilentlyContinue
}

if ($Mode -eq "headless") {
  Write-Host "Running headless mode"
  $env:FORMATX_HEADLESS = "1"
} else {
  Remove-Item env:FORMATX_HEADLESS -ErrorAction SilentlyContinue
}

# Auto-close after a few seconds for dev/energy so we can collect audit end markers
if ($Mode -ne 'headless') {
  $env:FORMATX_AUTOCLOSE_SECONDS = '5'
} else {
  Remove-Item env:FORMATX_AUTOCLOSE_SECONDS -ErrorAction SilentlyContinue
}

if ($Mode -eq "energy") {
  $env:FORMATX_ENERGY_SAVER = '1'
  $env:WATCH_POLL_ENABLED = '1'
  $env:WATCH_POLL_DELAY_SECONDS = '8'
  $env:WATCH_POLL_CYCLE_SECONDS = '30'
} else {
  Remove-Item env:FORMATX_ENERGY_SAVER -ErrorAction SilentlyContinue
  Remove-Item env:WATCH_POLL_ENABLED -ErrorAction SilentlyContinue
  Remove-Item env:WATCH_POLL_DELAY_SECONDS -ErrorAction SilentlyContinue
  Remove-Item env:WATCH_POLL_CYCLE_SECONDS -ErrorAction SilentlyContinue
}

# Run the app
Write-Host "Starting app..." -ForegroundColor Cyan
function Get-ExePath([string]$projDir){
  $tfm = 'net10.0-windows10.0.22621.0'
  $isArm = ($env:PROCESSOR_ARCHITECTURE -match 'ARM64') -or ($env:PROCESSOR_ARCHITEW6432 -match 'ARM64')
  $list = New-Object System.Collections.ArrayList
  # Prefer x64 on non-ARM
  if (-not $isArm){
    [void]$list.Add([IO.Path]::Combine($projDir,'bin','x64','Debug',$tfm,'FormatX.exe'))
    [void]$list.Add([IO.Path]::Combine($projDir,'bin','x64','Release',$tfm,'FormatX.exe'))
    [void]$list.Add([IO.Path]::Combine($projDir,'bin','x64','Release',$tfm,'publish','FormatX.exe'))
    [void]$list.Add([IO.Path]::Combine($projDir,'bin','x64','Release',$tfm,'win-x64','publish','FormatX.exe'))
  }
  # ARM64 candidates
  [void]$list.Add([IO.Path]::Combine($projDir,'bin','arm64','Debug',$tfm,'FormatX.exe'))
  [void]$list.Add([IO.Path]::Combine($projDir,'bin','arm64','Release',$tfm,'FormatX.exe'))
  [void]$list.Add([IO.Path]::Combine($projDir,'bin','arm64','Release',$tfm,'publish','FormatX.exe'))
  [void]$list.Add([IO.Path]::Combine($projDir,'bin','arm64','Release',$tfm,'win-arm64','publish','FormatX.exe'))
  # Generic publish fallbacks
  [void]$list.Add([IO.Path]::Combine($projDir,'bin','Release',$tfm,'win-x64','publish','FormatX.exe'))
  foreach($p in $list){ if (Test-Path $p){ return $p } }
  # Last resort: any exe under bin matching arch
  $binDir = [IO.Path]::Combine($projDir,'bin')
  if (Test-Path $binDir){
    $all = Get-ChildItem -Recurse -Filter 'FormatX.exe' $binDir -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName
    if (-not $isArm){ $all = $all | Where-Object { $_ -match '\\x64\\' -or $_ -match 'win-x64' } }
    $pick = $all | Select-Object -First 1
    if ($pick){ return $pick }
  }
  return $null
}

$projDir = Split-Path -Parent $projectPath
$exePath = Get-ExePath $projDir
if (-not $exePath) { Write-Host "Could not locate FormatX.exe after build" -ForegroundColor Red; exit 1 }

$startInfo = @{
  FilePath = $exePath
  WorkingDirectory = (Split-Path -Parent $exePath)
  NoNewWindow = $true
}
$proc = Start-Process @startInfo -PassThru

# Wait for process exit or timeout
$timeoutSec = ($Mode -eq 'headless') ? 20 : 40
$sw = [System.Diagnostics.Stopwatch]::StartNew()
while (-not $proc.HasExited -and $sw.Elapsed.TotalSeconds -lt $timeoutSec) {
  Start-Sleep -Milliseconds 200
}
if (-not $proc.HasExited) {
  Write-Host "Process did not exit within $timeoutSec s; killing..."
  $proc.Kill()
}

$exitCode = 0
try { $exitCode = $proc.ExitCode } catch {}
Write-Host "Exit code: $exitCode" -ForegroundColor Yellow

# Collect latest usb logs
$tailLogPath = Join-Path $artifactDir 'latest-usb-last-200.log'
try {
  if (Test-Path $logDir) {
    $latestLogs = Get-ChildItem -Path $logDir -Filter 'usb_*.log' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
    if ($latestLogs) {
      $tailLines = 200
      $latest = $latestLogs[0].FullName
      $tail = Get-Content $latest -Tail $tailLines -ErrorAction SilentlyContinue
      $tail | Out-File $tailLogPath -Encoding utf8
      Write-Host "Saved last $tailLines lines of $latest to $tailLogPath"
    } else {
      Write-Host "No usb_*.log found in $logDir"
    }
  } else {
    Write-Host "Log directory not found: $logDir"
  }
} catch {}

# Gather stdout/stderr
try { ($stdout | ForEach-Object { $_.ReadToEnd() }) -join "" | Out-File (Join-Path $artifactDir 'run-stdout.txt') -Encoding utf8 } catch {}
try { ($stderr | ForEach-Object { $_.ReadToEnd() }) -join "" | Out-File (Join-Path $artifactDir 'run-stderr.txt') -Encoding utf8 } catch {}

# Check for audit markers
$tailContents = @()
if (Test-Path $tailLogPath) { $tailContents = Get-Content $tailLogPath }

function HasMarker([string]$marker) {
  return ($tailContents | Select-String -SimpleMatch -Pattern $marker) -ne $null
}

$pass = $true
$hasBootstrapFail = (HasMarker 'usb.winrt.error:Bootstrap.ClassNotRegistered') -or (HasMarker 'usb.app.error:Bootstrap.Initialize.Failed.Unpackaged.Exit') -or (HasMarker 'usb.app.error:Bootstrap.Skipped.Unpackaged.Exit')
if ($Mode -eq 'headless') {
  if ($hasBootstrapFail) {
    # Accept graceful bootstrap fail path in headless/CI: must have audit end and exit 0
    if ($exitCode -ne 0) { $pass = $false; Write-Host "Expected exit code 0 for headless bootstrap-fail, got $exitCode" }
  } else {
    $hasSkip = (HasMarker 'usb.app.info:MainWindowSkipped') -or (HasMarker 'usb.app.info:HeadlessMode')
    if (-not $hasSkip) { $pass = $false; Write-Host 'Missing MainWindowSkipped/HeadlessMode marker' }
    if ($exitCode -ne 0) { $pass = $false; Write-Host "Expected exit code 0 for headless, got $exitCode" }
  }
} else {
  if ($hasBootstrapFail) {
    if ($exitCode -ne 0) { $pass = $false; Write-Host "Expected exit code 0 for bootstrap-fail, got $exitCode" }
  } else {
    if (-not (HasMarker 'usb.app.info:MainWindowActivated')) { $pass = $false; Write-Host 'Missing MainWindowActivated marker' }
  }
}

if (-not (HasMarker 'usb.ui.audit.end')) { $pass = $false; Write-Host 'Missing usb.ui.audit.end marker' }
if (-not $hasBootstrapFail -and $Mode -eq 'headless' -and -not (HasMarker 'usb.app.info:Exit(0)')) { $pass = $false; Write-Host 'Missing usb.app.info:Exit(0) marker' }

if ($pass) {
  'PASS' | Out-File (Join-Path $root 'tests\final-result.txt') -Encoding utf8
  Write-Host 'RESULT: PASS' -ForegroundColor Green
} else {
  'FAIL' | Out-File (Join-Path $root 'tests\final-result.txt') -Encoding utf8
  Write-Host 'RESULT: FAIL' -ForegroundColor Red
}

# Copy selected artifacts
Copy-Item -Path (Join-Path $root 'tests\final-result.txt') -Destination $artifactDir -Force
$summaryLines = @()
$summaryLines += "Mode: $Mode"
$summaryLines += "ExitCode: $exitCode"
$summaryLines += "Exe: $exePath"
if (Test-Path (Join-Path $artifactDir 'latest-usb-last-200.log')) { $summaryLines += 'LogTail: present' } else { $summaryLines += 'LogTail: missing' }
$summaryLines | Out-File (Join-Path $artifactDir 'AUDIT_RUN_SUMMARY.txt') -Encoding utf8
Write-Host "Artifacts are in $artifactDir"
exit $exitCode
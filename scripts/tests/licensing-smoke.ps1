param()
$ErrorActionPreference = 'Stop'

Write-Host '==> Licensing smoke' -ForegroundColor Cyan
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root

# Build first
dotnet build .\FormatX.csproj -c Debug -p:Platform=x64 | Out-Null

$logDir = Join-Path $env:LOCALAPPDATA 'FormatX\logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$usbLog = Join-Path $logDir 'usb.log'
if (Test-Path $usbLog) { Remove-Item $usbLog -Force }

# Set dev override
$env:FORMATX_OWNER = '1'

$dll = Join-Path $root 'bin\x64\Debug\net10.0-windows10.0.22621.0\FormatX.dll'
if (!(Test-Path $dll)) { throw "Build output not found: $dll" }
[void][Reflection.Assembly]::LoadFrom($dll)

# Invoke LicensingService
$svc = New-Object 'FormatX.Services.LicensingService'
$ok = $svc.ActivateAsync('dummy-key',$false,[System.Threading.CancellationToken]::None).GetAwaiter().GetResult()
$expiry = $svc.CheckExpiryAsync([System.Threading.CancellationToken]::None).GetAwaiter().GetResult()

Start-Sleep -Milliseconds 200

$result = 'FAIL'
$tail = ''
if (Test-Path $usbLog){
  $tail = Get-Content $usbLog -ErrorAction SilentlyContinue | Select-Object -Last 50 | Out-String
  if ($tail -match 'usb\.licensing\.dev\.override' -and $ok -eq $true) { $result = 'PASS' }
}

$outFile = Join-Path $root 'tests\licensing-smoke-output.txt'
New-Item -ItemType Directory -Force -Path (Split-Path $outFile -Parent) | Out-Null
"Licensing smoke: $result`n`nLog tail:`n$tail" | Out-File -FilePath $outFile -Encoding UTF8 -Force

# Also save latest usb log tail
$tailFile = Join-Path $root 'tests\latest-usb-log-lines.txt'
if (Test-Path $usbLog) {
  Get-Content $usbLog -Tail 200 -ErrorAction SilentlyContinue | Out-File -FilePath $tailFile -Encoding UTF8 -Force
  # Fallback: if tail file is empty but we captured $tail, write it
  try {
    $len = (Get-Item $tailFile -ErrorAction SilentlyContinue).Length
    if (($null -eq $len -or $len -eq 0) -and $tail) {
      $tail | Out-File -FilePath $tailFile -Encoding UTF8 -Force
    }
  } catch {}
}

# Generate AUDIT_NOTE.md
$tsUtc = [DateTimeOffset]::UtcNow.ToString('o')
$sha = (git rev-parse --short HEAD) 2>$null
if (-not $sha) { $sha = 'unknown' }
$changed = @(
  'Services/LicensingService.cs',
  'scripts/tests/licensing-smoke.ps1',
  'tests/licensing-smoke-output.txt',
  'tests/latest-usb-log-lines.txt'
) -join "`n"
$audit = @()
$audit += "# AUDIT NOTE"
$audit += "UTC: $tsUtc"
$audit += "Commit: $sha"
$audit += "Result: $result"
$audit += ""
$audit += "## Changed files"
$audit += $changed
$audit += ""
$audit += "## Log summary (last 50)"
$audit += $tail
$auditText = ($audit -join "`n") + "`n"
$auditPath = Join-Path $root 'AUDIT_NOTE.md'
$auditText | Out-File -FilePath $auditPath -Encoding UTF8 -Force

exit 0

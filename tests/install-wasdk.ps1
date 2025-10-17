param(
  [switch]$AllUsers,
  [switch]$Quiet
)
$ErrorActionPreference = 'SilentlyContinue'
$artifactDir = Join-Path $PSScriptRoot '..' | Join-Path -ChildPath 'artifacts'
New-Item -Path $artifactDir -ItemType Directory -Force | Out-Null
$out = Join-Path $artifactDir 'wasdk-install.log'
function W($m){ $m | Out-File $out -Append -Encoding utf8; if(-not $Quiet){ Write-Host $m } }

W "=== Windows App Runtime install helper ==="
W "TS: $(Get-Date -Format o)"

# Detect missing runtime
$rKeys = @(
  'HKLM:\SOFTWARE\Microsoft\WindowsAppRuntime\Runtime',
  'HKLM:\SOFTWARE\WOW6432Node\Microsoft\WindowsAppRuntime\Runtime'
)
$missing = $true
foreach($k in $rKeys){ if (Test-Path $k){ $missing = $false } }

# Try Appx presence
try {
  $scope = @{}
  if($AllUsers){ $scope = @{AllUsers=$true} }
  $pkg = Get-AppxPackage @scope Microsoft.WindowsAppRuntime* | Select-Object -First 1
  if($pkg){ $missing = $false; W ("Found Appx: " + $pkg.Name + " " + $pkg.Version) }
} catch {}

if(-not $missing){ W "Windows App Runtime already present."; return }

# Try winget install (common versions)
$ids = @(
  'Microsoft.WindowsAppRuntime.1.6',
  'Microsoft.WindowsAppRuntime.1.5',
  'Microsoft.WindowsAppRuntime.1.4'
)
$ok = $false
foreach($id in $ids){
  try {
    W "winget installing $id ..."
    winget install --id $id --exact --silent --accept-package-agreements --accept-source-agreements
    if($LASTEXITCODE -eq 0){ $ok = $true; break }
  } catch { W "winget error: $($_.Exception.Message)" }
}

if(-not $ok){
  W "winget path failed or IDs not found. Please install manually: https://aka.ms/windowsappsdk/Stable (WindowsAppRuntimeInstall-x64.exe)"
  return
}

Start-Sleep -Seconds 3
# Re-validate
try {
  $pkg2 = Get-AppxPackage Microsoft.WindowsAppRuntime* | Select-Object -First 1
  if($pkg2){ W ("Installed Appx: " + $pkg2.Name + " " + $pkg2.Version) }
} catch {}

W "Done. See $out"

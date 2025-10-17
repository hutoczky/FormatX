param(
  [switch]$AllUsers
)
$ErrorActionPreference = 'SilentlyContinue'
$artifactDir = Join-Path $PSScriptRoot '..' | Join-Path -ChildPath 'artifacts'
New-Item -Path $artifactDir -ItemType Directory -Force | Out-Null
$out = Join-Path $artifactDir 'wasdk-inspect.txt'

function W($s){ $s | Out-File $out -Append -Encoding utf8 }
"=== Windows App Runtime / Windows App SDK Inspection ===" | Out-File $out -Encoding utf8
W "Timestamp: $(Get-Date -Format o)"
W "Machine: $env:COMPUTERNAME User: $env:USERNAME"
W "OS: $([System.Environment]::OSVersion.VersionString)"
W "Arch: OS64=$([Environment]::Is64BitOperatingSystem) ProcArch=$env:PROCESSOR_ARCHITECTURE ProcArchWow=$env:PROCESSOR_ARCHITEW6432"

W "\n-- Registry: HKLM:SOFTWARE\Microsoft\WindowsAppRuntime --"
Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\WindowsAppRuntime' | ForEach-Object { W $_.Name; $_.Property | ForEach-Object { W ("  $_ = " + ($_.GetValue($null))) } }

W "\n-- Registry: HKLM:SOFTWARE\Microsoft\WindowsAppRuntime\Runtime --"
Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\WindowsAppRuntime\Runtime' | ForEach-Object {
  W ("Key: " + $_.Name)
  $_.GetValueNames() | ForEach-Object { W ("  $_ = " + ($_.Replace($_, (Get-Item $_).GetValue($_))) ) } 2>$null
  $_.Property | ForEach-Object { W ("  $_ = " + ($_.GetValue($null))) } 2>$null
}

W "\n-- Registry: WOW6432Node (if present) --"
Get-ChildItem 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\WindowsAppRuntime\Runtime' | ForEach-Object {
  W ("Key: " + $_.Name)
  $_.Property | ForEach-Object { W ("  $_ = " + ($_.GetValue($null))) }
}

W "\n-- Appx Packages (WindowsAppRuntime) --"
try {
  if ($AllUsers.IsPresent) {
    Get-AppxPackage -AllUsers Microsoft.WindowsAppRuntime* | Select-Object Name, PackageFamilyName, Version, Architecture | Format-Table | Out-String | W
  } else {
    Get-AppxPackage Microsoft.WindowsAppRuntime* | Select-Object Name, PackageFamilyName, Version, Architecture | Format-Table | Out-String | W
  }
} catch { W "Get-AppxPackage failed: $($_.Exception.Message)" }

W "\n-- Appx Packages (WindowsAppSDK) --"
try {
  if ($AllUsers.IsPresent) {
    Get-AppxPackage -AllUsers Microsoft.WindowsAppSDK* | Select-Object Name, PackageFamilyName, Version, Architecture | Format-Table | Out-String | W
  } else {
    Get-AppxPackage Microsoft.WindowsAppSDK* | Select-Object Name, PackageFamilyName, Version, Architecture | Format-Table | Out-String | W
  }
} catch { W "Get-AppxPackage failed: $($_.Exception.Message)" }

W "\n-- Winget (if available) --"
try { winget --version | Out-String | W } catch { W "winget not found" }
try { winget list Microsoft.WindowsAppRuntime | Out-String | W } catch { }
try { winget list Microsoft.WindowsAppSDK | Out-String | W } catch { }

W "\nDone. Output saved to $out"
Write-Host "Inspection complete. See $out"

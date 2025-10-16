$ErrorActionPreference = 'Stop'
param(
  [string]$RID = 'win-x64',
  [string]$OutDir = './artifacts',
  [switch]$Sign,
  [string]$CertThumbprint,
  [string]$Configuration = 'Release',
  [string]$WixBin # e.g. 'C:\Program Files (x86)\WiX Toolset v3.11\bin'
)

function Write-UsbLog([string]$line){
  try{
    $logDir = Join-Path $env:LOCALAPPDATA 'FormatX\logs'
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    Add-Content -Path (Join-Path $logDir 'usb.log') -Value $line
  }catch{}
}

function Find-WixBin{
  param([string]$Hint)
  if ($Hint -and (Test-Path $Hint)) { return $Hint }
  $candidates = @(
    'C:\Program Files (x86)\WiX Toolset v3.11\bin',
    'C:\Program Files (x86)\WiX Toolset v3.14\bin',
    'C:\Program Files\WiX Toolset v3.14\bin'
  )
  foreach($p in $candidates){ if (Test-Path $p){ return $p } }
  throw 'WiX Toolset bin folder not found. Install WiX v3.x and pass -WixBin.'
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

$pubDir = Join-Path $OutDir "publish/$RID"
$msiDir = Join-Path $OutDir 'msi'
$bundleDir = Join-Path $OutDir 'bundle'
New-Item -ItemType Directory -Force -Path $pubDir,$msiDir,$bundleDir | Out-Null

Write-UsbLog 'usb.installer.build.begin'
Write-Host "==> dotnet publish ($Configuration, $RID, self-contained)" -ForegroundColor Cyan
 dotnet publish -c $Configuration -r $RID --self-contained true /p:PublishSingleFile=true /p:PublishTrimmed=false -o $pubDir
if (!(Test-Path (Join-Path $pubDir 'FormatX.exe'))) { throw "Publish failed: FormatX.exe not found in $pubDir" }

$wix = Find-WixBin -Hint $WixBin
$candle = Join-Path $wix 'candle.exe'
$light  = Join-Path $wix 'light.exe'
$heat   = Join-Path $wix 'heat.exe'
if (!(Test-Path $candle) -or !(Test-Path $light) -or !(Test-Path $heat)) { throw "WiX tools not found in $wix" }

Write-Host "==> WiX harvest" -ForegroundColor Cyan
$harvestWxs = Join-Path $OutDir 'wix/HarvestedFiles.wxs'
New-Item -ItemType Directory -Force -Path (Split-Path $harvestWxs -Parent) | Out-Null
& $heat dir $pubDir -nologo -gg -sfrag -srd -sreg -dr INSTALLFOLDER -cg AppFiles -var var.PublishDir -out $harvestWxs

Write-Host "==> WiX MSI compile" -ForegroundColor Cyan
$prodWxs = Join-Path $PSScriptRoot 'wix/FormatX.Product.wxs'
$wixObj1 = Join-Path $OutDir 'wix/Product.wixobj'
$wixObj2 = Join-Path $OutDir 'wix/Harvest.wixobj'
& $candle -nologo -dPublishDir=$pubDir -out $wixObj1 $prodWxs
& $candle -nologo -dPublishDir=$pubDir -out $wixObj2 $harvestWxs
$msiPath = Join-Path $msiDir 'FormatX.msi'
& $light -nologo -ext WixUIExtension -out $msiPath $wixObj1 $wixObj2
if (!(Test-Path $msiPath)) { throw 'MSI link failed' }

Write-Host "==> WiX Bundle compile" -ForegroundColor Cyan
$bundleWxs = Join-Path $PSScriptRoot 'wix/FormatX.Bundle.wxs'
$bundleObj = Join-Path $OutDir 'wix/Bundle.wixobj'
& $candle -nologo -dMsiPath=$msiPath -out $bundleObj $bundleWxs
$setupPath = Join-Path $bundleDir 'FormatX-Setup.exe'
& $light -nologo -ext WixBalExtension -ext WixUtilExtension -out $setupPath $bundleObj
if (!(Test-Path $setupPath)) { throw 'Bundle link failed' }

if ($Sign.IsPresent){
  Write-Host "==> Signing Setup.exe (thumbprint: $CertThumbprint)" -ForegroundColor Cyan
  & (Join-Path $PSScriptRoot 'sign/sign-and-timestamp.ps1') -Thumbprint $CertThumbprint -File $setupPath
}

Write-UsbLog "usb.installer.build.ok:$setupPath"
Write-Host "Output: $setupPath" -ForegroundColor Green

# Verify (basic)
Write-UsbLog "usb.installer.verify.begin"
if (Test-Path $setupPath) { Write-UsbLog "usb.installer.verify.ok:$setupPath" } else { Write-UsbLog 'usb.installer.verify.fail' }

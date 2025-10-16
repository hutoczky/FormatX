param([string]$Manifest = (Resolve-Path (Join-Path $PSScriptRoot '..\..\Package.appxmanifest')),
      [string]$Out = (Resolve-Path (Join-Path $PSScriptRoot '..\..\artifacts\manifest-validation.txt')))

$ErrorActionPreference = 'SilentlyContinue'

[xml]$xml = Get-Content $Manifest -Raw
$ns = @{ uap = 'http://schemas.microsoft.com/appx/manifest/uap/windows10'; rescap = 'http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities' }

$cap = $xml.Package.Capabilities
$hasRunFullTrust = $cap.SelectSingleNode('rescap:Capability[@Name="runFullTrust"]', $ns) -ne $null
$hasRemovable = $cap.SelectSingleNode('uap:Capability[@Name="removableStorage"]', $ns) -ne $null
$hasBroadFS = $cap.SelectSingleNode('rescap:Capability[@Name="broadFileSystemAccess"]', $ns) -ne $null

New-Item -ItemType Directory -Force -Path (Split-Path $Out -Parent) | Out-Null
if($hasRunFullTrust -and -not $hasBroadFS){
  "PASS: runFullTrust present; broadFileSystemAccess absent; removableStorage=$hasRemovable" | Out-File -FilePath $Out -Force -Encoding UTF8
  exit 0
}else{
  "FAIL: runFullTrust=$hasRunFullTrust broadFileSystemAccess=$hasBroadFS removableStorage=$hasRemovable" | Out-File -FilePath $Out -Force -Encoding UTF8
  exit 1
}

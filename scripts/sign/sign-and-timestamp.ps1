param(
  [Parameter(Mandatory=$true)][string]$Thumbprint,
  [Parameter(Mandatory=$true)][string]$File
)
$ErrorActionPreference = 'Stop'

Write-Host "Signing $File with cert $Thumbprint" -ForegroundColor Cyan
$signTool = 'signtool.exe'
& $signTool sign /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /a /sm /sha1 $Thumbprint $File

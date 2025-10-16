param([string]$Project = (Resolve-Path (Join-Path $PSScriptRoot '..\..\FormatX.csproj')),
      [string]$Out = (Resolve-Path (Join-Path $PSScriptRoot '..\..\artifacts\release-flags.txt')))

$xml = [xml](Get-Content $Project -Raw)
$groups = $xml.Project.PropertyGroup | Where-Object { $_.Condition -like "*'$(Configuration)'=='Release'*" }
$ok = $false
foreach($g in $groups){
  $opt = $g.Optimize
  $dbg = $g.DebugSymbols
  $det = $g.Deterministic
  if(($opt -eq 'true') -and ($dbg -eq 'false') -and ($det -eq 'true')){ $ok = $true }
}

New-Item -ItemType Directory -Force -Path (Split-Path $Out -Parent) | Out-Null
if($ok){ "PASS: Optimize=true DebugSymbols=false Deterministic=true" | Out-File -FilePath $Out -Force -Encoding UTF8; exit 0 }
else{ "FAIL: Release flags mismatch" | Out-File -FilePath $Out -Force -Encoding UTF8; exit 1 }

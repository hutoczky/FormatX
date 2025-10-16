param([string]$InputPath, [string]$OutPath = (Resolve-Path (Join-Path $PSScriptRoot '..\..\artifacts\wack-summary.txt')))

if(-not (Test-Path $InputPath)){
  "WACK summary: input not found ($InputPath)" | Out-File -FilePath $OutPath -Encoding UTF8 -Force
  exit 2
}

[xml]$doc = Get-Content $InputPath -Raw -ErrorAction SilentlyContinue
$failNodes = @()
try{ $failNodes = $doc.SelectNodes('//TestResult[Result="FAIL"]') }catch{}
$warnNodes = @()
try{ $warnNodes = $doc.SelectNodes('//TestResult[Result="WARN"]') }catch{}

$summary = @()
$summary += "WACK Summary:"
$summary += ("FAIL count: " + ($failNodes.Count))
$summary += ("WARN count: " + ($warnNodes.Count))

New-Item -ItemType Directory -Force -Path (Split-Path $OutPath -Parent) | Out-Null
$summary | Out-File -FilePath $OutPath -Encoding UTF8 -Force

if($failNodes.Count -gt 0){ exit 1 } else { exit 0 }

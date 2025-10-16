param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\..\.."),
  [string]$Out = (Join-Path (Resolve-Path "$PSScriptRoot\..\..") 'reports\string-literals.txt')
)

Write-Host "[extract] Scanning $Root"
$files = Get-ChildItem -Path $Root -Include *.xaml,*.cs -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\obj\\|\\bin\\|\.g\.cs$|\\packages\\|\\.nuget\\" }

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Out) | Out-Null
"Remaining string literals (heuristic)" | Out-File -FilePath $Out -Encoding UTF8 -Force
foreach($f in $files){
  $content = Get-Content -Path $f.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }
  $lines = $content -split "`n"
  for($i=0;$i -lt $lines.Count;$i++){
    $ln = $lines[$i]
    if ($f.Name -like '*.xaml') {
      if ($ln -match '="[A-Za-z¡…Õ”÷’⁄‹€a-z0-9].+"' -and $ln -notmatch '{x:Static|{Binding|{ThemeResource|{StaticResource|x:Name=|x:Class='){
        "${($f.FullName)}:${i+1}: $ln" | Out-File -FilePath $Out -Append -Encoding UTF8
      }
    } else {
      if ($ln -match '"[^\"]{3,}"' -and $ln -notmatch 'LogService|usb\.|LocalizationService|ResourceManager|nameof\('){
        "${($f.FullName)}:${i+1}: $ln" | Out-File -FilePath $Out -Append -Encoding UTF8
      }
    }
  }
}
Write-Host "[extract] Report: $Out"

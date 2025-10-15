param(
    [string]$Configuration = "Debug"
)

Write-Host "[SMOKE] dotnet build -c $Configuration" -ForegroundColor Cyan
dotnet build -c $Configuration
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

Write-Host "[SMOKE] Validator checks" -ForegroundColor Cyan
$root = [System.IO.Path]::Combine($PSScriptRoot, "..")
Push-Location $root

try {
  Add-Type -Path (Join-Path $root "bin\x64\$Configuration\net10.0-windows10.0.22621.0\FormatX.dll")
  $bgType = [FormatX.Services.BackgroundValidator]
  $isoType = [FormatX.Services.IsoValidator]
  # Background invalid ext
  $res1 = $bgType::ValidateAsync("C:\\Windows\\not-image.txt")
  $res1.Wait()
  if ($res1.Result -ne $false) { Write-Warning "Expected invalid background path" }
  # ISO ext helper
  if ($isoType::IsIso("C:\\tmp\\a.txt")) { Write-Warning "Expected .txt not iso" }
  if (-not $isoType::IsIso("C:\\tmp\\a.iso")) { Write-Warning "Expected .iso true" }
}
catch { Write-Warning $_ }
finally { Pop-Location }

Write-Host "[SMOKE] Manual checklist:" -ForegroundColor Yellow
@'
1) Run app and test:
   - Background Browse: rapid double-click should not open two dialogs; status updates localized.
   - Pick unsupported file (e.g., .txt) -> validation error, no crash.
   - Large image (>100MB) loads without UI freeze; token stored.
   - Restart app -> background restored; if file missing then token cleared + error logged.
2) ISO picker:
   - Browse .iso works; .txt rejected; no repeated COM exceptions.
3) Title bar customization should not throw on unsupported environments.
'@

Write-Host "[SMOKE] Done" -ForegroundColor Green

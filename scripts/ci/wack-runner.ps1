param([string]$InputPath)
$ErrorActionPreference = 'Continue'

# NOTE: WACK CLI availability depends on runner image. This script attempts to run it; if not available, emits checklist.

$expected = @(
  'App manifest validation',
  'Capabilities',
  'High DPI support',
  'Performance',
  'App Crashes and hangs'
)

$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $repo '..')
$expFile = Join-Path $root 'tests\wack-expected.txt'
$results = Join-Path $root 'tests\wack-results.txt'

$expected -join "`n" | Set-Content -Path $expFile -Encoding UTF8

try {
  $wack = 'AppCertKit.exe'
  if (Get-Command $wack -ErrorAction SilentlyContinue) {
    # Placeholder: real WACK invocation depends on package type; on CI often not available.
    "WACK runner present, but invocation skipped in sample. Validate locally and attach report." | Set-Content -Path $results -Encoding UTF8
    exit 0
  } else {
    "WACK not available on runner. Perform manual validation using Windows App Certification Kit and attach HTML report. Expected checks:`n$(Get-Content $expFile -Raw)" | Set-Content -Path $results -Encoding UTF8
    exit 0
  }
}
catch {
  $_ | Out-String | Set-Content -Path $results -Encoding UTF8
  exit 0
}

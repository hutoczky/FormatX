from pathlib import Path
import re

root = Path(__file__).resolve().parents[2]
path = root / '.github/workflows/verify-apex-shell-live.yml'
text = path.read_text(encoding='utf-8')
pattern = re.compile(
    r"      - name: Wait for and verify current apex shell contract\n.*?"
    r"(?=      - name: Publish live shell status\n)",
    re.S,
)
replacement = '''      - name: Wait for exact production marker propagation
        shell: bash
        run: |
          set -euo pipefail
          APEX='https://formatxsuite.com'
          for attempt in $(seq 1 36); do
            echo "FormatX marker probe $attempt/36"
            if curl -fsS --max-time 25 -H 'Cache-Control: no-cache' \\
              "$APEX/p0-validation-version.txt?marker=${GITHUB_RUN_ID}-${attempt}" \\
              -o "$RUNNER_TEMP/live-p0.txt" \\
              && cmp -s docs/p0-validation-version.txt "$RUNNER_TEMP/live-p0.txt"; then
              echo 'Exact production marker is live.'
              exit 0
            fi
            sleep 10
          done
          echo 'Production marker did not converge.' >&2
          exit 1

      - name: Verify current apex shell contract once
        shell: bash
        run: node .github/scripts/verify-apex-shell-r500.cjs

'''
text, count = pattern.subn(replacement, text, count=1)
if count != 1:
    raise SystemExit('apex verification step not found exactly once')
if "assert '<base href=\"/\">' in home" in text:
    raise SystemExit('stale root base assertion remains')
path.write_text(text, encoding='utf-8')

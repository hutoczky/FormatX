#!/usr/bin/env python3
from pathlib import Path

path = Path('docs/scifi-ui/scripts/i18n.js')
text = path.read_text(encoding='utf-8')
marker = "    // SOURCE_AND_DYNAMIC_COVERAGE_PATCH\n"
pair = "    ['FormatX letöltése', 'Download FormatX'],\n"
if pair not in text:
    if marker not in text:
        raise SystemExit('translation marker not found')
    text = text.replace(marker, marker + pair, 1)
    path.write_text(text, encoding='utf-8')

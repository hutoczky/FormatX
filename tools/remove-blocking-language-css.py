#!/usr/bin/env python3
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
for path in [
    root / 'docs/scifi-ui/index.html',
    root / 'docs/scifi-ui/checkout.html',
    root / 'docs/scifi-ui/support.html',
    root / 'docs/scifi-ui/terms.html',
    root / 'docs/scifi-ui/privacy.html',
]:
    text = path.read_text(encoding='utf-8')
    text = re.sub(
        r'^\s*<link[^>]+styles/language\.css[^>]*>\s*\n?',
        '',
        text,
        flags=re.MULTILINE,
    )
    path.write_text(text, encoding='utf-8')

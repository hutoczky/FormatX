#!/usr/bin/env python3
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
pages = [
    root / 'docs/scifi-ui/index.html',
    root / 'docs/scifi-ui/checkout.html',
    root / 'docs/scifi-ui/support.html',
    root / 'docs/scifi-ui/terms.html',
    root / 'docs/scifi-ui/privacy.html',
]

for path in pages:
    text = path.read_text(encoding='utf-8')
    text = re.sub(
        r'^\s*<script[^>]+data-formatx-i18n[^>]+scripts/i18n\.js[^>]*></script>\s*\n?',
        '',
        text,
        flags=re.MULTILINE,
    )
    path.write_text(text, encoding='utf-8')

site = root / 'docs/scifi-ui/scripts/site.js'
text = site.read_text(encoding='utf-8')
text = text.replace(
    "./scripts/i18n.js?v=20260718-bilingual-1",
    "./scripts/i18n.js?v=20260718-bilingual-3",
)
site.write_text(text, encoding='utf-8')

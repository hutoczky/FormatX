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
    root / 'docs/scifi-ui/success.html',
    root / 'docs/scifi-ui/cancel.html',
]

LANG_CSS = '  <link rel="stylesheet" href="./styles/language.css?v=20260718-bilingual-3">\n'
LANG_JS = '  <script defer data-formatx-i18n src="./scripts/i18n.js?v=20260718-bilingual-3"></script>\n'

for path in pages:
    if not path.exists():
        continue
    text = path.read_text(encoding='utf-8')

    # Remove older direct language includes before inserting the current version.
    text = re.sub(r'^\s*<link[^>]+styles/language\.css[^>]*>\s*\n?', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*<script[^>]+scripts/i18n\.js[^>]*></script>\s*\n?', '', text, flags=re.MULTILINE)

    # Force a fresh site.js request so browsers cannot reuse the pre-i18n cached script.
    text = re.sub(
        r'(src="\./scripts/site\.js\?v=)[^"]+("[^>]*></script>)',
        r'\g<1>20260718-bilingual-3\2',
        text,
        count=1,
    )

    first_stylesheet = re.search(r'^\s*<link rel="stylesheet"', text, flags=re.MULTILINE)
    if first_stylesheet:
        text = text[:first_stylesheet.start()] + LANG_CSS + text[first_stylesheet.start():]
    else:
        text = text.replace('</head>', LANG_CSS + '</head>', 1)

    site_script = re.search(r'^\s*<script[^>]+scripts/site\.js[^>]*></script>\s*$', text, flags=re.MULTILINE)
    if site_script:
        insertion = site_script.end()
        text = text[:insertion] + '\n' + LANG_JS.rstrip('\n') + text[insertion:]
    else:
        text = text.replace('</head>', LANG_JS + '</head>', 1)

    path.write_text(text, encoding='utf-8')

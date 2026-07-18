#!/usr/bin/env python3
from __future__ import annotations

import ast
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "docs" / "scifi-ui"
I18N = SITE / "scripts" / "i18n.js"

ACTIVE_PAGES = [
    SITE / "index.html",
    SITE / "checkout.html",
    SITE / "support.html",
    SITE / "terms.html",
    SITE / "privacy.html",
]
PAYMENT_PAGES = [
    SITE / "payment" / "success.html",
    SITE / "payment" / "cancel.html",
]

PAIR_RE = re.compile(r"^\s*\[('(?:\\.|[^'\\])*'),\s*('(?:\\.|[^'\\])*')\],?\s*$")
LETTERS_RE = re.compile(r"[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]")
COLLAPSE_RE = re.compile(r"\s+")

ALLOW_EXACT = {
    "FormatX", "FormatX Suite Pro", "FormatX Suite", "Pro", "SUITE PRO",
    "Business Lite", "Business Pro", "Technician Team", "BUSINESS LITE",
    "BUSINESS PRO", "TECHNICIAN TEAM", "BUSINESS / OWNER",
    "Windows", "Linux / Bazzite", "macOS", "Windows · Linux / Bazzite · macOS",
    "WIN // 2041", "LNX // 2041", "MAC // 2041", "V92", "SHA256", "Ed25519",
    "HUF", "EUR", "IBAN", "BIC / SWIFT", "N/A", "N/A-safe", "CPU", "RAM",
    "GPU", "NET", "FX", "LIVE", "ONLINE", "GitHub", "GitHub Releases",
    "Start-FormatX-Windows.exe", "Start-FormatX-Linux.sh", "Start-FormatX-macOS.command",
    "FormatX-Suite-Pro-V92.zip", "Cross-platform", "M01", "M02", "M03", "M04", "M05", "M06",
    "© 2026 Hutóczky József", "© 2026 Hutóczky József · FormatX Suite Pro",
    "Hutóczky József", "REVOHUHB", "CHASDEFX", "X",
}

ALLOW_PATTERNS = [
    re.compile(r"^[\d\s.,:/+%€Ft—-]+$"),
    re.compile(r"^V\d+$"),
    re.compile(r"^\d+(?:[.,]\d+)?\s*(MiB|GiB|Ft|€)?$"),
    re.compile(r"^[A-Fa-f0-9]{32,}$"),
    re.compile(r"^FX-"),
    re.compile(r"^FormatX Suite Pro V\d+$"),
    re.compile(r"^FormatX-Suite-Pro-V\d+\.zip$"),
]

SKIP_TAGS = {"script", "style", "noscript", "code", "pre", "svg"}
CHECK_ATTRIBUTES = {"aria-label", "title", "alt", "placeholder"}


def normalize(value: str) -> str:
    return COLLAPSE_RE.sub(" ", value).strip()


def load_pairs() -> tuple[set[str], list[tuple[str, str]]]:
    texts: set[str] = set()
    pairs: list[tuple[str, str]] = []
    for line_number, line in enumerate(I18N.read_text(encoding="utf-8").splitlines(), start=1):
        match = PAIR_RE.match(line)
        if not match:
            continue
        try:
            hu = ast.literal_eval(match.group(1))
            en = ast.literal_eval(match.group(2))
        except Exception as exc:  # pragma: no cover - CI diagnostic
            raise RuntimeError(f"Invalid translation pair at {I18N}:{line_number}: {exc}") from exc
        hu = normalize(hu)
        en = normalize(en)
        if not hu or not en:
            raise RuntimeError(f"Empty translation at {I18N}:{line_number}")
        pairs.append((hu, en))
        texts.add(hu)
        texts.add(en)
    if len(pairs) < 180:
        raise RuntimeError(f"Translation catalog unexpectedly small: {len(pairs)} pairs")
    return texts, pairs


def allowed(value: str, translated: set[str]) -> bool:
    value = normalize(value)
    if not value or not LETTERS_RE.search(value):
        return True
    if value in translated or value in ALLOW_EXACT:
        return True
    return any(pattern.search(value) for pattern in ALLOW_PATTERNS)


class VisibleTextParser(HTMLParser):
    def __init__(self, path: Path, translated: set[str]) -> None:
        super().__init__(convert_charrefs=True)
        self.path = path
        self.translated = translated
        self.stack: list[tuple[str, bool]] = []
        self.missing: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {name: value or "" for name, value in attrs}
        parent_skip = self.stack[-1][1] if self.stack else False
        skip = parent_skip or tag in SKIP_TAGS or "data-i18n-skip" in attr_map
        self.stack.append((tag, skip))
        if skip:
            return
        for name in CHECK_ATTRIBUTES:
            value = normalize(attr_map.get(name, ""))
            if value and not allowed(value, self.translated):
                self.missing.append(f"attribute {name}={value!r}")

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        if self.stack:
            self.stack.pop()

    def handle_data(self, data: str) -> None:
        if self.stack and self.stack[-1][1]:
            return
        value = normalize(data)
        if value and not allowed(value, self.translated):
            self.missing.append(f"text {value!r}")


def validate_active_pages(translated: set[str]) -> list[str]:
    failures: list[str] = []
    for path in ACTIVE_PAGES:
        parser = VisibleTextParser(path, translated)
        parser.feed(path.read_text(encoding="utf-8"))
        for missing in sorted(set(parser.missing)):
            failures.append(f"{path.relative_to(ROOT)}: {missing}")
    return failures


class PaymentDataParser(HTMLParser):
    def __init__(self, path: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.path = path
        self.failures: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {name: value or "" for name, value in attrs}
        has_hu = "data-hu" in attr_map
        has_en = "data-en" in attr_map
        if has_hu != has_en:
            self.failures.append(f"<{tag}> must contain both data-hu and data-en")
        if has_hu and normalize(attr_map["data-hu"]) == normalize(attr_map["data-en"]):
            self.failures.append(f"<{tag}> HU and EN values must differ: {attr_map['data-hu']!r}")


def validate_payment_pages() -> list[str]:
    failures: list[str] = []
    for path in PAYMENT_PAGES:
        text = path.read_text(encoding="utf-8")
        parser = PaymentDataParser(path)
        parser.feed(text)
        if "data-language-choice=\"hu\"" not in text or "data-language-choice=\"en\"" not in text:
            parser.failures.append("missing HU/EN language controls")
        if "payment-status.js" not in text:
            parser.failures.append("missing payment-status.js")
        if "language.css" not in text:
            parser.failures.append("missing language.css")
        for failure in parser.failures:
            failures.append(f"{path.relative_to(ROOT)}: {failure}")
    return failures


def validate_runtime() -> list[str]:
    failures: list[str] = []
    i18n = I18N.read_text(encoding="utf-8")
    site = (SITE / "scripts" / "site.js").read_text(encoding="utf-8")
    checkout_bridge = (SITE / "scripts" / "checkout-language.js").read_text(encoding="utf-8")
    status = (SITE / "scripts" / "payment-status.js").read_text(encoding="utf-8")
    language_css = (SITE / "styles" / "language.css").read_text(encoding="utf-8")

    requirements = {
        "i18n MutationObserver": "MutationObserver" in i18n,
        "safe conditional text assignment": "if (after !== before)" in i18n,
        "persistent language": STORAGE_TOKEN in i18n,
        "HU/EN URL parameter": "searchParams.set('lang'" in i18n,
        "document language": "document.documentElement.lang" in i18n,
        "hreflang HU": "upsertAlternate('hu'" in i18n,
        "hreflang EN": "upsertAlternate('en'" in i18n,
        "Open Graph locale": "og:locale" in i18n,
        "external language CSS": "language.css" in i18n,
        "no inline style injection": "style.textContent" not in i18n,
        "site language event": "formatx:languagechange" in site,
        "English static mail": "FormatX payment report" in checkout_bridge,
        "English clipboard labels": "Beneficiary:" in checkout_bridge,
        "locale-aware amount": "Intl.NumberFormat" in checkout_bridge,
        "payment status HU/EN": "data-language-choice" in status,
        "accessible focus style": ":focus-visible" in language_css,
        "reduced motion support": "prefers-reduced-motion" in language_css,
        "high contrast support": "prefers-contrast: more" in language_css,
    }
    for label, ok in requirements.items():
        if not ok:
            failures.append(f"runtime: missing {label}")
    return failures


STORAGE_TOKEN = "formatx-language"


def main() -> int:
    translated, pairs = load_pairs()
    failures = []
    failures.extend(validate_active_pages(translated))
    failures.extend(validate_payment_pages())
    failures.extend(validate_runtime())

    if failures:
        print("FormatX bilingual audit failed:\n")
        for failure in failures:
            print("-", failure)
        print(f"\nCatalog size: {len(pairs)} pairs")
        return 1

    print(f"FormatX bilingual audit passed: {len(pairs)} translation pairs, {len(ACTIVE_PAGES)} active pages, {len(PAYMENT_PAGES)} payment pages.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "docs" / "scifi-ui"

ACTIVE_PAGES = [
    SITE / "index.html",
    SITE / "downloads" / "index.html",
    SITE / "method.html",
    SITE / "verification.html",
    SITE / "test-matrix.html",
    SITE / "known-issues.html",
    SITE / "security.html",
    SITE / "decision-log.html",
    SITE / "license.html",
    SITE / "terms.html",
    SITE / "privacy.html",
    SITE / "support.html",
    SITE / "checkout.html",
]
PAYMENT_PAGES = [
    SITE / "payment" / "success.html",
    SITE / "payment" / "cancel.html",
]

COLLAPSE_RE = re.compile(r"\s+")
ALLOW_EXACT = {
    "FormatX",
    "FormatX Suite Pro",
    "Business Lite",
    "Business Pro",
    "Technician Team",
    "HU",
    "EN",
    "HUF",
    "EUR",
    "Windows",
    "Linux / Bazzite",
    "macOS",
    "Android",
    "iOS / iPadOS",
    "GitHub",
    "SHA-256",
    "QR ↗",
}
ALLOW_PATTERNS = [
    re.compile(r"^\d+(?:[.,]\d+)?(?:\s*(?:Ft|€|MiB|GiB|%))?$"),
    re.compile(r"^[A-Fa-f0-9]{32,}$"),
    re.compile(r"^V\d+$"),
    re.compile(r"^FX-"),
]


def normalize(value: str) -> str:
    return COLLAPSE_RE.sub(" ", value).strip()


def same_language_value_allowed(value: str) -> bool:
    value = normalize(value)
    return value in ALLOW_EXACT or any(pattern.search(value) for pattern in ALLOW_PATTERNS)


class InlineBilingualParser(HTMLParser):
    def __init__(self, path: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.path = path
        self.failures: list[str] = []
        self.text_pairs = 0
        self.label_pairs = 0
        self.language_choices: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._check(tag, attrs)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._check(tag, attrs)

    def _pair(
        self,
        tag: str,
        attrs: dict[str, str],
        hu_name: str,
        en_name: str,
        label: str,
    ) -> None:
        has_hu = hu_name in attrs
        has_en = en_name in attrs
        if has_hu != has_en:
            self.failures.append(
                f"<{tag}> must contain both {hu_name} and {en_name}"
            )
            return
        if not has_hu:
            return

        hu = normalize(attrs[hu_name])
        en = normalize(attrs[en_name])
        if not hu or not en:
            self.failures.append(f"<{tag}> contains an empty {label} translation")
            return
        if hu == en and not same_language_value_allowed(hu):
            self.failures.append(
                f"<{tag}> HU and EN {label} values must differ: {hu!r}"
            )
            return

        if label == "text":
            self.text_pairs += 1
        else:
            self.label_pairs += 1

    def _check(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = {name: value or "" for name, value in attrs_list}
        self._pair(tag, attrs, "data-hu", "data-en", "text")
        self._pair(tag, attrs, "data-hu-label", "data-en-label", "label")

        choice = attrs.get("data-language-choice") or attrs.get("data-language")
        if choice in {"hu", "en"}:
            self.language_choices.add(choice)


def validate_pages() -> tuple[list[str], int, int]:
    failures: list[str] = []
    text_pairs = 0
    label_pairs = 0

    for path in ACTIVE_PAGES + PAYMENT_PAGES:
        if not path.exists():
            failures.append(f"missing page: {path.relative_to(ROOT)}")
            continue
        parser = InlineBilingualParser(path)
        parser.feed(path.read_text(encoding="utf-8"))
        text_pairs += parser.text_pairs
        label_pairs += parser.label_pairs
        for failure in sorted(set(parser.failures)):
            failures.append(f"{path.relative_to(ROOT)}: {failure}")

    if text_pairs < 40:
        failures.append(
            f"inline bilingual coverage unexpectedly small: {text_pairs} text pairs"
        )

    return failures, text_pairs, label_pairs


def validate_runtime() -> list[str]:
    failures: list[str] = []

    paths = {
        "single language controller": SITE / "scripts" / "single-language-toggle.js",
        "public shell": SITE / "scripts" / "formatx-public-shell.js",
        "site controller": SITE / "scripts" / "site.js",
        "payment status controller": SITE / "scripts" / "payment-status.js",
        "language stylesheet": SITE / "styles" / "single-language-toggle.css",
    }
    sources: dict[str, str] = {}
    for label, path in paths.items():
        if not path.exists():
            failures.append(f"runtime: missing {label}: {path.relative_to(ROOT)}")
            sources[label] = ""
        else:
            sources[label] = path.read_text(encoding="utf-8")

    toggle = sources["single language controller"]
    requirements = {
        "supported HU and EN languages": "new Set(['hu', 'en'])" in toggle,
        "persistent language preference": "formatx-language" in toggle
        and "localStorage.setItem" in toggle,
        "URL language parameter": "searchParams.set('lang'" in toggle,
        "document language update": "ROOT.lang = language" in toggle,
        "inline text translation": "[data-hu][data-en]" in toggle,
        "inline accessible-label translation": "[data-hu-label][data-en-label]"
        in toggle,
        "language-change event": "formatx:languagechange" in toggle,
        "single visible language control": "hideLegacyControls" in toggle,
        "language focus style": ":focus-visible"
        in sources["language stylesheet"],
        "language reduced-motion support": "prefers-reduced-motion"
        in sources["language stylesheet"],
        "public shell language support": "data-hu"
        in sources["public shell"]
        and "data-en" in sources["public shell"],
        "site language event integration": "formatx:languagechange"
        in sources["site controller"],
        "payment language integration": "data-language-choice"
        in sources["payment status controller"],
    }
    for label, ok in requirements.items():
        if not ok:
            failures.append(f"runtime: missing {label}")

    obsolete_references: list[str] = []
    for path in ACTIVE_PAGES + PAYMENT_PAGES:
        if path.exists() and "scripts/i18n.js" in path.read_text(encoding="utf-8"):
            obsolete_references.append(str(path.relative_to(ROOT)))
    if obsolete_references:
        failures.append(
            "obsolete scripts/i18n.js references: " + ", ".join(obsolete_references)
        )

    return failures


def validate_language_entry_points() -> list[str]:
    failures: list[str] = []
    for path in [
        SITE / "support.html",
        SITE / "terms.html",
        SITE / "privacy.html",
        SITE / "known-issues.html",
        SITE / "security.html",
    ]:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        if 'hreflang="hu"' not in text or 'hreflang="en"' not in text:
            failures.append(
                f"{path.relative_to(ROOT)}: missing HU/EN hreflang declarations"
            )
    return failures


def main() -> int:
    failures, text_pairs, label_pairs = validate_pages()
    failures.extend(validate_runtime())
    failures.extend(validate_language_entry_points())

    if failures:
        print("FormatX bilingual audit failed:\n")
        for failure in failures:
            print("-", failure)
        print(
            f"\nInline coverage: {text_pairs} text pairs, "
            f"{label_pairs} accessible-label pairs."
        )
        return 1

    print(
        "FormatX bilingual audit passed: "
        f"{text_pairs} inline HU/EN text pairs, "
        f"{label_pairs} accessible-label pairs, "
        f"{len(ACTIVE_PAGES)} public pages and "
        f"{len(PAYMENT_PAGES)} payment pages."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())

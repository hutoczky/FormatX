#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("formatx_content_validator", HERE / "validate-content-standard.py")
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


def validate_public_pages_v2() -> None:
    pages = [
        "downloads/index.html", "method.html", "verification.html",
        "test-matrix.html", "known-issues.html", "security.html",
        "decision-log.html", "license.html", "terms.html", "privacy.html", "support.html"
    ]
    for page in pages:
        path = module.SCIFI / page
        if not path.exists():
            module.fail(f"Missing public page: {page}")
            continue
        text = module.visible_text(path)
        if re.search(r"\bV92\b", text, re.I):
            module.fail(f"Visible hardcoded V92 remains in {page}")
        if re.search(r"\b(csapatunk|fejlesztőink|vállalatunk|our team|our developers|our company)\b", text, re.I):
            module.fail(f"False team/company voice remains in {page}")
        if re.search(r"\b(világelső|piacvezető|world[- ]leading|market leader)\b", text, re.I):
            module.fail(f"Unsupported leadership claim remains in {page}")

    production = module.read("billing-worker/src/production-content-entry.js")
    preview = module.read("content-preview-entry.js")
    legacy_contracts = [
        "FormatX-Updates/releases/download/v92/FormatX-Suite-Pro-V92.zip",
        "FormatX Suite Pro V92", "Windows V92", "92.00",
        "Teljes verzió letöltése", "Download full version"
    ]
    for contract in legacy_contracts:
        if contract not in production or contract not in preview:
            module.fail(f"Legacy main-page value is not sanitized in both Workers: {contract}")

    sitemap = module.read("docs/sitemap.xml")
    for url in [
        "/scifi-ui/", "/scifi-ui/downloads/", "/scifi-ui/method.html",
        "/scifi-ui/verification.html", "/scifi-ui/test-matrix.html",
        "/scifi-ui/known-issues.html", "/scifi-ui/security.html",
        "/scifi-ui/decision-log.html"
    ]:
        if url not in sitemap:
            module.fail(f"Sitemap missing {url}")
    if "Sitemap: https://www.formatxsuite.com/sitemap.xml" not in module.read("docs/robots.txt"):
        module.fail("robots.txt does not point to the canonical sitemap")


module.validate_public_pages = validate_public_pages_v2
raise SystemExit(module.main())

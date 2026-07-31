#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import re
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("formatx_content_validator", HERE / "validate-content-standard.py")
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


def validate_release_metadata_v2() -> None:
    data = module.load_json(module.SCIFI / "data/current-release.json")
    schema = data.get("schema_version")
    if schema not in {1, 2}:
        module.fail(f"Unsupported current-release schema: {schema}")

    if data.get("ok") is True:
        if not isinstance(data.get("version"), str) or not data["version"].strip():
            module.fail("Synchronized release must have a version tag")
        if data.get("source") != "github_published_release":
            module.fail("Synchronized release source is not canonical")
        if data.get("prerelease") is True:
            module.fail("Current official release must not be a prerelease")
        release_url = urlparse(str(data.get("release_url") or ""))
        if release_url.scheme != "https" or release_url.netloc != "github.com" or not release_url.path.startswith("/hutoczky/FormatX-Updates/releases/"):
            module.fail("Release URL is not an official FormatX-Updates release")
        win = data.get("channels", {}).get("windows", {})
        if win.get("available") is True:
            url = urlparse(str(win.get("download_url") or ""))
            if url.scheme != "https" or url.netloc != "github.com" or not url.path.startswith("/hutoczky/FormatX-Updates/releases/download/"):
                module.fail("Windows release URL is not an official FormatX-Updates asset")
        if schema == 2:
            if not isinstance(data.get("source_release_id"), int):
                module.fail("Schema 2 release lacks source_release_id")
            if data.get("integrity", {}).get("status") not in {
                "package_only", "digest_published", "digest_and_signature_published"
            }:
                module.fail("Schema 2 release has an invalid integrity status")
    else:
        if data.get("version") is not None:
            module.fail("Fallback release metadata must not invent a version")
        if data.get("channels", {}).get("windows", {}).get("available") is not False:
            module.fail("Fallback release metadata must not expose a Windows package")

    workflow = module.read(".github/workflows/sync-current-release.yml")
    for token in [
        "FormatX-Updates/releases?per_page=30",
        "prerelease == false",
        "docs/scifi-ui/data/current-release.json",
        "source_release_id",
        "integrity",
        "del(.synced_at)",
        "cmp -s",
        "git diff" if False else "git commit -m 'Sync official current release metadata'",
    ]:
        if token not in workflow:
            module.fail(f"Release sync workflow missing contract: {token}")


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

    for source, name in [(production, "production"), (preview, "preview")]:
        for token in ["formatx-public-shell.js", "formatx-content-standard.css?v=20260731-content-2"]:
            if token not in source:
                module.fail(f"{name} public-page wrapper missing {token}")

    sitemap = module.read("docs/sitemap.xml")
    for url in [
        "/scifi-ui/", "/scifi-ui/downloads/", "/scifi-ui/method.html",
        "/scifi-ui/verification.html", "/scifi-ui/test-matrix.html",
        "/scifi-ui/known-issues.html", "/scifi-ui/security.html",
        "/scifi-ui/decision-log.html", "/scifi-ui/support.html",
        "/scifi-ui/license.html", "/scifi-ui/terms.html", "/scifi-ui/privacy.html"
    ]:
        if url not in sitemap:
            module.fail(f"Sitemap missing {url}")
    if "Sitemap: https://www.formatxsuite.com/sitemap.xml" not in module.read("docs/robots.txt"):
        module.fail("robots.txt does not point to the canonical sitemap")


module.validate_release_metadata = validate_release_metadata_v2
module.validate_public_pages = validate_public_pages_v2
raise SystemExit(module.main())

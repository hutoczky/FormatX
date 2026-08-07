#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import re
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location(
    "formatx_content_validator", HERE / "validate-content-standard.py"
)
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


def canonical_package(data: dict) -> dict:
    channels = data.get("channels", {})
    return channels.get("multiplatform") or channels.get("windows") or {}


def validate_release_metadata_v2() -> None:
    data = module.load_json(module.SCIFI / "data/current-release.json")
    public_contract = module.load_json(module.SCIFI / "data/public-platform-contract.json")
    if data.get("schema_version") != 2:
        module.fail("Current release must use schema 2")
    if data.get("ok") is True:
        if data.get("source") != "github_published_release":
            module.fail("Synchronized release source is not canonical")
        if data.get("prerelease") is True:
            module.fail("Current official release must not be a prerelease")
        if not isinstance(data.get("source_release_id"), int):
            module.fail("Schema 2 release lacks source_release_id")
        release_url = urlparse(str(data.get("release_url") or ""))
        if (
            release_url.scheme != "https"
            or release_url.netloc != "github.com"
            or not release_url.path.startswith("/hutoczky/FormatX-Updates/releases/")
        ):
            module.fail("Release URL is not an official FormatX-Updates release")
        package = canonical_package(data)
        if package.get("available") is not True:
            module.fail("Schema 2 release lacks the official package")
        elif not module.official_download(str(package.get("download_url") or "")):
            module.fail("Official package URL is not valid")
        if not str(package.get("digest") or "").startswith("sha256:"):
            module.fail("Official package digest is missing")

        public_copy = public_contract.get("public_copy", {})
        if public_copy.get("primary_system") != "linux-bazzite":
            module.fail("Bazzite/Linux is not the public primary platform")
        if public_copy.get("download_channel") != "multiplatform":
            module.fail("Public download channel is not multiplatform")
        if public_copy.get("release_maturity") != "full_release":
            module.fail("Public release maturity is not full_release")
        if public_copy.get("trial_days") != 5:
            module.fail("Public release contract must declare a 5-day trial licence")
        supported = set(public_copy.get("supported_secondary_platforms") or [])
        if "windows" not in supported:
            module.fail("Windows is not listed as a supported secondary platform")
    else:
        package = canonical_package(data)
        if data.get("version") is not None:
            module.fail("Fallback release metadata must not invent a version")
        if package.get("available") is not False:
            module.fail("Fallback release metadata must not expose a package")

    workflow = module.read(".github/workflows/sync-current-release.yml")
    for token in [
        "FormatX-Updates/releases?per_page=30",
        "multiplatform_asset",
        "source_release_id",
        "integrity",
        "del(.synced_at)",
        "cmp -s",
        "git commit -m 'Sync official current release metadata'",
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
        if re.search(r"\bV(?:92|120|121)\b", text, re.I):
            module.fail(f"Visible release version remains in {page}")
        if re.search(
            r"\b(csapatunk|fejlesztőink|vállalatunk|our team|our developers|our company)\b",
            text,
            re.I,
        ):
            module.fail(f"False team/company voice remains in {page}")

    downloads = module.read("docs/scifi-ui/downloads/index.html")
    for token in [
        'data-release-download="multiplatform"',
        "Bazzite/Linux elsődleges",
        "Windows támogatott",
        "Teljes multiplatform verzió letöltése",
        "5 napos próbalicenc",
    ]:
        if token not in downloads:
            module.fail(f"Downloads page missing full-release contract: {token}")
    if re.search(r"\b(beta|béta)\b", module.visible_text(module.SCIFI / "downloads/index.html"), re.I):
        module.fail("Downloads page still exposes retired beta wording")

    production = module.read("billing-worker/src/production-content-entry.js")
    preview = module.read("content-preview-entry.js")
    for source, name in [(production, "production"), (preview, "preview")]:
        for token in ["formatx-public-shell.js", "formatx-content-standard.css"]:
            if token not in source:
                module.fail(f"{name} public-page wrapper missing {token}")

    sitemap = module.read("docs/sitemap.xml")
    if "<loc>https://www.formatxsuite.com/</loc>" not in sitemap:
        module.fail("Sitemap missing canonical root homepage")
    for url in [
        "/scifi-ui/downloads/", "/scifi-ui/method.html",
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
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


def valid_sha256(value: object) -> bool:
    return bool(re.fullmatch(r"sha256:[0-9a-fA-F]{64}", str(value or "")))


def active_production_entry() -> str:
    """Return the configured production entry only when it preserves wrapper ownership.

    A versioned edge entry is valid only when it directly delegates fetch() to the
    canonical production-content-entry.js wrapper. This keeps the semantic content
    wrapper contract while allowing evidence-backed transport/first-paint edge layers.
    """
    config = module.read("billing-worker/wrangler.jsonc")
    match = re.search(r'"main"\s*:\s*"([^"]+)"', config)
    if not match:
        module.fail("Production config does not declare a Worker main entry")
        return "src/production-content-entry.js"

    entry = match.group(1)
    canonical = "src/production-content-entry.js"
    if entry == canonical:
        return entry
    if not re.fullmatch(r"src/production-content-entry-r\d+\.js", entry):
        module.fail(f"Production entry is not a canonical or versioned content wrapper: {entry}")
        return entry

    source = module.read(f"billing-worker/{entry}")
    import_match = re.search(
        r"import\s+([A-Za-z_$][\w$]*)\s+from\s+['\"]\./production-content-entry\.js['\"]",
        source,
    )
    if not import_match:
        module.fail(f"Versioned production entry does not delegate to the canonical content wrapper: {entry}")
        return entry
    delegate = re.escape(import_match.group(1))
    if not re.search(rf"\b{delegate}\.fetch\s*\(\s*request\s*,\s*env\s*,\s*ctx\s*\)", source):
        module.fail(f"Versioned production entry imports but does not execute the canonical content wrapper: {entry}")
    return entry


def production_runtime_contract() -> str:
    """Validate the active production delegation chain, not a frozen entry filename."""
    active = active_production_entry()
    files = []
    if active != "src/production-content-entry.js":
        files.append(f"billing-worker/{active}")
    files.extend([
        "billing-worker/src/production-content-entry.js",
        "billing-worker/src/production-content-entry-r369-base.js",
        "billing-worker/src/production-content-base.js",
    ])
    return "\n".join(module.read(file) for file in files)


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
        if not valid_sha256(package.get("digest")):
            module.fail("Official package digest is missing or malformed")

        android = data.get("channels", {}).get("android") or {}
        if android.get("available") is not True:
            module.fail("Schema 2 release lacks the official Android package")
        if android.get("download_url") != "/download/android":
            module.fail("Official Android package does not use the canonical worker route")
        if not isinstance(android.get("size"), int) or android.get("size", 0) <= 0:
            module.fail("Official Android package size is missing")
        if not valid_sha256(android.get("digest")):
            module.fail("Official Android package digest is missing or malformed")

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
        if "android" not in supported:
            module.fail("Android is not listed as a supported secondary platform")
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
        "android_local_size",
        "android_local_digest",
        "sha256sum",
        "stat -c '%s'",
        "integrity",
        "del(.synced_at, .channels.android.updated_at)",
        "cmp -s",
        "git commit -m 'Sync official current release metadata'",
    ]:
        if token not in workflow:
            module.fail(f"Release sync workflow missing contract: {token}")


def validate_public_pages_v2() -> None:
    pages = [
        "downloads/index.html", "android/index.html", "method.html", "verification.html",
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

    android = module.read("docs/scifi-ui/android/index.html")
    for token in [
        'href="/download/android"',
        "ANDROID TELJES VERZIÓ",
        "NATÍV BÉTA",
        'href="/download/android-native-beta"',
    ]:
        if token not in android:
            module.fail(f"Android page missing channel truth contract: {token}")
    if "android-native-v1.1.0-beta" in android:
        module.fail("Android page must use the first-party Native beta download route instead of an upstream release URL")

    production = production_runtime_contract()
    preview = module.read("content-preview-entry.js")
    for source, name in [(production, "production"), (preview, "preview")]:
        for token in ["formatx-public-shell.js", "formatx-content-standard.css"]:
            if token not in source:
                module.fail(f"{name} public-page wrapper missing {token}")

    sitemap = module.read("docs/sitemap.xml")
    if "<loc>https://formatxsuite.com/</loc>" not in sitemap:
        module.fail("Sitemap missing canonical apex root homepage")
    for url in [
        "/scifi-ui/downloads/", "/scifi-ui/android/", "/scifi-ui/method.html",
        "/scifi-ui/verification.html", "/scifi-ui/test-matrix.html",
        "/scifi-ui/known-issues.html", "/scifi-ui/security.html",
        "/scifi-ui/decision-log.html", "/scifi-ui/support.html",
        "/scifi-ui/license.html", "/scifi-ui/terms.html", "/scifi-ui/privacy.html"
    ]:
        if url not in sitemap:
            module.fail(f"Sitemap missing {url}")
    if "Sitemap: https://formatxsuite.com/sitemap.xml" not in module.read("docs/robots.txt"):
        module.fail("robots.txt does not point to the canonical apex sitemap")


def validate_runtime_contract_v2() -> None:
    production = production_runtime_contract()
    preview = module.read("content-preview-entry.js")
    required = [
        "release-metadata.js",
        "formatx-content-standard.js",
        "formatx-seo.js",
        "formatx-content-finalizer.js",
        "formatx-platform-surface-finalizer.js",
        "formatx-organism-trust.js",
        "formatx-organism-semantic-state.js",
        "single-language-toggle.js",
        "cleanLegacyReleaseCopy",
    ]
    for source, name in [(production, "production"), (preview, "preview")]:
        for token in required:
            if token not in source:
                module.fail(f"{name} content wrapper missing {token}")

    active_production_entry()
    if '"main": "content-preview-entry.js"' not in module.read("wrangler.jsonc"):
        module.fail("Preview does not use the content wrapper")

    release_script = module.read(module.SCIFI / "scripts/release-metadata.js")
    for token in [
        "current-release.json", "ready-v6", "OFFICIAL_REPOSITORY = 'hutoczky/FormatX-Updates'",
        "isOfficialGitHubReleaseUrl", "isOfficialGitHubDownloadUrl", "isOfficialMetadata",
        "release?.source === 'github_published_release'", "validDigest(asset.digest)",
        "channels?.multiplatform", "data-release-download=\"multiplatform\"",
        "setText('[data-release-version]', '', false)", "5-day trial licence", "Teljes multiplatform verzió letöltése"
    ]:
        if token not in release_script:
            module.fail(f"Release metadata controller missing {token}")

    platform_script = module.read(module.SCIFI / "scripts/platform-status.js")
    for token in ["full release", "5-day trial licence", "5 napos próbalicenc"]:
        if token.lower() not in platform_script.lower():
            module.fail(f"Platform status controller missing full-release contract: {token}")

    downloads = module.read(module.SCIFI / "downloads/index.html")
    if 'data-release-download="multiplatform"' not in downloads:
        module.fail("Downloads page is not driven by multiplatform release metadata")
    for legacy in ["/releases/download/v92/", "FormatX-Suite-Pro-V92.zip", "92.00"]:
        if legacy in downloads:
            module.fail(f"Downloads page contains historical release copy: {legacy}")

    production_lower = production.lower()
    if ".replaceall('teljes verzió letöltése', 'multiplatform nyilvános béta letöltése')" in production_lower:
        module.fail("Production still rewrites full release copy back to beta")


module.validate_release_metadata = validate_release_metadata_v2
module.validate_public_pages = validate_public_pages_v2
module.validate_runtime_contract = validate_runtime_contract_v2
raise SystemExit(module.main())

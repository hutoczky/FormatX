#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
SCIFI = ROOT / "docs" / "scifi-ui"
ERRORS: list[str] = []


def read(path: str | Path) -> str:
    target = ROOT / path if isinstance(path, str) else path
    if not target.exists():
        ERRORS.append(f"Missing file: {target.relative_to(ROOT)}")
        return ""
    return target.read_text(encoding="utf-8")


def load_json(path: str | Path):
    try:
        return json.loads(read(path))
    except Exception as exc:
        ERRORS.append(f"Invalid JSON {path}: {exc}")
        return {}


def require(condition: bool, message: str) -> None:
    if not condition:
        ERRORS.append(message)


def require_tokens(source: str, label: str, tokens: list[str]) -> None:
    for token in tokens:
        require(token in source, f"{label} missing contract: {token}")


def official_release(value: str) -> bool:
    parsed = urlparse(value)
    return (
        parsed.scheme == "https"
        and parsed.netloc == "github.com"
        and parsed.path.startswith("/hutoczky/FormatX-Updates/releases/")
    )


def official_download(value: str) -> bool:
    parsed = urlparse(value)
    return (
        parsed.scheme == "https"
        and parsed.netloc == "github.com"
        and parsed.path.startswith("/hutoczky/FormatX-Updates/releases/download/")
    )


def canonical_package(release: dict) -> dict:
    return release.get("channels", {}).get("multiplatform") or {}


def validate_known_issues() -> None:
    page = read(SCIFI / "known-issues.html")
    controller = read(SCIFI / "scripts/public-evidence-pages.js")
    data = load_json(SCIFI / "data/known-issues.json")
    require_tokens(page, "Known-issues page", [
        'data-fx-public-page="known-issues"', 'data-issues-summary',
        'data-issue-controls', 'data-issue-search', 'data-issue-filter="platform"',
        'data-issue-filter="severity"', 'data-issue-filter="status"',
        'data-issue-results', 'data-issues-root', 'hreflang="hu"', 'hreflang="en"',
        'teljes kiadás',
    ])
    require_tokens(controller, "Known-issues controller", [
        "configureIssueControls", "applyIssueFilters", "renderIssueSummary",
        "data.items", "fx-issue-card__id", "aria-busy",
    ])
    require(len(data.get("items", [])) > 0, "Known-issues register is empty")
    ids = [item.get("id") for item in data.get("items", [])]
    require(len(ids) == len(set(ids)), "Known-issues identifiers are not unique")
    for item in data.get("items", []):
        require(bool(re.fullmatch(r"FX-[A-Z0-9-]+", str(item.get("id", "")))), f"Invalid issue identifier: {item.get('id')}")


def validate_public_shell() -> None:
    shell = read(SCIFI / "scripts/formatx-public-shell.js")
    guard = read(SCIFI / "scripts/formatx-full-release-guard.js")
    css = read(SCIFI / "styles/formatx-content-standard.css")
    production = read("billing-worker/src/production-content-entry.js")
    preview = read("content-preview-entry.js")
    wrangler = read("wrangler.jsonc")
    require_tokens(shell, "Public shell", [
        "ready-v3", "PUBLIC_PATHS", "ensureHeader", "ensureFooter",
        "findOrCreateLanguageControl", "aria-current", "formatx:releasemetadataready",
        "/scifi-ui/known-issues.html", "/scifi-ui/support.html", "/scifi-ui/license.html",
        "TELJES VERZIÓ", "FULL RELEASE", "ensureFullReleaseGuard",
    ])
    require_tokens(guard, "Full release guard", [
        "fxFullRelease = 'full-release'", "fxTrialDays = '5'",
        "TELJES VERZIÓ", "FULL RELEASE", "MutationObserver",
    ])
    require("['NATÍV BÉTA'" not in guard and "['NATIVE BETA'" not in guard,
            "Full release guard must preserve explicitly named beta channels")
    require("fetch(" not in shell and "XMLHttpRequest" not in shell and "WebSocket" not in shell,
            "Public shell must remain local")
    require_tokens(css, "Public shell CSS", [
        ".fx-public-header", ".fx-public-header__inner", ".fx-public-tools",
        ".fx-public-footer", ".fx-issue-controls", ".fx-issue-overview",
    ])
    for source, label in [(production, "Production wrapper"), (preview, "Preview wrapper")]:
        require_tokens(source, label, [
            "formatx-public-shell.js", "formatx-content-standard.css", "Cache-Control', 'no-store",
        ])
    require('/scifi-ui/scripts/formatx-public-shell.js' in wrangler,
            "Preview Worker does not route the public shell through run_worker_first")


def validate_release_sync() -> None:
    workflow = read(".github/workflows/sync-current-release.yml")
    android_integrity_workflow = read(".github/workflows/validate-android-release-integrity.yml")
    release_script = read(SCIFI / "scripts/release-metadata.js")
    platform = load_json(SCIFI / "data/platform-status.json")
    release = load_json(SCIFI / "data/current-release.json")
    public_contract = load_json(SCIFI / "data/public-platform-contract.json")

    require_tokens(workflow, "Release sync workflow", [
        "repository_dispatch", "formatx-release-published", "prerelease == false",
        "source_release_id", "source_updated_at", "target_commitish",
        "multiplatform_asset", "primary_platform: \"linux-bazzite\"",
        "supported_platforms: [\"linux-bazzite\", \"windows\"]",
        "android_local", "android_local_size", "android_local_digest", "sha256sum",
        "integrity", "del(.synced_at, .channels.android.updated_at)", "cmp -s",
        "preserving the existing synced_at value", "--retry-all-errors",
    ])
    require_tokens(android_integrity_workflow, "Android integrity workflow", [
        "FormatX-Suite-Pro-Android.apk", "sha256sum", "stat -c '%s'",
        "channels?.android?.digest", "FormatX Android release integrity",
    ])
    require_tokens(release_script, "Release metadata controller", [
        "ready-v6", "OFFICIAL_REPOSITORY = 'hutoczky/FormatX-Updates'",
        "isOfficialGitHubReleaseUrl", "isOfficialGitHubDownloadUrl", "isOfficialMetadata",
        "release?.source === 'github_published_release'", "validDigest(asset.digest)",
        "formatBytes", "integrityLabel", "channels?.multiplatform", "data-release-integrity",
        "data-release-source-updated", "current-release.json",
        "setText('[data-release-version]', '', false)",
        "5-day trial licence", "Teljes multiplatform verzió letöltése",
    ])

    require(platform.get("product_release", {}).get("status") == "full_release", "Product status is not full_release")
    require(platform.get("product_release", {}).get("trial_days") == 5, "Product trial is not five days")
    require(release.get("schema_version") == 2, "Current release is not schema 2")
    require(release.get("source") == "github_published_release", "Current release source is not canonical")
    require(release.get("repository") == "hutoczky/FormatX-Updates", "Current release repository is not canonical")
    require(release.get("prerelease") is not True, "Current official release must not be a prerelease")
    require(bool(re.fullmatch(r"v\d+", str(release.get("version") or ""), re.I)), "Current release version is invalid")
    require(official_release(str(release.get("release_url") or "")), "Current release URL is not official")

    package = canonical_package(release)
    require(package.get("available") is True, "Official package is unavailable")
    require(official_download(str(package.get("download_url") or "")), "Package URL is not official")
    require(bool(re.fullmatch(r"sha256:[0-9a-fA-F]{64}", str(package.get("digest") or ""))),
            "Package SHA-256 digest is missing or malformed")
    require(package.get("supported_platforms") == ["linux-bazzite", "windows"],
            "Canonical multiplatform native platform list is invalid")

    android = release.get("channels", {}).get("android") or {}
    require(android.get("available") is True, "Official Android package is unavailable")
    require(android.get("download_url") == "/download/android", "Android canonical worker download route is invalid")
    require(isinstance(android.get("size"), int) and android.get("size", 0) > 0, "Android package size is missing")
    require(bool(re.fullmatch(r"sha256:[0-9a-fA-F]{64}", str(android.get("digest") or ""))),
            "Android SHA-256 digest is missing or malformed")

    require(release.get("integrity", {}).get("status") in {
        "package_only", "digest_published", "digest_and_signature_published"
    }, "Schema 2 release integrity status is invalid")

    public_copy = public_contract.get("public_copy", {})
    require(public_copy.get("primary_system") == "linux-bazzite", "Public primary platform is not Bazzite/Linux")
    require(public_copy.get("download_channel") == "multiplatform", "Public download channel is not multiplatform")
    require(public_copy.get("release_maturity") == "full_release", "Public release maturity is not full_release")
    require(public_copy.get("trial_days") == 5, "Public contract trial is not five days")
    secondary = public_copy.get("supported_secondary_platforms") or []
    require("windows" in secondary, "Windows is not a supported secondary platform")
    require("android" in secondary, "Android is not a supported secondary platform")
    require(public_copy.get("public_release_version_visible") is False, "Public release version must remain hidden")


def validate_worker_ownership() -> None:
    production_config = load_json("billing-worker/wrangler.jsonc")
    preview_config = load_json("wrangler.jsonc")
    require(production_config.get("main") == "src/production-content-entry.js",
            "Production Worker does not use production-content-entry.js")
    routes = [route.get("pattern") for route in production_config.get("routes", [])]
    require(routes == ["formatxsuite.com", "www.formatxsuite.com"],
            f"Production custom-domain ownership is unexpected: {routes}")
    require(not preview_config.get("routes"), "Preview Worker must not own production custom domains")
    require(preview_config.get("main") == "content-preview-entry.js", "Preview entry is unexpected")


def main() -> int:
    validate_known_issues()
    validate_public_shell()
    validate_release_sync()
    validate_worker_ownership()
    if ERRORS:
        print("FormatX public/release integration validation failed:", file=sys.stderr)
        for error in ERRORS:
            print(f" - {error}", file=sys.stderr)
        return 1
    print("FormatX public pages, Full release status, five-day trial, V130-compatible GitHub provenance, Android/multiplatform integrity and Worker ownership are valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

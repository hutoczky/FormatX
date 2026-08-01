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


def official_download(value: str) -> bool:
    parsed = urlparse(value)
    return (
        parsed.scheme == "https"
        and parsed.netloc == "github.com"
        and parsed.path.startswith("/hutoczky/FormatX-Updates/releases/download/")
    )


def validate_known_issues() -> None:
    page = read(SCIFI / "known-issues.html")
    controller = read(SCIFI / "scripts/public-evidence-pages.js")
    data = load_json(SCIFI / "data/known-issues.json")
    require_tokens(page, "Known-issues page", [
        'data-fx-public-page="known-issues"', 'data-issues-summary',
        'data-issue-controls', 'data-issue-search', 'data-issue-filter="platform"',
        'data-issue-filter="severity"', 'data-issue-filter="status"',
        'data-issue-results', 'data-issues-root', 'hreflang="hu"', 'hreflang="en"',
    ])
    require_tokens(controller, "Known-issues controller", [
        "configureIssueControls", "applyIssueFilters", "renderIssueSummary",
        "data.items", "fx-issue-card__id", "aria-busy",
    ])
    require(len(data.get("items", [])) > 0, "Known-issues register is empty")
    ids = [item.get("id") for item in data.get("items", [])]
    require(len(ids) == len(set(ids)), "Known-issues identifiers are not unique")
    for item in data.get("items", []):
        require(
            bool(re.fullmatch(r"FX-[A-Z0-9-]+", str(item.get("id", "")))),
            f"Invalid issue identifier: {item.get('id')}",
        )


def validate_public_shell() -> None:
    shell = read(SCIFI / "scripts/formatx-public-shell.js")
    css = read(SCIFI / "styles/formatx-content-standard.css")
    production = read("billing-worker/src/production-content-entry.js")
    preview = read("content-preview-entry.js")
    wrangler = read("wrangler.jsonc")
    require_tokens(shell, "Public shell", [
        "ready-v1", "PUBLIC_PATHS", "ensureHeader", "ensureFooter",
        "findOrCreateLanguageControl", "aria-current", "formatx:releasemetadataready",
        "/scifi-ui/known-issues.html", "/scifi-ui/support.html", "/scifi-ui/license.html",
    ])
    require(
        "fetch(" not in shell and "XMLHttpRequest" not in shell and "WebSocket" not in shell,
        "Public shell must remain local",
    )
    require_tokens(css, "Public shell CSS", [
        ".fx-public-header", ".fx-public-header__inner", ".fx-public-tools",
        ".fx-public-footer", ".fx-issue-controls", ".fx-issue-overview",
    ])
    for source, label in [(production, "Production wrapper"), (preview, "Preview wrapper")]:
        require_tokens(source, label, [
            "formatx-public-shell.js", "formatx-content-standard.css", "Cache-Control', 'no-store",
        ])
    require(
        '/scifi-ui/scripts/formatx-public-shell.js' in wrangler,
        "Preview Worker does not route the public shell through run_worker_first",
    )


def validate_release_sync() -> None:
    workflow = read(".github/workflows/sync-current-release.yml")
    release_script = read(SCIFI / "scripts/release-metadata.js")
    release = load_json(SCIFI / "data/current-release.json")

    require_tokens(workflow, "Release sync workflow", [
        "repository_dispatch", "formatx-release-published", "prerelease == false",
        "source_release_id", "source_updated_at", "target_commitish",
        "multiplatform_asset", "primary_platform: \"linux-bazzite\"",
        "supported_platforms: [\"linux-bazzite\", \"windows\"]",
        "android_local", "integrity", "del(.synced_at)", "cmp -s",
        "preserving the existing synced_at value", "--retry-all-errors",
    ])
    require_tokens(release_script, "Release metadata controller", [
        "ready-v4", "isAllowedReleaseUrl", "formatBytes", "integrityLabel",
        "channels?.multiplatform", "data-release-integrity",
        "data-release-source-updated", "current-release.json",
        "setText('[data-release-version]', '', false)",
    ])

    require(release.get("schema_version") == 2, "Current release is not schema 2")
    require(release.get("source") == "github_published_release", "Current release source is not canonical")
    require(release.get("prerelease") is not True, "Current official release must not be a prerelease")
    release_url = urlparse(str(release.get("release_url") or ""))
    require(
        release_url.scheme == "https"
        and release_url.netloc == "github.com"
        and release_url.path.startswith("/hutoczky/FormatX-Updates/releases/"),
        "Current release URL is not official",
    )
    package = release.get("channels", {}).get("multiplatform", {})
    require(package.get("available") is True, "Multiplatform package is unavailable")
    require(official_download(str(package.get("download_url") or "")), "Package URL is not official")
    require(package.get("primary_platform") == "linux-bazzite", "Package primary platform is not Bazzite/Linux")
    supported = set(package.get("supported_platforms") or [])
    require({"linux-bazzite", "windows"}.issubset(supported), "Package support list is incomplete")
    require(str(package.get("digest") or "").startswith("sha256:"), "Package SHA-256 digest is missing")
    require(
        release.get("integrity", {}).get("status") in {
            "package_only", "digest_published", "digest_and_signature_published"
        },
        "Schema 2 release integrity status is invalid",
    )


def validate_worker_ownership() -> None:
    production_config = load_json("billing-worker/wrangler.jsonc")
    preview_config = load_json("wrangler.jsonc")
    require(
        production_config.get("main") == "src/production-content-entry.js",
        "Production Worker does not use production-content-entry.js",
    )
    routes = [route.get("pattern") for route in production_config.get("routes", [])]
    require(
        routes == ["formatxsuite.com", "www.formatxsuite.com"],
        f"Production custom-domain ownership is unexpected: {routes}",
    )
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
    print("FormatX public pages, multiplatform release sync and Worker ownership are valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

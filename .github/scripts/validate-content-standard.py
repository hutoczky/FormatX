#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
SCIFI = ROOT / "docs" / "scifi-ui"
ERRORS: list[str] = []


def fail(message: str) -> None:
    ERRORS.append(message)


def read(path: str | Path) -> str:
    target = ROOT / path if isinstance(path, str) else path
    if not target.exists():
        fail(f"Missing file: {target.relative_to(ROOT)}")
        return ""
    return target.read_text(encoding="utf-8")


def load_json(path: str | Path):
    text = read(path)
    try:
        return json.loads(text)
    except Exception as exc:
        fail(f"Invalid JSON {path}: {exc}")
        return {}


class VisibleText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hidden_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "template"}:
            self.hidden_depth += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style", "template"} and self.hidden_depth:
            self.hidden_depth -= 1

    def handle_data(self, data):
        if not self.hidden_depth:
            self.parts.append(data)


def visible_text(path: Path) -> str:
    parser = VisibleText()
    parser.feed(read(path))
    return " ".join(parser.parts)


def official_download(value: str) -> bool:
    parsed = urlparse(value)
    return (
        parsed.scheme == "https"
        and parsed.netloc == "github.com"
        and parsed.path.startswith("/hutoczky/FormatX-Updates/releases/download/")
    )


def validate_platform_status() -> None:
    data = load_json(SCIFI / "data/platform-status.json")
    expected = {
        "linux-bazzite": ("full_release", "primary"),
        "windows": ("full_release", "secondary"),
        "android": ("full_release", "secondary"),
        "web": ("technical_preview", "preview"),
        "macos": ("planned", "roadmap"),
        "ios": ("planned", "roadmap"),
    }
    actual = {
        item.get("id"): (item.get("status"), item.get("support_role"))
        for item in data.get("platforms", [])
    }
    if actual != expected:
        fail(f"Canonical platform matrix mismatch: {actual}")
    if data.get("product_category", {}).get("hu") != "Technikusi operációs réteg":
        fail("Hungarian product category is not canonical")
    if data.get("product_category", {}).get("en") != "Technician Operating Layer":
        fail("English product category is not canonical")
    if data.get("method", {}).get("hu") != [
        "Felderítés", "Terv", "Kontrollált végrehajtás", "Visszaellenőrzés"
    ]:
        fail("Hungarian FormatX Method mismatch")
    if data.get("method", {}).get("en") != [
        "Discover", "Plan", "Controlled execution", "Verify"
    ]:
        fail("English FormatX Method mismatch")
    release = data.get("product_release", {})
    if release.get("public_package") != "multiplatform":
        fail("Canonical product release is not marked multiplatform")
    if release.get("status") != "full_release":
        fail("Canonical product release is not marked full_release")
    if release.get("trial_days") != 5:
        fail("Canonical trial licence must be exactly 5 days")
    if "name" in release:
        fail("platform-status.json must not contain a hardcoded release name")
    for item in data.get("platforms", []):
        if "version" in item:
            fail(f"Platform status contains hardcoded version: {item.get('id')}")
        if item.get("status") == "stable":
            fail(f"Stable evidence label is not permitted without the separate gate: {item.get('id')}")
        if item.get("status") == "public_beta":
            fail(f"Retired public_beta status remains: {item.get('id')}")

    contract = load_json(SCIFI / "data/public-platform-contract.json")
    public_copy = contract.get("public_copy", {})
    if public_copy.get("release_maturity") != "full_release":
        fail("Public platform contract is not full_release")
    if public_copy.get("trial_days") != 5:
        fail("Public platform contract does not declare a 5-day trial")

    channel = load_json(SCIFI / "data/release-channel.json")
    display = channel.get("public_display", {})
    if "béta" in json.dumps(display, ensure_ascii=False).lower() or "beta" in json.dumps(display).lower():
        fail("Release channel public display still contains beta wording")
    if display.get("trial_label", {}).get("hu") != "5 napos próbalicenc":
        fail("Release channel Hungarian trial label mismatch")


def validate_release_metadata() -> None:
    data = load_json(SCIFI / "data/current-release.json")
    channels = data.get("channels", {})
    package = channels.get("multiplatform", {})
    if data.get("ok") is True:
        if data.get("schema_version") != 2:
            fail("Current release must use provenance schema 2")
        if data.get("source") != "github_published_release":
            fail("Synchronized release source is not canonical")
        if data.get("prerelease") is True:
            fail("Current official release must not be a prerelease")
        if not isinstance(data.get("version"), str) or not data["version"].strip():
            fail("Synchronized release must have an internal version tag")
        if not isinstance(data.get("source_release_id"), int):
            fail("Schema 2 release lacks source_release_id")
        if package.get("available") is not True:
            fail("Current release does not expose the official multiplatform package")
        elif not official_download(str(package.get("download_url") or "")):
            fail("Multiplatform release URL is not an official FormatX-Updates asset")
        if package.get("primary_platform") != "linux-bazzite":
            fail("Multiplatform package does not identify Bazzite/Linux as primary")
        supported = set(package.get("supported_platforms") or [])
        if not {"linux-bazzite", "windows"}.issubset(supported):
            fail("Multiplatform package support list is incomplete")
        if not str(package.get("digest") or "").startswith("sha256:"):
            fail("Multiplatform package lacks its published SHA-256 digest")
        if data.get("integrity", {}).get("status") not in {
            "package_only", "digest_published", "digest_and_signature_published"
        }:
            fail("Release integrity status is invalid")
    else:
        if data.get("version") is not None:
            fail("Fallback release metadata must not invent a version")
        if package.get("available") is not False:
            fail("Fallback release metadata must not expose a package")

    workflow = read(".github/workflows/sync-current-release.yml")
    for token in [
        "FormatX-Updates/releases?per_page=30",
        "multiplatform_asset",
        "primary_platform: \"linux-bazzite\"",
        "supported_platforms: [\"linux-bazzite\", \"windows\"]",
        "docs/scifi-ui/data/current-release.json",
        "del(.synced_at)",
        "cmp -s",
        "git commit -m 'Sync official current release metadata'",
    ]:
        if token not in workflow:
            fail(f"Release sync workflow missing contract: {token}")


def validate_evidence() -> None:
    evidence = load_json(SCIFI / "data/evidence-manifest.json")
    for capture in evidence.get("captures", []):
        if capture.get("publication_state") == "awaiting_verified_capture" and capture.get("file") is not None:
            fail(f"Pending capture unexpectedly has a file: {capture.get('id')}")
    tests = load_json(SCIFI / "data/test-matrix.json")
    allowed = {"verified", "partially_verified", "failed", "blocked", "not_tested", "planned"}
    ids: set[str] = set()
    for case in tests.get("cases", []):
        case_id = case.get("id")
        if not case_id or case_id in ids:
            fail(f"Missing or duplicate test id: {case_id}")
        ids.add(case_id)
        if case.get("status") not in allowed:
            fail(f"Invalid test status: {case_id}")
    gate = load_json(SCIFI / "data/stable-gate.json")
    for platform, record in gate.get("current_gate", {}).items():
        if record.get("eligible") is not False:
            fail(f"Stable gate is incorrectly open: {platform}")


def validate_public_pages() -> None:
    pages = [
        "downloads/index.html", "method.html", "verification.html",
        "test-matrix.html", "known-issues.html", "security.html",
        "decision-log.html", "license.html", "terms.html", "privacy.html", "support.html"
    ]
    for page in pages:
        path = SCIFI / page
        if not path.exists():
            fail(f"Missing public page: {page}")
            continue
        text = visible_text(path)
        if re.search(r"\bV92\b", text, re.I):
            fail(f"Visible hardcoded V92 remains in {page}")
        if re.search(r"\b(csapatunk|fejlesztőink|vállalatunk|our team|our developers|our company)\b", text, re.I):
            fail(f"False team/company voice remains in {page}")
        if re.search(r"\b(világelső|piacvezető|world[- ]leading|market leader)\b", text, re.I):
            fail(f"Unsupported leadership claim remains in {page}")
        if page in {"downloads/index.html", "terms.html", "known-issues.html"} and re.search(r"\b(beta|béta)\b", text, re.I):
            fail(f"Retired beta wording remains visible in current-release page: {page}")


def validate_runtime_contract() -> None:
    production = read("billing-worker/src/production-content-entry.js")
    preview = read("content-preview-entry.js")
    for source, name in [(production, "production"), (preview, "preview")]:
        for token in [
            "release-metadata.js", "formatx-content-standard.js", "formatx-seo.js",
            "formatx-content-finalizer.js", "formatx-platform-surface-finalizer.js",
            "formatx-organism-trust.js", "formatx-organism-semantic-state.js",
            "single-language-toggle.js", "cleanLegacyReleaseCopy"
        ]:
            if token not in source:
                fail(f"{name} content wrapper missing {token}")
    if '"main": "src/production-content-entry.js"' not in read("billing-worker/wrangler.jsonc"):
        fail("Production does not use the content wrapper")
    if '"main": "content-preview-entry.js"' not in read("wrangler.jsonc"):
        fail("Preview does not use the content wrapper")

    release_script = read(SCIFI / "scripts/release-metadata.js")
    for token in [
        "current-release.json", "ready-v5", "channels?.multiplatform",
        "data-release-download=\"multiplatform\"", "setText('[data-release-version]', '', false)",
        "5-day trial licence", "Teljes multiplatform verzió letöltése"
    ]:
        if token not in release_script:
            fail(f"Release metadata controller missing {token}")

    platform_script = read(SCIFI / "scripts/platform-status.js")
    for token in ["full release", "5-day trial licence", "5 napos próbalicenc"]:
        if token.lower() not in platform_script.lower():
            fail(f"Platform status controller missing full-release contract: {token}")

    downloads = read(SCIFI / "downloads/index.html")
    if 'data-release-download="multiplatform"' not in downloads:
        fail("Downloads page is not driven by multiplatform release metadata")
    for legacy in ["/releases/download/v92/", "FormatX-Suite-Pro-V92.zip", "92.00"]:
        if legacy in downloads:
            fail(f"Downloads page contains historical release copy: {legacy}")

    production_lower = production.lower()
    if ".replaceall('teljes verzió letöltése', 'multiplatform nyilvános béta letöltése')" in production_lower:
        fail("Production still rewrites full release copy back to beta")


def main() -> int:
    validate_platform_status()
    validate_release_metadata()
    validate_evidence()
    validate_public_pages()
    validate_runtime_contract()
    if ERRORS:
        print("FormatX content/evidence validation failed:", file=sys.stderr)
        for error in ERRORS:
            print(f" - {error}", file=sys.stderr)
        return 1
    print("FormatX full release, 5-day trial, evidence and trust contracts are valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
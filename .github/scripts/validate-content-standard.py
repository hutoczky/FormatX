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


def validate_platform_status() -> None:
    data = load_json(SCIFI / "data/platform-status.json")
    expected = {
        "windows": ("public_beta", "secondary"),
        "android": ("public_beta", "preview"),
        "linux-bazzite": ("development", "primary"),
        "web": ("technical_preview", "preview"),
        "macos": ("planned", "roadmap"),
        "ios": ("planned", "roadmap"),
    }
    actual = {item.get("id"): (item.get("status"), item.get("support_role")) for item in data.get("platforms", [])}
    if actual != expected:
        fail(f"Canonical platform matrix mismatch: {actual}")
    if data.get("product_category", {}).get("hu") != "Technikusi operációs réteg":
        fail("Hungarian product category is not canonical")
    if data.get("product_category", {}).get("en") != "Technician Operating Layer":
        fail("English product category is not canonical")
    if data.get("method", {}).get("hu") != ["Felderítés", "Terv", "Kontrollált végrehajtás", "Visszaellenőrzés"]:
        fail("Hungarian FormatX Method mismatch")
    if data.get("method", {}).get("en") != ["Discover", "Plan", "Controlled execution", "Verify"]:
        fail("English FormatX Method mismatch")
    if "name" in data.get("product_release", {}):
        fail("platform-status.json must not contain a hardcoded release name")
    for item in data.get("platforms", []):
        if "version" in item:
            fail(f"Platform status contains hardcoded version: {item.get('id')}")
        if item.get("status") == "stable":
            fail(f"Stable is not permitted for current platform: {item.get('id')}")


def validate_release_metadata() -> None:
    data = load_json(SCIFI / "data/current-release.json")
    if data.get("ok") is True:
        if not isinstance(data.get("version"), str) or not data["version"].strip():
            fail("Synchronized release must have a version tag")
        win = data.get("channels", {}).get("windows", {})
        if win.get("available") is True:
            url = str(win.get("download_url") or "")
            parsed = urlparse(url)
            if parsed.scheme != "https" or parsed.netloc != "github.com" or not parsed.path.startswith("/hutoczky/FormatX-Updates/releases/download/"):
                fail("Windows release URL is not an official FormatX-Updates asset")
    else:
        if data.get("version") is not None:
            fail("Fallback release metadata must not invent a version")
        if data.get("channels", {}).get("windows", {}).get("available") is not False:
            fail("Fallback release metadata must not expose a Windows package")
    workflow = read(".github/workflows/sync-current-release.yml")
    for token in ["FormatX-Updates/releases?per_page=20", "docs/scifi-ui/data/current-release.json", "git diff --quiet"]:
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
        if case.get("status") == "verified":
            for key in ["test_date", "build", "actual_result", "evidence_url", "last_verified"]:
                if not case.get(key):
                    fail(f"Verified test lacks {key}: {case_id}")
    gate = load_json(SCIFI / "data/stable-gate.json")
    for platform, record in gate.get("current_gate", {}).items():
        if record.get("eligible") is not False:
            fail(f"Stable gate is incorrectly open: {platform}")
    issues = load_json(SCIFI / "data/known-issues.json")
    for item in issues.get("items", []):
        for key in ["id", "platform", "problem", "severity", "workaround", "fix_status", "last_updated"]:
            if not item.get(key):
                fail(f"Known issue lacks {key}: {item.get('id')}")


def validate_public_pages() -> None:
    pages = [
        "index.html", "downloads/index.html", "method.html", "verification.html",
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
    sitemap = read("docs/sitemap.xml")
    for url in ["/scifi-ui/", "/scifi-ui/downloads/", "/scifi-ui/method.html", "/scifi-ui/verification.html", "/scifi-ui/test-matrix.html", "/scifi-ui/known-issues.html", "/scifi-ui/security.html", "/scifi-ui/decision-log.html"]:
        if url not in sitemap:
            fail(f"Sitemap missing {url}")
    if "Sitemap: https://www.formatxsuite.com/sitemap.xml" not in read("docs/robots.txt"):
        fail("robots.txt does not point to the canonical sitemap")


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
    intro = read(SCIFI / "scripts/formatx-event-horizon.js")
    for token in ["fx-intro-skip", "formatx:intro-seen-v1", "bfcache-restore", "runtime-error", "promise-error", "hard-deadline"]:
        if token not in intro:
            fail(f"Intro fail-open contract missing {token}")
    css = read(SCIFI / "styles/formatx-content-standard.css")
    for token in ["prefers-reduced-motion:reduce", ":focus-visible", "--fx-motion-organism", "fx-test-status"]:
        if token not in css:
            fail(f"Content standard CSS missing {token}")
    semantic = read(SCIFI / "scripts/formatx-organism-semantic-state.js")
    for token in ["core", "nervous-system", "system-organs", "commerce-heart", "safety-skeleton", "release-beacon"]:
        if token not in semantic:
            fail(f"Organism semantic state missing {token}")
    release_script = read(SCIFI / "scripts/release-metadata.js")
    if "current-release.json" not in release_script or "invent" in release_script.lower():
        fail("Release metadata controller is not strictly canonical")
    downloads = read(SCIFI / "downloads/index.html")
    if 'data-release-download="windows"' not in downloads:
        fail("Downloads page is not release-metadata driven")
    if "FormatX-Updates/releases/download/v92" in downloads.lower():
        fail("Downloads page contains a fixed historical asset URL")


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
    print("FormatX content, release, SEO, evidence and trust contracts are valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

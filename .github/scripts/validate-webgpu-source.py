#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RESULTS: list[tuple[str, bool]] = []


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def load_json(relative: str) -> dict:
    return json.loads(read(relative))


def require(label: str, condition: bool) -> None:
    RESULTS.append((label, bool(condition)))


def network_free(source: str) -> bool:
    return all(token not in source for token in ("fetch(", "XMLHttpRequest", "WebSocket"))


status_data = load_json("docs/scifi-ui/data/platform-status.json")
release_data = load_json("docs/scifi-ui/data/current-release.json")
public_contract = load_json("docs/scifi-ui/data/public-platform-contract.json")
home = read("docs/scifi-ui/index.html")
downloads = read("docs/scifi-ui/downloads/index.html")
loader = read("docs/scifi-ui/scripts/igloo-parity.js")
scroll_bootstrap = read("docs/scifi-ui/scripts/formatx-infinite-scroll.js")
desktop_scroll = read("docs/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js")
mobile_unified = read("docs/scifi-ui/scripts/formatx-mobile-unified.js")
mobile_css = read("docs/scifi-ui/styles/formatx-mobile-production-r5.css")
intro = read("docs/scifi-ui/scripts/formatx-event-horizon.js")
voice = read("docs/scifi-ui/scripts/organism-voice.js")
voice_stability = read("docs/scifi-ui/scripts/organism-voice-stability.js")
master_sync = read("docs/scifi-ui/scripts/organism-master-sync.js")
genome = read("docs/scifi-ui/scripts/synaptic-thought-genome.js")
disclosure = read("docs/scifi-ui/scripts/synaptic-thought-disclosure.js")
support = read("docs/scifi-ui/support.html")
terms = read("docs/scifi-ui/terms.html")
privacy = read("docs/scifi-ui/privacy.html")
production_worker = read("billing-worker/src/production-entry.js")
production_config = load_json("billing-worker/wrangler.jsonc")
preview_config = load_json("wrangler.jsonc")

expected = {
    "linux-bazzite": ("full_release", "primary"),
    "windows": ("full_release", "secondary"),
    "android": ("full_release", "secondary"),
    "web": ("technical_preview", "preview"),
    "macos": ("planned", "roadmap"),
    "ios": ("planned", "roadmap"),
}
actual = {item["id"]: (item["status"], item.get("support_role")) for item in status_data["platforms"]}
require("canonical Bazzite-first platform matrix", actual == expected)
require("product is full release", status_data["product_release"]["status"] == "full_release")
require("five-day trial remains canonical", status_data["product_release"].get("trial_days") == 5)
require("public package is multiplatform", status_data["product_release"].get("public_package") == "multiplatform")
require("no platform falsely claims Stable", all(item[0] != "stable" for item in actual.values()))

channels = release_data.get("channels", {})
package = channels.get("multiplatform") or channels.get("windows") or {}
public_copy = public_contract.get("public_copy", {})
require("release metadata schema is current", release_data.get("schema_version") == 2)
require("release source is official", release_data.get("source") == "github_published_release")
require("release is not prerelease", release_data.get("prerelease") is not True)
require("official package is available", package.get("available") is True)
require("official package has SHA-256", str(package.get("digest") or "").startswith("sha256:"))
require("public primary system is Linux/Bazzite", public_copy.get("primary_system") == "linux-bazzite")
require("public maturity is full release", public_copy.get("release_maturity") == "full_release")
require("public trial is five days", public_copy.get("trial_days") == 5)
require("public release version remains hidden", public_copy.get("public_release_version_visible") is False)
require("downloads expose multiplatform release", 'data-release-download="multiplatform"' in downloads)
require("home CTA exposes multiplatform release", 'data-release-download="multiplatform"' in home)

# Loader/runtime contract: mobile and desktop both use seamless-v7. Mobile keeps
# native browser momentum and defers the visual bridge handoff until scrollend/idle.
require("loader uses current v28 marker", "safe-ready-v28" in loader and "safe-loading-v28" in loader)
require("loader includes current voice stability", "organism-voice-stability.js?v=20260808-mobile-visual-viewport-1" in loader)
require("loader includes unified mobile controller", "formatx-mobile-unified.js" in loader)
require("scroll bootstrap is platform split v2", "platform-scroll-v2" in scroll_bootstrap)
require("mobile requests seamless runtime", "installSeamlessRuntime('mobile')" in scroll_bootstrap)
require("mobile automatic loop is pending then enabled by shared runtime", "fxAutomaticLoop = mobile ? 'pending-mobile' : 'desktop-only'" in scroll_bootstrap)
require("mobile loop policy preserves native momentum", "native-momentum-loop-v1" in scroll_bootstrap and "scrollend-or-idle-v1" in scroll_bootstrap)
require("mobile bridge is explicitly exposed in seamless mode", "data-fx-mobile-loop-bridge-override" in scroll_bootstrap and "min-height: calc(100svh + max(320px, 24svh))" in scroll_bootstrap)
require("mobile bootstrap performs no forced scrolling", "scrollTo(" not in scroll_bootstrap and "scrollIntoView(" not in scroll_bootstrap)
require("mobile bootstrap performs no cloning", "cloneNode(" not in scroll_bootstrap)
require("bootstrap loads shared seamless runtime", "formatx-infinite-scroll-desktop-v7.js" in scroll_bootstrap)
require("shared runtime remains seamless-v7", "const VERSION = 'seamless-v7'" in desktop_scroll)
require("shared runtime retains visual bridge", "cloneNode(true)" in desktop_scroll and "window.scrollTo(" in desktop_scroll)
require("shared runtime defers mobile transfer", "mobileTransfer: 'scrollend-or-idle'" in desktop_scroll and "scheduleMobileTransfer" in desktop_scroll)
require("shared runtime never captures wheel/touchmove", "addEventListener('wheel'" not in desktop_scroll and "addEventListener('touchmove'" not in desktop_scroll and "preventDefault" not in desktop_scroll)
require("mobile production layer is loaded", "formatx-mobile-production-r5.css" in mobile_unified)
require("legacy mobile bridge hide remains scoped for compatibility", ".fx-loop-bridge" in mobile_css and "display: none !important" in mobile_css)
require("mobile proof layout is single-column", ".fx-award-proof__grid" in mobile_css and "grid-template-columns: 1fr !important" in mobile_css)

require("intro remains fail-open", "runtime-error" in intro and "promise-error" in intro)
require("intro stores returning state", "formatx:intro-seen-v1" in intro)
require("voice is off by default", "let speechEnabled = false" in voice)
require("voice remains local", network_free(voice))
require("voice stability guard exists", "function interfaceBlocked()" in voice_stability and "function stopSpeech()" in voice_stability)
require("master sync exists", "data-fx-organism-dialogue-enabled" in master_sync)
require("Thought Genome remains local", network_free(genome))
require("Thought Genome stores fingerprints only", "questionStored: false" in genome and "fingerprint-only" in genome)
require("advanced thought controls start closed", "details.open = false" in disclosure and "defaultOpen: false" in disclosure)
require("privacy documents local fingerprint storage", "nyers kérdésszöveget nem menti" in privacy)
require("support has private email route", "mailto:hutoczky@gmail.com" in support)
require("terms document withdrawal", "Elállás" in terms)

require("preview Worker remains isolated", not preview_config.get("routes"))
require("preview Worker remains on workers.dev", preview_config.get("workers_dev") is True)
require("production content wrapper is active", production_config.get("main") == "src/production-content-entry.js")
production_domains = [route.get("pattern") for route in production_config.get("routes", [])]
require("production owns both custom domains", production_domains == ["formatxsuite.com", "www.formatxsuite.com"])
require("production injects critical scroll bootstrap path", "formatx-infinite-scroll.js" in production_worker and "data-fx-seamless-scroll-runtime" in production_worker)

failed = [label for label, passed in RESULTS if not passed]
for label, passed in RESULTS:
    print(("PASS" if passed else "FAIL"), label)
if failed:
    raise SystemExit("FormatX production architecture validation failed: " + "; ".join(failed))
print(f"FormatX production architecture validation passed: {len(RESULTS)} current contracts.")

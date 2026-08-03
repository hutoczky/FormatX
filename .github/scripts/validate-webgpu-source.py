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
loader = read("docs/scifi-ui/scripts/igloo-parity.js")
intro = read("docs/scifi-ui/scripts/formatx-event-horizon.js")
voice = read("docs/scifi-ui/scripts/organism-voice.js")
voice_stability = read("docs/scifi-ui/scripts/organism-voice-stability.js")
master_sync = read("docs/scifi-ui/scripts/organism-master-sync.js")
master_sync_css = read("docs/scifi-ui/styles/organism-master-sync.css")
voice_dock = read("docs/scifi-ui/styles/organism-voice-dock.css")
genome = read("docs/scifi-ui/scripts/synaptic-thought-genome.js")
genome_css = read("docs/scifi-ui/styles/synaptic-thought-genome.css")
disclosure = read("docs/scifi-ui/scripts/synaptic-thought-disclosure.js")
disclosure_css = read("docs/scifi-ui/styles/synaptic-thought-disclosure.css")
mobile_entry = read("docs/scifi-ui/scripts/mobile-webgl-entry.js")
morph_engine = read("docs/scifi-ui/scripts/mobile-core-engine-v3.js")
home = read("docs/scifi-ui/index.html")
downloads = read("docs/scifi-ui/downloads/index.html")
platform_js = read("docs/scifi-ui/scripts/platform-status.js")
platform_css = read("docs/scifi-ui/styles/platform-status.css")
desktop_css = read("docs/scifi-ui/styles/formatx-desktop-unified.css")
support = read("docs/scifi-ui/support.html")
terms = read("docs/scifi-ui/terms.html")
privacy = read("docs/scifi-ui/privacy.html")
test_matrix = read("docs/scifi-ui/test-matrix.html")
preview_worker = read("worker.js")
production_worker = read("billing-worker/src/production-entry.js")
preview_config = load_json("wrangler.jsonc")
production_config = load_json("billing-worker/wrangler.jsonc")

expected = {
    "linux-bazzite": ("public_beta", "primary"),
    "windows": ("public_beta", "secondary"),
    "android": ("public_beta", "preview"),
    "web": ("technical_preview", "preview"),
    "macos": ("planned", "roadmap"),
    "ios": ("planned", "roadmap"),
}
actual = {
    item["id"]: (item["status"], item.get("support_role"))
    for item in status_data["platforms"]
}
require("canonical Bazzite-first platform matrix", actual == expected)
require("product remains Public beta", status_data["product_release"]["status"] == "public_beta")
require("public package is multiplatform", status_data["product_release"].get("public_package") == "multiplatform")
require("no platform falsely claims Stable", all(item[0] != "stable" for item in actual.values()))

channels = release_data.get("channels", {})
package = channels.get("multiplatform") or channels.get("windows") or {}
public_copy = public_contract.get("public_copy", {})
require("release metadata uses schema 2", release_data.get("schema_version") == 2)
require("release source is official", release_data.get("source") == "github_published_release")
require("release is not a prerelease", release_data.get("prerelease") is not True)
require("official package is available", package.get("available") is True)
require("official package has SHA-256", str(package.get("digest") or "").startswith("sha256:"))
require("Bazzite/Linux is public primary", public_copy.get("primary_system") == "linux-bazzite")
require("public download contract is multiplatform", public_copy.get("download_channel") == "multiplatform")
require(
    "Windows is supported secondarily",
    "windows" in (public_copy.get("supported_secondary_platforms") or []),
)
require("public release version remains hidden", public_copy.get("public_release_version_visible") is False)

require("downloads use multiplatform release metadata", 'data-release-download="multiplatform"' in downloads)
require("downloads describe Bazzite/Linux as primary", "Bazzite/Linux elsődleges" in downloads)
require("downloads describe Windows as supported", "Windows támogatott" in downloads)
require("downloads contain no V92 asset", "/releases/download/v92/" not in downloads)
require("static home contains no V92 asset", "/releases/download/v92/" not in home and "FormatX-Suite-Pro-V92.zip" not in home)
require("static hero CTA is multiplatform", 'data-release-download="multiplatform"' in home)
require("static hero has no numeric release DNA", "92.00" not in home)

require("loader uses v27 ready marker", "safe-ready-v27" in loader)
require("loader uses v27 degraded marker", "safe-degraded-v27" in loader)
require("loader includes platform status", "platform-status.js?v=20260730-platform-status-1" in loader)
require("loader includes Organism voice v4", "organism-voice.js?v=20260730-organism-voice-4" in loader)
require("loader includes voice stability", "organism-voice-stability.js?v=20260731-organism-stability-1" in loader)
require("loader includes master synchronizer", "organism-master-sync.js?v=20260802-master-sync-1" in loader)
require("loader includes Thought Genome", "synaptic-thought-genome.js?v=20260731-thought-genome-1" in loader)
require("loader includes Thought Genome disclosure", "synaptic-thought-disclosure.js?v=20260731-thought-disclosure-1" in loader)
require("loader includes unified mobile controller", "formatx-mobile-unified.js?v=20260731-mobile-unified-2" in loader)
require("loader includes dock v3", "organism-voice-dock.css?v=20260731-organism-dock-3" in loader)
require("loader includes desktop composition", "formatx-desktop-unified.css" in loader)
require(
    "loader module ordering",
    loader.index("organism-voice.js")
    < loader.index("organism-voice-stability.js")
    < loader.index("organism-master-sync.js")
    < loader.index("synaptic-thought-genome.js")
    < loader.index("synaptic-thought-disclosure.js")
    < loader.index("formatx-three-host-safe.js"),
)
require("loader has no obsolete Natural Voice module", "organism-natural-voice" not in loader)

require("desktop hero is two-column", "grid-template-columns" in desktop_css and "#hero .hero-grid" in desktop_css)
require("desktop hero height is bounded", "min(100svh, 960px)" in desktop_css)
require("laptop-height desktop rule exists", "max-height: 820px" in desktop_css)
require("desktop composition leaves mobile untouched", "min-width: 1100px" in desktop_css)
require("desktop composition supports reduced motion", "prefers-reduced-motion: reduce" in desktop_css)

require("intro stores returning-visitor state", "formatx:intro-seen-v1" in intro)
require("intro has first-visit timing", "MOBILE_QUERY.matches?2100:2400" in intro)
require("intro has reduced and returning timing", "returning?(MOBILE_QUERY.matches?620:760)" in intro and "REDUCE_QUERY.matches?180" in intro)
require("intro has deterministic deadline", "hardDeadline=timelineDuration+exitDuration+1100" in intro)
require("intro starts on DOM readiness", "DOMContentLoaded',start" in intro)
require("intro remains skippable", "fx-intro-skip" in intro and "b.onclick=()=>exit" in intro)
require("intro restores from bfcache", "bfcache-restore" in intro and "pageshow" in intro)
require("intro fails open", "runtime-error" in intro and "promise-error" in intro)

require("Organism speech is off by default", "let speechEnabled = false" in voice)
require("Organism has a master switch", "fx-organism-master-toggle" in voice)
require("Organism dialogue starts closed", "setOpen(false, false)" in voice and "hidden: ''" in voice)
require("Organism response engine remains local", network_free(voice))
require("voice stability closes overlays", "function interfaceBlocked()" in voice_stability and "function stopSpeech()" in voice_stability)
require("master sync observes dialogue state", "data-fx-organism-dialogue-enabled" in master_sync)
require("master sync is CSP safe", "organism-master-sync.css?v=20260802-master-sync-1" in master_sync and "document.createElement('style')" not in master_sync)
require("master off hides thought layer", "html.fx-organism-master-disabled .fx-thought-genome-layer" in master_sync_css and "display: none !important" in master_sync_css)
require("master off hides advanced controls", "html.fx-organism-master-disabled .fx-thought-genome-disclosure" in master_sync_css)
require("dock reserves desktop dialogue lane", "right: 430px !important" in voice_dock)
require("dock protects ultrawide layouts", "min-aspect-ratio: 21/9" in voice_dock and "right: 440px !important" in voice_dock)

require("Thought Genome remains local", network_free(genome))
require("Thought Genome stores fingerprints only", "questionStored: false" in genome and "fingerprint-only" in genome)
require("Thought Genome keeps at most twelve fingerprints", "MAX_HISTORY = 12" in genome and "slice(-MAX_HISTORY)" in genome)
require("Thought Genome layer does not intercept input", "pointer-events: none" in genome_css)
require("Thought Genome supports reduced motion", "prefers-reduced-motion: reduce" in genome_css)
require("advanced thought controls start closed", "details.open = false" in disclosure and "defaultOpen: false" in disclosure)
require("only response text is live", "liveRegion: 'response-only'" in disclosure and "bubble.removeAttribute('aria-live')" in disclosure)
require("advanced controls use progressive disclosure", ":not([open]) > .fx-thought-genome-controls" in disclosure_css)

require("mobile entry imports Morphing Organism V3", "mobile-core-engine-v3.js?v=20260731-morphing-organism-v3" in mobile_entry)
require("mobile entry exposes V3 telemetry", "three-webgl-morphing-organism-v3" in mobile_entry)
require("Morphing Organism wraps stable V2", "startLivingCoreV2" in morph_engine and "mobile-core-engine-v2.js" in morph_engine)
require("Morphing Organism exposes six forms", all(token in morph_engine for token in ("coreForm", "neuralForm", "organForm", "heartForm", "skeletonForm", "beaconForm")))
require("Morphing Organism uses continuous morphing", "uFormA" in morph_engine and "uFormB" in morph_engine and "uMorph" in morph_engine)

require("platform renderer uses canonical JSON", "data/platform-status.json" in platform_js)
require("platform renderer says Bazzite/Linux primary", "Bazzite/Linux" in platform_js and "elsődleges" in platform_js)
require("platform badges remain readable", "font-size: 12px" in platform_css)
require("support has a private email route", "mailto:hutoczky@gmail.com" in support)
require("terms document withdrawal", "Elállás" in terms)
require("privacy documents local fingerprint storage", "nyers kérdésszöveget nem menti" in privacy)
require("public test matrix exists", "Nyilvános tesztmátrix" in test_matrix)
require("test matrix does not claim Stable", "· Stable" not in test_matrix)

require("preview Worker remains isolated", not preview_config.get("routes"))
require("preview Worker remains on workers.dev", preview_config.get("workers_dev") is True)
require("preview routes master-sync assets", "/scifi-ui/scripts/organism-master-sync.js" in preview_config.get("assets", {}).get("run_worker_first", []) and "/scifi-ui/styles/organism-master-sync.css" in preview_config.get("assets", {}).get("run_worker_first", []))
require("production Worker owns the content wrapper", production_config.get("main") == "src/production-content-entry.js")
production_domains = [route.get("pattern") for route in production_config.get("routes", [])]
require("production Worker owns both custom domains", production_domains == ["formatxsuite.com", "www.formatxsuite.com"])
for source, label in ((preview_worker, "preview Worker"), (production_worker, "production Worker")):
    require(f"{label} serves platform status assets", all(token in source for token in ("platform-status.json", "platform-status.js", "platform-status.css")))
    require(f"{label} serves Organism assets", all(token in source for token in ("organism-voice.js", "organism-voice-dock.css", "organism-master-sync.js", "organism-master-sync.css", "synaptic-thought-genome.js", "synaptic-thought-disclosure.js")))
    require(f"{label} serves Morphing Organism V3", "mobile-core-engine-v3.js" in source)

failed = [label for label, passed in RESULTS if not passed]
for label, passed in RESULTS:
    print(("PASS" if passed else "FAIL"), label)
if failed:
    raise SystemExit("FormatX production architecture validation failed: " + "; ".join(failed))
print(f"FormatX production architecture validation passed: {len(RESULTS)} current contracts.")

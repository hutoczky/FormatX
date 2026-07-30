import json
from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def require(label: str, condition: bool, results: list[tuple[str, bool]]) -> None:
    results.append((label, bool(condition)))


results: list[tuple[str, bool]] = []

home = read("docs/scifi-ui/index.html")
loader = read("docs/scifi-ui/scripts/igloo-parity.js")
intro = read("docs/scifi-ui/scripts/formatx-event-horizon.js")
status_js = read("docs/scifi-ui/scripts/platform-status.js")
status_css = read("docs/scifi-ui/styles/platform-status.css")
status_data = json.loads(read("docs/scifi-ui/data/platform-status.json"))
readme = read("README.md")
release_notes = read("RELEASE_NOTES.md")
downloads = read("docs/scifi-ui/downloads/index.html")
terms = read("docs/scifi-ui/terms.html")
privacy = read("docs/scifi-ui/privacy.html")
support = read("docs/scifi-ui/support.html")
test_matrix = read("docs/scifi-ui/test-matrix.html")
voice = read("docs/scifi-ui/scripts/organism-voice.js")
voice_dock = read("docs/scifi-ui/styles/organism-voice-dock.css")
thought_genome = read("docs/scifi-ui/scripts/synaptic-thought-genome.js")
thought_genome_css = read("docs/scifi-ui/styles/synaptic-thought-genome.css")
mobile_entry = read("docs/scifi-ui/scripts/mobile-webgl-entry.js")
morph_engine = read("docs/scifi-ui/scripts/mobile-core-engine-v3.js")
root_worker = read("worker.js")
production_entry = read("billing-worker/src/production-entry.js")
preview_config = read("wrangler.jsonc")

expected = {
    "Windows": "public_beta",
    "Linux / Bazzite": "development",
    "macOS": "planned",
    "Web": "technical_preview",
    "Android": "public_beta",
    "iOS / iPadOS": "planned",
}
expected_support = {
    "Linux / Bazzite": "primary",
    "Windows": "secondary",
    "macOS": "roadmap",
    "Web": "preview",
    "Android": "preview",
    "iOS / iPadOS": "roadmap",
}
actual = {item["name"]: item["status"] for item in status_data["platforms"]}
actual_support = {item["name"]: item.get("support_role") for item in status_data["platforms"]}
require("canonical status matrix matches expected platforms", actual == expected, results)
require("canonical support priority matches product strategy", actual_support == expected_support, results)
require("overall release is Public beta", status_data["product_release"]["status"] == "public_beta", results)
require("no platform is falsely marked Stable", "stable" not in actual.values(), results)

for platform, status in expected.items():
    require(f"README contains {platform}", platform in readme, results)
    require(f"release notes contain {platform}", platform in release_notes, results)
    require(f"status JSON contains {platform}:{status}", actual.get(platform) == status, results)

for label in ("Public beta", "Development", "Technical preview", "Planned"):
    require(f"README contains status {label}", label in readme, results)
    require(f"release notes contain status {label}", label in release_notes, results)

require("README identifies Linux Bazzite as primary", "Linux / Bazzite | **Elsődleges platform**" in readme, results)
require("README identifies Windows as secondary", "Windows | **Másodlagosan támogatott**" in readme, results)
require("release notes identify Linux Bazzite as primary", "Linux / Bazzite | **Primary platform**" in release_notes, results)
require("release notes identify Windows as secondary", "Windows | **Secondary supported**" in release_notes, results)
require("website status prioritizes Linux Bazzite", "Linux/Bazzite elsődleges platform" in status_js and "Windows másodlagosan támogatott" in status_js, results)
require("website displays canonical support role", "support_role_labels" in status_js and "dataset.supportRole" in status_js, results)

require("download page renders canonical status module", "platform-status.js" in downloads and "data-platform-status-root" in downloads, results)
require("main loader includes platform status", "platform-status.js?v=20260730-platform-status-1" in loader, results)
require("loader version is v24", "safe-ready-v24" in loader and "safe-degraded-v24" in loader, results)
require("loader includes unified Organism voice v4", "organism-voice.js?v=20260730-organism-voice-4" in loader, results)
require("loader includes Synaptic Thought Genome", "synaptic-thought-genome.js?v=20260731-thought-genome-1" in loader, results)
require("loader orders voice before Thought Genome", loader.index("organism-voice.js") < loader.index("synaptic-thought-genome.js"), results)
require("loader orders Thought Genome before 3D host", loader.index("synaptic-thought-genome.js") < loader.index("formatx-three-host-safe.js"), results)
require("loader has no obsolete Natural Voice module", "organism-natural-voice" not in loader, results)
require("loader includes dock v2", "organism-voice-dock.css?v=20260730-organism-dock-2" in loader, results)
require("dock reserves desktop dialogue lane", "right: 430px !important" in voice_dock, results)
require("dock protects 21:9 and 32:9", "min-aspect-ratio: 21/9" in voice_dock and "right: 440px !important" in voice_dock, results)
require("dock hides map while dialogue is open", "#hero .fx-organism-map" in voice_dock and "visibility: hidden !important" in voice_dock, results)
require("compact desktop hides stage while dialogue is open", "min-width: 901px" in voice_dock and "max-width: 1199px" in voice_dock, results)
require("platform status renderer uses canonical JSON", "data/platform-status.json" in status_js, results)
require("platform status uses readable 12px badges", "font-size: 12px" in status_css, results)
require("hero CTA is redirected to status-aware downloads", "downloads/" in status_js and "hero-download" in status_js, results)
require("checkout receives Public beta notice", "fx-checkout-product-state" in status_js, results)

require("intro uses full desktop and mobile timeline", "MOBILE_QUERY.matches ? 2100 : 2400" in intro, results)
require("intro keeps deterministic hard deadline", "TIMELINE_DURATION + EXIT_DURATION + 1100" in intro, results)
require("intro is not suppressed by local storage", "formatx-intro-seen-v1" not in intro and "seenBefore()" not in intro and "markSeen()" not in intro, results)
require("intro runs on normal page load", "DOMContentLoaded', startIntro" in intro, results)
require("bfcache restores intro", "if (event.persisted) startIntro();" in intro, results)
require("intro remains skippable", "fx-intro-skip" in intro and "beginExit" in intro, results)

require("voice remains local", all(token not in voice for token in ("fetch(", "XMLHttpRequest", "WebSocket")), results)
require("voice remains switchable", "fx-organism-master-toggle" in voice and "let speechEnabled = false" in voice, results)
require("voice uses one ready marker", "ready-v3" in voice and "adaptive-v3" in voice, results)
require("voice ranks natural and system engines", "function voiceScore(voice)" in voice and "natural" in voice and "neural" in voice and "browser-default" in voice, results)
require("voice uses sentence chunks", "function splitSpeech(text)" in voice and "function pauseAfter(chunk)" in voice, results)
require("voice uses natural language prosody", "function prosody(chunk, index, count)" in voice and "0.98" in voice and "0.94" in voice, results)
require("voice resumes browser speech", "synth.resume()" in voice, results)
require("voice has start watchdog", "speechWatchdog = window.setTimeout" in voice, results)
require("voice exposes selected quality", "fxOrganismVoiceQuality" in voice and "voiceInfo()" in voice, results)
require("voice remains off by default", "let speechEnabled = false" in voice, results)

require("Thought Genome remains local", all(token not in thought_genome for token in ("fetch(", "XMLHttpRequest", "WebSocket")), results)
require("Thought Genome stores fingerprints only", "questionStored: false" in thought_genome and "fingerprint-only" in thought_genome, results)
require("Thought Genome has twelve-node local memory", "MAX_HISTORY = 12" in thought_genome and "slice(-MAX_HISTORY)" in thought_genome, results)
require("Thought Genome exposes master toggle", "fx-thought-genome-toggle" in thought_genome and "ENABLED_KEY" in thought_genome, results)
require("Thought Genome exposes manual shape control", "fx-thought-genome-form" in thought_genome and "FORMS = ['auto', 0, 1, 2, 3, 4, 5]" in thought_genome, results)
require("Thought Genome can replay and clear", "function replay()" in thought_genome and "function clearHistory()" in thought_genome, results)
require("Thought Genome layer never intercepts input", "pointer-events: none" in thought_genome_css, results)
require("Thought Genome supports reduced motion", "prefers-reduced-motion: reduce" in thought_genome_css, results)
require("Thought Genome controls remain compact", "min-height: 32px" in thought_genome_css and "font-size: 8px" in thought_genome_css, results)

require("mobile entry imports Morphing Organism V3", "mobile-core-engine-v3.js?v=20260731-morphing-organism-v3" in mobile_entry, results)
require("mobile entry locks V3 telemetry", "three-webgl-morphing-organism-v3" in mobile_entry and "synaptic-thought-genome-v1" in mobile_entry, results)
require("Morphing Organism wraps stable V2 core", "startLivingCoreV2" in morph_engine and "mobile-core-engine-v2.js" in morph_engine, results)
require("Morphing Organism exposes six forms", all(token in morph_engine for token in ("coreForm", "neuralForm", "organForm", "heartForm", "skeletonForm", "beaconForm")), results)
require("Morphing Organism uses continuous shader morph", "uFormA" in morph_engine and "uFormB" in morph_engine and "uMorph" in morph_engine, results)
require("Morphing Organism has six synapses", "for (let index = 0; index < 6; index += 1)" in morph_engine, results)
require("Morphing Organism has local 3D constellation", "buildConstellation" in morph_engine and "updateConstellation" in morph_engine, results)
require("Morphing Organism listens to Thought Genome", "formatx:thoughtgenome" in morph_engine and "formatx:organismshape" in morph_engine, results)

require("support has private email route", "mailto:hutoczky@gmail.com" in support, results)
require("support is not GitHub-only", "GitHub hibajegy nem az egyetlen út" in support, results)
require("terms include withdrawal", "Elállás és azonnali digitális teljesítés" in terms, results)
require("terms include refund", "Refund és hibás teljesítés" in terms, results)
require("terms include complaint handling", "30 napon belül" in terms, results)
require("privacy identifies controller", "Hutóczky József" in privacy, results)
require("privacy lists processors", "Cloudflare" in privacy and "GitHub" in privacy and "QuickChart" in privacy and "Google / Gmail" in privacy, results)
require("privacy lists retention periods", "8 év" in privacy and "3 év" in privacy and "30 nap" in privacy, results)
require("public test matrix exists", "Nyilvános tesztmátrix" in test_matrix and "Ismert korlátozás" in test_matrix, results)
require("test matrix does not claim Stable", "· Stable" not in test_matrix, results)

for worker_source, label in ((root_worker, "preview Worker"), (production_entry, "production Worker")):
    require(f"{label} serves platform JSON", "platform-status.json" in worker_source, results)
    require(f"{label} serves platform JS", "platform-status.js" in worker_source, results)
    require(f"{label} serves platform CSS", "platform-status.css" in worker_source, results)
    require(f"{label} serves Organism dock CSS", "organism-voice-dock.css" in worker_source, results)
    require(f"{label} serves unified Organism voice", "organism-voice.js" in worker_source, results)
    require(f"{label} serves Thought Genome JS", "synaptic-thought-genome.js" in worker_source, results)
    require(f"{label} serves Thought Genome CSS", "synaptic-thought-genome.css" in worker_source, results)
    require(f"{label} serves Morphing Organism V3", "mobile-core-engine-v3.js" in worker_source, results)
    require(f"{label} has no obsolete Natural Voice route", "organism-natural-voice" not in worker_source, results)
    require(f"{label} rewrites restored intro cache version", "20260731-intro-restored-1" in worker_source, results)

require("preview routing includes download centre", "/scifi-ui/downloads/index.html" in preview_config, results)
require("preview routing includes platform status assets", "/scifi-ui/data/platform-status.json" in preview_config and "/scifi-ui/scripts/platform-status.js" in preview_config, results)
require("preview routing includes Organism dock CSS", "/scifi-ui/styles/organism-voice-dock.css" in preview_config, results)
require("preview routing includes unified Organism voice", "/scifi-ui/scripts/organism-voice.js" in preview_config, results)
require("preview routing includes Thought Genome assets", "/scifi-ui/scripts/synaptic-thought-genome.js" in preview_config and "/scifi-ui/styles/synaptic-thought-genome.css" in preview_config, results)
require("preview routing includes Morphing Organism V3", "/scifi-ui/scripts/mobile-core-engine-v3.js" in preview_config, results)
require("preview routing has no obsolete Natural Voice route", "organism-natural-voice" not in preview_config, results)
require("home still contains public pricing", "15 900 Ft / hó" in home and "29 900 Ft / hó" in home, results)

report = "\n".join(("PASS " if ok else "FAIL ") + label for label, ok in results) + "\n"
Path("webgpu-source-architecture-report.txt").write_text(report, encoding="utf-8")
print(report, end="")
failed = [label for label, ok in results if not ok]
if failed:
    raise SystemExit("FormatX production architecture validation failed: " + "; ".join(failed))

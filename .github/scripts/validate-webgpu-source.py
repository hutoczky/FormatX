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
require("loader version is v19", "safe-ready-v19" in loader and "safe-degraded-v19" in loader, results)
require("platform status renderer uses canonical JSON", "data/platform-status.json" in status_js, results)
require("platform status uses readable 12px badges", "font-size: 12px" in status_css, results)
require("hero CTA is redirected to status-aware downloads", "downloads/" in status_js and "hero-download" in status_js, results)
require("checkout receives Public beta notice", "fx-checkout-product-state" in status_js, results)

require("intro maximum deadline is 700ms", "const HARD_DEADLINE = 700" in intro, results)
require("intro timeline is 560ms", "const TIMELINE_DURATION = REDUCE_QUERY.matches ? 1 : 560" in intro, results)
require("intro is first-visit only", "formatx-intro-seen-v1" in intro and "seenBefore()" in intro and "markSeen()" in intro, results)
require("bfcache does not replay intro", "bfcache-restore" in intro and "startIntro();" not in intro.split("addEventListener('pageshow'", 1)[1], results)

require("voice remains local", all(token not in voice for token in ("fetch(", "XMLHttpRequest", "WebSocket")), results)
require("voice remains switchable", "fx-organism-master-toggle" in voice and "let speechEnabled = false" in voice, results)

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
    require(f"{label} rewrites intro cache version", "20260730-first-visit-1" in worker_source, results)

require("preview routing includes download centre", "/scifi-ui/downloads/index.html" in preview_config, results)
require("preview routing includes platform status assets", "/scifi-ui/data/platform-status.json" in preview_config and "/scifi-ui/scripts/platform-status.js" in preview_config, results)
require("home still contains public pricing", "15 900 Ft / hó" in home and "29 900 Ft / hó" in home, results)

report = "\n".join(("PASS " if ok else "FAIL ") + label for label, ok in results) + "\n"
Path("webgpu-source-architecture-report.txt").write_text(report, encoding="utf-8")
print(report, end="")
failed = [label for label, ok in results if not ok]
if failed:
    raise SystemExit("FormatX production architecture validation failed: " + "; ".join(failed))

from pathlib import Path


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


home = read("docs/scifi-ui/index.html")
loader = read("docs/scifi-ui/scripts/igloo-parity.js")
intro = read("docs/scifi-ui/scripts/formatx-event-horizon.js")
voice = read("docs/scifi-ui/scripts/organism-voice.js")
voice_css = read("docs/scifi-ui/styles/organism-voice.css")
dock_css = read("docs/scifi-ui/styles/organism-voice-dock.css")
interaction = read("docs/scifi-ui/scripts/organism-core-interaction.js")
interaction_css = read("docs/scifi-ui/styles/organism-core-interaction.css")
speaking_css = read("docs/scifi-ui/styles/organism-speaking-visual.css")
core_controller = read("docs/scifi-ui/scripts/organism-core-controller.js")
infinite = read("docs/scifi-ui/scripts/formatx-infinite-scroll.js")
safe_host = read("docs/scifi-ui/scripts/formatx-three-host-safe.js")
gate = read("docs/scifi-ui/scripts/formatx-mobile-recovery.js")
living = read("docs/scifi-ui/scripts/living-architecture.js")
engine = read("docs/scifi-ui/scripts/mobile-core-engine-v2.js")
entry = read("docs/scifi-ui/scripts/mobile-webgl-entry.js")
stage = read("docs/scifi-ui/three-stage-mobile.html")
stability_css = read("docs/scifi-ui/styles/formatx-site-stability.css")
static_headers = read("docs/scifi-ui/_headers")
legacy_webgpu = read("docs/scifi-ui/scripts/ExperienceWebGPU.js")
root_worker = read("worker.js")
production_worker = read("billing-worker/src/production-with-license.js")
production_entry = read("billing-worker/src/production-entry.js")
preview_config = read("wrangler.jsonc")

checks: list[tuple[str, bool]] = []


def require(label: str, condition: bool) -> None:
    checks.append((label, bool(condition)))


def require_tokens(label: str, source: str, tokens: tuple[str, ...]) -> None:
    for token in tokens:
        require(f"{label}: {token}", token in source)


require("home: Business Pro price", "15 900 Ft / hó" in home)
require("home: Technician Team price", "29 900 Ft / hó" in home)
require("intro: deterministic timeline", "TIMELINE_DURATION" in intro and "HARD_DEADLINE" in intro)
require("intro: does not wait for window load", "loadOrDeadline" not in intro)

require_tokens("loader", loader, (
    "safe-ready-v15",
    "organism-core-controller.js?v=20260729-core-ui-2",
    "organism-voice.js?v=20260730-organism-voice-2",
    "organism-core-interaction.js?v=20260730-core-interaction-1",
    "organism-speaking-visual.css?v=20260730-speaking-visual-1",
    "formatx-infinite-scroll.js?v=20260729-infinite-boundary-v3",
    "formatx-three-host-safe.js",
    "load(index + 1)",
))
queue = loader.split("const queue =", 1)[1].split("];", 1)[0]
require("loader order: core before voice", queue.index("organism-core-controller.js") < queue.index("organism-voice.js"))
require("loader order: voice before MAG interaction", queue.index("organism-voice.js") < queue.index("organism-core-interaction.js"))
require("loader order: MAG interaction before infinite scroll", queue.index("organism-core-interaction.js") < queue.index("formatx-infinite-scroll.js"))
require("loader: no legacy infinite controller", "formatx-infinite-loop-controller-v2.js" not in loader)
require("loader: WebGL adapter remains lazy", "interaction-genome-webgl-adapter.js" not in queue)

require_tokens("voice", voice, (
    "ready-v2",
    "SpeechSynthesisUtterance",
    "formatx-organism-dialogue-enabled",
    "function setEnabled(next, openAfterEnable)",
    "function setOpen(next, focusInput)",
    "setOpen(false, false)",
    "localOnly: true",
    "fx-organism-master-toggle",
    "fx-organism-voice-toggle",
    "ROOT.dataset.fxOrganismSpeech = 'speaking'",
    "ROOT.dataset.fxOrganismSpeech = 'idle'",
))
require("voice: off by default", "let speechEnabled = false" in voice)
require("voice: no automatic intro opening", "formatx:introcomplete" not in voice)
require("voice: no network request", all(token not in voice for token in ("fetch(", "XMLHttpRequest", "WebSocket")))
require("voice: local enabled state", "localStorage.setItem" in voice and "localStorage.getItem" in voice)
require("voice CSS: hidden panel protected", ".fx-organism-thought[hidden]" in voice_css)
require("voice CSS: readable response", "font-size: 14.5px" in voice_css and "line-height: 1.68" in voice_css)
require("voice CSS: menus cannot be covered", "html.fx-organism-menu-open .fx-organism-dialogue" in voice_css)
require("voice dock: compact control", "min-width: 92px" in dock_css and "height: 44px" in dock_css)

require_tokens("MAG interaction", interaction, (
    "ready-v1",
    "MAX_TAP_TRAVEL",
    "MAX_TAP_DURATION",
    "[data-organ-node=\"0\"]",
    "[data-scene-link=\"0\"]",
    "formatx:organismcoreactivate",
    "pointerdown",
    "pointerup",
))
require("MAG interaction: drag does not activate", "active.moved" in interaction and "travel > MAX_TAP_TRAVEL" in interaction)
require("MAG interaction CSS: closed hitbox is compact", ".fx-organism-dialogue:not(.is-open)" in interaction_css and "width: 58px" in interaction_css)
require("MAG interaction CSS: controls remain clickable", "pointer-events: auto" in interaction_css)

require_tokens("speaking visual", speaking_css, (
    "html[data-fx-organism-speech='speaking'] .fx-three-stage-shell #fx-three-frame",
    "fx-core-speaking-light",
    "fx-core-speaking-ring",
    "pointer-events: none",
    "prefers-reduced-motion",
))
require("speaking visual: desktop core placement", "left: 58%" in speaking_css and "top: 47%" in speaking_css)
require("speaking visual: mobile core placement", "left: 50%" in speaking_css and "top: 43%" in speaking_css)

require_tokens("infinite scroll", infinite, (
    "boundary-v3",
    "ready-v3",
    "clonedContent: false",
    "reinitialisedRenderer: false",
    "nestedScrollerCanConsume",
))
require("infinite scroll: no DOM clone", "cloneNode" not in infinite)
require("infinite scroll: touch is not click", "addEventListener('click'" not in infinite)
require("core reset after loop", "addEventListener('formatx:loop'" in core_controller)
require("instant loop handoff CSS", "html.fx-infinite-loop-jump" in stability_css)

require_tokens("living gate", gate, (
    "ready-v2",
    "about:blank",
    "formatx:introcomplete",
    "three-stage-mobile.html",
))
require("living architecture starts after intro", "scheduleThreeExperience()" in living)
require_tokens("safe host", safe_host, (
    "Float32Array",
    "__FORMATX_3D_STATE__",
    "frame.src = 'about:blank'",
    "formatx:coreclick",
))
require("safe host does not block scroll", "preventDefault()" not in safe_host)
require_tokens("living engine", engine, (
    "THREE.WebGLRenderer",
    "THREE.ShaderMaterial",
    "class LivingCoreEngine",
    "SphereGeometry(1.28, 96, 72)",
    "const count = 220",
    "emissiveIntensity: 2.45",
))
require("living entry imports engine", "mobile-core-engine-v2.js" in entry)
require("living stage uses module entry", 'type="module"' in stage)

require_tokens("preview Worker", root_worker, (
    "organism-voice.js",
    "organism-core-interaction.js",
    "organism-speaking-visual.css",
    "Cache-Control', 'no-store",
))
require_tokens("production entry", production_entry, (
    "organism-voice.js",
    "organism-core-interaction.js",
    "organism-speaking-visual.css",
    "withEmbeddableStageHeaders",
    "headers.set('X-Frame-Options', 'SAMEORIGIN')",
))
require_tokens("preview routes", preview_config, (
    "/scifi-ui/scripts/organism-core-interaction.js",
    "/scifi-ui/styles/organism-core-interaction.css",
    "/scifi-ui/styles/organism-speaking-visual.css",
))
require_tokens("production security", production_worker, (
    "THREE_STAGE_CONTENT_SECURITY_POLICY",
    "isThreeStage ? 'SAMEORIGIN' : 'DENY'",
    '"frame-ancestors \'self\'"',
))
require("static headers have no global X-Frame-Options", "X-Frame-Options" not in static_headers)
require("experimental WebGPU source retained", "THREE.WebGPURenderer" in legacy_webgpu and "renderer.compute" in legacy_webgpu)

report = "\n".join(("PASS " if ok else "FAIL ") + label for label, ok in checks) + "\n"
Path("webgpu-source-architecture-report.txt").write_text(report, encoding="utf-8")
print(report, end="")

failed = [label for label, ok in checks if not ok]
if failed:
    raise SystemExit("FormatX production architecture validation failed: " + "; ".join(failed))

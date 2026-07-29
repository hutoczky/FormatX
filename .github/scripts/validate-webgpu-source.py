from pathlib import Path


def text(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


home = text("docs/scifi-ui/index.html")
apex = text("docs/scifi-ui/scripts/formatx-apex.js")
loader = text("docs/scifi-ui/scripts/igloo-parity.js")
infinite = text("docs/scifi-ui/scripts/formatx-infinite-scroll.js")
core_controller = text("docs/scifi-ui/scripts/organism-core-controller.js")
safe_host = text("docs/scifi-ui/scripts/formatx-three-host-safe.js")
gate = text("docs/scifi-ui/scripts/formatx-mobile-recovery.js")
living = text("docs/scifi-ui/scripts/living-architecture.js")
living_engine = text("docs/scifi-ui/scripts/mobile-core-engine-v2.js")
mobile_entry = text("docs/scifi-ui/scripts/mobile-webgl-entry.js")
mobile_stage = text("docs/scifi-ui/three-stage-mobile.html")
legacy_webgpu = text("docs/scifi-ui/scripts/ExperienceWebGPU.js")
css = text("docs/scifi-ui/styles/formatx-three-host.css")
safe_css = text("docs/scifi-ui/styles/formatx-mobile-recovery.css")
stability_css = text("docs/scifi-ui/styles/formatx-site-stability.css")
intro = text("docs/scifi-ui/scripts/formatx-event-horizon.js")
static_headers = text("docs/scifi-ui/_headers")
root_worker = text("worker.js")
production_worker = text("billing-worker/src/production-with-license.js")
production_entry = text("billing-worker/src/production-entry.js")

results: list[tuple[str, bool]] = []


def require(label: str, condition: bool) -> None:
    results.append((label, bool(condition)))


def tokens(prefix: str, source: str, required: tuple[str, ...]) -> None:
    for token in required:
        require(f"{prefix}: {token}", token in source)


require("home: one formatx-apex stylesheet", home.count("formatx-apex.css?v=20260726-apex-2") == 1)
require("home: one formatx-apex controller", home.count("formatx-apex.js?v=20260726-apex-2") == 1)
tokens("home", home, ('id="fx-apex-canvas"', 'id="fx-particle-canvas"', 'data-flow="3"'))
require("home: Business Pro price", "15 900 Ft / hó" in home)
require("home: Technician Team price", "29 900 Ft / hó" in home)

require("intro: deterministic timeline", "TIMELINE_DURATION" in intro)
require("intro: hard deadline", "HARD_DEADLINE" in intro)
require("intro: no window load wait", "loadOrDeadline" not in intro)
require("intro: no animation promise wait", "Promise.all(animations)" not in intro)

# Production uses one direct WebGL stage after the intro. The experimental
# WebGPU engine remains in the repository but is not started by the live loader.
tokens("safe loader", loader, (
    "single-language-toggle.js",
    "formatx-copy-polish.js",
    "formatx-license-links.js",
    "organism-console-state.js",
    "organism-core-controller.js?v=20260729-core-ui-2",
    "formatx-infinite-scroll.js?v=20260729-infinite-boundary-v3",
    "formatx-three-host-safe.js",
    "formatx-living-core-launcher.js",
    "interaction-genome.js",
    "safe-ready-v12",
    "load(index + 1)",
))
require("safe loader: no global event bridge", "formatx-transcend-bridge.js" not in loader)
require("safe loader: no legacy frame bootstrap", "formatx-three-frame-bootstrap.js" not in loader)
require("safe loader: no legacy professional refinement", "formatx-professional-refinement.js" not in loader)
require("safe loader: no legacy infinite loop", "formatx-infinite-loop-controller-v2.js" not in loader)
require("safe loader: no old infinite fix", "formatx-infinite-loop-fix.js" not in loader)
require("safe loader: no WebGPU nextgen controls", "formatx-nextgen-controls.js" not in loader)
require("Genome WebGL lazy click trigger", ".fx-genome-launcher" in loader)
require("Genome WebGL lazy adapter request", "requestGenomeWebgl" in loader)
require("Genome WebGL adapter not in startup queue", "interaction-genome-webgl-adapter.js" not in loader.split("const queue =", 1)[1].split("];", 1)[0])

# Infinite scrolling is boundary based and reuses the existing renderer.
tokens("infinite scroll", infinite, (
    "boundary-v3",
    "ready-v3",
    "clonedContent: false",
    "reinitialisedRenderer: false",
    "addEventListener('scroll', onScroll, { passive: true })",
    "addEventListener('wheel', onWheel, { capture: true, passive: false })",
    "nestedScrollerCanConsume",
    "fx-infinite-loop-jump",
))
require("infinite scroll: no DOM clone", "cloneNode" not in infinite)
require("infinite scroll: no loop bridge", "data-fx-loop-bridge" not in infinite)
require("infinite scroll: touch is not a click", "addEventListener('click'" not in infinite)
require("infinite scroll: projected wheel handoff", "loopToCore('wheel', projected)" in infinite)
require("infinite scroll: core state reset", "addEventListener('formatx:loop'" in core_controller)
require("infinite scroll: instant CSS handoff", "html.fx-infinite-loop-jump" in stability_css)

require("living architecture waits for intro", "scheduleThreeExperience()" in living)
require("living architecture has one loader start", "threeLoadStarted" in living)
require("living architecture does not eagerly inject Genome WebGL", "data-fx-genome-webgl-adapter" not in living)

tokens("living core gate", gate, (
    "fxSafeThreeGate",
    "ready-v2",
    "about:blank",
    "formatx:introcomplete",
    "three-stage-mobile.html",
    "20260729-living-stage-v2",
))
require("living core gate: no automatic retry loop", "frame.src = expectedUrl(attempts)" not in gate)

tokens("safe host", safe_host, (
    "Float32Array",
    "__FORMATX_3D_STATE__",
    "frame.src = 'about:blank'",
    "touch",
    "formatx:coreclick",
))
require("safe host: no scroll preventDefault", "preventDefault()" not in safe_host)
require("safe host: no infinite hero clone", "cloneNode" not in safe_host)

require("living stage: direct module entry", 'type="module"' in mobile_stage)
require("living stage: v2 entry", "mobile-webgl-entry.js?v=20260729-living-entry-v2" in mobile_stage)
require("living entry imports v2 engine", "mobile-core-engine-v2.js?v=20260729-living-core-v2" in mobile_entry)
tokens("visible living organism engine", living_engine, (
    "THREE.WebGLRenderer",
    "THREE.ShaderMaterial",
    "class LivingCoreEngine",
    "SphereGeometry(1.28, 96, 72)",
    "three-webgl-living-core-v2",
    "visible-organic-living-core-v2",
    "requestAnimationFrame",
))
require("living engine: reduced particles", "const count = 220" in living_engine)
require("living engine: desktop right placement", "this.baseWorldX = desktop ? 1.05 : 0" in living_engine)
require("living engine: bright emissive core", "emissiveIntensity: 2.45" in living_engine)

# Experimental WebGPU source is retained for later controlled reintroduction.
tokens("experimental WebGPU source retained", legacy_webgpu, (
    "THREE.WebGPURenderer",
    "renderer.compute",
    "WebXRDirector",
))

require("living CSS exposes v2 stage", 'data-fx-safe-three-gate="ready-v2"' in safe_css)
require("living CSS raises stage above legacy canvas", "z-index: 1 !important" in safe_css)
require("living CSS hides legacy apex canvas", "#fx-apex-canvas" in safe_css and "display: none !important" in safe_css)
tokens("Three host CSS", css, ("fx-three-stage-shell", "fx-three-engine-ready"))
require("apex: no renderer ownership", "createRenderer" not in apex)
require("apex: no WebGL context ownership", "getContext('webgl2'" not in apex)
require("static headers: no global X-Frame-Options", "X-Frame-Options" not in static_headers)

tokens("root worker living delivery", root_worker, (
    "20260729-living-core-gate-v2",
    "20260729-living-core-css-v3",
    "mobile-core-engine-v2.js",
    "formatx-infinite-scroll.js",
    "formatx-license-links.js",
    "Cache-Control', 'no-store",
))
tokens("production worker security retained", production_worker, (
    "THREE_STAGE_CONTENT_SECURITY_POLICY",
    "isThreeStage ? 'SAMEORIGIN' : 'DENY'",
    '"frame-ancestors \'self\'"',
))
tokens("production entry living stage framing", production_entry, (
    "EMBEDDABLE_STAGE_PATHS",
    "/scifi-ui/three-stage-mobile.html",
    "withEmbeddableStageHeaders",
    "headers.set('X-Frame-Options', 'SAMEORIGIN')",
    '"frame-ancestors \'self\'"',
    "mobile-core-engine-v2.js",
    "formatx-infinite-scroll.js",
    "formatx-license-links.js",
    "20260729-living-core-gate-v2",
    "20260729-living-core-css-v3",
))

report = "\n".join(("PASS " if passed else "FAIL ") + label for label, passed in results) + "\n"
Path("webgpu-source-architecture-report.txt").write_text(report, encoding="utf-8")
print(report, end="")

failed = [label for label, passed in results if not passed]
if failed:
    raise SystemExit("Production 3D source architecture validation failed: " + "; ".join(failed))

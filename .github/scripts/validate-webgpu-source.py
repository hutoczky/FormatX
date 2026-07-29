from pathlib import Path


def text(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


home = text("docs/scifi-ui/index.html")
apex = text("docs/scifi-ui/scripts/formatx-apex.js")
loader = text("docs/scifi-ui/scripts/igloo-parity.js")
safe_host = text("docs/scifi-ui/scripts/formatx-three-host-safe.js")
gate = text("docs/scifi-ui/scripts/formatx-mobile-recovery.js")
living = text("docs/scifi-ui/scripts/living-architecture.js")
mobile_engine = text("docs/scifi-ui/scripts/mobile-core-engine.js")
mobile_entry = text("docs/scifi-ui/scripts/mobile-webgl-entry.js")
mobile_stage = text("docs/scifi-ui/three-stage-mobile.html")
legacy_webgpu = text("docs/scifi-ui/scripts/ExperienceWebGPU.js")
css = text("docs/scifi-ui/styles/formatx-three-host.css")
safe_css = text("docs/scifi-ui/styles/formatx-mobile-recovery.css")
intro = text("docs/scifi-ui/scripts/formatx-event-horizon.js")
static_headers = text("docs/scifi-ui/_headers")
root_worker = text("worker.js")
production_worker = text("billing-worker/src/production-with-license.js")

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
# WebGPU engine remains in the repository but must not be started by the live loader.
tokens("safe loader", loader, (
    "formatx-three-host-safe.js",
    "formatx-living-core-launcher.js",
    "interaction-genome.js",
    "load(index + 1)",
))
require("safe loader: no global event bridge", "formatx-transcend-bridge.js" not in loader)
require("safe loader: no legacy frame bootstrap", "formatx-three-frame-bootstrap.js" not in loader)
require("safe loader: no legacy professional refinement", "formatx-professional-refinement.js" not in loader)
require("safe loader: no duplicate infinite loop", "formatx-infinite-loop-controller-v2.js" not in loader)
require("safe loader: no WebGPU nextgen controls", "formatx-nextgen-controls.js" not in loader)
require("Genome WebGL lazy click trigger", ".fx-genome-launcher" in loader)
require("Genome WebGL lazy adapter request", "requestGenomeWebgl" in loader)
require("Genome WebGL adapter not in startup queue", "interaction-genome-webgl-adapter.js" not in loader.split("const queue =", 1)[1].split("];", 1)[0])

require("living architecture waits for intro", "scheduleThreeExperience()" in living)
require("living architecture has one loader start", "threeLoadStarted" in living)
require("living architecture uses safe loader version", "20260729-safe-loader-3" in living)
require("living architecture does not eagerly inject Genome WebGL", "data-fx-genome-webgl-adapter" not in living)

tokens("safe 3D gate", gate, (
    "fxSafeThreeGate",
    "about:blank",
    "formatx:introcomplete",
    "three-stage-mobile.html",
    "Do not reload the frame automatically",
))
require("safe gate: no automatic retry loop", "frame.src = expectedUrl(attempts)" not in gate)

tokens("safe host", safe_host, (
    "Float32Array",
    "__FORMATX_3D_STATE__",
    "frame.src = 'about:blank'",
    "touch",
    "formatx:coreclick",
))
require("safe host: no scroll preventDefault", "preventDefault()" not in safe_host)
require("safe host: no infinite hero clone", "cloneNode" not in safe_host)

require("mobile stage: direct module entry", 'type="module"' in mobile_stage)
require("mobile stage: direct engine entry", "mobile-webgl-entry.js?v=20260729-direct-mobile-entry-1" in mobile_stage)
require("mobile entry imports engine", "mobile-core-engine.js" in mobile_entry)
tokens("direct WebGL engine", mobile_engine, (
    "THREE.WebGLRenderer",
    "THREE.ShaderMaterial",
    "class MobileCoreEngine",
    "root.dataset.fxThree = 'ready'",
    "requestAnimationFrame",
))

# The experimental source remains available for later controlled reintroduction,
# but it is not part of the live startup path.
tokens("experimental WebGPU source retained", legacy_webgpu, (
    "THREE.WebGPURenderer",
    "renderer.compute",
    "WebXRDirector",
))

require("safe CSS exposes stage on all devices", 'data-fx-safe-three-gate="ready-v1"' in safe_css)
tokens("Three host CSS", css, ("fx-three-stage-shell", "fx-three-engine-ready"))
require("apex: no renderer ownership", "createRenderer" not in apex)
require("apex: no WebGL context ownership", "getContext('webgl2'" not in apex)
require("static headers: no global X-Frame-Options", "X-Frame-Options" not in static_headers)

tokens("root worker safe delivery", root_worker, (
    "20260729-safe-three-gate-1",
    "20260729-safe-three-css-1",
    "20260729-safe-three-start-2",
    "Cache-Control', 'no-store",
))
tokens("production worker security retained", production_worker, (
    "THREE_STAGE_CONTENT_SECURITY_POLICY",
    "isThreeStage ? 'SAMEORIGIN' : 'DENY'",
    '"frame-ancestors \'self\'"',
))

report = "\n".join(("PASS " if passed else "FAIL ") + label for label, passed in results) + "\n"
Path("webgpu-source-architecture-report.txt").write_text(report, encoding="utf-8")
print(report, end="")

failed = [label for label, passed in results if not passed]
if failed:
    raise SystemExit("Production 3D source architecture validation failed: " + "; ".join(failed))

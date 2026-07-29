from pathlib import Path


def text(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


home = text("docs/scifi-ui/index.html")
apex = text("docs/scifi-ui/scripts/formatx-apex.js")
loader = text("docs/scifi-ui/scripts/igloo-parity.js")
host = text("docs/scifi-ui/scripts/formatx-three-host.js")
bootstrap = text("docs/scifi-ui/scripts/formatx-three-frame-bootstrap.js")
webgl_engine = text("docs/scifi-ui/scripts/Experience.js")
webgpu_engine = text("docs/scifi-ui/scripts/ExperienceWebGPU.js")
xr = text("docs/scifi-ui/scripts/WebXRDirector.js")
controls = text("docs/scifi-ui/scripts/formatx-nextgen-controls.js")
entry = text("docs/scifi-ui/scripts/experience-entry.js")
stage = text("docs/scifi-ui/three-stage.html")
css = text("docs/scifi-ui/styles/formatx-three-host.css")
nextgen_css = text("docs/scifi-ui/styles/formatx-nextgen-controls.css")
intro = text("docs/scifi-ui/scripts/formatx-event-horizon.js")
static_headers = text("docs/scifi-ui/_headers")
worker = text("billing-worker/src/production-with-license.js")

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


tokens("loader", loader, (
    "formatx-three-host.js",
    "formatx-nextgen-controls.js",
    "formatx-three-frame-bootstrap.js",
    "formatx-transcend-bridge.js",
))
tokens("WebGL engine", webgl_engine, (
    "THREE.WebGLRenderer",
    "THREE.PerspectiveCamera",
    "CatmullRomCurve3",
    "QualityGovernor",
))
tokens("WebGPU engine", webgpu_engine, (
    "THREE.WebGPURenderer",
    "MeshBasicNodeMaterial",
    "instancedArray",
    "renderer.compute",
    "500000",
    "fragmentNode",
    "WebXRDirector",
    "setAnimationLoop",
))
tokens("WebXR director", xr, (
    "renderer.xr.enabled = true",
    "requestSession(mode",
    "immersive-ar",
    "immersive-vr",
    "renderer.xr.setSession",
))
tokens("next-generation controls", controls, (
    "AudioContext",
    "createOscillator",
    "createBiquadFilter",
    "scheduleBeat",
    "VELOCITY",
    "formatx:xrstate",
))
tokens("Three host", host, (
    "Float32Array",
    "__FORMATX_3D_STATE__",
    "fx-three-loop-bridge",
    "formatx:loop",
))
tokens("frame bootstrap", bootstrap, (
    "three-stage.html",
    "20260727-webgpu-1",
    "THREE / FRAME ERROR",
    "formatx:threeready",
))
require("Three stage: module entry", 'type="module"' in stage)
require("Three stage: versioned experience entry", "experience-entry.js?v=" in stage)
tokens("experience entry", entry, (
    "ExperienceWebGPU.js",
    "'gpu' in navigator",
    "startWebGLExperience",
    "fxWebgpu",
))
tokens("Three host CSS", css, ("fx-three-stage-shell", "fx-three-sound", "fx-three-loop-bridge"))
tokens("next-generation controls CSS", nextgen_css, ("fx-nextgen-xr", "data-fx-webgpu"))

require("apex: no renderer ownership", "createRenderer" not in apex)
require("apex: no WebGL context ownership", "getContext('webgl2'" not in apex)
require("loader: no legacy transcend-lite", "formatx-transcend-lite.js" not in loader)
require("loader: no worldstage enhancements", "worldstage-enhancements.js" not in loader)
require("static headers: no global X-Frame-Options", "X-Frame-Options" not in static_headers)
tokens("worker", worker, (
    "THREE_STAGE_CONTENT_SECURITY_POLICY",
    "isThreeStage ? 'SAMEORIGIN' : 'DENY'",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    '"frame-ancestors \'self\'"',
))

report = "\n".join(("PASS " if passed else "FAIL ") + label for label, passed in results) + "\n"
Path("webgpu-source-architecture-report.txt").write_text(report, encoding="utf-8")
print(report, end="")

failed = [label for label, passed in results if not passed]
if failed:
    raise SystemExit("WebGPU source architecture validation failed: " + "; ".join(failed))

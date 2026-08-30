'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repository = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(repository, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(repository, relative));
const has = (source, tokens, label) => {
  for (const token of tokens) assert.ok(source.includes(token), `missing ${label}: ${token}`);
};

const home = read('docs/scifi-ui/index.html');
const renderer = read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const solidGlass = read('docs/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js');
const directLoader = read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const motionLoader = read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const nativeTouch = read('docs/scifi-ui/scripts/formatx-native-mag-touch-r434.js');
const miniAssistant = read('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js');
const miniStyle = read('docs/scifi-ui/styles/formatx-mini-mag-assistant-r459.css');
const mobileLoader = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const mobileReference = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const regression = read('docs/scifi-ui/scripts/formatx-mobile-regression-r310.js');
const optics = read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const layout = read('docs/scifi-ui/styles/formatx-current-mag-r422.css');
const referenceRuntime = read('docs/scifi-ui/scripts/formatx-reference-production-r244.js');
const referenceCss = read('docs/scifi-ui/styles/formatx-reference-production-r244.css');
const awardRuntime = read('docs/scifi-ui/scripts/formatx-award-runtime-r206.js');
const worker = read('billing-worker/src/production-entry.js');

assert.doesNotMatch(home, /formatx-mobile-recovery\.js|formatx-core-real3d-v20\.js/);
assert.match(home, /20260830-r454-visible-electric-surface/);

has(renderer, [
  "const REVISION = 'living-luminous-electric-crystal-r454'",
  "getContext('webgl2'",
  "getContext('webgl'",
  'buildOrganismGeometry',
  'uSurfacePulse',
  'surfaceFilament',
  'startSurfacePulse',
  'scheduleSurfacePulse',
  'surfacePulseActive',
  "surfacePulse:()=>startSurfacePulse('api')",
  'intermittent-native-electric-filament-every-five-to-six-seconds',
  'single-luminous-webgl-material-owner',
  'r454-dpr-cap-1.75-pixel-budget-920k',
  '18x36-two-pass-intermittent-pulse-idle-zero',
  'heartbeat-and-interaction-bursts-no-idle-loop-r326'
], 'R454/R460 primary hero renderer contract');
assert.match(renderer, /surfacePulseTimer=setTimeout/);
assert.match(renderer, /if\(disposed\|\|reduced\.matches\)return/);
assert.match(renderer, /mobile\?5400:4900/);
assert.match(renderer, /surfacePulseStart=-Infinity/);
assert.match(renderer, /gl\.uniform1f\(uniforms\.uSurfacePulse,surfacePulse\)/);
assert.doesNotMatch(renderer, /new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(solidGlass, [
  "const VERSION='r460-uniform-solid-glass-soft-mobile-optics'",
  "const smoothWeight=mobile?'.992':'.930'",
  "const specPowerA=mobile?'26.0':'36.0'",
  "const specPowerB=mobile?'17.0':'22.0'",
  "const specGainB=mobile?'.44':'.64'",
  "const vertexNeedle='vec3 normal=normalize(mix(aCrystalNormal,aSphereNormal,morph));'",
  'crystalSmoothNormal',
  'mix(aCrystalNormal,crystalSmoothNormal,${smoothWeight})',
  "edgePattern,'float edge=0.0;'",
  "next=next.replace(facetPulse,'float facetPulse=.5;')",
  "glass+=vec3(.025,.22,.50)*.42;",
  "glass+=spectral*veins*.10*fresnel;",
  "glass+=spectral*membrane*.055*fresnel;",
  "glass+=spectral*fresnel*(.76+.48*visualEnergy);",
  "organ+=ice*nucleus*(2.02+.62*visualEnergy);",
  "glass+=ice*(rings*.27+heart*.10+nucleus*.34);",
  "fxCoreMobileOpticalBalanceR460=mobile?'soft-nucleus-broad-fresnel-feather':'desktop-material-unchanged'",
  "fxCoreOuterNoiseR456='disabled-on-glass-shell'",
  "fxCoreInnerLifeR456='preserved'",
  "fxCoreTriangleEdgesR456='disabled'",
  "fxCoreShaderHookR456='released-after-r326-compile'"
], 'R460 uniform glass and softer phone optics');
assert.doesNotMatch(solidGlass, /drawImage|createImageBitmap|new\s+Image|canvas\.style|style\.setProperty/);

has(directLoader, [
  'formatx-current-mag-r422.css?v=20260830-r454-layout-only-no-painted-mag',
  'formatx-core-shapeshifter-r337.css?v=20260830-r460-soft-mobile-rim',
  'formatx-mini-mag-assistant-r459.css?v=20260830-r459-persistent-site-controller',
  'formatx-mini-mag-assistant-r459.js?v=20260830-r460-hero-controller-bridge',
  'formatx-mobile-solid-glass-r456.js?v=20260830-r460-soft-mobile-optics',
  'formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface',
  'formatx-native-mag-touch-r434.js?v=20260830-r460-controller-tap-drag-safe',
  'formatx-mobile-render-governor-r426.js?v=20260830-r433-settle-after-native-morph',
  'direct-r326-r460-primary-controller-clean-runtime',
  "cleanupLegacyMagRuntime()",
  "fxLegacyMagDomCleanupR460='ready'",
  "fxPrimaryMagOwnerR460='r326-only'",
  "addStyle(MINI_STYLE,'data-fx-mini-mag-assistant-r459')",
  "void addScript(MINI_ASSISTANT,'data-fx-mini-mag-assistant-script-r459')",
  "await addScript(SOLID_GLASS,'data-fx-solid-glass-r456')",
  "fxMiniMagBootstrapR459='requested-alongside-primary-mag'",
  'direct-r326-r460-primary-controller-native-touch',
  'direct-r326-r460-primary-controller-desktop'
], 'R460 primary MAG plus persistent controller loader');
assert.doesNotMatch(directLoader, /formatx-mag-surface-sheen-r439|\bSHEEN\b/);

has(motionLoader, [
  'single-language-toggle.js?v=20260830-r429-initial-cross-device-header',
  'formatx-current-mag-loader-r422.js?v=20260830-r460-primary-controller-clean-runtime',
  'formatx-mobile-solid-glass-r456.js?v=20260830-r460-soft-mobile-optics',
  'formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface',
  'formatx-core-shapeshifter-r337.css?v=20260830-r460-soft-mobile-rim',
  'formatx-mini-mag-assistant-r459.js?v=20260830-r460-hero-controller-bridge',
  'formatx-mini-mag-assistant-r459.css?v=20260830-r459-persistent-site-controller',
  'isRetiredMagRuntime',
  'formatx-premium-finish',
  'formatx-live-heartbeat-r155',
  'formatx-signature-system-r185',
  'formatx-seamless-enforcer-r159',
  'formatx-living-energy-r168',
  'formatx-desktop-apex-loader-r224',
  "spec.remove()",
  "fxLegacyMagRuntimeCleanupR460='ready'",
  "fxLegacyMagStyleCleanupR460='ready'",
  '.fx-crystal-organism-r326-stage',
  "warmAsset(MINI_ASSISTANT,'script')",
  "warmAsset(MINI_STYLE,'style')",
  "fxMiniMagWarmR459='ready-persistent-site-controller'",
  'armed-direct-r326-r460-primary-controller-clean',
  'scheduleCriticalOwners()'
], 'R460 clean prewarmed primary + controller critical path');

has(nativeTouch, [
  "const VERSION='native-r326-touch-r460-controller-tap'",
  'const TAP_DISTANCE=14',
  'const TAP_DURATION=520',
  'window.FormatXMiniMagR459',
  "dispatchEvent(new CustomEvent('formatx:heromagcontrollerrequest'",
  'finishTap(',
  'clickStage(',
  "fxHeroMagControllerR460='ready'",
  'direct-r326-stage-protected-ui-controller-tap-drag-safe'
], 'R460 full-size MAG site-controller bridge');

has(miniAssistant, [
  "const SECTION_IDS=['hero','experience','capabilities','pricing','system','resources']",
  "const STYLE='/scifi-ui/styles/formatx-mini-mag-assistant-r459.css?v=20260830-r459-persistent-site-controller'",
  "addEventListener('formatx:heromagcontrollerrequest'",
  'pendingHeroRequest',
  "fxMiniMagHeroBridgeR460='ready'",
  "clickButton('.fx-reference-ask')",
  "clickButton('#menu-toggle,.fx-reference-menu-button')",
  "clickButton('.fx-three-sound')",
  "clickButton('.fx-reference-pause')",
  "clickButton('.fx-language-toggle')",
  'window.FormatXCoreShapeR337?.next',
  'scrollIntoView',
  "event.altKey",
  "String(event.key).toLowerCase()==='m'",
  'window.FormatXMiniMagR459={',
  "fxMiniMagPrimaryHeroR459='preserved-native-webgl'",
  "formatx:minimagready"
], 'R459/R460 persistent site-control actions and hero bridge');
assert.doesNotMatch(miniAssistant, /getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext|requestAnimationFrame\s*\(\s*function/);

has(miniStyle, [
  '.fx-mini-mag-assistant-r459',
  'position: fixed',
  'z-index: 12040',
  '.fx-mini-mag-launcher-r459',
  'min-width: 62px',
  'min-height: 62px',
  '.fx-mini-mag-panel-r459',
  'width: min(370px, calc(100vw - 28px))',
  'pointer-events: none',
  '[data-open="true"] .fx-mini-mag-panel-r459',
  '@media (prefers-reduced-motion: reduce)'
], 'R459 fixed accessible Mini MAG presentation');
assert.doesNotMatch(miniStyle, /position:\s*absolute;\s*right:\s*max\(18px/);

assert.match(mobileLoader, /r454-visible-electric-native-webgl/);
assert.doesNotMatch(mobileLoader, /formatx-mobile-core-softening-r322\.css|formatx-mobile-core-optics-r328\.css|formatx-mobile-optics-r423\.css/);
assert.match(regression, /retired-r454-no-fallback-stylesheet/);
assert.match(regression, /r454-formatx-core-shapeshifter-r337-css/);
has(regression, [
  'PRODUCTION_FIRST_PAINT_SELECTOR',
  "fxMobileReferenceStylePolicyR458 = 'static-first-paint-owner-no-late-css'",
  'reference-semantics-requested-static-first-paint',
  'formatx-mobile-reference-layout-v1.js?v=20260830-r458-static-first-paint-owner'
], 'R458 static first-paint mobile bootstrap');
has(mobileReference, [
  'productionFirstPaint',
  "fxMobileReferenceStylePolicyR458='static-first-paint-owner-no-late-css'",
  'r250-reference-stage-owner',
  'ensureControlZone(hero,space,rail)',
  'zone.parentElement!==space'
], 'R458 semantic-only mobile reference runtime');

has(optics, [
  'brightness(1.01)',
  'contrast(.86)',
  'saturate(1.10)',
  'blur(.90px)',
  'drop-shadow(0 0 1px rgba(126,239,255,.025))',
  'drop-shadow(0 0 2px rgba(82,91,255,.012))',
  'opacity: .965 !important',
  'production-r460-single-native-webgl-optics-owner-soft-mobile-rim'
], 'R460 softer mobile phone optics');
has(optics, [
  'brightness(1.36)',
  'contrast(1.18)',
  'saturate(1.50)'
], 'preserved desktop MAG optics');
has(layout, ['production-r454-direct-r326-layout-a11y-touch-no-painted-mag-layer'], 'R454 primary layout owner');
assert.doesNotMatch(layout, /fx-mag-sheen|@keyframes[^\{]*r439|formatx-mag-surface-sheen-r439/);

assert.match(referenceRuntime, /fxKeyboardNavigationR425/);
assert.match(referenceCss, /data-fx-keyboard-navigation-r425="true"/);
assert.match(referenceCss, /\.skip-link:focus-visible/);

const retired = [
  'docs/scifi-ui/scripts/formatx-mobile-recovery.js',
  'docs/scifi-ui/scripts/formatx-core-mechanical-orb-r250.js',
  'docs/scifi-ui/scripts/formatx-core-mobile-reference-r317.js',
  'docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js',
  'docs/scifi-ui/scripts/formatx-core-true-volume-r267.js',
  'docs/scifi-ui/styles/formatx-core-true-volume-r267.css',
  'docs/scifi-ui/styles/formatx-mobile-optics-r423.css',
  'docs/scifi-ui/styles/formatx-mobile-core-softening-r322.css',
  'docs/scifi-ui/styles/formatx-mobile-core-optics-r328.css',
  'docs/scifi-ui/styles/formatx-mobile-optics-r419.css',
  'docs/scifi-ui/styles/formatx-core-pulse-r312.css',
  'docs/scifi-ui/scripts/formatx-crystal-portal-r318.js',
  'docs/scifi-ui/styles/formatx-crystal-portal-r318.css',
  'docs/scifi-ui/scripts/formatx-quantum-particles-r335.js',
  'docs/scifi-ui/styles/formatx-quantum-particles-r335.css',
  'docs/scifi-ui/scripts/formatx-mag-surface-sheen-r439.js',
  'docs/scifi-ui/styles/formatx-mobile-mag-balance-r444.css',
  'docs/scifi-ui/styles/formatx-mobile-mag-balance-r445.css',
  'docs/scifi-ui/styles/formatx-mobile-mag-balance-r446.css',
  'docs/scifi-ui/styles/formatx-mobile-mag-balance-r447.css',
  'docs/scifi-ui/styles/formatx-mobile-mag-balance-r448.css',
  'docs/scifi-ui/data/r444-mobile-mag-deployment.json',
  'docs/scifi-ui/data/r445-mobile-mag-deployment.json',
  'docs/scifi-ui/data/r445-mobile-mag-live-reaudit.json',
  'docs/scifi-ui/data/r446-mobile-mag-deployment.json',
  'docs/scifi-ui/data/r447-mobile-mag-deployment.json',
  'docs/scifi-ui/data/r448-mobile-mag-deployment.json',
  '.github/scripts/validate-mobile-mag-r445.cjs',
  '.github/workflows/validate-mobile-mag-r445.yml'
];
for (const relative of retired) assert.equal(exists(relative), false, `retired MAG asset still exists: ${relative}`);

assert.doesNotMatch(worker, /formatx-mobile-recovery\.js|formatx-core-mechanical-orb-r250\.js|formatx-crystal-portal-r318|formatx-mag-surface-sheen-r439/);
assert.doesNotMatch(awardRuntime, /formatx-crystal-portal-r318|ensureCrystalSurface|formatx-mag-surface-sheen-r439/);
assert.doesNotMatch(regression, /fx-core-r317|fx-core-organic-form-r327/);

console.log('PASS: R460 keeps one R326 hero WebGL MAG, softens mobile optics, routes hero taps to the R459 controller and retires superseded MAG runtimes from the active path.');
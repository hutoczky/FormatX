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
const directLoader = read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const motionLoader = read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const mobileLoader = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
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
], 'R454 renderer contract');
assert.match(renderer, /surfacePulseTimer=setTimeout/);
assert.match(renderer, /if\(disposed\|\|reduced\.matches\)return/);
assert.match(renderer, /mobile\?5400:4900/);
assert.match(renderer, /surfacePulseStart=-Infinity/);
assert.match(renderer, /gl\.uniform1f\(uniforms\.uSurfacePulse,surfacePulse\)/);
assert.doesNotMatch(renderer, /new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(directLoader, [
  'formatx-current-mag-r422.css?v=20260830-r454-layout-only-no-painted-mag',
  'formatx-core-shapeshifter-r337.css?v=20260830-r454-single-visible-native-optics-owner',
  'formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface',
  'formatx-native-mag-touch-r434.js?v=20260830-r436-protected-ui-touch-fallback',
  'formatx-mobile-render-governor-r426.js?v=20260830-r433-settle-after-native-morph',
  'direct-r326-r454-style-first-visible-electric-idle-zero',
  'styles-ready-before-renderer'
], 'direct R454 chain');
assert.doesNotMatch(directLoader, /formatx-mag-surface-sheen-r439|\bSHEEN\b/);

has(motionLoader, [
  'single-language-toggle.js?v=20260830-r429-initial-cross-device-header',
  'formatx-current-mag-loader-r422.js?v=20260830-r454-visible-electric-style-first',
  'formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface',
  'formatx-current-mag-r422.css?v=20260830-r454-layout-a11y-touch',
  'formatx-core-shapeshifter-r337.css?v=20260830-r454-single-visible-native-optics-owner',
  'armed-direct-r326-r454-prewarmed',
  'scheduleCriticalOwners()'
], 'prewarmed R454 chain');

assert.match(mobileLoader, /r454-visible-electric-native-webgl/);
assert.doesNotMatch(mobileLoader, /formatx-mobile-core-softening-r322\.css|formatx-mobile-core-optics-r328\.css|formatx-mobile-optics-r423\.css/);
assert.match(regression, /retired-r454-no-fallback-stylesheet/);
assert.match(regression, /r454-formatx-core-shapeshifter-r337-css/);

has(optics, [
  'brightness(1.52)',
  'contrast(1.16)',
  'saturate(1.58)',
  'opacity: 1 !important',
  'production-r454-single-native-webgl-optics-owner-visible-no-overlay'
], 'sharp visible phone optics');
assert.doesNotMatch(optics, /\bblur\(/);
has(layout, ['production-r454-direct-r326-layout-a11y-touch-no-painted-mag-layer'], 'R454 layout owner');
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

console.log('PASS: R454 visible single WebGL MAG, intermittent electric surface energy and legacy cleanup source contracts passed.');

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mechanical-orb-r250.js');
const fallbackRenderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r317.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const referenceCss = read('docs/scifi-ui/styles/formatx-native-orb-reference-r250.css');
const textGuard = read('docs/scifi-ui/styles/formatx-responsive-text-guard-r72.css');
const premium = read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const stability = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const interactionStability = read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const home = read('docs/scifi-ui/index.html');

assert.match(bootstrap, /native-mechanical-orb-r250-no-2d-mag-layers/);
assert.match(bootstrap, /single-webgl-mechanical-orb-r250/);
assert.match(bootstrap, /loading-v69/);
assert.match(wrapper, /formatx-core-mechanical-orb-r250\.js\?v=20260824-native-mechanical-orb-r251-performance/);
assert.match(wrapper, /formatx-core-mobile-reference-r317\.js\?v=20260824-r321-native-soft-rim/);
assert.doesNotMatch(wrapper, /formatx-core-mobile-softlight-r318|formatx-quantum-particles-r335/);

for (const token of [
  'native-mechanical-energy-orb-r250',
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawElements(gl.TRIANGLES',
  'formatx:coreinteraction',
  'formatx:real3dready',
  'pointerdown',
  'pointermove',
  'pointerup',
  'ResizeObserver',
  'IntersectionObserver',
  'visible-native-3d-r250',
  'fxCoreFrameMs',
  'fxCoreRenderMs',
  'corePosition',
  'r250-mobile-adaptive',
  '60-plus-adaptive'
]) assert.ok(renderer.includes(token), `missing r250 mobile startup contract: ${token}`);

assert.doesNotMatch(renderer, /getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);
assert.ok(fallbackRenderer.includes('reference-crystal-webgl-r317-modern-flat-normal-fresnel'));

assert.match(layout, /formatx-mobile-reference-layout-v1\.css/);
assert.match(layout, /setPaused/);
assert.match(layout, /syncMenuState/);
assert.match(layout, /aria-pressed/);
assert.match(layout, /pointerup/);
assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.match(layout, /restoreDesktopMenu/);
for (const token of ['repairProof', 'PUBLIC PROOF LAYER', 'Bizonyíték a látvány mögött.', 'fx-reference-liveos', 'bootObserver']) {
  assert.ok(layout.includes(token), `missing proof contract: ${token}`);
}

for (const token of [
  '#hero > .hero-grid > .hero-space',
  '.hero-space > .fx-reference-controls-r204',
  '> .fx-three-sound',
  'display: none !important',
  'clip-path: inset(50%) !important'
]) assert.ok(referenceCss.includes(token), `missing r250 mobile reference CSS contract: ${token}`);

assert.match(textGuard, /white-space:\s*normal\s*!important/);
assert.match(premium, /ready-v20\|ready-v69/);
assert.match(loader, /ready-v20\|ready-v69/);
assert.match(stability, /ready-v20\|ready-v69/);
assert.match(interactionStability, /r250|booting-v69/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
assert.ok(home.includes('formatx-native-orb-reference-r250.css'));

for (const source of [bootstrap, wrapper, renderer, fallbackRenderer, layout, premium, loader, stability, interactionStability]) new Function(source);
console.log('PASS: mobile startup selects the r250 native mechanical orb, preserves an r317 WebGL fallback and enforces reference controls/text flow.');

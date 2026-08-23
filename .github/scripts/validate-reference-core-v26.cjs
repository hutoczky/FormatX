'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const selector = read('docs/scifi-ui/scripts/formatx-reference-core-v26.js');
const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
const flow = read('docs/scifi-ui/scripts/formatx-flow-first-r75.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const webgpu = read('docs/scifi-ui/scripts/formatx-webgpu-core-v29.js');
const webgl = read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const entry = read('billing-worker/src/production-entry.js');

assert.match(selector, /const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/);

// r285 is the current production bootstrap authority: one native WebGL crystal,
// with the historical 2D MAG overlays explicitly retired. Keep the underlying
// r99 renderer/material/interaction contracts verified as well.
assert.match(bootstrap, /pure-native-webgl3d-r285-no-2d-mag-layers/);
assert.match(bootstrap, /pure-webgl3d-no-2d-overlays/);
assert.match(bootstrap, /single-webgl-luminous-crystal-r99/);
assert.match(bootstrap, /formatx-pure-3d-r285\.css\?v=20260821-r285/);
assert.match(bootstrap, /formatx-award-material-r91\.css\?v=20260814-rayglass-r95/);
assert.match(wrapper, /formatx-core-mobile-reference-r99\.js\?v=20260814-luminous-cinematic-r99/);

for (const token of [
  'reference-luminous-crystal-webgl-r99',
  'webgl2',
  'webgl',
  'TRIANGLE_STRIP',
  'single-webgl-luminous-crystal-r99',
  'reference-deep-concave-four-point-size-lock-r99',
  'luminous-faceted-iceglass-caustic-r99',
  'touch-pointer-breathing-spectral-refraction-r99',
  'touchstart',
  'touchmove',
  'frac',
  'caustic',
  'rings'
]) {
  assert.ok(renderer.includes(token), `missing current r99 reference contract: ${token}`);
}

assert.doesNotMatch(renderer, /new\s+Image\s*\(|drawImage\s*\(|three\.js|\bTHREE\./i);

// r298 is deliberately state-only. It publishes the mobile/desktop reference
// mode before later runtimes start, but it must not recreate any retired DOM
// overlay, legacy 2D optics or layout geometry.
for (const token of [
  'fxFlowFirstR298',
  'pure-webgl3d-state-only',
  'pure-webgl3d-no-dom-optics',
  'gpu-surface-r285',
  'none-pure-webgl3d',
  'formatx:flowfirstchange'
]) {
  assert.ok(flow.includes(token), `missing current r298 flow-first contract: ${token}`);
}
assert.doesNotMatch(flow, /award-reference-overlay-r139|desktop-native-content-r139|createElement\s*\(|querySelector\s*\(|appendChild\s*\(|insertBefore\s*\(|innerHTML|style\.setProperty/);

assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.match(layout, /restoreDesktopMenu/);
assert.match(layout, /fx-organism-system-toggle/);
assert.match(webgpu, /navigator\.gpu\.requestAdapter/);
assert.match(webgpu, /pass\.drawIndexed/);
assert.match(webgl, /canvas\.getContext\('webgl2'/);
assert.match(webgl, /gl\.drawElements\(gl\.TRIANGLES/);
assert.match(entry, /formatx-reference-core-v26\.js/);

for (const source of [selector, bootstrap, wrapper, renderer, flow, layout]) new Function(source);

console.log('PASS: r298 state-only flow + r285 pure native WebGL3D bootstrap + r99 luminous faceted touch-interactive crystal MAG are the production reference authority.');

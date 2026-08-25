'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const selector = read('docs/scifi-ui/scripts/formatx-reference-core-v26.js');
const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r317.js');
const fallback = read('docs/scifi-ui/scripts/formatx-core-mechanical-orb-r250.js');
const flow = read('docs/scifi-ui/scripts/formatx-flow-first-r75.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const webgpu = read('docs/scifi-ui/scripts/formatx-webgpu-core-v29.js');
const webgl = read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const entry = read('billing-worker/src/production-entry.js');

assert.match(selector, /const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js/);
assert.match(bootstrap, /formatx-pure-3d-r285\.css/);
assert.match(wrapper, /formatx-core-mobile-reference-r317\.js\?v=20260825-r317-primary-soft-rim-performance/);
assert.match(wrapper, /formatx-core-mechanical-orb-r250\.js\?v=20260824-native-mechanical-orb-r251-performance/);
assert.match(wrapper, /modern-r317-crystal-primary/);

for (const token of [
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES',
  'reference-crystal-webgl-r317-modern-flat-normal-fresnel',
  'bounded-interaction-bursts-no-idle-raf',
  'modern-flat-normal-fresnel-microfacet-r317',
  'soft-rim-balanced-glow'
]) assert.ok(renderer.includes(token), `missing current r317 reference contract: ${token}`);
assert.doesNotMatch(renderer, /getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);
assert.ok(fallback.includes('native-mechanical-energy-orb-r250'));

for (const token of ['r298-state-only-no-layout-writes','compatibility-dormant-r298','delegated-r208','fxFlowFirstScheduling','fxFlowFirstConflict','canonicalOwner']) {
  assert.ok(flow.includes(token), `missing current r298 flow-first contract: ${token}`);
}
assert.doesNotMatch(flow, /award-reference-overlay-r139|desktop-native-content-r139|createElement\s*\(|appendChild\s*\(|insertBefore\s*\(|innerHTML|style\.setProperty|\.style\./);
assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.match(layout, /restoreDesktopMenu/);
assert.match(webgpu, /navigator\.gpu\.requestAdapter/);
assert.match(webgpu, /pass\.drawIndexed/);
assert.match(webgl, /canvas\.getContext\('webgl2'/);
assert.match(webgl, /gl\.drawElements\(gl\.TRIANGLES/);
assert.match(entry, /formatx-reference-core-v26\.js/);

for (const source of [selector, bootstrap, wrapper, renderer, fallback, flow, layout]) new Function(source);
console.log('PASS: r317 event-driven soft-rim WebGL crystal is the production reference authority with r250 fallback.');

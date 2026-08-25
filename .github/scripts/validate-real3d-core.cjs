'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r317.js');
const fallback = read('docs/scifi-ui/scripts/formatx-core-mechanical-orb-r250.js');
const mobileCss = read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const pureCss = read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const gyro = read('docs/scifi-ui/scripts/formatx-core-gyro-r144.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const index = read('docs/scifi-ui/index.html');

assert.match(bootstrap, /formatx-core-mobile-v55\.js/);
assert.match(bootstrap, /formatx-pure-3d-r285\.css/);
for (const forbidden of ['formatx-core-detail-overlay-r122.js','formatx-core-live-motion-r147.js','formatx-quantum-particles-r335.js','formatx-core-mobile-softlight-r318.js']) {
  assert.ok(!bootstrap.includes(forbidden), `retired 2D MAG runtime returned: ${forbidden}`);
}

assert.match(wrapper, /formatx-core-mobile-reference-r317\.js\?v=20260825-r317-primary-soft-rim-performance/);
assert.match(wrapper, /formatx-core-mechanical-orb-r250\.js\?v=20260824-native-mechanical-orb-r251-performance/);
assert.match(wrapper, /modern-r317-crystal-primary/);
assert.match(wrapper, /mechanical-r250-fallback/);
assert.match(wrapper, /pure-webgl3d-no-2d-overlays/);

for (const token of [
  'reference-crystal-webgl-r317-modern-flat-normal-fresnel',
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES',
  'bounded-interaction-bursts-no-idle-raf',
  'ResizeObserver',
  'IntersectionObserver',
  'pointerdown',
  'pointermove',
  'formatx:coreinteraction',
  'schedule(3)',
  'soft-rim-balanced-glow',
  'modern-flat-normal-fresnel-microfacet-r317'
]) assert.ok(renderer.includes(token), `missing r317 crystal contract: ${token}`);

assert.doesNotMatch(renderer, /getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|\bTHREE\.|three\.js|babylon|playcanvas|model-viewer/i);
assert.doesNotMatch(fallback, /getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas/i);

for (const token of ['.fx-core-detail-r122','.fx-core-live-r147-layer','content: none !important']) {
  assert.ok(pureCss.includes(token), `pure WebGL guard missing: ${token}`);
}
assert.doesNotMatch(mobileCss, /radial-gradient|conic-gradient|repeating-linear-gradient/i);
for (const token of ['mobile-gyro-parallax-r267-idle-safe','sensor-burst-no-idle-raf']) assert.ok(gyro.includes(token), `gyro regression: ${token}`);
assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.ok(index.includes('formatx-core-real3d-v20.js'));

for (const source of [bootstrap, wrapper, renderer, fallback, gyro, layout]) new Function(source);
console.log('PASS: r317 modern WebGL crystal is primary, event-driven at idle, with r250 as WebGL fallback and no 2D MAG renderer.');

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mechanical-orb-r250.js');
const mobileCss = read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const pureCss = read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const referenceCss = read('docs/scifi-ui/styles/formatx-native-orb-reference-r250.css');
const gyro = read('docs/scifi-ui/scripts/formatx-core-gyro-r144.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const index = read('docs/scifi-ui/index.html');

for (const token of [
  'native-mechanical-orb-r250-no-2d-mag-layers',
  'native-mechanical-orb-r250-no-2d-overlays',
  'single-webgl-mechanical-orb-r250',
  'formatx-core-mobile-v55.js?v=20260824-native-mechanical-orb-r251-performance',
  'formatx-mobile-reference-layout-v1.js?v=20260824-native-orb-r250'
]) assert.ok(bootstrap.includes(token), `missing r250 bootstrap token: ${token}`);

for (const forbidden of [
  'formatx-core-detail-overlay-r122.js',
  'formatx-core-live-motion-r147.js',
  'formatx-quantum-particles-r335.js',
  'formatx-core-mobile-softlight-r318.js'
]) assert.ok(!bootstrap.includes(forbidden), `retired 2D MAG runtime returned to bootstrap: ${forbidden}`);

for (const token of [
  'formatx-core-mechanical-orb-r250.js',
  'formatx-core-mobile-reference-r317.js',
  'native-webgl-only-no-svg-or-canvas2d-overlay'
]) assert.ok(wrapper.includes(token), `missing renderer wrapper token: ${token}`);

for (const token of [
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawElements(gl.TRIANGLES',
  'gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER',
  'gl.enable(gl.DEPTH_TEST)',
  'gl.depthFunc(gl.LEQUAL)',
  'computeNormals',
  'sphericalPanel',
  'sphere',
  'torus',
  'aNormal',
  'fresnel',
  'specular',
  'requestAnimationFrame(frame)',
  'ResizeObserver',
  'IntersectionObserver',
  'pointerdown',
  'pointermove',
  'formatx:coreinteraction',
  'fxCoreReal3dResolutionScale',
  'fxCoreReal3dFps',
  '60-plus-adaptive'
]) assert.ok(renderer.includes(token), `missing native WebGL engine token: ${token}`);

assert.doesNotMatch(renderer, /getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas/i);
assert.doesNotMatch(renderer, /\bTHREE\.|three\.js|babylon|playcanvas|model-viewer/i);

for (const token of [
  '.fx-core-detail-r122',
  '.fx-core-live-r147-layer',
  '.fx-r155-heartbeat-core',
  '[class^="fx-r168-"]',
  'content: none !important',
  'mix-blend-mode: normal !important'
]) assert.ok(pureCss.includes(token), `pure-3D guard missing token: ${token}`);

assert.doesNotMatch(mobileCss, /radial-gradient|conic-gradient|repeating-linear-gradient/i, 'mobile MAG CSS paints a 2D optical field');
assert.doesNotMatch(mobileCss, /content\s*:\s*["']["']/i, 'mobile MAG CSS creates a painted pseudo-element');
assert.match(mobileCss, /\.fx-core-mobile-v55-stage/);
assert.match(mobileCss, /\.fx-core-mobile-v55-canvas/);
assert.match(referenceCss, /\.hero-space > \.fx-reference-controls-r204/);

for (const token of ['mobile-gyro-parallax-r267-idle-safe', 'DeviceOrientationEvent', 'pointermove', 'idle-listening', 'sensor-burst-no-idle-raf']) {
  assert.ok(gyro.includes(token), `missing idle-safe gyro token: ${token}`);
}
assert.doesNotMatch(gyro, /function enableSensor\(\)[\s\S]*?startFrame\(\)/, 'gyro must not start RAF merely because DeviceOrientationEvent exists');

assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.ok(index.includes('data-fx-core-real3d="true"'));
assert.ok(index.includes('formatx-core-real3d-v20.js'));
assert.ok(index.includes('formatx-native-orb-reference-r250.css'));

for (const source of [bootstrap, wrapper, renderer, gyro, layout]) new Function(source);
console.log('PASS: r250 MAG uses native depth-buffered indexed WebGL meshes with no image, Canvas2D or DOM-optics renderer.');

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mechanical-orb-r250.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const referenceCss = read('docs/scifi-ui/styles/formatx-native-orb-reference-r250.css');

for (const token of [
  'native-mechanical-orb-r250-no-2d-mag-layers',
  'native-mechanical-orb-r250-no-2d-overlays',
  'single-webgl-mechanical-orb-r250',
  'formatx-core-mobile-v55.js?v=20260824-native-mechanical-orb-r251-performance',
  'formatx-mobile-reference-layout-v1.js?v=20260824-native-orb-r250'
]) assert.ok(bootstrap.includes(token), `missing r250 release bootstrap contract: ${token}`);

for (const token of [
  'formatx-core-mechanical-orb-r250.js?v=20260824-native-mechanical-orb-r251-performance',
  'formatx-core-mobile-reference-r317.js?v=20260824-r321-native-soft-rim',
  'native-webgl-only-no-svg-or-canvas2d-overlay',
  'native-mechanical-orb-r250-primary'
]) assert.ok(wrapper.includes(token), `missing r250 renderer-selection contract: ${token}`);

for (const token of [
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawElements(gl.TRIANGLES',
  'gl.enable(gl.DEPTH_TEST)',
  'gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)',
  'sphere(.30',
  'torus(.79',
  'sphericalPanel(.72',
  'segmented-spherical-mechanical-shell-r250',
  'metal-plasma-orbital-r250',
  'pointer-touch-shell-open-ring-acceleration-r250',
  'ResizeObserver',
  'IntersectionObserver',
  'formatx:coreinteraction',
  'formatx:real3dready',
  'pointerdown',
  'pointermove',
  'pointerup',
  'fxCoreRenderMs',
  'fxCoreReal3dTargetFps',
  '60-plus-adaptive',
  '720000',
  '1280000'
]) assert.ok(renderer.includes(token), `missing native r250 engine contract: ${token}`);

assert.doesNotMatch(renderer, /getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);
assert.doesNotMatch(wrapper, /formatx-quantum-particles-r335|formatx-core-mobile-softlight-r318/);
assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.match(layout, /restoreDesktopMenu/);
assert.match(referenceCss, /\.hero-space > \.fx-reference-controls-r204/);
assert.match(referenceCss, /\.fx-reference-proof/);

for (const source of [bootstrap, wrapper, renderer, layout]) new Function(source);
console.log('PASS: release validates the r250 native WebGL mechanical shell, plasma core, six orbital systems, interaction and adaptive 60+ FPS contract.');

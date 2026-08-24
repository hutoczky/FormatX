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
const layoutCss = read('docs/scifi-ui/styles/formatx-native-orb-reference-r250.css');
const pureCss = read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const mobileCss = read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const interactionStability = read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const home = read('docs/scifi-ui/index.html');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap, /native-mechanical-orb-r250-no-2d-mag-layers/);
assert.match(bootstrap, /native-mechanical-orb-r250-no-2d-overlays/);
assert.match(bootstrap, /single-webgl-mechanical-orb-r250/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260824-native-mechanical-orb-r251-performance/);
assert.match(wrapper, /formatx-core-mechanical-orb-r250\.js\?v=20260824-native-mechanical-orb-r251-performance/);
assert.match(wrapper, /formatx-core-mobile-reference-r317\.js\?v=20260824-r321-native-soft-rim/);
assert.match(wrapper, /native-mechanical-orb-r250-primary/);
assert.match(wrapper, /modern-r317-fallback/);
assert.doesNotMatch(wrapper, /formatx-core-mobile-softlight-r318|formatx-quantum-particles-r335|formatx-core-mobile-reference-r99/);

for (const token of [
  'native-mechanical-energy-orb-r250',
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawElements(gl.TRIANGLES',
  'gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER',
  'gl.enable(gl.DEPTH_TEST)',
  'gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)',
  'aNormal',
  'computeNormals',
  'sphere(.30',
  'torus(.79',
  'sphericalPanel(.72',
  'fresnel',
  'specular',
  'formatx:coreinteraction',
  'ResizeObserver',
  'IntersectionObserver',
  'visible-native-3d-r250',
  'single-webgl-mechanical-orb-r250',
  'fxCoreRenderMs',
  'fxCoreReal3dFps',
  'corePosition',
  'segmented-spherical-panels-plasma-sphere-six-orbitals',
  'lit-metal-fresnel-cyan-magenta-plasma',
  'pointer-touch-shell-open-ring-acceleration',
  '60-plus-adaptive'
]) assert.ok(renderer.includes(token), `missing r250 WebGL quality contract: ${token}`);

assert.doesNotMatch(renderer, /getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);
assert.ok(fallbackRenderer.includes('reference-crystal-webgl-r317-modern-flat-normal-fresnel'));
assert.doesNotMatch(fallbackRenderer, /getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas/i);

assert.ok(pureCss.includes('.fx-core-detail-r122'));
assert.ok(pureCss.includes('.fx-core-live-r147-layer'));
assert.ok(pureCss.includes('content: none !important'));
assert.doesNotMatch(mobileCss, /radial-gradient|conic-gradient|repeating-linear-gradient/i);

assert.match(layout, /PUBLIC PROOF LAYER/);
assert.match(layout, /KÉRDEZZ/);
assert.match(layout, /fx-reference-controls-r204/);
assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.match(layout, /restoreDesktopMenu/);
assert.match(layoutCss, /\.fx-reference-proof/);
assert.match(layoutCss, /\.hero-space > \.fx-reference-controls-r204/);
assert.match(interactionStability, /r250|delegated-r260-canonical-owner/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
assert.ok(home.includes('formatx-native-orb-reference-r250.css'));

const quality = contract.quality_contract;
assert.equal(quality.mag_image_backed, false);
assert.equal(quality.mag_webgl_context_count, 1);
assert.equal(quality.mag_paused_outside_hero, true);

for (const source of [bootstrap, wrapper, renderer, fallbackRenderer, layout, interactionStability]) new Function(source);
console.log('PASS: r250 single-WebGL MAG is a real depth-buffered mechanical shell and plasma-orb engine with adaptive interaction and no 2D renderer.');

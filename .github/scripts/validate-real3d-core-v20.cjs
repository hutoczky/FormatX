'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r317.js');
const fallbackRenderer = read('docs/scifi-ui/scripts/formatx-core-mechanical-orb-r250.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const pureCss = read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const mobileCss = read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const interactionStability = read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const home = read('docs/scifi-ui/index.html');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap, /formatx-core-mobile-v55\.js/);
assert.match(bootstrap, /formatx-pure-3d-r285\.css/);
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
  'formatx:coreinteraction',
  'ResizeObserver',
  'IntersectionObserver',
  'soft-rim-balanced-glow',
  'modern-flat-normal-fresnel-microfacet-r317'
]) assert.ok(renderer.includes(token), `missing r317 WebGL quality contract: ${token}`);

assert.doesNotMatch(renderer, /getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas/i);
assert.ok(fallbackRenderer.includes('native-mechanical-energy-orb-r250'));
assert.doesNotMatch(fallbackRenderer, /getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas/i);
assert.ok(pureCss.includes('.fx-core-detail-r122'));
assert.ok(pureCss.includes('.fx-core-live-r147-layer'));
assert.ok(pureCss.includes('content: none !important'));
assert.doesNotMatch(mobileCss, /radial-gradient|conic-gradient|repeating-linear-gradient/i);
assert.match(layout, /PUBLIC PROOF LAYER/);
assert.match(layout, /KÉRDEZZ/);
assert.match(layout, /fx-reference-controls-r204/);
assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.match(interactionStability, /r250|r317|delegated-r260-canonical-owner/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));

const quality = contract.quality_contract;
assert.equal(quality.mag_image_backed, false);
assert.equal(quality.mag_webgl_context_count, 1);
assert.equal(quality.mag_paused_outside_hero, true);

for (const source of [bootstrap, wrapper, renderer, fallbackRenderer, layout, interactionStability]) new Function(source);
console.log('PASS: r317 soft-rim crystal is the primary single-WebGL MAG with bounded interaction bursts and r250 native fallback.');

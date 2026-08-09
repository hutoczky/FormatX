'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const runtime = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const style = read('docs/scifi-ui/styles/formatx-core-real3d-v20.css');
const homepage = read('docs/scifi-ui/index.html');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const premium = read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'the MAG must own exactly one WebGL2 context');
for (const token of [
  "gl.enable(gl.DEPTH_TEST)",
  'gl.drawElements(gl.TRIANGLES',
  'gl.drawElements(gl.LINES',
  'function perspective(',
  'function starGeometry(',
  'function sphereGeometry(',
  'function torusGeometry(',
  "powerPreference: coarse.matches ? 'default' : 'high-performance'",
  "fxCorePerformanceTarget = 'adaptive-60-plus-fps'",
  "fxCoreVisibility = 'hero-only-raf-paused'"
]) assert.ok(runtime.includes(token), `real 3D contract missing: ${token}`);

assert.doesNotMatch(runtime, /drawImage\s*\(|new\s+Image\s*\(|background-image\s*:/i, 'the MAG must not be image-backed');
assert.doesNotMatch(runtime, /https?:\/\//, 'the MAG runtime must remain first-party and self-contained');
assert.ok(homepage.includes('formatx-core-real3d-v20.css') && homepage.includes('formatx-core-real3d-v20.js'), 'v20 assets are not bootstrapped');
assert.ok(style.includes('clamp(576px, 63svh, 896px)'), 'mobile reference core-first composition is missing');
assert.ok(loader.includes("root.dataset.fxCoreReal3d === 'ready-v20'"), 'legacy multi-context loader retirement is missing');
assert.ok(mapper.includes("root.dataset.fxCoreReal3d==='ready-v20'"), 'legacy mesh mapper guard is missing');
assert.ok(premium.includes("addEventListener('formatx:coremesh3dready', syncRendererState)"), 'Canvas2D fallback retirement hook is missing');

const quality = contract.quality_contract;
assert.equal(quality.mag_image_backed, false);
assert.equal(quality.mag_webgl_context_count, 1);
assert.equal(quality.mag_maximum_draw_calls, 14);
assert.equal(quality.mag_frame_rate_target, '60-plus-display-refresh-uncapped');
assert.equal(quality.mag_paused_outside_hero, true);

console.log('PASS: FormatX MAG is one self-contained indexed WebGL2 3D scene with depth, perspective, mobile-safe GPU selection, adaptive 60+ FPS targeting and no image-backed core.');

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
const referenceBootstrap = read('docs/scifi-ui/scripts/formatx-reference-core-v26.js');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'the production MAG must own exactly one WebGL2 context');
for (const token of [
  "gl.enable(gl.DEPTH_TEST)",
  'gl.drawElements(gl.TRIANGLES',
  'gl.drawElements(gl.LINES',
  'function perspective(',
  'function starGeometry(',
  'function sphereGeometry(',
  'function torusGeometry(',
  'function crystalFilamentGeometry(',
  'function compositeBloom(',
  'quarter-resolution-separable-bloom-v23',
  'schlick-fresnel-chromatic-refraction-v24',
  "powerPreference: coarse.matches ? 'default' : 'high-performance'",
  "fxCorePerformanceTarget = 'adaptive-60-plus-fps'",
  "fxCoreVisibility = 'hero-only-raf-paused'"
]) assert.ok(runtime.includes(token), `real 3D contract missing: ${token}`);

assert.ok(runtime.includes("fxCoreLoopTransferPolicy = 'gpu-paused-two-frame-landing-v24'"), 'loop-transfer GPU pause marker missing');
assert.doesNotMatch(runtime, /drawImage\s*\(|new\s+Image\s*\(|background-image\s*:/i, 'the production MAG must not be image-backed');
assert.doesNotMatch(runtime, /https?:\/\//, 'the production MAG runtime must remain first-party and self-contained');
assert.ok(homepage.includes('formatx-core-real3d-v20.css') && homepage.includes('formatx-core-real3d-v20.js'), 'reference-calibrated v24 assets are not bootstrapped');
assert.ok(homepage.includes('v=20260809-real3d-v24-volumetric-crystal-r3-moving-core-r11'), 'production v24 visual cache revision is missing');
assert.ok(style.includes('clamp(576px, 63svh, 896px)'), 'mobile reference core-first composition is missing');
assert.ok(loader.includes("root.dataset.fxCoreReal3d === 'ready-v20'"), 'legacy multi-context loader retirement is missing');
assert.ok(mapper.includes("root.dataset.fxCoreReal3d==='ready-v20'"), 'legacy mesh mapper guard is missing');
assert.ok(premium.includes("addEventListener('formatx:coremesh3dready', syncRendererState)"), 'Canvas2D fallback retirement hook is missing');

// The v29 renderer is genuine WebGPU 3D, but until it reproduces the same
// four-tip crystalline reference geometry it must not replace the calibrated
// production v24 MAG automatically on WebGPU-capable browsers.
assert.match(referenceBootstrap, /const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/, 'WebGPU v29 must require explicit ?webgpu=1 preview opt-in');
assert.match(referenceBootstrap, /if \(!WEBGPU_PREVIEW\)[\s\S]*production-v24-authority[\s\S]*webgl2-v24-reference-production[\s\S]*return;/, 'reference-calibrated v24 MAG must remain production authority');
assert.doesNotMatch(referenceBootstrap, /if \(navigator\.gpu\)[\s\S]{0,500}webgpu-primary/, 'WebGPU must not automatically replace the production v24 MAG');

const quality = contract.quality_contract;
assert.equal(quality.mag_image_backed, false);
assert.equal(quality.mag_webgl_context_count, 1);
assert.equal(quality.mag_maximum_draw_calls, 17);
assert.equal(quality.mag_postprocess_bloom, true);
assert.equal(quality.mag_frame_rate_target, '60-plus-display-refresh-uncapped');
assert.equal(quality.mag_paused_outside_hero, true);
assert.equal(quality.mag_paused_during_seamless_loop_transfer, true);

console.log('PASS: FormatX production keeps the reference-calibrated v24 indexed WebGL2 MAG with depth, perspective, adaptive 60+ FPS targeting and no image-backed core; WebGPU v29 is opt-in preview only.');

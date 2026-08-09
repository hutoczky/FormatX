'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

const bootstrap = fs.readFileSync(path.join(root, 'docs/scifi-ui/scripts/formatx-reference-core-v26.js'), 'utf8');
const webgpu = fs.readFileSync(path.join(root, 'docs/scifi-ui/scripts/formatx-webgpu-core-v29.js'), 'utf8');
const webgl = fs.readFileSync(path.join(root, 'docs/scifi-ui/scripts/formatx-orbital-core-v28.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'docs/scifi-ui/styles/formatx-orbital-core-v28.css'), 'utf8');
const mobileCss = fs.readFileSync(path.join(root, 'docs/scifi-ui/styles/formatx-real3d-mobile-v29.css'), 'utf8');
const cinematic = fs.readFileSync(path.join(root, 'docs/scifi-ui/scripts/formatx-cinematic-core-v27.js'), 'utf8');
const entry = fs.readFileSync(path.join(root, 'billing-worker/src/production-entry.js'), 'utf8');

assert.match(bootstrap, /retired-diamond-v26/, 'legacy diamond renderer must remain retired');
assert.match(bootstrap, /navigator\.gpu/, 'WebGPU capability detection missing');
assert.match(bootstrap, /formatx-webgpu-core-v29\.js\?v=20260809-webgpu-real3d-v29-\d+/, 'WebGPU v29 primary bootstrap missing');
assert.match(bootstrap, /formatx-orbital-core-v28\.js\?v=20260809-reference-orb-v28-\d+/, 'WebGL2 fallback bootstrap missing');
assert.match(bootstrap, /webgpu-primary/, 'WebGPU primary preference marker missing');
assert.match(bootstrap, /webgl2-fallback/, 'WebGL2 fallback preference marker missing');
assert.match(cinematic, /retired-by-orbital-v28/, 'legacy cinematic overlay must remain retired');

assert.match(webgpu, /const VERSION = 'v29'/, 'v29 renderer marker missing');
assert.match(webgpu, /navigator\.gpu\.requestAdapter/, 'WebGPU adapter request missing');
assert.match(webgpu, /adapter\.requestDevice/, 'WebGPU device request missing');
assert.match(webgpu, /canvas\.getContext\('webgpu'\)/, 'WebGPU canvas context missing');
assert.match(webgpu, /getPreferredCanvasFormat/, 'preferred WebGPU canvas format missing');
assert.match(webgpu, /depth24plus/, 'WebGPU depth buffer missing');
assert.match(webgpu, /createRenderPipeline/, 'WebGPU render pipeline missing');
assert.match(webgpu, /function perspective\(/, 'perspective projection missing in WebGPU renderer');
assert.match(webgpu, /function lookAt\(/, '3D camera view matrix missing in WebGPU renderer');
assert.match(webgpu, /function sphereGeometry\(/, 'real indexed sphere geometry missing');
assert.match(webgpu, /function tubeGeometry\(/, 'real 3D ribbon tube geometry missing');
assert.match(webgpu, /pass\.drawIndexed/, 'indexed WebGPU mesh rendering missing');
assert.match(webgpu, /reflect\(-V, N\)/, 'GPU reflection shading missing');
assert.match(webgpu, /refract\(-V, N, 0\.68\)/, 'GPU refraction shading missing');
assert.match(webgpu, /driftX = Math\.sin/, 'animated inner emitter X drift missing');
assert.match(webgpu, /driftY = Math\.cos/, 'animated inner emitter Y drift missing');
assert.match(webgpu, /driftZ = Math\.sin/, 'animated inner emitter Z drift missing');
assert.match(webgpu, /renderScale/, 'adaptive WebGPU render scale missing');
assert.match(webgpu, /ema > 20\.5/, 'adaptive slow-frame threshold missing');
assert.match(webgpu, /webgpu-vendor-neutral-amd-nvidia-intel/, 'vendor-neutral AMD/NVIDIA/Intel backend marker missing');
assert.match(webgpu, /fallback\('webgpu-unavailable'\)/, 'WebGPU unavailable fallback missing');
assert.match(webgpu, /fallback\('device-lost'\)/, 'WebGPU device-loss fallback missing');
assert.doesNotMatch(webgpu, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i, 'WebGPU core must not depend on a third-party 3D engine');
assert.doesNotMatch(webgpu, /new\s+Image\s*\(|drawImage\s*\(|backgroundImage/i, 'WebGPU core must not fake 3D with raster imagery');

assert.match(webgl, /const VERSION = 'v28'/, 'WebGL2 fallback marker missing');
assert.match(webgl, /canvas\.getContext\('webgl2'/, 'native WebGL2 fallback context missing');
assert.match(webgl, /gl\.DEPTH_TEST/, 'WebGL2 fallback depth testing missing');
assert.match(webgl, /function sphereGeometry\(/, 'WebGL2 fallback sphere geometry missing');
assert.match(webgl, /function tubeGeometry\(/, 'WebGL2 fallback ribbon geometry missing');
assert.match(webgl, /gl\.drawElements\(gl\.TRIANGLES/, 'WebGL2 indexed rendering missing');
assert.doesNotMatch(webgl, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(/i, 'WebGL2 fallback must not be image-backed');

assert.match(css, /pointer-events:\s*none/, '3D stage must never capture scrolling or touch input');
assert.match(css, /100dvh/, 'dynamic mobile viewport support missing');
assert.match(css, /data-fx-webgpu-core="ready-v29"/, 'WebGPU presentation state missing');
assert.match(css, /data-fx-orbital-core="ready-v28"/, 'WebGL2 presentation state missing');
assert.match(css, /--fx-orbital-x:\s*50%/, 'mobile centered composition missing');
assert.match(css, /--fx-orbital-x:\s*69%/, 'desktop right-side composition missing');
assert.match(mobileCss, /hero-copy[\s\S]*order:\s*-1\s*!important/, 'mobile hero copy must remain before the 3D stage');
assert.match(mobileCss, /hero-space[\s\S]*order:\s*0\s*!important/, 'mobile 3D stage must follow readable hero copy');
assert.match(mobileCss, /data-fx-webgpu-core="ready-v29"/, 'mobile WebGPU composition contract missing');

assert.match(entry, /formatx-reference-core-v26\.js\?v=20260809-reference-crystal-v26-\d+/, 'production compatibility bootstrap injection missing');
assert.match(entry, /CRITICAL_STARTUP_ASSETS[\s\S]*formatx-reference-core-v26\.js/, 'bootstrap no-store protection missing');

console.log('PASS: FormatX uses native WebGPU v29 real indexed 3D geometry with GPU reflection/refraction and adaptive rendering, with native indexed WebGL2 v28 as the automatic fallback; mobile composition keeps the 3D core contained behind readable content.');

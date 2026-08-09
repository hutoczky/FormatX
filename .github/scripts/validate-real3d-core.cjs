'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const repo = path.resolve(__dirname, '../..');
const production = fs.readFileSync(path.join(repo, 'docs/scifi-ui/scripts/formatx-core-real3d-v20.js'), 'utf8');
const productionStyle = fs.readFileSync(path.join(repo, 'docs/scifi-ui/styles/formatx-core-real3d-v20.css'), 'utf8');
const loader = fs.readFileSync(path.join(repo, 'docs/scifi-ui/scripts/formatx-reference-core-v26.js'), 'utf8');
const previewWebgl = fs.readFileSync(path.join(repo, 'docs/scifi-ui/scripts/formatx-orbital-core-v28.js'), 'utf8');
const previewMobile = fs.readFileSync(path.join(repo, 'docs/scifi-ui/styles/formatx-real3d-mobile-v29.css'), 'utf8');

// Production: reference-calibrated v24 MAG.
assert.match(production, /getContext\(['"]webgl2['"]/i, 'production core must use a real WebGL2 context');
assert.match(production, /gl\.enable\(gl\.DEPTH_TEST\)/, 'production depth testing must be enabled');
assert.match(production, /function\s+perspective\s*\(/, 'production perspective projection is required');
assert.match(production, /function\s+starGeometry\s*\(/, 'reference four-tip crystalline geometry is required');
assert.match(production, /function\s+sphereGeometry\s*\(/, 'production volumetric reactor geometry is required');
assert.match(production, /function\s+torusGeometry\s*\(/, 'production 3D reactor torus geometry is required');
assert.match(production, /function\s+crystalFilamentGeometry\s*\(/, 'production physical crystal filament geometry is required');
assert.match(production, /gl\.drawElements\(gl\.TRIANGLES/, 'production indexed triangle rendering is required');
assert.match(production, /fxCoreReal3d\s*=\s*['"]ready-v20['"]/, 'production renderer state marker is missing');
assert.match(production, /v24-volumetric-crystal/, 'reference v24 visual revision is missing');
assert.doesNotMatch(production, /drawImage\s*\(|new\s+Image\s*\(/i, 'production core must not substitute raster imagery');
assert.match(productionStyle, /pointer-events:\s*none/, 'production 3D stage must not capture pointer or scroll input');
assert.match(productionStyle, /clamp\(576px, 63svh, 896px\)/, 'production mobile reference composition is missing');

// Compatibility loader: never override production automatically with the geometrically different v29 preview.
assert.match(loader, /const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/, 'WebGPU preview must require explicit ?webgpu=1 opt-in');
assert.match(loader, /production-v24-authority/, 'loader must expose reference v24 production authority');
assert.match(loader, /webgl2-v24-reference-production/, 'loader must expose production WebGL2 reference state');
assert.match(loader, /if \(!WEBGPU_PREVIEW\)[\s\S]*return;/, 'production path must exit before loading the v29/v28 preview renderer');
assert.match(loader, /formatx-webgpu-core-v29\.js/, 'WebGPU v29 preview route is missing');
assert.match(loader, /formatx-orbital-core-v28\.js/, 'WebGL2 v28 preview fallback route is missing');

// Preview remains genuine indexed 3D rather than a fake image-based effect.
assert.match(previewWebgl, /getContext\(['"]webgl2['"]/i, 'preview fallback must use a real WebGL2 context');
assert.match(previewWebgl, /depth:\s*true/, 'preview WebGL context must use a depth buffer');
assert.match(previewWebgl, /gl\.enable\(gl\.DEPTH_TEST\)/, 'preview depth testing must be enabled');
assert.match(previewWebgl, /function\s+perspective\s*\(/, 'preview perspective projection is required');
assert.match(previewWebgl, /function\s+lookAt\s*\(/, 'preview 3D camera/view matrix is required');
assert.match(previewWebgl, /sphereGeometry\(/, 'preview volumetric sphere geometry is required');
assert.match(previewWebgl, /tubeGeometry\(/, 'preview 3D orbital tube geometry is required');
assert.match(previewWebgl, /gl\.drawElements\(gl\.TRIANGLES/, 'preview indexed triangle rendering is required');
assert.doesNotMatch(previewWebgl, /drawImage\s*\(|new\s+Image\s*\(/i, 'preview fallback must not be image-backed');
assert.match(previewMobile, /data-fx-orbital-core="ready-v28"/, 'preview mobile layout must bind to the actual WebGL renderer state');
assert.doesNotMatch(previewMobile, /background-image\s*:\s*url\(/i, 'preview real-3D composition must not substitute a poster image');

console.log('PASS: FormatX production uses the reference-calibrated indexed WebGL2 v24 MAG; WebGPU v29 is explicit preview only with a genuine indexed WebGL2 v28 fallback.');

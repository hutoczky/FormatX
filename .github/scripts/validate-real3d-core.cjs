'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const repo = path.resolve(__dirname, '../..');
const productionBootstrap = fs.readFileSync(path.join(repo, 'docs/scifi-ui/scripts/formatx-core-real3d-v20.js'), 'utf8');
const production = fs.readFileSync(path.join(repo, 'docs/scifi-ui/scripts/formatx-reference-lock-v30.js'), 'utf8');
const productionStyle = fs.readFileSync(path.join(repo, 'docs/scifi-ui/styles/formatx-reference-lock-v30.css'), 'utf8');
const loader = fs.readFileSync(path.join(repo, 'docs/scifi-ui/scripts/formatx-reference-core-v26.js'), 'utf8');
const previewWebgl = fs.readFileSync(path.join(repo, 'docs/scifi-ui/scripts/formatx-orbital-core-v28.js'), 'utf8');
const previewMobile = fs.readFileSync(path.join(repo, 'docs/scifi-ui/styles/formatx-real3d-mobile-v29.css'), 'utf8');

assert.match(productionBootstrap, /reference-lock-v30/, 'production compatibility bootstrap must select v30');
assert.match(productionBootstrap, /formatx-reference-lock-v30\.js\?v=20260810-uploaded-reference-lock-\d+/, 'cache-busted production renderer missing');
assert.match(productionBootstrap, /formatx-reference-lock-v30\.css\?v=20260810-uploaded-reference-lock-\d+/, 'cache-busted production style missing');
assert.equal((productionBootstrap.match(/getContext\(['"]webgl2['"]/gi) || []).length, 0, 'bootstrap must not create a duplicate WebGL2 context');
assert.equal((production.match(/getContext\(['"]webgl2['"]/gi) || []).length, 1, 'production v30 core must use exactly one real WebGL2 context');
assert.match(production, /gl\.enable\(gl\.DEPTH_TEST\)/, 'production depth testing must be enabled');
assert.match(production, /function\s+persp\s*\(/, 'production perspective projection is required');
assert.match(production, /function\s+crystal\s*\(/, 'reference four-tip crystalline geometry is required');
assert.match(production, /function\s+sphere\s*\(/, 'production moving reactor sphere geometry is required');
assert.match(production, /function\s+torus\s*\(/, 'production real 3D reactor/orbit torus geometry is required');
assert.match(production, /gl\.drawElements\(gl\.TRIANGLES/, 'production indexed triangle rendering is required');
assert.match(production, /gl\.drawElements\(gl\.LINES/, 'production indexed crystal-vein rendering is required');
assert.ok(production.includes("fxCoreReal3d='ready-v20'"), 'production compatibility renderer marker missing');
assert.ok(production.includes('ready-v30'), 'production v30 reference lock ready marker missing');
assert.ok(production.includes('uploaded-reference-20260810'), 'uploaded visual reference revision is missing');
assert.ok(production.includes('glass-dominant-sparse-veins-r4'), 'glass-dominant sparse-vein surface marker is missing');
assert.match(production, /p=\.68/, 'reference concave p-norm silhouette is missing');
assert.match(production, /mobile\?1\.50:1/, 'reference mobile vertical shell calibration is missing');
assert.match(production, /t=\.018/, 'thin reference reactor/orbit torus calibration is missing');
assert.match(production, /for\(const k of\[2,4,6,8,10,R\]\)/, 'sparse transverse vein geometry is missing');
assert.match(production, /Math\.floor\(A\/12\)/, 'sparse longitudinal vein geometry is missing');
assert.match(production, /mesh\(shell,mul\(B,sc\(\.998,\.998,\.998\)\),1,\.30/, 'dominant cyan translucent glass surface is missing');
assert.match(production, /mesh\(shell,mul\(B,sc\(\.992,\.992,\.992\)\),1,\.105/, 'violet translucent glass surface is missing');
assert.match(production, /lines\(shell,B,\.22/, 'reduced cyan vein opacity is missing');
assert.match(production, /lines\(shell,mul\(B,rz\(\.0035\)\),\.055/, 'reduced violet vein opacity is missing');
assert.match(production, /const rs=\[\.20,\.29,\.39,\.51\]/, 'four real inner reactor rings are missing');
assert.match(production, /const drift=/, 'moving internal white-cyan core is missing');
assert.match(production, /adaptive-60-plus-fps/, 'adaptive high-frame-rate target is missing');
assert.doesNotMatch(production, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(/i, 'production core must not substitute raster imagery');
assert.doesNotMatch(production, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i, 'production core must remain native first-party 3D');
assert.match(productionStyle, /pointer-events:none/, 'production 3D stage must not capture input');
assert.match(productionStyle, /--fx-core-x:50%/, 'portrait/mobile reference composition must be centered');
assert.match(productionStyle, /perspective\(560px\) rotateX\(63deg\)/, 'reference perspective energy floor is missing');

assert.match(loader, /const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/, 'WebGPU preview must require explicit ?webgpu=1 opt-in');
assert.match(loader, /production-v30-reference-lock-authority/, 'loader must expose v30 production authority');
assert.match(loader, /webgl2-v30-uploaded-reference-production/, 'loader must expose production v30 WebGL2 state');
assert.match(loader, /if \(!WEBGPU_PREVIEW\)[\s\S]*return;/, 'production path must exit before loading preview renderers');
assert.match(loader, /formatx-webgpu-core-v29\.js/, 'WebGPU v29 preview route is missing');
assert.match(loader, /formatx-orbital-core-v28\.js/, 'WebGL2 v28 preview fallback route is missing');

assert.match(previewWebgl, /getContext\(['"]webgl2['"]/i, 'preview fallback must use a real WebGL2 context');
assert.match(previewWebgl, /depth:\s*true/, 'preview WebGL context must use a depth buffer');
assert.match(previewWebgl, /gl\.enable\(gl\.DEPTH_TEST\)/, 'preview depth testing must be enabled');
assert.match(previewWebgl, /gl\.drawElements\(gl\.TRIANGLES/, 'preview indexed triangle rendering is required');
assert.doesNotMatch(previewWebgl, /drawImage\s*\(|new\s+Image\s*\(/i, 'preview fallback must not be image-backed');
assert.match(previewMobile, /data-fx-orbital-core="ready-v28"/, 'preview mobile layout must bind to the actual WebGL renderer state');
assert.doesNotMatch(previewMobile, /background-image\s*:\s*url\(/i, 'preview real-3D composition must not substitute a poster image');

console.log('PASS: FormatX production uses glass-dominant sparse-vein reference lock v30 r4 as a single-context indexed WebGL2 MAG; preview paths remain isolated.');

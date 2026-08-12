'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const desktop = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const mobile = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const runtime = read('docs/scifi-ui/scripts/formatx-core-reference-cinematic-v1.js');
const style = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');
const homepage = read('docs/scifi-ui/index.html');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /const SCRIPT = '\/scifi-ui\/scripts\/formatx-core-reference-v53\.js/);
assert.match(bootstrap, /const STYLE = '\/scifi-ui\/styles\/formatx-core-reference-v53\.css/);
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260812-four-point-reference-r1/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260812-four-point-reference-r1/);
assert.match(bootstrap, /single-webgl2-reference-crystal-v53/);
assert.match(bootstrap, /single-webgl2-mobile-cinematic-crystal-v55/);
assert.equal((bootstrap.match(/getContext\(['"]webgl2['"]/g) || []).length, 0, 'bootstrap must not create WebGL');

assert.match(desktop, /fxCoreRendererMode = 'desktop'/);
assert.match(mobile, /fxCoreRendererMode = 'mobile'/);
assert.match(desktop, /formatx-core-reference-cinematic-v1\.js\?v=20260812-four-point-reference-r1/);
assert.match(mobile, /formatx-core-reference-cinematic-v1\.js\?v=20260812-four-point-reference-r1/);
assert.equal((desktop.match(/getContext\(['"]webgl2['"]/g) || []).length, 0, 'desktop wrapper must not create a second context');
assert.equal((mobile.match(/getContext\(['"]webgl2['"]/g) || []).length, 0, 'mobile wrapper must not create a second context');
assert.equal((runtime.match(/getContext\(['"]webgl2['"]/g) || []).length, 1, 'shared production renderer must own exactly one WebGL2 creation site');

for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawArrays(gl.TRIANGLES',
  'gl.drawArrays(drawMode',
  'gl.POINTS',
  'function outlineRadius(',
  'function surfacePoint(',
  'function buildShell(',
  'function starContour(',
  'function radialFacets(',
  'function ring(',
  'function arc(',
  'IntersectionObserver',
  'ResizeObserver',
  'webglcontextlost',
  'reference-four-point-crystal-v1',
  'sharp-four-tip-concave-crystal-v53',
  'clean-faceted-refractive-glass-v53',
  'moving-white-nucleus-concentric-spectral-rings-v53',
  'single-context-adaptive-60-plus-fps',
  'physical-triangle-ribbons-interactive-r2',
  'inside-moving-volume-r2',
  'formatx:coreinteraction'
]) assert.ok(runtime.includes(token), `missing four-point renderer contract: ${token}`);

assert.match(runtime, /budget=mobile\?1100000:2500000/);
assert.match(runtime, /premultipliedAlpha:true/);
assert.match(runtime, /powerPreference:mobile\?'default':'high-performance'/);
assert.match(runtime, /prefers-reduced-motion/);
assert.doesNotMatch(runtime, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|backgroundImage/i, 'MAG must remain geometry-backed');
assert.doesNotMatch(runtime, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i, 'third-party scene engine is forbidden');

assert.match(style, /pointer-events:\s*none\s*!important/);
assert.match(style, /filter:\s*none\s*!important/);
assert.match(style, /min-height:\s*clamp\(500px, 58svh, 660px\)/);
assert.doesNotMatch(style, /clip-path:\s*polygon/i);
assert.ok(homepage.includes('formatx-core-real3d-v20.js'));
const q = contract.quality_contract;
assert.equal(q.mag_image_backed, false);
assert.equal(q.mag_webgl_context_count, 1);
assert.equal(q.mag_paused_outside_hero, true);

new Function(runtime);new Function(desktop);new Function(mobile);new Function(bootstrap);
console.log('PASS: production MAG uses one shared native WebGL2 four-point cinematic crystal renderer, with v53/v55 compatibility, real shell geometry, reactor rings, interaction and adaptive rendering.');

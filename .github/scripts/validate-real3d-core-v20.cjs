'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const desktop = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const mobile = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const desktopRenderer = read('docs/scifi-ui/scripts/formatx-core-reference-cinematic-v1.js');
const mobileRenderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-v62.js');
const desktopStyle = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');
const mobileStyle = read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const homepage = read('docs/scifi-ui/index.html');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260812-four-point-reference-r1/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260813-pixel-reference-native-v62-r1/);
assert.match(bootstrap, /single-webgl2-reference-crystal-v53/);
assert.match(bootstrap, /single-webgl2-mobile-pixel-reference-v62/);
assert.equal((bootstrap.match(/getContext\(['"]webgl2['"]/g) || []).length, 0, 'bootstrap must not create WebGL');

assert.match(desktop, /fxCoreRendererMode = 'desktop'/);
assert.match(mobile, /fxCoreRendererMode = 'mobile'/);
assert.match(desktop, /formatx-core-reference-cinematic-v1\.js\?v=20260812-four-point-reference-r1/);
assert.match(mobile, /formatx-core-mobile-reference-v62\.js/);
assert.doesNotMatch(mobile, /formatx-core-mobile-reference-fidelity-v61\.js/);
assert.equal((desktop.match(/getContext\(['"]webgl2['"]/g) || []).length, 0);
assert.equal((mobile.match(/getContext\(['"]webgl2['"]/g) || []).length, 0);
assert.equal((desktopRenderer.match(/getContext\(['"]webgl2['"]/g) || []).length, 1);
assert.equal((mobileRenderer.match(/getContext\(['"]webgl2['"]/g) || []).length, 1, 'mobile v62 must own exactly one WebGL2 context creation site');

for (const token of [
  'gl.enable(gl.DEPTH_TEST)','gl.drawArrays(gl.TRIANGLES','gl.POINTS',
  'function outlineRadius(','function surfacePoint(','function buildShell(',
  'IntersectionObserver','ResizeObserver','webglcontextlost','reference-four-point-crystal-v1',
  'sharp-four-tip-concave-crystal-v53','clean-faceted-refractive-glass-v53',
  'moving-white-nucleus-concentric-spectral-rings-v53','single-context-adaptive-60-plus-fps',
  'formatx:coreinteraction'
]) assert.ok(desktopRenderer.includes(token), `missing desktop v53 renderer contract: ${token}`);

for (const token of [
  'pixel-reference-native-webgl2-v62','function outlinePoint(','function surfacePoint(',
  'function shellGeo(','function ribbonOutline(','function radialRibs(','function torus(','function sphere(',
  'gl.enable(gl.DEPTH_TEST)','gl.drawArrays(gl.TRIANGLES','gl.POINTS',
  'premultipliedAlpha:true','ResizeObserver','IntersectionObserver','webglcontextlost',
  'formatx:coreinteraction','single-webgl2-mobile-pixel-reference-v62',
  'pixel-locked-organic-concave-four-point-v62','multishell-refractive-crystal-glass-v62',
  'white-cyan-spherical-reactor-orbital-rings-v62','native-webgl2-no-overlay-v62',
  'single-context-adaptive-60-plus-fps'
]) assert.ok(mobileRenderer.includes(token), `missing mobile v62 renderer contract: ${token}`);

assert.match(desktopRenderer, /premultipliedAlpha:true/);
assert.doesNotMatch(desktopRenderer, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|backgroundImage/i);
assert.doesNotMatch(mobileRenderer, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(/i);
assert.doesNotMatch(desktopRenderer + mobileRenderer, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);

assert.match(desktopStyle, /pointer-events:\s*none\s*!important/);
assert.match(desktopStyle, /min-height:\s*clamp\(500px, 58svh, 660px\)/);
assert.match(mobileStyle, /#hero \.hero-space > \.fx-core-mobile-v55-stage/);
assert.doesNotMatch(mobileStyle, /clip-path:\s*polygon/i);
assert.ok(homepage.includes('formatx-core-real3d-v20.js'));
const q = contract.quality_contract;
assert.equal(q.mag_image_backed, false);
assert.equal(q.mag_webgl_context_count, 1);
assert.equal(q.mag_paused_outside_hero, true);

new Function(desktopRenderer);new Function(mobileRenderer);new Function(desktop);new Function(mobile);new Function(bootstrap);
console.log('PASS: desktop v53 remains native WebGL2; mobile v62 is one complete native WebGL2 pixel-reference crystal with no raster/SVG fidelity overlay.');

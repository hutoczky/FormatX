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
const mobileRenderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-v60.js');
const mobileFidelity = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-fidelity-v61.js');
const css = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260812-four-point-reference-r1/);
assert.match(bootstrap, /formatx-core-reference-v53\.css\?v=20260812-four-point-reference-r1/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260812-reference-fidelity-v61-r1/);
assert.match(desktop, /formatx-core-reference-cinematic-v1\.js\?v=20260812-four-point-reference-r1/);
assert.match(mobile, /formatx-core-mobile-reference-v60\.js/);
assert.match(mobile, /formatx-core-mobile-reference-fidelity-v61\.js/);
assert.equal((desktopRenderer.match(/getContext\(['"]webgl2['"]/g) || []).length, 1);
assert.equal((mobileRenderer.match(/getContext\(['"]webgl2['"]/g) || []).length, 1);
assert.equal((mobileFidelity.match(/getContext\(['"]webgl2['"]/g) || []).length, 0);

for (const token of [
  'gl.enable(gl.DEPTH_TEST)','gl.drawArrays(gl.TRIANGLES','gl.POINTS','function outlineRadius(',
  'function surfacePoint(','function buildShell(','function starContour(','function radialFacets(',
  'reference-four-point-crystal-v1','sharp-four-tip-concave-crystal-v53',
  'clean-faceted-refractive-glass-v53','moving-white-nucleus-concentric-spectral-rings-v53',
  'single-context-adaptive-60-plus-fps','webglcontextlost'
]) assert.ok(desktopRenderer.includes(token), `missing desktop release renderer contract: ${token}`);

for (const token of [
  'cinematic-glass-reference-v60','function outlinePoint(','function surfacePoint(','function shellGeo(',
  'function bandContour(','function spineBand(','gl.enable(gl.DEPTH_TEST)',
  'gl.drawArrays(gl.TRIANGLES','gl.POINTS','asymmetric-deep-concave-four-point-reference-v60',
  'refractive-band-threaded-glass-v60','layered-white-cyan-violet-reactor-v60',
  'single-context-adaptive-60-plus-fps','webglcontextlost'
]) assert.ok(mobileRenderer.includes(token), `missing mobile v60 release renderer contract: ${token}`);
for (const token of ['createElementNS','fx-core-fidelity-v61','emissive-vector-over-real-webgl2-v61','fx61-crystal','fx61-reactor-rings']) {
  assert.ok(mobileFidelity.includes(token), `missing mobile v61 fidelity contract: ${token}`);
}

assert.match(desktopRenderer, /budget=mobile\?1100000:2500000/);
assert.doesNotMatch(desktopRenderer + mobileRenderer + mobileFidelity, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(/i);
assert.doesNotMatch(desktopRenderer + mobileRenderer + mobileFidelity, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);
assert.match(css, /pointer-events:\s*none\s*!important/);
assert.match(css, /min-height:\s*clamp\(500px, 58svh, 660px\)/);
new Function(desktopRenderer);new Function(mobileRenderer);new Function(mobileFidelity);new Function(desktop);new Function(mobile);
console.log('PASS: release MAG keeps desktop v53 and mobile v60 native WebGL2 with v61 emissive fidelity.');

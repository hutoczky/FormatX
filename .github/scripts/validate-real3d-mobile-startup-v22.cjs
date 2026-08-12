'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const desktopRuntime = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const mobileWrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const desktopRenderer = read('docs/scifi-ui/scripts/formatx-core-reference-cinematic-v1.js');
const mobileRenderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-v60.js');
const mobileFidelity = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-fidelity-v61.js');
const mobileStyle = read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const homepage = read('docs/scifi-ui/index.html');

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /const MOBILE_SCRIPT = '\/scifi-ui\/scripts\/formatx-core-mobile-v55\.js/);
assert.match(bootstrap, /const MOBILE_STYLE = '\/scifi-ui\/styles\/formatx-core-mobile-v55\.css/);
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260812-four-point-reference-r1/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260812-reference-fidelity-v61-r1/);
assert.match(bootstrap, /formatx-core-mobile-v55\.css\?v=20260812-award-composition-r2/);
assert.match(bootstrap, /single-webgl2-reference-crystal-v53/);
assert.match(bootstrap, /single-webgl2-mobile-cinematic-reference-v60/);
assert.match(bootstrap, /loading-v61/);
assert.match(bootstrap, /ready-v61/);
assert.match(bootstrap, /if \(mobile\) \{[\s\S]*addMobileStyle\(\);[\s\S]*addMobileScript\(\);[\s\S]*\} else \{[\s\S]*addStyle\(\);[\s\S]*addScript\(\);/);

assert.match(desktopRuntime, /fxCoreRendererMode = 'desktop'/);
assert.match(desktopRuntime, /formatx-core-reference-cinematic-v1\.js\?v=20260812-four-point-reference-r1/);
assert.match(mobileWrapper, /fxCoreRendererMode = 'mobile'/);
assert.match(mobileWrapper, /formatx-core-mobile-reference-v60\.js/);
assert.match(mobileWrapper, /formatx-core-mobile-reference-fidelity-v61\.js/);
assert.equal((desktopRuntime.match(/getContext\(['"]webgl2['"]/g) || []).length, 0);
assert.equal((mobileWrapper.match(/getContext\(['"]webgl2['"]/g) || []).length, 0);
assert.equal((desktopRenderer.match(/getContext\(['"]webgl2['"]/g) || []).length, 1);
assert.equal((mobileRenderer.match(/getContext\(['"]webgl2['"]/g) || []).length, 1, 'mobile v60 renderer must own one WebGL2 context creation site');
assert.equal((mobileFidelity.match(/getContext\(['"]webgl2['"]/g) || []).length, 0, 'mobile v61 fidelity must not create a WebGL context');

for (const token of [
  'cinematic-glass-reference-v60','function outlinePoint(','function surfacePoint(',
  'function shellGeo(','function bandContour(','function spineBand(',
  'gl.enable(gl.DEPTH_TEST)','gl.drawArrays(gl.TRIANGLES','gl.POINTS',
  'premultipliedAlpha:true','ResizeObserver','IntersectionObserver','webglcontextlost',
  'formatx:coreinteraction','asymmetric-deep-concave-four-point-reference-v60',
  'refractive-band-threaded-glass-v60','layered-white-cyan-violet-reactor-v60',
  'single-context-adaptive-60-plus-fps'
]) assert.ok(mobileRenderer.includes(token), `missing mobile v60 contract: ${token}`);
for (const token of [
  'createElementNS','fx-core-fidelity-v61','emissive-vector-over-real-webgl2-v61',
  'fx61-crystal','fx61-reactor-rings','fx61-floor'
]) assert.ok(mobileFidelity.includes(token), `missing mobile v61 contract: ${token}`);
assert.doesNotMatch(mobileRenderer + mobileFidelity, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(/i);
assert.doesNotMatch(mobileRenderer + mobileFidelity, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);

assert.match(mobileStyle, /#hero \.hero-space > \.fx-core-mobile-v55-stage/);
assert.match(mobileStyle, /position:\s*absolute\s*!important/);
assert.match(mobileStyle, /contain:\s*none\s*!important/);
assert.match(mobileStyle, /height:\s*clamp\(590px,68svh,760px\)/);
assert.doesNotMatch(mobileStyle, /clip-path:\s*polygon/i);
assert.ok(homepage.includes('formatx-core-real3d-v20.js'));
new Function(desktopRuntime);new Function(mobileWrapper);new Function(desktopRenderer);new Function(mobileRenderer);new Function(mobileFidelity);new Function(bootstrap);
console.log('PASS: desktop keeps v53; mobile v55 routes to one real v60 WebGL2 crystal plus v61 emissive vector fidelity layer.');

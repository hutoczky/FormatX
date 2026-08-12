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
const mobileRenderer = read('docs/scifi-ui/scripts/formatx-core-mobile-award-v56.js');
const mobileStyle = read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const homepage = read('docs/scifi-ui/index.html');

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /const MOBILE_SCRIPT = '\/scifi-ui\/scripts\/formatx-core-mobile-v55\.js/);
assert.match(bootstrap, /const MOBILE_STYLE = '\/scifi-ui\/styles\/formatx-core-mobile-v55\.css/);
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260812-four-point-reference-r1/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260812-award-crystal-r1/);
assert.match(bootstrap, /formatx-core-mobile-v55\.css\?v=20260812-award-composition-r2/);
assert.match(bootstrap, /single-webgl2-reference-crystal-v53/);
assert.match(bootstrap, /single-webgl2-mobile-award-crystal-v56/);
assert.match(bootstrap, /if \(mobile\) \{[\s\S]*addMobileStyle\(\);[\s\S]*addMobileScript\(\);[\s\S]*\} else \{[\s\S]*addStyle\(\);[\s\S]*addScript\(\);/);

assert.match(desktopRuntime, /fxCoreRendererMode = 'desktop'/);
assert.match(desktopRuntime, /formatx-core-reference-cinematic-v1\.js\?v=20260812-four-point-reference-r1/);
assert.match(mobileWrapper, /fxCoreRendererMode = 'mobile'/);
assert.match(mobileWrapper, /formatx-core-mobile-award-v56\.js\?v=20260812-award-crystal-r1/);
assert.equal((desktopRuntime.match(/getContext\(['"]webgl2['"]/g) || []).length, 0);
assert.equal((mobileWrapper.match(/getContext\(['"]webgl2['"]/g) || []).length, 0);
assert.equal((desktopRenderer.match(/getContext\(['"]webgl2['"]/g) || []).length, 1);
assert.equal((mobileRenderer.match(/getContext\(['"]webgl2['"]/g) || []).length, 1, 'mobile award renderer must own one WebGL2 context creation site');

for (const token of [
  'award-four-point-concave-crystal-v56',
  'function outlinePoint(',
  'quadratic Bezier',
  'function surfacePoint(',
  'function buildShell(',
  'function starContour(',
  'function radialFacets(',
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawArrays(gl.TRIANGLES',
  'gl.POINTS',
  'premultipliedAlpha:true',
  'budget=1150000',
  'ResizeObserver',
  'IntersectionObserver',
  'webglcontextlost',
  'formatx:coreinteraction',
  'quadratic-bezier-cusped-outline-v56',
  'bright-faceted-fresnel-glass-v56',
  'white-reactor-nucleus-concentric-cyan-violet-rings-v56',
  'single-context-adaptive-60-plus-fps'
]) assert.ok(mobileRenderer.includes(token), `missing mobile v56 contract: ${token}`);
assert.doesNotMatch(mobileRenderer, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|backgroundImage/i);
assert.doesNotMatch(mobileRenderer, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i);

assert.match(mobileStyle, /#hero \.hero-space > \.fx-core-mobile-v55-stage/);
assert.match(mobileStyle, /position:\s*absolute\s*!important/);
assert.match(mobileStyle, /contain:\s*none\s*!important/);
assert.match(mobileStyle, /height:\s*clamp\(590px,68svh,760px\)/);
assert.doesNotMatch(mobileStyle, /clip-path:\s*polygon/i);
assert.ok(homepage.includes('formatx-core-real3d-v20.js'));
new Function(desktopRuntime);new Function(mobileWrapper);new Function(desktopRenderer);new Function(mobileRenderer);new Function(bootstrap);
console.log('PASS: desktop keeps v53 shared WebGL2 reference renderer; mobile v55 routes to one native v56 sharp concave award crystal with bright reactor, adaptive rendering and hero-local interaction.');

'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const desktopRuntime = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const mobileRuntime = read('docs/scifi-ui/scripts/formatx-core-mobile-v54.js');
const mobileStyle = read('docs/scifi-ui/styles/formatx-core-mobile-v54.css');
const homepage = read('docs/scifi-ui/index.html');

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260811-reference-v53-r1/);
assert.match(bootstrap, /formatx-core-reference-v53\.css\?v=20260811-reference-v53-r1/);
assert.match(bootstrap, /formatx-core-mobile-v54\.js\?v=20260811-physical-mobile-v54-r1/);
assert.match(bootstrap, /formatx-core-mobile-v54\.css\?v=20260811-physical-mobile-v54-r1/);
assert.match(bootstrap, /single-webgl2-reference-crystal-v53/);
assert.match(bootstrap, /single-webgl2-mobile-crystal-v54/);
assert.match(bootstrap, /if \(mobile\) \{[\s\S]*addMobileStyle\(\);[\s\S]*addMobileScript\(\);[\s\S]*\} else \{[\s\S]*addStyle\(\);[\s\S]*addScript\(\);/);

assert.equal((desktopRuntime.match(/getContext\('webgl2'/g) || []).length, 1, 'desktop v53 path must create exactly one WebGL2 context');
assert.equal((mobileRuntime.match(/getContext\('webgl2'/g) || []).length, 1, 'physical mobile v54 path must create exactly one WebGL2 context');
assert.match(mobileRuntime, /hero&&hero\.querySelector\('\.hero-space'\)/, 'mobile renderer must resolve hero-space');
assert.match(mobileRuntime, /host\.prepend\(stage\)/, 'mobile must mount the stage inside hero-space');
assert.match(mobileRuntime, /premultipliedAlpha:true/, 'physical Android compositor-safe alpha mode missing');
assert.match(mobileRuntime, /budget=920000/, 'bounded mobile pixel budget missing');
assert.match(mobileRuntime, /powerPreference:'default'/, 'mobile power policy missing');
assert.match(mobileRuntime, /ResizeObserver/, 'mobile canvas must resize with hero host');
assert.match(mobileRuntime, /IntersectionObserver/, 'renderer must pause outside hero');
assert.match(mobileRuntime, /webglcontextlost/, 'context loss handling missing');
assert.match(mobileRuntime, /sharp-four-tip-concave-crystal-v54/);
assert.match(mobileRuntime, /moving-white-nucleus-spectral-rings-v54/);
assert.match(mobileRuntime, /single-context-adaptive-60-plus-fps/);
assert.doesNotMatch(mobileRuntime, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(/i, 'mobile MAG must not be raster-backed');

assert.match(mobileStyle, /#hero \.hero-space > \.fx-core-mobile-v54-stage/);
assert.match(mobileStyle, /position:\s*absolute\s*!important/);
assert.match(mobileStyle, /filter:\s*none\s*!important/);
assert.match(mobileStyle, /contain:\s*none\s*!important/);
assert.match(mobileStyle, /height:\s*clamp\(430px,55svh,560px\)/);
assert.doesNotMatch(mobileStyle, /clip-path:\s*polygon/i);

assert.ok(homepage.includes('formatx-core-real3d-v20.js'));
new Function(desktopRuntime);
new Function(mobileRuntime);
new Function(bootstrap);
console.log('PASS: desktop v53 and physical-mobile v54 are split cleanly; mobile is hero-local, premultiplied, one-context, filter-free, adaptive and renders the sharp animated crystal with native WebGL2.');

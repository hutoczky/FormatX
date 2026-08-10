'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const runtime = read('docs/scifi-ui/scripts/formatx-core-reference-v53.js');
const style = read('docs/scifi-ui/styles/formatx-core-reference-v53.css');
const homepage = read('docs/scifi-ui/index.html');

assert.match(bootstrap, /reference-crystal-core-v53/);
assert.match(bootstrap, /formatx-core-reference-v53\.js\?v=20260811-reference-v53-r1/);
assert.match(bootstrap, /formatx-core-reference-v53\.css\?v=20260811-reference-v53-r1/);
assert.match(bootstrap, /single-webgl2-reference-crystal-v53/);

assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'unified v53 path must create exactly one WebGL2 context');
assert.match(runtime, /hero&&hero\.querySelector\('\.hero-space'\)/, 'mobile renderer must resolve hero-space');
assert.match(runtime, /\(mobile\?host:document\.body\)\.prepend\(stage\)/, 'mobile must mount the stage inside hero-space');
assert.match(runtime, /budget=mobile\?1150000:2400000/, 'bounded mobile pixel budget missing');
assert.match(runtime, /powerPreference:mobile\?'default':'high-performance'/, 'mobile power policy missing');
assert.match(runtime, /ResizeObserver/, 'mobile canvas must resize with hero host');
assert.match(runtime, /IntersectionObserver/, 'renderer must pause outside hero');
assert.match(runtime, /webglcontextlost/, 'context loss handling missing');
assert.match(runtime, /sharp-four-tip-concave-crystal-v53/);
assert.match(runtime, /moving-white-nucleus-concentric-spectral-rings-v53/);
assert.match(runtime, /single-context-adaptive-60-plus-fps/);
assert.doesNotMatch(runtime, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(/i, 'mobile MAG must not be raster-backed');

assert.match(style, /#hero \.hero-space > \.fx-core-reference-v53-stage/);
assert.match(style, /position:\s*absolute\s*!important/);
assert.match(style, /filter:\s*none\s*!important/);
assert.match(style, /contain:\s*none\s*!important/);
assert.match(style, /min-height:\s*clamp\(500px, 58svh, 660px\)/);
assert.doesNotMatch(style, /clip-path:\s*polygon/i);

assert.ok(homepage.includes('formatx-core-real3d-v20.js'));
new Function(runtime);
new Function(bootstrap);
console.log('PASS: v53 physical-mobile startup is hero-local, one-context, filter-free, adaptive and uses the same sharp animated reference crystal as desktop.');

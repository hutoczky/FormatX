'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const runtime = read('docs/scifi-ui/scripts/formatx-core-v50.js');
const premium = read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const style = read('docs/scifi-ui/styles/formatx-core-v50.css');
const homepage = read('docs/scifi-ui/index.html');

assert.match(bootstrap, /rounded-living-core-v50/, 'v50 production bootstrap missing');
assert.match(bootstrap, /fxCoreReal3d = 'ready-v20'/, 'compatibility ownership marker missing');
assert.match(bootstrap, /single-webgl2-rounded-living-core-v50/, 'v50 renderer marker missing');
assert.match(runtime, /powerPreference: mobile \? 'default' : 'high-performance'/, 'mobile power policy missing');
assert.match(runtime, /webglcontextlost/, 'context loss reporting missing');
assert.match(runtime, /const mobileQuery = matchMedia\('\(max-width: 900px\), \(pointer: coarse\), \(max-aspect-ratio: 27\/25\)'\)/, 'mobile detection missing');
assert.match(runtime, /const dprCap = mobile \? 1\.35 : 1\.75/, 'bounded DPR policy missing');
assert.match(runtime, /const budget = mobile \? 1450000 : 2600000/, 'adaptive pixel budget missing');
assert.match(runtime, /Math\.sqrt\(budget \/ Math\.max\(1, w \* h \* dpr \* dpr\)\)/, 'pixel-budget scaling missing');
assert.match(runtime, /const portrait = aspect < 1\.08/, 'portrait layout must be based on aspect ratio');
assert.match(runtime, /clamp\(viewW \* \.34, \.36, \.66\)/, 'mobile core must remain bounded to viewport width');
assert.match(runtime, /const x = portrait \? 0 : viewW \* \.18/, 'portrait core must stay centered');
assert.match(runtime, /single-context-adaptive-60-plus-fps/, 'adaptive performance marker missing');
assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'v50 must have exactly one WebGL2 context creation site');
assert.doesNotMatch(runtime, /desynchronized\s*:/, 'desynchronized WebGL context remains forbidden on mobile');
assert.match(runtime, /document\.hidden/);
assert.match(runtime, /IntersectionObserver/);

assert.match(premium, /if \(document\.querySelector\('script\[data-fx-core-real3d="true"\]'\)\) return 'webgl2-pending'/, 'dedicated renderer must bypass extra preflight contexts');
assert.match(premium, /addEventListener\('formatx:core3dfallback', handleCoreFallback\)/, 'GPU failure must activate resilient fallback');
assert.match(style, /pointer-events:\s*none\s*!important/, 'GPU stage must never capture touch input');
assert.match(style, /--fx-core-x:\s*50%/, 'portrait composition must be centered');
assert.match(style, /min-height:\s*clamp\(460px, 55svh, 690px\)/, 'mobile hero visual space must remain bounded');
assert.doesNotMatch(style, /clip-path:\s*polygon/i, 'mobile diamond overlay must remain retired');
assert.doesNotMatch(style, /scale\(\.78,\s*1\.04\)/, 'mobile stretched canvas regression must remain retired');
assert.ok(homepage.includes('formatx-core-real3d-v20.js'), 'stable compatibility bootstrap missing from homepage');

new Function(runtime);
console.log('PASS: v50 mobile startup uses one bounded WebGL2 living orb with centered framing, adaptive DPR and resilient fallback signaling.');

'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const runtime = read('docs/scifi-ui/scripts/formatx-core-v51.js');
const premium = read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const style = read('docs/scifi-ui/styles/formatx-core-v51.css');
const homepage = read('docs/scifi-ui/index.html');

assert.match(bootstrap, /reference-crystal-core-v51/, 'v51 production bootstrap missing');
assert.match(bootstrap, /fxCoreReal3d = 'ready-v20'/, 'compatibility ownership marker missing');
assert.match(bootstrap, /single-webgl2-reference-crystal-v51/, 'v51 renderer marker missing');
assert.match(runtime, /powerPreference: mobile \? 'default' : 'high-performance'/, 'mobile power policy missing');
assert.match(runtime, /webglcontextlost/, 'context loss reporting missing');
assert.match(runtime, /const mobileQuery = matchMedia\('\(max-width: 900px\), \(pointer: coarse\), \(max-aspect-ratio: 27\/25\)'\)/, 'mobile detection missing');
assert.match(runtime, /const dprCap = mobile \? 1\.30 : 1\.70/, 'bounded DPR policy missing');
assert.match(runtime, /const budget = mobile \? 1350000 : 2500000/, 'adaptive pixel budget missing');
assert.match(runtime, /Math\.sqrt\(budget \/ targetPixels\)/, 'pixel-budget scaling missing');
assert.match(runtime, /const portrait = mobile \|\| h > w \* 1\.08/, 'portrait layout contract missing');
assert.match(runtime, /clamp\(w \* \.00134, \.46, \.60\)/, 'mobile crystal scale must remain bounded');
assert.match(runtime, /const x = portrait \? 0 : \.78/, 'portrait crystal must stay centered');
assert.match(runtime, /sharp-four-tip-concave-crystal-v51/, 'approved four-tip geometry marker missing');
assert.match(runtime, /single-context-adaptive-60-plus-fps/, 'adaptive performance marker missing');
assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'v51 must have exactly one WebGL2 context creation site');
assert.match(runtime, /document\.hidden/);
assert.match(runtime, /IntersectionObserver/);

assert.match(premium, /if \(document\.querySelector\('script\[data-fx-core-real3d="true"\]'\)\) return 'webgl2-pending'/, 'dedicated renderer must bypass extra preflight contexts');
assert.match(premium, /addEventListener\('formatx:core3dfallback', handleCoreFallback\)/, 'GPU failure must activate resilient fallback');
assert.match(style, /pointer-events:\s*none\s*!important/, 'GPU stage must never capture touch input');
assert.match(style, /--fx-core-x:\s*50%/, 'portrait composition must be centered');
assert.match(style, /min-height:\s*clamp\(540px, 61svh, 820px\)/, 'mobile hero visual space must remain bounded');
assert.doesNotMatch(style, /clip-path:\s*polygon/i, 'CSS fake crystal overlay must remain retired');
assert.ok(homepage.includes('formatx-core-real3d-v20.js'), 'stable compatibility bootstrap missing from homepage');

new Function(runtime);
console.log('PASS: v51 mobile startup uses one bounded WebGL2 reference crystal with sharp four-tip geometry, centered framing, adaptive DPR and resilient fallback signaling.');

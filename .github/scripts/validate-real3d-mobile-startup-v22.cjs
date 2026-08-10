'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const runtime = read('docs/scifi-ui/scripts/formatx-core-v51.js');
const mobileCompat = read('docs/scifi-ui/scripts/formatx-core-mobile-compat-v52.js');
const premium = read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const style = read('docs/scifi-ui/styles/formatx-core-v51.css');
const mobileCompatStyle = read('docs/scifi-ui/styles/formatx-core-mobile-compat-v52.css');
const homepage = read('docs/scifi-ui/index.html');

assert.match(bootstrap, /reference-crystal-core-v51/, 'v51 production bootstrap missing');
assert.match(bootstrap, /fxCoreReal3d = 'ready-v20'/, 'compatibility ownership marker missing');
assert.match(bootstrap, /single-webgl2-reference-crystal-v51/, 'v51 renderer marker missing');
assert.match(bootstrap, /formatx-core-mobile-compat-v52\.js\?v=20260811-mobile-safe-v52-4/, 'physical mobile r4 cache-busted renderer missing');
assert.match(bootstrap, /formatx-core-mobile-compat-v52\.css\?v=20260811-mobile-safe-v52-4/, 'physical mobile r4 cache-busted style missing');

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

assert.match(mobileCompat, /v52-mobile-safe-hero-local-volumetric-crystal-r4/, 'physical mobile hero-local renderer revision missing');
assert.match(mobileCompat, /hero\.querySelector\('\.hero-space'\)/, 'mobile renderer must resolve the hero visual host');
assert.match(mobileCompat, /host\.prepend\(stage\)/, 'mobile renderer must be hosted inside the hero visual slot');
assert.match(mobileCompat, /premultipliedAlpha:true/, 'mobile compositor-safe premultiplied WebGL path missing');
assert.match(mobileCompat, /powerPreference:'high-performance'/, 'mobile renderer power preference missing');
assert.match(mobileCompat, /contain','none','important'/, 'mobile fixed-layer containment must be retired');
assert.match(mobileCompat, /filter','none','important'/, 'mobile WebGL CSS filter chain must be retired');
assert.match(mobileCompat, /sharp-four-tip-concave-crystal-v51/, 'mobile four-tip geometry marker missing');
assert.match(mobileCompat, /moving-white-nucleus-concentric-spectral-rings-v51/, 'mobile reactor marker missing');
assert.match(mobileCompat, /hero-space-local-webgl2/, 'mobile hero-local ownership marker missing');
assert.match(mobileCompat, /const budget=1150000/, 'mobile pixel budget must remain bounded');
assert.match(mobileCompat, /ResizeObserver/, 'mobile hero-local canvas must react to host size changes');
assert.match(mobileCompat, /IntersectionObserver/, 'mobile renderer must pause outside the hero viewport');
assert.equal((mobileCompat.match(/getContext\('webgl2'/g) || []).length, 1, 'mobile path must create exactly one WebGL2 context');

assert.match(premium, /if \(document\.querySelector\('script\[data-fx-core-real3d="true"\]'\)\) return 'webgl2-pending'/, 'dedicated renderer must bypass extra preflight contexts');
assert.match(premium, /addEventListener\('formatx:core3dfallback', handleCoreFallback\)/, 'GPU failure must activate resilient fallback');
assert.match(style, /pointer-events:\s*none\s*!important/, 'GPU stage must never capture touch input');
assert.match(style, /--fx-core-x:\s*50%/, 'portrait composition must be centered');
assert.match(style, /min-height:\s*clamp\(540px, 61svh, 820px\)/, 'base mobile hero visual space must remain bounded');
assert.doesNotMatch(style, /clip-path:\s*polygon/i, 'CSS fake crystal overlay must remain retired');

assert.match(mobileCompatStyle, /min-height:\s*clamp\(500px, 58svh, 660px\)/, 'physical mobile hero slot must be bounded');
assert.match(mobileCompatStyle, /position:\s*absolute\s*!important/, 'physical mobile WebGL stage must be hero-local, not fixed');
assert.match(mobileCompatStyle, /filter:\s*none\s*!important/, 'physical mobile WebGL compositor filter must remain disabled');
assert.match(mobileCompatStyle, /contain:\s*none\s*!important/, 'physical mobile strict containment must remain disabled');
assert.doesNotMatch(mobileCompatStyle, /position:\s*fixed\s*!important/, 'physical mobile renderer must not return to fixed full-screen composition');

assert.ok(homepage.includes('formatx-core-real3d-v20.js'), 'stable compatibility bootstrap missing from homepage');

new Function(runtime);
new Function(mobileCompat);
console.log('PASS: v51 desktop and v52 physical-mobile startup use bounded native WebGL2 crystals; mobile is hero-local, filter-free, one-context, four-tip and compositor-safe.');

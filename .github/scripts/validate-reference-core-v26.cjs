'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

const bootstrap = fs.readFileSync(path.join(root, 'docs/scifi-ui/scripts/formatx-reference-core-v26.js'), 'utf8');
const src = fs.readFileSync(path.join(root, 'docs/scifi-ui/scripts/formatx-orbital-core-v28.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'docs/scifi-ui/styles/formatx-orbital-core-v28.css'), 'utf8');
const cinematic = fs.readFileSync(path.join(root, 'docs/scifi-ui/scripts/formatx-cinematic-core-v27.js'), 'utf8');
const entry = fs.readFileSync(path.join(root, 'billing-worker/src/production-entry.js'), 'utf8');

assert.match(bootstrap, /retired-diamond-v26/, 'legacy diamond renderer must be retired');
assert.match(bootstrap, /formatx-orbital-core-v28\.js\?v=20260809-reference-orb-v28-\d+/, 'v28 compatibility bootstrap missing');
assert.match(bootstrap, /formatx-orbital-core-v28\.css\?v=20260809-reference-orb-v28-\d+/, 'v28 CSS bootstrap missing');
assert.match(cinematic, /retired-by-orbital-v28/, 'legacy cinematic overlay must be retired');

assert.match(src, /const VERSION = 'v28'/, 'v28 renderer marker missing');
assert.match(src, /canvas\.getContext\('webgl2'/, 'native WebGL2 context missing');
assert.match(src, /gl\.DEPTH_TEST/, 'depth testing missing');
assert.match(src, /function perspective\(/, 'perspective projection missing');
assert.match(src, /function lookAt\(/, '3D camera view matrix missing');
assert.match(src, /function sphereGeometry\(/, 'glass sphere geometry missing');
assert.match(src, /function tubeGeometry\(/, '3D ribbon tube geometry missing');
assert.match(src, /sphere-plus-independent-3d-ribbons/, 'reference geometry identity missing');
assert.match(src, /drifting-inner-light-not-fixed/, 'non-fixed internal emitter contract missing');
assert.match(src, /glass-orb-cinematic-ribbons/, 'reference visual contract missing');
assert.match(src, /ribbons\.forEach/, 'independent ribbon rendering missing');
assert.match(src, /driftX = Math\.sin/, 'animated inner emitter X drift missing');
assert.match(src, /driftY = Math\.cos/, 'animated inner emitter Y drift missing');
assert.match(src, /driftZ = Math\.sin/, 'animated inner emitter Z drift missing');
assert.match(src, /rotationX\(spec\.tilt\[0\] \+ time \* spec\.speed/, 'time-driven ribbon X rotation missing');
assert.match(src, /rotationY\(spec\.tilt\[1\] \+ time \* spec\.speed/, 'time-driven ribbon Y rotation missing');
assert.match(src, /rotationZ\(spec\.tilt\[2\] \+ time \* spec\.speed/, 'time-driven ribbon Z rotation missing');
assert.match(src, /gl\.drawElements\(gl\.TRIANGLES/, 'indexed triangle rendering missing');
assert.match(src, /requestAnimationFrame\(render\)/, 'display-synchronised animation loop missing');
assert.match(src, /renderScale/, 'adaptive render scale missing');
assert.match(src, /ema > 20\.5/, 'adaptive slow-frame threshold missing');
assert.match(src, /WEBGL_lose_context/, 'context retirement/recovery control missing');
assert.doesNotMatch(src, /diamond\s*=|four-tip|crystalGeometry|true-indexed-four-tip/i, 'retired diamond/crystal geometry returned');
assert.doesNotMatch(src, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(/i, 'orbital core must not be image-backed');
assert.doesNotMatch(src, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i, 'third-party 3D scene engine is forbidden');
assert.doesNotMatch(src, /backgroundImage|background-image/i, 'renderer must not fake the core with a background image');

assert.match(css, /pointer-events:\s*none/, '3D stage must never capture scrolling or touch input');
assert.match(css, /100dvh/, 'dynamic mobile viewport support missing');
assert.match(css, /data-fx-orbital-core="ready-v28"/, 'v28 presentation state missing');
assert.match(css, /--fx-orbital-x:\s*50%/, 'mobile centered composition missing');
assert.match(css, /--fx-orbital-x:\s*69%/, 'desktop right-side composition missing');
assert.match(entry, /formatx-reference-core-v26\.js\?v=20260809-reference-crystal-v26-\d+/, 'production compatibility bootstrap injection missing');
assert.match(entry, /CRITICAL_STARTUP_ASSETS[\s\S]*formatx-reference-core-v26\.js/, 'bootstrap no-store protection missing');

console.log('PASS: FormatX Orbital Core v28 uses native indexed WebGL2 sphere geometry, independent 3D luminous ribbon tubes and a drifting internal emitter; the retired diamond crystal is no longer rendered.');

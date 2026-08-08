'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const apex = read('docs/scifi-ui/scripts/formatx-apex-native.js');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const fallback = read('docs/scifi-ui/scripts/formatx-three-host-safe.js');
const transcendCss = read('docs/scifi-ui/styles/formatx-transcend.css');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(apex, /getContext\('webgl2'/, 'native WebGL2 renderer missing');
assert.match(apex, /#define MAX_STEPS/, 'procedural raymarching step budget missing');
assert.match(apex, /float fbm\(/, 'procedural fBm field missing');
assert.match(apex, /vec2 core\(/, 'core scene missing');
assert.match(apex, /vec2 nerves\(/, 'nervous-system scene missing');
assert.match(apex, /vec2 organs\(/, 'organ scene missing');
assert.match(apex, /vec2 commerce\(/, 'commerce scene missing');
assert.match(apex, /vec2 skeleton\(/, 'skeleton scene missing');
assert.match(apex, /vec2 beacon\(/, 'beacon scene missing');
assert.match(apex, /vec2 mapScene\(/, 'continuous six-scene morphing map missing');
assert.match(apex, /targetQuality/, 'adaptive render quality missing');
assert.match(apex, /const fps = frames \/ \(elapsed \/ 1000\)/, 'measured FPS adaptation missing');
assert.match(apex, /createFallback/, 'Canvas2D fallback missing');
assert.match(apex, /createFooterField/, 'particle typography footer missing');
assert.match(apex, /createSoundscape/, 'generative soundscape missing');
assert.match(apex, /button\.addEventListener\('click'/, 'soundscape must remain explicit opt-in');
assert.match(apex, /fxScrollOwnership='seamless-v7'/, 'seamless-v7 must remain sole scroll owner');
assert.match(apex, /fxSectionSnap='disabled'/, 'section snap must stay disabled');
assert.match(apex, /fxInputInterception='none'/, 'native Apex input ownership marker missing');
assert.doesNotMatch(apex, /scrollTo\s*\(/, 'native Apex must not programmatically move the page');
assert.doesNotMatch(apex, /addEventListener\(['"]wheel['"]/, 'native Apex must not own wheel input');
assert.doesNotMatch(apex, /addEventListener\(['"]touchmove['"]/, 'native Apex must not own touchmove input');
assert.doesNotMatch(apex, /addEventListener\(['"]touchstart['"]/, 'native Apex must not own touchstart input');
assert.doesNotMatch(apex, /https?:\/\//, 'native Apex renderer must remain first-party and dependency-free');
assert.doesNotMatch(apex, /\bTHREE\b|three\.js|gsap/i, 'native Apex must not depend on third-party scene frameworks');

const apexIndex = loader.indexOf('formatx-apex-native.js');
const fallbackIndex = loader.indexOf('formatx-three-host-safe.js');
assert.ok(apexIndex >= 0, 'native Apex is absent from immersive loader');
assert.ok(fallbackIndex > apexIndex, 'safe Three fallback must load after native Apex');
assert.match(loader, /prefers-reduced-motion: reduce/, 'reduced-motion native-Apex bypass missing');
assert.match(loader, /fxNativeApex = 'reduced-motion-fallback'/, 'reduced-motion fallback state missing');
assert.match(loader, /safe-ready-v28/, 'immersive loader revision did not advance');

assert.match(fallback, /root\.dataset\.fxNativeApex === 'ready'/, 'safe Three host does not honour native Apex readiness');
assert.match(fallback, /root\.dataset\.fxThreeHost = 'native-apex'/, 'native Apex host bypass marker missing');
assert.match(fallback, /fxThreeFallback/, 'safe renderer fallback state missing');

assert.match(transcendCss, /\.fx-transcend-canvas/, 'cinematic native Apex surface styling missing');
assert.match(transcendCss, /\.fx-transcend-footer/, 'particle footer styling missing');

assert.equal(contract.layout_contract?.infinite_scroll_controller, 'seamless-v7', 'infinite-scroll controller regressed');
assert.equal(contract.layout_contract?.section_scroll_snap, false, 'section scroll snap regressed');
assert.equal(contract.layout_contract?.mobile_native_momentum_preserved, true, 'mobile momentum contract regressed');
assert.equal(contract.public_delivery?.first_party_only, true, 'first-party delivery contract regressed');

console.log('FormatX Igloo-floor native procedural GPU, fallback and seamless-scroll gate passed.');

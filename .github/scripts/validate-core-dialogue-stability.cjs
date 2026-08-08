'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const apex = read('docs/scifi-ui/scripts/formatx-apex-native.js');
const mobile = read('docs/scifi-ui/styles/formatx-mobile-apex-composition.css');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const voice = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const productionEntry = read('billing-worker/src/production-entry.js');

assert.match(mapper, /fxApexSceneStability === 'ready-v8'/, 'reference-locked v9 revision missing');
assert.match(mapper, /function referenceLockedCrystalShader\(source\)/, 'reference-locked shader transform missing');
assert.match(mapper, /float referenceStar2D\(vec2 p\)/, 'explicit star polygon field missing');
assert.match(mapper, /vec2 v\[16\]/, '16-point reference outline missing');
assert.match(mapper, /v\[0\]=vec2\(0\.,1\.\)/, 'top reference point missing');
assert.match(mapper, /v\[4\]=vec2\(1\.,0\.\)/, 'right reference point missing');
assert.match(mapper, /v\[8\]=vec2\(0\.,-1\.\)/, 'bottom reference point missing');
assert.match(mapper, /v\[12\]=vec2\(-1\.,0\.\)/, 'left reference point missing');
assert.match(mapper, /v\[2\]=vec2\(\.305,\.325\)/, 'upper concave shoulder missing');
assert.match(mapper, /v\[14\]=vec2\(-\.305,\.325\)/, 'mirrored concave shoulder missing');
assert.match(mapper, /float zCap=depth\*\(\.10\+\.90\*pow/, 'true 3D front/back depth profile missing');
assert.match(mapper, /starPrism\(crystal,1\.50\*pulse,\.48\*\(1\.\+heart\*\.020\),\.0025\)/, 'reference 3D crystal body missing');

assert.match(mapper, /float beatA=/, 'primary heartbeat missing');
assert.match(mapper, /float beatB=/, 'secondary heartbeat missing');
assert.match(mapper, /float heart=pow\(beatA,4\.\)\*\.72\+pow\(beatB,9\.\)\*\.28/, 'double-beat pulse envelope missing');
assert.match(mapper, /float breath=/, 'slow breathing envelope missing');
assert.match(mapper, /float ringPulse=1\.\+heart\*\.040\+breath\*\.010/, 'orbit pulse missing');
assert.match(mapper, /float pulseWave=exp\(-abs\(coreDistance-waveRadius\)\*56\.\)/, 'outgoing energy wave missing');

assert.match(mapper, /float hotCore=exp\(-coreDistance\*32\.\)/, 'white-hot reactor center missing');
assert.match(mapper, /float reactor1=exp\(-abs\(coreDistance-\.074\)\*115\.\)/, 'inner reactor ring missing');
assert.match(mapper, /float reactor2=exp\(-abs\(coreDistance-\.132\)\*92\.\)/, 'middle reactor ring missing');
assert.match(mapper, /float reactor3=exp\(-abs\(coreDistance-\.205\)\*70\.\)/, 'outer reactor ring missing');
assert.match(mapper, /vec3 refrDir=refract\(rd,n,\.76\)/, 'glass refraction missing');
assert.match(mapper, /float caustic=pow/, 'internal caustics missing');
assert.match(mapper, /float innerGlow=exp\(-length\(p\.xy\)\*2\.3\)/, 'internal crystal glow missing');

assert.match(mapper, /q\.xz\*=rot\(\.052\+sin\(uTime\*\.13\)\*\.044/, 'subtle 3D yaw missing');
assert.match(mapper, /q\.yz\*=rot\(-\.032\+cos\(uTime\*\.15\)\*\.032/, 'subtle 3D pitch missing');
assert.match(mapper, /q\.xy\*=rot\(sin\(uTime\*\.09\)\*\.010\)/, 'subtle roll missing');
assert.match(mapper, /float angle=mix\(\.018\+sin\(uTime\*\.11\)\*\.018/, 'near-frontal reference camera missing');
assert.match(mapper, /reference-locked-crystal-3d-v9/, 'v9 runtime marker missing');

assert.match(mapper, /fxNativeApexCanvas === 'true'/, 'mapper must target Native Apex only');
assert.match(mapper, /name === 'uScene'/, 'mapper must remap only uScene');
assert.match(mapper, /raw - 0\.38/, 'core hold threshold missing');
assert.doesNotMatch(mapper, /scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/, 'mapper must never capture scroll');

assert.match(apex, /getContext\('webgl2'/, 'WebGL2 renderer missing');
assert.match(apex, /quality: coarse\.matches \? 0\.82 : 0\.88/, 'mobile adaptive quality floor regressed');
assert.match(apex, /coarse\.matches \? 1\.25 : 1\.5/, 'mobile DPR cap regressed');
assert.doesNotMatch(apex, /\bTHREE\b|three\.js|gsap/i, 'Native Apex must remain dependency-free');
assert.doesNotMatch(apex, /scrollTo\s*\(/, 'Native Apex must not own page position');

const mapperIndex = loader.indexOf('formatx-apex-scene-stability.js');
const apexIndex = loader.indexOf('formatx-apex-native.js');
assert.ok(mapperIndex >= 0 && apexIndex > mapperIndex, 'reference mapper must load before Native Apex');

assert.match(mobile, /display: block !important/, 'Native Apex must remain visible');
assert.match(mobile, /height: 100dvh !important/, 'dynamic viewport missing');
assert.match(mobile, /visibility: visible !important;[\s\S]*opacity: 1 !important/, 'Native Apex canvas must stay visible');
assert.match(mobile, /translate3d\(0, -\.8svh, 0\) scale\(1\)/, 'native-resolution framing regressed');
assert.doesNotMatch(mobile, /scale\(1\.34\)|scale\(\.98\)|scale\(\.96\)/, 'pixel-amplifying CSS zoom returned');

assert.match(productionEntry, /'\/scifi-ui\/scripts\/formatx-apex-scene-stability\.js'/, 'reference mapper must remain no-store critical');
assert.match(productionEntry, /'\/scifi-ui\/scripts\/formatx-apex-native\.js'/, 'Native Apex must remain no-store critical');
assert.match(voice, /window\.visualViewport/, 'dialogue must use Visual Viewport API');
assert.match(voice, /keyboardInset/, 'keyboard inset guard missing');
assert.doesNotMatch(voice, /scrollTo\s*\(|scrollIntoView\s*\(/, 'dialogue guard must not move page');
assert.match(infinite, /const VERSION = 'seamless-v7'/, 'seamless-v7 regressed');
assert.match(infinite, /root\.dataset\.fxInfiniteInput = 'native'/, 'native momentum contract regressed');

console.log('PASS: reference-locked-crystal-3d-v9 enforces the 16-point concave four-tip silhouette, true depth, bright reactor, pulse, refraction and seamless single-renderer runtime.');

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const apex = read('docs/scifi-ui/scripts/formatx-apex-native.js');
const mobileComposition = read('docs/scifi-ui/styles/formatx-mobile-apex-composition.css');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const voiceStability = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const productionEntry = read('billing-worker/src/production-entry.js');

assert.match(mapper, /fxApexSceneStability === 'ready-v7'/, 'pulsing luminous v8 mapper revision missing');
assert.match(mapper, /fxNativeApexCanvas === 'true'/, 'scene mapper must target only Native Apex canvas');
assert.match(mapper, /name === 'uScene'/, 'scene mapper must only remap uScene');
assert.match(mapper, /raw - 0\.38/, 'core hold threshold missing');
assert.match(mapper, /0\.50/, 'deliberate morph window missing');
assert.match(mapper, /smoothedScene \+= \(target - smoothedScene\) \* 0\.115/, 'scene smoothing missing');
assert.doesNotMatch(mapper, /scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/, 'mapper must not capture native scrolling');

// Reference-fit glass silhouette and real 3D cavity.
assert.match(mapper, /function referenceLuminousCrystalShader\(source\)/, 'reference luminous shader transform missing');
assert.match(mapper, /pow\(abs\(cos\(2\.\*a\)\),2\.15\)/, 'four-point star profile missing');
assert.match(mapper, /float radial=radius\*mix\(\.47,1\.,axis\)/, 'reference silhouette width missing');
assert.match(mapper, /float zCap=depth\*pow\(max\(0\.,1\.-pow\(rn,1\.72\)\),\.58\)/, 'continuous front/back volume missing');
assert.match(mapper, /starPrism\(crystal,1\.54\*pulse,\.62\*\(1\.\+heart\*\.025\),\.004\)/, 'breathing 3D crystal body missing');
assert.match(mapper, /float cavity=sphere\(crystal,\.455\+heart\*\.018\)/, 'pulsing reactor cavity missing');
assert.match(mapper, /shell=max\(shell,-cavity\)/, 'central cavity subtraction missing');

// Heartbeat and breathing contract: not a CSS scale trick.
assert.match(mapper, /float beatA=\.5\+\.5\*sin\(uTime\*1\.55\)/, 'primary heartbeat oscillator missing');
assert.match(mapper, /float beatB=\.5\+\.5\*sin\(uTime\*3\.10-\.78\)/, 'secondary heartbeat oscillator missing');
assert.match(mapper, /float heart=pow\(beatA,4\.\)\*\.72\+pow\(beatB,9\.\)\*\.28/, 'double-beat envelope missing');
assert.match(mapper, /float breath=\.5\+\.5\*sin\(uTime\*\.62-\.4\)/, 'slow breathing envelope missing');
assert.match(mapper, /float pulse=1\.\+heart\*\.040\+breath\*\.010/, 'body pulse amplitude missing');
assert.match(mapper, /float nucleus=sphere\(q,\.245\+heart\*\.050/, 'reactor nucleus pulse missing');
assert.match(mapper, /float ringPulse=1\.\+heart\*\.055\+breath\*\.012/, 'orbit expansion pulse missing');
assert.match(mapper, /\.43\*ringPulse/, 'inner pulsing orbit missing');
assert.match(mapper, /\.58\*ringPulse/, 'middle pulsing orbit missing');
assert.match(mapper, /\.78\*ringPulse/, 'outer pulsing orbit missing');

// Subtle perspective keeps the reference silhouette readable.
assert.match(mapper, /q\.xz\*=rot\(\.080\+sin\(uTime\*\.13\)\*\.062/, 'subtle 3D yaw missing');
assert.match(mapper, /q\.yz\*=rot\(-\.050\+cos\(uTime\*\.15\)\*\.044/, 'subtle 3D pitch missing');
assert.match(mapper, /q\.xy\*=rot\(sin\(uTime\*\.09\)\*\.014\)/, 'subtle roll missing');
assert.match(mapper, /float angle=mix\(\.042\+sin\(uTime\*\.11\)\*\.030/, 'reference camera yaw missing');
assert.match(mapper, /float radius=mix\(5\.72,travelRadius,1\.-coreWeight\)/, 'reference camera distance missing');
assert.match(mapper, /float focal=mix\(1\.96,1\.72,1\.-coreWeight\)/, 'reference focal length missing');

// Pulsating screen-space light, glass transmission and outward energy wave.
assert.match(mapper, /float screenHeart=pow\(screenBeatA,4\.\)\*\.72\+pow\(screenBeatB,9\.\)\*\.28/, 'screen-space heartbeat envelope missing');
assert.match(mapper, /float waveRadius=\.19\+screenHeart\*\.055/, 'pulse wave radius missing');
assert.match(mapper, /float pulseWave=exp\(-abs\(coreDistance-waveRadius\)\*54\.\)/, 'outward pulse wave missing');
assert.match(mapper, /float coreOrb=exp\(-coreDistance\*9\.4\).*screenHeart/, 'heartbeat-driven core orb missing');
assert.match(mapper, /float coreBloom=exp\(-coreDistance\*4\.8\).*screenHeart/, 'heartbeat-driven core bloom missing');
assert.match(mapper, /vec3 refrDir=refract\(rd,n,\.75\)/, 'glass refraction missing');
assert.match(mapper, /float caustic=pow/, 'internal caustics missing');
assert.match(mapper, /reference-luminous-crystal-pulse-v8/, 'v8 runtime marker missing');

assert.match(apex, /getContext\('webgl2'/, 'native WebGL2 renderer missing');
assert.match(apex, /float starPrism\(/, 'base SDF missing');
assert.match(apex, /quality: coarse\.matches \? 0\.82 : 0\.88/, 'mobile adaptive quality floor regressed');
assert.match(apex, /coarse\.matches \? 1\.25 : 1\.5/, 'mobile DPR cap regressed');
assert.doesNotMatch(apex, /https?:\/\//, 'Native Apex must stay first-party');
assert.doesNotMatch(apex, /\bTHREE\b|three\.js|gsap/i, 'Native Apex must stay dependency-free');
assert.doesNotMatch(apex, /scrollTo\s*\(/, 'Native Apex must not own page position');

const mapperIndex = loader.indexOf('formatx-apex-scene-stability.js');
const apexIndex = loader.indexOf('formatx-apex-native.js');
assert.ok(mapperIndex >= 0 && apexIndex > mapperIndex, 'reference mapper must load before Native Apex');

assert.match(mobileComposition, /display: block !important/, 'Native Apex must remain visible');
assert.match(mobileComposition, /height: 100dvh !important/, 'dynamic mobile viewport missing');
assert.match(mobileComposition, /visibility: visible !important;[\s\S]*opacity: 1 !important/, 'Native Apex canvas must stay visible');
assert.match(mobileComposition, /translate3d\(0, -\.8svh, 0\) scale\(1\)/, 'native-resolution framing regressed');
assert.doesNotMatch(mobileComposition, /scale\(1\.34\)|scale\(\.98\)|scale\(\.96\)/, 'pixel-amplifying CSS zoom returned');

assert.match(productionEntry, /'\/scifi-ui\/scripts\/formatx-apex-scene-stability\.js'/, 'reference mapper must be no-store critical asset');
assert.match(productionEntry, /'\/scifi-ui\/scripts\/formatx-apex-native\.js'/, 'Native Apex must be no-store critical asset');
assert.match(voiceStability, /window\.visualViewport/, 'dialogue must use Visual Viewport API');
assert.match(voiceStability, /keyboardInset/, 'keyboard inset guard missing');
assert.doesNotMatch(voiceStability, /scrollTo\s*\(|scrollIntoView\s*\(/, 'dialogue guard must not move page');
assert.match(infinite, /const VERSION = 'seamless-v7'/, 'seamless-v7 scroll ownership regressed');
assert.match(infinite, /root\.dataset\.fxInfiniteInput = 'native'/, 'native momentum contract regressed');

console.log('PASS: reference-luminous-crystal-pulse-v8 enforces the broad glass reference silhouette plus living heartbeat, breathing geometry, pulsing reactor, expanding orbits and outward energy wave.');

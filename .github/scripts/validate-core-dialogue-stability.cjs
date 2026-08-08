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

// Core scene mapping must stay stable and must never capture scroll ownership.
assert.match(mapper, /fxApexSceneStability === 'ready-v5'/, 'volumetric crystal mapper revision missing');
assert.match(mapper, /fxNativeApexCanvas === 'true'/, 'scene mapper must target only Native Apex canvas');
assert.match(mapper, /name === 'uScene'/, 'scene mapper must only remap uScene');
assert.match(mapper, /raw - 0\.38/, 'core hold threshold missing');
assert.match(mapper, /0\.50/, 'deliberate morph window missing');
assert.match(mapper, /smoothedScene \+= \(target - smoothedScene\) \* 0\.115/, 'scene smoothing missing');
assert.match(mapper, /Math\.abs\(target - smoothedScene\) > 2\.25/, 'loop snap guard missing');
assert.doesNotMatch(mapper, /scrollTo\s*\(/, 'mapper must not move the page');
assert.doesNotMatch(mapper, /scrollIntoView\s*\(/, 'mapper must not force element scrolling');
assert.doesNotMatch(mapper, /preventDefault\s*\(/, 'mapper must not capture native input');

// Volumetric v6 geometry: tapered crystal wings, front/back volume, 3-axis motion.
assert.match(mapper, /function volumetricCrystalShader\(source\)/, 'volumetric shader transform missing');
assert.match(mapper, /float along=max\(ap\.x,ap\.y\)/, 'tapered wing axis field missing');
assert.match(mapper, /float across=min\(ap\.x,ap\.y\)/, 'concave wing cross-section missing');
assert.match(mapper, /float wing=radius\*\.46\*max\(0\.,1\.-pow\(t,\.66\)\)/, 'wing taper profile missing');
assert.match(mapper, /float zProfile=max\(\.022,depth\*max\(0\.,1\.-pow\(t,1\.42\)\)\)/, 'front/back 3D taper missing');
assert.match(mapper, /starPrism\(crystal,1\.50\*pulse,\.58,\.003\)/, 'volumetric crystal depth missing');
assert.match(mapper, /q\.xz\*=rot\(\.26\+sin\(uTime\*\.13\)\*\.16/, 'persistent yaw missing');
assert.match(mapper, /q\.yz\*=rot\(-\.17\+cos\(uTime\*\.15\)\*\.11/, 'persistent pitch missing');
assert.match(mapper, /q\.xy\*=rot\(sin\(uTime\*\.09\)\*\.035\)/, 'roll animation missing');
assert.match(mapper, /ring\.xz\*=rot\(\.38/, 'first orbit must leave screen plane');
assert.match(mapper, /ring\.xz\*=rot\(1\.08/, 'second orbit must use another 3D plane');
assert.match(mapper, /ring\.xy\*=rot\(1\.57079633\)/, 'third orbit must use a third 3D plane');
assert.match(mapper, /float angle=mix\(\.18\+sin\(uTime\*\.11\)\*\.065/, 'perspective camera yaw missing');
assert.match(mapper, /float radius=mix\(5\.92,travelRadius,1\.-coreWeight\)/, 'volumetric camera distance missing');
assert.match(mapper, /float focal=mix\(1\.88,1\.72,1\.-coreWeight\)/, 'volumetric camera focal length missing');

// Glass/transmission shading and high-energy center.
assert.match(mapper, /vec3 refrDir=refract\(rd,n,\.73\)/, 'glass refraction field missing');
assert.match(mapper, /vec3 trans=background/, 'glass transmission sampling missing');
assert.match(mapper, /float caustic=pow/, 'internal caustic lighting missing');
assert.match(mapper, /float depthFacet=pow\(sat\(1\.-abs\(n\.z\)\),1\.8\)/, 'depth facet lighting missing');
assert.match(mapper, /float coreOrb=exp\(-coreDistance\*18\.5\)/, 'high-energy core orb missing');
assert.match(mapper, /float waterMask=smoothstep\(\.30,\.94,-uv\.y\)/, 'water reflection field missing');
assert.match(mapper, /volumetric-glass-crystal-v6/, 'v6 runtime marker missing');

// Base renderer remains the single first-party WebGL2 owner.
assert.match(apex, /getContext\('webgl2'/, 'native WebGL2 renderer missing');
assert.match(apex, /float starPrism\(/, 'base star crystal SDF missing');
assert.match(apex, /quality: coarse\.matches \? 0\.82 : 0\.88/, 'mobile adaptive quality floor regressed');
assert.match(apex, /coarse\.matches \? 1\.25 : 1\.5/, 'mobile DPR cap regressed');
assert.doesNotMatch(apex, /https?:\/\//, 'Native Apex must stay first-party');
assert.doesNotMatch(apex, /\bTHREE\b|three\.js|gsap/i, 'Native Apex must stay dependency-free');
assert.doesNotMatch(apex, /scrollTo\s*\(/, 'Native Apex must not own page position');

const mapperIndex = loader.indexOf('formatx-apex-scene-stability.js');
const apexIndex = loader.indexOf('formatx-apex-native.js');
assert.ok(mapperIndex >= 0 && apexIndex > mapperIndex, 'volumetric shader mapper must load before Native Apex');

// Positive mobile visibility and no pixel-amplifying CSS zoom.
assert.match(mobileComposition, /z-index: var\(--fx-layer-stage, 120\) !important/, 'Native Apex stage ownership missing');
assert.match(mobileComposition, /display: block !important/, 'Native Apex must remain in render tree');
assert.match(mobileComposition, /height: 100dvh !important/, 'dynamic mobile viewport missing');
assert.match(mobileComposition, /visibility: visible !important;[\s\S]*opacity: 1 !important/, 'Native Apex canvas must stay visible');
assert.match(mobileComposition, /translate3d\(0, -\.8svh, 0\) scale\(1\)/, 'native-resolution mobile framing regressed');
assert.doesNotMatch(mobileComposition, /scale\(1\.34\)|scale\(\.98\)|scale\(\.96\)/, 'pixel-amplifying CSS zoom returned');
assert.match(mobileComposition, /#fx-apex-canvas/, 'legacy Apex retirement guard missing');
assert.match(mobileComposition, /\.fx-three-stage-shell/, 'legacy Three retirement guard missing');

// Critical delivery and mobile dialogue stability.
assert.match(productionEntry, /'\/scifi-ui\/scripts\/formatx-apex-scene-stability\.js'/, 'shader mapper must be no-store critical asset');
assert.match(productionEntry, /'\/scifi-ui\/scripts\/formatx-apex-native\.js'/, 'Native Apex must be no-store critical asset');
assert.match(voiceStability, /window\.visualViewport/, 'dialogue must use Visual Viewport API');
assert.match(voiceStability, /keyboardInset/, 'keyboard inset guard missing');
assert.doesNotMatch(voiceStability, /scrollTo\s*\(/, 'dialogue guard must not move page');
assert.doesNotMatch(voiceStability, /scrollIntoView\s*\(/, 'dialogue guard must not force scrolling');

assert.match(infinite, /const VERSION = 'seamless-v7'/, 'seamless-v7 scroll ownership regressed');
assert.match(infinite, /root\.dataset\.fxInfiniteInput = 'native'/, 'native momentum contract regressed');

console.log('PASS: volumetric-glass-crystal-v6 enforces tapered 3D wings, real front/back volume, glass transmission, multi-plane orbits and perspective while preserving seamless-v7 and dialogue viewport guards.');

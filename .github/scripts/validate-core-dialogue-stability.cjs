'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const apex = read('docs/scifi-ui/scripts/formatx-apex-native.js');
const mobileComposition = read('docs/scifi-ui/styles/formatx-mobile-apex-composition.css');
const siteStability = read('docs/scifi-ui/styles/formatx-site-stability.css');
const threeHost = read('docs/scifi-ui/styles/formatx-three-host.css');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const voiceStability = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const productionEntry = read('billing-worker/src/production-entry.js');

assert.match(mapper, /fxNativeApexCanvas === 'true'/, 'scene mapper must target only the Native Apex canvas');
assert.match(mapper, /name === 'uScene'/, 'scene mapper must only remap the uScene uniform');
assert.match(mapper, /raw - 0\.38/, 'core hold threshold is missing');
assert.match(mapper, /0\.50/, 'deliberate morph window is missing');
assert.match(mapper, /smoothedScene \+= \(target - smoothedScene\) \* 0\.115/, 'scene smoothing is missing');
assert.match(mapper, /Math\.abs\(target - smoothedScene\) > 2\.25/, 'loop transfer snap guard is missing');
assert.match(mapper, /formatx-mobile-apex-composition\.css\?v=20260808-core-mobile-1/, 'mapper fallback mobile Apex composition stylesheet is not loaded');
assert.doesNotMatch(mapper, /scrollTo\s*\(/, 'scene mapper must never move the page');
assert.doesNotMatch(mapper, /scrollIntoView\s*\(/, 'scene mapper must never move the page through element scrolling');
assert.doesNotMatch(mapper, /preventDefault\s*\(/, 'scene mapper must not capture native scrolling');

assert.match(apex, /fxNativeApexVisual='luminous-star-core-v3'/, 'luminous star-core revision marker missing');
assert.match(apex, /float starPrism\(/, 'four-wing concave star crystal SDF is missing');
assert.match(apex, /float lobes=pow\(abs\(cos\(2\.\*a\)\),\.48\)/, 'curved four-wing crystal silhouette is missing');
assert.match(apex, /ring\.yz\*=rot\(1\.57079633\)/, 'front-facing 3D energy ring is missing');
assert.match(apex, /capsule\(q,vec3\(-1\.52,0,0\),vec3\(1\.52,0,0\),\.014\)/, 'horizontal luminous crystal axis is missing');
assert.match(apex, /capsule\(q,vec3\(0,-1\.68,0\),vec3\(0,1\.68,0\),\.014\)/, 'vertical luminous crystal axis is missing');
assert.match(apex, /float auraRings=/, 'screen-space energy aura rings are missing');
assert.match(apex, /float coreWeight=1\.-smoothstep\(\.58,1\.08,uScene\)/, 'dedicated core camera framing is missing');
assert.match(apex, /float angle=mix\(-\.035\+sin\(uTime\*\.11\)\*\.022,travelAngle,1\.-coreWeight\)/, 'core camera must remain almost frontal');
assert.match(apex, /float radius=mix\(6\.02,travelRadius,1\.-coreWeight\)/, 'core camera distance must frame the four-wing crystal');
assert.match(apex, /quality: coarse\.matches \? 0\.82 : 0\.88/, 'mobile Native Apex must start at the high-quality star-core floor');
assert.match(apex, /coarse\.matches \? 1\.25 : 1\.5/, 'mobile render DPR quality floor is missing');
assert.match(apex, /WEBGL2 \/ STAR CRYSTAL SDF/, 'star crystal SDF renderer mode marker missing');

assert.match(mobileComposition, /html\[data-fx-native-apex="ready"\] \.fx-transcend-shell\[data-fx-native-apex="true"\]/, 'Native Apex ownership selector missing');
assert.match(mobileComposition, /z-index: var\(--fx-layer-stage, 120\) !important/, 'Native Apex must own the stage layer');
assert.match(mobileComposition, /display: block !important/, 'Native Apex shell must explicitly re-enter the render tree');
assert.match(mobileComposition, /height: 100dvh !important/, 'Native Apex must use the dynamic mobile viewport');
assert.match(mobileComposition, /> \.fx-transcend-canvas\[data-fx-native-apex-canvas="true"\]/, 'Native Apex canvas ownership selector missing');
assert.match(mobileComposition, /visibility: visible !important;[\s\S]*opacity: 1 !important/, 'Native Apex canvas must be explicitly visible');
assert.match(mobileComposition, /translate3d\(0, -\.8svh, 0\) scale\(1\)/, 'mobile core must use native-resolution star-core framing');
assert.match(mobileComposition, /brightness\(1\.18\)/, 'mobile luminous crystal readability treatment missing');
assert.doesNotMatch(mobileComposition, /scale\(1\.34\)|scale\(\.98\)|scale\(\.96\)/, 'pixel-amplifying mobile core zoom returned');
assert.match(mobileComposition, /#hero \.hero-space::before/, 'legacy hero fallback core hard-retire guard missing');
assert.match(mobileComposition, /#hero \.hero-space::after/, 'legacy hero fallback halo hard-retire guard missing');
assert.match(mobileComposition, /\.fx-resilient-core/, 'resilient legacy canvas hard-retire guard missing');
assert.match(mobileComposition, /#fx-apex-canvas/, 'legacy apex canvas hard-retire guard missing');
assert.match(mobileComposition, /\.fx-three-stage-shell/, 'legacy three stage hard-retire guard missing');
assert.match(mobileComposition, /\.fx-transcend-hud\[data-fx-native-apex="true"\][\s\S]*display: none !important/, 'mobile duplicate Native Apex HUD must be hidden');
assert.match(mobileComposition, /prefers-reduced-motion: reduce/, 'mobile composition reduced-motion treatment missing');

assert.match(siteStability, /\.fx-transcend-shell,[\s\S]*display: none !important/, 'expected legacy site-stability hide contract changed; review ownership guard');
assert.match(threeHost, /html\[data-fx-three-host="ready"\][\s\S]*\.fx-transcend-shell,[\s\S]*display: none !important/, 'expected legacy Three-host hide contract changed; review ownership guard');

const mapperIndex = loader.indexOf('formatx-apex-scene-stability.js');
const apexIndex = loader.indexOf('formatx-apex-native.js');
assert.ok(mapperIndex >= 0 && apexIndex > mapperIndex, 'scene mapper must load immediately before Native Apex');
assert.match(loader, /organism-voice-stability\.js\?v=20260808-mobile-visual-viewport-1/, 'mobile voice viewport revision is not loaded');

assert.match(productionEntry, /data-fx-mobile-apex-composition="true"/, 'mobile Apex composition must be server-bootstrapped on the homepage');
assert.match(productionEntry, /formatx-mobile-apex-composition\.css\?v=20260808-mobile-apex-live-2/, 'mobile Apex production cache-busting revision missing');
assert.match(productionEntry, /'\/scifi-ui\/styles\/formatx-mobile-apex-composition\.css'/, 'mobile Apex composition must be a no-store critical production asset');
assert.match(productionEntry, /if \(!html\.includes\('data-fx-mobile-apex-composition'\)\)/, 'production homepage injection guard missing');

assert.match(voiceStability, /window\.visualViewport/, 'mobile dialogue must use the Visual Viewport API');
assert.match(voiceStability, /keyboardInset/, 'keyboard inset compensation is missing');
assert.match(voiceStability, /shell\.style\.bottom = bottomInset \+ 'px'/, 'dialogue bottom anchoring is not keyboard-aware');
assert.match(voiceStability, /bubble\.style\.maxHeight = bubbleHeight \+ 'px'/, 'dialogue bubble height is not clamped to the visible viewport');
assert.match(voiceStability, /document\.addEventListener\('focusin'/, 'keyboard/focus viewport resync is missing');
assert.match(voiceStability, /mobileVisualViewportGuard: true/, 'mobile viewport stability contract marker missing');
assert.doesNotMatch(voiceStability, /scrollTo\s*\(/, 'voice stability must not move the page');
assert.doesNotMatch(voiceStability, /scrollIntoView\s*\(/, 'voice stability must not force page scrolling when the keyboard opens');

assert.match(infinite, /const VERSION = 'seamless-v7'/, 'seamless-v7 scroll ownership regressed');
assert.match(infinite, /root\.dataset\.fxInfiniteInput = 'native'/, 'native scroll input contract regressed');

console.log('PASS: luminous four-wing star crystal Native Apex uses frontal true-3D framing, high mobile render quality and energy lighting while preserving single-renderer ownership, seamless-v7 and dialogue viewport guards.');

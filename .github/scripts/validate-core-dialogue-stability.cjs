'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const mobileComposition = read('docs/scifi-ui/styles/formatx-mobile-apex-composition.css');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const voiceStability = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');

assert.match(mapper, /fxNativeApexCanvas === 'true'/, 'scene mapper must target only the Native Apex canvas');
assert.match(mapper, /name === 'uScene'/, 'scene mapper must only remap the uScene uniform');
assert.match(mapper, /raw - 0\.38/, 'core hold threshold is missing');
assert.match(mapper, /0\.50/, 'deliberate morph window is missing');
assert.match(mapper, /smoothedScene \+= \(target - smoothedScene\) \* 0\.115/, 'scene smoothing is missing');
assert.match(mapper, /Math\.abs\(target - smoothedScene\) > 2\.25/, 'loop transfer snap guard is missing');
assert.match(mapper, /formatx-mobile-apex-composition\.css\?v=20260808-core-mobile-1/, 'corrected mobile Apex composition stylesheet is not loaded');
assert.match(mapper, /fxCoreMobileComposition = 'zoomed-readable-v1'/, 'mobile Apex composition contract marker missing');
assert.doesNotMatch(mapper, /scrollTo\s*\(/, 'scene mapper must never move the page');
assert.doesNotMatch(mapper, /scrollIntoView\s*\(/, 'scene mapper must never move the page through element scrolling');
assert.doesNotMatch(mapper, /preventDefault\s*\(/, 'scene mapper must not capture native scrolling');

assert.match(mobileComposition, /translate3d\(0, -5\.5svh, 0\) scale\(1\.34\)/, 'mobile Native Apex core must be raised and enlarged');
assert.match(mobileComposition, /brightness\(1\.24\)/, 'mobile Native Apex core readability boost missing');
assert.match(mobileComposition, /data-fx-native-apex="ready"/, 'mobile composition must only apply when Native Apex is ready');
assert.match(mobileComposition, /prefers-reduced-motion: reduce/, 'mobile composition reduced-motion treatment missing');

const mapperIndex = loader.indexOf('formatx-apex-scene-stability.js');
const apexIndex = loader.indexOf('formatx-apex-native.js');
assert.ok(mapperIndex >= 0 && apexIndex > mapperIndex, 'scene mapper must load immediately before Native Apex');
assert.match(loader, /organism-voice-stability\.js\?v=20260808-mobile-visual-viewport-1/, 'mobile voice viewport revision is not loaded');

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

console.log('PASS: Native Apex core hold/morph, mobile core composition and Organism visual-viewport stability are guarded without taking scroll ownership.');

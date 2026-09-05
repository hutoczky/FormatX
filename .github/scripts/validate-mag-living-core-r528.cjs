'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = path => fs.readFileSync(path, 'utf8');
const reference = read('docs/scifi-ui/scripts/formatx-reference-production-r244.js');
const eventHorizon = read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const controlOwner = read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const miniMag = read('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js');
const motionLoader = read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const currentMag = read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const renderer = read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const governor = read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const touch = read('docs/scifi-ui/scripts/formatx-core-touch-pulse-r99.js');
const sync = read('docs/scifi-ui/scripts/formatx-mag-shape-sync-r476.js');
const coreLife = read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const directInteraction = read('docs/scifi-ui/scripts/formatx-core-direct-interaction.js');
const geometryGuard = read('docs/scifi-ui/scripts/formatx-geometry-guard-r286.js');
const contentLoader = read('docs/scifi-ui/scripts/formatx-content-runtime-loader-r241.js');
const reducedCss = read('docs/scifi-ui/styles/formatx-reduced-mag-identity-r528.css');
const p0Css = read('docs/scifi-ui/styles/formatx-p0-first-paint-r490.css');
const activeMobileCss = [
  ['quality-r461', read('docs/scifi-ui/styles/formatx-quality-r461.css')],
  ['mobile-reference-layout-v1', read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css')],
  ['mobile-proof-controls-r204', read('docs/scifi-ui/styles/formatx-mobile-proof-controls-r204.css')],
  ['mobile-layout-r207', read('docs/scifi-ui/styles/formatx-mobile-layout-r207.css')],
];
const semantic = read('.github/scripts/validate-r522-semantic-mag.cjs');
const worker = read('billing-worker/src/production-content-entry-r529.js');

const obsoleteRuntime = /formatx:referencepause|fxReferenceMotionPaused|data-fx-reference-motion-paused|\.fx-reference-pause/;

assert.ok(!/class=["'][^"']*fx-reference-pause/.test(reference), 'manual MAG PAUSE markup remains in canonical reference source');
assert.ok(!/function\s+bindPause|formatx:referencepause|fxReferenceMotionPaused/.test(eventHorizon), 'event-horizon still owns obsolete manual MAG pause state/events');
assert.ok(!/function\s+ensurePause|visibleControl\(pause\)/.test(controlOwner), 'control-owner still creates/requires obsolete MAG pause control');
assert.ok(!/togglePause|['"]pause['"]\s*[:,]|Pause \/ resume|Szünet \/ folytatás/.test(miniMag), 'Mini MAG still exposes obsolete pause action');
assert.ok(!/\.fx-reference-pause/.test(motionLoader), 'motion runtime still reserves obsolete pause selector');
assert.match(currentMag, /r528-lifecycle-suspend-no-idle-redraw/, 'current MAG loader does not advertise lifecycle-only suspension');
assert.match(currentMag, /formatx-crystal-organism-r326\.js\?v=20260905-r528-lifecycle-suspension/, 'current MAG loader does not request R528 renderer');
assert.ok(!/direct-pause-flag/.test(currentMag), 'current MAG loader still advertises old pause flag ownership');

for (const [name, source] of [
  ['renderer', renderer],
  ['governor', governor],
  ['touch', touch],
  ['shape-sync', sync],
  ['core-life', coreLife],
  ['direct-interaction', directInteraction],
  ['geometry-guard', geometryGuard],
  ['content-runtime-loader', contentLoader],
]) {
  assert.ok(!obsoleteRuntime.test(source), `${name}: obsolete manual MAG pause contract remains`);
}
for (const [name, source] of activeMobileCss) {
  assert.ok(!/\.fx-reference-pause|data-paused=|data-fx-reference-motion-paused/.test(source), `${name}: obsolete manual MAG pause styling remains`);
}
assert.ok(!/\.fx-reference-pause|data-fx-reference-motion-paused/.test(p0Css), 'P0 first-paint CSS still contains obsolete manual MAG pause styling');

assert.match(renderer, /function setLifecycleSuspended/, 'renderer lifecycle suspension API missing');
assert.match(renderer, /setLifecycleSuspended:\(suspended,source\)/, 'renderer public lifecycle suspension API missing');
assert.match(renderer, /document\.hidden\|\|!visible\|\|renderSuspended/, 'renderer lifecycle block state missing');
assert.match(governor, /automatic-resource-lifecycle-not-user-pause/, 'mobile governor lifecycle contract marker missing');
assert.match(touch, /living-core-no-manual-pause-wake/, 'touch path living-core contract marker missing');
assert.match(coreLife, /living-core-no-manual-pause-reduced-motion-and-lifecycle-safe/, 'core-life R528 contract marker missing');
assert.match(directInteraction, /setLifecycleSuspended\?\.\(false, 'direct-core-interaction'\)/, 'direct interaction does not wake through lifecycle API');
assert.match(directInteraction, /requestRender\?\.\(2\)/, 'direct interaction lifecycle wake does not request bounded render work');

assert.match(sync, /prefers-reduced-motion:\s*reduce/, 'reduced-motion media query missing from MAG runtime');
assert.match(sync, /document\.hidden/, 'automatic background suspension missing from MAG runtime');
assert.match(sync, /visibilitychange/, 'background lifecycle listener missing from MAG runtime');
assert.match(sync, /formatx-reduced-mag-identity-r528\.css/, 'canonical runtime does not load reduced-motion MAG identity CSS');
assert.match(sync, /continuous-normal-reduced-motion-background-safe/, 'R528 living-core runtime contract marker missing');
assert.match(reducedCss, /prefers-reduced-motion:\s*reduce/, 'R528 reduced-motion MAG identity stylesheet missing media contract');
assert.match(reducedCss, /fx-crystal-organism-r326-stage/, 'reduced-motion MAG stage identity override missing');
assert.match(reducedCss, /animation-play-state:\s*paused/, 'reduced-motion restrained/static playback rule missing');
assert.ok(!/PAUSE clock moved|repeated PAUSE\/RESUME|const PAUSE\s*=/.test(semantic), 'R522 semantic validator still asserts obsolete manual pause behavior');
assert.match(semantic, /manualPauseCount === 0/, 'R522 validator does not prove manual PAUSE removal');
assert.match(semantic, /living MAG motion did not progress/, 'R522 validator does not prove normal living motion');
assert.match(semantic, /verifyReducedMotion/, 'R522 validator does not verify reduced motion');
assert.match(semantic, /verifyBackgroundLifecycle/, 'R522 validator does not verify background lifecycle');
assert.match(worker, /r529-direct-canonical-living-core/, 'R529 direct-canonical production wrapper missing');
assert.match(worker, /X-FormatX-Product-Contract','r529-living-core-no-manual-pause/, 'R529 Worker living-core product contract header missing');
assert.match(worker, /formatx-heart-core-r252\.css/, 'R529 static heart first-paint layer missing');
assert.match(worker, /production-content-entry\.js/, 'R529 wrapper must delegate to canonical production content entry');

for (const source of [reference,eventHorizon,controlOwner,miniMag,motionLoader,currentMag,renderer,governor,touch,sync,coreLife,directInteraction,geometryGuard,contentLoader]) new Function(source);
console.log('PASS: R528 MAG living-core source contract is coherent across active runtime, controls, lifecycle, reduced motion and mobile CSS');
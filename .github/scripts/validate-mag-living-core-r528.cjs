'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const reference = fs.readFileSync('docs/scifi-ui/scripts/formatx-reference-production-r244.js', 'utf8');
const eventHorizon = fs.readFileSync('docs/scifi-ui/scripts/formatx-event-horizon.js', 'utf8');
const controlOwner = fs.readFileSync('docs/scifi-ui/scripts/formatx-control-owner-r268.js', 'utf8');
const miniMag = fs.readFileSync('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js', 'utf8');
const motionLoader = fs.readFileSync('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js', 'utf8');
const currentMag = fs.readFileSync('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js', 'utf8');
const renderer = fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js', 'utf8');
const governor = fs.readFileSync('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js', 'utf8');
const touch = fs.readFileSync('docs/scifi-ui/scripts/formatx-core-touch-pulse-r99.js', 'utf8');
const sync = fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-shape-sync-r476.js', 'utf8');
const reducedCss = fs.readFileSync('docs/scifi-ui/styles/formatx-reduced-mag-identity-r528.css', 'utf8');
const semantic = fs.readFileSync('.github/scripts/validate-r522-semantic-mag.cjs', 'utf8');
const worker = fs.readFileSync('billing-worker/src/production-content-entry-r528.js', 'utf8');

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
]) {
  assert.ok(!/formatx:referencepause|fxReferenceMotionPaused|data-fx-reference-motion-paused|\.fx-reference-pause/.test(source), `${name}: obsolete manual MAG pause contract remains`);
}
assert.match(renderer, /function setLifecycleSuspended/, 'renderer lifecycle suspension API missing');
assert.match(renderer, /setLifecycleSuspended:\(suspended,source\)/, 'renderer public lifecycle suspension API missing');
assert.match(renderer, /document\.hidden\|\|!visible\|\|renderSuspended/, 'renderer lifecycle block state missing');
assert.match(governor, /automatic-resource-lifecycle-not-user-pause/, 'mobile governor lifecycle contract marker missing');
assert.match(touch, /living-core-no-manual-pause-wake/, 'touch path living-core contract marker missing');

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
assert.match(worker, /r528-mobile-critical-graph/, 'R528 production wrapper missing');
assert.match(worker, /formatx-reduced-mag-identity-r528\.css/, 'R528 reduced-motion identity layer not delivered');
assert.ok(worker.includes('formatx-event-horizon\\.js'), 'R528 runtime cache-bust graph does not include event-horizon');
assert.ok(worker.includes('formatx-control-owner-r268\\.js'), 'R528 runtime cache-bust graph does not include control-owner');
assert.ok(worker.includes('formatx-motion-runtime-loader-r239\\.js'), 'R528 runtime cache-bust graph does not include motion loader');
assert.ok(worker.includes('formatx-mini-mag-assistant-r459\\.js'), 'R528 runtime cache-bust graph does not include Mini MAG');

for (const source of [reference,eventHorizon,controlOwner,miniMag,motionLoader,currentMag,renderer,governor,touch,sync]) new Function(source);
console.log('PASS: R528 MAG living-core source contract is coherent');

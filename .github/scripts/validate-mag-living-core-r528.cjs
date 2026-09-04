'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const reference = fs.readFileSync('docs/scifi-ui/scripts/formatx-reference-production-r244.js', 'utf8');
const sync = fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-shape-sync-r476.js', 'utf8');
const reducedCss = fs.readFileSync('docs/scifi-ui/styles/formatx-reduced-mag-identity-r528.css', 'utf8');
const semantic = fs.readFileSync('.github/scripts/validate-r522-semantic-mag.cjs', 'utf8');
const worker = fs.readFileSync('billing-worker/src/production-content-entry-r528.js', 'utf8');

assert.ok(!/class=["'][^"']*fx-reference-pause/.test(reference), 'manual MAG PAUSE markup remains in canonical reference source');
assert.ok(!/formatx:referencepause/.test(sync), 'manual MAG pause event listener remains in canonical shape-sync runtime');
assert.ok(!/fxReferenceMotionPaused|data-fx-reference-motion-paused/.test(sync), 'manual MAG pause state remains in canonical shape-sync runtime');
assert.match(sync, /prefers-reduced-motion:\s*reduce/, 'reduced-motion media query missing from MAG runtime');
assert.match(sync, /document\.hidden/, 'automatic background suspension missing from MAG runtime');
assert.match(sync, /visibilitychange/, 'background lifecycle listener missing from MAG runtime');
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

console.log('PASS: R528 MAG living-core source contract is coherent');

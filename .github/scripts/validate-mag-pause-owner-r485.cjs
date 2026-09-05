'use strict';

/* Historical R485 filename retained for active workflow compatibility.
   Current product truth: dedicated manual MAG PAUSE/RESUME is retired. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

require('./validate-living-core-r425-source.cjs');

const controls = read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const renderer = read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const governor = read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');

assert.ok(!controls.includes('visibleControl(pause)'), 'manual PAUSE returned as required control');
assert.ok(!controls.includes('function ensurePause'), 'manual PAUSE creator returned');
assert.ok(!renderer.includes('formatx:referencepause'), 'renderer manual pause event owner returned');
assert.ok(!renderer.includes('fxReferenceMotionPaused'), 'renderer manual pause state returned');
assert.ok(!governor.includes('fxReferenceMotionPaused'), 'governor manual pause state returned');
assert.ok(renderer.includes('function setLifecycleSuspended'), 'lifecycle suspension API missing');
assert.ok(governor.includes('setLifecycleSuspended'), 'automatic lifecycle governor missing');

console.log('PASS: historical R485 gate mapped to current living-core/no-manual-pause contract.');

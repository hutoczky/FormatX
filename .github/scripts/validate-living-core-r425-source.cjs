'use strict';

/* FormatX R530 — current living-core source contract.
   Manual MAG PAUSE/RESUME is retired. Reduced-motion and automatic lifecycle
   suspension are accessibility/resource-management behavior, not user pause. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repository = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(repository, relative), 'utf8');
const has = (source, tokens, label) => {
  for (const token of tokens) assert.ok(source.includes(token), `missing ${label}: ${token}`);
};
const absent = (source, tokens, label) => {
  for (const token of tokens) assert.ok(!source.includes(token), `${label}: obsolete token remains: ${token}`);
};

const home = read('docs/scifi-ui/index.html');
const intro = read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const controls = read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const current = read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const renderer = read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const governor = read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const touch = read('docs/scifi-ui/scripts/formatx-core-touch-pulse-r99.js');
const direct = read('docs/scifi-ui/scripts/formatx-core-direct-interaction.js');
const geometry = read('docs/scifi-ui/scripts/formatx-geometry-guard-r286.js');
const content = read('docs/scifi-ui/scripts/formatx-content-runtime-loader-r241.js');
const worker = read('billing-worker/src/production-content-entry-r529.js');

has(home, ['formatx-event-horizon.js', 'formatx-motion-runtime-loader-r239.js', 'class="fx-language-toggle"'], 'static entry path');
has(intro, ['single-current-runtime-no-postdom-repair-stack', 'fxHeroLcpOwnerR411', 'static-html-no-reparent', 'fx-reference-controls-r204', 'fx-reference-ask'], 'first-paint owner');
absent(intro, ['function bindPause', 'formatx:referencepause', 'fxReferenceMotionPaused'], 'first-paint owner');

has(controls, ['fx-reference-controls-r204', 'fx-reference-ask'], 'canonical control owner');
assert.ok(!controls.includes('visibleControl(pause)'), 'manual PAUSE must not be a required control');
assert.ok(!controls.includes('function ensurePause'), 'manual PAUSE creator returned');

has(current, [
  'formatx-crystal-organism-r326.js?v=20260905-r528-lifecycle-suspension',
  'formatx-mobile-render-governor-r426.js?v=20260905-r528-lifecycle-suspension',
  'formatx-core-touch-pulse-r99.js?v=20260905-r528-living-core',
  'r528-lifecycle-suspend-no-idle-redraw'
], 'current MAG loader');
assert.ok(!current.includes('direct-pause-flag'), 'current MAG loader advertises obsolete pause-flag ownership');

has(renderer, [
  "const VERSION = 'crystal-organism-r326'",
  'buildOrganismGeometry',
  'single-luminous-webgl-material-owner',
  'function setLifecycleSuspended',
  'setLifecycleSuspended:(suspended,source)',
  'document.hidden||!visible||renderSuspended',
  "fxMagProductContractR528='living-core-continuous-normal-motion'",
  "listen(reduced,'change',onReducedMotionChange"
], 'single living renderer');
absent(renderer, ['formatx:referencepause', 'fxReferenceMotionPaused', '.fx-reference-pause', 'function onPause'], 'renderer');

has(governor, [
  'setLifecycleSuspended',
  "fxMobileRenderGovernorRevisionR433='r528-lifecycle-suspend-no-idle-redraw'",
  "fxMobileRenderContractR528='automatic-resource-lifecycle-not-user-pause'"
], 'mobile lifecycle governor');
absent(governor, ['userPaused', 'fxReferenceMotionPaused', 'formatx:referencepause', '.fx-reference-pause'], 'mobile lifecycle governor');

has(touch, ['formatx:coreinteraction', "fxCoreTouchContractR528='living-core-no-manual-pause-wake'"], 'touch path');
absent(touch, ['fxReferenceMotionPaused', 'formatx:referencepause', '.fx-reference-pause'], 'touch path');

has(direct, ["setLifecycleSuspended?.(false, 'direct-core-interaction')", 'requestRender?.(2)', 'formatx:coreinteraction'], 'direct interaction');
absent(direct, ['fxReferenceMotionPaused', 'formatx:referencepause', '.fx-reference-pause'], 'direct interaction');

has(geometry, ['fx-reference-controls-r204', 'fx-reference-ask'], 'geometry guard');
absent(geometry, ['.fx-reference-pause'], 'geometry guard');
has(content, ['fx-reference-ask', 'fx-three-sound'], 'content runtime reserved controls');
absent(content, ['.fx-reference-pause'], 'content runtime loader');

has(worker, ['r529-direct-canonical-living-core', "X-FormatX-Product-Contract','r529-living-core-no-manual-pause", 'formatx-heart-core-r252.css', 'production-content-entry.js'], 'R529 direct-canonical wrapper');

for (const source of [intro, controls, current, renderer, governor, touch, direct, geometry, content]) new Function(source);
console.log('PASS: R530 current living-core source contract — SOUND+ASK, one renderer/lifecycle owner, reduced-motion/background safety, no manual MAG pause owner.');

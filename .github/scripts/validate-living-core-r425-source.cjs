'use strict';

/* FormatX R530 — current living-core source contract.
   MAG startup is navigation-owned: no user input, idle callback or long timer
   may be required to start the living core. Manual MAG PAUSE/RESUME is retired.
   Reduced/background lifecycle remains accessible and WebGL failure retains one
   static-safe CSS identity with no fallback renderer clock. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repository = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(repository, relative), 'utf8');
const has = (source, tokens, label) => {
  for (const token of tokens) assert.ok(source.includes(token), `missing ${label}: ${token}`);
};
const absent = (source, tokens, label) => {
  for (const token of tokens) assert.ok(!source.includes(token), `${label}: obsolete/forbidden token remains: ${token}`);
};

const home = read('docs/scifi-ui/index.html');
const intro = read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const controls = read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const scheduler = read('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js');
const motionLoader = read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const current = read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const magCss = read('docs/scifi-ui/styles/formatx-current-mag-r422.css');
const heartbeatCss = read('docs/scifi-ui/styles/formatx-mag-mobile-optics-r480.css');
const firstPaintCss = read('docs/scifi-ui/styles/formatx-p0-first-paint-r490.css');
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

has(scheduler, [
  "fxMagStartupContractR530='living-core-autostart-navigation-owned'",
  "fxMagCanonicalClockR530='compositor-heartbeat-navigation-owned'",
  "fxMagStartupNoInputR530='required'",
  'formatx-motion-runtime-loader-r239.js?v=20260905-r530-navigation-autostart',
  'requestAnimationFrame(()=>requestAnimationFrame(afterFirstPaintBoundary))',
  "addEventListener('DOMContentLoaded',armNavigationStart"
], 'navigation-owned MAG scheduler');
absent(scheduler, [
  'AUTO_DELAY_MS', 'requestIdleCallback', 'late-auto-r493', 'waiting-visible-r493',
  "['pointerdown'", "'touchstart'", "'keydown'", "'wheel'", 'function onIntent', 'setTimeout('
], 'MAG startup scheduler');

has(motionLoader, [
  "fxMagStartupContractR530='living-core-autostart-navigation-owned'",
  "fxMotionRuntimeStartR530='navigation-owned-current-mag'",
  "fxCurrentMagRequestR530='navigation-owned'",
  'formatx-current-mag-loader-r422.js?v=20260905-r530-navigation-autostart',
  "fxCoreCriticalPathR422='navigation-autostart-direct-r326-r530-living-core'",
  'ensureCurrentMag();'
], 'motion loader MAG autostart');
absent(motionLoader, ['.fx-reference-pause', 'formatx:referencepause', 'fxReferenceMotionPaused'], 'motion loader MAG path');

has(current, [
  "fxMagStartupContractR530='living-core-autostart-navigation-owned'",
  "fxCurrentMagStartupR530='navigation-owned-booting'",
  "fxCurrentMagContractR530='living-core-autostart-navigation-owned-no-manual-pause'",
  'formatx-crystal-organism-r326.js?v=20260905-r530-navigation-autostart',
  'formatx-mobile-render-governor-r426.js?v=20260905-r530-navigation-autostart',
  'formatx-core-touch-pulse-r99.js?v=20260905-r528-living-core',
  'function rendererTerminalState',
  'function enableStaticFallback',
  "fxThree='error'",
  "fxMagFallbackR530='static-safe-css'",
  "fxCurrentMagRuntimeR422='ready-static-fallback'",
  "fxCoreRendererSelection='static-safe-css-fallback-r530'"
], 'current MAG loader');
absent(current, ['direct-pause-flag', 'formatx:referencepause', 'fxReferenceMotionPaused', '.fx-reference-pause'], 'current MAG loader');

has(heartbeatCss, [
  'production-r530-navigation-owned-mobile-heartbeat',
  'animation: fx-primary-mag-mobile-heart-r488 4.8s',
  'animation-play-state: running !important',
  '@media (prefers-reduced-motion:reduce)'
], 'navigation-owned mobile compositor life');
absent(heartbeatCss, ['data-fx-primary-mag-life-r482="steady"', 'data-fx-reference-motion-paused', '.fx-reference-pause'], 'mobile heartbeat runtime contract');

has(firstPaintCss, ['production-r530-p0-first-paint-no-manual-mag-pause'], 'first-paint no-pause marker');
absent(firstPaintCss, ['data-fx-reference-motion-paused', 'animation-play-state: paused'], 'first-paint manual pause CSS');

has(magCss, [
  'data-fx-mag-fallback-r530="static-safe-css"',
  'animation:none!important',
  'production-r530-direct-r326-layout-a11y-touch-static-safe-fallback'
], 'static-safe fallback stylesheet');
absent(magCss, ['animation-play-state:paused', 'data-fx-reference-motion-paused'], 'static fallback pause state');

has(renderer, [
  "const VERSION = 'crystal-organism-r326'",
  'buildOrganismGeometry',
  'single-luminous-webgl-material-owner',
  'function setLifecycleSuspended',
  'setLifecycleSuspended:(suspended,source)',
  'document.hidden||!visible||renderSuspended',
  "fxMagProductContractR528='living-core-continuous-normal-motion'",
  "listen(reduced,'change',onReducedMotionChange",
  "fxCrystalOrganismR326 = 'context-unavailable'",
  'schedule(1);'
], 'single living renderer');
absent(renderer, ['formatx:referencepause', 'fxReferenceMotionPaused', '.fx-reference-pause', 'function onPause'], 'renderer');

has(governor, [
  'setLifecycleSuspended',
  "fxMobileRenderGovernorRevisionR433='r530-navigation-compositor-life-interaction-webgl'",
  "fxMobileRenderContractR528='automatic-resource-lifecycle-not-user-pause'",
  "fxMobileRenderContractR530='navigation-owned-compositor-life-bounded-webgl'",
  "fxMobileAutonomousSurfaceR530='suppressed-performance-safe'"
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

has(worker, [
  'r529-direct-canonical-living-core',
  'X-FormatX-Product-Contract',
  'r529-living-core-no-manual-pause',
  'formatx-heart-core-r252.css',
  'production-content-entry.js'
], 'R529 direct-canonical wrapper');

for (const source of [intro, controls, scheduler, motionLoader, current, renderer, governor, touch, direct, geometry, content]) new Function(source);
console.log('PASS: R530 navigation-owned living-core source contract — MAG autostarts without input, SOUND+ASK remain functional, one renderer/lifecycle owner, reduced/background safety, static-safe WebGL fallback, no manual MAG pause owner.');

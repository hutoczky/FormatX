'use strict';

/* FormatX R531/P0 — final living-core source contract.
   MAG starts from navigation without user intent; manual MAG PAUSE/RESUME is
   retired. Reduced/background lifecycle remains automatic. The bounded R531
   visual preloader may cover the page briefly but never owns or gates MAG. */
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
const quality = read('docs/scifi-ui/styles/formatx-quality-r461.css');
const mini = read('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js');
const worker = read('billing-worker/src/production-content-entry-r529.js');

has(home, ['formatx-event-horizon.js', 'formatx-motion-runtime-loader-r239.js', 'formatx-quality-r461.css', 'class="fx-language-toggle"'], 'static entry path');

has(intro, [
  'single-current-runtime-no-postdom-repair-stack',
  'fxHeroLcpOwnerR411',
  'static-html-no-reparent',
  "fxPreloaderContractR531='visual-only-mag-independent-bounded'",
  "fxPreloaderEffectsR531=REDUCED?'reduced-static':'compositor-glow-scan-pulse'",
  'PRELOADER_MIN_MS=REDUCED?180:(MOBILE?1180:1350)',
  'PRELOADER_MAX_MS=REDUCED?520:(MOBILE?1450:1650)',
  'SYNCHRONIZING MAG',
  'MAG SZINKRONIZÁLÁSA',
  'formatx:preloadercomplete',
  'fx-reference-controls-r204',
  'fx-reference-ask',
  'sound-ask-no-manual-mag-pause',
  'runtime-error',
  'promise-error'
], 'R531 preloader/first-paint owner');
absent(intro, ['function bindPause', 'function ensurePause', 'formatx:referencepause', 'fxReferenceMotionPaused'], 'R531 first-paint owner');

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

has(quality, [
  '--fx-cyan: #7cecff',
  '--fx-violet: #8f72ff',
  'grid-template-columns: repeat(2, 50px)',
  '#formatx-event-horizon.fx-intro-overlay[data-fx-preloader-r531="active"]',
  'position: fixed !important',
  'pointer-events: none !important',
  '#formatx-event-horizon[data-fx-preloader-r531="active"] ~ main',
  '@media (prefers-reduced-motion: reduce)'
], 'R530 first-frame + R531 preloader quality layer');
absent(quality, ['.fx-reference-pause'], 'quality layer manual pause selector');

has(mini, [
  "fxMiniMagPhonePolicyR530='no-fixed-companion-no-information-occlusion'",
  "launcher:'MAG vezérlő megnyitása'",
  "title:'MAG'",
  "launcher:'Open MAG controller'",
  "subtitle:'Persistent site controller · primary MAG remains'",
  "fxMiniMagMotionControlR528='reduced-motion-only-no-manual-pause'"
], 'MAG controller visible naming + phone policy');
absent(mini, ['Mini MAG vezérlő megnyitása', "title:'MINI MAG'", "title:'MINI CORE'"], 'retired visible Mini MAG naming');
assert.doesNotMatch(mini, /getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);

has(worker, [
  'r529-direct-canonical-living-core',
  'X-FormatX-Product-Contract',
  'r529-living-core-no-manual-pause',
  'formatx-heart-core-r252.css',
  'production-content-entry.js',
  "EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260905-r531-preloader-effects-v2'",
  "DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner'",
  "QUALITY_URL = 'formatx-quality-r461.css?v=20260905-r531-preloader-cls-lock'",
  "X-FormatX-Preloader', 'r531-extended-effects-navigation-owned'",
  "X-FormatX-Preloader-Cache', 'r531-effects-v2-fresh-assets'"
], 'R529/R531 direct-canonical production wrapper');

for (const source of [intro, controls, scheduler, motionLoader, current, renderer, governor, touch, direct, geometry, content, mini]) new Function(source);
console.log('PASS: R531/P0 source contract — navigation-owned living MAG autostart, SOUND+ASK only, no manual PAUSE, one renderer/lifecycle owner, reduced/background safety, static-safe fallback, MAG-only visible naming, and bounded extended preloader delivery.');

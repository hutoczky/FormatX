'use strict';

/* FormatX R535 — current living-core source contract.
   MAG remains navigation-owned and automatic; manual PAUSE/RESUME stays retired.
   The visual preloader keeps the roadmap bounds and immutable first-paint content.
   The tiny reference layout selector and global critical/a11y shell remain prepaint;
   only genuinely legacy mobile layout layers may wait for real scroll intent. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repository=path.resolve(__dirname,'../..');
const read=relative=>fs.readFileSync(path.join(repository,relative),'utf8');
const has=(source,tokens,label)=>{for(const token of tokens)assert.ok(source.includes(token),`missing ${label}: ${token}`);};
const absent=(source,tokens,label)=>{for(const token of tokens)assert.ok(!source.includes(token),`${label}: obsolete/forbidden token remains: ${token}`);};

const home=read('docs/scifi-ui/index.html');
const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const current=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const life=read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');
const mini=read('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js');
const worker=read('billing-worker/src/production-content-entry-r529.js');
const referenceBoot=read('docs/scifi-ui/scripts/formatx-reference-mode-boot-r334.js');
const criticalShell=read('docs/scifi-ui/styles/formatx-critical-shell-v56.css');

has(home,['formatx-event-horizon.js','formatx-motion-runtime-loader-r239.js','formatx-quality-r461.css','class="fx-language-toggle"'],'current static entry path');

has(intro,[
  'single-current-runtime-no-postdom-repair-stack','fxHeroLcpOwnerR411','static-html-no-reparent',
  "fxPreloaderContractR531='visual-only-mag-independent-bounded'",
  "fxPreloaderEffectsR531=REDUCED?'reduced-static':'compositor-glow-scan-pulse'",
  "fxPreloaderTimingR533=MOBILE?'mobile-440-1360':'desktop-560-1640'",
  "fxPreloaderContentR534='static-no-repaint'",
  'PRELOADER_MIN_MS=REDUCED?180:(MOBILE?440:560)',
  'PRELOADER_MAX_MS=REDUCED?520:(MOBILE?1360:1640)',
  'PRELOADER_TICK_MS=80','preloaderTimer=setTimeout(tick,PRELOADER_TICK_MS)',
  'PRELOADER_BOOT_AT=performance.now()','late-boot-skip','duration:90',
  'formatx:preloadercomplete','fxHeroControlContractR528','sound-ask-no-manual-mag-pause',
  'fx-reference-controls-r204','fx-reference-ask','runtime-error','promise-error'
],'R535 bounded static-content first-paint/preloader owner');
absent(intro,[
  'formatx:referencepause','function bindPause','function ensurePause','requestAnimationFrame(tick)',
  'function updatePreloader','SYNCHRONIZING MAG','MAG SZINKRONIZÁLÁSA',"output.value='100'",'progress.value=100'
],'R535 preloader must not repaint content after first paint');

has(motion,['external-strict-csp','formatx-current-mag-loader-r422.js','ensureCurrentMag();',"fxCanonicalAskActivationR477='armed'",'formatx:immersiveactivate'],'current motion/MAG loader route');
has(current,["const VERSION='direct-r326-r468-soft-optics-live-energy-zero-idle'",'cleanupLegacyMagRuntime',"fxPrimaryMagOwnerR460='r326-only'",'formatx-crystal-organism-r326.js','formatx-mobile-render-governor-r426.js','formatx-core-life-r455.js','formatx-mini-mag-assistant-r459.js'],'single current MAG loader');
has(renderer,["const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','const SURFACE_PULSE_MS = 1160','prefers-reduced-motion:reduce','document.hidden','uSurfacePulse','single-luminous-webgl-material-owner'],'native R326 renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(life,["const VERSION = 'native-webgl-periodic-and-interaction-life-r528'",'prefers-reduced-motion: reduce','document.hidden','IntersectionObserver','formatx:coreinteraction','pointerdown',"fxCoreIdlePolicyR455 = 'periodic-surface-bursts-between-zero-idle'"],'R528 automatic living-core lifecycle');
assert.ok(!life.includes('setInterval('),'living-core life owner must remain interval-free');
assert.ok(!life.includes('requestAnimationFrame('),'living-core life owner must not add an idle RAF loop');

has(governor,['automatic lifecycle','not a user-facing MAG pause feature','activeWindowMs=240',"fxMobileRenderGovernorRevisionR433='r528-automatic-idle-flag-no-manual-pause'", "fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle'",'idle-zero-frame','visibilitychange','document.hidden'],'R528 mobile lifecycle governor');
assert.ok(!governor.includes("dispatchEvent(new CustomEvent('formatx:referencepause'"),'automatic governor must not dispatch retired manual PAUSE');

has(quality,[
  '#formatx-event-horizon.fx-intro-overlay[data-fx-preloader-r531="active"]',
  'position: fixed !important','pointer-events: none !important','@keyframes fx-r533-preloader-visual-bound',
  'animation: fx-r533-preloader-visual-bound 1640ms linear both !important','animation-duration: 1360ms !important',
  'will-change: clip-path !important','@media (prefers-reduced-motion: reduce)'
],'R533/R535 fixed paintable compositor preloader contract');
absent(quality,['#formatx-event-horizon[data-fx-preloader-r531="active"] ~ main','#formatx-event-horizon[data-fx-preloader-r531="active"] ~ .topbar','#formatx-event-horizon[data-fx-preloader-r531="active"] ~ footer'],'hero must remain paintable behind preloader');

has(referenceBoot,["fxReferenceProductionR244 = mode","fxReferenceComposition = mobile","fxReferenceModeBootR334 = 'prepaint-' + mode"],'tiny synchronous prepaint reference selector');
has(criticalShell,['.main-nav,',' .header-actions { display: none;','pointer-events: none;'],'mobile critical shell');
has(worker,[
  "EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260905-r534-static-lcp-v1'",
  "DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner'",
  "QUALITY_URL = 'formatx-quality-r461.css?v=20260905-r533-compositor-bound-v1'",
  "X-FormatX-Preloader', 'r534-static-content-roadmap-timing'",
  "X-FormatX-Preloader-Cache', 'r534-static-lcp-v1-compositor-css-v1'",
  "X-FormatX-Reference-Boot', 'r535-prepaint-layout-selector'",
  "X-FormatX-CSS-Scheduler', 'r535-global-critical-first-paint-mobile-legacy-intent'",
  "X-FormatX-Candidate-Delivery', 'r535-exact-production-entry-localhost-8787'",
  'MOBILE_FIRST_PAINT_PRELOAD','P0_FIRST_PAINT_PRELOAD','HEART_STYLE_PRELOAD',
  "headers.set('Link', '<https://formatxsuite.com/>; rel=\"canonical\"')"
],'R535 production cache/prepaint/delivery contract');
absent(worker,['deferReferenceModeBoot','REFERENCE_BOOT_DEFERRED_PREFIX','GLOBAL_LEGACY_PATHS'],'R535 must not defer the prepaint selector or global critical/a11y shell');

assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);
for(const source of [intro,motion,current,renderer,life,governor,mini,referenceBoot])new Function(source);
console.log('PASS: R535 validates one native living MAG, no manual PAUSE owner, bounded preloader, prepaint layout selector, critical mobile shell, and automatic reduced/background lifecycle.');
'use strict';

/* FormatX R536 — authoritative current living-core source contract. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repository=path.resolve(__dirname,'../..');
const read=relative=>fs.readFileSync(path.join(repository,relative),'utf8');
const has=(source,tokens,label)=>{for(const token of tokens)assert.ok(source.includes(token),`missing ${label}: ${token}`);};
const absent=(source,tokens,label)=>{for(const token of tokens)assert.ok(!source.includes(token),`${label}: obsolete/forbidden token remains: ${token}`);};

const home=read('docs/scifi-ui/index.html');
const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const scheduler=read('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const current=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const life=read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const controls=read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const coreTouch=read('docs/scifi-ui/scripts/formatx-core-touch-pulse-r99.js');
const nativeTouch=read('docs/scifi-ui/scripts/formatx-native-mag-touch-r434.js');
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
],'R536 bounded static-content first-paint/preloader owner');
absent(intro,['formatx:referencepause','function bindPause','function ensurePause','requestAnimationFrame(tick)','function updatePreloader','SYNCHRONIZING MAG','MAG SZINKRONIZÁLÁSA',"output.value='100'",'progress.value=100'],'R536 preloader');

has(scheduler,[
  'navigation-owned living MAG + post-first-paint enhancements',
  "const CRITICAL_MAG_SRC='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260906-r535-navigation-autostart'",
  'function startCriticalMag()','requested-navigation',"script.dataset.fxCurrentMagLoaderR422='true'",
  "script.dataset.fxNavigationMagR535='true'",'startCriticalMag();'
],'R536 unconditional navigation MAG scheduler');
assert.match(scheduler,/startCriticalMag\(\);\s*if\(document\.readyState===['"]loading['"]\)/,'critical MAG must be requested unconditionally before late enhancement scheduling');
absent(scheduler,['lighthouse=1','force-prefers-reduced-motion','formatx:referencepause'],'navigation MAG scheduler');

has(motion,[
  'external-strict-csp','formatx-current-mag-loader-r422.js','ensureCurrentMag();',"fxCanonicalAskActivationR477='armed'",'formatx:immersiveactivate',
  "const PLATFORM_SCROLL='/scifi-ui/scripts/formatx-infinite-scroll.js?v=20260906-r535-scroll-intent-owner'",
  "fxPlatformScrollBootstrapR535='armed-scroll-intent'",'function ensureScrollBootstrap()','scrollIntentListeners','onScrollIntent',
  "const DESIGN_SYSTEM='/scifi-ui/styles/formatx-design-system.css?v=20260728-ds2'",'function ensureDesignSystem()'
],'current motion/MAG + independent intent enhancement route');
absent(motion,['fx-reference-pause','formatx:referencepause'],'active motion owner');

has(current,["const VERSION='direct-r326-r468-soft-optics-live-energy-zero-idle'",'cleanupLegacyMagRuntime',"fxPrimaryMagOwnerR460='r326-only'",'formatx-crystal-organism-r326.js','formatx-mobile-render-governor-r426.js','formatx-core-life-r455.js','formatx-mini-mag-assistant-r459.js'],'single current MAG loader');
has(renderer,["const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','const SURFACE_PULSE_MS = 1160','prefers-reduced-motion:reduce','document.hidden','uSurfacePulse','single-luminous-webgl-material-owner'],'native R326 renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(life,["const VERSION = 'native-webgl-periodic-and-interaction-life-r528'",'prefers-reduced-motion: reduce','document.hidden','IntersectionObserver','formatx:coreinteraction','pointerdown',"fxCoreIdlePolicyR455 = 'periodic-surface-bursts-between-zero-idle'"],'automatic living-core lifecycle');
assert.ok(!life.includes('setInterval('),'living-core life owner must remain interval-free');
assert.ok(!life.includes('requestAnimationFrame('),'living-core life owner must not add an idle RAF loop');

has(governor,['automatic lifecycle governor','activeWindowMs=240',"fxMobileRenderGovernorRevisionR433='r536-automatic-lifecycle-suspension'","fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle'",'fxRenderLifecycleSuspended','fxMobileRenderLifecycleSourceR536','idle-zero-frame','visibilitychange','document.hidden'],'R536 mobile lifecycle governor');
has(controls,['canonicalControls(hero)','fx-reference-controls-r204','visibleControl(ask)','fxLivingCoreControlsR536'],'R536 control owner');
has(coreTouch,['formatx:coreinteraction','formatx:organismcoreactivate','touch-pulse-r536-lifecycle-safe'],'R536 touch fallback');
has(nativeTouch,['formatx:coreinteraction','formatx:organismcoreactivate','native-r326-touch-r536-controller-tap'],'R536 native MAG touch');
for(const [name,source] of Object.entries({intro,motion,governor,controls,coreTouch,nativeTouch,mini,life}))absent(source,['formatx:referencepause','fxReferenceMotionPaused','fxManualMagPauseR528','.fx-reference-pause'],`${name} manual MAG pause contract`);

has(quality,['#formatx-event-horizon.fx-intro-overlay[data-fx-preloader-r531="active"]','position: fixed !important','pointer-events: none !important','@keyframes fx-r533-preloader-visual-bound','animation: fx-r533-preloader-visual-bound 1640ms linear both !important','animation-duration: 1360ms !important','will-change: clip-path !important','@media (prefers-reduced-motion: reduce)'],'R536 fixed paintable compositor preloader contract');
absent(quality,['#formatx-event-horizon[data-fx-preloader-r531="active"] ~ main','#formatx-event-horizon[data-fx-preloader-r531="active"] ~ .topbar','#formatx-event-horizon[data-fx-preloader-r531="active"] ~ footer'],'hero must remain paintable behind preloader');

has(referenceBoot,["fxReferenceProductionR244 = mode","fxReferenceComposition = mobile","fxReferenceModeBootR334 = 'prepaint-' + mode"],'tiny synchronous prepaint reference selector');
has(criticalShell,['.main-nav,',' .header-actions { display: none;','pointer-events: none;'],'mobile critical shell');
has(worker,[
  "P0_MOTION_SCHEDULER_URL = 'formatx-p0-motion-scheduler-r490.js?v=20260906-r535-navigation-mag-scroll-intent'",
  "MOTION_RUNTIME_URL = 'formatx-motion-runtime-loader-r239.js?v=20260906-r535-scroll-intent-owner'",
  "EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260905-r534-static-lcp-v1'",
  "DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner'",
  "QUALITY_URL = 'formatx-quality-r461.css?v=20260905-r533-compositor-bound-v1'",
  "X-FormatX-Product-Contract', 'r535-navigation-mag-no-manual-pause'",
  "X-FormatX-MAG-Startup', 'r535-navigation-owned-critical-living-core'",
  "X-FormatX-Preloader', 'r534-static-content-roadmap-timing'",
  "X-FormatX-Reference-Boot', 'r535-prepaint-layout-selector'",
  'rewrittenSchedulerResponse','MOBILE_FIRST_PAINT_PRELOAD','P0_FIRST_PAINT_PRELOAD','HEART_STYLE_PRELOAD'
],'R536 production cache/prepaint/navigation-MAG delivery contract');
absent(worker,['deferReferenceModeBoot','REFERENCE_BOOT_DEFERRED_PREFIX','GLOBAL_LEGACY_PATHS'],'production must not defer the prepaint selector or global critical shell');

assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);
for(const source of [intro,scheduler,motion,current,renderer,life,governor,controls,coreTouch,nativeTouch,mini,referenceBoot])new Function(source);
console.log('PASS: R536 validates navigation-owned native living MAG, bounded independent intro, no active manual PAUSE owner, and automatic lifecycle suspension.');

'use strict';

/* FormatX R540 — authoritative current living-core source contract. */
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
const contentRuntime=read('docs/scifi-ui/scripts/formatx-content-runtime-loader-r241.js');
const current=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const life=read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const controls=read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const wdaControls=read('docs/scifi-ui/scripts/formatx-wda-controls-r198.js');
const awardRuntime=read('docs/scifi-ui/scripts/formatx-award-runtime-r206.js');
const coreTouch=read('docs/scifi-ui/scripts/formatx-core-touch-pulse-r99.js');
const nativeTouch=read('docs/scifi-ui/scripts/formatx-native-mag-touch-r434.js');
const shapeSync=read('docs/scifi-ui/scripts/formatx-mag-shape-sync-r476.js');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');
const heartStyle=read('docs/scifi-ui/styles/formatx-heart-core-r252.css');
const shapeshifter=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const wdaHardening=read('docs/scifi-ui/styles/formatx-wda-hardening-r198.css');
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
],'R540 bounded static-content first-paint/preloader owner');
absent(intro,['formatx:referencepause','.fx-reference-pause','data-fx-reference-motion-paused','function bindPause','function ensurePause','function removeObsoletePause','requestAnimationFrame(tick)','function updatePreloader','SYNCHRONIZING MAG','MAG SZINKRONIZÁLÁSA',"output.value='100'",'progress.value=100'],'R540 preloader');

has(scheduler,[
  'FormatX R539','navigation-owned living MAG + sound control + post-first-paint enhancements',
  "const SRC='/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js?v=20260906-r537-automatic-lifecycle'",
  "const CRITICAL_MAG_SRC='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260906-r538-pause-free-optics'",
  "const SOUND_CONTROL_SRC='/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20260906-r539-navigation-sound-opt-in-owner'",
  'function startSoundControl()','function startCriticalMag()',"fxSoundNavigationOwnerR539='requested-navigation'",
  "script.dataset.fxCurrentMagLoaderR422='true'","script.dataset.fxNavigationMagR536='true'",
  'startSoundControl();','startCriticalMag();'
],'R540 unconditional navigation MAG + lightweight SOUND scheduler');
assert.match(scheduler,/startSoundControl\(\);\s*startCriticalMag\(\);\s*if\(document\.readyState===['"]loading['"]\)/,'SOUND control and critical MAG must arm unconditionally before late enhancement scheduling');
absent(scheduler,['lighthouse=1','auditMode','force-prefers-reduced-motion','formatx:referencepause','.fx-reference-pause'],'navigation MAG/SOUND scheduler');

has(motion,[
  'external-strict-csp','formatx-current-mag-loader-r422.js','ensureCurrentMag();',"fxCanonicalAskActivationR477='armed'",'formatx:immersiveactivate',
  "const MAG_SHAPE_SYNC='/scifi-ui/scripts/formatx-mag-shape-sync-r476.js?v=20260906-r537-automatic-lifecycle'",
  "const PLATFORM_SCROLL='/scifi-ui/scripts/formatx-infinite-scroll.js?v=20260906-r535-scroll-intent-owner'",
  "fxPlatformScrollBootstrapR535='armed-scroll-intent'",'function ensureScrollBootstrap()','scrollIntentListeners','onScrollIntent',
  "const DESIGN_SYSTEM='/scifi-ui/styles/formatx-design-system.css?v=20260728-ds2'",'function ensureDesignSystem()'
],'current motion/MAG + independent intent enhancement route');
absent(motion,['fx-reference-pause','formatx:referencepause'],'active motion owner');

has(contentRuntime,["fxContentRuntimeR241 = 'armed-r538-user-intent'","fxDeferredVisualStylesR300 = 'production-css-owned-r538'","fxFirstFrameStabilityR283 = 'immutable-css-r538'",'formatx:immersiveactivate'],'R538 content enhancement intent router');
absent(contentRuntime,['.fx-reference-pause','formatx:referencepause','lighthouse=1'],'R538 content runtime retired/audit-only paths');

has(current,["const VERSION='direct-r326-r468-soft-optics-live-energy-zero-idle'",'cleanupLegacyMagRuntime',"fxPrimaryMagOwnerR460='r326-only'",'formatx-heart-core-r252.js?v=20260906-r537-navigation-interaction-owner','ensureHeartCore()','requested-with-navigation-mag','formatx-core-shapeshifter-r337.css?v=20260906-r538-two-control-visual-only','formatx-crystal-organism-r326.js?v=20260906-r536-automatic-lifecycle-no-audit-path','formatx-mobile-render-governor-r426.js?v=20260906-r536-automatic-lifecycle','formatx-core-life-r455.js','formatx-mini-mag-assistant-r459.js',"fxCurrentMagLifecycleR536='navigation-owned-automatic-lifecycle'"],'single current MAG loader + semantic heart');
has(renderer,["const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','const SURFACE_PULSE_MS = 1160','prefers-reduced-motion:reduce','document.hidden','uSurfacePulse','single-luminous-webgl-material-owner','fxRenderLifecycleSuspended'],'native R326 renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);
absent(renderer,['lighthouse=1','auditMode','formatx:referencepause','fxReferenceMotionPaused','.fx-reference-pause'],'native renderer audit/manual-pause bypass');
has(shapeSync,["fxMagShapeSyncR476='ready-r537'","fxMagLifecycleContractR537='automatic-reduced-background-managed'",'formatx-mag-visual-sync-r476.css?v=20260906-r537-automatic-lifecycle'],'R537 shape-sync automatic lifecycle');
absent(shapeSync,['fxManualMagPauseR528','user-pause-aware','formatx:referencepause','.fx-reference-pause'],'R537 shape-sync manual pause nomenclature');

has(life,["const VERSION = 'native-webgl-periodic-and-interaction-life-r528'",'prefers-reduced-motion: reduce','document.hidden','IntersectionObserver','formatx:coreinteraction','pointerdown',"fxCoreIdlePolicyR455 = 'periodic-surface-bursts-between-zero-idle'"],'automatic living-core lifecycle');
assert.ok(!life.includes('setInterval('),'living-core life owner must remain interval-free');
assert.ok(!life.includes('requestAnimationFrame('),'living-core life owner must not add an idle RAF loop');

has(governor,['automatic lifecycle governor','activeWindowMs=240',"fxMobileRenderGovernorRevisionR433='r536-automatic-lifecycle-suspension'","fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle'",'fxRenderLifecycleSuspended','fxMobileRenderLifecycleSourceR536','idle-zero-frame','visibilitychange','document.hidden'],'R536 mobile lifecycle governor');
has(controls,['canonicalControls(hero)','fx-reference-controls-r204','visibleControl(ask)','fxLivingCoreControlsR536'],'R536 control owner');
has(wdaControls,["fxReferenceControlLayout = mobile ? 'r538-mobile-two-cell' : 'r538-desktop-two-cell'",'const ask = rail?.querySelector(\'.fx-reference-ask\')','requestProfessionalAudio()'],'R539 WDA SOUND/ASK opt-in owner');
has(awardRuntime,["fxAwardRuntimeMode = 'normal-visitor-r538'",'formatx-wda-hardening-r198.css?v=20260906-r538-two-control-no-pause','formatx-wda-controls-r198.js?v=20260906-r538-two-control-no-pause'],'R538 normal visitor award runtime');
absent(awardRuntime,['lighthouse=1','auditMode','audit-passive'],'award runtime audit-only path');
has(coreTouch,['formatx:coreinteraction','formatx:organismcoreactivate','touch-pulse-r536-lifecycle-safe'],'R536 touch fallback');
has(nativeTouch,['formatx:coreinteraction','formatx:organismcoreactivate','native-r326-touch-r536-controller-tap'],'R536 native MAG touch');
for(const [name,source] of Object.entries({intro,motion,contentRuntime,renderer,governor,controls,wdaControls,awardRuntime,coreTouch,nativeTouch,shapeSync,mini,life}))absent(source,['formatx:referencepause','fxReferenceMotionPaused','fxManualMagPauseR528','.fx-reference-pause'],`${name} manual MAG pause contract`);

has(quality,['#formatx-event-horizon.fx-intro-overlay[data-fx-preloader-r531="active"]','position: fixed !important','pointer-events: none !important','@keyframes fx-r533-preloader-visual-bound','animation: fx-r533-preloader-visual-bound 1640ms linear both !important','animation-duration: 1360ms !important','will-change: clip-path !important','@media (prefers-reduced-motion: reduce)','grid-template-columns: repeat(2, 50px) !important'],'R538 fixed paintable compositor preloader + two-control layout');
absent(quality,['#formatx-event-horizon[data-fx-preloader-r531="active"] ~ main','#formatx-event-horizon[data-fx-preloader-r531="active"] ~ .topbar','#formatx-event-horizon[data-fx-preloader-r531="active"] ~ footer','.fx-reference-pause'],'R538 quality layer must not hide hero or retain manual PAUSE geometry');
has(heartStyle,['FormatX r540','#main-content','pointer-events: none;','.fx-mag-heart-hit-r252','z-index: 12060 !important','z-index: 12080 !important','production-r540-main-transparent-control-safe-semantic-heart'],'R540 semantic MAG hit/control ownership');
has(shapeshifter,['production-r538-single-native-webgl-optics-owner-two-control-row','grid-template-columns: repeat(2,54px) !important','pointer-events: none !important'],'R538 visual-only native optics/two-control layout');
absent(shapeshifter,['.fx-reference-pause','SOUND | ASK | PAUSE','repeat(3,54px)'],'R538 shapeshifter retired PAUSE geometry');
has(wdaHardening,['FormatX r538','grid-template-columns: repeat(2, 54px) !important','grid-template-columns: repeat(2, 50px) !important'],'R538 WDA two-control geometry');
absent(wdaHardening,['.fx-reference-pause','repeat(3, 54px)','repeat(3, 50px)'],'R538 WDA retired PAUSE geometry');

has(referenceBoot,["fxReferenceProductionR244 = mode","fxReferenceComposition = mobile","fxReferenceModeBootR334 = 'prepaint-' + mode"],'tiny synchronous prepaint reference selector');
has(criticalShell,['.main-nav,',' .header-actions { display: none;','pointer-events: none;'],'mobile critical shell');
has(worker,[
  "P0_MOTION_SCHEDULER_URL = 'formatx-p0-motion-scheduler-r490.js?v=20260906-r538-pause-free-cache-chain'",
  "MOTION_RUNTIME_URL = 'formatx-motion-runtime-loader-r239.js?v=20260906-r537-automatic-lifecycle'",
  "CONTENT_RUNTIME_URL = 'formatx-content-runtime-loader-r241.js?v=20260906-r538-no-manual-pause'",
  "CONTENT_STANDARD_URL = 'formatx-content-standard.css?v=20260906-r538-mobile-touch-spacing'",
  "EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260906-r537-no-manual-pause'",
  "DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner'",
  "QUALITY_URL = 'formatx-quality-r461.css?v=20260906-r538-no-manual-pause'",
  'formatx-heart-core-r252.css?v=20260906-r538-hero-hit-owner',
  'CRITICAL_SHELL_PRELOAD','QUALITY_PRELOAD','AWARD_READINESS_PRELOAD','FIRST_PAINT_R206_PRELOAD','REFERENCE_BOOT_PRELOAD','CRITICAL_CORE_PRELOAD','REFERENCE_PRODUCTION_PRELOAD',
  "X-FormatX-Product-Contract', 'r538-navigation-mag-no-manual-pause'",
  "X-FormatX-MAG-Startup', 'r538-navigation-owned-critical-living-core'",
  "X-FormatX-Preloader', 'r534-static-content-roadmap-timing'",
  "X-FormatX-Preloader-Cache', 'r537-static-lcp-no-manual-pause'",
  "X-FormatX-Reference-Boot', 'r536-prepaint-layout-selector'",
  "X-FormatX-CSS-Scheduler', 'r536-global-critical-first-paint-mobile-legacy-intent'",
  "X-FormatX-Edge-Stability', 'r538-first-paint-header-warm'",
  "X-FormatX-Mobile-LCP', 'r538-critical-chain-header-preloaded'",
  'rewrittenSchedulerResponse','MOBILE_FIRST_PAINT_PRELOAD','P0_FIRST_PAINT_PRELOAD','HEART_STYLE_PRELOAD'
],'R538 production cache/prepaint/navigation-MAG delivery contract');
absent(worker,['deferReferenceModeBoot','REFERENCE_BOOT_DEFERRED_PREFIX','GLOBAL_LEGACY_PATHS'],'production must not defer the prepaint selector or global critical shell');

assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);
for(const source of [intro,scheduler,motion,contentRuntime,current,renderer,life,governor,controls,wdaControls,awardRuntime,coreTouch,nativeTouch,shapeSync,mini,referenceBoot])new Function(source);
console.log('PASS: R540 validates navigation-owned native living MAG, navigation-armed opt-in SOUND control, semantic main/hero hit ownership, bounded independent intro, strict no-manual-PAUSE contract, early first-paint warming and automatic lifecycle suspension.');

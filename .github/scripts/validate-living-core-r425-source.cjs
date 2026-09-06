'use strict';

/* FormatX R554 — authoritative P0 living-core source contract. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const has=(src,tokens,label)=>{for(const token of tokens)assert.ok(src.includes(token),`missing ${label}: ${token}`);};
const absent=(src,tokens,label)=>{for(const token of tokens)assert.ok(!src.includes(token),`${label}: forbidden token remains: ${token}`);};

const home=read('docs/scifi-ui/index.html');
const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const current=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const heart=read('docs/scifi-ui/scripts/formatx-heart-core-r252.js');
const heartCss=read('docs/scifi-ui/styles/formatx-heart-core-r252.css');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const life=read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const shape=read('docs/scifi-ui/scripts/formatx-mag-shape-sync-r476.js');
const wda=read('docs/scifi-ui/scripts/formatx-wda-controls-r198.js');
const content=read('docs/scifi-ui/scripts/formatx-content-runtime-loader-r241.js');
const living=read('docs/scifi-ui/scripts/living-architecture.js');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');
const optics=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const p0FirstPaint=read('docs/scifi-ui/styles/formatx-p0-first-paint-r490.css');
const worker=read('billing-worker/src/production-content-entry-r529.js');
const desktop=JSON.parse(read('lighthouserc.json'));
const mobile=JSON.parse(read('lighthouserc.mobile.json'));

has(home,['formatx-event-horizon.js','formatx-motion-runtime-loader-r239.js','formatx-quality-r461.css','class="fx-language-toggle"'],'static entry');
has(intro,["fxPreloaderTimingR533=MOBILE?'mobile-1180-1450':'desktop-1350-1650'","fxPreloaderContentR534='static-no-repaint'",'PRELOADER_MIN_MS=REDUCED?180:(MOBILE?1180:1350)','PRELOADER_MAX_MS=REDUCED?520:(MOBILE?1450:1650)','PRELOADER_TICK_MS=80','PRELOADER_FADE_MS=REDUCED?0:90','PRELOADER_RELEASE_GUARD_MS=PRELOADER_FADE_MS+PRELOADER_TICK_MS+40','PRELOADER_HIDE_BY_MS','fxPreloaderDeadlineR549','late-boot-skip','formatx:preloadercomplete',"fxHeroControlContractR528='sound-ask-no-manual-mag-pause'",'function professionalAudioOwns(button)'],'extended independent intro');
absent(intro,['formatx:referencepause','.fx-reference-pause','function bindPause','function ensurePause','requestAnimationFrame(tick)','function updatePreloader','SYNCHRONIZING MAG'],'intro no manual pause / no repaint loop');

has(motion,['FormatX r550',"CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260906-r550-parallel-shader-under-intro'","SOUND_CONTROL='/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20260906-r542-professional-owner-authoritative'",'function ensureSoundControl()','function ensureCurrentMag()','ensureSoundControl();ensureCurrentMag();',"fxMagNavigationStartupR550='first-paint-yield-parallel-styles-under-intro-no-user-gate'","fxPlatformScrollBootstrapR535='armed-scroll-intent'",'function ensureScrollBootstrap()','formatx:immersiveactivate','.fx-mag-heart-hit-r252'],'navigation MAG/SOUND + intent enhancements');
absent(motion,['lighthouse=1','auditMode','force-prefers-reduced-motion','formatx:referencepause','.fx-reference-pause'],'motion runtime single visitor path');

has(current,['FormatX R550','r326-only',"HEART_CORE='/scifi-ui/scripts/formatx-heart-core-r252.js?v=20260906-r549-pointer-transparent-physical-router'",'ensureHeartCore()','requested-with-navigation-mag',"RENDERER='/scifi-ui/scripts/formatx-crystal-organism-r326.js?v=20260906-r550-parallel-shader-compile'",'function yieldUntilFirstVisualPaint()','PerformanceObserver',"const layoutStyle=addStyle(STYLE,'data-fx-current-mag-r422')",'const nonCriticalStyles=Promise.all([','const rendererStart=Promise.all([layoutStyle,yieldUntilFirstVisualPaint()]).then(async()=>{',"fxCurrentMagStartupR550='renderer-parallel-with-noncritical-styles'","fxCurrentMagRendererStartR550='loaded-under-intro-parallel'",'const rendererReady=await rendererStart;',"fxCurrentMagLifecycleR536='navigation-owned-automatic-lifecycle'"],'navigation current MAG owner with first-paint parallel shader startup');
absent(current,['waitForBoundedIntroRelease','formatx:preloadercomplete','fxCurrentMagIntroYieldR547','await waitForBoundedIntroRelease();','lighthouse=1','auditMode','force-prefers-reduced-motion','formatx:referencepause','.fx-reference-pause','pointerdown-first-renderer-start','click-first-renderer-start'],'current MAG cannot wait for intro/audit/manual/user intent');

has(heart,["const VERSION = 'heart-core-r551'","STYLE = '/scifi-ui/styles/formatx-heart-core-r252.css?v=20260906-r549-pointer-transparent-router'",'function ensureStyleAfterFirstPaint()',"fxHeartStyleR551 = 'queued-post-first-paint'","fxHeartStyleR551 = 'requested-post-first-paint'","fxMagHeartHitOwnerR542 = 'body-fixed-stage-synced'","fxMagHeartHitGeometryR542 = 'viewport-stage-synced'",'function routePhysicalHeartClick(event)',"fxMagHeartPhysicalRouteR546 = 'armed-trusted-stage-hit'","fxMagHeartPhysicalRouteR546 = 'captured-stage-hit'","fxMagHeartPhysicalRouteR549 = 'captured-pointer-transparent-stage-hit'","fxMagHeartTouchRouteR551",'event.isTrusted','isReservedInteractiveTarget(event.target)','formatx:coreinteraction','formatx:immersiveactivate','document.hidden','visibilitychange','footer-to-real-core-no-reference-mirror','none-mobile-r252','FormatXOrganismVoice'],'R551 semantic heart lifecycle + trusted touch route');
assert.match(heart,/document\.querySelector\(['"]\.fx-mag-heart-hit-r252['"]\)/);
has(heartCss,['FormatX r554','body.living-architecture > .fx-mag-heart-hit-r252','position: fixed !important','pointer-events: none !important','fx-immersive-launch','display: none !important','.fx-trust-grid > a.fx-trust-card','min-block-size: 96px','production-r554-pointer-transparent-heart-retired-click-launch'],'R554 heart geometry/touch/retired launch contract');
absent(heartCss,['.fx-reference-pause'],'heart CSS manual PAUSE forbidden');

has(living,['function loadScriptOrdered(src, attr, readyCheck)','typeof readyCheck === \'function\'','probeTimer = setTimeout(probe, 25)',"fxThreeLoader = 'starting-on-demand-r554'","fxThreeLoader = 'loading-interface-r554'","fxThreeLoader = 'interface-ready-r554'","fxThreeLoader = 'menu-ready-r554'","fxThreeLoader = 'ready-on-demand-r554'","fxThreeLoader = 'failed-on-demand-r554'",'organism-interface.js?v=20260906-r554-idempotent-handoff','organism-menu-controller.js?v=20260906-r554-idempotent-handoff','formatx:organismhandoffready',"fxThreeLoader = 'deferred-user-activation'",'formatx:immersiveactivate'],'idempotent user-activated Organism handoff');
assert.ok(living.indexOf('organism-interface.js?v=20260906-r554-idempotent-handoff') < living.indexOf('organism-menu-controller.js?v=20260906-r554-idempotent-handoff'),'Organism interface must be requested before menu');

has(wda,['requestProfessionalAudio()','pendingToggleAfterLoad','first-click-replayed','function enforceProfessionalOwnership(button)',"button.dataset.fxAudioOwner !== 'professional-v6'","root.dataset.fxAudioOwner = 'professional-v6'","fxWdaSoundOwnershipR542 = 'professional-owner-reasserted'"],'professional audio ownership handoff');
absent(wda,['formatx:referencepause','.fx-reference-pause'],'WDA no manual pause');
has(content,["fxContentRuntimeR241 = 'armed-r538-user-intent'","fxContentRuntimeR241 = 'requested-r538-user-intent'","fxFirstFrameStabilityR283 = 'immutable-css-r538'"],'R538 interaction-deferred content fallback');

has(renderer,["const REVISION = 'living-luminous-electric-crystal-r550-parallel-compile'",'buildOrganismGeometry','const SURFACE_PULSE_MS = 1160',"gl.getExtension('KHR_parallel_shader_compile')",'function waitForProgram(gl, program, extension)',"fxCoreShaderCompileR550 = 'parallel-khr-pending'","fxCoreShaderCompileR550 = 'parallel-khr-complete'","fxCoreShaderCompileR550 = 'synchronous-fallback'",'document.hidden','fxRenderLifecycleSuspended'],'single native WebGL renderer with parallel shader compile');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);
absent(renderer,['lighthouse=1','auditMode','formatx:referencepause','.fx-reference-pause'],'renderer no audit/manual pause bypass');
has(life,['native-webgl-periodic-and-interaction-life-r528','periodic-surface-bursts-between-zero-idle','IntersectionObserver','document.hidden','formatx:coreinteraction'],'automatic life owner');
assert.ok(!life.includes('setInterval('));assert.ok(!life.includes('requestAnimationFrame('));
has(governor,['activeWindowMs=240','fxRenderLifecycleSuspended','idle-zero-frame','visibilitychange','document.hidden'],'automatic mobile lifecycle governor');
has(shape,['automatic-reduced-background-managed','visibilitychange'],'automatic shape lifecycle');
assert.match(shape,/prefers-reduced-motion:\s*reduce/,'shape reduced-motion query must be semantic');

has(quality,['@keyframes fx-r533-preloader-visual-bound','animation: fx-r533-preloader-visual-bound 1640ms linear both !important','animation-duration: 1360ms !important','grid-template-columns: repeat(2, 50px) !important'],'compositor hard bound/two-control quality layer');
absent(quality,['.fx-reference-pause'],'quality no manual pause');
has(optics,['grid-template-columns: repeat(2,54px) !important','pointer-events: none !important'],'visual-only two-control optics');
absent(optics,['.fx-reference-pause','repeat(3,54px)'],'optics no manual pause');
has(p0FirstPaint,['production-r552-no-manual-pause-blocking-css'],'blocking P0 CSS revision');
absent(p0FirstPaint,['.fx-reference-pause','data-fx-reference-motion-paused','formatx:referencepause'],'blocking P0 CSS no manual pause state');

assert.match(worker,/P0_MOTION_SCHEDULER_URL\s*=\s*'formatx-p0-motion-scheduler-r490\.js\?v=20260906-r549-navigation-mag-under-intro'/,'scheduler cache identity');
assert.match(worker,/MOTION_RUNTIME_URL\s*=\s*'formatx-motion-runtime-loader-r239\.js\?v=20260906-r550-parallel-shader-under-intro'/,'R550 motion cache identity');
assert.match(worker,/EVENT_HORIZON_URL\s*=\s*'formatx-event-horizon\.js\?v=20260906-r549-extended-static-intro-fade-deadline'/,'intro cache identity');
has(worker,['function restoreCriticalCoreFirstPaint(html)','CRITICAL_CORE_PRELOAD','function injectStaticHeroShell(html)','HERO_CONTROLS','HERO_PROOF',"X-FormatX-Layout-Stability','r554-static-hero-shell-critical-core-prepaint"],'R554 prepaint hero geometry delivery');
assert.ok(worker.includes('html=restoreCriticalCoreFirstPaint(html)'),'R554 wrapper must restore critical-core before first paint');
assert.ok(worker.includes('html=injectStaticHeroShell(html)'),'R554 wrapper must inject semantic hero shell before first paint');
assert.match(worker,/html\s*=\s*html\.replace\(MOTION_RUNTIME_RE\s*,\s*MOTION_RUNTIME_URL\)/,'motion runtime rewrite');
has(worker,['canonicalProduction.fetch(request, env, ctx)'],'canonical production ownership');

function validateLighthouse(config,label){
  const collect=config.ci.collect,assertions=config.ci.assert.assertions;
  assert.equal(collect.numberOfRuns,3,`${label}: requires 3 runs`);
  assert.ok(collect.url.every(url=>!url.includes('lighthouse=1')),`${label}: no audit query path`);
  assert.ok(!String(collect.settings.chromeFlags||'').includes('force-prefers-reduced-motion'),`${label}: no forced reduced motion`);
  assert.ok(!('skipAudits' in collect.settings),`${label}: no skipped audits`);
  for(const category of ['performance','accessibility','best-practices','seo'])assert.equal(assertions[`categories:${category}`][1].minScore,1,`${label}: ${category} strict 1.0`);
  assert.equal(assertions['largest-contentful-paint'][1].maxNumericValue,1999);
  assert.equal(assertions['total-blocking-time'][1].maxNumericValue,150);
  assert.equal(assertions['cumulative-layout-shift'][1].maxNumericValue,.049);
}
validateLighthouse(desktop,'desktop');validateLighthouse(mobile,'mobile');
for(const source of [intro,motion,current,heart,wda,content,living,renderer,life,governor,shape])new Function(source);
console.log('PASS: R554 proves extended static intro, navigation-owned native MAG, prepaint hero geometry, trusted physical heart routing without click-to-launch, idempotent user-activated Organism handoff, professional SOUND ownership, automatic lifecycle, no manual PAUSE, and strict 100x3 Lighthouse gates.');

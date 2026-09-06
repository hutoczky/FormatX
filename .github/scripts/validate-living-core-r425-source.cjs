'use strict';

/* FormatX R542 — authoritative P0 living-core source contract. */
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
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');
const optics=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const worker=read('billing-worker/src/production-content-entry-r529.js');
const desktop=JSON.parse(read('lighthouserc.json'));
const mobile=JSON.parse(read('lighthouserc.mobile.json'));

has(home,['formatx-event-horizon.js','formatx-motion-runtime-loader-r239.js','formatx-quality-r461.css','class="fx-language-toggle"'],'static entry');
has(intro,["fxPreloaderTimingR533=MOBILE?'mobile-440-1360':'desktop-560-1640'","fxPreloaderContentR534='static-no-repaint'",'PRELOADER_MIN_MS=REDUCED?180:(MOBILE?440:560)','PRELOADER_MAX_MS=REDUCED?520:(MOBILE?1360:1640)','PRELOADER_TICK_MS=80','late-boot-skip','duration:90','formatx:preloadercomplete',"fxHeroControlContractR528='sound-ask-no-manual-mag-pause'"],'bounded independent intro');
absent(intro,['formatx:referencepause','.fx-reference-pause','function bindPause','function ensurePause','requestAnimationFrame(tick)','function updatePreloader','SYNCHRONIZING MAG'],'intro no manual pause / no repaint loop');

has(motion,['FormatX r542',"CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260906-r542-body-fixed-stage-sync'","SOUND_CONTROL='/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20260906-r542-professional-owner-authoritative'",'function ensureSoundControl()','function ensureCurrentMag()','ensureSoundControl();ensureCurrentMag();',"fxPlatformScrollBootstrapR535='armed-scroll-intent'",'function ensureScrollBootstrap()','formatx:immersiveactivate','.fx-mag-heart-hit-r252'],'navigation MAG/SOUND + intent enhancements');
absent(motion,['lighthouse=1','auditMode','force-prefers-reduced-motion','formatx:referencepause','.fx-reference-pause'],'motion runtime single visitor path');

has(current,['FormatX R542','r326-only',"HEART_CORE='/scifi-ui/scripts/formatx-heart-core-r252.js?v=20260906-r542-body-fixed-stage-sync'",'ensureHeartCore()','requested-with-navigation-mag','formatx-crystal-organism-r326.js',"fxCurrentMagLifecycleR536='navigation-owned-automatic-lifecycle'","heart:'r542-body-fixed-stage-synced'"],'navigation current MAG owner');

has(heart,["const VERSION = 'heart-core-r542'","fxMagHeartHitOwnerR542 = 'body-fixed-stage-synced'","fxMagHeartHitGeometryR542 = 'viewport-stage-synced'",'function syncHeartGeometry(hit)','hit.parentElement !== body','body.insertBefore(hit, main)','document.hidden','visibilitychange','formatx:coreinteraction','formatx:immersiveactivate','footer-to-real-core-no-reference-mirror','none-mobile-r252','FormatXOrganismVoice'],'R542 body-level semantic heart lifecycle');
assert.match(heart,/document\.querySelector\(['"]\.fx-mag-heart-hit-r252['"]\)/,'heart must use one global semantic owner');

has(heartCss,['FormatX r542','body.living-architecture > .fx-mag-heart-hit-r252','position: fixed !important','z-index: 200 !important','#hero .hero-space','z-index: 300 !important','pointer-events: none !important','.fx-trust-grid > a.fx-trust-card','min-block-size: 96px','production-r542-body-fixed-stage-synced-semantic-heart'],'R542 hit geometry/touch contract');
absent(heartCss,['production-r540-main-transparent-control-safe-semantic-heart','.fx-reference-pause'],'retired ancestor hit/manual pause contract');
assert.ok(!heartCss.includes('html body.living-architecture #main-content,'),'main must retain normal pointer semantics');

has(wda,['requestProfessionalAudio()','pendingToggleAfterLoad','first-click-replayed','function enforceProfessionalOwnership(button)',"button.dataset.fxAudioOwner !== 'professional-v6'","root.dataset.fxAudioOwner = 'professional-v6'","fxWdaSoundOwnershipR542 = 'professional-owner-reasserted'"],'professional audio ownership handoff');
absent(wda,['formatx:referencepause','.fx-reference-pause'],'WDA no manual pause');

has(content,["fxContentRuntimeR241 = 'armed-r538-user-intent'","fxContentRuntimeR241 = 'requested-r538-user-intent'","fxFirstFrameStabilityR283 = 'immutable-css-r538'"],'R538 interaction-deferred content fallback');
has(renderer,["const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','const SURFACE_PULSE_MS = 1160','document.hidden','fxRenderLifecycleSuspended'],'single native WebGL renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);
absent(renderer,['lighthouse=1','auditMode','formatx:referencepause','.fx-reference-pause'],'renderer no audit/manual pause bypass');
has(life,['native-webgl-periodic-and-interaction-life-r528','periodic-surface-bursts-between-zero-idle','IntersectionObserver','document.hidden','formatx:coreinteraction'],'automatic life owner');
assert.ok(!life.includes('setInterval('),'life owner must remain interval-free');
assert.ok(!life.includes('requestAnimationFrame('),'life owner must not add idle RAF');
has(governor,['activeWindowMs=240','fxRenderLifecycleSuspended','idle-zero-frame','visibilitychange','document.hidden'],'automatic mobile lifecycle governor');
has(shape,['automatic-reduced-background-managed','prefers-reduced-motion:reduce','visibilitychange'],'automatic shape lifecycle');

has(quality,['@keyframes fx-r533-preloader-visual-bound','animation: fx-r533-preloader-visual-bound 1640ms linear both !important','animation-duration: 1360ms !important','grid-template-columns: repeat(2, 50px) !important'],'bounded intro/two-control quality layer');
absent(quality,['.fx-reference-pause'],'quality no manual pause');
has(optics,['grid-template-columns: repeat(2,54px) !important','pointer-events: none !important'],'visual-only two-control optics');
absent(optics,['.fx-reference-pause','repeat(3,54px)'],'optics no manual pause');

has(worker,["MOTION_RUNTIME_URL = 'formatx-motion-runtime-loader-r239.js?v=20260906-r542-body-heart-audio-owner'","HEART_STYLE_URL = 'formatx-heart-core-r252.css?v=20260906-r542-body-fixed-stage-sync'","X-FormatX-Product-Contract', 'r542-navigation-mag-body-heart-no-manual-pause'","X-FormatX-MAG-Startup', 'r542-navigation-owned-body-heart'","X-FormatX-Scheduler-Cache', 'r542-body-heart-audio-owner'",'html = html.replace(MOTION_RUNTIME_RE, MOTION_RUNTIME_URL);','canonicalProduction.fetch(request, env, ctx)'],'R542 exact production delivery/cache identity');
absent(worker,['deferReferenceModeBoot','REFERENCE_BOOT_DEFERRED_PREFIX','GLOBAL_LEGACY_PATHS'],'production prepaint ownership');

function validateLighthouse(config,label){
  const collect=config.ci.collect,assertions=config.ci.assert.assertions;
  assert.equal(collect.numberOfRuns,3,`${label}: exactly 3 Lighthouse runs required`);
  assert.ok(collect.url.every(url=>!url.includes('lighthouse=1')),`${label}: audit-only URL forbidden`);
  assert.ok(!String(collect.settings.chromeFlags||'').includes('force-prefers-reduced-motion'),`${label}: forced reduced motion forbidden`);
  assert.ok(!('skipAudits' in collect.settings),`${label}: skipped audits forbidden`);
  for(const category of ['performance','accessibility','best-practices','seo'])assert.equal(assertions[`categories:${category}`][1].minScore,1,`${label}: ${category} must be 1.0`);
  assert.equal(assertions['largest-contentful-paint'][1].maxNumericValue,1999);
  assert.equal(assertions['total-blocking-time'][1].maxNumericValue,150);
  assert.equal(assertions['cumulative-layout-shift'][1].maxNumericValue,.049);
}
validateLighthouse(desktop,'desktop');validateLighthouse(mobile,'mobile');

for(const source of [intro,motion,current,heart,wda,content,renderer,life,governor,shape])new Function(source);
console.log('PASS: R542 proves navigation-owned native MAG, body-level stage-synced semantic heart, authoritative opt-in professional SOUND, bounded intro, automatic lifecycle, no manual PAUSE, and strict 100x3 Lighthouse gates.');

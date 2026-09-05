'use strict';

/* FormatX R533 — current master living-core source contract.
   The MAG remains the product's living core. Manual user-facing PAUSE/RESUME is
   retired; reduced-motion/background lifecycle remains automatic. R533 keeps the
   visual-only preloader MAG-independent while restoring the roadmap LCP timing. */
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

has(home,[
  'formatx-event-horizon.js','formatx-motion-runtime-loader-r239.js','formatx-quality-r461.css',
  'class="fx-language-toggle"'
],'current static entry path');

has(intro,[
  'single-current-runtime-no-postdom-repair-stack','fxHeroLcpOwnerR411','static-html-no-reparent',
  "fxPreloaderContractR531='visual-only-mag-independent-bounded'",
  "fxPreloaderEffectsR531=REDUCED?'reduced-static':'compositor-glow-scan-pulse'",
  "fxPreloaderTimingR533=MOBILE?'mobile-440-1360':'desktop-560-1640'",
  'PRELOADER_MIN_MS=REDUCED?180:(MOBILE?440:560)',
  'PRELOADER_MAX_MS=REDUCED?520:(MOBILE?1360:1640)',
  'PRELOADER_TICK_MS=80','preloaderTimer=setTimeout(tick,PRELOADER_TICK_MS)',
  'duration:120','SYNCHRONIZING MAG','MAG SZINKRONIZÁLÁSA','formatx:preloadercomplete',
  'fxHeroControlContractR528','sound-ask-no-manual-mag-pause','fx-reference-controls-r204',
  'fx-reference-ask','runtime-error','promise-error'
],'R533 bounded first-paint/preloader owner');
absent(intro,['formatx:referencepause','function bindPause','function ensurePause','requestAnimationFrame(tick)'],'R533 first-paint owner');

has(motion,[
  'external-strict-csp','formatx-current-mag-loader-r422.js','ensureCurrentMag();',
  "fxCanonicalAskActivationR477='armed'",'formatx:immersiveactivate'
],'current motion/MAG loader route');

has(current,[
  "const VERSION='direct-r326-r468-soft-optics-live-energy-zero-idle'",'cleanupLegacyMagRuntime',
  "fxPrimaryMagOwnerR460='r326-only'",'formatx-crystal-organism-r326.js',
  'formatx-mobile-render-governor-r426.js','formatx-core-life-r455.js','formatx-mini-mag-assistant-r459.js'
],'single current MAG loader');

has(renderer,[
  "const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry',
  'const SURFACE_PULSE_MS = 1160','prefers-reduced-motion:reduce','document.hidden',
  'uSurfacePulse','single-luminous-webgl-material-owner'
],'native R326 renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(life,[
  "const VERSION = 'native-webgl-periodic-and-interaction-life-r528'",'prefers-reduced-motion: reduce',
  'document.hidden','IntersectionObserver','formatx:coreinteraction','pointerdown',
  "fxCoreIdlePolicyR455 = 'periodic-surface-bursts-between-zero-idle'"
],'R528 automatic living-core lifecycle');
assert.ok(!life.includes('setInterval('),'living-core life owner must remain interval-free');
assert.ok(!life.includes('requestAnimationFrame('),'living-core life owner must not add an idle RAF loop');

has(governor,[
  'automatic lifecycle','not a user-facing MAG pause feature','activeWindowMs=240',
  "fxMobileRenderGovernorRevisionR433='r528-automatic-idle-flag-no-manual-pause'",
  "fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle'",
  'idle-zero-frame','visibilitychange','document.hidden'
],'R528 mobile lifecycle governor');
assert.ok(!governor.includes("dispatchEvent(new CustomEvent('formatx:referencepause'"),'automatic governor must not dispatch the retired manual PAUSE event');

has(quality,[
  '#formatx-event-horizon.fx-intro-overlay[data-fx-preloader-r531="active"]',
  'position: fixed !important','pointer-events: none !important',
  '#formatx-event-horizon[data-fx-preloader-r531="active"] ~ main',
  '@media (prefers-reduced-motion: reduce)'
],'R531 fixed preloader/CLS lock');

has(worker,[
  "EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260905-r533-intro-lcp-v1'",
  "DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner'",
  "QUALITY_URL = 'formatx-quality-r461.css?v=20260905-r531-preloader-cls-lock'",
  "X-FormatX-Preloader', 'r533-roadmap-timing-navigation-owned'",
  "X-FormatX-Preloader-Cache', 'r533-intro-lcp-v1-fresh-assets'"
],'R533 production cache/delivery contract');

assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);
for(const source of [intro,motion,current,renderer,life,governor,mini])new Function(source);

console.log('PASS: R533 validates one native living MAG, no manual PAUSE owner, automatic reduced/background lifecycle, and the roadmap-bounded low-main-thread preloader contract.');
'use strict';

/* FormatX R543 — current master living-core/source-delivery contract.
   The MAG remains the product's living core. Manual user-facing PAUSE/RESUME is
   retired; reduced-motion/background lifecycle remains automatic. R531 adds a
   bounded visual-only preloader that never owns or gates the MAG renderer. */
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
const canonicalWorker=read('billing-worker/src/production-content-entry.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1360.js');
const fallback=read('docs/scifi-ui/scripts/formatx-mag-reference-film-r649.js');
const habitat=read('docs/scifi-ui/scripts/formatx-living-habitat-r1530.js');

has(home,[
  'formatx-event-horizon.js','formatx-motion-runtime-loader-r239.js','formatx-quality-r461.css',
  'class="fx-language-toggle"'
],'current static entry path');

has(intro,[
  'single-current-runtime-no-postdom-repair-stack','fxHeroLcpOwnerR411','static-html-no-reparent',
  "fxPreloaderContractR531='visual-only-mag-independent-bounded'",
  "fxPreloaderEffectsR531=REDUCED?'reduced-static':'compositor-glow-scan-pulse'",
  'PRELOADER_MIN_MS=REDUCED?180:(MOBILE?1180:1350)',
  'PRELOADER_MAX_MS=REDUCED?520:(MOBILE?1450:1650)',
  'SYNCHRONIZING MAG','MAG SZINKRONIZÁLÁSA','formatx:preloadercomplete',
  'fxHeroControlContractR528','sound-ask-no-manual-mag-pause','fx-reference-controls-r204',
  'fx-reference-ask','runtime-error','promise-error'
],'R531 extended first-paint/preloader owner');
absent(intro,['formatx:referencepause','function bindPause','function ensurePause'],'R531 first-paint owner');

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
  "const REVISION = 'living-luminous-electric-crystal-r454'","const CANONICAL_REVISION = 'fully-living-organism-r1723'",'buildOrganismGeometry',
  'KHR_parallel_shader_compile','fxCoreShaderCompileR600','finishProgram',
  'const SURFACE_PULSE_MS = 1160','const SURFACE_PULSE_WINDOW_MS = mobile ? SURFACE_PULSE_MS : 1880','prefers-reduced-motion:reduce','document.hidden',
  'uSurfacePulse','dnaHelix','dnaBridge','fxCoreGenomeR614','native-double-helix-energy-lattice-r614','fxCoreGenesisMagR614','cortical-cellular-organism-with-native-tendrils-r1723','cortical-bioceramic-living-tissue-r1723','single-luminous-webgl-material-owner','fxCoreCanonicalIdentityR1723','fxNativeMagIdentityR1723','fxNativeMagMaterialR1723','fxNativeMagTendrilsR1723','fxNativeMagPhysiologyR1723','fxNativeMagPhysiologyApiR1723','physiology:(kind,source)=>signalPhysiology','formatx:organismphysiology','fxNativeMagOrganismR1724','fxNativeMagLookR1724','fxNativeMagTopologyR1724','fxNativeMagPaletteR1724','fxNativeMagFacetR1724'
],'native R326 renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);
assert.ok(!renderer.includes("shape:'crystal'"),'R1723 renderer must not publish crystal as active shape');
assert.ok(!renderer.includes("shape:'sphere'"),'R1723 renderer must not publish sphere as active shape');
assert.ok(!home.includes('formatx-reference-creature-r1724'),'static R1724 creature image/script takeover must not be loaded');

has(birth,[
  "fxMagBirthOrganismR1724='faceted-pearl-cyan-living-crystal-organism'",
  "fxMagBirthCoreR1724='biocrystal-cartilage-cyan-energy-warm-rim'",
  "fxMagBirthSharpnessR1723='native-pixel-css-zero-resample-mobile-2.15x-adaptive'",
  'this.mechanicalGroup.visible=false'
],'R1724 Three.js living crystal birth');
has(fallback,[
  "revision:'r1724-formatx-living-crystal-organism-birth'",
  'FormatX Living Crystal Organism fallback silhouette'
],'R1724 2D living crystal fallback');
has(habitat,[
  "fxLivingHabitatCrystalWorldR1724='cyan-biocrystal-arches-spires-warm-studio-rim'",
  'formatx:organismphysiology'
],'R1724 synchronized biocrystal world');
has(home,[
  'procedural-interactive-living-crystal-organism-r1724',
  'r1724-living-crystal-organism'
],'R1724 living crystal static entry contract');

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
  "fxMobileRenderGovernorOrganismR1723='fixed-organism-morph-zero-settle'",
  "target==='crystal'||target==='organism'?0:NaN",
  "fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle'",
  'idle-zero-frame','visibilitychange','document.hidden'
],'R1723 mobile lifecycle governor');
assert.ok(!governor.includes("dispatchEvent(new CustomEvent('formatx:referencepause'"),'automatic governor must not dispatch the retired manual PAUSE event');

has(quality,[
  '#formatx-event-horizon.fx-intro-overlay[data-fx-preloader-r531="active"]',
  'position: fixed !important','pointer-events: none !important',
  '#formatx-event-horizon[data-fx-preloader-r531="active"] ~ main',
  '@media (prefers-reduced-motion: reduce)'
],'R531 fixed preloader/CLS lock');

has(worker,[
  "EVENT_HORIZON_URL = 'formatx-event-horizon.js?v=20260905-r531-preloader-effects-v2'",
  "DEFERRED_REDUCED_URL = 'formatx-deferred-reduced-style-r232.js?v=20260905-r531-preloader-owner'",
  "X-FormatX-Preloader', 'r531-extended-effects-navigation-owned'",
  "X-FormatX-Preloader-Cache', 'r531-effects-v2-fresh-assets'"
],'R531 preloader cache/delivery contract');
absent(worker,['const QUALITY_RE','const QUALITY_URL','html = html.replace(QUALITY_RE, QUALITY_URL)'],'current quality cache pass-through');
absent(canonicalWorker,['cacheBustCriticalQuality','formatx-quality-r461.css?v=20260902-r500-canonical-hero-state'],'canonical quality cache pass-through');
assert.match(home,/data-fx-quality-r461=["']true["'][^>]*href=["'][^"']*formatx-quality-r461\.css\?v=[^"']+["']/i,'canonical current quality link missing');

has(mini,[
  'elementsFromPoint','requestAnimationFrame','collision-information-safe',
  "addEventListener('scroll',()=>scheduleContextSafety('scroll'),{passive:true})",
  'fxMiniMagContextR560'
],'R560 Mini MAG information-collision safety');
assert.ok(!mini.includes('setInterval('),'Mini MAG collision safety must remain interval-free');
assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);
for(const source of [intro,motion,current,renderer,life,governor,mini,birth,fallback,habitat])new Function(source);

console.log('PASS: R1724 validates one procedural interactive FormatX living crystal organism, no static creature takeover, no alternate shape state, zero-idle lifecycle, and source-owned adaptive quality.');

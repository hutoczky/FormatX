'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repository=path.resolve(__dirname,'../..');
const read=relative=>fs.readFileSync(path.join(repository,relative),'utf8');
const has=(source,tokens,label)=>{for(const token of tokens)assert.ok(source.includes(token),`missing ${label}: ${token}`);};

const home=read('docs/scifi-ui/index.html');
const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const language=read('docs/scifi-ui/scripts/single-language-toggle.js');
const current=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const solidGlass=read('docs/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js');
const life=read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const optics=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const lifeStyle=read('docs/scifi-ui/styles/formatx-core-life-r455.css');
const header=read('docs/scifi-ui/styles/formatx-mobile-header-final-r418.css');
const nativeTouch=read('docs/scifi-ui/scripts/formatx-native-mag-touch-r434.js');
const mini=read('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');

has(home,[
  'formatx-event-horizon.js?v=20260831-r485-single-pause-owner',
  'formatx-motion-runtime-loader-r239.js?v=20260831-r484-periodic-native-energy',
  'formatx-quality-r461.css?v=20260830-r462-mobile-a11y',
  'data-fx-single-language-toggle="ready-v3"',
  'class="fx-language-toggle"'
],'R474 static entry path');
for(const token of [
  'data-fx-premium-finish','data-fx-live-heartbeat-r155','data-fx-signature-system-r185',
  'data-fx-seamless-enforcer-r159','data-fx-living-energy-r168="true" src=',
  'data-fx-desktop-apex-r181-loader','data-fx-living-energy-r168="true" href=',
  'data-fx-desktop-apex-r181="true" href='
])assert.ok(!home.includes(token),`retired active HTML token returned: ${token}`);

has(intro,[
  'single-current-runtime-no-postdom-repair-stack','fxHeroLcpOwnerR411','static-html-no-reparent',
  'r461-lightweight-first-party','fxManualMagPauseContractR528','retired-living-core',
  'retireManualPause','fx-reference-controls-r204','runtime-error','promise-error'
],'R528 living-core first-paint owner');
for(const token of [
  'formatx-award-runtime-r206.js','formatx-mobile-regression-r310.js','activateCriticalReal3dStyle',
  'queuePostDomEnhancements','bindPause(','formatx:referencepause'
])assert.ok(!intro.includes(token),`retired first-load/manual-pause contract returned: ${token}`);

has(motion,[
  'single-language-toggle.js?v=20260830-r462-semantic-owner',
  'formatx-current-mag-loader-r422.js?v=20260831-r484-periodic-native-energy',
  'formatx-mobile-solid-glass-r456.js?v=20260831-r484-native-surface-filaments',
  'formatx-crystal-organism-r326.js?v=20260831-r484-periodic-native-energy',
  'formatx-core-shapeshifter-r337.css?v=20260831-r468-soft-mobile-bloom',
  'formatx-core-life-r455.css?v=20260831-r474-softer-mobile-glow',
  'formatx-core-life-r455.js?v=20260831-r484-periodic-native-energy',
  "fxSingleLanguageToggleVersion==='7'",
  "fxLegacyMagRuntimeCleanupR460='static-html-clean-r461'",
  'armed-direct-r326-r468-soft-optics-live-energy-zero-idle',
  "fxFinalVisualRevisionR474='softer-mobile-glow-feathered-facets'",
  "fxFullSuiteR474='r474-mobile-mag'",
  "fxCanonicalAskActivationR477='armed'"
],'R474 loader route carrying the softer final display');
for(const token of ['isRetiredMagRuntime','formatx-premium-finish','formatx-live-heartbeat-r155','formatx-signature-system-r185','formatx-seamless-enforcer-r159'])assert.ok(!motion.includes(token),`dead runtime filter remains: ${token}`);

has(language,[
  "const VERSION='7'",'HU – váltás angol nyelvre','EN – switch to Hungarian',
  'event-driven-no-document-mutation-observer',"fxSingleLanguageToggle='ready-v3'"
],'R462 stable language owner');
assert.ok(!language.includes('new MutationObserver'),'language owner must remain observer-free');

has(current,[
  'direct-r326-r468-soft-optics-live-energy-zero-idle','cleanupLegacyMagRuntime','r326-only',
  'formatx-mobile-solid-glass-r456.js?v=20260831-r484-native-surface-filaments',
  'formatx-native-mag-touch-r434.js?v=20260830-r460-controller-tap-drag-safe',
  'formatx-mobile-render-governor-r426.js?v=20260831-r484-bounded-surface-window',
  'formatx-core-life-r455.css?v=20260831-r474-softer-mobile-glow',
  'formatx-core-life-r455.js?v=20260831-r484-periodic-native-energy',
  'soft-perimeter-low-bloom-low-cost-shader','direct-pause-flag-no-idle-redraw',
  'periodic-surface-bursts-between-zero-idle','formatx-mini-mag-assistant-r459.js',
  "fxCurrentMagOpticsR474=mobile?'softer-glow-feathered-facets-zero-idle':'desktop-optics-unchanged'"
],'R474 primary MAG loader carrying the softer display');

has(renderer,[
  "const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','uSurfacePulse',
  'single-luminous-webgl-material-owner','heartbeat-and-interaction-bursts-no-idle-loop-r326',
  'const SURFACE_PULSE_MS = 1160','periodic-native-surface-energy',
  "startSurfacePulse('autonomous')",'armed-single-native-timer',
  'document.hidden||!visible||paused','surfacePulseActive',
  'listen(reduced,\'change\',onReducedMotionChange'
],'R326 native renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(solidGlass,[
  "const VERSION='r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics'",
  "const smoothWeight=mobile?'.998':'.930'",
  "const specPowerA=mobile?'22.0':'36.0'",
  "const specGainB=mobile?'.24':'.64'",
  "next=next.replace(fresnelMobile,'float fresnel=pow(1.0-facing,1.92);')",
  "next=next.replace(edgePattern,'float edge=0.0;')",
  'surfacePulsePattern','soft-perimeter-low-bloom-low-cost-shader',
  'surfaceFilament=trunk+.50*branch','sweepCoordinate','surfaceSweep'
],'R465 soft award phone glass');
has(optics,[
  'FormatX r467','brightness(1.065)','contrast(.89)','saturate(1.10)','blur(.82px)'
],'R467 balanced base mobile display tone');
has(lifeStyle,[
  'FormatX r474','softer mobile crystal glow','opacity: .970','brightness(.985)','contrast(.855)',
  'saturate(1.010)','blur(.30px)','image-rendering: auto','animation: none','will-change: auto',
  '.skip-link:not(:focus):not(:focus-visible)','clip-path: inset(50%)','-webkit-tap-highlight-color: transparent',
  'production-r474-softer-mobile-glow-feathered-facets'
],'R474 final softer mobile MAG and accessibility display');
assert.ok(!lifeStyle.includes('fx-core-r468-compositor-breathe'),'R474 mobile display must not keep an idle compositor breathe animation');

has(life,[
  "const VERSION = 'native-webgl-periodic-and-interaction-life-r484'",'surface-sweep-',
  'armed-periodic-and-interaction-surface-energy','periodic-surface-bursts-between-zero-idle',
  'formatx:coreinteraction','pointerdown'
],'R468 explicit native energy path');
assert.ok(!life.includes('setInterval('),'R468 life owner must remain interval-free');
assert.ok(!life.includes('requestAnimationFrame('),'R468 life owner must not add an idle WebGL RAF loop');
has(header,[
  'production-r466-mobile-mag-text-lock-no-star-blank-state',
  '-webkit-text-fill-color:currentColor','background-image:none','content:none'
],'R466 stable mobile MAG header text lock');

has(governor,[
  'const activeWindowMs=240','const shapeProbeMs=150','const shapeSettleDeadlineMs=2400',
  'state.core?.requestRender?.(2)','userShapeSource(source)','guardPassiveState(source)',
  "'formatx:menustatechange','formatx:languagechange','pageshow','resize'",
  'passive-${eventName}-r465',
  "fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle'",
  "fxMobileRenderGovernorRevisionR433='r465-direct-pause-flag-no-idle-redraw'",
  "root.dataset.fxReferenceMotionPaused=value",
  "addEventListener('formatx:coresurfacesweep'",'surfaceDeadline-performance.now()',
  'full-1160ms-sweep-then-zero-idle'
],'R465 direct-flag mobile TBT governor');
assert.ok(!governor.includes("dispatchEvent(new CustomEvent('formatx:referencepause'"),'internal governor idle must not trigger the legacy synchronous redraw handler');
assert.ok(!governor.includes("active('scroll-r463'"),'mobile scroll must not wake WebGL');
assert.ok(!governor.includes("active('resize-r463'"),'mobile resize must not wake WebGL');

has(nativeTouch,['native-r326-touch-r460-controller-tap','formatx:heromagcontrollerrequest','fxHeroMagControllerR460'],'R460 native touch controller');
has(mini,['formatx:heromagcontrollerrequest','window.FormatXMiniMagR459={','formatx:minimagready','manualPause:false'],'R528 persistent controller');
assert.ok(!mini.includes('togglePause'),'R528 Mini MAG must not expose manual pause');
assert.ok(!mini.includes("pause:['"),'R528 Mini MAG copy must not expose manual pause');
assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);

has(quality,[
  'content-visibility: visible','.topbar > .header-actions','> .fx-rail','fx-reference-liveos',
  '.scroll-cue > span','contain: layout paint','.fx-qr-placeholder','#main-nav:not(.open)',
  'fx-reference-controls-r204.fx-reference-controls-r264'
],'R462 measurable quality CSS');

for(const source of [intro,motion,language,current,renderer,solidGlass,life,governor,nativeTouch,mini])new Function(source);
console.log('PASS: R528 keeps one native living MAG, visible surface energy, zero-idle lifecycle, reduced-motion accessibility, and no manual MAG PAUSE/RESUME product control.');
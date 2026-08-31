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
  'formatx-event-horizon.js?v=20260830-r461-clean-first-load',
  'formatx-motion-runtime-loader-r239.js?v=20260830-r462-compact-active-path',
  'formatx-quality-r461.css?v=20260830-r462-mobile-a11y',
  'data-fx-single-language-toggle="ready-v3"',
  'class="fx-language-toggle"'
],'R468 static entry path');
for(const token of [
  'data-fx-premium-finish','data-fx-live-heartbeat-r155','data-fx-signature-system-r185',
  'data-fx-seamless-enforcer-r159','data-fx-living-energy-r168="true" src=',
  'data-fx-desktop-apex-r181-loader','data-fx-living-energy-r168="true" href=',
  'data-fx-desktop-apex-r181="true" href='
])assert.ok(!home.includes(token),`retired active HTML token returned: ${token}`);

has(intro,[
  'single-current-runtime-no-postdom-repair-stack','fxHeroLcpOwnerR411','static-html-no-reparent',
  'r461-lightweight-first-party','formatx:referencepause','fx-reference-controls-r204',
  'runtime-error','promise-error'
],'R461 first-paint owner');
for(const token of ['formatx-award-runtime-r206.js','formatx-mobile-regression-r310.js','activateCriticalReal3dStyle','queuePostDomEnhancements'])assert.ok(!intro.includes(token),`retired post-DOM stack returned: ${token}`);

has(motion,[
  'single-language-toggle.js?v=20260830-r462-semantic-owner',
  'formatx-current-mag-loader-r422.js?v=20260831-r471-softer-mobile-mag',
  'formatx-mobile-solid-glass-r456.js?v=20260831-r465-soft-perimeter-low-bloom',
  'formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface',
  'formatx-core-shapeshifter-r337.css?v=20260831-r468-soft-mobile-bloom',
  'formatx-core-life-r455.css?v=20260831-r471-softer-mobile-bloom-feather',
  'formatx-core-life-r455.js?v=20260831-r468-explicit-surface-energy',
  "fxSingleLanguageToggleVersion==='7'",
  "fxLegacyMagRuntimeCleanupR460='static-html-clean-r461'",
  'armed-direct-r326-r468-soft-optics-live-energy-zero-idle',
  "fxFinalVisualRevisionR471='softer-mobile-mag'"
],'R471 compact current loader');
for(const token of ['isRetiredMagRuntime','formatx-premium-finish','formatx-live-heartbeat-r155','formatx-signature-system-r185','formatx-seamless-enforcer-r159'])assert.ok(!motion.includes(token),`dead runtime filter remains: ${token}`);

has(language,[
  "const VERSION='7'",'HU – váltás angol nyelvre','EN – switch to Hungarian',
  'event-driven-no-document-mutation-observer',"fxSingleLanguageToggle='ready-v3'"
],'R462 stable language owner');
assert.ok(!language.includes('new MutationObserver'),'language owner must remain observer-free');

has(current,[
  'direct-r326-r468-soft-optics-live-energy-zero-idle','cleanupLegacyMagRuntime','r326-only',
  'formatx-mobile-solid-glass-r456.js?v=20260831-r465-soft-perimeter-low-bloom',
  'formatx-native-mag-touch-r434.js?v=20260830-r460-controller-tap-drag-safe',
  'formatx-mobile-render-governor-r426.js?v=20260831-r465-direct-pause-flag-no-redraw',
  'formatx-core-life-r455.css?v=20260831-r471-softer-mobile-bloom-feather',
  'formatx-core-life-r455.js?v=20260831-r468-explicit-surface-energy',
  'soft-perimeter-low-bloom-low-cost-shader','direct-pause-flag-no-idle-redraw',
  'explicit-mag-interaction-only-zero-idle','formatx-mini-mag-assistant-r459.js',
  "fxCurrentMagOpticsR471=mobile?'reduced-bloom-feathered-silhouette':'desktop-optics-unchanged'"
],'R471 primary MAG loader');

has(renderer,[
  "const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','uSurfacePulse',
  'single-luminous-webgl-material-owner','heartbeat-and-interaction-bursts-no-idle-loop-r326'
],'R326 native renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(solidGlass,[
  "const VERSION='r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics'",
  "const smoothWeight=mobile?'.998':'.930'",
  "const specPowerA=mobile?'22.0':'36.0'",
  "const specGainB=mobile?'.24':'.64'",
  "next=next.replace(fresnelMobile,'float fresnel=pow(1.0-facing,1.92);')",
  "next=next.replace(edgePattern,'float edge=0.0;')",
  'surfacePulsePattern',
  'soft-perimeter-low-bloom-low-cost-shader'
],'R465 soft award phone glass');
has(optics,[
  'FormatX r467','brightness(1.065)','contrast(.89)','saturate(1.10)','blur(.82px)'
],'R467 balanced base mobile display tone');
has(lifeStyle,[
  'FormatX r471','fx-core-r468-compositor-breathe','opacity: .93','brightness(.96)','contrast(.80)',
  'saturate(.99)','blur(1.26px)','prefers-reduced-motion: reduce'
],'R471 final mobile softer-life display');
has(life,[
  "const VERSION = 'native-webgl-interaction-life-r466'",'surface-sweep-',
  'armed-full-surface-explicit-interaction','explicit-mag-interaction-only-zero-idle',
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
  "fxCoreMobileIdlePolicyR426='explicit-mag-interaction-only-zero-idle'",
  "fxMobileRenderGovernorRevisionR433='r465-direct-pause-flag-no-idle-redraw'",
  "root.dataset.fxReferenceMotionPaused=value"
],'R465 direct-flag mobile TBT governor');
assert.ok(!governor.includes("dispatchEvent(new CustomEvent('formatx:referencepause'"),'internal governor idle must not trigger the legacy synchronous redraw handler');
assert.ok(!governor.includes("active('scroll-r463'"),'mobile scroll must not wake WebGL');
assert.ok(!governor.includes("active('resize-r463'"),'mobile resize must not wake WebGL');

has(nativeTouch,['native-r326-touch-r460-controller-tap','formatx:heromagcontrollerrequest','fxHeroMagControllerR460'],'R460 native touch controller');
has(mini,['formatx:heromagcontrollerrequest','window.FormatXMiniMagR459={','formatx:minimagready'],'R459 persistent controller');
assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);

has(quality,[
  'content-visibility: visible','.topbar > .header-actions','> .fx-rail','fx-reference-liveos',
  '.scroll-cue > span','contain: layout paint','.fx-qr-placeholder','#main-nav:not(.open)',
  'fx-reference-controls-r204.fx-reference-controls-r264'
],'R462 measurable quality CSS');

for(const source of [intro,motion,language,current,renderer,solidGlass,life,governor,nativeTouch,mini])new Function(source);
console.log('PASS: R471 display refinement preserves the clean R468 active path, one R326 hero renderer, softer lower-bloom mobile MAG, explicit full-surface energy, zero-idle WebGL, stable semantic controls/language and no retired first-load stack.');

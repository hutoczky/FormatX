'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repository=path.resolve(__dirname,'../..');
const read=relative=>fs.readFileSync(path.join(repository,relative),'utf8');
const has=(source,tokens,label)=>{for(const token of tokens)assert.ok(source.includes(token),`missing ${label}: ${token}`);};
const lacks=(source,tokens,label)=>{for(const token of tokens)assert.ok(!source.includes(token),`forbidden ${label}: ${token}`);};

const home=read('docs/scifi-ui/index.html');
const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const language=read('docs/scifi-ui/scripts/single-language-toggle.js');
const current=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const currentStyle=read('docs/scifi-ui/styles/formatx-current-mag-r422.css');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const solidGlass=read('docs/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js');
const life=read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const header=read('docs/scifi-ui/styles/formatx-mobile-header-final-r418.css');
const nativeTouch=read('docs/scifi-ui/scripts/formatx-native-mag-touch-r434.js');
const mini=read('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');

has(home,[
  'formatx-event-horizon.js?v=20260831-r485-single-pause-owner',
  'formatx-motion-runtime-loader-r239.js?v=20260831-r484-periodic-native-energy',
  'formatx-quality-r461.css?v=20260830-r462-mobile-a11y',
  'data-fx-single-language-toggle="ready-v3"','class="fx-language-toggle"'
],'public entry path');
lacks(home,[
  'data-fx-premium-finish','data-fx-live-heartbeat-r155','data-fx-signature-system-r185',
  'data-fx-seamless-enforcer-r159','data-fx-living-energy-r168="true" src=',
  'data-fx-desktop-apex-r181-loader','data-fx-living-energy-r168="true" href=',
  'data-fx-desktop-apex-r181="true" href='
],'retired active HTML runtime');

has(intro,[
  'single-current-runtime-no-postdom-repair-stack','fxHeroLcpOwnerR411','static-html-no-reparent',
  'r461-lightweight-first-party','formatx:referencepause','fx-reference-controls-r204',
  'runtime-error','promise-error'
],'stable first-paint owner');
lacks(intro,['formatx-award-runtime-r206.js','formatx-mobile-regression-r310.js','activateCriticalReal3dStyle','queuePostDomEnhancements'],'retired post-DOM repair stack');

has(motion,[
  'single-language-toggle.js?v=20260830-r462-semantic-owner',
  'formatx-current-mag-loader-r422.js?v=20260831-r484-periodic-native-energy',
  "fxSingleLanguageToggleVersion==='7'",
  "fxLegacyMagRuntimeCleanupR460='static-html-clean-r461'",
  "fxCanonicalAskActivationR477='armed'",
  'ensureOrganismInterface()','fxOrganismBootstrapR498'
],'compact runtime bootstrap');
lacks(motion,['isRetiredMagRuntime','formatx-premium-finish','formatx-live-heartbeat-r155','formatx-signature-system-r185','formatx-seamless-enforcer-r159'],'dead runtime filtering');

has(language,[
  "const VERSION='7'",'HU – váltás angol nyelvre','EN – switch to Hungarian',
  'event-driven-no-document-mutation-observer',"fxSingleLanguageToggle='ready-v3'"
],'single language owner');
assert.ok(!language.includes('new MutationObserver'),'language owner must remain observer-free');

has(current,[
  "const VERSION='direct-r326-r491-progressive-interaction-first'",
  'cleanupLegacyMagRuntime','r326-only','waitForEnhancementWindow','static-premium-ready',
  'progressive-first-frame','settled-auto','interaction-only-bursts-between-zero-idle',
  'formatx-mobile-render-governor-r426.js?v=20260901-r491-interaction-only-zero-idle',
  'formatx-crystal-organism-r326.js?v=20260831-r484-periodic-native-energy',
  'formatx-mobile-solid-glass-r456.js?v=20260831-r484-native-surface-filaments',
  'formatx-mini-mag-assistant-r459.js'
],'R491 progressive MAG bootstrap');
has(quality,[
  '--fx-mag-first-frame:','data:image/svg+xml','deploy-r493-inline-first-frame'
],'R493 inline first-frame source');
has(currentStyle,[
  'FormatX r493','var(--fx-mag-first-frame)','progressive-enhancement layer',
  'min-height: 0 !important','production-r493-progressive-first-frame-direct-r326-layout-a11y-touch'
],'R493 inline first-frame geometry and progressive visual fallback');
assert.ok(!currentStyle.includes('formatx-mag-first-frame-r491.svg'),'current MAG CSS must not reintroduce the separate R491 first-frame request');

has(renderer,[
  "const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','uSurfacePulse',
  'single-luminous-webgl-material-owner','heartbeat-and-interaction-bursts-no-idle-loop-r326',
  'document.hidden||!visible||paused','surfacePulseActive'
],'single native WebGL renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(solidGlass,[
  "const VERSION='r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics'",
  "const smoothWeight=mobile?'.998':'.930'",'surfacePulsePattern','soft-perimeter-low-bloom-low-cost-shader'
],'native solid-glass shader');

has(life,[
  "const VERSION = 'native-webgl-periodic-and-interaction-life-r484'",'formatx:coreinteraction','pointerdown'
],'native interaction energy owner');
assert.ok(!life.includes('setInterval('),'life owner must remain interval-free');
assert.ok(!life.includes('requestAnimationFrame('),'life owner must not add an idle WebGL RAF loop');

has(governor,[
  'const activeWindowMs=240','const shapeProbeMs=150','const shapeSettleDeadlineMs=2400',
  'userShapeSource(source)','guardPassiveState(source)',
  "fxCoreMobileIdlePolicyR426='interaction-only-bursts-between-zero-idle'",
  "fxMobileRenderGovernorRevisionR433='r490-autonomous-sweep-budget-guard'",
  "fxMobileSurfaceBudgetR484='autonomous-sweeps-suppressed-interaction-sweeps-bounded'",
  "fxMobileAutonomousSurfaceR490='suppressed-zero-idle'",
  "root.dataset.fxReferenceMotionPaused=value"
],'interaction-only mobile render budget');
lacks(governor,["dispatchEvent(new CustomEvent('formatx:referencepause'","active('scroll-r463'","active('resize-r463'"],'synchronous/passive WebGL wakeup');

has(header,[
  'FormatX r490/R497/R498','production-r498-mobile-design-system-floor-and-brand-overflow-owner',
  'max-width:118px','overflow:hidden','--fx-cyan:#7cecff','--fx-violet:#8f72ff',
  '-webkit-text-fill-color:currentColor','background-image:none','content:none'
],'R498 cross-device header, design-system floor and compact overflow lock');

has(nativeTouch,['native-r326-touch-r460-controller-tap','formatx:heromagcontrollerrequest','fxHeroMagControllerR460'],'native MAG touch controller');
has(mini,['formatx:heromagcontrollerrequest','window.FormatXMiniMagR459={','formatx:minimagready'],'persistent mini-MAG controller');
assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);

has(quality,[
  'content-visibility: visible','.topbar > .header-actions','> .fx-rail','fx-reference-liveos',
  '.scroll-cue > span','contain: layout paint','.fx-qr-placeholder','#main-nav:not(.open)',
  'fx-reference-controls-r204.fx-reference-controls-r264'
],'measurable quality CSS');

for(const source of [intro,motion,language,current,renderer,solidGlass,life,governor,nativeTouch,mini])new Function(source);
console.log('PASS: current architecture = one native MAG, R493 inline premium first frame, progressive WebGL enhancement, R498 overflow-safe header/design-system floor, deterministic ASK Organism bootstrap and interaction-only zero-idle mobile rendering.');
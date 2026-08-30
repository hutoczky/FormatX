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
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const optics=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const nativeTouch=read('docs/scifi-ui/scripts/formatx-native-mag-touch-r434.js');
const mini=read('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');

has(home,[
  'formatx-event-horizon.js?v=20260830-r461-clean-first-load',
  'formatx-motion-runtime-loader-r239.js?v=20260830-r462-compact-active-path',
  'formatx-quality-r461.css?v=20260830-r462-mobile-a11y',
  'data-fx-single-language-toggle="ready-v3"',
  'class="fx-language-toggle"'
],'R462 static entry path');
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
  'formatx-current-mag-loader-r422.js?v=20260830-r463-award-mobile-optics-strict-tbt',
  'formatx-mobile-solid-glass-r456.js?v=20260830-r463-restrained-award-optics',
  'formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface',
  'formatx-core-shapeshifter-r337.css?v=20260830-r460-soft-mobile-rim',
  "fxSingleLanguageToggleVersion==='7'",
  "fxLegacyMagRuntimeCleanupR460='static-html-clean-r461'",
  'armed-direct-r326-r463-award-mobile-optics-strict-tbt'
],'R463 compact current loader');
for(const token of ['isRetiredMagRuntime','formatx-premium-finish','formatx-live-heartbeat-r155','formatx-signature-system-r185','formatx-seamless-enforcer-r159'])assert.ok(!motion.includes(token),`dead runtime filter remains: ${token}`);

has(language,[
  "const VERSION='7'",'HU – váltás angol nyelvre','EN – switch to Hungarian',
  'event-driven-no-document-mutation-observer',"fxSingleLanguageToggle='ready-v3'"
],'R462 stable language owner');
assert.ok(!language.includes('new MutationObserver'),'language owner must remain observer-free');

has(current,[
  'direct-r326-r463-award-mobile-optics-strict-tbt','cleanupLegacyMagRuntime','r326-only',
  'formatx-mobile-solid-glass-r456.js?v=20260830-r463-restrained-award-optics',
  'formatx-native-mag-touch-r434.js?v=20260830-r460-controller-tap-drag-safe',
  'formatx-mobile-render-governor-r426.js?v=20260830-r463-short-burst-strict-tbt',
  'narrow-fresnel-soft-edge-restrained-bloom',
  'formatx-mini-mag-assistant-r459.js'
],'R463 primary MAG loader');

has(renderer,[
  "const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','uSurfacePulse',
  'single-luminous-webgl-material-owner','heartbeat-and-interaction-bursts-no-idle-loop-r326'
],'R326 native renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(solidGlass,[
  "const VERSION='r463-uniform-solid-glass-restrained-award-mobile-optics'",
  "const smoothWeight=mobile?'.997':'.930'",
  "const specPowerA=mobile?'28.0':'36.0'",
  "const specGainB=mobile?'.34':'.64'",
  "next=next.replace(fresnelMobile,'float fresnel=pow(1.0-facing,2.12);')",
  "next=next.replace(edgePattern,'float edge=0.0;')",
  "fxCoreMobileOpticalBalanceR463=mobile?'narrow-fresnel-soft-edge-restrained-bloom':'desktop-material-unchanged'"
],'R463 restrained award phone glass');
has(optics,['production-r460-single-native-webgl-optics-owner-soft-mobile-rim','contrast(.86)','blur(.90px)'],'R460 soft mobile rim');

has(governor,[
  'const activeWindowMs=360','const shapeProbeMs=120','const shapeSettleDeadlineMs=3600',
  'state.core?.requestRender?.(6)','heroVisible()',
  "fxMobileRenderGovernorRevisionR433='r463-short-burst-strict-tbt'",
  "active('scroll-r463',1,90)"
],'R463 strict mobile TBT governor');

has(nativeTouch,['native-r326-touch-r460-controller-tap','formatx:heromagcontrollerrequest','fxHeroMagControllerR460'],'R460 native touch controller');
has(mini,['formatx:heromagcontrollerrequest','window.FormatXMiniMagR459={','formatx:minimagready'],'R459 persistent controller');
assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);

has(quality,[
  'content-visibility: visible','.topbar > .header-actions','> .fx-rail','fx-reference-liveos',
  '.scroll-cue > span','contain: layout paint','.fx-qr-placeholder','#main-nav:not(.open)',
  'fx-reference-controls-r204.fx-reference-controls-r264'
],'R462 measurable quality CSS');

for(const source of [intro,motion,language,current,renderer,solidGlass,governor,nativeTouch,mini])new Function(source);
console.log('PASS: R463 clean active path uses one R326 hero renderer, restrained award mobile optics, strict event-burst TBT budget, stable semantic controls/language and no retired first-load stack.');

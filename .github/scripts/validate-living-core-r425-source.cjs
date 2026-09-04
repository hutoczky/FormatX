'use strict';

/* R425 compatibility source gate, modernized by the R528 product contract.
   Historical PAUSE/RESUME ownership is intentionally not preserved. This gate
   now proves the current living-core runtime, lifecycle suspension and reduced
   motion contract without restoring obsolete version strings or controls. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repository=path.resolve(__dirname,'../..');
const read=relative=>fs.readFileSync(path.join(repository,relative),'utf8');
const has=(source,tokens,label)=>{for(const token of tokens)assert.ok(source.includes(token),`missing ${label}: ${token}`);};
const absent=(source,tokens,label)=>{for(const token of tokens)assert.ok(!source.includes(token),`${label}: obsolete token remains: ${token}`);};

const home=read('docs/scifi-ui/index.html');
const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const current=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const touch=read('docs/scifi-ui/scripts/formatx-core-touch-pulse-r99.js');
const shapeSync=read('docs/scifi-ui/scripts/formatx-mag-shape-sync-r476.js');
const mini=read('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js');
const reducedCss=read('docs/scifi-ui/styles/formatx-reduced-mag-identity-r528.css');

has(home,['formatx-event-horizon.js','formatx-motion-runtime-loader-r239.js','class="fx-language-toggle"'],'current static entry path');
has(intro,[
  'single-current-runtime-no-postdom-repair-stack',
  'fxHeroLcpOwnerR411',
  'static-html-no-reparent',
  'fx-reference-controls-r204',
  'fx-reference-ask',
  "fxMagProductContractR528='living-core-continuous-normal-motion'"
],'R528 first-paint owner');
absent(intro,['function bindPause','formatx:referencepause','fxReferenceMotionPaused'],'R528 first-paint owner');

has(motion,[
  'formatx-current-mag-loader-r422.js?v=20260905-r528-living-core-lifecycle',
  'formatx-crystal-organism-r326.js?v=20260905-r528-lifecycle-suspension',
  'formatx-mag-shape-sync-r476.js?v=20260905-r528-living-core',
  "fxMagProductContractR528='living-core-continuous-normal-motion'",
  'reduced-motion-static-core-r528',
  'armed-direct-r326-r528-living-core-lifecycle-zero-idle'
],'R528 motion loader');
absent(motion,['.fx-reference-pause','formatx:referencepause'],'R528 motion loader');

has(current,[
  "const VERSION='direct-r326-r528-living-core-lifecycle-zero-idle'",
  'formatx-crystal-organism-r326.js?v=20260905-r528-lifecycle-suspension',
  'formatx-mobile-render-governor-r426.js?v=20260905-r528-lifecycle-suspension',
  'formatx-core-touch-pulse-r99.js?v=20260905-r528-living-core',
  "fxCurrentMagContractR528='living-core-no-manual-pause-lifecycle-safe'",
  'r528-lifecycle-suspend-no-idle-redraw',
  'periodic-surface-bursts-between-zero-idle'
],'R528 current MAG loader');

has(renderer,[
  "const VERSION = 'crystal-organism-r326'",
  'buildOrganismGeometry',
  'uSurfacePulse',
  'single-luminous-webgl-material-owner',
  'const SURFACE_PULSE_MS = 1160',
  'periodic-native-surface-energy',
  "startSurfacePulse('autonomous')",
  'armed-single-native-timer',
  'document.hidden||!visible||renderSuspended',
  'function setLifecycleSuspended',
  'setLifecycleSuspended:(suspended,source)',
  "fxCoreLifecycleR528='active'",
  "fxMagProductContractR528='living-core-continuous-normal-motion'",
  "listen(reduced,'change',onReducedMotionChange"
],'R528 single native renderer');
absent(renderer,['formatx:referencepause','fxReferenceMotionPaused','.fx-reference-pause','function onPause'],'R528 renderer');
assert.doesNotMatch(renderer,/new\s+Image|drawImage|createImageBitmap|THREE\.|three\.js|babylon|playcanvas|model-viewer/);

has(governor,[
  'setLifecycleSuspended',
  "fxMobileRenderGovernorRevisionR433='r528-lifecycle-suspend-no-idle-redraw'",
  "fxMobileRenderContractR528='automatic-resource-lifecycle-not-user-pause'",
  'full-1160ms-sweep-then-zero-idle',
  "addEventListener('formatx:coresurfacesweep'"
],'R528 mobile lifecycle governor');
absent(governor,['userPaused','fxReferenceMotionPaused','formatx:referencepause','.fx-reference-pause'],'R528 mobile lifecycle governor');

has(touch,[
  "const VERSION='touch-pulse-r528-living-core'",
  'formatx:coreinteraction',
  "fxCoreTouchContractR528='living-core-no-manual-pause-wake'"
],'R528 touch interaction path');
absent(touch,['fxReferenceMotionPaused','formatx:referencepause','.fx-reference-pause'],'R528 touch interaction path');

has(shapeSync,[
  'prefers-reduced-motion: reduce',
  'document.hidden',
  'visibilitychange',
  'continuous-normal-reduced-motion-background-safe',
  'formatx-reduced-mag-identity-r528.css'
],'R528 reduced-motion/background lifecycle owner');
absent(shapeSync,['formatx:referencepause','fxReferenceMotionPaused','.fx-reference-pause'],'R528 shape-sync owner');

has(mini,['formatx:heromagcontrollerrequest','window.FormatXMiniMagR459={','formatx:minimagready','living-core-no-manual-pause-action'],'R528 persistent Mini MAG controller');
absent(mini,['togglePause','Pause / resume','Szünet / folytatás','fx-reference-pause'],'R528 Mini MAG controller');
assert.doesNotMatch(mini,/getContext\(|createElement\(['"]canvas|WebGLRenderingContext|WebGL2RenderingContext/);

has(reducedCss,['prefers-reduced-motion: reduce','fx-crystal-organism-r326-stage','animation-play-state: paused'],'R528 reduced-motion visual identity');

for(const source of [intro,motion,current,renderer,governor,touch,shapeSync,mini])new Function(source);
console.log('PASS: R528 living core has one native renderer, continuous normal motion, explicit lifecycle suspension, reduced-motion safety, and no manual MAG pause contract.');

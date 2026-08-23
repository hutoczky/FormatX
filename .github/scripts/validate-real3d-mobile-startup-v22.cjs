'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r317.js');
const legacyRenderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const css=read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
const proofControlsCss=read('docs/scifi-ui/styles/formatx-mobile-proof-controls-r204.css');
const flowCss=read('docs/scifi-ui/styles/formatx-flow-first-r74.css');
const textGuard=read('docs/scifi-ui/styles/formatx-responsive-text-guard-r72.css');
const pureCss=read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const mobileCoreCss=read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const premium=read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const loader=read('docs/scifi-ui/scripts/igloo-parity.js');
const stability=read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const interactionStability=read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const home=read('docs/scifi-ui/index.html');

assert.match(bootstrap,/pure-native-webgl3d-r285-no-2d-mag-layers/);
assert.match(bootstrap,/pure-webgl3d-no-2d-overlays/);
assert.match(bootstrap,/single-webgl-luminous-crystal-r99/);
assert.match(bootstrap,/formatx-pure-3d-r285\.css/);
assert.match(bootstrap,/loading-v69/);
assert.match(bootstrap,/formatx-mobile-reference-layout-v1\.js\?v=20260818-r204-proof-controls/);
assert.match(wrapper,/formatx-core-mobile-reference-r317\.js\?v=20260824-r321-native-soft-rim/);
assert.match(wrapper,/formatx-core-mobile-reference-r99\.js\?v=20260814-luminous-cinematic-r99/);
assert.match(wrapper,/formatx-core-mobile-softlight-r318\.js\?v=20260824-r321-native-source-owner/);
for(const token of [
  'reference-crystal-webgl-r317-modern-flat-normal-fresnel',
  'modern-flat-normal-fresnel-microfacet',
  "getContext('webgl2'",
  "getContext('webgl'",
  'aNormal',
  'gl.drawArrays(gl.TRIANGLES',
  'formatx:coreinteraction',
  'formatx:real3dready',
  'pointerdown',
  'ResizeObserver',
  'IntersectionObserver',
  'visible-native-3d-r99',
  'fxCoreFrameMs',
  'fxCoreRenderMs',
  'corePosition',
  'single-webgl-luminous-crystal-r99',
  'bounded-interaction-bursts-no-idle-raf',
  'fxCoreMobileVisualR318',
  "mobile?'0.18+0.18*fres':'0.32+0.36*fres'",
  "mobile?'0.965,1.030':'1.015,1.055'"
])assert.ok(renderer.includes(token),`missing r317 startup contract: ${token}`);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);
assert.ok(legacyRenderer.includes('reference-luminous-crystal-webgl-r99-prismatic-r120'));
assert.ok(pureCss.includes('.fx-core-detail-r122'));
assert.ok(pureCss.includes('.fx-core-live-r147-layer'));
assert.ok(pureCss.includes('content: none !important'));
assert.doesNotMatch(mobileCoreCss,/radial-gradient|conic-gradient|repeating-linear-gradient/i);

assert.match(layout,/formatx-mobile-reference-layout-v1\.css/);
assert.match(layout,/formatx-flow-first-r74\.css\?v=20260816-mobile-only-r178/);
assert.match(layout,/formatx-mobile-proof-controls-r204\.css\?v=20260818-r204-proof-controls/);
assert.match(layout,/if\(mobileViewport\(\)\).*formatx-flow-first-r74\.css/);
assert.match(layout,/else existingFlow\?\.remove\(\)/);
assert.match(layout,/mag-first-normal-flow-r74/);
assert.match(layout,/setPaused/);
assert.match(layout,/syncMenuState/);
assert.match(layout,/aria-pressed/);
assert.match(layout,/pointerup/);
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.match(layout,/restoreDesktopMenu/);

for(const token of ['repairProof','PUBLIC PROOF LAYER','Bizonyíték a látvány mögött.','fx-reference-liveos','bootObserver','fxMobileProofControls'])assert.ok(layout.includes(token),`missing r260 proof contract: ${token}`);
assert.doesNotMatch(layout,/layoutObserver/);
assert.match(layout,/space\.after\(heading\)/);
assert.match(layout,/heading\.after\(card\)/);
for(const token of ['ensureControlZone','fx-reference-controls-r204','.fx-three-sound','.fx-reference-rail','r260-r207-grid-owner'])assert.ok(layout.includes(token),`missing r260 control-zone contract: ${token}`);
assert.match(layout,/ensureControlZone\(hero,grid,rail\)/);
assert.doesNotMatch(layout,/space\.after\(rail\)/);
assert.match(css,/\.fx-reference-heading/);
assert.match(css,/\.fx-reference-proof/);
for(const token of ['#hero .fx-reference-proof','#hero .fx-reference-controls-r204','.fx-three-sound','.fx-reference-rail','height: auto !important','min-height: 0 !important'])assert.ok(proofControlsCss.includes(token),`missing r204 authoritative CSS contract: ${token}`);
assert.match(flowCss,/position:relative!important/);
assert.doesNotMatch(flowCss,/position:sticky!important/);
assert.match(flowCss,/#hero \.hero-space/);
assert.match(flowCss,/#hero \.fx-reference-rail/);
assert.match(flowCss,/#fx-reference-legacy-menu/);
assert.match(textGuard,/white-space:\s*normal\s*!important/);
assert.match(premium,/ready-v20\|ready-v69/);
assert.match(loader,/ready-v20\|ready-v69/);
assert.match(stability,/ready-v20\|ready-v69/);
assert.match(interactionStability,/booting-v69/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
for(const source of [bootstrap,wrapper,renderer,legacyRenderer,layout,premium,loader,stability,interactionStability])new Function(source);
console.log('PASS: r321 mobile startup keeps softened native WebGL MAG plus r99 fallback and event-driven proof/control ownership.');
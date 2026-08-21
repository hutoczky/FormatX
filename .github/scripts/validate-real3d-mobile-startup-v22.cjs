'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const css=read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
const proofControlsCss=read('docs/scifi-ui/styles/formatx-mobile-proof-controls-r204.css');
const flowCss=read('docs/scifi-ui/styles/formatx-flow-first-r74.css');
const textGuard=read('docs/scifi-ui/styles/formatx-responsive-text-guard-r72.css');
const premium=read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const loader=read('docs/scifi-ui/scripts/igloo-parity.js');
const stability=read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const interactionStability=read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const home=read('docs/scifi-ui/index.html');

assert.match(bootstrap,/responsive-cinematic-reference-v69-r99-luminous-interactive/);
assert.match(bootstrap,/single-webgl-luminous-crystal-r99/);
assert.match(bootstrap,/formatx-award-material-r91\.css\?v=20260814-rayglass-r95/);
assert.match(bootstrap,/loading-v69/);
assert.match(bootstrap,/formatx-mobile-reference-layout-v1\.js\?v=20260818-r204-proof-controls/);
assert.match(wrapper,/formatx-core-mobile-reference-r99\.js\?v=20260814-luminous-cinematic-r99/);
for(const token of ['reference-luminous-crystal-webgl-r99','webgl2','webgl','TRIANGLE_STRIP','formatx:coreinteraction','formatx:real3dready','touchstart','touchmove','touchend','ResizeObserver','IntersectionObserver','visible-native-3d-r99','fxCoreFrameMs','fxCoreRenderMs','corePosition','single-webgl-luminous-crystal-r99'])assert.ok(renderer.includes(token),`missing r99 startup contract: ${token}`);
assert.doesNotMatch(renderer,/new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);

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

// r260: proof content is canonical and repaired by bounded boot/readiness events,
// never by a document-wide steady-state layout observer.
for(const token of ['repairProof','PUBLIC PROOF LAYER','Bizonyíték a látvány mögött.','fx-reference-liveos','bootObserver','fxMobileProofControls'])assert.ok(layout.includes(token),`missing r260 proof contract: ${token}`);
assert.doesNotMatch(layout,/layoutObserver/);
assert.match(layout,/space\.after\(heading\)/);
assert.match(layout,/heading\.after\(card\)/);

// r260: music + ASK/pause share the hero-grid physical owner.
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
for(const source of [bootstrap,wrapper,renderer,layout,premium,loader,stability,interactionStability])new Function(source);
console.log('PASS: r260 event-driven mobile proof/control ownership + luminous native WebGL startup contract passed.');

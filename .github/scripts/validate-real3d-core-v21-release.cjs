'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const stabilityCss=read('docs/scifi-ui/styles/formatx-mobile-r416-stability.css');
const bridge=read('docs/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js');

assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260828-r416-site-coupled-soft-optics/);
assert.match(wrapper,/formatx-mobile-r416-stability\.css/);
assert.match(wrapper,/r416-site-is-mag-soft-optics-first-frame/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.match(wrapper,/new-organism-no-legacy-visual-fallback/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of [
  'crystal-organism-r326','four-direction-asymmetric-crystal-organism-r326','translucent-living-facet-organism-r326',
  'heartbeat-and-interaction-bursts-no-idle-loop-r326',"getContext('webgl2'","getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES','ResizeObserver','IntersectionObserver','formatx:coreinteraction','formatx:real3dready',
  'pointerdown','pointermove','soft-translucent-organic-rim','fxCoreMobileOpticsR414',"fallback:'none'"
])assert.ok(renderer.includes(token),`missing r326 shader release contract: ${token}`);
assert.match(renderer,/fresnelPower:\s*'2\.15'/);
assert.match(renderer,/rimAlpha:\s*'\.007'/);
assert.match(renderer,/facetStrength:\s*'\.075'/);
assert.match(renderer,/sideStrength:\s*'\.09'/);
assert.match(renderer,/outerAlphaMax:\s*'\.62'/);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);
assert.doesNotMatch(renderer,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of ['production-r416-site-is-mag-soft-optics-first-frame','margin:0 auto 16px !important','blur(1.35px)'])assert.ok(stabilityCss.includes(token),`missing r416 presentation contract: ${token}`);
for(const token of ['interaction-bridge-r416-site-is-mag','site-equals-mag-bidirectional','fxMagSiteBidirectionalR416'])assert.ok(bridge.includes(token),`missing r416 site coupling: ${token}`);
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.match(layout,/restoreDesktopMenu/);
for(const source of [bootstrap,wrapper,renderer,layout,bridge])new Function(source);
console.log('PASS: release validates the r326 WebGL organism with r416 soft mobile presentation and bidirectional site↔MAG coupling.');
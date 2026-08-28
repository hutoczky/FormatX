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

assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260828-r382-balanced-soft-optics/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.match(wrapper,/new-organism-no-legacy-visual-fallback/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of [
  'crystal-organism-r326','four-direction-asymmetric-crystal-organism-r326','translucent-living-facet-organism-r326',
  'heartbeat-and-interaction-bursts-no-idle-loop-r326',"getContext('webgl2'","getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES','ResizeObserver','IntersectionObserver','formatx:coreinteraction','formatx:real3dready',
  'pointerdown','pointermove','soft-translucent-organic-rim',"fallback:'none'"
])assert.ok(renderer.includes(token),`missing r326 release contract: ${token}`);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);
assert.doesNotMatch(renderer,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.match(layout,/restoreDesktopMenu/);
for(const source of [bootstrap,wrapper,renderer,layout])new Function(source);
console.log('PASS: release validates only the new r326 living crystal organism with no legacy visual fallback.');

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const selector=read('docs/scifi-ui/scripts/formatx-reference-core-v26.js');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const flow=read('docs/scifi-ui/scripts/formatx-flow-first-r75.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const webgpu=read('docs/scifi-ui/scripts/formatx-webgpu-core-v29.js');
const webgl=read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const entry=read('billing-worker/src/production-entry.js');

assert.match(selector,/const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/);
assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260825-r326-new-organism/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of [
  "getContext('webgl2'","getContext('webgl'",'gl.drawArrays(gl.TRIANGLES','crystal-organism-r326',
  'four-direction-asymmetric-crystal-organism-r326','translucent-living-facet-organism-r326',
  'heartbeat-and-interaction-bursts-no-idle-loop-r326','soft-translucent-organic-rim'
])assert.ok(renderer.includes(token),`missing current r326 reference contract: ${token}`);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);
assert.doesNotMatch(renderer,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of ['r298-state-only-no-layout-writes','compatibility-dormant-r298','delegated-r208','fxFlowFirstScheduling','fxFlowFirstConflict','canonicalOwner'])assert.ok(flow.includes(token),`missing current r298 flow-first contract: ${token}`);
assert.doesNotMatch(flow,/award-reference-overlay-r139|desktop-native-content-r139|createElement\s*\(|appendChild\s*\(|insertBefore\s*\(|innerHTML|style\.setProperty|\.style\./);
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.match(layout,/restoreDesktopMenu/);
assert.match(webgpu,/navigator\.gpu\.requestAdapter/);
assert.match(webgpu,/pass\.drawIndexed/);
assert.match(webgl,/canvas\.getContext\('webgl2'/);
assert.match(webgl,/gl\.drawElements\(gl\.TRIANGLES/);
assert.match(entry,/formatx-reference-core-v26\.js/);
for(const source of [selector,bootstrap,wrapper,renderer,flow,layout])new Function(source);
console.log('PASS: r326 new crystal organism is the production reference authority; legacy MAG renderers are not allowed.');

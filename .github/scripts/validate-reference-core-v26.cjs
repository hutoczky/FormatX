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
const stabilityCss=read('docs/scifi-ui/styles/formatx-mobile-r416-stability.css');
const bridge=read('docs/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js');
const flow=read('docs/scifi-ui/scripts/formatx-flow-first-r75.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const webgpu=read('docs/scifi-ui/scripts/formatx-webgpu-core-v29.js');
const webgl=read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const entry=read('billing-worker/src/production-entry.js');

assert.match(selector,/const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/);
assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260828-r416-site-coupled-soft-optics/);
assert.match(wrapper,/formatx-mobile-r416-stability\.css\?v=20260828-r417-balanced-soft-mag-header-repair/);
assert.match(wrapper,/r417-balanced-soft-mag-header-repair/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of [
  "getContext('webgl2'","getContext('webgl'",'gl.drawArrays(gl.TRIANGLES','crystal-organism-r326',
  'four-direction-asymmetric-crystal-organism-r326','translucent-living-facet-organism-r326',
  'heartbeat-and-interaction-bursts-no-idle-loop-r326','soft-translucent-organic-rim','fxCoreMobileOpticsR414'
])assert.ok(renderer.includes(token),`missing current r326 shader reference contract: ${token}`);
assert.match(renderer,/fresnelPower:\s*'2\.15'/);
assert.match(renderer,/rimAlpha:\s*'\.007'/);
assert.match(renderer,/facetStrength:\s*'\.075'/);
assert.match(renderer,/sideStrength:\s*'\.09'/);
assert.match(renderer,/outerAlphaMax:\s*'\.62'/);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);
assert.doesNotMatch(renderer,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of [
  'production-r417-mobile-header-and-balanced-mag-optics',
  'margin:0 auto 16px !important',
  'opacity:.86 !important',
  'brightness(.86) contrast(.62) saturate(.80) blur(.72px)',
  '.topbar:not(:has(.brand))',
  '.topbar:has(.brand)',
  'top:-160px !important'
])assert.ok(stabilityCss.includes(token),`missing r417 reference presentation contract: ${token}`);
assert.doesNotMatch(stabilityCss,/brightness\(\.5[0-9]\) contrast\(\.2[0-9]\)/);
for(const token of ['interaction-bridge-r416-site-is-mag','site-is-mag-crystal-is-visual-heart','site-equals-mag-bidirectional','fxMagSiteBidirectionalR416'])assert.ok(bridge.includes(token),`missing r416 site↔MAG authority: ${token}`);
for(const token of ['r298-state-only-no-layout-writes','compatibility-dormant-r298','delegated-r208','fxFlowFirstScheduling','fxFlowFirstConflict','canonicalOwner'])assert.ok(flow.includes(token),`missing current r298 flow-first contract: ${token}`);
assert.doesNotMatch(flow,/award-reference-overlay-r139|desktop-native-content-r139|createElement\s*\(|appendChild\s*\(|insertBefore\s*\(|innerHTML|style\.setProperty|\.style\./);
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.match(layout,/restoreDesktopMenu/);
assert.match(webgpu,/navigator\.gpu\.requestAdapter/);
assert.match(webgpu,/pass\.drawIndexed/);
assert.match(webgl,/canvas\.getContext\('webgl2'/);
assert.match(webgl,/gl\.drawElements\(gl\.TRIANGLES/);
assert.match(entry,/formatx-reference-core-v26\.js/);
for(const source of [selector,bootstrap,wrapper,renderer,bridge,flow,layout])new Function(source);
console.log('PASS: r326 WebGL crystal with r417 balanced mobile presentation/header repair and r416 bidirectional site↔MAG coupling is the production reference authority; legacy MAG renderers are not allowed.');
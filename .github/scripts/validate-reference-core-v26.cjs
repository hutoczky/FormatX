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
const currentMagCss=read('docs/scifi-ui/styles/formatx-current-mag-r422.css');
const baseOpticsCss=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const mobileBalanceCss=read('docs/scifi-ui/styles/formatx-mobile-mag-balance-r444.css');
const surfaceSheen=read('docs/scifi-ui/scripts/formatx-mag-surface-sheen-r439.js');
const currentLoader=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const bridge=read('docs/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js');
const flow=read('docs/scifi-ui/scripts/formatx-flow-first-r75.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const webgpu=read('docs/scifi-ui/scripts/formatx-webgpu-core-v29.js');
const webgl=read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const entry=read('billing-worker/src/production-entry.js');

assert.match(selector,/const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/);
assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260825-r326-new-organism&rev=20260829-r424-sharp-organic-core/);
assert.match(wrapper,/formatx-mobile-r416-stability\.css\?v=20260828-r418-restrained-soft-mag-attached-header/);
assert.match(wrapper,/r424-sharp-native-webgl/);
assert.match(wrapper,/retired-r424-native-shader-optics/);
assert.doesNotMatch(wrapper,/const FINAL_OPTICS_STYLE|formatx-mobile-optics-r423\.css/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);

/* r326 remains the sole physical production MAG. r442 is the current mobile
   renderer budget and r444 is the final phone-reviewed optical composite. */
for(const token of [
  "getContext('webgl2'","getContext('webgl'",'gl.drawArrays(gl.TRIANGLES','crystal-organism-r326',
  'four-direction-asymmetric-crystal-organism-r326','translucent-living-facet-organism-r326',
  'heartbeat-and-interaction-bursts-no-idle-loop-r326','soft-translucent-organic-rim','fxCoreMobileOpticsR414',
  'fxCoreOpticsR424','native-webgl-filmic-caustics-no-bitmap-no-css-core',
  'interaction-bursts-idle-zero-frame-r441','mobile-two-pass-lower-density-idle-zero',
  '18x36-two-pass-single-startup-frame','dpr-cap-1.45-pixel-budget-720k',
  'const latitudeSegments = auditMode ? 18 : mobile ? 18 : 30',
  'const longitudeSegments = auditMode ? 32 : mobile ? 36 : 56',
  'const cap=auditMode?1:mobile?1.45:1.55','const budget=auditMode?390000:mobile?720000:1050000',
  'float irisBand','float axisV','vec3 filmic',"fxCoreIdleRenderR441='zero-frame'"
])assert.ok(renderer.includes(token),`missing current r442 r326 shader reference contract: ${token}`);
assert.match(renderer,/const IDLE_ENERGY = mobile \? \.36 : \.32/);
assert.match(renderer,/fresnelPower:\s*'1\.55'/);
assert.doesNotMatch(renderer,/setInterval\s*\(/);
assert.equal((renderer.match(/requestAnimationFrame\(frame\)/g)||[]).length,2,'r326 reference must contain one burst entry and one bounded continuation only');
assert.ok(renderer.includes('if(burstFrames>0)raf=requestAnimationFrame(frame);'));
assert.ok(renderer.includes('else settleAfterBurst();'));
assert.doesNotMatch(renderer,/heartbeatTimer\s*=\s*setTimeout|autonomousTimer\s*=\s*setTimeout/);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);
assert.doesNotMatch(renderer,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);

for(const token of [
  'direct-r326-r442-style-first-idle-zero-mobile-budget',
  "addStyle(STYLE,'data-fx-current-mag-r422')",
  "fxCurrentMagStartupR442='styles-ready-before-renderer'",
  "await addScript(RENDERER,'data-fx-current-r326-r422')",
  '20260830-r442-mobile-two-pass-budget'
])assert.ok(currentLoader.includes(token),`missing current r442 reference loader contract: ${token}`);
assert.ok(currentLoader.indexOf("fxCurrentMagStartupR442='styles-ready-before-renderer'")<currentLoader.indexOf("await addScript(RENDERER,'data-fx-current-r326-r422')"),'reference r326 must start only after its critical CSS owners');

for(const token of [
  'production-r418-attached-header-restrained-mag','margin:0 auto 16px !important','min-height:72px !important','top:-160px !important'
])assert.ok(stabilityCss.includes(token),`missing r418 reference layout contract: ${token}`);

/* r440/r442 are compatibility/base layers. r444 is the final phone composite,
   restoring readable mid-light but keeping contrast below 1 for softer edges. */
for(const token of ['production-r440-direct-r326-restrained-bloom-native-soft-edge-mobile-review','production-r443-cross-device-decorative-overflow-clipped-no-information-loss']){
  assert.ok(currentMagCss.includes(token),`missing current MAG reference compatibility contract: ${token}`);
}
assert.doesNotMatch(currentMagCss,/blur\(/);
for(const token of ['production-r442-final-mobile-mag-optics-owner-restrained-native-no-blur','brightness(.90)','contrast(.89)','saturate(.95)']){
  assert.ok(baseOpticsCss.includes(token),`missing r442 reference base optics: ${token}`);
}
assert.doesNotMatch(baseOpticsCss,/blur\(/);
const balanceCompact=mobileBalanceCss.replace(/\s+/g,'');
for(const token of [
  'production-r444-mobile-mag-readable-midlight-soft-edge-no-blur','opacity:.965!important','brightness(1.055)','contrast(.955)','saturate(1.075)',
  'opacity:.97!important','brightness(1.07)contrast(.95)saturate(1.08)'
])assert.ok(balanceCompact.includes(token.replace(/\s+/g,'')),`missing r444 balanced reference optics: ${token}`);
assert.doesNotMatch(mobileBalanceCss,/blur\(|radial-gradient|conic-gradient/i);
for(const token of ['formatx-mobile-mag-balance-r444.css?v=20260830-r444-readable-midlight-soft-edge','function ensureOpticsStyle()','data-fx-mobile-mag-balance-r444','ensureOpticsStyle();']){
  assert.ok(surfaceSheen.includes(token),`missing r444 final reference optics mount: ${token}`);
}

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
for(const source of [selector,bootstrap,wrapper,renderer,bridge,flow,layout,currentLoader,surfaceSheen])new Function(source);
console.log('PASS: r326 WebGL crystal with r442 18x36/two-pass/720k idle-zero rendering, r444 balanced soft-edge phone optics, r418 non-occluding layout and r416 bidirectional site↔MAG coupling is the production reference authority; legacy MAG renderers are not allowed.');

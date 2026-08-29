'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const bootstrapRenderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const volumeRenderer=read('docs/scifi-ui/scripts/formatx-core-true-volume-r267.js');
const portal=read('docs/scifi-ui/scripts/formatx-crystal-portal-r318.js');
const volumeCss=read('docs/scifi-ui/styles/formatx-core-true-volume-r267.css');
const currentMagCss=read('docs/scifi-ui/styles/formatx-current-mag-r422.css');
const sharpOpticsCss=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const finalHeaderCss=read('docs/scifi-ui/styles/formatx-mobile-header-final-r418.css');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const bridge=read('docs/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js');

assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260825-r326-new-organism&rev=20260829-r424-sharp-organic-core/);
assert.match(wrapper,/formatx-mobile-header-final-r418\.css\?v=20260828-r418-final-owner/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.match(wrapper,/new-organism-no-legacy-visual-fallback/);
assert.match(wrapper,/r424-sharp-native-webgl/);
assert.match(wrapper,/retired-r424-native-shader-optics/);
assert.doesNotMatch(wrapper,/formatx-mobile-optics-r423\.css/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);

/* r326 is the user-visible canonical production MAG. The portal must preserve
   that physical WebGL stage. r267 is retained as a validated fallback only for
   environments/configurations where the r326 primary is not present. */
for(const token of [
  'crystal-organism-r326',"getContext('webgl2'","getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES','ResizeObserver','IntersectionObserver',"fallback:'none'"
])assert.ok(bootstrapRenderer.includes(token),`missing primary r326 WebGL release contract: ${token}`);
for(const token of ['const IDLE_ENERGY = mobile ? .36 : .32','vec3 filmic','float irisBand','fxCoreOpticsR424','dpr-cap-1.75-pixel-budget-980k']){
  assert.ok(bootstrapRenderer.includes(token),`missing r424 sharp WebGL release contract: ${token}`);
}
assert.doesNotMatch(bootstrapRenderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);

for(const token of [
  "VERSION='r267-closed-volume-crystal'",
  'frontCenter=[0,.015,.58]',
  'backCenter=[0,-.008,-.36]',
  'innerFront','outerFront','innerBack','outerBack',
  'add(outerFront[i],outerBack[i],outerBack[j]',
  'add(outerFront[i],outerBack[j],outerFront[j]',
  "getContext('webgl2'","getContext('webgl'",
  'gl.enable(gl.DEPTH_TEST)','gl.depthFunc(gl.LEQUAL)',
  'gl.drawArrays(gl.TRIANGLES,0,mesh.count)',
  'closed-front-back-sidewalls','physical-z-depth-r267',
  'normal-based-two-light-soft-fresnel','event-driven-no-idle-raf',
  'ResizeObserver','IntersectionObserver','pointerdown','pointermove'
])assert.ok(volumeRenderer.includes(token),`missing r267 true-volume fallback release contract: ${token}`);
assert.match(volumeRenderer,/gl_Position=vec4\(q,clamp\(-p\.z\*\.42,-\.82,\.82\),1\.\)/);
assert.doesNotMatch(volumeRenderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);

for(const token of [
  'function r326Primary()',
  "fxCoreMobileAwardRevision==='new-crystal-organism-r326'",
  "fxCoreCrystalRevision==='r326-four-direction-living-facet-organism'",
  "fxCrystalRendererRequest='r326-primary-preserved'",
  "fxCrystalRendererOwnershipR420='r326-exclusive-primary'",
  "renderer:'single-webgl-crystal-organism-r326'",
  'formatx-core-true-volume-r267.js?v=20260828-r267-closed-volume-soft-glass',
  'formatx-core-true-volume-r267.css?v=20260829-r268-softened-mobile-optics',
  "fxCrystalRendererRequest='closed-volume-r267-fallback'",
  "fxCrystalRendererOwnershipR420='r267-legacy-fallback'"
])assert.ok(portal.includes(token),`missing r326-primary / r267-fallback portal release ownership: ${token}`);

for(const token of [
  '.fx-core-r267-volume-canvas',
  'opacity: .985 !important','brightness(.94)','contrast(.87)','saturate(.96)','blur(.26px)',
  'opacity: .98 !important','brightness(.92)','contrast(.85)','saturate(.95)','blur(.32px)',
  'r268-mobile-optics-softened-bloom-and-rim'
])assert.ok(volumeCss.includes(token),`missing restrained r268 fallback optical contract: ${token}`);
assert.doesNotMatch(volumeCss,/blur\((?:[1-9]|[1-9][0-9])(?:\.\d+)?px\)/);

for(const token of [
  'production-r418-final-mobile-header-owner',
  'production-r418-final-mobile-header-owner-non-occluding',
  'position:relative!important','top:auto!important','position:absolute!important',
  'right:122px!important','right:70px!important','right:12px!important',
  'html:not(.fx-signature-open)','display:none!important'
])assert.ok(finalHeaderCss.includes(token),`missing non-occluding r418 release presentation contract: ${token}`);
assert.doesNotMatch(finalHeaderCss,/\.topbar\s*\{[^}]*position:sticky!important/is);
assert.doesNotMatch(finalHeaderCss,/fx-reference-mag-button[^}]*position:fixed/i);
for(const css of [currentMagCss,sharpOpticsCss]){
  const compact=css.replace(/\s+/g,'');
  for(const token of ['opacity:.99!important','scale:1!important','brightness(1.12)','contrast(1.22)','saturate(1.38)']){
    assert.ok(compact.includes(token),`missing r424 sharp release CSS contract: ${token}`);
  }
  assert.doesNotMatch(css,/blur\(/);
}

for(const token of ['interaction-bridge-r416-site-is-mag','site-equals-mag-bidirectional','fxMagSiteBidirectionalR416'])assert.ok(bridge.includes(token),`missing r416 site coupling: ${token}`);
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.match(layout,/restoreDesktopMenu/);
for(const source of [bootstrap,wrapper,bootstrapRenderer,volumeRenderer,portal,layout,bridge])new Function(source);
console.log('PASS: release validates r326 as the authoritative production WebGL MAG, r267 as fallback-only, restrained optics, non-occluding header and bidirectional site↔MAG coupling.');

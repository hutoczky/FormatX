'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const legacyRenderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const volumeRenderer=read('docs/scifi-ui/scripts/formatx-core-true-volume-r267.js');
const crystalPortal=read('docs/scifi-ui/scripts/formatx-crystal-portal-r318.js');
const volumeCss=read('docs/scifi-ui/styles/formatx-core-true-volume-r267.css');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const pureCss=read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const mobileCss=read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const stabilityCss=read('docs/scifi-ui/styles/formatx-mobile-r416-stability.css');
const currentMagCss=read('docs/scifi-ui/styles/formatx-current-mag-r422.css');
const sharpOpticsCss=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const finalHeaderCss=read('docs/scifi-ui/styles/formatx-mobile-header-final-r418.css');
const bridge=read('docs/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js');
const home=read('docs/scifi-ui/index.html');
const contract=JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(bootstrap,/formatx-pure-3d-r285\.css/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260825-r326-new-organism&rev=20260829-r424-sharp-organic-core/);
assert.match(wrapper,/formatx-mobile-r416-stability\.css\?v=20260828-r418-restrained-soft-mag-attached-header/);
assert.match(wrapper,/formatx-mobile-header-final-r418\.css\?v=20260828-r418-final-owner/);
assert.match(wrapper,/fxMobileHeaderFinalR418/);
assert.match(wrapper,/no-legacy-visual-fallback/);
assert.match(wrapper,/r424-sharp-native-webgl/);
assert.match(wrapper,/retired-r424-native-shader-optics/);
assert.doesNotMatch(wrapper,/formatx-mobile-optics-r423\.css/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);

/* r326 is the current authoritative WebGL MAG. r267 remains validated as a
   legacy fallback, but the crystal portal must never replace a ready/configured
   r326 stage. This prevents late renderer ownership from moving the mobile MAG. */
for(const token of [
  'crystal-organism-r326',
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES',
  'ResizeObserver',
  'IntersectionObserver',
  "fallback:'none'"
])assert.ok(legacyRenderer.includes(token),`missing r326 primary WebGL contract: ${token}`);
for(const token of ['const IDLE_ENERGY = mobile ? .36 : .32','vec3 filmic','float irisBand','fxCoreOpticsR424','dpr-cap-1.75-pixel-budget-980k']){
  assert.ok(legacyRenderer.includes(token),`missing r424 sharp WebGL contract: ${token}`);
}
assert.doesNotMatch(legacyRenderer,/getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);

/* Keep the old closed-volume implementation healthy for genuine fallback use;
   it must not be the production owner when the r326 primary is configured. */
for(const token of [
  "VERSION='r267-closed-volume-crystal'",
  'frontCenter=[0,.015,.58]',
  'backCenter=[0,-.008,-.36]',
  'innerFront',
  'outerFront',
  'innerBack',
  'outerBack',
  'add(outerFront[i],outerBack[i],outerBack[j]',
  'add(outerFront[i],outerBack[j],outerFront[j]',
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.enable(gl.DEPTH_TEST)',
  'gl.depthFunc(gl.LEQUAL)',
  'gl.drawArrays(gl.TRIANGLES,0,mesh.count)',
  'closed-front-back-sidewalls',
  'physical-z-depth-r267',
  'normal-based-two-light-soft-fresnel',
  'event-driven-no-idle-raf',
  'ResizeObserver',
  'IntersectionObserver'
])assert.ok(volumeRenderer.includes(token),`missing r267 fallback true-volume contract: ${token}`);
assert.match(volumeRenderer,/gl_Position=vec4\(q,clamp\(-p\.z\*\.42,-\.82,\.82\),1\.\)/);
assert.doesNotMatch(volumeRenderer,/getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);

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
])assert.ok(crystalPortal.includes(token),`missing r326-primary / r267-fallback portal ownership contract: ${token}`);

/* r267's fallback optical finish remains restrained if that fallback is ever
   required. The active r326 production optics are validated separately by the
   r420 phone-viewport gate. */
for(const token of [
  '.fx-core-r267-volume-stage',
  '.fx-core-r267-volume-canvas',
  'opacity: .985 !important',
  'brightness(.94)',
  'contrast(.87)',
  'saturate(.96)',
  'blur(.26px)',
  'opacity: .98 !important',
  'brightness(.92)',
  'contrast(.85)',
  'saturate(.95)',
  'blur(.32px)',
  'r268-mobile-optics-softened-bloom-and-rim'
])assert.ok(volumeCss.includes(token),`missing restrained r267 fallback optical finish: ${token}`);
assert.doesNotMatch(volumeCss,/blur\((?:[1-9]|[1-9][0-9])(?:\.\d+)?px\)/);

/* Older stability CSS may still contain sticky geometry, but the loaded-last
   r418 owner must explicitly replace it with a non-occluding in-flow carrier. */
for(const token of [
  'production-r418-attached-header-restrained-mag',
  'margin:0 auto 16px !important',
  'top:-160px !important',
  'min-height:72px !important'
])assert.ok(stabilityCss.includes(token),`missing r418 compatibility stability contract: ${token}`);

for(const token of [
  'production-r418-final-mobile-header-owner',
  'production-r418-final-mobile-header-owner-non-occluding',
  'position:relative!important',
  'top:auto!important',
  'position:absolute!important',
  'right:122px!important',
  'right:70px!important',
  'right:12px!important',
  'html:not(.fx-signature-open)',
  'display:none!important'
])assert.ok(finalHeaderCss.includes(token),`missing non-occluding r418 final header contract: ${token}`);
assert.doesNotMatch(finalHeaderCss,/\.topbar\s*\{[^}]*position:sticky!important/is);
assert.doesNotMatch(finalHeaderCss,/fx-reference-mag-button[^}]*position:fixed/i);

for(const token of [
  'interaction-bridge-r416-site-is-mag',
  'site-is-mag-crystal-is-visual-heart',
  'site-equals-mag-bidirectional',
  'fxMagSiteBidirectionalR416',
  'IntersectionObserver',
  "pointerType:'site-scroll'",
  "pointerType:'site-state'"
])assert.ok(bridge.includes(token),`missing r416 site↔MAG contract: ${token}`);

assert.ok(pureCss.includes('.fx-core-detail-r122'));
assert.ok(pureCss.includes('content: none !important'));
assert.doesNotMatch(mobileCss,/radial-gradient|conic-gradient|repeating-linear-gradient/i);
for(const css of [currentMagCss,sharpOpticsCss]){
  const compact=css.replace(/\s+/g,'');
  for(const token of ['opacity:.99!important','scale:1!important','brightness(1.12)','contrast(1.22)','saturate(1.38)']){
    assert.ok(compact.includes(token),`missing r424 sharp mobile CSS contract: ${token}`);
  }
  assert.doesNotMatch(css,/blur\(/);
}
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
assert.equal(contract.quality_contract.mag_image_backed,false);
assert.equal(contract.quality_contract.mag_webgl_context_count,1);
assert.equal(contract.quality_contract.mag_paused_outside_hero,true);
for(const source of [bootstrap,wrapper,legacyRenderer,volumeRenderer,crystalPortal,layout,bridge])new Function(source);
console.log('PASS: r326 is the authoritative production WebGL MAG; r267 is fallback-only, restrained optics and non-occluding mobile ownership remain valid, and 2D/image fallback is forbidden.');

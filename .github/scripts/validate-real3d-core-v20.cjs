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
const finalOpticsCss=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const finalHeaderCss=read('docs/scifi-ui/styles/formatx-mobile-header-final-r418.css');
const bridge=read('docs/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js');
const currentLoader=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
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

/* r326 remains the single authoritative WebGL MAG. r442 tightens the mobile
   render budget without changing that ownership: lower native mesh density,
   two draw passes, style-first startup and an idle-zero scheduler are required. */
for(const token of [
  'crystal-organism-r326',
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES',
  'ResizeObserver',
  'IntersectionObserver',
  "fallback:'none'",
  'const IDLE_ENERGY = mobile ? .36 : .32',
  'vec3 filmic',
  'float irisBand',
  'fxCoreOpticsR424',
  'interaction-bursts-idle-zero-frame-r441',
  'mobile-two-pass-lower-density-idle-zero',
  '18x36-two-pass-single-startup-frame',
  'dpr-cap-1.45-pixel-budget-720k',
  'const latitudeSegments = auditMode ? 18 : mobile ? 18 : 30',
  'const longitudeSegments = auditMode ? 32 : mobile ? 36 : 56',
  'if(!mobile){',
  'schedule(1)'
])assert.ok(legacyRenderer.includes(token),`missing r442 primary WebGL contract: ${token}`);
assert.doesNotMatch(legacyRenderer,/setInterval\s*\(|requestAnimationFrame\(frame\)[\s\S]*requestAnimationFrame\(frame\)[\s\S]*heartbeat/i);
assert.doesNotMatch(legacyRenderer,/getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);

/* The active loader must establish geometry-owning styles before it creates the
   WebGL stage. This guards the mobile hero/canvas CLS measured by Lighthouse. */
for(const token of [
  'direct-r326-r442-style-first-idle-zero-mobile-budget',
  "addStyle(STYLE,'data-fx-current-mag-r422')",
  "addStyle(FINAL_HEADER,'data-fx-mobile-header-final-r418')",
  "fxCurrentMagStartupR442='styles-ready-before-renderer'",
  "await addScript(RENDERER,'data-fx-current-r326-r422')",
  '20260830-r442-mobile-two-pass-budget'
])assert.ok(currentLoader.includes(token),`missing r442 style-first loader contract: ${token}`);
const styleReadyIndex=currentLoader.indexOf("fxCurrentMagStartupR442='styles-ready-before-renderer'");
const rendererLoadIndex=currentLoader.indexOf("await addScript(RENDERER,'data-fx-current-r326-r422')");
assert.ok(styleReadyIndex>=0&&rendererLoadIndex>styleReadyIndex,'r442 renderer must load only after critical styles are ready');

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
   required. */
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

/* Historical r424 values remain present only as compatibility layers. The last
   mobile owner must be the restrained r442 phone-reviewed finish, blur-free. */
const currentCompact=currentMagCss.replace(/\s+/g,'');
for(const token of [
  'production-r440-direct-r326-restrained-bloom-native-soft-edge-mobile-review',
  'production-r443-cross-device-decorative-overflow-clipped-no-information-loss',
  'overflow-x:clip!important'
])assert.ok(currentCompact.includes(token.replace(/\s+/g,'')),`missing current MAG CSS contract: ${token}`);
assert.doesNotMatch(currentMagCss,/blur\(/);

const opticsCompact=finalOpticsCss.replace(/\s+/g,'');
for(const token of [
  'production-r442-final-mobile-mag-optics-owner-restrained-native-no-blur',
  'opacity:.90!important',
  'brightness(.90)',
  'contrast(.89)',
  'saturate(.95)',
  'opacity:.89!important',
  'brightness(.89)contrast(.88)saturate(.94)'
])assert.ok(opticsCompact.includes(token.replace(/\s+/g,'')),`missing r442 restrained final optics contract: ${token}`);
assert.doesNotMatch(finalOpticsCss,/blur\(/);

assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
assert.equal(contract.quality_contract.mag_image_backed,false);
assert.equal(contract.quality_contract.mag_webgl_context_count,1);
assert.equal(contract.quality_contract.mag_paused_outside_hero,true);
for(const source of [bootstrap,wrapper,legacyRenderer,volumeRenderer,crystalPortal,layout,bridge,currentLoader])new Function(source);
console.log('PASS: r326 remains the single production WebGL MAG; r442 enforces style-first startup, 18x36 two-pass mobile budget, idle-zero scheduling, restrained blur-free optics, r267 fallback isolation and non-occluding cross-device ownership.');

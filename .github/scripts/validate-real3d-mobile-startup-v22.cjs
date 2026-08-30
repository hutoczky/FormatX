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
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const textGuard=read('docs/scifi-ui/styles/formatx-responsive-text-guard-r72.css');
const stabilityCss=read('docs/scifi-ui/styles/formatx-mobile-r416-stability.css');
const currentMagCss=read('docs/scifi-ui/styles/formatx-current-mag-r422.css');
const baseOpticsCss=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const mobileBalanceCss=read('docs/scifi-ui/styles/formatx-mobile-mag-balance-r444.css');
const surfaceSheen=read('docs/scifi-ui/scripts/formatx-mag-surface-sheen-r439.js');
const currentLoader=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const finalHeaderCss=read('docs/scifi-ui/styles/formatx-mobile-header-final-r418.css');
const firstPaintCss=read('docs/scifi-ui/styles/formatx-mobile-first-paint-r358.css');
const bridge=read('docs/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js');
const premium=read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const loader=read('docs/scifi-ui/scripts/igloo-parity.js');
const stability=read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const home=read('docs/scifi-ui/index.html');

assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260825-r326-new-organism&rev=20260829-r424-sharp-organic-core/);
assert.match(wrapper,/formatx-mobile-r416-stability\.css\?v=20260828-r418-restrained-soft-mag-attached-header/);
assert.match(wrapper,/formatx-mobile-header-final-r418\.css\?v=20260828-r418-final-owner/);
assert.match(wrapper,/fxMobileHeaderFinalR418/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.match(wrapper,/r424-sharp-native-webgl/);
assert.match(wrapper,/retired-r424-native-shader-optics/);
assert.doesNotMatch(wrapper,/formatx-mobile-optics-r423\.css/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);

/* r326 is the configured production mobile MAG. r442 owns its current physical
   budget and idle-zero behaviour; r424 strings above remain loader lineage only. */
for(const token of [
  'crystal-organism-r326',
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES',
  'ResizeObserver',
  'IntersectionObserver',
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
  'const cap=auditMode?1:mobile?1.45:1.55',
  'const budget=auditMode?390000:mobile?720000:1050000',
  'if(!mobile){',
  "fxCoreIdleRenderR441='zero-frame'"
])assert.ok(bootstrapRenderer.includes(token),`missing current r442 mobile startup contract: ${token}`);
assert.doesNotMatch(bootstrapRenderer,/setInterval\s*\(/);
assert.equal((bootstrapRenderer.match(/requestAnimationFrame\(frame\)/g)||[]).length,2,'r326 mobile startup must retain one burst entry and one bounded continuation only');
assert.ok(bootstrapRenderer.includes('if(burstFrames>0)raf=requestAnimationFrame(frame);'));
assert.ok(bootstrapRenderer.includes('else settleAfterBurst();'));
assert.doesNotMatch(bootstrapRenderer,/heartbeatTimer\s*=\s*setTimeout|autonomousTimer\s*=\s*setTimeout/);
assert.doesNotMatch(bootstrapRenderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);

/* Active loader must establish geometry-owning styles before r326 starts. */
for(const token of [
  'direct-r326-r442-style-first-idle-zero-mobile-budget',
  "addStyle(STYLE,'data-fx-current-mag-r422')",
  "addStyle(FINAL_HEADER,'data-fx-mobile-header-final-r418')",
  "fxCurrentMagStartupR442='styles-ready-before-renderer'",
  "await addScript(RENDERER,'data-fx-current-r326-r422')",
  '20260830-r442-mobile-two-pass-budget'
])assert.ok(currentLoader.includes(token),`missing current r442 mobile loader contract: ${token}`);
assert.ok(currentLoader.indexOf("fxCurrentMagStartupR442='styles-ready-before-renderer'")<currentLoader.indexOf("await addScript(RENDERER,'data-fx-current-r326-r422')"),'mobile renderer must start after critical style ownership is established');

/* Validate the legacy closed-volume fallback without allowing it to replace r326. */
for(const token of [
  "VERSION='r267-closed-volume-crystal'",
  'frontCenter=[0,.015,.58]','backCenter=[0,-.008,-.36]',
  'innerFront','outerFront','innerBack','outerBack',
  'add(outerFront[i],outerBack[i],outerBack[j]',
  'add(outerFront[i],outerBack[j],outerFront[j]',
  "getContext('webgl2'","getContext('webgl'",
  'gl.enable(gl.DEPTH_TEST)','gl.depthFunc(gl.LEQUAL)',
  'gl.drawArrays(gl.TRIANGLES,0,mesh.count)',
  'closed-front-back-sidewalls','physical-z-depth-r267',
  'normal-based-two-light-soft-fresnel','event-driven-no-idle-raf',
  'pointerdown','pointermove','ResizeObserver','IntersectionObserver',
  'formatx:real3dready'
])assert.ok(volumeRenderer.includes(token),`missing r267 true-volume fallback contract: ${token}`);
assert.match(volumeRenderer,/gl_Position=vec4\(q,clamp\(-p\.z\*\.42,-\.82,\.82\),1\.\)/);
assert.doesNotMatch(volumeRenderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);

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
])assert.ok(portal.includes(token),`missing r326-primary / r267-fallback mobile portal ownership: ${token}`);

for(const token of [
  '.fx-core-r267-volume-canvas',
  'opacity: .985 !important','brightness(.94)','contrast(.87)','saturate(.96)','blur(.26px)',
  'opacity: .98 !important','brightness(.92)','contrast(.85)','saturate(.95)','blur(.32px)',
  'r268-mobile-optics-softened-bloom-and-rim'
])assert.ok(volumeCss.includes(token),`missing restrained r268 fallback optics contract: ${token}`);
assert.doesNotMatch(volumeCss,/blur\((?:[1-9]|[1-9][0-9])(?:\.\d+)?px\)/);

for(const token of [
  'production-r418-attached-header-restrained-mag',
  'margin:0 auto 16px !important',
  'top:-160px !important',
  'min-height:72px !important'
])assert.ok(stabilityCss.includes(token),`missing r418 compatibility mobile contract: ${token}`);
assert.doesNotMatch(stabilityCss,/brightness\(\.5[0-9]\) contrast\(\.2[0-9]\)/);

/* r440/r442 remain base compatibility optics. The final phone-reviewed r444
   overlay restores readable mid-light while keeping contrast below 1 to avoid
   the hard rim reported on the physical phone capture. */
for(const token of [
  'production-r440-direct-r326-restrained-bloom-native-soft-edge-mobile-review',
  'production-r443-cross-device-decorative-overflow-clipped-no-information-loss'
])assert.ok(currentMagCss.includes(token),`missing current MAG compatibility contract: ${token}`);
assert.doesNotMatch(currentMagCss,/blur\(/);
for(const token of [
  'production-r442-final-mobile-mag-optics-owner-restrained-native-no-blur',
  'brightness(.90)','contrast(.89)','saturate(.95)'
])assert.ok(baseOpticsCss.includes(token),`missing r442 base optics contract: ${token}`);
assert.doesNotMatch(baseOpticsCss,/blur\(/);

const balanceCompact=mobileBalanceCss.replace(/\s+/g,'');
for(const token of [
  'production-r444-mobile-mag-readable-midlight-soft-edge-no-blur',
  'opacity:.965!important',
  'brightness(1.055)',
  'contrast(.955)',
  'saturate(1.075)',
  'opacity:.97!important',
  'brightness(1.07)contrast(.95)saturate(1.08)'
])assert.ok(balanceCompact.includes(token.replace(/\s+/g,'')),`missing r444 balanced phone optics: ${token}`);
assert.doesNotMatch(mobileBalanceCss,/blur\(|radial-gradient|conic-gradient/i);
for(const token of [
  'formatx-mobile-mag-balance-r444.css?v=20260830-r444-readable-midlight-soft-edge',
  'function ensureOpticsStyle()',
  'data-fx-mobile-mag-balance-r444',
  'ensureOpticsStyle();'
])assert.ok(surfaceSheen.includes(token),`missing r444 mobile optics mount: ${token}`);

for(const token of [
  'production-r418-final-mobile-header-owner',
  'production-r418-final-mobile-header-owner-non-occluding',
  'position:relative!important','top:auto!important','position:absolute!important',
  'right:122px!important','right:70px!important','right:12px!important',
  'html:not(.fx-signature-open)','display:none!important'
])assert.ok(finalHeaderCss.includes(token),`missing non-occluding r418 final mobile header contract: ${token}`);
assert.doesNotMatch(finalHeaderCss,/\.topbar\s*\{[^}]*position:sticky!important/is);

for(const token of [
  'production-r418-mobile-first-paint-header-lock',
  'html body > #fx-apex-canvas',
  'position:fixed!important',
  'top:-160px!important'
])assert.ok(firstPaintCss.includes(token),`missing r418 first-paint anti-spacer contract: ${token}`);
for(const token of ['interaction-bridge-r416-site-is-mag','site-equals-mag-bidirectional','pointer-touch-gentle-scroll-scene-webgl'])assert.ok(bridge.includes(token),`missing r416 site↔MAG startup contract: ${token}`);
assert.match(layout,/setPaused/);
assert.match(layout,/syncMenuState/);
assert.match(layout,/mobileViewport=.*max-width:900px/);
for(const token of ['repairProof','PUBLIC PROOF LAYER','Bizonyíték a látvány mögött.','fx-reference-liveos','bootObserver'])assert.ok(layout.includes(token),`missing proof contract: ${token}`);
assert.match(textGuard,/white-space:\s*normal\s*!important/);
assert.match(premium,/ready-v20\|ready-v69/);
assert.match(loader,/ready-v20\|ready-v69/);
assert.match(stability,/ready-v20\|ready-v69/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
for(const source of [bootstrap,wrapper,bootstrapRenderer,volumeRenderer,portal,layout,bridge,premium,loader,stability,currentLoader,surfaceSheen])new Function(source);
console.log('PASS: mobile startup preserves authoritative r326 WebGL ownership, r442 18x36/two-pass/720k idle-zero rendering, r444 readable soft-edge phone optics, r267 fallback isolation, non-occluding header and site↔MAG semantics.');

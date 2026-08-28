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
const pureCss=read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const mobileCss=read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const stabilityCss=read('docs/scifi-ui/styles/formatx-mobile-r416-stability.css');
const finalHeaderCss=read('docs/scifi-ui/styles/formatx-mobile-header-final-r418.css');
const bridge=read('docs/scifi-ui/scripts/formatx-core-interaction-bridge-r109.js');
const home=read('docs/scifi-ui/index.html');
const contract=JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(bootstrap,/formatx-pure-3d-r285\.css/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260828-r416-site-coupled-soft-optics/);
assert.match(wrapper,/formatx-mobile-r416-stability\.css\?v=20260828-r418-restrained-soft-mag-attached-header/);
assert.match(wrapper,/formatx-mobile-header-final-r418\.css\?v=20260828-r418-final-owner/);
assert.match(wrapper,/r418-restrained-soft-mag-attached-header/);
assert.match(wrapper,/fxMobileHeaderFinalR418/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.match(wrapper,/no-legacy-visual-fallback/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);

for(const token of [
  'crystal-organism-r326',
  'four-direction-asymmetric-crystal-organism-r326',
  'translucent-living-facet-organism-r326',
  'heartbeat-and-interaction-bursts-no-idle-loop-r326',
  "getContext('webgl2'",
  "getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES',
  'buildOrganismGeometry',
  'ResizeObserver',
  'IntersectionObserver',
  'formatx:coreinteraction',
  'soft-translucent-organic-rim',
  'fxCoreMobileOpticsR414',
  "fallback:'none'"
])assert.ok(renderer.includes(token),`missing r326 shader contract: ${token}`);
assert.match(renderer,/fresnelPower:\s*'2\.15'/);
assert.match(renderer,/rimAlpha:\s*'\.007'/);
assert.match(renderer,/facetStrength:\s*'\.075'/);
assert.match(renderer,/sideStrength:\s*'\.09'/);
assert.match(renderer,/outerAlphaMax:\s*'\.62'/);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);
assert.doesNotMatch(renderer,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);

for(const token of [
  'production-r418-attached-header-restrained-mag',
  'margin:0 auto 16px !important',
  'opacity:.82 !important',
  'brightness(.80) contrast(.50) saturate(.74) blur(1.05px)',
  'opacity:.80 !important',
  'brightness(.77) contrast(.47) saturate(.72) blur(1.15px)',
  'top:-160px !important',
  'position:sticky !important',
  'min-height:72px !important'
])assert.ok(stabilityCss.includes(token),`missing r418 restrained mobile stability contract: ${token}`);
assert.doesNotMatch(stabilityCss,/brightness\(\.5[0-9]\) contrast\(\.2[0-9]\)/);

for(const token of [
  'production-r418-final-mobile-header-owner',
  'position:sticky!important',
  'position:absolute!important',
  'right:122px!important',
  'right:70px!important',
  'right:12px!important'
])assert.ok(finalHeaderCss.includes(token),`missing r418 final header ownership contract: ${token}`);
assert.doesNotMatch(finalHeaderCss,/fx-reference-mag-button[^}]*position:fixed/i);

for(const token of [
  "interaction-bridge-r416-site-is-mag",
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
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
assert.equal(contract.quality_contract.mag_image_backed,false);
assert.equal(contract.quality_contract.mag_webgl_context_count,1);
assert.equal(contract.quality_contract.mag_paused_outside_hero,true);
for(const source of [bootstrap,wrapper,renderer,layout,bridge])new Function(source);
console.log('PASS: r326 WebGL crystal + r418 restrained mobile MAG/final header ownership and r416 bidirectional site↔MAG coupling are authoritative; legacy visual fallback is forbidden.');
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
const home=read('docs/scifi-ui/index.html');
const contract=JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(bootstrap,/formatx-pure-3d-r285\.css/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260825-r326-new-organism/);
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
  "fallback:'none'"
])assert.ok(renderer.includes(token),`missing r326 contract: ${token}`);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);
assert.doesNotMatch(renderer,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
assert.ok(pureCss.includes('.fx-core-detail-r122'));
assert.ok(pureCss.includes('content: none !important'));
assert.doesNotMatch(mobileCss,/radial-gradient|conic-gradient|repeating-linear-gradient/i);
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
assert.equal(contract.quality_contract.mag_image_backed,false);
assert.equal(contract.quality_contract.mag_webgl_context_count,1);
assert.equal(contract.quality_contract.mag_paused_outside_hero,true);
for(const source of [bootstrap,wrapper,renderer,layout])new Function(source);
console.log('PASS: r326 brand-new living crystal organism is the only MAG renderer; legacy visual fallback is forbidden.');

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
const textGuard=read('docs/scifi-ui/styles/formatx-responsive-text-guard-r72.css');
const premium=read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const loader=read('docs/scifi-ui/scripts/igloo-parity.js');
const stability=read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const home=read('docs/scifi-ui/index.html');

assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js\?v=20260828-r414-soft-rim-facet/);
assert.match(wrapper,/r414-soft-rim-low-facet-glow/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of [
  'crystal-organism-r326',
  'four-direction-asymmetric-crystal-organism-r326',
  'heartbeat-and-interaction-bursts-no-idle-loop-r326',
  'pointerdown','pointermove','formatx:coreinteraction','formatx:real3dready',
  'ResizeObserver','IntersectionObserver','soft-translucent-organic-rim','fxCoreMobileOpticsR414'
])assert.ok(renderer.includes(token),`missing r326/r414 mobile startup contract: ${token}`);
assert.match(renderer,/fresnelPower:\s*'2\.15'/);
assert.match(renderer,/rimAlpha:\s*'\.007'/);
assert.match(renderer,/facetStrength:\s*'\.075'/);
assert.match(renderer,/sideStrength:\s*'\.09'/);
assert.match(renderer,/outerAlphaMax:\s*'\.62'/);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|\bTHREE\./i);
assert.match(layout,/setPaused/);
assert.match(layout,/syncMenuState/);
assert.match(layout,/mobileViewport=.*max-width:900px/);
for(const token of ['repairProof','PUBLIC PROOF LAYER','Bizonyíték a látvány mögött.','fx-reference-liveos','bootObserver'])assert.ok(layout.includes(token),`missing proof contract: ${token}`);
assert.match(textGuard,/white-space:\s*normal\s*!important/);
assert.match(premium,/ready-v20\|ready-v69/);
assert.match(loader,/ready-v20\|ready-v69/);
assert.match(stability,/ready-v20\|ready-v69/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
for(const source of [bootstrap,wrapper,renderer,layout,premium,loader,stability])new Function(source);
console.log('PASS: mobile startup uses r326 with r414 softened optics and preserves controls/text flow.');
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const repo=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(repo,file),'utf8');

const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const mobileCss=read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const pureCss=read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const gyro=read('docs/scifi-ui/scripts/formatx-core-gyro-r144.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const index=read('docs/scifi-ui/index.html');

assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-crystal-organism-r326\.js/);
assert.match(wrapper,/new-crystal-organism-r326-primary/);
assert.doesNotMatch(wrapper,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of [
  'crystal-organism-r326','four-direction-asymmetric-crystal-organism-r326','translucent-living-facet-organism-r326',
  'heartbeat-and-interaction-bursts-no-idle-loop-r326',"getContext('webgl2'","getContext('webgl'",
  'gl.drawArrays(gl.TRIANGLES','buildOrganismGeometry','ResizeObserver','IntersectionObserver','formatx:coreinteraction',
  'fxCoreCompositionRevisionR326','soft-translucent-organic-rim'
])assert.ok(renderer.includes(token),`missing r326 engine token: ${token}`);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|\bTHREE\.|three\.js|babylon|playcanvas|model-viewer/i);
assert.doesNotMatch(renderer,/formatx-core-mobile-reference-r317|formatx-core-mechanical-orb-r250/);
for(const token of ['.fx-core-detail-r122','.fx-core-live-r147-layer','content: none !important'])assert.ok(pureCss.includes(token),`pure WebGL guard missing: ${token}`);
assert.doesNotMatch(mobileCss,/radial-gradient|conic-gradient|repeating-linear-gradient/i);
for(const token of [
  'mobile-gyro-parallax-r379-explicit-touch-center-lock',
  'dormant-until-core-touch-no-raf',
  'sensor-burst-no-idle-raf',
  'requestPermissionFromGesture',
  'event.isTrusted',
  'event-driven-bounded-no-idle-raf'
])assert.ok(gyro.includes(token),`gyro regression: ${token}`);
assert.doesNotMatch(gyro,/permissionState='not-required';\s*enableSensor\(\)/, 'gyro must not auto-enable before an explicit trusted crystal touch');
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.ok(index.includes('formatx-core-real3d-v20.js'));
for(const source of [bootstrap,wrapper,renderer,gyro,layout])new Function(source);
console.log('PASS: r326 living crystal organism is the sole native WebGL MAG renderer; r379 gyro stays dormant until trusted crystal interaction and uses bounded no-idle rendering.');

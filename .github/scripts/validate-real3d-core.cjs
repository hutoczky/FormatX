'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../..');
const read=f=>fs.readFileSync(path.join(repo,f),'utf8');

const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
const mobileCss=read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const pureCss=read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const detail=read('docs/scifi-ui/scripts/formatx-core-detail-overlay-r122.js');
const liveMotion=read('docs/scifi-ui/scripts/formatx-core-live-motion-r147.js');
const heartbeat=read('docs/scifi-ui/scripts/formatx-live-heartbeat-r155.js');
const energy=read('docs/scifi-ui/scripts/formatx-living-energy-r168.js');
const energyCss=read('docs/scifi-ui/styles/formatx-living-energy-r168.css');
const gyro=read('docs/scifi-ui/scripts/formatx-core-gyro-r144.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const index=read('docs/scifi-ui/index.html');

for(const token of [
  'pure-native-webgl3d-r285-no-2d-mag-layers',
  'pure-webgl3d-no-2d-overlays',
  'formatx-pure-3d-r285.css',
  'single-webgl-luminous-crystal-r99',
  'formatx-core-mobile-v55.js?v=20260821-r285-pure-webgl3d',
  'formatx-mobile-reference-layout-v1.js?v=20260818-r204-proof-controls',
  'formatx-core-gyro-r144.js?v=20260821-r285-webgl-input-only'
]) assert.ok(bootstrap.includes(token),`missing r285 bootstrap token: ${token}`);

// The production bootstrap must never request the retired 2D MAG material systems.
for(const forbidden of [
  'formatx-core-detail-overlay-r122.js',
  'formatx-core-detail-overlay-r122.css',
  'formatx-core-live-motion-r147.js',
  'formatx-live-motion-r147.css',
  'formatx-desktop-live-r153.css',
  'formatx-desktop-integration-r154.css'
]) assert.ok(!bootstrap.includes(forbidden),`2D MAG runtime returned to bootstrap: ${forbidden}`);

assert.ok(wrapper.includes('formatx-core-mobile-reference-r99.js?v=20260814-luminous-cinematic-r99'));
for(const token of [
  'getContext(\'webgl2\'',
  'getContext(\'webgl\'',
  'gl.drawArrays(gl.TRIANGLES',
  'reference-luminous-crystal-webgl-r99-prismatic-r120',
  'single-webgl-luminous-crystal-r99',
  'ResizeObserver',
  'IntersectionObserver',
  'formatx:coreinteraction',
  'visible-native-3d-r99',
  'reference-deep-concave-four-point-size-lock-r99',
  'luminous-faceted-iceglass-caustic-r99',
  'prismatic-organic-glass',
  'bounded-interaction-bursts-no-idle-raf'
]) assert.ok(renderer.includes(token),`missing native WebGL token: ${token}`);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]/i);
assert.doesNotMatch(renderer,/drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas/i);
assert.doesNotMatch(renderer,/\bTHREE\.|three\.js|babylon|playcanvas|model-viewer/i);

for(const [name,source] of Object.entries({detail,liveMotion,heartbeat,energy})){
  assert.ok(source.includes('pure-webgl')||source.includes('webgl'),`${name} is not marked WebGL-only`);
  assert.doesNotMatch(source,/getContext\(['"]2d['"]/i,`${name} recreated a 2D canvas context`);
  assert.doesNotMatch(source,/drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas/i,`${name} recreated bitmap compositing`);
  assert.doesNotMatch(source,/radial-gradient|conic-gradient|linear-gradient/i,`${name} recreated CSS 2D optics`);
  assert.doesNotMatch(source,/requestAnimationFrame\s*\([^)]*(?:loop|render|animate|tick)/i,`${name} recreated a visual RAF layer`);
}
assert.ok(detail.includes("fxCoreDetailR122='pure-webgl-disabled-r285'"));
assert.ok(liveMotion.includes('native-webgl-event-bridge-no-dom-layer'));
assert.ok(heartbeat.includes('event-driven-webgl-no-2d-layer'));
assert.ok(energy.includes('native-webgl-material-only-r285'));

for(const token of [
  '.fx-core-detail-r122',
  '.fx-core-live-r147-layer',
  '.fx-r155-heartbeat-core',
  '[class^="fx-r168-"]',
  'content: none !important',
  'mix-blend-mode: normal !important'
]) assert.ok(pureCss.includes(token),`pure-3D guard missing token: ${token}`);

assert.doesNotMatch(mobileCss,/radial-gradient|conic-gradient|repeating-linear-gradient/i,'mobile MAG CSS paints a 2D optical field');
assert.doesNotMatch(mobileCss,/content\s*:\s*["']["']/i,'mobile MAG CSS creates a painted pseudo-element');
assert.ok(mobileCss.includes('background:transparent !important'));
assert.ok(mobileCss.includes('mix-blend-mode:normal !important'));

assert.doesNotMatch(energyCss,/radial-gradient|conic-gradient|linear-gradient/i,'living-energy CSS paints 2D optics');
assert.ok(energyCss.includes('display: none !important'));
assert.ok(energyCss.includes('content: none !important'));

for(const token of ['mobile-gyro-parallax-r267-idle-safe','DeviceOrientationEvent','pointermove','idle-listening','sensor-burst-no-idle-raf'])assert.ok(gyro.includes(token),`missing idle-safe gyro token: ${token}`);
assert.doesNotMatch(gyro,/function enableSensor\(\)[\s\S]*?startFrame\(\)/,'gyro must not start RAF merely because DeviceOrientationEvent exists');

assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.ok(index.includes('data-fx-core-real3d="true"'));
assert.ok(index.includes('formatx-core-real3d-v20.js'));

for(const source of [bootstrap,wrapper,renderer,detail,liveMotion,heartbeat,energy,gyro,layout])new Function(source);
console.log('PASS: r285 MAG is a native WebGL triangle-mesh composition with zero 2D bitmap, canvas, DOM-optics or pseudo-element MAG layers.');

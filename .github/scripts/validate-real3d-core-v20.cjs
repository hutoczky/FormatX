'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const layoutCss=read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
const pureCss=read('docs/scifi-ui/styles/formatx-pure-3d-r285.css');
const mobileCss=read('docs/scifi-ui/styles/formatx-core-mobile-v55.css');
const detail=read('docs/scifi-ui/scripts/formatx-core-detail-overlay-r122.js');
const liveMotion=read('docs/scifi-ui/scripts/formatx-core-live-motion-r147.js');
const heartbeat=read('docs/scifi-ui/scripts/formatx-live-heartbeat-r155.js');
const energy=read('docs/scifi-ui/scripts/formatx-living-energy-r168.js');
const interactionStability=read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const home=read('docs/scifi-ui/index.html');
const contract=JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap,/pure-native-webgl3d-r285-no-2d-mag-layers/);
assert.match(bootstrap,/pure-webgl3d-no-2d-overlays/);
assert.match(bootstrap,/single-webgl-luminous-crystal-r99/);
assert.match(bootstrap,/formatx-pure-3d-r285\.css/);
assert.match(bootstrap,/formatx-core-mobile-v55\.js\?v=20260821-r285-pure-webgl3d/);
assert.match(wrapper,/formatx-core-mobile-reference-r99\.js\?v=20260814-luminous-cinematic-r99/);

for(const token of ['webgl2','webgl','reference-luminous-crystal-webgl-r99','gl.drawArrays(gl.TRIANGLES','formatx:coreinteraction','pointerdown','pointermove','touchstart','touchmove','touchend','ResizeObserver','IntersectionObserver','visible-native-3d-r99','single-webgl-luminous-crystal-r99','fxCoreRenderMs','corePosition','luminous-faceted-iceglass-caustic-r99','touch-pointer-breathing-spectral-refraction-r99','bounded-interaction-bursts-no-idle-raf'])assert.ok(renderer.includes(token),`missing r285 WebGL contract: ${token}`);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);

for(const source of [detail,liveMotion,heartbeat,energy]){
  assert.doesNotMatch(source,/getContext\(['"]2d['"]|drawImage\s*\(|createImageBitmap\s*\(|OffscreenCanvas|radial-gradient|conic-gradient|linear-gradient/i);
}
assert.ok(detail.includes('pure-webgl-disabled-r285'));
assert.ok(liveMotion.includes('native-webgl-event-bridge-no-dom-layer'));
assert.ok(heartbeat.includes('event-driven-webgl-no-2d-layer'));
assert.ok(energy.includes('native-webgl-material-only-r285'));
assert.ok(pureCss.includes('.fx-core-detail-r122'));
assert.ok(pureCss.includes('.fx-core-live-r147-layer'));
assert.ok(pureCss.includes('content: none !important'));
assert.doesNotMatch(mobileCss,/radial-gradient|conic-gradient|repeating-linear-gradient/i);

assert.match(layout,/mag-first-normal-flow-r74/);
assert.match(layout,/PUBLIC PROOF LAYER/);
assert.match(layout,/KÉRDEZZ/);
assert.match(layout,/fx-reference-controls-r204/);
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.match(layout,/restoreDesktopMenu/);
assert.match(layoutCss,/\.fx-reference-proof/);
assert.match(layoutCss,/:focus-visible/);
assert.match(interactionStability,/delegated-r260-canonical-owner/);
assert.doesNotMatch(interactionStability,/setImportant\(sound, 'display', 'none'\)/);
assert.doesNotMatch(interactionStability,/observer\.observe\(document\.body/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));

const quality=contract.quality_contract;
assert.equal(quality.mag_image_backed,false);
assert.equal(quality.mag_webgl_context_count,1);
assert.equal(quality.mag_paused_outside_hero,true);

for(const source of [bootstrap,wrapper,renderer,layout,interactionStability,detail,liveMotion,heartbeat,energy])new Function(source);
console.log('PASS: r285 pure native WebGL MAG, zero 2D MAG overlays, responsive control ownership and production contract passed.');

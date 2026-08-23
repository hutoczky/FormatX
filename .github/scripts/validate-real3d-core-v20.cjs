'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r317.js');
const softlight=read('docs/scifi-ui/scripts/formatx-core-mobile-softlight-r318.js');
const legacyRenderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
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
assert.match(wrapper,/formatx-core-mobile-reference-r317\.js\?v=20260824-r321-native-soft-rim/);
assert.match(wrapper,/formatx-core-mobile-reference-r99\.js\?v=20260814-luminous-cinematic-r99/);
assert.match(wrapper,/formatx-core-mobile-softlight-r318\.js\?v=20260824-r323-deep-water-biolume/);
assert.match(wrapper,/modern-r317-primary/);
assert.match(wrapper,/legacy-r99-fallback/);
assert.match(wrapper,/r323-deep-water-biolume/);

for(const token of [
  'reference-crystal-webgl-r317-modern-flat-normal-fresnel',
  'modern-flat-normal-fresnel-microfacet',
  'bounded-interaction-bursts-no-idle-raf',
  "getContext('webgl2'",
  "getContext('webgl'",
  'aNormal',
  'reflect(-L1,N)',
  'float fres=',
  'SEG=mobile?96:112',
  'RINGS=mobile?28:34',
  'gl.drawArrays(gl.TRIANGLES',
  'formatx:coreinteraction',
  'ResizeObserver',
  'IntersectionObserver',
  'visible-native-3d-r99',
  'single-webgl-luminous-crystal-r99',
  'fxCoreRenderMs',
  'corePosition',
  'fxCoreMobileVisualR318',
  "mobile?'0.18+0.18*fres':'0.32+0.36*fres'",
  "mobile?'0.965,1.030':'1.015,1.055'",
  'const p=mobile?0.84:0.78',
  'const cap=mobile?1.58:1.92'
]) assert.ok(renderer.includes(token),`missing r317 WebGL quality contract: ${token}`);
assert.doesNotMatch(renderer,/getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);
assert.ok(legacyRenderer.includes('reference-luminous-crystal-webgl-r99-prismatic-r120'));

for(const token of [
  'fxCoreSoftlightR318',
  'broader-softer-low-intensity-fresnel',
  'balanced-mobile-perimeter-and-core',
  'native-r317-source-no-prototype-patch',
  'r319-markers-preserved',
  'fxCoreBiolumeR323',
  'fx-core-biolume-r323',
  'deep-water-iridescent-traveling-rim'
]) assert.ok(softlight.includes(token),`missing current source-owned soft-light/biolume contract: ${token}`);
assert.doesNotMatch(softlight,/shaderSource\s*\(|WebGLRenderingContext|WebGL2RenderingContext|prototype\.shaderSource/);
assert.doesNotMatch(softlight,/getContext\(['"]2d['"]|drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|OffscreenCanvas/i);

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

for(const source of [bootstrap,wrapper,renderer,softlight,legacyRenderer,layout,interactionStability,detail,liveMotion,heartbeat,energy])new Function(source);
console.log('PASS: current r317 native WebGL MAG uses the r323 source-owned soft-light/biolume tuner, r99 fallback and zero 2D MAG overlays.');
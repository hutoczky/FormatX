'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
const audioToggle=read('docs/scifi-ui/scripts/formatx-audio-toggle-r191.js');
const audioToggleCss=read('docs/scifi-ui/styles/formatx-audio-toggle-r191.css');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const layoutCss=read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
const flowCss=read('docs/scifi-ui/styles/formatx-flow-first-r74.css');
const interactionStability=read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const home=read('docs/scifi-ui/index.html');
const contract=JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap,/responsive-cinematic-reference-v69-r99-luminous-interactive-r191-mobile-60fps/);
assert.match(bootstrap,/single-webgl-luminous-crystal-r99/);
assert.match(bootstrap,/formatx-core-mobile-v55\.js\?v=20260817-r191-mobile-60fps/);
assert.match(bootstrap,/formatx-award-material-r91\.css\?v=20260814-rayglass-r95/);
assert.match(wrapper,/formatx-core-mobile-reference-r99\.js\?v=20260817-r191-mobile-60fps/);
assert.match(wrapper,/formatx-audio-toggle-r191\.js\?v=20260817-r191/);

for(const token of [
  'webgl2','webgl','TRIANGLE_STRIP','reference-luminous-crystal-webgl-r99',
  'formatx:coreinteraction','pointerdown','pointermove','touchstart','touchmove','touchend',
  'ResizeObserver','IntersectionObserver','single-webgl-luminous-crystal-r99',
  'fxCoreRenderMs','fxCoreRenderAverageMs','fxCoreReal3dFps','fxCoreRenderScale','fxCoreReal3dQuality',
  'corePosition','luminous-faceted-iceglass-caustic-r99','touch-pointer-breathing-spectral-refraction-r99',
  'TARGET_FPS=60','FRAME_BUDGET=1000/TARGET_FPS','r191-dynamic-resolution-hysteresis',
  'budget=mobile?520000','powerPreference:\'high-performance\'','desynchronized:true'
]) assert.ok(renderer.includes(token),`missing r191 mobile WebGL contract: ${token}`);
assert.doesNotMatch(renderer,/drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);

assert.match(audioToggle,/mute-unmute-r191/);
assert.match(audioToggle,/UNMUTE/);
assert.match(audioToggle,/MUTE/);
assert.match(audioToggle,/aria-pressed/);
assert.match(audioToggle,/source\.click\(\)/);
assert.doesNotMatch(audioToggle,/autoplay|\.play\(\)/i);
assert.match(audioToggleCss,/\.fx-audio-toggle-r191/);
assert.match(audioToggleCss,/min-height:\s*44px/);
assert.match(audioToggleCss,/:focus-visible/);
assert.match(audioToggleCss,/position:\s*fixed/);

assert.match(layout,/mag-first-normal-flow-r74/);
assert.match(layout,/PUBLIC PROOF LAYER/);
assert.match(layout,/KÉRDEZZ/);
assert.match(layout,/space\.after\(rail\)/);
assert.match(layout,/mobileViewport=.*max-width:900px/);
assert.match(layout,/restoreDesktopMenu/);
assert.match(layoutCss,/\.fx-reference-proof/);
assert.match(layoutCss,/:focus-visible/);
assert.match(flowCss,/#hero \.hero-space/);
assert.doesNotMatch(flowCss,/position:sticky!important/);
assert.match(flowCss,/#fx-reference-legacy-menu/);
assert.match(layout,/aria-pressed/);
/* The old Web Audio actuator stays hidden; r191 exposes the separate public control. */
assert.match(interactionStability,/setImportant\(sound, 'display', 'none'\)/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));

const quality=contract.quality_contract;
assert.equal(quality.mag_image_backed,false);
assert.equal(quality.mag_webgl_context_count,1);
assert.equal(quality.mag_paused_outside_hero,true);
for(const source of [bootstrap,wrapper,renderer,audioToggle,layout,interactionStability]) new Function(source);
console.log('PASS: r191 mobile 60 FPS target, native WebGL, visible MUTE/UNMUTE and reference contracts passed.');

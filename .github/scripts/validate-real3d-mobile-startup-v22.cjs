'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-v69.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const css=read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
const flowCss=read('docs/scifi-ui/styles/formatx-flow-first-r74.css');
const textGuard=read('docs/scifi-ui/styles/formatx-responsive-text-guard-r72.css');
const premium=read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const loader=read('docs/scifi-ui/scripts/igloo-parity.js');
const stability=read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const interactionStability=read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const home=read('docs/scifi-ui/index.html');

assert.match(bootstrap,/responsive-cinematic-reference-v69-r74-flow-first/);
assert.match(bootstrap,/single-webgl2-responsive-cinematic-reference-glass-v69/);
assert.match(bootstrap,/formatx-mobile-reference-layout-v1\.js\?v=20260814-mag-first-flow-r74/);
assert.match(bootstrap,/loading-v69/);
assert.match(bootstrap,/ready-v69/);
assert.match(wrapper,/formatx-core-mobile-reference-v69\.js/);
assert.equal((bootstrap.match(/getContext\(['"]webgl2['"]/g)||[]).length,0);
assert.equal((wrapper.match(/getContext\(['"]webgl2['"]/g)||[]).length,0);
assert.equal((renderer.match(/candidate\.getContext\(profile\.kind/g)||[]).length,1);
for(const token of [
  'single-webgl2-mobile-cinematic-reference-glass-v69',
  'reference-target-organic-deep-concave-four-point-v69',
  'four-layer-luminous-fresnel-faceted-glass-v69',
  'white-cyan-reactor-six-orbitals-crossflare-v69',
  'native-webgl2-only-no-raster-no-svg-v69',
  'single-context-adaptive-60-plus-fps',
  'continuous-native-webgl2-living-motion-v69',
  'direct-touch-drag-energy-burst-parallax-v69',
  'formatx:coreinteraction','formatx:referencepause','formatx:real3dready',
  'ResizeObserver','IntersectionObserver','webglcontextlost','webglcontextrestored','visible-native-3d-v71','fxCoreRenderMs'
]) assert.ok(renderer.includes(token),`missing v69 startup contract: ${token}`);
assert.doesNotMatch(renderer,/new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|three\.js|babylon|playcanvas|model-viewer/i);
assert.doesNotMatch(renderer,/\bTHREE\./);
assert.match(layout,/formatx-mobile-reference-layout-v1\.css/);
assert.match(layout,/formatx-flow-first-r74\.css\?v=20260814-mag-first-flow-r74/);
assert.match(layout,/mag-first-normal-flow-r74/);
assert.match(layout,/setPaused/);
assert.match(layout,/syncMenuState/);
assert.match(layout,/aria-pressed/);
assert.match(layout,/pointerup/);
assert.match(layout,/space\.after\(rail\)/);
assert.doesNotMatch(layout,/desktop-skip/);
assert.match(css,/\.fx-reference-heading/);
assert.match(css,/\.fx-reference-proof/);
assert.match(css,/\.fx-genome-launcher/);
assert.match(flowCss,/\.topbar\{/);
assert.match(flowCss,/position:sticky!important/);
assert.match(flowCss,/#hero \.hero-space/);
assert.match(flowCss,/order:0!important/);
assert.match(flowCss,/#hero \.fx-reference-rail/);
assert.match(flowCss,/order:1!important/);
assert.match(flowCss,/#hero \.hero-copy/);
assert.match(flowCss,/order:2!important/);
assert.match(flowCss,/#hero \.fx-reference-heading/);
assert.match(flowCss,/order:3!important/);
assert.match(flowCss,/#hero \.fx-reference-proof/);
assert.match(flowCss,/order:4!important/);
assert.match(flowCss,/#hero \.fx-reference-liveos/);
assert.match(flowCss,/@media \(max-width:900px\)/);
assert.match(textGuard,/#hero \.hero-copy > \.hero-lead/);
assert.match(textGuard,/max-width:\s*620px\s*!important/);
assert.match(textGuard,/white-space:\s*normal\s*!important/);
assert.match(textGuard,/padding-right:\s*clamp\(88px,\s*24vw,\s*104px\)\s*!important/);
assert.match(premium,/ready-v20\|ready-v69/);
assert.match(loader,/ready-v20\|ready-v69/);
assert.match(stability,/ready-v20\|ready-v69/);
assert.match(interactionStability,/booting-v69/);
assert.match(interactionStability,/setImportant\(sound, 'display', 'none'\)/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
for(const source of [bootstrap,wrapper,renderer,layout,premium,loader,stability,interactionStability]) new Function(source);
console.log('PASS: responsive cinematic native WebGL2 v69 r74 MAG-first desktop/mobile no-overlap startup contract passed.');

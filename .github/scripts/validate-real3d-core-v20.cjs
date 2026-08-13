'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-v69.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const layoutCss=read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
const interactionStability=read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const home=read('docs/scifi-ui/index.html');
const contract=JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap,/responsive-cinematic-reference-v69-r71/);
assert.match(bootstrap,/formatx-core-mobile-v55\.js/);
assert.match(wrapper,/formatx-core-mobile-reference-v69\.js/);
assert.match(wrapper,/formatx-mobile-reference-layout-v1\.css/);
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
  'formatx:coreinteraction','pointerdown','pointermove','formatx:referencepause',
  'ResizeObserver','IntersectionObserver','webglcontextlost','webglcontextrestored','visible-native-3d-v71','corePosition'
]) assert.ok(renderer.includes(token),`missing v69 contract: ${token}`);
assert.doesNotMatch(renderer,/drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|three\.js|babylon|playcanvas|model-viewer/i);
assert.doesNotMatch(renderer,/\bTHREE\./);
assert.match(layout,/PUBLIC PROOF LAYER/);
assert.match(layout,/KÉRDEZZ/);
assert.match(layoutCss,/\.fx-reference-proof/);
assert.match(layoutCss,/\.fx-genome-launcher/);
assert.match(layoutCss,/:focus-visible/);
assert.match(layout,/aria-pressed/);
assert.match(interactionStability,/setImportant\(sound, 'display', 'none'\)/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
const quality=contract.quality_contract;
assert.equal(quality.mag_image_backed,false);
assert.equal(quality.mag_webgl_context_count,1);
assert.equal(quality.mag_paused_outside_hero,true);
for(const source of [bootstrap,wrapper,renderer,layout,interactionStability]) new Function(source);
console.log('PASS: unified responsive cinematic native WebGL2 v69 source/layout/interaction contracts passed.');

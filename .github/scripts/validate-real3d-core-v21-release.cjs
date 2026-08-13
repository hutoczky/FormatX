'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-v69.js');
const layoutCss=read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
assert.match(bootstrap,/responsive-cinematic-reference-v69-r70/);
assert.match(bootstrap,/single-webgl2-responsive-cinematic-reference-glass-v69/);
assert.match(wrapper,/formatx-core-mobile-reference-v69\.js/);
assert.equal((renderer.match(/getContext\(['"]webgl2['"]/g)||[]).length,1);
for(const token of [
  'single-webgl2-mobile-cinematic-reference-glass-v69',
  'reference-target-organic-deep-concave-four-point-v69',
  'four-layer-luminous-fresnel-faceted-glass-v69',
  'white-cyan-reactor-six-orbitals-crossflare-v69',
  'native-webgl2-only-no-raster-no-svg-v69',
  'single-context-adaptive-60-plus-fps',
  'continuous-native-webgl2-living-motion-v69',
  'direct-touch-drag-energy-burst-parallax-v69','formatx:referencepause'
]) assert.ok(renderer.includes(token),`missing v69 release contract: ${token}`);
assert.doesNotMatch(renderer,/new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|three\.js|babylon|playcanvas|model-viewer/i);
assert.doesNotMatch(renderer,/\bTHREE\./);
assert.match(layoutCss,/PUBLIC PROOF|fx-reference-proof/);
assert.match(layoutCss,/@media \(min-width:901px\)/);
new Function(bootstrap);new Function(wrapper);new Function(renderer);
console.log('PASS: release validates unified responsive cinematic native WebGL2 v69.');

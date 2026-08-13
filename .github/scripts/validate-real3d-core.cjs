'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(repo, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-v69.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const layoutStyle = read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
const previewWebgl = read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const previewMobile = read('docs/scifi-ui/styles/formatx-real3d-mobile-v29.css');

assert.match(bootstrap, /responsive-cinematic-reference-v69-r70/);
assert.match(bootstrap, /single-webgl2-responsive-cinematic-reference-glass-v69/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260813-cinematic-reference-v69-r70/);
assert.match(wrapper, /formatx-core-mobile-reference-v69\.js/);
assert.equal((bootstrap.match(/getContext\(['"]webgl2['"]/gi) || []).length, 0);
assert.equal((wrapper.match(/getContext\(['"]webgl2['"]/gi) || []).length, 0);
assert.equal((renderer.match(/getContext\(['"]webgl2['"]/gi) || []).length, 1);

for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawArrays(gl.TRIANGLES',
  'gl.POINTS',
  'function ortho(',
  'function shell(',
  'function crystalPanels(',
  'function crystalRibbon(',
  'single-webgl2-mobile-cinematic-reference-glass-v69',
  'reference-target-organic-deep-concave-four-point-v69',
  'four-layer-luminous-fresnel-faceted-glass-v69',
  'white-cyan-reactor-six-orbitals-crossflare-v69',
  'native-webgl2-only-no-raster-no-svg-v69',
  'single-context-adaptive-60-plus-fps',
  'continuous-native-webgl2-living-motion-v69',
  'direct-touch-drag-energy-burst-parallax-v69',
  'ResizeObserver',
  'IntersectionObserver',
  'webglcontextlost',
  'fxCoreRenderMs',
  'corePosition'
]) assert.ok(renderer.includes(token), `missing v69 production contract: ${token}`);

assert.match(renderer, /budget=880000/);
assert.match(renderer, /float fres=pow\(/);
assert.match(renderer, /gl\.blendFunc\(gl\.SRC_ALPHA,gl\.ONE\)/);
assert.doesNotMatch(renderer, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(/i);
assert.doesNotMatch(renderer, /\bTHREE\.|three\.js|babylon|playcanvas|model-viewer/i);
assert.match(layout, /formatx:referencepause/);
assert.match(layout, /aria-pressed/);
assert.match(layoutStyle, /\.fx-reference-proof/);
assert.match(layoutStyle, /:focus-visible/);
assert.match(layoutStyle, /@media \(min-width:901px\)/);
assert.doesNotMatch(layoutStyle, /clip-path:\s*polygon/i);

assert.match(previewWebgl, /getContext\(['"]webgl2['"]/i);
assert.match(previewWebgl, /gl\.drawElements\(gl\.TRIANGLES/);
assert.doesNotMatch(previewWebgl, /drawImage\s*\(|new\s+Image\s*\(/i);
assert.match(previewMobile, /data-fx-orbital-core="ready-v28"/);

for (const source of [bootstrap, wrapper, renderer, layout]) new Function(source);
console.log('PASS: production MAG uses one adaptive native WebGL2 v69 renderer with layered crystalline glass, moving reactor, accessible controls and responsive mobile/desktop framing.');

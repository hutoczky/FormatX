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
const responsiveTextGuard = read('docs/scifi-ui/styles/formatx-responsive-text-guard-r72.css');
const contentFinalizer = read('docs/scifi-ui/scripts/formatx-content-finalizer.js');
const livingRendering = read('docs/scifi-ui/scripts/formatx-living-system-rendering-v1.js');
const previewWebgl = read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const previewMobile = read('docs/scifi-ui/styles/formatx-real3d-mobile-v29.css');

assert.match(bootstrap, /responsive-cinematic-reference-v69-r73/);
assert.match(bootstrap, /single-webgl2-responsive-cinematic-reference-glass-v69/);
assert.match(bootstrap, /formatx-core-mobile-v55\.js\?v=20260813-desktop-safe-r73/);
assert.match(bootstrap, /formatx-mobile-reference-layout-v1\.js\?v=20260813-mobile-only-r73/);
assert.match(wrapper, /formatx-core-mobile-reference-v69\.js/);
assert.equal((bootstrap.match(/getContext\(['"]webgl2['"]/gi) || []).length, 0);
assert.equal((wrapper.match(/getContext\(['"]webgl2['"]/gi) || []).length, 0);
assert.equal((renderer.match(/candidate\.getContext\(profile\.kind/g) || []).length, 1);
assert.match(renderer, /kind:'webgl2'/);
assert.match(renderer, /kind:'webgl'/);

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
  'webglcontextrestored',
  'visible-native-3d-v71',
  'webgl2-primary-webgl1-native-3d-self-healing-v71',
  'fxCoreRenderMs',
  'corePosition'
]) assert.ok(renderer.includes(token), `missing v69 production contract: ${token}`);

assert.match(renderer, /budget=880000/);
assert.match(renderer, /float fres=pow\(/);
assert.match(renderer, /gl\.blendFunc\(gl\.SRC_ALPHA,gl\.ONE\)/);
assert.doesNotMatch(renderer, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(/i);
assert.doesNotMatch(renderer, /\bTHREE\.|three\.js|babylon|playcanvas|model-viewer/i);
assert.match(layout, /const mobileViewport=matchMedia\('\(max-width:900px\)'\)/);
assert.match(layout, /desktop-skip/);
assert.match(layout, /formatx:referencepause/);
assert.match(layout, /formatx-responsive-text-guard-r72\.css\?v=20260813-responsive-text-wrap-r72/);
assert.match(layout, /aria-pressed/);
assert.match(layoutStyle, /\.fx-reference-proof/);
assert.match(layoutStyle, /:focus-visible/);
assert.match(layoutStyle, /@media \(min-width:901px\)/);
assert.doesNotMatch(layoutStyle, /clip-path:\s*polygon/i);
assert.match(responsiveTextGuard, /max-width:\s*620px\s*!important/);
assert.match(responsiveTextGuard, /white-space:\s*normal\s*!important/);
assert.match(responsiveTextGuard, /overflow-wrap:\s*break-word\s*!important/);
assert.match(responsiveTextGuard, /padding-right:\s*clamp\(88px,\s*24vw,\s*104px\)\s*!important/);
assert.match(contentFinalizer, /fxMobileReferenceLayout === 'ready-v1'/);
assert.match(contentFinalizer, /querySelector\('\.fx-reference-mag-button'\)/);
assert.match(livingRendering, /document\.permissionsPolicy \|\| document\.featurePolicy/);
assert.match(livingRendering, /fxOrientationInput = 'policy-disabled'/);

assert.match(previewWebgl, /getContext\(['"]webgl2['"]/i);
assert.match(previewWebgl, /gl\.drawElements\(gl\.TRIANGLES/);
assert.doesNotMatch(previewWebgl, /drawImage\s*\(|new\s+Image\s*\(/i);
assert.match(previewMobile, /data-fx-orbital-core="ready-v28"/);

for (const source of [bootstrap, wrapper, renderer, layout, contentFinalizer, livingRendering]) new Function(source);
console.log('PASS: production MAG uses one adaptive native WebGL2 v69 r73 renderer with layered crystalline glass, moving reactor, accessible controls and mobile-only reference chrome.');

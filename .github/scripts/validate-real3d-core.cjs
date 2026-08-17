'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(repo,f),'utf8');
const bootstrap=read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const index=read('docs/scifi-ui/index.html');
const heartbeat=read('docs/scifi-ui/scripts/formatx-live-heartbeat-r155.js');
const energy=read('docs/scifi-ui/scripts/formatx-living-energy-r168.js');
const seamless=read('docs/scifi-ui/styles/formatx-seamless-living-r158.css');
const detail=read('docs/scifi-ui/scripts/formatx-core-detail-overlay-r122.js');
const mobileStability=read('docs/scifi-ui/scripts/formatx-mobile-hero-stability-r151.js');
const mobileStabilityStyle=read('docs/scifi-ui/styles/formatx-mobile-hero-stability-r151.css');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer=read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
const layout=read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const flow=read('docs/scifi-ui/scripts/formatx-flow-first-r75.js');
const layoutStyle=read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
const responsiveTextGuard=read('docs/scifi-ui/styles/formatx-responsive-text-guard-r72.css');
const contentFinalizer=read('docs/scifi-ui/scripts/formatx-content-finalizer.js');
const livingRendering=read('docs/scifi-ui/scripts/formatx-living-system-rendering-v1.js');
const previewWebgl=read('docs/scifi-ui/scripts/formatx-orbital-core-v28.js');
const previewMobile=read('docs/scifi-ui/styles/formatx-real3d-mobile-v29.css');
const tailFinalizer=read('docs/scifi-ui/scripts/formatx-reference-finalizer-r143.js');
const gyro=read('docs/scifi-ui/scripts/formatx-core-gyro-r144.js');
const narrowProof=read('docs/scifi-ui/styles/formatx-reference-narrow-proof-r145.css');
const desktopIntegration=read('docs/scifi-ui/styles/formatx-desktop-integration-r154.css');

// Bootstrap contract: validate capabilities and asset ownership, not cache-query revisions.
for(const token of [
  'responsive-cinematic-reference-v69-r99-luminous-interactive-r189-stable-silhouette',
  'single-webgl-luminous-crystal-r99',
  'formatx-core-mobile-v55.js',
  'formatx-award-material-r91.css',
  'formatx-mobile-reference-layout-v1.js',
  'formatx-flow-first-r75.js',
  'formatx-reference-finalizer-r143.js',
  'formatx-core-gyro-r144.js',
  'formatx-reference-narrow-proof-r145.css',
  'formatx-click-stability-r152.css',
  'formatx-desktop-live-r153.css',
  'formatx-desktop-integration-r154.css',
  'formatx-mobile-hero-stability-r151.css',
  'formatx-mobile-hero-stability-r151.js',
  'formatx-core-detail-overlay-r122.js'
]) assert.ok(bootstrap.includes(token),`missing bootstrap capability: ${token}`);

assert.ok(index.includes('data-fx-live-heartbeat-r155="true"'));
assert.ok(index.includes('formatx-live-heartbeat-r155.js'));
assert.ok(index.includes('formatx-living-energy-r168.css'));
assert.ok(index.includes('formatx-living-energy-r168.js'));

for(const token of ['requestAnimationFrame-display-synced-r183','display-refresh-adaptive','fxLiveHeartbeatTickR155','fx-r155-heartbeat-core','prefers-reduced-motion','pointerdown','touchstart','internal-canvas-no-layout-shift'])assert.ok(heartbeat.includes(token),`missing heartbeat capability: ${token}`);
assert.doesNotMatch(heartbeat,/setInterval\(tick\s*,\s*50\)/,'20 Hz heartbeat timer returned');
for(const token of ['display-synced-raf-r183','requestAnimationFrame-display-synced-r183','function loop(now)','tick(now)'])assert.ok(energy.includes(token),`missing energy capability: ${token}`);
assert.doesNotMatch(energy,/now-lastTickAt>=30/,'33 Hz living-energy throttle returned');
for(const token of ['mix-blend-mode:screen','background:transparent!important','fx-core-mobile-v55-stage::before','content:none!important','@media (max-width:900px)'])assert.ok(seamless.includes(token),`missing seamless capability: ${token}`);

for(const token of ['fxCoreDesktopLumaKeyR157','fxCoreReferenceKeyR160','desktopKey=matchMedia','mobile-applied-r160','reference-material-interactive-seamless-shape-pulse'])assert.ok(detail.includes(token));
for(const token of ['insertAdjacentElement(\'afterend\',dock)','heading-proof-download',"setProperty('order','2','important')", "setProperty('order','3','important')", "setProperty('order','4','important')"])assert.ok(mobileStability.includes(token));
assert.ok(mobileStabilityStyle.includes('order:4!important'));

// r189 anti-vibration contract: stable outer geometry, dt-based interaction smoothing,
// ResizeObserver-owned sizing, while the internal optical system remains alive.
assert.ok(wrapper.includes('formatx-core-mobile-reference-r99.js'));
assert.ok(wrapper.includes('r189-stable-silhouette'));
for(const token of [
  'reference-luminous-crystal-webgl-r99-prismatic-r120-stable-silhouette-r189',
  'webgl2','webgl','TRIANGLE_STRIP','single-webgl-luminous-crystal-r99',
  'ResizeObserver','IntersectionObserver','formatx:coreinteraction','touchstart','touchmove','touchend',
  'visible-native-3d-r99','reference-deep-concave-four-point-size-lock-r99',
  'luminous-faceted-iceglass-caustic-r99','fxCoreRenderMs','corePosition','frac','caustic','rings',
  "fxCoreSilhouetteStability='r189-fixed-geometry-dt-smoothing'",
  '1-Math.exp(-dt*.0047)','1-Math.exp(-dt*.0057)','1-Math.exp(-dt*.00060)',
  'function recenter('
]) assert.ok(renderer.includes(token),`missing r189 renderer contract: ${token}`);
assert.ok(renderer.includes('720000'));
assert.doesNotMatch(renderer,/1\.\+\.007\*sin\(t\*\.70\)/,'autonomous geometry breathing returned');
assert.doesNotMatch(renderer,/uPointer\.x\*\.20\+\.012\*sin/,'idle yaw vibration returned');
assert.doesNotMatch(renderer,/uPointer\.y\*\.15\+\.009\*cos/,'idle pitch vibration returned');
assert.doesNotMatch(renderer,/drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(/i);
assert.doesNotMatch(renderer,/\bTHREE\.|three\.js|babylon|playcanvas|model-viewer/i);
const frameBody=(renderer.match(/function frame\(now\)\{([\s\S]*?)\}\n function destroy/)||[])[1]||'';
assert.ok(frameBody,'renderer frame loop not found');
assert.doesNotMatch(frameBody,/\bresize\(\)/,'per-frame layout resize returned');

for(const token of ['booting-r74','mag-first-normal-flow-r74','formatx-flow-first-r74.css','formatx:referencepause','aria-pressed','restoreDesktopMenu'])assert.ok(layout.includes(token));
assert.match(layout,/mobileViewport=.*max-width:900px/);
for(const token of ['const mobile=innerWidth<=900','restoreDesktopMenu','restoreDesktopNative'])assert.ok(flow.includes(token));
assert.match(flow,/imp\(rail,'display','none'\)/);
assert.ok(layoutStyle.includes('.fx-reference-proof'));
assert.ok(layoutStyle.includes(':focus-visible'));
assert.doesNotMatch(layoutStyle,/@media \(min-width:901px\)/,'mobile reference stylesheet leaked a desktop media block');
assert.match(responsiveTextGuard,/white-space:\s*normal\s*!important/);
assert.ok(contentFinalizer.includes("fxMobileReferenceLayout === 'ready-v1'"));
assert.match(livingRendering,/document\.permissionsPolicy \|\| document\.featurePolicy/);
assert.match(previewWebgl,/getContext\(['"]webgl2['"]/i);
assert.match(previewWebgl,/gl\.drawElements\(gl\.TRIANGLES/);
assert.ok(previewMobile.includes('data-fx-orbital-core="ready-v28"'));
assert.ok(tailFinalizer.includes('fxReferenceFinalizerR143'));
for(const token of ['DeviceOrientationEvent','pointermove','prefers-reduced-motion'])assert.ok(gyro.includes(token));
assert.ok(narrowProof.includes('@media (max-width:400px)'));
for(const token of ['@media (min-width:901px) and (pointer:fine)','aspect-ratio:412 / 410','mix-blend-mode:screen','background-image:none!important'])assert.ok(desktopIntegration.includes(token));

for(const source of [bootstrap,heartbeat,energy,detail,mobileStability,wrapper,renderer,layout,flow,contentFinalizer,livingRendering,tailFinalizer,gyro])new Function(source);
console.log('PASS: r189 MAG keeps a fixed outer silhouette with display-synced internal motion, dt-stable interaction and native WebGL rendering.');

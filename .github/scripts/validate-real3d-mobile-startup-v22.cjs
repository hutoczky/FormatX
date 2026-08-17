'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const wrapper = read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const renderer = read('docs/scifi-ui/scripts/formatx-core-mobile-reference-r99.js');
const watchdog = read('docs/scifi-ui/scripts/formatx-core-never-stuck-r195.js');
const fallbackCss = read('docs/scifi-ui/styles/formatx-core-never-stuck-r195.css');
const productionRecovery = read('billing-worker/src/production-performance-r193.js');
const layout = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const css = read('docs/scifi-ui/styles/formatx-mobile-reference-layout-v1.css');
const flowCss = read('docs/scifi-ui/styles/formatx-flow-first-r74.css');
const textGuard = read('docs/scifi-ui/styles/formatx-responsive-text-guard-r72.css');
const premium = read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const stability = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const interactionStability = read('docs/scifi-ui/scripts/interaction-genome-export-stability.js');
const mobileRecovery = read('docs/scifi-ui/scripts/formatx-mobile-recovery.js');
const mobilePerfCss = read('docs/scifi-ui/styles/formatx-mobile-performance-r192.css');
const home = read('docs/scifi-ui/index.html');

// Existing native WebGL architecture remains the primary renderer.
assert.match(bootstrap, /responsive-cinematic-reference-v69-r99-luminous-interactive-r192-first-paint-budget/);
assert.match(bootstrap, /single-webgl-luminous-crystal-r99/);
assert.match(bootstrap, /formatx-award-material-r91\.css\?v=20260814-rayglass-r95/);
assert.match(bootstrap, /loading-v69/);

// r196: renderer starts immediately and waits for an actual painted-frame metric.
assert.match(wrapper, /formatx-core-mobile-reference-r99\.js\?v=20260817-r196-painted-frame/);
assert.match(wrapper, /critical-renderer-immediate-after-dom/);
assert.match(wrapper, /requestAnimationFrame\(loadRenderer\)/);
assert.match(wrapper, /setTimeout\(loadRenderer, 280\)/);
assert.match(wrapper, /fxCoreRenderMs/);
assert.doesNotMatch(wrapper, /requestIdleCallback/);

for (const token of [
  'reference-luminous-crystal-webgl-r99', 'webgl2', 'webgl', 'TRIANGLE_STRIP',
  'formatx:coreinteraction', 'formatx:real3dready', 'touchstart', 'touchmove', 'touchend',
  'ResizeObserver', 'IntersectionObserver', 'fxCoreRenderMs', 'fxCoreRenderAverageMs',
  'fxCoreReal3dFps', 'fxCoreRenderScale', 'corePosition', 'single-webgl-luminous-crystal-r99',
  'TARGET_FPS=60', 'r191-dynamic-resolution-hysteresis',
]) assert.ok(renderer.includes(token), `missing native renderer contract: ${token}`);
assert.doesNotMatch(renderer, /new\s+Image\s*\(|drawImage\s*\(|createImageBitmap\s*\(|three\.js|babylon|playcanvas|model-viewer|\bTHREE\./i);

// r196b watchdog: initialization alone is not success; one draw-frame metric is required.
for (const token of [
  'hasPaintedFrame', 'fxCoreRenderMs', 'early-r196b', 'first-painted-frame-deadline',
  'hard-deadline-3800ms', 'retryCount >= 2', 'fallback-ready-r196b',
  'fx-core-emergency-r195', 'renderer-network-error', 'bfcache-restore',
  'initialized-awaiting-painted-frame-r196b', 'fxCoreRecoveryStarted',
]) assert.ok(watchdog.includes(token), `missing r196 painted-frame recovery contract: ${token}`);
assert.match(watchdog, /setTimeout\(\(\) => \{[\s\S]*700\)/);
assert.match(watchdog, /setTimeout\(\(\) => \{[\s\S]*3800\)/);
assert.match(watchdog, /\n\s*start\(\);\s*\n\}\(\)\);\s*$/);
assert.doesNotMatch(watchdog, /\.style\.|setAttribute\(['"]style/i);

// CSS keeps a visible core before the first frame and makes the emergency renderer
// self-sufficient even if later deferred mobile layers never execute.
for (const token of [
  '.fx-core-emergency-r195', 'html.fx-core-fallback-r195', 'data-fx-core-render-ms',
  '.fx-core-mobile-v55-stage', '.fx-core-mobile-v55-canvas', '.hero-ring', 'clip-path:polygon',
]) assert.ok(fallbackCss.includes(token), `missing visible recovery CSS contract: ${token}`);

// Production homepage must bypass the r192 optimizer that caused partial hydration,
// while preserving the canonical content pipeline and injecting one early non-defer guard.
for (const token of [
  "import contentEntry from './production-content-entry.js';",
  'formatx-routing.internal',
  'serveReliableHomepage',
  'r196-reliable-full-hydration',
  'r196-bypass-homepage-optimizer',
  'data-fx-reliable-home-r196',
  'formatx-core-never-stuck-r195.css?v=20260817-r196-reliable-home',
  'formatx-core-never-stuck-r195.js?v=20260817-r196-reliable-home',
  'Content-Security-Policy',
]) assert.ok(productionRecovery.includes(token), `missing reliable homepage production contract: ${token}`);
assert.match(productionRecovery, /formatx-core-real3d-v20\.js\?v=20260817-r196-reliable-full-hydration/);
assert.doesNotMatch(productionRecovery, /const R196_SCRIPT = '<script defer/);
assert.match(productionRecovery, /contentEntry\.fetch\(new Request\(internalUrl, request\), env, ctx\)/);

// Existing mobile/reference contracts stay intact.
assert.match(mobileRecovery, /formatx-mobile-performance-r192\.css\?v=20260817-r192/);
assert.match(mobilePerfCss, /content-visibility:\s*auto/);
assert.match(mobilePerfCss, /\.fx-r179-field\s*\{[^}]*display:\s*none\s*!important/s);
assert.match(layout, /formatx-mobile-reference-layout-v1\.css\?v=/);
assert.match(layout, /formatx-flow-first-r74\.css\?v=/);
assert.match(layout, /if\(mobileViewport\(\)\).*formatx-flow-first-r74\.css/);
assert.match(layout, /else existingFlow\?\.remove\(\)/);
assert.match(layout, /mag-first-normal-flow-r74/);
assert.match(layout, /setPaused/);
assert.match(layout, /syncMenuState/);
assert.match(layout, /aria-pressed/);
assert.match(layout, /pointerup/);
assert.match(layout, /space\.after\(rail\)/);
assert.match(layout, /mobileViewport=.*max-width:900px/);
assert.match(layout, /restoreDesktopMenu/);
assert.match(css, /\.fx-reference-heading/);
assert.match(css, /\.fx-reference-proof/);
assert.match(flowCss, /position:relative!important/);
assert.doesNotMatch(flowCss, /position:sticky!important/);
assert.match(flowCss, /#hero \.hero-space/);
assert.match(flowCss, /#hero \.fx-reference-rail/);
assert.match(flowCss, /#fx-reference-legacy-menu/);
assert.match(textGuard, /white-space:\s*normal\s*!important/);
assert.match(premium, /ready-v20\|ready-v69/);
assert.match(loader, /ready-v20\|ready-v69/);
assert.match(stability, /ready-v20\|ready-v69/);
assert.match(interactionStability, /booting-v69/);
assert.ok(home.includes('formatx-core-real3d-v20.js'));
assert.match(home, /data-fx-mobile-reference-layout-style="true"[^>]+formatx-mobile-reference-layout-v1\.css\?v=/);
assert.match(home, /data-fx-flow-first-r74="true"[^>]+formatx-flow-first-r74\.css\?v=/);
assert.match(home, /data-fx-responsive-text-guard="true"[^>]+formatx-responsive-text-guard-r72\.css\?v=/);

for (const source of [bootstrap, wrapper, renderer, watchdog, layout, premium, loader, stability, interactionStability, mobileRecovery]) new Function(source);
console.log('PASS: r196 reliable-home + early painted-frame WebGL recovery contract passed.');

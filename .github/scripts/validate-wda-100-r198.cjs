/* FormatX Web Design Awards — r208 flicker-free canonical mobile-flow source contract. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));

const awardRuntime = read('docs/scifi-ui/scripts/formatx-award-runtime-r206.js');
const intro = read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const controls = read('docs/scifi-ui/scripts/formatx-wda-controls-r198.js');
const gpu = read('docs/scifi-ui/scripts/formatx-wda-gpu-r198.js');
const css = read('docs/scifi-ui/styles/formatx-wda-hardening-r198.css');
const firstPaint = read('docs/scifi-ui/styles/formatx-first-paint-r206.css');
const mobileLayoutCss = read('docs/scifi-ui/styles/formatx-mobile-layout-r207.css');
const mobileLayoutRuntime = read('docs/scifi-ui/scripts/formatx-mobile-layout-r207.js');
const legacyFlow = read('docs/scifi-ui/scripts/formatx-flow-first-r75.js');
const legacyFinalizer = read('docs/scifi-ui/scripts/formatx-mobile-ui-finalizer-r180.js');
const audio = read('docs/scifi-ui/scripts/formatx-audio-repair.js');
const production = read('billing-worker/src/production-content-entry.js');
const home = read('docs/scifi-ui/index.html');
const wrangler = JSON.parse(read('billing-worker/wrangler.jsonc'));
const desktop = JSON.parse(read('lighthouserc.live.json'));
const mobile = JSON.parse(read('lighthouserc.live.mobile.json'));

// UX / accessibility / explicit audio consent.
assert.match(home, /class="skip-link"[^>]+href="#main-content"/);
assert.match(home, /<main id="main-content">/);
assert.match(intro, /formatx-award-runtime-r206\.js\?v=20260818-r206-award-runtime/);
assert.doesNotMatch(intro, /\.style\.|setAttribute\(['"]style/i);
for (const token of [
  'formatx-wda-hardening-r198.css?v=20260818-r206-award-runtime',
  'formatx-wda-controls-r198.js?v=20260818-r206-award-runtime',
  'formatx-wda-gpu-r198.js?v=20260818-r206-post-painted-frame',
  'muted-default-visible-control',
  'audit-passive',
  'DOMContentLoaded',
  'data-fx-core-render-ms'
]) assert.ok(awardRuntime.includes(token), `missing active r206 award runtime contract: ${token}`);
for (const token of ['UNMUTE', 'MUTE', 'aria-pressed', 'professional-v6', 'muted-default', 'csp-safe-r198']) {
  assert.ok(controls.includes(token), `missing WDA sound contract: ${token}`);
}
for (const token of ['min-height: 48px', 'min-height: 44px', ':focus-visible', 'prefers-reduced-motion: reduce', 'prefers-contrast: more', 'forced-colors: active']) {
  assert.ok(css.includes(token), `missing inclusive CSS contract: ${token}`);
}
assert.match(audio, /let enabled = false/);
assert.match(audio, /sync\('off'\)/);

// Fail-open first paint: readable content and a MAG visual must not depend on WebGL.
for (const token of [
  'fail-open first-paint',
  'hero-space::before',
  'hero-copy > .hero-lead',
  'content-visibility: visible',
  'data-fx-core-mobile-r99="ready-v69"',
  'order: 2',
  'visibility: visible'
]) assert.ok(firstPaint.includes(token), `missing r206 first-paint contract: ${token}`);

// r208: exactly one mobile geometry owner. Controls and proof are normal-flow children.
for (const token of [
  'authoritative mobile layout ownership',
  '> .hero-grid > .fx-reference-controls-r204',
  'order: 1',
  'position: relative',
  'flex-direction: row',
  '> .hero-grid > .hero-copy',
  '> .hero-grid > .fx-reference-heading',
  '> .hero-grid > .fx-reference-proof',
  'min-height: 0',
  'fx-reference-liveos'
]) assert.ok(mobileLayoutCss.includes(token), `missing r208 mobile CSS contract: ${token}`);
for (const token of [
  'fxMobileLayoutOwner',
  'r207-normal-flow',
  'fx-reference-controls-r204',
  'zone.parentElement !== grid',
  'fxMobileLayoutConflict',
  'none-r207',
  'r208-inline-shield',
  'queueMicrotask',
  'clearLegacyInline',
  'relevantStyleMutation',
  "unique('.fx-reference-heading', hero)",
  "unique('.fx-reference-proof', hero)"
]) assert.ok(mobileLayoutRuntime.includes(token), `missing r208 DOM ownership contract: ${token}`);
assert.doesNotMatch(mobileLayoutRuntime, /\.style\.|setAttribute\(['"]style/i);
assert.doesNotMatch(mobileLayoutRuntime, /placeAfter\(/);
assert.doesNotMatch(mobileLayoutRuntime, /document\.head\.appendChild\(link\)|appendChild\(link\)/);
assert.doesNotMatch(mobileLayoutRuntime, /setTimeout\([^\n]*(?:450|1400)/);

// Legacy mobile engines may remain for compatibility, but r208 must make them no-op
// whenever the canonical r207 stylesheet/owner is present. This prevents CSS ↔ inline
// !important ping-pong at 120/700/1800/3200ms and 50..5200ms legacy timers.
for (const token of ['canonicalOwner', 'delegated-r208', 'fxFlowFirstConflict', 'disabled-r208']) {
  assert.ok(legacyFlow.includes(token), `legacy flow is not delegated under r208: ${token}`);
}
for (const token of ['canonicalOwner', 'delegated-r208', 'disabled-r208-no-ping-pong']) {
  assert.ok(legacyFinalizer.includes(token), `legacy finalizer is not delegated under r208: ${token}`);
}
assert.match(legacyFlow, /if\(canonicalOwner\(\)\)[\s\S]*return true;/);
assert.match(legacyFinalizer, /if\(canonicalOwner\(\)\)[\s\S]*return true;/);

// The production page must force fresh r208 asset URLs and a one-shot cache migration.
assert.match(production, /formatx-first-paint-r206\.css\?v=20260818-r206-stable-hero/);
assert.match(production, /formatx-mobile-reference-layout-v1\.js\?v=20260818-r208-first-paint-owner/);
assert.match(production, /formatx-mobile-layout-r207\.css\?v=20260818-r208-flicker-free/);
assert.match(production, /formatx-mobile-layout-r207\.js\?v=20260818-r208-flicker-free/);
assert.match(production, /STARTUP_REVISION = '20260818-r208-flicker-free-owner'/);
assert.match(production, /X-FormatX-Client-Revision', 'r208-flicker-free-owner/);
assert.match(production, /X-FormatX-Recovery', 'r208-static-cascade/);
assert.match(production, /fx_startup_r208=1/);
assert.match(production, /r208-one-shot-cleared/);

// Mobile performance: measured 60fps target, adaptive backing resolution and bounded scale.
for (const token of ['fxWdaTargetFps', '16.67', 'scale = 0.86', 'scale > 0.58', 'frameMs > 19.5', 'frameMs < 16.2', 'fxWdaRenderScale', 'drawingBufferWidth']) {
  assert.ok(gpu.includes(token), `missing adaptive GPU contract: ${token}`);
}
assert.doesNotMatch(gpu, /\.style\.|setAttribute\(['"]style/i);

// Stable production ownership: never re-enable the broken aggressive homepage optimizer.
assert.equal(wrangler.main, 'src/production-content-entry.js');

// Strategy/content proof stays public and crawlable.
for (const rel of [
  'docs/scifi-ui/method.html',
  'docs/scifi-ui/verification.html',
  'docs/scifi-ui/test-matrix.html',
  'docs/scifi-ui/known-issues.html',
  'docs/scifi-ui/security.html'
]) assert.ok(exists(rel), `missing public proof page: ${rel}`);

function validateLighthouse(config, label) {
  const collect = config.ci.collect;
  const assertions = config.ci.assert.assertions;
  assert.equal(collect.numberOfRuns, 3, `${label}: needs 3 runs`);
  assert.ok(collect.url.every(url => !url.includes('lighthouse=1')), `${label}: audit-only URL is forbidden`);
  assert.ok(!String(collect.settings.chromeFlags || '').includes('force-prefers-reduced-motion'), `${label}: forced reduced-motion is forbidden`);
  assert.ok(!('skipAudits' in collect.settings), `${label}: skipped audits are forbidden`);
  assert.equal(assertions['categories:performance'][1].minScore, 0.9, `${label}: performance floor`);
  assert.equal(assertions['categories:accessibility'][1].minScore, 1, `${label}: accessibility floor`);
  assert.equal(assertions['categories:best-practices'][1].minScore, 1, `${label}: best-practices floor`);
  assert.equal(assertions['categories:seo'][1].minScore, 1, `${label}: SEO floor`);
  assert.equal(assertions['first-contentful-paint'][1].maxNumericValue, 1800, `${label}: FCP budget`);
  assert.equal(assertions['largest-contentful-paint'][1].maxNumericValue, 2500, `${label}: LCP budget`);
  assert.equal(assertions['total-blocking-time'][1].maxNumericValue, 200, `${label}: TBT budget`);
  assert.equal(assertions['cumulative-layout-shift'][1].maxNumericValue, 0.1, `${label}: CLS budget`);
  assert.equal(assertions['server-response-time'][1].maxNumericValue, 600, `${label}: TTFB budget`);
}
validateLighthouse(desktop, 'desktop');
validateLighthouse(mobile, 'mobile');

for (const source of [awardRuntime, intro, controls, gpu, mobileLayoutRuntime, legacyFlow, legacyFinalizer]) new Function(source);
console.log('PASS: r208 flicker-free canonical mobile flow, cache migration, legacy delegation, award UX, audio, GPU and truthful Lighthouse contracts passed.');

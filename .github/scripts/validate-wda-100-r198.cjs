/* FormatX Web Design Awards — r263 truthful performance/control contract. */
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
const mobileReferenceRuntime = read('docs/scifi-ui/scripts/formatx-mobile-reference-layout-v1.js');
const referenceRuntime = read('docs/scifi-ui/scripts/formatx-reference-production-r244.js');
const referenceFinalizer = read('docs/scifi-ui/scripts/formatx-reference-finalizer-r143.js');
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
assert.match(intro, /formatx-award-runtime-r206\.js\?v=20260821-r263-canonical-controls/);
assert.doesNotMatch(intro, /\.style\.|setAttribute\(['"]style/i);
for (const token of [
  'formatx-wda-hardening-r198.css?v=20260821-r263-canonical-controls',
  'formatx-wda-controls-r198.js?v=20260821-r263-canonical-controls',
  'formatx-wda-gpu-r198.js?v=20260818-r206-post-painted-frame',
  'muted-default-visible-control',
  'audit-passive',
  'DOMContentLoaded',
  'data-fx-core-render-ms'
]) assert.ok(awardRuntime.includes(token), `missing active r263 award runtime contract: ${token}`);
for (const token of [
  'Unmute FormatX cinematic audio',
  'Mute FormatX cinematic audio',
  'aria-pressed',
  'professional-v6',
  'muted-default',
  'csp-safe-r260',
  'fx-wda-sound-icon',
  'canonicalizeReferenceControls',
  'fx-reference-controls-r263',
  'fx-reference-mag-text-r263',
  'fxReferenceControlLayout',
  'bootObserver',
  'data-fx-reference-production-r244'
]) assert.ok(controls.includes(token), `missing WDA sound/control contract: ${token}`);
assert.doesNotMatch(controls, /bodyObserver/);
for (const token of [
  'min-height: 48px',
  'min-height: 44px',
  ':focus-visible',
  'prefers-reduced-motion: reduce',
  'prefers-contrast: more',
  'forced-colors: active',
  'fx-reference-controls-r263',
  'grid-template-columns: repeat(3, 54px)',
  'grid-template-columns: repeat(3, 50px)',
  'display: contents',
  'fx-reference-mag-text-r263',
  'content: none !important'
]) assert.ok(css.includes(token), `missing inclusive/canonical CSS contract: ${token}`);
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

// r262: exactly one mobile physical owner, event-driven instead of hot DOM observers.
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
]) assert.ok(mobileLayoutCss.includes(token), `missing mobile CSS contract: ${token}`);
for (const token of [
  'fxMobileLayoutOwner',
  'r207-normal-flow',
  'fx-reference-controls-r204',
  'zone.parentElement !== grid',
  'fxMobileLayoutConflict',
  'none-r207',
  'r255-event-driven-inline-shield',
  'queueMicrotask',
  'clearLegacyInline',
  'bootObserver',
  'stopBootObserver',
  "unique('.fx-reference-heading', hero)",
  "unique('.fx-reference-proof', hero)"
]) assert.ok(mobileLayoutRuntime.includes(token), `missing event-driven DOM ownership contract: ${token}`);
assert.doesNotMatch(mobileLayoutRuntime, /relevantStyleMutation|observer\.observe\(document\.documentElement/);
assert.doesNotMatch(mobileLayoutRuntime, /\.style\.|setAttribute\(['"]style/i);
assert.doesNotMatch(mobileLayoutRuntime, /placeAfter\(/);
assert.doesNotMatch(mobileLayoutRuntime, /document\.head\.appendChild\(link\)|appendChild\(link\)/);
assert.doesNotMatch(mobileLayoutRuntime, /setTimeout\([^\n]*(?:450|1400)/);

// The mobile reference owner must keep SOUND | ASK | PAUSE under hero-grid and
// must not install steady-state document-wide layout/header observers.
for (const token of [
  'r260-r207-grid-owner',
  'ensureControlZone(hero,grid,rail)',
  'zone.parentElement!==grid',
  'syncPauseButtons',
  'bootObserver'
]) assert.ok(mobileReferenceRuntime.includes(token), `missing r260 mobile reference contract: ${token}`);
assert.doesNotMatch(mobileReferenceRuntime, /layoutObserver|headerObserver/);

// Production reference runtime owns both mobile and desktop three-button rows.
for (const token of [
  'SOUND | ASK | PAUSE',
  'applyControlLayout',
  "controls.prepend(sound)",
  "space.appendChild(nodes.controls)",
  "grid.appendChild(nodes.controls)",
  'event-driven-r207-owner-r260'
]) assert.ok(referenceRuntime.includes(token), `missing r260 reference control contract: ${token}`);
assert.match(referenceRuntime, /function ensureStyleLast\(\) \{\}/);

// Tail bridge is throttled and visibility-aware instead of a hot 60 FPS loop.
for (const token of ['FRAME_INTERVAL=1000/24', 'document.hidden', 'visibilitychange', 'retryBoot', 'ready-r252']) {
  assert.ok(referenceFinalizer.includes(token), `missing throttled reference finalizer contract: ${token}`);
}
assert.doesNotMatch(referenceFinalizer, /if\(\+\+bootTries<420\)schedule\(\)/);

// Legacy mobile engines may remain for compatibility, but the canonical r207
// owner makes them no-op and prevents CSS ↔ inline !important ping-pong.
for (const token of ['canonicalOwner', 'delegated-r208', 'fxFlowFirstConflict', 'disabled-r208']) {
  assert.ok(legacyFlow.includes(token), `legacy flow is not delegated under canonical owner: ${token}`);
}
for (const token of ['canonicalOwner', 'delegated-r208', 'disabled-r208-no-ping-pong']) {
  assert.ok(legacyFinalizer.includes(token), `legacy finalizer is not delegated under canonical owner: ${token}`);
}
assert.match(legacyFlow, /if\(canonicalOwner\(\)\)[\s\S]*return true;/);
assert.match(legacyFinalizer, /if\(canonicalOwner\(\)\)[\s\S]*return true;/);

// Current production Worker bootstrap/canonical ownership.
assert.match(production, /formatx-first-paint-r206\.css\?v=20260818-r206-stable-hero/);
assert.match(production, /formatx-mobile-reference-layout-v1\.js\?v=20260820-r248-reference-owner/);
assert.match(production, /formatx-mobile-layout-r207\.css\?v=20260818-r208-flicker-free/);
assert.match(production, /formatx-mobile-layout-r207\.js\?v=20260818-r208-flicker-free/);
assert.match(production, /STARTUP_REVISION = '20260818-r208-flicker-free-owner'/);
assert.match(production, /X-FormatX-Client-Revision', 'r208-flicker-free-owner/);
assert.match(production, /X-FormatX-Recovery', 'r243-language-canonical/);
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
  assert.ok(collect.url.every(url => !url.includes('lighthouse=1') && !url.includes('?live=')), `${label}: audit-only URL is forbidden`);
  assert.ok(!String(collect.settings.chromeFlags || '').includes('force-prefers-reduced-motion'), `${label}: forced reduced-motion is forbidden`);
  assert.ok(!('skipAudits' in collect.settings), `${label}: skipped audits are forbidden`);
  assert.equal(assertions['categories:performance'][1].minScore, 0.95, `${label}: performance floor`);
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

for (const source of [awardRuntime, intro, controls, gpu, mobileLayoutRuntime, mobileReferenceRuntime, referenceRuntime, referenceFinalizer, legacyFlow, legacyFinalizer]) new Function(source);
console.log('PASS: r263 canonical cross-device controls, event-driven mobile ownership, throttled reference rendering and truthful 0.95 Lighthouse hard gates passed.');

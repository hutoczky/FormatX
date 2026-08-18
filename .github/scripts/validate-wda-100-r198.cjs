/* FormatX Web Design Awards — r206.1 final 100-target source contract. */
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
assert.match(production, /formatx-first-paint-r206\.css\?v=20260818-r206-stable-hero/);
assert.match(production, /formatx-mobile-reference-layout-v1\.js\?v=20260818-r206-independent-layout/);
assert.match(production, /X-FormatX-Client-Revision', 'r206-fail-open/);

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

for (const source of [awardRuntime, intro, controls, gpu]) new Function(source);
console.log('PASS: r206.1 active award UX, audio, fail-open, GPU and truthful Lighthouse contracts passed.');

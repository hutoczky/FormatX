'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const ORIGIN = 'https://formatxsuite.com';
const WWW = 'https://www.formatxsuite.com';
const production = fs.readFileSync(path.join(ROOT, 'billing-worker/src/production-content-entry.js'), 'utf8');
const canonical = fs.readFileSync(path.join(ROOT, 'docs/scifi-ui/index.html'), 'utf8');
const criticalCore = fs.readFileSync(path.join(ROOT, 'docs/scifi-ui/styles/formatx-critical-core-r227.css'), 'utf8');

function sourceValue(pattern, label) {
  const match = production.match(pattern);
  assert.ok(match, `missing source contract ${label}`);
  return match[1];
}
function canonicalValue(pattern, label) {
  const match = canonical.match(pattern);
  assert.ok(match, `missing canonical source ${label}`);
  return match[1];
}
async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  return { response, text: await response.text() };
}
function resolveLiveAsset(html, baseUrl, pattern, expectedPath, label) {
  const value = html.match(pattern)?.[1] || '';
  assert.ok(value, `missing live ${label} URL`);
  const resolved = new URL(value, baseUrl);
  assert.equal(resolved.origin, ORIGIN, `${label} escaped canonical origin: ${resolved.href}`);
  assert.equal(resolved.pathname, expectedPath, `${label} resolved to ${resolved.pathname}`);
  return resolved.href;
}
function resolveMarkedScript(html, baseUrl, marker, expectedPath, label) {
  const tag = html.match(new RegExp(`<script\\b[^>]*${marker}=["']true["'][^>]*>`, 'i'))?.[0]
    || html.match(new RegExp(`<script\\b(?=[^>]*${marker}=["']true["'])[^>]*>`, 'i'))?.[0]
    || '';
  assert.ok(tag, `missing live ${label} script tag`);
  const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] || '';
  assert.ok(src, `missing live ${label} src`);
  const resolved = new URL(src, baseUrl);
  assert.equal(resolved.origin, ORIGIN, `${label} escaped canonical origin: ${resolved.href}`);
  assert.equal(resolved.pathname, expectedPath, `${label} resolved to ${resolved.pathname}`);
  return resolved.href;
}

(async () => {
  const firstFrame = sourceValue(/data-fx-first-frame-stability-([^=\"]+)=\"true\"/, 'first-frame marker');
  const p0Paint = sourceValue(/data-fx-p0-first-paint-([^=\"]+)=\"true\"/, 'P0 first-paint marker');
  const expectedEdgePrefix = sourceValue(/headers\.set\('X-FormatX-Edge-Stability', `([^`]+)`\)/, 'edge owner');
  const startup = sourceValue(/const STARTUP_REVISION = '([^']+)'/, 'startup revision');
  const expectedCssScheduler = sourceValue(/headers\.set\('X-FormatX-CSS-Scheduler', '([^']+)'\)/, 'CSS scheduler');
  const expectedMotionScheduler = sourceValue(/headers\.set\('X-FormatX-Motion-Scheduler', '([^']+)'\)/, 'motion scheduler');
  const expectedBase = canonicalValue(/<base\s+href=["']([^"']+)["']/, 'base href');
  const p0SchedulerPath = new URL(
    sourceValue(/const P0_MOTION_SCHEDULER = '([^']+)'/, 'P0 scheduler URL'),
    `${ORIGIN}/`,
  ).pathname;
  const canonicalBaseUrl = new URL(expectedBase, `${ORIGIN}/`);
  const canonicalFaviconPath = new URL(
    canonicalValue(/<link\b(?=[^>]*\brel=["']icon["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/i, 'favicon href'),
    canonicalBaseUrl,
  ).pathname;

  assert.ok(criticalCore.includes('BEGIN formatx-design-system.css'), 'critical-core lost embedded design system');
  assert.ok(criticalCore.includes('FormatX Design System 2.0'), 'embedded design system signature missing');

  const nonce = Date.now();
  const home = await fetchText(`${ORIGIN}/?apex_contract=${nonce}`, { headers: { 'Cache-Control': 'no-cache' } });
  const www = await fetch(`${WWW}/`, { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' } });
  const assets = {
    design: await fetchText(`${ORIGIN}/scifi-ui/styles/formatx-design-system.css?v=apex-${nonce}`),
    mobile: await fetchText(`${ORIGIN}/scifi-ui/styles/formatx-mobile-recovery.css?v=apex-${nonce}`),
    critical: await fetchText(`${ORIGIN}/scifi-ui/styles/formatx-critical-shell-v56.css?v=apex-${nonce}`),
    legacyCore: await fetchText(`${ORIGIN}/scifi-ui/scripts/formatx-core-real3d-v20.js?v=apex-${nonce}`),
  };
  const legacyIcon = await fetch(`${ORIGIN}/scifi-ui/assets/images/formatx-icon.png?v=apex-${nonce}`);
  const canonicalIcon = await fetch(`${ORIGIN}${canonicalFaviconPath}?v=apex-${nonce}`);

  assert.equal(home.response.status, 200, 'home status');
  assert.equal(www.status, 302, 'www redirect status');
  for (const [name, result] of Object.entries(assets)) assert.equal(result.response.status, 200, `${name} status`);
  assert.equal(legacyIcon.status, 200, 'legacy icon endpoint status');
  assert.equal(canonicalIcon.status, 200, 'canonical favicon status');

  assert.match(home.response.headers.get('content-type') || '', /text\/html/i);
  for (const name of ['design', 'mobile', 'critical']) {
    assert.match(assets[name].response.headers.get('content-type') || '', /text\/css/i, `${name} MIME`);
  }
  assert.match(assets.legacyCore.response.headers.get('content-type') || '', /(application|text)\/javascript/i);
  assert.match(legacyIcon.headers.get('content-type') || '', /image\/png/i);
  assert.match(canonicalIcon.headers.get('content-type') || '', /image\/png/i);

  const liveBase = home.text.match(/<base\s+href=["']([^"']+)["']/i)?.[1] || '';
  assert.equal(liveBase, expectedBase, `base href must match canonical source (${expectedBase})`);
  const baseUrl = new URL(liveBase, `${ORIGIN}/`);

  assert.equal(new URL('./project-simulator.html?lang=hu', baseUrl).pathname, '/scifi-ui/project-simulator.html');
  assert.equal(new URL('./checkout.html?plan=business_pro', baseUrl).pathname, '/scifi-ui/checkout.html');

  assert.ok(home.text.includes(`data-fx-first-frame-stability-${firstFrame}=\"true\"`), `missing live first-frame ${firstFrame}`);
  assert.ok(home.text.includes(`data-fx-p0-first-paint-${p0Paint}=\"true\"`), `missing live P0 first-paint ${p0Paint}`);

  const resolvedAssets = {
    critical: resolveLiveAsset(
      home.text, baseUrl,
      /<link\b[^>]*href=["']([^"']*formatx-critical-shell-v56\.css[^"']*)["'][^>]*>/i,
      '/scifi-ui/styles/formatx-critical-shell-v56.css', 'critical CSS',
    ),
    scheduler: resolveMarkedScript(
      home.text, baseUrl,
      'data-fx-p0-motion-scheduler-r490', p0SchedulerPath, 'P0 motion scheduler',
    ),
    favicon: resolveLiveAsset(
      home.text, baseUrl,
      /<link\b(?=[^>]*\brel=["']icon["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/i,
      canonicalFaviconPath, 'canonical favicon',
    ),
  };

  assert.ok(assets.design.text.includes('FormatX Design System 2.0'));
  assert.ok(assets.mobile.text.includes('FormatX living-core visibility and responsive layout recovery'));
  assert.ok(assets.critical.text.includes('FormatX critical shell v56'));
  assert.ok(assets.critical.text.includes('First-paint geometry lock r4'));
  assert.ok(assets.critical.text.includes('html.fx-intro-pending #formatx-event-horizon.fx-intro-overlay'));
  assert.ok(assets.critical.text.includes('display: none !important'));
  assert.match(assets.legacyCore.text.toLowerCase(), /formatx-core|fxcore/);

  assert.equal(
    home.response.headers.get('x-formatx-edge-stability'),
    `${expectedEdgePrefix.replace(':${STARTUP_REVISION}', '')}:${startup}`,
  );
  assert.equal(home.response.headers.get('x-formatx-css-scheduler'), expectedCssScheduler);
  assert.equal(home.response.headers.get('x-formatx-motion-scheduler'), expectedMotionScheduler);
  assert.equal(www.headers.get('location'), 'https://formatxsuite.com/?_fx_redirect_recovery=1');
  assert.match(www.headers.get('cache-control') || '', /no-store/i);

  console.log(JSON.stringify({
    status: 'PASS', firstFrame, p0Paint, expectedBase, startup,
    standaloneDesignAsset: `${ORIGIN}/scifi-ui/styles/formatx-design-system.css`,
    legacyCoreAsset: `${ORIGIN}/scifi-ui/scripts/formatx-core-real3d-v20.js`,
    legacyIconAsset: `${ORIGIN}/scifi-ui/assets/images/formatx-icon.png`,
    canonicalFaviconPath,
    resolvedAssets,
    edge: home.response.headers.get('x-formatx-edge-stability'),
    cssScheduler: expectedCssScheduler,
    motionScheduler: expectedMotionScheduler,
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});

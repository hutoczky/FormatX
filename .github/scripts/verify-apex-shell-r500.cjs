'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const ORIGIN = 'https://formatxsuite.com';
const WWW = 'https://www.formatxsuite.com';
const production = fs.readFileSync(path.join(ROOT, 'billing-worker/src/production-content-entry.js'), 'utf8');
const canonical = fs.readFileSync(path.join(ROOT, 'docs/scifi-ui/index.html'), 'utf8');

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

(async () => {
  const firstFrame = sourceValue(/data-fx-first-frame-stability-([^=\"]+)=\"true\"/, 'first-frame marker');
  const p0Paint = sourceValue(/data-fx-p0-first-paint-([^=\"]+)=\"true\"/, 'P0 first-paint marker');
  const expectedEdgePrefix = sourceValue(/headers\.set\('X-FormatX-Edge-Stability', `([^`]+)`\)/, 'edge owner');
  const startup = sourceValue(/const STARTUP_REVISION = '([^']+)'/, 'startup revision');
  const expectedCssScheduler = sourceValue(/headers\.set\('X-FormatX-CSS-Scheduler', '([^']+)'\)/, 'CSS scheduler');
  const expectedMotionScheduler = sourceValue(/headers\.set\('X-FormatX-Motion-Scheduler', '([^']+)'\)/, 'motion scheduler');
  const expectedBase = canonicalValue(/<base\s+href=["']([^"']+)["']/, 'base href');

  const nonce = Date.now();
  const home = await fetchText(`${ORIGIN}/?apex_contract=${nonce}`, { headers: { 'Cache-Control': 'no-cache' } });
  const www = await fetch(`${WWW}/`, { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' } });
  const assets = {
    design: await fetchText(`${ORIGIN}/scifi-ui/styles/formatx-design-system.css?v=apex-${nonce}`),
    mobile: await fetchText(`${ORIGIN}/scifi-ui/styles/formatx-mobile-recovery.css?v=apex-${nonce}`),
    critical: await fetchText(`${ORIGIN}/scifi-ui/styles/formatx-critical-shell-v56.css?v=apex-${nonce}`),
    core: await fetchText(`${ORIGIN}/scifi-ui/scripts/formatx-core-real3d-v20.js?v=apex-${nonce}`),
  };
  const icon = await fetch(`${ORIGIN}/scifi-ui/assets/images/formatx-icon.png?v=apex-${nonce}`);

  assert.equal(home.response.status, 200, 'home status');
  assert.equal(www.status, 302, 'www redirect status');
  for (const [name, result] of Object.entries(assets)) assert.equal(result.response.status, 200, `${name} status`);
  assert.equal(icon.status, 200, 'icon status');

  assert.match(home.response.headers.get('content-type') || '', /text\/html/i);
  for (const name of ['design', 'mobile', 'critical']) assert.match(assets[name].response.headers.get('content-type') || '', /text\/css/i, `${name} MIME`);
  assert.match(assets.core.response.headers.get('content-type') || '', /(application|text)\/javascript/i);
  assert.match(icon.headers.get('content-type') || '', /image\/png/i);

  const liveBase = home.text.match(/<base\s+href=["']([^"']+)["']/i)?.[1] || '';
  assert.equal(liveBase, expectedBase, `base href must match canonical source (${expectedBase})`);
  const baseUrl = new URL(liveBase, `${ORIGIN}/`);
  assert.equal(new URL('./project-simulator.html?lang=hu', baseUrl).pathname, '/scifi-ui/project-simulator.html');
  assert.equal(new URL('./checkout.html?plan=business_pro', baseUrl).pathname, '/scifi-ui/checkout.html');

  assert.ok(home.text.includes(`data-fx-first-frame-stability-${firstFrame}=\"true\"`), `missing live first-frame ${firstFrame}`);
  assert.ok(home.text.includes(`data-fx-p0-first-paint-${p0Paint}=\"true\"`), `missing live P0 first-paint ${p0Paint}`);
  assert.ok(home.text.includes('href="/scifi-ui/styles/formatx-design-system.css'));
  assert.ok(home.text.includes('href="/scifi-ui/styles/formatx-critical-shell-v56.css'));
  assert.ok(home.text.includes('src="/scifi-ui/scripts/formatx-core-real3d-v20.js'));
  assert.ok(home.text.includes('src="/scifi-ui/assets/images/formatx-icon.png'));
  assert.ok(!home.text.includes('href="./styles/formatx-design-system.css'));
  assert.ok(!home.text.includes('src="./scripts/formatx-core-real3d-v20.js'));
  assert.ok(!home.text.includes('src="./assets/images/formatx-icon.png'));

  assert.ok(assets.design.text.includes('FormatX Design System 2.0'));
  assert.ok(assets.mobile.text.includes('FormatX living-core visibility and responsive layout recovery'));
  assert.ok(assets.critical.text.includes('FormatX critical shell v56'));
  assert.ok(assets.critical.text.includes('First-paint geometry lock r4'));
  assert.ok(assets.critical.text.includes('html.fx-intro-pending #formatx-event-horizon.fx-intro-overlay'));
  assert.ok(assets.critical.text.includes('display: none !important'));
  assert.match(assets.core.text.toLowerCase(), /formatx-core|fxcore/);

  assert.equal(home.response.headers.get('x-formatx-edge-stability'), `${expectedEdgePrefix.replace(':${STARTUP_REVISION}', '')}:${startup}`);
  assert.equal(home.response.headers.get('x-formatx-css-scheduler'), expectedCssScheduler);
  assert.equal(home.response.headers.get('x-formatx-motion-scheduler'), expectedMotionScheduler);
  assert.equal(www.headers.get('location'), 'https://formatxsuite.com/?_fx_redirect_recovery=1');
  assert.match(www.headers.get('cache-control') || '', /no-store/i);

  console.log(JSON.stringify({
    status: 'PASS', firstFrame, p0Paint, expectedBase, startup,
    edge: home.response.headers.get('x-formatx-edge-stability'),
    cssScheduler: expectedCssScheduler,
    motionScheduler: expectedMotionScheduler,
  }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});

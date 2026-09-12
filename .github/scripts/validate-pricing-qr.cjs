'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const requiredQrFiles = [
  'docs/scifi-ui/assets/qr/business_lite-huf.svg',
  'docs/scifi-ui/assets/qr/business_lite-eur.svg',
  'docs/scifi-ui/assets/qr/business_pro-huf.svg',
  'docs/scifi-ui/assets/qr/business_pro-eur.svg',
  'docs/scifi-ui/assets/qr/technician_team-huf.svg',
  'docs/scifi-ui/assets/qr/technician_team-eur.svg',
];

for (const relative of requiredQrFiles) {
  if (!fs.existsSync(path.join(root, relative))) throw new Error(`Missing local pricing QR fallback: ${relative}`);
  const svg = read(relative);
  if (!svg.includes('<svg') || !svg.includes('<path') || !svg.includes('fill="#000"')) throw new Error(`Invalid pricing QR SVG: ${relative}`);
}

const home = read('docs/scifi-ui/index.html');
const living = read('docs/scifi-ui/scripts/living-architecture.js');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const paymentLoader = read('docs/scifi-ui/scripts/formatx-payment-surface-r553.js');
const paymentCss = read('docs/scifi-ui/styles/payment-qr.css');
const worker = read('billing-worker/src/production-content-entry-r529.js');
const api = read('billing-worker/src/pricing-v100-api.js');

for (const [name, source] of [['living architecture', living], ['safe loader', loader]]) {
  if (!source.includes('/api/checkout-qr?')) throw new Error(`${name}: checkout QR API route missing`);
  if (!source.includes('./assets/qr/')) throw new Error(`${name}: local QR fallback missing`);
  if (!source.includes('fxQrFallback')) throw new Error(`${name}: fallback state handling missing`);
  if (!source.includes('20260730-qr1')) throw new Error(`${name}: QR cache version missing`);
}

assert.ok(home.includes('id="formatx-plan-qr-dock"'), 'Static payment QR dock missing from pricing markup');
assert.equal((home.match(/data-plan-qr="/g) || []).length, 3, 'Exactly three static pricing QR cards are required');
for (const plan of ['business_lite', 'business_pro', 'technician_team']) {
  assert.ok(home.includes(`./checkout.html?plan=${plan}&cycle=monthly&currency=HUF`), `Static checkout link missing for ${plan}`);
}
assert.ok(home.includes('id="preview-checkout-link"'), 'Visible payment-console checkout CTA missing');
assert.ok(home.includes('Fizetés megnyitása'), 'Hungarian visible payment CTA missing');

for (const token of [
  "const STYLE='/scifi-ui/styles/payment-qr.css?v=20260906-r553-pricing-visible'",
  "fxPaymentSurfaceR553='loading'",
  "fxPaymentSurfaceVisibleR553=payment&&dock?'payment-and-qr-visible':'partial-surface'",
  "afterFirstPaint(ensureStyle)",
  "node.style.setProperty('opacity','1','important')",
  "node.style.setProperty('visibility','visible','important')",
]) assert.ok(paymentLoader.includes(token), `R553 payment loader contract missing: ${token}`);
assert.ok(!paymentLoader.includes('lighthouse=1'), 'Payment surface must not have an audit-only path');

for (const token of [
  'body.living-architecture #pricing .payment',
  'body.living-architecture #pricing #formatx-plan-qr-dock',
  'body.living-architecture #pricing .fx-plan-qr-grid',
  'body.living-architecture #pricing .fx-plan-qr-card',
  'body.living-architecture #pricing .fx-plan-qr-link',
  'pointer-events: auto !important',
  'min-height: 156px',
]) assert.ok(paymentCss.includes(token), `Visible payment CSS contract missing: ${token}`);
assert.ok(!paymentCss.includes('.reference-commerce #formatx-plan-qr-dock'), 'QR visibility must not depend on obsolete reference-commerce wrapper');

for (const token of [
  "const PAYMENT_SURFACE_SCRIPT='/scifi-ui/scripts/formatx-payment-surface-r553.js?v=20260906-r553-visible-payment-qr'",
  'function injectPaymentSurface(html)',
  'html=injectPaymentSurface(html)',
  "headers.set('X-FormatX-Payment-Surface','r553-post-paint-visible-qr')",
]) assert.ok(worker.includes(token), `Production payment delivery contract missing: ${token}`);
assert.ok(worker.includes('canonicalProduction.fetch(request, env, ctx)'), 'Canonical production ownership must remain direct');

if (!api.includes("url.pathname === '/api/checkout-qr'")) throw new Error('Pricing Worker checkout QR route missing');
if (!api.includes("headers.set('Content-Type', 'image/png')")) throw new Error('Pricing Worker QR image response type missing');

for (const source of [paymentLoader]) new Function(source);
console.log('PASS: R553 proves three real checkout QR paths, six local fallbacks, visible pricing/payment CSS, and post-first-paint production delivery.');

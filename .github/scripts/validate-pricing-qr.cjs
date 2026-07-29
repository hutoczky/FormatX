'use strict';

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
  if (!fs.existsSync(path.join(root, relative))) {
    throw new Error(`Missing local pricing QR fallback: ${relative}`);
  }
  const svg = read(relative);
  if (!svg.includes('<svg') || !svg.includes('<path') || !svg.includes('fill="#000"')) {
    throw new Error(`Invalid pricing QR SVG: ${relative}`);
  }
}

const living = read('docs/scifi-ui/scripts/living-architecture.js');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const api = read('billing-worker/src/pricing-v100-api.js');

for (const [name, source] of [['living architecture', living], ['safe loader', loader]]) {
  if (!source.includes('/api/checkout-qr?')) throw new Error(`${name}: checkout QR API route missing`);
  if (!source.includes('./assets/qr/')) throw new Error(`${name}: local QR fallback missing`);
  if (!source.includes('fxQrFallback')) throw new Error(`${name}: fallback state handling missing`);
  if (!source.includes('20260730-qr1')) throw new Error(`${name}: QR cache version missing`);
}

if (!api.includes("url.pathname === '/api/checkout-qr'")) {
  throw new Error('Pricing Worker checkout QR route missing');
}
if (!api.includes("headers.set('Content-Type', 'image/png')")) {
  throw new Error('Pricing Worker QR image response type missing');
}

console.log('PASS: pricing QR API delivery and six local HUF/EUR fallbacks are present.');

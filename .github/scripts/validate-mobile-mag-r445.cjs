'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const optics = read('docs/scifi-ui/styles/formatx-mobile-mag-balance-r447.css');
const loader = read('docs/scifi-ui/scripts/formatx-mag-surface-sheen-r439.js');

const compact = optics.replace(/\s+/g, '');
for (const token of [
  'production-r447-mobile-mag-gentle-glow-soft-perimeter',
  'opacity:.91!important',
  'scale:.80.84!important',
  'brightness(1.05)',
  'contrast(.71)',
  'saturate(.98)',
  'blur(.60px)',
  'opacity:.92!important',
  'scale:.78.82!important',
  'brightness(1.06)',
  'contrast(.69)',
  'blur(.68px)',
  '.fx-crystal-cue-r318{display:none!important',
  '.skip-link:focus-visible{position:fixed!important'
]) assert.ok(compact.includes(token.replace(/\s+/g, '')), `missing r447 mobile MAG refinement token: ${token}`);

assert.match(loader, /formatx-mobile-mag-balance-r447\.css\?v=20260830-r447-gentle-glow-soft-perimeter/);
assert.match(loader, /data-fx-mobile-mag-balance-r447/);
assert.match(loader, /fxMobileMagBalanceR447/);
assert.match(loader, /superseded-r447/);
assert.doesNotMatch(optics, /scale:\s*\.99/i, 'r447 must preserve the compact mobile MAG scale');
assert.doesNotMatch(optics, /brightness\(1\.(?:1[0-9]|[2-9][0-9])\)/i, 'r447 must not restore the over-bright mobile optics');
new Function(loader);
console.log('PASS: r447 preserves compact phone scale while reducing outer glow and softening the mobile MAG perimeter.');

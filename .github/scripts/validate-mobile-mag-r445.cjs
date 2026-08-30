'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const optics = read('docs/scifi-ui/styles/formatx-mobile-mag-balance-r446.css');
const loader = read('docs/scifi-ui/scripts/formatx-mag-surface-sheen-r439.js');

const compact = optics.replace(/\s+/g, '');
for (const token of [
  'production-r446-mobile-mag-compact-balanced-soft-perimeter',
  'opacity:.93!important',
  'scale:.80.84!important',
  'brightness(1.11)',
  'contrast(.79)',
  'saturate(1.02)',
  'blur(.42px)',
  'opacity:.94!important',
  'scale:.78.82!important',
  'brightness(1.13)',
  'contrast(.77)',
  'blur(.52px)',
  '.fx-crystal-cue-r318{display:none!important',
  '.skip-link:focus-visible{position:fixed!important'
]) assert.ok(compact.includes(token.replace(/\s+/g, '')), `missing r446 mobile MAG correction token: ${token}`);

assert.match(loader, /formatx-mobile-mag-balance-r446\.css\?v=20260830-r446-compact-balanced-soft-perimeter/);
assert.match(loader, /data-fx-mobile-mag-balance-r446/);
assert.match(loader, /fxMobileMagBalanceR446/);
assert.match(loader, /superseded-r446/);
assert.doesNotMatch(optics, /scale:\s*\.99/i, 'r446 must not restore near-full-canvas mobile scale');
assert.doesNotMatch(optics, /brightness\(1\.(?:2[0-9]|[3-9][0-9])\)/i, 'r446 must not restore r445 over-bright mobile optics');
new Function(loader);
console.log('PASS: r446 restores compact phone MAG scale, moderate body luminance, soft perimeter, and removes duplicate mobile visual clutter.');

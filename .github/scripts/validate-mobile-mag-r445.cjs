'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const optics = read('docs/scifi-ui/styles/formatx-mobile-mag-balance-r448.css');
const loader = read('docs/scifi-ui/scripts/formatx-mag-surface-sheen-r439.js');

const compact = optics.replace(/\s+/g, '');
for (const token of [
  'production-r448-mobile-mag-visible-balanced-soft-defined-perimeter',
  'opacity:.94!important',
  'scale:.80.84!important',
  'brightness(1.10)',
  'contrast(.75)',
  'saturate(1.01)',
  'blur(.54px)',
  'opacity:.95!important',
  'scale:.78.82!important',
  'brightness(1.11)',
  'contrast(.74)',
  'blur(.58px)',
  '.fx-crystal-cue-r318{display:none!important',
  '.skip-link:focus-visible{position:fixed!important'
]) assert.ok(compact.includes(token.replace(/\s+/g, '')), `missing r448 mobile MAG correction token: ${token}`);

assert.match(loader, /formatx-mobile-mag-balance-r448\.css\?v=20260830-r448-visible-balanced-soft-defined/);
assert.match(loader, /data-fx-mobile-mag-balance-r448/);
assert.match(loader, /fxMobileMagBalanceR448/);
assert.match(loader, /superseded-r448/);
assert.match(loader, /formatx-mobile-mag-balance-r447\.css\?v=20260830-r447-gentle-glow-soft-perimeter/);
assert.doesNotMatch(optics, /scale:\s*\.99/i, 'r448 must preserve the compact mobile MAG scale');
assert.doesNotMatch(optics, /brightness\(1\.(?:2[0-9]|[3-9][0-9])\)/i, 'r448 must not return to the r445 over-bright optics');
assert.doesNotMatch(optics, /contrast\((?:\.9[0-9]|1(?:\.\d+)?)\)/i, 'r448 must keep perimeter contrast below the razor-edge range');
new Function(loader);
console.log('PASS: r448 restores phone MAG body visibility and facet definition while preserving compact scale and a softened perimeter.');

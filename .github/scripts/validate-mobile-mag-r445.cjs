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
  'production-r448-r449-mobile-mag-midlight-visible-soft-perimeter',
  'opacity:.965!important',
  'scale:.80.84!important',
  'brightness(1.16)',
  'contrast(.78)',
  'saturate(1.02)',
  'blur(.56px)',
  'opacity:.97!important',
  'scale:.78.82!important',
  'brightness(1.18)',
  'contrast(.76)',
  'saturate(1.025)',
  'blur(.60px)',
  '.fx-crystal-cue-r318{display:none!important',
  '.skip-link:focus-visible{position:fixed!important'
]) assert.ok(compact.includes(token.replace(/\s+/g, '')), `missing r448/r449 mobile MAG correction token: ${token}`);

assert.match(loader, /formatx-mobile-mag-balance-r448\.css\?v=20260830-r448-visible-balanced-soft-defined-r449-midlight/);
assert.match(loader, /data-fx-mobile-mag-balance-r448/);
assert.match(loader, /fxMobileMagBalanceR448/);
assert.match(loader, /superseded-r448/);
assert.match(loader, /formatx-mobile-mag-balance-r447\.css\?v=20260830-r447-gentle-glow-soft-perimeter/);
assert.doesNotMatch(optics, /scale:\s*\.99/i, 'r448/r449 must preserve the compact mobile MAG scale');
assert.doesNotMatch(optics, /brightness\(1\.(?:2[0-9]|[3-9][0-9])\)/i, 'r448/r449 must not return to the r445 over-bright optics');
assert.doesNotMatch(optics, /contrast\((?:\.9[0-9]|1(?:\.\d+)?)\)/i, 'r448/r449 must keep perimeter contrast below the razor-edge range');
new Function(loader);
console.log('PASS: r448/r449 restores mobile MAG centre/body visibility while keeping compact geometry and a softened perimeter.');

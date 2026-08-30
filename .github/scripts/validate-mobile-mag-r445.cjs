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
  'production-r448-r451-mobile-mag-balanced-body-restrained-halo-soft-edge',
  'opacity:.95!important',
  'scale:.80.84!important',
  'brightness(1.13)',
  'contrast(.72)',
  'saturate(1.00)',
  'blur(.62px)',
  'opacity:.96!important',
  'scale:.78.82!important',
  'brightness(1.15)',
  'contrast(.71)',
  'saturate(1.005)',
  'blur(.66px)',
  'background-size:24%92%!important',
  'rgba(245,253,255,.070)',
  '.fx-crystal-cue-r318{display:none!important',
  '.skip-link:focus-visible{position:fixed!important'
]) assert.ok(compact.includes(token.replace(/\s+/g, '')), `missing r448/r451 mobile MAG correction token: ${token}`);

assert.match(loader, /formatx-mobile-mag-balance-r448\.css\?v=20260830-r451-balanced-body-restrained-halo-soft-edge/);
assert.match(loader, /root\.dataset\.fxMobileMagBalanceR451=state/);
assert.match(loader, /link\.dataset\.fxMobileMagBalanceR451='true'/);
assert.match(loader, /root\.dataset\.fxMobileMagBalanceR448=state/);
assert.match(loader, /link\.dataset\.fxMobileMagBalanceR448='true'/);
assert.match(loader, /fxMobileMagBalanceR450='superseded-r451'/);
assert.doesNotMatch(optics, /scale:\s*\.99/i, 'r451 must preserve the compact mobile MAG scale');
assert.doesNotMatch(optics, /brightness\(1\.(?:1[6-9]|[2-9][0-9])\)/i, 'r451 must not return to the over-bright phone optics');
assert.doesNotMatch(optics, /contrast\((?:\.7[7-9]|\.[89][0-9]|1(?:\.\d+)?)\)/i, 'r451 must stay below the previous hard-edge contrast range');
assert.doesNotMatch(optics, /rgba\(245,253,255,\.(?:1[0-9]{2}|[2-9][0-9]{2})\)/i, 'r451 surface sheen must stay below broad high-energy highlight levels');
new Function(loader);
console.log('PASS: r448/r451 restores mobile MAG body readability while retaining restrained halo and a soft natural perimeter.');

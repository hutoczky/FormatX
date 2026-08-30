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
  'production-r448-r450-mobile-mag-restrained-halo-soft-natural-perimeter',
  'opacity:.925!important',
  'scale:.80.84!important',
  'brightness(1.08)',
  'contrast(.68)',
  'saturate(.985)',
  'blur(.44px)',
  'opacity:.935!important',
  'scale:.78.82!important',
  'brightness(1.10)',
  'contrast(.66)',
  'saturate(.99)',
  'blur(.48px)',
  'background-size:24%92%!important',
  'rgba(245,253,255,.070)',
  '.fx-crystal-cue-r318{display:none!important',
  '.skip-link:focus-visible{position:fixed!important'
]) assert.ok(compact.includes(token.replace(/\s+/g, '')), `missing r448/r450 mobile MAG correction token: ${token}`);

assert.match(loader, /formatx-mobile-mag-balance-r448\.css\?v=20260830-r450-restrained-halo-soft-natural-perimeter/);
assert.match(loader, /data-fx-mobile-mag-balance-r450/);
assert.match(loader, /fxMobileMagBalanceR450/);
assert.match(loader, /data-fx-mobile-mag-balance-r448/);
assert.match(loader, /fxMobileMagBalanceR448/);
assert.match(loader, /superseded-r448/);
assert.match(loader, /formatx-mobile-mag-balance-r447\.css\?v=20260830-r447-gentle-glow-soft-perimeter/);
assert.doesNotMatch(optics, /scale:\s*\.99/i, 'r448/r450 must preserve the compact mobile MAG scale');
assert.doesNotMatch(optics, /brightness\(1\.(?:1[5-9]|[2-9][0-9])\)/i, 'r450 must not return to the over-bright phone optics');
assert.doesNotMatch(optics, /contrast\((?:\.7[5-9]|\.[89][0-9]|1(?:\.\d+)?)\)/i, 'r450 must keep perimeter contrast below the hard-edge range');
assert.doesNotMatch(optics, /rgba\(245,253,255,\.(?:1[0-9]{2}|[2-9][0-9]{2})\)/i, 'r450 surface sheen must stay below broad high-energy highlight levels');
new Function(loader);
console.log('PASS: r448/r450 keeps the mobile MAG readable while restraining the halo and softening the perceived perimeter.');

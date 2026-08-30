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
  'production-r448-r452-mobile-mag-softer-light-natural-edge',
  'opacity:.915!important',
  'scale:.80.84!important',
  'brightness(1.015)',
  'contrast(.61)',
  'saturate(.955)',
  'blur(.94px)',
  'opacity:.92!important',
  'scale:.78.82!important',
  'brightness(1.025)',
  'contrast(.59)',
  'saturate(.96)',
  'blur(1.02px)',
  'background-size:20%86%!important',
  'rgba(245,253,255,.026)',
  '.fx-crystal-cue-r318{display:none!important',
  '.skip-link:focus-visible{position:fixed!important'
]) assert.ok(compact.includes(token.replace(/\s+/g, '')), `missing r448/r452 mobile MAG correction token: ${token}`);

assert.match(loader, /formatx-mobile-mag-balance-r448\.css\?v=20260830-r452-softer-light-natural-edge/);
assert.match(loader, /root\.dataset\.fxMobileMagBalanceR452=state/);
assert.match(loader, /link\.dataset\.fxMobileMagBalanceR452='true'/);
assert.match(loader, /root\.dataset\.fxMobileMagBalanceR448=state/);
assert.match(loader, /link\.dataset\.fxMobileMagBalanceR448='true'/);
assert.match(loader, /fxMobileMagBalanceR451='superseded-r452'/);
assert.match(loader, /currentHref\.includes\('r452-softer-light-natural-edge'\)/, 'r452 loader must reject a stale in-page r451 stylesheet');

assert.doesNotMatch(optics, /brightness\(1\.(?:0[3-9]|[1-9][0-9])\)/i, 'r452 must keep post-composite brightness at or below the softened phone range');
assert.doesNotMatch(optics, /contrast\((?:\.6[2-9]|\.[7-9][0-9]|1(?:\.\d+)?)\)/i, 'r452 must not restore the hard mobile perimeter contrast');
assert.doesNotMatch(optics, /rgba\(245,253,255,\.(?:0(?:3[0-9]|[4-9][0-9])|[1-9][0-9]{2})\)/i, 'r452 surface sheen must not restore the hot white centre flare');
assert.doesNotMatch(optics, /drop-shadow\([^\n]*rgba\([^\)]*,\.(?:01[1-9]|0[2-9]|[1-9][0-9]*)\)\)/i, 'r452 external glow must remain near-zero');

new Function(loader);
console.log('PASS: r448/r452 materially lowers mobile MAG centre flare and softens the perimeter while preserving compact readable crystal geometry.');

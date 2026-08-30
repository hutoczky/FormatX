'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const optics = read('docs/scifi-ui/styles/formatx-mobile-mag-balance-r445.css');
const loader = read('docs/scifi-ui/scripts/formatx-mag-surface-sheen-r439.js');

const compact = optics.replace(/\s+/g, '');
for (const token of [
  'production-r445-mobile-mag-readable-bright-midtones-soft-edge-no-blur',
  'opacity:.995!important',
  'brightness(1.20)',
  'contrast(.92)',
  'saturate(1.085)',
  'opacity:1!important',
  'brightness(1.24)',
  'contrast(.91)',
  'saturate(1.10)'
]) assert.ok(compact.includes(token.replace(/\s+/g, '')), `missing r445 mobile MAG optics token: ${token}`);

assert.doesNotMatch(optics, /blur\(|radial-gradient|conic-gradient/i, 'r445 must brighten mid-tones without blur or duplicate silhouette');
assert.match(loader, /formatx-mobile-mag-balance-r445\.css\?v=20260830-r445-readable-bright-midtones-soft-edge/);
assert.match(loader, /data-fx-mobile-mag-balance-r445/);
assert.match(loader, /fxMobileMagBalanceR445/);
assert.match(loader, /superseded-r445/);
new Function(loader);
console.log('PASS: r445 increases phone MAG body luminance while keeping sub-neutral contrast, tiny restrained glow and a single native WebGL silhouette.');

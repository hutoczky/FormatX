'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const wrapper=read('docs/scifi-ui/scripts/formatx-core-mobile-v55.js');
const css=read('docs/scifi-ui/styles/formatx-mobile-r416-stability.css');
assert.match(wrapper,/r417-balanced-soft-mag-header-repair/);
assert.match(wrapper,/formatx-mobile-r416-stability\.css\?v=20260828-r417-balanced-soft-mag-header-repair/);
for(const token of [
  'production-r417-mobile-header-and-balanced-mag-optics',
  'opacity:.86 !important',
  'brightness(.86) contrast(.62) saturate(.80) blur(.72px)',
  'top:-160px !important',
  '.topbar:not(:has(.brand))',
  '.topbar:has(.brand)',
  'min-height:72px !important'
]) assert.ok(css.includes(token),`missing r417 mobile repair contract: ${token}`);
assert.doesNotMatch(css,/brightness\(\.5[0-9]\) contrast\(\.2[0-9]\)/);
console.log('PASS: r417 mobile header, skip-link and balanced MAG optics contract is present.');

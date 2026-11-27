'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const desktop=read('docs/scifi-ui/styles/formatx-p0-first-paint-r490.css').split('/* R2294')[1];
const mobile=read('docs/scifi-ui/styles/formatx-mobile-first-paint-r358.css').split('/* R2294')[1];
assert.ok(desktop&&mobile);
assert.ok(desktop.includes('position:relative!important')&&desktop.includes('height:76px!important'));
assert.ok(mobile.includes('font-family:ui-sans-serif,system-ui')&&mobile.includes('line-height:.94!important'));
for(const css of [desktop,mobile])assert.ok(css.includes(':not([data-fx-archive-cinema="active"])'));
for(const p of ['docs/scifi-ui/index.html','billing-worker/src/production-content-entry.js']){
 const s=read(p);
 assert.ok(s.includes('20261127-r2294-header-flow-lock')&&s.includes('20261127-r2294-mobile-title-first-paint'));
}
console.log('R2294 first-paint layout source contract: PASS');

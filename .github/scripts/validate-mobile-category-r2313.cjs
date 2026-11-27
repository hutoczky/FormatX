'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-mobile-first-paint-r358.css','utf8');
const rule=css.slice(css.indexOf('/* R2313:'));
assert.ok(rule.includes(':not([data-fx-archive-cinema="active"])'));
for(const value of ['min-height:131px!important','font-family:ui-sans-serif,system-ui','content-visibility:visible!important','line-height:1.5!important','animation:none!important','transition:none!important','color:#c9dbe5!important'])assert.ok(rule.includes(value),value);
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const links=html.match(/<link[^>]*formatx-mobile-first-paint-r358\.css[^>]*>/g);
assert.ok(links.length>=2);
for(const link of links){assert.ok(link.includes('20261127-r2294-mobile-title-first-paint-r2313-category'));assert.ok(link.includes('media="(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)"'));}
assert.ok(worker.includes('20261127-r2294-mobile-title-first-paint-r2313-category'));assert.ok(worker.includes('media="(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)"'));
assert.ok(html.includes('<p class="fx-category-definition"><strong>'));
console.log('R2313 mobile category first-paint source contract: PASS');

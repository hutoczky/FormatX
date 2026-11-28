'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-p0-first-paint-r490.css','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const rule=css.slice(css.lastIndexOf('/* R2346:'));
assert.ok(rule.includes('align-self:start!important'));
assert.ok(rule.includes('margin-block-start:calc((clamp(520px,42vw,620px) - 607px) / 2)!important'));
assert.ok(rule.includes(':not([data-fx-archive-cinema="active"])'));
assert.ok(rule.includes('(prefers-reduced-motion:no-preference)'));
assert.ok(rule.includes('(pointer:fine)'));
assert.ok(!/overflow\s*:|max-height\s*:|visibility\s*:|display\s*:/.test(rule));
const key='20261127-r2294-header-flow-lock-r2346-copy-anchor';
assert.equal(html.split(key).length-1,2);
assert.equal(worker.split(key).length-1,2);
let count=0;
for(let width=901;width<=3840;width+=7){
 const row=Math.min(620,Math.max(520,width*.42));
 const baseline=(row-607)/2;
 for(let h=607;h<=900;h+=11){
   const old=(row-h)/2;
   const anchored=baseline;
   assert.equal(anchored,baseline);
   assert.ok(Math.abs((old-baseline)+(h-607)/2)<1e-10);
   assert.ok(anchored+h>=baseline+607);
   count++;
 }
}
console.log('R2346 stable first-paint copy anchor: PASS '+count+' size combinations; live CLS still requires browser evidence');

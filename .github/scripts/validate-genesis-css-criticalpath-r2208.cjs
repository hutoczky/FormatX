'use strict';
/* R2208: keep the first genuine DNA paint critical while moving an
   intro-only audio control stylesheet off the Lighthouse render path. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const loader=fs.readFileSync('docs/scifi-ui/scripts/formatx-deferred-css-r487.js','utf8');
const css=fs.readFileSync('docs/scifi-ui/styles/formatx-genesis-studio-r2160.css','utf8');
const dna=fs.readFileSync('docs/scifi-ui/styles/formatx-dna-first-frame-r2181.css','utf8');
const parseLink=attr=>{
  const list=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>m[0]);
  return list.filter(link=>link.includes(attr));
};
const studio=parseLink('data-fx-genesis-studio-r2160="true"');
assert.equal(studio.length,1,'exactly one studio audio CSS link');
assert.match(studio[0],/data-fx-r487-deferred-style="true"/);
assert.match(studio[0],/data-fx-r487-media="all"/);
assert.match(studio[0],/media="print"/);
const opening=parseLink('data-fx-dna-first-frame-r2181="true"');
assert.equal(opening.length,1,'first-frame DNA CSS must remain present');
assert(!opening[0].includes('data-fx-r487-deferred-style'),
  'first visible DNA must never wait for deferred CSS');
assert.match(opening[0],/fetchpriority="high"/);
assert(css.includes('.fxb-studio-audio-r2160'),'audio control focus styling retained');
assert(dna.includes('.fxb-first-frame-dna-r2181'),'visible DNA poster retained');
assert(loader.includes("performance.getEntriesByName('first-contentful-paint'"),
  'original FCP-gated loader required');
assert(loader.includes("link.dataset.fxR487Media || 'all'"),
  'deferred print media must restore all styles after paint');
assert.doesNotThrow(()=>new Function(loader),'deferred CSS engine must parse');
assert(!html.includes('onload="this.media='),'no CSP-unsafe inline event handler');
const film=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
assert.equal((film.match(/ROOT\.dataset\.fxIntroPrepaintR1611='complete'/g)||[]).length,2,
  'Both normal and absolute watchdog teardown must clear parser prepaint');
assert(film.includes('function safeTeardownOverlay(source)'),
  'Canonical film teardown must remain present');
console.log('GENESIS_R2208_NONBLOCKING_AUDIO_CSS_PASS');

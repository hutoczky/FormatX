/* R2330: desktop first-paint controls must stay synchronous while
   below-the-fold reveal/flow observers start in separate macrotasks.
   Runtime Lighthouse and page semantics remain authoritative. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-apex.js','utf8');
const start=src.indexOf('  function initialise() {');
const end=src.indexOf("\n  if (document.readyState === 'loading')",start);
assert.ok(start>=0&&end>start,'APEX initialisation must exist');
const block=src.slice(start,end);
for(const critical of [
  'navigation();','applyLanguage(language, false);','scenes();',
  'latestRelease();','setScene(activeScene);',
  "dispatchEvent(new CustomEvent('formatx:apexready'"
])assert.ok(block.includes(critical),'Missing immediate APEX control: '+critical);
assert.ok(block.indexOf('reveal();')>block.indexOf("dispatchEvent(new CustomEvent('formatx:apexready'"));
assert.ok(block.indexOf('flow();')>block.indexOf('reveal();'));
assert.match(block,/setTimeout\(\(\)=>\{/);
assert.match(block,/\},48\)/);
assert.match(block,/\},116\)/);
assert.match(block,/addEventListener\('pagehide'/);
assert.doesNotMatch(block,/requestAnimationFrame\(/);
assert.equal((block.match(/updatePrice\(\);/g)||[]).length,0,
  'applyLanguage already initializes the price, avoid redundant writes');
console.log('R2330_DESKTOP_FIRST_PAINT_DEFERRED_OBSERVER_CONTRACT_PASS');

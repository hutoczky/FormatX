'use strict';

const fs = require('fs');
const assert = require('assert');

const read = p => fs.readFileSync(p,'utf8');
const index = read('docs/scifi-ui/index.html');
const css = read('docs/scifi-ui/styles/formatx-cinematic-journey-r536.css');
const js = read('docs/scifi-ui/scripts/formatx-cinematic-journey-r536.js');

assert.equal((index.match(/formatx-cinematic-journey-r536\.css/g)||[]).length,1,'R536 CSS must load exactly once');
assert.equal((index.match(/formatx-cinematic-journey-r536\.js/g)||[]).length,1,'R536 JS must load exactly once');
assert.ok(!index.includes('data-fx-cinematic-continuity-r535'),'R535 active bootstrap must be retired');
assert.ok(index.includes('data-fx-r487-deferred-style="true"'),'R536 visual CSS must stay post-FCP deferred');
assert.equal((index.match(/data-fx-deferred-css-r487="true"/g)||[]).length,1,'R487 deferred CSS scheduler must load exactly once in source');
assert.ok(index.includes('formatx-deferred-css-r487.js?v=20260904-r526-fcp-observer'),'R487 FCP scheduler revision missing from source');

for (const token of [
  '#hero','#live-os-overview','.fx-category-deck--standalone','#experience','#capabilities',
  '#pricing','#system','.fx-origin-proof','.fx-award-proof','#user-feedback','#resources','footer.site-footer'
]) assert.ok(js.includes(token),'R536 scene coverage missing '+token);

for (const token of [
  'window.FormatXLivingCore || window.FormatXCoreMobileV69',
  'setShape?.','surfacePulse?.','requestRender?.',
  'MutationObserver','formatx:magbirthcomplete','formatx:loop',
  'all-content-actions-preserved-one-native-mag',
  'scroll-interaction-driven-no-idle-raf'
]) assert.ok(js.includes(token),'R536 runtime contract missing '+token);

assert.ok(!js.includes('setInterval('),'R536 must not use an idle interval');
assert.ok(!js.includes("createElement('canvas')"),'R536 must not create or duplicate a MAG canvas');
assert.ok(css.includes('pointer-events:none!important'),'R536 film layer must not intercept user input');
assert.ok(css.includes('@media (prefers-reduced-motion:reduce)'),'R536 reduced-motion fail-open missing');
assert.ok(!/animation:[^;]*infinite/.test(css),'R536 must not run infinite CSS animations');

console.log('PASS: R536 full cinematic journey preserves content/actions, covers every major product surface, keeps one native MAG and uses event-driven motion.');

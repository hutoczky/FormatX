'use strict';

const fs = require('fs');
const assert = require('assert');

const read = p => fs.readFileSync(p,'utf8');
const index = read('docs/scifi-ui/index.html');
const css = read('docs/scifi-ui/styles/formatx-cinematic-journey-r536.css');
const js = read('docs/scifi-ui/scripts/formatx-cinematic-journey-r536.js');
const depth = read('docs/scifi-ui/styles/formatx-desktop-depth-r1958.css');

assert.equal((index.match(/formatx-cinematic-journey-r536\.css/g)||[]).length,1,'R536 CSS must load exactly once');
assert.equal((index.match(/formatx-desktop-depth-r1958\.css/g)||[]).length,1,'R1958 desktop depth CSS must load exactly once');
for(const token of ['photographic depth pass','fx-c536-world','fx-c536-iris','fx-c536-vignette','drop-shadow(0 20px 20px','data-fx-scroll-budget-r1660']) assert.ok(depth.includes(token),`R1958 depth contract missing: ${token}`);
assert.equal((index.match(/formatx-cinematic-journey-r536\.js/g)||[]).length,1,'R536 JS must load exactly once');
assert.ok(!index.includes('data-fx-cinematic-continuity-r535'),'R535 active bootstrap must be retired');
assert.ok(index.includes('data-fx-r487-deferred-style="true"'),'R536 visual CSS must stay post-FCP deferred');
assert.equal((index.match(/data-fx-deferred-css-r487="true"/g)||[]).length,1,'R487 deferred CSS scheduler must load exactly once in source');
assert.ok(index.includes('formatx-deferred-css-r487.js?v=20261009-r2022-visible-fcp-watchdog'),'R487 updated FCP scheduler revision missing from source');
assert.ok(read('docs/scifi-ui/scripts/formatx-deferred-css-r487.js').includes('visible-tab-fcp-watchdog'),'R487 must activate when the FCP observer fails to fire');

for (const token of [
  '#hero','#live-os-overview','.fx-category-deck--standalone','#experience','#capabilities',
  '#pricing','#system','#network','.fx-origin-proof','.fx-award-proof','#user-feedback','#resources','footer.site-footer'
]) assert.ok(js.includes(token),'R536 scene coverage missing '+token);

for (const token of [
  'window.FormatXLivingCore || window.FormatXCoreMobileV69',
  'surfacePulse?.','requestRender?.',
  'MutationObserver','formatx:magbirthcomplete','formatx:loop',
  'all-content-actions-preserved-one-native-mag',
  'scroll-interaction-driven-no-idle-raf',
  'fxCinematicLivingIdentityR1723',
  'canonical-organism-scene-physiology-only'
]) assert.ok(js.includes(token),'R536 runtime contract missing '+token);

assert.ok(!js.includes('setShape?.'),'R1723 cinematic journey must not request alternate body shapes');
assert.ok(!js.includes('setInterval('),'R536 must not use an idle interval');
assert.ok(!js.includes("createElement('canvas')"),'R536 must not create or duplicate a MAG canvas');
assert.ok(css.includes('pointer-events:none!important'),'R536 film layer must not intercept user input');
assert.ok(css.includes('@media (prefers-reduced-motion:reduce)'),'R536 reduced-motion fail-open missing');
assert.ok(!/animation:[^;]*infinite/.test(css),'R536 must not run infinite CSS animations');

/* R1948 — first viewport progressive disclosure contract. */
for (const token of [
  'fxCinematicDisclosureR1948',
  'hero-core-dormant-global-hud-noncore-scene-open-zero-idle'
]) assert.ok(js.includes(token),'R1948 runtime disclosure contract missing '+token);

for (const token of [
  'production-r1948-hero-progressive-disclosure-zero-idle',
  '[data-fx-cinematic-scene-r536="core"] .fx-c536-hud',
  '[data-fx-cinematic-scene-r536="core"] .fx-c536-track',
  '[data-fx-cinematic-scene-r536="core"] .fx-c536-iris',
  ':not([data-fx-cinematic-scene-r536="core"]) .fx-c536-hud',
  '(min-width:901px)',
  '(prefers-reduced-motion:no-preference)'
]) assert.ok(css.includes(token),'R1948 hero disclosure CSS contract missing '+token);


console.log('PASS: R1948 cinematic journey preserves one canonical organism, keeps the hero optically clean, opens global telemetry after the core scene and remains zero-idle.');

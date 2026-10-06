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
  '#pricing','#system','#network','.fx-origin-proof','.fx-award-proof','#user-feedback','#resources','footer.site-footer'
]) assert.ok(js.includes(token),'R536 scene coverage missing '+token);

for (const token of [
  'window.FormatXLivingCore || window.FormatXCoreMobileV69',
  'surfacePulse?.','requestRender?.',
  'MutationObserver','formatx:magbirthcomplete','formatx:loop',
  'all-content-actions-preserved-one-native-mag',
  'physical-spring-scroll-pointer-camera-zero-idle-after-settle',
  'fxDesktopInteractionR1951',
  'second-order-pointer-scroll-springs-velocity-depth-parallax-zero-idle-after-settle',
  'fxCinematicLivingIdentityR1723',
  'canonical-organism-scene-physiology-only'
]) assert.ok(js.includes(token),'R536 runtime contract missing '+token);

assert.ok(!js.includes('setShape?.'),'R1723 cinematic journey must not request alternate body shapes');
assert.ok(!js.includes('setInterval('),'R536 must not use an idle interval');
assert.ok(js.includes("scrollTailFrames=18") || js.includes("scrollTailFrames=Math.max(scrollTailFrames,18)"),'R1951 scroll camera must be bounded rather than idle');
assert.ok(js.includes("if(pointerMoving||scrollMoving||pointerTailFrames>0||scrollTailFrames>0)schedule()"),'R1951 spring camera must stop scheduling after settle');
assert.ok(js.includes("setScrollBudget('fast');") && js.includes("scheduleScrollSettle();"),'R1951 must preserve fast-scroll logical state deferral and settle resync');
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


console.log('PASS: R1951 cinematic journey preserves one canonical organism, uses bounded physical pointer/scroll springs, keeps the hero optically clean and returns to zero-idle after settle.');

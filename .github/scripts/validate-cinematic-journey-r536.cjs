'use strict';

const fs = require('fs');
const assert = require('assert');

const read = p => fs.readFileSync(p,'utf8');
const index = read('docs/scifi-ui/index.html');
const css = read('docs/scifi-ui/styles/formatx-cinematic-journey-r536.css');
const js = read('docs/scifi-ui/scripts/formatx-cinematic-journey-r536.js');
const depth = read('docs/scifi-ui/styles/formatx-desktop-depth-r1958.css');
const renderer = read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const genesis = read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const aiIdent = read('docs/scifi-ui/scripts/formatx-ai-core-ident-r1951.js');
const aiIdentCss = read('docs/scifi-ui/styles/formatx-ai-core-ident-r1951.css');

assert.equal((index.match(/formatx-cinematic-journey-r536\.css/g)||[]).length,1,'R536 CSS must load exactly once');
assert.equal((index.match(/formatx-desktop-depth-r1958\.css/g)||[]).length,1,'R1958 desktop depth CSS must load exactly once');
for(const token of [
  'photographic depth pass','fx-c536-world','fx-c536-iris','fx-c536-vignette',
  'production-r1959-supersampled-clean-contour-volumetric-contact-depth',
  '.fx-crystal-organism-r326-stage::before',
  '.fx-crystal-organism-r326-stage::after',
  'filter:none!important',
  'data-fx-scroll-budget-r1660'
]) assert.ok(depth.includes(token),`R1959 depth contract missing: ${token}`);
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



/* R1959 — studio finish contract. */
for(const token of [
  "fxNativeMagMsaaR1959",
  "fxNativeMagQualityR1959",
  "desktop-128pct-supersample-msaa-no-css-scale-adaptive-clean-contour",
  "const supersample=fineDesktop?(constrained?1.12:1.28):1",
  "transform:'none'",
  "single-pass-beer-lambert-extinction-refractive-caustic-smoked-bioglass"
]) assert.ok(renderer.includes(token),'R1959 renderer contract missing '+token);

for(const token of [
  "formatx:magstabilized",
  "r1959-ai-core-telemetry",
  "this.identitySignaled"
]) assert.ok(genesis.includes(token),'R1959 genesis stabilisation contract missing '+token);

for(const token of [
  "MAG // AI CORE",
  "ONLINE · LOCAL INTELLIGENCE",
  "formatx:magstabilized",
  "--fx-ai-core-x",
  "stabilisation-telemetry-armed"
]) assert.ok(aiIdent.includes(token),'R1959 AI identity runtime contract missing '+token);

for(const token of [
  "production-r1959-mag-stabilisation-system-telemetry-label",
  "ui-monospace",
  "--fx-ai-core-x",
  "--fx-ai-core-y"
]) assert.ok(aiIdentCss.includes(token),'R1959 AI identity visual contract missing '+token);

for(const token of [
  "fx-c536-handoff-r1959",
  "continuous-no-flare-cut",
  "active-time-damped-r1959",
  "fx-c1959-scroll-drift"
]) assert.ok(js.includes(token),'R1959 cinematic runtime contract missing '+token);

for(const token of [
  "production-r1959-time-damped-camera-continuous-intro-handoff",
  "fx-c536-handoff-r1959",
  "--fx-c1959-scroll-drift"
]) assert.ok(css.includes(token),'R1959 cinematic CSS contract missing '+token);

console.log('PASS: R1959 cinematic journey preserves one canonical organism, supersampled clean MAG edges, target-locked AI CORE telemetry and continuous zero-idle film transitions.');

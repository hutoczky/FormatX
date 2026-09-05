/* FormatX award-quality source gate — R528 living-core product contract. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

/* Reuse the authoritative R528 MAG source contract instead of preserving
   obsolete manual PAUSE/RESUME or historical exact-version assumptions. */
require('./validate-mag-living-core-r528.cjs');

const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const controls=read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const language=read('docs/scifi-ui/scripts/single-language-toggle.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const reduced=read('docs/scifi-ui/styles/formatx-reduced-mag-identity-r528.css');
const desktop=JSON.parse(read('lighthouserc.live.json'));
const mobile=JSON.parse(read('lighthouserc.live.mobile.json'));

for(const token of [
  'fxHeroLcpOwnerR411','static-html-no-reparent','single-current-runtime-no-postdom-repair-stack',
  'fx-reference-controls-r204','fx-reference-ask','r461-lightweight-first-party',
  "fxMagProductContractR528='living-core-continuous-normal-motion'",
  'runtime-error','promise-error'
])assert.ok(intro.includes(token),`missing current first-paint contract: ${token}`);
for(const obsolete of ['formatx:referencepause','fxReferenceMotionPaused','function bindPause'])
  assert.ok(!intro.includes(obsolete),`obsolete manual MAG pause owner returned: ${obsolete}`);

for(const token of [
  'canonicalControls(hero)','fx-reference-controls-r204',"!controls.querySelector('.fx-reference-pause')",
  "fxMagProductContractR528='living-core-continuous-normal-motion'",
  'fxControlOwnerR268','HU – váltás angol nyelvre','EN – switch to Hungarian'
])assert.ok(controls.includes(token),`missing current canonical control contract: ${token}`);
assert.ok(!controls.includes('visibleControl(pause)'),'manual MAG PAUSE is not a required control');
assert.ok(!controls.includes('function ensurePause'),'manual MAG PAUSE creator returned');

for(const token of [
  "const VERSION='7'",'HU – váltás angol nyelvre','EN – switch to Hungarian',
  'event-driven-no-document-mutation-observer',"fxSingleLanguageToggle='ready-v3'"
])assert.ok(language.includes(token),`missing stable language contract: ${token}`);
assert.ok(!language.includes('new MutationObserver'),'language owner must remain observer-free');

for(const token of [
  'single-webgl-crystal-organism-r326','function setLifecycleSuspended',
  'document.hidden||!visible||renderSuspended',"fxMagProductContractR528='living-core-continuous-normal-motion'",
  "listen(reduced,'change',onReducedMotionChange"
])assert.ok(renderer.includes(token),`missing R528 renderer contract: ${token}`);
for(const obsolete of ['formatx:referencepause','fxReferenceMotionPaused','.fx-reference-pause'])
  assert.ok(!renderer.includes(obsolete),`renderer still contains obsolete pause contract: ${obsolete}`);

for(const token of [
  'setLifecycleSuspended',"fxMobileRenderGovernorRevisionR433='r528-lifecycle-suspend-no-idle-redraw'",
  "fxMobileRenderContractR528='automatic-resource-lifecycle-not-user-pause'",
  'full-1160ms-sweep-then-zero-idle'
])assert.ok(governor.includes(token),`missing R528 mobile lifecycle budget: ${token}`);
for(const obsolete of ['userPaused','fxReferenceMotionPaused','formatx:referencepause','.fx-reference-pause'])
  assert.ok(!governor.includes(obsolete),`governor still contains obsolete pause contract: ${obsolete}`);

for(const token of ['prefers-reduced-motion: reduce','fx-crystal-organism-r326-stage','animation-play-state: paused'])
  assert.ok(reduced.includes(token),`missing reduced-motion accessibility contract: ${token}`);

function validateLighthouse(config,label){
  const collect=config.ci.collect;
  const assertions=config.ci.assert.assertions;
  assert.equal(collect.numberOfRuns,3,`${label}: final proof requires 3 runs`);
  assert.ok(collect.url.every(url=>!url.includes('lighthouse=1')),`${label}: audit-only URL forbidden`);
  assert.ok(!String(collect.settings.chromeFlags||'').includes('force-prefers-reduced-motion'),`${label}: forced reduced motion forbidden`);
  assert.ok(!('skipAudits' in collect.settings),`${label}: skipped audits forbidden`);
  assert.equal(assertions['categories:performance'][1].minScore,1,`${label}: performance must be 100`);
  assert.equal(assertions['categories:accessibility'][1].minScore,1,`${label}: accessibility must be 100`);
  assert.equal(assertions['categories:best-practices'][1].minScore,1,`${label}: best-practices must be 100`);
  assert.equal(assertions['categories:seo'][1].minScore,1,`${label}: SEO must be 100`);
  assert.ok(assertions['largest-contentful-paint'][1].maxNumericValue<2000,`${label}: LCP must be <2.0s`);
  assert.ok(assertions['cumulative-layout-shift'][1].maxNumericValue<.05,`${label}: CLS must be <0.05`);
  assert.ok(assertions['total-blocking-time'][1].maxNumericValue<=150,`${label}: TBT must be <=150ms`);
  assert.ok(assertions['server-response-time'][1].maxNumericValue<=500,`${label}: TTFB must be <=500ms`);
}
validateLighthouse(desktop,'desktop');
validateLighthouse(mobile,'mobile');

for(const source of [intro,controls,language,renderer,governor])new Function(source);
console.log('PASS: R528 WDA source gate uses the living-core contract, lifecycle/reduced-motion accessibility, and strict final 100x3 Lighthouse targets.');

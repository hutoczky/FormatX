/* FormatX award-quality gate — r462 current production architecture. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

const home=read('docs/scifi-ui/index.html');
const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const language=read('docs/scifi-ui/scripts/single-language-toggle.js');
const currentMag=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const controls=read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');
const desktop=JSON.parse(read('lighthouserc.json'));
const mobile=JSON.parse(read('lighthouserc.mobile.json'));

for(const token of [
  'fxHeroLcpOwnerR411','static-html-no-reparent','single-current-runtime-no-postdom-repair-stack',
  'fx-reference-controls-r204','fx-reference-ask','fx-reference-pause','formatx:referencepause',
  'r461-lightweight-first-party','runtime-error','promise-error'
])assert.ok(intro.includes(token),`missing R461 intro contract: ${token}`);
for(const retired of [
  'formatx-award-runtime-r206.js','formatx-mobile-regression-r310.js','activateCriticalReal3dStyle','queuePostDomEnhancements'
])assert.ok(!intro.includes(retired),`retired first-load repair stack returned: ${retired}`);

for(const token of [
  'formatx-current-mag-loader-r422.js','formatx-crystal-organism-r326.js',
  'formatx-mobile-solid-glass-r456.js','formatx-core-shapeshifter-r337.css'
])assert.ok(motion.includes(token),`missing current R460 motion owner: ${token}`);
assert.ok(motion.includes('single-language-toggle.js?v=20260830-r462-semantic-owner'),'motion loader must request R461 language owner');
assert.ok(motion.includes("fxSingleLanguageToggleVersion==='7'"),'motion loader must require language owner v7');
assert.ok(!motion.includes('isRetiredMagRuntime'),'compact R461 loader must not contain retired-runtime filtering');

for(const token of [
  "const VERSION='7'",'fx-language-toggle','HU – váltás angol nyelvre',
  'EN – switch to Hungarian','event-driven-no-document-mutation-observer',
  "fxSingleLanguageToggle='ready-v3'"
])assert.ok(language.includes(token),`missing R462 language contract: ${token}`);
assert.ok(!language.includes('new MutationObserver'),'R461 language owner must not install mutation observers');

for(const token of [
  'content-visibility: visible','fx-reference-liveos','.scroll-cue > span',
  '.topbar > .header-actions','> .fx-rail','contain: layout paint',
  '.fx-qr-placeholder','#main-nav:not(.open)','fx-reference-controls-r204.fx-reference-controls-r264'
])assert.ok(quality.includes(token),`missing R462 quality CSS: ${token}`);
assert.match(home,/formatx-quality-r461\.css\?v=20260830-r462-mobile-a11y/);
assert.match(home,/class="fx-language-toggle"/);
assert.match(home,/data-fx-single-language-toggle="ready-v3"/);
assert.doesNotMatch(home,/data-fx-living-energy-r168="true" href="\.\/styles\/formatx-living-energy-r168\.css/);
assert.doesNotMatch(home,/data-fx-desktop-apex-r181="true" href="\.\/styles\/formatx-desktop-apex-r181\.css/);
for(const retired of [
  'data-fx-premium-finish','data-fx-live-heartbeat-r155','data-fx-signature-system-r185',
  'data-fx-seamless-enforcer-r159','data-fx-living-energy-r168="true" src=','data-fx-desktop-apex-r181-loader'
])assert.ok(!home.includes(retired),`retired runtime remains active in index: ${retired}`);

for(const token of [
  'r326-only','cleanupLegacyMagRuntime','r460-soft-mobile-optics',
  'r460-primary-controller-clean-runtime','formatx-mini-mag-assistant-r459.js'
])assert.ok(currentMag.includes(token),`missing R460 current MAG contract: ${token}`);
for(const token of [
  'canonicalControls(hero)','fx-reference-controls-r204','visibleControl(pause)',
  'fxControlOwnerR268','HU – váltás angol nyelvre','EN – switch to Hungarian'
])assert.ok(controls.includes(token),`missing canonical control contract: ${token}`);

function validateLighthouse(config,label){
  const collect=config.ci.collect;
  const assertions=config.ci.assert.assertions;
  assert.equal(collect.numberOfRuns,3,`${label}: needs 3 runs`);
  assert.ok(collect.url.every(url=>!url.includes('lighthouse=1')),`${label}: audit-only URL forbidden`);
  assert.ok(!String(collect.settings.chromeFlags||'').includes('force-prefers-reduced-motion'),`${label}: forced reduced motion forbidden`);
  assert.ok(!('skipAudits' in collect.settings),`${label}: skipped audits forbidden`);
  assert.equal(assertions['categories:performance'][1].minScore,.95,`${label}: performance floor`);
  assert.equal(assertions['categories:accessibility'][1].minScore,1,`${label}: accessibility floor`);
  assert.equal(assertions['categories:best-practices'][1].minScore,1,`${label}: best-practices floor`);
  assert.equal(assertions['categories:seo'][1].minScore,1,`${label}: SEO floor`);
  assert.equal(assertions['first-contentful-paint'][1].maxNumericValue,1800,`${label}: FCP`);
  assert.equal(assertions['largest-contentful-paint'][1].maxNumericValue,2500,`${label}: LCP`);
  assert.equal(assertions['total-blocking-time'][1].maxNumericValue,200,`${label}: TBT`);
  assert.equal(assertions['cumulative-layout-shift'][1].maxNumericValue,.1,`${label}: CLS`);
  assert.equal(assertions['server-response-time'][1].maxNumericValue,600,`${label}: TTFB`);
}
validateLighthouse(desktop,'desktop');
validateLighthouse(mobile,'mobile');

for(const source of [intro,motion,language,currentMag,controls])new Function(source);
console.log('PASS: R462 single-path first paint, R460/R326 MAG, stable language semantics, mobile accessibility/tap-target cleanup and truthful Lighthouse budgets are structurally valid.');

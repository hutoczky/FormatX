/* FormatX award-quality gate — r463 current production architecture. */
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
const solidGlass=read('docs/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
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
  'formatx-current-mag-loader-r422.js?v=20260830-r463-award-mobile-optics-strict-tbt',
  'formatx-crystal-organism-r326.js?v=20260830-r454-luminous-native-electric-surface',
  'formatx-mobile-solid-glass-r456.js?v=20260830-r463-restrained-award-optics',
  'formatx-core-shapeshifter-r337.css?v=20260830-r460-soft-mobile-rim',
  'armed-direct-r326-r463-award-mobile-optics-strict-tbt'
])assert.ok(motion.includes(token),`missing current R463 motion owner: ${token}`);
assert.ok(motion.includes('single-language-toggle.js?v=20260830-r462-semantic-owner'),'motion loader must request stable language owner');
assert.ok(motion.includes("fxSingleLanguageToggleVersion==='7'"),'motion loader must require language owner v7');
assert.ok(!motion.includes('isRetiredMagRuntime'),'compact loader must not contain retired-runtime filtering');

for(const token of [
  "const VERSION='7'",'fx-language-toggle','HU – váltás angol nyelvre',
  'EN – switch to Hungarian','event-driven-no-document-mutation-observer',
  "fxSingleLanguageToggle='ready-v3'"
])assert.ok(language.includes(token),`missing R462 language contract: ${token}`);
assert.ok(!language.includes('new MutationObserver'),'language owner must not install mutation observers');

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
  'r326-only','cleanupLegacyMagRuntime','r463-restrained-award-optics',
  'r463-award-mobile-optics-strict-tbt','r463-short-burst-strict-tbt',
  'narrow-fresnel-soft-edge-restrained-bloom','formatx-mini-mag-assistant-r459.js'
])assert.ok(currentMag.includes(token),`missing R463 current MAG contract: ${token}`);
for(const token of [
  "const VERSION='r463-uniform-solid-glass-restrained-award-mobile-optics'",
  "const smoothWeight=mobile?'.997':'.930'",
  "float fresnel=pow(1.0-facing,2.12);",
  "float edge=0.0;",
  'narrow-fresnel-soft-edge-restrained-bloom'
])assert.ok(solidGlass.includes(token),`missing restrained R463 mobile optics: ${token}`);
for(const token of [
  'const activeWindowMs=360','state.core?.requestRender?.(6)','heroVisible()',
  "fxMobileRenderGovernorRevisionR433='r463-short-burst-strict-tbt'"
])assert.ok(governor.includes(token),`missing strict R463 mobile render budget: ${token}`);
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

for(const source of [intro,motion,language,currentMag,solidGlass,governor,controls])new Function(source);
console.log('PASS: R463 single-path first paint, restrained R326 mobile MAG optics, strict TBT budget, stable language semantics, accessibility and truthful Lighthouse budgets are structurally valid.');

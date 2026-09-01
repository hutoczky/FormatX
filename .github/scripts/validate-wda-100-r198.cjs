/* FormatX award-quality gate — R493 inline first frame + R491 progressive runtime + P0 VIP budgets. */
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
const currentMagCss=read('docs/scifi-ui/styles/formatx-current-mag-r422.css');
const solidGlass=read('docs/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js');
const life=read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const controls=read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');
const optics=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const lifeStyle=read('docs/scifi-ui/styles/formatx-core-life-r455.css');
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
  'formatx-current-mag-loader-r422.js?v=20260831-r484-periodic-native-energy',
  'formatx-crystal-organism-r326.js?v=20260831-r484-periodic-native-energy',
  'formatx-mobile-solid-glass-r456.js?v=20260831-r484-native-surface-filaments',
  'formatx-core-shapeshifter-r337.css?v=20260831-r468-soft-mobile-bloom',
  'formatx-core-life-r455.css?v=20260831-r474-softer-mobile-glow',
  'formatx-core-life-r455.js?v=20260831-r484-periodic-native-energy',
  'armed-direct-r326-r468-soft-optics-live-energy-zero-idle',
  "fxFinalVisualRevisionR474='softer-mobile-glow-feathered-facets'"
])assert.ok(motion.includes(token),`missing current loader route: ${token}`);
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
  '.fx-qr-placeholder','#main-nav:not(.open)','fx-reference-controls-r204.fx-reference-controls-r264',
  '--fx-mag-first-frame:','data:image/svg+xml','deploy-r493-inline-first-frame'
])assert.ok(quality.includes(token),`missing R493 quality CSS: ${token}`);
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
  "const VERSION='direct-r326-r491-progressive-interaction-first'",'r326-only','cleanupLegacyMagRuntime',
  'waitForEnhancementWindow','static-premium-ready','progressive-first-frame',
  'r491-interaction-only-zero-idle','interaction-only-bursts-between-zero-idle',
  'soft-perimeter-low-bloom-low-cost-shader','formatx-mini-mag-assistant-r459.js',
  'formatx-core-life-r455.css?v=20260831-r474-softer-mobile-glow',
  'formatx-core-life-r455.js?v=20260831-r484-periodic-native-energy',
  "fxCurrentMagOpticsR474=mobile?'softer-glow-feathered-facets-zero-idle':'desktop-optics-unchanged'"
])assert.ok(currentMag.includes(token),`missing R491 progressive current MAG contract: ${token}`);
for(const token of [
  'FormatX r493','var(--fx-mag-first-frame)','progressive-enhancement layer','min-height: 0 !important',
  'production-r491-progressive-first-frame-direct-r326-layout-a11y-touch'
])assert.ok(currentMagCss.includes(token),`missing R493 first-frame CSS contract: ${token}`);
assert.ok(!currentMagCss.includes('formatx-mag-first-frame-r491.svg'),'R493 current MAG CSS must not trigger the retired standalone first-frame request');

for(const token of [
  "const VERSION='r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics'",
  "const smoothWeight=mobile?'.998':'.930'",
  "float fresnel=pow(1.0-facing,1.92);",
  "float edge=0.0;",
  'surfacePulsePattern','soft-perimeter-low-bloom-low-cost-shader'
])assert.ok(solidGlass.includes(token),`missing soft R465 mobile shader contract: ${token}`);
for(const token of [
  'FormatX r467','brightness(1.065)','contrast(.89)','saturate(1.10)','blur(.82px)'
])assert.ok(optics.includes(token),`missing R467 base mobile display tone: ${token}`);
for(const token of [
  'FormatX r474','softer mobile crystal glow','opacity: .970','image-rendering: auto',
  'brightness(.985)','contrast(.855)','saturate(1.010)','blur(.30px)',
  '.skip-link:not(:focus):not(:focus-visible)','clip-path: inset(50%)',
  '-webkit-tap-highlight-color: transparent','production-r474-softer-mobile-glow-feathered-facets'
])assert.ok(lifeStyle.includes(token),`missing R474 final softer mobile display: ${token}`);
assert.ok(!lifeStyle.includes('fx-core-r468-compositor-breathe'),'R474 final display must remain compositor-idle');
for(const token of [
  "const VERSION = 'native-webgl-periodic-and-interaction-life-r484'",'surface-sweep-',
  'armed-periodic-and-interaction-surface-energy','periodic-surface-bursts-between-zero-idle',
  'formatx:coreinteraction','pointerdown'
])assert.ok(life.includes(token),`missing underlying interaction energy contract: ${token}`);
assert.ok(!life.includes('setInterval('),'MAG life must not install an idle interval');
assert.ok(!life.includes('requestAnimationFrame('),'MAG life must not install an idle WebGL RAF loop');

for(const token of [
  'const activeWindowMs=240','const shapeProbeMs=150','state.core?.requestRender?.(2)',
  'userShapeSource(source)','guardPassiveState(source)',
  "fxCoreMobileIdlePolicyR426='interaction-only-bursts-between-zero-idle'",
  "fxMobileRenderGovernorRevisionR433='r490-autonomous-sweep-budget-guard'",
  "fxMobileSurfaceBudgetR484='autonomous-sweeps-suppressed-interaction-sweeps-bounded'",
  "fxMobileAutonomousSurfaceR490='suppressed-zero-idle'",
  "root.dataset.fxReferenceMotionPaused=value"
])assert.ok(governor.includes(token),`missing strict R491 mobile render budget: ${token}`);
assert.ok(!governor.includes("dispatchEvent(new CustomEvent('formatx:referencepause'"),'governor idle must not synchronously redraw through legacy pause event');
assert.ok(!governor.includes("active('scroll-r463'"),'mobile scroll must not wake WebGL');
assert.ok(!governor.includes("active('resize-r463'"),'mobile resize must not wake WebGL');

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
  for(const category of ['performance','accessibility','best-practices','seo']){
    const rule=assertions[`categories:${category}`][1];
    assert.equal(rule.minScore,1,`${label}: ${category} must be 100`);
    assert.equal(rule.aggregationMethod,'pessimistic',`${label}: ${category} must use worst-run aggregation`);
  }
  assert.equal(assertions['first-contentful-paint'][1].maxNumericValue,1800,`${label}: FCP`);
  assert.equal(assertions['largest-contentful-paint'][1].maxNumericValue,1999,`${label}: LCP`);
  assert.equal(assertions['total-blocking-time'][1].maxNumericValue,150,`${label}: TBT`);
  assert.equal(assertions['cumulative-layout-shift'][1].maxNumericValue,.049,`${label}: CLS`);
  assert.equal(assertions['server-response-time'][1].maxNumericValue,500,`${label}: TTFB`);
  for(const metric of ['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','server-response-time']){
    assert.equal(assertions[metric][1].aggregationMethod,'pessimistic',`${label}: ${metric} must use worst-run aggregation`);
  }
}
validateLighthouse(desktop,'desktop');
validateLighthouse(mobile,'mobile');

for(const source of [intro,motion,language,currentMag,solidGlass,life,governor,controls])new Function(source);
console.log('PASS: R493 inline first frame + R491 progressive native MAG, interaction-only mobile energy, zero-idle policy and P0 VIP 100/100/100/100 budgets are structurally valid.');

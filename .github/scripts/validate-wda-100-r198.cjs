/* FormatX award-quality gate — R539 authoritative P0 quality contract. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const home=read('docs/scifi-ui/index.html');
const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const scheduler=read('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const language=read('docs/scifi-ui/scripts/single-language-toggle.js');
const currentMag=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const solidGlass=read('docs/scifi-ui/scripts/formatx-mobile-solid-glass-r456.js');
const life=read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const controls=read('docs/scifi-ui/scripts/formatx-control-owner-r268.js');
const wdaControls=read('docs/scifi-ui/scripts/formatx-wda-controls-r198.js');
const mini=read('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js');
const shape=read('docs/scifi-ui/scripts/formatx-mag-shape-sync-r476.js');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');
const optics=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const heart=read('docs/scifi-ui/styles/formatx-heart-core-r252.css');
const lifeStyle=read('docs/scifi-ui/styles/formatx-core-life-r455.css');
const desktop=JSON.parse(read('lighthouserc.json'));
const mobile=JSON.parse(read('lighthouserc.mobile.json'));
const has=(source,tokens,label)=>{for(const token of tokens)assert.ok(source.includes(token),`missing ${label}: ${token}`);};
const absent=(source,pattern,label)=>assert.doesNotMatch(source,pattern,label);

has(intro,['fxHeroLcpOwnerR411','static-html-no-reparent','single-current-runtime-no-postdom-repair-stack','fx-reference-controls-r204','fx-reference-ask','living-core-normal-continuous-reduced-background-managed','runtime-error','promise-error'],'current intro contract');
for(const retired of ['formatx-award-runtime-r206.js','formatx-mobile-regression-r310.js','activateCriticalReal3dStyle','queuePostDomEnhancements'])assert.ok(!intro.includes(retired),`retired first-load repair stack returned: ${retired}`);

has(scheduler,[
  'FormatX R539','startSoundControl()','startCriticalMag()','formatx-wda-controls-r198.js?v=20260906-r539-navigation-sound-opt-in-owner',
  "fxSoundNavigationOwnerR539='requested-navigation'",'formatx-current-mag-loader-r422.js?v=20260906-r538-pause-free-optics'
],'navigation MAG + SOUND owner');
assert.match(scheduler,/startSoundControl\(\);\s*startCriticalMag\(\);/,'SOUND control and MAG must arm from navigation before late enhancements');
absent(scheduler,/lighthouse=1|force-prefers-reduced-motion|formatx:referencepause|\.fx-reference-pause/,'scheduler must have one normal visitor path and no manual PAUSE');

has(motion,['formatx-current-mag-loader-r422.js','ensureCurrentMag();','formatx-design-system.css?v=20260728-ds2','function ensureScrollBootstrap()','formatx:immersiveactivate'],'current motion owner');
has(language,["const VERSION='7'",'fx-language-toggle','HU – váltás angol nyelvre','EN – switch to Hungarian','event-driven-no-document-mutation-observer'], 'language owner');
assert.ok(!language.includes('new MutationObserver'),'language owner must stay observer-free');

has(currentMag,['r326-only','cleanupLegacyMagRuntime','direct-r326-r468-soft-optics-live-energy-zero-idle','automatic-lifecycle-zero-idle','periodic-surface-bursts-between-zero-idle','formatx-mini-mag-assistant-r459.js',"fxCurrentMagLifecycleR536='navigation-owned-automatic-lifecycle'"],'current MAG contract');
has(renderer,["const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','const SURFACE_PULSE_MS = 1160','document.hidden','fxRenderLifecycleSuspended'],'single native renderer');
absent(renderer,/lighthouse=1|auditMode|static-audit|formatx:referencepause|fxReferenceMotionPaused|\.fx-reference-pause/,'renderer audit/manual-pause bypass forbidden');

has(solidGlass,["const VERSION='r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics'","float fresnel=pow(1.0-facing,1.92);",'soft-perimeter-low-bloom-low-cost-shader'],'shader contract');
has(optics,['FormatX r538','one native WebGL MAG optical + final hero-control display owner','brightness(1.065)','contrast(.89)','saturate(1.10)','blur(.82px)','grid-template-columns: repeat(2,54px)','production-r538-single-native-webgl-optics-owner-two-control-row'],'R538 optics/two-control contract');
has(lifeStyle,['FormatX r474','softer mobile crystal glow','production-r474-softer-mobile-glow-feathered-facets'],'display contract');
has(life,['native-webgl-periodic-and-interaction-life-r528','periodic-surface-bursts-between-zero-idle','formatx:coreinteraction','pointerdown'],'automatic living lifecycle');
assert.ok(!life.includes('setInterval('),'life owner must be interval-free');
assert.ok(!life.includes('requestAnimationFrame('),'life owner must not add idle RAF');
has(governor,['activeWindowMs=240','r536-automatic-lifecycle-suspension','fxRenderLifecycleSuspended','fxMobileRenderLifecycleSourceR536'],'automatic lifecycle governor');
has(controls,['canonicalControls(hero)','fx-reference-controls-r204','visibleControl(ask)','fxLivingCoreControlsR536'],'canonical controls');

has(wdaControls,['AUDIO_SRC','formatx-audio-repair.js','pendingToggleAfterLoad','requestProfessionalAudio()','first-click-replayed','r538-mobile-two-cell','r538-desktop-two-cell'],'user-opt-in professional SOUND handoff');
absent(wdaControls,/formatx:referencepause|fxReferenceMotionPaused|fxManualMagPauseR528|\.fx-reference-pause/,'SOUND owner must not restore manual MAG PAUSE');
has(heart,['FormatX r539','semantic hit ownership','pointer-events: none','z-index: 12090','production-r539-semantic-heart-native-hit-owner','.fx-trust-grid > a.fx-trust-card','min-block-size: 96px'],'semantic MAG hit + mobile touch target contract');
has(quality,['content-visibility: visible','fx-reference-liveos','.scroll-cue > span','grid-template-columns: repeat(2, 50px)','fx-reference-ask'],'quality CSS');
absent(quality,/\.fx-reference-pause/,'quality CSS must expose SOUND + ASK only');

for(const [name,source] of Object.entries({intro,motion,renderer,controls,wdaControls,mini,shape,life,governor,quality,optics}))absent(source,/formatx:referencepause|fxReferenceMotionPaused|fxManualMagPauseR528|\.fx-reference-pause/,`${name}: obsolete manual MAG PAUSE remains`);
assert.match(shape,/prefers-reduced-motion:\s*reduce/);assert.match(shape,/visibilitychange/);assert.match(shape,/animation-play-state/);
assert.match(home,/formatx-quality-r461\.css\?v=/);assert.match(home,/class="fx-language-toggle"/);

function validateLighthouse(config,label){
  const collect=config.ci.collect,assertions=config.ci.assert.assertions;
  assert.equal(collect.numberOfRuns,3,`${label}: needs 3 runs`);
  assert.ok(collect.url.every(url=>!url.includes('lighthouse=1')),`${label}: audit-only URL forbidden`);
  assert.ok(!String(collect.settings.chromeFlags||'').includes('force-prefers-reduced-motion'),`${label}: forced reduced motion forbidden`);
  assert.ok(!('skipAudits' in collect.settings),`${label}: skipped audits forbidden`);
  assert.equal(assertions['categories:performance'][1].minScore,1);
  assert.equal(assertions['categories:accessibility'][1].minScore,1);
  assert.equal(assertions['categories:best-practices'][1].minScore,1);
  assert.equal(assertions['categories:seo'][1].minScore,1);
  assert.equal(assertions['first-contentful-paint'][1].maxNumericValue,1800);
  assert.equal(assertions['largest-contentful-paint'][1].maxNumericValue,1999);
  assert.equal(assertions['total-blocking-time'][1].maxNumericValue,150);
  assert.equal(assertions['cumulative-layout-shift'][1].maxNumericValue,.049);
  assert.equal(assertions['server-response-time'][1].maxNumericValue,500);
}
validateLighthouse(desktop,'desktop');validateLighthouse(mobile,'mobile');
for(const source of [intro,scheduler,motion,language,currentMag,renderer,solidGlass,life,governor,controls,wdaControls,mini,shape])new Function(source);
console.log('PASS: R539 proves navigation-owned MAG, opt-in SOUND control, semantic MAG hit ownership, no manual PAUSE, automatic lifecycle and strict 100x3 P0 gates.');

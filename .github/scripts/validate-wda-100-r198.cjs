/* FormatX award-quality gate — R542 authoritative P0 quality contract. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const has=(source,tokens,label)=>{for(const token of tokens)assert.ok(source.includes(token),`missing ${label}: ${token}`);};
const absent=(source,pattern,label)=>assert.doesNotMatch(source,pattern,label);

const intro=read('docs/scifi-ui/scripts/formatx-event-horizon.js');
const motion=read('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js');
const language=read('docs/scifi-ui/scripts/single-language-toggle.js');
const current=read('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js');
const renderer=read('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js');
const life=read('docs/scifi-ui/scripts/formatx-core-life-r455.js');
const governor=read('docs/scifi-ui/scripts/formatx-mobile-render-governor-r426.js');
const wda=read('docs/scifi-ui/scripts/formatx-wda-controls-r198.js');
const heart=read('docs/scifi-ui/scripts/formatx-heart-core-r252.js');
const heartCss=read('docs/scifi-ui/styles/formatx-heart-core-r252.css');
const optics=read('docs/scifi-ui/styles/formatx-core-shapeshifter-r337.css');
const quality=read('docs/scifi-ui/styles/formatx-quality-r461.css');
const shape=read('docs/scifi-ui/scripts/formatx-mag-shape-sync-r476.js');
const desktop=JSON.parse(read('lighthouserc.json'));
const mobile=JSON.parse(read('lighthouserc.mobile.json'));

has(intro,['fxHeroLcpOwnerR411','static-html-no-reparent','single-current-runtime-no-postdom-repair-stack','sound-ask-no-manual-mag-pause','runtime-error','promise-error'],'current intro contract');
absent(intro,/formatx:referencepause|\.fx-reference-pause|function bindPause|function ensurePause/,'intro manual PAUSE forbidden');

has(motion,['FormatX r542','ensureSoundControl()','ensureCurrentMag()',"SOUND_CONTROL='/scifi-ui/scripts/formatx-wda-controls-r198.js?v=20260906-r542-professional-owner-authoritative'","CURRENT_MAG='/scifi-ui/scripts/formatx-current-mag-loader-r422.js?v=20260906-r542-body-fixed-stage-sync'"],'navigation MAG + SOUND owner');
assert.match(motion,/ensureSoundControl\(\);ensureCurrentMag\(\);/,'SOUND and MAG must arm from navigation');
absent(motion,/lighthouse=1|force-prefers-reduced-motion|formatx:referencepause|\.fx-reference-pause/,'motion audit/manual pause bypass forbidden');

has(language,["const VERSION='7'",'fx-language-toggle','HU – váltás angol nyelvre','EN – switch to Hungarian'],'single semantic language owner');
assert.ok(!language.includes('new MutationObserver'),'language owner must remain observer-free');

has(current,['FormatX R542','r326-only','formatx-crystal-organism-r326.js',"HEART_CORE='/scifi-ui/scripts/formatx-heart-core-r252.js?v=20260906-r542-body-fixed-stage-sync'","fxCurrentMagLifecycleR536='navigation-owned-automatic-lifecycle'"],'single navigation current MAG');
has(renderer,["const REVISION = 'living-luminous-electric-crystal-r454'",'buildOrganismGeometry','const SURFACE_PULSE_MS = 1160','document.hidden','fxRenderLifecycleSuspended'],'native WebGL renderer');
absent(renderer,/lighthouse=1|auditMode|static-audit|formatx:referencepause|fxReferenceMotionPaused|\.fx-reference-pause/,'renderer bypass/manual pause forbidden');
has(life,['native-webgl-periodic-and-interaction-life-r528','periodic-surface-bursts-between-zero-idle','formatx:coreinteraction','pointerdown'],'automatic living lifecycle');
assert.ok(!life.includes('setInterval('),'life owner must remain interval-free');
assert.ok(!life.includes('requestAnimationFrame('),'life owner must not add idle RAF');
has(governor,['activeWindowMs=240','r536-automatic-lifecycle-suspension','fxRenderLifecycleSuspended','fxMobileRenderLifecycleSourceR536'],'automatic lifecycle governor');

has(wda,['AUDIO_SRC','formatx-audio-repair.js','pendingToggleAfterLoad','requestProfessionalAudio()','first-click-replayed','function enforceProfessionalOwnership(button)',"root.dataset.fxAudioOwner = 'professional-v6'","fxWdaSoundOwnershipR542 = 'professional-owner-reasserted'",'r538-mobile-two-cell','r538-desktop-two-cell'],'authoritative opt-in professional SOUND handoff');
absent(wda,/formatx:referencepause|fxReferenceMotionPaused|fxManualMagPauseR528|\.fx-reference-pause/,'SOUND owner manual PAUSE forbidden');

has(heart,["const VERSION = 'heart-core-r542'","fxMagHeartHitOwnerR542 = 'body-fixed-stage-synced'","fxMagHeartHitGeometryR542 = 'viewport-stage-synced'",'body.insertBefore(hit, main)','formatx:coreinteraction','formatx:immersiveactivate','visibilitychange'],'body-level semantic heart owner');
has(heartCss,['FormatX r542','body.living-architecture > .fx-mag-heart-hit-r252','position: fixed !important','z-index: 200 !important','z-index: 300 !important','.fx-trust-grid > a.fx-trust-card','min-block-size: 96px','production-r542-body-fixed-stage-synced-semantic-heart'],'heart geometry/touch targets');
assert.ok(!heartCss.includes('html body.living-architecture #main-content,'),'main content must keep native pointer ownership');
absent(heartCss,/\.fx-reference-pause/,'heart CSS manual PAUSE forbidden');

has(optics,['one native WebGL MAG optical + final hero-control display owner','grid-template-columns: repeat(2,54px) !important','pointer-events: none !important'],'two-control visual-only optics');
absent(optics,/\.fx-reference-pause|SOUND \| ASK \| PAUSE|repeat\(3,54px\)/,'optics retired PAUSE geometry');
has(quality,['content-visibility: visible','fx-reference-liveos','.scroll-cue > span','grid-template-columns: repeat(2, 50px)','fx-reference-ask'],'quality/accessibility CSS');
absent(quality,/\.fx-reference-pause/,'quality CSS SOUND + ASK only');
assert.match(shape,/prefers-reduced-motion:\s*reduce/);assert.match(shape,/visibilitychange/);assert.match(shape,/animation-play-state/);

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
for(const source of [intro,motion,language,current,renderer,life,governor,wda,heart,shape])new Function(source);
console.log('PASS: R542 proves navigation-owned MAG, body-level semantic hit ownership, authoritative opt-in professional SOUND, no manual PAUSE, automatic lifecycle and strict 100x3 P0 gates.');

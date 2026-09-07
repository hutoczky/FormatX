/* FormatX R636 — single-owner absolute-bounded premium intro release.
   MAG startup remains navigation-owned behind the visual cover. Product timing
   remains mobile 1180–1450ms / desktop 1350–1650ms. The existing 1360/1640ms
   visual clock may request release, but exactly one idempotent finalizer owns the
   actual completion event. R636 also neutralises full-viewport transform promotion
   synchronously before the optional visual stylesheet arrives, removing the narrow
   quality-keyframe race without changing the measurable visual clock. */
(function(){
'use strict';

const ROOT=document.documentElement;
const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
const REDUCED=matchMedia('(prefers-reduced-motion:reduce)').matches;
const OVERLAY_ID='formatx-event-horizon';
const AUDIO_URL='./assets/audio/formatx-audio-test.wav?v=20260728-professional-score-v6';
const P0_FX_STYLE='./styles/formatx-intro-p0-r575.css?v=20260907-r635-three-phase-absolute-reveal';
const PRELOADER_MIN_MS=REDUCED?180:(MOBILE?1180:1350);
const PRELOADER_MAX_MS=REDUCED?520:(MOBILE?1450:1650);
const PRELOADER_TICK_MS=80;
const PRELOADER_FADE_MS=REDUCED?0:90;
const PRELOADER_RELEASE_GUARD_MS=PRELOADER_FADE_MS+PRELOADER_TICK_MS+40;
const PRELOADER_HIDE_BY_MS=PRELOADER_MAX_MS;
const PRELOADER_REVEAL_AT_MS=REDUCED?0:Math.max(PRELOADER_MIN_MS,PRELOADER_MAX_MS-PRELOADER_FADE_MS);
const PRELOADER_VISUAL_MS=MOBILE?1360:1640;
const PRELOADER_BOOT_AT=performance.now();
let audio=null,preloaderTimer=0,preloaderDeadlineTimer=0,preloaderRevealTimer=0,preloaderPhaseTimerA=0,preloaderPhaseTimerB=0,preloaderReleased=false,preloaderDeadlineAbort=null;

if(!ROOT.dataset.fxReferenceProductionR244)ROOT.dataset.fxReferenceProductionR244=MOBILE?'ready':'desktop';
ROOT.dataset.fxReferenceComposition=MOBILE?'reference-frame-r244':'desktop-reference-r244';
ROOT.dataset.fxLivingCopyGuard='ready';
ROOT.dataset.fxLivingCopyGuardPolicyR293='static-content-normalized-no-document-scan';
ROOT.dataset.fxHeroLcpOwnerR411='static-html-no-reparent';
ROOT.dataset.fxStartupOwnerR461='single-current-runtime-no-postdom-repair-stack';
ROOT.dataset.fxAwardRuntimeMode='retired-from-first-load-r461';
ROOT.dataset.fxMobileRegressionR310='retired-from-first-load-r461';
ROOT.dataset.fxCoreReal3dCssR310='retired-r461-r326-owner';
ROOT.dataset.fxCanonicalMagClockOwnerR507='mag-shape-sync-r476-only';
ROOT.dataset.fxCanonicalMagMotionR528='living-core-normal-continuous-reduced-background-managed';
ROOT.dataset.fxPreloaderContractR531='visual-only-mag-independent-bounded';
ROOT.dataset.fxPreloaderEffectsR531=REDUCED?'reduced-static':'compositor-glow-scan-pulse';
ROOT.dataset.fxPreloaderTimingR533=MOBILE?'mobile-1180-1450':'desktop-1350-1650';
ROOT.dataset.fxPreloaderContentR534='static-no-repaint';
ROOT.dataset.fxPreloaderBootR533=String(Math.round(PRELOADER_BOOT_AT));
ROOT.dataset.fxPreloaderClockR544='navigation-script-boot-single-deadline';
ROOT.dataset.fxPreloaderDeadlineR549=`absolute-${PRELOADER_MIN_MS}-${PRELOADER_MAX_MS}`;
ROOT.dataset.fxPreloaderDeadlineR555='absolute-boot-hard-deadline-single-finalizer';
ROOT.dataset.fxPreloaderDeadlineR556='prearmed-user-blocking-scheduler-with-timer-fallback';
ROOT.dataset.fxPreloaderDeadlineR562='overdue-callback-direct-finalize-normal-fade-preserved';
ROOT.dataset.fxPreloaderDeadlineR606='compositor-animation-end-advisory-absolute-deadline-owner';
ROOT.dataset.fxPreloaderDeadlineR635='immutable-navigation-boot-min-floor-max-ceiling';
ROOT.dataset.fxPreloaderReleaseOwnerR635='single-idempotent-finalizer';
ROOT.dataset.fxPreloaderPaintOwnerR575='external-css-pseudo-grid-scan-legacy-dom-suppressed';
ROOT.dataset.fxPreloaderPaintOwnerR606='bounded-raster-single-compositor-deadline';
ROOT.dataset.fxPreloaderPaintOwnerR636='sync-no-transform-before-visual-css';ROOT.dataset.fxPreloaderPaintOwnerR641='timing-only-overlay-clock-small-energy-line';
ROOT.dataset.fxPreloaderFinalizeR609='hide-first-no-subtree-animation-enumeration';
ROOT.dataset.fxPreloaderVisualSequenceR635='system-wake-core-sync-ready-reveal';

function copy(){return ROOT.lang==='en'?{heading:'DISCOVER HOW IT WORKS',title:'Proof behind the visual.',body:'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.',ask:'ASK',askAria:'Ask FormatX',controls:'Hero controls',soundOn:'Mute FormatX audio',soundOff:'Enable FormatX audio'}:{heading:'A MŰKÖDÉS MEGISMERÉSE',title:'Bizonyíték a látvány mögött.',body:'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.',ask:'KÉRDEZZ',askAria:'Kérdezz a FormatX-től',controls:'Hero vezérlők',soundOn:'FormatX hang némítása',soundOff:'FormatX hang bekapcsolása'};}
function mutedIcon(){return '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M16 9l5 6"/><path d="M21 9l-5 6"/></svg></span>';}
function soundIcon(){return '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M15 9.2c1.2 1.5 1.2 4.1 0 5.6"/><path d="M18 6.8c2.8 2.9 2.8 7.5 0 10.4"/></svg></span>';}
function professionalAudioOwns(button){return button?.dataset.fxAudioOwner==='professional-v6'||ROOT.dataset.fxAudioOwner==='professional-v6';}
function syncSound(button,on){const strings=copy();button.dataset.fxAudioState=on?'on':'off';button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?strings.soundOn:strings.soundOff);button.innerHTML=on?soundIcon():mutedIcon();if(!professionalAudioOwns(button)){ROOT.dataset.fxAudioState=on?'on':'off';ROOT.dataset.fxAudioOwner='r461-lightweight-first-party';}}
function bindSound(button){if(!(button instanceof HTMLButtonElement)||button.dataset.fxSoundR461==='true')return;button.dataset.fxSoundR461='true';syncSound(button,false);button.addEventListener('click',async event=>{if(professionalAudioOwns(button))return;event.preventDefault();event.stopImmediatePropagation();const next=button.getAttribute('aria-pressed')!=='true';if(!audio){audio=new Audio(AUDIO_URL);audio.loop=true;audio.preload='none';audio.volume=.52;}if(next){try{await audio.play();if(professionalAudioOwns(button)){audio.pause();return;}syncSound(button,true);}catch(_){if(professionalAudioOwns(button))return;syncSound(button,false);ROOT.dataset.fxAudioState='blocked';}}else{audio.pause();if(!professionalAudioOwns(button))syncSound(button,false);}},true);}
function ensureControls(hero,space){const strings=copy();let controls=hero.querySelector('.fx-reference-controls-r204');if(!(controls instanceof HTMLElement)){controls=document.createElement('div');controls.className='fx-reference-controls-r204 fx-reference-controls-r264';}controls.classList.add('fx-reference-controls-r264');controls.setAttribute('aria-label',strings.controls);let sound=controls.querySelector(':scope > .fx-three-sound')||document.querySelector('.fx-three-sound');if(!(sound instanceof HTMLButtonElement)){sound=document.createElement('button');sound.type='button';sound.className='fx-three-sound fx-wda-sound-toggle fx-control-owner-r264';}sound.classList.add('fx-wda-sound-toggle','fx-control-owner-r264');if(sound.parentElement!==controls)controls.prepend(sound);bindSound(sound);let rail=controls.querySelector(':scope > .fx-reference-rail')||hero.querySelector('.fx-reference-rail');if(!(rail instanceof HTMLElement)){rail=document.createElement('div');rail.className='fx-reference-rail fx-reference-rail-r264';}rail.classList.add('fx-reference-rail-r264');let ask=rail.querySelector('.fx-reference-ask');if(!(ask instanceof HTMLButtonElement)){ask=document.createElement('button');ask.type='button';ask.className='fx-reference-ask';ask.innerHTML='<i aria-hidden="true"></i><span></span>';}ask.setAttribute('aria-label',strings.askAria);let askLabel=ask.querySelector('span');if(!(askLabel instanceof HTMLElement)){askLabel=document.createElement('span');ask.appendChild(askLabel);}askLabel.textContent=strings.ask;if(ask.parentElement!==rail)rail.prepend(ask);if(rail.parentElement!==controls)controls.appendChild(rail);if(controls.parentElement!==space)space.appendChild(controls);ROOT.dataset.fxHeroControlContractR528='sound-ask-no-manual-mag-pause';return controls;}
function ensureProof(hero,grid){const strings=copy();let heading=hero.querySelector('.fx-reference-heading');if(!(heading instanceof HTMLElement)){heading=document.createElement('div');heading.className='fx-reference-heading';grid.appendChild(heading);}heading.textContent=strings.heading;let proof=hero.querySelector('.fx-reference-proof');if(!(proof instanceof HTMLElement)){proof=document.createElement('article');proof.className='fx-reference-proof';proof.innerHTML='<span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2></h2><p></p><a class="fx-reference-liveos" href="#experience">Live OS</a>';grid.appendChild(proof);}const title=proof.querySelector('h2'),body=proof.querySelector('p'),live=proof.querySelector('.fx-reference-liveos');if(title)title.textContent=strings.title;if(body)body.textContent=strings.body;if(live instanceof HTMLAnchorElement){live.href='#experience';live.setAttribute('aria-label',ROOT.lang==='en'?'Live OS — open workflow':'Live OS — munkafolyamat megnyitása');}}
function stabilize(){const hero=document.getElementById('hero');const grid=hero?.querySelector(':scope > .hero-grid');const space=grid?.querySelector(':scope > .hero-space');const heroCopy=grid?.querySelector(':scope > .hero-copy');if(!(hero instanceof HTMLElement)||!(grid instanceof HTMLElement)||!(space instanceof HTMLElement)||!(heroCopy instanceof HTMLElement))return false;ensureControls(hero,space);ensureProof(hero,grid);ROOT.dataset.fxHeroCopyPlacementR411='static-dom-css-order';ROOT.dataset.fxFirstPaintControlsR306=MOBILE?'mobile-static-r528':'desktop-static-r528';return true;}
function fixLanguageAccessibleName(){const button=document.querySelector('.fx-language-toggle');if(!(button instanceof HTMLButtonElement))return;const current=ROOT.lang==='en'?'EN':'HU';button.textContent=current;button.setAttribute('aria-label',current==='HU'?'HU – váltás angol nyelvre':'EN – switch to Hungarian');}
function complete(source){document.dispatchEvent(new CustomEvent('formatx:introcomplete',{detail:{source}}));}
function force(node,property,value){if(node instanceof HTMLElement)node.style.setProperty(property,value,'important');}
function clear(node,property){if(node instanceof HTMLElement)node.style.removeProperty(property);}
function animateEffect(node,keyframes,options){if(REDUCED||!(node instanceof HTMLElement)||typeof node.animate!=='function')return;try{node.animate(keyframes,options);}catch(_){} }
function ensureP0FxStyle(){
  let link=document.querySelector('link[data-fx-intro-p0-r575]');
  if(link instanceof HTMLLinkElement){if(!link.href.includes('r635-three-phase-absolute-reveal'))link.href=P0_FX_STYLE;return link;}
  link=document.createElement('link');link.rel='stylesheet';link.href=P0_FX_STYLE;link.dataset.fxIntroP0R575='true';document.head.appendChild(link);return link;
}
function cancelDeadline(){
  if(preloaderDeadlineTimer)clearTimeout(preloaderDeadlineTimer);preloaderDeadlineTimer=0;
  try{preloaderDeadlineAbort?.abort();}catch(_){}
  preloaderDeadlineAbort=null;
}
function cancelPreloaderTimers(){
  if(preloaderTimer)clearTimeout(preloaderTimer);preloaderTimer=0;
  if(preloaderRevealTimer)clearTimeout(preloaderRevealTimer);preloaderRevealTimer=0;
  if(preloaderPhaseTimerA)clearTimeout(preloaderPhaseTimerA);preloaderPhaseTimerA=0;
  if(preloaderPhaseTimerB)clearTimeout(preloaderPhaseTimerB);preloaderPhaseTimerB=0;
}
function armDeadline(callback,delay){
  cancelDeadline();
  const boundedDelay=Math.max(0,delay);
  const browserScheduler=globalThis.scheduler;
  if(browserScheduler&&typeof browserScheduler.postTask==='function'&&typeof AbortController==='function'){
    preloaderDeadlineAbort=new AbortController();
    browserScheduler.postTask(callback,{delay:boundedDelay,priority:'user-blocking',signal:preloaderDeadlineAbort.signal}).catch(()=>{});
    preloaderDeadlineTimer=setTimeout(callback,boundedDelay+16);
    ROOT.dataset.fxPreloaderDeadlineQueueR556='scheduler-user-blocking-plus-timer';
    return;
  }
  preloaderDeadlineTimer=setTimeout(callback,boundedDelay);
  ROOT.dataset.fxPreloaderDeadlineQueueR556='timer-fallback';
}
function setIntroPhase(overlay,phase){
  if(!(overlay instanceof HTMLElement)||preloaderReleased)return;
  overlay.dataset.fxIntroPhaseR635=phase;
  const output=overlay.querySelector('[data-fx-intro-output]');
  const progress=overlay.querySelector('[data-fx-intro-progress]');
  const status=overlay.querySelector('[data-fx-intro-status]');
  const english=ROOT.lang==='en';
  const phases={
    wake:{out:'WAKE',value:24,en:'LIVING MAG STARTING',hu:'ÉLŐ MAG INDÍTÁSA'},
    sync:{out:'SYNC',value:72,en:'MAG SYNCHRONIZING',hu:'MAG SZINKRONIZÁLÁS'},
    ready:{out:'READY',value:100,en:'SYSTEM STABLE',hu:'RENDSZER STABIL'}
  };
  const state=phases[phase]||phases.wake;
  if(output instanceof HTMLOutputElement)output.value=state.out;
  if(progress instanceof HTMLProgressElement){progress.max=100;progress.value=state.value;progress.setAttribute('aria-label',english?state.en:state.hu);}
  if(status instanceof HTMLElement)status.textContent=english?state.en:state.hu;
}
function startReveal(overlay){
  if(preloaderReleased||REDUCED||!(overlay instanceof HTMLElement))return;
  setIntroPhase(overlay,'ready');
  clear(overlay,'opacity');
  overlay.classList.add('fx-preloader-reveal-r635');
  ROOT.dataset.fxPreloaderRevealR635=`inside-window-${Math.round(performance.now()-PRELOADER_BOOT_AT)}`;
}
function finalizePreloader(source){
  if(preloaderReleased)return false;
  preloaderReleased=true;
  cancelPreloaderTimers();
  cancelDeadline();
  const elapsed=performance.now()-PRELOADER_BOOT_AT;
  const overlay=document.getElementById(OVERLAY_ID);
  if(overlay instanceof HTMLElement){
    overlay.hidden=true;
    overlay.setAttribute('aria-hidden','true');
    overlay.dataset.fxPreloaderR531='done';
    overlay.classList.remove('fx-preloader-reveal-r635');
    for(const property of ['display','visibility','opacity','pointer-events','transform','will-change','isolation','contain'])clear(overlay,property);
  }
  ROOT.dataset.fxPreloaderR531='done';
  ROOT.dataset.fxPreloaderReleaseR531=source;
  ROOT.dataset.fxPreloaderReleaseElapsedR635=String(Math.round(elapsed));
  ROOT.dataset.fxPreloaderFinalizerR635='single-dispatch-complete';
  document.dispatchEvent(new CustomEvent('formatx:preloadercomplete',{detail:{source,elapsed}}));
  return true;
}
function requestPreloaderRelease(source){
  if(preloaderReleased)return false;
  const elapsed=performance.now()-PRELOADER_BOOT_AT;
  if(REDUCED){
    if(preloaderReady()||elapsed>=PRELOADER_MAX_MS)return finalizePreloader(source);
    if(preloaderTimer)clearTimeout(preloaderTimer);
    preloaderTimer=setTimeout(()=>requestPreloaderRelease(source),Math.min(40,Math.max(0,PRELOADER_MAX_MS-elapsed)));
    return false;
  }
  if(elapsed<PRELOADER_MIN_MS){
    if(preloaderTimer)clearTimeout(preloaderTimer);
    preloaderTimer=setTimeout(()=>requestPreloaderRelease(source),Math.max(0,PRELOADER_MIN_MS-elapsed));
    return false;
  }
  return finalizePreloader(source);
}
function skipLatePreloader(){
  ROOT.dataset.fxPreloaderLateSkipR533='true';
  finalizePreloader('late-boot-skip');
  return null;
}
function showPreloader(){
  const overlay=document.getElementById(OVERLAY_ID);if(!(overlay instanceof HTMLElement))return null;
  ensureP0FxStyle();
  preloaderReleased=false;overlay.hidden=false;overlay.setAttribute('aria-hidden','true');overlay.dataset.fxPreloaderR531='active';ROOT.dataset.fxPreloaderR531='active';
  overlay.classList.remove('fx-preloader-reveal-r635');
  force(overlay,'display','grid');force(overlay,'visibility','visible');force(overlay,'opacity','1');force(overlay,'pointer-events','none');force(overlay,'transform','none');force(overlay,'will-change','auto');force(overlay,'isolation','auto');force(overlay,'contain','none');
  const center=overlay.querySelector('.fx-intro-center'),word=overlay.querySelector('.fx-intro-word'),wordSpan=overlay.querySelector('.fx-intro-word span'),kicker=overlay.querySelector('.fx-intro-kicker'),subtitle=overlay.querySelector('.fx-intro-subtitle'),meta=overlay.querySelector('.fx-intro-meta'),progressWrap=overlay.querySelector('.fx-intro-progress-wrap');
  force(center,'width','min(520px, calc(100vw - 40px))');force(word,'font-size','clamp(32px,5vw,56px)');force(word,'line-height','1');force(word,'letter-spacing','.08em');force(wordSpan,'opacity','1');force(wordSpan,'transform','none');force(wordSpan,'filter','none');force(kicker,'opacity','1');force(kicker,'transform','none');force(kicker,'letter-spacing','.24em');force(subtitle,'opacity','1');force(subtitle,'transform','none');force(subtitle,'font-size','10px');force(meta,'opacity',MOBILE?'0':'.5');force(meta,'transform','none');force(progressWrap,'opacity','1');force(progressWrap,'transform','none');force(progressWrap,'max-width','560px');force(progressWrap,'margin','0 auto');
  setIntroPhase(overlay,'wake');
  ROOT.dataset.fxPreloaderLegacyEffectsR575='suppressed-quality-layer-external-pseudo-motion';
  return overlay;
}
function preloaderReady(){const hero=document.getElementById('hero');const shell=hero?.querySelector('.fx-reference-mag-button,.fx-crystal-organism-r326-stage,.hero-space')||document.querySelector('.fx-mag-heart-hit-r252');const startup=ROOT.dataset.fxMagStartupContractR530==='living-core-autostart-navigation-owned'||String(ROOT.dataset.fxCurrentMagRequestR530||'').startsWith('navigation-owned')||ROOT.dataset.fxCrystalOrganismR326==='ready';return Boolean(hero&&shell&&startup);}
function runPreloader(overlay){
  if(!(overlay instanceof HTMLElement)){ROOT.dataset.fxPreloaderR531='unavailable';return;}
  const elapsed=()=>performance.now()-PRELOADER_BOOT_AT;
  const scheduleAt=(target,callback)=>setTimeout(callback,Math.max(0,target-elapsed()));
  const absoluteDeadline=()=>finalizePreloader('absolute-deadline');
  armDeadline(absoluteDeadline,Math.max(0,PRELOADER_MAX_MS-elapsed()));
  if(REDUCED){
    preloaderTimer=scheduleAt(PRELOADER_MIN_MS,()=>requestPreloaderRelease('reduced-semantic-ready'));
    return;
  }
  preloaderPhaseTimerA=scheduleAt(PRELOADER_VISUAL_MS*.30,()=>setIntroPhase(overlay,'sync'));
  preloaderPhaseTimerB=scheduleAt(PRELOADER_VISUAL_MS*.75,()=>setIntroPhase(overlay,'ready'));
  preloaderRevealTimer=scheduleAt(PRELOADER_REVEAL_AT_MS,()=>startReveal(overlay));
  overlay.addEventListener('animationend',event=>{
    if(event.target!==overlay||event.animationName!=='fx-r533-preloader-visual-bound')return;
    ROOT.dataset.fxPreloaderVisualEndR635=String(Math.round(elapsed()));
    requestPreloaderRelease('visual-complete');
  },{once:true});
}
function markIntroComplete(source){ROOT.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');ROOT.classList.add('fx-intro-complete');ROOT.dataset.fxIntro=source;complete(source);}
const preloader=PRELOADER_BOOT_AT>=PRELOADER_MAX_MS?skipLatePreloader():showPreloader();
if(preloader)runPreloader(preloader);
stabilize();fixLanguageAccessibleName();ROOT.dataset.fxIntroStrategy=MOBILE?'mobile-r635-three-phase-absolute-deadline':'desktop-r635-three-phase-absolute-deadline';markIntroComplete(PRELOADER_BOOT_AT>=PRELOADER_MAX_MS?'late-skip-r635-living-core':'instant-r635-living-core');
for(const eventName of ['formatx:languagechange','formatx:controlownerready','pageshow'])addEventListener(eventName,()=>{stabilize();queueMicrotask(fixLanguageAccessibleName);},{passive:true});
addEventListener('pagehide',()=>{cancelPreloaderTimers();cancelDeadline();try{audio?.pause();}catch(_){}},{once:true});
addEventListener('error',()=>requestPreloaderRelease('runtime-error'));
addEventListener('unhandledrejection',()=>requestPreloaderRelease('promise-error'));
}());
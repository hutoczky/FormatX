/* FormatX R531/R532 — lightweight preloader over the navigation-owned living core.
   The preloader never owns MAG startup: MAG stays navigation-owned behind the
   overlay, manual PAUSE stays retired, and release is hard-bounded for LCP.
   R531 closeout moves recurring visual effects to compositor-only CSS so this
   runtime owns only progress/status timing and bounded release. R532 adds a
   real geometry-settle gate before reveal without extending the hard cap. */
(function(){
'use strict';

const ROOT=document.documentElement;
const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
const REDUCED=matchMedia('(prefers-reduced-motion:reduce)').matches;
const OVERLAY_ID='formatx-event-horizon';
const PRELOADER_STYLE='./styles/formatx-preloader-r531.css?v=20260905-r531-p0-closeout-fix1';
const AUDIO_URL='./assets/audio/formatx-audio-test.wav?v=20260728-professional-score-v6';
const PRELOADER_MIN_MS=REDUCED?180:(MOBILE?1180:1350);
const PRELOADER_MAX_MS=REDUCED?520:(MOBILE?1450:1650);
const RELEASE_FADE_MS=REDUCED?0:160;
const GEOMETRY_SETTLE_MS=REDUCED?0:(MOBILE?80:180);
let audio=null,preloaderRaf=0,preloaderHardTimer=0,preloaderReleased=false;
let geometryObserver=null,geometryLastChange=performance.now();

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
ROOT.dataset.fxPreloaderMainThreadR531='status-only-css-compositor-effects';
ROOT.dataset.fxPreloaderSettleGateR532='reference-runtime-control-owner-resize-quiet';

function copy(){return ROOT.lang==='en'?{heading:'DISCOVER HOW IT WORKS',title:'Proof behind the visual.',body:'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.',ask:'ASK',askAria:'Ask FormatX',controls:'Hero controls',soundOn:'Mute FormatX audio',soundOff:'Enable FormatX audio'}:{heading:'A MŰKÖDÉS MEGISMERÉSE',title:'Bizonyíték a látvány mögött.',body:'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.',ask:'KÉRDEZZ',askAria:'Kérdezz a FormatX-től',controls:'Hero vezérlők',soundOn:'FormatX hang némítása',soundOff:'FormatX hang bekapcsolása'};}
function mutedIcon(){return '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M16 9l5 6"/><path d="M21 9l-5 6"/></svg></span>';}
function soundIcon(){return '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M15 9.2c1.2 1.5 1.2 4.1 0 5.6"/><path d="M18 6.8c2.8 2.9 2.8 7.5 0 10.4"/></svg></span>';}
function syncSound(button,on){const strings=copy();button.dataset.fxAudioState=on?'on':'off';button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?strings.soundOn:strings.soundOff);button.innerHTML=on?soundIcon():mutedIcon();ROOT.dataset.fxAudioState=on?'on':'off';ROOT.dataset.fxAudioOwner='r461-lightweight-first-party';}
function bindSound(button){if(!(button instanceof HTMLButtonElement)||button.dataset.fxSoundR461==='true')return;button.dataset.fxSoundR461='true';syncSound(button,false);button.addEventListener('click',async event=>{event.preventDefault();event.stopImmediatePropagation();const next=button.getAttribute('aria-pressed')!=='true';if(!audio){audio=new Audio(AUDIO_URL);audio.loop=true;audio.preload='none';audio.volume=.52;}if(next){try{await audio.play();syncSound(button,true);}catch(_){syncSound(button,false);ROOT.dataset.fxAudioState='blocked';}}else{audio.pause();syncSound(button,false);}},true);}
function removeObsoletePause(rootNode){for(const pause of rootNode.querySelectorAll?.('.fx-reference-pause')||[])pause.remove();ROOT.removeAttribute('data-fx-reference-motion-paused');}
function ensureControls(hero,space){const strings=copy();let controls=hero.querySelector('.fx-reference-controls-r204');if(!(controls instanceof HTMLElement)){controls=document.createElement('div');controls.className='fx-reference-controls-r204 fx-reference-controls-r264';}controls.classList.add('fx-reference-controls-r264');controls.hidden=false;controls.removeAttribute('aria-hidden');controls.setAttribute('aria-label',strings.controls);removeObsoletePause(controls);let sound=controls.querySelector(':scope > .fx-three-sound')||document.querySelector('.fx-three-sound');if(!(sound instanceof HTMLButtonElement)){sound=document.createElement('button');sound.type='button';sound.className='fx-three-sound fx-wda-sound-toggle fx-control-owner-r264';}sound.classList.add('fx-wda-sound-toggle','fx-control-owner-r264');sound.hidden=false;sound.removeAttribute('aria-hidden');sound.removeAttribute('tabindex');if(sound.parentElement!==controls)controls.prepend(sound);bindSound(sound);let rail=controls.querySelector(':scope > .fx-reference-rail')||hero.querySelector('.fx-reference-rail');if(!(rail instanceof HTMLElement)){rail=document.createElement('div');rail.className='fx-reference-rail fx-reference-rail-r264';}rail.classList.add('fx-reference-rail-r264');removeObsoletePause(rail);let ask=rail.querySelector('.fx-reference-ask');if(!(ask instanceof HTMLButtonElement)){ask=document.createElement('button');ask.type='button';ask.className='fx-reference-ask';ask.innerHTML='<i aria-hidden="true"></i><span></span>';}ask.hidden=false;ask.removeAttribute('aria-hidden');ask.removeAttribute('tabindex');ask.setAttribute('aria-label',strings.askAria);let askLabel=ask.querySelector('span');if(!(askLabel instanceof HTMLElement)){askLabel=document.createElement('span');ask.appendChild(askLabel);}askLabel.textContent=strings.ask;if(ask.parentElement!==rail)rail.prepend(ask);if(rail.parentElement!==controls)controls.appendChild(rail);if(controls.parentElement!==space)space.appendChild(controls);ROOT.dataset.fxHeroControlContractR528='sound-ask-no-manual-mag-pause';return controls;}
function ensureProof(hero,grid){const strings=copy();let heading=hero.querySelector('.fx-reference-heading');if(!(heading instanceof HTMLElement)){heading=document.createElement('div');heading.className='fx-reference-heading';grid.appendChild(heading);}heading.textContent=strings.heading;let proof=hero.querySelector('.fx-reference-proof');if(!(proof instanceof HTMLElement)){proof=document.createElement('article');proof.className='fx-reference-proof';proof.innerHTML='<span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2></h2><p></p><a class="fx-reference-liveos" href="#experience">Live OS</a>';grid.appendChild(proof);}const title=proof.querySelector('h2'),body=proof.querySelector('p'),live=proof.querySelector('.fx-reference-liveos');if(title)title.textContent=strings.title;if(body)body.textContent=strings.body;if(live instanceof HTMLAnchorElement){live.href='#experience';live.setAttribute('aria-label',ROOT.lang==='en'?'Live OS — open workflow':'Live OS — munkafolyamat megnyitása');}}
function stabilize(){const hero=document.getElementById('hero');const grid=hero?.querySelector(':scope > .hero-grid');const space=grid?.querySelector(':scope > .hero-space');const heroCopy=grid?.querySelector(':scope > .hero-copy');if(!(hero instanceof HTMLElement)||!(grid instanceof HTMLElement)||!(space instanceof HTMLElement)||!(heroCopy instanceof HTMLElement))return false;ensureControls(hero,space);ensureProof(hero,grid);removeObsoletePause(hero);ROOT.dataset.fxHeroCopyPlacementR411='static-dom-css-order';ROOT.dataset.fxFirstPaintControlsR306=MOBILE?'mobile-static-r528':'desktop-static-r528';return true;}
function fixLanguageAccessibleName(){const button=document.querySelector('.fx-language-toggle');if(!(button instanceof HTMLButtonElement))return;const current=ROOT.lang==='en'?'EN':'HU';button.textContent=current;button.setAttribute('aria-label',current==='HU'?'HU – váltás angol nyelvre':'EN – switch to Hungarian');}
function enforceMagVisibleName(){const button=document.querySelector('.topbar .fx-reference-mag-button');if(!(button instanceof HTMLButtonElement))return;button.textContent='MAG';button.setAttribute('aria-label',ROOT.lang==='en'?'Change MAG shape':'A MAG alakjának váltása');}
function complete(source){document.dispatchEvent(new CustomEvent('formatx:introcomplete',{detail:{source}}));}
function ensurePreloaderStyle(){let link=document.querySelector('link[data-fx-preloader-style-r531]');if(link instanceof HTMLLinkElement)return link;link=document.createElement('link');link.rel='stylesheet';link.href=PRELOADER_STYLE;link.fetchPriority='high';link.dataset.fxPreloaderStyleR531='true';(document.head||document.documentElement).appendChild(link);return link;}
function watchGeometry(){
  geometryObserver?.disconnect();geometryObserver=null;geometryLastChange=performance.now();
  if(typeof ResizeObserver!=='function')return;
  const hero=document.getElementById('hero'),grid=hero?.querySelector(':scope > .hero-grid'),copyNode=grid?.querySelector(':scope > .hero-copy');
  const nodes=[grid,copyNode,copyNode?.querySelector('.hero-actions'),copyNode?.querySelector('.fx-hero-product-state')].filter(node=>node instanceof HTMLElement);
  if(!nodes.length)return;
  geometryObserver=new ResizeObserver(()=>{geometryLastChange=performance.now();ROOT.dataset.fxPreloaderGeometryR532='changing';});
  for(const node of nodes)geometryObserver.observe(node);
  ROOT.dataset.fxPreloaderGeometryR532='observing';
}
function referenceGeometryReady(now=performance.now()){
  if(REDUCED)return true;
  const expected=MOBILE?'ready':'desktop';
  const modeReady=ROOT.dataset.fxReferenceProductionR244===expected;
  const runtimeReady=Boolean(ROOT.dataset.fxReferenceRuntimeR254);
  const controlReady=ROOT.dataset.fxControlOwnerR268==='ready';
  const styleReady=MOBILE||Array.from(document.styleSheets).some(sheet=>String(sheet.href||'').includes('formatx-reference-production-r244.css'));
  const quiet=now-geometryLastChange>=GEOMETRY_SETTLE_MS;
  if(modeReady&&runtimeReady&&controlReady&&styleReady&&quiet)ROOT.dataset.fxPreloaderGeometryR532='settled';
  return modeReady&&runtimeReady&&controlReady&&styleReady&&quiet;
}

function showPreloader(){
  const overlay=document.getElementById(OVERLAY_ID);if(!(overlay instanceof HTMLElement))return null;
  preloaderReleased=false;
  overlay.hidden=false;
  overlay.setAttribute('aria-hidden','true');
  overlay.dataset.fxPreloaderStaticR531='true';
  overlay.dataset.fxPreloaderR531='active';
  ROOT.removeAttribute('data-fx-preloader-release-r531');
  ROOT.dataset.fxPreloaderR531='active';
  const output=overlay.querySelector('[data-fx-intro-output]'),progress=overlay.querySelector('[data-fx-intro-progress]'),status=overlay.querySelector('[data-fx-intro-status]');
  if(output instanceof HTMLOutputElement)output.value='000';
  if(progress instanceof HTMLProgressElement)progress.value=0;
  if(status instanceof HTMLElement)status.textContent=ROOT.lang==='en'?'LIVING CORE STARTING':'ÉLŐ MAG INDÍTÁSA';
  return overlay;
}
function preloaderReady(now=performance.now()){const hero=document.getElementById('hero');const shell=hero?.querySelector('.fx-reference-mag-button,.fx-mag-heart-hit-r252,.fx-crystal-organism-r326-stage,.hero-space');const startup=ROOT.dataset.fxMagStartupContractR530==='living-core-autostart-navigation-owned'||String(ROOT.dataset.fxCurrentMagRequestR530||'').startsWith('navigation-owned')||ROOT.dataset.fxCrystalOrganismR326==='ready';return Boolean(hero&&shell&&startup&&referenceGeometryReady(now));}
function updatePreloader(overlay,elapsed){const output=overlay?.querySelector('[data-fx-intro-output]'),progress=overlay?.querySelector('[data-fx-intro-progress]'),status=overlay?.querySelector('[data-fx-intro-status]');const ratio=Math.min(1,elapsed/PRELOADER_MAX_MS),eased=1-Math.pow(1-ratio,2.05),value=Math.min(96,Math.max(5,Math.round(5+eased*91)));if(output instanceof HTMLOutputElement)output.value=String(value).padStart(3,'0');if(progress instanceof HTMLProgressElement)progress.value=value;if(status instanceof HTMLElement){const phase=ratio<.42?0:(ratio<.78?1:2);status.textContent=ROOT.lang==='en'?(phase===0?'LIVING CORE STARTING':phase===1?'MAG SYNCHRONIZING':'SYSTEM READY'):(phase===0?'ÉLŐ MAG INDÍTÁSA':phase===1?'MAG SZINKRONIZÁLÁSA':'RENDSZER KÉSZ');}}
function hidePreloader(source){
  if(preloaderReleased)return;
  preloaderReleased=true;
  if(preloaderRaf)cancelAnimationFrame(preloaderRaf);preloaderRaf=0;
  if(preloaderHardTimer)clearTimeout(preloaderHardTimer);preloaderHardTimer=0;
  const overlay=document.getElementById(OVERLAY_ID);
  if(!(overlay instanceof HTMLElement)){ROOT.dataset.fxPreloaderR531='done';ROOT.dataset.fxPreloaderReleaseR531=source;return;}
  const output=overlay.querySelector('[data-fx-intro-output]'),progress=overlay.querySelector('[data-fx-intro-progress]'),status=overlay.querySelector('[data-fx-intro-status]');
  if(output instanceof HTMLOutputElement)output.value='100';
  if(progress instanceof HTMLProgressElement)progress.value=100;
  if(status instanceof HTMLElement)status.textContent=ROOT.lang==='en'?'READY':'KÉSZ';
  const finalize=()=>{
    geometryObserver?.disconnect();geometryObserver=null;
    ROOT.dataset.fxPreloaderReleaseR531=source;
    overlay.hidden=true;
    overlay.setAttribute('aria-hidden','true');
    overlay.dataset.fxPreloaderR531='done';
    ROOT.dataset.fxPreloaderR531='done';
    document.dispatchEvent(new CustomEvent('formatx:preloadercomplete',{detail:{source}}));
  };
  if(REDUCED){finalize();return;}
  overlay.dataset.fxPreloaderR531='releasing';
  ROOT.dataset.fxPreloaderR531='releasing';
  setTimeout(finalize,RELEASE_FADE_MS);
}
function runPreloader(overlay){
  if(!(overlay instanceof HTMLElement)){ROOT.dataset.fxPreloaderR531='unavailable';return;}
  const started=performance.now();
  preloaderHardTimer=setTimeout(()=>hidePreloader('bounded-timeout'),PRELOADER_MAX_MS);
  const tick=now=>{
    const elapsed=now-started;
    updatePreloader(overlay,elapsed);
    if(elapsed>=PRELOADER_MIN_MS&&preloaderReady(now)){hidePreloader('mag-shell-reference-settled');return;}
    if(elapsed>=PRELOADER_MAX_MS){hidePreloader('bounded-timeout');return;}
    preloaderRaf=requestAnimationFrame(tick);
  };
  preloaderRaf=requestAnimationFrame(tick);
}
function markIntroComplete(source){ROOT.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');ROOT.classList.add('fx-intro-complete');ROOT.dataset.fxIntro=source;complete(source);}

ensurePreloaderStyle();
const preloader=showPreloader();
fixLanguageAccessibleName();enforceMagVisibleName();
ROOT.dataset.fxIntroStrategy=MOBILE?'mobile-direct-r531-living-core':'desktop-direct-r531-living-core';
markIntroComplete('instant-r531-living-core');
watchGeometry();
runPreloader(preloader);
requestAnimationFrame(()=>{stabilize();enforceMagVisibleName();});
for(const eventName of ['formatx:languagechange','formatx:controlownerready','pageshow'])addEventListener(eventName,()=>{stabilize();queueMicrotask(()=>{fixLanguageAccessibleName();enforceMagVisibleName();});},{passive:true});
addEventListener('pagehide',()=>{try{audio?.pause();}catch(_){}geometryObserver?.disconnect();geometryObserver=null;},{once:true});
addEventListener('error',()=>{ROOT.dataset.fxPreloaderRuntimeIssueR531='runtime-error';},{passive:true});
addEventListener('unhandledrejection',()=>{ROOT.dataset.fxPreloaderPromiseIssueR531='promise-error';},{passive:true});
}());

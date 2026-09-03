/* FormatX r461/R507 — lean first-paint owner for the R460/R326 production path.
   Static HTML owns LCP. One current MAG runtime owns rendering; no legacy
   award/regression/Real3D repair stack is mounted after first paint.
   R507 keeps this control as the single user PAUSE state/event owner while the
   MAG shape-sync runtime exclusively owns the canonical CSSAnimation clock. */
(function(){
'use strict';

const ROOT=document.documentElement;
const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
const OVERLAY_ID='formatx-event-horizon';
const AUDIO_URL='./assets/audio/formatx-audio-test.wav?v=20260728-professional-score-v6';
let audio=null;

if(!ROOT.dataset.fxReferenceProductionR244)ROOT.dataset.fxReferenceProductionR244=MOBILE?'ready':'desktop';
ROOT.dataset.fxReferenceComposition=MOBILE?'reference-frame-r244':'desktop-reference-r244';
ROOT.dataset.fxLivingCopyGuard='ready';
ROOT.dataset.fxLivingCopyGuardPolicyR293='static-content-normalized-no-document-scan';
ROOT.dataset.fxHeroLcpOwnerR411='static-html-no-reparent';
ROOT.dataset.fxStartupOwnerR461='single-current-runtime-no-postdom-repair-stack';
ROOT.dataset.fxAwardRuntimeMode='retired-from-first-load-r461';
ROOT.dataset.fxMobileRegressionR310='retired-from-first-load-r461';
ROOT.dataset.fxCoreReal3dCssR310='retired-r461-r326-owner';

function copy(){
  return ROOT.lang==='en'?{
    heading:'DISCOVER HOW IT WORKS',title:'Proof behind the visual.',
    body:'FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.',
    ask:'ASK',askAria:'Ask FormatX',controls:'Hero controls',pause:'Pause animation',resume:'Resume animation',soundOn:'Mute FormatX audio',soundOff:'Enable FormatX audio'
  }:{
    heading:'A MŰKÖDÉS MEGISMERÉSE',title:'Bizonyíték a látvány mögött.',
    body:'A FormatX nem kér vak bizalmat: a kiadás, a tesztek, a korlátozások és a biztonsági modell külön, nyilvánosan ellenőrizhető.',
    ask:'KÉRDEZZ',askAria:'Kérdezz a FormatX-től',controls:'Hero vezérlők',pause:'Animáció szüneteltetése',resume:'Animáció folytatása',soundOn:'FormatX hang némítása',soundOff:'FormatX hang bekapcsolása'
  };
}

function mutedIcon(){
  return '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M16 9l5 6"/><path d="M21 9l-5 6"/></svg></span>';
}
function soundIcon(){
  return '<span class="fx-wda-sound-icon" data-fx-wda-sound-label="true" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.4h3.2L11 6.3v11.4l-3.8-3.1H4z"/><path d="M15 9.2c1.2 1.5 1.2 4.1 0 5.6"/><path d="M18 6.8c2.8 2.9 2.8 7.5 0 10.4"/></svg></span>';
}

function syncSound(button,on){
  const strings=copy();
  button.dataset.fxAudioState=on?'on':'off';
  button.setAttribute('aria-pressed',String(on));
  button.setAttribute('aria-label',on?strings.soundOn:strings.soundOff);
  button.innerHTML=on?soundIcon():mutedIcon();
  ROOT.dataset.fxAudioState=on?'on':'off';
  ROOT.dataset.fxAudioOwner='r461-lightweight-first-party';
}
function bindSound(button){
  if(!(button instanceof HTMLButtonElement)||button.dataset.fxSoundR461==='true')return;
  button.dataset.fxSoundR461='true';
  syncSound(button,false);
  button.addEventListener('click',async event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    const next=button.getAttribute('aria-pressed')!=='true';
    if(!audio){
      audio=new Audio(AUDIO_URL);
      audio.loop=true;
      audio.preload='none';
      audio.volume=.52;
    }
    if(next){
      try{
        await audio.play();
        syncSound(button,true);
      }catch(_){
        syncSound(button,false);
        ROOT.dataset.fxAudioState='blocked';
      }
    }else{
      audio.pause();
      syncSound(button,false);
    }
  },true);
}

function syncCanonicalMagAnimations(paused){
  /* R507: telemetry only. The R505 mag-shape-sync runtime is the exclusive
     CSSAnimation pause/resume owner. Calling WAAPI play()/pause() here as well
     created overlapping pending animation tasks from the same physical click. */
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  ROOT.dataset.fxCanonicalMagMotionR497=paused?'paused':reduced?'reduced-motion':'running';
  ROOT.dataset.fxCanonicalMagClockOwnerR507='mag-shape-sync-r476-only';
}

function bindPause(button){
  if(!(button instanceof HTMLButtonElement)||button.dataset.fxPauseR461==='true')return;
  button.dataset.fxPauseR461='true';
  if(!button.dataset.paused)button.dataset.paused='false';
  button.setAttribute('aria-pressed',button.dataset.paused);
  button.addEventListener('click',event=>{
    // Cached compatibility code may already have consumed pointerup/click.
    // Never toggle a second time after that earlier owner handled the event.
    if(event.defaultPrevented)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const paused=button.dataset.paused!=='true';
    button.dataset.paused=String(paused);
    ROOT.dataset.fxReferenceMotionPaused=String(paused);
    const strings=copy();
    button.setAttribute('aria-pressed',String(paused));
    button.textContent=paused?'▶':'Ⅱ';
    button.setAttribute('aria-label',paused?strings.resume:strings.pause);
    dispatchEvent(new CustomEvent('formatx:referencepause',{detail:{paused,source:'r461-canonical-control'}}));
    // R507: publish the visible control state only. The event consumer in
    // formatx-mag-shape-sync-r476.js owns the one canonical CSSAnimation clock.
    syncCanonicalMagAnimations(paused);
  });
}

function ensureControls(hero,space){
  const strings=copy();
  let controls=hero.querySelector('.fx-reference-controls-r204');
  if(!(controls instanceof HTMLElement)){
    controls=document.createElement('div');
    controls.className='fx-reference-controls-r204 fx-reference-controls-r264';
  }
  controls.classList.add('fx-reference-controls-r264');
  controls.setAttribute('aria-label',strings.controls);

  let sound=controls.querySelector(':scope > .fx-three-sound')||document.querySelector('.fx-three-sound');
  if(!(sound instanceof HTMLButtonElement)){
    sound=document.createElement('button');
    sound.type='button';
    sound.className='fx-three-sound fx-wda-sound-toggle fx-control-owner-r264';
  }
  sound.classList.add('fx-wda-sound-toggle','fx-control-owner-r264');
  if(sound.parentElement!==controls)controls.prepend(sound);
  bindSound(sound);

  let rail=controls.querySelector(':scope > .fx-reference-rail')||hero.querySelector('.fx-reference-rail');
  if(!(rail instanceof HTMLElement)){
    rail=document.createElement('div');
    rail.className='fx-reference-rail fx-reference-rail-r264';
  }
  rail.classList.add('fx-reference-rail-r264');

  let ask=rail.querySelector('.fx-reference-ask');
  if(!(ask instanceof HTMLButtonElement)){
    ask=document.createElement('button');ask.type='button';ask.className='fx-reference-ask';ask.innerHTML='<i aria-hidden="true"></i><span></span>';
  }
  ask.setAttribute('aria-label',strings.askAria);
  let askLabel=ask.querySelector('span');
  if(!(askLabel instanceof HTMLElement)){askLabel=document.createElement('span');ask.appendChild(askLabel);}
  askLabel.textContent=strings.ask;

  let pause=rail.querySelector('.fx-reference-pause');
  if(!(pause instanceof HTMLButtonElement)){
    pause=document.createElement('button');pause.type='button';pause.className='fx-reference-pause';pause.textContent='Ⅱ';pause.dataset.paused='false';
  }
  pause.setAttribute('aria-label',pause.dataset.paused==='true'?strings.resume:strings.pause);
  bindPause(pause);

  if(ask.parentElement!==rail)rail.prepend(ask);
  if(pause.parentElement!==rail)rail.appendChild(pause);
  if(rail.parentElement!==controls)controls.appendChild(rail);
  if(controls.parentElement!==space)space.appendChild(controls);
  return controls;
}

function ensureProof(hero,grid){
  const strings=copy();
  let heading=hero.querySelector('.fx-reference-heading');
  if(!(heading instanceof HTMLElement)){heading=document.createElement('div');heading.className='fx-reference-heading';grid.appendChild(heading);}
  heading.textContent=strings.heading;

  let proof=hero.querySelector('.fx-reference-proof');
  if(!(proof instanceof HTMLElement)){
    proof=document.createElement('article');proof.className='fx-reference-proof';
    proof.innerHTML='<span class="fx-reference-proof-kicker">PUBLIC PROOF LAYER</span><h2></h2><p></p><a class="fx-reference-liveos" href="#experience">Live OS</a>';
    grid.appendChild(proof);
  }
  const title=proof.querySelector('h2'),body=proof.querySelector('p'),live=proof.querySelector('.fx-reference-liveos');
  if(title)title.textContent=strings.title;
  if(body)body.textContent=strings.body;
  if(live instanceof HTMLAnchorElement){live.href='#experience';live.setAttribute('aria-label',ROOT.lang==='en'?'Live OS — open workflow':'Live OS — munkafolyamat megnyitása');}
}

function stabilize(){
  const hero=document.getElementById('hero');
  const grid=hero?.querySelector(':scope > .hero-grid');
  const space=grid?.querySelector(':scope > .hero-space');
  const heroCopy=grid?.querySelector(':scope > .hero-copy');
  if(!(hero instanceof HTMLElement)||!(grid instanceof HTMLElement)||!(space instanceof HTMLElement)||!(heroCopy instanceof HTMLElement))return false;
  ensureControls(hero,space);
  ensureProof(hero,grid);
  ROOT.dataset.fxHeroCopyPlacementR411='static-dom-css-order';
  ROOT.dataset.fxFirstPaintControlsR306=MOBILE?'mobile-static-r461':'desktop-static-r461';
  return true;
}

function fixLanguageAccessibleName(){
  const button=document.querySelector('.fx-language-toggle');
  if(!(button instanceof HTMLButtonElement))return;
  const current=ROOT.lang==='en'?'EN':'HU';
  button.textContent=current;
  button.setAttribute('aria-label',current==='HU'?'HU – váltás angol nyelvre':'EN – switch to Hungarian');
}

function complete(source){document.dispatchEvent(new CustomEvent('formatx:introcomplete',{detail:{source}}));}
function fastRelease(source){
  const overlay=document.getElementById(OVERLAY_ID);
  if(overlay){overlay.hidden=true;overlay.setAttribute('aria-hidden','true');}
  ROOT.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');
  ROOT.classList.add('fx-intro-complete');
  ROOT.dataset.fxIntro=source;
  complete(source);
}

stabilize();
fixLanguageAccessibleName();
ROOT.dataset.fxIntroStrategy=MOBILE?'mobile-direct-r461-clean':'desktop-direct-r461-clean';
fastRelease('instant-r461-clean');

for(const eventName of ['formatx:languagechange','formatx:controlownerready','pageshow']){
  addEventListener(eventName,()=>{stabilize();queueMicrotask(fixLanguageAccessibleName);},{passive:true});
}
addEventListener('pagehide',()=>{try{audio?.pause();}catch(_){}},{once:true});
addEventListener('error',()=>fastRelease('runtime-error'));
addEventListener('unhandledrejection',()=>fastRelease('promise-error'));
}());
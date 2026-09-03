/* FormatX R476/R510 — synchronize Mini MAG/header shape and living energy with
   the primary MAG. One semantic state, one WebGL renderer, zero JS idle loop.
   R502 binds delayed compositor sync to the canonical pause state and preserves
   the CSSAnimation clock when a paused animation instance is recreated.
   R505 avoids writing currentTime after the CSS animation returns to running.
   R508 removes WAAPI pause/play lifecycle ownership entirely: canonical CSS
   animation-play-state owns PAUSE/RESUME.
   R509 resolved explicit holds against the document timeline. R510 avoids
   creating that hold on the normal stable-object path: currentTime is written
   only when a genuinely recreated paused CSSAnimation needs phase restoration. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMagShapeSyncR476==='ready-r502')return;
root.dataset.fxMagShapeSyncR476='booting-r502';

const STYLE='/scifi-ui/styles/formatx-mag-visual-sync-r476.css?v=20260831-r479-colour-depth-soft-living-primary-r4791-user-pause-aware';
const MOBILE_OPTICS='/scifi-ui/styles/formatx-mag-mobile-optics-r480.css?v=20260901-r488-restrained-glow-soft-edge-compositor-pulse';
const LIVING_BALANCE='/scifi-ui/styles/formatx-mag-living-balance-r481.css?v=20260831-r482-spectrum-soft-edge';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let observer=null;
let pulseTimer=0;
let lastEnergyBolt='';
const frozenClockByName=new Map();

function ensureStyle(){
  let link=document.querySelector('link[data-fx-mag-visual-sync-r476]');
  if(link instanceof HTMLLinkElement){
    if(!link.href.includes('r4791-user-pause-aware'))link.href=STYLE;
    return link;
  }
  link=document.createElement('link');
  link.rel='stylesheet';
  link.href=STYLE;
  link.dataset.fxMagVisualSyncR476='true';
  document.head.appendChild(link);
  return link;
}
function ensureMobileOptics(){
  let link=document.querySelector('link[data-fx-mag-mobile-optics-r480]');
  if(link instanceof HTMLLinkElement){
    if(!link.href.includes('r488-restrained-glow-soft-edge-compositor-pulse'))link.href=MOBILE_OPTICS;
    return link;
  }
  link=document.createElement('link');
  link.rel='stylesheet';
  link.href=MOBILE_OPTICS;
  link.dataset.fxMagMobileOpticsR480='true';
  document.head.appendChild(link);
  return link;
}
function ensureLivingBalance(){
  let link=document.querySelector('link[data-fx-mag-living-balance-r481]');
  if(link instanceof HTMLLinkElement){
    if(!link.href.includes('r482-spectrum-soft-edge'))link.href=LIVING_BALANCE;
    return link;
  }
  link=document.createElement('link');
  link.rel='stylesheet';
  link.href=LIVING_BALANCE;
  link.dataset.fxMagLivingBalanceR481='true';
  document.head.appendChild(link);
  return link;
}
function currentShape(){
  const apiShape=typeof window.FormatXCoreShapeR337?.get==='function'?window.FormatXCoreShapeR337.get():'';
  const state=String(apiShape||root.dataset.fxCoreShapeR337||'crystal');
  return state==='sphere'?'sphere':'crystal';
}
function userPaused(){
  const pause=document.querySelector('.fx-reference-pause');
  if(pause instanceof HTMLButtonElement){
    return pause.dataset.paused==='true'||pause.getAttribute('aria-pressed')==='true';
  }
  return root.dataset.fxReferenceMotionPaused==='true';
}
function primaryCanvas(){
  const node=document.querySelector('#hero .fx-crystal-organism-r326-canvas');
  return node instanceof HTMLCanvasElement?node:null;
}
function lifeNodes(){
  return [
    document.querySelector('.topbar .fx-reference-mag-button'),
    document.querySelector('.fx-mini-mag-launcher-r459'),
    document.querySelector('.fx-mini-mag-glyph-r459'),
    document.querySelector('.fx-mini-mag-assistant-r459'),
    document.querySelector('#hero .fx-crystal-organism-r326-stage'),
    primaryCanvas()
  ].filter(node=>node instanceof HTMLElement);
}
function steadyLife(){
  return reduced.matches?'steady':'breath';
}
function animationKey(animation,index){
  const name=String(animation.animationName||'').trim();
  return name||`animation-${index}`;
}
function freezeAnimation(animation,key){
  let state=frozenClockByName.get(key);
  if(!state||!Number.isFinite(state.time)){
    const now=Number(animation.currentTime);
    state={time:Number.isFinite(now)?now:0,animation,pinned:false};
    frozenClockByName.set(key,state);
    return;
  }
  /* R510: CSS animation-play-state already freezes a stable CSSAnimation by
     itself. Writing currentTime on that same object creates an unnecessary WAAPI
     hold which can stall DocumentTimeline progress after RESUME on a hosted
     Chromium runner. Only a genuinely recreated paused animation needs its
     visual phase restored to the previously frozen time. */
  if(state.animation===animation)return;
  state.animation=animation;
  const frozen=state.time;
  try{animation.currentTime=frozen;state.pinned=true;}catch(_){}
}
function releaseFrozenAnimation(animation,key){
  const state=frozenClockByName.get(key);
  if(!state)return true;
  if(!state.pinned){
    frozenClockByName.delete(key);
    return true;
  }
  const frozen=state.time;
  const timelineTime=Number(animation.timeline&&animation.timeline.currentTime);
  const rate=Number(animation.playbackRate);
  if(!Number.isFinite(timelineTime)||!Number.isFinite(rate)||rate===0)return false;
  /* Recreation-only currentTime restoration can still create a hold. Resolve
     that exceptional hold against the document timeline without introducing a
     second pause/play lifecycle owner. The normal stable-object path never gets
     here and therefore resumes entirely through CSS animation-play-state. */
  try{animation.startTime=timelineTime-(frozen/rate);}catch(_){return false;}
  const released=Number.isFinite(Number(animation.startTime))&&!animation.pending;
  if(released)frozenClockByName.delete(key);
  return released;
}
function syncPrimaryPlayback(paused=userPaused()){
  const canvas=primaryCanvas();
  if(!canvas)return false;
  const stop=reduced.matches||paused;
  canvas.style.setProperty('animation-play-state',stop?'paused':'running','important');
  const animations=canvas.getAnimations();
  if(stop){
    animations.forEach((animation,index)=>freezeAnimation(animation,animationKey(animation,index)));
  }else{
    animations.forEach((animation,index)=>releaseFrozenAnimation(animation,animationKey(animation,index)));
  }
  root.dataset.fxPrimaryMagPlaybackR498=stop?(reduced.matches?'reduced':'paused'):'running';
  root.dataset.fxPrimaryMagPauseContractR502='canonical-currenttime-pin-recreated-animation-safe';
  root.dataset.fxPrimaryMagPauseContractR505='resume-existing-hold-time-no-running-currenttime-repin';
  root.dataset.fxPrimaryMagPauseContractR508='css-play-state-owner-currenttime-pin-no-waapi-lifecycle';
  root.dataset.fxPrimaryMagPauseContractR509='css-state-owner-deterministic-starttime-release';
  root.dataset.fxPrimaryMagPauseContractR510='stable-object-css-pause-recreation-only-currenttime-pin';
  return true;
}
function syncPlaybackSoon(forcePause=false){
  const syncNow=()=>syncPrimaryPlayback(forcePause||userPaused());
  syncNow();
  queueMicrotask(syncNow);
  requestAnimationFrame(syncNow);
}
function setLife(state){
  for(const node of lifeNodes())node.dataset.fxMagLife=state;
  root.dataset.fxMiniMagLifeR478=state;
  root.dataset.fxMiniMagLifeR479=state;
  root.dataset.fxPrimaryMagLifeR479=state;
  root.dataset.fxPrimaryMagLifeR481=state;
  root.dataset.fxPrimaryMagLifeR482=state;
}
function applyCanonicalLife(){
  if(reduced.matches){
    setLife('steady');
    syncPlaybackSoon(true);
    return;
  }
  if(userPaused()){
    syncPlaybackSoon(true);
    return;
  }
  setLife('breath');
  syncPlaybackSoon(false);
}
function pulse(source){
  if(reduced.matches){
    setLife('steady');
    syncPlaybackSoon(true);
    return false;
  }
  if(document.hidden||userPaused()){
    syncPlaybackSoon(true);
    return false;
  }
  clearTimeout(pulseTimer);
  setLife('pulse');
  syncPlaybackSoon(false);
  root.dataset.fxMiniMagEnergySourceR478=String(source||'primary-mag');
  root.dataset.fxMiniMagEnergySourceR479=String(source||'primary-mag');
  root.dataset.fxPrimaryMagEnergySourceR481=String(source||'primary-mag');
  root.dataset.fxPrimaryMagEnergySourceR482=String(source||'primary-mag');
  pulseTimer=setTimeout(()=>{
    if(userPaused()||document.hidden){
      syncPlaybackSoon(true);
      return;
    }
    setLife(steadyLife());
    syncPlaybackSoon(false);
  },620);
  return true;
}
function sync(){
  const shape=currentShape();
  const header=document.querySelector('.topbar .fx-reference-mag-button');
  const launcher=document.querySelector('.fx-mini-mag-launcher-r459');
  const glyph=document.querySelector('.fx-mini-mag-glyph-r459');
  const host=document.querySelector('.fx-mini-mag-assistant-r459');
  for(const node of [header,launcher,glyph,host]){
    if(node instanceof HTMLElement){
      node.dataset.fxCoreShape=shape;
      if(!node.dataset.fxMagLife)node.dataset.fxMagLife=steadyLife();
    }
  }
  for(const node of lifeNodes())if(!node.dataset.fxMagLife)node.dataset.fxMagLife=steadyLife();
  root.dataset.fxMiniMagShapeR476=shape;
  root.dataset.fxMiniMagShapeSyncR476=`ready-${shape}`;
  root.dataset.fxMagShapeSyncR476='ready-r502';
  root.dataset.fxMiniMagLifeContractR478='primary-energy-sync-compositor-breath-zero-js-idle';
  root.dataset.fxMiniMagLifeContractR479='primary-and-mini-compositor-breath-colour-depth-zero-js-idle';
  root.dataset.fxPrimaryMagPauseContractR479='user-pause-only-governor-zero-frame-does-not-freeze-compositor-life';
  root.dataset.fxPrimaryMagPauseContractR498='persistent-css-animation-clock-waapi-play-state';
  root.dataset.fxPrimaryMagPauseContractR502='canonical-currenttime-pin-recreated-animation-safe';
  root.dataset.fxPrimaryMagPauseContractR505='resume-existing-hold-time-no-running-currenttime-repin';
  root.dataset.fxPrimaryMagPauseContractR508='css-play-state-owner-currenttime-pin-no-waapi-lifecycle';
  root.dataset.fxPrimaryMagPauseContractR509='css-state-owner-deterministic-starttime-release';
  root.dataset.fxPrimaryMagPauseContractR510='stable-object-css-pause-recreation-only-currenttime-pin';
  root.dataset.fxPrimaryMagOpticsR480='restrained-mobile-glow-feathered-edge';
  root.dataset.fxPrimaryMagOpticsR481='cross-device-breath-softer-phone-halo-and-edge';
  root.dataset.fxPrimaryMagOpticsR482='restrained-soft-spectrum-mobile-edge';
  root.dataset.fxPrimaryMagOpticsR486='calmer-luminance-feathered-mobile-silhouette';
  root.dataset.fxPrimaryMagOpticsR488='restrained-glow-soft-edge-compositor-pulse';
  root.dataset.fxPrimaryMagLifeContractR481='desktop-mobile-compositor-breath-zero-webgl-idle';
  root.dataset.fxPrimaryMagLifeContractR482='large-mini-header-spectrum-breath-zero-webgl-idle';
}
function onCoreInteraction(event){
  const phase=String(event.detail?.phase||'interaction');
  if(phase==='press'||phase==='release'||phase==='pulse'||phase==='boost'||phase==='interaction')pulse(`core-${phase}`);
}
function inspectRootState(records){
  let needsSync=false;
  let pauseChanged=false;
  for(const record of records){
    if(record.attributeName==='data-fx-core-shape-r337')needsSync=true;
    if(record.attributeName==='data-fx-reference-motion-paused')pauseChanged=true;
    if(record.attributeName==='data-fx-core-energy-bolt-r455'){
      const bolt=String(root.dataset.fxCoreEnergyBoltR455||'');
      if(bolt&&bolt!==lastEnergyBolt){
        lastEnergyBolt=bolt;
        if(bolt.startsWith('surface-sweep-'))pulse(bolt);
      }
    }
  }
  if(needsSync)sync();
  if(pauseChanged)applyCanonicalLife();
}
function boot(){
  ensureStyle();
  ensureMobileOptics();
  ensureLivingBalance();
  sync();
  applyCanonicalLife();
  lastEnergyBolt=String(root.dataset.fxCoreEnergyBoltR455||'');
  if(!observer){
    observer=new MutationObserver(inspectRootState);
    observer.observe(root,{attributes:true,attributeFilter:[
      'data-fx-core-shape-r337',
      'data-fx-core-energy-bolt-r455',
      'data-fx-reference-motion-paused'
    ]});
  }
}
for(const name of [
  'formatx:controlownerready',
  'formatx:minimagready',
  'formatx:currentmagready',
  'formatx:real3dready',
  'formatx:languagechange',
  'pageshow'
])addEventListener(name,()=>{sync();applyCanonicalLife();},{passive:true});

addEventListener('formatx:referencepause',event=>{
  const paused=event.detail?.paused===true;
  if(paused){
    clearTimeout(pulseTimer);
    pulseTimer=0;
    syncPlaybackSoon(true);
    return;
  }
  applyCanonicalLife();
},{passive:true});
addEventListener('formatx:coreinteraction',onCoreInteraction,{passive:true});
addEventListener('formatx:coreshapechange',()=>{sync();pulse('shape-change');},{passive:true});
addEventListener('visibilitychange',()=>{
  if(document.hidden){
    if(reduced.matches)setLife('steady');
    syncPlaybackSoon(true);
  }else applyCanonicalLife();
},{passive:true});

document.addEventListener('pointerdown',event=>{
  const target=event.target instanceof Element?event.target.closest('#hero .hero-space,.fx-reference-mag-button,.fx-mini-mag-launcher-r459,[data-action="shape"]'):null;
  if(!target)return;
  if(target.closest('.fx-reference-controls-r204'))return;
  pulse(target.closest('.fx-mini-mag-launcher-r459')?'mini-mag-direct':'primary-mag-direct');
  if(target.matches('.fx-reference-mag-button,[data-action="shape"]')){
    queueMicrotask(sync);
    setTimeout(()=>{sync();applyCanonicalLife();},80);
  }
},{passive:true,capture:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
for(const delay of [120,420,1200])setTimeout(()=>{sync();applyCanonicalLife();},delay);
}());

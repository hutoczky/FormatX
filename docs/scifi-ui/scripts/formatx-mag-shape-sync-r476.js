/* FormatX R476/R528 — synchronize Mini MAG/header shape and living energy with
   the primary MAG. One semantic state, one WebGL renderer, zero JS idle loop.
   R528 product contract: the MAG is the living core and remains continuously
   alive in normal foreground operation. Motion suspension is reserved for
   prefers-reduced-motion and automatic background lifecycle efficiency. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMagShapeSyncR476==='ready-r528')return;
root.dataset.fxMagShapeSyncR476='booting-r528';

const STYLE='/scifi-ui/styles/formatx-mag-visual-sync-r476.css?v=20260905-r528-living-core';
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
    if(!link.href.includes('r528-living-core'))link.href=STYLE;
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
function steadyLife(){return reduced.matches?'steady':'breath';}
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
  if(state.animation===animation)return;
  state.animation=animation;
  try{animation.currentTime=state.time;state.pinned=true;}catch(_){}
}
function releaseFrozenAnimation(animation,key){
  const state=frozenClockByName.get(key);
  if(!state)return true;
  const timelineTime=Number(animation.timeline&&animation.timeline.currentTime);
  const rate=Number(animation.playbackRate);
  if(!Number.isFinite(timelineTime)||!Number.isFinite(rate)||rate===0)return false;
  const startTime=Number(animation.startTime);
  const unresolved=state.pinned||animation.pending||!Number.isFinite(startTime);
  if(!unresolved){
    frozenClockByName.delete(key);
    return true;
  }
  try{animation.startTime=timelineTime-(state.time/rate);}catch(_){return false;}
  const released=Number.isFinite(Number(animation.startTime))&&!animation.pending;
  if(released)frozenClockByName.delete(key);
  return released;
}
function syncPrimaryPlayback(forceStop=false){
  const canvas=primaryCanvas();
  if(!canvas)return false;
  const background=document.hidden===true;
  const stop=reduced.matches||background||forceStop;
  const expectedPlayState=stop?'paused':'running';
  canvas.style.setProperty('animation-play-state',expectedPlayState,'important');
  const committed=String(getComputedStyle(canvas).animationPlayState||'').trim();
  root.dataset.fxPrimaryMagCssPlaybackR511=committed||'unknown';
  const animations=canvas.getAnimations();
  if(stop)animations.forEach((animation,index)=>freezeAnimation(animation,animationKey(animation,index)));
  else animations.forEach((animation,index)=>releaseFrozenAnimation(animation,animationKey(animation,index)));
  root.dataset.fxPrimaryMagPlaybackR498=reduced.matches?'reduced':(background||forceStop?'background':'running');
  root.dataset.fxPrimaryMagLivingContractR528='continuous-normal-reduced-motion-background-safe';
  return true;
}
function syncPlaybackSoon(forceStop=false){
  const syncNow=()=>syncPrimaryPlayback(forceStop);
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
  if(document.hidden){
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
  if(document.hidden){
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
    if(document.hidden){syncPlaybackSoon(true);return;}
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
  root.dataset.fxMagShapeSyncR476='ready-r528';
  root.dataset.fxMiniMagLifeContractR478='primary-energy-sync-compositor-breath-zero-js-idle';
  root.dataset.fxMiniMagLifeContractR479='primary-and-mini-compositor-breath-colour-depth-zero-js-idle';
  root.dataset.fxPrimaryMagLivingContractR528='continuous-normal-reduced-motion-background-safe';
  root.dataset.fxPrimaryMagOpticsR480='restrained-mobile-glow-feathered-edge';
  root.dataset.fxPrimaryMagOpticsR481='cross-device-breath-softer-phone-halo-and-edge';
  root.dataset.fxPrimaryMagOpticsR482='restrained-soft-spectrum-mobile-edge';
  root.dataset.fxPrimaryMagOpticsR486='calmer-luminance-feathered-mobile-silhouette';
  root.dataset.fxPrimaryMagOpticsR488='restrained-glow-soft-edge-compositor-pulse';
  root.dataset.fxPrimaryMagLifeContractR481='desktop-mobile-compositor-breath-zero-webgl-idle';
  root.dataset.fxPrimaryMagLifeContractR482='large-mini-header-spectrum-breath-zero-webgl-idle';
  root.dataset.fxMagProductContractR528='living-core-continuous-normal-motion';
}
function onCoreInteraction(event){
  const phase=String(event.detail?.phase||'interaction');
  if(phase==='press'||phase==='release'||phase==='pulse'||phase==='boost'||phase==='interaction')pulse(`core-${phase}`);
}
function inspectRootState(records){
  let needsSync=false;
  for(const record of records){
    if(record.attributeName==='data-fx-core-shape-r337')needsSync=true;
    if(record.attributeName==='data-fx-core-energy-bolt-r455'){
      const bolt=String(root.dataset.fxCoreEnergyBoltR455||'');
      if(bolt&&bolt!==lastEnergyBolt){
        lastEnergyBolt=bolt;
        if(bolt.startsWith('surface-sweep-'))pulse(bolt);
      }
    }
  }
  if(needsSync)sync();
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
      'data-fx-core-energy-bolt-r455'
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

addEventListener('formatx:coreinteraction',onCoreInteraction,{passive:true});
addEventListener('formatx:coreshapechange',()=>{sync();pulse('shape-change');},{passive:true});
addEventListener('visibilitychange',()=>{
  if(document.hidden){
    clearTimeout(pulseTimer);
    pulseTimer=0;
    if(reduced.matches)setLife('steady');
    syncPlaybackSoon(true);
  }else applyCanonicalLife();
},{passive:true});
if(typeof reduced.addEventListener==='function')reduced.addEventListener('change',applyCanonicalLife);
else if(typeof reduced.addListener==='function')reduced.addListener(applyCanonicalLife);

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

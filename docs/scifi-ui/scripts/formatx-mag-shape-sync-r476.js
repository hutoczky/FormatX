/* FormatX R476/R479 — synchronize Mini MAG/header shape and living energy with
   the primary MAG. One semantic state, one WebGL renderer, zero JS idle loop.
   R479.1 distinguishes the mobile render governor's zero-frame pause flag from
   an explicit user PAUSE action, so the compositor breathing remains alive. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMagShapeSyncR476==='ready-r479')return;
root.dataset.fxMagShapeSyncR476='booting-r479';

const STYLE='/scifi-ui/styles/formatx-mag-visual-sync-r476.css?v=20260831-r479-colour-depth-soft-living-primary-r4791-user-pause-aware';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let observer=null;
let pulseTimer=0;
let lastEnergyBolt='';

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

function currentShape(){
  const apiShape=typeof window.FormatXCoreShapeR337?.get==='function'?window.FormatXCoreShapeR337.get():'';
  const state=String(apiShape||root.dataset.fxCoreShapeR337||'crystal');
  return state==='sphere'?'sphere':'crystal';
}

function userPaused(){
  const pause=document.querySelector('.fx-reference-pause');
  if(!(pause instanceof HTMLButtonElement))return false;
  return pause.dataset.paused==='true'||pause.getAttribute('aria-pressed')==='true';
}

function lifeNodes(){
  return [
    document.querySelector('.topbar .fx-reference-mag-button'),
    document.querySelector('.fx-mini-mag-launcher-r459'),
    document.querySelector('.fx-mini-mag-glyph-r459'),
    document.querySelector('.fx-mini-mag-assistant-r459'),
    document.querySelector('#hero .fx-crystal-organism-r326-stage'),
    document.querySelector('#hero .fx-crystal-organism-r326-canvas')
  ].filter(node=>node instanceof HTMLElement);
}

function steadyLife(){
  return reduced.matches||userPaused()?'steady':'breath';
}

function setLife(state){
  for(const node of lifeNodes())node.dataset.fxMagLife=state;
  root.dataset.fxMiniMagLifeR478=state;
  root.dataset.fxMiniMagLifeR479=state;
  root.dataset.fxPrimaryMagLifeR479=state;
}

function pulse(source){
  if(reduced.matches||document.hidden||userPaused()){
    setLife('steady');
    return false;
  }
  clearTimeout(pulseTimer);
  setLife('pulse');
  root.dataset.fxMiniMagEnergySourceR478=String(source||'primary-mag');
  root.dataset.fxMiniMagEnergySourceR479=String(source||'primary-mag');
  pulseTimer=setTimeout(()=>setLife(steadyLife()),620);
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
  root.dataset.fxMagShapeSyncR476='ready-r479';
  root.dataset.fxMiniMagLifeContractR478='primary-energy-sync-compositor-breath-zero-js-idle';
  root.dataset.fxMiniMagLifeContractR479='primary-and-mini-compositor-breath-colour-depth-zero-js-idle';
  root.dataset.fxPrimaryMagPauseContractR479='user-pause-only-governor-zero-frame-does-not-freeze-compositor-life';
}

function onCoreInteraction(event){
  const phase=String(event.detail?.phase||'interaction');
  if(phase==='press'||phase==='release'||phase==='pulse'||phase==='boost'||phase==='interaction')pulse(`core-${phase}`);
}

function inspectRootState(records){
  let needsSync=false;
  for(const record of records){
    if(record.attributeName==='data-fx-core-shape-r337')needsSync=true;
    if(record.attributeName==='data-fx-reference-motion-paused')setLife(steadyLife());
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
  sync();
  setLife(steadyLife());
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
])addEventListener(name,()=>{sync();setLife(steadyLife());},{passive:true});

addEventListener('formatx:referencepause',event=>{
  const paused=event.detail?.paused===true;
  setLife(reduced.matches||paused?'steady':'breath');
},{passive:true});
addEventListener('formatx:coreinteraction',onCoreInteraction,{passive:true});
addEventListener('formatx:coreshapechange',()=>{sync();pulse('shape-change');},{passive:true});
addEventListener('visibilitychange',()=>{if(document.hidden)setLife('steady');else setLife(steadyLife());},{passive:true});

document.addEventListener('pointerdown',event=>{
  const target=event.target instanceof Element?event.target.closest('#hero .hero-space,.fx-reference-mag-button,.fx-mini-mag-launcher-r459,[data-action="shape"]'):null;
  if(!target)return;
  pulse(target.closest('.fx-mini-mag-launcher-r459')?'mini-mag-direct':'primary-mag-direct');
  if(target.matches('.fx-reference-mag-button,[data-action="shape"]')){
    queueMicrotask(sync);
    setTimeout(sync,80);
  }
},{passive:true,capture:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
for(const delay of [120,420,1200])setTimeout(()=>{sync();setLife(steadyLife());},delay);
}());
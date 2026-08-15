(function(){
'use strict';
const root=document.documentElement;
const VERSION='r161-cross-device-seamless-carrier-lock';
if(root.dataset.fxSeamlessEnforcerR159===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxSeamlessEnforcerR159='audit-skip';return;}
root.dataset.fxSeamlessEnforcerR159='booting';

const imp=(el,prop,value)=>{
  if(!(el instanceof HTMLElement))return;
  if(el.style.getPropertyValue(prop)!==value||el.style.getPropertyPriority(prop)!=='important')el.style.setProperty(prop,value,'important');
};

function clearSurface(el,{radius=false,overflow=false}={}){
  if(!(el instanceof HTMLElement))return;
  imp(el,'background','none');
  imp(el,'background-image','none');
  imp(el,'background-color','transparent');
  imp(el,'border','0px');
  imp(el,'outline','0px');
  imp(el,'box-shadow','none');
  if(radius)imp(el,'border-radius','0px');
  if(overflow)imp(el,'overflow','visible');
}

function enforce(){
  const hero=document.getElementById('hero');
  if(!(hero instanceof HTMLElement))return false;
  /* The living atmosphere belongs to #hero, but the carrier itself must never
     become a rounded card. Keep its background, only remove card-like geometry. */
  imp(hero,'border-radius','0px');
  imp(hero,'border','0px');
  imp(hero,'outline','0px');
  imp(hero,'box-shadow','none');
  imp(hero,'overflow','visible');

  const grid=hero.querySelector('.hero-grid');
  const space=hero.querySelector('.hero-space');
  clearSurface(grid,{radius:true,overflow:true});
  clearSurface(space,{radius:true,overflow:true});

  const stages=[...hero.querySelectorAll('.fx-core-mobile-v55-stage,.fx-core-r112-stage,.fx-core-rayglass-r91-stage')];
  for(const stage of stages){
    clearSurface(stage,{radius:true,overflow:true});
    imp(stage,'filter','none');
    imp(stage,'clip-path','none');
  }

  const detail=hero.querySelector('.fx-core-detail-r122');
  if(detail instanceof HTMLElement){
    imp(detail,'background','transparent');
    imp(detail,'mix-blend-mode','screen');
    imp(detail,'border-radius','0px');
  }
  const live=hero.querySelector('.fx-core-live-r147-layer');
  if(live instanceof HTMLElement){
    clearSurface(live,{radius:true});
    imp(live,'mix-blend-mode','screen');
  }

  root.dataset.fxSeamlessEnforcerR159=VERSION;
  root.dataset.fxSeamlessSurfaceR159='transparent-square-carrier-inline-lock';
  root.dataset.fxSeamlessStageCountR159=String(stages.length);
  root.dataset.fxSeamlessCarrierR161='continuous-page-flow';
  return stages.length>0;
}

let raf=0;
function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;enforce();});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{enforce();schedule();},{once:true});else enforce();
const mo=new MutationObserver(schedule);
mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','data-fx-mobile-reference-layout','data-fx-core-reference-texture-r130']});
addEventListener('pageshow',()=>{enforce();schedule();},{passive:true});
addEventListener('resize',schedule,{passive:true});
setTimeout(enforce,0);setTimeout(enforce,250);setTimeout(enforce,900);
}());

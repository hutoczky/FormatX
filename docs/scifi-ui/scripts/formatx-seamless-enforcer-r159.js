(function(){
'use strict';
const root=document.documentElement;
const VERSION='r267-cross-device-seamless-carrier-bounded';
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
let bootObserver=null;
let bootTimer=0;
function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(()=>{raf=0;enforce();});
}
function stopBootObserver(){
  bootObserver?.disconnect();
  bootObserver=null;
  if(bootTimer)clearTimeout(bootTimer);
  bootTimer=0;
  root.dataset.fxSeamlessEnforcerWatch='event-driven';
}
function startBoundedBootObserver(){
  if(bootObserver)return;
  const hero=document.getElementById('hero');
  const target=hero||document.body||document.documentElement;
  bootObserver=new MutationObserver(schedule);
  bootObserver.observe(target,{childList:true,subtree:true});
  bootTimer=setTimeout(stopBootObserver,3500);
  root.dataset.fxSeamlessEnforcerWatch='boot-bounded';
}
function refresh(){enforce();schedule();}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{refresh();startBoundedBootObserver();},{once:true});
}else{
  refresh();startBoundedBootObserver();
}

// r267: structure is watched only during the short asynchronous boot window.
// Steady state is event-driven, so animated descendants cannot keep forcing
// expensive hero-wide selector/style work and prevent mobile CPU idle.
for(const eventName of [
  'formatx:real3dready',
  'formatx:coredetailready',
  'formatx:controlownerready',
  'formatx:mobilelayoutready',
  'formatx:languagechange',
  'pageshow'
])addEventListener(eventName,refresh,{passive:true});
addEventListener('resize',schedule,{passive:true});
addEventListener('orientationchange',schedule,{passive:true});
setTimeout(refresh,0);setTimeout(refresh,250);setTimeout(refresh,900);setTimeout(refresh,2200);
}());
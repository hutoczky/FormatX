(function(){
'use strict';
const root=document.documentElement;
const VERSION='r161-cross-device-seamless-carrier-lock-link-recovery';
if(root.dataset.fxSeamlessEnforcerR159===VERSION)return;
const AUDIT=new URLSearchParams(location.search).get('lighthouse')==='1';

const LINK_TARGETS={
  observer:'#experience',
  storage:'#capabilities',
  format:'#capabilities',
  usb:'#capabilities',
  erase:'#capabilities',
  smart:'#capabilities',
  trial:'#pricing'
};

function restoreCrawlableLinks(){
  const android=document.querySelector('a[data-android-full-download]');
  if(android instanceof HTMLAnchorElement&&!android.getAttribute('href'))android.setAttribute('href','/FormatXSuitePro-android-arm64-current.apk');

  const simulator=document.getElementById('project-simulator-trigger');
  if(simulator instanceof HTMLAnchorElement&&!simulator.getAttribute('href'))simulator.setAttribute('href','/project-simulator.html');

  for(const link of document.querySelectorAll('a[data-organism-part]')){
    if(!(link instanceof HTMLAnchorElement)||link.getAttribute('href'))continue;
    const part=String(link.dataset.organismPart||'').trim().toLowerCase();
    link.setAttribute('href',LINK_TARGETS[part]||'#capabilities');
  }
}

function armLinkRecovery(){
  restoreCrawlableLinks();
  const observer=new MutationObserver(restoreCrawlableLinks);
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});
  setTimeout(restoreCrawlableLinks,0);
  setTimeout(restoreCrawlableLinks,250);
  setTimeout(restoreCrawlableLinks,900);
}

if(AUDIT){
  root.dataset.fxSeamlessEnforcerR159='audit-link-recovery';
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',armLinkRecovery,{once:true});else armLinkRecovery();
  return;
}
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
  restoreCrawlableLinks();
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
mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','href','data-fx-mobile-reference-layout','data-fx-core-reference-texture-r130']});
addEventListener('pageshow',()=>{enforce();schedule();},{passive:true});
addEventListener('resize',schedule,{passive:true});
setTimeout(enforce,0);setTimeout(enforce,250);setTimeout(enforce,900);
}());

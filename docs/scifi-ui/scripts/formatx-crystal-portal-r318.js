(function(){
'use strict';
const root=document.documentElement;
const VERSION='r318-crystal-is-site-core';
const TRUE_VOLUME_URL='/scifi-ui/scripts/formatx-core-true-volume-r267.js?v=20260828-r267-closed-volume-soft-glass';
const TRUE_VOLUME_STYLE_URL='/scifi-ui/styles/formatx-core-true-volume-r267.css?v=20260828-r267-balanced-volume-optics';
if(root.dataset.fxCrystalPortalR318===VERSION)return;
root.dataset.fxCrystalPortalR318='booting';

const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const copy=()=>root.lang==='en'?{
  cue:'TOUCH THE CRYSTAL · THIS IS THE SITE CORE',
  active:'CORE ACTIVE · THE SITE RESPONDS',
  label:'FormatX crystal site core — touch or click to activate the living site'
}:{
  cue:'ÉRINTSD A KRISTÁLYT · EZ AZ OLDAL MAGJA',
  active:'MAG AKTÍV · AZ OLDAL REAGÁL',
  label:'FormatX kristály MAG — érintsd meg vagy kattints rá az élő oldal aktiválásához'
};

let portal=null,facets=null,cue=null,host=null,observer=null,bootTimer=0;

function ensureTrueVolume(){
  if(!document.querySelector('link[data-fx-core-true-volume-style-r267]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=TRUE_VOLUME_STYLE_URL;
    link.dataset.fxCoreTrueVolumeStyleR267='true';
    document.head.appendChild(link);
  }
  if(document.querySelector('script[data-fx-core-true-volume-r267]'))return;
  const script=document.createElement('script');
  script.src=TRUE_VOLUME_URL;
  script.async=true;
  script.dataset.fxCoreTrueVolumeR267='true';
  document.head.appendChild(script);
  root.dataset.fxCrystalRendererRequest='closed-volume-r267';
}

function pulse(){
  try{window.FormatXCoreMobileV69?.pulse?.();}catch(_){}
  try{window.FormatXCoreCinematic?.pulse?.();}catch(_){}
}

function setCue(active){
  const c=copy();
  if(cue)cue.textContent=active?c.active:c.cue;
  if(portal)portal.setAttribute('aria-label',c.label);
}

function activate(source){
  root.classList.add('fx-crystal-site-active-r318');
  root.dataset.fxCrystalPortalState='active';
  root.dataset.fxCrystalMeaning='site-core-interaction-surface';
  setCue(true);
  pulse();

  if(root.dataset.fxImmersive!=='active'){
    root.dataset.fxImmersive='active';
    root.dataset.fxImmersiveSource='crystal-portal-r318';
    dispatchEvent(new CustomEvent('formatx:immersiveactivate',{detail:{source:'crystal-portal-r318'}}));
  }
  dispatchEvent(new CustomEvent('formatx:crystalactivate',{detail:{source:source||'click',role:'site-core'}}));
}

function bind(target){
  if(!(target instanceof HTMLButtonElement)||target.dataset.fxCrystalBoundR318==='true')return;
  target.dataset.fxCrystalBoundR318='true';
  target.addEventListener('pointerenter',()=>root.classList.add('fx-crystal-hover-r318'),{passive:true});
  target.addEventListener('pointerleave',()=>{
    root.classList.remove('fx-crystal-hover-r318','fx-crystal-press-r318');
  },{passive:true});
  target.addEventListener('focus',()=>root.classList.add('fx-crystal-focus-r318'));
  target.addEventListener('blur',()=>root.classList.remove('fx-crystal-focus-r318','fx-crystal-press-r318'));
  target.addEventListener('pointerdown',()=>{
    root.classList.add('fx-crystal-press-r318');
    pulse();
  },{passive:true});
  target.addEventListener('pointerup',()=>root.classList.remove('fx-crystal-press-r318'),{passive:true});
  target.addEventListener('pointercancel',()=>root.classList.remove('fx-crystal-press-r318'),{passive:true});
  target.addEventListener('click',()=>activate('click'));
}

function install(){
  const hero=document.getElementById('hero');
  const nextHost=hero?.querySelector('.hero-space');
  if(!(hero instanceof HTMLElement)||!(nextHost instanceof HTMLElement))return false;
  host=nextHost;
  ensureTrueVolume();

  facets=host.querySelector(':scope > .fx-crystal-facets-r318');
  if(!(facets instanceof HTMLElement)){
    facets=document.createElement('div');
    facets.className='fx-crystal-facets-r318';
    facets.setAttribute('aria-hidden','true');
    host.appendChild(facets);
  }

  portal=host.querySelector(':scope > .fx-crystal-portal-r318');
  if(!(portal instanceof HTMLButtonElement)){
    portal=document.createElement('button');
    portal.type='button';
    portal.className='fx-crystal-portal-r318';
    portal.dataset.fxCrystalRole='site-core';
    host.appendChild(portal);
  }

  cue=host.querySelector(':scope > .fx-crystal-cue-r318');
  if(!(cue instanceof HTMLElement)){
    cue=document.createElement('div');
    cue.className='fx-crystal-cue-r318';
    cue.setAttribute('aria-hidden','true');
    host.appendChild(cue);
  }

  bind(portal);
  setCue(root.classList.contains('fx-crystal-site-active-r318'));
  root.dataset.fxCrystalPortalR318=VERSION;
  root.dataset.fxCrystalPortalReady='true';
  root.dataset.fxCrystalMeaning='site-core-interaction-surface';
  dispatchEvent(new CustomEvent('formatx:crystalportalready',{detail:{version:VERSION,role:'site-core',renderer:'closed-volume-r267'}}));
  return true;
}

function boot(){
  if(install())return;
  const target=document.body||document.documentElement;
  observer=new MutationObserver(()=>{
    if(install()){
      observer?.disconnect();
      observer=null;
      if(bootTimer)clearTimeout(bootTimer);
      bootTimer=0;
    }
  });
  observer.observe(target,{subtree:true,childList:true});
  bootTimer=setTimeout(()=>{
    observer?.disconnect();observer=null;bootTimer=0;install();
  },5000);
}

for(const eventName of ['formatx:real3dready','formatx:mobilelayoutready','formatx:controlownerready','pageshow']){
  addEventListener(eventName,install,{passive:true});
}
addEventListener('formatx:languagechange',()=>setCue(root.classList.contains('fx-crystal-site-active-r318')),{passive:true});
addEventListener('languagechange',()=>setCue(root.classList.contains('fx-crystal-site-active-r318')),{passive:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}());
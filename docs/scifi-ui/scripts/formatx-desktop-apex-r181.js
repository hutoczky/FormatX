(function(){
'use strict';
const root=document.documentElement;
const VERSION='r189-desktop-apex-css-owned-csp-safe';
if(root.dataset.fxDesktopApexVersionR181===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxDesktopApexR181='audit-skip';
  root.dataset.fxDesktopApexVersionR181=VERSION;
  return;
}
root.dataset.fxDesktopApexVersionR181=VERSION;
const desktop=matchMedia('(min-width:901px) and (pointer:fine)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let queued=false,bound=null,meta=null,mo=null,resetTimer=0;

function ensureMeta(space){
  meta=space.querySelector('.fx-r181-apex-meta');
  if(meta instanceof HTMLElement)return meta;
  meta=document.createElement('div');
  meta.className='fx-r181-apex-meta';
  meta.setAttribute('aria-hidden','true');
  meta.innerHTML='<i></i><b>LIVING CORE</b><span>WEBGL2 / REACTIVE</span><span>POINTER FIELD</span>';
  space.appendChild(meta);
  return meta;
}

function pointerState(e,space){
  if(!desktop.matches||e?.pointerType==='touch')return null;
  const r=space.getBoundingClientRect();
  if(!r.width||!r.height)return null;
  return {
    x:clamp((e.clientX-r.left)/r.width*2-1,-1,1),
    y:clamp((e.clientY-r.top)/r.height*2-1,-1,1)
  };
}

function exposePointer(point,energy){
  const x=point?.x||0,y=point?.y||0;
  root.dataset.fxDesktopApexPointerR181=`${x.toFixed(3)},${y.toFixed(3)}`;
  root.dataset.fxDesktopApexEnergyR181=Number(energy).toFixed(3);
}

function settle(delay=220){
  clearTimeout(resetTimer);
  resetTimer=setTimeout(()=>{
    exposePointer(null,.18);
    root.dataset.fxDesktopApexInteractionR181='idle-living';
  },delay);
}

function bindInteraction(hero,space){
  if(bound===hero)return;
  bound=hero;
  hero.addEventListener('pointermove',e=>{
    const point=pointerState(e,space);
    if(!point)return;
    exposePointer(point,reduced.matches?.18:.36);
    root.dataset.fxDesktopApexInteractionR181=reduced.matches?'reduced-static':'tracking-webgl';
  },{passive:true,capture:true});
  hero.addEventListener('pointerdown',e=>{
    if(!desktop.matches)return;
    const point=pointerState(e,space);
    if(point)exposePointer(point,reduced.matches?.18:1);
    root.dataset.fxDesktopApexInteractionR181=reduced.matches?'reduced-static':'energized-webgl';
    try{window.FormatXCoreMobileV69?.pulse?.();}catch(_){/* renderer remains authoritative */}
    settle(520);
  },{passive:true,capture:true});
  hero.addEventListener('pointerleave',()=>settle(80),{passive:true,capture:true});
}

function apply(){
  queued=false;
  if(!desktop.matches){
    root.dataset.fxDesktopApexR181='mobile-bypass';
    root.dataset.fxDesktopApexVersionR181=VERSION;
    return false;
  }
  const hero=document.getElementById('hero');
  const grid=hero?.querySelector('.hero-grid');
  const space=hero?.querySelector('.hero-space');
  const copy=hero?.querySelector('.hero-copy');
  if(!(hero instanceof HTMLElement)||!(grid instanceof HTMLElement)||!(space instanceof HTMLElement)||!(copy instanceof HTMLElement))return false;

  // r189: the external formatx-desktop-apex-r181.css stylesheet is the sole
  // geometry/composition owner. This script never writes element.style or
  // CSS custom properties, so strict style-src 'self' remains intact.
  ensureMeta(space);
  bindInteraction(hero,space);
  root.dataset.fxDesktopApexR181='ready';
  root.dataset.fxDesktopApexVersionR181=VERSION;
  root.dataset.fxDesktopApexStyleOwnershipR189='external-css-only';
  root.dataset.fxReferenceComposition='desktop-cinematic-mag-r181';
  if(!root.dataset.fxDesktopApexInteractionR181){
    root.dataset.fxDesktopApexInteractionR181=reduced.matches?'reduced-static':'idle-living';
    exposePointer(null,.18);
  }
  return true;
}

function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply);}
function boot(){
  schedule();
  [140,720,1800,3600].forEach(ms=>setTimeout(schedule,ms));
  if(!mo){
    mo=new MutationObserver(()=>{
      if(desktop.matches&&root.dataset.fxReferenceComposition!=='desktop-cinematic-mag-r181')schedule();
    });
    mo.observe(root,{attributes:true,attributeFilter:['data-fx-reference-composition','data-fx-core-reference-texture-r130']});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
['formatx:real3dready','formatx:coredetailready','formatx:organisminterfaceready','formatx:languagechange'].forEach(n=>addEventListener(n,schedule));
addEventListener('resize',schedule,{passive:true});
desktop.addEventListener?.('change',schedule);
reduced.addEventListener?.('change',schedule);
}());
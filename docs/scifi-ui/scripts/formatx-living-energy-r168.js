(function(){
'use strict';
const root=document.documentElement;
const VERSION='r168-living-energy-orbit-caustic-v2';
const CLOCK='display-synced-raf-r183';
const CSP_STYLE='/scifi-ui/styles/formatx-living-energy-csp-r190.css?v=20260817-r190-csp-safe';
if(root.dataset.fxLivingEnergyR168===VERSION&&root.dataset.fxLivingEnergyClockR168===CLOCK)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxLivingEnergyR168='audit-skip';
  root.dataset.fxLivingEnergyClockR168='audit-skip';
  root.dataset.fxLivingEnergyInlineStylesR190='0';
  return;
}
root.dataset.fxLivingEnergyR168='booting';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
let host=null,layer=null,detail=null,boost=0,lastInput=0,raf=0,watchdog=0,last=performance.now(),lastTickAt=0;
let pointerX=0,pointerY=0,frameSeq=0,interactionTimer=0;

function make(cls){const e=document.createElement('span');e.className=cls;e.setAttribute('aria-hidden','true');return e;}
function ensureCspStyle(){
  let link=document.querySelector('link[data-fx-living-energy-csp-r190]');
  if(link instanceof HTMLLinkElement)return link;
  link=document.createElement('link');
  link.rel='stylesheet';
  link.href=CSP_STYLE;
  link.dataset.fxLivingEnergyCspR190='true';
  document.head.appendChild(link);
  return link;
}
function setInteraction(state,ttl=0){
  root.dataset.fxLivingEnergyInteractionR168=state;
  if(interactionTimer){clearTimeout(interactionTimer);interactionTimer=0;}
  if(ttl>0)interactionTimer=setTimeout(()=>{
    if(performance.now()-lastInput>=ttl-30)root.dataset.fxLivingEnergyInteractionR168='idle-living';
    interactionTimer=0;
  },ttl);
}
function ensureMobileSeam(){
  ensureCspStyle();
  root.dataset.fxMobileSeamR170='ready-58-72-priority';
  root.dataset.fxMobileSeamOwnershipR190='external-css-only';
}
function ensure(){
  ensureMobileSeam();
  host=document.querySelector('#hero .hero-space');
  layer=document.querySelector('#hero .fx-core-live-r147-layer');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  if(!(host instanceof HTMLElement)||!(layer instanceof HTMLElement))return false;
  const wanted=[
    'fx-r168-orbit fx-r168-orbit-a','fx-r168-orbit fx-r168-orbit-b',
    'fx-r168-caustic fx-r168-caustic-a','fx-r168-caustic fx-r168-caustic-b',
    'fx-r168-spectrum','fx-r168-flare fx-r168-flare-x','fx-r168-flare fx-r168-flare-y',
    'fx-r168-shockwave','fx-r168-interaction-wave',
    'fx-r168-spark fx-r168-spark-a','fx-r168-spark fx-r168-spark-b',
    'fx-r168-spark fx-r168-spark-c','fx-r168-spark fx-r168-spark-d',
    'fx-r168-spark fx-r168-spark-e','fx-r168-spark fx-r168-spark-f'
  ];
  for(const cls of wanted){const parts=cls.split(' '),sel='.'+parts.join('.');if(!layer.querySelector(sel))layer.appendChild(make(cls));}
  if(host.dataset.fxLivingEnergyBoundR168!=='v4-csp-safe'){
    const pos=(x,y)=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;pointerX=clamp((x-r.left)/r.width*2-1,-1,1);pointerY=clamp((y-r.top)/r.height*2-1,-1,1);};
    const hit=(strength=1)=>{
      const now=performance.now();
      boost=Math.max(boost,strength);lastInput=now;
      setInteraction('energy-burst',820);
      try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}
    };
    host.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch')return;
      pos(e.clientX,e.clientY);boost=Math.max(boost,.64);lastInput=performance.now();setInteraction('pointer-reactive',420);
    },{passive:true});
    host.addEventListener('pointerdown',e=>{pos(e.clientX,e.clientY);hit(1.68);},{passive:true});
    host.addEventListener('touchstart',e=>{const t=e.touches?.[0];if(t)pos(t.clientX,t.clientY);hit(1.84);},{passive:true});
    host.addEventListener('touchmove',e=>{
      const t=e.touches?.[0];if(t)pos(t.clientX,t.clientY);
      boost=Math.max(boost,1.16);lastInput=performance.now();setInteraction('touch-reactive',520);
    },{passive:true});
    host.dataset.fxLivingEnergyBoundR168='v4-csp-safe';
  }
  root.dataset.fxLivingEnergyR168=VERSION;
  root.dataset.fxLivingEnergyEffectModeR168='orbit-caustic-spectrum-shock-refraction';
  root.dataset.fxLivingEnergyVisualOwnerR190='external-css-optics-internal-canvas-core';
  root.dataset.fxLivingEnergyInlineStylesR190='0';
  return true;
}

function tick(frameNow){
  if(!(host?.isConnected&&layer?.isConnected)){if(!ensure())return;}
  const now=Number.isFinite(frameNow)?frameNow:performance.now();
  lastTickAt=now;
  const dt=clamp(now-last||8.3,2,120);last=now;
  const still=reduced.matches||root.dataset.fxReferenceMotionPaused==='true';
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.5);
  if(now-lastInput>70)boost*=Math.pow(.055,dt/1000*1.38);if(boost<.002)boost=0;
  const cycle=still?0:(now%1380)/1380;
  const lub=still?0:gauss(cycle,.105,.040);
  const dub=still?0:gauss(cycle,.235,.055)*.66;
  const beat=clamp(lub+dub,0,1.08);
  const breath=still?.5:.5+.5*Math.sin(now*.00118-1.05);
  const activity=still?.12:clamp(energy*.40+boost*.88,0,1.78);
  frameSeq++;
  root.dataset.fxLivingEnergyBeatR168=`${lub.toFixed(3)},${dub.toFixed(3)},${breath.toFixed(3)}`;
  root.dataset.fxLivingEnergyPositionR168=`${pointerX.toFixed(3)},${pointerY.toFixed(3)}`;
  root.dataset.fxLivingEnergyActivityR168=activity.toFixed(3);
  root.dataset.fxLivingEnergyOpticsR168=`${(.14+beat*.08).toFixed(3)},${(.14+breath*.05).toFixed(3)},0.180,0.000`;
  root.dataset.fxLivingEnergyClockR168=CLOCK;
  root.dataset.fxLivingEnergyFrameR168=String(frameSeq);
  root.dataset.fxLivingEnergyEffectModeR168='orbit-caustic-spectrum-shock-refraction';
  if(performance.now()-lastInput>900&&root.dataset.fxLivingEnergyInteractionR168!=='idle-living')setInteraction('idle-living');
}
function loop(now){
  raf=requestAnimationFrame(loop);
  if(document.hidden)return;
  tick(now);
}
function armWatchdog(){
  if(watchdog)return;
  watchdog=setInterval(()=>{
    if(document.hidden||reduced.matches||root.dataset.fxReferenceMotionPaused==='true')return;
    const now=performance.now();
    if(!lastTickAt||now-lastTickAt>=150)tick(now);
  },120);
  root.dataset.fxLivingEnergyWatchdogR182='120ms-stall-fallback-r183';
}
function start(){
  if(!ensure())return;
  if(!raf){last=performance.now();lastTickAt=0;tick(last);raf=requestAnimationFrame(loop);}
  armWatchdog();
  root.dataset.fxLivingEnergyClockR168=CLOCK;
  root.dataset.fxLivingEnergySchedulerR175='requestAnimationFrame-display-synced-r183';
  root.dataset.fxLivingEnergySchedulerR182='raf-primary-watchdog-fallback-r183';
  root.dataset.fxLivingEnergyInlineStylesR190='0';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
const mo=new MutationObserver(()=>{if(!layer?.isConnected||!raf||!watchdog)start();});mo.observe(document.documentElement,{childList:true,subtree:true});
addEventListener('pageshow',start,{passive:true});
addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);if(watchdog)clearInterval(watchdog);if(interactionTimer)clearTimeout(interactionTimer);mo.disconnect();},{once:true});
}());

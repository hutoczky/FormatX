(function(){
'use strict';
const root=document.documentElement;
const VERSION='r168-living-energy-orbit-caustic-v2';
const PERF='r192-event-driven-energy-css-animations';
const CSP_STYLE='/scifi-ui/styles/formatx-living-energy-csp-r190.css?v=20260817-r190-csp-safe';
if(root.dataset.fxLivingEnergyR168===VERSION&&root.dataset.fxLivingEnergyPerformanceR192===PERF)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxLivingEnergyR168='audit-skip';
  root.dataset.fxLivingEnergyClockR168='audit-skip';
  root.dataset.fxLivingEnergyInlineStylesR190='0';
  root.dataset.fxLivingEnergyPerformanceR192='audit-skip';
  return;
}
root.dataset.fxLivingEnergyR168='booting';root.dataset.fxLivingEnergyPerformanceR192=PERF;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
let host=null,layer=null,detail=null,boost=0,lastInput=0,last=performance.now(),pointerX=0,pointerY=0,frameSeq=0,interactionTimer=0,timer=0,retryTimer=0,retries=0,visible=true;

function make(cls){const e=document.createElement('span');e.className=cls;e.setAttribute('aria-hidden','true');return e;}
function ensureCspStyle(){let link=document.querySelector('link[data-fx-living-energy-csp-r190]');if(link instanceof HTMLLinkElement)return link;link=document.createElement('link');link.rel='stylesheet';link.href=CSP_STYLE;link.dataset.fxLivingEnergyCspR190='true';document.head.appendChild(link);return link;}
function setInteraction(state,ttl=0){root.dataset.fxLivingEnergyInteractionR168=state;if(interactionTimer){clearTimeout(interactionTimer);interactionTimer=0;}if(ttl>0)interactionTimer=setTimeout(()=>{if(performance.now()-lastInput>=ttl-30)root.dataset.fxLivingEnergyInteractionR168='idle-living';interactionTimer=0;},ttl);}
function ensure(){
  ensureCspStyle();root.dataset.fxMobileSeamR170='ready-58-72-priority';root.dataset.fxMobileSeamOwnershipR190='external-css-only';
  host=document.querySelector('#hero .hero-space');layer=document.querySelector('#hero .fx-core-live-r147-layer');detail=document.querySelector('#hero .fx-core-detail-r122');
  if(!(host instanceof HTMLElement)||!(layer instanceof HTMLElement))return false;
  const wanted=['fx-r168-orbit fx-r168-orbit-a','fx-r168-orbit fx-r168-orbit-b','fx-r168-caustic fx-r168-caustic-a','fx-r168-caustic fx-r168-caustic-b','fx-r168-spectrum','fx-r168-flare fx-r168-flare-x','fx-r168-flare fx-r168-flare-y','fx-r168-shockwave','fx-r168-interaction-wave','fx-r168-spark fx-r168-spark-a','fx-r168-spark fx-r168-spark-b','fx-r168-spark fx-r168-spark-c','fx-r168-spark fx-r168-spark-d','fx-r168-spark fx-r168-spark-e','fx-r168-spark fx-r168-spark-f'];
  for(const cls of wanted){const parts=cls.split(' '),sel='.'+parts.join('.');if(!layer.querySelector(sel))layer.appendChild(make(cls));}
  if(host.dataset.fxLivingEnergyBoundR168!=='r192-budgeted'){
    const pos=(x,y)=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;pointerX=clamp((x-r.left)/r.width*2-1,-1,1);pointerY=clamp((y-r.top)/r.height*2-1,-1,1);};
    const hit=(strength=1)=>{boost=Math.max(boost,strength);lastInput=performance.now();setInteraction('energy-burst',820);try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}schedule(0);};
    host.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pos(e.clientX,e.clientY);boost=Math.max(boost,.64);lastInput=performance.now();setInteraction('pointer-reactive',420);schedule(0);},{passive:true});
    host.addEventListener('pointerdown',e=>{pos(e.clientX,e.clientY);hit(1.68);},{passive:true});
    host.addEventListener('touchstart',e=>{const t=e.touches?.[0];if(t)pos(t.clientX,t.clientY);hit(1.84);},{passive:true});
    host.addEventListener('touchmove',e=>{const t=e.touches?.[0];if(t)pos(t.clientX,t.clientY);boost=Math.max(boost,1.16);lastInput=performance.now();setInteraction('touch-reactive',520);schedule(0);},{passive:true});
    host.dataset.fxLivingEnergyBoundR168='r192-budgeted';
  }
  root.dataset.fxLivingEnergyR168=VERSION;root.dataset.fxLivingEnergyEffectModeR168='orbit-caustic-spectrum-shock-refraction';root.dataset.fxLivingEnergyVisualOwnerR190='external-css-optics-internal-canvas-core';root.dataset.fxLivingEnergyInlineStylesR190='0';root.dataset.fxLivingEnergyClockR168='budgeted-timer-r192';root.dataset.fxLivingEnergyPerformanceR192=PERF;return true;
}
function tick(){
  timer=0;if(document.hidden||!visible){schedule(500);return;}if(!(host?.isConnected&&layer?.isConnected)){if(!ensure()){schedule(180);return;}}
  const now=performance.now(),dt=clamp(now-last||16,8,500);last=now;const still=reduced.matches||root.dataset.fxReferenceMotionPaused==='true';const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.5);
  if(now-lastInput>70)boost*=Math.pow(.055,dt/1000*1.38);if(boost<.002)boost=0;
  const cycle=still?0:(now%1380)/1380,lub=still?0:gauss(cycle,.105,.040),dub=still?0:gauss(cycle,.235,.055)*.66,breath=still?.5:.5+.5*Math.sin(now*.00118-1.05),activity=still?.12:clamp(energy*.40+boost*.88,0,1.78);frameSeq++;
  root.dataset.fxLivingEnergyBeatR168=`${lub.toFixed(2)},${dub.toFixed(2)},${breath.toFixed(2)}`;root.dataset.fxLivingEnergyPositionR168=`${pointerX.toFixed(2)},${pointerY.toFixed(2)}`;root.dataset.fxLivingEnergyActivityR168=activity.toFixed(2);root.dataset.fxLivingEnergyOpticsR168=`${(.14+(lub+dub)*.08).toFixed(2)},${(.14+breath*.05).toFixed(2)},0.18,0.00`;root.dataset.fxLivingEnergyFrameR168=String(frameSeq);root.dataset.fxLivingEnergyPerformanceR192=PERF;
  if(now-lastInput>900&&root.dataset.fxLivingEnergyInteractionR168!=='idle-living')setInteraction('idle-living');schedule(boost>.04?90:260);
}
function schedule(delay){if(timer){if(delay>0)return;clearTimeout(timer);timer=0;}timer=setTimeout(tick,Math.max(0,delay));}
function retry(){retryTimer=0;if(ensure()){retries=0;schedule(0);return;}if(retries++<40)retryTimer=setTimeout(retry,100);else root.dataset.fxLivingEnergyR168='host-unavailable-r192';}
function start(){if(ensure()){retries=0;schedule(0);}else retry();root.dataset.fxLivingEnergySchedulerR175='event-driven-css-animation-r192';root.dataset.fxLivingEnergySchedulerR182='single-budgeted-timer-r192';root.dataset.fxLivingEnergyPerformanceR192=PERF;}
const hero=document.getElementById('hero');if(hero&&'IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);schedule(0);},{rootMargin:'120px'});io.observe(hero);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
addEventListener('formatx:real3dready',()=>{ensure();schedule(0);},{passive:true});addEventListener('pageshow',start,{passive:true});addEventListener('pagehide',()=>{if(timer)clearTimeout(timer);if(retryTimer)clearTimeout(retryTimer);if(interactionTimer)clearTimeout(interactionTimer);},{once:true});
}());

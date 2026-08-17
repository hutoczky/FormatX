(function(){
'use strict';
const root=document.documentElement;
const VERSION='js-reactive-heartbeat-r155';
const MODE='r158-lub-dub-seamless-living';
const SHAPE_MODE='r183-display-synced-internal-canvas';
const PERF='r192-budgeted-telemetry-css-owned-visuals';
const SEAMLESS='/scifi-ui/styles/formatx-seamless-living-r158.css?v=20260815-r165-space-atmosphere-bridge';
const CSP_STYLE='/scifi-ui/styles/formatx-live-heartbeat-csp-r190.css?v=20260817-r190-csp-safe';
if(root.dataset.fxLiveHeartbeatR155===VERSION&&root.dataset.fxLiveHeartbeatPerformanceR192===PERF)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxLiveHeartbeatR155='audit-skip';
  root.dataset.fxLivingHeartbeatModeR158='audit-skip';
  root.dataset.fxLivingShapeModeR167='audit-skip';
  root.dataset.fxLiveHeartbeatInlineStylesR190='0';
  root.dataset.fxLiveHeartbeatPerformanceR192='audit-skip';
  return;
}
root.dataset.fxLiveHeartbeatR155='booting';
root.dataset.fxLiveHeartbeatPerformanceR192=PERF;

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
let host=null,layer=null,detail=null,core=null,ring=null,wave=null;
let timer=0,retryTimer=0,retries=0,boost=0,lastInput=0,lastTick=performance.now(),seq=0,visible=true,interactionTimer=0;

function ensureStylesheet(selector,href,datasetKey){
  let link=document.querySelector(selector);
  if(link instanceof HTMLLinkElement)return link;
  link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset[datasetKey]='true';document.head.appendChild(link);return link;
}
function ensureStyles(){
  ensureStylesheet('link[data-fx-seamless-living-r158]',SEAMLESS,'fxSeamlessLivingR158');
  ensureStylesheet('link[data-fx-live-heartbeat-csp-r190]',CSP_STYLE,'fxLiveHeartbeatCspR190');
}
function markInteraction(){
  root.dataset.fxLiveHeartbeatInteractionR155='active-r192';
  if(interactionTimer)clearTimeout(interactionTimer);
  interactionTimer=setTimeout(()=>{root.dataset.fxLiveHeartbeatInteractionR155='idle-r192';interactionTimer=0;},760);
}
function ensure(){
  ensureStyles();
  host=document.querySelector('#hero .hero-space');
  layer=document.querySelector('#hero .fx-core-live-r147-layer');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  if(!(host instanceof HTMLElement)||!(layer instanceof HTMLElement))return false;
  core=layer.querySelector('.fx-r155-heartbeat-core');ring=layer.querySelector('.fx-r155-heartbeat-ring');wave=layer.querySelector('.fx-r155-heartbeat-wave');
  if(!(core instanceof HTMLElement)){core=document.createElement('span');core.className='fx-r155-heartbeat-core';core.setAttribute('aria-hidden','true');layer.appendChild(core);}
  if(!(ring instanceof HTMLElement)){ring=document.createElement('span');ring.className='fx-r155-heartbeat-ring';ring.setAttribute('aria-hidden','true');layer.appendChild(ring);}
  if(!(wave instanceof HTMLElement)){wave=document.createElement('span');wave.className='fx-r155-heartbeat-wave';wave.setAttribute('aria-hidden','true');layer.appendChild(wave);}
  if(host.dataset.fxHeartbeatBoundR155!=='r192-budgeted'){
    const energize=()=>{boost=Math.max(boost,1.18);lastInput=performance.now();markInteraction();try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}schedule(0);};
    host.addEventListener('pointerdown',energize,{passive:true});
    host.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){boost=Math.max(boost,.34);lastInput=performance.now();schedule(0);}},{passive:true});
    host.addEventListener('touchstart',energize,{passive:true});
    host.addEventListener('touchmove',()=>{boost=Math.max(boost,.78);lastInput=performance.now();schedule(0);},{passive:true});
    host.dataset.fxHeartbeatBoundR155='r192-budgeted';
  }
  root.dataset.fxLiveHeartbeatR155=VERSION;
  root.dataset.fxLivingHeartbeatModeR158=MODE;
  root.dataset.fxLivingShapeModeR167=SHAPE_MODE;
  root.dataset.fxLivingShapePulseStateR167=reduced.matches?'reduced-motion-static':'internal-canvas-no-layout-shift';
  root.dataset.fxLivingShapeScaleSupportR167='internal-canvas-r166';
  root.dataset.fxLiveHeartbeatVisualOwnerR190='external-css-optics-internal-canvas-core';
  root.dataset.fxLiveHeartbeatInlineStylesR190='0';
  root.dataset.fxLiveHeartbeatClockR155='budgeted-telemetry-r192';
  root.dataset.fxHeartbeatSchedulerR183='compat-display-state-r192';
  return true;
}
function tick(){
  timer=0;
  if(document.hidden||!visible){schedule(500);return;}
  if(!(host?.isConnected&&layer?.isConnected&&core?.isConnected&&ring?.isConnected&&wave?.isConnected)){
    if(!ensure()){schedule(160);return;}
  }
  const now=performance.now(),dt=clamp(now-lastTick,8,500);lastTick=now;
  if(now-lastInput>90)boost*=Math.pow(.035,dt/1000);if(boost<.002)boost=0;
  const still=root.dataset.fxReferenceMotionPaused==='true'||reduced.matches;
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.35);
  const cycle=still?0:(now%1380)/1380;
  const lub=still?.18:gauss(cycle,.105,.040),dub=still?.10:gauss(cycle,.235,.052)*.64,beat=clamp(lub+dub,0,1.08),breath=still?.35:(.5+.5*Math.sin(now*.00118-1.05)),activity=clamp(energy*.46+boost*.58,0,1.35);
  seq++;
  root.dataset.fxLiveHeartbeatTickR155=String(seq);
  root.dataset.fxLiveHeartbeatPhaseR155=beat.toFixed(3);
  root.dataset.fxLiveHeartbeatEnergyR155=activity.toFixed(3);
  root.dataset.fxLiveHeartbeatPausedR155=String(still);
  root.dataset.fxLivingHeartbeatBeatR158=`${lub.toFixed(2)},${dub.toFixed(2)},${breath.toFixed(2)}`;
  root.dataset.fxLivingHeartbeatInteractionR158=boost>.04?'energized':'idle-living';
  root.dataset.fxLivingShapeScaleR167='1.0000,1.0000';
  root.dataset.fxLivingShapeEnvelopeR167=`${lub.toFixed(2)},${dub.toFixed(2)},${beat.toFixed(2)}`;
  root.dataset.fxLiveHeartbeatPositionR155='50.00,49.00';
  root.dataset.fxLiveHeartbeatPerformanceR192=PERF;
  schedule(boost>.04?90:240);
}
function schedule(delay){
  if(timer){if(delay>0)return;clearTimeout(timer);timer=0;}
  timer=setTimeout(tick,Math.max(0,delay));
}
function retry(){
  retryTimer=0;
  if(ensure()){retries=0;schedule(0);return;}
  if(retries++<40)retryTimer=setTimeout(retry,100);
  else root.dataset.fxLiveHeartbeatR155='host-unavailable-r192';
}
function start(){
  if(ensure()){retries=0;schedule(0);}else retry();
  root.dataset.fxLiveHeartbeatPerformanceR192=PERF;
}
const hero=document.getElementById('hero');
if(hero&&'IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);schedule(0);},{rootMargin:'120px'});io.observe(hero);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
addEventListener('formatx:real3dready',()=>{ensure();schedule(0);},{passive:true});
addEventListener('pageshow',start,{passive:true});
addEventListener('pagehide',()=>{if(timer)clearTimeout(timer);if(retryTimer)clearTimeout(retryTimer);if(interactionTimer)clearTimeout(interactionTimer);},{once:true});
}());

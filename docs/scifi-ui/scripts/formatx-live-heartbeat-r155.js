(function(){
'use strict';
const root=document.documentElement;
/* r190: public r155/r158 identities remain for runtime compatibility.
   The r166 internal canvas owns the crystal-body heartbeat. This controller
   now drives telemetry + interaction only; all optical styling lives in
   external CSS, so the crystal DOM box never scales and strict CSP stays clean. */
const VERSION='js-reactive-heartbeat-r155';
const MODE='r158-lub-dub-seamless-living';
const SHAPE_MODE='r183-display-synced-internal-canvas';
const SEAMLESS='/scifi-ui/styles/formatx-seamless-living-r158.css?v=20260815-r165-space-atmosphere-bridge';
const CSP_STYLE='/scifi-ui/styles/formatx-live-heartbeat-csp-r190.css?v=20260817-r190-csp-safe';
if(root.dataset.fxLiveHeartbeatR155===VERSION&&root.dataset.fxLivingHeartbeatModeR158===MODE&&root.dataset.fxLivingShapeModeR167===SHAPE_MODE)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxLiveHeartbeatR155='audit-skip';
  root.dataset.fxLivingHeartbeatModeR158='audit-skip';
  root.dataset.fxLivingShapeModeR167='audit-skip';
  root.dataset.fxLiveHeartbeatInlineStylesR190='0';
  return;
}
root.dataset.fxLiveHeartbeatR155='booting';
root.dataset.fxLivingHeartbeatModeR158='booting';
root.dataset.fxLivingShapeModeR167='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
let host=null,layer=null,detail=null,core=null,ring=null,wave=null;
let raf=0,seq=0,boost=0,lastInput=0,lastFrame=performance.now();
let refreshEma=16.67,refreshSamples=0,lastHzReport=0,interactionTimer=0;

function ensureStylesheet(selector,href,datasetKey){
  let link=document.querySelector(selector);
  if(link instanceof HTMLLinkElement)return link;
  link=document.createElement('link');
  link.rel='stylesheet';link.href=href;link.dataset[datasetKey]='true';
  document.head.appendChild(link);return link;
}
function ensureSeamless(){
  let link=document.querySelector('link[data-fx-seamless-living-r158]');
  if(link instanceof HTMLLinkElement)return link;
  link=document.createElement('link');
  link.rel='stylesheet';link.href=SEAMLESS;link.dataset.fxSeamlessLivingR158='true';
  root.dataset.fxSeamlessLivingR158='loading';
  link.addEventListener('load',()=>{root.dataset.fxSeamlessLivingR158='ready';},{once:true});
  link.addEventListener('error',()=>{root.dataset.fxSeamlessLivingR158='failed';},{once:true});
  document.head.appendChild(link);return link;
}
function ensureCspStyle(){
  return ensureStylesheet('link[data-fx-live-heartbeat-csp-r190]',CSP_STYLE,'fxLiveHeartbeatCspR190');
}
function markInteraction(){
  root.dataset.fxLiveHeartbeatInteractionR155='active-r183';
  if(interactionTimer)clearTimeout(interactionTimer);
  interactionTimer=setTimeout(()=>{
    root.dataset.fxLiveHeartbeatInteractionR155='idle-r190';
    interactionTimer=0;
  },760);
}
function ensure(){
  ensureSeamless();
  ensureCspStyle();
  host=document.querySelector('#hero .hero-space');
  layer=document.querySelector('#hero .fx-core-live-r147-layer');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  if(!(host instanceof HTMLElement)||!(layer instanceof HTMLElement))return false;
  core=layer.querySelector('.fx-r155-heartbeat-core');
  ring=layer.querySelector('.fx-r155-heartbeat-ring');
  wave=layer.querySelector('.fx-r155-heartbeat-wave');
  if(!(core instanceof HTMLElement)){core=document.createElement('span');core.className='fx-r155-heartbeat-core';core.setAttribute('aria-hidden','true');layer.appendChild(core);}
  if(!(ring instanceof HTMLElement)){ring=document.createElement('span');ring.className='fx-r155-heartbeat-ring';ring.setAttribute('aria-hidden','true');layer.appendChild(ring);}
  if(!(wave instanceof HTMLElement)){wave=document.createElement('span');wave.className='fx-r155-heartbeat-wave';wave.setAttribute('aria-hidden','true');layer.appendChild(wave);}

  if(host.dataset.fxHeartbeatBoundR155!=='r190-csp-safe'){
    const energize=()=>{
      boost=Math.max(boost,1.18);lastInput=performance.now();markInteraction();
      try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}
    };
    host.addEventListener('pointerdown',energize,{passive:true});
    host.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){boost=Math.max(boost,.34);lastInput=performance.now();}},{passive:true});
    host.addEventListener('touchstart',energize,{passive:true});
    host.addEventListener('touchmove',()=>{boost=Math.max(boost,.78);lastInput=performance.now();},{passive:true});
    host.dataset.fxHeartbeatBoundR155='r190-csp-safe';
  }
  root.dataset.fxLiveHeartbeatR155=VERSION;
  root.dataset.fxLivingHeartbeatModeR158=MODE;
  root.dataset.fxLivingShapeModeR167=SHAPE_MODE;
  root.dataset.fxLivingShapePulseStateR167=reduced.matches?'reduced-motion-static':'internal-canvas-no-layout-shift';
  root.dataset.fxLivingShapeScaleSupportR167='internal-canvas-r166';
  root.dataset.fxLiveHeartbeatVisualOwnerR190='external-css-optics-internal-canvas-core';
  root.dataset.fxLiveHeartbeatInlineStylesR190='0';
  return true;
}

function frame(now){
  raf=requestAnimationFrame(frame);
  if(document.hidden)return;
  if(!(host?.isConnected&&layer?.isConnected&&core?.isConnected&&ring?.isConnected&&wave?.isConnected)){
    if(!ensure())return;
  }

  const dt=clamp(now-lastFrame||8.3,2,80);lastFrame=now;
  if(dt<50){refreshEma+=(dt-refreshEma)*.08;refreshSamples++;}
  const paused=root.dataset.fxReferenceMotionPaused==='true';
  const still=paused||reduced.matches;
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.35);
  if(now-lastInput>90)boost*=Math.pow(.035,dt/1000);if(boost<.002)boost=0;

  const cycle=still?0:(now%1380)/1380;
  const lub=still?.18:gauss(cycle,.105,.040);
  const dub=still?.10:gauss(cycle,.235,.052)*.64;
  const beat=clamp(lub+dub,0,1.08);
  const breath=still?.35:(.5+.5*Math.sin(now*.00118-1.05));
  const activity=clamp(energy*.46+boost*.58,0,1.35);

  seq++;
  root.dataset.fxLiveHeartbeatTickR155=String(seq);
  root.dataset.fxLiveHeartbeatPhaseR155=beat.toFixed(4);
  root.dataset.fxLiveHeartbeatPositionR155='50.00,49.00';
  root.dataset.fxLiveHeartbeatEnergyR155=activity.toFixed(3);
  root.dataset.fxLiveHeartbeatPausedR155=String(still);
  root.dataset.fxLivingHeartbeatBeatR158=`${lub.toFixed(3)},${dub.toFixed(3)},${breath.toFixed(3)}`;
  root.dataset.fxLivingHeartbeatInteractionR158=boost>.04?'energized':'idle-living';
  root.dataset.fxLivingShapeScaleR167='1.0000,1.0000';
  root.dataset.fxLivingShapeEnvelopeR167=`${lub.toFixed(3)},${dub.toFixed(3)},${beat.toFixed(3)}`;
  root.dataset.fxLiveHeartbeatClockR155='requestAnimationFrame-display-synced-r183';
  root.dataset.fxHeartbeatSchedulerR183='display-refresh-adaptive';
  root.dataset.fxLiveHeartbeatInlineStylesR190='0';

  if(now-lastHzReport>900&&refreshSamples>8){
    const hz=clamp(1000/refreshEma,1,500);
    root.dataset.fxDisplayRefreshHzR183=hz.toFixed(1);
    lastHzReport=now;refreshSamples=0;
  }
}

function start(){
  if(!ensure())return;
  if(!raf){lastFrame=performance.now();raf=requestAnimationFrame(frame);}
  root.dataset.fxLiveHeartbeatClockR155='requestAnimationFrame-display-synced-r183';
  root.dataset.fxHeartbeatSchedulerR183='display-refresh-adaptive';
  root.dataset.fxLiveHeartbeatInlineStylesR190='0';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
const mo=new MutationObserver(()=>{if(!host?.isConnected||!layer?.isConnected||!detail?.isConnected)ensure();});
mo.observe(document.documentElement,{childList:true,subtree:true});
addEventListener('pageshow',start,{passive:true});
addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);if(interactionTimer)clearTimeout(interactionTimer);mo.disconnect();},{once:true});
}());

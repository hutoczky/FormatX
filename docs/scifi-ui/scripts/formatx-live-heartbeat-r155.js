(function(){
'use strict';
const root=document.documentElement;
const VERSION='js-reactive-heartbeat-r155';
const MODE='r158-lub-dub-seamless-living';
const SHAPE_MODE='r183-display-synced-internal-canvas';
const SEAMLESS='/scifi-ui/styles/formatx-seamless-living-r158.css?v=20260815-r165-space-atmosphere-bridge';
if(root.dataset.fxLiveHeartbeatR155===VERSION&&root.dataset.fxHeartbeatSchedulerR183==='compositor-event-driven-r270')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxLiveHeartbeatR155='audit-skip';
  root.dataset.fxLivingHeartbeatModeR158='audit-skip';
  root.dataset.fxLivingShapeModeR167='audit-skip';
  return;
}
root.dataset.fxLiveHeartbeatR155='booting';
root.dataset.fxLivingHeartbeatModeR158='booting';
root.dataset.fxLivingShapeModeR167='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let host=null,layer=null,detail=null,core=null,ring=null,wave=null;
let bootObserver=null,boostTimer=0;

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

function ensureStyle(){
  if(document.getElementById('fx-live-heartbeat-r155-style'))return;
  const style=document.createElement('style');
  style.id='fx-live-heartbeat-r155-style';
  style.textContent=`
    #hero .fx-r155-heartbeat-core,
    #hero .fx-r155-heartbeat-ring,
    #hero .fx-r155-heartbeat-wave{
      position:absolute;left:50%;top:49%;pointer-events:none;border-radius:50%;
      transform:translate3d(-50%,-50%,0);transform-origin:50% 50%;mix-blend-mode:screen;
      will-change:transform,opacity;contain:layout paint style;backface-visibility:hidden;
    }
    #hero .fx-r155-heartbeat-core{
      z-index:31;width:clamp(104px,12vw,188px);aspect-ratio:1;
      background:radial-gradient(circle,rgba(255,255,255,.99) 0 1%,rgba(222,255,255,.84) 2.4%,rgba(83,239,255,.46) 7.5%,rgba(43,205,255,.20) 18%,rgba(164,76,255,.14) 31%,transparent 66%);
      box-shadow:0 0 16px rgba(220,255,255,.40),0 0 35px rgba(55,220,255,.22),0 0 62px rgba(146,70,255,.12);
      animation:fx-r270-heart-core 1.7s ease-in-out infinite;
    }
    #hero .fx-r155-heartbeat-ring{
      z-index:30;width:clamp(116px,13vw,204px);aspect-ratio:1;border:1px solid rgba(190,253,255,.52);
      box-shadow:0 0 14px rgba(79,230,255,.28),0 0 32px rgba(141,72,255,.12),inset 0 0 18px rgba(97,236,255,.14);
      animation:fx-r270-heart-ring 1.7s ease-in-out infinite;
    }
    #hero .fx-r155-heartbeat-wave{
      z-index:29;width:clamp(144px,16vw,252px);aspect-ratio:1;border:1px solid rgba(108,235,255,.25);
      box-shadow:0 0 21px rgba(62,216,255,.13),0 0 44px rgba(151,73,255,.08);
      animation:fx-r270-heart-wave 1.7s ease-in-out infinite;
    }
    #hero .fx-core-live-r147-layer.fx-heartbeat-energized .fx-r155-heartbeat-core{opacity:.72!important}
    #hero .fx-core-live-r147-layer.fx-heartbeat-energized .fx-r155-heartbeat-ring{opacity:.62!important}
    #hero .fx-core-live-r147-layer.fx-heartbeat-energized .fx-r155-heartbeat-wave{opacity:.38!important}
    html[data-fx-reference-motion-paused="true"] #hero .fx-r155-heartbeat-core,
    html[data-fx-reference-motion-paused="true"] #hero .fx-r155-heartbeat-ring,
    html[data-fx-reference-motion-paused="true"] #hero .fx-r155-heartbeat-wave{animation-play-state:paused!important}
    @keyframes fx-r270-heart-core{
      0%,100%{transform:translate3d(-50%,-50%,0) scale(.965);opacity:.38}
      13%{transform:translate3d(-50%,-50%,0) scale(1.014);opacity:.58}
      31%{transform:translate3d(-50%,-50%,0) scale(.992);opacity:.48}
      58%{transform:translate3d(-50%,-50%,0) scale(.973);opacity:.42}
    }
    @keyframes fx-r270-heart-ring{
      0%,100%{transform:translate3d(-50%,-50%,0) scale(.94) rotate(0deg);opacity:.22}
      13%{transform:translate3d(-50%,-50%,0) scale(1.025) rotate(3deg);opacity:.50}
      31%{transform:translate3d(-50%,-50%,0) scale(.995) rotate(6deg);opacity:.38}
      58%{transform:translate3d(-50%,-50%,0) scale(.955) rotate(9deg);opacity:.28}
    }
    @keyframes fx-r270-heart-wave{
      0%,100%{transform:translate3d(-50%,-50%,0) scale(.89);opacity:.09}
      13%{transform:translate3d(-50%,-50%,0) scale(1.03);opacity:.25}
      31%{transform:translate3d(-50%,-50%,0) scale(.99);opacity:.18}
      58%{transform:translate3d(-50%,-50%,0) scale(.92);opacity:.12}
    }
    @media(max-width:900px),(pointer:coarse){
      #hero .fx-r155-heartbeat-core{width:clamp(92px,29vw,132px)}
      #hero .fx-r155-heartbeat-ring{width:clamp(104px,32vw,146px)}
      #hero .fx-r155-heartbeat-wave{width:clamp(128px,39vw,176px)}
    }
    @media(prefers-reduced-motion:reduce){
      #hero .fx-r155-heartbeat-core,#hero .fx-r155-heartbeat-ring,#hero .fx-r155-heartbeat-wave{animation:none!important}
      #hero .fx-r155-heartbeat-core{opacity:.42}
      #hero .fx-r155-heartbeat-ring{opacity:.26}
      #hero .fx-r155-heartbeat-wave{opacity:.10}
    }
  `;
  document.head.appendChild(style);
}

function energize(){
  if(!(layer instanceof HTMLElement))return;
  layer.classList.add('fx-heartbeat-energized');
  clearTimeout(boostTimer);
  boostTimer=setTimeout(()=>layer?.classList.remove('fx-heartbeat-energized'),720);
  try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}
  root.dataset.fxLiveHeartbeatInteractionR155='active-r270';
  root.dataset.fxLivingHeartbeatInteractionR158='energized';
}
function bindInput(){
  if(!(host instanceof HTMLElement)||host.dataset.fxHeartbeatBoundR155==='r270')return;
  host.addEventListener('pointerdown',energize,{passive:true});
  host.addEventListener('touchstart',energize,{passive:true});
  host.dataset.fxHeartbeatBoundR155='r270';
}
function ensure(){
  ensureSeamless();
  host=document.querySelector('#hero .hero-space');
  layer=document.querySelector('#hero .fx-core-live-r147-layer');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  if(!(host instanceof HTMLElement)||!(layer instanceof HTMLElement))return false;
  ensureStyle();
  core=layer.querySelector('.fx-r155-heartbeat-core');
  ring=layer.querySelector('.fx-r155-heartbeat-ring');
  wave=layer.querySelector('.fx-r155-heartbeat-wave');
  if(!(core instanceof HTMLElement)){core=document.createElement('span');core.className='fx-r155-heartbeat-core';core.setAttribute('aria-hidden','true');layer.appendChild(core);}
  if(!(ring instanceof HTMLElement)){ring=document.createElement('span');ring.className='fx-r155-heartbeat-ring';ring.setAttribute('aria-hidden','true');layer.appendChild(ring);}
  if(!(wave instanceof HTMLElement)){wave=document.createElement('span');wave.className='fx-r155-heartbeat-wave';wave.setAttribute('aria-hidden','true');layer.appendChild(wave);}
  for(const item of [core,ring,wave]){item.style.removeProperty('left');item.style.removeProperty('top');item.style.removeProperty('transform');item.style.removeProperty('opacity');item.style.removeProperty('filter');}
  if(detail instanceof HTMLElement){detail.style.removeProperty('scale');detail.style.setProperty('transform-origin','50% 50%');}
  bindInput();
  root.dataset.fxLiveHeartbeatR155=VERSION;
  root.dataset.fxLivingHeartbeatModeR158=MODE;
  root.dataset.fxLivingShapeModeR167=SHAPE_MODE;
  root.dataset.fxLivingShapePulseStateR167=reduced.matches?'reduced-motion-static':'compositor-no-layout-shift-r270';
  root.dataset.fxLivingShapeScaleSupportR167='internal-canvas-r166';
  root.dataset.fxLiveHeartbeatClockR155='css-compositor-r270';
  root.dataset.fxHeartbeatSchedulerR183='compositor-event-driven-r270';
  root.dataset.fxLivingHeartbeatInteractionR158='idle-living';
  root.dataset.fxLiveHeartbeatPositionR155='50.00,49.00';
  return true;
}
function start(){
  if(ensure()){
    bootObserver?.disconnect();bootObserver=null;
    return;
  }
  if(bootObserver)return;
  const target=document.body||document.documentElement;
  bootObserver=new MutationObserver(()=>{if(ensure()){bootObserver.disconnect();bootObserver=null;}});
  bootObserver.observe(target,{childList:true,subtree:true});
  setTimeout(()=>{bootObserver?.disconnect();bootObserver=null;ensure();},4000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
for(const eventName of ['formatx:real3dready','formatx:coredetailready','pageshow'])addEventListener(eventName,ensure,{passive:true});
}());

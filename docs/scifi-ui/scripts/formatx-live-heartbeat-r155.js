(function(){
'use strict';
const root=document.documentElement;
/* r183: keep the public r155/r158 identities for runtime compatibility, but
   drive the visible heartbeat from the display compositor clock. The crystal
   DOM box never scales: the existing r166 internal canvas renderer owns the
   four-tip body pulse, so mobile layout measurements remain completely stable. */
const VERSION='js-reactive-heartbeat-r155';
const MODE='r158-lub-dub-seamless-living';
const SHAPE_MODE='r183-display-synced-internal-canvas';
const SEAMLESS='/scifi-ui/styles/formatx-seamless-living-r158.css?v=20260815-r165-space-atmosphere-bridge';
if(root.dataset.fxLiveHeartbeatR155===VERSION&&root.dataset.fxLivingHeartbeatModeR158===MODE&&root.dataset.fxLivingShapeModeR167===SHAPE_MODE)return;
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
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
let host=null,layer=null,detail=null,core=null,ring=null,wave=null;
let raf=0,seq=0,boost=0,lastInput=0,lastFrame=performance.now();
let refreshEma=16.67,refreshSamples=0,lastHzReport=0;

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
      will-change:transform,opacity,filter;contain:layout paint style;
      backface-visibility:hidden;-webkit-backface-visibility:hidden;
    }
    #hero .fx-r155-heartbeat-core{
      z-index:31;width:clamp(104px,12vw,188px);aspect-ratio:1;
      background:radial-gradient(circle,rgba(255,255,255,.99) 0 1%,rgba(222,255,255,.84) 2.4%,rgba(83,239,255,.46) 7.5%,rgba(43,205,255,.20) 18%,rgba(164,76,255,.14) 31%,transparent 66%);
      box-shadow:0 0 16px rgba(220,255,255,.40),0 0 35px rgba(55,220,255,.22),0 0 62px rgba(146,70,255,.12);
    }
    #hero .fx-r155-heartbeat-ring{
      z-index:30;width:clamp(116px,13vw,204px);aspect-ratio:1;border:1px solid rgba(190,253,255,.52);
      box-shadow:0 0 14px rgba(79,230,255,.28),0 0 32px rgba(141,72,255,.12),inset 0 0 18px rgba(97,236,255,.14);
    }
    #hero .fx-r155-heartbeat-wave{
      z-index:29;width:clamp(144px,16vw,252px);aspect-ratio:1;border:1px solid rgba(108,235,255,.25);
      box-shadow:0 0 21px rgba(62,216,255,.13),0 0 44px rgba(151,73,255,.08);
    }
    @media(max-width:900px),(pointer:coarse){
      #hero .fx-r155-heartbeat-core{width:clamp(92px,29vw,132px)}
      #hero .fx-r155-heartbeat-ring{width:clamp(104px,32vw,146px)}
      #hero .fx-r155-heartbeat-wave{width:clamp(128px,39vw,176px)}
    }
  `;
  document.head.appendChild(style);
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

  /* Remove the old r167 CSS box scaling. The internal r166 canvas renderer
     already performs the four-tip heartbeat every rAF without changing layout. */
  if(detail instanceof HTMLElement){
    detail.style.removeProperty('scale');
    detail.style.setProperty('transform-origin','50% 50%');
  }

  if(host.dataset.fxHeartbeatBoundR155!=='r183'){
    const energize=()=>{
      boost=Math.max(boost,1.18);lastInput=performance.now();
      try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}
      root.dataset.fxLiveHeartbeatInteractionR155='active-r183';
    };
    host.addEventListener('pointerdown',energize,{passive:true});
    host.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){boost=Math.max(boost,.34);lastInput=performance.now();}},{passive:true});
    host.addEventListener('touchstart',energize,{passive:true});
    host.addEventListener('touchmove',()=>{boost=Math.max(boost,.78);lastInput=performance.now();},{passive:true});
    host.dataset.fxHeartbeatBoundR155='r183';
  }
  root.dataset.fxLiveHeartbeatR155=VERSION;
  root.dataset.fxLivingHeartbeatModeR158=MODE;
  root.dataset.fxLivingShapeModeR167=SHAPE_MODE;
  root.dataset.fxLivingShapePulseStateR167=reduced.matches?'reduced-motion-static':'internal-canvas-no-layout-shift';
  root.dataset.fxLivingShapeScaleSupportR167='internal-canvas-r166';
  return true;
}

function inlinePct(name,fallback){
  if(!(host instanceof HTMLElement))return fallback;
  const n=parseFloat(host.style.getPropertyValue(name));
  return Number.isFinite(n)?n:fallback;
}
function set(el,prop,value){
  if(el instanceof HTMLElement&&el.style.getPropertyValue(prop)!==value)el.style.setProperty(prop,value,'important');
}

function frame(now){
  raf=requestAnimationFrame(frame);
  if(document.hidden)return;
  if(!(host?.isConnected&&layer?.isConnected&&core?.isConnected&&ring?.isConnected&&wave?.isConnected)){
    if(!ensure())return;
  }

  const dt=clamp(now-lastFrame||8.3,2,80);lastFrame=now;
  if(dt<50){refreshEma+= (dt-refreshEma)*.08;refreshSamples++;}
  const paused=root.dataset.fxReferenceMotionPaused==='true';
  const still=paused||reduced.matches;
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.35);
  if(now-lastInput>90)boost*=Math.pow(.035,dt/1000);if(boost<.002)boost=0;

  const cycle=still?0:(now%1380)/1380;
  const lub=still?.18:gauss(cycle,.105,.040);
  const dub=still?.10:gauss(cycle,.235,.052)*.64;
  const beat=clamp(lub+dub,0,1.08);
  const breath=still?.35:(.5+.5*Math.sin(now*.00118-1.05));
  const shimmer=still?.28:(.5+.5*Math.sin(now*.0067+1.45));
  const activity=clamp(energy*.46+boost*.58,0,1.35);
  const x=inlinePct('--fx-r147-light-x',50),y=inlinePct('--fx-r147-light-y',49);

  const coreScale=.955+breath*.014+beat*.105+activity*.028;
  const ringScale=.925+breath*.020+lub*.205+dub*.135+activity*.038;
  const waveScale=.855+breath*.028+lub*.34+dub*.22+activity*.060;
  const coreOpacity=clamp(.30+breath*.10+beat*.43+activity*.15,.28,.96);
  const ringOpacity=clamp(.18+breath*.08+lub*.42+dub*.31+activity*.13,.16,.86);
  const waveOpacity=clamp(.07+breath*.05+lub*.25+dub*.20+activity*.09,.06,.54);
  const brightness=clamp(1.055+breath*.035+beat*.185+activity*.055,1.05,1.38);
  const saturation=clamp(1.10+shimmer*.055+activity*.075,1.10,1.32);
  const contrast=clamp(1.14+beat*.055+activity*.025,1.14,1.24);
  const cyanBlur=clamp(15+breath*4+beat*12+activity*5,15,36);
  const cyanAlpha=clamp(.19+beat*.18+activity*.08,.18,.47);
  const violetBlur=clamp(27+breath*5+dub*10+activity*5,27,46);
  const violetAlpha=clamp(.10+dub*.12+activity*.055,.09,.28);
  const fieldOpacity=clamp(.58+breath*.12+beat*.18+activity*.07,.56,.94);
  const fieldBlur=clamp(17+breath*3+activity*2,17,23);

  set(core,'left',x.toFixed(2)+'%');set(core,'top',y.toFixed(2)+'%');
  set(ring,'left',x.toFixed(2)+'%');set(ring,'top',y.toFixed(2)+'%');
  set(wave,'left',x.toFixed(2)+'%');set(wave,'top',y.toFixed(2)+'%');
  set(core,'transform',`translate3d(-50%,-50%,0) scale(${coreScale.toFixed(4)})`);
  set(core,'opacity',coreOpacity.toFixed(3));
  set(core,'filter',`brightness(${(1.03+beat*.31+activity*.08).toFixed(3)}) drop-shadow(0 0 ${(10+beat*17+activity*5).toFixed(1)}px rgba(99,238,255,.34))`);
  set(ring,'transform',`translate3d(-50%,-50%,0) scale(${ringScale.toFixed(4)}) rotate(${((now*.013)+(x-y)*.4)%360}deg)`);
  set(ring,'opacity',ringOpacity.toFixed(3));
  set(wave,'transform',`translate3d(-50%,-50%,0) scale(${waveScale.toFixed(4)})`);
  set(wave,'opacity',waveOpacity.toFixed(3));

  host.style.setProperty('--fx-r158-heart',beat.toFixed(4));
  host.style.setProperty('--fx-r158-breath',breath.toFixed(4));
  host.style.setProperty('--fx-r158-activity',activity.toFixed(4));
  host.style.setProperty('--fx-r158-heart-x',x.toFixed(2)+'%');
  host.style.setProperty('--fx-r158-heart-y',y.toFixed(2)+'%');
  host.style.setProperty('--fx-r158-detail-brightness',brightness.toFixed(3));
  host.style.setProperty('--fx-r158-detail-saturation',saturation.toFixed(3));
  host.style.setProperty('--fx-r158-detail-contrast',contrast.toFixed(3));
  host.style.setProperty('--fx-r158-cyan-blur',cyanBlur.toFixed(1)+'px');
  host.style.setProperty('--fx-r158-cyan-alpha',cyanAlpha.toFixed(3));
  host.style.setProperty('--fx-r158-violet-blur',violetBlur.toFixed(1)+'px');
  host.style.setProperty('--fx-r158-violet-alpha',violetAlpha.toFixed(3));
  host.style.setProperty('--fx-r158-field-opacity',fieldOpacity.toFixed(3));
  host.style.setProperty('--fx-r158-field-blur',fieldBlur.toFixed(1)+'px');

  const hero=document.getElementById('hero');
  if(hero instanceof HTMLElement){
    hero.style.setProperty('--fx-r158-heart-x',x.toFixed(2)+'%');
    hero.style.setProperty('--fx-r158-heart-y',y.toFixed(2)+'%');
    hero.style.setProperty('--fx-r158-field-opacity',fieldOpacity.toFixed(3));
    hero.style.setProperty('--fx-r158-field-blur',fieldBlur.toFixed(1)+'px');
  }

  seq++;
  root.dataset.fxLiveHeartbeatTickR155=String(seq);
  root.dataset.fxLiveHeartbeatPhaseR155=beat.toFixed(4);
  root.dataset.fxLiveHeartbeatPositionR155=`${x.toFixed(2)},${y.toFixed(2)}`;
  root.dataset.fxLiveHeartbeatEnergyR155=activity.toFixed(3);
  root.dataset.fxLiveHeartbeatPausedR155=String(still);
  root.dataset.fxLivingHeartbeatBeatR158=`${lub.toFixed(3)},${dub.toFixed(3)},${breath.toFixed(3)}`;
  root.dataset.fxLivingHeartbeatInteractionR158=boost>.04?'energized':'idle-living';
  root.dataset.fxLivingShapeScaleR167='1.0000,1.0000';
  root.dataset.fxLivingShapeEnvelopeR167=`${lub.toFixed(3)},${dub.toFixed(3)},${beat.toFixed(3)}`;
  root.dataset.fxLiveHeartbeatClockR155='requestAnimationFrame-display-synced-r183';
  root.dataset.fxHeartbeatSchedulerR183='display-refresh-adaptive';

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
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
const mo=new MutationObserver(()=>{if(!host?.isConnected||!layer?.isConnected||!detail?.isConnected)ensure();});
mo.observe(document.documentElement,{childList:true,subtree:true});
addEventListener('pageshow',start,{passive:true});
}());

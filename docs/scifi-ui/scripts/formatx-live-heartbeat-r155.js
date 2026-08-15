(function(){
'use strict';
const root=document.documentElement;
const VERSION='js-reactive-heartbeat-r155';
if(root.dataset.fxLiveHeartbeatR155===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLiveHeartbeatR155='audit-skip';return;}
root.dataset.fxLiveHeartbeatR155='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let host=null,layer=null,core=null,ring=null,wave=null,timer=0,seq=0,boost=0,lastInput=0;

function ensureStyle(){
  if(document.getElementById('fx-live-heartbeat-r155-style'))return;
  const style=document.createElement('style');
  style.id='fx-live-heartbeat-r155-style';
  style.textContent=`
    #hero .fx-r155-heartbeat-core,
    #hero .fx-r155-heartbeat-ring,
    #hero .fx-r155-heartbeat-wave{
      position:absolute;left:50%;top:49%;pointer-events:none;border-radius:50%;
      transform:translate(-50%,-50%);transform-origin:50% 50%;mix-blend-mode:screen;
      will-change:transform,opacity,filter,left,top;contain:layout paint style;
    }
    #hero .fx-r155-heartbeat-core{
      z-index:31;width:clamp(106px,12vw,188px);aspect-ratio:1;
      background:radial-gradient(circle,rgba(255,255,255,.98) 0 1.2%,rgba(221,254,255,.80) 2.6%,rgba(82,235,255,.43) 8%,rgba(45,203,255,.20) 18%,rgba(162,78,255,.13) 32%,transparent 66%);
      box-shadow:0 0 16px rgba(220,255,255,.38),0 0 34px rgba(55,220,255,.21),0 0 58px rgba(146,70,255,.11);
    }
    #hero .fx-r155-heartbeat-ring{
      z-index:30;width:clamp(116px,13vw,204px);aspect-ratio:1;border:1px solid rgba(187,252,255,.48);
      box-shadow:0 0 14px rgba(79,230,255,.26),0 0 31px rgba(141,72,255,.11),inset 0 0 18px rgba(97,236,255,.13);
    }
    #hero .fx-r155-heartbeat-wave{
      z-index:29;width:clamp(142px,16vw,252px);aspect-ratio:1;border:1px solid rgba(108,235,255,.24);
      box-shadow:0 0 20px rgba(62,216,255,.12),0 0 42px rgba(151,73,255,.07);
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
  host=document.querySelector('#hero .hero-space');
  layer=document.querySelector('#hero .fx-core-live-r147-layer');
  if(!(host instanceof HTMLElement)||!(layer instanceof HTMLElement))return false;
  ensureStyle();
  core=layer.querySelector('.fx-r155-heartbeat-core');
  ring=layer.querySelector('.fx-r155-heartbeat-ring');
  wave=layer.querySelector('.fx-r155-heartbeat-wave');
  if(!(core instanceof HTMLElement)){
    core=document.createElement('span');core.className='fx-r155-heartbeat-core';core.setAttribute('aria-hidden','true');layer.appendChild(core);
  }
  if(!(ring instanceof HTMLElement)){
    ring=document.createElement('span');ring.className='fx-r155-heartbeat-ring';ring.setAttribute('aria-hidden','true');layer.appendChild(ring);
  }
  if(!(wave instanceof HTMLElement)){
    wave=document.createElement('span');wave.className='fx-r155-heartbeat-wave';wave.setAttribute('aria-hidden','true');layer.appendChild(wave);
  }
  if(host.dataset.fxHeartbeatBoundR155!=='true'){
    const energize=()=>{boost=1;lastInput=performance.now();root.dataset.fxLiveHeartbeatInteractionR155='active';};
    host.addEventListener('pointerdown',energize,{passive:true});
    host.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){boost=Math.max(boost,.28);lastInput=performance.now();}},{passive:true});
    host.addEventListener('touchstart',energize,{passive:true});
    host.addEventListener('touchmove',()=>{boost=Math.max(boost,.72);lastInput=performance.now();},{passive:true});
    host.dataset.fxHeartbeatBoundR155='true';
  }
  root.dataset.fxLiveHeartbeatR155=VERSION;
  return true;
}

function pct(name,fallback){
  if(!(host instanceof HTMLElement))return fallback;
  const inline=host.style.getPropertyValue(name);
  const computed=getComputedStyle(host).getPropertyValue(name);
  const n=parseFloat(inline||computed);
  return Number.isFinite(n)?n:fallback;
}

function set(el,prop,value){if(el instanceof HTMLElement)el.style.setProperty(prop,value,'important');}

function tick(){
  if(!ensure())return;
  const now=performance.now();
  const paused=root.dataset.fxReferenceMotionPaused==='true';
  const still=paused||reduced.matches;
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.35);
  if(now-lastInput>130)boost*=.86;
  if(boost<.002)boost=0;
  const phase=still?0:now*.00255;
  const beat=still?.30:(.5+.5*Math.sin(phase));
  const overtone=still?.20:(.5+.5*Math.sin(phase*2.03+1.18));
  const activity=clamp(energy*.48+boost*.52,0,1.25);
  const x=pct('--fx-r147-light-x',50);
  const y=pct('--fx-r147-light-y',49);

  const coreScale=.91+beat*.12+activity*.035;
  const ringScale=.90+beat*.18+activity*.045;
  const waveScale=.82+beat*.34+activity*.075;
  const coreOpacity=clamp(.28+beat*.34+activity*.16,.25,.88);
  const ringOpacity=clamp(.18+overtone*.34+activity*.14,.16,.72);
  const waveOpacity=clamp(.08+(1-beat)*.20+activity*.08,.06,.42);
  const blur=(10+beat*10+activity*5).toFixed(1);

  for(const el of [core,ring,wave]){set(el,'left',x.toFixed(2)+'%');set(el,'top',y.toFixed(2)+'%');}
  set(core,'transform',`translate(-50%,-50%) scale(${coreScale.toFixed(4)})`);
  set(core,'opacity',coreOpacity.toFixed(3));
  set(core,'filter',`brightness(${(1.02+beat*.26+activity*.08).toFixed(3)}) drop-shadow(0 0 ${blur}px rgba(99,238,255,.30))`);
  set(ring,'transform',`translate(-50%,-50%) scale(${ringScale.toFixed(4)}) rotate(${(phase*13%360).toFixed(2)}deg)`);
  set(ring,'opacity',ringOpacity.toFixed(3));
  set(wave,'transform',`translate(-50%,-50%) scale(${waveScale.toFixed(4)})`);
  set(wave,'opacity',waveOpacity.toFixed(3));

  seq++;
  root.dataset.fxLiveHeartbeatTickR155=String(seq);
  root.dataset.fxLiveHeartbeatPhaseR155=beat.toFixed(4);
  root.dataset.fxLiveHeartbeatPositionR155=`${x.toFixed(2)},${y.toFixed(2)}`;
  root.dataset.fxLiveHeartbeatEnergyR155=activity.toFixed(3);
  root.dataset.fxLiveHeartbeatPausedR155=String(still);
}

function start(){
  ensure();
  if(timer)return;
  tick();
  timer=setInterval(tick,50);
  root.dataset.fxLiveHeartbeatClockR155='50ms-interval';
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
const mo=new MutationObserver(()=>{if(!layer?.isConnected)ensure();});
mo.observe(document.documentElement,{childList:true,subtree:true});
addEventListener('pageshow',start,{passive:true});
}());

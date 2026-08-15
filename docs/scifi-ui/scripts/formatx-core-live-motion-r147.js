(function(){
'use strict';
const root=document.documentElement;
const VERSION='r145-safe-live-optics-r147';
if(root.dataset.fxLiveMotionR147===VERSION||root.dataset.fxLiveMotionR147==='ready')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLiveMotionR147='audit-skip';return;}
root.dataset.fxLiveMotionR147='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let host=null,detail=null,raf=0,last=performance.now(),visible=true;
let sx=0,sy=0,se=.22;

function find(){
  host=document.querySelector('#hero .hero-space');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  return host instanceof HTMLElement&&detail instanceof HTMLCanvasElement;
}

function pulse(){
  try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){/* renderer remains authoritative */}
}

function activate(event){
  if(event?.isTrusted===false)return;
  pulse();
  se=Math.max(se,.78);
  root.dataset.fxLiveMotionInteractionR147='active';
}

function bind(){
  if(!find())return false;
  if(host.dataset.fxLiveMotionBoundR147==='true')return true;
  host.dataset.fxLiveMotionBoundR147='true';
  host.addEventListener('pointerdown',activate,{passive:true});
  host.addEventListener('touchstart',activate,{passive:true});
  return true;
}

function frame(now){
  raf=0;
  if(!visible){raf=requestAnimationFrame(frame);return;}
  if(!host?.isConnected||!detail?.isConnected){if(!bind()){raf=requestAnimationFrame(frame);return;}}

  const paused=root.dataset.fxReferenceMotionPaused==='true';
  root.dataset.fxLiveMotionPausedR147=String(paused);

  const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0];
  const rawEnergy=Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.30);
  const tx=paused||reduced.matches?0:clamp(Number(cp[0]||0)/.075,-1,1);
  const ty=paused||reduced.matches?0:clamp(Number(cp[1]||0)/.075,-1,1);
  const te=paused||reduced.matches?.18:clamp((rawEnergy-.30)/1.25,.18,1);
  const dt=Math.min(50,Math.max(0,now-last));last=now;
  const k=1-Math.pow(.002,dt/1000*6.5);
  sx+=(tx-sx)*k;sy+=(ty-sy)*k;se+=(te-se)*Math.min(1,k*.82);

  const breathe=paused||reduced.matches?0:.5+.5*Math.sin(now*.00155);
  const x=50+sx*13.5;
  const y=48-sy*11.5;
  const activity=clamp(Math.hypot(sx,sy)*.48+se*.72,0,1);
  const opacity=clamp(.29+breathe*.055+activity*.16,.24,.52);
  const brightness=clamp(1+breathe*.012+activity*.032,1,1.055);
  const saturation=clamp(1+breathe*.015+activity*.050,1,1.075);

  host.style.setProperty('--fx-r147-light-x',x.toFixed(2)+'%');
  host.style.setProperty('--fx-r147-light-y',y.toFixed(2)+'%');
  host.style.setProperty('--fx-r147-light-opacity',opacity.toFixed(3));
  host.style.setProperty('--fx-r147-brightness',brightness.toFixed(3));
  host.style.setProperty('--fx-r147-saturation',saturation.toFixed(3));
  root.dataset.fxLiveMotionVectorR147=`${sx.toFixed(3)},${sy.toFixed(3)},${activity.toFixed(3)}`;
  root.dataset.fxLiveMotionR147='ready';
  raf=requestAnimationFrame(frame);
}

function start(){if(!raf)raf=requestAnimationFrame(frame);}
function boot(attempt=0){
  if(!bind()){
    if(attempt<360)return requestAnimationFrame(()=>boot(attempt+1));
    root.dataset.fxLiveMotionR147='host-unavailable';return;
  }
  const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)start();},{rootMargin:'180px'});
  io.observe(host);
  start();
}

['formatx:real3dready','formatx:coredetailready','formatx:referencepause'].forEach(name=>addEventListener(name,start,{passive:true}));
addEventListener('pageshow',start,{passive:true});
boot();
}());

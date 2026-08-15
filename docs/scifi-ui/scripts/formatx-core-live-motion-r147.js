(function(){
'use strict';
const root=document.documentElement;
const VERSION='r145-visible-live-optics-safe-lane-r147b';
if(root.dataset.fxLiveMotionR147===VERSION||root.dataset.fxLiveMotionR147==='ready')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLiveMotionR147='audit-skip';return;}
root.dataset.fxLiveMotionR147='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const imp=(el,prop,value)=>{if(el instanceof HTMLElement&&el.style.getPropertyValue(prop)!==value)el.style.setProperty(prop,value,'important');};
let host=null,detail=null,layer=null,raf=0,last=performance.now(),visible=true;
let sx=0,sy=0,se=.25,manualX=0,manualY=0,manualUntil=0;

function find(){
  host=document.querySelector('#hero .hero-space');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  return host instanceof HTMLElement&&detail instanceof HTMLCanvasElement;
}

function ensureLayer(){
  if(!(host instanceof HTMLElement))return null;
  layer=host.querySelector('.fx-core-live-r147-layer');
  if(layer instanceof HTMLElement)return layer;
  layer=document.createElement('div');
  layer.className='fx-core-live-r147-layer';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML='<span class="fx-core-live-r147-glow"></span><span class="fx-core-live-r147-flare"></span><span class="fx-core-live-r147-orbit"></span><span class="fx-core-live-r147-orbit-b"></span>';
  host.appendChild(layer);
  root.dataset.fxLiveMotionLayerR147='mounted';
  return layer;
}

function applySafeLane(){
  const hero=document.getElementById('hero');
  const space=hero?.querySelector('.hero-space');
  const tail=hero?.querySelector('.fx-core-reference-tail-r143');
  const heading=hero?.querySelector('.fx-reference-heading');
  const proof=hero?.querySelector('.fx-reference-proof');
  const live=proof?.querySelector('.fx-reference-liveos');
  if(!(hero instanceof HTMLElement)||!(space instanceof HTMLElement))return;

  if(innerWidth<=900){
    const sr=space.getBoundingClientRect();
    const tr=tail instanceof HTMLElement?tail.getBoundingClientRect():null;
    const protrusion=Math.max(0,(tr?.bottom||sr.bottom)-sr.bottom);
    const clearGap=innerWidth<=430?58:50;
    const marginTop=Math.ceil(protrusion+clearGap);

    imp(hero,'padding-bottom',innerWidth<=380?'84px':'76px');
    imp(hero,'overflow','visible');
    if(heading instanceof HTMLElement){
      imp(heading,'top','0px');
      imp(heading,'margin',`${marginTop}px 6% 26px`);
      imp(heading,'z-index','24');
    }
    if(proof instanceof HTMLElement){
      imp(proof,'margin',innerWidth<=380?'0 7% 50px 6%':'0 7% 46px 6%');
      imp(proof,'z-index','24');
      if(innerWidth<=430)imp(proof,'min-height','252px');
    }
    if(live instanceof HTMLElement&&innerWidth<=430){imp(live,'top','auto');imp(live,'bottom','18px');}

    const hr=heading instanceof HTMLElement?heading.getBoundingClientRect():null;
    const tailBottom=tr?.bottom||sr.bottom;
    const actualGap=hr?hr.top-tailBottom:marginTop-protrusion;
    root.dataset.fxLiveSafeLaneR147='active';
    root.dataset.fxLiveSafeGapR147=actualGap.toFixed(1)+'px';
    root.dataset.fxLiveTailProtrusionR147=protrusion.toFixed(1)+'px';
  }else if(root.dataset.fxLiveSafeLaneR147==='active'){
    hero.style.removeProperty('padding-bottom');hero.style.removeProperty('overflow');
    for(const el of [heading,proof,live])if(el instanceof HTMLElement){for(const prop of ['top','bottom','margin','z-index','min-height'])el.style.removeProperty(prop);}
    root.dataset.fxLiveSafeLaneR147='desktop';
  }
}

function pulse(){
  try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){/* renderer remains authoritative */}
}

function pointerTarget(event){
  if(!(host instanceof HTMLElement))return;
  const r=host.getBoundingClientRect();
  if(!r.width||!r.height)return;
  manualX=clamp(((event.clientX-r.left)/r.width)*2-1,-1,1);
  manualY=clamp(((event.clientY-r.top)/r.height)*2-1,-1,1);
  manualUntil=performance.now()+520;
}

function activate(event){
  if(event?.isTrusted===false)return;
  pointerTarget(event);
  pulse();
  se=Math.max(se,1.0);
  root.dataset.fxLiveMotionInteractionR147='active';
}

function bind(){
  if(!find())return false;
  ensureLayer();
  if(host.dataset.fxLiveMotionBoundR147==='true')return true;
  host.dataset.fxLiveMotionBoundR147='true';
  host.addEventListener('pointerdown',activate,{passive:true});
  host.addEventListener('pointermove',pointerTarget,{passive:true});
  host.addEventListener('touchstart',activate,{passive:true});
  return true;
}

function frame(now){
  raf=0;
  applySafeLane();
  if(!visible){raf=requestAnimationFrame(frame);return;}
  if(!host?.isConnected||!detail?.isConnected){if(!bind()){raf=requestAnimationFrame(frame);return;}}
  ensureLayer();

  const paused=root.dataset.fxReferenceMotionPaused==='true';
  root.dataset.fxLiveMotionPausedR147=String(paused);

  const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0];
  const rawEnergy=Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.30);
  const manual=now<manualUntil;
  const sourceX=manual?manualX:clamp(Number(cp[0]||0)/.075,-1,1);
  const sourceY=manual?manualY:clamp(Number(cp[1]||0)/.075,-1,1);
  const tx=(paused||reduced.matches)?0:sourceX;
  const ty=(paused||reduced.matches)?0:sourceY;
  const te=(paused||reduced.matches)?0.18:clamp((rawEnergy-.22)/1.05,.22,1.2);
  const dt=Math.min(50,Math.max(0,now-last));last=now;
  const k=1-Math.pow(.0015,dt/1000*7.4);
  sx+=(tx-sx)*k;sy+=(ty-sy)*k;se+=(te-se)*Math.min(1,k*.90);

  const breathe=(paused||reduced.matches)?0:.5+.5*Math.sin(now*.00265);
  const activity=clamp(Math.hypot(sx,sy)*.62+se*.72,0,1.25);
  const x=50+sx*20;
  const y=48+sy*16;
  const opacity=clamp(.48+breathe*.14+activity*.18,.42,.86);
  const brightness=clamp(1.035+breathe*.055+activity*.045,1.03,1.16);
  const saturation=clamp(1.05+breathe*.05+activity*.065,1.04,1.19);
  const pulseScale=clamp(1+breathe*.035+activity*.018,1,1.075);
  const flareOpacity=clamp(.40+breathe*.18+activity*.18,.38,.82);
  const flareScale=clamp(.96+breathe*.10+Math.abs(sx)*.08,.94,1.18);
  const orbitOpacity=clamp(.34+breathe*.10+activity*.10,.30,.62);
  const shadowBlur=clamp(7+breathe*5+activity*5,7,17);
  const shadowAlpha=clamp(.13+breathe*.09+activity*.08,.12,.31);

  host.style.setProperty('--fx-r147-light-x',x.toFixed(2)+'%');
  host.style.setProperty('--fx-r147-light-y',y.toFixed(2)+'%');
  host.style.setProperty('--fx-r147-light-opacity',opacity.toFixed(3));
  host.style.setProperty('--fx-r147-brightness',brightness.toFixed(3));
  host.style.setProperty('--fx-r147-saturation',saturation.toFixed(3));
  host.style.setProperty('--fx-r147-pulse-scale',pulseScale.toFixed(3));
  host.style.setProperty('--fx-r147-flare-opacity',flareOpacity.toFixed(3));
  host.style.setProperty('--fx-r147-flare-scale',flareScale.toFixed(3));
  host.style.setProperty('--fx-r147-orbit-opacity',orbitOpacity.toFixed(3));
  host.style.setProperty('--fx-r147-shadow-blur',shadowBlur.toFixed(1)+'px');
  host.style.setProperty('--fx-r147-shadow-alpha',shadowAlpha.toFixed(3));

  root.dataset.fxLiveMotionVectorR147=`${sx.toFixed(3)},${sy.toFixed(3)},${activity.toFixed(3)}`;
  root.dataset.fxLiveMotionFrameR147=`${opacity.toFixed(3)},${brightness.toFixed(3)},${x.toFixed(2)},${y.toFixed(2)}`;
  root.dataset.fxLiveMotionR147='ready';
  raf=requestAnimationFrame(frame);
}

function start(){if(!raf)raf=requestAnimationFrame(frame);}
function boot(attempt=0){
  applySafeLane();
  if(!bind()){
    if(attempt<360)return requestAnimationFrame(()=>boot(attempt+1));
    root.dataset.fxLiveMotionR147='host-unavailable';return;
  }
  const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)start();},{rootMargin:'220px'});
  io.observe(host);
  start();
}

['formatx:real3dready','formatx:coredetailready','formatx:referencepause','formatx:languagechange'].forEach(name=>addEventListener(name,()=>{applySafeLane();ensureLayer();start();},{passive:true}));
addEventListener('resize',applySafeLane,{passive:true});
addEventListener('pageshow',start,{passive:true});
boot();
}());

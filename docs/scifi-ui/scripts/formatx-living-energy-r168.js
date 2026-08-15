(function(){
'use strict';
const root=document.documentElement;
const VERSION='r168-living-energy-orbit-caustic';
if(root.dataset.fxLivingEnergyR168===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLivingEnergyR168='audit-skip';return;}
root.dataset.fxLivingEnergyR168='booting';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
let host=null,layer=null,detail=null,boost=0,lastInput=0,raf=0,last=0;
let pointerX=0,pointerY=0;

function make(cls){
  const e=document.createElement('span');
  e.className=cls;e.setAttribute('aria-hidden','true');return e;
}
function ensure(){
  host=document.querySelector('#hero .hero-space');
  layer=document.querySelector('#hero .fx-core-live-r147-layer');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  if(!(host instanceof HTMLElement)||!(layer instanceof HTMLElement))return false;
  const wanted=[
    'fx-r168-orbit fx-r168-orbit-a','fx-r168-orbit fx-r168-orbit-b',
    'fx-r168-caustic','fx-r168-flare fx-r168-flare-x','fx-r168-flare fx-r168-flare-y',
    'fx-r168-shockwave','fx-r168-spark fx-r168-spark-a','fx-r168-spark fx-r168-spark-b',
    'fx-r168-spark fx-r168-spark-c','fx-r168-spark fx-r168-spark-d'
  ];
  for(const cls of wanted){const first=cls.split(' ')[0],extra=cls.split(' ')[1];if(!layer.querySelector('.'+first+(extra?'.'+extra:'')))layer.appendChild(make(cls));}
  if(host.dataset.fxLivingEnergyBoundR168!=='true'){
    const pos=(x,y)=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;pointerX=clamp((x-r.left)/r.width*2-1,-1,1);pointerY=clamp((y-r.top)/r.height*2-1,-1,1);};
    const hit=(strength=1)=>{boost=Math.max(boost,strength);lastInput=performance.now();root.dataset.fxLivingEnergyInteractionR168='energized';try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}};
    host.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){pos(e.clientX,e.clientY);boost=Math.max(boost,.28);lastInput=performance.now();}},{passive:true});
    host.addEventListener('pointerdown',e=>{pos(e.clientX,e.clientY);hit(1.2);},{passive:true});
    host.addEventListener('touchstart',e=>{const t=e.touches?.[0];if(t)pos(t.clientX,t.clientY);hit(1.28);},{passive:true});
    host.addEventListener('touchmove',e=>{const t=e.touches?.[0];if(t)pos(t.clientX,t.clientY);boost=Math.max(boost,.82);lastInput=performance.now();},{passive:true});
    host.dataset.fxLivingEnergyBoundR168='true';
  }
  root.dataset.fxLivingEnergyR168=VERSION;
  return true;
}
function tick(now){
  raf=requestAnimationFrame(tick);
  if(!ensure())return;
  if(now-last<16)return;last=now;
  const still=reduced.matches||root.dataset.fxReferenceMotionPaused==='true';
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.5);
  const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0];
  const gx=clamp(Number(cp[0]||0)*7,-1,1),gy=clamp(Number(cp[1]||0)*7,-1,1);
  if(now-lastInput>90)boost*=.91;if(boost<.002)boost=0;
  const cycle=still?0:(now%1380)/1380;
  const lub=still?0:gauss(cycle,.105,.040);
  const dub=still?0:gauss(cycle,.235,.055)*.66;
  const beat=clamp(lub+dub,0,1.08);
  const breath=still?.5:.5+.5*Math.sin(now*.00118-1.05);
  const activity=clamp(energy*.42+boost*.70,0,1.45);
  const x=clamp(pointerX*.55+gx*.45,-1,1),y=clamp(pointerY*.55-gy*.45,-1,1);
  const orbitA=(now*.017+x*12)%360,orbitB=(-now*.011+y*15)%360;
  const caustic=(now*.022+x*18-y*9)%360;
  const pulse=clamp(beat*.86+activity*.42,0,1.35);
  const shock=clamp(.72+beat*.54+activity*.12,.70,1.45);
  const flare=clamp(.10+beat*.48+activity*.20,.08,.78);
  host.style.setProperty('--fx-r168-x',`${(50+x*4.2).toFixed(2)}%`);
  host.style.setProperty('--fx-r168-y',`${(49+y*3.4).toFixed(2)}%`);
  host.style.setProperty('--fx-r168-orbit-a',`${orbitA.toFixed(2)}deg`);
  host.style.setProperty('--fx-r168-orbit-b',`${orbitB.toFixed(2)}deg`);
  host.style.setProperty('--fx-r168-caustic',`${caustic.toFixed(2)}deg`);
  host.style.setProperty('--fx-r168-pulse',pulse.toFixed(4));
  host.style.setProperty('--fx-r168-shock',shock.toFixed(4));
  host.style.setProperty('--fx-r168-flare',flare.toFixed(4));
  host.style.setProperty('--fx-r168-breath',breath.toFixed(4));
  host.style.setProperty('--fx-r168-activity',activity.toFixed(4));
  host.style.setProperty('--fx-r168-parallax-x',`${(x*8).toFixed(2)}px`);
  host.style.setProperty('--fx-r168-parallax-y',`${(y*6).toFixed(2)}px`);
  if(detail instanceof HTMLElement){
    detail.style.setProperty('--fx-r168-refract',`${(x*1.8+y*.8).toFixed(2)}deg`);
    detail.style.setProperty('--fx-r168-live-opacity',clamp(.975+beat*.018+activity*.006,.975,1).toFixed(3));
  }
  root.dataset.fxLivingEnergyBeatR168=`${lub.toFixed(3)},${dub.toFixed(3)},${breath.toFixed(3)}`;
  root.dataset.fxLivingEnergyPositionR168=`${x.toFixed(3)},${y.toFixed(3)}`;
  root.dataset.fxLivingEnergyActivityR168=activity.toFixed(3);
  root.dataset.fxLivingEnergyClockR168='requestAnimationFrame';
  root.dataset.fxLivingEnergyInteractionR168=boost>.04?'energized':'idle-living';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensure();raf=requestAnimationFrame(tick);},{once:true});else{ensure();raf=requestAnimationFrame(tick);}
addEventListener('pageshow',()=>{ensure();if(!raf)raf=requestAnimationFrame(tick);},{passive:true});
}());

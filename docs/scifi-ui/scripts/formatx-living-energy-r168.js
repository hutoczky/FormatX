(function(){
'use strict';
const root=document.documentElement;
const VERSION='r168-living-energy-orbit-caustic-v2';
if(root.dataset.fxLivingEnergyR168===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLivingEnergyR168='audit-skip';return;}
root.dataset.fxLivingEnergyR168='booting';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
let host=null,layer=null,detail=null,boost=0,lastInput=0,raf=0,last=0;
let pointerX=0,pointerY=0,burstAt=0,burstStrength=0;

function make(cls){const e=document.createElement('span');e.className=cls;e.setAttribute('aria-hidden','true');return e;}
function ensure(){
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
  if(host.dataset.fxLivingEnergyBoundR168!=='v2'){
    const pos=(x,y)=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;pointerX=clamp((x-r.left)/r.width*2-1,-1,1);pointerY=clamp((y-r.top)/r.height*2-1,-1,1);};
    const hit=(strength=1)=>{const now=performance.now();boost=Math.max(boost,strength);burstStrength=Math.max(burstStrength,strength);burstAt=now;lastInput=now;root.dataset.fxLivingEnergyInteractionR168='energy-burst';try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}};
    host.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){pos(e.clientX,e.clientY);boost=Math.max(boost,.48);lastInput=performance.now();root.dataset.fxLivingEnergyInteractionR168='pointer-reactive';}},{passive:true});
    host.addEventListener('pointerdown',e=>{pos(e.clientX,e.clientY);hit(1.48);},{passive:true});
    host.addEventListener('touchstart',e=>{const t=e.touches?.[0];if(t)pos(t.clientX,t.clientY);hit(1.58);},{passive:true});
    host.addEventListener('touchmove',e=>{const t=e.touches?.[0];if(t)pos(t.clientX,t.clientY);boost=Math.max(boost,1.0);lastInput=performance.now();root.dataset.fxLivingEnergyInteractionR168='touch-reactive';},{passive:true});
    host.dataset.fxLivingEnergyBoundR168='v2';
  }
  root.dataset.fxLivingEnergyR168=VERSION;
  return true;
}
function tick(now){
  raf=requestAnimationFrame(tick);
  if(!ensure())return;
  if(now-last<20)return;
  const dt=Math.min(80,Math.max(0,now-last));last=now;
  const still=reduced.matches||root.dataset.fxReferenceMotionPaused==='true';
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.5);
  const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0];
  const gx=clamp(Number(cp[0]||0)*7,-1,1),gy=clamp(Number(cp[1]||0)*7,-1,1);
  if(now-lastInput>70)boost*=Math.pow(.055,dt/1000*1.38);if(boost<.002)boost=0;
  burstStrength*=Math.pow(.028,dt/1000*1.18);if(burstStrength<.002)burstStrength=0;

  const cycle=still?0:(now%1380)/1380;
  const lub=still?0:gauss(cycle,.105,.040);
  const dub=still?0:gauss(cycle,.235,.055)*.66;
  const beat=clamp(lub+dub,0,1.08);
  const breath=still?.5:.5+.5*Math.sin(now*.00118-1.05);
  const activity=still?.12:clamp(energy*.40+boost*.78+burstStrength*.48,0,1.65);
  const x=clamp(pointerX*.58+gx*.42,-1,1),y=clamp(pointerY*.58-gy*.42,-1,1);
  const orbitA=(now*(.017+activity*.004)+x*16)%360,orbitB=(-now*(.011+activity*.003)+y*18)%360;
  const causticA=(now*.020+x*22-y*11)%360,causticB=(-now*.013+x*10+y*18)%360;
  const pulse=clamp(beat*.98+activity*.48,0,1.5);
  const shock=clamp(.72+beat*.48+activity*.12,.70,1.42);
  const flare=clamp(.12+beat*.58+activity*.27,.10,.92);
  const spectrum=clamp(.08+beat*.44+activity*.31,.07,.88);
  const refract=clamp(.10+beat*.26+activity*.30,.08,.72);

  let burstP=1,burstO=0;
  if(burstAt){const age=(now-burstAt)/780;if(age<1){burstP=age;burstO=(1-age)*clamp(.78+burstStrength*.18,.78,1);}else burstAt=0;}

  host.style.setProperty('--fx-r168-x',`${(50+x*7.2).toFixed(2)}%`);
  host.style.setProperty('--fx-r168-y',`${(49+y*5.8).toFixed(2)}%`);
  host.style.setProperty('--fx-r168-orbit-a',`${orbitA.toFixed(2)}deg`);
  host.style.setProperty('--fx-r168-orbit-b',`${orbitB.toFixed(2)}deg`);
  host.style.setProperty('--fx-r168-caustic-a',`${causticA.toFixed(2)}deg`);
  host.style.setProperty('--fx-r168-caustic-b',`${causticB.toFixed(2)}deg`);
  host.style.setProperty('--fx-r168-pulse',pulse.toFixed(4));
  host.style.setProperty('--fx-r168-shock',shock.toFixed(4));
  host.style.setProperty('--fx-r168-flare',flare.toFixed(4));
  host.style.setProperty('--fx-r168-spectrum',spectrum.toFixed(4));
  host.style.setProperty('--fx-r168-refract-strength',refract.toFixed(4));
  host.style.setProperty('--fx-r168-breath',breath.toFixed(4));
  host.style.setProperty('--fx-r168-activity',activity.toFixed(4));
  host.style.setProperty('--fx-r168-parallax-x',`${(x*13).toFixed(2)}px`);
  host.style.setProperty('--fx-r168-parallax-y',`${(y*10).toFixed(2)}px`);
  host.style.setProperty('--fx-r168-burst-scale',(.54+burstP*1.62).toFixed(4));
  host.style.setProperty('--fx-r168-burst-opacity',burstO.toFixed(4));
  host.style.setProperty('--fx-r168-hue',`${(Math.sin(now*.00135)*5+x*9-y*5).toFixed(2)}deg`);

  const brightness=clamp(1.04+beat*.14+activity*.11,1.04,1.38);
  const saturation=clamp(1.08+beat*.10+activity*.16,1.08,1.48);
  const contrast=clamp(1.19+beat*.05+activity*.04,1.19,1.31);
  const cyanBlur=14+beat*15+activity*10,cyanAlpha=clamp(.17+beat*.18+activity*.14,.16,.52);
  const violetBlur=25+dub*18+activity*10,violetAlpha=clamp(.09+dub*.16+activity*.11,.08,.36);
  if(detail instanceof HTMLElement){
    detail.style.setProperty('--fx-r168-refract',`${(x*2.4+y*1.2).toFixed(2)}deg`);
    detail.style.setProperty('--fx-r168-live-opacity',clamp(.982+beat*.012+activity*.004,.982,1).toFixed(3));
    detail.style.setProperty('filter',`brightness(${brightness.toFixed(3)}) saturate(${saturation.toFixed(3)}) contrast(${contrast.toFixed(3)}) drop-shadow(0 0 ${cyanBlur.toFixed(1)}px rgba(70,225,255,${cyanAlpha.toFixed(3)})) drop-shadow(0 0 ${violetBlur.toFixed(1)}px rgba(155,72,255,${violetAlpha.toFixed(3)}))`,'important');
  }
  root.dataset.fxLivingEnergyBeatR168=`${lub.toFixed(3)},${dub.toFixed(3)},${breath.toFixed(3)}`;
  root.dataset.fxLivingEnergyPositionR168=`${x.toFixed(3)},${y.toFixed(3)}`;
  root.dataset.fxLivingEnergyActivityR168=activity.toFixed(3);
  root.dataset.fxLivingEnergyOpticsR168=`${flare.toFixed(3)},${spectrum.toFixed(3)},${refract.toFixed(3)},${burstO.toFixed(3)}`;
  root.dataset.fxLivingEnergyClockR168='requestAnimationFrame-v2';
  root.dataset.fxLivingEnergyEffectModeR168='orbit-caustic-spectrum-shock-refraction';
  if(!burstAt&&boost<.04)root.dataset.fxLivingEnergyInteractionR168='idle-living';
}
function start(){if(!ensure())return;if(!raf)raf=requestAnimationFrame(tick);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
const mo=new MutationObserver(()=>{if(!layer?.isConnected||!detail?.isConnected)ensure();});mo.observe(document.documentElement,{childList:true,subtree:true});
addEventListener('pageshow',start,{passive:true});
}());

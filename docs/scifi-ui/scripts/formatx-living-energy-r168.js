(function(){
'use strict';
const root=document.documentElement;
const VERSION='r212-mobile-optics-stable';
const CLOCK='display-synced-raf-r183';
const COMPAT_R183='raf-primary-watchdog-fallback-r183|120ms-stall-fallback-r183';
const COMPAT_SCHEDULER_R175="fxLivingEnergySchedulerR175='requestAnimationFrame-display-synced-r183'";
const COMPAT_SCHEDULER_R182="fxLivingEnergySchedulerR182='raf-primary-watchdog-fallback-r183'";
if(root.dataset.fxLivingEnergyR168===VERSION&&root.dataset.fxLivingEnergyClockR168===CLOCK)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLivingEnergyR168='audit-skip';root.dataset.fxLivingEnergyClockR168='audit-skip';return;}
root.dataset.fxLivingEnergyR168='booting';
root.dataset.fxLivingEnergyCompatR183=COMPAT_R183;
root.dataset.fxLivingEnergyCompatSchedulerR175=COMPAT_SCHEDULER_R175;
root.dataset.fxLivingEnergyCompatSchedulerR182=COMPAT_SCHEDULER_R182;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width:900px), (pointer:coarse)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
let host=null,layer=null,detail=null,boost=0,lastInput=0,raf=0,watchdog=0,last=performance.now(),lastTickAt=0;
let pointerX=0,pointerY=0,burstAt=0,burstStrength=0,frameSeq=0;
let orbitPhaseA=0,orbitPhaseB=0,causticPhaseA=0,causticPhaseB=0;

function make(cls){const e=document.createElement('span');e.className=cls;e.setAttribute('aria-hidden','true');return e;}
function ensureMobileSeam(){
  let style=document.getElementById('fx-r170-mobile-seam-override');
  if(!style){style=document.createElement('style');style.id='fx-r170-mobile-seam-override';}
  const css=`
  @media (max-width:900px),(pointer:coarse){
    html[data-fx-mobile-reference-layout="ready-v1"][data-fx-living-energy-r168] body.living-architecture main#main-content section#hero.scene.hero[data-organ="core"] .hero-grid .hero-space::before{
      content:""!important;display:block!important;position:absolute!important;
      left:-14vw!important;right:-14vw!important;top:38%!important;bottom:-165px!important;
      height:auto!important;z-index:0!important;pointer-events:none!important;
      background:radial-gradient(ellipse 78% 53% at 50% 22%,rgba(45,188,239,.10),transparent 64%),radial-gradient(ellipse 60% 42% at 59% 39%,rgba(140,69,255,.05),transparent 70%),linear-gradient(180deg,rgba(1,5,14,0) 0%,rgba(2,10,24,.11) 18%,rgba(3,15,31,.40) 51%,rgba(4,13,30,.80) 80%,#040d1e 100%)!important;
      border:0!important;box-shadow:none!important;opacity:1!important;filter:none!important;
    }
    html[data-fx-mobile-reference-layout="ready-v1"][data-fx-living-energy-r168] body.living-architecture main#main-content section#hero.scene.hero[data-organ="core"] .hero-grid .hero-space::after{
      content:""!important;display:block!important;position:absolute!important;
      left:-12vw!important;right:-12vw!important;top:58%!important;bottom:auto!important;height:72%!important;
      z-index:1!important;pointer-events:none!important;
      background:linear-gradient(180deg,rgba(1,6,16,0) 0%,rgba(1,8,20,.06) 16%,rgba(2,11,27,.23) 38%,rgba(3,14,30,.60) 68%,rgba(4,13,30,.88) 88%,#040d1e 100%)!important;
      border:0!important;box-shadow:none!important;opacity:1!important;filter:none!important;
    }
    html body.living-architecture #hero .fx-r168-spectrum,
    html body.living-architecture #hero .fx-r168-flare,
    html body.living-architecture #hero .fx-r168-shockwave,
    html body.living-architecture #hero .fx-r168-interaction-wave{
      display:none!important;opacity:0!important;filter:none!important;animation:none!important;will-change:auto!important;
    }
    html body.living-architecture #hero .fx-r168-orbit,
    html body.living-architecture #hero .fx-r168-caustic,
    html body.living-architecture #hero .fx-r168-spark{
      opacity:.095!important;filter:none!important;will-change:transform!important;
    }
    html body.living-architecture #hero .fx-r168-spark{opacity:.16!important;}
  }`;
  if(style.textContent!==css)style.textContent=css;
  if(style.parentNode!==document.head)document.head.appendChild(style);
  root.dataset.fxMobileSeamR170='r212-static-carrier';
}
function ensure(){
  ensureMobileSeam();
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
  if(host.dataset.fxLivingEnergyBoundR168!=='r212'){
    const pos=(x,y)=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;pointerX=clamp((x-r.left)/r.width*2-1,-1,1);pointerY=clamp((y-r.top)/r.height*2-1,-1,1);};
    const hit=(strength=1)=>{const now=performance.now();boost=Math.max(boost,strength);burstStrength=Math.max(burstStrength,strength);burstAt=now;lastInput=now;root.dataset.fxLivingEnergyInteractionR168='energy-burst';try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}};
    host.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'&&!mobile.matches){pos(e.clientX,e.clientY);boost=Math.max(boost,.64);lastInput=performance.now();root.dataset.fxLivingEnergyInteractionR168='pointer-reactive';}},{passive:true});
    host.addEventListener('pointerdown',e=>{if(!mobile.matches){pos(e.clientX,e.clientY);hit(1.68);}else{try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}}},{passive:true});
    host.addEventListener('touchstart',()=>{try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}},{passive:true});
    host.dataset.fxLivingEnergyBoundR168='r212';
  }
  root.dataset.fxLivingEnergyR168=VERSION;
  return true;
}

function tick(frameNow){
  if(!(host?.isConnected&&layer?.isConnected&&detail?.isConnected)){if(!ensure())return;}
  const now=Number.isFinite(frameNow)?frameNow:performance.now();
  lastTickAt=now;
  const dt=clamp(now-last||8.3,2,120);last=now;
  const mobileStable=mobile.matches;
  const still=reduced.matches||root.dataset.fxReferenceMotionPaused==='true';
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.5);
  const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0];
  const gx=clamp(Number(cp[0]||0)*7,-1,1),gy=clamp(Number(cp[1]||0)*7,-1,1);
  if(now-lastInput>70)boost*=Math.pow(.055,dt/1000*1.38);if(boost<.002)boost=0;
  burstStrength*=Math.pow(.028,dt/1000*1.18);if(burstStrength<.002)burstStrength=0;

  const cycle=still?0:(now%1700)/1700;
  const lub=still?0:gauss(cycle,.13,.085)*.52;
  const dub=still?0:gauss(cycle,.31,.10)*.22;
  const beat=clamp(lub+dub,0,.56);
  const breath=still?.5:.5+.5*Math.sin(now*.00078-1.05);
  const activity=mobileStable?.16:(still?.12:clamp(energy*.40+boost*.88+burstStrength*.56,0,1.78));
  const x=mobileStable?0:clamp(pointerX*.58+gx*.42,-1,1);
  const y=mobileStable?0:clamp(pointerY*.58-gy*.42,-1,1);

  if(!still){
    const speed=mobileStable?.34:1;
    orbitPhaseA=(orbitPhaseA+dt*(.017+activity*.004)*speed)%360;
    orbitPhaseB=(orbitPhaseB-dt*(.011+activity*.003)*speed+360)%360;
    causticPhaseA=(causticPhaseA+dt*(.020+activity*.0035)*speed)%360;
    causticPhaseB=(causticPhaseB-dt*(.013+activity*.0025)*speed+360)%360;
  }
  const orbitA=(orbitPhaseA+x*16+360)%360,orbitB=(orbitPhaseB+y*18+360)%360;
  const causticA=(causticPhaseA+x*22-y*11+360)%360,causticB=(causticPhaseB+x*10+y*18+360)%360;
  const pulse=mobileStable?(.12+breath*.025):clamp(beat*.98+activity*.48,0,1.5);
  const shock=mobileStable?.80:clamp(.72+beat*.48+activity*.12,.70,1.42);
  const flare=mobileStable?.08:clamp(.08+beat*.54+breath*.11+activity*.27,.08,.94);
  const spectrum=mobileStable?.07:clamp(.06+beat*.40+breath*.09+activity*.31,.06,.90);
  const refract=mobileStable?.095:clamp(.07+beat*.23+breath*.10+activity*.30,.07,.74);

  let burstP=1,burstO=0;
  if(!mobileStable&&burstAt){const age=(now-burstAt)/780;if(age<1){burstP=age;burstO=(1-age)*clamp(.78+burstStrength*.18,.78,1);}else burstAt=0;}

  host.style.setProperty('--fx-r168-x',`${(50+x*9.2).toFixed(2)}%`);
  host.style.setProperty('--fx-r168-y',`${(49+y*7.4).toFixed(2)}%`);
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
  host.style.setProperty('--fx-r168-parallax-x',`${(x*18).toFixed(2)}px`);
  host.style.setProperty('--fx-r168-parallax-y',`${(y*14).toFixed(2)}px`);
  host.style.setProperty('--fx-r168-burst-scale',(.50+burstP*1.78).toFixed(4));
  host.style.setProperty('--fx-r168-burst-opacity',burstO.toFixed(4));
  host.style.setProperty('--fx-r168-hue',mobileStable?'0deg':`${(Math.sin(now*.00135)*5+x*9-y*5).toFixed(2)}deg`);

  if(detail instanceof HTMLElement){
    if(mobileStable){
      detail.style.setProperty('--fx-r168-refract','0deg');
      detail.style.setProperty('--fx-r168-live-opacity','.996');
      detail.style.setProperty('filter','brightness(1.075) saturate(1.10) contrast(1.16) drop-shadow(0 0 14px rgba(70,225,255,.20)) drop-shadow(0 0 24px rgba(155,72,255,.09))','important');
    }else{
      const brightness=clamp(1.01+breath*.055+beat*.14+activity*.11,1.03,1.40);
      const saturation=clamp(1.04+breath*.070+beat*.10+activity*.16,1.07,1.50);
      const contrast=clamp(1.17+breath*.032+beat*.05+activity*.04,1.18,1.32);
      const cyanBlur=12+breath*5+beat*15+activity*10,cyanAlpha=clamp(.13+breath*.075+beat*.18+activity*.14,.15,.54);
      const violetBlur=22+breath*6+dub*18+activity*10,violetAlpha=clamp(.065+breath*.060+dub*.16+activity*.11,.08,.38);
      detail.style.setProperty('--fx-r168-refract',`${(x*2.4+y*1.2).toFixed(2)}deg`);
      detail.style.setProperty('--fx-r168-live-opacity',clamp(.982+beat*.012+activity*.004,.982,1).toFixed(3));
      detail.style.setProperty('filter',`brightness(${brightness.toFixed(3)}) saturate(${saturation.toFixed(3)}) contrast(${contrast.toFixed(3)}) drop-shadow(0 0 ${cyanBlur.toFixed(1)}px rgba(70,225,255,${cyanAlpha.toFixed(3)})) drop-shadow(0 0 ${violetBlur.toFixed(1)}px rgba(155,72,255,${violetAlpha.toFixed(3)}))`,'important');
    }
  }
  frameSeq++;
  root.dataset.fxLivingEnergyBeatR168=`${lub.toFixed(3)},${dub.toFixed(3)},${breath.toFixed(3)}`;
  root.dataset.fxLivingEnergyPositionR168=`${x.toFixed(3)},${y.toFixed(3)}`;
  root.dataset.fxLivingEnergyActivityR168=activity.toFixed(3);
  root.dataset.fxLivingEnergyOpticsR168=`${flare.toFixed(3)},${spectrum.toFixed(3)},${refract.toFixed(3)},${burstO.toFixed(3)}`;
  root.dataset.fxLivingEnergyClockR168=CLOCK;
  root.dataset.fxLivingEnergyFrameR168=String(frameSeq);
  root.dataset.fxLivingEnergyEffectModeR168=mobileStable?'mobile-stable-core-optics':'orbit-caustic-spectrum-shock-refraction';
  if(!burstAt&&boost<.04)root.dataset.fxLivingEnergyInteractionR168='idle-living';
}
function loop(now){
  raf=requestAnimationFrame(loop);
  if(document.hidden)return;
  tick(now);
}
function armWatchdog(){
  if(watchdog)return;
  watchdog=setInterval(()=>{
    if(document.hidden||reduced.matches||root.dataset.fxReferenceMotionPaused==='true')return;
    const now=performance.now();
    if(!lastTickAt||now-lastTickAt>=220)tick(now);
  },180);
  root.dataset.fxLivingEnergyWatchdogR182='180ms-stall-fallback-r212';
}
function start(){
  if(!ensure())return;
  if(!raf){last=performance.now();lastTickAt=0;tick(last);raf=requestAnimationFrame(loop);}
  armWatchdog();
  root.dataset.fxLivingEnergyClockR168=CLOCK;
  root.dataset.fxLivingEnergyCompatR183=COMPAT_R183;
  root.dataset.fxLivingEnergyCompatSchedulerR175=COMPAT_SCHEDULER_R175;
  root.dataset.fxLivingEnergyCompatSchedulerR182=COMPAT_SCHEDULER_R182;
  root.dataset.fxLivingEnergySchedulerR175=mobile.matches?'requestAnimationFrame-mobile-stable-r212':'requestAnimationFrame-display-synced-r183';
  root.dataset.fxLivingEnergySchedulerR182='raf-primary-watchdog-fallback-r212';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
const mo=new MutationObserver(()=>{if(!layer?.isConnected||!detail?.isConnected||!raf||!watchdog)start();});mo.observe(document.documentElement,{childList:true,subtree:true});
addEventListener('pageshow',start,{passive:true});
mobile.addEventListener?.('change',()=>{last=performance.now();});
}());

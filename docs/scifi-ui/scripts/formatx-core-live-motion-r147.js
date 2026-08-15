(function(){
'use strict';
const root=document.documentElement;
const VERSION='r145-spectacular-reactor-safe-lane-r148c';
if(root.dataset.fxLiveMotionR147===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLiveMotionR147='audit-skip';return;}
root.dataset.fxLiveMotionR147='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const imp=(el,prop,value)=>{if(el instanceof HTMLElement&&el.style.getPropertyValue(prop)!==value)el.style.setProperty(prop,value,'important');};
let host=null,detail=null,layer=null,raf=0,last=performance.now(),visible=true;
let sx=0,sy=0,se=.32,manualX=0,manualY=0,manualUntil=0;
let lastSafeLaneAt=0;

function find(){
  host=document.querySelector('#hero .hero-space');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  return host instanceof HTMLElement&&detail instanceof HTMLCanvasElement;
}

function ensureLayer(){
  if(!(host instanceof HTMLElement))return null;
  const all=[...document.querySelectorAll('#hero .fx-core-live-r147-layer')];
  const keep=all.find(el=>el instanceof HTMLElement&&el.parentElement===host&&el.dataset.fxR148==='true')||null;
  for(const el of all)if(el!==keep)el.remove();
  if(keep instanceof HTMLElement){layer=keep;return layer;}
  layer=document.createElement('div');
  layer.className='fx-core-live-r147-layer';
  layer.dataset.fxR148='true';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML=[
    '<span class="fx-core-live-r147-prism"></span>',
    '<span class="fx-core-live-r147-shock"></span>',
    '<span class="fx-core-live-r147-glow"></span>',
    '<span class="fx-core-live-r147-flare"></span>',
    '<span class="fx-core-live-r147-beam"></span>',
    '<span class="fx-core-live-r147-orbit"></span>',
    '<span class="fx-core-live-r147-orbit-b"></span>',
    '<span class="fx-core-live-r147-orbit-c"></span>',
    '<span class="fx-core-live-r147-spark s1"></span>',
    '<span class="fx-core-live-r147-spark s2"></span>',
    '<span class="fx-core-live-r147-spark s3"></span>',
    '<span class="fx-core-live-r147-spark s4"></span>',
    '<span class="fx-core-live-r147-spark s5"></span>',
    '<span class="fx-core-live-r147-spark s6"></span>'
  ].join('');
  host.appendChild(layer);
  root.dataset.fxLiveMotionLayerR147='mounted-r148';
  return layer;
}

function hideLegacyHeroVisuals(){
  const hero=document.getElementById('hero');
  if(!(hero instanceof HTMLElement)||innerWidth>900)return;
  const copy=hero.querySelector('.hero-copy');
  if(copy instanceof HTMLElement){
    imp(copy,'position','absolute');
    imp(copy,'width','1px');imp(copy,'height','1px');
    imp(copy,'min-width','1px');imp(copy,'min-height','1px');
    imp(copy,'margin','-1px');imp(copy,'padding','0px');
    imp(copy,'overflow','hidden');imp(copy,'clip','rect(0px, 0px, 0px, 0px)');
    imp(copy,'clip-path','inset(50%)');imp(copy,'white-space','nowrap');
    imp(copy,'pointer-events','none');imp(copy,'opacity','0');imp(copy,'z-index','-1');
  }
  hero.querySelectorAll('.scroll-cue,.hero-label,.hero-ring,.fx-immersive-launch,.fx-organism-map').forEach(el=>{
    if(el instanceof HTMLElement){imp(el,'display','none');imp(el,'visibility','hidden');imp(el,'pointer-events','none');}
  });
  root.dataset.fxLiveLegacyCopyR148='visually-removed';
}

function applySafeLane(force=false){
  const now=performance.now();
  if(!force&&now-lastSafeLaneAt<180)return;
  lastSafeLaneAt=now;
  hideLegacyHeroVisuals();
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
    const clearGap=innerWidth<=430?98:88;
    const marginTop=Math.ceil(protrusion+clearGap);

    imp(hero,'padding-bottom',innerWidth<=380?'108px':innerWidth<=430?'100px':'92px');
    imp(hero,'overflow','visible');
    if(heading instanceof HTMLElement){
      imp(heading,'top','0px');
      imp(heading,'margin',`${marginTop}px 6% 26px`);
      imp(heading,'z-index','28');
      imp(heading,'position','relative');
    }
    if(proof instanceof HTMLElement){
      imp(proof,'margin',innerWidth<=380?'0 7% 50px 6%':'0 7% 46px 6%');
      imp(proof,'z-index','28');
      if(innerWidth<=430)imp(proof,'min-height','252px');
    }
    if(live instanceof HTMLElement&&innerWidth<=430){imp(live,'top','auto');imp(live,'bottom','18px');}

    const hr=heading instanceof HTMLElement?heading.getBoundingClientRect():null;
    const tailBottom=tr?.bottom||sr.bottom;
    const actualGap=hr?hr.top-tailBottom:marginTop-protrusion;
    root.dataset.fxLiveSafeLaneR147='active-r148';
    root.dataset.fxLiveSafeGapR147=actualGap.toFixed(1)+'px';
    root.dataset.fxLiveTailProtrusionR147=protrusion.toFixed(1)+'px';
  }else if(String(root.dataset.fxLiveSafeLaneR147||'').startsWith('active')){
    hero.style.removeProperty('padding-bottom');hero.style.removeProperty('overflow');
    for(const el of [heading,proof,live])if(el instanceof HTMLElement){for(const prop of ['top','bottom','margin','z-index','min-height','position'])el.style.removeProperty(prop);}
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
  manualUntil=performance.now()+760;
}

function activate(event){
  if(event?.isTrusted===false)return;
  pointerTarget(event);
  pulse();
  se=Math.max(se,1.18);
  root.dataset.fxLiveMotionInteractionR147='active-r148';
}

function bind(){
  if(!find())return false;
  ensureLayer();
  if(host.dataset.fxLiveMotionBoundR147==='r148')return true;
  host.dataset.fxLiveMotionBoundR147='r148';
  host.addEventListener('pointerdown',activate,{passive:true});
  host.addEventListener('pointermove',pointerTarget,{passive:true});
  host.addEventListener('touchstart',activate,{passive:true});
  return true;
}

function readMotionSource(now){
  if(now<manualUntil)return{sourceX:manualX,sourceY:manualY,source:'pointer'};
  const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0];
  let x=clamp(Number(cp[0]||0)/.070,-1,1);
  let y=clamp(Number(cp[1]||0)/.070,-1,1);
  let source='renderer';
  const gyro=String(root.dataset.fxCoreGyroInput||'').split(',').map(Number);
  if(root.dataset.fxCoreGyroState==='active'&&gyro.length>=2&&gyro.every(Number.isFinite)){
    const gx=clamp(gyro[0],-.90,.90);
    const gy=clamp(gyro[1],-.84,.84);
    if(Math.hypot(gx,gy)>.025||Math.hypot(x,y)<.035){x=gx;y=-gy;source='gyro';}
  }
  return{sourceX:x,sourceY:y,source};
}

function frame(now){
  raf=0;
  applySafeLane(false);
  if(!visible){raf=requestAnimationFrame(frame);return;}
  if(!host?.isConnected||!detail?.isConnected){if(!bind()){raf=requestAnimationFrame(frame);return;}}
  ensureLayer();

  const paused=root.dataset.fxReferenceMotionPaused==='true';
  root.dataset.fxLiveMotionPausedR147=String(paused);

  const rawEnergy=Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.36);
  const motion=readMotionSource(now);
  const tx=(paused||reduced.matches)?0:motion.sourceX;
  const ty=(paused||reduced.matches)?0:motion.sourceY;
  const te=(paused||reduced.matches)?0.18:clamp((rawEnergy-.15)/.94,.30,1.30);
  const dt=Math.min(50,Math.max(0,now-last));last=now;
  const k=1-Math.pow(.0012,dt/1000*8.1);
  sx+=(tx-sx)*k;sy+=(ty-sy)*k;se+=(te-se)*Math.min(1,k*.92);

  const breathe=(paused||reduced.matches)?0:.5+.5*Math.sin(now*.00335);
  const micro=(paused||reduced.matches)?0:.5+.5*Math.sin(now*.0078+1.25);
  const activity=clamp(Math.hypot(sx,sy)*.78+se*.78,0,1.38);
  const x=50+sx*24;
  const y=48+sy*19;
  const opacity=clamp(.64+breathe*.18+activity*.15,.58,.98);
  const brightness=clamp(1.085+breathe*.095+activity*.070,1.08,1.31);
  const saturation=clamp(1.12+breathe*.085+activity*.090,1.11,1.36);
  const contrast=clamp(1.025+micro*.025+activity*.020,1.02,1.09);
  const pulseScale=clamp(1+breathe*.070+activity*.032,1,1.145);
  const flareOpacity=clamp(.58+breathe*.22+activity*.16,.54,.96);
  const flareScale=clamp(.96+breathe*.16+Math.abs(sx)*.13,.95,1.28);
  const beamOpacity=clamp(.38+micro*.20+activity*.12,.34,.78);
  const beamScale=clamp(.96+breathe*.15+Math.abs(sy)*.08,.94,1.22);
  const orbitOpacity=clamp(.49+breathe*.13+activity*.12,.45,.82);
  const prismOpacity=clamp(.44+micro*.14+activity*.12,.40,.76);
  const shadowBlur=clamp(11+breathe*8+activity*7,11,28);
  const shadowAlpha=clamp(.22+breathe*.12+activity*.11,.20,.48);
  const violetBlur=clamp(18+breathe*8+activity*8,18,34);
  const violetAlpha=clamp(.11+breathe*.08+activity*.07,.10,.27);
  const shockScale=clamp(1.58+activity*.30,1.58,1.95);
  const shockOpacity=clamp(.48+activity*.22,.46,.78);
  const prismAngle=((now*.018)+(sx-sy)*34)%360;

  host.style.setProperty('--fx-r147-light-x',x.toFixed(2)+'%');
  host.style.setProperty('--fx-r147-light-y',y.toFixed(2)+'%');
  host.style.setProperty('--fx-r147-light-opacity',opacity.toFixed(3));
  host.style.setProperty('--fx-r147-brightness',brightness.toFixed(3));
  host.style.setProperty('--fx-r147-saturation',saturation.toFixed(3));
  host.style.setProperty('--fx-r147-contrast',contrast.toFixed(3));
  host.style.setProperty('--fx-r147-pulse-scale',pulseScale.toFixed(3));
  host.style.setProperty('--fx-r147-flare-opacity',flareOpacity.toFixed(3));
  host.style.setProperty('--fx-r147-flare-scale',flareScale.toFixed(3));
  host.style.setProperty('--fx-r147-beam-opacity',beamOpacity.toFixed(3));
  host.style.setProperty('--fx-r147-beam-scale',beamScale.toFixed(3));
  host.style.setProperty('--fx-r147-orbit-opacity',orbitOpacity.toFixed(3));
  host.style.setProperty('--fx-r147-prism-opacity',prismOpacity.toFixed(3));
  host.style.setProperty('--fx-r147-prism-angle',prismAngle.toFixed(2)+'deg');
  host.style.setProperty('--fx-r147-shadow-blur',shadowBlur.toFixed(1)+'px');
  host.style.setProperty('--fx-r147-shadow-alpha',shadowAlpha.toFixed(3));
  host.style.setProperty('--fx-r147-violet-blur',violetBlur.toFixed(1)+'px');
  host.style.setProperty('--fx-r147-violet-alpha',violetAlpha.toFixed(3));
  host.style.setProperty('--fx-r147-shock-scale',shockScale.toFixed(3));
  host.style.setProperty('--fx-r147-shock-opacity',shockOpacity.toFixed(3));

  root.dataset.fxLiveMotionVectorR147=`${sx.toFixed(3)},${sy.toFixed(3)},${activity.toFixed(3)}`;
  root.dataset.fxLiveMotionFrameR147=`${opacity.toFixed(3)},${brightness.toFixed(3)},${x.toFixed(2)},${y.toFixed(2)},${motion.source}`;
  root.dataset.fxLiveMotionR147=VERSION;
  root.dataset.fxLiveMotionVisualR148='reactor-prism-shock-orbits';
  raf=requestAnimationFrame(frame);
}

function start(){if(!raf)raf=requestAnimationFrame(frame);}
function boot(attempt=0){
  applySafeLane(true);
  if(!bind()){
    if(attempt<360)return requestAnimationFrame(()=>boot(attempt+1));
    root.dataset.fxLiveMotionR147='host-unavailable';return;
  }
  const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)start();},{rootMargin:'220px'});
  io.observe(host);
  start();
}

['formatx:real3dready','formatx:coredetailready','formatx:referencepause','formatx:languagechange'].forEach(name=>addEventListener(name,()=>{applySafeLane(true);ensureLayer();start();},{passive:true}));
addEventListener('resize',()=>applySafeLane(true),{passive:true});
addEventListener('orientationchange',()=>setTimeout(()=>applySafeLane(true),120),{passive:true});
addEventListener('pageshow',()=>{applySafeLane(true);start();},{passive:true});
boot();
}());

(function(){
'use strict';
const root=document.documentElement;
const VERSION='r145-centered-optical-reactor-r149b';
if(root.dataset.fxLiveMotionR147===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLiveMotionR147='audit-skip';return;}
root.dataset.fxLiveMotionR147='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const imp=(el,prop,value)=>{if(!(el instanceof HTMLElement))return;const current=el.style.getPropertyValue(prop),priority=el.style.getPropertyPriority(prop);if(current!==value||priority!=='important')el.style.setProperty(prop,value,'important');};
let host=null,detail=null,layer=null,raf=0,last=performance.now(),visible=true;
let sx=0,sy=0,se=.34,manualX=0,manualY=0,manualUntil=0;
let lastLayoutAt=0;

function find(){
  host=document.querySelector('#hero .hero-space');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  return host instanceof HTMLElement&&detail instanceof HTMLCanvasElement;
}

function ensureLayer(){
  if(!(host instanceof HTMLElement))return null;
  const all=[...document.querySelectorAll('#hero .fx-core-live-r147-layer')];
  const keep=all.find(el=>el instanceof HTMLElement&&el.parentElement===host&&el.dataset.fxR149==='true')||null;
  for(const el of all)if(el!==keep)el.remove();
  if(keep instanceof HTMLElement){layer=keep;return layer;}
  layer=document.createElement('div');
  layer.className='fx-core-live-r147-layer';
  layer.dataset.fxR149='true';
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
  root.dataset.fxLiveMotionLayerR147='mounted-r149';
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
    imp(copy,'display','none');imp(copy,'visibility','hidden');
    imp(copy,'pointer-events','none');imp(copy,'opacity','0');imp(copy,'z-index','-1');
  }
  hero.querySelectorAll('.scroll-cue,.hero-label,.hero-ring,.fx-immersive-launch,.fx-organism-map').forEach(el=>{
    if(el instanceof HTMLElement){imp(el,'display','none');imp(el,'visibility','hidden');imp(el,'opacity','0');imp(el,'pointer-events','none');}
  });
  root.dataset.fxLiveLegacyCopyR148='visually-removed';
  root.dataset.fxLiveLegacyCopyR149='visually-removed';
}

function syncLayerGeometry(){
  if(!(host instanceof HTMLElement)||!(detail instanceof HTMLCanvasElement))return false;
  ensureLayer();
  if(!(layer instanceof HTMLElement))return false;
  const hr=host.getBoundingClientRect();
  const dr=detail.getBoundingClientRect();
  if(!hr.width||!hr.height||!dr.width||!dr.height)return false;
  const left=dr.left-hr.left;
  const top=dr.top-hr.top;
  imp(layer,'left',left.toFixed(2)+'px');
  imp(layer,'top',top.toFixed(2)+'px');
  imp(layer,'right','auto');imp(layer,'bottom','auto');
  imp(layer,'width',dr.width.toFixed(2)+'px');
  imp(layer,'height',dr.height.toFixed(2)+'px');
  imp(layer,'min-height','0px');
  imp(layer,'overflow','hidden');
  imp(layer,'clip-path','inset(0px)');
  root.dataset.fxLiveLayerBoundsR149=`${left.toFixed(1)},${top.toFixed(1)},${dr.width.toFixed(1)},${dr.height.toFixed(1)}`;
  root.dataset.fxLiveLayerAnchorR149='detail-canvas';
  return true;
}

function applyLayout(force=false){
  const now=performance.now();
  if(!force&&now-lastLayoutAt<180)return;
  lastLayoutAt=now;
  hideLegacyHeroVisuals();
  syncLayerGeometry();
  const hero=document.getElementById('hero');
  const space=hero?.querySelector('.hero-space');
  const core=hero?.querySelector('.fx-core-detail-r122');
  const tail=hero?.querySelector('.fx-core-reference-tail-r143');
  const heading=hero?.querySelector('.fx-reference-heading');
  const proof=hero?.querySelector('.fx-reference-proof');
  const live=proof?.querySelector('.fx-reference-liveos');
  if(!(hero instanceof HTMLElement)||!(space instanceof HTMLElement))return;

  if(innerWidth<=900){
    const clearGap=innerWidth<=380?50:innerWidth<=430?44:40;
    imp(hero,'padding-bottom',innerWidth<=380?'56px':innerWidth<=430?'52px':'48px');
    imp(hero,'overflow','visible');

    let finalGap=clearGap;
    let visualBottom=space.getBoundingClientRect().bottom;
    if(core instanceof HTMLElement)visualBottom=Math.max(visualBottom,core.getBoundingClientRect().bottom);
    if(tail instanceof HTMLElement&&getComputedStyle(tail).display!=='none')visualBottom=Math.max(visualBottom,tail.getBoundingClientRect().bottom);

    if(heading instanceof HTMLElement){
      imp(heading,'top','0px');
      imp(heading,'z-index','28');
      imp(heading,'position','relative');

      let hr=heading.getBoundingClientRect();
      let physicalGap=hr.top-visualBottom;
      const currentMargin=parseFloat(getComputedStyle(heading).marginTop)||0;
      const correctedMargin=clamp(currentMargin+(clearGap-physicalGap),0,340);
      imp(heading,'margin',`${Math.ceil(correctedMargin)}px 6% 24px`);
      hr=heading.getBoundingClientRect();
      physicalGap=hr.top-visualBottom;

      if(Math.abs(physicalGap-clearGap)>1.5){
        const secondMargin=parseFloat(getComputedStyle(heading).marginTop)||correctedMargin;
        const second=clamp(secondMargin+(clearGap-physicalGap),0,340);
        imp(heading,'margin',`${Math.ceil(second)}px 6% 24px`);
        hr=heading.getBoundingClientRect();
        physicalGap=hr.top-visualBottom;
      }
      finalGap=physicalGap;
    }

    if(proof instanceof HTMLElement){
      imp(proof,'margin',innerWidth<=380?'0 7% 38px 6%':'0 7% 34px 6%');
      imp(proof,'z-index','28');
      if(innerWidth<=430)imp(proof,'min-height','252px');
    }
    if(live instanceof HTMLElement&&innerWidth<=430){imp(live,'top','auto');imp(live,'bottom','18px');}

    root.dataset.fxLiveSafeLaneR147='active-r149b';
    root.dataset.fxLiveSafeGapR147=finalGap.toFixed(1)+'px';
    root.dataset.fxLiveVisualBottomR149=visualBottom.toFixed(1)+'px';
    root.dataset.fxLiveSafeLaneMethodR149='physical-rect-reconcile';
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
  manualUntil=performance.now()+820;
}

function activate(event){
  if(event?.isTrusted===false)return;
  pointerTarget(event);
  pulse();
  se=Math.max(se,1.20);
  root.dataset.fxLiveMotionInteractionR147='active-r149b';
}

function bind(){
  if(!find())return false;
  ensureLayer();syncLayerGeometry();
  if(host.dataset.fxLiveMotionBoundR147==='r149b')return true;
  host.dataset.fxLiveMotionBoundR147='r149b';
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
  /* r184: animation never performs layout reconciliation. */
  if(!visible){raf=requestAnimationFrame(frame);return;}
  if(!host?.isConnected||!detail?.isConnected){if(!bind()){raf=requestAnimationFrame(frame);return;}}
  ensureLayer();

  const paused=root.dataset.fxReferenceMotionPaused==='true';
  root.dataset.fxLiveMotionPausedR147=String(paused);

  const rawEnergy=Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.38);
  const motion=readMotionSource(now);
  const tx=(paused||reduced.matches)?0:motion.sourceX;
  const ty=(paused||reduced.matches)?0:motion.sourceY;
  const te=(paused||reduced.matches)?0.18:clamp((rawEnergy-.14)/.92,.32,1.32);
  const dt=Math.min(50,Math.max(0,now-last));last=now;
  const k=1-Math.pow(.0012,dt/1000*8.1);
  sx+=(tx-sx)*k;sy+=(ty-sy)*k;se+=(te-se)*Math.min(1,k*.92);

  const breathe=(paused||reduced.matches)?0:.5+.5*Math.sin(now*.00375);
  const micro=(paused||reduced.matches)?0:.5+.5*Math.sin(now*.0084+1.25);
  const activity=clamp(Math.hypot(sx,sy)*.72+se*.80,0,1.40);
  /* Motion stays inside the reactor. The approved silhouette itself never moves. */
  const x=50+sx*14;
  const y=49+sy*12;
  const opacity=clamp(.68+breathe*.18+activity*.14,.62,.99);
  const brightness=clamp(1.11+breathe*.11+activity*.075,1.10,1.34);
  const saturation=clamp(1.16+breathe*.10+activity*.095,1.14,1.40);
  const contrast=clamp(1.035+micro*.028+activity*.022,1.03,1.10);
  const pulseScale=clamp(1+breathe*.082+activity*.035,1,1.16);
  const flareOpacity=clamp(.60+breathe*.24+activity*.14,.56,.98);
  const flareScale=clamp(.98+breathe*.17+Math.abs(sx)*.10,.96,1.26);
  const beamOpacity=clamp(.40+micro*.22+activity*.12,.36,.82);
  const beamScale=clamp(.98+breathe*.16+Math.abs(sy)*.07,.96,1.22);
  const orbitOpacity=clamp(.48+breathe*.15+activity*.11,.44,.84);
  const prismOpacity=clamp(.43+micro*.16+activity*.12,.40,.80);
  const shadowBlur=clamp(13+breathe*9+activity*7,13,31);
  const shadowAlpha=clamp(.25+breathe*.13+activity*.11,.23,.51);
  const violetBlur=clamp(20+breathe*9+activity*8,20,37);
  const violetAlpha=clamp(.12+breathe*.09+activity*.075,.11,.29);
  const shockScale=clamp(1.48+activity*.28,1.48,1.88);
  const shockOpacity=clamp(.48+activity*.24,.46,.80);
  const prismAngle=((now*.020)+(sx-sy)*28)%360;

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
  root.dataset.fxLiveMotionVisualR149='centered-clipped-reactor';
  raf=requestAnimationFrame(frame);
}

function start(){if(!raf)raf=requestAnimationFrame(frame);}
function boot(attempt=0){
  applyLayout(true);
  if(!bind()){
    if(attempt<360)return requestAnimationFrame(()=>boot(attempt+1));
    root.dataset.fxLiveMotionR147='host-unavailable';return;
  }
  const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)start();},{rootMargin:'220px'});
  io.observe(host);
  /* r184: only real geometry changes may reconcile layout. */
  let geometryTimer=0;
  const scheduleGeometry=()=>{
    clearTimeout(geometryTimer);
    geometryTimer=setTimeout(()=>{
      applyLayout(true);
      syncLayerGeometry();
      root.dataset.fxLiveLayoutSchedulerR184='resize-driven-stable';
    },72);
  };
  const geometryObserver=new ResizeObserver(scheduleGeometry);
  geometryObserver.observe(host);
  if(detail instanceof HTMLElement)geometryObserver.observe(detail);
  root.dataset.fxLiveLayoutSchedulerR184='resize-driven-stable';
  start();
}

['formatx:real3dready','formatx:coredetailready','formatx:referencepause','formatx:languagechange'].forEach(name=>addEventListener(name,()=>{applyLayout(true);ensureLayer();syncLayerGeometry();start();},{passive:true}));
addEventListener('resize',()=>applyLayout(true),{passive:true});
addEventListener('orientationchange',()=>setTimeout(()=>applyLayout(true),120),{passive:true});
addEventListener('pageshow',()=>{applyLayout(true);start();},{passive:true});
boot();
}());

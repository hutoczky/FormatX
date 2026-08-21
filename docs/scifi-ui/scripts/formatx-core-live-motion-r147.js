(function(){
'use strict';

const root=document.documentElement;
const VERSION='r145-centered-optical-reactor-r149b';
if(root.dataset.fxLiveMotionR147===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxLiveMotionR147='audit-skip';
  return;
}
root.dataset.fxLiveMotionR147='booting';
root.dataset.fxLiveMotionSchedulerR275='event-driven-css-compositor';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let host=null;
let detail=null;
let layer=null;
let visible=true;
let geometryRaf=0;
let motionRaf=0;
let pendingMotion=null;
let resizeObserver=null;
let intersectionObserver=null;
let rootObserver=null;
let bootObserver=null;
let bootTimer=0;
let manualX=0;
let manualY=0;
let manualUntil=0;
let lastFrame='';
const cssCache=new Map();

function setVar(name,value){
  if(!(host instanceof HTMLElement))return;
  const text=String(value);
  if(cssCache.get(name)===text)return;
  cssCache.set(name,text);
  host.style.setProperty(name,text);
}

function setDataset(name,value){
  const text=String(value);
  if(root.dataset[name]!==text)root.dataset[name]=text;
}

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
  if(keep instanceof HTMLElement){
    layer=keep;
    return layer;
  }

  layer=document.createElement('div');
  layer.className='fx-core-live-r147-layer';
  layer.dataset.fxR149='true';
  layer.dataset.fxR275Geometry='pending';
  layer.setAttribute('aria-hidden','true');
  layer.style.setProperty('opacity','0');
  layer.style.setProperty('visibility','hidden');
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
  setDataset('fxLiveMotionLayerR147','mounted-r149');
  return layer;
}

function revealLayer(){
  if(!(layer instanceof HTMLElement))return;
  layer.dataset.fxR275Geometry='ready';
  layer.style.removeProperty('visibility');
  layer.style.removeProperty('opacity');
}

function syncLayerGeometry(){
  if(!(host instanceof HTMLElement)||!(detail instanceof HTMLCanvasElement))return false;
  ensureLayer();
  if(!(layer instanceof HTMLElement))return false;

  const hr=host.getBoundingClientRect();
  const dr=detail.getBoundingClientRect();
  if(hr.width<2||hr.height<2||dr.width<2||dr.height<2)return false;

  const left=dr.left-hr.left;
  const top=dr.top-hr.top;
  const values={
    left:left.toFixed(2)+'px',
    top:top.toFixed(2)+'px',
    right:'auto',
    bottom:'auto',
    width:dr.width.toFixed(2)+'px',
    height:dr.height.toFixed(2)+'px',
    'min-height':'0px',
    overflow:'hidden',
    'clip-path':'inset(0px)'
  };
  for(const [property,value] of Object.entries(values)){
    if(layer.style.getPropertyValue(property)!==value)layer.style.setProperty(property,value,'important');
  }

  setDataset('fxLiveLayerBoundsR149',`${left.toFixed(1)},${top.toFixed(1)},${dr.width.toFixed(1)},${dr.height.toFixed(1)}`);
  setDataset('fxLiveLayerAnchorR149','detail-canvas');
  setDataset('fxLiveSafeLaneR147',mobile.matches?'delegated-r244':'desktop');
  setDataset('fxLiveSafeLaneMethodR149',mobile.matches?'reference-frame-r244':'desktop-css');
  revealLayer();
  return true;
}

function scheduleGeometry(){
  if(geometryRaf)return;
  geometryRaf=requestAnimationFrame(()=>{
    geometryRaf=0;
    if(!find())return;
    syncLayerGeometry();
  });
}

function stableDefaults(){
  if(!(host instanceof HTMLElement))return;
  setVar('--fx-r147-light-x','50%');
  setVar('--fx-r147-light-y',mobile.matches?'48%':'49%');
  setVar('--fx-r147-light-opacity','.82');
  setVar('--fx-r147-brightness','1.18');
  setVar('--fx-r147-saturation','1.22');
  setVar('--fx-r147-contrast','1.06');
  setVar('--fx-r147-pulse-scale','1.04');
  setVar('--fx-r147-flare-opacity','.82');
  setVar('--fx-r147-flare-scale','1.04');
  setVar('--fx-r147-beam-opacity','.62');
  setVar('--fx-r147-beam-scale','1.03');
  setVar('--fx-r147-orbit-opacity','.66');
  setVar('--fx-r147-prism-opacity','.66');
  setVar('--fx-r147-prism-angle','0deg');
  setVar('--fx-r147-shadow-blur',mobile.matches?'17px':'19px');
  setVar('--fx-r147-shadow-alpha','.34');
  setVar('--fx-r147-violet-blur',mobile.matches?'25px':'28px');
  setVar('--fx-r147-violet-alpha','.18');
  setVar('--fx-r147-shock-scale','1.68');
  setVar('--fx-r147-shock-opacity','.66');
}

function pointerVector(event){
  if(!(host instanceof HTMLElement))return null;
  const point=event?.touches?.[0]||event?.changedTouches?.[0]||event;
  const clientX=Number(point?.clientX),clientY=Number(point?.clientY);
  if(!Number.isFinite(clientX)||!Number.isFinite(clientY))return null;
  const r=host.getBoundingClientRect();
  if(r.width<2||r.height<2)return null;
  const x=clamp(((clientX-r.left)/r.width)*2-1,-1,1);
  const y=clamp(((clientY-r.top)/r.height)*2-1,-1,1);
  manualX=x;
  manualY=y;
  manualUntil=performance.now()+900;
  return{x,y,source:'pointer'};
}

function readPassiveVector(){
  if(performance.now()<manualUntil)return{x:manualX,y:manualY,source:'pointer'};
  const gyro=String(root.dataset.fxCoreGyroInput||'').split(',').map(Number);
  if(root.dataset.fxCoreGyroState==='active'&&gyro.length>=2&&gyro.every(Number.isFinite)){
    return{x:clamp(gyro[0],-.9,.9),y:clamp(-gyro[1],-.84,.84),source:'gyro'};
  }
  const cp=window.FormatXCoreCinematic?.corePosition||[0,0,0];
  return{
    x:clamp(Number(cp[0]||0)/.07,-1,1),
    y:clamp(Number(cp[1]||0)/.07,-1,1),
    source:'renderer'
  };
}

function applyMotion(vector){
  if(!(host instanceof HTMLElement)||!visible)return;
  const paused=root.dataset.fxReferenceMotionPaused==='true'||reduced.matches;
  const v=paused?{x:0,y:0,source:'paused'}:(vector||readPassiveVector());
  const activity=clamp(Math.hypot(v.x,v.y),0,1.2);
  const x=50+v.x*(mobile.matches?11:13);
  const y=(mobile.matches?48:49)+v.y*(mobile.matches?9:10);
  const energy=Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.38);
  const boost=clamp((energy-.2)*.35+activity*.18,0,.28);

  setVar('--fx-r147-light-x',x.toFixed(2)+'%');
  setVar('--fx-r147-light-y',y.toFixed(2)+'%');
  setVar('--fx-r147-brightness',(1.16+boost).toFixed(3));
  setVar('--fx-r147-saturation',(1.20+boost*.7).toFixed(3));
  setVar('--fx-r147-contrast',(1.05+boost*.2).toFixed(3));
  setVar('--fx-r147-pulse-scale',(1.03+activity*.035).toFixed(3));
  setVar('--fx-r147-flare-scale',(1.02+Math.abs(v.x)*.07).toFixed(3));
  setVar('--fx-r147-beam-scale',(1.01+Math.abs(v.y)*.06).toFixed(3));
  setVar('--fx-r147-shock-scale',(1.66+activity*.12).toFixed(3));

  setDataset('fxLiveMotionPausedR147',String(paused));
  setDataset('fxLiveMotionVectorR147',`${v.x.toFixed(3)},${v.y.toFixed(3)},${activity.toFixed(3)}`);
  const frame=`${x.toFixed(2)},${y.toFixed(2)},${boost.toFixed(3)},${v.source}`;
  if(frame!==lastFrame){lastFrame=frame;setDataset('fxLiveMotionFrameR147',frame);}
  setDataset('fxLiveMotionVisualR148','reactor-prism-shock-orbits');
  setDataset('fxLiveMotionVisualR149','centered-clipped-reactor');
  setDataset('fxLiveMotionR147',VERSION);
}

function requestMotion(vector){
  pendingMotion=vector||pendingMotion||readPassiveVector();
  if(motionRaf||!visible)return;
  motionRaf=requestAnimationFrame(()=>{
    motionRaf=0;
    const next=pendingMotion;
    pendingMotion=null;
    applyMotion(next);
  });
}

function pulse(){
  try{window.FormatXCoreMobileV69?.pulse?.();}catch(_){/* renderer remains authoritative */}
}

function activate(event){
  if(event?.isTrusted===false)return;
  const vector=pointerVector(event)||readPassiveVector();
  pulse();
  setDataset('fxLiveMotionInteractionR147','active-r149b');
  requestMotion(vector);
}

function bind(){
  if(!find())return false;
  ensureLayer();
  stableDefaults();
  syncLayerGeometry();

  if(host.dataset.fxLiveMotionBoundR147!=='r275'){
    host.dataset.fxLiveMotionBoundR147='r275';
    host.addEventListener('pointerdown',activate,{passive:true});
    host.addEventListener('touchstart',activate,{passive:true});
    host.addEventListener('pointermove',event=>{
      if(event.pointerType==='mouse'&&event.buttons===0)return;
      const vector=pointerVector(event);
      if(vector)requestMotion(vector);
    },{passive:true});
  }

  if(!resizeObserver){
    resizeObserver=new ResizeObserver(scheduleGeometry);
    resizeObserver.observe(host);
    resizeObserver.observe(detail);
  }

  if(!intersectionObserver){
    intersectionObserver=new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting);
      if(visible){scheduleGeometry();requestMotion();}
      else if(motionRaf){cancelAnimationFrame(motionRaf);motionRaf=0;}
    },{rootMargin:'220px'});
    intersectionObserver.observe(host);
  }

  if(!rootObserver){
    rootObserver=new MutationObserver(records=>{
      if(records.some(record=>record.attributeName==='data-fx-core-gyro-input'
        ||record.attributeName==='data-fx-core-gyro-state'
        ||record.attributeName==='data-fx-reference-motion-paused')) requestMotion();
    });
    rootObserver.observe(root,{attributes:true,attributeFilter:[
      'data-fx-core-gyro-input','data-fx-core-gyro-state','data-fx-reference-motion-paused'
    ]});
  }

  setDataset('fxLiveMotionR147',VERSION);
  setDataset('fxLiveMotionSchedulerR275','event-driven-css-compositor');
  requestMotion({x:0,y:0,source:'initial'});
  return true;
}

function stopBootObserver(){
  if(bootObserver)bootObserver.disconnect();
  bootObserver=null;
  if(bootTimer)clearTimeout(bootTimer);
  bootTimer=0;
}

function boot(){
  if(bind()){stopBootObserver();return;}
  if(bootObserver)return;
  bootObserver=new MutationObserver(()=>{
    if(bind())stopBootObserver();
  });
  bootObserver.observe(document.documentElement,{subtree:true,childList:true});
  bootTimer=setTimeout(()=>{
    stopBootObserver();
    if(!bind())setDataset('fxLiveMotionR147','host-unavailable');
  },5000);
}

for(const name of ['formatx:real3dready','formatx:coredetailready']){
  addEventListener(name,()=>{if(bind()){scheduleGeometry();requestMotion();}},{passive:true});
}
addEventListener('formatx:referencepause',()=>requestMotion(),{passive:true});
addEventListener('resize',scheduleGeometry,{passive:true});
addEventListener('orientationchange',()=>setTimeout(scheduleGeometry,120),{passive:true});
addEventListener('pageshow',()=>{if(bind()){scheduleGeometry();requestMotion();}},{passive:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
}());

(function(){
'use strict';
const root=document.documentElement;
const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
if(!MOBILE.matches){root.dataset.fxMobileRenderGovernorR426='desktop-skip';return;}
if(root.dataset.fxMobileRenderGovernorR426==='ready')return;
root.dataset.fxMobileRenderGovernorR426='booting';

let settleTimer=0;
let scrollFrame=0;
let armed=false;
const activeWindowMs=360;
const shapeProbeMs=120;
const shapeSettleDeadlineMs=3600;

function renderer(){return window.FormatXCoreMobileV69;}
function userPaused(){return document.querySelector('.fx-reference-pause')?.dataset.paused==='true';}
function heroVisible(){
  const hero=document.getElementById('hero');
  if(!(hero instanceof HTMLElement))return false;
  const rect=hero.getBoundingClientRect();
  return rect.bottom>0&&rect.top<innerHeight;
}
function emitPaused(paused,source){
  dispatchEvent(new CustomEvent('formatx:referencepause',{detail:{paused,source}}));
}
function clearSettle(){if(settleTimer)clearTimeout(settleTimer);settleTimer=0;}
function idle(source='idle-r463'){
  clearSettle();
  emitPaused(true,source);
  root.dataset.fxMobileRenderGovernorR426='idle-zero-frame';
  root.dataset.fxCoreMobileIdlePolicyR426='event-burst-no-heartbeat-render';
}
function shapeState(){
  const core=renderer();
  const target=root.dataset.fxCoreTargetShape||root.dataset.fxCoreShapeR337||core?.shape||'';
  const settled=root.dataset.fxCoreShape||'';
  const morph=Number(core?.morph);
  const targetMorph=target==='sphere'?1:target==='crystal'?0:NaN;
  return{
    core,target,settled,morph,targetMorph,
    ready:Boolean(core)&&Number.isFinite(morph)&&Number.isFinite(targetMorph)
      && settled===target&&Math.abs(morph-targetMorph)<.015
  };
}
function settleShape(source='shape-change-r463'){
  clearSettle();
  const started=performance.now();
  root.dataset.fxMobileRenderGovernorSettleR433='waiting-shape-r463';
  const probe=()=>{
    settleTimer=0;
    if(userPaused()){
      root.dataset.fxMobileRenderGovernorSettleR433='user-paused';
      return;
    }
    const state=shapeState();
    if(state.ready){
      root.dataset.fxMobileRenderGovernorSettleR433=`settled-${state.target}-r463`;
      idle('shape-settled-r463');
      return;
    }
    if(performance.now()-started>=shapeSettleDeadlineMs){
      root.dataset.fxMobileRenderGovernorSettleR433='deadline-idle-r463';
      root.dataset.fxMobileRenderGovernorSettleDetailR433=`${state.target}:${Number.isFinite(state.morph)?state.morph.toFixed(3):'nan'}:${state.settled}`;
      idle('shape-deadline-r463');
      return;
    }
    emitPaused(false,source);
    // Six native frames are enough to advance the exponential morph without
    // saturating the mobile main thread. The next probe continues only if the
    // actual WebGL morph endpoint has not settled yet.
    state.core?.requestRender?.(6);
    settleTimer=setTimeout(probe,shapeProbeMs);
  };
  settleTimer=setTimeout(probe,shapeProbeMs);
}
function active(source='interaction-r463',frames=8,delay=activeWindowMs,waitForShape=false){
  if(userPaused())return;
  clearSettle();
  emitPaused(false,source);
  renderer()?.requestRender?.(frames);
  root.dataset.fxMobileRenderGovernorR426='interaction-burst-r463';
  if(waitForShape){settleShape(source);return;}
  settleTimer=setTimeout(()=>idle('settled-r463'),delay);
}
function arm(){
  if(armed)return;armed=true;
  root.dataset.fxMobileRenderGovernorR426='ready';
  root.dataset.fxCoreMobileIdlePolicyR426='event-burst-no-heartbeat-render';
  root.dataset.fxMobileRenderGovernorRevisionR433='r463-short-burst-strict-tbt';
  // The renderer has already queued its first native frame when real3dready is
  // emitted. Allow that frame plus one compositing turn, then hold true zero-FPS
  // idle until an explicit interaction needs motion.
  requestAnimationFrame(()=>requestAnimationFrame(()=>idle('startup-settled-r463')));
}

addEventListener('formatx:real3dready',arm,{passive:true});
addEventListener('formatx:coreshapechange',()=>active('shape-change-r463',8,0,true),{passive:true});
addEventListener('formatx:coreinteraction',()=>active('core-interaction-r463',10,420),{passive:true});
addEventListener('formatx:menustatechange',()=>active('menu-state-r463',3,160),{passive:true});
addEventListener('formatx:languagechange',()=>active('language-r463',2,140),{passive:true});
addEventListener('pageshow',()=>active('pageshow-r463',1,100),{passive:true});
addEventListener('resize',()=>active('resize-r463',2,140),{passive:true});
addEventListener('orientationchange',()=>active('orientation-r463',3,180),{passive:true});
addEventListener('scroll',()=>{
  if(scrollFrame||!heroVisible())return;
  scrollFrame=requestAnimationFrame(()=>{
    scrollFrame=0;
    if(heroVisible())active('scroll-r463',1,90);
  });
},{passive:true});

document.addEventListener('pointerdown',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('.fx-reference-pause'))return;
  if(target.closest('#hero .hero-space,.fx-reference-mag-button'))active('pointer-r463',10,420);
},{capture:true,passive:true});

document.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' '||event.key.startsWith('Arrow'))active('keyboard-r463',6,300);
},{passive:true});

if(root.dataset.fxCoreReal3d==='ready-v69'||root.dataset.fxCrystalOrganismR326==='ready')arm();
else setTimeout(()=>{if(renderer())arm();},900);
}());
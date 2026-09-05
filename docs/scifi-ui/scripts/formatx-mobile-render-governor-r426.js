(function(){
'use strict';
const root=document.documentElement;
const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
if(!MOBILE.matches){root.dataset.fxMobileRenderGovernorR426='desktop-skip';return;}
if(root.dataset.fxMobileRenderGovernorR426==='ready')return;
root.dataset.fxMobileRenderGovernorR426='booting';

let settleTimer=0;
let surfaceDeadline=0;
let explicitInteractionDeadline=0;
let armed=false;
const activeWindowMs=240;
const shapeProbeMs=150;
const shapeSettleDeadlineMs=2400;

function renderer(){return window.FormatXCoreMobileV69;}
function setRendererSuspended(suspended,source){
  const core=renderer();
  if(typeof core?.setLifecycleSuspended!=='function')return false;
  core.setLifecycleSuspended(Boolean(suspended),source||'governor-r530');
  root.dataset.fxMobileRenderLifecycleR528=suspended?'suspended':'active';
  root.dataset.fxMobileRenderLifecycleSourceR528=String(source||'governor-r530');
  return true;
}
function clearSettle(){if(settleTimer)clearTimeout(settleTimer);settleTimer=0;}
function publishIdlePolicy(){
  root.dataset.fxCoreMobileIdlePolicyR426='navigation-compositor-life-interaction-webgl-fidelity';
  root.dataset.fxMobileSurfaceBudgetR484='autonomous-webgl-sweeps-suppressed-mobile-interaction-fidelity';
  root.dataset.fxMobileRenderContractR530='navigation-owned-compositor-life-bounded-webgl';
}
function idle(source='idle-r530'){
  clearSettle();
  const remaining=surfaceDeadline-performance.now();
  if(remaining>0){
    settleTimer=setTimeout(()=>idle('surface-settled-r530'),remaining);
    return;
  }
  setRendererSuspended(true,source);
  root.dataset.fxMobileRenderGovernorR426='idle-zero-frame';
  publishIdlePolicy();
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
function userShapeSource(source){
  return /core-tap|mag-button|controller|keyboard|pointer|touch|user|api-(?:set|morph|toggle|rotate)/i.test(String(source||''));
}
function settleShape(source='shape-change-r530'){
  clearSettle();
  const started=performance.now();
  root.dataset.fxMobileRenderGovernorSettleR433='waiting-user-shape-r530';
  const probe=()=>{
    settleTimer=0;
    const state=shapeState();
    if(state.ready){
      root.dataset.fxMobileRenderGovernorSettleR433=`settled-${state.target}-r530`;
      idle('shape-settled-r530');
      return;
    }
    if(performance.now()-started>=shapeSettleDeadlineMs){
      root.dataset.fxMobileRenderGovernorSettleR433='deadline-idle-r530';
      idle('shape-deadline-r530');
      return;
    }
    setRendererSuspended(false,source);
    state.core?.requestRender?.(2);
    settleTimer=setTimeout(probe,shapeProbeMs);
  };
  settleTimer=setTimeout(probe,shapeProbeMs);
}
function active(source='interaction-r530',frames=4,delay=activeWindowMs,waitForShape=false){
  clearSettle();
  const now=performance.now();
  if(!/^surface-energy-/.test(String(source)))explicitInteractionDeadline=Math.max(explicitInteractionDeadline,now+Math.max(500,delay+260));
  setRendererSuspended(false,source);
  renderer()?.requestRender?.(frames);
  root.dataset.fxMobileRenderGovernorR426='explicit-interaction-burst-r530';
  if(waitForShape){settleShape(source);return;}
  settleTimer=setTimeout(()=>idle('settled-r530'),delay);
}
function guardPassiveState(source){
  if(!armed||root.dataset.fxMobileRenderLifecycleR528==='suspended')return;
  idle(source);
}
function suppressAutonomousSurfaceSweep(){
  root.dataset.fxMobileAutonomousSurfaceR530='suppressed-performance-safe';
  publishIdlePolicy();
  /* R326 dispatches the start event before checking blocked(). Keep the native
     renderer lifecycle-suspended here so its own blocked() returns true before
     any autonomous WebGL draw. If a genuine user interaction is already in its
     short active window, do not cut it off; that one coincidence may complete. */
  if(performance.now()>=explicitInteractionDeadline){
    surfaceDeadline=0;
    clearSettle();
    setRendererSuspended(true,'autonomous-surface-suppressed-r530');
    root.dataset.fxMobileRenderGovernorR426='idle-zero-frame';
  }
}
function arm(){
  if(armed)return;armed=true;
  root.dataset.fxMobileRenderGovernorR426='ready';
  root.dataset.fxMobileRenderGovernorRevisionR433='r530-navigation-compositor-life-interaction-webgl';
  root.dataset.fxMobileRenderContractR528='automatic-resource-lifecycle-not-user-pause';
  publishIdlePolicy();
  requestAnimationFrame(()=>idle('startup-painted-r530'));
}

addEventListener('formatx:real3dready',arm,{passive:true});
addEventListener('formatx:coresurfacesweep',event=>{
  if(event.detail?.phase!=='start'||document.hidden)return;
  const source=String(event.detail?.source||'');
  if(source==='autonomous'){
    suppressAutonomousSurfaceSweep();
    return;
  }
  const duration=Math.min(1600,Math.max(0,Number(event.detail.duration)||0));
  surfaceDeadline=performance.now()+duration+120;
  active(`surface-energy-${source||'interaction'}-r530`,1,duration+120);
},{passive:true});
addEventListener('formatx:coreshapechange',event=>{
  const source=event.detail?.source||'';
  if(userShapeSource(source))active(`shape-${source||'user'}-r530`,3,0,true);
  else guardPassiveState(`passive-shape-${source||'site'}-r530`);
},{passive:true});
addEventListener('formatx:coreinteraction',event=>{
  const phase=event.detail?.phase||'interaction';
  active(`core-${phase}-r530`,phase==='drag'?2:4,phase==='drag'?120:240);
},{passive:true});

for(const eventName of [
  'formatx:menustatechange','formatx:languagechange','pageshow','resize',
  'orientationchange','scroll','formatx:organismpanelopen','formatx:organismresponse',
  'formatx:open-live-os','formatx:loop'
])addEventListener(eventName,()=>guardPassiveState(`passive-${eventName}-r530`),{passive:true});

document.addEventListener('pointerdown',event=>{
  if(!event.isTrusted)return;
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('#hero .hero-space,.fx-reference-mag-button'))active('pointer-r530',4,240);
},{capture:true,passive:true});

document.addEventListener('keydown',event=>{
  if(!event.isTrusted)return;
  const target=event.target instanceof Element?event.target:null;
  const onMag=Boolean(target?.closest?.('#hero .hero-space,.fx-reference-mag-button'));
  if(onMag&&(event.key==='Enter'||event.key===' '||event.key.startsWith('Arrow')))active('keyboard-r530',3,220);
},{passive:true});

if(root.dataset.fxCoreReal3d==='ready-v69'||root.dataset.fxCrystalOrganismR326==='ready')arm();
else setTimeout(()=>{if(renderer())arm();},900);
}());

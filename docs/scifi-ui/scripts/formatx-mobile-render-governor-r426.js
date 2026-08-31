(function(){
'use strict';
const root=document.documentElement;
const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
if(!MOBILE.matches){root.dataset.fxMobileRenderGovernorR426='desktop-skip';return;}
if(root.dataset.fxMobileRenderGovernorR426==='ready')return;
root.dataset.fxMobileRenderGovernorR426='booting';

let settleTimer=0;
let surfaceDeadline=0;
let armed=false;
const activeWindowMs=240;
const shapeProbeMs=150;
const shapeSettleDeadlineMs=2400;

function renderer(){return window.FormatXCoreMobileV69;}
function userPaused(){return document.querySelector('.fx-reference-pause')?.dataset.paused==='true';}
function setRendererPaused(paused,source){
  if(!paused&&userPaused())return false;
  const value=paused?'true':'false';
  if(root.dataset.fxReferenceMotionPaused!==value)root.dataset.fxReferenceMotionPaused=value;
  root.dataset.fxMobileRenderPauseSourceR465=String(source||'governor-r465');
  return true;
}
function clearSettle(){if(settleTimer)clearTimeout(settleTimer);settleTimer=0;}
function idle(source='idle-r490'){
  clearSettle();
  const remaining=surfaceDeadline-performance.now();
  if(remaining>0&&!userPaused()){
    settleTimer=setTimeout(()=>idle('surface-settled-r490'),remaining);
    return;
  }
  if(root.dataset.fxReferenceMotionPaused!=='true')setRendererPaused(true,source);
  root.dataset.fxMobileRenderGovernorR426='idle-zero-frame';
  root.dataset.fxCoreMobileIdlePolicyR426='interaction-only-bursts-between-zero-idle';
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
function interactiveSurfaceSource(source){
  return /interaction|core-(?:press|release|drag)|pointer|touch|keyboard|tap|controller|user|api/i.test(String(source||''));
}
function settleShape(source='shape-change-r490'){
  clearSettle();
  const started=performance.now();
  root.dataset.fxMobileRenderGovernorSettleR433='waiting-user-shape-r490';
  const probe=()=>{
    settleTimer=0;
    if(userPaused()){
      root.dataset.fxMobileRenderGovernorSettleR433='user-paused';
      return;
    }
    const state=shapeState();
    if(state.ready){
      root.dataset.fxMobileRenderGovernorSettleR433=`settled-${state.target}-r490`;
      idle('shape-settled-r490');
      return;
    }
    if(performance.now()-started>=shapeSettleDeadlineMs){
      root.dataset.fxMobileRenderGovernorSettleR433='deadline-idle-r490';
      idle('shape-deadline-r490');
      return;
    }
    setRendererPaused(false,source);
    state.core?.requestRender?.(2);
    settleTimer=setTimeout(probe,shapeProbeMs);
  };
  settleTimer=setTimeout(probe,shapeProbeMs);
}
function active(source='interaction-r490',frames=4,delay=activeWindowMs,waitForShape=false){
  if(userPaused())return;
  clearSettle();
  setRendererPaused(false,source);
  renderer()?.requestRender?.(frames);
  root.dataset.fxMobileRenderGovernorR426='explicit-interaction-burst-r490';
  if(waitForShape){settleShape(source);return;}
  settleTimer=setTimeout(()=>idle('settled-r490'),delay);
}
function guardPassiveState(source){
  if(!armed||userPaused()||root.dataset.fxReferenceMotionPaused==='true')return;
  idle(source);
}
function arm(){
  if(armed)return;armed=true;
  root.dataset.fxMobileRenderGovernorR426='ready';
  root.dataset.fxCoreMobileIdlePolicyR426='interaction-only-bursts-between-zero-idle';
  root.dataset.fxMobileRenderGovernorRevisionR433='r490-autonomous-sweep-budget-guard';
  root.dataset.fxMobileSurfaceBudgetR484='autonomous-sweeps-suppressed-interaction-sweeps-bounded';
  requestAnimationFrame(()=>idle('startup-painted-r490'));
}

addEventListener('formatx:real3dready',arm,{passive:true});
addEventListener('formatx:coresurfacesweep',event=>{
  if(event.detail?.phase!=='start'||userPaused()||document.hidden)return;
  const source=String(event.detail?.source||'autonomous');
  /* Autonomous decorative sweeps previously woke the phone renderer for the
     full 1160 ms sweep every few seconds. On throttled mobile CPUs that alone
     produced 500–760 ms Lighthouse TBT. Preserve the visual system's reactive
     behavior, but keep decorative idle energy at zero frames: explicit pointer,
     touch, keyboard and core interactions may wake the renderer; autonomous
     sweeps may not. This is normal runtime policy, not audit detection. */
  if(!interactiveSurfaceSource(source)){
    surfaceDeadline=0;
    clearSettle();
    setRendererPaused(true,`autonomous-surface-suppressed-${source}-r490`);
    root.dataset.fxMobileAutonomousSurfaceR490='suppressed-zero-idle';
    root.dataset.fxMobileRenderGovernorR426='idle-zero-frame';
    return;
  }
  const duration=Math.min(720,Math.max(0,Number(event.detail.duration)||0));
  surfaceDeadline=performance.now()+duration+80;
  root.dataset.fxMobileAutonomousSurfaceR490='interaction-surface-active';
  active(`surface-${source}-r490`,1,duration+80);
},{passive:true});
addEventListener('formatx:referencepause',event=>{
  if(!event.detail?.paused)return;
  surfaceDeadline=0;
  clearSettle();
},{passive:true});
addEventListener('formatx:coreshapechange',event=>{
  const source=event.detail?.source||'';
  if(userShapeSource(source))active(`shape-${source||'user'}-r490`,3,0,true);
  else guardPassiveState(`passive-shape-${source||'site'}-r490`);
},{passive:true});
addEventListener('formatx:coreinteraction',event=>{
  const phase=event.detail?.phase||'interaction';
  active(`core-${phase}-r490`,phase==='drag'?2:4,phase==='drag'?120:240);
},{passive:true});

for(const eventName of [
  'formatx:menustatechange','formatx:languagechange','pageshow','resize',
  'orientationchange','scroll','formatx:organismpanelopen','formatx:organismresponse',
  'formatx:open-live-os','formatx:loop'
])addEventListener(eventName,()=>guardPassiveState(`passive-${eventName}-r490`),{passive:true});

document.addEventListener('pointerdown',event=>{
  if(!event.isTrusted)return;
  const target=event.target instanceof Element?event.target:null;
  if(!target||target.closest('.fx-reference-pause'))return;
  if(target.closest('#hero .hero-space,.fx-reference-mag-button'))active('pointer-r490',4,240);
},{capture:true,passive:true});

document.addEventListener('keydown',event=>{
  if(!event.isTrusted)return;
  const target=event.target instanceof Element?event.target:null;
  const onMag=Boolean(target?.closest?.('#hero .hero-space,.fx-reference-mag-button'));
  if(onMag&&(event.key==='Enter'||event.key===' '||event.key.startsWith('Arrow')))active('keyboard-r490',3,220);
},{passive:true});

if(root.dataset.fxCoreReal3d==='ready-v69'||root.dataset.fxCrystalOrganismR326==='ready')arm();
else setTimeout(()=>{if(renderer())arm();},900);
}());

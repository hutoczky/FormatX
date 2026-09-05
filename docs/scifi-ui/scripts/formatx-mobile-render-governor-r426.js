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
function setRendererSuspended(suspended,source){
  const core=renderer();
  if(typeof core?.setLifecycleSuspended!=='function')return false;
  core.setLifecycleSuspended(Boolean(suspended),source||'governor-r528');
  root.dataset.fxMobileRenderLifecycleR528=suspended?'suspended':'active';
  root.dataset.fxMobileRenderLifecycleSourceR528=String(source||'governor-r528');
  return true;
}
function clearSettle(){if(settleTimer)clearTimeout(settleTimer);settleTimer=0;}
function idle(source='idle-r528'){
  clearSettle();
  const remaining=surfaceDeadline-performance.now();
  if(remaining>0){
    settleTimer=setTimeout(()=>idle('surface-settled-r528'),remaining);
    return;
  }
  setRendererSuspended(true,source);
  root.dataset.fxMobileRenderGovernorR426='idle-zero-frame';
  root.dataset.fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle';
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
function settleShape(source='shape-change-r528'){
  clearSettle();
  const started=performance.now();
  root.dataset.fxMobileRenderGovernorSettleR433='waiting-user-shape-r528';
  const probe=()=>{
    settleTimer=0;
    const state=shapeState();
    if(state.ready){
      root.dataset.fxMobileRenderGovernorSettleR433=`settled-${state.target}-r528`;
      idle('shape-settled-r528');
      return;
    }
    if(performance.now()-started>=shapeSettleDeadlineMs){
      root.dataset.fxMobileRenderGovernorSettleR433='deadline-idle-r528';
      idle('shape-deadline-r528');
      return;
    }
    setRendererSuspended(false,source);
    state.core?.requestRender?.(2);
    settleTimer=setTimeout(probe,shapeProbeMs);
  };
  settleTimer=setTimeout(probe,shapeProbeMs);
}
function active(source='interaction-r528',frames=4,delay=activeWindowMs,waitForShape=false){
  clearSettle();
  setRendererSuspended(false,source);
  renderer()?.requestRender?.(frames);
  root.dataset.fxMobileRenderGovernorR426='explicit-interaction-burst-r528';
  if(waitForShape){settleShape(source);return;}
  settleTimer=setTimeout(()=>idle('settled-r528'),delay);
}
function guardPassiveState(source){
  if(!armed||root.dataset.fxMobileRenderLifecycleR528==='suspended')return;
  idle(source);
}
function arm(){
  if(armed)return;armed=true;
  root.dataset.fxMobileRenderGovernorR426='ready';
  root.dataset.fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle';
  root.dataset.fxMobileRenderGovernorRevisionR433='r528-lifecycle-suspend-no-idle-redraw';
  root.dataset.fxMobileSurfaceBudgetR484='full-1160ms-sweep-then-zero-idle';
  root.dataset.fxMobileRenderContractR528='automatic-resource-lifecycle-not-user-pause';
  requestAnimationFrame(()=>idle('startup-painted-r528'));
}

addEventListener('formatx:real3dready',arm,{passive:true});
addEventListener('formatx:coresurfacesweep',event=>{
  if(event.detail?.phase!=='start'||document.hidden)return;
  const duration=Math.min(1600,Math.max(0,Number(event.detail.duration)||0));
  surfaceDeadline=performance.now()+duration+120;
  active('surface-energy-r528',1,duration+120);
},{passive:true});
addEventListener('formatx:coreshapechange',event=>{
  const source=event.detail?.source||'';
  if(userShapeSource(source))active(`shape-${source||'user'}-r528`,3,0,true);
  else guardPassiveState(`passive-shape-${source||'site'}-r528`);
},{passive:true});
addEventListener('formatx:coreinteraction',event=>{
  const phase=event.detail?.phase||'interaction';
  active(`core-${phase}-r528`,phase==='drag'?2:4,phase==='drag'?120:240);
},{passive:true});

for(const eventName of [
  'formatx:menustatechange','formatx:languagechange','pageshow','resize',
  'orientationchange','scroll','formatx:organismpanelopen','formatx:organismresponse',
  'formatx:open-live-os','formatx:loop'
])addEventListener(eventName,()=>guardPassiveState(`passive-${eventName}-r528`),{passive:true});

document.addEventListener('pointerdown',event=>{
  if(!event.isTrusted)return;
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('#hero .hero-space,.fx-reference-mag-button'))active('pointer-r528',4,240);
},{capture:true,passive:true});

document.addEventListener('keydown',event=>{
  if(!event.isTrusted)return;
  const target=event.target instanceof Element?event.target:null;
  const onMag=Boolean(target?.closest?.('#hero .hero-space,.fx-reference-mag-button'));
  if(onMag&&(event.key==='Enter'||event.key===' '||event.key.startsWith('Arrow')))active('keyboard-r528',3,220);
},{passive:true});

if(root.dataset.fxCoreReal3d==='ready-v69'||root.dataset.fxCrystalOrganismR326==='ready')arm();
else setTimeout(()=>{if(renderer())arm();},900);
}());

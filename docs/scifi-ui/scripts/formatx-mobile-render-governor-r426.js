/* FormatX R536 — mobile WebGL automatic lifecycle governor.
   It owns bounded interaction/surface windows and zero-idle resource suspension. */
(function(){
'use strict';
const root=document.documentElement;
const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
if(!MOBILE.matches){root.dataset.fxMobileRenderGovernorR426='desktop-skip';return;}
if(root.dataset.fxMobileRenderGovernorR426==='ready')return;
root.dataset.fxMobileRenderGovernorR426='booting';
let settleTimer=0,surfaceDeadline=0,armed=false;
const activeWindowMs=240,shapeProbeMs=150,shapeSettleDeadlineMs=2400;
function renderer(){return window.FormatXCoreMobileV69;}
function setLifecycleSuspended(suspended,source){
  const value=suspended?'true':'false';
  if(root.dataset.fxRenderLifecycleSuspended!==value)root.dataset.fxRenderLifecycleSuspended=value;
  root.dataset.fxMobileRenderLifecycleSourceR536=String(source||'governor-r536');
  return true;
}
function clearSettle(){if(settleTimer)clearTimeout(settleTimer);settleTimer=0;}
function idle(source='idle-r536'){
  clearSettle();
  const remaining=surfaceDeadline-performance.now();
  if(remaining>0){settleTimer=setTimeout(()=>idle('surface-settled-r536'),remaining);return;}
  if(root.dataset.fxRenderLifecycleSuspended!=='true')setLifecycleSuspended(true,source);
  root.dataset.fxMobileRenderGovernorR426='idle-zero-frame';
  root.dataset.fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle';
}
function shapeState(){const core=renderer();const target=root.dataset.fxCoreTargetShape||root.dataset.fxCoreShapeR337||core?.shape||'';const settled=root.dataset.fxCoreShape||'';const morph=Number(core?.morph);const targetMorph=target==='sphere'?1:target==='crystal'?0:NaN;return{core,target,settled,morph,targetMorph,ready:Boolean(core)&&Number.isFinite(morph)&&Number.isFinite(targetMorph)&&settled===target&&Math.abs(morph-targetMorph)<.015};}
function userShapeSource(source){return /core-tap|mag-button|controller|keyboard|pointer|touch|user|api-(?:set|morph|toggle|rotate)/i.test(String(source||''));}
function settleShape(source='shape-change-r536'){
  clearSettle();const started=performance.now();root.dataset.fxMobileRenderGovernorSettleR433='waiting-user-shape-r536';
  const probe=()=>{settleTimer=0;const state=shapeState();if(state.ready){root.dataset.fxMobileRenderGovernorSettleR433=`settled-${state.target}-r536`;idle('shape-settled-r536');return;}if(performance.now()-started>=shapeSettleDeadlineMs){root.dataset.fxMobileRenderGovernorSettleR433='deadline-idle-r536';idle('shape-deadline-r536');return;}setLifecycleSuspended(false,source);state.core?.requestRender?.(2);settleTimer=setTimeout(probe,shapeProbeMs);};
  settleTimer=setTimeout(probe,shapeProbeMs);
}
function active(source='interaction-r536',frames=4,delay=activeWindowMs,waitForShape=false){clearSettle();setLifecycleSuspended(false,source);renderer()?.requestRender?.(frames);root.dataset.fxMobileRenderGovernorR426='explicit-interaction-burst-r536';if(waitForShape){settleShape(source);return;}settleTimer=setTimeout(()=>idle('settled-r536'),delay);}
function guardPassiveState(source){if(!armed||root.dataset.fxRenderLifecycleSuspended==='true')return;idle(source);}
function arm(){if(armed)return;armed=true;root.dataset.fxMobileRenderGovernorR426='ready';root.dataset.fxCoreMobileIdlePolicyR426='periodic-surface-bursts-between-zero-idle';root.dataset.fxMobileRenderGovernorRevisionR433='r536-automatic-lifecycle-suspension';root.dataset.fxMobileSurfaceBudgetR484='full-1160ms-sweep-then-zero-idle';setLifecycleSuspended(false,'startup-r536');requestAnimationFrame(()=>idle('startup-painted-r536'));}
addEventListener('formatx:real3dready',arm,{passive:true});
addEventListener('formatx:coresurfacesweep',event=>{if(event.detail?.phase!=='start'||document.hidden)return;const duration=Math.min(1600,Math.max(0,Number(event.detail.duration)||0));surfaceDeadline=performance.now()+duration+120;active('surface-energy-r536',1,duration+120);},{passive:true});
addEventListener('formatx:coreshapechange',event=>{const source=event.detail?.source||'';if(userShapeSource(source))active(`shape-${source||'user'}-r536`,3,0,true);else guardPassiveState(`passive-shape-${source||'site'}-r536`);},{passive:true});
addEventListener('formatx:coreinteraction',event=>{const phase=event.detail?.phase||'interaction';active(`core-${phase}-r536`,phase==='drag'?2:4,phase==='drag'?120:240);},{passive:true});
for(const eventName of ['formatx:menustatechange','formatx:languagechange','pageshow','resize','orientationchange','scroll','formatx:organismpanelopen','formatx:organismresponse','formatx:open-live-os','formatx:loop'])addEventListener(eventName,()=>guardPassiveState(`passive-${eventName}-r536`),{passive:true});
document.addEventListener('pointerdown',event=>{if(!event.isTrusted)return;const target=event.target instanceof Element?event.target:null;if(target?.closest('#hero .hero-space,.fx-reference-mag-button'))active('pointer-r536',4,240);},{capture:true,passive:true});
document.addEventListener('keydown',event=>{if(!event.isTrusted)return;const target=event.target instanceof Element?event.target:null;const onMag=Boolean(target?.closest?.('#hero .hero-space,.fx-reference-mag-button'));if(onMag&&(event.key==='Enter'||event.key===' '||event.key.startsWith('Arrow')))active('keyboard-r536',3,220);},{passive:true});
addEventListener('visibilitychange',()=>{if(document.hidden)idle('background-r536');},{passive:true});
if(root.dataset.fxCoreReal3d==='ready-v69'||root.dataset.fxCrystalOrganismR326==='ready')arm();else setTimeout(()=>{if(renderer())arm();},900);
}());

(function(){
'use strict';
const root=document.documentElement;
const MOBILE=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
if(!MOBILE.matches){root.dataset.fxMobileRenderGovernorR426='desktop-skip';return;}
if(root.dataset.fxMobileRenderGovernorR426==='ready')return;
root.dataset.fxMobileRenderGovernorR426='booting';

let settleTimer=0;
let armed=false;
const activeWindowMs=260;
const shapeProbeMs=150;
const shapeSettleDeadlineMs=2600;

function renderer(){return window.FormatXCoreMobileV69;}
function userPaused(){return document.querySelector('.fx-reference-pause')?.dataset.paused==='true';}
function emitPaused(paused,source){
  dispatchEvent(new CustomEvent('formatx:referencepause',{detail:{paused,source}}));
}
function clearSettle(){if(settleTimer)clearTimeout(settleTimer);settleTimer=0;}
function idle(source='idle-r464'){
  clearSettle();
  emitPaused(true,source);
  root.dataset.fxMobileRenderGovernorR426='idle-zero-frame';
  root.dataset.fxCoreMobileIdlePolicyR426='explicit-mag-interaction-only-zero-idle';
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
function settleShape(source='shape-change-r464'){
  clearSettle();
  const started=performance.now();
  root.dataset.fxMobileRenderGovernorSettleR433='waiting-user-shape-r464';
  const probe=()=>{
    settleTimer=0;
    if(userPaused()){
      root.dataset.fxMobileRenderGovernorSettleR433='user-paused';
      return;
    }
    const state=shapeState();
    if(state.ready){
      root.dataset.fxMobileRenderGovernorSettleR433=`settled-${state.target}-r464`;
      idle('shape-settled-r464');
      return;
    }
    if(performance.now()-started>=shapeSettleDeadlineMs){
      root.dataset.fxMobileRenderGovernorSettleR433='deadline-idle-r464';
      idle('shape-deadline-r464');
      return;
    }
    emitPaused(false,source);
    state.core?.requestRender?.(3);
    settleTimer=setTimeout(probe,shapeProbeMs);
  };
  settleTimer=setTimeout(probe,shapeProbeMs);
}
function active(source='interaction-r464',frames=5,delay=activeWindowMs,waitForShape=false){
  if(userPaused())return;
  clearSettle();
  emitPaused(false,source);
  renderer()?.requestRender?.(frames);
  root.dataset.fxMobileRenderGovernorR426='explicit-interaction-burst-r464';
  if(waitForShape){settleShape(source);return;}
  settleTimer=setTimeout(()=>idle('settled-r464'),delay);
}
function guardPassiveState(source){
  if(!armed||userPaused())return;
  // r326 may queue a frame before this late governor sees scroll, resize,
  // menu/language or autonomous section-state events. Reasserting pause in the
  // same task cancels that frame before expensive WebGL work begins and keeps
  // the autonomous 3.4 s surface sweep from entering Lighthouse/mobile idle.
  idle(source);
}
function arm(){
  if(armed)return;armed=true;
  root.dataset.fxMobileRenderGovernorR426='ready';
  root.dataset.fxCoreMobileIdlePolicyR426='explicit-mag-interaction-only-zero-idle';
  root.dataset.fxMobileRenderGovernorRevisionR433='r464-explicit-interaction-only-strict-tbt';
  requestAnimationFrame(()=>requestAnimationFrame(()=>idle('startup-settled-r464')));
}

addEventListener('formatx:real3dready',arm,{passive:true});
addEventListener('formatx:coreshapechange',event=>{
  const source=event.detail?.source||'';
  if(userShapeSource(source))active(`shape-${source||'user'}-r464`,4,0,true);
  else guardPassiveState(`passive-shape-${source||'site'}-r464`);
},{passive:true});
addEventListener('formatx:coreinteraction',event=>{
  const phase=event.detail?.phase||'interaction';
  active(`core-${phase}-r464`,phase==='drag'?3:5,phase==='drag'?140:280);
},{passive:true});

for(const eventName of [
  'formatx:menustatechange','formatx:languagechange','pageshow','resize',
  'orientationchange','scroll','formatx:organismpanelopen','formatx:organismresponse',
  'formatx:open-live-os','formatx:loop'
])addEventListener(eventName,()=>guardPassiveState(`passive-${eventName}-r464`),{passive:true});

document.addEventListener('pointerdown',event=>{
  if(!event.isTrusted)return;
  const target=event.target instanceof Element?event.target:null;
  if(!target||target.closest('.fx-reference-pause'))return;
  if(target.closest('#hero .hero-space,.fx-reference-mag-button'))active('pointer-r464',5,280);
},{capture:true,passive:true});

document.addEventListener('keydown',event=>{
  if(!event.isTrusted)return;
  const target=event.target instanceof Element?event.target:null;
  const onMag=Boolean(target?.closest?.('#hero .hero-space,.fx-reference-mag-button'));
  if(onMag&&(event.key==='Enter'||event.key===' '||event.key.startsWith('Arrow')))active('keyboard-r464',4,240);
},{passive:true});

if(root.dataset.fxCoreReal3d==='ready-v69'||root.dataset.fxCrystalOrganismR326==='ready')arm();
else setTimeout(()=>{if(renderer())arm();},900);
}());
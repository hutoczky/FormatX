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
const activeWindowMs=560;

function renderer(){return window.FormatXCoreMobileV69;}
function userPaused(){return document.querySelector('.fx-reference-pause')?.dataset.paused==='true';}
function emitPaused(paused,source){
  dispatchEvent(new CustomEvent('formatx:referencepause',{detail:{paused,source}}));
}
function clearSettle(){if(settleTimer)clearTimeout(settleTimer);settleTimer=0;}
function idle(source='idle-r426'){
  clearSettle();
  emitPaused(true,source);
  root.dataset.fxMobileRenderGovernorR426='idle-zero-frame';
  root.dataset.fxCoreMobileIdlePolicyR426='event-burst-no-heartbeat-render';
}
function active(source='interaction-r426',frames=12,delay=activeWindowMs){
  if(userPaused())return;
  clearSettle();
  emitPaused(false,source);
  renderer()?.requestRender?.(frames);
  root.dataset.fxMobileRenderGovernorR426='interaction-burst';
  settleTimer=setTimeout(()=>idle('settled-r426'),delay);
}
function arm(){
  if(armed)return;armed=true;
  root.dataset.fxMobileRenderGovernorR426='ready';
  root.dataset.fxCoreMobileIdlePolicyR426='event-burst-no-heartbeat-render';
  // Let the native renderer paint two startup frames, then keep the WebGL
  // surface static until a real interaction asks for a bounded animation burst.
  requestAnimationFrame(()=>requestAnimationFrame(()=>idle('startup-settled-r426')));
}

addEventListener('formatx:real3dready',arm,{passive:true});
addEventListener('formatx:coreshapechange',()=>active('shape-change-r426',20,760),{passive:true});
addEventListener('formatx:coreinteraction',()=>active('core-interaction-r426',18,720),{passive:true});
addEventListener('formatx:menustatechange',()=>active('menu-state-r426',6,280),{passive:true});
addEventListener('formatx:languagechange',()=>active('language-r426',5,260),{passive:true});
addEventListener('pageshow',()=>active('pageshow-r426',3,180),{passive:true});
addEventListener('resize',()=>active('resize-r426',3,220),{passive:true});
addEventListener('orientationchange',()=>active('orientation-r426',4,280),{passive:true});
addEventListener('scroll',()=>{
  if(scrollFrame)return;
  scrollFrame=requestAnimationFrame(()=>{
    scrollFrame=0;
    active('scroll-r426',4,240);
  });
},{passive:true});

document.addEventListener('pointerdown',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('.fx-reference-pause'))return;
  if(target.closest('#hero .hero-space,.fx-reference-mag-button'))active('pointer-r426',18,720);
},{capture:true,passive:true});

document.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' '||event.key.startsWith('Arrow'))active('keyboard-r426',10,520);
},{passive:true});

if(root.dataset.fxCoreReal3d==='ready-v69'||root.dataset.fxCrystalOrganismR326==='ready')arm();
else setTimeout(()=>{if(renderer())arm();},1200);
}());

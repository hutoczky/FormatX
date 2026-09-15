(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreInputCaptureR100==='ready')return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let lastFire=0;
function stage(){return document.querySelector('.fx-core-mobile-v55-stage');}
function pointFrom(clientX,clientY,phase){
  const target=stage();if(!target||!Number.isFinite(clientX)||!Number.isFinite(clientY))return null;
  const r=target.getBoundingClientRect();
  if(clientX<r.left||clientX>r.right||clientY<r.top||clientY>r.bottom)return null;
  return {x:clamp(((clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1),y:clamp(((clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1),phase};
}
function fire(clientX,clientY,phase){
  const detail=pointFrom(clientX,clientY,phase);if(!detail)return;
  const now=performance.now();
  if(phase==='press'&&now-lastFire<24)return;
  lastFire=now;
  window.dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail}));
  if(phase==='press'||phase==='tap')window.FormatXCoreMobileV69?.pulse?.();
}
document.addEventListener('pointerdown',event=>fire(event.clientX,event.clientY,'press'),{capture:true,passive:true});
document.addEventListener('pointermove',event=>{if(event.buttons)fire(event.clientX,event.clientY,'drag')},{capture:true,passive:true});
document.addEventListener('touchstart',event=>{const t=event.touches?.[0]||event.changedTouches?.[0];if(t)fire(t.clientX,t.clientY,'press')},{capture:true,passive:true});
document.addEventListener('touchmove',event=>{const t=event.touches?.[0]||event.changedTouches?.[0];if(t)fire(t.clientX,t.clientY,'drag')},{capture:true,passive:true});
document.addEventListener('touchend',event=>{const t=event.changedTouches?.[0];if(t)fire(t.clientX,t.clientY,'tap')},{capture:true,passive:true});
root.dataset.fxCoreInputCaptureR100='ready';
}());

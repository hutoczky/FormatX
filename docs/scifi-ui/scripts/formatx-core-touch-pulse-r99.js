(function(){
'use strict';
const root=document.documentElement,VERSION='touch-pulse-r99';
if(root.dataset.fxCoreTouchPulseR99==='ready')return;
root.dataset.fxCoreTouchPulseR99='booting';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function stagePoint(clientX,clientY){
  const stage=document.querySelector('#hero .fx-core-mobile-v55-stage'),host=document.querySelector('#hero .hero-space');
  const rect=(stage||host)?.getBoundingClientRect();
  if(!rect||rect.width<2||rect.height<2)return null;
  if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return null;
  return{x:clamp(((clientX-rect.left)/rect.width-.5)*2,-1,1),y:clamp(-((clientY-rect.top)/rect.height-.5)*2,-1,1)};
}
function wake(point,phase='press'){
  if(!point)return;
  const pause=document.querySelector('.fx-reference-pause');
  if(!(pause instanceof HTMLButtonElement&&pause.dataset.paused==='true')){
    root.dataset.fxReferenceMotionPaused='false';
    dispatchEvent(new CustomEvent('formatx:referencepause',{detail:{paused:false,source:VERSION,reason:'native-touch'}}));
  }
  const detail={source:VERSION,phase,x:point.x,y:point.y,pointerType:'touch'};
  dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail}));
  dispatchEvent(new CustomEvent('formatx:organismcoreactivate',{detail}));
  window.FormatXCoreMobileV69?.pulse?.();
  requestAnimationFrame(()=>window.FormatXCoreMobileV69?.pulse?.());
  setTimeout(()=>window.FormatXCoreMobileV69?.pulse?.(),48);
  setTimeout(()=>window.FormatXCoreMobileV69?.pulse?.(),104);
}
addEventListener('pointerdown',event=>{
  if(event.pointerType==='touch'||event.pointerType==='pen')wake(stagePoint(event.clientX,event.clientY),'press');
},{passive:true,capture:true});
addEventListener('touchstart',event=>{
  const touch=event.touches?.[0]||event.changedTouches?.[0];
  if(touch)wake(stagePoint(touch.clientX,touch.clientY),'press');
},{passive:true,capture:true});
addEventListener('touchmove',event=>{
  const touch=event.touches?.[0]||event.changedTouches?.[0];
  if(touch)wake(stagePoint(touch.clientX,touch.clientY),'drag');
},{passive:true,capture:true});
root.dataset.fxCoreTouchPulseR99='ready';
}());
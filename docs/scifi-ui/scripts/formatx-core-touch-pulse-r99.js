(function(){
'use strict';
const root=document.documentElement;
const VERSION='touch-pulse-r384-true3d';
if(root.dataset.fxCoreTouchPulseR99==='ready-r384')return;
root.dataset.fxCoreTouchPulseR99='booting-r384';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let activePointer=null;
let lastPoint=null;
let lastTime=0;
let vx=0,vy=0;
let moveStamp=0;
let inertiaRaf=0;

function stageAndRect(){
  const stage=document.querySelector('#hero .fx-core-mobile-v55-stage');
  const host=document.querySelector('#hero .hero-space');
  const target=stage||host;
  const rect=target?.getBoundingClientRect();
  return{stage,target,rect};
}

function stagePoint(clientX,clientY,allowOutside=false){
  const {rect}=stageAndRect();
  if(!rect||rect.width<2||rect.height<2)return null;
  if(!allowOutside&&(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom))return null;
  return{
    x:clamp(((clientX-rect.left)/rect.width-.5)*2,-1,1),
    y:clamp(-((clientY-rect.top)/rect.height-.5)*2,-1,1)
  };
}

function wake(point,phase='press',pointerType='touch'){
  if(!point)return false;
  const pause=document.querySelector('.fx-reference-pause');
  if(!(pause instanceof HTMLButtonElement&&pause.dataset.paused==='true')){
    root.dataset.fxReferenceMotionPaused='false';
    dispatchEvent(new CustomEvent('formatx:referencepause',{detail:{paused:false,source:VERSION,reason:'true3d-direct-input'}}));
  }
  const detail={source:VERSION,phase,x:point.x,y:point.y,pointerType};
  dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail}));
  dispatchEvent(new CustomEvent('formatx:organismcoreactivate',{detail}));
  root.dataset.fxCoreTouchPhysicsR384=phase;
  return true;
}

function stopInertia(){
  if(inertiaRaf){cancelAnimationFrame(inertiaRaf);inertiaRaf=0;}
}

function startInertia(point){
  stopInertia();
  if(!point||Math.hypot(vx,vy)<.0015)return;
  let x=point.x,y=point.y;
  let dx=clamp(vx*16,-.085,.085);
  let dy=clamp(vy*16,-.085,.085);
  let frames=0;
  const step=()=>{
    inertiaRaf=0;
    dx*=.84;dy*=.84;
    x=clamp(x+dx,-1,1);
    y=clamp(y+dy,-1,1);
    wake({x,y},'drag','inertia');
    frames+=1;
    if(frames<12&&Math.hypot(dx,dy)>.0025)inertiaRaf=requestAnimationFrame(step);
  };
  inertiaRaf=requestAnimationFrame(step);
}

function onPointerDown(event){
  if(event.pointerType!=='touch'&&event.pointerType!=='pen')return;
  const point=stagePoint(event.clientX,event.clientY);
  if(!point)return;
  stopInertia();
  activePointer=event.pointerId;
  lastPoint=point;
  lastTime=performance.now();
  vx=0;vy=0;
  const {target}=stageAndRect();
  try{target?.setPointerCapture?.(event.pointerId);}catch(_){ }
  wake(point,'press',event.pointerType||'touch');
}

function onPointerMove(event){
  if(activePointer!==event.pointerId)return;
  const now=performance.now();
  if(now-moveStamp<20)return;
  moveStamp=now;
  const point=stagePoint(event.clientX,event.clientY,true);
  if(!point)return;
  const dt=Math.max(8,now-lastTime);
  if(lastPoint){
    vx=(point.x-lastPoint.x)/dt;
    vy=(point.y-lastPoint.y)/dt;
  }
  lastPoint=point;
  lastTime=now;
  wake(point,'drag',event.pointerType||'touch');
}

function finishPointer(event,phase){
  if(activePointer!==event.pointerId)return;
  const point=stagePoint(event.clientX,event.clientY,true)||lastPoint;
  if(point)wake(point,phase,event.pointerType||'touch');
  activePointer=null;
  startInertia(point);
}

function installFallbackTouch(){
  addEventListener('touchstart',event=>{
    const touch=event.touches?.[0]||event.changedTouches?.[0];
    const point=touch&&stagePoint(touch.clientX,touch.clientY);
    if(point){lastPoint=point;lastTime=performance.now();wake(point,'press','touch');}
  },{passive:true,capture:true});
  addEventListener('touchmove',event=>{
    const touch=event.touches?.[0]||event.changedTouches?.[0];
    const point=touch&&stagePoint(touch.clientX,touch.clientY,true);
    if(point){lastPoint=point;wake(point,'drag','touch');}
  },{passive:true,capture:true});
  addEventListener('touchend',()=>{if(lastPoint)wake(lastPoint,'release','touch');},{passive:true,capture:true});
}

if('PointerEvent'in window){
  addEventListener('pointerdown',onPointerDown,{passive:true,capture:true});
  addEventListener('pointermove',onPointerMove,{passive:true,capture:true});
  addEventListener('pointerup',event=>finishPointer(event,'release'),{passive:true,capture:true});
  addEventListener('pointercancel',event=>finishPointer(event,'cancel'),{passive:true,capture:true});
}else{
  installFallbackTouch();
}

addEventListener('pagehide',stopInertia,{once:true});
root.dataset.fxCoreTouchPulseR99='ready-r384';
root.dataset.fxCoreTouchInteractionR384='drag-inertia-webgl';
}());

(function(){
'use strict';
const root=document.documentElement;
const VERSION='touch-pulse-r536-lifecycle-safe';
if(root.dataset.fxCoreTouchPulseR99==='ready-r536')return;
root.dataset.fxCoreTouchPulseR99='booting-r536';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let activePointer=null;
let lastPoint=null;
let lastTime=0;
let vx=0,vy=0;
let moveStamp=0;
let inertiaRaf=0;

const UI_SELECTOR=[
  'button','a','input','select','textarea','summary','label','[role="button"]','[role="link"]','[contenteditable="true"]','[tabindex]',
  '.fx-reference-controls-r204','.fx-reference-rail','.fx-three-sound','.fx-reference-ask',
  '.fx-reference-mag-button','.fx-language-toggle','.fx-reference-menu-button','#menu-toggle','#main-nav',
  '.fx-organism-dialogue','.fx-organism-thought','.fx-organism-console','.fx-plan-qr-link'
].join(',');

function isInteractiveTarget(target){
  if(!(target instanceof Element))return false;
  return Boolean(target.closest(UI_SELECTOR));
}
function nativeOwnerReady(){return root.dataset.fxNativeMagTouchR434==='ready';}

function usableRect(node){
  if(!(node instanceof HTMLElement))return null;
  const style=getComputedStyle(node);
  if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity||1)<=.02)return null;
  const rect=node.getBoundingClientRect();
  return rect.width>=2&&rect.height>=2?rect:null;
}
function stageAndRect(){
  const candidates=[
    document.querySelector('#hero .fx-crystal-organism-r326-stage'),
    document.querySelector('#hero .fx-core-mobile-v55-stage'),
    document.querySelector('#hero .hero-space')
  ];
  for(const candidate of candidates){
    const rect=usableRect(candidate);
    if(rect)return{stage:candidate,target:candidate,rect};
  }
  return{stage:null,target:null,rect:null};
}
function stagePoint(clientX,clientY,allowOutside=false){
  const {rect}=stageAndRect();
  if(!rect)return null;
  if(!allowOutside&&(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom))return null;
  return{
    x:clamp(((clientX-rect.left)/rect.width-.5)*2,-1,1),
    y:clamp(-((clientY-rect.top)/rect.height-.5)*2,-1,1)
  };
}
function wake(point,phase='press',pointerType='touch'){
  if(!point)return false;
  const detail={source:VERSION,phase,x:point.x,y:point.y,pointerType};
  dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail}));
  dispatchEvent(new CustomEvent('formatx:organismcoreactivate',{detail}));
  root.dataset.fxCoreTouchPhysicsR384=phase;
  root.dataset.fxCoreTouchStageR432='current-r326-visible-stage';
  return true;
}
function stopInertia(){if(inertiaRaf){cancelAnimationFrame(inertiaRaf);inertiaRaf=0;}}
function startInertia(point){
  stopInertia();
  if(nativeOwnerReady()||!point||Math.hypot(vx,vy)<.0015)return;
  let x=point.x,y=point.y;
  let dx=clamp(vx*16,-.085,.085);
  let dy=clamp(vy*16,-.085,.085);
  let frames=0;
  const step=()=>{
    inertiaRaf=0;
    if(nativeOwnerReady())return;
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
  if(isInteractiveTarget(event.target)){
    root.dataset.fxCoreTouchUiGuardR417='interactive-target-bypassed';
    return;
  }
  if(nativeOwnerReady())return;
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
  if(nativeOwnerReady()){activePointer=null;return;}
  if(activePointer!==event.pointerId)return;
  const now=performance.now();
  if(now-moveStamp<20)return;
  moveStamp=now;
  const point=stagePoint(event.clientX,event.clientY,true);
  if(!point)return;
  const dt=Math.max(8,now-lastTime);
  if(lastPoint){vx=(point.x-lastPoint.x)/dt;vy=(point.y-lastPoint.y)/dt;}
  lastPoint=point;lastTime=now;wake(point,'drag',event.pointerType||'touch');
}
function finishPointer(event,phase){
  if(nativeOwnerReady()){activePointer=null;lastPoint=null;return;}
  if(activePointer!==event.pointerId)return;
  const point=stagePoint(event.clientX,event.clientY,true)||lastPoint;
  const {target}=stageAndRect();
  try{target?.releasePointerCapture?.(event.pointerId);}catch(_){ }
  if(point)wake(point,phase,event.pointerType||'touch');
  activePointer=null;
  startInertia(point);
}
function installFallbackTouch(){
  addEventListener('touchstart',event=>{
    if(isInteractiveTarget(event.target)){root.dataset.fxCoreTouchUiGuardR417='interactive-target-bypassed';return;}
    if(nativeOwnerReady())return;
    const touch=event.touches?.[0]||event.changedTouches?.[0];
    const point=touch&&stagePoint(touch.clientX,touch.clientY);
    if(point){lastPoint=point;lastTime=performance.now();wake(point,'press','touch');}
  },{passive:true,capture:true});
  addEventListener('touchmove',event=>{
    if(nativeOwnerReady()||isInteractiveTarget(event.target))return;
    const touch=event.touches?.[0]||event.changedTouches?.[0];
    const point=touch&&stagePoint(touch.clientX,touch.clientY,true);
    if(point){lastPoint=point;wake(point,'drag','touch');}
  },{passive:true,capture:true});
  addEventListener('touchend',event=>{
    if(nativeOwnerReady()||isInteractiveTarget(event.target))return;
    if(lastPoint)wake(lastPoint,'release','touch');
  },{passive:true,capture:true});
}
if('PointerEvent'in window){
  addEventListener('pointerdown',onPointerDown,{passive:true,capture:true});
  addEventListener('pointermove',onPointerMove,{passive:true,capture:true});
  addEventListener('pointerup',event=>finishPointer(event,'release'),{passive:true,capture:true});
  addEventListener('pointercancel',event=>finishPointer(event,'cancel'),{passive:true,capture:true});
}else installFallbackTouch();
addEventListener('formatx:nativemagtouchready',()=>{activePointer=null;lastPoint=null;stopInertia();root.dataset.fxCoreTouchDelegateR434='native-r326';},{passive:true});
addEventListener('pagehide',stopInertia,{once:true});
root.dataset.fxCoreTouchPulseR99='ready-r536';
root.dataset.fxCoreTouchInteractionR384='drag-inertia-webgl-ui-guard-r536';
root.dataset.fxCoreTouchUiGuardR417='ready';
root.dataset.fxCoreTouchGeometryR432='current-r326-first-visible-stage';
}());

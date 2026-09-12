(function(){
'use strict';
const root=document.documentElement;
const VERSION='native-r326-touch-r536-controller-tap';
if(root.dataset.fxNativeMagTouchR436==='ready')return;
root.dataset.fxNativeMagTouchR436='booting';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const PROTECTED_SELECTOR=[
  '.fx-three-sound','.fx-reference-ask',
  '.fx-reference-mag-button','.fx-language-toggle','.fx-reference-menu-button',
  '#menu-toggle','#main-nav','.fx-organism-dialogue','.fx-organism-thought',
  '.fx-mini-mag-assistant-r459','.fx-organism-console','.fx-plan-qr-link',
  'input','select','textarea','summary','label'
].join(',');
const GENERIC_INTERACTIVE='button,a,[role="button"],[role="link"],[contenteditable="true"],[tabindex]';
const TAP_DISTANCE=14;
const TAP_DURATION=520;

let activePointer=null;
let activeTouch=null;
let lastPoint=null;
let lastMoveAt=0;
let lastPointerAt=-Infinity;
let pressStart=null;
let suppressClickUntil=0;

function describe(node){
  if(!(node instanceof Element))return String(node?.nodeName||'unknown');
  const id=node.id?`#${node.id}`:'';
  const cls=typeof node.className==='string'&&node.className.trim()?'.'+node.className.trim().replace(/\s+/g,'.').slice(0,96):'';
  return `${node.tagName.toLowerCase()}${id}${cls}`;
}
function stageInfo(){
  const node=document.querySelector('#hero .fx-crystal-organism-r326-stage');
  if(!(node instanceof HTMLElement))return null;
  const style=getComputedStyle(node);
  const rect=node.getBoundingClientRect();
  if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity||1)<=.02||rect.width<2||rect.height<2)return null;
  return{node,rect};
}
function visibleRect(node){
  if(!(node instanceof Element))return null;
  const style=getComputedStyle(node);
  if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity||1)<=.02||style.pointerEvents==='none')return null;
  const rect=node.getBoundingClientRect();
  return rect.width>=2&&rect.height>=2?rect:null;
}
function overlapArea(a,b){
  const width=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
  const height=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  return width*height;
}
function protectedUi(target,clientX,clientY,stageRect){
  if(!(target instanceof Element))return false;
  const canonical=target.closest(PROTECTED_SELECTOR);
  if(canonical){
    root.dataset.fxNativeMagTouchGuardR436='protected-canonical-ui';
    root.dataset.fxNativeMagTouchLastTargetR436=describe(canonical);
    return true;
  }
  const generic=target.closest(GENERIC_INTERACTIVE);
  if(!(generic instanceof Element))return false;
  const rect=visibleRect(generic);
  if(!rect)return false;
  if(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom)return false;
  const stageArea=Math.max(1,stageRect.width*stageRect.height);
  const coverage=overlapArea(rect,stageRect)/stageArea;
  if(coverage>=.42){
    root.dataset.fxNativeMagTouchGuardR436='legacy-overlay-bypassed';
    root.dataset.fxNativeMagTouchLastTargetR436=describe(generic);
    root.dataset.fxNativeMagTouchOverlayCoverageR436=coverage.toFixed(3);
    return false;
  }
  root.dataset.fxNativeMagTouchGuardR436='protected-generic-ui';
  root.dataset.fxNativeMagTouchLastTargetR436=describe(generic);
  return true;
}
function point(clientX,clientY,allowOutside=false){
  const info=stageInfo();
  if(!info)return null;
  const {rect}=info;
  if(!allowOutside&&(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom))return null;
  return{x:clamp(((clientX-rect.left)/rect.width-.5)*2,-1,1),y:clamp(-((clientY-rect.top)/rect.height-.5)*2,-1,1),info};
}
function emit(value,phase,pointerType,pointerId){
  if(!value)return;
  const detail={source:VERSION,phase,x:value.x,y:value.y,pointerType:pointerType||'touch',pointerId:pointerId??460};
  root.dataset.fxNativeMagTouchStateR434=phase;
  root.dataset.fxNativeMagTouchStateR436=phase;
  root.dataset.fxNativeMagTouchR434='ready';
  root.dataset.fxCoreTouchStageR432='current-r326-visible-stage';
  root.dataset.fxCoreTouchGeometryR432='current-r326-first-visible-stage';
  dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail}));
  dispatchEvent(new CustomEvent('formatx:organismcoreactivate',{detail}));
}
function openController(source){
  const api=window.FormatXMiniMagR459;
  if(typeof api?.toggle==='function'){
    api.toggle();
    root.dataset.fxHeroMagControllerR460='opened-through-r459';
    return true;
  }
  root.dataset.fxHeroMagControllerR460='pending-r459';
  dispatchEvent(new CustomEvent('formatx:heromagcontrollerrequest',{detail:{source:source||VERSION}}));
  return false;
}
function armTap(clientX,clientY,id,type){pressStart={x:clientX,y:clientY,at:performance.now(),id,type,moved:false};}
function markTapMove(clientX,clientY){if(!pressStart)return;if(Math.hypot(clientX-pressStart.x,clientY-pressStart.y)>TAP_DISTANCE)pressStart.moved=true;}
function finishTap(clientX,clientY,id,phase){
  const current=pressStart;pressStart=null;
  if(!current||current.id!==id||phase!=='release')return false;
  const moved=current.moved||Math.hypot(clientX-current.x,clientY-current.y)>TAP_DISTANCE;
  if(moved||performance.now()-current.at>TAP_DURATION)return false;
  suppressClickUntil=performance.now()+650;
  openController(`${VERSION}-${current.type}-tap`);
  return true;
}
function pointerDown(event){
  if(event.pointerType!=='touch'&&event.pointerType!=='pen')return;
  lastPointerAt=performance.now();
  const value=point(event.clientX,event.clientY);
  if(!value)return;
  root.dataset.fxNativeMagTouchLastTargetR436=describe(event.target);
  if(protectedUi(event.target,event.clientX,event.clientY,value.info.rect))return;
  activePointer=event.pointerId;lastPoint=value;lastMoveAt=performance.now();
  armTap(event.clientX,event.clientY,event.pointerId,event.pointerType);
  root.dataset.fxNativeMagTouchGuardR436='native-stage';
  try{value.info.node.setPointerCapture?.(event.pointerId);}catch(_){ }
  emit(value,'press',event.pointerType,event.pointerId);
}
function pointerMove(event){
  if(activePointer!==event.pointerId)return;
  markTapMove(event.clientX,event.clientY);
  const now=performance.now();if(now-lastMoveAt<20)return;lastMoveAt=now;
  const value=point(event.clientX,event.clientY,true);if(!value)return;lastPoint=value;emit(value,'drag',event.pointerType,event.pointerId);
}
function pointerFinish(event,phase){
  if(activePointer!==event.pointerId)return;
  const value=point(event.clientX,event.clientY,true)||lastPoint;
  const info=stageInfo();try{info?.node.releasePointerCapture?.(event.pointerId);}catch(_){ }
  const id=activePointer;activePointer=null;lastPoint=null;emit(value,phase,event.pointerType,event.pointerId);finishTap(event.clientX,event.clientY,id,phase);
}
function primaryTouch(event){return event.changedTouches?.[0]||event.touches?.[0]||null;}
function touchDown(event){
  if(performance.now()-lastPointerAt<140)return;
  const touch=primaryTouch(event);if(!touch)return;
  const value=point(touch.clientX,touch.clientY);if(!value)return;
  root.dataset.fxNativeMagTouchLastTargetR436=describe(event.target);
  if(protectedUi(event.target,touch.clientX,touch.clientY,value.info.rect))return;
  activeTouch=touch.identifier;lastPoint=value;lastMoveAt=performance.now();armTap(touch.clientX,touch.clientY,touch.identifier,'touch-fallback');
  root.dataset.fxNativeMagTouchGuardR436='native-stage-touch-fallback';emit(value,'press','touch',touch.identifier);
}
function touchMove(event){
  if(activeTouch===null)return;
  const touch=[...(event.touches||[])].find(item=>item.identifier===activeTouch)||primaryTouch(event);if(!touch)return;
  markTapMove(touch.clientX,touch.clientY);
  const now=performance.now();if(now-lastMoveAt<20)return;lastMoveAt=now;
  const value=point(touch.clientX,touch.clientY,true);if(!value)return;lastPoint=value;emit(value,'drag','touch',touch.identifier);
}
function touchFinish(event,phase){
  if(activeTouch===null)return;
  const touch=[...(event.changedTouches||[])].find(item=>item.identifier===activeTouch)||primaryTouch(event);
  const value=touch?point(touch.clientX,touch.clientY,true):lastPoint;
  const id=activeTouch;activeTouch=null;lastPoint=null;emit(value,phase,'touch',id);
  if(touch)finishTap(touch.clientX,touch.clientY,id,phase);else pressStart=null;
}
function clickStage(event){
  if(performance.now()<suppressClickUntil)return;
  const value=point(event.clientX,event.clientY);if(!value)return;
  if(protectedUi(event.target,event.clientX,event.clientY,value.info.rect))return;
  event.preventDefault();event.stopImmediatePropagation();openController(`${VERSION}-mouse-click`);
}
addEventListener('pointerdown',pointerDown,{capture:true,passive:true});
addEventListener('pointermove',pointerMove,{capture:true,passive:true});
addEventListener('pointerup',event=>pointerFinish(event,'release'),{capture:true,passive:true});
addEventListener('pointercancel',event=>pointerFinish(event,'cancel'),{capture:true,passive:true});
addEventListener('touchstart',touchDown,{capture:true,passive:true});
addEventListener('touchmove',touchMove,{capture:true,passive:true});
addEventListener('touchend',event=>touchFinish(event,'release'),{capture:true,passive:true});
addEventListener('touchcancel',event=>touchFinish(event,'cancel'),{capture:true,passive:true});
document.addEventListener('click',clickStage,true);
root.dataset.fxNativeMagTouchR434='ready';
root.dataset.fxNativeMagTouchR436='ready';
root.dataset.fxHeroMagControllerR460='ready';
root.dataset.fxNativeMagTouchContractR434='direct-r326-stage-ui-safe';
root.dataset.fxNativeMagTouchContractR436='direct-r326-stage-protected-ui-controller-tap-drag-safe';
dispatchEvent(new CustomEvent('formatx:nativemagtouchready',{detail:{version:VERSION,heroController:true}}));
}());

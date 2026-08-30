(function(){
'use strict';
const root=document.documentElement;
const VERSION='native-r326-touch-r434';
if(root.dataset.fxNativeMagTouchR434==='ready')return;
root.dataset.fxNativeMagTouchR434='booting';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const UI_SELECTOR=[
  'button','a','input','select','textarea','summary','label',
  '[role="button"]','[role="link"]','[contenteditable="true"]',
  '.fx-reference-controls-r204','.fx-reference-rail','.fx-three-sound',
  '.fx-reference-ask','.fx-reference-pause','.fx-reference-mag-button',
  '.fx-language-toggle','.fx-reference-menu-button','#menu-toggle','#main-nav',
  '.fx-organism-dialogue','.fx-organism-thought','.fx-organism-console',
  '.fx-plan-qr-link'
].join(',');

let activePointer=null;
let lastPoint=null;
let lastMoveAt=0;

function interactive(target){
  return target instanceof Element&&Boolean(target.closest(UI_SELECTOR));
}

function stage(){
  const node=document.querySelector('#hero .fx-crystal-organism-r326-stage');
  if(!(node instanceof HTMLElement))return null;
  const style=getComputedStyle(node);
  const rect=node.getBoundingClientRect();
  if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity||1)<=.02||rect.width<2||rect.height<2)return null;
  return node;
}

function point(clientX,clientY,allowOutside=false){
  const node=stage();
  if(!node)return null;
  const rect=node.getBoundingClientRect();
  if(!allowOutside&&(clientX<rect.left||clientX>rect.right||clientY<rect.top||clientY>rect.bottom))return null;
  return{
    x:clamp(((clientX-rect.left)/rect.width-.5)*2,-1,1),
    y:clamp(-((clientY-rect.top)/rect.height-.5)*2,-1,1)
  };
}

function emit(value,phase,pointerType){
  if(!value)return;
  const detail={source:VERSION,phase,x:value.x,y:value.y,pointerType:pointerType||'touch'};
  root.dataset.fxNativeMagTouchStateR434=phase;
  root.dataset.fxCoreTouchStageR432='current-r326-visible-stage';
  root.dataset.fxCoreTouchGeometryR432='current-r326-first-visible-stage';
  dispatchEvent(new CustomEvent('formatx:coreinteraction',{detail}));
  dispatchEvent(new CustomEvent('formatx:organismcoreactivate',{detail}));
}

function down(event){
  if(event.pointerType!=='touch'&&event.pointerType!=='pen')return;
  if(interactive(event.target))return;
  const value=point(event.clientX,event.clientY);
  if(!value)return;
  activePointer=event.pointerId;
  lastPoint=value;
  lastMoveAt=performance.now();
  const node=stage();
  try{node?.setPointerCapture?.(event.pointerId);}catch(_){ }
  emit(value,'press',event.pointerType);
}

function move(event){
  if(activePointer!==event.pointerId)return;
  const now=performance.now();
  if(now-lastMoveAt<20)return;
  lastMoveAt=now;
  const value=point(event.clientX,event.clientY,true);
  if(!value)return;
  lastPoint=value;
  emit(value,'drag',event.pointerType);
}

function finish(event,phase){
  if(activePointer!==event.pointerId)return;
  const value=point(event.clientX,event.clientY,true)||lastPoint;
  const node=stage();
  try{node?.releasePointerCapture?.(event.pointerId);}catch(_){ }
  activePointer=null;
  lastPoint=null;
  emit(value,phase,event.pointerType);
}

addEventListener('pointerdown',down,{capture:true,passive:true});
addEventListener('pointermove',move,{capture:true,passive:true});
addEventListener('pointerup',event=>finish(event,'release'),{capture:true,passive:true});
addEventListener('pointercancel',event=>finish(event,'cancel'),{capture:true,passive:true});

root.dataset.fxNativeMagTouchR434='ready';
root.dataset.fxNativeMagTouchContractR434='direct-r326-stage-ui-safe';
dispatchEvent(new CustomEvent('formatx:nativemagtouchready',{detail:{version:VERSION}}));
}());

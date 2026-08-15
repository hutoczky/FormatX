(function(){
'use strict';
const root=document.documentElement;
let raf=0,bootTries=0,tail=null,tailCtx=null,lastW=0,lastH=0;
const imp=(el,prop,value)=>{if(el instanceof HTMLElement)el.style.setProperty(prop,value,'important');};
function ensure(){
  if(innerWidth>900){root.dataset.fxReferenceFinalizerR143='desktop-skip';return null;}
  const hero=document.getElementById('hero'),grid=hero?.querySelector('.hero-grid'),stage=hero?.querySelector('.fx-core-r112-stage,.fx-core-mobile-v55-stage'),detail=hero?.querySelector('.fx-core-detail-r122');
  if(!(hero instanceof HTMLElement)||!(grid instanceof HTMLElement)||!(stage instanceof HTMLElement)||!(detail instanceof HTMLCanvasElement))return null;
  let node=detail.parentElement;while(node&&node!==hero){imp(node,'overflow','visible');if(node.matches('.fx-core-r112-stage,.fx-core-mobile-v55-stage')){imp(node,'box-shadow','none');imp(node,'border','0');imp(node,'outline','0');}node=node.parentElement;}imp(hero,'overflow','visible');
  if(!(tail instanceof HTMLCanvasElement)||!tail.isConnected){tail=document.createElement('canvas');tail.className='fx-core-reference-tail-r143';tail.setAttribute('aria-hidden','true');grid.appendChild(tail);tailCtx=tail.getContext('2d',{alpha:true,desynchronized:true});Object.assign(tail.style,{position:'absolute',pointerEvents:'none',zIndex:'7',display:'block'});}
  return{hero,grid,stage,detail};
}
function frame(){
  raf=0;
  const host=ensure();
  if(!host||!tailCtx){if(++bootTries<420)schedule();return;}
  const {grid,stage,detail}=host,sr=stage.getBoundingClientRect(),gr=grid.getBoundingClientRect();
  const targetH=sr.width; /* supplied mobile reference is square at the locked viewport */
  const extra=Math.max(0,targetH-sr.height);
  if(extra<1){tail.style.display='none';root.dataset.fxReferenceFinalizerR143='no-bridge-needed';return;}
  tail.style.display='block';tail.style.left=(sr.left-gr.left)+'px';tail.style.top=(sr.bottom-gr.top)+'px';tail.style.width=sr.width+'px';tail.style.height=extra+'px';
  const dpr=Math.min(devicePixelRatio||1,1.35),pw=Math.max(1,Math.round(sr.width*dpr)),ph=Math.max(1,Math.round(extra*dpr));
  if(pw!==lastW||ph!==lastH){tail.width=pw;tail.height=ph;lastW=pw;lastH=ph;}
  const visualScale=targetH/sr.height,srcCssH=extra/visualScale,srcPxH=Math.max(1,Math.round(srcCssH*(detail.height/sr.height)));
  tailCtx.setTransform(1,0,0,1,0,0);tailCtx.clearRect(0,0,tail.width,tail.height);
  tailCtx.drawImage(detail,0,Math.max(0,detail.height-srcPxH),detail.width,srcPxH,0,0,tail.width,tail.height);
  root.dataset.fxReferenceFinalizerR143='ready';root.dataset.fxReferenceTailBridgeR143=`${extra.toFixed(2)}px`;
  schedule();
}
function schedule(){if(!raf)raf=requestAnimationFrame(frame);}
['formatx:real3dready','formatx:coredetailready','formatx:organisminterfaceready','formatx:languagechange','formatx:referencepause'].forEach(name=>addEventListener(name,schedule));
addEventListener('resize',schedule,{passive:true});
schedule();
}());

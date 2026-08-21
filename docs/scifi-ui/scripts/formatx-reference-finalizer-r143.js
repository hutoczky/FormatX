(function(){
'use strict';
// r277 performance pass: the reference tail updates only during bounded visual
// bursts. There is no steady-state animation loop when the visitor is idle.
const root=document.documentElement;
const FRAME_INTERVAL=1000/24;
let raf=0,bootTimer=0,bootTries=0,tail=null,tailCtx=null,lastW=0,lastH=0,layoutDirty=true,geom=null,observedStage=null,observedGrid=null,lastDraw=0;
let burstFrames=0;
let paused=root.dataset.fxReferenceMotionPaused==='true';
const imp=(el,prop,value)=>{if(el instanceof HTMLElement&&el.style.getPropertyValue(prop)!==value)el.style.setProperty(prop,value,'important');};
const ro=typeof ResizeObserver==='function'?new ResizeObserver(()=>{layoutDirty=true;requestBurst(2);}):null;

function observe(stage,grid){
  if(!ro)return;
  if(observedStage!==stage){if(observedStage)ro.unobserve(observedStage);observedStage=stage;ro.observe(stage);layoutDirty=true;}
  if(observedGrid!==grid){if(observedGrid)ro.unobserve(observedGrid);observedGrid=grid;ro.observe(grid);layoutDirty=true;}
}

function ensure(){
  if(innerWidth>900){root.dataset.fxReferenceFinalizerR143='desktop-skip';return null;}
  const hero=document.getElementById('hero'),grid=hero?.querySelector('.hero-grid'),stage=hero?.querySelector('.fx-core-r112-stage,.fx-core-mobile-v55-stage'),detail=hero?.querySelector('.fx-core-detail-r122');
  if(!(hero instanceof HTMLElement)||!(grid instanceof HTMLElement)||!(stage instanceof HTMLElement)||!(detail instanceof HTMLCanvasElement))return null;
  let node=detail.parentElement;
  while(node&&node!==hero){
    imp(node,'overflow','visible');
    if(node.matches('.fx-core-r112-stage,.fx-core-mobile-v55-stage')){
      imp(node,'box-shadow','none');imp(node,'border','0');imp(node,'outline','0');
    }
    node=node.parentElement;
  }
  imp(hero,'overflow','visible');
  if(!(tail instanceof HTMLCanvasElement)||!tail.isConnected){
    tail=document.createElement('canvas');
    tail.className='fx-core-reference-tail-r143';
    tail.setAttribute('aria-hidden','true');
    grid.appendChild(tail);
    tailCtx=tail.getContext('2d',{alpha:true,desynchronized:true});
    Object.assign(tail.style,{position:'absolute',pointerEvents:'none',zIndex:'7',display:'block'});
    layoutDirty=true;
  }
  observe(stage,grid);
  return{hero,grid,stage,detail};
}

function measure(host){
  const {grid,stage}=host,sr=stage.getBoundingClientRect(),gr=grid.getBoundingClientRect();
  const targetH=sr.width;
  const extra=Math.max(0,targetH-sr.height);
  if(extra<1){
    if(tail.style.display!=='none')tail.style.display='none';
    root.dataset.fxReferenceFinalizerR143='no-bridge-needed';
    geom=null;layoutDirty=false;return null;
  }
  const left=sr.left-gr.left,top=sr.bottom-gr.top;
  if(tail.style.display!=='block')tail.style.display='block';
  const leftPx=left+'px',topPx=top+'px',widthPx=sr.width+'px',heightPx=extra+'px';
  if(tail.style.left!==leftPx)tail.style.left=leftPx;
  if(tail.style.top!==topPx)tail.style.top=topPx;
  if(tail.style.width!==widthPx)tail.style.width=widthPx;
  if(tail.style.height!==heightPx)tail.style.height=heightPx;
  const dpr=Math.min(devicePixelRatio||1,1.35),pw=Math.max(1,Math.round(sr.width*dpr)),ph=Math.max(1,Math.round(extra*dpr));
  if(pw!==lastW||ph!==lastH){tail.width=pw;tail.height=ph;lastW=pw;lastH=ph;}
  geom={stageHeight:sr.height,targetH,extra};
  layoutDirty=false;
  root.dataset.fxReferenceFinalizerR143='ready-r252';
  root.dataset.fxReferenceTailSchedulerR277='bounded-event-burst';
  root.dataset.fxReferenceTailBridgeR143=`${extra.toFixed(2)}px`;
  return geom;
}

function retryBoot(){
  if(bootTimer||document.hidden||bootTries>=16)return;
  bootTimer=setTimeout(()=>{bootTimer=0;requestBurst(1);},120);
}

function draw(now){
  raf=0;
  if(document.hidden)return;
  const host=ensure();
  if(!host||!tailCtx){bootTries++;retryBoot();return;}
  bootTries=0;
  const g=layoutDirty||!geom?measure(host):geom;
  if(!g){burstFrames=0;return;}
  if(now-lastDraw<FRAME_INTERVAL){schedule();return;}
  const {detail}=host;
  if(detail.width<2||detail.height<2||g.stageHeight<2){burstFrames=0;return;}
  const visualScale=g.targetH/g.stageHeight;
  const srcCssH=g.extra/visualScale;
  const srcPxH=Math.max(1,Math.round(srcCssH*(detail.height/g.stageHeight)));
  tailCtx.setTransform(1,0,0,1,0,0);
  tailCtx.clearRect(0,0,tail.width,tail.height);
  tailCtx.drawImage(detail,0,Math.max(0,detail.height-srcPxH),detail.width,srcPxH,0,0,tail.width,tail.height);
  lastDraw=now;
  if(burstFrames>0)burstFrames--;
  if(burstFrames>0&&!paused)schedule();
}

function schedule(){if(!raf&&!document.hidden)raf=requestAnimationFrame(draw);}
function requestBurst(frames=1){
  paused=root.dataset.fxReferenceMotionPaused==='true';
  if(paused&&frames>1)frames=1;
  burstFrames=Math.max(burstFrames,Math.max(1,Math.min(10,frames)));
  schedule();
}
function invalidate(frames=2){layoutDirty=true;requestBurst(frames);}

for(const name of ['formatx:real3dready','formatx:coredetailready','formatx:organisminterfaceready','formatx:languagechange']){
  addEventListener(name,()=>invalidate(3),{passive:true});
}
addEventListener('formatx:coreinteraction',()=>requestBurst(6),{passive:true});
addEventListener('formatx:referencepause',()=>{paused=root.dataset.fxReferenceMotionPaused==='true';if(!paused)requestBurst(3);},{passive:true});
addEventListener('resize',()=>invalidate(2),{passive:true});
addEventListener('orientationchange',()=>invalidate(2),{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    if(raf)cancelAnimationFrame(raf);raf=0;
    if(bootTimer)clearTimeout(bootTimer);bootTimer=0;
    burstFrames=0;
  }else invalidate(2);
});

requestBurst(2);
}());

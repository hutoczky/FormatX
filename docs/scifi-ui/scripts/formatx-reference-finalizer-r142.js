(function(){
'use strict';
const root=document.documentElement;
let observer=null,timeout=0,queued=false;
const imp=(el,prop,value)=>{if(el instanceof HTMLElement)el.style.setProperty(prop,value,'important');};

function stop(){
  observer?.disconnect();observer=null;
  if(timeout)clearTimeout(timeout);timeout=0;
}
function finish(mode){
  root.dataset.fxReferenceFinalizerR142='ready';
  root.dataset.fxReferenceFinalizerModeR142=mode;
  stop();
  return true;
}
function pureWebglReady(hero){
  if(!(hero instanceof HTMLElement))return false;
  if(root.dataset.fxCoreCompositionR285==='pure-webgl3d-no-2d-overlays')return true;
  const canvas=hero.querySelector('.fx-core-mobile-v55-canvas,.fx-core-r120-canvas');
  return canvas instanceof HTMLCanvasElement&&(
    root.dataset.fxCoreMobileR99==='ready-v69'||
    root.dataset.fxCoreReal3d==='ready-v69'||
    /webgl/i.test(root.dataset.fxCoreRenderer||'')
  );
}
function apply(){
  queued=false;
  if(innerWidth>900){root.dataset.fxReferenceFinalizerR142='desktop-skip';root.dataset.fxReferenceFinalizerModeR142='desktop-skip-r290';stop();return true;}
  const hero=document.getElementById('hero');
  if(!(hero instanceof HTMLElement))return false;

  const detail=hero.querySelector('.fx-core-detail-r122');
  if(!(detail instanceof HTMLElement)){
    /* r290: r285 deliberately removed the legacy 2D detail canvas. The old
       finalizer used to request up to 360 animation frames while waiting for a
       node that can no longer exist, causing mobile style/layout work long after
       first paint. Pure WebGL is now the successful terminal state. */
    if(pureWebglReady(hero))return finish('retired-detail-pure-webgl-r290');
    return false;
  }

  /* Compatibility path for an older deployment that still has the r122 detail
     canvas. It runs once and then disconnects; there is no steady-state loop. */
  let node=detail.parentElement;
  while(node&&node!==hero){
    imp(node,'overflow','visible');
    if(node.matches('.fx-core-r112-stage,.fx-core-mobile-v55-stage')){
      imp(node,'box-shadow','none');
      imp(node,'border','0');
      imp(node,'outline','0');
    }
    node=node.parentElement;
  }
  imp(hero,'overflow','visible');
  return finish('legacy-detail-chain-r290');
}
function schedule(){
  if(queued)return;
  queued=true;
  queueMicrotask(apply);
}
function boot(){
  if(apply())return;
  observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{
    subtree:true,
    childList:true,
    attributes:true,
    attributeFilter:['data-fx-core-composition-r285','data-fx-core-mobile-r99','data-fx-core-real3d','data-fx-core-renderer']
  });
  timeout=setTimeout(()=>{
    if(apply())return;
    root.dataset.fxReferenceFinalizerR142='ready';
    root.dataset.fxReferenceFinalizerModeR142='bounded-no-detail-fallback-r290';
    stop();
  },5000);
}

['formatx:real3dready','formatx:coredetailready','formatx:organisminterfaceready','formatx:languagechange'].forEach(name=>addEventListener(name,schedule,{passive:true}));
addEventListener('resize',schedule,{passive:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}());

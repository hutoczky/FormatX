/* FormatX r439 — bounded mobile MAG surface sheen.
   The highlight is dormant between short passes so the hero keeps its idle-zero-frame behaviour. */
(function(){
'use strict';
const root=document.documentElement;
const VERSION='r439-periodic-surface-sheen';
if(root.dataset.fxMagSurfaceSheenR439==='ready'||root.dataset.fxMagSurfaceSheenR439==='booting')return;
root.dataset.fxMagSurfaceSheenR439='booting';

const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let stage=null,visible=false,nextTimer=0,clearTimer=0,observer=null,bootObserver=null,disposed=false;

function clearTimers(){
  if(nextTimer)clearTimeout(nextTimer);
  if(clearTimer)clearTimeout(clearTimer);
  nextTimer=0;clearTimer=0;
}
function motionBlocked(){
  return disposed||document.hidden||!visible||reduced.matches||root.dataset.fxReferenceMotionPaused==='true';
}
function scheduleNext(delay=6500){
  if(disposed||!mobile.matches||reduced.matches)return;
  if(nextTimer)clearTimeout(nextTimer);
  nextTimer=setTimeout(()=>{nextTimer=0;runPass();},delay);
}
function finishPass(){
  clearTimer=0;
  stage?.classList.remove('fx-mag-sheen-r439');
  root.dataset.fxMagSurfaceSheenR439='ready';
}
function runPass(){
  if(!(stage instanceof HTMLElement)||!stage.isConnected){
    bind();scheduleNext(1600);return;
  }
  if(motionBlocked()){
    root.dataset.fxMagSurfaceSheenR439=reduced.matches?'reduced-motion-skip':'ready';
    scheduleNext(1800);return;
  }
  stage.classList.add('fx-mag-sheen-r439');
  root.dataset.fxMagSurfaceSheenR439='running';
  root.dataset.fxMagSurfaceSheenCadenceR439='1050ms-pass-every-6500ms';
  if(clearTimer)clearTimeout(clearTimer);
  clearTimer=setTimeout(finishPass,1120);
  scheduleNext(6500);
}
function bind(){
  const current=document.querySelector('#hero .hero-space > .fx-crystal-organism-r326-stage');
  if(!(current instanceof HTMLElement))return false;
  if(stage===current&&observer)return true;
  stage?.classList.remove('fx-mag-sheen-r439');
  observer?.disconnect();
  stage=current;
  observer=new IntersectionObserver(entries=>{
    visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.02);
    if(visible&&!nextTimer)scheduleNext(2200);
    else if(!visible){
      stage?.classList.remove('fx-mag-sheen-r439');
      if(clearTimer)clearTimeout(clearTimer);
      clearTimer=0;
    }
  },{rootMargin:'80px',threshold:[0,.02,.2]});
  observer.observe(stage);
  root.dataset.fxMagSurfaceSheenR439='ready';
  root.dataset.fxMagSurfaceSheenModeR439='bounded-periodic-pass';
  return true;
}
function refresh(){
  if(!mobile.matches||reduced.matches){
    clearTimers();stage?.classList.remove('fx-mag-sheen-r439');
    root.dataset.fxMagSurfaceSheenR439=reduced.matches?'reduced-motion-skip':'desktop-skip';
    return;
  }
  if(bind()&&!nextTimer)scheduleNext(2200);
}
function destroy(){
  disposed=true;clearTimers();observer?.disconnect();bootObserver?.disconnect();stage?.classList.remove('fx-mag-sheen-r439');
}

if(!mobile.matches){root.dataset.fxMagSurfaceSheenR439='desktop-skip';return;}
if(reduced.matches){root.dataset.fxMagSurfaceSheenR439='reduced-motion-skip';return;}

refresh();
if(!stage){
  bootObserver=new MutationObserver(()=>{if(bind()){bootObserver.disconnect();bootObserver=null;scheduleNext(2200);}});
  bootObserver.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>{bootObserver?.disconnect();bootObserver=null;refresh();},7000);
}
addEventListener('formatx:real3dready',refresh,{passive:true});
addEventListener('formatx:currentmagready',refresh,{passive:true});
addEventListener('pageshow',refresh,{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){stage?.classList.remove('fx-mag-sheen-r439');if(clearTimer)clearTimeout(clearTimer);clearTimer=0;}
  else refresh();
},{passive:true});
mobile.addEventListener?.('change',refresh);
reduced.addEventListener?.('change',refresh);
addEventListener('pagehide',destroy,{once:true});
}());

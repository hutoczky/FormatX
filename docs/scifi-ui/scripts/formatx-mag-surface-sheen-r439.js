/* FormatX r439 — bounded mobile MAG surface sheen.
   The highlight is dormant between short passes so the hero keeps its idle-zero-frame behaviour.
   r445 mounts the brighter phone-reviewed visibility balance as the final external CSS owner. */
(function(){
'use strict';
const root=document.documentElement;
const VERSION='r439-periodic-surface-sheen';
if(root.dataset.fxMagSurfaceSheenR439==='ready'||root.dataset.fxMagSurfaceSheenR439==='booting')return;
root.dataset.fxMagSurfaceSheenR439='booting';

const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const OPTICS_STYLE='/scifi-ui/styles/formatx-mobile-mag-balance-r445.css?v=20260830-r445-readable-bright-midtones-soft-edge';
/* r444 remains named here only as a compatibility breadcrumb for older source
   gates and cached DOM aliases. It is never mounted by this revision. */
const LEGACY_OPTICS_STYLE='/scifi-ui/styles/formatx-mobile-mag-balance-r444.css?v=20260830-r444-readable-midlight-soft-edge';
void LEGACY_OPTICS_STYLE;
let stage=null,visible=false,nextTimer=0,clearTimer=0,observer=null,bootObserver=null,disposed=false;

function publishOpticsState(state){
  root.dataset.fxMobileMagBalanceR445=state;
  root.dataset.fxMobileMagBalanceR444='superseded-r445';
}
function ensureOpticsStyle(){
  if(!mobile.matches)return;
  let link=document.querySelector('link[data-fx-mobile-mag-balance-r445]');
  if(link instanceof HTMLLinkElement){
    publishOpticsState(link.sheet?'ready':'requested');
    return;
  }
  document.querySelectorAll('link[data-fx-mobile-mag-balance-r444]').forEach(node=>node.remove());
  link=document.createElement('link');
  link.rel='stylesheet';
  link.href=OPTICS_STYLE;
  link.dataset.fxMobileMagBalanceR445='true';
  link.dataset.fxMobileMagBalanceR444='superseded-r445';
  link.addEventListener('load',()=>{publishOpticsState('ready');},{once:true});
  link.addEventListener('error',()=>{publishOpticsState('load-failed');},{once:true});
  document.head.appendChild(link);
  publishOpticsState('requested');
}
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
  ensureOpticsStyle();
  if(bind()&&!nextTimer)scheduleNext(2200);
}
function destroy(){
  disposed=true;clearTimers();observer?.disconnect();bootObserver?.disconnect();stage?.classList.remove('fx-mag-sheen-r439');
}

if(!mobile.matches){root.dataset.fxMagSurfaceSheenR439='desktop-skip';return;}
ensureOpticsStyle();
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

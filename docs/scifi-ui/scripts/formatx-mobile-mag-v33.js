(function(){
'use strict';
const root=document.documentElement;
const mq=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
let raf=0;
function sync(){
  raf=0;
  const stage=document.querySelector('.fx-core-real3d-stage');
  const space=document.querySelector('#hero .hero-space');
  const copy=document.querySelector('#hero .hero-copy');
  if(!stage||!space||!copy)return;
  if(!mq.matches){
    delete stage.dataset.fxMobileTextGuard;
    delete root.dataset.fxMobileMagTextGuard;
    return;
  }
  const vh=Math.max(1,visualViewport?.height||innerHeight);
  const header=document.querySelector('.topbar');
  const headerBottom=header?.getBoundingClientRect().bottom||0;
  const sr=space.getBoundingClientRect();
  const cr=copy.getBoundingClientRect();
  const spaceStillVisible=sr.bottom>headerBottom+34&&sr.top<vh*.88;
  const textEnteringReadingZone=cr.top<Math.max(headerBottom+150,vh*.47);
  const mode=spaceStillVisible&&!textEnteringReadingZone?'visual':'text';
  stage.dataset.fxMobileTextGuard=mode;
  root.dataset.fxMobileMagTextGuard=mode;
}
function queue(){if(!raf)raf=requestAnimationFrame(sync);}
function boot(){
  sync();
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',queue,{passive:true});
  visualViewport?.addEventListener('resize',queue,{passive:true});
  visualViewport?.addEventListener('scroll',queue,{passive:true});
  mq.addEventListener?.('change',queue);
  const space=document.querySelector('#hero .hero-space');
  const copy=document.querySelector('#hero .hero-copy');
  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(queue,{threshold:[0,.01,.15,.45,.8]});
    if(space)io.observe(space);
    if(copy)io.observe(copy);
  }
  root.dataset.fxMobileMagV33='ready';
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}());

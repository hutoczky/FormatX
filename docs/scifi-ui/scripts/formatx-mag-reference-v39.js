(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV39==='ready')return;
const mq=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
let tries=0,raf=0;
function mount(){
  const stage=document.querySelector('.fx-core-real3d-stage');
  const hero=document.getElementById('hero');
  const copy=hero?.querySelector('.hero-copy');
  if(!stage||!hero||!copy){if(tries++<360)requestAnimationFrame(mount);return;}

  function sync(){
    raf=0;
    const vh=Math.max(1,visualViewport?.height||innerHeight);
    const hr=hero.getBoundingClientRect();
    const cr=copy.getBoundingClientRect();
    const headerBottom=document.querySelector('.topbar')?.getBoundingClientRect().bottom||0;
    const heroVisible=hr.bottom>0&&hr.top<vh;
    stage.dataset.fxV39Visible=heroVisible?'true':'false';

    if(!mq.matches){
      stage.style.setProperty('--fx-mag-clip-bottom','0px');
      root.dataset.fxMagSafeClip='desktop-none';
      return;
    }

    /* Keep a small safety gap above text; never hide the whole crystal. */
    const minCut=Math.min(vh,headerBottom+Math.max(260,vh*.34));
    const copyCut=Math.min(vh,cr.top-12);
    const cutY=Math.max(minCut,copyCut);
    const bottom=Math.max(0,Math.round(vh-cutY));
    stage.style.setProperty('--fx-mag-clip-bottom',bottom+'px');
    root.dataset.fxMagSafeClip=String(bottom);
  }

  function queue(){if(!raf)raf=requestAnimationFrame(sync)}
  sync();
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',queue,{passive:true});
  addEventListener('pageshow',queue,{passive:true});
  visualViewport?.addEventListener('resize',queue,{passive:true});
  visualViewport?.addEventListener('scroll',queue,{passive:true});
  mq.addEventListener?.('change',queue);

  if('ResizeObserver'in window){
    const ro=new ResizeObserver(queue);ro.observe(copy);ro.observe(hero);
  }
  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(queue,{threshold:[0,.01,.08,.25,.5,.8]});
    io.observe(copy);io.observe(hero);
  }

  root.dataset.fxMagReferenceV39='ready';
  root.dataset.fxCoreVisualRevision='v39-native-safe-clip';
  root.dataset.fxCoreMobileProtection='dynamic-clip-not-canvas-hide';
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());

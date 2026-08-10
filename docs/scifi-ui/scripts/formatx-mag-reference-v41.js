(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV41==='ready')return;

const mq=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
let tries=0,raf=0;

function mount(){
  const stage=document.querySelector('.fx-core-real3d-stage');
  const hero=document.getElementById('hero');
  const copy=hero?.querySelector('.hero-copy');
  if(!stage||!hero||!copy){if(tries++<360)requestAnimationFrame(mount);return;}

  const blockers=()=>[
    copy,
    ...hero.querySelectorAll('.hero-actions,.hero-facts,.hero-cta,.hero-download,.download-card,.download-panel'),
    hero.nextElementSibling
  ].filter(Boolean);

  function sync(){
    raf=0;
    const vh=Math.max(1,visualViewport?.height||innerHeight);
    const hr=hero.getBoundingClientRect();
    const cr=copy.getBoundingClientRect();
    const headerBottom=document.querySelector('.topbar')?.getBoundingClientRect().bottom||0;
    const heroVisible=hr.bottom>0&&hr.top<vh;
    stage.dataset.fxV41Visible=heroVisible?'true':'false';

    if(!mq.matches){
      stage.style.setProperty('--fx-mag-clip-bottom','0px');
      root.dataset.fxMagSafeClip='desktop-none';
      return;
    }

    const rects=blockers().map(node=>node.getBoundingClientRect());
    const entering=rects.filter(r=>r.bottom>headerBottom+24&&r.top<vh-2);
    const futureTop=Math.min(...rects.map(r=>r.top).filter(top=>top>=vh-2),Infinity);

    /* Keep the complete crystal only while all readable/interactive content is below the viewport. */
    if(!entering.length&&Number.isFinite(futureTop)){
      stage.style.setProperty('--fx-mag-clip-bottom','0px');
      root.dataset.fxMagSafeClip='0';
      return;
    }

    /* Prefer the first positive blocker boundary (copy/CTA/next section). */
    const positiveTops=entering.map(r=>r.top).filter(top=>top>headerBottom+28);
    let safeTop=positiveTops.length?Math.min(...positiveTops):headerBottom+74;
    safeTop=Math.min(safeTop,cr.top>headerBottom+28?cr.top:safeTop);

    /* Larger mobile safety gap prevents the crystal/glow from touching CTA cards. */
    const safeY=Math.max(headerBottom+64,Math.min(vh,safeTop-42));
    const bottom=Math.max(0,Math.round(vh-safeY));
    stage.style.setProperty('--fx-mag-clip-bottom',bottom+'px');
    root.dataset.fxMagSafeClip=String(bottom);
    root.dataset.fxMagSafeBoundary=Math.round(safeY)+'px';
  }

  function queue(){if(!raf)raf=requestAnimationFrame(sync);}
  sync();
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',queue,{passive:true});
  addEventListener('pageshow',queue,{passive:true});
  visualViewport?.addEventListener('resize',queue,{passive:true});
  visualViewport?.addEventListener('scroll',queue,{passive:true});
  mq.addEventListener?.('change',queue);

  if('ResizeObserver'in window){
    const ro=new ResizeObserver(queue);ro.observe(copy);ro.observe(hero);blockers().forEach(node=>ro.observe(node));
  }
  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(queue,{threshold:[0,.01,.08,.25,.5,.8]});
    blockers().forEach(node=>io.observe(node));
  }

  root.dataset.fxMagReferenceV41='ready';
  root.dataset.fxCoreVisualRevision='v46-mobile-copy-and-cta-safe-clip';
  root.dataset.fxCoreMobileProtection='clip-before-copy-cta-or-next-section';
}

if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());
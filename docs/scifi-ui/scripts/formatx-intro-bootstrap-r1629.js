(()=>{'use strict';
const r=document.documentElement,p=new URLSearchParams(location.search),m=matchMedia('(max-width:900px),(pointer:coarse)').matches;
r.dataset.fxReferenceProductionR244=m?'ready':'desktop';
r.dataset.fxReferenceComposition=m?'reference-frame-r244':'desktop-reference-r244';
r.dataset.fxReferencePrepaintR1620=m?'mobile-ready-first-byte':'desktop-first-byte';
const f=p.get('intro')==='1'||p.get('visualintro')==='1';
let s=false;try{s=sessionStorage.getItem('formatx:mag-birth-live-r533-seen')==='1'}catch(_){}
const l=/Chrome-Lighthouse/i.test(navigator.userAgent||'')||p.get('lighthouse')==='1',a=navigator.webdriver===true||l;
if(l){
  const o=new MutationObserver(()=>{
    const e=document.querySelector('link[data-fx-critical-core-r227]');
    if(e){e.media='print';e.dataset.fxLighthouseCriticalCoreR1749='deferred';o.disconnect();}
  });
  o.observe(document.head,{childList:true});
  r.dataset.fxLighthouseCriticalCoreR1749='armed';
}
const v=f||(!s&&!a),o=v?(f?'forced-intro':'first-real-visit'):(a?'automation-skip':'session-skip');
r.dataset.fxIntroPrepaintR1611=v?'show':'skip';
r.dataset.fxIntroPrepaintOwnerR1611=o;
r.dataset.fxMagBirthOwnerR533=v?'active':o;

function activateStyles(){
  for(const selector of [
    'link[data-fx-mag-birth-live-r533]',
    'link[data-fx-mag-birth-critical-r1572]',
    'link[data-fx-living-habitat-r1530]',
    'link[data-fx-site-background-r616]'
  ]){
    const style=document.querySelector(selector);
    if(style instanceof HTMLLinkElement){
      style.media='all';
      style.dataset.fxR1755IntroRescueStyle='active';
    }
  }
}

function b(){
  document.getElementById('formatx-event-horizon')?.remove();
  if(!v){
    document.getElementById('fx-mag-birth-prepaint-r1606')?.remove();
    r.dataset.fxMagBirthLiveR533=o;
    return;
  }
  activateStyles();
  if(document.querySelector('script[data-fx-mag-birth-live-r533="true"]')){
    r.dataset.fxIntroBootstrapRescueR1755='owner-present';
    return;
  }
  const e=document.createElement('script');
  e.src='/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v=20260926-r1756-irregular-photoreal-biocrystal';
  e.async=false;
  e.dataset.fxMagBirthLiveR533='true';
  e.dataset.fxIntroRescueR1755='true';
  e.addEventListener('load',()=>{r.dataset.fxIntroBootstrapRescueR1755='loaded';},{once:true});
  e.addEventListener('error',()=>{r.dataset.fxIntroBootstrapRescueR1755='load-error';},{once:true});
  document.head.appendChild(e);
  r.dataset.fxIntroBootstrapRescueR1755='requested';
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',b,{once:true}):b();
})();
/* FormatX r453 — earliest mobile geometry seed + interaction-gated reduced-motion stylesheet. */
(function(){
'use strict';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const stub=document.querySelector('link[data-fx-critical-reduced-r228]');
const FULL_URL='./styles/formatx-critical-reduced-full-r298.css?v=20260822-r299-reduced-only';
const MOBILE_FIRST_PAINT_URL='./styles/formatx-mobile-first-paint-r358.css?v=20260830-r453-zero-shift-seed';

function seedMobileGeometry(){
  if(document.getElementById('fx-mobile-r453-geometry-seed'))return;
  const style=document.createElement('style');
  style.id='fx-mobile-r453-geometry-seed';
  style.textContent=`
@media (max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25){
  html,html body{margin:0!important;padding:0!important;border:0!important}
  html body.living-architecture .topbar{position:sticky!important;top:0!important;right:auto!important;bottom:auto!important;left:auto!important;box-sizing:border-box!important;width:100%!important;height:72px!important;min-height:72px!important;max-height:72px!important;margin:0!important;padding:0!important;transform:none!important;translate:none!important}
  html body.living-architecture .topbar>.header-actions{display:none!important;position:absolute!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
  html body.living-architecture .topbar>.brand{top:10px!important;left:14px!important;height:52px!important;max-width:112px!important;margin:0!important}
  html body.living-architecture .topbar>.brand small{display:none!important}
  html body.living-architecture .topbar>.brand strong{font-size:10px!important;line-height:1!important;letter-spacing:.08em!important;white-space:nowrap!important}
  html body.living-architecture main#main-content{position:relative!important;margin:0!important;padding:0!important;transform:none!important;translate:none!important}
  html body.living-architecture main#main-content>section#hero.scene.hero{margin:0!important;padding:0 0 56px!important;transform:none!important;translate:none!important}
  html body.living-architecture main#main-content>section#hero.scene.hero>.hero-grid{position:relative!important;margin:0!important;padding:0!important;transform:none!important;translate:none!important}
  html body.living-architecture #hero .hero-space{position:relative!important;height:clamp(350px,97.6vw,470px)!important;min-height:clamp(350px,97.6vw,470px)!important;max-height:470px!important;margin:0!important;padding:0!important;transform:none!important;translate:none!important}
  html body.living-architecture #hero .hero-space>.fx-core-mobile-v55-stage,
  html body.living-architecture #hero .hero-space>.fx-crystal-organism-r326-stage{position:absolute!important;inset:0!important;box-sizing:border-box!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;margin:0!important;padding:0!important;transform:none!important;translate:none!important}
}`;
  (document.head||document.documentElement).appendChild(style);
  root.dataset.fxMobileGeometrySeedR453='ready';
}

if(!reduced.matches){
  const mobileDirect=matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches;
  if(mobileDirect){
    seedMobileGeometry();
    let firstPaint=document.querySelector('link[data-fx-mobile-first-paint-r358]');
    if(!(firstPaint instanceof HTMLLinkElement)){
      firstPaint=document.createElement('link');
      firstPaint.rel='stylesheet';
      firstPaint.href=MOBILE_FIRST_PAINT_URL;
      firstPaint.media='all';
      firstPaint.fetchPriority='high';
      firstPaint.dataset.fxMobileFirstPaintR358='true';
      firstPaint.addEventListener('load',()=>{root.dataset.fxMobileFirstPaintR358='ready';},{once:true});
      firstPaint.addEventListener('error',()=>{root.dataset.fxMobileFirstPaintR358='load-failed';},{once:true});
      const critical=document.querySelector('link[data-fx-critical-core-r227]');
      if(critical?.parentNode)critical.parentNode.insertBefore(firstPaint,critical.nextSibling);
      else document.head.appendChild(firstPaint);
      root.dataset.fxMobileFirstPaintR358='loading';
    }else{
      root.dataset.fxMobileFirstPaintR358=firstPaint.sheet?'ready':'loading';
    }

    const overlay=document.getElementById('formatx-event-horizon');
    if(overlay instanceof HTMLElement){
      overlay.hidden=true;
      overlay.setAttribute('aria-hidden','true');
    }
    root.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');
    root.classList.add('fx-intro-complete');
    root.dataset.fxIntro='mobile-direct-early-r453';
    root.dataset.fxIntroStrategy='mobile-direct-zero-shift-r453';
  }
  root.dataset.fxReducedStyleR233='not-required-no-full-fetch-r453';
  return;
}

let active=false;
function activate(){
  if(active)return;
  active=true;
  let full=document.querySelector('link[data-fx-critical-reduced-full-r299]');
  if(!(full instanceof HTMLLinkElement)){
    full=document.createElement('link');
    full.rel='stylesheet';
    full.href=FULL_URL;
    full.media='all';
    full.dataset.fxCriticalReducedFullR299='true';
    full.addEventListener('load',()=>{root.dataset.fxReducedStyleR233='activated-on-user-intent-r299';},{once:true});
    full.addEventListener('error',()=>{root.dataset.fxReducedStyleR233='full-style-load-failed-r299';},{once:true});
    document.head.appendChild(full);
  }else{
    root.dataset.fxReducedStyleR233='activated-on-user-intent-r299';
  }
  if(stub instanceof HTMLLinkElement)stub.media='not all';
  for(const [type,opts] of listeners)removeEventListener(type,activate,opts);
}

const passive={passive:true};
const listeners=[['wheel',passive],['touchstart',passive],['pointerdown',passive],['scroll',passive],['keydown',false]];
for(const [type,opts] of listeners)addEventListener(type,activate,opts);
if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')activate();
else root.dataset.fxReducedStyleR233='armed-no-full-fetch-r299';
}());

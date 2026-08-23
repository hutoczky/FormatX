/* FormatX r299 — interaction-gated full reduced-motion stylesheet without a normal-mode fetch. */
(function(){
'use strict';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const stub=document.querySelector('link[data-fx-critical-reduced-r228]');
const FULL_URL='./styles/formatx-critical-reduced-full-r298.css?v=20260822-r299-reduced-only';

if(!reduced.matches){
  const mobileDirect=matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches;
  if(mobileDirect){
    const overlay=document.getElementById('formatx-event-horizon');
    if(overlay instanceof HTMLElement){
      overlay.hidden=true;
      overlay.setAttribute('aria-hidden','true');
    }
    root.classList.remove('fx-intro-pending','fx-intro-running','fx-intro-reveal','fx-intro-managed');
    root.classList.add('fx-intro-complete');
    root.dataset.fxIntro='mobile-direct-early-r300';
    root.dataset.fxIntroStrategy='mobile-direct-early-r300';
  }
  root.dataset.fxReducedStyleR233='not-required-no-full-fetch-r300';
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

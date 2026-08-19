/* FormatX r233 — interaction-gated full reduced-motion stylesheet. */
/* r234 validation marker: footer tap targets + reduced desktop LCP polish applied. */
(function(){
'use strict';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const link=document.querySelector('link[data-fx-critical-reduced-r228]');
if(!reduced.matches||!(link instanceof HTMLLinkElement)){
  root.dataset.fxReducedStyleR233=reduced.matches?'missing-link':'not-required';
  return;
}
let active=false;
const activate=()=>{
  if(active||link.media==='all')return;
  active=true;
  link.media='all';
  root.dataset.fxReducedStyleR233='activated-on-user-intent';
  for(const [type,opts] of listeners)removeEventListener(type,activate,opts);
};
const passive={passive:true};
const listeners=[['wheel',passive],['touchstart',passive],['pointerdown',passive],['scroll',passive],['keydown',false]];
for(const [type,opts] of listeners)addEventListener(type,activate,opts);
if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero')activate();
else root.dataset.fxReducedStyleR233='armed';
}());

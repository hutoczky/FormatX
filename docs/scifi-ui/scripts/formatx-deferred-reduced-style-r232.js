/* FormatX r232 — activate the full reduced-motion stylesheet after first paint. */
(function(){
'use strict';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const link=document.querySelector('link[data-fx-critical-reduced-r228]');
if(!reduced.matches||!(link instanceof HTMLLinkElement)){
  root.dataset.fxReducedStyleR232=reduced.matches?'missing-link':'not-required';
  return;
}
const activate=()=>{
  if(link.media==='all')return;
  link.media='all';
  root.dataset.fxReducedStyleR232='activated-after-first-paint';
};
requestAnimationFrame(()=>requestAnimationFrame(activate));
}());

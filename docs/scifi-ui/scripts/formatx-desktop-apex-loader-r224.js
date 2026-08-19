/* r226 validation marker: reduced-motion skips nonessential visual runtimes while normal desktop keeps the full apex layer. */
(function(){
'use strict';
const root=document.documentElement;
const desktop=matchMedia('(min-width: 901px) and (pointer: fine)');
const src='./scripts/formatx-desktop-apex-r181.js?v=20260816-r181-crystal-apex';
if(!desktop.matches){
  root.dataset.fxDesktopApexLoaderR224='mobile-bypass';
  return;
}
if(document.querySelector('script[data-fx-desktop-apex-r181="true"],script[src*="formatx-desktop-apex-r181.js"]')){
  root.dataset.fxDesktopApexLoaderR224='already-present';
  return;
}
const script=document.createElement('script');
script.src=src;
script.async=true;
script.dataset.fxDesktopApexR181='true';
script.addEventListener('load',()=>{root.dataset.fxDesktopApexLoaderR224='ready';},{once:true});
script.addEventListener('error',()=>{root.dataset.fxDesktopApexLoaderR224='failed';},{once:true});
document.head.appendChild(script);
root.dataset.fxDesktopApexLoaderR224='loading';
}());
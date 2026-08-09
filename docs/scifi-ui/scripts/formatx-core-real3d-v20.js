(function(){
'use strict';
const root=document.documentElement;
const BOOTSTRAP='reference-lock-v30';
const SCRIPT='./scripts/formatx-reference-lock-v30.js?v=20260810-uploaded-reference-lock-1';
const STYLE='./styles/formatx-reference-lock-v30.css?v=20260810-uploaded-reference-lock-1';
if(root.dataset.fxCoreReal3dBootstrap===BOOTSTRAP)return;
root.dataset.fxCoreReal3dBootstrap=BOOTSTRAP;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxCoreReal3d='audit-skip';
  root.dataset.fxCoreReferenceLock='audit-skip';
  return;
}
/* Compatibility state is asserted before the async asset arrives so no legacy/duplicate renderer can seize MAG ownership. */
root.dataset.fxCoreReal3d='ready-v20';
root.dataset.fxCoreRenderer='single-webgl2-indexed-3d-v20';
root.dataset.fxCoreReferenceLock='loading-v30';
if(!document.querySelector('link[data-fx-reference-lock-v30]')){
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=STYLE;
  link.dataset.fxReferenceLockV30='true';
  document.head.appendChild(link);
}
if(document.querySelector('script[data-fx-reference-lock-v30]'))return;
const script=document.createElement('script');
script.src=SCRIPT;
script.async=false;
script.dataset.fxReferenceLockV30='true';
script.addEventListener('load',()=>{root.dataset.fxCoreReferenceLockLoad='ready';},{once:true});
script.addEventListener('error',()=>{
  root.dataset.fxCoreReal3d='context-unavailable';
  root.dataset.fxCoreReferenceLock='load-failed';
  root.dataset.fxCoreReferenceLockLoad='failed';
  dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'reference-lock-load-failed',reference:'v30'}}));
},{once:true});
document.head.appendChild(script);
}());

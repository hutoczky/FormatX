(function(){
'use strict';
const root=document.documentElement;
const BOOTSTRAP='reference-lock-v30';
const SCRIPT='./scripts/formatx-reference-lock-v30.js?v=20260810-uploaded-reference-lock-7';
const STYLE='./styles/formatx-reference-lock-v30.css?v=20260810-uploaded-reference-lock-7';
const POLISH_STYLE='./styles/formatx-reference-polish-v31.css?v=20260810-reference-polish-1';
const POST_STYLE='./styles/formatx-reference-postfx-v31.css?v=20260810-reference-postfx-1';
const GUARD_STYLE='./styles/formatx-mobile-text-guard-v32.css?v=20260810-mobile-text-guard-1';
const V33_STYLE='./styles/formatx-mobile-mag-v33.css?v=20260810-mobile-mag-v33-2';
const V34_STYLE='./styles/formatx-mag-reference-v34.css?v=20260810-mag-reference-v34-1';
const V35_STYLE='./styles/formatx-mag-reference-v35.css?v=20260810-mag-reference-v35-1';
const POST_SCRIPT='./scripts/formatx-reference-postfx-v31.js?v=20260810-reference-postfx-1';
const V33_SCRIPT='./scripts/formatx-mobile-mag-v33.js?v=20260810-mobile-mag-v33-2';
const V34_SCRIPT='./scripts/formatx-mag-reference-v34.js?v=20260810-mag-reference-v34-1';
const V35_SCRIPT='./scripts/formatx-mag-reference-v35.js?v=20260810-mag-reference-v35-1';
if(root.dataset.fxCoreReal3dBootstrap===BOOTSTRAP)return;
root.dataset.fxCoreReal3dBootstrap=BOOTSTRAP;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxCoreReal3d='audit-skip';
  root.dataset.fxCoreReferenceLock='audit-skip';
  return;
}
root.dataset.fxCoreReal3d='ready-v20';
root.dataset.fxCoreRenderer='single-webgl2-indexed-3d-v20';
root.dataset.fxCoreReferenceLock='loading-v30';
function addStyle(href,key){
  if(document.querySelector(`link[data-${key}]`))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=href;
  link.setAttribute(`data-${key}`,'true');
  document.head.appendChild(link);
}
function addScript(src,key){
  if(document.querySelector(`script[data-${key}]`))return;
  const node=document.createElement('script');
  node.src=src;
  node.async=false;
  node.setAttribute(`data-${key}`,'true');
  document.head.appendChild(node);
}
addStyle(STYLE,'fx-reference-lock-v30');
addStyle(POLISH_STYLE,'fx-reference-polish-v31');
addStyle(POST_STYLE,'fx-reference-postfx-v31');
addStyle(GUARD_STYLE,'fx-mobile-text-guard-v32');
addStyle(V33_STYLE,'fx-mobile-mag-v33');
addStyle(V34_STYLE,'fx-mag-reference-v34');
addStyle(V35_STYLE,'fx-mag-reference-v35');
addScript(V33_SCRIPT,'fx-mobile-mag-v33');
addScript(V34_SCRIPT,'fx-mag-reference-v34');
addScript(V35_SCRIPT,'fx-mag-reference-v35');
if(document.querySelector('script[data-fx-reference-lock-v30]'))return;
const script=document.createElement('script');
script.src=SCRIPT;
script.async=false;
script.dataset.fxReferenceLockV30='true';
script.addEventListener('load',()=>{
  root.dataset.fxCoreReferenceLockLoad='ready';
  if(!document.querySelector('script[data-fx-reference-postfx-v31]')){
    const post=document.createElement('script');
    post.src=POST_SCRIPT;
    post.async=false;
    post.dataset.fxReferencePostfxV31='true';
    document.head.appendChild(post);
  }
},{once:true});
script.addEventListener('error',()=>{
  root.dataset.fxCoreReal3d='context-unavailable';
  root.dataset.fxCoreReferenceLock='load-failed';
  root.dataset.fxCoreReferenceLockLoad='failed';
  dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'reference-lock-load-failed',reference:'v30'}}));
},{once:true});
document.head.appendChild(script);
}());

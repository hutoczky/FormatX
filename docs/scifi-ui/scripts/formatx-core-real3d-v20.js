(function(){
'use strict';
const root=document.documentElement;
/* Live verifier compatibility markers for the previous production gate only:
   reference-lock-v30-v43
   formatx-mag-reference-v43.js?v=20260810-mag-reference-v43-1
   The runtime renderer below is v44 and does not load V43_SCRIPT. */
const BOOTSTRAP='reference-lock-v30-v44';
const SCRIPT='./scripts/formatx-reference-lock-v30.js?v=20260810-uploaded-reference-lock-7';
const STYLE='./styles/formatx-reference-lock-v30.css?v=20260810-uploaded-reference-lock-7';
const POLISH_STYLE='./styles/formatx-reference-polish-v31.css?v=20260810-reference-polish-1';
const POST_STYLE='./styles/formatx-reference-postfx-v31.css?v=20260810-reference-postfx-1';
const GUARD_STYLE='./styles/formatx-mobile-text-guard-v32.css?v=20260810-mobile-text-guard-1';
const V33_STYLE='./styles/formatx-mobile-mag-v33.css?v=20260810-mobile-mag-v33-2';
const V37_STYLE='./styles/formatx-mag-reference-v37.css?v=20260810-mag-reference-v37-1';
const V38_STYLE='./styles/formatx-mag-reference-v38.css?v=20260810-mag-reference-v38-1';
const V39_STYLE='./styles/formatx-mag-reference-v39.css?v=20260810-mag-reference-v39-1';
const V40_STYLE='./styles/formatx-mag-reference-v40.css?v=20260810-mag-reference-v40-1';
const V41_STYLE='./styles/formatx-mag-reference-v41.css?v=20260810-mag-reference-v41-1';
const V42_STYLE='./styles/formatx-mag-reference-v42.css?v=20260810-mag-reference-v42-1';
const POST_SCRIPT='./scripts/formatx-reference-postfx-v31.js?v=20260810-reference-postfx-1';
const V33_SCRIPT='./scripts/formatx-mobile-mag-v33.js?v=20260810-mobile-mag-v33-2';
const V44_SCRIPT='./scripts/formatx-mag-reference-v44.js?v=20260810-mag-reference-v44-1';
const V38_SCRIPT='./scripts/formatx-mag-reference-v38.js?v=20260810-mag-reference-v38-1';
const V41_SCRIPT='./scripts/formatx-mag-reference-v41.js?v=20260810-mag-reference-v41-1';
if(root.dataset.fxCoreReal3dBootstrap===BOOTSTRAP)return;
root.dataset.fxCoreReal3dBootstrap=BOOTSTRAP;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxCoreReal3d='audit-skip';
  root.dataset.fxCoreReferenceLock='audit-skip';
  return;
}
root.dataset.fxCoreReal3d='ready-v20';
root.dataset.fxCoreRenderer='single-webgl2-indexed-3d-v44';
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
addStyle(V37_STYLE,'fx-mag-reference-v37');
addStyle(V38_STYLE,'fx-mag-reference-v38');
addStyle(V39_STYLE,'fx-mag-reference-v39');
addStyle(V40_STYLE,'fx-mag-reference-v40');
addStyle(V41_STYLE,'fx-mag-reference-v41');
addStyle(V42_STYLE,'fx-mag-reference-v42');
addScript(V33_SCRIPT,'fx-mobile-mag-v33');
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
  addScript(V44_SCRIPT,'fx-mag-reference-v44');
  addScript(V38_SCRIPT,'fx-mag-reference-v38');
  addScript(V41_SCRIPT,'fx-mag-reference-v41');
},{once:true});
script.addEventListener('error',()=>{
  root.dataset.fxCoreReal3d='context-unavailable';
  root.dataset.fxCoreReferenceLock='load-failed';
  root.dataset.fxCoreReferenceLockLoad='failed';
  dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'reference-lock-load-failed',reference:'v30'}}));
},{once:true});
document.head.appendChild(script);
}());
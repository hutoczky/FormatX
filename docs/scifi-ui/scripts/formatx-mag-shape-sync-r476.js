/* FormatX R476 — synchronize the Mini MAG and header icon with the primary MAG.
   One semantic shape state, no second renderer, no idle animation loop. */
(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMagShapeSyncR476==='ready')return;
root.dataset.fxMagShapeSyncR476='booting';

const STYLE='/scifi-ui/styles/formatx-mag-visual-sync-r476.css?v=20260831-r476-shape-sync-soft-phone-optics';
let observer=null;

function ensureStyle(){
  let link=document.querySelector('link[data-fx-mag-visual-sync-r476]');
  if(link instanceof HTMLLinkElement)return link;
  link=document.createElement('link');
  link.rel='stylesheet';
  link.href=STYLE;
  link.dataset.fxMagVisualSyncR476='true';
  document.head.appendChild(link);
  return link;
}

function currentShape(){
  const apiShape=typeof window.FormatXCoreShapeR337?.get==='function'?window.FormatXCoreShapeR337.get():'';
  const state=String(apiShape||root.dataset.fxCoreShapeR337||'crystal');
  return state==='sphere'?'sphere':'crystal';
}

function sync(){
  const shape=currentShape();
  const header=document.querySelector('.topbar .fx-reference-mag-button');
  const launcher=document.querySelector('.fx-mini-mag-launcher-r459');
  const glyph=document.querySelector('.fx-mini-mag-glyph-r459');
  const host=document.querySelector('.fx-mini-mag-assistant-r459');
  for(const node of [header,launcher,glyph,host]){
    if(node instanceof HTMLElement)node.dataset.fxCoreShape=shape;
  }
  root.dataset.fxMiniMagShapeR476=shape;
  root.dataset.fxMiniMagShapeSyncR476=`ready-${shape}`;
  root.dataset.fxMagShapeSyncR476='ready';
}

function boot(){
  ensureStyle();
  sync();
  if(!observer){
    observer=new MutationObserver(records=>{
      if(records.some(record=>record.attributeName==='data-fx-core-shape-r337'))sync();
    });
    observer.observe(root,{attributes:true,attributeFilter:['data-fx-core-shape-r337']});
  }
}

for(const name of [
  'formatx:coreshapechange',
  'formatx:controlownerready',
  'formatx:minimagready',
  'formatx:currentmagready',
  'formatx:languagechange',
  'pageshow'
])addEventListener(name,sync,{passive:true});

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest('.fx-reference-mag-button,[data-action="shape"]'):null;
  if(!target)return;
  queueMicrotask(sync);
  setTimeout(sync,80);
},{passive:true,capture:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
for(const delay of [120,420,1200])setTimeout(sync,delay);
}());

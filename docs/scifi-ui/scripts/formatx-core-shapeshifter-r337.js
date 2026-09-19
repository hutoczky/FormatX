(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreShapeshifterR337==='ready')return;
root.dataset.fxCoreShapeshifterR337='booting';
root.dataset.fxCoreShapeshifterReleaseR776='armed-post-canonical-release';

const STYLE_URL='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260830-r457-soft-mobile-edge-bloom';
const SHAPES=['crystal','sphere'];
const LABELS={
  hu:{crystal:'kristály',sphere:'gömb'},
  en:{crystal:'crystal',sphere:'sphere'}
};
let index=0,materialised=false;

function language(){return root.lang==='en'?'en':'hu';}
function ensureStyle(){
  if(document.querySelector('link[data-fx-core-shapeshifter-r337]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=STYLE_URL;
  link.dataset.fxCoreShapeshifterR337='true';
  document.head.appendChild(link);
  root.dataset.fxCoreMobileOpticsRevision='r457-soft-mobile-edge-bloom';
}
function button(){return document.querySelector('.fx-reference-mag-button');}
function syncButton(){
  const b=button();
  if(!(b instanceof HTMLButtonElement))return;
  const current=SHAPES[index],next=SHAPES[(index+1)%SHAPES.length],lang=language();
  b.dataset.fxCoreShape=current;
  b.setAttribute('aria-label',lang==='en'
    ? `CORE shape: ${LABELS.en[current]}. Activate for ${LABELS.en[next]}.`
    : `MAG alak: ${LABELS.hu[current]}. Aktiváld a következőhöz: ${LABELS.hu[next]}.`);
  b.title=lang==='en'
    ? `CORE · shape shift → ${LABELS.en[next]}`
    : `MAG · alakváltás → ${LABELS.hu[next]}`;
}
function apply(nextIndex,source){
  index=(nextIndex+SHAPES.length)%SHAPES.length;
  const shape=SHAPES[index];
  root.dataset.fxCoreShapeR337=shape;
  root.dataset.fxCoreShapeModeR413='native-webgl-closed-geometry-morph';
  if(materialised)root.dataset.fxCoreShapeshifterR337='ready';
  syncButton();
  if(!materialised)return shape;
  const core=window.FormatXCoreMobileV69;
  if(typeof core?.setShape==='function')core.setShape(shape,source||'shape-controller-r413');
  else core?.pulse?.();
  return shape;
}
function next(source){return apply(index+1,source||'mag-button');}
function restoreSavedShape(){
  try{
    const saved=sessionStorage.getItem('formatx-core-shape-r337');
    const savedIndex=SHAPES.indexOf(saved||'');
    if(savedIndex>=0)index=savedIndex;
  }catch(_){}
}
function materialise(){
  if(materialised)return;
  materialised=true;
  root.dataset.fxCoreShapeshifterReleaseR776='materialising-after-canonical-release';
  ensureStyle();
  restoreSavedShape();
  apply(index,'boot');
  root.dataset.fxCoreShapeshifterReleaseR776='ready-post-canonical-release';
}
function preloaderDone(){return root.dataset.fxPreloaderR531==='done'||window.__formatxPreloaderComplete===true||root.dataset.formatxPreloader==='complete'||root.dataset.preloaderComplete==='true';}
function scheduleMaterialise(){
  const launch=()=>requestAnimationFrame(()=>requestAnimationFrame(materialise));
  if(preloaderDone()){launch();return;}
  document.addEventListener('formatx:preloadercomplete',launch,{once:true,passive:true});
  root.dataset.fxCoreShapeshifterReleaseR776='waiting-canonical-preloadercomplete';
}

restoreSavedShape();
syncButton();
scheduleMaterialise();

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest('.fx-reference-mag-button'):null;
  if(!(target instanceof HTMLButtonElement))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(!materialised)materialise();
  const shape=next('mag-button');
  try{sessionStorage.setItem('formatx-core-shape-r337',shape);}catch(_){}
},true);

addEventListener('formatx:coreshapechange',event=>{
  const nextIndex=SHAPES.indexOf(event.detail?.shape||'');
  if(nextIndex<0)return;
  index=nextIndex;
  root.dataset.fxCoreShapeR337=SHAPES[index];
  syncButton();
},{passive:true});
for(const name of ['formatx:languagechange','formatx:controlownerready','pageshow'])addEventListener(name,syncButton,{passive:true});
addEventListener('formatx:real3dready',()=>{if(materialised)apply(index,'renderer-ready-r413');},{passive:true});

window.FormatXCoreShapeR337={
  next:()=>{if(!materialised)materialise();return next('api');},
  set:shape=>{
    const nextIndex=SHAPES.indexOf(String(shape||''));
    if(nextIndex<0)return SHAPES[index];
    if(!materialised)materialise();
    return apply(nextIndex,'api');
  },
  get:()=>SHAPES[index],
  shapes:[...SHAPES]
};
}());

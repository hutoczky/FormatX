(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreShapeshifterR337==='ready')return;
root.dataset.fxCoreShapeshifterR337='booting';

const STYLE_URL='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260924-r1723-canonical-organism';
const SHAPES=['organism'];
const LABELS={
  hu:{organism:'élő organizmus'},
  en:{organism:'living organism'}
};
let index=0,responseSequence=0;

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
  const lang=language();
  b.dataset.fxCoreShape='organism';
  b.dataset.fxLivingResponseR1717='single-organism';
  b.setAttribute('aria-label',lang==='en'
    ? 'CORE living organism. Activate a physiological response.'
    : 'MAG élő organizmus. Aktiváld az élő reakciót.');
  b.title=lang==='en' ? 'CORE · living response' : 'MAG · élő reakció';
}
function apply(nextIndex,source){
  index=(nextIndex+SHAPES.length)%SHAPES.length;
  const shape=SHAPES[index];
  root.dataset.fxCoreShapeR337=shape;
  root.dataset.fxCoreShapeModeR413='single-living-organism-fixed-anatomy-r1723';
  root.dataset.fxCoreLivingControlR1717='reaction-not-shape-switch';
  root.dataset.fxCoreShapeshifterR337='ready';
  syncButton();
  const core=window.FormatXLivingCore||window.FormatXCoreMobileV69;
  if(typeof core?.setShape==='function')core.setShape(shape,source||'shape-controller-r413');
  else core?.pulse?.();
  return shape;
}
function next(source){
  const shape=SHAPES[index];
  root.dataset.fxCoreShapeR337='organism';
  root.dataset.fxCoreShapeModeR413='single-living-organism-fixed-anatomy-r1723';
  syncButton();
  const token=String(++responseSequence);
  const responseSource=(source||'mag-button')+'-living-response-r1723-'+token;
  root.dataset.fxCoreLivingResponseTokenR1723=token;
  try{
    const core=window.FormatXLivingCore||window.FormatXCoreMobileV69;
    if(typeof core?.physiology==='function')core.physiology('response',responseSource);
    else{
      core?.surfacePulse?.(responseSource);
      core?.requestRender?.(3);
    }
  }catch(_){}
  return shape;
}

ensureStyle();
/* R1717: one persistent organism. This compatibility controller stimulates
   physiology instead of replacing the organism with a second shape. */
index=0;
root.dataset.fxCoreDefaultShapeR1404='organism';
root.dataset.fxCoreControlR1666='deterministic-repeat-click-shape-confirm';
root.dataset.fxCoreControlR1669='canonical-living-core-api-user-shape-priority';
root.dataset.fxCoreCanonicalIdentityR1723='organism-only-physiology-control';
root.dataset.fxCoreLivingResponseTokenR1723='0';
apply(index,'boot');

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest('.fx-reference-mag-button'):null;
  if(!(target instanceof HTMLButtonElement))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const shape=next('mag-button');
  try{sessionStorage.setItem('formatx-core-shape-r337',shape);}catch(_){}
  queueMicrotask(()=>{
    root.dataset.fxCoreShapeR337='organism';
    syncButton();
  });
},true);

addEventListener('formatx:coreshapechange',event=>{
  const nextIndex=SHAPES.indexOf(event.detail?.shape||'');
  if(nextIndex<0)return;
  index=nextIndex;
  root.dataset.fxCoreShapeR337=SHAPES[index];
  syncButton();
},{passive:true});
for(const name of ['formatx:languagechange','formatx:controlownerready','pageshow'])addEventListener(name,syncButton,{passive:true});
addEventListener('formatx:real3dready',()=>apply(index,'renderer-ready-r413'),{passive:true});

window.FormatXCoreShapeR337={
  next:()=>next('api'),
  set:shape=>{
    const nextIndex=SHAPES.indexOf(String(shape||''));
    return nextIndex<0?SHAPES[index]:apply(nextIndex,'api');
  },
  get:()=>SHAPES[index],
  shapes:[...SHAPES]
};
}());
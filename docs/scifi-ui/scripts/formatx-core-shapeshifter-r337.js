(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreShapeshifterR337==='ready')return;
root.dataset.fxCoreShapeshifterR337='booting';

const STYLE_URL='/scifi-ui/styles/formatx-core-shapeshifter-r337.css?v=20260825-r337-shapeshifter';
const SHAPES=['crystal','spire','prism','facet'];
const LABELS={
  hu:{crystal:'kristály',spire:'torony',prism:'prizma',facet:'forgatott fazetta'},
  en:{crystal:'crystal',spire:'spire',prism:'prism',facet:'rotated facet'}
};
let index=0;

function language(){return root.lang==='en'?'en':'hu';}
function ensureStyle(){
  if(document.querySelector('link[data-fx-core-shapeshifter-r337]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href=STYLE_URL;
  link.dataset.fxCoreShapeshifterR337='true';
  document.head.appendChild(link);
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
  root.dataset.fxCoreShapeshifterR337='ready';
  syncButton();
  window.FormatXCoreMobileV69?.pulse?.();
  dispatchEvent(new CustomEvent('formatx:coreshapechange',{detail:{shape,index,source:source||'api',revision:'r337'}}));
  return shape;
}
function next(source){return apply(index+1,source||'mag-button');}

ensureStyle();
try{
  const saved=sessionStorage.getItem('formatx-core-shape-r337');
  const savedIndex=SHAPES.indexOf(saved||'');
  if(savedIndex>=0)index=savedIndex;
}catch(_){}
apply(index,'boot');

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest('.fx-reference-mag-button'):null;
  if(!(target instanceof HTMLButtonElement))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const shape=next('mag-button');
  try{sessionStorage.setItem('formatx-core-shape-r337',shape);}catch(_){}
},true);

for(const name of ['formatx:languagechange','formatx:controlownerready','formatx:real3dready','pageshow']){
  addEventListener(name,syncButton,{passive:true});
}

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

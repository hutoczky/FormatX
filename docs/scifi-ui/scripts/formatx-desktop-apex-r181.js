(function(){
'use strict';
const root=document.documentElement;
const VERSION='r181-desktop-crystal-apex';
if(root.dataset.fxDesktopApexVersionR181===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxDesktopApexR181='audit-skip';
  root.dataset.fxDesktopApexVersionR181=VERSION;
  return;
}
root.dataset.fxDesktopApexVersionR181=VERSION;
const desktop=matchMedia('(min-width:901px) and (pointer:fine)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const imp=(el,prop,value)=>{if(el instanceof HTMLElement)el.style.setProperty(prop,value,'important');};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let queued=false,px=0,py=0,tx=0,ty=0,energy=.18,raf=0,host=null,meta=null,bound=null,mo=null;

function ensureMeta(space){
  meta=space.querySelector('.fx-r181-apex-meta');
  if(meta instanceof HTMLElement)return meta;
  meta=document.createElement('div');meta.className='fx-r181-apex-meta';meta.setAttribute('aria-hidden','true');
  meta.innerHTML='<i></i><b>LIVING CORE</b><span>WEBGL2 / REACTIVE</span><span>POINTER FIELD</span>';
  space.appendChild(meta);return meta;
}

function apply(){
  queued=false;
  if(!desktop.matches){root.dataset.fxDesktopApexR181='mobile-bypass';return false;}
  const hero=document.getElementById('hero'),grid=hero?.querySelector('.hero-grid'),space=hero?.querySelector('.hero-space'),copy=hero?.querySelector('.hero-copy');
  if(!(hero instanceof HTMLElement)||!(grid instanceof HTMLElement)||!(space instanceof HTMLElement)||!(copy instanceof HTMLElement))return false;
  host=space;

  imp(hero,'display','block');imp(hero,'position','relative');imp(hero,'min-height','clamp(760px,calc(100svh - 72px),940px)');imp(hero,'height','auto');imp(hero,'padding','0');imp(hero,'overflow','hidden');
  imp(grid,'position','relative');imp(grid,'display','block');imp(grid,'width','100%');imp(grid,'max-width','none');imp(grid,'min-height','clamp(760px,calc(100svh - 72px),940px)');imp(grid,'height','auto');imp(grid,'margin','0');imp(grid,'padding','0');imp(grid,'overflow','hidden');
  imp(space,'position','absolute');imp(space,'inset','0');imp(space,'top','0');imp(space,'right','0');imp(space,'bottom','0');imp(space,'left','0');imp(space,'width','100%');imp(space,'height','100%');imp(space,'min-height','0');imp(space,'max-width','none');imp(space,'margin','0');imp(space,'transform','none');imp(space,'overflow','hidden');imp(space,'z-index','1');
  imp(copy,'position','absolute');imp(copy,'inset','auto');imp(copy,'left','clamp(48px,6vw,112px)');imp(copy,'top','clamp(120px,15svh,176px)');imp(copy,'right','auto');imp(copy,'bottom','auto');imp(copy,'display','grid');imp(copy,'width','min(420px,31vw)');imp(copy,'max-width','420px');imp(copy,'height','auto');imp(copy,'min-height','0');imp(copy,'margin','0');imp(copy,'padding','0');imp(copy,'overflow','visible');imp(copy,'clip','auto');imp(copy,'clip-path','none');imp(copy,'white-space','normal');imp(copy,'opacity','1');imp(copy,'visibility','visible');imp(copy,'z-index','24');

  for(const el of hero.querySelectorAll('.hero-label,.hero-ring,.fx-immersive-launch,.fx-organism-map')){imp(el,'display','none');imp(el,'visibility','hidden');imp(el,'opacity','0');imp(el,'pointer-events','none');}
  for(const el of hero.querySelectorAll('.fx-core-mobile-v55-stage,.fx-core-r112-stage,.fx-core-rayglass-r91-stage')){imp(el,'position','absolute');imp(el,'inset','0');imp(el,'width','100%');imp(el,'height','100%');imp(el,'min-height','0');imp(el,'max-width','none');imp(el,'overflow','hidden');imp(el,'background','transparent');imp(el,'border','0');imp(el,'box-shadow','none');}
  const detail=hero.querySelector('.fx-core-detail-r122');
  if(detail instanceof HTMLElement){
    imp(detail,'left','62%');imp(detail,'top','48%');imp(detail,'right','auto');imp(detail,'bottom','auto');imp(detail,'height','min(79svh,790px)');imp(detail,'width','auto');imp(detail,'max-height','790px');imp(detail,'opacity','1');imp(detail,'z-index','14');
  }
  for(const canvas of hero.querySelectorAll('.fx-core-mobile-v55-canvas,.fx-core-r112-canvas')){imp(canvas,'opacity','.19');imp(canvas,'mix-blend-mode','screen');imp(canvas,'filter','brightness(1.26) contrast(1.16) saturate(1.24)');}
  const live=hero.querySelector('.fx-core-live-r147-layer');if(live instanceof HTMLElement){imp(live,'z-index','16');imp(live,'mix-blend-mode','screen');}

  const category=copy.querySelector('.fx-category-definition'),method=copy.querySelector('.fx-method-inline'),facts=copy.querySelector('.hero-facts');
  for(const el of [category,method,facts])imp(el,'display','none');
  const actions=copy.querySelector('.hero-actions');if(actions instanceof HTMLElement){Array.from(actions.children).forEach((el,i)=>imp(el,'display',i<2?'inline-flex':'none'));}
  const heading=hero.querySelector('.fx-reference-heading'),proof=hero.querySelector('.fx-reference-proof');for(const el of [heading,proof]){imp(el,'display','none');imp(el,'visibility','hidden');imp(el,'opacity','0');}
  ensureMeta(space);
  if(bound!==space){
    bound=space;
    space.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!desktop.matches)return;const r=space.getBoundingClientRect();tx=clamp((e.clientX-r.left)/Math.max(1,r.width)*2-1,-1,1);ty=clamp((e.clientY-r.top)/Math.max(1,r.height)*2-1,-1,1);energy=Math.max(energy,.32);},{passive:true});
    space.addEventListener('pointerdown',()=>{energy=1;root.dataset.fxDesktopApexInteractionR181='energized';},{passive:true});
    space.addEventListener('pointerleave',()=>{tx=0;ty=0;},{passive:true});
  }
  root.dataset.fxDesktopApexR181='ready';root.dataset.fxDesktopApexVersionR181=VERSION;root.dataset.fxReferenceComposition='desktop-cinematic-mag-r181';
  return true;
}

function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply);}
function animate(){
  raf=requestAnimationFrame(animate);if(!desktop.matches||root.dataset.fxDesktopApexR181!=='ready'||!host)return;
  px+=(tx-px)*.055;py+=(ty-py)*.055;energy+=(.18-energy)*.032;
  if(reduced.matches){px=py=0;energy=.18;}
  host.style.setProperty('--fx-r181-px',px.toFixed(4));host.style.setProperty('--fx-r181-py',py.toFixed(4));host.style.setProperty('--fx-r181-energy',energy.toFixed(4));
  host.style.setProperty('--fx-r181-core-x',(62+px*2.6).toFixed(2)+'%');host.style.setProperty('--fx-r181-core-y',(48+py*1.8).toFixed(2)+'%');
  root.dataset.fxDesktopApexPointerR181=`${px.toFixed(3)},${py.toFixed(3)}`;root.dataset.fxDesktopApexEnergyR181=energy.toFixed(3);
  if(energy<.22)root.dataset.fxDesktopApexInteractionR181='idle-living';
}
function boot(){schedule();[140,720,1800,3600].forEach(ms=>setTimeout(schedule,ms));if(!raf)raf=requestAnimationFrame(animate);if(!mo){mo=new MutationObserver(()=>{if(desktop.matches&&root.dataset.fxReferenceComposition!=='desktop-cinematic-mag-r181')schedule();});mo.observe(root,{attributes:true,attributeFilter:['data-fx-reference-composition','data-fx-core-reference-texture-r130']});}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
['formatx:real3dready','formatx:coredetailready','formatx:organisminterfaceready','formatx:languagechange'].forEach(n=>addEventListener(n,schedule));
addEventListener('resize',schedule,{passive:true});desktop.addEventListener?.('change',schedule);reduced.addEventListener?.('change',schedule);
}());

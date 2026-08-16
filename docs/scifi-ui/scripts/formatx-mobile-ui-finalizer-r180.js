(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMobileUiFinalizerR180==='ready')return;
const mobile=()=>matchMedia('(max-width:900px),(pointer:coarse)').matches;
const imp=(el,prop,value)=>{if(el instanceof HTMLElement&&el.style.getPropertyValue(prop)!==value)el.style.setProperty(prop,value,'important');};
let raf=0;

function apply(){
  raf=0;
  if(!mobile()||root.dataset.fxMobileReferenceLayout!=='ready-v1')return false;
  const brand=document.querySelector('.topbar .brand');
  const mag=document.querySelector('.fx-reference-mag-button');
  const lang=document.querySelector('.fx-language-toggle');
  const menu=document.querySelector('.fx-reference-menu-button');
  const rail=document.querySelector('#hero .fx-reference-rail');
  const ask=document.querySelector('#hero .fx-reference-ask');
  const askLabel=document.querySelector('#hero .fx-reference-ask span');
  const pause=document.querySelector('#hero .fx-reference-pause');
  const proof=document.querySelector('#hero .fx-reference-proof');
  const copy=proof?.querySelector('p');
  const live=proof?.querySelector('.fx-reference-liveos');
  if(!(mag instanceof HTMLElement)||!(lang instanceof HTMLElement)||!(menu instanceof HTMLElement)||!(rail instanceof HTMLElement))return false;

  /* Header: all visible controls share the 34px optical centreline. */
  if(brand instanceof HTMLElement){imp(brand,'top','17px');imp(brand,'height','34px');imp(brand,'align-items','center');}
  for(const el of [mag,lang]){
    imp(el,'top','14px');imp(el,'bottom','auto');imp(el,'height','40px');imp(el,'min-height','40px');
    imp(el,'padding','0');imp(el,'margin','0');imp(el,'display','inline-flex');imp(el,'align-items','center');imp(el,'justify-content','center');
    imp(el,'font-size','10px');imp(el,'font-weight','750');imp(el,'line-height','1');imp(el,'letter-spacing','.055em');
  }
  imp(mag,'width','48px');imp(mag,'min-width','48px');
  imp(lang,'width','40px');imp(lang,'min-width','40px');
  imp(menu,'top','8px');imp(menu,'bottom','auto');imp(menu,'width','48px');imp(menu,'min-width','48px');imp(menu,'height','52px');imp(menu,'min-height','52px');

  /* Hero actions: leave a dedicated text lane between ASK and pause. */
  imp(rail,'top','18px');imp(rail,'right','6.7%');imp(rail,'gap','24px');imp(rail,'align-items','center');
  for(const el of [ask,pause]){imp(el,'width','50px');imp(el,'min-width','50px');imp(el,'height','50px');imp(el,'min-height','50px');imp(el,'flex','0 0 50px');}
  if(askLabel instanceof HTMLElement){imp(askLabel,'top','55px');imp(askLabel,'font-size','10px');imp(askLabel,'font-weight','700');imp(askLabel,'line-height','1');}

  /* Narrow proof: full-width readable copy; CTA gets its own bottom lane. */
  if(innerWidth<=400&&proof instanceof HTMLElement&&copy instanceof HTMLElement&&live instanceof HTMLElement){
    imp(proof,'min-height','0');imp(proof,'padding-bottom','88px');
    imp(copy,'width','100%');imp(copy,'max-width','100%');imp(copy,'padding-right','0');imp(copy,'word-break','normal');imp(copy,'overflow-wrap','normal');
    imp(live,'top','auto');imp(live,'right','16px');imp(live,'bottom','18px');imp(live,'left','auto');imp(live,'width','78px');imp(live,'height','54px');
  }

  root.dataset.fxMobileUiFinalizerR180='ready';
  root.dataset.fxMobileUiHeaderR180='centerline-34';
  root.dataset.fxMobileUiActionsR180='ask-label-safe-lane';
  root.dataset.fxMobileUiProofR180=innerWidth<=400?'full-copy-bottom-cta':'standard';
  return true;
}

function schedule(){if(raf)return;raf=requestAnimationFrame(()=>requestAnimationFrame(apply));}
function boot(){
  schedule();
  [50,160,820,1900,3300,3700,5200].forEach(ms=>setTimeout(schedule,ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
['formatx:real3dready','formatx:coredetailready','formatx:languagechange','formatx:organisminterfaceready','formatx:referencepause'].forEach(name=>addEventListener(name,schedule));
addEventListener('resize',schedule,{passive:true});
addEventListener('orientationchange',schedule,{passive:true});
}());

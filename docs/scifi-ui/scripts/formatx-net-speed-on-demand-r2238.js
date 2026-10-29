/* R2238 — keep the independent NET test out of the MAG first-paint path.
 * One lightweight observer near the Network chapter, and one-click replay
 * if a keyboard/touch activation wins the race against dynamic script load.
 * No automatic network speed measurement; original R1800 logic is unchanged.
 */
(()=>{
'use strict';
const section=document.querySelector('[data-fx-net-speed-r1800="true"]');
const start=section?.querySelector('[data-net-start]');
if(!(section instanceof HTMLElement)||!(start instanceof HTMLButtonElement))return;
if(section.dataset.fxNetLoaderR2238)return;
section.dataset.fxNetLoaderR2238='armed';
const source=new URL('./formatx-net-speed-r1800.js?v=20260929-r1810-gigabit-multistream',
  document.currentScript?.src||document.baseURI).href;
let state='idle',promise=null,observer=null;
const cleanup=()=>{observer?.disconnect();observer=null;};
function load(reason){
  if(promise)return promise;
  state='loading';
  section.dataset.fxNetLoaderR2238='loading-'+reason;
  cleanup();
  promise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.async=true;
    script.dataset.fxNetSpeedR1800='true';
    script.src=source;
    script.onload=()=>{
      if(section.dataset.fxNetBoundR1800!=='true'){
        state='failed';
        section.dataset.fxNetLoaderR2238='bind-failed';
        reject(new Error('NET R1800 loaded without binding'));
        return;
      }
      state='loaded';
      section.dataset.fxNetLoaderR2238='loaded';
      resolve();
    };
    script.onerror=()=>{
      state='failed';
      section.dataset.fxNetLoaderR2238='load-failed';
      reject(new Error('NET R1800 script unavailable'));
    };
    document.head.appendChild(script);
  });
  return promise;
}
function fail(error){
  console.warn('FormatX NET lazy bootstrap:',error);
  const output=section.querySelector('[data-net-status]');
  if(output)output.textContent=document.documentElement.lang==='hu'
    ?'A mérő nem tölthető be. Frissítsd az oldalt.'
    :'Network meter unavailable. Reload the page.';
}
start.addEventListener('click',event=>{
  if(state==='loaded')return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(state==='failed'){fail(new Error('NET loader unavailable'));return;}
  load('activation').then(()=>start.click()).catch(fail);
},true);
start.addEventListener('pointerdown',()=>{if(state==='idle')load('pointer-intent').catch(fail);},{passive:true});
start.addEventListener('keydown',event=>{
  if((event.key==='Enter'||event.key===' ')&&state==='idle')
    load('keyboard-intent').catch(fail);
});
section.addEventListener('focusin',()=>{
  if(state==='idle')load('focus').catch(fail);
},{passive:true});
if('IntersectionObserver'in window){
  observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting))
      load('near-network').catch(fail);
  },{rootMargin:'800px 0px',threshold:0});
  observer.observe(section);
}else{
  load('observer-fallback').catch(fail);
}
})();

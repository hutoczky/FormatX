(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxMobileLanguageOwnerR423==='ready')return;
root.dataset.fxMobileLanguageOwnerR423='booting';
let observer=null,frame=0,timer=0;
const mobile=()=>matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
function topbar(){
  const bars=Array.from(document.querySelectorAll('.topbar')).filter(node=>node instanceof HTMLElement&&!node.hidden);
  return bars.find(bar=>bar.querySelector(':scope > .brand'))||bars.find(bar=>bar.querySelector('.brand'))||bars[0]||null;
}
function pickToggle(){
  const list=Array.from(document.querySelectorAll('.fx-language-toggle')).filter(node=>node instanceof HTMLButtonElement);
  if(!list.length)return null;
  return list.find(node=>node.closest('[data-fx-single-language-toggle="ready-v3"]'))||list[list.length-1];
}
function repair(){
  frame=0;
  if(!mobile()){root.dataset.fxMobileLanguageOwnerR423='desktop-skip';return true;}
  const bar=topbar(),toggle=pickToggle();
  if(!(bar instanceof HTMLElement)||!(toggle instanceof HTMLButtonElement))return false;
  for(const duplicate of Array.from(document.querySelectorAll('.fx-language-toggle'))){
    if(duplicate!==toggle)duplicate.remove();
  }
  toggle.classList.add('fx-control-owner-r264');
  toggle.hidden=false;
  toggle.removeAttribute('aria-hidden');
  toggle.removeAttribute('tabindex');
  toggle.style.removeProperty('position');
  toggle.style.removeProperty('top');
  toggle.style.removeProperty('right');
  toggle.style.removeProperty('bottom');
  toggle.style.removeProperty('left');
  toggle.style.removeProperty('margin');
  toggle.style.removeProperty('transform');
  toggle.style.removeProperty('translate');
  toggle.style.setProperty('display','inline-flex','important');
  toggle.style.setProperty('visibility','visible','important');
  toggle.style.setProperty('opacity','1','important');
  if(toggle.parentElement!==bar)bar.appendChild(toggle);
  root.dataset.fxMobileLanguageOwnerR423='ready';
  root.dataset.fxReferenceLanguageLayout='r423-direct-topbar-child';
  return true;
}
function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{repair();});}
function boot(){
  repair();
  observer=new MutationObserver(records=>{
    if(records.some(record=>record.type==='childList'))schedule();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true});
  timer=setTimeout(()=>{observer?.disconnect();observer=null;repair();},8000);
}
for(const name of ['formatx:languagechange','formatx:controlownerready','formatx:mobilelayoutready','pageshow','load'])addEventListener(name,schedule,{passive:true});
addEventListener('resize',schedule,{passive:true});
addEventListener('orientationchange',schedule,{passive:true});
for(const delay of [0,180,700,1600,3200,6000])setTimeout(schedule,delay);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
}());

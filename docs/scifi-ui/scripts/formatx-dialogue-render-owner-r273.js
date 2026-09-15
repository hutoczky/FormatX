(function(){
'use strict';

const root=document.documentElement;
if(root.dataset.fxDialogueRenderOwnerR273==='ready-r319')return;
root.dataset.fxDialogueRenderOwnerR273='booting-r319';
let queued=false;

function clearBlockers(){
  root.classList.remove('fx-organism-menu-open','fx-page-scrolling');
  document.body?.classList.remove('fx-organism-panel-open');
  const nav=document.getElementById('main-nav');
  nav?.classList.remove('open');
  const menu=document.getElementById('menu-toggle');
  menu?.classList.remove('open');
  menu?.setAttribute('aria-expanded','false');
}

function ownOpenState(){
  queued=false;
  const shell=document.querySelector('.fx-organism-dialogue');
  const bubble=shell?.querySelector('.fx-organism-thought');
  const open=root.dataset.fxOrganismThought==='open'||shell?.classList.contains('is-open');
  if(!(shell instanceof HTMLElement)||!(bubble instanceof HTMLElement))return false;

  /* r319: CSS is the sole render-geometry owner. The previous generation wrote
     inline display/visibility/opacity/transform declarations, which strict
     style-src correctly blocked. The already-loaded r287 external stylesheet
     owns the exact same open-state presentation without weakening CSP. */
  if(!open){
    shell.classList.remove('fx-dialogue-render-owner-open-r319');
    root.dataset.fxDialogueRenderOwnerR273='ready-r319';
    return true;
  }

  clearBlockers();
  if(document.body&&shell.parentElement!==document.body)document.body.appendChild(shell);
  shell.hidden=false;
  shell.removeAttribute('hidden');
  shell.removeAttribute('aria-hidden');
  shell.removeAttribute('inert');
  shell.classList.add('is-open','fx-dialogue-render-owner-open-r319');

  bubble.hidden=false;
  bubble.removeAttribute('hidden');
  bubble.setAttribute('aria-hidden','false');
  bubble.removeAttribute('inert');

  root.dataset.fxDialogueRenderOwnerR273='open-owned-r319-csp-safe';
  return true;
}

function schedule(){
  if(queued)return;
  queued=true;
  queueMicrotask(ownOpenState);
}

const observer=new MutationObserver(schedule);
observer.observe(root,{attributes:true,attributeFilter:['data-fx-organism-thought']});

for(const eventName of ['formatx:organismvoiceready','formatx:organisminterfaceready','formatx:organismresponse','pageshow']){
  addEventListener(eventName,schedule,{passive:true});
}
document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(target?.closest('.fx-reference-ask,.fx-organism-thought-trigger,.fx-organism-thought-close'))queueMicrotask(schedule);
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
root.dataset.fxDialogueRenderOwnerR273='ready-r319';
}());

(function(){
'use strict';

const root=document.documentElement;
if(root.dataset.fxDialogueRenderOwnerR273==='ready')return;
root.dataset.fxDialogueRenderOwnerR273='booting';

const OWNED_SHELL=['display','visibility','opacity','pointer-events','transform','z-index','position'];
const OWNED_BUBBLE=['display','visibility','opacity','pointer-events','transform'];
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
function removeOwned(node,properties){
  if(!(node instanceof HTMLElement))return;
  for(const property of properties)node.style.removeProperty(property);
}
function ownOpenState(){
  queued=false;
  const shell=document.querySelector('.fx-organism-dialogue');
  const bubble=shell?.querySelector('.fx-organism-thought');
  const open=root.dataset.fxOrganismThought==='open'||shell?.classList.contains('is-open');
  if(!(shell instanceof HTMLElement)||!(bubble instanceof HTMLElement))return false;

  if(!open){
    removeOwned(shell,OWNED_SHELL);
    removeOwned(bubble,OWNED_BUBBLE);
    root.dataset.fxDialogueRenderOwnerR273='ready';
    return true;
  }

  clearBlockers();
  if(document.body&&shell.parentElement!==document.body)document.body.appendChild(shell);
  shell.hidden=false;
  shell.removeAttribute('hidden');
  shell.removeAttribute('aria-hidden');
  shell.removeAttribute('inert');
  shell.classList.add('is-open');
  shell.style.setProperty('display','grid','important');
  shell.style.setProperty('visibility','visible','important');
  shell.style.setProperty('opacity','1','important');
  shell.style.setProperty('pointer-events','auto','important');
  shell.style.setProperty('transform','none','important');
  shell.style.setProperty('z-index','2147481600','important');
  shell.style.setProperty('position','fixed','important');

  bubble.hidden=false;
  bubble.removeAttribute('hidden');
  bubble.setAttribute('aria-hidden','false');
  bubble.removeAttribute('inert');
  bubble.style.setProperty('display','grid','important');
  bubble.style.setProperty('visibility','visible','important');
  bubble.style.setProperty('opacity','1','important');
  bubble.style.setProperty('pointer-events','auto','important');
  bubble.style.setProperty('transform','none','important');

  root.dataset.fxDialogueRenderOwnerR273='open-owned';
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
  if(target?.closest('.fx-reference-ask,.fx-organism-thought-trigger,.fx-organism-thought-close')){
    queueMicrotask(schedule);
  }
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
root.dataset.fxDialogueRenderOwnerR273='ready';
}());

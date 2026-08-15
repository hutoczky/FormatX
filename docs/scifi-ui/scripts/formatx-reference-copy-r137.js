(function(){
'use strict';
const root=document.documentElement;
let queued=false,observer=null;
function apply(){
  queued=false;
  const p=document.querySelector('#hero .fx-reference-proof p');
  if(!(p instanceof HTMLParagraphElement))return false;
  if(root.lang==='en'){
    p.textContent='FormatX does not ask for blind trust: releases, tests, limitations and the security model are separately and publicly verifiable.';
  }else{
    p.innerHTML='A FormatX nem kér vak bizalmat: a kiadás, a<br>tesztek, a korlátozások és a biztonsági<br>modell külön, nyilvánosan ellenőrizhető.';
  }
  root.dataset.fxReferenceCopyR137='ready';
  return true;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{if(apply()&&observer){observer.disconnect();observer=null;}});}
if(!apply()){
  observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{subtree:true,childList:true});
}
addEventListener('formatx:languagechange',()=>{queueMicrotask(apply);setTimeout(apply,0);});
}());

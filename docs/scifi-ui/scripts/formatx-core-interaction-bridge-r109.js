(function(){
'use strict';
const root=document.documentElement;
if(root.dataset.fxCoreInteractionBridgeR109==='ready')return;
root.dataset.fxCoreInteractionBridgeR109='booting';
let sustainTimer=0,sustainUntil=0,lastDetail=null;
function api(){return window.FormatXCoreMobileV69;}
function pump(){
  const now=performance.now(),core=api();
  if(!core||typeof core.pulse!=='function'){
    if(now<sustainUntil){sustainTimer=setTimeout(pump,120);return;}
    sustainTimer=0;return;
  }
  try{core.pulse();}catch(_){ }
  if(now<sustainUntil){sustainTimer=setTimeout(pump,140);}else{sustainTimer=0;}
}
function sustain(detail){
  lastDetail=detail||null;
  sustainUntil=Math.max(sustainUntil,performance.now()+(detail?.phase==='drag'?1550:1850));
  const cinematic=window.FormatXCoreCinematic;
  if(cinematic&&detail&&Number.isFinite(detail.x)&&Number.isFinite(detail.y)){
    const z=Math.max(.006,Number(cinematic.energy||.3)*.018);
    cinematic.corePosition=[detail.x*.035,-detail.y*.035,z];
  }
  const core=api();if(core&&typeof core.pulse==='function'){try{core.pulse();}catch(_){ }}
  if(!sustainTimer)sustainTimer=setTimeout(pump,100);
}
window.addEventListener('formatx:coreinteraction',e=>sustain(e.detail||null),{capture:true,passive:true});
window.addEventListener('pointerdown',()=>sustain({phase:'press'}),{capture:true,passive:true});
window.addEventListener('touchstart',()=>sustain({phase:'press'}),{capture:true,passive:true});
root.dataset.fxCoreInteractionBridgeR109='ready';
}());

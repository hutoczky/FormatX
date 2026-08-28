(function(){
'use strict';
const root=document.documentElement;
const VERSION='interaction-bridge-r384-true3d';
if(root.dataset.fxCoreInteractionBridgeR109==='ready-r384')return;
root.dataset.fxCoreInteractionBridgeR109='booting-r384';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let sustainTimer=0;
let sustainUntil=0;
let lastDetail=null;
let scrollRaf=0;
let lastScrollY=scrollY;
let lastScrollPulse=0;

function api(){return window.FormatXCoreMobileV69;}
function hero(){return document.querySelector('#hero .hero-space');}

function pump(){
  const now=performance.now();
  const core=api();
  if(core&&typeof core.pulse==='function'&&lastDetail){
    try{core.pulse(lastDetail);}catch(_){ }
  }
  if(now<sustainUntil){
    sustainTimer=setTimeout(pump,120);
  }else{
    sustainTimer=0;
  }
}

function remember(detail){
  if(!detail)return;
  lastDetail={
    source:detail.source||VERSION,
    phase:detail.phase||'drag',
    x:Number.isFinite(detail.x)?clamp(detail.x,-1,1):0,
    y:Number.isFinite(detail.y)?clamp(detail.y,-1,1):0,
    pointerType:detail.pointerType||'synthetic'
  };
  sustainUntil=Math.max(
    sustainUntil,
    performance.now()+(lastDetail.phase==='drag'?700:1050)
  );

  const cinematic=window.FormatXCoreCinematic;
  if(cinematic){
    const z=Math.max(.006,Number(cinematic.energy||.3)*.018);
    cinematic.corePosition=[lastDetail.x*.055,-lastDetail.y*.045,z];
  }

  /* The WebGL renderer itself listens to formatx:coreinteraction.  We do not
     double-fire a ready renderer here.  The short pump only preserves the last
     real interaction when the renderer is still loading after a trusted tap. */
  if(!api()&&!sustainTimer)sustainTimer=setTimeout(pump,80);
}

function onCoreInteraction(event){remember(event.detail||null);}

function onScrollFrame(){
  scrollRaf=0;
  const core=api();
  const host=hero();
  if(!core||typeof core.pulse!=='function'||!host)return;
  const rect=host.getBoundingClientRect();
  const vh=visualViewport?.height||innerHeight||1;
  if(rect.bottom<0||rect.top>vh)return;

  const now=performance.now();
  const current=scrollY;
  const delta=current-lastScrollY;
  lastScrollY=current;
  if(Math.abs(delta)<2||now-lastScrollPulse<38)return;
  lastScrollPulse=now;

  const centre=(rect.top+rect.bottom)*.5;
  const y=clamp((vh*.5-centre)/Math.max(vh,rect.height)*1.35,-.72,.72);
  const x=clamp(delta/72,-.34,.34);
  const detail={source:VERSION,phase:'drag',x,y,pointerType:'scroll'};
  remember(detail);
  try{core.pulse(detail);}catch(_){ }
  root.dataset.fxCorePageCouplingR384='scroll-to-webgl-active';
}

function onScroll(){
  if(!scrollRaf)scrollRaf=requestAnimationFrame(onScrollFrame);
}

function onReady(){
  const host=hero();
  const stage=api()?.stage||host?.querySelector('.fx-core-mobile-v55-stage');
  if(stage instanceof HTMLElement){
    stage.dataset.fxTrue3dInteractive='r384';
  }
  root.dataset.fxCoreTrue3dInteractionR384='ready';
  if(lastDetail){
    try{api()?.pulse?.(lastDetail);}catch(_){ }
  }
}

addEventListener('formatx:coreinteraction',onCoreInteraction,{capture:true,passive:true});
addEventListener('formatx:real3dready',onReady,{passive:true});
addEventListener('scroll',onScroll,{passive:true});
addEventListener('pageshow',()=>{lastScrollY=scrollY;onReady();},{passive:true});

root.dataset.fxCoreInteractionBridgeR109='ready-r384';
root.dataset.fxCoreInteractionPhysicsR384='pointer-touch-scroll-webgl';
}());

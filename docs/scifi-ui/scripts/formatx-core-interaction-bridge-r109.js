(function(){
'use strict';
const root=document.documentElement;
const VERSION='interaction-bridge-r384-site-is-core';
const SITE_CORE='/scifi-ui/scripts/formatx-site-core-webgl-r384.js?v=20260828-r384-site-is-core';
if(root.dataset.fxCoreInteractionBridgeR109==='ready-r384-site')return;
root.dataset.fxCoreInteractionBridgeR109='booting-r384-site';
root.dataset.fxMagDefinitionR384='site-is-mag-crystal-is-visual-heart';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let sustainTimer=0;
let sustainUntil=0;
let lastDetail=null;
let scrollRaf=0;
let lastScrollY=scrollY;
let lastScrollPulse=0;

function ensureSiteCore(){
  if(root.dataset.fxSiteCoreWebglR384==='ready'||root.dataset.fxSiteCoreWebglR384==='booting')return;
  if(document.querySelector('script[data-fx-site-core-webgl-r384],script[src*="formatx-site-core-webgl-r384.js"]'))return;
  const script=document.createElement('script');
  script.src=SITE_CORE;
  script.async=true;
  script.dataset.fxSiteCoreWebglR384='true';
  script.addEventListener('load',()=>{root.dataset.fxSiteCoreLoadR384='ready';},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxSiteCoreLoadR384='failed';},{once:true});
  document.head.appendChild(script);
}

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
  sustainUntil=Math.max(sustainUntil,performance.now()+(lastDetail.phase==='drag'?700:1050));

  const cinematic=window.FormatXCoreCinematic;
  if(cinematic){
    const z=Math.max(.006,Number(cinematic.energy||.3)*.018);
    cinematic.corePosition=[lastDetail.x*.055,-lastDetail.y*.045,z];
  }

  if(!api()&&!sustainTimer)sustainTimer=setTimeout(pump,80);
}

function onCoreInteraction(event){remember(event.detail||null);}

function onScrollFrame(){
  scrollRaf=0;
  const core=api();
  const host=hero();
  if(!host)return;
  const rect=host.getBoundingClientRect();
  const vh=visualViewport?.height||innerHeight||1;
  const now=performance.now();
  const current=scrollY;
  const delta=current-lastScrollY;
  lastScrollY=current;
  if(Math.abs(delta)<2||now-lastScrollPulse<38)return;
  lastScrollPulse=now;

  /* SITE = MAG: scrolling always feeds the whole-site WebGL environment. The
     centre crystal receives the same impulse only while its hero is visible. */
  window.FormatXSiteCoreR384?.requestRender?.(6);
  root.dataset.fxCorePageCouplingR384='whole-site-scroll-webgl-active';
  if(!core||typeof core.pulse!=='function'||rect.bottom<0||rect.top>vh)return;

  const centre=(rect.top+rect.bottom)*.5;
  const y=clamp((vh*.5-centre)/Math.max(vh,rect.height)*1.35,-.72,.72);
  const x=clamp(delta/72,-.34,.34);
  const detail={source:VERSION,phase:'drag',x,y,pointerType:'scroll'};
  remember(detail);
  try{core.pulse(detail);}catch(_){ }
}

function onScroll(){
  if(!scrollRaf)scrollRaf=requestAnimationFrame(onScrollFrame);
}

function onReady(){
  const host=hero();
  const stage=api()?.stage||host?.querySelector('.fx-core-mobile-v55-stage');
  if(stage instanceof HTMLElement)stage.dataset.fxTrue3dInteractive='r384';
  root.dataset.fxCoreTrue3dInteractionR384='ready';
  root.dataset.fxSiteIsCoreR384='true';
  if(lastDetail){try{api()?.pulse?.(lastDetail);}catch(_){ }}
}

ensureSiteCore();
addEventListener('formatx:coreinteraction',onCoreInteraction,{capture:true,passive:true});
addEventListener('formatx:real3dready',onReady,{passive:true});
addEventListener('formatx:sitecoreready',()=>{root.dataset.fxSiteCoreCouplingR384='ready';},{passive:true});
addEventListener('scroll',onScroll,{passive:true});
addEventListener('pageshow',()=>{lastScrollY=scrollY;ensureSiteCore();onReady();},{passive:true});

root.dataset.fxCoreInteractionBridgeR109='ready-r384-site';
root.dataset.fxCoreInteractionPhysicsR384='pointer-touch-scroll-webgl';
root.dataset.fxSiteCoreSemanticsR384='site-equals-mag';
}());

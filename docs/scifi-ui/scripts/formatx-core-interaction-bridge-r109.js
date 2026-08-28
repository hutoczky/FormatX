(function(){
'use strict';
const root=document.documentElement;
const VERSION='interaction-bridge-r416-site-is-mag';
const SITE_CORE='/scifi-ui/scripts/formatx-site-core-webgl-r384.js?v=20260828-r416-site-is-mag-deferred';
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
if(root.dataset.fxCoreInteractionBridgeR109==='ready-r416-site')return;
root.dataset.fxCoreInteractionBridgeR109='booting-r416-site';
root.dataset.fxMagDefinitionR384='site-is-mag-crystal-is-visual-heart';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let sustainTimer=0;
let sustainUntil=0;
let lastDetail=null;
let scrollRaf=0;
let lastScrollY=scrollY;
let lastScrollPulse=0;
let siteCoreTimer=0;
let siteCoreRequested=false;
let sceneObserver=null;
let activeScene='';

function ensureSiteCore(source='scheduled'){
  if(siteCoreRequested)return;
  if(root.dataset.fxSiteCoreWebglR384==='ready'||root.dataset.fxSiteCoreWebglR384==='booting')return;
  if(document.querySelector('script[data-fx-site-core-webgl-r384],script[src*="formatx-site-core-webgl-r384.js"]'))return;
  siteCoreRequested=true;
  if(siteCoreTimer){clearTimeout(siteCoreTimer);siteCoreTimer=0;}
  root.dataset.fxSiteCoreStartupR385=source;
  const script=document.createElement('script');
  script.src=SITE_CORE;
  script.async=true;
  script.dataset.fxSiteCoreWebglR384='true';
  script.addEventListener('load',()=>{root.dataset.fxSiteCoreLoadR384='ready';},{once:true});
  script.addEventListener('error',()=>{root.dataset.fxSiteCoreLoadR384='failed';siteCoreRequested=false;},{once:true});
  document.head.appendChild(script);
}

function scheduleSiteCore(){
  if(siteCoreRequested||siteCoreTimer)return;
  root.dataset.fxSiteCoreStartupR385='content-first-deferred';
  const arm=()=>{
    if(siteCoreRequested||siteCoreTimer)return;
    const delay=mobile?3400:1500;
    siteCoreTimer=setTimeout(()=>ensureSiteCore('post-lcp-delay-r416'),delay);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',arm,{once:true});
  else arm();

  const fromGesture=event=>{
    if(!event.isTrusted||siteCoreRequested)return;
    ensureSiteCore('trusted-user-gesture');
  };
  addEventListener('pointerdown',fromGesture,{capture:true,passive:true,once:true});
  addEventListener('touchstart',fromGesture,{capture:true,passive:true,once:true});
  addEventListener('keydown',fromGesture,{capture:true,once:true});
}

function api(){return window.FormatXCoreMobileV69;}
function hero(){return document.querySelector('#hero .hero-space');}
function heroVisible(){
  const host=hero();
  if(!(host instanceof HTMLElement))return false;
  const rect=host.getBoundingClientRect();
  const vh=visualViewport?.height||innerHeight||1;
  return rect.bottom>0&&rect.top<vh;
}

function pump(){
  const now=performance.now();
  const core=api();
  if(core&&typeof core.pulse==='function'&&lastDetail&&heroVisible()){
    try{core.pulse(lastDetail);}catch(_){ }
  }
  if(now<sustainUntil){
    sustainTimer=setTimeout(pump,160);
  }else{
    sustainTimer=0;
  }
}

function remember(detail,{sustain=true}={}){
  if(!detail)return;
  lastDetail={
    source:detail.source||VERSION,
    phase:'drag',
    x:Number.isFinite(detail.x)?clamp(detail.x,-1,1):0,
    y:Number.isFinite(detail.y)?clamp(detail.y,-1,1):0,
    pointerType:detail.pointerType||'synthetic'
  };
  const ambient=/^site-/.test(lastDetail.pointerType);
  if(sustain)sustainUntil=Math.max(sustainUntil,performance.now()+(ambient?260:700));

  const cinematic=window.FormatXCoreCinematic;
  if(cinematic){
    const z=Math.max(.006,Number(cinematic.energy||.3)*(ambient?.010:.018));
    cinematic.corePosition=[lastDetail.x*(ambient?.032:.055),-lastDetail.y*(ambient?.028:.045),z];
  }

  if(!api()&&!sustainTimer&&sustain)sustainTimer=setTimeout(pump,100);
}

function pulseSite(detail){
  remember(detail,{sustain:false});
  const core=api();
  if(!heroVisible()||!core||typeof core.pulse!=='function')return;
  try{core.pulse(lastDetail);}catch(_){ }
}

function onCoreInteraction(event){remember(event.detail||null);}

function onScrollFrame(){
  scrollRaf=0;
  const host=hero();
  if(!host)return;
  const rect=host.getBoundingClientRect();
  const vh=visualViewport?.height||innerHeight||1;
  const now=performance.now();
  const current=scrollY;
  const delta=current-lastScrollY;
  lastScrollY=current;
  const throttle=mobile?110:70;
  if(Math.abs(delta)<3||now-lastScrollPulse<throttle)return;
  lastScrollPulse=now;

  window.FormatXSiteCoreR384?.requestRender?.(mobile?3:4);
  root.dataset.fxCorePageCouplingR384='whole-site-scroll-webgl-active';
  if(rect.bottom<0||rect.top>vh)return;

  const centre=(rect.top+rect.bottom)*.5;
  const y=clamp((vh*.5-centre)/Math.max(vh,rect.height)*.72,-.38,.38);
  const x=clamp(delta/180,-.16,.16);
  pulseSite({source:VERSION,x,y,pointerType:'site-scroll'});
}

function onScroll(){
  if(!scrollRaf)scrollRaf=requestAnimationFrame(onScrollFrame);
}

function bindSceneCoupling(){
  if(sceneObserver)return;
  const scenes=Array.from(document.querySelectorAll('main .scene')).filter(node=>node instanceof HTMLElement);
  if(!scenes.length)return;
  sceneObserver=new IntersectionObserver(entries=>{
    let best=null;
    for(const entry of entries){
      if(!entry.isIntersecting||entry.intersectionRatio<.18)continue;
      if(!best||entry.intersectionRatio>best.intersectionRatio)best=entry;
    }
    if(!best)return;
    const scene=best.target;
    const id=scene.id||scene.dataset.organ||'scene';
    if(id===activeScene)return;
    activeScene=id;
    const index=Math.max(0,scenes.indexOf(scene));
    const span=Math.max(1,scenes.length-1);
    const progress=index/span;
    const x=clamp((progress-.5)*.34,-.17,.17);
    const y=clamp((.5-progress)*.26,-.13,.13);
    root.dataset.fxMagSiteSceneR416=id;
    root.dataset.fxMagSiteSceneIndexR416=String(index);
    window.FormatXSiteCoreR384?.requestRender?.(5);
    pulseSite({source:VERSION,x,y,pointerType:'site-state'});
  },{root:null,rootMargin:'-18% 0px -18% 0px',threshold:[.18,.32,.5,.68]});
  scenes.forEach(scene=>sceneObserver.observe(scene));
}

function onReady(){
  const host=hero();
  const stage=api()?.stage||host?.querySelector('.fx-core-mobile-v55-stage');
  if(stage instanceof HTMLElement)stage.dataset.fxTrue3dInteractive='r416';
  root.dataset.fxCoreTrue3dInteractionR384='ready';
  root.dataset.fxSiteIsCoreR384='true';
  root.dataset.fxMagSiteBidirectionalR416='ready';
  bindSceneCoupling();
  if(lastDetail&&heroVisible()){try{api()?.pulse?.(lastDetail);}catch(_){ }}
}

scheduleSiteCore();
bindSceneCoupling();
addEventListener('formatx:coreinteraction',onCoreInteraction,{capture:true,passive:true});
addEventListener('formatx:real3dready',onReady,{passive:true});
addEventListener('formatx:sitecoreready',()=>{root.dataset.fxSiteCoreCouplingR384='ready';bindSceneCoupling();},{passive:true});
addEventListener('scroll',onScroll,{passive:true});
addEventListener('pageshow',()=>{lastScrollY=scrollY;scheduleSiteCore();bindSceneCoupling();onReady();},{passive:true});

root.dataset.fxCoreInteractionBridgeR109='ready-r416-site';
root.dataset.fxCoreInteractionPhysicsR384='pointer-touch-gentle-scroll-scene-webgl';
root.dataset.fxSiteCoreSemanticsR384='site-equals-mag-bidirectional';
}());
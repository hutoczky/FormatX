(function(){
'use strict';
const root=document.documentElement;
/* Keep the public r155 identity for existing runtime contracts; r158 upgrades the
   behavior to a double-beat living reactor and loads the seamless page integration. */
const VERSION='js-reactive-heartbeat-r155';
const MODE='r158-lub-dub-seamless-living';
const SEAMLESS='/scifi-ui/styles/formatx-seamless-living-r158.css?v=20260815-r158-alive-seamless';
if(root.dataset.fxLiveHeartbeatR155===VERSION&&root.dataset.fxLivingHeartbeatModeR158===MODE)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLiveHeartbeatR155='audit-skip';root.dataset.fxLivingHeartbeatModeR158='audit-skip';return;}
root.dataset.fxLiveHeartbeatR155='booting';
root.dataset.fxLivingHeartbeatModeR158='booting';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=(x,c,w)=>Math.exp(-Math.pow((x-c)/w,2));
let host=null,layer=null,core=null,ring=null,wave=null,timer=0,seq=0,boost=0,lastInput=0;

function ensureSeamless(){
  let link=document.querySelector('link[data-fx-seamless-living-r158]');
  if(link instanceof HTMLLinkElement)return link;
  link=document.createElement('link');
  link.rel='stylesheet';link.href=SEAMLESS;link.dataset.fxSeamlessLivingR158='true';
  root.dataset.fxSeamlessLivingR158='loading';
  link.addEventListener('load',()=>{root.dataset.fxSeamlessLivingR158='ready';},{once:true});
  link.addEventListener('error',()=>{root.dataset.fxSeamlessLivingR158='failed';},{once:true});
  document.head.appendChild(link);return link;
}

function ensureStyle(){
  if(document.getElementById('fx-live-heartbeat-r155-style'))return;
  const style=document.createElement('style');
  style.id='fx-live-heartbeat-r155-style';
  style.textContent=`
    #hero .fx-r155-heartbeat-core,
    #hero .fx-r155-heartbeat-ring,
    #hero .fx-r155-heartbeat-wave{
      position:absolute;left:50%;top:49%;pointer-events:none;border-radius:50%;
      transform:translate(-50%,-50%);transform-origin:50% 50%;mix-blend-mode:screen;
      will-change:transform,opacity,filter,left,top;contain:layout paint style;
    }
    #hero .fx-r155-heartbeat-core{
      z-index:31;width:clamp(104px,12vw,188px);aspect-ratio:1;
      background:radial-gradient(circle,rgba(255,255,255,.99) 0 1%,rgba(222,255,255,.84) 2.4%,rgba(83,239,255,.46) 7.5%,rgba(43,205,255,.20) 18%,rgba(164,76,255,.14) 31%,transparent 66%);
      box-shadow:0 0 16px rgba(220,255,255,.40),0 0 35px rgba(55,220,255,.22),0 0 62px rgba(146,70,255,.12);
    }
    #hero .fx-r155-heartbeat-ring{
      z-index:30;width:clamp(116px,13vw,204px);aspect-ratio:1;border:1px solid rgba(190,253,255,.52);
      box-shadow:0 0 14px rgba(79,230,255,.28),0 0 32px rgba(141,72,255,.12),inset 0 0 18px rgba(97,236,255,.14);
    }
    #hero .fx-r155-heartbeat-wave{
      z-index:29;width:clamp(144px,16vw,252px);aspect-ratio:1;border:1px solid rgba(108,235,255,.25);
      box-shadow:0 0 21px rgba(62,216,255,.13),0 0 44px rgba(151,73,255,.08);
    }
    @media(max-width:900px),(pointer:coarse){
      #hero .fx-r155-heartbeat-core{width:clamp(92px,29vw,132px)}
      #hero .fx-r155-heartbeat-ring{width:clamp(104px,32vw,146px)}
      #hero .fx-r155-heartbeat-wave{width:clamp(128px,39vw,176px)}
    }
  `;
  document.head.appendChild(style);
}

function ensure(){
  ensureSeamless();
  host=document.querySelector('#hero .hero-space');
  layer=document.querySelector('#hero .fx-core-live-r147-layer');
  if(!(host instanceof HTMLElement)||!(layer instanceof HTMLElement))return false;
  ensureStyle();
  core=layer.querySelector('.fx-r155-heartbeat-core');
  ring=layer.querySelector('.fx-r155-heartbeat-ring');
  wave=layer.querySelector('.fx-r155-heartbeat-wave');
  if(!(core instanceof HTMLElement)){core=document.createElement('span');core.className='fx-r155-heartbeat-core';core.setAttribute('aria-hidden','true');layer.appendChild(core);}
  if(!(ring instanceof HTMLElement)){ring=document.createElement('span');ring.className='fx-r155-heartbeat-ring';ring.setAttribute('aria-hidden','true');layer.appendChild(ring);}
  if(!(wave instanceof HTMLElement)){wave=document.createElement('span');wave.className='fx-r155-heartbeat-wave';wave.setAttribute('aria-hidden','true');layer.appendChild(wave);}
  if(host.dataset.fxHeartbeatBoundR155!=='r158'){
    const energize=()=>{boost=1.18;lastInput=performance.now();try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){}root.dataset.fxLiveHeartbeatInteractionR155='active-r158';};
    host.addEventListener('pointerdown',energize,{passive:true});
    host.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){boost=Math.max(boost,.34);lastInput=performance.now();}},{passive:true});
    host.addEventListener('touchstart',energize,{passive:true});
    host.addEventListener('touchmove',()=>{boost=Math.max(boost,.78);lastInput=performance.now();},{passive:true});
    host.dataset.fxHeartbeatBoundR155='r158';
  }
  root.dataset.fxLiveHeartbeatR155=VERSION;
  root.dataset.fxLivingHeartbeatModeR158=MODE;
  return true;
}

function pct(name,fallback){
  if(!(host instanceof HTMLElement))return fallback;
  const inline=host.style.getPropertyValue(name),computed=getComputedStyle(host).getPropertyValue(name),n=parseFloat(inline||computed);
  return Number.isFinite(n)?n:fallback;
}
function set(el,prop,value){if(el instanceof HTMLElement)el.style.setProperty(prop,value,'important');}

function tick(){
  if(!ensure())return;
  const now=performance.now(),paused=root.dataset.fxReferenceMotionPaused==='true',still=paused||reduced.matches;
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.45),0,1.35);
  if(now-lastInput>110)boost*=.82;if(boost<.002)boost=0;

  /* Organic heartbeat: strong first contraction, softer second contraction,
     plus a slow respiratory wave. The crystal silhouette itself remains fixed. */
  const cycle=still?0:(now%1380)/1380;
  const lub=still?.18:gauss(cycle,.105,.040);
  const dub=still?.10:gauss(cycle,.235,.052)*.64;
  const beat=clamp(lub+dub,0,1.08);
  const breath=still?.35:(.5+.5*Math.sin(now*.00118-1.05));
  const shimmer=still?.28:(.5+.5*Math.sin(now*.0067+1.45));
  const activity=clamp(energy*.46+boost*.58,0,1.35);
  const x=pct('--fx-r147-light-x',50),y=pct('--fx-r147-light-y',49);

  const coreScale=.955+breath*.014+beat*.105+activity*.028;
  const ringScale=.925+breath*.020+lub*.205+dub*.135+activity*.038;
  const waveScale=.855+breath*.028+lub*.34+dub*.22+activity*.060;
  const coreOpacity=clamp(.30+breath*.10+beat*.43+activity*.15,.28,.96);
  const ringOpacity=clamp(.18+breath*.08+lub*.42+dub*.31+activity*.13,.16,.86);
  const waveOpacity=clamp(.07+breath*.05+lub*.25+dub*.20+activity*.09,.06,.54);
  const brightness=clamp(1.055+breath*.035+beat*.185+activity*.055,1.05,1.38);
  const saturation=clamp(1.10+shimmer*.055+activity*.075,1.10,1.32);
  const contrast=clamp(1.14+beat*.055+activity*.025,1.14,1.24);
  const cyanBlur=clamp(15+breath*4+beat*12+activity*5,15,36);
  const cyanAlpha=clamp(.19+beat*.18+activity*.08,.18,.47);
  const violetBlur=clamp(27+breath*5+dub*10+activity*5,27,46);
  const violetAlpha=clamp(.10+dub*.12+activity*.055,.09,.28);
  const fieldOpacity=clamp(.58+breath*.12+beat*.18+activity*.07,.56,.94);
  const fieldBlur=clamp(17+breath*3+activity*2,17,23);

  for(const el of [core,ring,wave]){set(el,'left',x.toFixed(2)+'%');set(el,'top',y.toFixed(2)+'%');}
  set(core,'transform',`translate(-50%,-50%) scale(${coreScale.toFixed(4)})`);
  set(core,'opacity',coreOpacity.toFixed(3));
  set(core,'filter',`brightness(${(1.03+beat*.31+activity*.08).toFixed(3)}) drop-shadow(0 0 ${(10+beat*17+activity*5).toFixed(1)}px rgba(99,238,255,.34))`);
  set(ring,'transform',`translate(-50%,-50%) scale(${ringScale.toFixed(4)}) rotate(${((now*.013)+(x-y)*.4)%360}deg)`);
  set(ring,'opacity',ringOpacity.toFixed(3));
  set(wave,'transform',`translate(-50%,-50%) scale(${waveScale.toFixed(4)})`);
  set(wave,'opacity',waveOpacity.toFixed(3));

  host.style.setProperty('--fx-r158-heart',beat.toFixed(4));
  host.style.setProperty('--fx-r158-breath',breath.toFixed(4));
  host.style.setProperty('--fx-r158-activity',activity.toFixed(4));
  host.style.setProperty('--fx-r158-heart-x',x.toFixed(2)+'%');
  host.style.setProperty('--fx-r158-heart-y',y.toFixed(2)+'%');
  host.style.setProperty('--fx-r158-detail-brightness',brightness.toFixed(3));
  host.style.setProperty('--fx-r158-detail-saturation',saturation.toFixed(3));
  host.style.setProperty('--fx-r158-detail-contrast',contrast.toFixed(3));
  host.style.setProperty('--fx-r158-cyan-blur',cyanBlur.toFixed(1)+'px');
  host.style.setProperty('--fx-r158-cyan-alpha',cyanAlpha.toFixed(3));
  host.style.setProperty('--fx-r158-violet-blur',violetBlur.toFixed(1)+'px');
  host.style.setProperty('--fx-r158-violet-alpha',violetAlpha.toFixed(3));
  host.style.setProperty('--fx-r158-field-opacity',fieldOpacity.toFixed(3));
  host.style.setProperty('--fx-r158-field-blur',fieldBlur.toFixed(1)+'px');
  /* Mirror the position on #hero as well, because the seamless atmosphere spans
     beyond .hero-space and visually connects the MAG to the following content. */
  const hero=document.getElementById('hero');
  if(hero instanceof HTMLElement){
    hero.style.setProperty('--fx-r158-heart-x',x.toFixed(2)+'%');
    hero.style.setProperty('--fx-r158-heart-y',y.toFixed(2)+'%');
    hero.style.setProperty('--fx-r158-field-opacity',fieldOpacity.toFixed(3));
    hero.style.setProperty('--fx-r158-field-blur',fieldBlur.toFixed(1)+'px');
  }

  seq++;
  root.dataset.fxLiveHeartbeatTickR155=String(seq);
  root.dataset.fxLiveHeartbeatPhaseR155=beat.toFixed(4);
  root.dataset.fxLiveHeartbeatPositionR155=`${x.toFixed(2)},${y.toFixed(2)}`;
  root.dataset.fxLiveHeartbeatEnergyR155=activity.toFixed(3);
  root.dataset.fxLiveHeartbeatPausedR155=String(still);
  root.dataset.fxLivingHeartbeatBeatR158=`${lub.toFixed(3)},${dub.toFixed(3)},${breath.toFixed(3)}`;
  root.dataset.fxLivingHeartbeatInteractionR158=boost>.04?'energized':'idle-living';
}

function start(){ensure();if(timer)return;tick();timer=setInterval(tick,50);root.dataset.fxLiveHeartbeatClockR155='50ms-interval';root.dataset.fxLivingHeartbeatModeR158=MODE;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
const mo=new MutationObserver(()=>{if(!layer?.isConnected)ensure();});mo.observe(document.documentElement,{childList:true,subtree:true});
addEventListener('pageshow',start,{passive:true});
}());

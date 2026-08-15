(function(){
'use strict';
const root=document.documentElement;
const VERSION='r168-multimodal-living-effects';
const STYLE='/scifi-ui/styles/formatx-living-effects-r168.css?v=20260815-r168-multimodal-energy';
if(root.dataset.fxLivingEffectsR168===VERSION)return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxLivingEffectsR168='audit-skip';return;}
root.dataset.fxLivingEffectsR168='booting';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let host=null,baseLayer=null,fxLayer=null,detail=null,timer=0,last=performance.now();
let manualX=50,manualY=49,manualUntil=0,moveBoost=0,lastInput=0,burstStart=0,burstStrength=0;

function ensureStyle(){
  let link=document.querySelector('link[data-fx-living-effects-r168]');
  if(link instanceof HTMLLinkElement)return link;
  link=document.createElement('link');link.rel='stylesheet';link.href=STYLE;link.dataset.fxLivingEffectsR168='true';
  link.addEventListener('load',()=>{root.dataset.fxLivingEffectsStyleR168='ready';},{once:true});
  link.addEventListener('error',()=>{root.dataset.fxLivingEffectsStyleR168='failed';},{once:true});
  document.head.appendChild(link);return link;
}
function ensureLayer(){
  ensureStyle();
  host=document.querySelector('#hero .hero-space');
  baseLayer=document.querySelector('#hero .fx-core-live-r147-layer');
  detail=document.querySelector('#hero .fx-core-detail-r122');
  if(!(host instanceof HTMLElement)||!(baseLayer instanceof HTMLElement))return false;
  fxLayer=baseLayer.querySelector('.fx-r168-life-layer');
  if(!(fxLayer instanceof HTMLElement)){
    fxLayer=document.createElement('div');fxLayer.className='fx-r168-life-layer';fxLayer.setAttribute('aria-hidden','true');
    fxLayer.innerHTML='<span class="fx-r168-caustic"></span><span class="fx-r168-spectrum"></span><span class="fx-r168-shards"></span><span class="fx-r168-ripple-a"></span><span class="fx-r168-ripple-b"></span><span class="fx-r168-interaction-wave"></span><span class="fx-r168-core-flash"></span>';
    baseLayer.appendChild(fxLayer);
  }
  root.dataset.fxLivingEffectsR168=VERSION;
  return true;
}
function sourceFromEvent(e){
  if(!(host instanceof HTMLElement))return;
  const r=host.getBoundingClientRect();if(!r.width||!r.height)return;
  manualX=clamp((e.clientX-r.left)/r.width*100,8,92);
  manualY=clamp((e.clientY-r.top)/r.height*100,8,92);
  manualUntil=performance.now()+900;
}
function energize(e,strength=1.3){
  if(e?.clientX!=null)sourceFromEvent(e);
  const now=performance.now();burstStart=now;burstStrength=Math.max(burstStrength,strength);moveBoost=Math.max(moveBoost,strength*.78);lastInput=now;
  try{window.FormatXCoreMobileV69?.pulse?.()}catch(_){/* visual layer still responds */}
  root.dataset.fxLivingEffectsInteractionR168='burst';
}
function bind(){
  if(!ensureLayer())return false;
  if(host.dataset.fxLivingEffectsBoundR168==='true')return true;
  host.dataset.fxLivingEffectsBoundR168='true';
  host.addEventListener('pointermove',e=>{sourceFromEvent(e);if(e.pointerType!=='touch'){moveBoost=Math.max(moveBoost,.46);lastInput=performance.now();root.dataset.fxLivingEffectsInteractionR168='pointer-reactive';}},{passive:true});
  host.addEventListener('pointerdown',e=>energize(e,1.38),{passive:true});
  host.addEventListener('touchstart',e=>{const t=e.touches?.[0];if(t)energize(t,1.48);},{passive:true});
  host.addEventListener('touchmove',e=>{const t=e.touches?.[0];if(t){sourceFromEvent(t);moveBoost=Math.max(moveBoost,.94);lastInput=performance.now();root.dataset.fxLivingEffectsInteractionR168='touch-reactive';}},{passive:true});
  return true;
}
function pct(name,fallback){
  if(!(host instanceof HTMLElement))return fallback;
  const n=parseFloat(host.style.getPropertyValue(name)||getComputedStyle(host).getPropertyValue(name));return Number.isFinite(n)?n:fallback;
}
function set(name,value){if(host instanceof HTMLElement)host.style.setProperty(name,value);}
function trail(cycle,start,span){let d=cycle-start;if(d<0)d+=1;if(d>span)return{p:1,o:0};const p=d/span;return{p,o:1-p};}
function beats(){
  const p=String(root.dataset.fxLivingHeartbeatBeatR158||'0,0,.5').split(',').map(Number);
  return{lub:Number.isFinite(p[0])?p[0]:0,dub:Number.isFinite(p[1])?p[1]:0,breath:Number.isFinite(p[2])?p[2]:.5};
}
function frame(){
  if(!bind())return;
  const now=performance.now(),dt=Math.min(120,Math.max(0,now-last));last=now;
  const paused=root.dataset.fxReferenceMotionPaused==='true',still=paused||reduced.matches;
  if(now-lastInput>70)moveBoost*=Math.pow(.07,dt/1000*1.45);if(moveBoost<.002)moveBoost=0;
  if(burstStrength>0)burstStrength*=Math.pow(.025,dt/1000*1.28);if(burstStrength<.002)burstStrength=0;
  const b=beats(),beat=still?0:clamp(b.lub+b.dub*.88,0,1.22),breath=still?.45:b.breath;
  const energy=clamp(Number(root.dataset.fxLiveHeartbeatEnergyR155||window.FormatXCoreMobileV69?.energy||.35),0,1.55);
  const activity=still?.12:clamp(energy*.34+moveBoost*.74+burstStrength*.56,0,1.65);
  const useManual=now<manualUntil;
  const x=useManual?manualX:pct('--fx-r147-light-x',50),y=useManual?manualY:pct('--fx-r147-light-y',49);
  const nx=(x-50)/50,ny=(y-49)/49;
  const cycle=still?0:(now%1380)/1380,t1=trail(cycle,.105,.34),t2=trail(cycle,.235,.31);
  let bp=1,bo=0;
  if(burstStart){const age=(now-burstStart)/760;if(age<1){bp=age;bo=(1-age)*clamp(.74+activity*.16,.74,1);}else burstStart=0;}

  /* Only a tiny scale component remains. The visible life comes from optics. */
  const coreScale=clamp(.95+beat*.025+breath*.010+activity*.012,.95,1.025);
  const coreOpacity=clamp(.26+beat*.48+breath*.08+activity*.22,.24,1);
  const coreBrightness=clamp(1.08+beat*.34+activity*.18,1.08,1.62);
  const causticOpacity=clamp(.12+beat*.25+breath*.07+activity*.24,.10,.76);
  const spectrumOpacity=clamp(.10+beat*.32+activity*.27,.08,.80);
  const shardOpacity=clamp(.10+beat*.20+activity*.22,.08,.60);
  const detailBrightness=clamp(1.035+beat*.12+activity*.10,1.03,1.33);
  const detailSaturation=clamp(1.08+beat*.09+activity*.15,1.07,1.42);
  const detailContrast=clamp(1.18+beat*.055+activity*.045,1.18,1.30);
  const hue=(Math.sin(now*.0014)*5+nx*8-ny*5).toFixed(2)+'deg';
  const causticAngle=((now*.0105)+nx*21-ny*14)%360;
  const shardAngle=((-now*.0065)+nx*14+ny*10)%360;
  const spectrumAngle=-7+ny*11+nx*4+Math.sin(now*.0022)*2.2;

  set('--fx-r168-x',x.toFixed(2)+'%');set('--fx-r168-y',y.toFixed(2)+'%');
  set('--fx-r168-core-scale',coreScale.toFixed(4));set('--fx-r168-core-opacity',coreOpacity.toFixed(3));set('--fx-r168-core-brightness',coreBrightness.toFixed(3));set('--fx-r168-core-blur',(16+beat*15+activity*9).toFixed(1)+'px');
  set('--fx-r168-caustic-angle',causticAngle.toFixed(2)+'deg');set('--fx-r168-caustic-scale',(1+breath*.008+beat*.008).toFixed(4));set('--fx-r168-caustic-opacity',causticOpacity.toFixed(3));set('--fx-r168-caustic-blur',(0.35+activity*.18).toFixed(2)+'px');
  set('--fx-r168-spectrum-angle',spectrumAngle.toFixed(2)+'deg');set('--fx-r168-spectrum-stretch',(1+Math.abs(nx)*.12+activity*.08).toFixed(3));set('--fx-r168-spectrum-opacity',spectrumOpacity.toFixed(3));set('--fx-r168-spectrum-blur',(1.2+breath*1.1-activity*.25).toFixed(2)+'px');
  set('--fx-r168-shard-angle',shardAngle.toFixed(2)+'deg');set('--fx-r168-shard-opacity',shardOpacity.toFixed(3));set('--fx-r168-shard-brightness',(1.04+beat*.34+activity*.20).toFixed(3));set('--fx-r168-hue',hue);
  set('--fx-r168-ripple-a-scale',(.76+t1.p*.78).toFixed(3));set('--fx-r168-ripple-a-opacity',(t1.o*(.12+beat*.38+activity*.12)).toFixed(3));
  set('--fx-r168-ripple-b-scale',(.72+t2.p*.70).toFixed(3));set('--fx-r168-ripple-b-opacity',(t2.o*(.10+beat*.29+activity*.10)).toFixed(3));set('--fx-r168-ripple-b-angle',((now*.018)%360).toFixed(2)+'deg');
  set('--fx-r168-burst-scale',(.55+bp*1.58).toFixed(3));set('--fx-r168-burst-opacity',bo.toFixed(3));
  set('--fx-r168-detail-brightness',detailBrightness.toFixed(3));set('--fx-r168-detail-saturation',detailSaturation.toFixed(3));set('--fx-r168-detail-contrast',detailContrast.toFixed(3));
  set('--fx-r168-cyan-blur',(14+beat*13+activity*10).toFixed(1)+'px');set('--fx-r168-cyan-alpha',clamp(.17+beat*.16+activity*.13,.16,.48).toFixed(3));set('--fx-r168-violet-blur',(25+b.dub*16+activity*9).toFixed(1)+'px');set('--fx-r168-violet-alpha',clamp(.09+b.dub*.14+activity*.10,.08,.34).toFixed(3));
  if(detail instanceof HTMLElement){detail.style.setProperty('filter',`brightness(${detailBrightness.toFixed(3)}) saturate(${detailSaturation.toFixed(3)}) contrast(${detailContrast.toFixed(3)}) drop-shadow(0 0 ${(14+beat*13+activity*10).toFixed(1)}px rgba(70,225,255,${clamp(.17+beat*.16+activity*.13,.16,.48).toFixed(3)})) drop-shadow(0 0 ${(25+b.dub*16+activity*9).toFixed(1)}px rgba(155,72,255,${clamp(.09+b.dub*.14+activity*.10,.08,.34).toFixed(3)}))`,'important');}
  root.dataset.fxLivingEffectsR168=VERSION;root.dataset.fxLivingEffectsIntensityR168=activity.toFixed(3);root.dataset.fxLivingEffectsOpticsR168=`${beat.toFixed(3)},${causticOpacity.toFixed(3)},${spectrumOpacity.toFixed(3)},${bo.toFixed(3)}`;
  if(!burstStart&&moveBoost<.03)root.dataset.fxLivingEffectsInteractionR168='idle-reactive';
}
function start(){if(timer)return;ensureLayer();bind();frame();timer=setInterval(frame,40);root.dataset.fxLivingEffectsClockR168='40ms-optical-reactor';}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
const mo=new MutationObserver(()=>{if(!fxLayer?.isConnected||!detail?.isConnected){ensureLayer();bind();}});mo.observe(document.documentElement,{childList:true,subtree:true});
addEventListener('pageshow',start,{passive:true});
}());

(function(){
'use strict';
const root=document.documentElement;
const VERSION='native-webgl-primary-true3d-r146';
if(root.dataset.fxCoreTrue3dR146===VERSION)return;
root.dataset.fxCoreTrue3dR146='booting';
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreTrue3dR146='audit-skip';return;}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let host=null,stage=null,raf=0,disposed=false,last=performance.now();
let sx=0,sy=0,se=.3;
function find(){
  host=document.querySelector('#hero .hero-space');
  stage=document.querySelector('#hero .fx-core-r112-stage,#hero .fx-core-mobile-v55-stage');
  return host instanceof HTMLElement&&stage instanceof HTMLElement;
}
function ready(){
  if(!find())return false;
  root.dataset.fxCoreTrue3dR146=VERSION;
  root.dataset.fxCoreTrue3dMode='native-webgl-primary';
  root.dataset.fxCoreDepthModel='concave-faceted-mesh-z-parallax';
  root.dataset.fxCoreReferenceRole='optical-detail-only';
  root.dataset.fxCoreTrue3dR146State='ready';
  root.dataset.fxCoreTrue3dR146='ready';
  return true;
}
function frame(now){
  raf=0;if(disposed)return;
  if(!host?.isConnected||!stage?.isConnected){if(!ready()){raf=requestAnimationFrame(frame);return;}}
  if(root.dataset.fxReferenceMotionPaused==='true'||reduced.matches){
    host.style.setProperty('--fx-core-depth-x','0px');host.style.setProperty('--fx-core-depth-y','0px');
    host.style.setProperty('--fx-core-depth-rx','0deg');host.style.setProperty('--fx-core-depth-ry','0deg');
    host.style.setProperty('--fx-core-depth-scale','1');host.style.setProperty('--fx-core-reference-opacity','.30');
    host.style.setProperty('--fx-core-webgl-opacity','.84');raf=requestAnimationFrame(frame);return;
  }
  const dt=Math.min(40,Math.max(0,now-last));last=now;
  const cp=window.FormatXCoreCinematic?.corePosition||[0,0,.55];
  const rawX=clamp(Number(cp[0]||0)/.09,-1,1),rawY=clamp(-Number(cp[1]||0)/.08,-1,1);
  const energy=clamp(Number(window.FormatXCoreMobileV69?.energy||window.FormatXCoreCinematic?.energy||.3),.3,1.8);
  const k=1-Math.pow(.001,dt/1000*7.2);
  sx+=(rawX-sx)*k;sy+=(rawY-sy)*k;se+=(energy-se)*Math.min(1,k*.85);
  const motion=Math.min(1,Math.hypot(sx,sy));
  const depthX=sx*(innerWidth<901?5.2:8.5),depthY=sy*(innerWidth<901?4.4:7.0);
  const rx=sy*(innerWidth<901?2.4:3.8),ry=-sx*(innerWidth<901?3.0:4.8);
  const scale=1+motion*.004+(se-.3)*.003;
  const refOpacity=clamp((innerWidth<901?.24:.28)-motion*.075-(se-.3)*.035,.13,.30);
  const glOpacity=clamp((innerWidth<901?.90:.88)+motion*.055+(se-.3)*.025,.84,.97);
  host.style.setProperty('--fx-core-depth-x',depthX.toFixed(2)+'px');
  host.style.setProperty('--fx-core-depth-y',depthY.toFixed(2)+'px');
  host.style.setProperty('--fx-core-depth-rx',rx.toFixed(2)+'deg');
  host.style.setProperty('--fx-core-depth-ry',ry.toFixed(2)+'deg');
  host.style.setProperty('--fx-core-depth-scale',scale.toFixed(4));
  host.style.setProperty('--fx-core-reference-opacity',refOpacity.toFixed(3));
  host.style.setProperty('--fx-core-webgl-opacity',glOpacity.toFixed(3));
  root.dataset.fxCoreTrue3dVector=`${sx.toFixed(3)},${sy.toFixed(3)},${se.toFixed(3)}`;
  root.dataset.fxCoreTrue3dFrame='native-webgl-primary';
  raf=requestAnimationFrame(frame);
}
function boot(attempt=0){
  if(!ready()){
    if(attempt<360)return requestAnimationFrame(()=>boot(attempt+1));
    root.dataset.fxCoreTrue3dR146='host-unavailable';return;
  }
  raf=requestAnimationFrame(frame);
}
addEventListener('formatx:real3dready',()=>{if(!raf&&!disposed)raf=requestAnimationFrame(frame)},{passive:true});
addEventListener('formatx:coredetailready',()=>{if(!raf&&!disposed)raf=requestAnimationFrame(frame)},{passive:true});
addEventListener('pageshow',()=>{if(!raf&&!disposed)raf=requestAnimationFrame(frame)},{passive:true});
addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);raf=0},{passive:true});
boot();
}());

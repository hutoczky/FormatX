(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxCorePostFx==='v31-reference')return;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let tries=0;
function mount(){
  const stage=document.querySelector('.fx-core-real3d-stage');
  if(!stage){if(tries++<240)requestAnimationFrame(mount);return;}
  if(stage.querySelector('.fx-core-postfx-v31'))return;
  const fx=document.createElement('div');
  fx.className='fx-core-postfx-v31';
  fx.setAttribute('aria-hidden','true');
  fx.innerHTML='<i class="fx-v31-spectrum"></i><i class="fx-v31-ring fx-v31-ring-a"></i><i class="fx-v31-ring fx-v31-ring-b"></i><i class="fx-v31-ring fx-v31-ring-c"></i><i class="fx-v31-axis fx-v31-axis-x"></i><i class="fx-v31-axis fx-v31-axis-y"></i><i class="fx-v31-flare"></i>';
  stage.appendChild(fx);
  let tx=0,ty=0,x=0,y=0,last=performance.now();
  addEventListener('pointermove',e=>{
    if(reduced.matches)return;
    tx=((e.clientX/Math.max(1,innerWidth))-.5)*5;
    ty=((e.clientY/Math.max(1,innerHeight))-.5)*4;
  },{passive:true});
  function frame(now){
    const dt=Math.min(50,Math.max(.1,now-last));last=now;
    const k=1-Math.pow(.001,dt/1000);
    x+=(tx-x)*k*.16;y+=(ty-y)*k*.16;
    const t=reduced.matches?0:now*.001;
    fx.style.setProperty('--fx-v31-x',(x+Math.sin(t*.41)*.7).toFixed(2)+'px');
    fx.style.setProperty('--fx-v31-y',(y+Math.cos(t*.37)*.55).toFixed(2)+'px');
    fx.style.setProperty('--fx-v31-pulse',(1+Math.sin(t*1.7)*.035+Math.sin(t*3.4)*.012).toFixed(4));
    requestAnimationFrame(frame);
  }
  root.dataset.fxCorePostFx='v31-reference';
  requestAnimationFrame(frame);
}
mount();
}());
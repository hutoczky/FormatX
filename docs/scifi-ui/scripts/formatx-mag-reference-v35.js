(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV35==='ready')return;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let tries=0;
function mount(){
  const stage=document.querySelector('.fx-core-real3d-stage');
  if(!stage){if(tries++<240)requestAnimationFrame(mount);return;}
  if(stage.querySelector('.fx-mag-v35-overlay')){root.dataset.fxMagReferenceV35='ready';return;}
  const overlay=document.createElement('div');
  overlay.className='fx-mag-v35-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<i class="fx-v35-facet fx-v35-n"></i><i class="fx-v35-facet fx-v35-e"></i><i class="fx-v35-facet fx-v35-s"></i><i class="fx-v35-facet fx-v35-w"></i><i class="fx-v35-frame"></i><i class="fx-v35-spectrum"></i><i class="fx-v35-ring fx-v35-ring-a"></i><i class="fx-v35-ring fx-v35-ring-b"></i><i class="fx-v35-ring fx-v35-ring-c"></i><i class="fx-v35-axis-x"></i><i class="fx-v35-axis-y"></i><i class="fx-v35-core"></i>';
  stage.appendChild(overlay);
  const spectrum=overlay.querySelector('.fx-v35-spectrum');
  const ringA=overlay.querySelector('.fx-v35-ring-a');
  const ringB=overlay.querySelector('.fx-v35-ring-b');
  const ringC=overlay.querySelector('.fx-v35-ring-c');
  let tx=0,ty=0,x=0,y=0,last=performance.now();
  addEventListener('pointermove',e=>{
    if(reduced.matches)return;
    tx=((e.clientX/Math.max(1,innerWidth))-.5)*3.2;
    ty=((e.clientY/Math.max(1,innerHeight))-.5)*2.6;
  },{passive:true});
  function frame(now){
    const dt=Math.min(50,Math.max(.1,now-last));last=now;
    const k=1-Math.pow(.002,dt/1000);
    x+=(tx-x)*k*.18;y+=(ty-y)*k*.18;
    if(!document.hidden&&stage.dataset.active==='true'&&!reduced.matches){
      const t=now*.001;
      const p=1+Math.sin(t*1.85)*.018+Math.sin(t*3.7)*.006;
      overlay.style.setProperty('--fx-v35-x',(x+Math.sin(t*.31)*.42).toFixed(2)+'px');
      overlay.style.setProperty('--fx-v35-y',(y+Math.cos(t*.27)*.34).toFixed(2)+'px');
      overlay.style.setProperty('--fx-v35-pulse',p.toFixed(4));
      spectrum.style.transform=`rotate(${(-t*3.0).toFixed(3)}deg)`;
      ringA.style.transform=`rotateX(62deg) rotateZ(${(-14+t*2.2).toFixed(3)}deg)`;
      ringB.style.transform=`rotateX(68deg) rotateZ(${(23-t*1.7).toFixed(3)}deg)`;
      ringC.style.transform=`rotateX(64deg) rotateZ(${(-29+t*1.15).toFixed(3)}deg)`;
    }
    requestAnimationFrame(frame);
  }
  root.dataset.fxMagReferenceV35='ready';
  root.dataset.fxCoreVisualRevision='v35-sharp-crystalline-reference';
  requestAnimationFrame(frame);
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());

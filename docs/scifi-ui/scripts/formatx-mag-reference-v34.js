(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV34==='ready')return;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let tries=0;
function mount(){
  const stage=document.querySelector('.fx-core-real3d-stage');
  if(!stage){if(tries++<240)requestAnimationFrame(mount);return;}
  if(stage.querySelector('.fx-mag-v34-overlay')){root.dataset.fxMagReferenceV34='ready';return;}
  const overlay=document.createElement('div');
  overlay.className='fx-mag-v34-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML='<i class="fx-v34-glass"></i><i class="fx-v34-orbits"></i><i class="fx-v34-filaments"></i><i class="fx-v34-axis-x"></i><i class="fx-v34-axis-y"></i><i class="fx-v34-reactor"></i>';
  stage.appendChild(overlay);
  const glass=overlay.querySelector('.fx-v34-glass');
  const orbits=overlay.querySelector('.fx-v34-orbits');
  const filaments=overlay.querySelector('.fx-v34-filaments');
  const reactor=overlay.querySelector('.fx-v34-reactor');
  let last=performance.now();
  function frame(now){
    const dt=Math.min(50,Math.max(.1,now-last));last=now;
    if(!document.hidden&&stage.dataset.active==='true'&&!reduced.matches){
      const t=now*.001;
      const p=1+Math.sin(t*1.72)*.020+Math.sin(t*3.44)*.008;
      glass.style.transform=`rotate(${(Math.sin(t*.16)*.65).toFixed(3)}deg) scale(${(1+Math.sin(t*.61)*.004).toFixed(4)})`;
      orbits.style.transform=`rotate(${(t*2.1).toFixed(3)}deg)`;
      filaments.style.transform=`rotate(${(-t*3.2+Math.sin(t*.43)*1.2).toFixed(3)}deg)`;
      reactor.style.transform=`scale(${p.toFixed(4)})`;
    }
    requestAnimationFrame(frame);
  }
  root.dataset.fxMagReferenceV34='ready';
  root.dataset.fxCoreVisualRevision='v34-reference-crystal';
  requestAnimationFrame(frame);
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());

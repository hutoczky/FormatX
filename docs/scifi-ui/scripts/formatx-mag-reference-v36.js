(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV36==='ready')return;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let tries=0;
function mount(){
  const stage=document.querySelector('.fx-core-real3d-stage');
  if(!stage){if(tries++<240)requestAnimationFrame(mount);return;}
  if(stage.querySelector('.fx-mag-v36-overlay')){root.dataset.fxMagReferenceV36='ready';return;}

  const overlay=document.createElement('div');
  overlay.className='fx-mag-v36-overlay';
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML=`
    <svg class="fx-v36-svg" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="fxV36CoreGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
          <stop offset="12%" stop-color="#efffff" stop-opacity=".98"/>
          <stop offset="28%" stop-color="#78f3ff" stop-opacity=".72"/>
          <stop offset="52%" stop-color="#35bfff" stop-opacity=".24"/>
          <stop offset="78%" stop-color="#6b53ff" stop-opacity=".08"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <g class="fx-v36-shells">
        <path class="fx-v36-shell fx-v36-shell-outer" d="M500 62 C515 230 704 452 938 500 C704 548 515 770 500 938 C485 770 296 548 62 500 C296 452 485 230 500 62 Z"/>
        <path class="fx-v36-shell fx-v36-shell-mid" d="M500 132 C530 276 682 446 858 500 C682 554 530 724 500 868 C470 724 318 554 142 500 C318 446 470 276 500 132 Z"/>
        <path class="fx-v36-shell fx-v36-shell-inner" d="M500 208 C540 320 650 452 778 500 C650 548 540 680 500 792 C460 680 350 548 222 500 C350 452 460 320 500 208 Z"/>
      </g>

      <g class="fx-v36-filaments-group">
        <path class="fx-v36-filament fx-v36-filament-cyan" d="M500 82 C478 258 402 405 230 500 C405 526 472 642 500 902"/>
        <path class="fx-v36-filament fx-v36-filament-cyan" d="M500 82 C522 258 598 405 770 500 C595 526 528 642 500 902"/>
        <path class="fx-v36-filament fx-v36-filament-violet" d="M92 500 C292 474 390 414 500 258 C610 414 708 474 908 500"/>
        <path class="fx-v36-filament fx-v36-filament-violet" d="M92 500 C292 526 390 586 500 742 C610 586 708 526 908 500"/>
        <path class="fx-v36-filament fx-v36-filament-dim" d="M500 134 C452 318 350 438 178 500 C350 562 452 682 500 866"/>
        <path class="fx-v36-filament fx-v36-filament-dim" d="M500 134 C548 318 650 438 822 500 C650 562 548 682 500 866"/>
        <path class="fx-v36-filament fx-v36-filament-cyan" d="M278 500 C388 474 433 407 500 330 C567 407 612 474 722 500"/>
        <path class="fx-v36-filament fx-v36-filament-violet" d="M278 500 C388 526 433 593 500 670 C567 593 612 526 722 500"/>
      </g>

      <g class="fx-v36-spines">
        <path class="fx-v36-spine fx-v36-spine-main" d="M500 72 L500 928"/>
        <path class="fx-v36-spine fx-v36-spine-main" d="M72 500 L928 500"/>
        <path class="fx-v36-spine fx-v36-spine-soft" d="M500 170 L555 390 L790 500 L555 610 L500 830 L445 610 L210 500 L445 390 Z"/>
      </g>

      <g class="fx-v36-rings-a">
        <circle class="fx-v36-ring fx-v36-ring-cyan" cx="500" cy="500" r="86"/>
        <circle class="fx-v36-ring fx-v36-ring-blue" cx="500" cy="500" r="124"/>
        <circle class="fx-v36-ring fx-v36-ring-violet" cx="500" cy="500" r="164"/>
      </g>
      <g class="fx-v36-rings-b">
        <ellipse class="fx-v36-ring fx-v36-ring-cyan" cx="500" cy="500" rx="196" ry="62"/>
        <ellipse class="fx-v36-ring fx-v36-ring-blue" cx="500" cy="500" rx="148" ry="42"/>
      </g>

      <g class="fx-v36-nodes">
        <circle class="fx-v36-node" cx="500" cy="330" r="3.8"/>
        <circle class="fx-v36-node" cx="670" cy="500" r="3.8"/>
        <circle class="fx-v36-node" cx="500" cy="670" r="3.8"/>
        <circle class="fx-v36-node" cx="330" cy="500" r="3.8"/>
        <circle class="fx-v36-node-dim" cx="500" cy="258" r="2.5"/>
        <circle class="fx-v36-node-dim" cx="742" cy="500" r="2.5"/>
        <circle class="fx-v36-node-dim" cx="500" cy="742" r="2.5"/>
        <circle class="fx-v36-node-dim" cx="258" cy="500" r="2.5"/>
      </g>

      <circle class="fx-v36-core-halo" cx="500" cy="500" r="56"/>
      <circle class="fx-v36-core-dot" cx="500" cy="500" r="11"/>
    </svg>`;
  stage.appendChild(overlay);

  const svg=overlay.querySelector('.fx-v36-svg');
  const ringsA=overlay.querySelector('.fx-v36-rings-a');
  const ringsB=overlay.querySelector('.fx-v36-rings-b');
  const filaments=overlay.querySelector('.fx-v36-filaments-group');
  let tx=0,ty=0,x=0,y=0,last=performance.now();

  addEventListener('pointermove',e=>{
    if(reduced.matches)return;
    tx=((e.clientX/Math.max(1,innerWidth))-.5)*2.2;
    ty=((e.clientY/Math.max(1,innerHeight))-.5)*1.8;
  },{passive:true});

  function frame(now){
    const dt=Math.min(50,Math.max(.1,now-last));last=now;
    const k=1-Math.pow(.003,dt/1000);
    x+=(tx-x)*k*.16;y+=(ty-y)*k*.16;
    if(!document.hidden&&stage.dataset.active==='true'&&!reduced.matches){
      const t=now*.001;
      const pulse=1+Math.sin(t*1.55)*.006+Math.sin(t*3.1)*.0025;
      overlay.style.setProperty('--fx-v36-x',(x+Math.sin(t*.24)*.30).toFixed(2)+'px');
      overlay.style.setProperty('--fx-v36-y',(y+Math.cos(t*.21)*.24).toFixed(2)+'px');
      overlay.style.setProperty('--fx-v36-scale',pulse.toFixed(4));
      ringsA.setAttribute('transform',`rotate(${(t*2.2).toFixed(3)} 500 500)`);
      ringsB.setAttribute('transform',`rotate(${(-t*1.45).toFixed(3)} 500 500)`);
      filaments.setAttribute('transform',`rotate(${(Math.sin(t*.31)*.55).toFixed(3)} 500 500)`);
      svg.style.opacity=(.96+Math.sin(t*.82)*.025).toFixed(3);
    }
    requestAnimationFrame(frame);
  }

  root.dataset.fxMagReferenceV36='ready';
  root.dataset.fxCoreVisualRevision='v36-curved-crystal-reference';
  requestAnimationFrame(frame);
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());

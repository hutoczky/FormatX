(function(){
'use strict';
const root=document.documentElement;
const start=document.querySelector('[data-fx-speedtest] [data-speed-start]');
if(!(start instanceof HTMLButtonElement))return;
if(root.dataset.fxSpeedtestLoaderR1800)return;
root.dataset.fxSpeedtestLoaderR1800='armed-click-only';

let loading=false;
function loadAndStart(){
  if(root.dataset.fxSpeedtestR1800==='ready-user-activated-zero-idle'){
    root.dataset.fxSpeedtestRequestR1800='start';
    dispatchEvent(new CustomEvent('formatx:speedtestrequest'));
    return;
  }
  if(loading)return;
  loading=true;
  root.dataset.fxSpeedtestRequestR1800='start';
  start.setAttribute('aria-busy','true');

  const script=document.createElement('script');
  script.src='./scripts/formatx-speedtest-r1800.js?v=20260928-r1800-click-only';
  script.async=true;
  script.dataset.fxSpeedtestRuntimeR1800='true';
  script.addEventListener('load',()=>{
    loading=false;
    start.removeAttribute('aria-busy');
    root.dataset.fxSpeedtestLoaderR1800='runtime-ready';
  },{once:true});
  script.addEventListener('error',()=>{
    loading=false;
    start.removeAttribute('aria-busy');
    root.dataset.fxSpeedtestLoaderR1800='load-error';
    root.dataset.fxSpeedtestRequestR1800='';
    const status=document.querySelector('[data-speed-status]');
    if(status)status.textContent=document.documentElement.lang.startsWith('en')
      ? 'The measurement module could not load. Try again.'
      : 'A mérőmodul nem tölthető be. Próbáld újra.';
  },{once:true});
  document.head.appendChild(script);
}

start.addEventListener('click',event=>{
  if(root.dataset.fxSpeedtestR1800==='ready-user-activated-zero-idle')return;
  event.preventDefault();
  loadAndStart();
},{capture:true});

if(location.hash==='#network-speed'){
  root.dataset.fxSpeedtestLoaderR1800='armed-direct-link';
}
}());

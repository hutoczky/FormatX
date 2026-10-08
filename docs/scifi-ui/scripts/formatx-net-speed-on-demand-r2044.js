/* R2044: load the genuine NET speed-test engine only near the native section
   or in response to user input. Never auto-start measurement traffic. */
(() => {
  'use strict';
  const root=document.documentElement;
  const section=document.querySelector('#network[data-fx-net-speed-r1800]');
  // Query the inert template content explicitly: template descendants do not
  // appear in the document's regular selector tree.
  const tpl=document.querySelector('template[data-fx-net-runtime-r2044]');
  const spec=tpl?.content.querySelector('script[src]');
  if(!(section instanceof HTMLElement)||!spec)return;
  const startButton=section.querySelector('[data-net-start]');
  const status=section.querySelector('[data-net-status]');
  let loading=false,loaded=false,replayStart=false,proximityObserver=null;
  root.dataset.fxNetLoaderR2044='armed-near-section-only';

  function load(reason){
    if(loading||loaded)return;
    loading=true;
    proximityObserver?.disconnect();
    root.dataset.fxNetLoaderR2044='loading:'+reason;
    const s=document.createElement('script');
    s.src=spec.getAttribute('src');
    s.async=true;
    s.dataset.fxNetRuntimeR2044='true';
    s.addEventListener('load',()=>{
      loaded=true;loading=false;
      root.dataset.fxNetLoaderR2044='ready';
      if(replayStart){
        replayStart=false;
        // Replay exactly the explicit Start action after its handler mounts.
        startButton?.click();
      }
    },{once:true});
    s.addEventListener('error',()=>{
      loading=false;
      root.dataset.fxNetLoaderR2044='load-error';
      if(status)status.textContent=root.lang==='en'
        ?'Could not load the network test. Please retry.'
        :'A hálózati teszt nem tölthető be. Próbáld újra.';
    },{once:true});
    document.head.appendChild(s);
  }

  section.addEventListener('click',event=>{
    if(!(startButton instanceof HTMLElement)||
      !(event.target instanceof Element)||
      !startButton.contains(event.target)||loaded)return;
    event.preventDefault();
    event.stopPropagation();
    replayStart=true;
    if(status)status.textContent=root.lang==='en'
      ?'Preparing the network test…'
      :'A hálózati mérés előkészítése…';
    load('explicit-start-click');
  },true);
  section.addEventListener('focusin',()=>load('keyboard-focus'),{once:true});
  section.addEventListener('pointerenter',()=>load('pointer-proximity'),{once:true,passive:true});

  if('IntersectionObserver' in window){
    proximityObserver=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.target===section&&e.isIntersecting))
        load('viewport-near-network');
    },{rootMargin:'1600px 0px',threshold:0});
    proximityObserver.observe(section);
  }else if('requestIdleCallback' in window){
    requestIdleCallback(()=>load('legacy-idle'),{timeout:5000});
  }else setTimeout(()=>load('legacy-fallback'),5000);

  if(location.hash==='#network')load('network-deep-link');
  addEventListener('pagehide',()=>proximityObserver?.disconnect(),{once:true});
})();

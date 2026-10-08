/* R2052: defer nonessential SOTY visual continuity work until the visible
   hero has painted. All visitors get the same enhancement; no audit branch.
   A genuine scroll, key or pointer intent starts it immediately. */
(() => {
  'use strict';
  const root=document.documentElement;
  const holder=document.querySelector('template[data-fx-soty-runtime-r2052]');
  const spec=holder?.content.querySelector('script[src]');
  if(!spec)return;
  let started=false, idle=0, timer=0, paintObserver=null;
  function start(reason){
    if(started)return;
    started=true;
    if(timer)clearTimeout(timer);
    if(idle&&'cancelIdleCallback' in window)cancelIdleCallback(idle);
    paintObserver?.disconnect();
    root.dataset.fxSotyPostpaintR2052='loading:'+reason;
    const script=document.createElement('script');
    script.src=spec.getAttribute('src');
    script.async=true;
    script.dataset.fxSotyRuntimeR2052='true';
    script.addEventListener('load',()=>{
      root.dataset.fxSotyPostpaintR2052='runtime-loaded';
    },{once:true});
    script.addEventListener('error',()=>{
      root.dataset.fxSotyPostpaintR2052='runtime-load-error';
    },{once:true});
    document.head.appendChild(script);
  }
  function afterPaint(){
    if(started||timer)return;
    // Voluntary decorative enhancement: keep heavy gradients/scroll
    // continuity out of the actual first readable frame on slower devices.
    timer=setTimeout(()=>{
      timer=0;
      if(started)return;
      if('requestIdleCallback' in window)
        idle=requestIdleCallback(()=>start('postpaint-idle'),{timeout:800});
      else start('postpaint-fallback');
    },1550);
  }
  for(const type of ['wheel','touchstart','pointerdown','keydown']){
    addEventListener(type,()=>start('actual-user-'+type),{once:true,passive:true});
  }
  addEventListener('formatx:immersiveactivate',()=>start('immersive-request'),{once:true});
  if(location.hash&&location.hash!=='#top'&&location.hash!=='#hero'){
    start('existing-deep-link');
  }else if(performance.getEntriesByName('first-contentful-paint','paint').length){
    afterPaint();
  }else if('PerformanceObserver' in window){
    try{
      paintObserver=new PerformanceObserver(entries=>{
        if(entries.getEntries().some(e=>e.name==='first-contentful-paint')){
          paintObserver.disconnect();
          afterPaint();
        }
      });
      paintObserver.observe({type:'paint',buffered:true});
    }catch(_){
      addEventListener('load',afterPaint,{once:true});
    }
  }else addEventListener('load',afterPaint,{once:true});
  root.dataset.fxSotyPostpaintR2052='waiting-for-paint-or-user';
})();

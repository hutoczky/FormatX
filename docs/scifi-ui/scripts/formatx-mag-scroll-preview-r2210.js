/* FormatX MAG living-world preview R2210.
   One visible canvas, one canonical cinematic renderer, native scrolling. */
(() => {
  'use strict';
  const root=document.documentElement;
  if (root.dataset.fxpRuntime) return;
  let canvas=document.getElementById('fxp-world');
  const sections=[...document.querySelectorAll('#journey > .fxp-chapter')];
  const links=[...document.querySelectorAll('.fxp-rail a')];
  const status=document.querySelector('[data-fxp-status]');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const mobile=matchMedia('(max-width:900px),(pointer:coarse)');
  if (!(canvas instanceof HTMLCanvasElement) || sections.length!==7 || links.length!==7) return;
  root.dataset.fxpRuntime='initialising';
  const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
  const labels=['GENESIS','SEJT','MAG','ÉRZÉKELÉS','TERV','ELLENŐRZÉS','JELADÓ'];
  let renderer=null,kind='static',progress=0,target=0,previous=0,active=-1;
  let raf=0,ambientTimer=0,lastRender=0,lastNow=0,lastInput=0,disposed=false;
  let pointerX=innerWidth*.5,pointerY=innerHeight*.5;
  let movingAverage=0,slowFrames=0;
  const getTarget=()=>({x:pointerX,y:pointerY});
  function replaceCanvas(){
    const next=canvas.cloneNode(false);
    next.width=1;next.height=1;
    canvas.replaceWith(next);
    canvas=next;
    return next;
  }
  async function attachRenderer(){
    try{
      const owner=window.FormatXMagGenesisThreeR1280;
      if(owner?.attach){
        renderer=await owner.attach(canvas,getTarget);
        if(renderer)kind='threejs';
      }
    }catch(error){
      console.warn('MAG scroll preview 3D fallback:',error);
    }
    if(!renderer && window.FormatXMagReferenceFilmR649?.attach){
      // A failed WebGL context cannot be reused as a Canvas2D surface.
      let context=null;
      try{context=canvas.getContext('2d')}catch(_){}
      if(!context)replaceCanvas();
      renderer=window.FormatXMagReferenceFilmR649.attach(canvas,getTarget);
      if(renderer)kind='canvas2d';
    }
    root.dataset.fxpRenderer=kind;
    root.dataset.fxpRuntime=renderer?'ready':'static-fallback';
    if(!renderer)canvas.style.background='radial-gradient(ellipse at 50% 46%,#15333d,#02080c 73%)';
    canvas.addEventListener('webglcontextlost',onContextLost,{passive:false});
    schedule();
  }
  function onContextLost(event){
    event.preventDefault();
    root.dataset.fxpRenderer='context-lost';
    if(raf)cancelAnimationFrame(raf);
    raf=0;
  }
  function updateChapters(){
    const center=innerHeight*.52;
    let best=0,distance=Infinity;
    for(let index=0;index<sections.length;index++){
      const rect=sections[index].getBoundingClientRect();
      const d=center<rect.top?rect.top-center:center>rect.bottom?center-rect.bottom:0;
      if(d<distance){distance=d;best=index;}
      const exposure=clamp((innerHeight-rect.top)/(innerHeight*.75))*
        clamp(rect.bottom/(innerHeight*.75));
      const copy=sections[index].querySelector('.fxp-copy');
      if(copy){
        copy.style.setProperty('--fxp-copy-opacity',
          (reduced.matches?1:.80+.20*exposure).toFixed(3));
        copy.style.setProperty('--fxp-copy-offset',
          (reduced.matches?0:(1-exposure)*18).toFixed(1)+'px');
      }
    }
    if(active!==best){
      active=best;
      links.forEach((link,index)=>{
        if(index===best)link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
      status.textContent=String(best+1).padStart(2,'0')+' — '+labels[best];
      root.dataset.fxpChapter=sections[best].id;
    }
    const limit=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    target=clamp(scrollY/limit);
    root.style.setProperty('--fxp-progress',target.toFixed(4));
  }
  function schedule(){
    if(disposed||raf||document.hidden)return;
    raf=requestAnimationFrame(frame);
  }
  function frame(now){
    raf=0;
    if(disposed||document.hidden)return;
    const dt=Math.min(60,Math.max(0,now-(lastNow||now)));
    lastNow=now;
    const blend=reduced.matches?1:1-Math.exp(-dt/95);
    progress+= (target-progress)*blend;
    const activeMotion=now-lastInput<1100 || Math.abs(target-progress)>.0015;
    const interval=mobile.matches?(activeMotion?1000/30:250):(activeMotion?1000/60:180);
    if(renderer && now-lastRender>=interval){
      try{
        const start=performance.now();
        renderer.draw(progress,now);
        const cost=performance.now()-start;
        movingAverage=movingAverage ? movingAverage*.85+cost*.15 : cost;
        if(movingAverage>30)slowFrames=Math.min(30,slowFrames+1);
        else slowFrames=Math.max(0,slowFrames-1);
        lastRender=now;
        root.dataset.fxpQuality=slowFrames>10?'constrained':'adaptive';
      }catch(error){
        console.error('MAG scroll preview renderer:',error);
        root.dataset.fxpRuntime='render-failed';
        renderer=null;
      }
    }
    if(activeMotion && !reduced.matches){
      schedule();
    }else if(!reduced.matches && renderer){
      clearTimeout(ambientTimer);
      ambientTimer=setTimeout(schedule,mobile.matches?300:200);
    }
  }
  function onScroll(){
    lastInput=performance.now();
    updateChapters();schedule();
  }
  function onResize(){
    try{renderer?.resize?.()}catch(error){console.warn('MAG preview resize:',error);}
    updateChapters();schedule();
  }
  function onPointer(event){
    if(event.pointerType==='touch')return;
    pointerX+=((event.clientX-pointerX)*.16);
    pointerY+=((event.clientY-pointerY)*.16);
    lastInput=performance.now();
    schedule();
  }
  function cleanup(){
    disposed=true;clearTimeout(ambientTimer);
    if(raf)cancelAnimationFrame(raf);
    try{renderer?.destroy?.()}catch(_){}
  }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onResize,{passive:true});
  addEventListener('pageshow',onResize,{passive:true});
  addEventListener('pointermove',onPointer,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){clearTimeout(ambientTimer);if(raf)cancelAnimationFrame(raf);raf=0;}
    else schedule();
  });
  reduced.addEventListener?.('change',onResize);
  addEventListener('pagehide',cleanup,{once:true});
  window.__FORMATX_MAG_SCROLL_PREVIEW__=()=>({
    version:'r2210',renderer:kind,state:root.dataset.fxpRuntime,
    chapter:sections[active]?.id,progress,chapters:sections.length,canvases:document.querySelectorAll('#fxp-world').length
  });
  updateChapters();
  attachRenderer();
})();

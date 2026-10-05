(() => {
  'use strict';

  const root=document.documentElement;
  if(root.dataset.fxR1280PermanentMagR1940==='ready'||root.dataset.fxR1280PermanentMagR1940==='booting')return;
  root.dataset.fxR1280PermanentMagR1940='booting';
  root.dataset.fxCrystalOrganismR326='booting';

  const OWNER='/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js?v=20261005-r1940-reference-armored-pod';
  const TARGET_PROGRESS=.785;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let engine=null;
  let stage=null;
  let canvas=null;
  let raf=0;
  let ro=null;
  let io=null;
  let visible=true;
  let disposed=false;
  let rotationX=0,rotationY=0;

  function loadOwner(){
    if(window.FormatXMagGenesisThreeR1280?.attach)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const existing=[...document.scripts].find(s=>/formatx-mag-genesis-three-r1280\.js/.test(s.src));
      if(existing){
        existing.addEventListener('load',resolve,{once:true});
        existing.addEventListener('error',reject,{once:true});
        return;
      }
      const script=document.createElement('script');
      script.src=OWNER;
      script.async=false;
      script.dataset.fxR1280ReferenceOwnerR1940='true';
      script.addEventListener('load',resolve,{once:true});
      script.addEventListener('error',reject,{once:true});
      document.head.appendChild(script);
    });
  }

  function schedule(){
    if(disposed||raf||!visible)return;
    raf=requestAnimationFrame(frame);
  }

  function frame(now){
    raf=0;
    if(disposed||!visible||!engine)return;
    try{
      if(engine.engine?.mechanicalGroup){
        engine.engine.mechanicalGroup.rotation.x=rotationX+Math.sin(now*.00016)*.006;
        engine.engine.mechanicalGroup.rotation.y=rotationY+Math.sin(now*.00018)*.008;
      }
      engine.draw(TARGET_PROGRESS,now);
    }catch(error){
      console.error('FormatX R1940 reference MAG draw failed:',error);
    }
    if(!reduced)schedule();
  }

  function destroy(){
    if(disposed)return;
    disposed=true;
    if(raf)cancelAnimationFrame(raf);
    ro?.disconnect();
    io?.disconnect();
    try{engine?.destroy?.();}catch(_){}
    stage?.remove();
    if(window.FormatXCoreMobileV69?.revision==='r1940-r1280-reference')delete window.FormatXCoreMobileV69;
    if(window.FormatXLivingCore?.revision==='r1940-r1280-reference')delete window.FormatXLivingCore;
    root.dataset.fxR1280PermanentMagR1940='destroyed';
  }

  async function boot(attempt=0){
    const hero=document.getElementById('hero');
    const host=hero?.querySelector('.hero-space');
    if(!(hero instanceof HTMLElement)||!(host instanceof HTMLElement)){
      if(attempt<180){requestAnimationFrame(()=>boot(attempt+1));return;}
      root.dataset.fxR1280PermanentMagR1940='host-unavailable';
      root.dataset.fxCrystalOrganismR326='host-unavailable';
      return;
    }

    window.FormatXCoreMobileV69?.destroy?.();
    host.querySelectorAll(':scope > .fx-core-mobile-v55-stage,:scope > .fx-crystal-organism-r326-stage').forEach(node=>node.remove());

    stage=document.createElement('div');
    stage.className='fx-core-mobile-v55-stage fx-crystal-organism-r326-stage fx-r1280-reference-mag-r1940-stage';
    stage.dataset.renderer='r1940-r1280-reference';
    stage.dataset.revision='r1280-armored-pod-eye-segmented-tendrils-reference';
    stage.dataset.active='true';
    stage.setAttribute('aria-hidden','true');
    stage.style.setProperty('pointer-events','none','important');
    host.prepend(stage);

    canvas=document.createElement('canvas');
    canvas.className='fx-core-mobile-v55-canvas fx-crystal-organism-r326-canvas fx-r1280-reference-mag-r1940-canvas';
    canvas.setAttribute('aria-hidden','true');
    canvas.style.setProperty('position','absolute','important');
    canvas.style.setProperty('inset','0','important');
    canvas.style.setProperty('width','100%','important');
    canvas.style.setProperty('height','100%','important');
    canvas.style.setProperty('filter','brightness(1.03) contrast(1.05) saturate(.88)','important');
    canvas.style.setProperty('-webkit-filter','brightness(1.03) contrast(1.05) saturate(.88)','important');
    stage.appendChild(canvas);

    try{
      await loadOwner();
      const owner=window.FormatXMagGenesisThreeR1280;
      if(!owner?.attach)throw new Error('R1280 owner unavailable');
      engine=await owner.attach(canvas,()=>({x:innerWidth*.5,y:innerHeight*.49}));
      if(!engine)throw new Error('R1280 attach returned null');
    }catch(error){
      console.error('FormatX R1940 reference MAG boot failed:',error);
      stage.remove();
      root.dataset.fxR1280PermanentMagR1940='failed';
      root.dataset.fxCrystalOrganismR326='renderer-failed';
      return;
    }

    ro=new ResizeObserver(()=>{try{engine.resize?.();}catch(_){} schedule();});
    ro.observe(stage);
    io=new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.03);
      if(visible)schedule();
      else if(raf){cancelAnimationFrame(raf);raf=0;}
    },{threshold:[0,.03]});
    io.observe(stage);

    const api={
      version:'r1940-r1280-reference',
      revision:'r1940-r1280-reference',
      renderer:'r1280-three-reference',
      canonicalRenderer:'r1280-armored-living-pod',
      canonicalRevision:'r1280-armored-pod-eye-segmented-tendrils-reference',
      livingForm:'armored-biomechanical-living-pod',
      material:'dark-bioglass-titanium-cyan-optic',
      geometry:'armored-pod-optical-eye-segmented-tendrils',
      referenceGeometry:'user-selected-r1280-reference',
      referenceGeometryR1280:'cellular-lobes-armored-pod-eye-segmented-tendrils',
      scheduler:'visible-only-request-animation-frame',
      pulse:()=>schedule(),
      physiology:()=>schedule(),
      surfacePulse:()=>schedule(),
      setMorph:()=>schedule(),
      setShape:()=>schedule(),
      toggleShape:()=>schedule(),
      rotateBy:(x,y)=>{
        rotationY+=Number(x||0)*.0018;
        rotationX+=Number(y||0)*.0015;
        schedule();
      },
      requestRender:schedule,
      destroy,
      canvas,
      stage,
      get energy(){return .68;},
      get openness(){return .12;},
      get morph(){return TARGET_PROGRESS;},
      get shape(){return 'r1280-reference';},
      get rotation(){return[rotationX,rotationY,0];},
      get vertexCount(){return 0;}
    };

    window.FormatXCoreMobileV69=api;
    window.FormatXLivingCore=api;

    root.dataset.fxR1280PermanentMagR1940='ready';
    root.dataset.fxCrystalOrganismR326='ready';
    root.dataset.fxLivingOrganicCoreR413='ready';
    root.dataset.fxLivingOrganicCoreR454='luminous-electric-single-webgl-ready';
    root.dataset.fxCoreMobileV69='ready-v69';
    root.dataset.fxCoreMobileV55='ready-v55';
    root.dataset.fxCoreReferenceLock='ready-v69';
    root.dataset.fxCoreReal3d='ready-v69';
    root.dataset.fxCoreRenderer='r1280-reference-owner-r1940';
    root.dataset.fxCoreGeometry='r1280-armored-pod-eye-segmented-tendrils';
    root.dataset.fxCoreMaterial='dark-bioglass-titanium-cyan-optic';
    root.dataset.fxCoreReferenceR1940='user-selected-reference-screenshot';
    root.dataset.fxCoreReal3dFps='60';

    try{engine.resize?.();}catch(_){}
    schedule();
    dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{
      version:'r1940',renderer:'r1280-reference-owner',revision:'r1280-reference',
      geometry:'armored-pod-eye-segmented-tendrils',interactive:true,organism:true,legacyFallback:false
    }}));
    addEventListener('pagehide',destroy,{once:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});
  else boot();
})();
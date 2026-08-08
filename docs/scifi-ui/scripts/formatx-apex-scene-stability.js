(function () {
  'use strict';
  const root=document.documentElement;
  if(root.dataset.fxApexSceneStability==='ready-v21')return;

  function ensureMobileCompositionStyle(){
    if(document.querySelector('link[data-fx-mobile-apex-composition]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./styles/formatx-mobile-apex-composition.css?v=20260808-core-mobile-1';
    link.dataset.fxMobileApexComposition='true';
    document.head.appendChild(link);
  }

  function ensureCinematicGrade(){
    if(document.querySelector('link[data-fx-core-cinematic-grade]'))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='./styles/formatx-core-cinematic-grade-v11c.css?v=20260809-reference-emissive-v1';
    link.dataset.fxCoreCinematicGrade='true';
    link.addEventListener('load',()=>{root.dataset.fxCoreCinematicGrade='reference-emissive-v1';},{once:true});
    link.addEventListener('error',()=>{root.dataset.fxCoreCinematicGrade='failed';},{once:true});
    document.head.appendChild(link);
  }

  function ensureTrueMeshAssets(){
    if(!document.querySelector('link[data-fx-core-mesh3d-style]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='./styles/formatx-core-mesh3d.css?v=20260809-true-mesh3d-v11';
      link.dataset.fxCoreMesh3dStyle='true';
      document.head.appendChild(link);
    }
    if(document.querySelector('script[data-fx-core-mesh3d-runtime]'))return;
    const script=document.createElement('script');
    script.src='./scripts/formatx-core-mesh3d-v11.js?v=20260809-cinematic-mesh3d-v11';
    script.async=false;
    script.dataset.fxCoreMesh3dRuntime='true';
    script.addEventListener('load',()=>{root.dataset.fxCoreMesh3dLoad='ready-v11';},{once:true});
    script.addEventListener('error',()=>{root.dataset.fxCoreMesh3dLoad='failed';},{once:true});
    document.head.appendChild(script);
  }

  function ensureFractureNetwork(){
    const existing=document.querySelector('script[data-fx-core-fracture3d-runtime]');
    if(existing){if(root.dataset.fxCoreFracture3d==='ready-v11')ensureCinematicGrade();return;}
    const script=document.createElement('script');
    script.src='./scripts/formatx-core-fracture3d-v11.js?v=20260809-cinematic-fracture3d-v11';
    script.async=false;
    script.dataset.fxCoreFracture3dRuntime='true';
    script.addEventListener('load',()=>{root.dataset.fxCoreFracture3dLoad='ready-v11';ensureCinematicGrade();},{once:true});
    script.addEventListener('error',()=>{root.dataset.fxCoreFracture3dLoad='failed';},{once:true});
    document.head.appendChild(script);
  }

  function ensureCinematicKick(){
    if(document.querySelector('script[data-fx-core-cinematic-kick]'))return;
    const script=document.createElement('script');
    script.src='./scripts/formatx-core-cinematic-kick-v11.js?v=20260809-cinematic-kick-v11b';
    script.async=false;
    script.dataset.fxCoreCinematicKick='true';
    script.addEventListener('load',()=>{root.dataset.fxCoreCinematicKickLoad='ready-v1';},{once:true});
    script.addEventListener('error',()=>{root.dataset.fxCoreCinematicKickLoad='failed';},{once:true});
    document.head.appendChild(script);
  }

  ensureMobileCompositionStyle();

  const Context=window.WebGL2RenderingContext;
  if(!Context||!Context.prototype){root.dataset.fxApexSceneStability='webgl2-unavailable';return;}

  const originalShaderSource=Context.prototype.shaderSource;
  const originalGetUniformLocation=Context.prototype.getUniformLocation;
  const originalUniform1f=Context.prototype.uniform1f;
  const sceneLocations=new WeakSet();
  let sections=[];
  let smoothedScene=null;
  let shaderPatched=false;

  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const smoothstep=value=>{const t=clamp(value,0,1);return t*t*(3-2*t);};

  function meshBackgroundShader(source){
    let next=source;
    next=next.replace(
      "vec2 core(vec3 p){\n        vec3 q=p;",
      "vec2 core(vec3 p){\n        if(uScene<.92)return vec2(10.,1.);\n        vec3 q=p;"
    );
    next=next.replace(
      "float angle=mix(-.035+sin(uTime*.11)*.022,travelAngle,1.-coreWeight);",
      "float angle=mix(.010+sin(uTime*.11)*.010,travelAngle,1.-coreWeight);"
    );
    next=next.replace(
      "float radius=mix(6.02,travelRadius,1.-coreWeight);",
      "float radius=mix(5.94,travelRadius,1.-coreWeight);"
    );
    next=next.replace(
      "float focal=mix(1.92,1.72,1.-coreWeight);",
      "float focal=mix(2.02,1.72,1.-coreWeight);"
    );
    next=next.replace(
      "float halo=exp(-3.2*coreDistance)*coreWeight;\n        float cross=(exp(-abs(uv.x)*105.)+exp(-abs(uv.y)*82.))*exp(-coreDistance*2.45)*coreWeight;\n        float auraRings=(exp(-abs(coreDistance-.125)*72.)+exp(-abs(coreDistance-.205)*58.)*.7+exp(-abs(coreDistance-.292)*48.)*.42)*coreWeight;\n        c+=halo*vec3(.038,.24,.38);\n        c+=cross*vec3(.12,.58,.88)*.31;\n        c+=auraRings*mix(vec3(.04,.38,.64),vec3(.36,.10,.72),sat(uScroll*.5))*.18;",
      "float meshBeat=.5+.5*sin(uTime*1.55);\n        float halo=exp(-3.85*coreDistance)*coreWeight;\n        float cross=(exp(-abs(uv.x)*176.)+exp(-abs(uv.y)*148.))*exp(-coreDistance*3.35)*coreWeight;\n        float waterMask=smoothstep(.46,.99,-uv.y)*coreWeight;\n        float waterRipple=.5+.5*sin(uv.y*168.+sin(uv.x*13.)*1.5+uTime*.24);\n        c+=halo*vec3(.008,.070,.135)*(.88+.12*meshBeat);\n        c+=cross*vec3(.08,.40,.66)*.060;\n        c+=waterMask*vec3(.003,.038,.070)*(.040+.050*waterRipple);"
    );
    return next;
  }

  Context.prototype.shaderSource=function patchedShaderSource(shader,source){
    if(!shaderPatched&&typeof source==='string'&&source.includes('vec2 core(vec3 p)')&&source.includes('uniform float uScene;')){
      const patched=meshBackgroundShader(source);
      const complete=[
        'if(uScene<.92)return vec2(10.,1.)',
        'float halo=exp(-3.85*coreDistance)*coreWeight',
        'float cross=(exp(-abs(uv.x)*176.)',
        'float angle=mix(.010+sin(uTime*.11)*.010'
      ].every(marker=>patched.includes(marker));
      if(patched!==source&&complete){
        shaderPatched=true;
        root.dataset.fxApexReferenceShader='mesh-background-reference-v21';
        root.dataset.fxSdfCore='disabled-before-scene-0.92';
        root.dataset.fxScreenSpaceReactor='retired-for-real-3d-reactor';
        source=patched;
        queueMicrotask(()=>{if(Context.prototype.shaderSource===patchedShaderSource)Context.prototype.shaderSource=originalShaderSource;});
      }else root.dataset.fxApexReferenceShader='patch-miss';
    }
    return originalShaderSource.call(this,shader,source);
  };

  function refreshSections(){sections=Array.from(document.querySelectorAll('main > .scene'));}
  function mappedScene(){
    if(sections.length<2)refreshSections();
    if(!sections.length)return 0;
    const probe=scrollY+innerHeight*.18;
    if(probe<=sections[0].offsetTop)return 0;
    for(let index=0;index<sections.length-1;index+=1){
      const start=sections[index].offsetTop,end=sections[index+1].offsetTop;
      if(probe>=end)continue;
      const raw=clamp((probe-start)/Math.max(1,end-start),0,1);
      return index+smoothstep((raw-.38)/.50);
    }
    return Math.max(0,sections.length-1);
  }

  Context.prototype.getUniformLocation=function patchedGetUniformLocation(program,name){
    const location=originalGetUniformLocation.call(this,program,name);
    if(location&&name==='uScene'&&this.canvas instanceof HTMLCanvasElement&&this.canvas.dataset.fxNativeApexCanvas==='true')sceneLocations.add(location);
    return location;
  };

  Context.prototype.uniform1f=function patchedUniform1f(location,value){
    if(location&&sceneLocations.has(location)){
      const target=mappedScene();
      if(smoothedScene===null||Math.abs(target-smoothedScene)>2.25)smoothedScene=target;
      else smoothedScene+=(target-smoothedScene)*.115;
      root.dataset.fxApexMappedScene=smoothedScene.toFixed(3);
      return originalUniform1f.call(this,location,smoothedScene);
    }
    return originalUniform1f.call(this,location,value);
  };

  addEventListener('resize',refreshSections,{passive:true});
  addEventListener('orientationchange',refreshSections,{passive:true});
  addEventListener('formatx:loop',()=>{smoothedScene=null;});
  addEventListener('formatx:nativeapexready',ensureTrueMeshAssets,{once:true});
  addEventListener('formatx:coremesh3dready',event=>{
    if(event.detail?.version==='v11'){
      ensureCinematicKick();
      ensureFractureNetwork();
    }
    root.dataset.fxNativeApexVisual=event.detail?.version==='v11'
      ?'cinematic-reference-graded-true-mesh3d-v21'
      :'reference-narrow-fractured-true-mesh3d-v19';
    root.dataset.fxNativeApexRenderer='webgl2-indexed-mesh-cinematic-plus-indexed-fracture-lines';
    root.dataset.fxCoreMobileComposition=root.dataset.fxNativeApexVisual;
  });

  if(root.dataset.fxNativeApex==='ready')ensureTrueMeshAssets();
  if(root.dataset.fxCoreMesh3d==='ready-v11'){
    ensureCinematicKick();
    ensureFractureNetwork();
  }
  if(root.dataset.fxCoreFracture3d==='ready-v11')ensureCinematicGrade();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshSections,{once:true});
  else refreshSections();

  root.dataset.fxApexSceneStability='ready-v21';
  root.dataset.fxCoreHold='stable-before-morph';
  root.dataset.fxCoreCinematicContract='film-reactive-v1-frame-independent-wake';
  root.dataset.fxCoreMobileComposition='true-mesh3d-v11-plus-kick-v11b-plus-fracture-v11-plus-reference-grade-pending';
}());
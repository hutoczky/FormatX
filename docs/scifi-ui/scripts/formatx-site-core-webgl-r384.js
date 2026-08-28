(function(){
'use strict';

const root=document.documentElement;
const VERSION='site-core-webgl-r384';
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

if(root.dataset.fxSiteCoreWebglR384==='ready'||root.dataset.fxSiteCoreWebglR384==='booting')return;
root.dataset.fxSiteCoreWebglR384='booting';
root.dataset.fxSiteIsCoreR384='true';
root.dataset.fxSiteCoreArchitectureR384='whole-page-real-webgl-environment';

function compile(gl,type,source){
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    const message=gl.getShaderInfoLog(shader)||'site-core shader compile failed';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function link(gl,vs,fs){
  const program=gl.createProgram();
  const vertex=compile(gl,gl.VERTEX_SHADER,vs);
  const fragment=compile(gl,gl.FRAGMENT_SHADER,fs);
  gl.attachShader(program,vertex);
  gl.attachShader(program,fragment);
  gl.bindAttribLocation(program,0,'aPosition');
  gl.bindAttribLocation(program,1,'aBand');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    const message=gl.getProgramInfoLog(program)||'site-core program link failed';
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function geometry(){
  const positions=[];
  const bands=[];
  const rings=8;
  const sides=8;
  const rows=[];
  for(let ring=0;ring<rings;ring+=1){
    const z=-.38-ring*.49;
    const radius=.64+Math.sin(ring*.91)*.075;
    const twist=ring*.205;
    const row=[];
    for(let side=0;side<sides;side+=1){
      const angle=side/sides*Math.PI*2+twist;
      row.push([Math.cos(angle)*radius,Math.sin(angle)*radius*.72,z]);
    }
    rows.push(row);
  }
  function line(a,b,band){
    positions.push(a[0],a[1],a[2],b[0],b[1],b[2]);
    bands.push(band,band);
  }
  for(let ring=0;ring<rings;ring+=1){
    for(let side=0;side<sides;side+=1){
      line(rows[ring][side],rows[ring][(side+1)%sides],ring/(rings-1));
      if(ring<rings-1){
        line(rows[ring][side],rows[ring+1][side],ring/(rings-1));
        if(side%2===0)line(rows[ring][side],rows[ring+1][(side+1)%sides],(ring+.5)/(rings-1));
      }
    }
  }
  for(let scene=0;scene<6;scene+=1){
    const y=.82-scene*.325;
    const z=-1.08-scene*.18;
    line([-.84,y,z],[.84,y,z],scene/5);
  }
  return{positions:new Float32Array(positions),bands:new Float32Array(bands),count:positions.length/3};
}

function boot(){
  if(!document.body){requestAnimationFrame(boot);return;}
  if(document.querySelector('canvas[data-fx-site-core-webgl-r384]'))return;

  const canvas=document.createElement('canvas');
  canvas.className='fx-site-core-webgl-r384';
  canvas.dataset.fxSiteCoreWebglR384='true';
  canvas.setAttribute('aria-hidden','true');
  Object.assign(canvas.style,{
    position:'fixed',inset:'0',width:'100vw',height:'100dvh',maxWidth:'100vw',maxHeight:'100dvh',
    zIndex:'2',pointerEvents:'none',opacity:mobile?'.18':'.25',background:'transparent',mixBlendMode:'screen'
  });
  document.body.prepend(canvas);

  const options={alpha:true,antialias:!mobile,depth:true,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:mobile?'default':'high-performance'};
  let gl=canvas.getContext('webgl2',options);
  const webgl2=Boolean(gl);
  if(!gl)gl=canvas.getContext('webgl',options);
  if(!gl){canvas.remove();root.dataset.fxSiteCoreWebglR384='context-unavailable';return;}

  const vertexBody=`
    precision highp float;
    attribute vec3 aPosition;
    attribute float aBand;
    uniform vec2 uPointer;
    uniform float uScroll;
    uniform float uScene;
    uniform float uEnergy;
    uniform float uAspect;
    varying float vDepth;
    varying float vBand;
    varying float vEnergy;
    mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
    mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
    void main(){
      vec3 p=aPosition;
      p.z+=sin(uScroll*6.2831853)*.17;
      p.y+=(uScene-2.5)*.018;
      p=ry(uPointer.x*.20+uScroll*.075)*rx(-uPointer.y*.13)*p;
      float camera=3.9-p.z;
      vec2 projected=vec2(p.x/max(.68,uAspect),p.y)*2.72;
      gl_Position=vec4(projected,p.z*.10,camera);
      vDepth=clamp((p.z+4.2)/3.9,0.,1.);
      vBand=aBand;
      vEnergy=uEnergy;
    }
  `;

  const fragmentBody=`
    precision highp float;
    uniform float uScene;
    varying float vDepth;
    varying float vBand;
    varying float vEnergy;
    void main(){
      vec3 cyan=vec3(.20,.82,1.00);
      vec3 blue=vec3(.16,.48,.90);
      vec3 violet=vec3(.55,.27,.94);
      vec3 mint=vec3(.28,1.00,.78);
      float phase=clamp(uScene/5.0,0.,1.);
      vec3 cold=mix(cyan,blue,smoothstep(0.,.42,phase));
      vec3 hot=mix(violet,mint,smoothstep(.45,1.,phase));
      vec3 colour=mix(cold,hot,smoothstep(.32,.78,phase));
      float bandFocus=.58+.42*(1.0-abs(vBand-phase));
      float alpha=(.032+.050*vDepth+.026*vEnergy)*bandFocus;
      ${webgl2?'outColor':'gl_FragColor'}=vec4(colour,alpha);
    }
  `;

  const vertexSource=webgl2
    ?`#version 300 es\n${vertexBody.replace('attribute vec3 aPosition;','layout(location=0) in vec3 aPosition;').replace('attribute float aBand;','layout(location=1) in float aBand;').replace('varying float vDepth;','out float vDepth;').replace('varying float vBand;','out float vBand;').replace('varying float vEnergy;','out float vEnergy;')}`
    :vertexBody;
  const fragmentSource=webgl2
    ?`#version 300 es\nprecision highp float;\nin float vDepth;\nin float vBand;\nin float vEnergy;\nout vec4 outColor;\n${fragmentBody.replace('precision highp float;','').replace('varying float vDepth;','').replace('varying float vBand;','').replace('varying float vEnergy;','')}`
    :fragmentBody;

  let program;
  try{program=link(gl,vertexSource,fragmentSource);}catch(error){
    console.warn('FormatX whole-site WebGL unavailable:',error);
    canvas.remove();root.dataset.fxSiteCoreWebglR384='shader-failed';return;
  }

  const mesh=geometry();
  const positionBuffer=gl.createBuffer();
  const bandBuffer=gl.createBuffer();
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,mesh.positions,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,bandBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,mesh.bands,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1,1,gl.FLOAT,false,0,0);

  const uniforms={};
  ['uPointer','uScroll','uScene','uEnergy','uAspect'].forEach(name=>uniforms[name]=gl.getUniformLocation(program,name));
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0,0,0,0);

  let disposed=false;
  let raf=0;
  let burst=0;
  let width=0,height=0;
  let px=0,py=0,tx=0,ty=0;
  let scroll=.0,targetScroll=.0;
  let scene=0,targetScene=0;
  let energy=.18,targetEnergy=.18;
  let last=performance.now();
  let pointerQueued=false;
  let scrollQueued=false;

  function resize(){
    const dpr=Math.min(devicePixelRatio||1,mobile?1.0:1.2);
    const budget=mobile?360000:700000;
    let w=Math.max(2,Math.round(innerWidth*dpr));
    let h=Math.max(2,Math.round((visualViewport?.height||innerHeight)*dpr));
    if(w*h>budget){const k=Math.sqrt(budget/(w*h));w=Math.round(w*k);h=Math.round(h*k);}
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    width=w;height=h;gl.viewport(0,0,w,h);
    root.dataset.fxSiteCoreResolutionR384=`${w}x${h}`;
  }

  function blocked(){return disposed||document.hidden;}
  function schedule(frames=1){
    if(blocked())return;
    burst=Math.max(burst,Math.min(12,Math.max(1,frames)));
    if(!raf)raf=requestAnimationFrame(frame);
  }

  function applyDomState(){
    root.style.setProperty('--fx-site-core-rot-x',`${(-py*(mobile?1.1:1.6)).toFixed(2)}deg`);
    root.style.setProperty('--fx-site-core-rot-y',`${(px*(mobile?1.3:2.0)).toFixed(2)}deg`);
    root.style.setProperty('--fx-site-core-depth',`${(energy*5).toFixed(2)}px`);
  }

  function render(now){
    const dt=Math.min(48,Math.max(1,now-last));last=now;
    const k=Math.min(1,dt*.018);
    px+=(tx-px)*k;py+=(ty-py)*k;
    scroll+=(targetScroll-scroll)*Math.min(1,dt*.016);
    scene+=(targetScene-scene)*Math.min(1,dt*.020);
    energy+=(targetEnergy-energy)*Math.min(1,dt*.024);
    targetEnergy+=(.18-targetEnergy)*Math.min(1,dt*.006);

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform2f(uniforms.uPointer,px,py);
    gl.uniform1f(uniforms.uScroll,scroll);
    gl.uniform1f(uniforms.uScene,scene);
    gl.uniform1f(uniforms.uEnergy,energy);
    gl.uniform1f(uniforms.uAspect,width/Math.max(1,height));
    gl.drawArrays(gl.LINES,0,mesh.count);
    applyDomState();
  }

  function frame(now){
    raf=0;if(blocked())return;
    render(now);
    burst=Math.max(0,burst-1);
    const unsettled=Math.abs(tx-px)>.003||Math.abs(ty-py)>.003||Math.abs(targetScroll-scroll)>.002||Math.abs(targetScene-scene)>.01||Math.abs(targetEnergy-energy)>.006;
    if(burst>0||unsettled)raf=requestAnimationFrame(frame);
  }

  function updateScroll(){
    scrollQueued=false;
    const max=Math.max(1,document.documentElement.scrollHeight-(visualViewport?.height||innerHeight));
    targetScroll=clamp(scrollY/max,0,1);
    targetEnergy=Math.max(targetEnergy,.28);
    schedule(5);
  }

  function updatePointer(event){
    if(!event.isTrusted)return;
    tx=clamp(event.clientX/Math.max(1,innerWidth)*2-1,-1,1);
    ty=clamp(-(event.clientY/Math.max(1,(visualViewport?.height||innerHeight))*2-1),-1,1);
    targetEnergy=Math.max(targetEnergy,event.type==='pointerdown'?.55:.31);
    schedule(event.type==='pointerdown'?8:4);
  }

  function onPointerMove(event){
    if(pointerQueued)return;
    pointerQueued=true;
    requestAnimationFrame(()=>{pointerQueued=false;updatePointer(event);});
  }
  function onScroll(){
    if(scrollQueued)return;
    scrollQueued=true;
    requestAnimationFrame(updateScroll);
  }
  function onSystemState(event){
    const next=Number(event.detail?.state?.scene);
    if(Number.isFinite(next))targetScene=clamp(next,0,5);
    targetEnergy=Math.max(targetEnergy,.44);
    schedule(7);
  }
  function onCoreInteraction(event){
    if(Number.isFinite(event.detail?.x))tx=clamp(event.detail.x,-1,1);
    if(Number.isFinite(event.detail?.y))ty=clamp(event.detail.y,-1,1);
    targetEnergy=Math.max(targetEnergy,event.detail?.phase==='drag'?.50:.70);
    schedule(event.detail?.phase==='drag'?7:10);
  }

  const scenes=[...document.querySelectorAll('main .scene')];
  const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    scenes.forEach(sceneNode=>sceneNode.removeAttribute('data-fx-site-core-active'));
    visible.target.setAttribute('data-fx-site-core-active','true');
    const index=scenes.indexOf(visible.target);
    if(index>=0){targetScene=clamp(index,0,5);schedule(6);}
  },{threshold:[.22,.42,.62],rootMargin:'-10% 0px -20% 0px'}):null;
  scenes.forEach(sceneNode=>observer?.observe(sceneNode));

  addEventListener('pointermove',onPointerMove,{passive:true});
  addEventListener('pointerdown',updatePointer,{passive:true});
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('formatx:systemstate',onSystemState,{passive:true});
  addEventListener('formatx:coreinteraction',onCoreInteraction,{passive:true});
  addEventListener('resize',()=>{resize();schedule(2);},{passive:true});
  visualViewport?.addEventListener('resize',()=>{resize();schedule(2);},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(2);},{passive:true});

  function destroy(){
    if(disposed)return;disposed=true;
    if(raf)cancelAnimationFrame(raf);
    observer?.disconnect();
    gl.deleteBuffer(positionBuffer);gl.deleteBuffer(bandBuffer);gl.deleteProgram(program);
    canvas.remove();
  }

  resize();updateScroll();schedule(reduced.matches?1:4);
  window.FormatXSiteCoreR384={version:VERSION,renderer:'whole-page-webgl-network',requestRender:schedule,destroy,canvas};
  root.dataset.fxSiteCoreWebglR384='ready';
  root.dataset.fxSiteCoreSchedulerR384='event-driven-no-idle-loop';
  root.dataset.fxSiteCoreInputR384='scroll-pointer-touch-scene-coupled';
  dispatchEvent(new CustomEvent('formatx:sitecoreready',{detail:{version:VERSION,webgl:webgl2?'webgl2':'webgl1'}}));
  addEventListener('pagehide',destroy,{once:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
}());

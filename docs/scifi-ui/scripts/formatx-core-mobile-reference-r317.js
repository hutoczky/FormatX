(function(){
'use strict';

const root=document.documentElement;
const READY='ready-v69';
const VERSION='reference-crystal-webgl-r317-modern-flat-normal-fresnel';
if(root.dataset.fxCoreMobileR317===READY||root.dataset.fxCoreMobileR317==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxCoreMobileR317='audit-skip';
  return;
}
root.dataset.fxCoreMobileR317='booting';
root.dataset.fxCoreQualityR317='modern-flat-normal-fresnel-microfacet';
root.dataset.fxCoreSchedulerR317='bounded-interaction-bursts-no-idle-raf';

const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function compile(gl,type,source){
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    const message=gl.getShaderInfoLog(shader)||'shader compile failed';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function link(gl,vsSource,fsSource){
  const program=gl.createProgram();
  const vs=compile(gl,gl.VERTEX_SHADER,vsSource);
  const fs=compile(gl,gl.FRAGMENT_SHADER,fsSource);
  gl.attachShader(program,vs);
  gl.attachShader(program,fs);
  gl.bindAttribLocation(program,0,'aPos');
  gl.bindAttribLocation(program,1,'aNormal');
  gl.bindAttribLocation(program,2,'aPolar');
  gl.bindAttribLocation(program,3,'aBary');
  gl.bindAttribLocation(program,4,'aFacet');
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    const message=gl.getProgramInfoLog(program)||'program link failed';
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function boot(attempt=0){
  const hero=document.getElementById('hero');
  const host=hero&&hero.querySelector('.hero-space');
  if(!hero||!host){
    if(attempt<180)return requestAnimationFrame(()=>boot(attempt+1));
    root.dataset.fxCoreMobileR317='host-unavailable';
    return;
  }

  window.FormatXCoreMobileV69?.destroy?.();
  document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(node=>node.remove());

  const stage=document.createElement('div');
  stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage fx-core-r112-stage fx-core-r120-stage fx-core-r317-stage';
  stage.dataset.active='true';
  stage.dataset.renderer='reference-r317-modern-crystal';
  stage.setAttribute('aria-hidden','true');
  host.prepend(stage);

  const canvas=document.createElement('canvas');
  canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas fx-core-r112-canvas fx-core-r120-canvas fx-core-r317-canvas';
  canvas.setAttribute('aria-hidden','true');
  stage.append(canvas);

  let gl=canvas.getContext('webgl2',{
    alpha:true,antialias:true,depth:true,stencil:false,
    premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance'
  });
  const webgl2=!!gl;
  if(!gl)gl=canvas.getContext('webgl',{
    alpha:true,antialias:true,depth:true,stencil:false,
    premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance'
  });
  if(!gl){
    stage.remove();
    root.dataset.fxCoreMobileR317='context-unavailable';
    root.dataset.fxCoreReal3d='context-unavailable';
    dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'webgl-unavailable',reference:'r317'}}));
    return;
  }

  const vsBody=`
precision highp float;
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec2 aPolar;
attribute vec3 aBary;
attribute float aFacet;
uniform float uTime;
uniform float uEnergy;
uniform vec2 uPointer;
varying vec3 vP;
varying vec3 vN;
varying vec2 vPolar;
varying vec3 vBary;
varying float vFacet;
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
void main(){
  float breathe=1.0+0.0055*sin(uTime*0.72)+0.0020*sin(uTime*1.37);
  mat3 R=ry(uPointer.x*0.24+0.018*sin(uTime*0.19))*rx(-uPointer.y*0.17+0.012*cos(uTime*0.16));
  vec3 p=R*(aPos*breathe);
  vec3 n=normalize(R*aNormal);
  float z=3.15-p.z*0.84;
  float k=2.48/z;
  vec2 q=vec2(p.x*0.94,p.y*0.84)*k;
  q.y+=0.012;
  gl_Position=vec4(q,p.z*0.13,1.0);
  vP=p;
  vN=n;
  vPolar=aPolar;
  vBary=aBary;
  vFacet=aFacet;
}`;

  const fsBody=`
precision highp float;
uniform float uTime;
uniform float uEnergy;
uniform vec2 uPointer;
varying vec3 vP;
varying vec3 vN;
varying vec2 vPolar;
varying vec3 vBary;
varying float vFacet;
float sat(float x){return clamp(x,0.0,1.0);}
float ridge(float x,float p){return pow(sat(1.0-abs(fract(x)-0.5)*2.0),p);}
float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
void main(){
  float r=vPolar.x;
  float a=vPolar.y;
  vec3 N=normalize(vN);
  vec3 V=normalize(vec3(-vP.x*0.10,-vP.y*0.08,1.75-vP.z));
  vec3 L1=normalize(vec3(-0.58,0.72,1.10));
  vec3 L2=normalize(vec3(0.72,-0.26,0.82));
  float nd1=max(dot(N,L1),0.0);
  float nd2=max(dot(N,L2),0.0);
  float fres=pow(1.0-sat(abs(dot(N,V))),2.65);
  float spec1=pow(max(dot(reflect(-L1,N),V),0.0),38.0);
  float spec2=pow(max(dot(reflect(-L2,N),V),0.0),24.0);
  float thickness=pow(sat(1.0-r),0.50);
  float depth=sat(0.32+0.82*thickness+0.24*vP.z);

  vec3 deep=vec3(0.002,0.010,0.035);
  vec3 blue=vec3(0.010,0.105,0.42);
  vec3 cyan=vec3(0.015,0.92,1.58);
  vec3 ice=vec3(0.82,1.18,1.52);
  vec3 violet=vec3(0.48,0.08,1.05);

  float spectral=0.5+0.5*sin(a*3.15+N.x*5.2-N.y*3.4+vFacet*5.7+uPointer.x*0.65-uPointer.y*0.35);
  vec3 refr=mix(cyan,violet,spectral*0.38);
  vec3 col=mix(deep,blue,0.34+0.54*depth);
  col+=refr*(0.11+0.31*thickness);
  col+=cyan*(nd1*0.22)+ice*(nd1*0.16+nd2*0.10);
  col+=violet*nd2*0.11;

  float bary=min(vBary.x,min(vBary.y,vBary.z));
  float facetEdge=1.0-smoothstep(0.010,0.047,bary);
  col+=mix(cyan,ice,0.42)*facetEdge*(0.018+0.060*fres);

  float ca1=ridge(vP.x*4.25+vP.y*1.75+N.x*0.9,18.0);
  float ca2=ridge(vP.y*5.45-vP.x*1.35+N.y*0.8,22.0);
  float ca3=ridge((vP.x-vP.y)*3.85+N.z*1.35,20.0);
  float caustic=(ca1*0.52+ca2*0.40+ca3*0.30)*thickness*(1.0-smoothstep(0.82,1.0,r));
  col+=cyan*caustic*0.32+ice*caustic*0.16+violet*caustic*0.08;

  float core=exp(-dot(vP.xy,vP.xy)*18.0);
  float coreHot=exp(-dot(vP.xy,vP.xy)*92.0);
  float corePin=exp(-dot(vP.xy,vP.xy)*520.0);
  col+=cyan*(core*0.46+coreHot*0.58)+ice*(coreHot*0.52+corePin*2.10)+violet*core*0.10;

  float outer=1.0-smoothstep(0.025,0.095,abs(1.0-r));
  col+=cyan*outer*(0.32+0.36*fres)+ice*outer*0.12+violet*outer*(0.05+0.13*spectral);

  float glint=(spec1*1.15+spec2*0.72)*(0.45+0.55*vFacet);
  col+=ice*glint*1.25+cyan*glint*0.36;
  col+=mix(cyan,violet,spectral)*fres*(0.24+0.26*thickness);

  float micro=pow(hash21(floor((vP.xy+2.0)*32.0)+vFacet),26.0);
  col+=ice*micro*fres*0.18;

  float energy=0.94+uEnergy*0.22;
  col*=energy;
  col=col/(vec3(1.0)+col*0.68);
  col=pow(max(col,vec3(0.0)),vec3(0.86));

  float alpha=0.30+0.25*thickness+0.26*fres+0.11*nd1+0.12*outer+0.12*core+0.13*glint;
  alpha*=1.0-smoothstep(1.015,1.055,r);
  gl_FragColor=vec4(col,clamp(alpha,0.0,0.94));
}`;

  const vs=webgl2?`#version 300 es\n${vsBody
    .replace(/attribute/g,'in')
    .replace(/varying vec3 vP;/,'out vec3 vP;')
    .replace(/varying vec3 vN;/,'out vec3 vN;')
    .replace(/varying vec2 vPolar;/,'out vec2 vPolar;')
    .replace(/varying vec3 vBary;/,'out vec3 vBary;')
    .replace(/varying float vFacet;/,'out float vFacet;')}`:vsBody;

  const fs=webgl2?`#version 300 es\n${fsBody
    .replace(/varying vec3 vP;/,'in vec3 vP;')
    .replace(/varying vec3 vN;/,'in vec3 vN;')
    .replace(/varying vec2 vPolar;/,'in vec2 vPolar;')
    .replace(/varying vec3 vBary;/,'in vec3 vBary;')
    .replace(/varying float vFacet;/,'in float vFacet;')
    .replace(/void main\(\)\{/,'out vec4 outColor;\nvoid main(){')
    .replace(/gl_FragColor=vec4\(([^;]+)\);/,'outColor=vec4($1);')}`:fsBody;

  let program;
  try{program=link(gl,vs,fs);}catch(error){
    console.error(error);
    stage.remove();
    root.dataset.fxCoreMobileR317='shader-failed';
    root.dataset.fxCoreReal3d='shader-failed';
    dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'shader-failed',reference:'r317'}}));
    return;
  }

  const SEG=mobile?96:112;
  const RINGS=mobile?28:34;
  const vertices=[];
  const polar=[];
  const normals=[];
  const bary=[];
  const facets=[];
  const points=[];
  const pointPolar=[];

  function boundary(angle){
    const p=0.78;
    const c=Math.abs(Math.cos(angle));
    const s=Math.abs(Math.sin(angle));
    return 1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);
  }
  function rand(x,y){
    const q=Math.sin(x*127.1+y*311.7)*43758.5453123;
    return q-Math.floor(q);
  }
  function pointAt(ring,index){
    const r=ring/RINGS;
    const a=index/SEG*Math.PI*2;
    const b=boundary(a);
    const radial=Math.pow(r,0.93);
    const sculpt=1.0+(0.010*Math.sin(a*8.0+ring*0.73)+0.006*Math.sin(a*13.0-ring*0.51))*Math.pow(1.0-r,0.72);
    const q=radial*sculpt*b;
    let x=Math.cos(a)*q*0.90;
    let y=Math.sin(a)*q;
    y*=y>=0?1.20:0.96;
    const shoulder=0.61*Math.pow(1.0-r,0.82);
    const four=0.78+0.22*Math.pow(Math.cos(a*2.0),2.0);
    const crown=0.036*Math.sin(a*4.0)*Math.pow(1.0-r,1.25);
    const z=shoulder*four+crown;
    return [x,y,z,r,a];
  }

  for(let j=0;j<=RINGS;j++){
    for(let i=0;i<SEG;i++){
      const p=pointAt(j,i);
      points.push(p[0],p[1],p[2]);
      pointPolar.push(p[3],p[4]);
    }
  }

  function cross(ax,ay,az,bx,by,bz){
    return [ay*bz-az*by,az*bx-ax*bz,ax*by-ay*bx];
  }
  function emitTriangle(ia,ib,ic,facet){
    const ids=[ia,ib,ic];
    const ax=points[ia*3],ay=points[ia*3+1],az=points[ia*3+2];
    const bx=points[ib*3],by=points[ib*3+1],bz=points[ib*3+2];
    const cx=points[ic*3],cy=points[ic*3+1],cz=points[ic*3+2];
    let n=cross(bx-ax,by-ay,bz-az,cx-ax,cy-ay,cz-az);
    const len=Math.hypot(n[0],n[1],n[2])||1;
    n=[n[0]/len,n[1]/len,n[2]/len];
    if(n[2]<-0.92)n=[-n[0],-n[1],-n[2]];
    const bc=[[1,0,0],[0,1,0],[0,0,1]];
    ids.forEach((id,k)=>{
      vertices.push(points[id*3],points[id*3+1],points[id*3+2]);
      normals.push(n[0],n[1],n[2]);
      polar.push(pointPolar[id*2],pointPolar[id*2+1]);
      bary.push(bc[k][0],bc[k][1],bc[k][2]);
      facets.push(facet);
    });
  }

  for(let j=0;j<RINGS;j++){
    for(let i=0;i<SEG;i++){
      const a=j*SEG+i;
      const b=j*SEG+(i+1)%SEG;
      const c=(j+1)*SEG+i;
      const d=(j+1)*SEG+(i+1)%SEG;
      const f1=0.12+0.88*rand(i*1.17,j*2.31);
      const f2=0.12+0.88*rand(i*1.83+17,j*2.77+9);
      if(((i+j)&1)===0){
        emitTriangle(a,c,b,f1);
        emitTriangle(b,c,d,f2);
      }else{
        emitTriangle(a,c,d,f1);
        emitTriangle(a,d,b,f2);
      }
    }
  }

  const arrays=[
    new Float32Array(vertices),
    new Float32Array(normals),
    new Float32Array(polar),
    new Float32Array(bary),
    new Float32Array(facets)
  ];
  const sizes=[3,3,2,3,1];
  const buffers=arrays.map(()=>gl.createBuffer());
  gl.useProgram(program);
  arrays.forEach((data,index)=>{
    gl.bindBuffer(gl.ARRAY_BUFFER,buffers[index]);
    gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index,sizes[index],gl.FLOAT,false,0,0);
  });

  const U={
    time:gl.getUniformLocation(program,'uTime'),
    energy:gl.getUniformLocation(program,'uEnergy'),
    pointer:gl.getUniformLocation(program,'uPointer')
  };

  gl.clearColor(0,0,0,0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

  let disposed=false;
  let visible=true;
  let paused=false;
  let raf=0;
  let burstFrames=0;
  let energy=0.28;
  let targetEnergy=0.28;
  let px=0,py=0,tx=0,ty=0;
  let width=0,height=0;
  let last=performance.now();
  let frameAverage=16.7;

  const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};
  cinematic.version=VERSION;
  cinematic.corePosition=[0,0,0.55];
  cinematic.energy=energy;

  function resize(){
    const rect=stage.getBoundingClientRect();
    if(rect.width<2||rect.height<2)return false;
    const cap=mobile?1.78:1.92;
    const budget=mobile?1250000:1900000;
    const dpr=Math.min(devicePixelRatio||1,cap);
    let w=Math.max(2,Math.round(rect.width*dpr));
    let h=Math.max(2,Math.round(rect.height*dpr));
    const pixels=w*h;
    if(pixels>budget){
      const scale=Math.sqrt(budget/pixels);
      w=Math.max(2,Math.round(w*scale));
      h=Math.max(2,Math.round(h*scale));
    }
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    width=w;height=h;
    gl.viewport(0,0,width,height);
    root.dataset.fxCoreReal3dResolution=`${width}x${height}`;
    root.dataset.fxCoreQualityResolutionR317=`dpr-cap-${cap}`;
    return true;
  }

  function schedule(frames=1){
    if(disposed||document.hidden||!visible||paused||root.dataset.fxReferenceMotionPaused==='true')return;
    burstFrames=Math.max(burstFrames,Math.min(14,Math.max(1,frames)));
    if(!raf)raf=requestAnimationFrame(frame);
  }

  function render(now){
    const start=performance.now();
    const dt=Math.min(40,Math.max(1,now-last));
    last=now;
    px+=(tx-px)*Math.min(1,dt*0.012);
    py+=(ty-py)*Math.min(1,dt*0.012);
    energy+=(targetEnergy-energy)*Math.min(1,dt*0.018);
    targetEnergy+=(0.28-targetEnergy)*Math.min(1,dt*0.009);
    cinematic.energy=energy;

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform1f(U.time,now*0.001);
    gl.uniform1f(U.energy,energy);
    gl.uniform2f(U.pointer,px,py);
    gl.drawArrays(gl.TRIANGLES,0,vertices.length/3);

    const elapsed=performance.now()-start;
    frameAverage=frameAverage*0.90+elapsed*0.10;
    root.dataset.fxCoreRenderMs=frameAverage.toFixed(2);
    root.dataset.fxCoreFrameMs=dt.toFixed(2);
  }

  function frame(now){
    raf=0;
    if(disposed||document.hidden||!visible||paused)return;
    render(now);
    burstFrames=Math.max(0,burstFrames-1);
    if(burstFrames>0||Math.abs(tx-px)>0.003||Math.abs(ty-py)>0.003||Math.abs(targetEnergy-energy)>0.006){
      raf=requestAnimationFrame(frame);
    }
  }

  function setPointer(x,y,frames=8){
    tx=clamp(Number(x)||0,-1,1);
    ty=clamp(Number(y)||0,-1,1);
    schedule(frames);
  }

  function pulse(amount=0.74){
    targetEnergy=Math.max(targetEnergy,clamp(Number(amount)||0.74,0.40,1.0));
    schedule(12);
  }

  function pointFromEvent(event){
    const rect=stage.getBoundingClientRect();
    if(rect.width<2||rect.height<2)return null;
    const x=((event.clientX-rect.left)/rect.width-0.5)*2;
    const y=-((event.clientY-rect.top)/rect.height-0.5)*2;
    return{x:clamp(x,-1,1),y:clamp(y,-1,1)};
  }

  function onPointerMove(event){
    if(event.pointerType==='touch')return;
    const point=pointFromEvent(event);
    if(point)setPointer(point.x,point.y,5);
  }
  function onPointerDown(event){
    const point=pointFromEvent(event);
    if(point)setPointer(point.x,point.y,10);
    pulse(0.88);
  }
  function onCoreInteraction(event){
    const detail=event.detail||{};
    if(Number.isFinite(detail.x)&&Number.isFinite(detail.y))setPointer(detail.x,detail.y,10);
    pulse(detail.phase==='drag'?0.72:0.90);
  }
  function onPause(event){
    paused=event.detail?.paused===true||root.dataset.fxReferenceMotionPaused==='true';
    if(!paused)schedule(2);
  }

  addEventListener('pointermove',onPointerMove,{passive:true});
  addEventListener('pointerdown',onPointerDown,{passive:true});
  addEventListener('formatx:coreinteraction',onCoreInteraction,{passive:true});
  addEventListener('formatx:referencepause',onPause,{passive:true});
  addEventListener('pageshow',()=>schedule(2),{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(2);},{passive:true});

  const ro=new ResizeObserver(()=>{if(resize())schedule(2);});
  ro.observe(stage);
  const io=new IntersectionObserver(entries=>{
    visible=entries.some(entry=>entry.isIntersecting);
    if(visible)schedule(2);
    else if(raf){cancelAnimationFrame(raf);raf=0;}
  },{rootMargin:'160px'});
  io.observe(stage);

  function destroy(){
    if(disposed)return;
    disposed=true;
    if(raf)cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    removeEventListener('pointermove',onPointerMove);
    removeEventListener('pointerdown',onPointerDown);
    removeEventListener('formatx:coreinteraction',onCoreInteraction);
    removeEventListener('formatx:referencepause',onPause);
    buffers.forEach(buffer=>gl.deleteBuffer(buffer));
    gl.deleteProgram(program);
    stage.remove();
  }

  resize();
  const api={
    version:VERSION,
    renderer:'single-webgl-luminous-crystal-r99',
    material:'luminous-faceted-iceglass-caustic-r99',
    quality:'modern-flat-normal-fresnel-microfacet-r317',
    scheduler:'bounded-interaction-bursts-no-idle-raf',
    pulse,
    setPointer,
    requestRender:schedule,
    destroy,
    canvas,
    stage
  };
  window.FormatXCoreMobileV69=api;

  root.dataset.fxCoreMobileR99=READY;
  root.dataset.fxCoreMobileV69=READY;
  root.dataset.fxCoreMobileV55='ready-v55';
  root.dataset.fxCoreMobileR317=READY;
  root.dataset.fxCoreReal3d='visible-native-3d-r99';
  root.dataset.fxCoreRenderer='single-webgl-luminous-crystal-r99';
  root.dataset.fxCoreReferenceLock='ready-v69';
  root.dataset.fxCoreMaterial='luminous-faceted-iceglass-caustic-r99';
  root.dataset.fxCoreInteraction='touch-pointer-breathing-spectral-refraction-r99';
  root.dataset.fxCoreScheduler='bounded-interaction-bursts-no-idle-raf';
  root.dataset.fxCoreVisualGenerationR317='modern-crystal-not-retro-wireframe';
  root.dataset.fxCoreTriangleCountR317=String(vertices.length/9);

  schedule(8);
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{renderer:VERSION,quality:'r317-modern-crystal'}}));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});
else boot();
}());

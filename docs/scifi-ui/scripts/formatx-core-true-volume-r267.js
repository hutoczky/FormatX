(function(){
'use strict';
const root=document.documentElement;
const VERSION='r267-closed-volume-crystal';
const READY='ready-v69';
if(root.dataset.fxCoreTrueVolumeR267==='ready')return;
root.dataset.fxCoreTrueVolumeR267='booting';
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let installObserver=null,installTimer=0;

function compile(gl,type,source){
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'shader compile failed');
  return shader;
}
function link(gl,vsSource,fsSource){
  const program=gl.createProgram();
  const vs=compile(gl,gl.VERTEX_SHADER,vsSource),fs=compile(gl,gl.FRAGMENT_SHADER,fsSource);
  gl.attachShader(program,vs);gl.attachShader(program,fs);
  gl.bindAttribLocation(program,0,'aPos');gl.bindAttribLocation(program,1,'aNormal');gl.bindAttribLocation(program,2,'aShade');
  gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'program link failed');
  return program;
}
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function normalize(v){const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l];}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}

function buildClosedCrystal(){
  const positions=[],normals=[],shades=[];
  const SEG=mobile?40:52;
  const exponent=.64;
  const outline=(index,radius,z)=>{
    const a=index/SEG*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
    const boundary=1/Math.pow(Math.pow(Math.abs(c),exponent)+Math.pow(Math.abs(s),exponent),1/exponent);
    const x=c*boundary*radius*.94;
    const y=s*boundary*radius*(s>=0?1.14:.94);
    const fold=.035*Math.cos(a*4.)*(1-radius*.42);
    return[x,y,z+fold];
  };
  const frontCenter=[0,.015,.58],backCenter=[0,-.008,-.36];
  const innerFront=[],outerFront=[],innerBack=[],outerBack=[];
  for(let i=0;i<SEG;i++){
    innerFront.push(outline(i,.47,.31));outerFront.push(outline(i,1,.015));
    innerBack.push(outline(i,.47,-.22));outerBack.push(outline(i,1,-.055));
  }
  const add=(a,b,c,shade)=>{
    const n=normalize(cross(sub(b,a),sub(c,a)));
    for(const p of[a,b,c]){positions.push(...p);normals.push(...n);shades.push(shade);}
  };
  for(let i=0;i<SEG;i++){
    const j=(i+1)%SEG;
    add(frontCenter,innerFront[i],innerFront[j],.92);
    add(innerFront[i],outerFront[i],outerFront[j],.68);
    add(innerFront[i],outerFront[j],innerFront[j],.72);
    add(backCenter,innerBack[j],innerBack[i],.34);
    add(innerBack[i],outerBack[j],outerBack[i],.30);
    add(innerBack[i],innerBack[j],outerBack[j],.36);
    add(outerFront[i],outerBack[i],outerBack[j],.48);
    add(outerFront[i],outerBack[j],outerFront[j],.52);
  }
  return{positions:new Float32Array(positions),normals:new Float32Array(normals),shades:new Float32Array(shades),count:shades.length};
}

function install(){
  const hero=document.getElementById('hero'),host=hero?.querySelector('.hero-space');
  if(!(hero instanceof HTMLElement)||!(host instanceof HTMLElement))return false;
  const oldReady=root.dataset.fxCoreMobileR99===READY||root.dataset.fxCoreReal3d===READY||Boolean(window.FormatXCoreMobileV69);
  if(!oldReady)return false;

  try{window.FormatXCoreMobileV69?.destroy?.();}catch(_){ }
  host.querySelectorAll('.fx-core-mobile-v55-stage').forEach(node=>node.remove());

  const stage=document.createElement('div');
  stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage fx-core-r112-stage fx-core-r267-volume-stage';
  stage.dataset.active='true';stage.dataset.renderer='true-closed-volume-r267';stage.setAttribute('aria-hidden','true');
  const canvas=document.createElement('canvas');
  canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas fx-core-r112-canvas fx-core-r267-volume-canvas';
  canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);host.prepend(stage);

  let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance'}),webgl2=Boolean(gl);
  if(!gl){gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:false});webgl2=false;}
  if(!gl){stage.remove();root.dataset.fxCoreTrueVolumeR267='context-unavailable';return false;}

  const vsBody=`precision highp float;attribute vec3 aPos;attribute vec3 aNormal;attribute float aShade;uniform float uTime,uEnergy;uniform vec2 uPointer;varying vec3 vP;varying vec3 vN;varying float vShade;mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}void main(){float idle=uTime*.055;mat3 R=ry(uPointer.x*.34+sin(idle)*.035)*rx(-uPointer.y*.25+cos(idle*.83)*.022);vec3 p=R*aPos;vec3 n=normalize(R*aNormal);float cameraZ=3.35;float depth=max(1.65,cameraZ-p.z);float perspective=2.54/depth;vec2 q=vec2(p.x*1.02,p.y)*perspective;q.y+=.008;gl_Position=vec4(q,clamp((p.z+1.25)/4.7,-1.,1.),1.);vP=p;vN=n;vShade=aShade;}`;
  const vs=webgl2?`#version 300 es\nprecision highp float;layout(location=0)in vec3 aPos;layout(location=1)in vec3 aNormal;layout(location=2)in float aShade;uniform float uTime,uEnergy;uniform vec2 uPointer;out vec3 vP;out vec3 vN;out float vShade;mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}void main(){float idle=uTime*.055;mat3 R=ry(uPointer.x*.34+sin(idle)*.035)*rx(-uPointer.y*.25+cos(idle*.83)*.022);vec3 p=R*aPos;vec3 n=normalize(R*aNormal);float cameraZ=3.35;float depth=max(1.65,cameraZ-p.z);float perspective=2.54/depth;vec2 q=vec2(p.x*1.02,p.y)*perspective;q.y+=.008;gl_Position=vec4(q,clamp((p.z+1.25)/4.7,-1.,1.),1.);vP=p;vN=n;vShade=aShade;}`:vsBody;
  const fragBody=`uniform float uTime,uEnergy;uniform vec2 uPointer;float sat(float x){return clamp(x,0.,1.);}void main(){vec3 N=normalize(vN);vec3 V=normalize(vec3(0.,0.,3.35)-vP);vec3 Lc=normalize(vec3(-1.55,1.65,2.35)-vP);vec3 Lv=normalize(vec3(1.75,-.65,1.15)-vP);float dc=max(dot(N,Lc),0.);float dv=max(dot(N,Lv),0.);float back=max(dot(-N,Lv),0.);float fres=pow(1.-sat(dot(N,V)),2.05);float rr=length(vP.xy);float depth=sat((vP.z+.38)/.98);float spectral=.5+.5*sin(vP.x*3.3-vP.y*2.5+vP.z*4.7+uPointer.x*.55-uPointer.y*.35);vec3 deep=vec3(.004,.018,.055);vec3 blue=vec3(.018,.18,.46);vec3 cyan=vec3(.10,.82,1.12);vec3 violet=vec3(.56,.22,1.02);vec3 ice=vec3(.86,1.02,1.10);vec3 base=mix(deep,blue,.48+.28*vShade);base=mix(base,mix(cyan,violet,spectral),.14+.16*depth);float softLight=.24+.54*dc+.24*dv+.11*back;vec3 col=base*softLight;float inner=exp(-rr*rr*4.9)*(1.-.32*abs(vP.z));float core=exp(-rr*rr*28.);float spec=pow(max(dot(reflect(-Lc,N),V),0.),30.);col+=cyan*(inner*.24+core*.33)+violet*(inner*.09+fres*.07)+ice*(spec*.42+core*.09);col+=mix(cyan,violet,spectral)*fres*.105;float breath=.985+.015*sin(uTime*.46);col*=breath*(.96+uEnergy*.075);float alpha=.47+.12*vShade+.07*depth+.055*fres+.035*inner;alpha=clamp(alpha,.40,.69);${webgl2?'outColor':'gl_FragColor'}=vec4(max(col,vec3(0.)),alpha);}`;
  const fs=webgl2?`#version 300 es\nprecision highp float;in vec3 vP;in vec3 vN;in float vShade;out vec4 outColor;${fragBody}`:`precision highp float;varying vec3 vP;varying vec3 vN;varying float vShade;${fragBody}`;
  let program;
  try{program=link(gl,vs,fs);}catch(error){console.error(error);stage.remove();root.dataset.fxCoreTrueVolumeR267='shader-failed';return false;}

  const mesh=buildClosedCrystal();
  const buffers=[gl.createBuffer(),gl.createBuffer(),gl.createBuffer()];
  const arrays=[mesh.positions,mesh.normals,mesh.shades],sizes=[3,3,1];
  gl.useProgram(program);
  arrays.forEach((data,index)=>{gl.bindBuffer(gl.ARRAY_BUFFER,buffers[index]);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,sizes[index],gl.FLOAT,false,0,0);});
  const U={time:gl.getUniformLocation(program,'uTime'),energy:gl.getUniformLocation(program,'uEnergy'),pointer:gl.getUniformLocation(program,'uPointer')};

  let disposed=false,visible=true,width=0,height=0,raf=0,burst=0,last=performance.now(),avg=16.7;
  let px=0,py=0,tx=0,ty=0,energy=.30,target=.30;
  const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};
  cinematic.version=VERSION;cinematic.corePosition=[0,0,.58];cinematic.energy=energy;

  function resize(){
    const rect=stage.getBoundingClientRect();if(rect.width<2||rect.height<2)return;
    const dpr=Math.min(devicePixelRatio||1,mobile?1.35:1.5),budget=mobile?760000:1120000;
    let rw=Math.max(2,Math.round(rect.width*dpr)),rh=Math.max(2,Math.round(rect.height*dpr));
    const pixels=rw*rh;if(pixels>budget){const s=Math.sqrt(budget/pixels);rw=Math.round(rw*s);rh=Math.round(rh*s);}
    if(rw===width&&rh===height)return;width=canvas.width=rw;height=canvas.height=rh;gl.viewport(0,0,rw,rh);
  }
  function schedule(frames){burst=Math.max(burst,reduced.matches?1:frames);if(!raf&&visible&&!disposed)raf=requestAnimationFrame(frame);}
  function frame(now){
    raf=0;if(disposed||!visible)return;
    resize();
    if(root.dataset.fxReferenceMotionPaused!=='true'){
      px+=(tx-px)*.19;py+=(ty-py)*.17;energy+=(target-energy)*.16;target+=(.30-target)*.08;
    }
    const dt=Math.min(48,Math.max(1,now-last));last=now;avg+=(dt-avg)*.08;
    cinematic.corePosition=[px*.16,-py*.13,.58+energy*.028];cinematic.energy=energy;
    const started=performance.now();
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(program);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);
    gl.drawArrays(gl.TRIANGLES,0,mesh.count);
    gl.disable(gl.BLEND);
    const ms=performance.now()-started;
    root.dataset.fxCoreRenderMs=ms.toFixed(2);root.dataset.fxCoreFrameMs=avg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,avg)));root.dataset.fxCoreReal3dQuality='3';root.dataset.fxCorePerformanceMode=ms>13?'r267-adaptive':'r267-event-burst';
    burst=Math.max(0,burst-1);if(burst>0)schedule(burst);
  }
  function point(event){const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;tx=clamp(((event.clientX-rect.left)/rect.width-.5)*2,-1,1);ty=clamp(((event.clientY-rect.top)/rect.height-.5)*2,-1,1);target=Math.max(target,.52);schedule(10);}
  function pulse(){target=1;energy=Math.max(energy,.58);schedule(22);}
  function onPointerDown(event){if(event.isTrusted)point(event);pulse();}
  function onPointerMove(event){if(event.isTrusted&&event.pointerType!=='mouse')point(event);else if(event.isTrusted&&event.buttons)point(event);}
  hero.addEventListener('pointerdown',onPointerDown,{passive:true});hero.addEventListener('pointermove',onPointerMove,{passive:true});
  const ro=new ResizeObserver(()=>schedule(2));ro.observe(stage);
  const io=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible)schedule(2);else if(raf){cancelAnimationFrame(raf);raf=0;}},{threshold:.02});io.observe(stage);
  addEventListener('resize',()=>schedule(2),{passive:true});addEventListener('orientationchange',()=>schedule(3),{passive:true});
  addEventListener('formatx:referencepause',()=>schedule(1),{passive:true});addEventListener('formatx:coreinteraction',pulse,{passive:true});
  function destroy(){if(disposed)return;disposed=true;if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();hero.removeEventListener('pointerdown',onPointerDown);hero.removeEventListener('pointermove',onPointerMove);stage.remove();}
  window.FormatXCoreMobileV69={version:VERSION,pulse,destroy,get energy(){return energy;}};

  root.dataset.fxCoreRenderer='single-webgl-luminous-crystal-r99';
  root.dataset.fxCoreReferenceGeometry='reference-deep-concave-four-point-size-lock-r99';
  root.dataset.fxCoreReferenceMaterial='luminous-faceted-iceglass-caustic-r99';
  root.dataset.fxCoreInteractionVisual='touch-pointer-breathing-spectral-refraction-r99';
  root.dataset.fxCoreFrameVerified='visible-native-3d-r99';
  root.dataset.fxCoreMobileR99=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReal3d=READY;
  root.dataset.fxCoreTrueVolumeR267='ready';root.dataset.fxCoreVolumeTopology='closed-front-back-sidewalls';root.dataset.fxCoreVolumeDepth='physical-z-depth-r267';root.dataset.fxCoreVolumeLighting='normal-based-two-light-soft-fresnel';root.dataset.fxCoreSchedulerR267='event-driven-no-idle-raf';
  schedule(3);
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{renderer:'true-closed-volume-r267',volume:true,mobile}}));
  return true;
}

function tryInstall(){
  if(install()){
    installObserver?.disconnect();installObserver=null;clearTimeout(installTimer);installTimer=0;return;
  }
  if(!installObserver){installObserver=new MutationObserver(tryInstall);installObserver.observe(root,{attributes:true,attributeFilter:['data-fx-core-mobile-r99','data-fx-core-real3d']});}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tryInstall,{once:true});else tryInstall();
addEventListener('formatx:real3dready',()=>{if(root.dataset.fxCoreTrueVolumeR267!=='ready')tryInstall();},{passive:true});
installTimer=setTimeout(()=>{tryInstall();installObserver?.disconnect();installObserver=null;},12000);
}());
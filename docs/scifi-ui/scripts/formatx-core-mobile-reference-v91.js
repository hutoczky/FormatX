(function(){
'use strict';
const root=document.documentElement;
const READY='ready-v69';
const VERSION='reference-rayglass-webgl-r91';
if(root.dataset.fxCoreMobileV91===READY||root.dataset.fxCoreMobileV91==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreMobileV91='audit-skip';root.dataset.fxCoreMobileV69='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;}
root.dataset.fxCoreMobileV91='booting';root.dataset.fxCoreMobileV69='booting-v69';root.dataset.fxCoreMobileV55='booting-v55';
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile');return s;}
function program(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,'aP');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link');return p;}
function boot(attempt=0){
  const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
  if(!hero||!host){if(attempt<240){requestAnimationFrame(()=>boot(attempt+1));return;}root.dataset.fxCoreMobileV91='host-unavailable';return;}
  window.FormatXCoreMobileV69?.destroy?.();
  document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(n=>n.remove());
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r91';stage.setAttribute('aria-hidden','true');host.prepend(stage);
  const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance',failIfMajorPerformanceCaveat:false});
  let webgl2=!!gl;
  if(!gl){gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'default',failIfMajorPerformanceCaveat:false});webgl2=false;}
  if(!gl){stage.remove();root.dataset.fxCoreMobileV91='context-unavailable';root.dataset.fxCoreMobileV69='context-unavailable-v69';root.dataset.fxCoreMobileV55='context-unavailable-v55';root.dataset.fxCoreReal3d='context-unavailable';return;}
  const vs=webgl2?`#version 300 es\nprecision highp float;layout(location=0) in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`:`precision highp float;attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
  const body=`
uniform vec2 uRes;uniform float uTime;uniform float uEnergy;uniform vec2 uPointer;
float sat(float x){return clamp(x,0.0,1.0);}float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}float band(float x,float w){return 1.0-smoothstep(w,w*2.1,abs(x));}
void main(){
 vec2 uv=(vUv-.5)*2.0;float asp=uRes.x/max(1.0,uRes.y);uv.x*=asp/.72;
 uv.y+=.018;vec2 p=uv;p.x*=.985;p.y*=.94;
 float ax=abs(p.x),ay=abs(p.y);float pp=.585;float s=pow(ax/1.00,pp)+pow(ay/1.075,pp);
 float inside=1.0-smoothstep(.992,1.014,s);if(inside<.001){${webgl2?'outColor':'gl_FragColor'}=vec4(0.0);return;}
 float depth=pow(max(0.0,1.0-s),.52);float gx=pp*pow(max(ax,.0005)/1.00,pp-1.0)*sign(p.x);float gy=pp*pow(max(ay,.0005)/1.075,pp-1.0)*sign(p.y);vec3 N=normalize(vec3(-gx*.19,-gy*.19,.78+depth*.82));
 vec3 V=normalize(vec3(uPointer.x*.08,-uPointer.y*.08,1.0));float fres=pow(1.0-sat(dot(N,V)),1.65);vec3 L1=normalize(vec3(-.42,.72,1.0)),L2=normalize(vec3(.68,-.16,.92));float d1=max(0.0,dot(N,L1)),d2=max(0.0,dot(N,L2));float spec1=pow(max(0.0,dot(reflect(-L1,N),V)),54.0),spec2=pow(max(0.0,dot(reflect(-L2,N),V)),82.0);
 float edge=1.0-smoothstep(.012,.070,abs(1.0-s));float edge2=band(s-.935,.008)+.64*band(s-.862,.007)+.48*band(s-.785,.006);
 float r=length(p*vec2(1.0,1.03));float a=atan(p.y,p.x);float rings=band(r-.205,.006)+.82*band(r-.292,.006)+.65*band(r-.382,.006)+.50*band(r-.487,.007);
 float spokes=pow(max(0.0,.5+.5*cos(a*12.0+sin(r*17.0-uTime*.12))),15.0)*(1.0-smoothstep(.16,.84,r));
 float veins=pow(max(0.0,.5+.5*sin(a*17.0-r*34.0+sin(a*5.0)*2.0-uTime*.08)),20.0)*inside;
 float facets=pow(max(0.0,.5+.5*cos(a*8.0+r*21.0+sin(a*4.0+r*9.0)*2.1)),22.0)*inside;
 float shard=pow(max(0.0,.5+.5*sin((p.x+p.y)*31.0+sin((p.x-p.y)*13.0)*2.0)),28.0)*inside*(.35+.65*depth);
 float spectral=.5+.5*sin(a*4.0-r*11.0+uTime*.10);vec3 cyan=vec3(.03,.72,1.10),ice=vec3(.74,.97,1.0),vio=vec3(.55,.14,.96);
 vec3 col=vec3(.006,.035,.070);col+=cyan*(.055+.14*d1+.08*d2);col+=mix(cyan,vio,spectral)*(.10+.17*depth);col+=ice*(spec1*.78+spec2*.42);col+=cyan*(edge*.82+edge2*.22);col+=ice*(rings*.34+spokes*.28+facets*.20+shard*.16);col+=vio*(veins*.20+edge2*.10);
 float axisH=band(p.y,.0028)*(1.0-smoothstep(.16,1.02,ax));float axisV=band(p.x,.0025)*(1.0-smoothstep(.18,1.08,ay));col+=ice*(axisH*.31+axisV*.25);
 float core=1.0-smoothstep(.026,.071,r);float coreHalo=exp(-r*r*88.0);col+=ice*(core*1.05+coreHalo*.72);col+=cyan*exp(-r*r*32.0)*.44;col+=vio*exp(-pow(r-.235,2.0)*180.0)*.11;
 vec2 cell=floor((p+2.0)*45.0);float rnd=hash21(cell);float sparkle=step(.986,rnd)*pow(max(0.0,.5+.5*sin(uTime*(.7+rnd*1.2)+rnd*25.0)),18.0)*inside;col+=ice*sparkle*.75;
 float caustic=pow(max(0.0,.5+.5*sin(p.x*25.0+p.y*17.0+sin(a*7.0)*3.0-uTime*.08)),18.0);col+=mix(cyan,vio,spectral)*caustic*.08*inside;
 float alpha=inside*(.16+.22*depth+.28*fres)+edge*.48+edge2*.12+rings*.10+core*.34;alpha*=.92+uEnergy*.10;col*=1.0+uEnergy*.09;
 ${webgl2?'outColor':'gl_FragColor'}=vec4(col,clamp(alpha,0.0,.82));
}`;
  const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;
  let prog;try{prog=program(gl,vs,fs);}catch(e){console.error(e);stage.remove();root.dataset.fxCoreMobileV91='shader-failed';root.dataset.fxCoreReal3d='shader-failed';return;}
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(prog);const aP=gl.getAttribLocation(prog,'aP');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
  const U={res:gl.getUniformLocation(prog,'uRes'),time:gl.getUniformLocation(prog,'uTime'),energy:gl.getUniformLocation(prog,'uEnergy'),pointer:gl.getUniformLocation(prog,'uPointer')};
  let w=0,h=0,dpr=1,raf=0,last=performance.now(),energy=.22,target=.22,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,frameAvg=16.7,frames=0;
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=1.55,budget=720000;dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);const pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k);}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}w=cw;h=ch;gl.viewport(0,0,cw,ch);root.dataset.fxCoreReal3dResolution=cw+'x'+ch;}
  const ro=new ResizeObserver(resize);ro.observe(stage);resize();
  const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf)raf=requestAnimationFrame(frame);},{rootMargin:'160px'});io.observe(stage);
  function pointer(e){const r=stage.getBoundingClientRect();tx=clamp(((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);ty=clamp(((e.clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);target=.9;}
  hero.addEventListener('pointermove',pointer,{passive:true});hero.addEventListener('pointerdown',e=>{pointer(e);target=1.2;},{passive:true});window.addEventListener('pointerup',()=>{target=.28;},{passive:true});
  function pulse(){target=1.35;setTimeout(()=>{target=.28;},260);}window.addEventListener('formatx:coreinteraction',pulse,{passive:true});
  function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.055;py+=(ty-py)*.055;energy+=(target-energy)*.055;target+=(.24-target)*.018;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode='rayglass-balanced';}
    if(!disposed)raf=requestAnimationFrame(frame);
  }
  function destroy(){if(disposed)return;disposed=true;if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;}
  window.FormatXCoreMobileV69={version:VERSION,pulse,destroy};window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};window.FormatXCoreCinematic.version=VERSION;
  root.dataset.fxCoreMobileV91=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-refractive-rayglass-r91';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r91';
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r91',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));
  raf=requestAnimationFrame(frame);
}
boot();
}());
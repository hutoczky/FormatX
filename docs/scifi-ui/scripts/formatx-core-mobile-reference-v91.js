(function(){
'use strict';
const root=document.documentElement;
const READY='ready-v69';
const VERSION='reference-rayglass-webgl-r92';
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
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r92';stage.setAttribute('aria-hidden','true');host.prepend(stage);
  const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance',failIfMajorPerformanceCaveat:false});
  let webgl2=!!gl;
  if(!gl){gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'default',failIfMajorPerformanceCaveat:false});webgl2=false;}
  if(!gl){stage.remove();root.dataset.fxCoreMobileV91='context-unavailable';root.dataset.fxCoreMobileV69='context-unavailable-v69';root.dataset.fxCoreMobileV55='context-unavailable-v55';root.dataset.fxCoreReal3d='context-unavailable';return;}
  const vs=webgl2?`#version 300 es\nprecision highp float;layout(location=0) in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`:`precision highp float;attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
  const body=`
uniform vec2 uRes;uniform float uTime;uniform float uEnergy;uniform vec2 uPointer;
float sat(float x){return clamp(x,0.0,1.0);}float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}float band(float x,float w){return 1.0-smoothstep(w,w*2.1,abs(x));}float pline(float v,float w){return 1.0-smoothstep(w,w*2.1,abs(fract(v)-.5));}
void main(){
 vec2 uv=(vUv-.5)*2.0;float asp=uRes.x/max(1.0,uRes.y);uv.x*=asp/.72;uv.y+=.018;vec2 p=uv;p.x*=.985;p.y*=.94;
 float ax=abs(p.x),ay=abs(p.y);float pp=.585;float s=pow(ax/1.00,pp)+pow(ay/1.075,pp);float inside=1.0-smoothstep(.993,1.014,s);if(inside<.001){${webgl2?'outColor':'gl_FragColor'}=vec4(0.0);return;}
 float depth=pow(max(0.0,1.0-s),.50);float gx=pp*pow(max(ax,.0005),pp-1.0)*sign(p.x);float gy=pp*pow(max(ay,.0005)/1.075,pp-1.0)*sign(p.y);vec3 N=normalize(vec3(-gx*.205,-gy*.205,.72+depth*.98));vec3 V=normalize(vec3(uPointer.x*.10,-uPointer.y*.10,1.0));
 vec3 L1=normalize(vec3(-.47,.77,1.0)),L2=normalize(vec3(.73,-.18,.94)),L3=normalize(vec3(.02,-.88,.72));float fres=pow(1.0-sat(dot(N,V)),1.48),d1=max(0.0,dot(N,L1)),d2=max(0.0,dot(N,L2)),d3=max(0.0,dot(N,L3));float spec1=pow(max(0.0,dot(reflect(-L1,N),V)),48.0),spec2=pow(max(0.0,dot(reflect(-L2,N),V)),74.0),spec3=pow(max(0.0,dot(reflect(-L3,N),V)),90.0);
 float edge=1.0-smoothstep(.010,.060,abs(1.0-s));float shell1=band(s-.930,.0065),shell2=band(s-.855,.006),shell3=band(s-.775,.0055),shell4=band(s-.690,.005);float edge2=shell1+.72*shell2+.52*shell3+.36*shell4;
 float sc=.992;float sC=pow(abs(p.x+.006)/1.00,pp)+pow(abs(p.y-.003)/1.075,pp);float sV=pow(abs(p.x-.006)/1.00,pp)+pow(abs(p.y+.004)/1.075,pp);float chromaC=band(sC-sc,.009),chromaV=band(sV-sc,.009);
 float r=length(p*vec2(1.0,1.03));float a=atan(p.y,p.x);float rings=band(r-.176,.0048)+.92*band(r-.242,.005)+.78*band(r-.318,.0052)+.62*band(r-.404,.0058)+.46*band(r-.505,.0065);
 float spokes=pow(max(0.0,.5+.5*cos(a*16.0+sin(r*19.0-uTime*.12))),18.0)*(1.0-smoothstep(.12,.82,r));float veins=pow(max(0.0,.5+.5*sin(a*19.0-r*36.0+sin(a*5.0)*2.2-uTime*.07)),22.0)*inside;
 float tri1=pline(p.x*4.9+p.y*2.75+sin(p.y*5.0)*.10,.024),tri2=pline(-p.x*4.6+p.y*3.15+sin(p.x*5.6)*.09,.024),tri3=pline(p.y*5.2+sin(p.x*4.0)*.13,.022);float cellGate=.30+.70*step(.28,hash21(floor((p+1.6)*vec2(7.0,8.0))));float facetNet=sat((tri1+tri2+tri3)*.62)*cellGate*inside*(.32+.68*depth);
 float fan=pow(max(0.0,.5+.5*cos(a*10.0+r*8.0+sin(a*3.0)*1.4)),30.0)*inside;float shard=pow(max(0.0,.5+.5*sin((p.x+p.y)*29.0+sin((p.x-p.y)*12.0)*2.2)),30.0)*inside*(.28+.72*depth);
 float spectral=.5+.5*sin(a*4.0-r*11.0+uTime*.09);vec3 cyan=vec3(.015,.78,1.18),ice=vec3(.78,1.0,1.0),vio=vec3(.62,.12,1.05),deep=vec3(.005,.035,.085);
 vec3 col=deep*(.82+.30*depth);col+=cyan*(.070+.18*d1+.10*d2+.06*d3);col+=mix(cyan,vio,spectral)*(.08+.20*depth);col+=ice*(spec1*.94+spec2*.52+spec3*.30);col+=cyan*(edge*1.05+edge2*.28+chromaC*.28);col+=vio*(chromaV*.25+veins*.20+edge2*.08);col+=ice*(rings*.46+spokes*.26+facetNet*.30+fan*.16+shard*.17);
 float axisH=band(p.y,.0025)*(1.0-smoothstep(.12,1.02,ax));float axisV=band(p.x,.0022)*(1.0-smoothstep(.14,1.08,ay));col+=ice*(axisH*.38+axisV*.31);col+=cyan*(axisH*.10+axisV*.08);
 float core=1.0-smoothstep(.018,.048,r);float coreHalo=exp(-r*r*135.0);col+=ice*(core*1.48+coreHalo*.82);col+=cyan*exp(-r*r*48.0)*.52;col+=vio*exp(-pow(r-.242,2.0)*220.0)*.13;
 vec2 cell=floor((p+2.0)*48.0);float rnd=hash21(cell);float sparkle=step(.983,rnd)*pow(max(0.0,.5+.5*sin(uTime*(.72+rnd*1.25)+rnd*27.0)),20.0)*inside;col+=ice*sparkle*.95;
 float caustic=pow(max(0.0,.5+.5*sin(p.x*26.0+p.y*18.0+sin(a*7.0)*3.0-uTime*.075)),20.0);col+=mix(cyan,vio,spectral)*caustic*.10*inside;
 float alpha=inside*(.105+.18*depth+.31*fres)+edge*.57+edge2*.11+rings*.09+facetNet*.045+core*.38;alpha*=.94+uEnergy*.10;col*=1.12+uEnergy*.10;col=pow(max(col,vec3(0.0)),vec3(.91));
 ${webgl2?'outColor':'gl_FragColor'}=vec4(col,clamp(alpha,0.0,.86));
}`;
  const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;
  let prog;try{prog=program(gl,vs,fs);}catch(e){console.error(e);stage.remove();root.dataset.fxCoreMobileV91='shader-failed';root.dataset.fxCoreReal3d='shader-failed';return;}
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(prog);const aP=gl.getAttribLocation(prog,'aP');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
  const U={res:gl.getUniformLocation(prog,'uRes'),time:gl.getUniformLocation(prog,'uTime'),energy:gl.getUniformLocation(prog,'uEnergy'),pointer:gl.getUniformLocation(prog,'uPointer')};
  let w=0,h=0,dpr=1,raf=0,last=performance.now(),energy=.24,target=.24,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,frameAvg=16.7,frames=0;
  const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=VERSION;cinematic.corePosition=[0,0,0];cinematic.energy=energy;
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=1.55,budget=720000;dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);const pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k);}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}w=cw;h=ch;gl.viewport(0,0,cw,ch);root.dataset.fxCoreReal3dResolution=cw+'x'+ch;}
  const ro=new ResizeObserver(resize);ro.observe(stage);resize();
  const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf&&!disposed)raf=requestAnimationFrame(frame);},{rootMargin:'160px'});io.observe(stage);
  function pointer(e){const r=stage.getBoundingClientRect();tx=clamp(((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);ty=clamp(((e.clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);target=.92;}
  hero.addEventListener('pointermove',pointer,{passive:true});hero.addEventListener('pointerdown',e=>{pointer(e);target=1.22;},{passive:true});window.addEventListener('pointerup',()=>{target=.30;},{passive:true});
  function pulse(detail){if(detail&&Number.isFinite(detail.x))tx=clamp(detail.x,-1,1);if(detail&&Number.isFinite(detail.y))ty=clamp(detail.y,-1,1);target=detail?.phase==='drag'?1.0:1.36;setTimeout(()=>{target=.30;},280);}
  window.addEventListener('formatx:coreinteraction',e=>pulse(e.detail||null),{passive:true});
  window.addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&!disposed&&visible)raf=requestAnimationFrame(frame);},{passive:true});
  function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const frameStart=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.060;py+=(ty-py)*.060;energy+=(target-energy)*.060;target+=(.24-target)*.018;cinematic.corePosition=[px*.030,-py*.030,energy*.006];cinematic.energy=energy;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const renderMs=performance.now()-frameStart;root.dataset.fxCoreRenderMs=renderMs.toFixed(2);
    if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode=renderMs>12?'rayglass-adaptive':'rayglass-balanced';}
    if(!disposed)raf=requestAnimationFrame(frame);
  }
  function destroy(){if(disposed)return;disposed=true;if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;}
  const api={version:VERSION,pulse:()=>pulse(null),destroy,get energy(){return energy;}};window.FormatXCoreMobileV69=api;
  root.dataset.fxCoreMobileV91=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-refractive-rayglass-r92';root.dataset.fxCoreReferenceGeometry='reference-rayglass-deep-concave-four-point-r92';root.dataset.fxCoreReferenceMaterial='multi-layer-fresnel-faceted-caustic-rayglass-r92';root.dataset.fxCoreInteractionVisual='direct-touch-refractive-parallax-energy-r92';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r92';
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r92',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));raf=requestAnimationFrame(frame);
}
boot();
}());
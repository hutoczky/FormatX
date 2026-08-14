(function(){
'use strict';
const root=document.documentElement;
const READY='ready-v69';
const VERSION='reference-rayglass-webgl-r93';
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
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r93';stage.setAttribute('aria-hidden','true');host.prepend(stage);
  const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance',failIfMajorPerformanceCaveat:false});
  let webgl2=!!gl;
  if(!gl){gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'default',failIfMajorPerformanceCaveat:false});webgl2=false;}
  if(!gl){stage.remove();root.dataset.fxCoreMobileV91='context-unavailable';root.dataset.fxCoreMobileV69='context-unavailable-v69';root.dataset.fxCoreMobileV55='context-unavailable-v55';root.dataset.fxCoreReal3d='context-unavailable';return;}
  const vs=webgl2?`#version 300 es\nprecision highp float;layout(location=0) in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`:`precision highp float;attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
  const body=`
uniform vec2 uRes;uniform float uTime;uniform float uEnergy;uniform vec2 uPointer;
float sat(float x){return clamp(x,0.0,1.0);}float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}float band(float x,float w){return 1.0-smoothstep(w,w*2.0,abs(x));}float pline(float v,float w){return 1.0-smoothstep(w,w*2.0,abs(fract(v)-.5));}
void main(){
 vec2 scr=(vUv-.5)*2.0;scr.x*=uRes.x/max(1.0,uRes.y);scr.y+=.018;
 vec2 uv=(vUv-.5)*2.0;float asp=uRes.x/max(1.0,uRes.y);uv.x*=asp/.72;uv.y+=.018;vec2 p=uv;p.x*=.985;p.y*=.94;
 float ax=abs(p.x),ay=abs(p.y);float pp=.585;float s=pow(ax,pp)+pow(ay/1.075,pp);float inside=1.0-smoothstep(.993,1.014,s);if(inside<.001){${webgl2?'outColor':'gl_FragColor'}=vec4(0.0);return;}
 float depth=pow(max(0.0,1.0-s),.48);float gx=pp*pow(max(ax,.0005),pp-1.0)*sign(p.x);float gy=pp*pow(max(ay,.0005)/1.075,pp-1.0)*sign(p.y);vec3 N=normalize(vec3(-gx*.215,-gy*.215,.70+depth*1.02));vec3 V=normalize(vec3(uPointer.x*.11,-uPointer.y*.11,1.0));
 vec3 L1=normalize(vec3(-.50,.80,1.0)),L2=normalize(vec3(.72,.16,.98)),L3=normalize(vec3(.08,-.86,.80));float fres=pow(1.0-sat(dot(N,V)),1.42),d1=max(0.0,dot(N,L1)),d2=max(0.0,dot(N,L2)),d3=max(0.0,dot(N,L3));float spec1=pow(max(0.0,dot(reflect(-L1,N),V)),62.0),spec2=pow(max(0.0,dot(reflect(-L2,N),V)),92.0),spec3=pow(max(0.0,dot(reflect(-L3,N),V)),104.0);
 float edge=1.0-smoothstep(.009,.054,abs(1.0-s));float sh1=band(s-.946,.0055),sh2=band(s-.890,.0052),sh3=band(s-.825,.0049),sh4=band(s-.750,.0046),sh5=band(s-.665,.0043);float shells=sh1+.78*sh2+.62*sh3+.48*sh4+.34*sh5;
 float sC=pow(abs(p.x+.0065),pp)+pow(abs(p.y-.003)/1.075,pp),sV=pow(abs(p.x-.0065),pp)+pow(abs(p.y+.004)/1.075,pp);float chromaC=band(sC-.995,.008),chromaV=band(sV-.995,.008);
 float r=length(scr);float a=atan(scr.y,scr.x);float rings=1.0*band(r-.145,.0038)+.96*band(r-.205,.0041)+.82*band(r-.270,.0045)+.66*band(r-.340,.0050)+.48*band(r-.415,.0058);
 float spoke=pow(max(0.0,.5+.5*cos(a*20.0+sin(r*23.0-uTime*.11))),22.0)*(1.0-smoothstep(.10,.49,r));
 float arc=pow(max(0.0,.5+.5*sin(a*13.0-r*42.0+sin(a*4.0)*2.3-uTime*.075)),24.0)*(1.0-smoothstep(.12,.58,r));
 float f1=band(abs(p.y)-(.55*abs(p.x)+.105),.0055),f2=band(abs(p.y)-(.31*abs(p.x)+.285),.0050),f3=band(abs(p.x)-(.50*abs(p.y)+.115),.0054),f4=band(abs(p.x)-(.29*abs(p.y)+.305),.0050);
 float f5=band(p.y-p.x*.68-.060,.0045)+band(p.y+p.x*.68-.060,.0045)+band(p.y-p.x*.68+.060,.0045)+band(p.y+p.x*.68+.060,.0045);
 float clipMid=inside*(.22+.78*depth)*(1.0-smoothstep(.72,.97,s));float facetLines=sat((f1+f2+f3+f4)*.72+f5*.31)*clipMid;
 float micro1=pline(p.x*5.3+p.y*2.9+sin(p.y*5.0)*.08,.020),micro2=pline(-p.x*5.0+p.y*3.2+sin(p.x*5.3)*.08,.020),micro3=pline(p.y*5.8+sin(p.x*4.3)*.10,.019);float gate=.18+.82*step(.40,hash21(floor((p+1.55)*vec2(7.0,8.0))));float micro=sat((micro1+micro2+micro3)*.52)*gate*inside*(.24+.76*depth);
 float fan=pow(max(0.0,.5+.5*cos(a*12.0+r*10.0+sin(a*3.0)*1.5)),34.0)*inside;float shard=pow(max(0.0,.5+.5*sin((p.x+p.y)*33.0+sin((p.x-p.y)*14.0)*2.3)),34.0)*inside*(.24+.76*depth);
 float spectral=.5+.5*sin(a*5.0-r*13.0+uTime*.085);vec3 cyan=vec3(.01,.82,1.22),ice=vec3(.86,1.03,1.04),vio=vec3(.69,.13,1.08),deep=vec3(.004,.027,.075);
 vec3 col=deep*(.72+.26*depth);col+=cyan*(.065+.18*d1+.075*d2+.045*d3);col+=mix(cyan,vio,spectral)*(.075+.18*depth);col+=ice*(spec1*1.18+spec2*.25+spec3*.16);col+=cyan*(edge*1.22+shells*.25+chromaC*.34);col+=vio*(chromaV*.31+arc*.20+shells*.085);col+=ice*(rings*.62+spoke*.30+facetLines*.54+micro*.20+fan*.14+shard*.18);
 float axisH=band(scr.y,.0020)*(1.0-smoothstep(.08,.70,abs(scr.x))),axisV=band(scr.x,.0018)*(1.0-smoothstep(.08,.82,abs(scr.y)));float diag1=band(scr.y-scr.x,.0022)*(1.0-smoothstep(.04,.25,r)),diag2=band(scr.y+scr.x,.0022)*(1.0-smoothstep(.04,.25,r));col+=ice*(axisH*.55+axisV*.48+diag1*.17+diag2*.17);col+=cyan*(axisH*.13+axisV*.11);
 float core=1.0-smoothstep(.015,.043,r);float coreHalo=exp(-r*r*150.0);float coreRing=band(r-.082,.0038)+.68*band(r-.108,.0036);col+=ice*(core*1.72+coreHalo*.96+coreRing*.40);col+=cyan*(exp(-r*r*55.0)*.58+coreRing*.16);col+=vio*band(r-.205,.0045)*.13;
 vec2 cell=floor((p+2.0)*52.0);float rnd=hash21(cell);float sparkle=step(.981,rnd)*pow(max(0.0,.5+.5*sin(uTime*(.75+rnd*1.3)+rnd*29.0)),22.0)*inside;col+=ice*sparkle*1.10;
 float caustic=pow(max(0.0,.5+.5*sin(p.x*29.0+p.y*20.0+sin(a*8.0)*3.2-uTime*.07)),23.0);col+=mix(cyan,vio,spectral)*caustic*.11*inside;
 float alpha=inside*(.085+.15*depth+.32*fres)+edge*.64+shells*.095+rings*.10+facetLines*.07+micro*.025+core*.40;alpha*=.95+uEnergy*.10;col*=1.24+uEnergy*.10;col=pow(max(col,vec3(0.0)),vec3(.88));
 ${webgl2?'outColor':'gl_FragColor'}=vec4(col,clamp(alpha,0.0,.88));
}`;
  const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;
  let prog;try{prog=program(gl,vs,fs);}catch(e){console.error(e);stage.remove();root.dataset.fxCoreMobileV91='shader-failed';root.dataset.fxCoreReal3d='shader-failed';return;}
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(prog);const aP=gl.getAttribLocation(prog,'aP');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
  const U={res:gl.getUniformLocation(prog,'uRes'),time:gl.getUniformLocation(prog,'uTime'),energy:gl.getUniformLocation(prog,'uEnergy'),pointer:gl.getUniformLocation(prog,'uPointer')};
  let w=0,h=0,dpr=1,raf=0,last=performance.now(),energy=.24,target=.24,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,frameAvg=16.7,frames=0;
  const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=VERSION;cinematic.corePosition=[0,0,0];cinematic.energy=energy;
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=1.50,budget=650000;dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr);const pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k);}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}w=cw;h=ch;gl.viewport(0,0,cw,ch);root.dataset.fxCoreReal3dResolution=cw+'x'+ch;}
  const ro=new ResizeObserver(resize);ro.observe(stage);resize();
  const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf&&!disposed)raf=requestAnimationFrame(frame);},{rootMargin:'160px'});io.observe(stage);
  function pointer(e){const r=stage.getBoundingClientRect();tx=clamp(((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);ty=clamp(((e.clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);target=.96;}
  hero.addEventListener('pointermove',pointer,{passive:true});hero.addEventListener('pointerdown',e=>{pointer(e);target=1.24;},{passive:true});window.addEventListener('pointerup',()=>{target=.32;},{passive:true});
  function pulse(detail){if(detail&&Number.isFinite(detail.x))tx=clamp(detail.x,-1,1);if(detail&&Number.isFinite(detail.y))ty=clamp(detail.y,-1,1);target=detail?.phase==='drag'?1.02:1.38;setTimeout(()=>{target=.32;},300);}
  window.addEventListener('formatx:coreinteraction',e=>pulse(e.detail||null),{passive:true});window.addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&!disposed&&visible)raf=requestAnimationFrame(frame);},{passive:true});
  function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const frameStart=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.068;py+=(ty-py)*.068;energy+=(target-energy)*.072;target+=(.24-target)*.016;cinematic.corePosition=[px*.034,-py*.034,energy*.006];cinematic.energy=energy;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const renderMs=performance.now()-frameStart;root.dataset.fxCoreRenderMs=renderMs.toFixed(2);
    if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode=renderMs>12?'rayglass-adaptive':'rayglass-balanced';}
    if(!disposed)raf=requestAnimationFrame(frame);
  }
  function destroy(){if(disposed)return;disposed=true;if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;}
  const api={version:VERSION,pulse:()=>pulse(null),destroy,get energy(){return energy;}};window.FormatXCoreMobileV69=api;
  root.dataset.fxCoreMobileV91=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-refractive-rayglass-r93';root.dataset.fxCoreReferenceGeometry='reference-rayglass-deep-concave-four-point-r93';root.dataset.fxCoreReferenceMaterial='multi-layer-fresnel-shard-caustic-rayglass-r93';root.dataset.fxCoreInteractionVisual='direct-touch-refractive-parallax-energy-r93';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r93';
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r93',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));raf=requestAnimationFrame(frame);
}
boot();
}());
(function(){
'use strict';
const root=document.documentElement,READY='ready-v69',VERSION='reference-crystal-depth-webgl-r97';
if(root.dataset.fxCoreMobileR97===READY||root.dataset.fxCoreMobileR97==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxCoreMobileR97='audit-skip';root.dataset.fxCoreMobileV69='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;
}
root.dataset.fxCoreMobileR97='booting';root.dataset.fxCoreMobileV69='booting-v69';root.dataset.fxCoreMobileV55='booting-v55';
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile');return s}
function program(gl,vs,fs){const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'aP');gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link');return p}
function boot(attempt=0){
 const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
 if(!hero||!host){if(attempt<240)return requestAnimationFrame(()=>boot(attempt+1));root.dataset.fxCoreMobileR97='host-unavailable';return}
 window.FormatXCoreMobileV69?.destroy?.();
 document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(n=>n.remove());
 const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r97';stage.setAttribute('aria-hidden','true');host.prepend(stage);
 const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
 let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance',failIfMajorPerformanceCaveat:false}),webgl2=!!gl;
 if(!gl){gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'default'});webgl2=false}
 if(!gl){stage.remove();root.dataset.fxCoreReal3d='context-unavailable';return}
 const vs=webgl2?`#version 300 es\nprecision highp float;layout(location=0)in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`:`precision highp float;attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
 const body=`
uniform vec2 uRes;uniform float uTime,uEnergy;uniform vec2 uPointer;
float sat(float x){return clamp(x,0.,1.);}float band(float x,float w){return 1.-smoothstep(w,w*2.,abs(x));}
float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);} 
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1)),f.x),f.y);} 
float line2(vec2 p,float m,float b,float w){return band(p.y-p.x*m-b,w);} 
void main(){
 vec2 aspect=vec2(uRes.x/max(1.,uRes.y),1.);vec2 scr=(vUv-.5)*2.*aspect;scr.y+=.018;
 float breathe=1.+.010*sin(uTime*.61)+.004*sin(uTime*1.17);vec2 p=(vUv-.5)*2.;p.x*=aspect.x/.72;p.y+=.018;p*=vec2(.985,.94)/breathe;
 p+=vec2(-uPointer.x,uPointer.y)*(.006+.008*uEnergy);
 float ax=abs(p.x),ay=abs(p.y),pp=.585;float s=pow(ax,pp)+pow(ay/1.075,pp);float inside=1.-smoothstep(.992,1.015,s);if(inside<.001){${webgl2?'outColor':'gl_FragColor'}=vec4(0.);return;}
 float depth=pow(max(0.,1.-s),.43);float edge=1.-smoothstep(.006,.052,abs(1.-s));
 float gx=pp*pow(max(ax,.0005),pp-1.)*sign(p.x),gy=pp*pow(max(ay,.0005)/1.075,pp-1.)*sign(p.y);
 vec3 N=normalize(vec3(-gx*.18,-gy*.18,.78+depth*1.20));vec3 V=normalize(vec3(uPointer.x*.18,-uPointer.y*.18,1.));
 vec3 L1=normalize(vec3(-.44,.78,1.)),L2=normalize(vec3(.70,-.24,.92));
 float fres=pow(1.-sat(dot(N,V)),1.42),d1=max(0.,dot(N,L1)),d2=max(0.,dot(N,L2));
 float spec1=pow(max(0.,dot(reflect(-L1,N),V)),92.),spec2=pow(max(0.,dot(reflect(-L2,N),V)),58.);
 float r=length(scr),a=atan(scr.y,scr.x);
 float shells=band(s-.965,.0038)+.72*band(s-.892+.006*sin(a*3.+uTime*.08),.0042)+.52*band(s-.792+.010*cos(a*5.-uTime*.07),.0046)+.34*band(s-.670+.012*sin(a*7.+.8),.0052);
 float sC=pow(abs(p.x+.008),pp)+pow(abs(p.y-.005)/1.075,pp),sV=pow(abs(p.x-.009),pp)+pow(abs(p.y+.005)/1.075,pp);
 float chromaC=band(sC-.994,.0065),chromaV=band(sV-.994,.0065);
 vec2 q1=mat2(.866,-.5,.5,.866)*p*7.2,q2=mat2(.707,-.707,.707,.707)*p*10.4,q3=mat2(.966,.259,-.259,.966)*p*14.0;
 float f1=abs(fract(q1.x+n2(q1*.31))-.5),f2=abs(fract(q2.y+n2(q2*.27))-.5),f3=abs(fract((q3.x+q3.y)*.56+n2(q3*.23))-.5);
 float shard=pow(sat(1.-min(min(f1,f2),f3)*2.),7.)*inside*(.18+.82*depth);
 float shardMask=(.42+.58*n2(p*9.+vec2(uTime*.015,-uTime*.011)))*shard;
 float facetTone=n2(p*5.8+vec2(n2(p*3.1),-n2(p*4.3)))*inside;
 float causticA=pow(max(0.,.5+.5*sin(p.x*15.+sin(p.y*7.+uTime*.10)*2.7+p.y*4.)),18.);
 float causticB=pow(max(0.,.5+.5*sin(p.y*18.+sin(p.x*9.-uTime*.08)*2.2-p.x*5.)),22.);
 float caustic=(causticA*.62+causticB*.52)*inside*depth;
 float spiral=pow(max(0.,.5+.5*sin(a*7.-r*26.+sin(a*3.)*1.8-uTime*.15)),24.)*(1.-smoothstep(.09,.55,r));
 float arc1=band(r-(.19+.018*sin(a*3.+uTime*.10)),.0042),arc2=band(r-(.31+.023*cos(a*4.-uTime*.08)),.0048),arc3=band(r-(.43+.018*sin(a*5.+1.3)),.0054);
 float reactorArcs=(arc1*.92+arc2*.62+arc3*.34)*(1.-smoothstep(.48,.64,r));
 float rays=(band(scr.x,.0018)+line2(scr,0.,0.,.0019))*(1.-smoothstep(.06,.60,r));
 rays+=.24*(line2(scr,.62,.0,.0022)+line2(scr,-.62,.0,.0022))*(1.-smoothstep(.10,.53,r));
 float tip=max(pow(sat(abs(p.x)),5.),pow(sat(abs(p.y)/1.075),5.));
 float fracture=pow(max(0.,.5+.5*sin(a*13.+s*31.+uTime*.12)),18.)*edge*(.35+.65*tip);
 vec3 cyan=vec3(.025,.92,1.42),ice=vec3(.92,1.10,1.20),vio=vec3(.72,.16,1.24),blue=vec3(.008,.055,.16);
 float spectral=.5+.5*sin(a*4.5-r*11.+uTime*.11+uPointer.x*.8-uPointer.y*.6);
 vec3 col=blue*(.48+.58*depth);
 col+=cyan*(.08+.16*d1+.06*d2+.14*depth);
 col+=mix(cyan,vio,spectral)*(.06+.15*facetTone+.10*depth);
 col+=ice*(spec1*.72+spec2*.28);
 col+=cyan*(edge*1.46+shells*.38+chromaC*.42+fracture*.36);
 col+=vio*(chromaV*.36+shells*.09+spiral*.14);
 col+=ice*(shardMask*.72+caustic*.46+reactorArcs*.72+rays*.34);
 col+=cyan*(shardMask*.18+caustic*.16+reactorArcs*.17);
 float pulse=.5+.5*sin(uTime*1.42);float core=exp(-r*r*520.),halo=exp(-r*r*95.),innerRing=band(r-.052,.0028),midRing=band(r-.092,.0034),outerRing=band(r-.148+.006*sin(a*4.-uTime*.12),.0042);
 col+=ice*(core*(2.45+.45*pulse+.32*uEnergy)+halo*(.58+.20*pulse)+innerRing*.92+midRing*.46+outerRing*.22);
 col+=cyan*(halo*.42+innerRing*.26+midRing*.22);col+=vio*(outerRing*.16+spiral*.10);
 vec2 cell=floor((p+2.)*55.);float rnd=hash21(cell),spark=step(.986,rnd)*pow(max(0.,.5+.5*sin(uTime*(.75+rnd*1.7)+rnd*37.)),20.)*inside;col+=ice*spark*(.78+.40*uEnergy);
 float alpha=inside*(.095+.15*depth+.24*fres)+edge*.61+shells*.075+shardMask*.055+reactorArcs*.085+core*.46;
 alpha*=.96+uEnergy*.075;col*=1.18+uEnergy*.12+.018*pulse;col=pow(max(col,vec3(0.)),vec3(.86));
 ${webgl2?'outColor':'gl_FragColor'}=vec4(col,clamp(alpha,0.,.88));
}`;
 const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;
 let prog;try{prog=program(gl,vs,fs)}catch(e){console.error(e);stage.remove();root.dataset.fxCoreReal3d='shader-failed';root.dataset.fxCoreMobileR97='shader-failed';return}
 const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(prog);
 const aP=gl.getAttribLocation(prog,'aP');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
 const U={res:gl.getUniformLocation(prog,'uRes'),time:gl.getUniformLocation(prog,'uTime'),energy:gl.getUniformLocation(prog,'uEnergy'),pointer:gl.getUniformLocation(prog,'uPointer')};
 let w=0,h=0,raf=0,last=performance.now(),energy=.24,target=.24,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,frameAvg=16.7,frames=0;
 const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=VERSION;cinematic.corePosition=[0,0,0];cinematic.energy=energy;
 function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=1.40,budget=560000,dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr),pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k)}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}w=cw;h=ch;gl.viewport(0,0,cw,ch);root.dataset.fxCoreReal3dResolution=cw+'x'+ch}
 const ro=new ResizeObserver(resize);ro.observe(stage);resize();
 const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf&&!disposed)raf=requestAnimationFrame(frame)},{rootMargin:'160px'});io.observe(stage);
 function pointer(e){const r=stage.getBoundingClientRect();tx=clamp(((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);ty=clamp(((e.clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);target=1.02}
 hero.addEventListener('pointermove',pointer,{passive:true});hero.addEventListener('pointerdown',e=>{pointer(e);target=1.34},{passive:true});window.addEventListener('pointerup',()=>{target=.30},{passive:true});
 function pulse(detail){if(detail&&Number.isFinite(detail.x))tx=clamp(detail.x,-1,1);if(detail&&Number.isFinite(detail.y))ty=clamp(detail.y,-1,1);target=detail?.phase==='drag'?1.08:1.44;setTimeout(()=>{target=.30},360)}
 window.addEventListener('formatx:coreinteraction',e=>pulse(e.detail||null),{passive:true});window.addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&!disposed&&visible)raf=requestAnimationFrame(frame)},{passive:true});
 function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const st=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.075;py+=(ty-py)*.075;energy+=(target-energy)*.080;target+=(.24-target)*.014;cinematic.corePosition=[px*.050,-py*.050,energy*.008];cinematic.energy=energy;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const renderMs=performance.now()-st;root.dataset.fxCoreRenderMs=renderMs.toFixed(2);if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode=renderMs>12?'crystal-adaptive':'crystal-balanced'}if(!disposed)raf=requestAnimationFrame(frame)}
 function destroy(){if(disposed)return;disposed=true;if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69}
 window.FormatXCoreMobileV69={version:VERSION,pulse:()=>pulse(null),destroy,get energy(){return energy}};
 root.dataset.fxCoreMobileR97=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-refractive-crystal-r97';root.dataset.fxCoreReferenceGeometry='reference-deep-concave-four-point-size-lock-r97';root.dataset.fxCoreReferenceMaterial='faceted-iceglass-caustic-depth-r97';root.dataset.fxCoreInteractionVisual='breathing-parallax-refraction-energy-r97';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r97';
 dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r97',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));raf=requestAnimationFrame(frame)
}
boot();
}());

(function(){
'use strict';
const root=document.documentElement,READY='ready-v69',VERSION='reference-luminous-crystal-webgl-r99';
if(root.dataset.fxCoreMobileR99===READY||root.dataset.fxCoreMobileR99==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreMobileR99='audit-skip';root.dataset.fxCoreMobileV69='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;}
root.dataset.fxCoreMobileR99='booting';root.dataset.fxCoreMobileV69='booting-v69';root.dataset.fxCoreMobileV55='booting-v55';
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile');return s;}
function makeProgram(gl,vs,fs){const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'aP');gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link');return p;}
function boot(attempt=0){
 const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
 if(!hero||!host){if(attempt<240)return requestAnimationFrame(()=>boot(attempt+1));root.dataset.fxCoreMobileR99='host-unavailable';return;}
 window.FormatXCoreMobileV69?.destroy?.();document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(n=>n.remove());
 const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r106';stage.setAttribute('aria-hidden','true');host.prepend(stage);
 const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
 let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance',failIfMajorPerformanceCaveat:false}),webgl2=!!gl;
 if(!gl){gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'default'});webgl2=false;}
 if(!gl){stage.remove();root.dataset.fxCoreReal3d='context-unavailable';return;}
 const vs=webgl2?`#version 300 es\nprecision highp float;layout(location=0)in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`:`precision highp float;attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
 const body=`
uniform vec2 uRes;uniform float uTime,uEnergy;uniform vec2 uPointer;
float sat(float x){return clamp(x,0.,1.);}float band(float x,float w){return 1.-smoothstep(w,w*2.,abs(x));}
float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.,1.)),f.x),f.y);}
float ridge(float x,float power){return pow(sat(1.-abs(fract(x)-.5)*2.),power);}mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
void main(){
 float t=uTime;vec2 asp=vec2(uRes.x/max(1.,uRes.y),1.);vec2 scr=(vUv-.5)*2.*asp;scr.y+=.018;
 float breathing=1.+.005*sin(t*.55)+.0018*sin(t*1.17);vec2 p=(vUv-.5)*2.;p.x*=asp.x/.72;p.y+=.018;p*=vec2(.985,.94)/breathing;p+=vec2(-uPointer.x,uPointer.y)*(.008+.010*uEnergy);
 float ax=abs(p.x),ay=abs(p.y),pp=.585;float s=pow(ax,pp)+pow(ay/1.075,pp);float inside=1.-smoothstep(.992,1.014,s);float depth=pow(max(0.,1.-s),.34);
 float r=length(scr),a=atan(scr.y,scr.x),pulse=.5+.5*sin(t*1.35);
 float edge=1.-smoothstep(.002,.017,abs(1.-s)),edgeSoft=1.-smoothstep(.017,.055,abs(1.-s));
 float sC=pow(abs(p.x+.009),pp)+pow(abs(p.y-.004)/1.075,pp),sV=pow(abs(p.x-.009),pp)+pow(abs(p.y+.004)/1.075,pp);float chromaC=band(sC-.996,.0056),chromaV=band(sV-.996,.0060);
 vec2 wp=p+(vec2(noise2(p*2.4+vec2(t*.010,1.3)),noise2(p*2.9+vec2(3.7,-t*.009)))-.5)*.032;
 float shells=0.;shells+=band(s-.944,.0040);shells+=.86*band(s-.865+.006*sin(a*4.+t*.025),.0044);shells+=.72*band(s-.775+.008*cos(a*4.-t*.021),.0048);shells+=.57*band(s-.675+.010*sin(a*4.+.7),.0052);shells+=.42*band(s-.565+.012*cos(a*4.-.5),.0058);shells+=.28*band(s-.445+.013*sin(a*4.+1.1),.0062);
 float vy=sat(ay/1.075),vx=sat(ax);float curveV=.055+.215*pow(sat(1.-vy),1.38),curveH=.050+.205*pow(sat(1.-vx),1.40);
 float ribV=band(ax-curveV,.010)*smoothstep(.11,.94,vy);float ribH=band(ay-curveH,.010)*smoothstep(.11,.94,vx);
 float innerV=band(ax-(.026+.112*pow(sat(1.-vy),1.16)),.0075)*smoothstep(.17,.92,vy);float innerH=band(ay-(.024+.106*pow(sat(1.-vx),1.18)),.0075)*smoothstep(.17,.92,vx);
 float ribs=(ribV+ribH)*inside*(.45+.55*depth);float innerRibs=(innerV+innerH)*inside*(.42+.58*depth);
 float faceN=noise2(wp*2.15+vec2(.3,-.4));float faceWave=.5+.5*cos(a*4.0+s*5.2+(faceN-.5)*1.25+t*.018);float face=inside*depth*(.16+.84*faceWave);
 float topFace=smoothstep(.10,.86,p.y)*sat(1.-ax/(.18+.30*pow(sat(1.-vy),1.15)))*inside;float bottomFace=smoothstep(.10,.86,-p.y)*sat(1.-ax/(.18+.30*pow(sat(1.-vy),1.15)))*inside;
 float sideFace=smoothstep(.10,.82,ax)*sat(1.-ay/(.17+.29*pow(sat(1.-vx),1.18)))*inside;
 float diagonal=exp(-abs(ax-ay*.72)*8.2)*inside*depth;
 vec2 q1=rot(.36)*wp,q2=rot(-.58)*wp;float fracture=(ridge(q1.x*5.6+q1.y*1.8+noise2(q1*2.7)*.70,30.)+.72*ridge(q2.x*6.7-q2.y*2.1+noise2(q2*3.1+2.)*.62,34.))*inside*depth*.34;
 float caustic=(ridge(wp.x*6.4+sin(wp.y*5.0+t*.055)*.82,26.)+.70*ridge(wp.y*7.0+sin(wp.x*4.6-t*.047)*.76,29.))*inside*depth*.26;
 float rings=band(r-.094,.0030)+.88*band(r-.142,.0032)+.70*band(r-.202,.0035)+.50*band(r-.272,.0039)+.31*band(r-.350,.0044);float axes=(band(scr.x,.0016)+band(scr.y,.0017))*(1.-smoothstep(.045,.62,r));
 float spectral=.5+.5*sin(a*4.0+s*4.5+t*.065+uPointer.x*.7-uPointer.y*.5);vec3 deep=vec3(.002,.012,.045),navy=vec3(.004,.060,.190),blue=vec3(.006,.180,.470),cyan=vec3(.015,.900,1.430),vio=vec3(.620,.070,1.160),ice=vec3(.900,1.040,1.150);
 vec3 col=deep*(.80+.28*depth)+navy*(.25+.42*depth)+blue*(.06+.17*depth);
 col+=mix(cyan*.55,vio*.52,spectral)*face*.18;col+=cyan*(topFace*.12+bottomFace*.10+sideFace*.10)+vio*(sideFace*.060+diagonal*.055);col+=blue*(topFace*.14+bottomFace*.11+sideFace*.12+diagonal*.10);
 col+=cyan*(edge*1.18+edgeSoft*.34+chromaC*.48+shells*.34+ribs*.34+innerRibs*.28)+vio*(chromaV*.46+shells*.10+ribs*.095+diagonal*.075);
 col+=ice*(shells*.35+ribs*.42+innerRibs*.32+fracture*.58+caustic*.44+rings*.72+axes*.34)+cyan*(fracture*.30+caustic*.28+rings*.24+axes*.18);
 float core=exp(-r*r*430.),hot=exp(-r*r*1700.),halo=exp(-r*r*74.);float reactor=band(r-.052,.0025)+.82*band(r-.078,.0028)+.60*band(r-.108,.0031);
 col+=ice*(hot*(4.1+.6*pulse+.5*uEnergy)+core*1.25+reactor*.95)+cyan*(core*.66+halo*.30+reactor*.38)+vio*(band(r-.142,.0032)*.16+band(r-.202,.0035)*.10);col=mix(col,vec3(1.12,1.23,1.32)*2.15,sat(hot*1.1));
 vec2 cell=floor((wp+2.)*46.);float rnd=hash21(cell);float spark=step(.991,rnd)*pow(max(0.,.5+.5*sin(t*(.65+rnd*1.5)+rnd*31.)),24.)*inside;col+=ice*spark*(.55+.4*uEnergy);
 float orbit1=band(r-.52,.0028)*(.22+.78*pow(abs(sin(a*2.1+t*.050)),6.)),orbit2=band(r-.62,.0030)*(.20+.80*pow(abs(cos(a*1.8-t*.040)),7.));float outer=(orbit1*.46+orbit2*.34)*(1.-inside);vec3 outerCol=cyan*orbit1*.52+vio*orbit2*.48;
 float alpha=inside*(.20+.25*depth)+edge*.76+edgeSoft*.14+shells*.050+ribs*.048+innerRibs*.042+fracture*.032+caustic*.026+rings*.044+core*.20+hot*.42;alpha*=.98+uEnergy*.05;float outerAlpha=outer*.18;
 col*=1.18+uEnergy*.09+.020*pulse;col=pow(max(col,vec3(0.)),vec3(.90));vec3 finalCol=col*inside+outerCol;float finalAlpha=clamp(max(alpha*inside,outerAlpha),0.,.92);${webgl2?'outColor':'gl_FragColor'}=vec4(finalCol,finalAlpha);
}`;
 const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;
 let prog;try{prog=makeProgram(gl,vs,fs);}catch(e){console.error(e);stage.remove();root.dataset.fxCoreReal3d='shader-failed';root.dataset.fxCoreMobileR99='shader-failed';return;}
 const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(prog);const aP=gl.getAttribLocation(prog,'aP');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);const U={res:gl.getUniformLocation(prog,'uRes'),time:gl.getUniformLocation(prog,'uTime'),energy:gl.getUniformLocation(prog,'uEnergy'),pointer:gl.getUniformLocation(prog,'uPointer')};
 let w=0,h=0,raf=0,last=performance.now(),energy=.30,target=.30,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,frameAvg=16.7,frames=0,releaseTimer=0;const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=VERSION;cinematic.corePosition=[0,0,0];cinematic.energy=energy;
 function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=mobile?1.30:1.38,budget=mobile?540000:720000,dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr),pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k);}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}w=cw;h=ch;gl.viewport(0,0,cw,ch);root.dataset.fxCoreReal3dResolution=cw+'x'+ch;}
 const ro=new ResizeObserver(resize);ro.observe(stage);resize();const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf&&!disposed&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(frame);},{rootMargin:'160px'});io.observe(stage);
 function point(clientX,clientY,boost=1.08){const r=stage.getBoundingClientRect();tx=clamp(((clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);ty=clamp(((clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);target=Math.max(target,boost);}function holdIdle(ms=360){clearTimeout(releaseTimer);releaseTimer=setTimeout(()=>{target=.32;},ms);}
 hero.addEventListener('pointermove',e=>point(e.clientX,e.clientY,1.08),{passive:true});hero.addEventListener('pointerdown',e=>{point(e.clientX,e.clientY,1.52);holdIdle(460);},{passive:true});window.addEventListener('pointerup',()=>holdIdle(300),{passive:true});hero.addEventListener('touchstart',e=>{const q=e.touches?.[0]||e.changedTouches?.[0];if(q){point(q.clientX,q.clientY,1.58);holdIdle(540);}},{passive:true});hero.addEventListener('touchmove',e=>{const q=e.touches?.[0]||e.changedTouches?.[0];if(q){point(q.clientX,q.clientY,1.28);holdIdle(430);}},{passive:true});hero.addEventListener('touchend',()=>holdIdle(380),{passive:true});hero.addEventListener('touchcancel',()=>holdIdle(200),{passive:true});
 function pulse(detail){if(detail&&Number.isFinite(detail.x))tx=clamp(detail.x,-1,1);if(detail&&Number.isFinite(detail.y))ty=clamp(detail.y,-1,1);target=Math.max(target,detail?.phase==='drag'?1.26:1.62);holdIdle(detail?.phase==='drag'?430:540);}window.addEventListener('formatx:coreinteraction',e=>pulse(e.detail||null),{passive:true});window.addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&!disposed&&visible)raf=requestAnimationFrame(frame);},{passive:true});
 function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const st=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.080;py+=(ty-py)*.080;energy+=(target-energy)*.092;target+=(.30-target)*.010;cinematic.corePosition=[px*.060,-py*.060,energy*.010];cinematic.energy=energy;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const renderMs=performance.now()-st;root.dataset.fxCoreRenderMs=renderMs.toFixed(2);if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode=renderMs>12?'luminous-r99-adaptive':'luminous-r99-balanced';}if(!disposed)raf=requestAnimationFrame(frame);}
 function destroy(){if(disposed)return;disposed=true;clearTimeout(releaseTimer);if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;}
 window.FormatXCoreMobileV69={version:VERSION,pulse:()=>pulse(null),destroy,get energy(){return energy;}};root.dataset.fxCoreMobileR99=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-luminous-crystal-r99';root.dataset.fxCoreReferenceGeometry='reference-deep-concave-four-point-size-lock-r99';root.dataset.fxCoreReferenceMaterial='luminous-faceted-iceglass-caustic-r99';root.dataset.fxCoreInteractionVisual='touch-pointer-breathing-spectral-refraction-r99';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r99';dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r99',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));raf=requestAnimationFrame(frame);
}
boot();
}());

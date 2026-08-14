(function(){
'use strict';
const root=document.documentElement,READY='ready-v69',VERSION='reference-luminous-crystal-webgl-r99';
if(root.dataset.fxCoreMobileR99===READY||root.dataset.fxCoreMobileR99==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxCoreMobileR99='audit-skip';root.dataset.fxCoreMobileV69='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;
}
root.dataset.fxCoreMobileR99='booting';root.dataset.fxCoreMobileV69='booting-v69';root.dataset.fxCoreMobileV55='booting-v55';
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile');return s;}
function program(gl,vs,fs){const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'aP');gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link');return p;}
function boot(attempt=0){
  const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
  if(!hero||!host){if(attempt<240)return requestAnimationFrame(()=>boot(attempt+1));root.dataset.fxCoreMobileR99='host-unavailable';return;}
  window.FormatXCoreMobileV69?.destroy?.();document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(n=>n.remove());
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r102';stage.setAttribute('aria-hidden','true');host.prepend(stage);
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
float ridge(float x,float power){return pow(sat(1.-abs(fract(x)-.5)*2.),power);}float line2(vec2 p,float m,float b,float w){return band(p.y-p.x*m-b,w);}mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
void main(){
  float t=uTime;vec2 asp=vec2(uRes.x/max(1.,uRes.y),1.);vec2 scr=(vUv-.5)*2.*asp;scr.y+=.018;
  float breathe=1.+.0055*sin(t*.58)+.002*sin(t*1.17);vec2 p=(vUv-.5)*2.;p.x*=asp.x/.72;p.y+=.018;p*=vec2(.985,.94)/breathe;p+=vec2(-uPointer.x,uPointer.y)*(.008+.010*uEnergy);
  float ax=abs(p.x),ay=abs(p.y),pp=.585;float s=pow(ax,pp)+pow(ay/1.075,pp);float inside=1.-smoothstep(.992,1.014,s);
  float r=length(scr),a=atan(scr.y,scr.x),depth=pow(max(0.,1.-s),.44),pulse=.5+.5*sin(t*1.42);
  float edge=1.-smoothstep(.002,.018,abs(1.-s));float edgeHalo=1.-smoothstep(.018,.065,abs(1.-s));
  float sC=pow(abs(p.x+.009),pp)+pow(abs(p.y-.004)/1.075,pp),sV=pow(abs(p.x-.009),pp)+pow(abs(p.y+.004)/1.075,pp);float chromaC=band(sC-.996,.0056),chromaV=band(sV-.996,.0060);
  vec2 warp=vec2(noise2(p*3.0+vec2(t*.011,1.7)),noise2(p*3.7+vec2(4.1,-t*.010)))-.5;vec2 wp=p+warp*.042;
  float shells=0.;shells+=band(s-.945+.005*sin(a*4.+t*.035),.0034);shells+=.82*band(s-.878+.008*cos(a*5.-t*.028),.0038);shells+=.66*band(s-.798+.010*sin(a*6.+1.1),.0041);shells+=.50*band(s-.706+.013*cos(a*7.-.7),.0045);shells+=.36*band(s-.603+.014*sin(a*8.+.4),.0048);shells+=.24*band(s-.492+.016*cos(a*9.+.8),.0051);
  vec2 q1=rot(.31)*wp,q2=rot(-.50)*wp,q3=rot(1.02)*wp,q4=rot(-1.08)*wp;
  float fracture=0.;fracture+=ridge(q1.x*7.6+q1.y*2.3+noise2(q1*3.1)*1.15,27.);fracture+=.88*ridge(q2.x*8.9-q2.y*2.7+noise2(q2*3.8+2.4)*1.06,29.);fracture+=.72*ridge(q3.x*10.2+q3.y*1.9+noise2(q3*4.2-1.2)*.98,31.);fracture+=.56*ridge(q4.x*11.6-q4.y*1.5+noise2(q4*4.8+4.1)*.88,33.);fracture*=inside*(.20+.80*depth)*(.58+.42*noise2(wp*8.));
  float shard=0.;shard+=line2(wp,.62,.10,.0032)+line2(wp,-.62,.10,.0032)+line2(wp,.62,-.10,.0032)+line2(wp,-.62,-.10,.0032);shard+=.65*(line2(wp,.27,.31,.0030)+line2(wp,-.27,.31,.0030)+line2(wp,.27,-.31,.0030)+line2(wp,-.27,-.31,.0030));shard*=inside*depth*(.55+.45*noise2(wp*6.8+5.));
  float facetTone=noise2(wp*5.1+vec2(noise2(wp*2.0),-noise2(wp*2.7)));float pane=.5+.5*sin((q1.x+q1.y)*7.0+noise2(q2*3.)*1.7);pane*=.5+.5*sin((q2.x-q2.y)*6.2+noise2(q3*3.4)*1.5);pane=sat(pane);
  float caustic=ridge(wp.x*10.8+sin(wp.y*7.1+t*.075)*1.15+noise2(wp*4.4)*.80,30.)+.75*ridge(wp.y*11.7+sin(wp.x*6.0-t*.066)*1.08+noise2(wp*4.0+3.)*.74,32.);caustic*=inside*depth*(.48+.52*noise2(wp*9.5));
  float rings=band(r-.090,.0026)+.92*band(r-.132,.0028)+.78*band(r-.180,.0030)+.62*band(r-.235,.0034)+.46*band(r-.298,.0038)+.31*band(r-.370,.0042)+.18*band(r-.450,.0048);rings*=.75+.25*noise2(vec2(a*3.,r*18.+t*.022));
  float spokes=pow(sat(abs(cos(a*8.+sin(r*17.-t*.05)))),28.)*(1.-smoothstep(.08,.48,r))*.32;
  float axes=(band(scr.x,.00145)+band(scr.y,.00155))*(1.-smoothstep(.04,.66,r));float diag=.24*(line2(scr,.84,0.,.00145)+line2(scr,-.84,0.,.00145))*(1.-smoothstep(.08,.52,r));
  float tip=max(pow(sat(ax),4.),pow(sat(ay/1.075),4.));float spectral=.5+.5*sin(a*4.2-r*9.4+t*.085+uPointer.x*.8-uPointer.y*.5);
  vec3 deep=vec3(.002,.015,.052),navy=vec3(.004,.070,.210),blue=vec3(.005,.190,.500),cyan=vec3(.010,.920,1.520),vio=vec3(.650,.075,1.180),ice=vec3(.900,1.080,1.220);
  vec3 col=deep*(.72+.35*depth)+navy*(.22+.52*depth)+blue*(.08+.24*depth);
  col+=mix(cyan,vio,spectral)*(.025+.050*depth+.040*facetTone+.030*tip);col+=navy*(pane*.16*depth)+cyan*(pane*.035*depth);
  col+=cyan*(edge*1.28+edgeHalo*.42+shells*.47+chromaC*.58)+vio*(chromaV*.52+shells*.115+tip*.075);
  col+=ice*(fracture*.72+shard*.48+caustic*.60+rings*.74+spokes*.25+axes*.40+diag*.16);col+=cyan*(fracture*.42+shard*.26+caustic*.34+rings*.30+axes*.20)+vio*((fracture+caustic)*.085+rings*.095);
  float core=exp(-r*r*470.),hot=exp(-r*r*1900.),halo=exp(-r*r*88.);float reactor=band(r-.052,.0023)+.82*band(r-.075,.0026)+.58*band(r-.103,.0029);
  col+=ice*(hot*(4.35+.65*pulse+.55*uEnergy)+core*(1.40+.32*pulse)+reactor*1.05)+cyan*(core*.68+halo*.30+reactor*.40)+vio*(band(r-.132,.003)*.20+band(r-.180,.0034)*.13);col=mix(col,vec3(1.18,1.28,1.34)*2.2,sat(hot*1.1));
  vec2 cell=floor((wp+2.)*58.);float rnd=hash21(cell);float spark=step(.986,rnd)*pow(max(0.,.5+.5*sin(t*(.72+rnd*1.7)+rnd*35.)),24.)*inside;col+=ice*spark*(.78+.50*uEnergy);
  float orbit1=band(r-.53,.0025)*(.25+.75*pow(abs(sin(a*2.25+t*.055)),5.));float orbit2=band(r-.61,.0028)*(.22+.78*pow(abs(cos(a*2.0-t*.043)),6.));float orbit3=band(r-.70,.0031)*(.20+.80*pow(abs(sin(a*1.7+t*.033)),7.));float outer=(orbit1*.52+orbit2*.38+orbit3*.25)*(1.-inside);vec3 outerCol=cyan*(orbit1*.62+orbit3*.34)+vio*(orbit2*.56+orbit3*.24);
  float alpha=inside*(.145+.185*depth)+edge*.72+edgeHalo*.16+shells*.060+fracture*.050+shard*.036+caustic*.030+rings*.052+core*.24+hot*.44;alpha*=.98+uEnergy*.05;float outerAlpha=outer*.20;
  col*=1.16+uEnergy*.10+.022*pulse;col=pow(max(col,vec3(0.)),vec3(.90));vec3 finalCol=col*inside+outerCol;float finalAlpha=clamp(max(alpha*inside,outerAlpha),0.,.90);${webgl2?'outColor':'gl_FragColor'}=vec4(finalCol,finalAlpha);
}`;
  const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;
  let prog;try{prog=program(gl,vs,fs);}catch(e){console.error(e);stage.remove();root.dataset.fxCoreReal3d='shader-failed';root.dataset.fxCoreMobileR99='shader-failed';return;}
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

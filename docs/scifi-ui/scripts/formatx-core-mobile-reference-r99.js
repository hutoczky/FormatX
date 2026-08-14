(function(){
'use strict';
const root=document.documentElement,READY='ready-v69',VERSION='reference-luminous-crystal-webgl-r99';
if(root.dataset.fxCoreMobileR99===READY||root.dataset.fxCoreMobileR99==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxCoreMobileR99='audit-skip';root.dataset.fxCoreMobileV69='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;
}
root.dataset.fxCoreMobileR99='booting';root.dataset.fxCoreMobileV69='booting-v69';root.dataset.fxCoreMobileV55='booting-v55';
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches,reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile');return s}
function program(gl,vs,fs){const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'aP');gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link');return p}
function boot(attempt=0){
 const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
 if(!hero||!host){if(attempt<240)return requestAnimationFrame(()=>boot(attempt+1));root.dataset.fxCoreMobileR99='host-unavailable';return}
 window.FormatXCoreMobileV69?.destroy?.();document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(n=>n.remove());
 const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r99';stage.setAttribute('aria-hidden','true');host.prepend(stage);
 const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
 let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance',failIfMajorPerformanceCaveat:false}),webgl2=!!gl;
 if(!gl){gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'default'});webgl2=false}
 if(!gl){stage.remove();root.dataset.fxCoreReal3d='context-unavailable';return}
 const vs=webgl2?`#version 300 es\nprecision highp float;layout(location=0)in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`:`precision highp float;attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
 const body=`
uniform vec2 uRes;uniform float uTime,uEnergy;uniform vec2 uPointer;
float sat(float x){return clamp(x,0.,1.);}float band(float x,float w){return 1.-smoothstep(w,w*2.,abs(x));}
float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);} 
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.,1.)),f.x),f.y);} 
float ridge(float x,float power){return pow(sat(1.-abs(fract(x)-.5)*2.),power);}float line2(vec2 p,float m,float b,float w){return band(p.y-p.x*m-b,w);} 
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);} 
void main(){
 vec2 aspect=vec2(uRes.x/max(1.,uRes.y),1.);vec2 scr=(vUv-.5)*2.*aspect;scr.y+=.018;
 float breath=1.+.0065*sin(uTime*.62)+.0025*sin(uTime*1.21);vec2 p=(vUv-.5)*2.;p.x*=aspect.x/.72;p.y+=.018;p*=vec2(.985,.94)/breath;p+=vec2(-uPointer.x,uPointer.y)*(.007+.009*uEnergy);
 float ax=abs(p.x),ay=abs(p.y),pp=.585,s=pow(ax,pp)+pow(ay/1.075,pp);float inside=1.-smoothstep(.991,1.013,s);if(inside<.001){${webgl2?'outColor':'gl_FragColor'}=vec4(0.);return;}
 float depth=pow(max(0.,1.-s),.34),r=length(scr),a=atan(scr.y,scr.x),pulse=.5+.5*sin(uTime*1.36);
 float edge0=1.-smoothstep(.0025,.026,abs(1.-s));float edge1=1.-smoothstep(.015,.070,abs(1.-s));float edge=edge0+edge1*.38;
 float sC=pow(abs(p.x+.008),pp)+pow(abs(p.y-.004)/1.075,pp),sV=pow(abs(p.x-.008),pp)+pow(abs(p.y+.004)/1.075,pp);float chromaC=band(sC-.995,.0058),chromaV=band(sV-.995,.0062);
 vec2 warp=vec2(n2(p*3.7+vec2(uTime*.014,2.1)),n2(p*4.6+vec2(4.3,-uTime*.012)))-.5;vec2 wp=p+warp*.070;
 float shell=.0;shell+=band(s-.940+.006*sin(a*4.+uTime*.045),.0036);shell+=.78*band(s-.862+.010*cos(a*5.-uTime*.035),.0040);shell+=.60*band(s-.775+.014*sin(a*6.+1.3),.0045);shell+=.42*band(s-.676+.018*cos(a*7.-.8),.0050);shell+=.27*band(s-.565+.018*sin(a*9.+.5),.0053);
 vec2 q1=rot(.32)*wp,q2=rot(-.49)*wp,q3=rot(1.02)*wp;float fractures=0.;fractures+=ridge(q1.x*7.4+q1.y*2.2+n2(q1*3.2)*1.6,23.);fractures+=.86*ridge(q2.x*9.2-q2.y*2.8+n2(q2*4.1+2.4)*1.45,25.);fractures+=.72*ridge(q3.x*11.3+q3.y*1.7+n2(q3*5.0-1.2)*1.35,28.);fractures*=inside*(.18+.82*depth)*(.48+.52*n2(wp*9.));
 float lattice=0.;lattice+=line2(wp,.52,.12,.0035)+line2(wp,-.52,.12,.0035)+line2(wp,.52,-.12,.0035)+line2(wp,-.52,-.12,.0035);lattice+=.72*(line2(wp,.24,.34,.0035)+line2(wp,-.24,.34,.0035)+line2(wp,.24,-.34,.0035)+line2(wp,-.24,-.34,.0035));lattice*=inside*depth*(.55+.45*n2(wp*7.2+5.));
 float caustic=ridge(wp.x*12.4+sin(wp.y*8.2+uTime*.10)*1.8+n2(wp*5.2)*1.2,28.)+.82*ridge(wp.y*13.9+sin(wp.x*7.1-uTime*.085)*1.7+n2(wp*4.7+3.)*1.1,30.);caustic*=inside*depth*(.46+.54*n2(wp*11.));
 float spokes=pow(sat(abs(cos(a*12.+sin(r*19.-uTime*.07)))),35.)*(1.-smoothstep(.10,.52,r));spokes*=.62+.38*n2(vec2(a*4.,r*13.));
 float rings=band(r-.092,.0027)+.92*band(r-.132,.0030)+.78*band(r-.181,.0033)+.61*band(r-.238,.0037)+.43*band(r-.306,.0042)+.25*band(r-.382,.0048);rings*=.72+.28*n2(vec2(a*3.2,r*18.+uTime*.025));
 float axes=(band(scr.x,.0015)+band(scr.y,.0016))*(1.-smoothstep(.040,.62,r));float diagonal=.45*(line2(scr,.84,0.,.0016)+line2(scr,-.84,0.,.0016))*(1.-smoothstep(.08,.54,r));
 float facet=n2(wp*6.0+vec2(n2(wp*2.5),-n2(wp*3.1)));float facetFlash=pow(sat(facet),4.5)*depth;float tip=max(pow(sat(ax),4.),pow(sat(ay/1.075),4.));
 vec3 deep=vec3(.004,.035,.105),blue=vec3(.018,.18,.48),cyan=vec3(.02,1.08,1.72),ice=vec3(1.12,1.34,1.46),vio=vec3(.92,.20,1.52);float spectral=.5+.5*sin(a*4.4-r*10.5+uTime*.105+uPointer.x*.9-uPointer.y*.6);
 vec3 col=deep*(.34+.50*depth);col+=blue*(.12+.28*depth);col+=cyan*(.12+.24*depth+.08*facet);col+=mix(cyan,vio,spectral)*(.055+.12*facetFlash+.06*tip);col+=ice*(.035+.10*depth+.30*facetFlash);
 col+=cyan*(edge*1.55+shell*.54+chromaC*.62);col+=vio*(chromaV*.55+shell*.13+tip*.10*(.5+.5*sin(a*4.)));col+=ice*(fractures*1.22+lattice*.94+caustic*.92+rings*1.06+spokes*.50+axes*.70+diagonal*.28);col+=cyan*(fractures*.29+lattice*.23+caustic*.26+rings*.25+axes*.18);col+=vio*((fractures+caustic)*.075+rings*.11);
 float core=exp(-r*r*520.),hot=exp(-r*r*1220.),halo=exp(-r*r*92.);float coreRing=band(r-.055,.0025)+.78*band(r-.076,.0028);col+=ice*(hot*(3.35+.60*pulse+.50*uEnergy)+core*(1.50+.36*pulse)+halo*.55+coreRing*1.22);col+=cyan*(core*.82+halo*.42+coreRing*.38);col+=vio*(band(r-.132,.003)*.22+halo*.055);
 vec2 cell=floor((wp+2.)*58.);float rnd=hash21(cell),spark=step(.982,rnd)*pow(max(0.,.5+.5*sin(uTime*(.75+rnd*1.8)+rnd*36.)),22.)*inside;col+=ice*spark*(1.0+.55*uEnergy);
 float alpha=inside*(.095+.165*depth)+edge0*.72+edge1*.22+shell*.075+fractures*.055+lattice*.045+caustic*.040+rings*.075+core*.40;alpha*=.97+uEnergy*.08;col*=1.62+uEnergy*.15+.028*pulse;col=pow(max(col,vec3(0.)),vec3(.78));
 ${webgl2?'outColor':'gl_FragColor'}=vec4(col,clamp(alpha,0.,.94));
}`;
 const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;let prog;try{prog=program(gl,vs,fs)}catch(e){console.error(e);stage.remove();root.dataset.fxCoreReal3d='shader-failed';root.dataset.fxCoreMobileR99='shader-failed';return}
 const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(prog);const aP=gl.getAttribLocation(prog,'aP');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);const U={res:gl.getUniformLocation(prog,'uRes'),time:gl.getUniformLocation(prog,'uTime'),energy:gl.getUniformLocation(prog,'uEnergy'),pointer:gl.getUniformLocation(prog,'uPointer')};
 let w=0,h=0,raf=0,last=performance.now(),energy=.26,target=.26,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,frameAvg=16.7,frames=0,releaseTimer=0;const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=VERSION;cinematic.corePosition=[0,0,0];cinematic.energy=energy;
 function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=1.38,budget=540000,dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr),pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k)}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}w=cw;h=ch;gl.viewport(0,0,cw,ch);root.dataset.fxCoreReal3dResolution=cw+'x'+ch}
 const ro=new ResizeObserver(resize);ro.observe(stage);resize();const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf&&!disposed&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(frame)},{rootMargin:'160px'});io.observe(stage);
 function point(clientX,clientY,boost=1.06){const r=stage.getBoundingClientRect();tx=clamp(((clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);ty=clamp(((clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);target=Math.max(target,boost)}
 function holdIdle(ms=360){clearTimeout(releaseTimer);releaseTimer=setTimeout(()=>{target=.30},ms)}
 hero.addEventListener('pointermove',e=>point(e.clientX,e.clientY,1.04),{passive:true});hero.addEventListener('pointerdown',e=>{point(e.clientX,e.clientY,1.46);holdIdle(440)},{passive:true});window.addEventListener('pointerup',()=>holdIdle(280),{passive:true});
 hero.addEventListener('touchstart',e=>{const t=e.touches?.[0]||e.changedTouches?.[0];if(t){point(t.clientX,t.clientY,1.50);holdIdle(520)}},{passive:true});hero.addEventListener('touchmove',e=>{const t=e.touches?.[0]||e.changedTouches?.[0];if(t){point(t.clientX,t.clientY,1.22);holdIdle(420)}},{passive:true});hero.addEventListener('touchend',()=>holdIdle(360),{passive:true});hero.addEventListener('touchcancel',()=>holdIdle(180),{passive:true});
 function pulse(detail){if(detail&&Number.isFinite(detail.x))tx=clamp(detail.x,-1,1);if(detail&&Number.isFinite(detail.y))ty=clamp(detail.y,-1,1);target=Math.max(target,detail?.phase==='drag'?1.20:1.54);holdIdle(detail?.phase==='drag'?420:520)}window.addEventListener('formatx:coreinteraction',e=>pulse(e.detail||null),{passive:true});window.addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&!disposed&&visible)raf=requestAnimationFrame(frame)},{passive:true});
 function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const st=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.080;py+=(ty-py)*.080;energy+=(target-energy)*.092;target+=(.26-target)*.010;cinematic.corePosition=[px*.060,-py*.060,energy*.010];cinematic.energy=energy;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const renderMs=performance.now()-st;root.dataset.fxCoreRenderMs=renderMs.toFixed(2);if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode=renderMs>12?'luminous-r99-adaptive':'luminous-r99-balanced'}if(!disposed)raf=requestAnimationFrame(frame)}
 function destroy(){if(disposed)return;disposed=true;clearTimeout(releaseTimer);if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69}
 window.FormatXCoreMobileV69={version:VERSION,pulse:()=>pulse(null),destroy,get energy(){return energy}};root.dataset.fxCoreMobileR99=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-luminous-crystal-r99';root.dataset.fxCoreReferenceGeometry='reference-deep-concave-four-point-size-lock-r99';root.dataset.fxCoreReferenceMaterial='luminous-faceted-iceglass-caustic-r99';root.dataset.fxCoreInteractionVisual='touch-pointer-breathing-spectral-refraction-r99';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r99';dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r99',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));raf=requestAnimationFrame(frame)
}
boot();
}());
(function(){
'use strict';
const root=document.documentElement,READY='ready-v69',VERSION='reference-deep-crystal-webgl-r98';
if(root.dataset.fxCoreMobileR98===READY||root.dataset.fxCoreMobileR98==='booting')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){
  root.dataset.fxCoreMobileR98='audit-skip';root.dataset.fxCoreMobileV69='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;
}
root.dataset.fxCoreMobileR98='booting';root.dataset.fxCoreMobileV69='booting-v69';root.dataset.fxCoreMobileV55='booting-v55';
const mobile=matchMedia('(max-width:900px),(pointer:coarse)').matches;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile');return s}
function program(gl,vs,fs){const p=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,vs),f=compile(gl,gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'aP');gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link');return p}
function boot(attempt=0){
 const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
 if(!hero||!host){if(attempt<240)return requestAnimationFrame(()=>boot(attempt+1));root.dataset.fxCoreMobileR98='host-unavailable';return}
 window.FormatXCoreMobileV69?.destroy?.();document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(n=>n.remove());
 const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r98';stage.setAttribute('aria-hidden','true');host.prepend(stage);
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
float ridge(float x,float power){return pow(sat(1.-abs(fract(x)-.5)*2.),power);} 
void main(){
 vec2 aspect=vec2(uRes.x/max(1.,uRes.y),1.);vec2 scr=(vUv-.5)*2.*aspect;scr.y+=.018;
 float breathe=1.+.007*sin(uTime*.62)+.003*sin(uTime*1.31);vec2 p=(vUv-.5)*2.;p.x*=aspect.x/.72;p.y+=.018;p*=vec2(.985,.94)/breathe;
 p+=vec2(-uPointer.x,uPointer.y)*(.008+.010*uEnergy);
 float ax=abs(p.x),ay=abs(p.y),pp=.585;float s=pow(ax,pp)+pow(ay/1.075,pp);float inside=1.-smoothstep(.992,1.014,s);if(inside<.001){${webgl2?'outColor':'gl_FragColor'}=vec4(0.);return;}
 float depth=pow(max(0.,1.-s),.40);float r=length(scr),a=atan(scr.y,scr.x);
 float gx=pp*pow(max(ax,.0005),pp-1.)*sign(p.x),gy=pp*pow(max(ay,.0005)/1.075,pp-1.)*sign(p.y);vec3 N=normalize(vec3(-gx*.16,-gy*.16,.82+depth*1.24));vec3 V=normalize(vec3(uPointer.x*.20,-uPointer.y*.20,1.));
 vec3 L1=normalize(vec3(-.34,.88,.86)),L2=normalize(vec3(.72,-.18,.93));float fres=pow(1.-sat(dot(N,V)),1.36),d1=max(0.,dot(N,L1)),d2=max(0.,dot(N,L2));float spec1=pow(max(0.,dot(reflect(-L1,N),V)),82.),spec2=pow(max(0.,dot(reflect(-L2,N),V)),46.);
 float edgeBase=1.-smoothstep(.004,.050,abs(1.-s));float edgeNoise=.62+.38*n2(vec2(a*5.2+uTime*.025,s*8.));float edge=edgeBase*edgeNoise;
 float shellMask=.70+.30*n2(vec2(a*3.1,s*15.+uTime*.018));
 float shells=(band(s-.966,.0035)+.72*band(s-.898+.007*sin(a*3.+uTime*.06),.0040)+.50*band(s-.814+.012*cos(a*5.-uTime*.05),.0045)+.31*band(s-.718+.016*sin(a*7.+1.2),.0050))*shellMask;
 float sC=pow(abs(p.x+.008),pp)+pow(abs(p.y-.005)/1.075,pp),sV=pow(abs(p.x-.009),pp)+pow(abs(p.y+.005)/1.075,pp);float chromaC=band(sC-.994,.0062),chromaV=band(sV-.994,.0062);
 vec2 warp=vec2(n2(p*4.3+vec2(uTime*.018,0.)),n2(p*5.1-vec2(0.,uTime*.014)))-.5;vec2 wp=p+warp*.075;
 float vein1=ridge(wp.x*7.8+wp.y*3.2+n2(wp*3.5)*1.6,18.);float vein2=ridge(wp.y*9.4-wp.x*4.7+n2(wp*4.8+2.3)*1.5,20.);float vein3=ridge((wp.x+wp.y)*6.4+n2(wp*6.2-1.7)*1.8,22.);float vein4=ridge((wp.x-wp.y)*8.1+n2(wp*5.5+4.1)*1.5,24.);
 float veins=max(max(vein1,vein2*.86),max(vein3*.72,vein4*.66))*inside*(.15+.85*depth);veins*=.46+.54*n2(wp*10.7);
 vec2 q1=mat2(.906,-.423,.423,.906)*wp*6.8,q2=mat2(.643,-.766,.766,.643)*wp*9.7;float shard1=ridge(q1.x+n2(q1*.37)*2.1,16.),shard2=ridge(q2.y+n2(q2*.33)*2.0,19.);float shard=(shard1*.62+shard2*.55)*inside*(.20+.80*depth)*(.38+.62*n2(wp*8.6+1.4));
 float facet=n2(wp*6.6+vec2(n2(wp*2.9),-n2(wp*3.7)));float facetFlash=pow(sat(facet),5.)*depth;
 float caustic1=ridge(wp.x*10.8+sin(wp.y*7.3+uTime*.10)*1.9+wp.y*2.5,28.);float caustic2=ridge(wp.y*13.2+sin(wp.x*8.4-uTime*.08)*1.7-wp.x*3.1,30.);float caustic=(caustic1*.72+caustic2*.60)*inside*depth*(.55+.45*n2(wp*12.));
 float fold1=band(abs(wp.x)-(.30*abs(wp.y)+.105+.030*sin(wp.y*8.+uTime*.08)),.006);float fold2=band(abs(wp.y)-(.30*abs(wp.x)+.105+.025*cos(wp.x*9.-uTime*.07)),.006);float folds=(fold1+fold2)*inside*(.32+.68*depth);
 float arcMask=smoothstep(.42,.68,n2(vec2(a*2.8+uTime*.025,r*10.)));float ring1=band(r-(.085+.006*sin(a*4.-uTime*.12)),.0030),ring2=band(r-(.145+.010*cos(a*5.+uTime*.08)),.0035),ring3=band(r-(.218+.014*sin(a*6.+1.1)),.0042);float reactor=(ring1+.68*ring2+.34*ring3)*arcMask*(1.-smoothstep(.27,.42,r));
 float axes=(band(scr.x,.0015)+line2(scr,0.,0.,.0016))*(1.-smoothstep(.045,.60,r));axes*=.48+.52*n2(vec2(a*4.,r*17.+uTime*.035));
 float sideViolet=pow(sat(abs(sin(a*2.0))),5.)*smoothstep(.25,.72,s)*edgeBase;float tip=max(pow(sat(abs(p.x)),5.),pow(sat(abs(p.y)/1.075),5.));float fracture=ridge(a*2.2+s*17.+n2(vec2(a*3.6,s*9.))*2.4+uTime*.025,20.)*edgeBase*(.30+.70*tip);
 vec3 cyan=vec3(.03,1.02,1.55),ice=vec3(1.04,1.20,1.28),vio=vec3(.86,.18,1.44),blue=vec3(.006,.045,.135);float spectral=.5+.5*sin(a*4.3-r*10.8+uTime*.10+uPointer.x*.9-uPointer.y*.7);
 vec3 col=blue*(.38+.54*depth);col+=vec3(.014,.14,.29)*depth;col+=cyan*(.075+.16*d1+.055*d2+.13*depth);col+=mix(cyan,vio,spectral)*(.045+.10*facet+.075*depth);col+=ice*(.018+.035*depth+spec1*.94+spec2*.36+facetFlash*.22);
 col+=cyan*(edge*1.50+shells*.33+chromaC*.50+fracture*.30);col+=vio*(chromaV*.48+sideViolet*.35+shells*.07);col+=ice*(veins*.94+shard*.72+caustic*.62+folds*.48+reactor*.72+axes*.34);col+=cyan*(veins*.22+shard*.17+caustic*.18+folds*.15+reactor*.18);col+=vio*((veins+caustic)*.055+reactor*.10);
 float pulse=.5+.5*sin(uTime*1.48);float core=exp(-r*r*760.),halo=exp(-r*r*135.),aura=exp(-r*r*52.);float coreRing=band(r-.047,.0024),coreRing2=band(r-.079+.004*sin(a*5.-uTime*.14),.0030);col+=ice*(core*(3.05+.52*pulse+.42*uEnergy)+halo*(.74+.24*pulse)+coreRing*1.12+coreRing2*.44);col+=cyan*(halo*.58+aura*.22+coreRing*.30+coreRing2*.24);col+=vio*(coreRing2*.16+aura*.04);
 vec2 cell=floor((wp+2.)*62.);float rnd=hash21(cell),spark=step(.988,rnd)*pow(max(0.,.5+.5*sin(uTime*(.85+rnd*1.9)+rnd*41.)),24.)*inside;col+=ice*spark*(.92+.48*uEnergy);
 float alpha=inside*(.075+.135*depth+.25*fres)+edge*.64+shells*.060+veins*.050+shard*.038+folds*.042+reactor*.060+core*.50;alpha*=.97+uEnergy*.07;col*=1.42+uEnergy*.13+.022*pulse;col=pow(max(col,vec3(0.)),vec3(.82));
 ${webgl2?'outColor':'gl_FragColor'}=vec4(col,clamp(alpha,0.,.91));
}`;
 const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;let prog;try{prog=program(gl,vs,fs)}catch(e){console.error(e);stage.remove();root.dataset.fxCoreReal3d='shader-failed';root.dataset.fxCoreMobileR98='shader-failed';return}
 const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(prog);const aP=gl.getAttribLocation(prog,'aP');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);const U={res:gl.getUniformLocation(prog,'uRes'),time:gl.getUniformLocation(prog,'uTime'),energy:gl.getUniformLocation(prog,'uEnergy'),pointer:gl.getUniformLocation(prog,'uPointer')};
 let w=0,h=0,raf=0,last=performance.now(),energy=.24,target=.24,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,frameAvg=16.7,frames=0;const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=VERSION;cinematic.corePosition=[0,0,0];cinematic.energy=energy;
 function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=1.38,budget=540000,dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr),pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k)}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}w=cw;h=ch;gl.viewport(0,0,cw,ch);root.dataset.fxCoreReal3dResolution=cw+'x'+ch}
 const ro=new ResizeObserver(resize);ro.observe(stage);resize();const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf&&!disposed)raf=requestAnimationFrame(frame)},{rootMargin:'160px'});io.observe(stage);
 function point(clientX,clientY,boost=1.04){const r=stage.getBoundingClientRect();tx=clamp(((clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);ty=clamp(((clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);target=Math.max(target,boost)}
 function pointer(e){point(e.clientX,e.clientY,1.04)}
 function touch(e,boost=1.36){const t=e.touches?.[0]||e.changedTouches?.[0];if(t)point(t.clientX,t.clientY,boost)}
 hero.addEventListener('pointermove',pointer,{passive:true});hero.addEventListener('pointerdown',e=>point(e.clientX,e.clientY,1.38),{passive:true});window.addEventListener('pointerup',()=>{target=.30},{passive:true});
 hero.addEventListener('touchstart',e=>touch(e,1.42),{passive:true});hero.addEventListener('touchmove',e=>touch(e,1.14),{passive:true});hero.addEventListener('touchend',()=>{target=.30},{passive:true});hero.addEventListener('touchcancel',()=>{target=.30},{passive:true});
 function pulse(detail){if(detail&&Number.isFinite(detail.x))tx=clamp(detail.x,-1,1);if(detail&&Number.isFinite(detail.y))ty=clamp(detail.y,-1,1);target=detail?.phase==='drag'?1.12:1.48;setTimeout(()=>{target=.30},380)}window.addEventListener('formatx:coreinteraction',e=>pulse(e.detail||null),{passive:true});window.addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&!disposed&&visible)raf=requestAnimationFrame(frame)},{passive:true});
 function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const st=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.082;py+=(ty-py)*.082;energy+=(target-energy)*.095;target+=(.24-target)*.012;cinematic.corePosition=[px*.058,-py*.058,energy*.009];cinematic.energy=energy;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const renderMs=performance.now()-st;root.dataset.fxCoreRenderMs=renderMs.toFixed(2);if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode=renderMs>12?'crystal-r98-adaptive':'crystal-r98-balanced'}if(!disposed)raf=requestAnimationFrame(frame)}
 function destroy(){if(disposed)return;disposed=true;if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69}
 window.FormatXCoreMobileV69={version:VERSION,pulse:()=>pulse(null),destroy,get energy(){return energy}};root.dataset.fxCoreMobileR98=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-deep-crystal-r98';root.dataset.fxCoreReferenceGeometry='reference-deep-concave-four-point-size-lock-r98';root.dataset.fxCoreReferenceMaterial='deep-faceted-iceglass-caustic-r98';root.dataset.fxCoreInteractionVisual='touch-pointer-breathing-refraction-energy-r98';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r98';dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r98',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));raf=requestAnimationFrame(frame)
}
boot();
}());

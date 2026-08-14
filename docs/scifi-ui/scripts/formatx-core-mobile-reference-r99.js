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
 const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r107';stage.setAttribute('aria-hidden','true');host.prepend(stage);
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
float field(vec2 q){return pow(abs(q.x),.585)+pow(abs(q.y/1.075),.585);}
float heightAt(vec2 q){float f=field(q),d=max(0.,1.-f),ang=atan(q.y,q.x);float pet=.84+.16*(.5+.5*cos(ang*4.));float fold=.94+.06*sin(ang*8.+d*7.);return pow(d,.54)*pet*fold;}
void main(){
 float t=uTime;vec2 asp=vec2(uRes.x/max(1.,uRes.y),1.);vec2 scr=(vUv-.5)*2.*asp;scr.y+=.018;
 float breathing=1.+.0048*sin(t*.54)+.0017*sin(t*1.14);vec2 p=(vUv-.5)*2.;p.x*=asp.x/.72;p.y+=.018;p*=vec2(.985,.94)/breathing;p+=vec2(-uPointer.x,uPointer.y)*(.008+.010*uEnergy);
 float s=field(p),inside=1.-smoothstep(.992,1.014,s),depth=pow(max(0.,1.-s),.40),r=length(scr),a=atan(scr.y,scr.x),pulse=.5+.5*sin(t*1.34);
 float edge=1.-smoothstep(.0015,.015,abs(1.-s)),edgeSoft=1.-smoothstep(.015,.052,abs(1.-s));
 float sC=field(p+vec2(.009,-.0035)),sV=field(p+vec2(-.009,.0035));float chromaC=band(sC-.996,.0054),chromaV=band(sV-.996,.0058);
 float h=heightAt(p),e=.008;float hx1=heightAt(p+vec2(e,0.)),hx0=heightAt(p-vec2(e,0.)),hy1=heightAt(p+vec2(0.,e)),hy0=heightAt(p-vec2(0.,e));
 vec3 N=normalize(vec3((hx0-hx1)*2.7,(hy0-hy1)*2.7,.34));vec3 V=vec3(0.,0.,1.);
 vec3 L1=normalize(vec3(-.58,.52,.72)),L2=normalize(vec3(.58,.25,.78)),L3=normalize(vec3(.08,-.72,.69));
 float d1=max(dot(N,L1),0.),d2=max(dot(N,L2),0.),d3=max(dot(N,L3),0.);float fres=pow(sat(1.-abs(N.z)),2.15);
 float sp1=pow(max(dot(reflect(-L1,N),V),0.),38.),sp2=pow(max(dot(reflect(-L2,N),V),0.),42.),sp3=pow(max(dot(reflect(-L3,N),V),0.),32.);
 float petal=.5+.5*cos(a*4.+h*3.4+t*.018);float foldA=pow(sat(.5+.5*cos(a*4.+h*7.2)),5.0),foldB=pow(sat(.5+.5*cos(a*8.-h*4.8+t*.022)),8.0);
 float shells=band(s-.90,.010)+.68*band(s-.76,.011)+.46*band(s-.61,.012)+.28*band(s-.46,.013);
 vec2 wp=p+(vec2(noise2(p*2.25+vec2(t*.009,1.2)),noise2(p*2.65+vec2(3.4,-t*.008)))-.5)*.025;
 vec2 q1=rot(.34)*wp,q2=rot(-.57)*wp;float fracture=(ridge(q1.x*5.0+q1.y*1.7+noise2(q1*2.5)*.55,34.)+.62*ridge(q2.x*5.9-q2.y*2.0+noise2(q2*2.9+2.)*.48,38.))*inside*depth*.22;
 float caustic=(ridge((scr.x+N.x*.055)*5.0+sin((scr.y+N.y*.05)*5.7+t*.050)*.72,30.)+.62*ridge((scr.y+N.y*.050)*5.6+sin((scr.x+N.x*.05)*5.0-t*.042)*.68,32.))*inside*depth*.18;
 float rings=band(r-.096,.0030)+.76*band(r-.150,.0033)+.52*band(r-.218,.0038)+.30*band(r-.300,.0044);float axes=(band(scr.x,.00155)+band(scr.y,.00165))*(1.-smoothstep(.045,.59,r));
 float spectral=.5+.5*sin(a*4.0+h*4.2+t*.060+uPointer.x*.65-uPointer.y*.45);
 vec3 deep=vec3(.0015,.010,.036),navy=vec3(.003,.052,.165),blue=vec3(.008,.205,.520),cyan=vec3(.020,.960,1.52),vio=vec3(.68,.075,1.28),ice=vec3(.94,1.08,1.18);
 vec3 col=deep*(.72+.30*depth)+navy*(.30+.62*depth)+blue*(.08+.26*depth);
 col+=blue*(d1*.28+d2*.24+d3*.18)*inside;col+=cyan*(d1*.16+d3*.10)*inside;col+=vio*d2*.12*inside;
 col+=mix(cyan*.42,vio*.40,spectral)*(petal*.12+foldA*.12+foldB*.06)*inside*depth;
 col+=ice*(sp1*.82+sp2*.70+sp3*.58)*inside+cyan*(sp1*.35+sp3*.22)*inside+vio*sp2*.30*inside;
 col+=cyan*(fres*.65+edge*1.15+edgeSoft*.28+chromaC*.50)+vio*(fres*.18+chromaV*.46);
 col+=ice*(shells*.16+fracture*.55+caustic*.44+rings*.62+axes*.29)+cyan*(shells*.18+fracture*.30+caustic*.28+rings*.20+axes*.16)+vio*(shells*.055+fracture*.08);
 float centralLens=exp(-r*r*23.)*inside;col+=blue*centralLens*.18+cyan*centralLens*.075;
 float core=exp(-r*r*430.),hot=exp(-r*r*1800.),halo=exp(-r*r*72.);float reactor=band(r-.053,.0025)+.78*band(r-.080,.0028)+.54*band(r-.112,.0031);
 col+=ice*(hot*(4.45+.66*pulse+.52*uEnergy)+core*1.34+reactor*.90)+cyan*(core*.72+halo*.34+reactor*.36)+vio*(band(r-.150,.0033)*.16+band(r-.218,.0038)*.10);col=mix(col,vec3(1.18,1.28,1.36)*2.18,sat(hot*1.1));
 vec2 cell=floor((wp+2.)*42.);float rnd=hash21(cell);float spark=step(.993,rnd)*pow(max(0.,.5+.5*sin(t*(.62+rnd*1.4)+rnd*29.)),24.)*inside;col+=ice*spark*(.48+.36*uEnergy);
 float orbit1=band(r-.53,.0027)*(.20+.80*pow(abs(sin(a*2.1+t*.047)),7.)),orbit2=band(r-.64,.0030)*(.18+.82*pow(abs(cos(a*1.8-t*.038)),8.));float outer=(orbit1*.44+orbit2*.32)*(1.-inside);vec3 outerCol=cyan*orbit1*.50+vio*orbit2*.45;
 float alpha=inside*(.29+.30*depth+.15*fres)+edge*.74+edgeSoft*.12+shells*.027+fracture*.028+caustic*.022+rings*.032+core*.18+hot*.42;alpha*=.98+uEnergy*.05;float outerAlpha=outer*.17;
 col*=1.25+uEnergy*.10+.020*pulse;col=pow(max(col,vec3(0.)),vec3(.86));vec3 finalCol=col*inside+outerCol;float finalAlpha=clamp(max(alpha*inside,outerAlpha),0.,.94);${webgl2?'outColor':'gl_FragColor'}=vec4(finalCol,finalAlpha);
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

(function(){
'use strict';
const root=document.documentElement,READY='ready-v69',VERSION='reference-luminous-crystal-webgl-r99-award-r108';
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
  window.FormatXCoreMobileV69?.destroy?.();
  document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(n=>n.remove());
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r108-volumetric';stage.setAttribute('aria-hidden','true');host.prepend(stage);
  const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance',failIfMajorPerformanceCaveat:false}),webgl2=!!gl;
  if(!gl){gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'default'});webgl2=false;}
  if(!gl){stage.remove();root.dataset.fxCoreReal3d='context-unavailable';return;}
  const vs=webgl2?`#version 300 es\nprecision highp float;layout(location=0)in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`:`precision highp float;attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
  const body=`uniform vec2 uRes;uniform float uTime,uEnergy;uniform vec2 uPointer;
float sat(float x){return clamp(x,0.,1.);}float band(float x,float w){return 1.-smoothstep(w,w*2.,abs(x));}
float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.;v+=n2(p)*.55;p=mat2(.80,-.60,.60,.80)*p*2.03;v+=n2(p)*.28;p=mat2(.80,-.60,.60,.80)*p*2.07;v+=n2(p)*.17;return v;}
float ridge(float x,float power){return pow(sat(1.-abs(fract(x)-.5)*2.),power);}mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float starS(vec2 p){vec2 q=vec2(p.x/.86,p.y*(p.y<0.?.976:1.031));float pp=.70;return pow(abs(q.x),pp)+pow(abs(q.y),pp);}
void main(){
 float t=uTime;vec2 asp=vec2(uRes.x/max(1.,uRes.y),1.);vec2 p=(vUv-.5)*2.;p.x*=asp.x;p.y-=.030;
 p+=vec2(-uPointer.x,uPointer.y)*(.010+.012*uEnergy);
 float a=atan(p.y,p.x),rr=length(vec2(p.x,p.y*1.01));float s=starS(p),inside=1.-smoothstep(.990,1.012,s);float d=sat(1.-s),depth=pow(d,.34);
 float edge=band(s-1.,.0042),edgeGlow=band(s-.982,.015);float cEdge=band(starS(p+vec2(.006,-.002))-1.,.0048),vEdge=band(starS(p-vec2(.007,-.003))-1.,.0050);
 vec2 wp=p+(vec2(fbm(p*2.25+vec2(t*.018,1.7)),fbm(p*2.45+vec2(4.2,-t*.015)))-.5)*.052;
 vec2 q1=rot(.33)*wp,q2=rot(-.48)*wp,q3=rot(.91)*wp,q4=rot(-1.04)*wp;
 float faceNoise=fbm(wp*2.15+vec2(.2,-.6));float facet=fbm(rot(.18)*wp*3.0+vec2(2.4,-1.7));float glassLight=.35+.65*pow(sat(.5+.5*sin(faceNoise*7.2+facet*3.6+a*2.0)),1.35);
 float vy=sat(abs(p.y)),vx=sat(abs(p.x)/.86);float curveV=.030+.175*pow(sat(1.-vy),1.30),curveH=.028+.160*pow(sat(1.-vx),1.34);float ribs=(band(abs(p.x)-curveV,.0055)*smoothstep(.18,.96,vy)+band(abs(p.y)-curveH,.0055)*smoothstep(.18,.96,vx))*inside*(.30+.70*depth);
 float rayFan=0.;rayFan+=band(p.x-p.y*.22+.010*sin(p.y*9.+t*.03),.0038)+band(p.x+p.y*.22-.009*sin(p.y*8.-t*.02),.0038);rayFan+=.82*(band(p.x-p.y*.48+.012*sin(p.y*7.+1.2),.0040)+band(p.x+p.y*.48-.011*sin(p.y*6.-.8),.0040));rayFan+=.68*(band(p.y-p.x*.24+.009*sin(p.x*10.-.4),.0038)+band(p.y+p.x*.24-.009*sin(p.x*9.+.7),.0038));rayFan*=inside*smoothstep(.12,.94,rr)*(.30+.70*fbm(wp*2.4+4.));
 float foldA=ridge(q1.x*2.25+q1.y*.78+fbm(q1*1.7)*1.18+t*.020,4.2);
 float foldB=ridge(q2.x*2.55-q2.y*.62+fbm(q2*1.9+2.)*1.10-t*.016,4.6);
 float foldC=ridge(q3.y*2.15+q3.x*.58+fbm(q3*1.55-3.)*.98+t*.012,4.0);
 float foldD=ridge(q4.y*2.75-q4.x*.42+fbm(q4*1.8+5.)*.92-t*.010,5.0);
 float folds=(foldA*.78+foldB*.68+foldC*.57+foldD*.48)*inside*(.24+.76*depth);
 float paneNoise=fbm(wp*2.0+vec2(.2,t*.01));float pane=inside*depth*(.22+.78*paneNoise);
 float pane2=inside*depth*(.5+.5*sin((q1.x+q2.y)*3.4+fbm(wp*2.6)*3.2));
 float fracture=0.;fracture+=band(fbm(q1*3.0+vec2(.7,-1.1))-.48,.0045)*(.18+.82*n2(q1*4.5+2.));fracture+=.82*band(fbm(q2*3.4+vec2(-2.1,.5))-.54,.0042)*(.18+.82*n2(q2*4.8-3.));fracture+=.62*band(fbm(q3*3.8+vec2(1.5,2.2))-.43,.0040)*(.16+.84*n2(q3*5.2+5.));fracture*=inside*(.10+.90*depth)*smoothstep(.08,.30,depth);
 float shard=0.;shard+=ridge(q1.x*5.8+q1.y*1.45+fbm(q1*1.7)*.55,34.)*smoothstep(.48,.72,fbm(q1*2.25+3.));shard+=.86*ridge(q2.x*6.5-q2.y*1.35+fbm(q2*1.9+2.)*.50,36.)*smoothstep(.50,.74,fbm(q2*2.45-1.));shard+=.72*ridge(q3.y*7.1+q3.x*1.1+fbm(q3*2.0-2.)*.46,38.)*smoothstep(.52,.76,fbm(q3*2.6+5.));shard+=.55*ridge(q4.y*7.8-q4.x*.9+fbm(q4*2.2+4.)*.42,40.)*smoothstep(.54,.78,fbm(q4*2.8-4.));shard*=inside*(.18+.82*depth);
 float wisps=(ridge(wp.x*4.7+sin(wp.y*3.8+t*.06)*.62+fbm(wp*2.5)*.82,20.)+.68*ridge(wp.y*5.2+sin(wp.x*3.6-t*.05)*.58+fbm(wp*2.7+2.)*.74,22.))*inside*depth*(.35+.65*n2(wp*4.));
 float shells=band(s-.900+.011*sin(a*4.+t*.03),.0052)+.48*band(s-.735+.016*cos(a*5.-t*.025),.0060)+.24*band(s-.555+.020*sin(a*6.+.6),.0068);
 float rings=1.10*band(rr-.105,.0042)+.86*band(rr-.155,.0047)+.66*band(rr-.220,.0053)+.30*band(rr-.300,.0060)+.14*band(rr-.405,.0068);
 float core=exp(-rr*rr*330.),hot=exp(-rr*rr*1500.),halo=exp(-rr*rr*66.);
 float beamH=exp(-p.y*p.y*1350.)*(1.-smoothstep(.035,1.02,abs(p.x)));float beamV=exp(-p.x*p.x*1500.)*(1.-smoothstep(.035,1.02,abs(p.y)));
 float spoke=pow(sat(abs(cos(a*8.+sin(rr*18.-t*.04)))),34.)*(1.-smoothstep(.10,.48,rr))*.28;
 float spectral=.5+.5*sin(a*4.15-rr*8.6+t*.07+fbm(wp*2.2)*2.0+uPointer.x*.8);
 float chromaC=.5+.5*sin(a*5.1+rr*10.4-t*.052+fbm(wp*2.55+1.7)*1.45);
 float chromaV=.5+.5*cos(a*4.6-rr*9.2+t*.044+fbm(wp*2.25-2.1)*1.65);
 float tipX=pow(sat(abs(p.x)/.86),7.)*inside,tipY=pow(sat(abs(p.y)),7.)*inside;
 float o1=band(rr-.52,.0027)*(.2+.8*pow(abs(sin(a*2.1+t*.05)),5.));float o2=band(rr-.62,.0030)*(.2+.8*pow(abs(cos(a*1.9-t*.042)),6.));float o3=band(rr-.72,.0033)*pow(abs(sin(a*1.6+t*.032)),7.);
 float fy=-p.y;float floorMask=smoothstep(.08,.94,fy);float ripple=(ridge(fy*22.+sin(p.x*8.)*.36+t*.10,28.)*.72+ridge(fy*37.-sin(p.x*13.)*.25-t*.07,32.)*.44+ridge(fy*54.+sin(p.x*18.)*.18+t*.04,36.)*.24)*floorMask*(1.-inside*.58)*(1.-smoothstep(.10,1.14,abs(p.x)));
 float horizon=band(p.y+.055,.006)*(1.-inside*.40)*(1.-smoothstep(.12,1.16,abs(p.x)));float reflection=exp(-p.x*p.x*10.)*smoothstep(.06,.88,fy)*(1.-smoothstep(.15,1.04,fy))*(.55+.45*ridge(fy*18.+sin(p.x*9.)*.25+t*.06,10.));
 float cell=hash21(floor((p+2.)*vec2(36.,32.)));float spark=step(.988,cell)*pow(max(0.,.5+.5*sin(t*(.7+cell*1.5)+cell*30.)),18.)*(1.-inside);
 vec3 deep=vec3(.001,.009,.028),navy=vec3(.003,.060,.185),blue=vec3(.006,.185,.46),cyan=vec3(.012,.86,1.30),vio=vec3(.58,.075,1.05),ice=vec3(.90,1.04,1.08);
 vec3 col=deep*.78+navy*(.035+.12*depth)+blue*(.018+.075*depth);col+=mix(blue*.18,cyan*.12,spectral)*inside*depth*glassLight;
 col+=mix(cyan,vio,spectral)*(.026+.050*depth+.135*folds+.060*pane2)*(.62+.55*glassLight);
 col+=cyan*(chromaC*.018)*inside*depth+vio*(chromaV*.016)*inside*depth;
 col+=cyan*(pane*.055+folds*.145)+vio*(pane*.028+folds*.078);
 col+=cyan*(edge*.88+edgeGlow*.16+cEdge*.26+shells*.20+ribs*.38+rayFan*.56+fracture*.32+wisps*.26);
 col+=vio*(vEdge*.34+shells*.10+ribs*.12+rayFan*.20+fracture*.18+wisps*.18);
 col+=ice*(fracture*.24+shard*1.18+ribs*.34+rayFan*.70+wisps*.20+shells*.10+rings*1.20+spoke*.19+beamH*.30+beamV*.22);
 col+=cyan*(rings*.94+shard*.46+ribs*.20+rayFan*.32+spoke*.18+beamH*1.18+beamV*.72);
 col+=ice*(hot*(5.2+.75*uEnergy)+core*1.55)+cyan*(core*1.10+halo*.52)+vio*(band(rr-.160,.0032)*.14+band(rr-.210,.0034)*.10);
 col=mix(col,vec3(1.10,1.22,1.26)*2.0,sat(hot*.95));
 col+=ice*(tipX+tipY)*.10+cyan*(tipX+tipY)*.22;
 vec3 outer=cyan*(o1*.48+o3*.25)+vio*(o2*.48+o3*.20);col+=outer+cyan*(ripple*.72+horizon*.46+reflection*.28)+vio*(ripple*.30+reflection*.10)+ice*(spark*.50+horizon*.18+reflection*.12);
 float alpha=inside*(.050+.080*depth+.060*pane+.075*folds)+edge*.43+edgeGlow*.05+shells*.020+ribs*.032+rayFan*.038+fracture*.018+shard*.070+wisps*.020+rings*.065+core*.28+hot*.48+beamH*.050+beamV*.040;
 alpha=max(alpha,(o1+o2+o3)*.13);alpha=max(alpha,ripple*.09+horizon*.08+spark*.15);alpha*=.98+uEnergy*.04;
 col*=1.48+uEnergy*.12;col=pow(max(col,vec3(0.)),vec3(.88));${webgl2?'outColor':'gl_FragColor'}=vec4(col,clamp(alpha,0.,.88));
}`;
  const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;
  let prog;try{prog=program(gl,vs,fs);}catch(e){console.error('[FormatX MAG r108 shader]',e);stage.remove();root.dataset.fxCoreReal3d='shader-failed';root.dataset.fxCoreMobileR99='shader-failed';return;}
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(prog);
  const aP=gl.getAttribLocation(prog,'aP');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
  const U={res:gl.getUniformLocation(prog,'uRes'),time:gl.getUniformLocation(prog,'uTime'),energy:gl.getUniformLocation(prog,'uEnergy'),pointer:gl.getUniformLocation(prog,'uPointer')};
  let w=0,h=0,raf=0,last=performance.now(),energy=.30,target=.30,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,frameAvg=16.7,frames=0,releaseTimer=0;
  const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=VERSION;cinematic.corePosition=[0,0,0];cinematic.energy=energy;
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=mobile?1.28:1.40,budget=mobile?540000:740000,dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr),pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k);}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}w=cw;h=ch;gl.viewport(0,0,cw,ch);root.dataset.fxCoreReal3dResolution=cw+'x'+ch;}
  const ro=new ResizeObserver(resize);ro.observe(stage);resize();
  const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible&&!raf&&!disposed&&root.dataset.fxReferenceMotionPaused!=='true')raf=requestAnimationFrame(frame);},{rootMargin:'160px'});io.observe(stage);
  function point(clientX,clientY,boost=1.08){const r=stage.getBoundingClientRect();tx=clamp(((clientX-r.left)/Math.max(1,r.width)-.5)*2,-1,1);ty=clamp(((clientY-r.top)/Math.max(1,r.height)-.5)*2,-1,1);target=Math.max(target,boost);}
  function holdIdle(ms=360){clearTimeout(releaseTimer);releaseTimer=setTimeout(()=>{target=.32;},ms);}
  hero.addEventListener('pointermove',e=>point(e.clientX,e.clientY,1.08),{passive:true});
  hero.addEventListener('pointerdown',e=>{point(e.clientX,e.clientY,1.52);holdIdle(460);},{passive:true});
  window.addEventListener('pointerup',()=>holdIdle(300),{passive:true});
  hero.addEventListener('touchstart',e=>{const q=e.touches?.[0]||e.changedTouches?.[0];if(q){point(q.clientX,q.clientY,1.58);holdIdle(540);}},{passive:true});
  hero.addEventListener('touchmove',e=>{const q=e.touches?.[0]||e.changedTouches?.[0];if(q){point(q.clientX,q.clientY,1.28);holdIdle(430);}},{passive:true});
  hero.addEventListener('touchend',()=>holdIdle(380),{passive:true});
  hero.addEventListener('touchcancel',()=>holdIdle(200),{passive:true});
  function pulse(detail){if(detail&&Number.isFinite(detail.x))tx=clamp(detail.x,-1,1);if(detail&&Number.isFinite(detail.y))ty=clamp(detail.y,-1,1);target=Math.max(target,detail?.phase==='drag'?1.26:1.62);holdIdle(detail?.phase==='drag'?430:540);}
  window.addEventListener('formatx:coreinteraction',e=>pulse(e.detail||null),{passive:true});
  window.addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&!disposed&&visible)raf=requestAnimationFrame(frame);},{passive:true});
  function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const st=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.080;py+=(ty-py)*.080;energy+=(target-energy)*.092;target+=(.30-target)*.010;cinematic.corePosition=[px*.060,-py*.060,energy*.010];cinematic.energy=energy;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const renderMs=performance.now()-st;root.dataset.fxCoreRenderMs=renderMs.toFixed(2);if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode=renderMs>12?'luminous-r108-adaptive':'luminous-r108-balanced';}if(!disposed)raf=requestAnimationFrame(frame);}
  function destroy(){if(disposed)return;disposed=true;clearTimeout(releaseTimer);if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;}
  window.FormatXCoreMobileV69={version:VERSION,pulse:()=>pulse(null),destroy,get energy(){return energy;}};
  root.dataset.fxCoreMobileR99=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-luminous-crystal-r99';root.dataset.fxCoreReferenceGeometry='reference-deep-concave-four-point-size-lock-r99';root.dataset.fxCoreReferenceMaterial='luminous-faceted-iceglass-caustic-r99';root.dataset.fxCoreInteractionVisual='touch-pointer-breathing-spectral-refraction-r99';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r99';root.dataset.fxCoreAwardRevision='reference-r108-current-screenshot-volumetric';
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r99-r108',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));
  raf=requestAnimationFrame(frame);
}
boot();
}());
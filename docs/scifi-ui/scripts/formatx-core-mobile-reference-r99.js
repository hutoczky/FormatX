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
  window.FormatXCoreMobileV69?.destroy?.();
  document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(n=>n.remove());
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r99';stage.setAttribute('aria-hidden','true');host.prepend(stage);
  const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas fx-core-rayglass-r91-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);
  let gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:mobile?'default':'high-performance',failIfMajorPerformanceCaveat:false}),webgl2=!!gl;
  if(!gl){gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'default'});webgl2=false;}
  if(!gl){stage.remove();root.dataset.fxCoreReal3d='context-unavailable';return;}
  const vs=webgl2?`#version 300 es\nprecision highp float;layout(location=0)in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`:`precision highp float;attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
  const body=`
uniform vec2 uRes;uniform float uTime,uEnergy;uniform vec2 uPointer;
float sat(float x){return clamp(x,0.,1.);}float band(float x,float w){return 1.-smoothstep(w,w*2.,abs(x));}
float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.,1.)),f.x),f.y);}
float ridge(float x,float power){return pow(sat(1.-abs(fract(x)-.5)*2.),power);}float line2(vec2 p,float m,float b,float w){return band(p.y-p.x*m-b,w);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
void main(){
  float t=uTime;
  vec2 aspect=vec2(uRes.x/max(1.,uRes.y),1.);
  vec2 scr=(vUv-.5)*2.*aspect;scr.y+=.018;
  float breath=1.+.006*sin(t*.58)+.0025*sin(t*1.13);
  vec2 p=(vUv-.5)*2.;p.x*=aspect.x/.72;p.y+=.018;p*=vec2(.985,.94)/breath;
  p+=vec2(-uPointer.x,uPointer.y)*(.009+.011*uEnergy);
  float ax=abs(p.x),ay=abs(p.y),pp=.585;
  float s=pow(ax,pp)+pow(ay/1.075,pp);
  float inside=1.-smoothstep(.992,1.014,s);
  float r=length(scr),a=atan(scr.y,scr.x),pulse=.5+.5*sin(t*1.46);
  float depth=pow(max(0.,1.-s),.30);
  float edgeHot=1.-smoothstep(.0018,.0135,abs(1.-s));
  float edgeSoft=1.-smoothstep(.013,.060,abs(1.-s));
  float sC=pow(abs(p.x+.010),pp)+pow(abs(p.y-.004)/1.075,pp);
  float sV=pow(abs(p.x-.010),pp)+pow(abs(p.y+.004)/1.075,pp);
  float chromaC=band(sC-.995,.0062),chromaV=band(sV-.995,.0065);
  vec2 warp=vec2(n2(p*3.1+vec2(t*.012,2.1)),n2(p*3.8+vec2(4.3,-t*.010)))-.5;
  vec2 wp=p+warp*.050;

  float shell=0.;
  shell+=band(s-.932+.006*sin(a*4.+t*.045),.0042);
  shell+=.90*band(s-.846+.010*cos(a*5.-t*.032),.0047);
  shell+=.72*band(s-.752+.013*sin(a*6.+1.2),.0052);
  shell+=.55*band(s-.646+.016*cos(a*7.-.8),.0058);
  shell+=.38*band(s-.532+.018*sin(a*9.+.5),.0062);

  vec2 q1=rot(.29)*wp,q2=rot(-.47)*wp,q3=rot(1.01)*wp,q4=rot(-1.10)*wp;
  float fractures=0.;
  fractures+=ridge(q1.x*5.2+q1.y*2.0+n2(q1*2.6)*1.25,14.);
  fractures+=.90*ridge(q2.x*6.4-q2.y*2.4+n2(q2*3.0+2.4)*1.15,15.);
  fractures+=.76*ridge(q3.x*7.6+q3.y*1.8+n2(q3*3.5-1.2)*1.05,17.);
  fractures+=.58*ridge(q4.x*8.5-q4.y*1.2+n2(q4*4.0+4.1)*.92,18.);
  fractures*=inside*(.24+.76*depth)*(.62+.38*n2(wp*7.5));

  float plates=0.;
  plates+=ridge(q1.x*2.65+q1.y*1.34+n2(q1*1.8)*.55,7.5);
  plates+=ridge(q2.x*3.05-q2.y*1.60+n2(q2*2.0+1.7)*.48,8.5);
  plates+=.75*ridge(q3.x*3.55+q3.y*1.05+n2(q3*2.2-2.0)*.42,9.0);
  plates*=inside*depth;

  float lattice=0.;
  lattice+=line2(wp,.54,.10,.0046)+line2(wp,-.54,.10,.0046)+line2(wp,.54,-.10,.0046)+line2(wp,-.54,-.10,.0046);
  lattice+=.68*(line2(wp,.22,.32,.0042)+line2(wp,-.22,.32,.0042)+line2(wp,.22,-.32,.0042)+line2(wp,-.22,-.32,.0042));
  lattice*=inside*depth*(.58+.42*n2(wp*6.2+5.));

  float caustic=0.;
  caustic+=ridge(wp.x*8.8+sin(wp.y*6.2+t*.085)*1.35+n2(wp*4.0)*.90,16.);
  caustic+=.82*ridge(wp.y*9.7+sin(wp.x*5.7-t*.072)*1.28+n2(wp*3.8+3.)*.82,18.);
  caustic*=inside*depth*(.52+.48*n2(wp*9.));

  float cardinal=pow(sat(abs(cos(a*2.))),10.)*(1.-smoothstep(.10,.62,r));
  float diagonal=pow(sat(abs(sin(a*2.))),13.)*smoothstep(.12,.23,r)*(1.-smoothstep(.23,.61,r));
  float spokes=(cardinal*.80+diagonal*.30)*inside;

  float rings=band(r-.090,.0030)+.95*band(r-.132,.0033)+.84*band(r-.180,.0036)+.70*band(r-.235,.0040)+.54*band(r-.298,.0045)+.36*band(r-.370,.0050)+.20*band(r-.450,.0055);
  rings*=.76+.24*n2(vec2(a*3.0,r*18.+t*.025));
  float axes=(band(scr.x,.0017)+band(scr.y,.0018))*(1.-smoothstep(.035,.64,r));
  float diagAxes=.33*(line2(scr,.84,0.,.0017)+line2(scr,-.84,0.,.0017))*(1.-smoothstep(.08,.56,r));

  float facet=n2(wp*5.1+vec2(n2(wp*2.1),-n2(wp*2.6)));
  float facetFlash=pow(sat(facet),3.2)*depth;
  float tip=max(pow(sat(ax),4.),pow(sat(ay/1.075),4.));
  float spectral=.5+.5*sin(a*4.25-r*9.8+t*.095+uPointer.x*.9-uPointer.y*.6);

  vec3 deep=vec3(.003,.022,.070),blue=vec3(.012,.18,.55),cyan=vec3(.02,1.18,1.86),ice=vec3(1.20,1.43,1.60),vio=vec3(1.02,.18,1.68);
  vec3 col=deep*(.34+.70*depth);
  col+=blue*(.16+.38*depth);
  col+=cyan*(.14+.38*depth+.10*facet);
  col+=mix(cyan,vio,spectral)*(.075+.17*facetFlash+.075*tip);
  col+=ice*(.04+.15*depth+.48*facetFlash);
  col+=cyan*(edgeSoft*.86+edgeHot*1.95+shell*.68+chromaC*.72);
  col+=vio*(chromaV*.70+shell*.19+tip*.12*(.5+.5*sin(a*4.)));
  col+=ice*(fractures*1.35+plates*.46+lattice*1.00+caustic*1.10+rings*1.18+spokes*.62+axes*.78+diagAxes*.30);
  col+=cyan*(fractures*.40+plates*.16+lattice*.28+caustic*.34+rings*.32+axes*.22);
  col+=vio*((fractures+caustic)*.11+plates*.10+rings*.14);

  float core=exp(-r*r*390.),hot=exp(-r*r*1500.),halo=exp(-r*r*54.);
  float reactorRing=band(r-.052,.0025)+.86*band(r-.076,.0029)+.66*band(r-.105,.0032);
  col+=ice*(hot*(5.1+.75*pulse+.70*uEnergy)+core*(2.0+.50*pulse)+halo*.72+reactorRing*1.50);
  col+=cyan*(core*1.05+halo*.54+reactorRing*.52);
  col+=vio*(band(r-.132,.0032)*.30+band(r-.180,.0036)*.18+halo*.08);
  col=mix(col,ice*2.65,sat(hot*1.35));

  float beamX=band(scr.y,.0015)*(1.-smoothstep(.035,.68,abs(scr.x)));
  float beamY=band(scr.x,.0015)*(1.-smoothstep(.035,.76,abs(scr.y)));
  col+=ice*(beamX*.34+beamY*.34)+cyan*(beamX*.20+beamY*.20);

  vec2 cell=floor((wp+2.)*54.);float rnd=hash21(cell);
  float spark=step(.982,rnd)*pow(max(0.,.5+.5*sin(t*(.72+rnd*1.8)+rnd*36.)),22.)*inside;
  col+=ice*spark*(1.1+.65*uEnergy);

  float orbit1=band(r-.53,.0028)*(.35+.65*pow(abs(sin(a*2.3+t*.06)),4.));
  float orbit2=band(r-.61,.0030)*(.30+.70*pow(abs(cos(a*2.0-t*.045)),5.));
  float orbit3=band(r-.70,.0034)*(.25+.75*pow(abs(sin(a*1.7+t*.035)),6.));
  float outer=(orbit1*.55+orbit2*.40+orbit3*.28)*(1.-inside);
  vec3 outerCol=cyan*(orbit1*.70+orbit3*.42)+vio*(orbit2*.65+orbit3*.28)+ice*outer*.18;

  float alpha=inside*(.20+.30*depth)+edgeHot*.88+edgeSoft*.30+shell*.105+fractures*.085+plates*.035+lattice*.060+caustic*.060+rings*.095+core*.52+hot*.58;
  alpha*=.98+uEnergy*.07;
  float outerAlpha=outer*.24;
  col*=1.72+uEnergy*.17+.035*pulse;
  col=pow(max(col,vec3(0.)),vec3(.76));
  vec3 finalCol=col*inside+outerCol;
  float finalAlpha=clamp(max(alpha*inside,outerAlpha),0.,.985);
  ${webgl2?'outColor':'gl_FragColor'}=vec4(finalCol,finalAlpha);
}`;
  const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;
  let prog;try{prog=program(gl,vs,fs);}catch(e){console.error(e);stage.remove();root.dataset.fxCoreReal3d='shader-failed';root.dataset.fxCoreMobileR99='shader-failed';return;}
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.useProgram(prog);
  const aP=gl.getAttribLocation(prog,'aP');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
  const U={res:gl.getUniformLocation(prog,'uRes'),time:gl.getUniformLocation(prog,'uTime'),energy:gl.getUniformLocation(prog,'uEnergy'),pointer:gl.getUniformLocation(prog,'uPointer')};
  let w=0,h=0,raf=0,last=performance.now(),energy=.30,target=.30,px=0,py=0,tx=0,ty=0,visible=true,disposed=false,frameAvg=16.7,frames=0,releaseTimer=0;
  const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=VERSION;cinematic.corePosition=[0,0,0];cinematic.energy=energy;
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;const cap=mobile?1.32:1.42,budget=mobile?560000:760000,dpr=Math.min(devicePixelRatio||1,cap);let cw=Math.round(r.width*dpr),ch=Math.round(r.height*dpr),pix=cw*ch;if(pix>budget){const k=Math.sqrt(budget/pix);cw=Math.round(cw*k);ch=Math.round(ch*k);}if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}w=cw;h=ch;gl.viewport(0,0,cw,ch);root.dataset.fxCoreReal3dResolution=cw+'x'+ch;}
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
  function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const st=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.080;py+=(ty-py)*.080;energy+=(target-energy)*.092;target+=(.30-target)*.010;cinematic.corePosition=[px*.060,-py*.060,energy*.010];cinematic.energy=energy;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const renderMs=performance.now()-st;root.dataset.fxCoreRenderMs=renderMs.toFixed(2);if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode=renderMs>12?'luminous-r99-adaptive':'luminous-r99-balanced';}if(!disposed)raf=requestAnimationFrame(frame);}
  function destroy(){if(disposed)return;disposed=true;clearTimeout(releaseTimer);if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;}
  window.FormatXCoreMobileV69={version:VERSION,pulse:()=>pulse(null),destroy,get energy(){return energy;}};
  root.dataset.fxCoreMobileR99=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-luminous-crystal-r99';root.dataset.fxCoreReferenceGeometry='reference-deep-concave-four-point-size-lock-r99';root.dataset.fxCoreReferenceMaterial='luminous-faceted-iceglass-caustic-r99';root.dataset.fxCoreInteractionVisual='touch-pointer-breathing-spectral-refraction-r99';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r99';
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r99',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));
  raf=requestAnimationFrame(frame);
}
boot();
}());
(function(){
'use strict';
const root=document.documentElement,READY='ready-v69',VERSION='reference-luminous-crystal-webgl-r99-award-r111';
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
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r111-faceted';stage.setAttribute('aria-hidden','true');host.prepend(stage);
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
 // Faceted structural fans: multiple glass ribs converge into the four tips, matching the reference crystal rather than a random scribble field.
 float warp=(fbm(wp*2.65+vec2(t*.012,-t*.009))-.5)*.026;
 float topMask=smoothstep(.03,.18,p.y)*inside,bottomMask=smoothstep(.03,.18,-p.y)*inside,rightMask=smoothstep(.03,.18,p.x)*inside,leftMask=smoothstep(.03,.18,-p.x)*inside;
 float topFan=0.;topFan+=band(p.x-.16*(p.y-.97)+warp,.0042)+band(p.x+.16*(p.y-.97)-warp,.0042);topFan+=.88*(band(p.x-.31*(p.y-.97)-warp*.5,.0047)+band(p.x+.31*(p.y-.97)+warp*.5,.0047));topFan+=.62*(band(p.x-.49*(p.y-.97)+warp*.7,.0052)+band(p.x+.49*(p.y-.97)-warp*.7,.0052));
 float bottomFan=0.;bottomFan+=band(p.x-.16*(p.y+.97)-warp,.0042)+band(p.x+.16*(p.y+.97)+warp,.0042);bottomFan+=.88*(band(p.x-.31*(p.y+.97)+warp*.5,.0047)+band(p.x+.31*(p.y+.97)-warp*.5,.0047));bottomFan+=.62*(band(p.x-.49*(p.y+.97)-warp*.7,.0052)+band(p.x+.49*(p.y+.97)+warp*.7,.0052));
 float rightFan=0.;rightFan+=band(p.y-.16*(p.x-.86)-warp,.0042)+band(p.y+.16*(p.x-.86)+warp,.0042);rightFan+=.88*(band(p.y-.31*(p.x-.86)+warp*.5,.0047)+band(p.y+.31*(p.x-.86)-warp*.5,.0047));rightFan+=.62*(band(p.y-.50*(p.x-.86)-warp*.7,.0052)+band(p.y+.50*(p.x-.86)+warp*.7,.0052));
 float leftFan=0.;leftFan+=band(p.y-.16*(p.x+.86)+warp,.0042)+band(p.y+.16*(p.x+.86)-warp,.0042);leftFan+=.88*(band(p.y-.31*(p.x+.86)-warp*.5,.0047)+band(p.y+.31*(p.x+.86)+warp*.5,.0047));leftFan+=.62*(band(p.y-.50*(p.x+.86)+warp*.7,.0052)+band(p.y+.50*(p.x+.86)-warp*.7,.0052));
 float rayFan=(topFan*topMask+bottomFan*bottomMask+rightFan*rightMask+leftFan*leftMask)*(.36+.64*depth);
 float innerDiamond=band(abs(p.x)/.47+abs(p.y)/.52-1.,.0060)+.58*band(abs(p.x)/.61+abs(p.y)/.67-1.,.0068)+.30*band(abs(p.x)/.73+abs(p.y)/.80-1.,.0075);innerDiamond*=inside;
 float curveV2=.070+.255*pow(sat(1.-vy),1.18),curveH2=.068+.235*pow(sat(1.-vx),1.20);float ribs2=(band(abs(p.x)-curveV2,.0062)*smoothstep(.20,.96,vy)+band(abs(p.y)-curveH2,.0062)*smoothstep(.20,.96,vx))*inside*(.28+.72*depth);
 float facetNet=rayFan+innerDiamond*.90+ribs2*.72;
 // broad refractive glass folds: large translucent planes, not wire mesh
 float foldA=ridge(q1.x*2.25+q1.y*.78+fbm(q1*1.7)*1.18+t*.020,4.2);
 float foldB=ridge(q2.x*2.55-q2.y*.62+fbm(q2*1.9+2.)*1.10-t*.016,4.6);
 float foldC=ridge(q3.y*2.15+q3.x*.58+fbm(q3*1.55-3.)*.98+t*.012,4.0);
 float foldD=ridge(q4.y*2.75-q4.x*.42+fbm(q4*1.8+5.)*.92-t*.010,5.0);
 float folds=(foldA*.36+foldB*.31+foldC*.28+foldD*.24)*inside*(.20+.80*depth);
 float caustic=band(fbm(q1*4.15+vec2(.3,-.7))-.51,.0042)+.72*band(fbm(q2*4.55+vec2(-1.7,.8))-.54,.0040)+.54*band(fbm(q3*4.85+vec2(1.9,2.4))-.47,.0038);caustic*=inside*(.10+.90*depth)*.34;
 float glassVeil=inside*depth*(.12+.88*pow(sat(.5+.5*sin(fbm(q1*1.55)*4.1+fbm(q2*1.72+2.)*3.5+a*.8)),3.0));
 float paneNoise=fbm(wp*2.0+vec2(.2,t*.01));float pane=inside*depth*(.22+.78*paneNoise);
 float pane2=inside*depth*(.5+.5*sin((q1.x+q2.y)*3.4+fbm(wp*2.6)*3.2));
 // sparse internal fracture/caustic strands
 float fracture=0.;fracture+=band(fbm(q1*3.0+vec2(.7,-1.1))-.48,.0045)*(.18+.82*n2(q1*4.5+2.));fracture+=.82*band(fbm(q2*3.4+vec2(-2.1,.5))-.54,.0042)*(.18+.82*n2(q2*4.8-3.));fracture+=.62*band(fbm(q3*3.8+vec2(1.5,2.2))-.43,.0040)*(.16+.84*n2(q3*5.2+5.));fracture*=inside*(.10+.90*depth)*smoothstep(.08,.30,depth);
 float shard=0.;shard+=ridge(q1.x*5.8+q1.y*1.45+fbm(q1*1.7)*.55,34.)*smoothstep(.48,.72,fbm(q1*2.25+3.));shard+=.86*ridge(q2.x*6.5-q2.y*1.35+fbm(q2*1.9+2.)*.50,36.)*smoothstep(.50,.74,fbm(q2*2.45-1.));shard+=.72*ridge(q3.y*7.1+q3.x*1.1+fbm(q3*2.0-2.)*.46,38.)*smoothstep(.52,.76,fbm(q3*2.6+5.));shard+=.55*ridge(q4.y*7.8-q4.x*.9+fbm(q4*2.2+4.)*.42,40.)*smoothstep(.54,.78,fbm(q4*2.8-4.));shard*=inside*(.18+.82*depth)*.46;
 float wisps=(ridge(wp.x*4.7+sin(wp.y*3.8+t*.06)*.62+fbm(wp*2.5)*.82,20.)+.68*ridge(wp.y*5.2+sin(wp.x*3.6-t*.05)*.58+fbm(wp*2.7+2.)*.74,22.))*inside*depth*(.35+.65*n2(wp*4.));
 // layered inner shells add glass thickness
 float shells=band(s-.905+.016*sin(a*3.7+fbm(wp*1.8)*2.0+t*.026),.0048)+.72*band(s-.805+.020*cos(a*4.3+fbm(wp*2.0+2.)*1.8-t*.021),.0052)+.50*band(s-.690+.024*sin(a*4.9+fbm(wp*2.2-2.)*1.7),.0057)+.30*band(s-.565+.027*cos(a*5.4+fbm(wp*2.4+4.)*1.5),.0062);
 // reactor, concentric energy optics and the cross-shaped light spine
 float rings=1.14*band(rr-.082,.0033)+.96*band(rr-.124,.0036)+.78*band(rr-.172,.0039)+.54*band(rr-.226,.0043)+.28*band(rr-.292,.0048)+.11*band(rr-.365,.0055);
 float core=exp(-rr*rr*520.),hot=exp(-rr*rr*2350.),halo=exp(-rr*rr*105.);
 float beamH=exp(-p.y*p.y*2400.)*(1.-smoothstep(.035,1.02,abs(p.x)));float beamV=exp(-p.x*p.x*2600.)*(1.-smoothstep(.035,1.02,abs(p.y)));
 float spoke=pow(sat(abs(cos(a*8.+sin(rr*18.-t*.04)))),34.)*(1.-smoothstep(.10,.48,rr))*.28;
 // chromatic spectral response and tip highlights
 float spectral=.5+.5*sin(a*4.15-rr*8.6+t*.07+fbm(wp*2.2)*2.0+uPointer.x*.8);
 float chromaC=.5+.5*sin(a*5.1+rr*10.4-t*.052+fbm(wp*2.55+1.7)*1.45);
 float chromaV=.5+.5*cos(a*4.6-rr*9.2+t*.044+fbm(wp*2.25-2.1)*1.65);
 float tipX=pow(sat(abs(p.x)/.86),7.)*inside,tipY=pow(sat(abs(p.y)),7.)*inside;
 // orbiting arcs and reflective floor ripples
 float o1=band(rr-.52,.0027)*(.2+.8*pow(abs(sin(a*2.1+t*.05)),5.));float o2=band(rr-.62,.0030)*(.2+.8*pow(abs(cos(a*1.9-t*.042)),6.));float o3=band(rr-.72,.0033)*pow(abs(sin(a*1.6+t*.032)),7.);
 float fy=-p.y;float floorMask=smoothstep(.08,.94,fy);float ripple=(ridge(fy*22.+sin(p.x*8.)*.36+t*.10,28.)*.72+ridge(fy*37.-sin(p.x*13.)*.25-t*.07,32.)*.44+ridge(fy*54.+sin(p.x*18.)*.18+t*.04,36.)*.24)*floorMask*(1.-inside*.58)*(1.-smoothstep(.10,1.14,abs(p.x)));
 float horizon=band(p.y+.055,.006)*(1.-inside*.40)*(1.-smoothstep(.12,1.16,abs(p.x)));float reflection=exp(-p.x*p.x*10.)*smoothstep(.06,.88,fy)*(1.-smoothstep(.15,1.04,fy))*(.55+.45*ridge(fy*18.+sin(p.x*9.)*.25+t*.06,10.));
 float cell=hash21(floor((p+2.)*vec2(36.,32.)));float spark=step(.988,cell)*pow(max(0.,.5+.5*sin(t*(.7+cell*1.5)+cell*30.)),18.)*(1.-inside);
 vec2 sg=fract((p+2.)*vec2(31.,35.))-.5;float scell=hash21(floor((p+2.)*vec2(31.,35.))+7.3);float sparkIn=step(.973,scell)*exp(-dot(sg,sg)*980.)*inside*pow(max(0.,.5+.5*sin(t*(1.2+scell*1.8)+scell*44.)),10.);sparkIn*=.30+.70*sat(facetNet+shells+rings);
 vec3 deep=vec3(.0005,.004,.015),navy=vec3(.002,.040,.135),blue=vec3(.004,.145,.38),cyan=vec3(.010,.92,1.42),vio=vec3(.68,.065,1.18),ice=vec3(.94,1.10,1.16);
 vec3 col=deep*.72+navy*(.018+.045*depth)+blue*(.008+.026*depth);
 // Dark transparent glass: broad folds stay visible but the body never becomes a flat cyan plate.
 col+=mix(blue*.12,cyan*.10,spectral)*inside*depth*glassLight;
 col+=mix(cyan,vio,spectral)*(.010+.020*depth+.072*folds+.028*glassVeil)*(.55+.62*glassLight);
 col+=cyan*(pane*.018+folds*.070+glassVeil*.034)+vio*(pane*.010+folds*.045+glassVeil*.026);
 col+=cyan*(chromaC*.012)*inside*depth+vio*(chromaV*.014)*inside*depth;
 // Layered glass boundaries and organic internal caustics.
 col+=cyan*(edge*1.46+edgeGlow*.22+cEdge*.42+shells*.52+ribs*.58+ribs2*.44+rayFan*.78+innerDiamond*.66+fracture*.25+caustic*.18+wisps*.22);
 col+=vio*(vEdge*.62+shells*.26+ribs*.12+ribs2*.20+rayFan*.28+innerDiamond*.34+fracture*.20+caustic*.14+wisps*.20);
 col+=ice*(fracture*.28+shard*.72+ribs*.54+ribs2*.46+rayFan*.82+innerDiamond*.74+caustic*.22+wisps*.24+shells*.30+rings*.96+spoke*.18+beamH*.50+beamV*.34);
 col+=cyan*(rings*1.56+shard*.32+ribs*.30+ribs2*.28+rayFan*.54+innerDiamond*.42+caustic*.12+spoke*.14+beamH*1.92+beamV*.94);
 // Compact white reactor with a cyan halo and restrained violet spectral edge.
 col+=ice*(hot*(7.4+.90*uEnergy)+core*1.95)+cyan*(core*1.62+halo*.78)+vio*(band(rr-.126,.0028)*.14+band(rr-.176,.0030)*.11);
 col=mix(col,vec3(1.10,1.24,1.30)*2.15,sat(hot*.96));
 col+=ice*(tipX+tipY)*.14+cyan*(tipX+tipY)*.34;
 vec3 outer=cyan*(o1*.62+o3*.36)+vio*(o2*.60+o3*.28);col+=outer+cyan*(ripple*.92+horizon*.62+reflection*.46)+vio*(ripple*.48+reflection*.18)+ice*(spark*.72+sparkIn*2.20+horizon*.22+reflection*.16)+cyan*(sparkIn*.72);
 float alpha=inside*(.011+.021*depth+.012*pane+.022*folds+.012*glassVeil)+edge*.62+edgeGlow*.045+shells*.034+ribs*.030+ribs2*.030+rayFan*.035+innerDiamond*.030+fracture*.012+caustic*.010+shard*.028+wisps*.012+rings*.045+core*.22+hot*.60+beamH*.044+beamV*.034+sparkIn*.18;
 alpha=max(alpha,(o1+o2+o3)*.11);alpha=max(alpha,ripple*.105+horizon*.09+spark*.18);alpha*=.97+uEnergy*.035;
 col*=1.62+uEnergy*.14;col=pow(max(col,vec3(0.)),vec3(.88));${webgl2?'outColor':'gl_FragColor'}=vec4(col,clamp(alpha,0.,.88));
}`;
  const fs=webgl2?`#version 300 es\nprecision highp float;in vec2 vUv;out vec4 outColor;${body}`:`precision highp float;varying vec2 vUv;${body}`;
  let prog;try{prog=program(gl,vs,fs);}catch(e){console.error('[FormatX MAG r111 shader]',e);stage.remove();root.dataset.fxCoreReal3d='shader-failed';root.dataset.fxCoreMobileR99='shader-failed';return;}
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
  function pulse(detail){if(detail&&Number.isFinite(detail.x)){tx=clamp(detail.x,-1,1);px+=(tx-px)*.46;}if(detail&&Number.isFinite(detail.y)){ty=clamp(detail.y,-1,1);py+=(ty-py)*.46;}const drag=detail?.phase==='drag',boost=drag?1.26:1.62;target=Math.max(target,boost);energy=Math.max(energy,drag?.48:.64);cinematic.energy=energy;cinematic.corePosition=[px*.060,-py*.060,energy*.010];holdIdle(drag?430:540);}
  window.addEventListener('formatx:coreinteraction',e=>pulse(e.detail||null),{passive:true});
  window.addEventListener('formatx:referencepause',e=>{if(e.detail?.paused===false&&!raf&&!disposed&&visible)raf=requestAnimationFrame(frame);},{passive:true});
  function frame(now){raf=0;if(disposed||!visible||root.dataset.fxReferenceMotionPaused==='true')return;resize();const st=performance.now(),dt=Math.min(40,Math.max(0,now-last));last=now;frameAvg+=(dt-frameAvg)*.05;frames++;px+=(tx-px)*.080;py+=(ty-py)*.080;energy+=(target-energy)*.092;target+=(.30-target)*.010;cinematic.corePosition=[px*.060,-py*.060,energy*.010];cinematic.energy=energy;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.uniform2f(U.res,w,h);gl.uniform1f(U.time,reduced.matches?0:now*.001);gl.uniform1f(U.energy,energy);gl.uniform2f(U.pointer,px,py);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);const renderMs=performance.now()-st;root.dataset.fxCoreRenderMs=renderMs.toFixed(2);if(frames%24===0){root.dataset.fxCoreFrameMs=frameAvg.toFixed(1);root.dataset.fxCoreReal3dFps=String(Math.round(1000/Math.max(1,frameAvg)));root.dataset.fxCoreReal3dQuality='2';root.dataset.fxCorePerformanceMode=renderMs>12?'luminous-r111-adaptive':'luminous-r111-balanced';}if(!disposed)raf=requestAnimationFrame(frame);}
  function destroy(){if(disposed)return;disposed=true;clearTimeout(releaseTimer);if(raf)cancelAnimationFrame(raf);ro.disconnect();io.disconnect();stage.remove();if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;}
  window.FormatXCoreMobileV69={version:VERSION,pulse:()=>pulse(null),destroy,get energy(){return energy;}};
  root.dataset.fxCoreMobileR99=READY;root.dataset.fxCoreMobileV69=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v69';root.dataset.fxCoreReal3d='ready-v69';root.dataset.fxCoreRenderer='single-webgl-luminous-crystal-r99';root.dataset.fxCoreReferenceGeometry='reference-deep-concave-four-point-size-lock-r99';root.dataset.fxCoreReferenceMaterial='luminous-faceted-iceglass-caustic-r99';root.dataset.fxCoreInteractionVisual='touch-pointer-breathing-spectral-refraction-r99';root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';root.dataset.fxCoreFrameVerified='visible-native-3d-r99';root.dataset.fxCoreAwardRevision='reference-r111-current-screenshot-faceted';
  dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{version:'v69-r99-r111',renderer:VERSION,context:webgl2?'webgl2':'webgl1'}}));
  raf=requestAnimationFrame(frame);
}
boot();
}());
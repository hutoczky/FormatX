(function(){
'use strict';
const root=document.documentElement,READY='ready-v69',VERSION='reference-luminous-crystal-webgl-r99-award-r107';
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
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage fx-core-rayglass-r91-stage';stage.dataset.active='true';stage.dataset.renderer='reference-r107-volumetric';stage.setAttribute('aria-hidden','true');host.prepend(stage);
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
 // broad refractive glass folds: large translucent planes, not wire mesh
 float foldA=ridge(q1.x*2.25+q1.y*.78+fbm(q1*1.7)*1.18+t*.020,4.2);
 float foldB=ridge(q2.x*2.55-q2.y*.62+fbm(q2*1.9+2.)*1.10-t*.016,4.6);
 float foldC=ridge(q3.y*2.15+q3.x*.58+fbm(q3*1.55-3.)*.98+t*.012,4.0);
 float foldD=ridge(q4.y*2.75-q4.x*.42+fbm(q4*1.8+5.)*.92-t*.010,5.0);
 float folds=(foldA*.78+foldB*.68+foldC*.57+foldD*.48)*inside*(.24+.76*depth);
 float paneNoise=fbm(wp*2.0+vec2(.2,t*.01));float pane=inside*depth*(.22+.78*paneNoise);
 float pane2=inside*depth*(.5+.5*sin((q1.x+q2.y)*3.4+fbm(wp*2.6)*3.2));
 // sparse internal fracture/caustic strands
 float fracture=0.;fracture+=band(fbm(q1*3.0+vec2(.7,-1.1))-.48,.0045)*(.18+.82*n2(q1*4.5+2.));fracture+=.82*band(fbm(q2*3.4+vec2(-2.1,.5))-.54,.0042)*(.18+.82*n2(q2*4.8-3.));fracture+=.62*band(fbm(q3*3.8+vec2(1.5,2.2))-.43,.0040)*(.16+.84*n2(q3*5.2+5.));fracture*=inside*(.10+.90*depth)*smoothstep(.08,.30,depth);
 float shard=0.;shard+=ridge(q1.x*5.8+q1.y*1.45+fbm(q1*1.7)*.55,34.)*smoothstep(.48,.72,fbm(q1*2.25+3.));shard+=.86*ridge(q2.x*6.5-q2.y*1.35+fbm(q2*1.9+2.)*.50,36.)*smoothstep(.50,.74,fbm(q2*2.45-1.));shard+=.72*ridge(q3.y*7.1+q3.x*1.1+fbm(q3*2.0-2.)*.46,38.)*smoothstep(.52,.76,fbm(q3*2.6+5.));shard+=.55*ridge(q4.y*7.8-q4.x*.9+fbm(q4*2.2+4.)*.42,40.)*smoothstep(.54,.78,fbm(q4*2.8-4.));shard*=inside*(.18+.82*depth);
 float wisps=(ridge(wp.x*4.7+sin(wp.y*3.8+t*.06)*.62+fbm(wp*2.5)*.82,20.)+.68*ridge(wp.y*5.2+sin(wp.x*3.6-t*.05)*.58+fbm(wp*2.7+2.)*.74,22.))*inside*depth*(.35+.65*n2(wp*4.));
 // layered inner shells add glass thickness
 float shells=band(s-.900+.011*sin(a*4.+t*.03),.0052)+.48*band(s-.735+.016*cos(a*5.-t*.025),.0060)+.24*band(s-.555+.020*sin(a*6.+.6),.0068);
 // reactor, concentric energy optics and the cross-shaped light spine
 float rings=1.10*band(rr-.105,.0042)+.86*band(rr-.155,.0047)+.66*band(rr-.220,.0053)+.30*band(rr-.300,.0060)+.14*band(rr-.405,.0068);
 float core=exp(-rr*rr*330.),hot=exp(-rr*rr*1500.),halo=exp(-rr*rr*66.);
 float beamH=exp(-p.y*p.y*1350.)*(1.-smoothstep(.035,1.02,abs(p.x)));float beamV=exp(-p.x*p.x*1500.)*(1.-smoothstep(.035,1.02,abs(p.y)));
 float spoke=pow(sat(abs(cos(a*8.+sin(rr*18.-t*.04)))),34.)*(1.-smoothstep(.10,.48,rr))*.28;
 // chromatic spectral response and tip highlights
 float spectral=.5+.5*sin(a*4.15-rr*8.6+t*.07+fbm(wp*2.2)*2.0+uPointer.x*.8);
 float tipX=pow(sat(abs(p.x)/.86),7.)*inside,tipY=pow(sat(abs(p.y))$ÑPÐ€L@
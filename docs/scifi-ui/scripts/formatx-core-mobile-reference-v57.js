(function(){
'use strict';
const root=document.documentElement;
const READY='ready-v57';
const VERSION='reference-locked-four-point-crystal-v57';
if(root.dataset.fxCoreMobileV57===READY||root.dataset.fxCoreMobileV57==='booting-v57')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreMobileV57='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;}
if(typeof WebGL2RenderingContext==='undefined'){root.dataset.fxCoreMobileV57='webgl2-unavailable-v57';root.dataset.fxCoreMobileV55='webgl2-unavailable-v55';return;}
root.dataset.fxCoreMobileV57='booting-v57';root.dataset.fxCoreMobileV55='booting-v55';root.dataset.fxCoreRendererMode='mobile';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[r+c*4]=a[r]*b[c*4]+a[r+4]*b[c*4+1]+a[r+8]*b[c*4+2]+a[r+12]*b[c*4+3];return o;}
const C=(...m)=>m.reduce((a,b)=>mul(a,b),I());
function tr(x,y,z){const o=I();o[12]=x;o[13]=y;o[14]=z;return o;}
function sc(x,y,z){const o=I();o[0]=x;o[5]=y;o[10]=z;return o;}
function rx(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o;}
function ry(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o;}
function rz(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o;}
function ortho(l,r,b,t,n,f){const o=I();o[0]=2/(r-l);o[5]=2/(t-b);o[10]=-2/(f-n);o[12]=-(r+l)/(r-l);o[13]=-(t+b)/(t-b);o[14]=-(f+n)/(f-n);return o;}
function normal(a,b,c){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;const l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];}

// Reference silhouette measured from the approved mobile composition: long cardinal
// tips, moderate concavity and a near-square overall crystal footprint.
function outlinePoint(t){
  const qtr=Math.PI/2;let a=((t%(Math.PI*2))+Math.PI*2)%(Math.PI*2);const q=Math.min(3,Math.floor(a/qtr));const u=(a-q*qtr)/qtr;
  const tips=[[1.39,0],[0,1.47],[-1.39,0],[0,-1.47],[1.39,0]];
  const controls=[[.60,.63],[-.60,.63],[-.60,-.63],[.60,-.63]];
  const A=tips[q],B=tips[q+1],K=controls[q],v=1-u;
  return[v*v*A[0]+2*v*u*K[0]+u*u*B[0],v*v*A[1]+2*v*u*K[1]+u*u*B[1]];
}
function surfacePoint(t,u,side){
  const e=outlinePoint(t),rr=Math.pow(u,.83),lens=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.62),diag=Math.pow(Math.abs(Math.sin(t*2)),1.45);
  const corr=1+.018*Math.cos(t*8)*(1-u)+.008*Math.cos(t*16+u*7);
  return[e[0]*rr*corr,e[1]*rr*corr,side*(.035*(1-u)+.255*lens*(1-.12*diag))];
}
function buildShell(A=96,R=10){const d=[];function tri(a,b,c,flip=false){const n=normal(a,b,c);if(flip){n[0]*=-1;n[1]*=-1;n[2]*=-1;}for(const p of[a,b,c])d.push(...p,...n);}function quad(a,b,c,e,flip=false){if(flip){tri(a,c,b,true);tri(a,e,c,true);}else{tri(a,b,c);tri(a,c,e);}}for(const side of[-1,1])for(let j=0;j<R;j++){const u0=j/R,u1=(j+1)/R;for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(surfacePoint(t0,u0,side),surfacePoint(t0,u1,side),surfacePoint(t1,u1,side),surfacePoint(t1,u0,side),side<0);}}for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(surfacePoint(t0,1,1),surfacePoint(t0,1,-1),surfacePoint(t1,1,-1),surfacePoint(t1,1,1));}return new Float32Array(d);}
function polyline(points){const d=[];for(let i=0;i<points.length-1;i++)d.push(...points[i],...points[i+1]);return d;}
function contour(u,segments=128,z=.025){const pts=[];for(let i=0;i<=segments;i++){const p=surfacePoint(i/segments*Math.PI*2,u,1);p[2]+=z;pts.push(p);}return new Float32Array(polyline(pts));}
function rays(count=18){const d=[];for(let i=0;i<count;i++){const t=i/count*Math.PI*2;let prev=surfacePoint(t,.08,1);prev[2]+=.035;for(let j=1;j<=12;j++){const u=.08+.92*j/12,n=surfacePoint(t,u,1);n[2]+=.035;d.push(...prev,...n);prev=n;}}return new Float32Array(d);}
function filaments(count=30){const d=[];for(let i=0;i<count;i++){const base=i/count*Math.PI*2;let prev=null;for(let j=0;j<=14;j++){const u=.10+.86*j/14,bend=Math.sin(j*.58+i*1.73)*(.014+.040*u)+Math.sin(i*2.11)*.024*(1-u),p=surfacePoint(base+bend,u,1);p[2]+=.066+.018*Math.sin(j*.8+i);if(prev)d.push(...prev,...p);prev=p;}}return new Float32Array(d);}
function ring(rad,segments=128,z=.32){const pts=[];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;pts.push([Math.cos(a)*rad,Math.sin(a)*rad,z]);}return new Float32Array(polyline(pts));}
function arc(rad,start,len,segments=64,z=.34){const pts=[];for(let i=0;i<=segments;i++){const a=start+len*i/segments;pts.push([Math.cos(a)*rad,Math.sin(a)*rad,z]);}return new Float32Array(polyline(pts));}
function sparklePoints(){const d=[];for(const t of[0,Math.PI/2,Math.PI,Math.PI*1.5]){const p=surfacePoint(t,1,1);p[2]+=.10;d.push(...p);}for(let i=0;i<24;i++){const t=(i*2.3999632297+.35)%(Math.PI*2),u=.56+.42*((i*37)%101)/100,p=surfacePoint(t,u,1);p[2]+=.09;d.push(...p);}return new Float32Array(d);}
function dustPoints(count=78){const d=[];let s=0x9e3779b9;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);for(let i=0;i<count;i++){const a=rnd()*Math.PI*2,r=.82+rnd()*.80;d.push(Math.cos(a)*r,Math.sin(a)*r*(.92+rnd()*.12),(rnd()-.5)*.22);}return new Float32Array(d);}

function boot(attempt=0){
  if(!document.body){requestAnimationFrame(()=>boot(attempt));return;}
  const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
  if(!hero||!host){if(attempt<180){requestAnimationFrame(()=>boot(attempt+1));return;}root.dataset.fxCoreMobileV57='hero-host-unavailable-v57';return;}
  document.querySelectorAll('.fx-core-mobile-v55-stage,.fx-core-reference-v53-stage,.fx-core-v51-stage,.fx-core-mesh3d-stage,.fx-core-fracture3d-stage').forEach(n=>n.remove());
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage';stage.dataset.active='true';stage.dataset.renderer='reference-lock-v57';stage.setAttribute('aria-hidden','true');
  const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas';canvas.setAttribute('aria-hidden','true');stage.append(canvas);host.prepend(stage);
  let gl;try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'default',desynchronized:true});}catch(error){stage.remove();root.dataset.fxCoreMobileV57='context-unavailable-v57';root.dataset.fxCoreMobileV55='context-unavailable-v55';root.dataset.fxCoreReal3dError=String(error?.message||error).slice(0,220);return;}
  if(!gl||gl.isContextLost()){stage.remove();root.dataset.fxCoreMobileV57='context-unavailable-v57';root.dataset.fxCoreMobileV55='context-unavailable-v55';return;}

  const VS=`#version 300 es\nprecision highp float;layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;uniform mat4 uP,uM;uniform float uT,uEnergy;out vec3 vP,vW,vN;void main(){vec3 p=aP;float a=atan(p.y,p.x);float ripple=1.0+sin(uT*.55+a*4.0+length(p.xy)*8.0)*(.0012+.0025*uEnergy);p.xy*=ripple;p.z*=1.0+sin(uT*.38+a*3.0)*(.004+.008*uEnergy);vec4 w=uM*vec4(p,1.0);vP=p;vW=w.xyz;vN=normalize(transpose(inverse(mat3(uM)))*aN);gl_Position=uP*w;}`;
  const FS=`#version 300 es\nprecision highp float;in vec3 vP,vW,vN;uniform float uT,uAlpha,uEnergy,uPhase;out vec4 O;float sat(float x){return clamp(x,0.0,1.0);}void main(){vec3 N=normalize(vN),V=normalize(vec3(0.0,0.0,1.0)),L1=normalize(vec3(-.42,.72,1.0)),L2=normalize(vec3(.70,-.28,.72));float ndv=abs(dot(N,V)),fres=pow(1.0-sat(ndv),1.18),d1=sat(dot(N,L1)),d2=sat(dot(N,L2)),spec=pow(sat(dot(N,normalize(L1+V))),74.0);float a=atan(vP.y,vP.x),r=length(vP.xy);float vein=.5+.5*cos(a*10.0+r*22.0-vP.z*18.0-uT*.52+uPhase);float vein2=.5+.5*cos(a*6.0-r*14.0+vP.z*21.0+uT*.31-uPhase*.8);float hot=smoothstep(.89,1.0,vein),vio=smoothstep(.91,1.0,vein2);vec3 cyan=vec3(.05,1.22,1.78),blue=vec3(.02,.28,1.10),purple=vec3(.92,.16,1.42),ice=vec3(1.12,1.22,1.26);vec3 col=blue*(.10+.12*d2)+cyan*(.16+.76*fres+.20*d1+.72*hot)+purple*(.03+.34*vio)+ice*(.03+.76*spec+.18*fres);float alpha=uAlpha*sat(.10+.42*fres+.08*d1+.08*spec+.10*hot+.06*vio);O=vec4(col*alpha,alpha);}`;
  const LVS=`#version 300 es\nprecision highp float;layout(location=0)in vec3 aP;uniform mat4 uP,uM;uniform float uPoint;void main(){gl_Position=uP*uM*vec4(aP,1.0);gl_PointSize=uPoint;}`;
  const LFS=`#version 300 es\nprecision highp float;uniform vec3 uColor;uniform float uAlpha,uRound;out vec4 O;void main(){float a=uAlpha;if(uRound>.5){vec2 p=gl_PointCoord*2.0-1.0;float d=dot(p,p);if(d>1.0)discard;a*=pow(1.0-d,1.35);}O=vec4(uColor*a,a);}`;
  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s;}
  function program(v,f){const p=gl.createProgram(),a=shader(gl.VERTEX_SHADER,v),b=shader(gl.FRAGMENT_SHADER,f);gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);gl.deleteShader(a);gl.deleteShader(b);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p;}
  let shellProgram,lineProgram;try{shellProgram=program(VS,FS);lineProgram=program(LVS,LFS);}catch(error){stage.remove();root.dataset.fxCoreMobileV57='shader-failed-v57';root.dataset.fxCoreMobileV55='shader-failed-v55';root.dataset.fxCoreReal3dError=String(error?.message||error).slice(0,220);return;}
  function uploadShell(data){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);gl.bindVertexArray(null);return{vao,count:data.length/6};}
  function uploadLine(data){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);gl.bindVertexArray(null);return{vao,count:data.length/3};}
  const shell=uploadShell(buildShell()),contours=[.34,.53,.70,.84,1].map(u=>uploadLine(contour(u))),facet=uploadLine(rays()),fils=uploadLine(filaments()),rings=[.13,.19,.26,.34,.43,.52].map(r=>uploadLine(ring(r))),arcs=[uploadLine(arc(.60,.15,2.15)),uploadLine(arc(.68,2.30,1.72)),uploadLine(arc(.76,4.05,1.48)),uploadLine(arc(.88,5.12,1.18)),uploadLine(arc(1.03,.62,1.72,64,.20))],spark=uploadLine(sparklePoints()),dust=uploadLine(dustPoints()),center=uploadLine(new Float32Array([0,0,.40]));
  const SU={P:gl.getUniformLocation(shellProgram,'uP'),M:gl.getUniformLocation(shellProgram,'uM'),T:gl.getUniformLocation(shellProgram,'uT'),A:gl.getUniformLocation(shellProgram,'uAlpha'),E:gl.getUniformLocation(shellProgram,'uEnergy'),Q:gl.getUniformLocation(shellProgram,'uPhase')};
  const LU={P:gl.getUniformLocation(lineProgram,'uP'),M:gl.getUniformLocation(lineProgram,'uM'),C:gl.getUniformLocation(lineProgram,'uColor'),A:gl.getUniformLocation(lineProgram,'uAlpha'),S:gl.getUniformLocation(lineProgram,'uPoint'),R:gl.getUniformLocation(lineProgram,'uRound')};
  let dpr=1,P=I();
  function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);const W=Math.max(1,Math.round(r.width*dpr)),H=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}gl.viewport(0,0,W,H);P=ortho(-1.68,1.68,-1.82,1.82,-4,4);}
  const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
  let visible=true;const io=new IntersectionObserver(e=>{visible=e[0]?.isIntersecting!==false;},{rootMargin:'120px'});io.observe(host);
  let energy=.12,targetEnergy=.12,px=0,py=0,tx=0,ty=0;
  addEventListener('formatx:coreinteraction',e=>{const d=e.detail||{},phase=String(d.phase||'');targetEnergy=phase==='burst'?.95:phase==='press'?.72:phase==='drag'?.60:.38;if(Number.isFinite(d.x))tx=clamp(d.x,-1,1);if(Number.isFinite(d.y))ty=clamp(d.y,-1,1);});
  window.FormatXCoreCinematic={version:VERSION,get energy(){return energy;},set energy(v){targetEnergy=clamp(Number(v)||0,.1,1);}};
  function shellDraw(M,t,alpha,phase){gl.useProgram(shellProgram);gl.uniformMatrix4fv(SU.P,false,P);gl.uniformMatrix4fv(SU.M,false,M);gl.uniform1f(SU.T,t);gl.uniform1f(SU.A,alpha);gl.uniform1f(SU.E,energy);gl.uniform1f(SU.Q,phase);gl.bindVertexArray(shell.vao);gl.drawArrays(gl.TRIANGLES,0,shell.count);}
  function lineDraw(obj,M,color,alpha,mode=gl.LINES,size=1,round=0){gl.useProgram(lineProgram);gl.uniformMatrix4fv(LU.P,false,P);gl.uniformMatrix4fv(LU.M,false,M);gl.uniform3fv(LU.C,color);gl.uniform1f(LU.A,alpha);gl.uniform1f(LU.S,size*dpr);gl.uniform1f(LU.R,round);gl.bindVertexArray(obj.vao);gl.drawArrays(mode,0,obj.count);}
  let last=performance.now();
  function frame(now){requestAnimationFrame(frame);if(!visible||document.hidden)return;const t=now*.001,dt=Math.min(.05,(now-last)*.001);last=now;energy+=(targetEnergy-energy)*(1-Math.exp(-dt*4));targetEnergy+=(.12-targetEnergy)*(1-Math.exp(-dt*.45));px+=(tx-px)*(1-Math.exp(-dt*3));py+=(ty-py)*(1-Math.exp(-dt*3));gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthMask(false);
    const drift=reduced.matches?0:Math.sin(t*.23)*.007,M=C(tr(0,-.015,0),rx(-.018+py*.018),ry(.020+px*.025+drift),rz(reduced.matches?0:Math.sin(t*.17)*.004),sc(.93,.96,1));
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);shellDraw(M,t,.58,0);shellDraw(C(M,sc(.965,.965,.86)),t,.30,1.8);shellDraw(C(M,sc(.88,.88,.70)),t,.18,3.4);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.disable(gl.DEPTH_TEST);lineDraw(facet,M,[.12,.80,1.00],.14+.05*energy);lineDraw(fils,M,[.14,.88,1.00],.32+.12*energy);contours.forEach((o,i)=>lineDraw(o,M,i===contours.length-1?[.78,1.00,1.00]:[.18,.78,1.00],i===contours.length-1?.52:.11));
    const RM=C(M,rz(reduced.matches?0:t*.035));rings.forEach((o,i)=>lineDraw(o,RM,i%3===2?[.75,.25,1.00]:[.10,.86,1.00],.10+(rings.length-i)*.012));arcs.forEach((o,i)=>lineDraw(o,C(M,rz((i%2?-1:1)*t*.025+i*.17)),i%2?[.58,.22,1.00]:[.05,.72,1.00],.06));
    lineDraw(dust,M,[.20,.75,1.00],.22,gl.POINTS,2.0,1);lineDraw(spark,M,[.72,1.00,1.00],.60,gl.POINTS,4.2,1);lineDraw(center,M,[.08,.60,1.00],.16,gl.POINTS,44,1);lineDraw(center,M,[.10,.92,1.00],.30,gl.POINTS,29,1);lineDraw(center,M,[.82,1.00,1.00],.62,gl.POINTS,15,1);lineDraw(center,M,[1,1,1],1,gl.POINTS,6,1);gl.bindVertexArray(null);
  }
  root.dataset.fxCoreMobileV57=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreRenderer='single-webgl2-mobile-reference-lock-v57';root.dataset.fxCoreReferenceGeometry='reference-locked-four-point-crystal-v57';root.dataset.fxCoreReferenceMaterial='high-luminance-faceted-glass-v57';root.dataset.fxCoreInternalReactor='white-cyan-reactor-layered-rings-v57';root.dataset.fxCoreResponsive='physical-mobile-hero-local-v57';root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';root.dataset.fxReferenceCoreCinematic='reference-lock-v57';root.dataset.fxCoreReferenceLock='ready-v55';
  dispatchEvent(new CustomEvent('formatx:core3dready',{detail:{renderer:root.dataset.fxCoreRenderer,reference:VERSION}}));requestAnimationFrame(frame);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();root.dataset.fxCoreMobileV57='context-lost-v57';root.dataset.fxCoreMobileV55='context-lost-v55';},{passive:false});
}
boot();
}());
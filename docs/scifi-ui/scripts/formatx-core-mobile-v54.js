(function(){
'use strict';
const root=document.documentElement;
const mq=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)');
if(!mq.matches||root.dataset.fxCoreMobileV54==='ready-v54')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreMobileV54='audit-skip';return;}
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
root.dataset.fxCoreMobileV54='booting-v54';

function fail(reason,message=''){
  root.dataset.fxCoreMobileV54=reason;
  root.dataset.fxCoreReal3d=reason;
  if(message)root.dataset.fxCoreReal3dError=String(message).slice(0,220);
  dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason,message,reference:'v54-mobile'}}));
}
if(typeof WebGL2RenderingContext==='undefined'){fail('webgl2-unavailable-v54');return;}

const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[r+c*4]=a[r]*b[c*4]+a[r+4]*b[c*4+1]+a[r+8]*b[c*4+2]+a[r+12]*b[c*4+3];return o;}
function tr(x,y,z){const o=I();o[12]=x;o[13]=y;o[14]=z;return o;}
function sc(x,y,z){const o=I();o[0]=x;o[5]=y;o[10]=z;return o;}
function rx(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o;}
function ry(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o;}
function rz(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o;}
function C(){let o=I();for(const m of arguments)o=mul(o,m);return o;}
function persp(fov,aspect,near,far){const f=1/Math.tan(fov/2),nf=1/(near-far),o=new Float32Array(16);o[0]=f/aspect;o[5]=f;o[10]=(far+near)*nf;o[11]=-1;o[14]=2*far*near*nf;return o;}
function normal(a,b,c){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx,l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];}
function outerRadius(t){const cross=Math.pow(Math.abs(Math.cos(2*t)),5.5);const facet=.025*Math.cos(8*t)+.012*Math.cos(16*t);return .61+.50*cross+facet;}
function point(t,u,side){const inner=.17,e=u*u*(3-2*u),r=inner+(outerRadius(t)-inner)*e,lens=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.72);const z=side*(.055+.285*lens*(1+.08*Math.cos(8*t))+.010*(1-u));const pinch=1-.038*lens*Math.cos(4*t);return[r*Math.cos(t)*pinch,r*Math.sin(t)*1.06*pinch,z];}
function mesh(A=72,R=8){const d=[];function tri(a,b,c,flip){const n=normal(a,b,c);if(flip){n[0]*=-1;n[1]*=-1;n[2]*=-1;}for(const p of[a,b,c])d.push(...p,...n);}function quad(a,b,c,e,flip){if(flip){tri(a,c,b,true);tri(a,e,c,true);}else{tri(a,b,c,false);tri(a,c,e,false);}}for(const side of[-1,1])for(let j=0;j<R;j++){const u0=j/R,u1=(j+1)/R;for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(point(t0,u0,side),point(t0,u1,side),point(t1,u1,side),point(t1,u0,side),side<0);}}for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(point(t0,1,1),point(t0,1,-1),point(t1,1,-1),point(t1,1,1),false);quad(point(t0,0,-1),point(t0,0,1),point(t1,0,1),point(t1,0,-1),false);}return new Float32Array(d);}
function lineMesh(A=72){const d=[],front=(t,u)=>{const p=point(t,u,1);p[2]+=.009;return p;};for(let k=0;k<16;k++){const t=k/16*Math.PI*2;for(let j=0;j<8;j++)d.push(...front(t,j/8),...front(t,(j+1)/8));}for(const u of[.18,.34,.51,.68,.84,1])for(let i=0;i<A;i++)d.push(...front(i/A*Math.PI*2,u),...front((i+1)/A*Math.PI*2,u));return new Float32Array(d);}
function ring(rad,seg=76,z=.365){const d=[];for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2;d.push(Math.cos(a)*rad,Math.sin(a)*rad,z,Math.cos(b)*rad,Math.sin(b)*rad,z);}return new Float32Array(d);}
function arc(rad,start,len,seg=54,z=.04){const d=[];for(let i=0;i<seg;i++){const a=start+len*i/seg,b=start+len*(i+1)/seg;d.push(Math.cos(a)*rad,Math.sin(a)*rad,z,Math.cos(b)*rad,Math.sin(b)*rad,z);}return new Float32Array(d);}
const cross=new Float32Array([-1.06,0,.368,1.06,0,.368,0,-1.12,.368,0,1.12,.368,-.58,-.58,.366,.58,.58,.366,-.58,.58,.366,.58,-.58,.366]);

function start(attempt=0){
  if(!document.body){if(attempt<180)return requestAnimationFrame(()=>start(attempt+1));fail('body-unavailable-v54');return;}
  const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
  if(!hero||!host){if(attempt<180)return requestAnimationFrame(()=>start(attempt+1));fail('hero-host-unavailable-v54');return;}
  document.querySelectorAll('.fx-core-mobile-v54-stage,.fx-core-reference-v53-stage,.fx-core-v51-stage').forEach(n=>n.remove());
  const stage=document.createElement('div');stage.className='fx-core-mobile-v54-stage';stage.dataset.active='true';stage.setAttribute('aria-hidden','true');
  const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v54-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);host.prepend(stage);
  let gl;
  try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'default',desynchronized:false});}
  catch(e){stage.remove();fail('context-unavailable-v54',e&&e.message||e);return;}
  if(!gl||gl.isContextLost()){stage.remove();fail('context-unavailable-v54');return;}

  const SV=`#version 300 es\nprecision highp float;layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;uniform mat4 uP,uM;uniform float uT;out vec3 vP,vW,vN;void main(){vec3 p=aP;float pulse=1.+sin(uT*.42+atan(p.y,p.x)*4.)*.002;p.xy*=pulse;vec4 w=uM*vec4(p,1.);vP=p;vW=w.xyz;vN=normalize(mat3(uM)*aN);gl_Position=uP*w;}`;
  const SF=`#version 300 es\nprecision highp float;in vec3 vP,vW,vN;uniform float uT,uA,uPhase;out vec4 O;float S(float x){return clamp(x,0.,1.);}void main(){vec3 N=normalize(vN),V=normalize(-vW),L1=normalize(vec3(-.45,.72,.78)),L2=normalize(vec3(.66,-.30,.72));float d1=S(dot(N,L1)),d2=S(dot(N,L2)),f=pow(1.-S(abs(dot(N,V))),2.0),sp=pow(S(dot(N,normalize(L1+V))),58.);float a=atan(vP.y,vP.x),r=length(vP.xy);float stripe=pow(.5+.5*cos(a*16.+r*23.-uT*.20+uPhase),18.);float split=.5+.5*sin(a*4.+uT*.14+uPhase);vec3 cyan=vec3(.03,.78,1.0),blue=vec3(.03,.18,.92),vio=vec3(.70,.09,1.0),ice=vec3(.82,1.0,1.0);vec3 c=cyan*(.12+.34*d1+.22*f)+blue*(.04+.12*d2)+vio*(.04+.14*split+.08*stripe)+ice*(.04+.72*sp+.10*f);float al=uA*S(.14+.27*f+.12*d1+.07*d2+.10*sp+.035*stripe);O=vec4(c*al,al);}`;
  const LV=`#version 300 es\nprecision highp float;layout(location=0)in vec3 aP;uniform mat4 uP,uM;void main(){gl_Position=uP*uM*vec4(aP,1.);}`;
  const LF=`#version 300 es\nprecision highp float;uniform vec3 uC;uniform float uA;out vec4 O;void main(){O=vec4(uC*uA,uA);}`;
  const PV=`#version 300 es\nprecision highp float;uniform mat4 uP,uM;uniform float uS;void main(){gl_Position=uP*uM*vec4(0.,0.,.39,1.);gl_PointSize=uS;}`;
  const PF=`#version 300 es\nprecision highp float;uniform vec3 uC;uniform float uA;out vec4 O;void main(){vec2 p=gl_PointCoord*2.-1.;float d=dot(p,p);if(d>1.)discard;float core=pow(1.-d,7.),halo=pow(1.-d,1.8);float a=(core+.42*halo)*uA;vec3 c=mix(uC,vec3(1.),core*.95);O=vec4(c*a,a);}`;
  function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s;}
  function prog(v,f){const p=gl.createProgram(),vs=sh(gl.VERTEX_SHADER,v),fs=sh(gl.FRAGMENT_SHADER,f);gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p;}
  let SP,LP,PP;try{SP=prog(SV,SF);LP=prog(LV,LF);PP=prog(PV,PF);}catch(e){stage.remove();fail('shader-failed-v54',e&&e.message||e);return;}
  function uploadShell(data){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);gl.bindVertexArray(null);return{vao,count:data.length/6};}
  function uploadLine(data){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);gl.bindVertexArray(null);return{vao,count:data.length/3};}
  const shell=uploadShell(mesh()),wire=uploadLine(lineMesh()),crossG=uploadLine(cross),rings=[.15,.22,.30,.39,.49,.58].map(r=>uploadLine(ring(r))),arcs=[uploadLine(arc(1.08,.2,2.5)),uploadLine(arc(1.19,2.42,2.12)),uploadLine(arc(1.31,4.12,1.76))];
  const SU={P:gl.getUniformLocation(SP,'uP'),M:gl.getUniformLocation(SP,'uM'),T:gl.getUniformLocation(SP,'uT'),A:gl.getUniformLocation(SP,'uA'),Q:gl.getUniformLocation(SP,'uPhase')};
  const LU={P:gl.getUniformLocation(LP,'uP'),M:gl.getUniformLocation(LP,'uM'),C:gl.getUniformLocation(LP,'uC'),A:gl.getUniformLocation(LP,'uA')};
  const PU={P:gl.getUniformLocation(PP,'uP'),M:gl.getUniformLocation(PP,'uM'),S:gl.getUniformLocation(PP,'uS'),C:gl.getUniformLocation(PP,'uC'),A:gl.getUniformLocation(PP,'uA')};
  let P=I(),running=true,visible=true,last=performance.now(),ema=16.7,frames=0,renderScale=1,px=0,py=0,tx=0,ty=0,dpr=1;let pointMax=64;const range=gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);if(range&&range.length>1)pointMax=range[1];
  function view(){const r=stage.getBoundingClientRect();return{w:Math.max(1,r.width||host.clientWidth),h:Math.max(1,r.height||host.clientHeight)};}
  function resize(){const v=view(),cap=1.30,budget=920000;dpr=Math.min(devicePixelRatio||1,cap)*renderScale;const n=v.w*v.h*dpr*dpr;if(n>budget)dpr*=Math.sqrt(budget/n);dpr=clamp(dpr,.72,cap);const cw=Math.max(1,Math.round(v.w*dpr)),ch=Math.max(1,Math.round(v.h*dpr));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}gl.viewport(0,0,cw,ch);P=persp(40*Math.PI/180,v.w/v.h,.1,30);}
  function base(t){const v=view(),s=clamp(v.w*.00168,.58,.72),idle=reduced.matches?.8:t;return C(tr(0,.01,-3.18),rx(-.085+py*.08+Math.sin(idle*.17)*.013),ry(.10+px*.11+Math.sin(idle*.21)*.024),rz(Math.sin(idle*.16)*.009),sc(s,s,s));}
  function shellPass(t,m,a,q){gl.useProgram(SP);gl.uniformMatrix4fv(SU.P,false,P);gl.uniformMatrix4fv(SU.M,false,m);gl.uniform1f(SU.T,t);gl.uniform1f(SU.A,a);gl.uniform1f(SU.Q,q);gl.bindVertexArray(shell.vao);gl.drawArrays(gl.TRIANGLES,0,shell.count);}
  function linePass(g,m,c,a,width=1){gl.useProgram(LP);gl.uniformMatrix4fv(LU.P,false,P);gl.uniformMatrix4fv(LU.M,false,m);gl.uniform3fv(LU.C,c);gl.uniform1f(LU.A,a);gl.lineWidth(width);gl.bindVertexArray(g.vao);gl.drawArrays(gl.LINES,0,g.count);}
  function pointPass(m,c,a,size){gl.useProgram(PP);gl.uniformMatrix4fv(PU.P,false,P);gl.uniformMatrix4fv(PU.M,false,m);gl.uniform1f(PU.S,Math.min(pointMax,size*dpr));gl.uniform3fv(PU.C,c);gl.uniform1f(PU.A,a);gl.drawArrays(gl.POINTS,0,1);}
  function render(now){if(!running)return;requestAnimationFrame(render);if(!visible||document.hidden)return;const dt=Math.min(50,Math.max(1,now-last));last=now;ema=ema*.94+dt*.06;frames++;if(frames%100===0){if(ema>20&&renderScale>.78){renderScale=Math.max(.78,renderScale-.08);resize();}else if(ema<15.4&&renderScale<1){renderScale=Math.min(1,renderScale+.05);resize();}}tx+=(px-tx)*.06;ty+=(py-ty)*.06;const t=now*.001,m=base(t);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);shellPass(t,m,.74,0);shellPass(t,C(m,rz(.012)),.27,1.7);gl.depthMask(true);linePass(wire,m,new Float32Array([.06,.72,1]),.34,1);linePass(crossG,m,new Float32Array([.28,.86,1]),.16,1);gl.depthMask(false);for(let i=0;i<rings.length;i++){const rr=C(m,rz((i%2?1:-1)*t*(.16+.025*i)));const hue=i%3===0?[.14,.95,1]:i%3===1?[.57,.19,1]:[.12,.45,1];linePass(rings[i],rr,new Float32Array(hue),.34+.10*Math.sin(t*1.2+i),1);}for(let i=0;i<arcs.length;i++){const aa=C(m,rz((i%2?1:-1)*t*(.20+.04*i)));linePass(arcs[i],aa,new Float32Array(i===1?[.60,.16,1]:[.05,.82,1]),.22,1);}const wob=C(m,tr(Math.sin(t*.79)*.035,Math.cos(t*.63)*.026,0));pointPass(wob,new Float32Array([.72,.93,1]),1,58);pointPass(C(wob,sc(.60,.60,.60)),new Float32Array([1,1,1]),1,34);gl.depthMask(true);gl.bindVertexArray(null);}
  function pointer(e){const r=host.getBoundingClientRect();px=clamp((e.clientX-r.left)/Math.max(1,r.width)*2-1,-1,1);py=clamp((e.clientY-r.top)/Math.max(1,r.height)*2-1,-1,1);}
  host.addEventListener('pointermove',pointer,{passive:true});
  host.addEventListener('pointerleave',()=>{px=0;py=0;},{passive:true});
  addEventListener('resize',resize,{passive:true});visualViewport&&visualViewport.addEventListener('resize',resize,{passive:true});
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(e=>{visible=!!e[0]&&e[0].isIntersecting;},{rootMargin:'160px'}).observe(hero);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false;fail('context-lost-v54');},{once:true});
  resize();
  root.dataset.fxCoreMobileV54='ready-v54';
  root.dataset.fxCoreRenderer='single-webgl2-mobile-crystal-v54';
  root.dataset.fxCoreReferenceGeometry='sharp-four-tip-concave-crystal-v54';
  root.dataset.fxCoreReferenceMaterial='premultiplied-faceted-refractive-glass-v54';
  root.dataset.fxCoreInternalReactor='moving-white-nucleus-spectral-rings-v54';
  root.dataset.fxCoreResponsive='physical-mobile-hero-local-v54';
  root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';
  root.dataset.fxCoreImageBacked='false';
  root.dataset.fxCoreDepth='closed-volumetric-shell-with-sidewalls';
  root.dataset.fxCoreReal3d='ready-v54';
  root.dataset.fxCoreReferenceLock='ready-v54';
  dispatchEvent(new CustomEvent('formatx:core3dready',{detail:{renderer:'mobile-v54',host:'hero-space'}}));
  requestAnimationFrame(render);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>start(),{once:true});else start();
}());

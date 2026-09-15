(function(){
'use strict';
const root=document.documentElement,READY='ready-v63',VERSION='cinematic-pixel-reference-native-webgl2-v63';
if(root.dataset.fxCoreMobileV63===READY||root.dataset.fxCoreMobileV63==='booting-v63')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreMobileV63='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;}
if(typeof WebGL2RenderingContext==='undefined'){root.dataset.fxCoreMobileV63='webgl2-unavailable-v63';root.dataset.fxCoreMobileV55='webgl2-unavailable-v55';return;}
root.dataset.fxCoreMobileV63='booting-v63';root.dataset.fxCoreMobileV55='booting-v55';root.dataset.fxCoreRendererMode='mobile';
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
function norm3(v){const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l];}
function normal(a,b,c){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];return norm3([uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx]);}
function qbez(a,k,b,u){const v=1-u;return[v*v*a[0]+2*v*u*k[0]+u*u*b[0],v*v*a[1]+2*v*u*k[1]+u*u*b[1]];}
function outlinePoint(t){
  const qtr=Math.PI/2,a=((t%(Math.PI*2))+Math.PI*2)%(Math.PI*2),q=Math.min(3,Math.floor(a/qtr)),u=(a-q*qtr)/qtr;
  const tips=[[1.285,0],[0,1.43],[-1.285,0],[0,-1.365],[1.285,0]];
  const controls=[[.245,.385],[-.245,.385],[-.255,-.365],[.255,-.365]];
  return qbez(tips[q],controls[q],tips[q+1],u);
}
function surfacePoint(t,u,side=1,zBias=0,depth=.33){
  const e=outlinePoint(t),rr=Math.pow(u,.82),lens=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.56);
  const crystal=.995+.011*Math.cos(t*8)*(1-u)+.005*Math.cos(t*16+u*10);
  const pinch=1-.055*Math.pow(Math.abs(Math.sin(t*2)),1.35)*(1-u);
  return[e[0]*rr*crystal*pinch,e[1]*rr*crystal*pinch,zBias+side*(.016*(1-u)+depth*lens*(.92+.08*Math.cos(t*4)))];
}
function shellGeo(A=144,R=18,depth=.33){
  const d=[];function tri(a,b,c,flip=false){let n=normal(a,b,c);if(flip)n=[-n[0],-n[1],-n[2]];for(const p of[a,b,c])d.push(...p,...n);}function quad(a,b,c,e,flip=false){if(flip){tri(a,c,b,true);tri(a,e,c,true);}else{tri(a,b,c);tri(a,c,e);}}
  for(const side of[-1,1])for(let j=0;j<R;j++){const u0=j/R,u1=(j+1)/R;for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(surfacePoint(t0,u0,side,0,depth),surfacePoint(t0,u1,side,0,depth),surfacePoint(t1,u1,side,0,depth),surfacePoint(t1,u0,side,0,depth),side<0);}}
  for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(surfacePoint(t0,1,1,0,depth),surfacePoint(t0,1,-1,0,depth),surfacePoint(t1,1,-1,0,depth),surfacePoint(t1,1,1,0,depth));}
  return new Float32Array(d);
}
function tubeCurve(pointFn,segments=176,sides=10,radius=.018){
  const d=[],rings=[];
  for(let i=0;i<=segments;i++){
    const u=i/segments,p=pointFn(u),pm=pointFn(Math.max(0,u-1/segments)),pp=pointFn(Math.min(1,u+1/segments));
    const T=norm3([pp[0]-pm[0],pp[1]-pm[1],pp[2]-pm[2]]),B1=norm3([-T[1],T[0],0]),B2=norm3([T[1]*B1[2]-T[2]*B1[1],T[2]*B1[0]-T[0]*B1[2],T[0]*B1[1]-T[1]*B1[0]]),ring=[];
    for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2,c=Math.cos(a),s=Math.sin(a),n=norm3([B1[0]*c+B2[0]*s,B1[1]*c+B2[1]*s,B1[2]*c+B2[2]*s]);ring.push({p:[p[0]+n[0]*radius,p[1]+n[1]*radius,p[2]+n[2]*radius],n});}rings.push(ring);
  }
  for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const k=(j+1)%sides,a=rings[i][j],b=rings[i+1][j],c=rings[i+1][k],e=rings[i][k];for(const q of[[a,b,c],[a,c,e]])for(const v of q)d.push(...v.p,...v.n);}
  return new Float32Array(d);
}
function outlineTube(scale=.992,z=.02,r=.018){return tubeCurve(u=>{const p=outlinePoint(u*Math.PI*2);return[p[0]*scale,p[1]*scale,z+.015*Math.sin(u*Math.PI*8)];},192,10,r);}
function surfaceRail(angle,z=.10,r=.009,wob=.02){return tubeCurve(u=>{const q=.045+.94*u,p=surfacePoint(angle+wob*Math.sin(u*Math.PI*3),q,1,z,.33);return p;},90,8,r);}
function ringTube(rad=.36,z=.39,tiltX=0,tiltY=0,r=.008){return tubeCurve(u=>{const a=u*Math.PI*2,x=Math.cos(a)*rad,y=Math.sin(a)*rad,z0=z;const cx=Math.cos(tiltX),sx=Math.sin(tiltX),cy=Math.cos(tiltY),sy=Math.sin(tiltY);let yy=y*cx-z0*sx,zz=y*sx+z0*cx,xx=x*cy+zz*sy;zz=-x*sy+zz*cy;return[xx,yy,zz];},144,8,r);}
function sphere(rad=.105,lat=20,lon=30,z=.49){const d=[];const P=(a,b)=>[rad*Math.sin(a)*Math.cos(b),rad*Math.cos(a),z+rad*Math.sin(a)*Math.sin(b)];for(let i=0;i<lat;i++){const a0=i/lat*Math.PI,a1=(i+1)/lat*Math.PI;for(let j=0;j<lon;j++){const b0=j/lon*Math.PI*2,b1=(j+1)/lon*Math.PI*2,p00=P(a0,b0),p01=P(a0,b1),p11=P(a1,b1),p10=P(a1,b0);for(const q of[[p00,p01,p11],[p00,p11,p10]])for(const p of q){const n=norm3([p[0],p[1],p[2]-z]);d.push(...p,...n);}}}return new Float32Array(d);}
function lineSegments(points){const d=[];for(let i=0;i<points.length-1;i++)d.push(...points[i],...points[i+1]);return new Float32Array(d);}
function contour(u,segments=180,z=.365){const p=[];for(let i=0;i<=segments;i++)p.push(surfacePoint(i/segments*Math.PI*2,u,1,z-.33,.33));return lineSegments(p);}
function filamentField(){const d=[];for(let k=0;k<28;k++){const a=k/28*Math.PI*2+.08*Math.sin(k*2.1);let prev=null;for(let j=0;j<=34;j++){const u=.08+.87*j/34,tw=.025*Math.sin(j*.46+k*1.7)+.012*Math.sin(j*.91-k),p=surfacePoint(a+tw,u,1,.12+.035*Math.sin(j*.2+k),.33);if(prev)d.push(...prev,...p);prev=p;}}return new Float32Array(d);}
function radialRibs(){const d=[];for(const t of[0,Math.PI/4,Math.PI/2,3*Math.PI/4,Math.PI,5*Math.PI/4,3*Math.PI/2,7*Math.PI/4]){let prev=null;for(let j=0;j<=30;j++){const u=.06+.92*j/30,p=surfacePoint(t,u,1,.105,.33);if(prev)d.push(...prev,...p);prev=p;}}return new Float32Array(d);}
function particles(count=120){let s=0x91e2a7c3;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296),d=[];for(let i=0;i<count;i++){const a=rnd()*Math.PI*2,u=.12+rnd()*.82,p=surfacePoint(a,u,1,.12+rnd()*.18,.33);d.push(p[0],p[1],p[2]);}return new Float32Array(d);}
function haloPoints(count=100){let s=0x7192d4e1;const rnd=()=>((s=(Math.imul(s,1103515245)+12345)>>>0)/4294967296),d=[];for(let i=0;i<count;i++){const a=rnd()*Math.PI*2,r=.75+rnd()*.65;d.push(Math.cos(a)*r,Math.sin(a)*r*.92,-.10+rnd()*.12);}return new Float32Array(d);}
function waterLines(){const d=[];for(let j=0;j<26;j++){const y=-1.12-j*.025;let prev=null;for(let i=0;i<=72;i++){const x=-1.48+i/72*2.96,z=-.22+.015*Math.sin(i*.53+j*.77)+.008*Math.sin(i*.19-j*.34),p=[x,y+.010*Math.sin(i*.31+j*.71),z];if(prev)d.push(...prev,...p);prev=p;}}return new Float32Array(d);}
function compile(gl,type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh)||'shader compile');return sh;}
function program(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link');return p;}
function mesh(gl,data,withNormal=true){const vao=gl.createVertexArray(),buf=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);if(withNormal){gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);return{vao,count:data.length/6};}gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);return{vao,count:data.length/3};}
function boot(attempt=0){
  if(!document.body){requestAnimationFrame(()=>boot(attempt));return;}
  const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
  if(!hero||!host){if(attempt<240){requestAnimationFrame(()=>boot(attempt+1));return;}root.dataset.fxCoreMobileV63='hero-host-unavailable-v63';return;}
  document.querySelectorAll('.fx-core-mobile-v55-stage,.fx-core-reference-v53-stage,.fx-core-v51-stage,.fx-core-mesh3d-stage,.fx-core-fracture3d-stage,.fx-core-fidelity-v61').forEach(n=>n.remove());
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage';stage.dataset.active='true';stage.dataset.renderer='reference-v63';stage.setAttribute('aria-hidden','true');
  const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas';canvas.setAttribute('aria-hidden','true');stage.append(canvas);host.prepend(stage);
  let gl;try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance',desynchronized:true});}catch(e){stage.remove();root.dataset.fxCoreMobileV63='context-unavailable-v63';return;}
  if(!gl||gl.isContextLost()){stage.remove();root.dataset.fxCoreMobileV63='context-unavailable-v63';return;}
  const VS=`#version 300 es\nprecision highp float;layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;uniform mat4 uP,uM;uniform float uT,uEnergy;out vec3 vP,vN;void main(){vec3 p=aP;float a=atan(p.y,p.x),r=length(p.xy);float breathe=1.0+sin(uT*.61+a*4.0+r*8.0)*(.0009+.0018*uEnergy);p.xy*=breathe;p.z*=1.0+sin(uT*.37+a*3.0)*(.003+.005*uEnergy);vec4 w=uM*vec4(p,1.0);vP=p;vN=normalize(transpose(inverse(mat3(uM)))*aN);gl_Position=uP*w;}`;
  const FS=`#version 300 es\nprecision highp float;in vec3 vP,vN;uniform float uT,uAlpha,uEnergy,uPhase,uMode;out vec4 O;float sat(float x){return clamp(x,0.0,1.0);}void main(){vec3 N=normalize(vN),V=vec3(0,0,1),L1=normalize(vec3(-.52,.78,1)),L2=normalize(vec3(.76,-.22,.90));float ndv=abs(dot(N,V)),fres=pow(1.0-ndv,.62),d1=sat(dot(N,L1)),d2=sat(dot(N,L2)),spec=pow(sat(dot(N,normalize(L1+V))),76.0),a=atan(vP.y,vP.x),r=length(vP.xy);float wave=.5+.5*cos(a*8.0+r*24.0-vP.z*22.0-uT*.34+uPhase),vio=.5+.5*cos(a*5.0-r*17.0+vP.z*24.0+uT*.18-uPhase);vec3 cyan=vec3(.05,.92,1.32),ice=vec3(1.08,1.10,1.12),blue=vec3(.015,.10,.48),purple=vec3(.70,.10,1.05);vec3 glass=blue*(.018+.035*d2)+cyan*(.025+.26*fres+.035*d1+.10*smoothstep(.88,1.0,wave))+purple*(.008+.085*smoothstep(.90,1.0,vio))+ice*(.012+.20*spec);vec3 emit=mix(cyan,ice,.35+.40*spec)+purple*(.10+.20*smoothstep(.80,1.0,vio));float glassA=uAlpha*(.045+.28*fres+.025*d1+.06*spec),emitA=uAlpha*(.34+.48*fres+.18*spec);O=uMode>.5?vec4(emit,emitA):vec4(glass,glassA);}`;
  const LVS=`#version 300 es\nprecision highp float;layout(location=0)in vec3 aP;uniform mat4 uP,uM;uniform float uPoint;void main(){gl_Position=uP*uM*vec4(aP,1.0);gl_PointSize=uPoint;}`;
  const LFS=`#version 300 es\nprecision highp float;uniform vec4 uColor;uniform float uSoft;out vec4 O;void main(){float a=uColor.a;if(uSoft>.5){vec2 q=gl_PointCoord-.5;float d=length(q);a*=smoothstep(.5,.035,d);}O=vec4(uColor.rgb,a);}`;
  const shellP=program(gl,VS,FS),lineP=program(gl,LVS,LFS);
  const shell=mesh(gl,shellGeo()),inner=mesh(gl,shellGeo(132,16,.255));
  const edgeGlow=mesh(gl,outlineTube(1.0,.035,.026)),edgeIce=mesh(gl,outlineTube(.994,.055,.010)),edgeInner=mesh(gl,outlineTube(.955,.070,.008));
  const rails=[0,Math.PI/2,Math.PI,3*Math.PI/2,Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4].map((a,i)=>mesh(gl,surfaceRail(a,.11,i<4?.011:.007,i<4?.012:.022)));
  const rings=[
    mesh(gl,ringTube(.22,.47,.12,-.08,.006)),mesh(gl,ringTube(.31,.45,-.18,.11,.008)),mesh(gl,ringTube(.40,.42,.36,-.08,.008)),
    mesh(gl,ringTube(.49,.38,-.30,-.15,.006)),mesh(gl,ringTube(.59,.31,.22,.24,.005)),mesh(gl,ringTube(.70,.18,-.12,.31,.004))
  ];
  const core=mesh(gl,sphere(.105,20,30,.54)),core2=mesh(gl,sphere(.155,18,28,.47));
  const fil=mesh(gl,filamentField(),false),ribs=mesh(gl,radialRibs(),false),c42=mesh(gl,contour(.42),false),c58=mesh(gl,contour(.58),false),c76=mesh(gl,contour(.76),false),pts=mesh(gl,particles(),false),halo=mesh(gl,haloPoints(),false),water=mesh(gl,waterLines(),false);
  const loc={sp:{P:gl.getUniformLocation(shellP,'uP'),M:gl.getUniformLocation(shellP,'uM'),T:gl.getUniformLocation(shellP,'uT'),E:gl.getUniformLocation(shellP,'uEnergy'),A:gl.getUniformLocation(shellP,'uAlpha'),Ph:gl.getUniformLocation(shellP,'uPhase'),Mo:gl.getUniformLocation(shellP,'uMode')},lp:{P:gl.getUniformLocation(lineP,'uP'),M:gl.getUniformLocation(lineP,'uM'),C:gl.getUniformLocation(lineP,'uColor'),S:gl.getUniformLocation(lineP,'uSoft'),Pt:gl.getUniformLocation(lineP,'uPoint')}};
  let width=0,height=0,dpr=1,visible=true,raf=0,last=performance.now(),energy=.18,targetEnergy=.18,ix=0,iy=0,tx=0,ty=0,burst=0;
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;dpr=Math.min(devicePixelRatio||1,1.75);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h;}width=r.width;height=r.height;gl.viewport(0,0,w,h);}
  const ro=new ResizeObserver(resize);ro.observe(stage);resize();
  function projection(){const aspect=Math.max(.55,width/Math.max(1,height)),sy=1.58,sx=sy*aspect;return ortho(-sx,sx,-sy,sy,-5,5);}
  function drawMesh(obj,M,alpha,phase,energyValue,mode=0){gl.useProgram(shellP);gl.uniformMatrix4fv(loc.sp.P,false,projection());gl.uniformMatrix4fv(loc.sp.M,false,M);gl.uniform1f(loc.sp.T,performance.now()/1000);gl.uniform1f(loc.sp.E,energyValue);gl.uniform1f(loc.sp.A,alpha);gl.uniform1f(loc.sp.Ph,phase);gl.uniform1f(loc.sp.Mo,mode);gl.bindVertexArray(obj.vao);gl.drawArrays(gl.TRIANGLES,0,obj.count);}
  function drawLine(obj,M,color,mode=gl.LINES,point=1,soft=0){gl.useProgram(lineP);gl.uniformMatrix4fv(loc.lp.P,false,projection());gl.uniformMatrix4fv(loc.lp.M,false,M);gl.uniform4fv(loc.lp.C,color);gl.uniform1f(loc.lp.Pt,point*dpr);gl.uniform1f(loc.lp.S,soft);gl.bindVertexArray(obj.vao);gl.drawArrays(mode,0,obj.count);}
  function interaction(e){const d=e.detail||{};if(Number.isFinite(d.x))tx=clamp(d.x,-1,1);if(Number.isFinite(d.y))ty=clamp(d.y,-1,1);if(d.phase==='press'){targetEnergy=1;burst=1;}else if(d.phase==='drag'){targetEnergy=Math.max(targetEnergy,.86);}else if(d.phase==='burst'||d.phase==='press-sustain'){targetEnergy=1.2;burst=1.3;}else if(d.phase==='hover'){targetEnergy=Math.max(targetEnergy,.40);}else if(d.phase==='release'||d.phase==='cancel'){targetEnergy=.26;tx*=.45;ty*=.45;}}
  addEventListener('formatx:coreinteraction',interaction,{passive:true});
  function frame(now){raf=0;if(!visible||!stage.isConnected)return;resize();const dt=Math.min(40,Math.max(0,now-last));last=now;const lerp=1-Math.pow(.002,dt/1000),slow=1-Math.pow(.045,dt/1000);ix+=(tx-ix)*lerp;iy+=(ty-iy)*lerp;energy+=(targetEnergy-energy)*lerp;targetEnergy+=(.18-targetEnergy)*slow;burst*=Math.pow(.08,dt/1000);tx*=Math.pow(.16,dt/1000);ty*=Math.pow(.16,dt/1000);const t=now*.001,motion=reduced.matches?.16:1,pulse=.5+.5*Math.sin(t*1.75),s=1+(.002+.007*energy+.006*burst)*pulse;const M=C(tr(0,.015,0),rx((-iy*.060+Math.sin(t*.15)*.004)*motion),ry((ix*.085+Math.cos(t*.13)*.006)*motion),rz(Math.sin(t*.10)*.0025*motion),sc(s,s,s));
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.disable(gl.CULL_FACE);
    drawLine(halo,C(M,rz(-t*.012*motion)),[.08,.42,1.0,.22],gl.POINTS,1.6,1);
    drawMesh(shell,M,.78,.2,energy,0);drawMesh(inner,C(M,sc(.976,.976,.976)),.48,1.6,energy*.7,0);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    drawMesh(edgeGlow,M,.58,.3,energy,1);drawMesh(edgeIce,M,.92,2.0,energy,1);drawMesh(edgeInner,M,.54,3.1,energy,1);
    rails.forEach((r,i)=>drawMesh(r,M,i<4?.78:.48,.8+i*.41,energy,1));
    drawLine(ribs,M,[.57,.95,1.0,.44]);drawLine(fil,M,[.23,.82,1.0,.39]);drawLine(c42,M,[.86,.98,1.0,.30]);drawLine(c58,M,[.13,.76,1.0,.29]);drawLine(c76,M,[.76,.26,1.0,.23]);
    rings.forEach((r,i)=>drawMesh(r,C(M,rz((i%2?-1:1)*t*(.07+.018*i)*motion)),i===2||i===4?.62:.80,1.2+i*.5,energy,1));
    drawMesh(core2,C(M,sc(1+energy*.025,1+energy*.025,1+energy*.025)),.34,4.1,energy+burst,1);
    drawMesh(core,C(M,sc(1+energy*.055+burst*.035,1+energy*.055+burst*.035,1+energy*.055+burst*.035)),1.0,5.3,energy+burst,1);
    drawLine(pts,M,[.82,.98,1.0,.72],gl.POINTS,2.4,1);
    drawLine(water,C(tr(0,-.02,-.15),M),[.05,.45,1.0,.15]);
    const refl=C(tr(0,-2.53,-.18),sc(1,-.28,1),M);
    drawMesh(edgeGlow,refl,.12,2.2,energy*.25,1);drawMesh(edgeIce,refl,.10,3.0,energy*.25,1);drawLine(fil,refl,[.08,.35,.9,.07]);
    gl.depthMask(true);raf=requestAnimationFrame(frame);
  }
  function start(){if(!raf&&visible&&stage.isConnected){last=performance.now();raf=requestAnimationFrame(frame);}}
  if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible)start();else if(raf){cancelAnimationFrame(raf);raf=0;}},{rootMargin:'20% 0px',threshold:.01});io.observe(hero);}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();root.dataset.fxCoreMobileV63='context-lost-v63';if(raf){cancelAnimationFrame(raf);raf=0;}},{passive:false});
  root.dataset.fxCoreRenderer='single-webgl2-mobile-cinematic-pixel-reference-v63';root.dataset.fxCoreReferenceGeometry='pixel-locked-organic-deep-concave-four-point-v63';root.dataset.fxCoreReferenceMaterial='multishell-fresnel-crystal-tube-glass-v63';root.dataset.fxCoreInternalReactor='white-cyan-spherical-reactor-multiaxis-orbitals-v63';root.dataset.fxCoreReferenceFidelity='native-webgl2-only-no-raster-no-svg-v63';root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';root.dataset.fxCoreMobileV63=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v63';root.dataset.fxCoreReal3d='ready-v63';root.dataset.fxCoreAnimation='continuous-native-webgl2-living-motion-v63';root.dataset.fxCoreInteractionVisual='touch-drag-energy-parallax-v63';
  window.FormatXCoreMobileV63={version:VERSION,get energy(){return energy;},pulse(){targetEnergy=1.18;burst=1.15;start();}};
  start();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});else boot();
}());
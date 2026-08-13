(function(){
'use strict';
const root=document.documentElement;
const READY='ready-v68';
if(root.dataset.fxCoreMobileV68===READY||root.dataset.fxCoreMobileV68==='booting-v68')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreMobileV68='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;}
if(typeof WebGL2RenderingContext==='undefined'){root.dataset.fxCoreMobileV68='webgl2-unavailable-v68';root.dataset.fxCoreMobileV55='webgl2-unavailable-v55';return;}
root.dataset.fxCoreMobileV68='booting-v68';root.dataset.fxCoreMobileV55='booting-v55';root.dataset.fxCoreRendererMode='mobile';
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
function norm(v){const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l];}
function normal(a,b,c){const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];return norm([u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]);}
function bez(a,k,b,u){const v=1-u;return[v*v*a[0]+2*v*u*k[0]+u*u*b[0],v*v*a[1]+2*v*u*k[1]+u*u*b[1]];}
function outline(t){const qtr=Math.PI/2,a=((t%(Math.PI*2))+Math.PI*2)%(Math.PI*2),q=Math.min(3,Math.floor(a/qtr)),u=(a-q*qtr)/qtr;const tips=[[1.30,0],[0,1.48],[-1.30,0],[0,-1.39],[1.30,0]],ctrl=[[.12,.27],[-.12,.27],[-.13,-.26],[.13,-.26]];return bez(tips[q],ctrl[q],tips[q+1],u);}
function surf(t,u,side=1,zBias=0,depth=.47){const e=outline(t),rr=Math.pow(u,.76),lens=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.44),organic=1+.010*Math.cos(t*8)*(1-u)+.005*Math.sin(t*13+u*8),pinch=1-.048*Math.pow(Math.abs(Math.sin(t*2)),1.38)*(1-u);return[e[0]*rr*organic*pinch,e[1]*rr*organic*pinch,zBias+side*(.022*(1-u)+depth*lens*(.92+.08*Math.cos(t*4)))];}
function shell(A=144,R=18,depth=.47){const d=[];function tri(a,b,c,flip){let n=normal(a,b,c);if(flip)n=[-n[0],-n[1],-n[2]];for(const p of[a,b,c])d.push(...p,...n);}function quad(a,b,c,e,flip){if(flip){tri(a,c,b,true);tri(a,e,c,true);}else{tri(a,b,c,false);tri(a,c,e,false);}}for(const side of[-1,1])for(let j=0;j<R;j++){const u0=j/R,u1=(j+1)/R;for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(surf(t0,u0,side,0,depth),surf(t0,u1,side,0,depth),surf(t1,u1,side,0,depth),surf(t1,u0,side,0,depth),side<0);}}return new Float32Array(d);}
function tube(fn,segments=140,sides=7,r=.008){const d=[],rings=[];for(let i=0;i<=segments;i++){const u=i/segments,p=fn(u),pm=fn(Math.max(0,u-1/segments)),pp=fn(Math.min(1,u+1/segments)),T=norm([pp[0]-pm[0],pp[1]-pm[1],pp[2]-pm[2]]),B1=norm([-T[1],T[0],.04]),B2=norm([T[1]*B1[2]-T[2]*B1[1],T[2]*B1[0]-T[0]*B1[2],T[0]*B1[1]-T[1]*B1[0]]),ring=[];for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2,c=Math.cos(a),s=Math.sin(a),n=norm([B1[0]*c+B2[0]*s,B1[1]*c+B2[1]*s,B1[2]*c+B2[2]*s]);ring.push({p:[p[0]+n[0]*r,p[1]+n[1]*r,p[2]+n[2]*r],n});}rings.push(ring);}for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const k=(j+1)%sides,a=rings[i][j],b=rings[i+1][j],c=rings[i+1][k],e=rings[i][k];for(const q of[[a,b,c],[a,c,e]])for(const v of q)d.push(...v.p,...v.n);}return new Float32Array(d);}
function edge(scale,z,r){return tube(u=>{const p=outline(u*Math.PI*2);return[p[0]*scale,p[1]*scale,z+.012*Math.sin(u*Math.PI*8)];},176,8,r);}
function rail(angle,phase,r){return tube(u=>{const q=.04+.94*u,p=surf(angle+.022*Math.sin(u*Math.PI*3+phase),q,1,.15+.022*Math.sin(u*Math.PI*4+phase),.47);return p;},86,7,r);}
function orbit(rad,z,tx,ty,r){return tube(u=>{const a=u*Math.PI*2,x=Math.cos(a)*rad,y=Math.sin(a)*rad,cx=Math.cos(tx),sx=Math.sin(tx),cy=Math.cos(ty),sy=Math.sin(ty);let yy=y*cx-z*sx,zz=y*sx+z*cx,xx=x*cy+zz*sy;zz=-x*sy+zz*cy;return[xx,yy,zz];},116,7,r);}
function sphere(rad,z,lat=18,lon=28){const d=[],P=(a,b)=>[rad*Math.sin(a)*Math.cos(b),rad*Math.cos(a),z+rad*Math.sin(a)*Math.sin(b)];for(let i=0;i<lat;i++){const a0=i/lat*Math.PI,a1=(i+1)/lat*Math.PI;for(let j=0;j<lon;j++){const b0=j/lon*Math.PI*2,b1=(j+1)/lon*Math.PI*2,p00=P(a0,b0),p01=P(a0,b1),p11=P(a1,b1),p10=P(a1,b0);for(const q of[[p00,p01,p11],[p00,p11,p10]])for(const p of q){const n=norm([p[0],p[1],p[2]-z]);d.push(...p,...n);}}}return new Float32Array(d);}
function filaments(count=64){const d=[];for(let k=0;k<count;k++){const a=k/count*Math.PI*2+.05*Math.sin(k*1.7);let prev=null;for(let j=0;j<=38;j++){const u=.06+.89*j/38,tw=.020*Math.sin(j*.43+k*1.05)+.008*Math.sin(j*.81-k*.6),p=surf(a+tw,u,1,.13+.045*Math.sin(j*.16+k*.54),.47);if(prev)d.push(...prev,...p);prev=p;}}return new Float32Array(d);}
function ribs(count=20){const d=[];for(let k=0;k<count;k++){const a=k/count*Math.PI*2;let prev=null;for(let j=0;j<=30;j++){const u=.05+.92*j/30,p=surf(a,u,1,.12,.47);if(prev)d.push(...prev,...p);prev=p;}}return new Float32Array(d);}
function particleField(count=260,halo=false){let s=halo?0x183ac7d1:0x9134a7c3;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296),d=[];for(let i=0;i<count;i++){if(halo){const a=rnd()*Math.PI*2,r=.58+rnd()*.82;d.push(Math.cos(a)*r,Math.sin(a)*r*.92,-.12+rnd()*.20);}else{const a=rnd()*Math.PI*2,u=.10+rnd()*.84,p=surf(a,u,1,.12+rnd()*.21,.47);d.push(...p);}}return new Float32Array(d);}
function water(){let s=0x75ab41d5;const rnd=()=>((s=(Math.imul(s,1103515245)+12345)>>>0)/4294967296),d=[];for(let j=0;j<38;j++){const y=-1.05-j*.015;for(let i=0;i<30;i++){const x=-1.45+rnd()*2.9,len=.018+rnd()*.15,yy=y+(rnd()-.5)*.038,z=-.20+.016*Math.sin(x*11+j*.7);d.push(x,yy,z,x+len,yy+(rnd()-.5)*.016,z+(rnd()-.5)*.010);}}return new Float32Array(d);}
function compile(gl,type,src,label){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(label+': '+(gl.getShaderInfoLog(s)||'shader compile'));return s;}
function program(gl,vs,fs,label){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs,label+' vertex'));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs,label+' fragment'));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(label+': '+(gl.getProgramInfoLog(p)||'program link'));return p;}
function mesh(gl,data,normals=true){const vao=gl.createVertexArray(),buf=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,normals?24:12,0);if(normals){gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);}return{vao,count:data.length/(normals?6:3)};}
function boot(attempt=0){
 if(!document.body){requestAnimationFrame(()=>boot(attempt));return;}
 const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');if(!hero||!host){if(attempt<240){requestAnimationFrame(()=>boot(attempt+1));return;}root.dataset.fxCoreMobileV68='hero-host-unavailable-v68';return;}
 document.querySelectorAll('.fx-core-mobile-v55-stage,.fx-core-reference-v53-stage,.fx-core-v51-stage,.fx-core-mesh3d-stage,.fx-core-fracture3d-stage,.fx-core-fidelity-v61').forEach(n=>n.remove());
 const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage';stage.dataset.active='true';stage.dataset.renderer='reference-v68';stage.setAttribute('aria-hidden','true');const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas';canvas.setAttribute('aria-hidden','true');stage.append(canvas);host.prepend(stage);
 let gl;try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance',desynchronized:true});}catch(e){stage.remove();root.dataset.fxCoreMobileV68='context-unavailable-v68';return;}if(!gl||gl.isContextLost()){stage.remove();root.dataset.fxCoreMobileV68='context-unavailable-v68';return;}
 const VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP;
uniform mat4 uM;
out vec3 vN;
out vec3 vP;
void main(){
 vec4 world=uM*vec4(aP,1.0);
 vP=world.xyz;
 vN=normalize(mat3(uM)*aN);
 gl_Position=uP*world;
}`;
 const FS=`#version 300 es
precision highp float;
in vec3 vN;
in vec3 vP;
uniform vec4 uColor;
uniform float uTime;
uniform float uEnergy;
uniform float uGlass;
out vec4 outColor;
void main(){
 vec3 N=normalize(vN);
 float fres=pow(1.0-abs(N.z),1.35);
 float lit=max(0.0,dot(N,normalize(vec3(-0.45,0.72,0.95))));
 float spec=pow(max(0.0,dot(N,normalize(vec3(-0.18,0.28,1.0)))),38.0);
 float wave=0.5+0.5*sin(atan(vP.y,vP.x)*8.0+length(vP.xy)*18.0-vP.z*17.0-uTime*0.22);
 vec3 rgb=uColor.rgb*(0.42+0.72*fres+0.16*lit)+vec3(0.75,0.96,1.0)*spec*0.35;
 rgb+=mix(vec3(0.02,0.34,0.95),vec3(0.58,0.08,0.90),wave)*0.10*uGlass;
 float alpha=uColor.a*(0.30+0.70*fres+0.08*lit)+spec*0.05;
 alpha*=1.0+uEnergy*0.10;
 outColor=vec4(rgb,clamp(alpha,0.0,1.0));
}`;
 const LVS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
uniform mat4 uP;
uniform mat4 uM;
uniform float uPoint;
void main(){gl_Position=uP*uM*vec4(aP,1.0);gl_PointSize=uPoint;}`;
 const LFS=`#version 300 es
precision highp float;
uniform vec4 uColor;
uniform float uSoft;
out vec4 outColor;
void main(){float a=uColor.a;if(uSoft>0.5){float d=length(gl_PointCoord-vec2(0.5));a*=smoothstep(0.5,0.03,d);}outColor=vec4(uColor.rgb,a);}`;
 let mp,lp;try{mp=program(gl,VS,FS,'v68 mesh');lp=program(gl,LVS,LFS,'v68 line');}catch(e){console.error(e);root.dataset.fxCoreMobileV68='shader-failed-v68';stage.remove();return;}
 const shells=[mesh(gl,shell()),mesh(gl,shell(136,17,.37)),mesh(gl,shell(124,16,.28)),mesh(gl,shell(112,15,.20))];
 const edges=[mesh(gl,edge(1,.07,.013)),mesh(gl,edge(.983,.085,.0065)),mesh(gl,edge(.94,.10,.0038))];
 const rails=[];for(let i=0;i<14;i++)rails.push(mesh(gl,rail(i/14*Math.PI*2,i*.63,i%4===0?.006:.004)));
 const rings=[mesh(gl,orbit(.19,.61,.02,-.06,.005)),mesh(gl,orbit(.28,.57,-.16,.10,.0048)),mesh(gl,orbit(.38,.50,.26,-.12,.0045)),mesh(gl,orbit(.49,.40,-.28,-.10,.004)),mesh(gl,orbit(.61,.26,.19,.23,.0035)),mesh(gl,orbit(.73,.11,-.12,.18,.0028))];
 const core=mesh(gl,sphere(.058,.63)),aura=mesh(gl,sphere(.135,.57)),fil=mesh(gl,filaments(),false),rib=mesh(gl,ribs(),false),pts=mesh(gl,particleField(290,false),false),halo=mesh(gl,particleField(330,true),false),waterM=mesh(gl,water(),false);
 const ML={P:gl.getUniformLocation(mp,'uP'),M:gl.getUniformLocation(mp,'uM'),C:gl.getUniformLocation(mp,'uColor'),T:gl.getUniformLocation(mp,'uTime'),E:gl.getUniformLocation(mp,'uEnergy'),G:gl.getUniformLocation(mp,'uGlass')};
 const LL={P:gl.getUniformLocation(lp,'uP'),M:gl.getUniformLocation(lp,'uM'),C:gl.getUniformLocation(lp,'uColor'),S:gl.getUniformLocation(lp,'uSoft'),Pt:gl.getUniformLocation(lp,'uPoint')};
 let width=0,height=0,dpr=1,visible=true,raf=0,last=performance.now(),energy=.22,target=.22,burst=0,drag=false,tx=0,ty=0,ix=0,iy=0;
 function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;dpr=Math.min(devicePixelRatio||1,1.85);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h;}width=r.width;height=r.height;gl.viewport(0,0,w,h);}
 new ResizeObserver(resize).observe(stage);resize();
 function proj(){const aspect=Math.max(.58,width/Math.max(1,height)),sy=1.58,sx=sy*aspect;return ortho(-sx,sx,-sy,sy,-5,5);}
 function drawMesh(o,M,color,glass,time){gl.useProgram(mp);gl.uniformMatrix4fv(ML.P,false,proj());gl.uniformMatrix4fv(ML.M,false,M);gl.uniform4fv(ML.C,color);gl.uniform1f(ML.T,time);gl.uniform1f(ML.E,energy+burst);gl.uniform1f(ML.G,glass);gl.bindVertexArray(o.vao);gl.drawArrays(gl.TRIANGLES,0,o.count);}
 function drawLine(o,M,color,mode=gl.LINES,size=1,soft=0){gl.useProgram(lp);gl.uniformMatrix4fv(LL.P,false,proj());gl.uniformMatrix4fv(LL.M,false,M);gl.uniform4fv(LL.C,color);gl.uniform1f(LL.Pt,size*dpr);gl.uniform1f(LL.S,soft);gl.bindVertexArray(o.vao);gl.drawArrays(mode,0,o.count);}
 function localPos(e){const r=hero.getBoundingClientRect();return[((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,((e.clientY-r.top)/Math.max(1,r.height)-.5)*2];}
 hero.addEventListener('pointerdown',e=>{const p=localPos(e);drag=true;tx=clamp(p[0],-1,1);ty=clamp(p[1],-1,1);target=1.05;burst=1.0;},{passive:true});
 hero.addEventListener('pointermove',e=>{if(!drag)return;const p=localPos(e);tx=clamp(p[0],-1,1);ty=clamp(p[1],-1,1);target=.92;},{passive:true});
 addEventListener('pointerup',()=>{if(!drag)return;drag=false;target=.30;burst=1.25;},{passive:true});
 addEventListener('formatx:coreinteraction',e=>{const d=e.detail||{};if(Number.isFinite(d.x))tx=clamp(d.x,-1,1);if(Number.isFinite(d.y))ty=clamp(d.y,-1,1);if(d.phase==='press'){target=1.05;burst=1.0;}else if(d.phase==='drag')target=.92;else if(d.phase==='burst'||d.phase==='press-sustain'){target=1.20;burst=1.30;}else if(d.phase==='release'||d.phase==='cancel')target=.30;},{passive:true});
 function frame(now){raf=0;if(!visible||!stage.isConnected||root.dataset.fxReferenceMotionPaused==='true')return;resize();const dt=Math.min(40,Math.max(0,now-last));last=now;const k=1-Math.pow(.002,dt/1000),slow=1-Math.pow(.05,dt/1000);ix+=(tx-ix)*k;iy+=(ty-iy)*k;energy+=(target-energy)*k;target+=(.22-target)*slow;burst*=Math.pow(.075,dt/1000);if(!drag){tx*=Math.pow(.18,dt/1000);ty*=Math.pow(.18,dt/1000);}const t=now*.001,motion=reduced.matches?.12:1,pulse=.5+.5*Math.sin(t*1.65),scalePulse=1+(.0015+.005*energy+.004*burst)*pulse;const M=C(tr(0,.02,.02),rx((-iy*.10+Math.sin(t*.13)*.004)*motion),ry((ix*.15+Math.cos(t*.11)*.006)*motion),rz(Math.sin(t*.09)*.002*motion),sc(1.08*scalePulse,.94*scalePulse,.98*scalePulse));gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.depthMask(false);gl.disable(gl.CULL_FACE);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);drawLine(halo,C(M,rz(-t*.010*motion)),[.03,.30,.84,.28],gl.POINTS,1.25,1);drawMesh(shells[0],M,[.04,.42,.98,.32],1,t);drawMesh(shells[1],C(M,ry(.055),rx(.026),sc(.982,.982,.982)),[.08,.72,1.0,.26],1,t+.8);drawMesh(shells[2],C(M,ry(-.065),rx(-.030),sc(.95,.95,.95)),[.55,.12,1.0,.18],1,t+1.6);drawMesh(shells[3],C(M,ry(.035),rx(-.045),sc(.91,.91,.91)),[.70,.92,1.0,.15],1,t+2.4);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);drawMesh(edges[0],M,[.04,.86,1.0,.64],0,t);drawMesh(edges[1],M,[.80,.98,1.0,.62],0,t);drawMesh(edges[2],M,[.62,.16,1.0,.40],0,t);rails.forEach((r,i)=>drawMesh(r,M,i%5===1?[.62,.12,1.0,.42]:[.05,.80,1.0,.48],0,t+i*.2));drawLine(rib,M,[.62,.98,1.0,.34]);drawLine(fil,M,[.10,.80,1.0,.44]);drawLine(fil,C(M,rz(.015),ry(.025)),[.65,.15,1.0,.23]);rings.forEach((r,i)=>drawMesh(r,C(M,rz((i%2?-1:1)*t*(.07+.012*i)*(1+energy*.55)*motion)),i===3?[.62,.10,1.0,.45]:[.04,.82,1.0,.52],0,t+i));drawMesh(aura,C(M,sc(1+energy*.035,1+energy*.035,1+energy*.035)),[.04,.78,1.0,.34],0,t);drawMesh(core,C(M,sc(1+energy*.16+burst*.10,1+energy*.16+burst*.10,1+energy*.16+burst*.10)),[.95,1.0,1.0,.98],0,t);if(burst>.025){const b=1.0+(1.25-burst)*.62;drawMesh(rings[2],C(M,sc(b,b,b)),[.75,.98,1.0,Math.min(.65,burst*.45)],0,t);}drawLine(pts,M,[.90,1.0,1.0,.74],gl.POINTS,2.0,1);drawLine(waterM,C(tr(0,-.01,-.20),M),[.03,.45,1.0,.25]);const R=C(tr(0,-2.48,-.24),sc(1,-.24,1),M);drawMesh(edges[0],R,[.02,.62,1.0,.12],0,t);drawLine(fil,R,[.05,.34,.88,.08]);gl.depthMask(true);raf=requestAnimationFrame(frame);}
 function start(){if(!raf&&visible&&stage.isConnected&&root.dataset.fxReferenceMotionPaused!=='true'){last=performance.now();raf=requestAnimationFrame(frame);}}
 addEventListener('formatx:referencepause',e=>{if(e.detail?.paused){if(raf){cancelAnimationFrame(raf);raf=0;}}else{target=Math.max(target,.55);burst=Math.max(burst,.55);start();}},{passive:true});
 if('IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible)start();else if(raf){cancelAnimationFrame(raf);raf=0;}},{rootMargin:'20% 0px',threshold:.01}).observe(hero);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();root.dataset.fxCoreMobileV68='context-lost-v68';if(raf){cancelAnimationFrame(raf);raf=0;}},{passive:false});
 root.dataset.fxCoreRenderer='single-webgl2-mobile-reference-grade-v68';root.dataset.fxCoreReferenceGeometry='reference-grade-organic-deep-concave-four-point-v68';root.dataset.fxCoreReferenceMaterial='four-layer-translucent-fresnel-crystal-glass-v68';root.dataset.fxCoreInternalReactor='small-white-cyan-reactor-six-orbitals-v68';root.dataset.fxCoreReferenceFidelity='native-webgl2-only-no-raster-no-svg-v68';root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';root.dataset.fxCoreAnimation='continuous-native-webgl2-living-motion-v68';root.dataset.fxCoreInteractionVisual='direct-touch-drag-burst-parallax-v68';root.dataset.fxCoreMobileV68=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v68';root.dataset.fxCoreReal3d='ready-v68';
 window.FormatXCoreMobileV68={version:'reference-grade-native-webgl2-v68',get energy(){return energy;},pulse(){target=1.2;burst=1.3;start();}};start();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});else boot();
}());
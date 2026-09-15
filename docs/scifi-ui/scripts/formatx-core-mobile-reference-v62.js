(function(){
'use strict';
const root=document.documentElement,READY='ready-v62',VERSION='pixel-reference-native-webgl2-v62';
if(root.dataset.fxCoreMobileV62===READY||root.dataset.fxCoreMobileV62==='booting-v62')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreMobileV62='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;}
if(typeof WebGL2RenderingContext==='undefined'){root.dataset.fxCoreMobileV62='webgl2-unavailable-v62';root.dataset.fxCoreMobileV55='webgl2-unavailable-v55';return;}
root.dataset.fxCoreMobileV62='booting-v62';root.dataset.fxCoreMobileV55='booting-v55';root.dataset.fxCoreRendererMode='mobile';
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
function qbez(a,k,b,u){const v=1-u;return[v*v*a[0]+2*v*u*k[0]+u*u*b[0],v*v*a[1]+2*v*u*k[1]+u*u*b[1]];}
function outlinePoint(t){
  const qtr=Math.PI/2,a=((t%(Math.PI*2))+Math.PI*2)%(Math.PI*2),q=Math.min(3,Math.floor(a/qtr)),u=(a-q*qtr)/qtr;
  const tips=[[1.315,0],[0,1.435],[-1.315,0],[0,-1.355],[1.315,0]];
  const controls=[[.37,.42],[-.37,.42],[-.365,-.405],[.365,-.405]];
  return qbez(tips[q],controls[q],tips[q+1],u);
}
function surfacePoint(t,u,side=1,zBias=0,depth=.31){
  const e=outlinePoint(t),rr=Math.pow(u,.79),lens=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.58);
  const diag=Math.pow(Math.abs(Math.sin(t*2)),1.18),ripple=1+.012*Math.cos(t*8)*(1-u)+.004*Math.cos(t*16+u*8);
  return[e[0]*rr*ripple,e[1]*rr*ripple,zBias+side*(.018*(1-u)+depth*lens*(1-.18*diag))];
}
function shellGeo(A=128,R=15,depth=.31){
  const d=[];
  function tri(a,b,c,flip=false){let n=normal(a,b,c);if(flip)n=[-n[0],-n[1],-n[2]];for(const p of[a,b,c])d.push(...p,...n);}
  function quad(a,b,c,e,flip=false){if(flip){tri(a,c,b,true);tri(a,e,c,true);}else{tri(a,b,c);tri(a,c,e);}}
  for(const side of[-1,1])for(let j=0;j<R;j++){
    const u0=j/R,u1=(j+1)/R;
    for(let i=0;i<A;i++){
      const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;
      quad(surfacePoint(t0,u0,side,0,depth),surfacePoint(t0,u1,side,0,depth),surfacePoint(t1,u1,side,0,depth),surfacePoint(t1,u0,side,0,depth),side<0);
    }
  }
  for(let i=0;i<A;i++){
    const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;
    quad(surfacePoint(t0,1,1,0,depth),surfacePoint(t0,1,-1,0,depth),surfacePoint(t1,1,-1,0,depth),surfacePoint(t1,1,1,0,depth));
  }
  return new Float32Array(d);
}
function ribbonOutline(width=.025,segments=160,z=.34){
  const d=[];
  for(let i=0;i<segments;i++){
    const t0=i/segments*Math.PI*2,t1=(i+1)/segments*Math.PI*2,a=outlinePoint(t0),b=outlinePoint(t1);
    const ra=Math.hypot(a[0],a[1])||1,rb=Math.hypot(b[0],b[1])||1;
    const ai=[a[0]*(1-width/ra),a[1]*(1-width/ra),z],ao=[a[0]*(1+width/ra),a[1]*(1+width/ra),z];
    const bi=[b[0]*(1-width/rb),b[1]*(1-width/rb),z],bo=[b[0]*(1+width/rb),b[1]*(1+width/rb),z];
    d.push(...ai,...ao,...bo,...ai,...bo,...bi);
  }
  return new Float32Array(d);
}
function lineSegments(points){const d=[];for(let i=0;i<points.length-1;i++)d.push(...points[i],...points[i+1]);return new Float32Array(d);}
function contour(u,segments=180,z=.345){const p=[];for(let i=0;i<=segments;i++)p.push(surfacePoint(i/segments*Math.PI*2,u,1,z-.31,.31));return lineSegments(p);}
function radialRibs(){
  const d=[];
  const anchors=[0,.125,.25,.375,.5,.625,.75,.875].map(v=>v*Math.PI*2);
  for(const t of anchors){let prev=null;for(let j=0;j<=28;j++){const u=.08+.90*j/28,q=surfacePoint(t+Math.sin(j*.43+t)*.012,u,1,.075,.31);if(prev)d.push(...prev,...q);prev=q;}}
  for(let k=0;k<12;k++){const base=k/12*Math.PI*2;let prev=null;for(let j=0;j<=22;j++){const u=.12+.80*j/22,q=surfacePoint(base+Math.sin(j*.58+k)*(.018+.035*u),u,1,.09+.015*Math.sin(j*.5+k),.31);if(prev)d.push(...prev,...q);prev=q;}}
  return new Float32Array(d);
}
function ring(rad,segments=144,z=.39){const p=[];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;p.push([Math.cos(a)*rad,Math.sin(a)*rad,z]);}return lineSegments(p);}
function arc(rad,start,len,segments=96,z=.40){const p=[];for(let i=0;i<=segments;i++){const a=start+len*i/segments;p.push([Math.cos(a)*rad,Math.sin(a)*rad,z]);}return lineSegments(p);}
function torus(R=.42,r=.012,segR=96,segr=10){const d=[];for(let i=0;i<segR;i++){const a0=i/segR*Math.PI*2,a1=(i+1)/segR*Math.PI*2;for(let j=0;j<segr;j++){const b0=j/segr*Math.PI*2,b1=(j+1)/segr*Math.PI*2;const P=(a,b)=>{const rr=R+r*Math.cos(b);return[rr*Math.cos(a),rr*Math.sin(a),.39+r*Math.sin(b)];};const p00=P(a0,b0),p01=P(a0,b1),p11=P(a1,b1),p10=P(a1,b0);for(const tri of[[p00,p01,p11],[p00,p11,p10]]){const n=normal(...tri);for(const p of tri)d.push(...p,...n);}}}return new Float32Array(d);}
function sphere(rad=.105,lat=18,lon=28){const d=[];const P=(a,b)=>[rad*Math.sin(a)*Math.cos(b),rad*Math.cos(a),.48+rad*Math.sin(a)*Math.sin(b)];for(let i=0;i<lat;i++){const a0=i/lat*Math.PI,a1=(i+1)/lat*Math.PI;for(let j=0;j<lon;j++){const b0=j/lon*Math.PI*2,b1=(j+1)/lon*Math.PI*2,p00=P(a0,b0),p01=P(a0,b1),p11=P(a1,b1),p10=P(a1,b0);for(const tri of[[p00,p01,p11],[p00,p11,p10]])for(const p of tri){const n=[p[0]/rad,p[1]/rad,(p[2]-.48)/rad];d.push(...p,...n);}}}return new Float32Array(d);}
function tipPoints(){const d=[];for(const t of[0,Math.PI/2,Math.PI,Math.PI*1.5]){const p=surfacePoint(t,1,1,.12,.31);d.push(...p);}return new Float32Array(d);}
function particles(count=70){let s=0x81f2a5d3;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296),d=[];for(let i=0;i<count;i++){const a=rnd()*Math.PI*2,u=.25+rnd()*.68,p=surfacePoint(a,u,1,.12+rnd()*.09,.31);d.push(p[0],p[1],p[2]);}return new Float32Array(d);}
function compile(gl,type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh)||'shader compile');return sh;}
function program(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link');return p;}
function mesh(gl,data,withNormal=true){const vao=gl.createVertexArray(),buf=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);if(withNormal){gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);return{vao,count:data.length/6};}gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);return{vao,count:data.length/3};}
function boot(attempt=0){
  if(!document.body){requestAnimationFrame(()=>boot(attempt));return;}
  const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
  if(!hero||!host){if(attempt<240){requestAnimationFrame(()=>boot(attempt+1));return;}root.dataset.fxCoreMobileV62='hero-host-unavailable-v62';return;}
  document.querySelectorAll('.fx-core-mobile-v55-stage,.fx-core-reference-v53-stage,.fx-core-v51-stage,.fx-core-mesh3d-stage,.fx-core-fracture3d-stage').forEach(n=>n.remove());
  const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage';stage.dataset.active='true';stage.dataset.renderer='reference-v62';stage.setAttribute('aria-hidden','true');
  const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas';canvas.setAttribute('aria-hidden','true');stage.append(canvas);host.prepend(stage);
  let gl;try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance',desynchronized:true});}catch(e){stage.remove();root.dataset.fxCoreMobileV62='context-unavailable-v62';return;}
  if(!gl||gl.isContextLost()){stage.remove();root.dataset.fxCoreMobileV62='context-unavailable-v62';return;}
  const VS=`#version 300 es\nprecision highp float;layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;uniform mat4 uP,uM;uniform float uT,uEnergy;out vec3 vP,vN;void main(){vec3 p=aP;float a=atan(p.y,p.x),r=length(p.xy);float breathe=1.0+sin(uT*.72+a*4.0+r*7.0)*(.0012+.0022*uEnergy);p.xy*=breathe;p.z*=1.0+sin(uT*.43+a*3.0)*(.004+.007*uEnergy);vec4 w=uM*vec4(p,1.0);vP=p;vN=normalize(transpose(inverse(mat3(uM)))*aN);gl_Position=uP*w;}`;
  const FS=`#version 300 es\nprecision highp float;in vec3 vP,vN;uniform float uT,uAlpha,uEnergy,uPhase;out vec4 O;float sat(float x){return clamp(x,0.0,1.0);}void main(){vec3 N=normalize(vN),V=vec3(0,0,1),L1=normalize(vec3(-.45,.72,1)),L2=normalize(vec3(.72,-.18,.83));float fres=pow(1.0-abs(dot(N,V)),.78),d1=sat(dot(N,L1)),d2=sat(dot(N,L2)),spec=pow(sat(dot(N,normalize(L1+V))),54.0),a=atan(vP.y,vP.x),r=length(vP.xy);float wave=.5+.5*cos(a*8.0+r*20.0-vP.z*18.0-uT*.38+uPhase),vio=.5+.5*cos(a*5.0-r*14.0+vP.z*20.0+uT*.22-uPhase);vec3 cyan=vec3(.06,1.08,1.55),ice=vec3(1.0,1.08,1.12),blue=vec3(.02,.23,.92),purple=vec3(.72,.12,1.28);vec3 col=blue*(.05+.08*d2)+cyan*(.08+.46*fres+.10*d1+.20*smoothstep(.84,1.0,wave))+purple*(.02+.15*smoothstep(.88,1.0,vio))+ice*(.035+.24*spec);float alpha=uAlpha*(.22+.58*fres+.10*d1+.13*spec);O=vec4(col,alpha);}`;
  const LVS=`#version 300 es\nprecision highp float;layout(location=0)in vec3 aP;uniform mat4 uP,uM;uniform float uPoint;void main(){gl_Position=uP*uM*vec4(aP,1.0);gl_PointSize=uPoint;}`;
  const LFS=`#version 300 es\nprecision highp float;uniform vec4 uColor;uniform float uSoft;out vec4 O;void main(){float a=uColor.a;if(uSoft>0.5){vec2 q=gl_PointCoord-.5;float d=length(q);a*=smoothstep(.5,.06,d);}O=vec4(uColor.rgb,a);}`;
  const shellP=program(gl,VS,FS),lineP=program(gl,LVS,LFS);
  const sh=mesh(gl,shellGeo()),inner=mesh(gl,shellGeo(112,13,.235)),rail=mesh(gl,ribbonOutline(),false),tor=mesh(gl,torus()),core=mesh(gl,sphere());
  const rib=mesh(gl,radialRibs(),false),c42=mesh(gl,contour(.42),false),c58=mesh(gl,contour(.58),false),c73=mesh(gl,contour(.73),false),tips=mesh(gl,tipPoints(),false),pts=mesh(gl,particles(),false);
  const rings=[.23,.31,.40,.49,.59].map(r=>mesh(gl,ring(r),false));
  const arcs=[mesh(gl,arc(.68,.15,1.85),false),mesh(gl,arc(.76,2.05,1.42),false),mesh(gl,arc(.84,3.75,1.18),false)];
  const loc={
    sp:{P:gl.getUniformLocation(shellP,'uP'),M:gl.getUniformLocation(shellP,'uM'),T:gl.getUniformLocation(shellP,'uT'),E:gl.getUniformLocation(shellP,'uEnergy'),A:gl.getUniformLocation(shellP,'uAlpha'),Ph:gl.getUniformLocation(shellP,'uPhase')},
    lp:{P:gl.getUniformLocation(lineP,'uP'),M:gl.getUniformLocation(lineP,'uM'),C:gl.getUniformLocation(lineP,'uColor'),S:gl.getUniformLocation(lineP,'uSoft'),Pt:gl.getUniformLocation(lineP,'uPoint')}
  };
  let width=0,height=0,dpr=1,visible=true,raf=0,last=performance.now(),energy=.18,targetEnergy=.18,ix=0,iy=0,tx=0,ty=0,burst=0;
  function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;dpr=Math.min(devicePixelRatio||1,1.8);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h;}width=r.width;height=r.height;gl.viewport(0,0,w,h);}
  const ro=new ResizeObserver(resize);ro.observe(stage);resize();
  function projection(){const aspect=Math.max(.55,width/Math.max(1,height));const sy=1.66,sx=sy*aspect;return ortho(-sx,sx,-sy,sy,-5,5);}
  function drawShell(obj,M,alpha,phase,energyValue){gl.useProgram(shellP);gl.uniformMatrix4fv(loc.sp.P,false,projection());gl.uniformMatrix4fv(loc.sp.M,false,M);gl.uniform1f(loc.sp.T,performance.now()/1000);gl.uniform1f(loc.sp.E,energyValue);gl.uniform1f(loc.sp.A,alpha);gl.uniform1f(loc.sp.Ph,phase);gl.bindVertexArray(obj.vao);gl.drawArrays(gl.TRIANGLES,0,obj.count);}
  function drawLine(obj,M,color,mode=gl.LINES,point=1,soft=0){gl.useProgram(lineP);gl.uniformMatrix4fv(loc.lp.P,false,projection());gl.uniformMatrix4fv(loc.lp.M,false,M);gl.uniform4fv(loc.lp.C,color);gl.uniform1f(loc.lp.Pt,point*dpr);gl.uniform1f(loc.lp.S,soft);gl.bindVertexArray(obj.vao);gl.drawArrays(mode,0,obj.count);}
  function interaction(e){const d=e.detail||{};if(Number.isFinite(d.x))tx=clamp(d.x,-1,1);if(Number.isFinite(d.y))ty=clamp(d.y,-1,1);if(d.phase==='press'){targetEnergy=1;burst=1;}else if(d.phase==='drag'){targetEnergy=Math.max(targetEnergy,.82);}else if(d.phase==='burst'||d.phase==='press-sustain'){targetEnergy=1.18;burst=1.2;}else if(d.phase==='hover'){targetEnergy=Math.max(targetEnergy,.38);}else if(d.phase==='release'||d.phase==='cancel'){targetEnergy=.26;tx*=.45;ty*=.45;}}
  addEventListener('formatx:coreinteraction',interaction,{passive:true});
  function frame(now){raf=0;if(!visible||!stage.isConnected)return;resize();const dt=Math.min(40,Math.max(0,now-last));last=now;const lerp=1-Math.pow(.002,dt/1000),slow=1-Math.pow(.045,dt/1000);ix+=(tx-ix)*lerp;iy+=(ty-iy)*lerp;energy+=(targetEnergy-energy)*lerp;targetEnergy+=(.18-targetEnergy)*slow;burst*=Math.pow(.08,dt/1000);tx*=Math.pow(.16,dt/1000);ty*=Math.pow(.16,dt/1000);const t=now*.001,motion=reduced.matches?.18:1,pulse=.5+.5*Math.sin(t*1.85),sx=1+(.004+.010*energy+.008*burst)*pulse;const M=C(tr(0,-.015,0),rx((-iy*.075+Math.sin(t*.17)*.006)*motion),ry((ix*.11+Math.cos(t*.14)*.009)*motion),rz(Math.sin(t*.12)*.003*motion),sc(sx,sx,sx));
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.disable(gl.CULL_FACE);
    drawShell(sh,M,.40,0,energy);drawShell(inner,C(M,sc(.968,.968,.968)),.20,1.7,energy*.75);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);drawLine(rail,M,[.42,.96,1.0,.76],gl.TRIANGLES);drawLine(rib,M,[.34,.91,1.0,.34]);drawLine(c42,M,[.78,.95,1.0,.24]);drawLine(c58,M,[.18,.80,1.0,.25]);drawLine(c73,M,[.75,.34,1.0,.20]);
    const ringM=C(M,rz(t*(.07+.05*energy)*motion));rings.forEach((r,i)=>drawLine(r,ringM,i===3?[.76,.28,1.0,.27]:[.20,.88,1.0,.28]));arcs.forEach((a,i)=>drawLine(a,C(M,rz((i%2?-1:1)*t*(.13+.03*i)*motion)),i===1?[.73,.27,1,.24]:[.18,.81,1,.22]));drawShell(tor,C(M,rx(.68),rz(t*.20*motion)),.22,2.3,energy);
    drawShell(core,C(M,sc(1+energy*.06+burst*.04,1+energy*.06+burst*.04,1+energy*.06+burst*.04)),.92,4.1,energy+burst);
    drawLine(pts,M,[.78,.96,1.0,.56],gl.POINTS,2.2,1);drawLine(tips,M,[1,1,1,.92],gl.POINTS,5.2,1);
    gl.depthMask(true);raf=requestAnimationFrame(frame);
  }
  function start(){if(!raf&&visible&&stage.isConnected){last=performance.now();raf=requestAnimationFrame(frame);}}
  if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible)start();else if(raf){cancelAnimationFrame(raf);raf=0;}},{rootMargin:'20% 0px',threshold:.01});io.observe(hero);}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();root.dataset.fxCoreMobileV62='context-lost-v62';if(raf){cancelAnimationFrame(raf);raf=0;}},{passive:false});
  root.dataset.fxCoreRenderer='single-webgl2-mobile-pixel-reference-v62';root.dataset.fxCoreReferenceGeometry='pixel-locked-organic-concave-four-point-v62';root.dataset.fxCoreReferenceMaterial='multishell-refractive-crystal-glass-v62';root.dataset.fxCoreInternalReactor='white-cyan-spherical-reactor-orbital-rings-v62';root.dataset.fxCoreReferenceFidelity='native-webgl2-no-overlay-v62';root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';root.dataset.fxCoreMobileV62=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v62';root.dataset.fxCoreReal3d='ready-v62';root.dataset.fxCoreAnimation='continuous-native-webgl2-living-motion-v62';root.dataset.fxCoreInteractionVisual='touch-drag-energy-parallax-v62';
  window.FormatXCoreMobileV62={version:VERSION,get energy(){return energy;},pulse(){targetEnergy=1.15;burst=1.1;start();}};
  start();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});else boot();
}());
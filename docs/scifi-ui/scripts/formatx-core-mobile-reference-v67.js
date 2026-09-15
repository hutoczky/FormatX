(function(){
'use strict';
const root=document.documentElement,READY='ready-v67',VERSION='reference-locked-native-webgl2-v67';
if(root.dataset.fxCoreMobileV67===READY||root.dataset.fxCoreMobileV67==='booting-v67')return;
if(new URLSearchParams(location.search).get('lighthouse')==='1'){root.dataset.fxCoreMobileV67='audit-skip';root.dataset.fxCoreMobileV55='audit-skip';return;}
if(typeof WebGL2RenderingContext==='undefined'){root.dataset.fxCoreMobileV67='webgl2-unavailable-v67';root.dataset.fxCoreMobileV55='webgl2-unavailable-v55';return;}
root.dataset.fxCoreMobileV67='booting-v67';root.dataset.fxCoreMobileV55='booting-v55';root.dataset.fxCoreRendererMode='mobile';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[r+c*4]=a[r]*b[c*4]+a[r+4]*b[c*4+1]+a[r+8]*b[c*4+2]+a[r+12]*b[c*4+3];return o;}
const C=(...m)=>m.reduce((a,b)=>mul(a,b),I());
function tr(x,y,z){const o=I();o[12]=x;o[13]=y;o[14]=z;return o}
function sc(x,y,z){const o=I();o[0]=x;o[5]=y;o[10]=z;return o}
function rx(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o}
function ry(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o}
function rz(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o}
function ortho(l,r,b,t,n,f){const o=I();o[0]=2/(r-l);o[5]=2/(t-b);o[10]=-2/(f-n);o[12]=-(r+l)/(r-l);o[13]=-(t+b)/(t-b);o[14]=-(f+n)/(f-n);return o}
function norm(v){const l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l]}
function normal(a,b,c){const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];return norm([u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]])}
function bez(a,k,b,u){const v=1-u;return[v*v*a[0]+2*v*u*k[0]+u*u*b[0],v*v*a[1]+2*v*u*k[1]+u*u*b[1]]}
function outline(t){
 const qtr=Math.PI/2,a=((t%(Math.PI*2))+Math.PI*2)%(Math.PI*2),q=Math.min(3,Math.floor(a/qtr)),u=(a-q*qtr)/qtr;
 const tips=[[1.31,0],[0,1.50],[-1.31,0],[0,-1.40],[1.31,0]],ctrl=[[.115,.265],[-.115,.265],[-.125,-.255],[.125,-.255]];
 return bez(tips[q],ctrl[q],tips[q+1],u);
}
function surf(t,u,side=1,zBias=0,depth=.50){
 const e=outline(t),rr=Math.pow(u,.745),lens=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.43);
 const organic=1+.013*Math.cos(t*8)*(1-u)+.006*Math.sin(t*12+u*9),pinch=1-.052*Math.pow(Math.abs(Math.sin(t*2)),1.35)*(1-u);
 return[e[0]*rr*organic*pinch,e[1]*rr*organic*pinch,zBias+side*(.024*(1-u)+depth*lens*(.91+.09*Math.cos(t*4)))];
}
function shell(A=164,R=21,depth=.50){
 const d=[];function tri(a,b,c,flip=false){let n=normal(a,b,c);if(flip)n=[-n[0],-n[1],-n[2]];for(const p of[a,b,c])d.push(...p,...n)}
 function quad(a,b,c,e,flip=false){if(flip){tri(a,c,b,true);tri(a,e,c,true)}else{tri(a,b,c);tri(a,c,e)}}
 for(const side of[-1,1])for(let j=0;j<R;j++){const u0=j/R,u1=(j+1)/R;for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(surf(t0,u0,side,0,depth),surf(t0,u1,side,0,depth),surf(t1,u1,side,0,depth),surf(t1,u0,side,0,depth),side<0)}}
 for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(surf(t0,1,1,0,depth),surf(t0,1,-1,0,depth),surf(t1,1,-1,0,depth),surf(t1,1,1,0,depth))}
 return new Float32Array(d);
}
function tube(fn,segments=156,sides=8,r=.009){
 const d=[],rings=[];for(let i=0;i<=segments;i++){const u=i/segments,p=fn(u),pm=fn(Math.max(0,u-1/segments)),pp=fn(Math.min(1,u+1/segments)),T=norm([pp[0]-pm[0],pp[1]-pm[1],pp[2]-pm[2]]),B1=norm([-T[1],T[0],.04]),B2=norm([T[1]*B1[2]-T[2]*B1[1],T[2]*B1[0]-T[0]*B1[2],T[0]*B1[1]-T[1]*B1[0]]),ring=[];
  for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2,c=Math.cos(a),s=Math.sin(a),n=norm([B1[0]*c+B2[0]*s,B1[1]*c+B2[1]*s,B1[2]*c+B2[2]*s]);ring.push({p:[p[0]+n[0]*r,p[1]+n[1]*r,p[2]+n[2]*r],n})}rings.push(ring)}
 for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const k=(j+1)%sides,a=rings[i][j],b=rings[i+1][j],c=rings[i+1][k],e=rings[i][k];for(const q of[[a,b,c],[a,c,e]])for(const v of q)d.push(...v.p,...v.n)}
 return new Float32Array(d);
}
const edge=(scale=1,z=.07,r=.009)=>tube(u=>{const p=outline(u*Math.PI*2);return[p[0]*scale,p[1]*scale,z+.016*Math.sin(u*Math.PI*8)]},190,8,r);
const rail=(angle,phase=0,r=.0045)=>tube(u=>{const q=.045+.94*u,p=surf(angle+.020*Math.sin(u*Math.PI*3+phase),q,1,.16+.024*Math.sin(u*Math.PI*4+phase),.50);return p},94,7,r);
const orbit=(rad,z,tx,ty,r=.004,start=0,len=Math.PI*2)=>tube(u=>{const a=start+len*u,x=Math.cos(a)*rad,y=Math.sin(a)*rad,z0=z,cx=Math.cos(tx),sx=Math.sin(tx),cy=Math.cos(ty),sy=Math.sin(ty);let yy=y*cx-z0*sx,zz=y*sx+z0*cx,xx=x*cy+zz*sy;zz=-x*sy+zz*cy;return[xx,yy,zz]},Math.max(42,Math.round(125*len/(Math.PI*2))),7,r);
function sphere(rad=.060,z=.61,lat=20,lon=30){const d=[],P=(a,b)=>[rad*Math.sin(a)*Math.cos(b),rad*Math.cos(a),z+rad*Math.sin(a)*Math.sin(b)];for(let i=0;i<lat;i++){const a0=i/lat*Math.PI,a1=(i+1)/lat*Math.PI;for(let j=0;j<lon;j++){const b0=j/lon*Math.PI*2,b1=(j+1)/lon*Math.PI*2,p00=P(a0,b0),p01=P(a0,b1),p11=P(a1,b1),p10=P(a1,b0);for(const q of[[p00,p01,p11],[p00,p11,p10]])for(const p of q){const n=norm([p[0],p[1],p[2]-z]);d.push(...p,...n)}}}return new Float32Array(d)}
function filamentField(count=78){const d=[];for(let k=0;k<count;k++){const a=k/count*Math.PI*2+.06*Math.sin(k*1.7);let prev=null;for(let j=0;j<=44;j++){const u=.05+.91*j/44,tw=.025*Math.sin(j*.40+k*1.03)+.010*Math.sin(j*.83-k*.59),p=surf(a+tw,u,1,.15+.055*Math.sin(j*.15+k*.56),.50);if(prev)d.push(...prev,...p);prev=p}}return new Float32Array(d)}
function ribs(count=24){const d=[];for(let k=0;k<count;k++){const a=k/count*Math.PI*2;let prev=null;for(let j=0;j<=34;j++){const u=.05+.92*j/34,p=surf(a+.007*Math.sin(j*.42+k),u,1,.13,.50);if(prev)d.push(...prev,...p);prev=p}}return new Float32Array(d)}
function points(count=300,halo=false){let s=halo?0x2147b3d1:0x91e2a7c3;const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296),d=[];for(let i=0;i<count;i++){if(halo){const a=rnd()*Math.PI*2,r=.62+rnd()*.82;d.push(Math.cos(a)*r,Math.sin(a)*r*.92,-.08+rnd()*.18)}else{const a=rnd()*Math.PI*2,u=.08+rnd()*.86,p=surf(a,u,1,.14+rnd()*.22,.50);d.push(...p)}}return new Float32Array(d)}
function water(){let s=0x75ab41d5;const rnd=()=>((s=(Math.imul(s,1103515245)+12345)>>>0)/4294967296),d=[];for(let j=0;j<42;j++){const y=-1.04-j*.014;for(let i=0;i<34;i++){const x=-1.45+rnd()*2.9,len=.018+rnd()*.16,yy=y+(rnd()-.5)*.040,z=-.24+.018*Math.sin(x*11+j*.73);d.push(x,yy,z,x+len,yy+(rnd()-.5)*.018,z+(rnd()-.5)*.012)}}return new Float32Array(d)}
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader compile');return s}
function program(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program link');return p}
function mesh(gl,data,normals=true){const vao=gl.createVertexArray(),buf=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);if(normals){gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);return{vao,count:data.length/6}}gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);return{vao,count:data.length/3}}

function boot(attempt=0){
 if(!document.body){requestAnimationFrame(()=>boot(attempt));return}
 const hero=document.getElementById('hero'),host=hero&&hero.querySelector('.hero-space');
 if(!hero||!host){if(attempt<240){requestAnimationFrame(()=>boot(attempt+1));return}root.dataset.fxCoreMobileV67='hero-host-unavailable-v67';return}
 document.querySelectorAll('.fx-core-mobile-v55-stage,.fx-core-reference-v53-stage,.fx-core-v51-stage,.fx-core-mesh3d-stage,.fx-core-fracture3d-stage,.fx-core-fidelity-v61').forEach(n=>n.remove());
 const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage';stage.dataset.active='true';stage.dataset.renderer='reference-v67';stage.setAttribute('aria-hidden','true');
 const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas';canvas.setAttribute('aria-hidden','true');stage.append(canvas);host.prepend(stage);
 let gl;try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'high-performance',desynchronized:true})}catch(e){stage.remove();root.dataset.fxCoreMobileV67='context-unavailable-v67';return}
 if(!gl||gl.isContextLost()){stage.remove();root.dataset.fxCoreMobileV67='context-unavailable-v67';return}

 const VS=`#version 300 es
 precision highp float;layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;uniform mat4 uP,uM;uniform float uT,uE;out vec3 vP,vN;
 void main(){vec3 p=aP;float a=atan(p.y,p.x),r=length(p.xy);p.xy*=1.0+sin(uT*.42+a*4.0+r*8.0)*(.0007+.0018*uE);p.z*=1.0+sin(uT*.25+a*3.0)*(.002+.004*uE);vP=p;vN=normalize(transpose(inverse(mat3(uM)))*aN;gl_Position=uP*uM*vec4(p,1.0);}`;
 const FS=`#version 300 es
 precision highp float;in vec3 vP,vN;uniform float uT,uA,uE,uPhase,uKind;uniform vec3 uTint;out vec4 O;
 float sat(float x){return clamp(x,0.0,1.0);}
 void main(){vec3 N=normalize(vN),V=vec3(0,0,1),L1=normalize(vec3(-.52,.78,1)),L2=normalize(vec3(.70,-.18,.92));
 float f=pow(1.0-abs(dot(N,V)),.50),d1=sat(dot(N,L1)),d2=sat(dot(N,L2)),sp=pow(sat(dot(N,normalize(L1+V))),66.0),a=atan(vP.y,vP.x),r=length(vP.xy);
 float w=.5+.5*cos(a*8.0+r*24.0-vP.z*19.0-uT*.18+uPhase),v=.5+.5*cos(a*5.0-r*17.0+vP.z*24.0+uT*.11-uPhase);
 vec3 ice=vec3(1.04,1.08,1.10),cyan=vec3(.02,.84,1.22),vio=vec3(.61,.12,1.00),blue=vec3(.005,.08,.30);
 if(uKind<.5){vec3 col=blue*(.06+.04*d2)+cyan*(.10+.42*f+.06*d1+.13*smoothstep(.82,1.0,w))+vio*(.03+.12*smoothstep(.84,1.0,v))+ice*(.008+.13*sp);float al=uA*(.16+.39*f+.05*d1+.07*sp);O=vec4(col,al);}
 else{vec3 col=uTint*(.92+.25*f)+ice*(.035+.18*sp);float al=uA*(.42+.46*f+.12*sp);O=vec4(col,al);}}`;
 const LVS=`#version 300 es
 precision highp float;layout(location=0)in vec3 aP;uniform mat4 uP,uM;uniform float uPoint;void main(){gl_Position=uP*uM*vec4(aP,1.0);gl_PointSize=uPoint;}`;
 const LFS=`#version 300 es
 precision highp float;uniform vec4 uColor;uniform float uSoft;out vec4 O;void main(){float a=uColor.a;if(uSoft>.5){float d=length(gl_PointCoord-.5);a*=smoothstep(.5,.025,d);}O=vec4(uColor.rgb,a);}`;
 const mp=program(gl,VS,FS),lp=program(gl,LVS,LFS);

 const shells=[mesh(gl,shell()),mesh(gl,shell(148,19,.39)),mesh(gl,shell(136,17,.31)),mesh(gl,shell(124,16,.23))];
 const edges=[mesh(gl,edge(1,.075,.014)),mesh(gl,edge(.982,.09,.007)),mesh(gl,edge(.94,.10,.004))];
 const rails=[];for(let i=0;i<16;i++)rails.push(mesh(gl,rail(i/16*Math.PI*2,i*.57,i%4===0?.0065:.0042)));
 const orbits=[mesh(gl,orbit(.18,.62,.02,-.05,.005)),mesh(gl,orbit(.27,.58,-.15,.10,.005)),mesh(gl,orbit(.37,.52,.25,-.12,.0045)),mesh(gl,orbit(.49,.42,-.28,-.10,.004)),mesh(gl,orbit(.61,.28,.20,.24,.0035)),mesh(gl,orbit(.74,.12,-.12,.18,.0027))];
 const arcs=[mesh(gl,orbit(.42,.48,.31,.02,.0045,.12,1.65)),mesh(gl,orbit(.54,.37,-.20,.20,.004,2.0,1.28)),mesh(gl,orbit(.67,.19,.14,-.25,.003,3.75,1.05))];
 const core=mesh(gl,sphere(.060,.63)),aura=mesh(gl,sphere(.125,.57,18,28)),fil=mesh(gl,filamentField(),false),ribsM=mesh(gl,ribs(),false),pts=mesh(gl,points(300,false),false),halo=mesh(gl,points(360,true),false),waterM=mesh(gl,water(),false);
 const lm={P:gl.getUniformLocation(mp,'uP'),M:gl.getUniformLocation(mp,'uM'),T:gl.getUniformLocation(mp,'uT'),E:gl.getUniformLocation(mp,'uE'),A:gl.getUniformLocation(mp,'uA'),Ph:gl.getUniformLocation(mp,'uPhase'),K:gl.getUniformLocation(mp,'uKind'),Ti:gl.getUniformLocation(mp,'uTint')};
 const ll={P:gl.getUniformLocation(lp,'uP'),M:gl.getUniformLocation(lp,'uM'),C:gl.getUniformLocation(lp,'uColor'),S:gl.getUniformLocation(lp,'uSoft'),Pt:gl.getUniformLocation(lp,'uPoint')};

 let width=0,height=0,dpr=1,visible=true,raf=0,last=performance.now(),energy=.24,targetEnergy=.24,ix=0,iy=0,tx=0,ty=0,burst=0,dragging=false;
 function resize(){const r=stage.getBoundingClientRect();if(r.width<2||r.height<2)return;dpr=Math.min(devicePixelRatio||1,1.9);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h}width=r.width;height=r.height;gl.viewport(0,0,w,h)}
 new ResizeObserver(resize).observe(stage);resize();
 function proj(){const aspect=Math.max(.55,width/Math.max(1,height)),sy=1.51,sx=sy*aspect;return ortho(-sx,sx,-sy,sy,-5,5)}
 function drawMesh(o,M,a,phase,e,kind,tint){gl.useProgram(mp);gl.uniformMatrix4fv(lm.P,false,proj());gl.uniformMatrix4fv(lm.M,false,M);gl.uniform1f(lm.T,performance.now()/1000);gl.uniform1f(lm.E,e);gl.uniform1f(lm.A,a);gl.uniform1f(lm.Ph,phase);gl.uniform1f(lm.K,kind);gl.uniform3fv(lm.Ti,tint);gl.bindVertexArray(o.vao);gl.drawArrays(gl.TRIANGLES,0,o.count)}
 function drawLine(o,M,c,mode=gl.LINES,p=1,soft=0){gl.useProgram(lp);gl.uniformMatrix4fv(ll.P,false,proj());gl.uniformMatrix4fv(ll.M,false,M);gl.uniform4fv(ll.C,c);gl.uniform1f(ll.Pt,p*dpr);gl.uniform1f(ll.S,soft);gl.bindVertexArray(o.vao);gl.drawArrays(mode,0,o.count)}
 function applyInteraction(x,y,kind){tx=clamp(x,-1,1);ty=clamp(y,-1,1);if(kind==='down'){dragging=true;targetEnergy=1.05;burst=1.0}else if(kind==='move'&&dragging){targetEnergy=Math.max(targetEnergy,.90)}else if(kind==='up'){dragging=false;targetEnergy=.32;burst=Math.max(burst,1.25)}}
 function pos(ev){const r=hero.getBoundingClientRect();return[((ev.clientX-r.left)/r.width-.5)*2,((ev.clientY-r.top)/r.height-.5)*2]}
 hero.addEventListener('pointerdown',e=>{const p=pos(e);applyInteraction(p[0],p[1],'down')},{passive:true});
 hero.addEventListener('pointermove',e=>{if(!dragging)return;const p=pos(e);applyInteraction(p[0],p[1],'move')},{passive:true});
 addEventListener('pointerup',()=>applyInteraction(tx,ty,'up'),{passive:true});
 addEventListener('formatx:coreinteraction',e=>{const d=e.detail||{};if(Number.isFinite(d.x))tx=clamp(d.x,-1,1);if(Number.isFinite(d.y))ty=clamp(d.y,-1,1);if(d.phase==='press'){targetEnergy=1.05;burst=1}else if(d.phase==='drag')targetEnergy=Math.max(targetEnergy,.90);else if(d.phase==='burst'||d.phase==='press-sustain'){targetEnergy=1.25;burst=1.35}else if(d.phase==='release'||d.phase==='cancel'){targetEnergy=.32}},{passive:true});

 function frame(now){
  raf=0;if(!visible||!stage.isConnected)return;resize();
  const dt=Math.min(40,Math.max(0,now-last));last=now;const k=1-Math.pow(.002,dt/1000),slow=1-Math.pow(.05,dt/1000);
  ix+=(tx-ix)*k;iy+=(ty-iy)*k;energy+=(targetEnergy-energy)*k;targetEnergy+=(.24-targetEnergy)*slow;burst*=Math.pow(.07,dt/1000);if(!dragging){tx*=Math.pow(.20,dt/1000);ty*=Math.pow(.20,dt/1000)}
  const t=now*.001,motion=reduced.matches?.12:1,pulse=.5+.5*Math.sin(t*1.64),s=1+(.0015+.0065*energy+.005*burst)*pulse;
  const M=C(tr(0,.04,.02),rx((-iy*.075+Math.sin(t*.13)*.004)*motion),ry((ix*.105+Math.cos(t*.11)*.006)*motion),rz(Math.sin(t*.09)*.0022*motion),sc(.955*s,1.00*s,.96*s));
  const CY=[.03,.82,1.14],VI=[.59,.12,1.0],ICE=[.86,1.0,1.0];
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.depthMask(false);gl.disable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  drawLine(halo,C(M,rz(-t*.012*motion)),[.04,.32,.86,.32],gl.POINTS,1.35,1);
  drawMesh(shells[0],M,1.0,.1,energy,0,CY);
  drawMesh(shells[1],C(M,ry(.060),rx(.030),sc(.982,.982,.982)),.90,1.6,energy*.82,0,VI);
  drawMesh(shells[2],C(M,ry(-.070),rx(-.030),sc(.95,.95,.95)),.82,3.0,energy*.72,0,CY);
  drawMesh(shells[3],C(M,ry(.035),rx(-.050),sc(.915,.915,.915)),.66,4.5,energy*.58,0,ICE);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
  drawMesh(edges[0],M,.72,.2,energy,1,CY);drawMesh(edges[1],M,.76,1.8,energy,1,ICE);drawMesh(edges[2],M,.46,3.2,energy,1,VI);
  rails.forEach((r,i)=>drawMesh(r,M,i%4===0?.78:.48,.7+i*.31,energy,1,i%5===1?VI:CY));
  drawLine(ribsM,M,[.60,.97,1.0,.45]);drawLine(fil,M,[.15,.82,1.0,.52]);drawLine(fil,C(M,rz(.015),ry(.028)),[.64,.17,1.0,.30]);
  orbits.forEach((r,i)=>drawMesh(r,C(M,rz((i%2?-1:1)*t*(.062+.012*i)*(1+energy*.4)*motion)),i<4?.70:.42,1.1+i*.45,energy,1,i===3?VI:CY));
  arcs.forEach((r,i)=>drawMesh(r,C(M,rz((i%2?1:-1)*t*(.11+.02*i)*(1+energy*.5)*motion)),.56,2.4+i*.55,energy,1,i%2?VI:CY));
  drawMesh(aura,C(M,sc(1+energy*.035,1+energy*.035,1+energy*.035)),.52,4.2,energy+burst,1,CY);
  drawMesh(core,C(M,sc(1+energy*.12+burst*.09,1+energy*.12+burst*.09,1+energy*.12+burst*.09)),1.0,5.3,energy+burst,1,ICE);
  if(burst>.02){const b=.78+1.10*(1-burst/1.35);drawMesh(orbits[2],C(M,sc(b,b,b)),Math.min(.85,burst*.70),6.2,energy+burst,1,ICE)}
  drawLine(pts,M,[.90,1.0,1.0,.82],gl.POINTS,2.2,1);
  drawLine(waterM,C(tr(0,-.01,-.22),M),[.03,.48,1.0,.30]);
  const R=C(tr(0,-2.52,-.26),sc(1,-.25,1),M);drawMesh(edges[0],R,.13,2.1,energy*.2,1,CY);drawMesh(edges[1],R,.10,3.0,energy*.2,1,VI);drawLine(fil,R,[.04,.34,.88,.10]);
  gl.depthMask(true);raf=requestAnimationFrame(frame);
 }
 function start(){if(!raf&&visible&&stage.isConnected){last=performance.now();raf=requestAnimationFrame(frame)}}
 if('IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);if(visible)start();else if(raf){cancelAnimationFrame(raf);raf=0}},{rootMargin:'20% 0px',threshold:.01}).observe(hero);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();root.dataset.fxCoreMobileV67='context-lost-v67';if(raf){cancelAnimationFrame(raf);raf=0}},{passive:false});
 root.dataset.fxCoreRenderer='single-webgl2-mobile-reference-locked-v67';
 root.dataset.fxCoreReferenceGeometry='reference-locked-organic-deep-concave-four-point-v67';
 root.dataset.fxCoreReferenceMaterial='multishell-translucent-fresnel-crystal-glass-v67';
 root.dataset.fxCoreInternalReactor='small-white-cyan-reactor-six-orbitals-v67';
 root.dataset.fxCoreReferenceFidelity='native-webgl2-only-no-raster-no-svg-v67';
 root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';
 root.dataset.fxCoreMobileV67=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v67';root.dataset.fxCoreReal3d='ready-v67';
 root.dataset.fxCoreAnimation='continuous-native-webgl2-living-motion-v67';root.dataset.fxCoreInteractionVisual='direct-touch-drag-burst-parallax-v67';
 window.FormatXCoreMobileV67={version:VERSION,get energy(){return energy},pulse(){targetEnergy=1.25;burst=1.35;start()}};
 start();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});else boot();
}());
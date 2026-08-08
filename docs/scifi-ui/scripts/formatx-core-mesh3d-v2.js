(function () {
  'use strict';

  const root = document.documentElement;
  if (!document.body || root.dataset.fxCoreMesh3d === 'ready-v2') return;
  if (!window.WebGL2RenderingContext) { root.dataset.fxCoreMesh3d = 'webgl2-unavailable'; return; }

  document.querySelectorAll('.fx-core-mesh3d-stage[data-fx-core-mesh3d]').forEach(node => node.remove());
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  const stage = document.createElement('div');
  stage.className = 'fx-core-mesh3d-stage';
  stage.dataset.fxCoreMesh3d = 'v2';
  stage.dataset.active = 'false';
  stage.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-core-mesh3d-canvas';
  stage.appendChild(canvas);
  document.body.appendChild(stage);

  const gl = canvas.getContext('webgl2', { alpha:true, antialias:true, depth:true, stencil:false, premultipliedAlpha:false, powerPreference:'high-performance' });
  if (!gl) { root.dataset.fxCoreMesh3d = 'context-unavailable'; stage.remove(); return; }

  const VS = `#version 300 es
  precision highp float;
  in vec3 aPosition;in vec3 aNormal;
  uniform mat4 uView,uProjection;uniform vec3 uTilt,uRotation;uniform float uScale,uPulse,uY;
  out vec3 vN,vP;
  mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
  mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
  mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0.,s,c,0.,0.,0.,1.);}
  void main(){mat3 l=rz(uTilt.z)*ry(uTilt.y)*rx(uTilt.x);mat3 r=rz(uRotation.z)*ry(uRotation.y)*rx(uRotation.x);vec3 p=r*(l*(aPosition*uScale*uPulse));p.y+=uY;vP=p;vN=normalize(r*(l*aNormal));gl_Position=uProjection*uView*vec4(p,1.);}`;

  const FS = `#version 300 es
  precision highp float;
  in vec3 vN,vP;out vec4 outColor;
  uniform vec3 uCamera,uBase,uEmit;uniform float uAlpha,uTime,uHeart,uMode;
  float sat(float x){return clamp(x,0.,1.);}
  void main(){vec3 n=normalize(vN),v=normalize(uCamera-vP);float f=pow(1.-sat(dot(n,v)),3.6);float d=max(dot(n,normalize(vec3(-.38,.78,.58))),0.);
    if(uMode<.5){float r=length(vP.xy),a=atan(vP.y,vP.x);float facet=pow(.5+.5*cos(a*8.+r*15.-uTime*.055),28.);float caustic=pow(.5+.5*sin(vP.x*13.+vP.y*17.-vP.z*19.+uTime*.20),15.);float axis=exp(-abs(vP.x)*26.)+exp(-abs(vP.y)*26.);vec3 c=uBase*(.06+.18*d);c+=vec3(.20,.94,1.56)*f*2.65;c+=vec3(.08,.52,.92)*facet*(.08+.40*f);c+=vec3(.05,.38,.72)*caustic*.10;c+=vec3(.16,.90,1.42)*axis*.08;c+=uEmit*(.035+.06*uHeart);float alpha=uAlpha*(.055+.38*f+.045*facet+.025*caustic);outColor=vec4(c,clamp(alpha,.025,.58));return;}
    float facing=.55+.45*sat(dot(n,v));vec3 e=uEmit*(1.05+uHeart*.82)*facing+uBase*.16;outColor=vec4(e,clamp(uAlpha*(.62+.30*f),0.,1.));}`;

  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s;}
  let program;
  try{program=gl.createProgram();const v=shader(gl.VERTEX_SHADER,VS),f=shader(gl.FRAGMENT_SHADER,FS);gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'link');}catch(error){console.warn('FormatX mesh v2 failed:',error);root.dataset.fxCoreMesh3d='shader-failed';stage.remove();return;}

  const A={p:gl.getAttribLocation(program,'aPosition'),n:gl.getAttribLocation(program,'aNormal')};
  const U={};['uView','uProjection','uTilt','uRotation','uScale','uPulse','uY','uCamera','uBase','uEmit','uAlpha','uTime','uHeart','uMode'].forEach(k=>U[k]=gl.getUniformLocation(program,k));

  function normals(pos,ind){const out=new Float32Array(pos.length);for(let i=0;i<ind.length;i+=3){const a=ind[i]*3,b=ind[i+1]*3,c=ind[i+2]*3;const ab=[pos[b]-pos[a],pos[b+1]-pos[a+1],pos[b+2]-pos[a+2]],ac=[pos[c]-pos[a],pos[c+1]-pos[a+1],pos[c+2]-pos[a+2]];const n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];for(const o of[a,b,c]){out[o]+=n[0];out[o+1]+=n[1];out[o+2]+=n[2];}}for(let i=0;i<out.length;i+=3){const l=Math.hypot(out[i],out[i+1],out[i+2])||1;out[i]/=l;out[i+1]/=l;out[i+2]/=l;}return out;}
  function upload(g){const vao=gl.createVertexArray(),pb=gl.createBuffer(),nb=gl.createBuffer(),ib=gl.createBuffer(),nn=normals(g.p,g.i);gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,g.p,gl.STATIC_DRAW);gl.enableVertexAttribArray(A.p);gl.vertexAttribPointer(A.p,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,nn,gl.STATIC_DRAW);gl.enableVertexAttribArray(A.n);gl.vertexAttribPointer(A.n,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,g.i,gl.STATIC_DRAW);gl.bindVertexArray(null);return{vao,pb,nb,ib,count:g.i.length};}

  const C=[[0,1],[.10,.76],[.27,.40],[.67,.11],[1,0],[.67,-.11],[.27,-.40],[.10,-.76],[0,-1],[-.10,-.76],[-.27,-.40],[-.67,-.11],[-1,0],[-.67,.11],[-.27,.40],[-.10,.76]];
  function curve(i,t){const n=C.length,p0=C[(i-1+n)%n],p1=C[i],p2=C[(i+1)%n],p3=C[(i+2)%n],q=.30,t2=t*t,t3=t2*t,h00=2*t3-3*t2+1,h10=t3-2*t2+t,h01=-2*t3+3*t2,h11=t3-t2;return[h00*p1[0]+h10*(p2[0]-p0[0])*q+h01*p2[0]+h11*(p3[0]-p1[0])*q,h00*p1[1]+h10*(p2[1]-p0[1])*q+h01*p2[1]+h11*(p3[1]-p1[1])*q];}
  function star(){const b=[];for(let i=0;i<16;i++)for(let s=0;s<7;s++)b.push(curve(i,s/7));const p=[],idx=[],front=[],back=[],R=14,depth=.40,rad=1.34,add=(x,y,z)=>(p.push(x,y,z),p.length/3-1),fc=add(0,0,depth),bc=add(0,0,-depth);for(let r=1;r<=R;r++){const t=r/R,z=depth*(.075+.925*Math.pow(Math.max(0,1-Math.pow(t,1.72)),.62)),fr=[],br=[];for(const v of b){fr.push(add(v[0]*rad*t,v[1]*rad*t,z));br.push(add(v[0]*rad*t,v[1]*rad*t,-z));}front.push(fr);back.push(br);}const N=b.length;for(let i=0;i<N;i++){const j=(i+1)%N;idx.push(fc,front[0][i],front[0][j],bc,back[0][j],back[0][i]);}for(let r=1;r<R;r++)for(let i=0;i<N;i++){const j=(i+1)%N,a=front[r-1],d=front[r],bb=back[r-1],e=back[r];idx.push(a[i],d[i],d[j],a[i],d[j],a[j],bb[i],e[j],e[i],bb[i],bb[j],e[j]);}const of=front[R-1],ob=back[R-1];for(let i=0;i<N;i++){const j=(i+1)%N;idx.push(of[i],ob[i],ob[j],of[i],ob[j],of[j]);}return{p:new Float32Array(p),i:new Uint16Array(idx)};}
  function sphere(rad,la=18,lo=24){const p=[],i=[];for(let y=0;y<=la;y++){const ph=y/la*Math.PI;for(let x=0;x<=lo;x++){const th=x/lo*Math.PI*2;p.push(rad*Math.sin(ph)*Math.cos(th),rad*Math.cos(ph),rad*Math.sin(ph)*Math.sin(th));}}const s=lo+1;for(let y=0;y<la;y++)for(let x=0;x<lo;x++){const a=y*s+x,b=(y+1)*s+x;i.push(a,b,a+1,b,b+1,a+1);}return{p:new Float32Array(p),i:new Uint16Array(i)};}
  function torus(R,r,ms=76,ts=8){const p=[],i=[];for(let a=0;a<=ms;a++){const u=a/ms*Math.PI*2;for(let b=0;b<=ts;b++){const v=b/ts*Math.PI*2,q=R+r*Math.cos(v);p.push(q*Math.cos(u),q*Math.sin(u),r*Math.sin(v));}}const s=ts+1;for(let a=0;a<ms;a++)for(let b=0;b<ts;b++){const q=a*s+b,w=(a+1)*s+b;i.push(q,w,w+1,q,w+1,q+1);}return{p:new Float32Array(p),i:new Uint16Array(i)};}

  const crystal=upload(star()),core=upload(sphere(.080)),halo=upload(sphere(.145)),rings=[upload(torus(.19,.006)),upload(torus(.30,.0055)),upload(torus(.42,.005))],orbits=[upload(torus(.72,.0045)),upload(torus(.91,.004))];
  function perspective(fov,aspect,n,f){const q=1/Math.tan(fov/2),nf=1/(n-f);return new Float32Array([q/aspect,0,0,0,0,q,0,0,0,0,(f+n)*nf,-1,0,0,2*f*n*nf,0]);}
  function look(eye){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,-eye[0],-eye[1],-eye[2],1]);}
  const camera=[0,0,4.62];let view=look(camera),projection,width=0,height=0,raf=0,start=performance.now();
  function resize(){const d=Math.min(devicePixelRatio||1,coarse.matches?1.50:1.75),w=Math.max(2,Math.floor(innerWidth*d)),h=Math.max(2,Math.floor(innerHeight*d));if(w!==width||h!==height){width=w;height=h;canvas.width=w;canvas.height=h;projection=perspective(coarse.matches?.70:.66,w/h,.1,20);gl.viewport(0,0,w,h);}}
  function ss(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
  function v3(l,v){gl.uniform3f(l,v[0],v[1],v[2]);}
  function draw(m,mode,scale,pulse,tilt,base,emit,alpha,rot,time,heart){gl.bindVertexArray(m.vao);v3(U.uTilt,tilt);v3(U.uRotation,rot);gl.uniform1f(U.uScale,scale);gl.uniform1f(U.uPulse,pulse);gl.uniform1f(U.uY,.20);v3(U.uBase,base);v3(U.uEmit,emit);gl.uniform1f(U.uAlpha,alpha);gl.uniform1f(U.uTime,time);gl.uniform1f(U.uHeart,heart);gl.uniform1f(U.uMode,mode);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);}
  function frame(now){raf=requestAnimationFrame(frame);const scene=parseFloat(root.dataset.fxApexMappedScene||'0'),vis=1-ss(.56,.92,Number.isFinite(scene)?scene:0);stage.dataset.active=vis>.01?'true':'false';stage.style.opacity=String(vis);if(vis<=.002||document.hidden||root.dataset.fxImmersive!=='active')return;resize();const t=reduced.matches?0:(now-start)*.001,a=.5+.5*Math.sin(t*1.55),b=.5+.5*Math.sin(t*3.10-.78),heart=Math.pow(a,4)*.72+Math.pow(b,9)*.28,breath=.5+.5*Math.sin(t*.62-.4),pulse=1+heart*.022+breath*.005,rot=reduced.matches?[.018,.032,0]:[.018+Math.sin(t*.20)*.018,.035+Math.sin(t*.24)*.042,Math.sin(t*.16)*.006];gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.useProgram(program);gl.uniformMatrix4fv(U.uView,false,view);gl.uniformMatrix4fv(U.uProjection,false,projection);v3(U.uCamera,camera);gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);draw(crystal,0,.55,pulse,[0,0,0],[.002,.025,.055],[.02,.45,.82],.72*vis,rot,t,heart);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);draw(halo,1,.55*(1+heart*.10),1,[0,0,0],[.08,.55,.82],[.16,.92,1.38],.11*vis,rot,t,heart);draw(core,1,.55*(1+heart*.12),1,[0,0,0],[.80,1.10,1.18],[1.55,2.15,2.42],.95*vis,rot,t,heart);const rp=.55*(1+heart*.035+breath*.007);draw(rings[0],1,rp,1,[0,0,.02+t*.018],[.08,.70,1.0],[.18,1.04,1.52],.74*vis,rot,t,heart);draw(rings[1],1,rp,1,[.04,-.05,-.02-t*.012],[.10,.64,1.0],[.28,.86,1.50],.62*vis,rot,t,heart);draw(rings[2],1,rp,1,[-.05,.07,.01+t*.009],[.24,.34,1.0],[.62,.24,1.28],.46*vis,rot,t,heart);draw(orbits[0],1,rp,1,[.52,.06,.17+t*.010],[.24,.26,1.0],[.58,.20,1.24],.34*vis,rot,t,heart);draw(orbits[1],1,rp,1,[-.36,.45,-.13-t*.008],[.04,.52,.94],[.16,.58,1.12],.20*vis,rot,t,heart);gl.depthMask(true);gl.bindVertexArray(null);}

  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);root.dataset.fxCoreMesh3d='context-lost';});addEventListener('resize',resize,{passive:true});resize();root.dataset.fxCoreMesh3d='ready-v2';root.dataset.fxCoreGeometry='indexed-triangle-mesh-v2';root.dataset.fxCoreDepthBuffer='enabled';root.dataset.fxCoreNormals='per-vertex';root.dataset.fxCoreCamera='perspective';root.dataset.fxCoreReference='four-tip-concave-crystal-v2';root.dataset.fxCoreRenderer='webgl2-indexed-mesh';const mode=document.querySelector('[data-fx-apex-mode]');if(mode)mode.textContent='WEBGL2 / INDEXED MESH 3D V2';dispatchEvent(new CustomEvent('formatx:coremesh3dready',{detail:{version:'v2',geometry:'indexed-triangle-mesh',depth:true}}));raf=requestAnimationFrame(frame);
}());
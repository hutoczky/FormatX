(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV46==='ready')return;

const mobile=matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[r+c*4]=a[r]*b[c*4]+a[r+4]*b[c*4+1]+a[r+8]*b[c*4+2]+a[r+12]*b[c*4+3];return o}
function tr(x,y,z){const o=I();o[12]=x;o[13]=y;o[14]=z;return o}
function sc(x,y,z){const o=I();o[0]=x;o[5]=y;o[10]=z;return o}
function rx(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o}
function ry(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o}
function rz(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o}
function compose(...m){return m.reduce((a,b)=>mul(a,b),I())}
function persp(fov,aspect,n,f){const q=1/Math.tan(fov/2),r=1/(n-f),o=new Float32Array(16);o[0]=q/aspect;o[5]=q;o[10]=(f+n)*r;o[11]=-1;o[14]=2*f*n*r;return o}

let tries=0;
function mount(){
  const stage=document.querySelector('.fx-core-real3d-stage');
  const canvas=stage?.querySelector('.fx-core-real3d-canvas');
  if(!stage||!canvas||root.dataset.fxMagReferenceV44!=='ready'){
    if(tries++<480)requestAnimationFrame(mount);
    return;
  }
  const gl=canvas.getContext('webgl2');
  if(!gl||gl.isContextLost())return;

  const VS=`#version 300 es
precision highp float;
layout(location=0)in vec3 aP;
layout(location=1)in vec3 aN;
uniform mat4 uP,uM;
uniform float uT;
out vec3 vP,vW,vN;
void main(){
  vec3 p=aP;
  float r=length(p.xy);
  float a=atan(p.y,p.x);
  p.z+=sin(a*6.0+r*10.0-uT*.20)*.0035*smoothstep(.08,.72,r)*(1.-smoothstep(.76,1.05,r));
  vec4 w=uM*vec4(p,1.0);
  vP=p;vW=w.xyz;vN=normalize(transpose(inverse(mat3(uM)))*aN);
  gl_Position=uP*w;
}`;
  const FS=`#version 300 es
precision highp float;
in vec3 vP,vW,vN;
uniform float uT,uA,uPhase;
uniform vec3 uTint;
out vec4 O;
float S(float x){return clamp(x,0.,1.);}
float band(float x,float c,float w){return exp(-pow(abs(x-c)/w,1.35));}
void main(){
  vec3 V=normalize(-vW);
  vec3 N=normalize(vN);
  float nv=S(abs(dot(N,V)));
  float fres=.045+.955*pow(1.-nv,2.65);
  vec2 p=vec2(vP.x,vP.y/1.02);
  float r=length(p);
  float a=atan(p.y,p.x);
  float d=pow(pow(abs(p.x),.72)+pow(abs(p.y),.72),1./.72);

  float membrane=band(d,.24,.030)+band(d,.43,.035)*.78+band(d,.62,.045)*.54+band(d,.80,.055)*.34;
  float ring=band(r,.16,.020)+band(r,.27,.024)*.78+band(r,.39,.030)*.52+band(r,.54,.038)*.30;
  float facet=pow(.5+.5*cos(a*8.0+d*9.0+uPhase),8.0);
  float filament=pow(max(0.,1.-abs(sin(a*7.0+d*24.0+sin(a*3.0)*.62-uT*.045))),18.0);
  float violet=pow(.5+.5*cos(a*4.0-r*8.0+uT*.055+uPhase),10.0)*smoothstep(.18,.34,r)*(1.-smoothstep(.58,.90,r));
  float core=1.-smoothstep(.03,.31,r);

  vec3 deep=vec3(.005,.030,.105);
  vec3 cyan=vec3(.06,.90,1.32);
  vec3 ice=vec3(.62,1.20,1.34);
  vec3 blue=vec3(.04,.34,.98);
  vec3 vio=vec3(.74,.12,1.18);
  vec3 L=normalize(vec3(-.34,.68,.65));
  float spec=pow(S(dot(reflect(-L,N),V)),74.0);

  vec3 col=deep;
  col+=uTint*(.16+.34*fres);
  col+=cyan*(.10+.34*fres+.13*membrane+.10*ring+.08*filament);
  col+=ice*(spec*.78+facet*.10+core*.10);
  col+=blue*(.08*ring+.06*filament);
  col+=vio*(.12*violet+.055*membrane);
  col+=vec3(1.0,1.22,1.30)*pow(fres,2.0)*.22;

  float alpha=uA*S(.22+.42*fres+.09*membrane+.055*ring+.045*facet+.055*core);
  O=vec4(col,alpha);
}`;

  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s}
  function program(vs,fs){const p=gl.createProgram(),v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p}
  let prog;
  try{prog=program(VS,FS)}catch(e){root.dataset.fxMagReferenceV46='shader-failed';return}

  function normals(P,Ix){
    const N=new Float32Array(P.length);
    for(let i=0;i<Ix.length;i+=3){
      const a=Ix[i]*3,b=Ix[i+1]*3,c=Ix[i+2]*3;
      const ab=[P[b]-P[a],P[b+1]-P[a+1],P[b+2]-P[a+2]],ac=[P[c]-P[a],P[c+1]-P[a+1],P[c+2]-P[a+2]];
      const n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
      for(const o of[a,b,c]){N[o]+=n[0];N[o+1]+=n[1];N[o+2]+=n[2]}
    }
    for(let i=0;i<N.length;i+=3){const l=Math.hypot(N[i],N[i+1],N[i+2])||1;N[i]/=l;N[i+1]/=l;N[i+2]/=l}
    return N;
  }
  function boundary(a){
    const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a)),p=.76;
    let q=1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);
    q*=1+.020*Math.pow(Math.abs(Math.cos(a*2)),12);
    return q;
  }
  function crystal(A=mobile?56:72,R=mobile?12:16){
    const P=[],Ix=[],starts=[];
    for(const sign of[1,-1]){
      const st=P.length/3;starts.push(st);P.push(0,0,sign*.070);
      for(let k=1;k<=R;k++){
        const t=k/R,e=Math.pow(t,.74);
        for(let i=0;i<A;i++){
          const a=i/A*Math.PI*2,br=boundary(a),rr=br*e;
          const dome=Math.pow(Math.sin(Math.PI*t),.72);
          const shoulder=1+.10*Math.exp(-Math.pow((t-.50)/.22,2));
          const z=sign*(.040+.50*dome*(.86+.14*(1-br))*shoulder);
          P.push(Math.cos(a)*rr,Math.sin(a)*rr*1.01,z);
        }
      }
      for(let i=0;i<A;i++)Ix.push(st,st+1+i,st+1+(i+1)%A);
      for(let k=1;k<R;k++){
        const a0=st+1+(k-1)*A,a1=st+1+k*A;
        for(let i=0;i<A;i++){const n=(i+1)%A;Ix.push(a0+i,a1+i,a1+n,a0+i,a1+n,a0+n)}
      }
    }
    const f=starts[0]+1+(R-1)*A,b=starts[1]+1+(R-1)*A;
    for(let i=0;i<A;i++){const n=(i+1)%A;Ix.push(f+i,b+n,b+i,f+i,f+n,b+n)}
    return{P,Ix,N:normals(P,Ix)};
  }
  function sphere(X=mobile?18:24,Y=mobile?12:16){
    const P=[],N=[],Ix=[];
    for(let y=0;y<=Y;y++){const ph=y/Y*Math.PI;for(let x=0;x<=X;x++){const th=x/X*Math.PI*2,n=[Math.cos(th)*Math.sin(ph),Math.cos(ph),Math.sin(th)*Math.sin(ph)];P.push(...n);N.push(...n)}}
    const row=X+1;for(let y=0;y<Y;y++)for(let x=0;x<X;x++){const a=y*row+x,b=(y+1)*row+x;Ix.push(a,b,a+1,a+1,b,b+1)}
    return{P,N,Ix};
  }
  function torus(S=mobile?44:60,T=8,t=.012){
    const P=[],Ix=[];
    for(let i=0;i<=S;i++){const a=i/S*Math.PI*2;for(let j=0;j<=T;j++){const b=j/T*Math.PI*2,r=1+t*Math.cos(b);P.push(r*Math.cos(a),r*Math.sin(a),t*Math.sin(b))}}
    const row=T+1;for(let i=0;i<S;i++)for(let j=0;j<T;j++){const a=i*row+j,b=(i+1)*row+j;Ix.push(a,b,b+1,a,b+1,a+1)}
    return{P,Ix,N:normals(P,Ix)};
  }
  function upload(g){
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    let b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.P),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.N),gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
    const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.Ix),gl.STATIC_DRAW);gl.bindVertexArray(null);
    return{vao,ib,count:g.Ix.length};
  }

  let shell,ball,ring;
  try{shell=upload(crystal());ball=upload(sphere());ring=upload(torus())}catch(e){root.dataset.fxMagReferenceV46='geometry-failed';return}
  const U={P:gl.getUniformLocation(prog,'uP'),M:gl.getUniformLocation(prog,'uM'),T:gl.getUniformLocation(prog,'uT'),A:gl.getUniformLocation(prog,'uA'),phase:gl.getUniformLocation(prog,'uPhase'),tint:gl.getUniformLocation(prog,'uTint')};

  let last=performance.now(),run=true,visible=true;
  function projection(){const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight);return persp((mobile?39.5:39)*Math.PI/180,w/h,.1,20)}
  function base(t){
    const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight),a=w/h,vh=2*Math.tan((mobile?39.5:39)*Math.PI/360)*3.02,vw=vh*a,portrait=a<1.08;
    const s=portrait?clamp(vw*.455,.45,.96):.86;
    const breathe=reduced.matches?1:1+Math.sin(t*.44)*.004;
    return compose(tr(portrait?0:vw*.17,portrait?.012:.01,-3.02),rx(reduced.matches?0:Math.sin(t*.11)*.006),ry(reduced.matches?0:Math.sin(t*.095)*.010),rz(reduced.matches?0:Math.sin(t*.065)*.004),sc(s*breathe,s*breathe,s*breathe));
  }
  function draw(m,M,A,tint,t,phase){
    gl.useProgram(prog);gl.uniformMatrix4fv(U.P,false,projection());gl.uniformMatrix4fv(U.M,false,M);gl.uniform1f(U.T,t);gl.uniform1f(U.A,A);gl.uniform1f(U.phase,phase);gl.uniform3fv(U.tint,tint);gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);
  }
  function frame(now){
    if(!run)return;
    const dt=now-last;last=now;
    if(!visible||document.hidden){requestAnimationFrame(frame);return}
    const t=reduced.matches?0:now*.001,B=base(t);
    gl.disable(gl.CULL_FACE);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.depthMask(false);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    draw(shell,B,mobile?.48:.40,[.05,.72,1.05],t,0.0);
    draw(shell,mul(B,sc(.86,.86,.86)),mobile?.34:.28,[.10,.84,1.10],t,.8);
    draw(shell,mul(B,compose(rz(Math.PI/4),sc(.68,.68,.68))),mobile?.24:.20,[.72,.12,1.04],t,1.6);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    const C=mul(B,tr(0,0,.055)),pulse=reduced.matches?1:1+Math.sin(t*2.1)*.035;
    draw(ball,mul(C,sc(.095*pulse,.095*pulse,.095*pulse)),.90,[1.08,1.30,1.38],t,.3);
    draw(ball,mul(C,sc(.185*pulse,.185*pulse,.185*pulse)),.28,[.10,.92,1.08],t,.6);
    const rs=[.20,.29,.40,.53,.68];
    for(let i=0;i<rs.length;i++){
      const q=rs[i],M=mul(C,compose(rx((i-2)*.025),ry((2-i)*.018),rz(t*(i%2?-.018:.022)),sc(q,q,q)));
      draw(ring,M,.12-i*.014,i===3?[.68,.12,1.02]:[.06,.90,1.02],t,i*.5);
    }
    gl.depthMask(true);
    root.dataset.fxMagV46FrameMs=dt.toFixed(1);
    requestAnimationFrame(frame);
  }

  const hero=document.getElementById('hero');
  if(hero&&'IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting&&e.intersectionRatio>.01)},{threshold:[0,.01,.08]}).observe(hero);
  canvas.addEventListener('webglcontextlost',()=>{run=false},{once:true});

  root.dataset.fxMagReferenceV46='ready';
  root.dataset.fxCoreVisualRevision='v46-solid-reference-crystal';
  root.dataset.fxCoreReferenceMaterial='solid-layered-prismatic-glass-v46';
  root.dataset.fxCoreReferenceGeometry='full-body-four-tip-crystal-v46';
  root.dataset.fxCoreInternalReactor='bright-core-five-rings-v46';
  requestAnimationFrame(frame);
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());

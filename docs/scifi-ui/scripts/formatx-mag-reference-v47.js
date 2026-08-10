(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV47==='ready')return;

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
  if(!stage||!canvas||root.dataset.fxMagReferenceV46!=='ready'){
    if(tries++<600)requestAnimationFrame(mount);
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
  float wave=sin(a*4.0+r*13.0-uT*.16)*.0034;
  p.z+=wave*smoothstep(.10,.78,r)*(1.-smoothstep(.84,1.08,r));
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
float band(float x,float c,float w){return exp(-pow(abs(x-c)/w,1.38));}
void main(){
  vec3 V=normalize(-vW);
  vec3 N=normalize(vN);
  vec3 F=normalize(cross(dFdx(vW),dFdy(vW)));
  if(!gl_FrontFacing)F=-F;
  N=normalize(mix(N,F,.34));
  float nv=S(abs(dot(N,V)));
  float fres=.030+.970*pow(1.-nv,2.35);
  vec2 p=vec2(vP.x,vP.y/1.015);
  float r=length(p);
  float a=atan(p.y,p.x);
  float d=pow(pow(abs(p.x),.66)+pow(abs(p.y),.66),1./.66);
  float body=1.-smoothstep(.18,.98,d);
  float membrane=band(d,.22,.034)+band(d,.38,.038)*.86+band(d,.56,.045)*.70+band(d,.74,.055)*.52+band(d,.90,.065)*.32;
  float ring=band(r,.15,.021)+band(r,.24,.025)*.86+band(r,.34,.030)*.68+band(r,.46,.036)*.46+band(r,.61,.045)*.25;
  float star=pow(abs(cos(a*2.0)),9.0);
  float facet=pow(.5+.5*cos(a*8.0+d*10.0+uPhase),7.0);
  float filamentA=pow(max(0.,1.-abs(sin(a*6.0+d*21.0+sin(a*3.0)*.68-uT*.045))),20.0);
  float filamentB=pow(max(0.,1.-abs(sin(a*10.0-d*29.0+sin(d*6.0)*.48+uT*.052))),24.0);
  float violet=pow(.5+.5*cos(a*4.0-r*9.0+uT*.065+uPhase),11.0)*smoothstep(.16,.30,r)*(1.-smoothstep(.66,.94,r));
  float core=1.-smoothstep(.02,.34,r);
  vec3 L1=normalize(vec3(-.42,.68,.58));
  vec3 L2=normalize(vec3(.56,-.18,.80));
  float spec1=pow(S(dot(reflect(-L1,N),V)),96.0);
  float spec2=pow(S(dot(reflect(-L2,N),V)),48.0)*.55;

  vec3 deep=vec3(.004,.030,.110);
  vec3 cyan=vec3(.08,.98,1.42);
  vec3 ice=vec3(.66,1.26,1.40);
  vec3 blue=vec3(.06,.38,1.08);
  vec3 vio=vec3(.88,.14,1.30);
  vec3 col=deep;
  col+=uTint*(.20+.32*fres+.12*body);
  col+=cyan*(.15*body+.36*fres+.15*membrane+.12*ring+.10*filamentA+.07*filamentB);
  col+=ice*(spec1*.92+spec2*.48+facet*.12+core*.18+star*.06);
  col+=blue*(.10*body+.10*ring+.08*filamentB);
  col+=vio*(.18*violet+.08*membrane+.08*filamentA+.05*filamentB);
  col+=vec3(1.08,1.28,1.36)*pow(fres,1.8)*.30;
  col+=vec3(.16,.80,1.00)*core*.16;

  float alpha=uA*S(.38+.30*fres+.13*body+.09*membrane+.055*ring+.04*facet+.065*core);
  O=vec4(col*(1.06+.10*body),alpha);
}`;

  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s}
  function program(vs,fs){const p=gl.createProgram(),v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p}
  let prog;
  try{prog=program(VS,FS)}catch(e){root.dataset.fxMagReferenceV47='shader-failed';return}

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
    const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a)),p=.63;
    let q=1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);
    q*=1+.028*Math.pow(Math.abs(Math.cos(a*2)),10);
    return q;
  }
  function crystal(A=mobile?72:88,R=mobile?16:20){
    const P=[],Ix=[],starts=[];
    for(const sign of[1,-1]){
      const st=P.length/3;starts.push(st);P.push(0,0,sign*.085);
      for(let k=1;k<=R;k++){
        const t=k/R,e=Math.pow(t,.72);
        for(let i=0;i<A;i++){
          const a=i/A*Math.PI*2,br=boundary(a),rr=br*e;
          const dome=Math.pow(Math.sin(Math.PI*t),.66);
          const shoulder=1+.16*Math.exp(-Math.pow((t-.50)/.23,2));
          const face=.91+.09*Math.pow(Math.abs(Math.cos(a*4)),1.8);
          const z=sign*(.052+.60*dome*(.84+.16*(1-br))*shoulder*face);
          P.push(Math.cos(a)*rr,Math.sin(a)*rr*.98,z);
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
  function sphere(X=mobile?22:28,Y=mobile?14:18){
    const P=[],N=[],Ix=[];
    for(let y=0;y<=Y;y++){const ph=y/Y*Math.PI;for(let x=0;x<=X;x++){const th=x/X*Math.PI*2,n=[Math.cos(th)*Math.sin(ph),Math.cos(ph),Math.sin(th)*Math.sin(ph)];P.push(...n);N.push(...n)}}
    const row=X+1;for(let y=0;y<Y;y++)for(let x=0;x<X;x++){const a=y*row+x,b=(y+1)*row+x;Ix.push(a,b,a+1,a+1,b,b+1)}
    return{P,N,Ix};
  }
  function torus(S=mobile?56:72,T=10,t=.014){
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
  try{shell=upload(crystal());ball=upload(sphere());ring=upload(torus())}catch(e){root.dataset.fxMagReferenceV47='geometry-failed';return}
  const U={P:gl.getUniformLocation(prog,'uP'),M:gl.getUniformLocation(prog,'uM'),T:gl.getUniformLocation(prog,'uT'),A:gl.getUniformLocation(prog,'uA'),phase:gl.getUniformLocation(prog,'uPhase'),tint:gl.getUniformLocation(prog,'uTint')};

  let last=performance.now(),run=true,visible=true;
  function projection(){const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight);return persp((mobile?38.5:39)*Math.PI/180,w/h,.1,20)}
  function base(t){
    const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight),a=w/h,vh=2*Math.tan((mobile?38.5:39)*Math.PI/360)*3.0,vw=vh*a,portrait=a<1.08;
    const s=portrait?clamp(vw*.49,.50,1.02):.86;
    const breathe=reduced.matches?1:1+Math.sin(t*.42)*.004;
    const y=portrait?.20:.01;
    return compose(tr(portrait?0:vw*.17,y,-3.0),rx(reduced.matches?0:Math.sin(t*.10)*.009),ry(reduced.matches?0:Math.sin(t*.085)*.013),rz(reduced.matches?0:Math.sin(t*.060)*.004),sc(s*breathe,s*breathe,s*breathe));
  }
  function draw(m,M,A,tint,t,phase){
    gl.useProgram(prog);gl.uniformMatrix4fv(U.P,false,projection());gl.uniformMatrix4fv(U.M,false,M);gl.uniform1f(U.T,t);gl.uniform1f(U.A,A);gl.uniform1f(U.phase,phase);gl.uniform3fv(U.tint,tint);gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);
  }
  function frame(now){
    if(!run)return;
    const dt=now-last;last=now;
    if(!visible||document.hidden){requestAnimationFrame(frame);return}
    const t=reduced.matches?0:now*.001,B=base(t);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.CULL_FACE);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.depthMask(false);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    draw(shell,B,mobile?.74:.48,[.06,.78,1.08],t,0.0);
    draw(shell,mul(B,sc(.89,.89,.89)),mobile?.48:.34,[.10,.94,1.12],t,.72);
    draw(shell,mul(B,compose(rz(Math.PI/4),sc(.72,.72,.72))),mobile?.33:.24,[.86,.15,1.08],t,1.44);
    draw(shell,mul(B,sc(.58,.58,.58)),mobile?.22:.16,[.14,.72,1.08],t,2.10);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    const C=mul(B,tr(0,0,.075)),pulse=reduced.matches?1:1+Math.sin(t*2.2)*.040;
    draw(ball,mul(C,sc(.125*pulse,.125*pulse,.125*pulse)),1.00,[1.16,1.36,1.42],t,.25);
    draw(ball,mul(C,sc(.235*pulse,.235*pulse,.235*pulse)),.38,[.14,1.04,1.12],t,.56);
    draw(ball,mul(C,sc(.340*pulse,.340*pulse,.340*pulse)),.14,[.10,.66,1.02],t,.82);
    const rs=[.19,.27,.36,.47,.60,.75];
    const al=[.26,.22,.18,.14,.10,.07];
    for(let i=0;i<rs.length;i++){
      const q=rs[i],M=mul(C,compose(rx((i-2.5)*.030),ry((2.5-i)*.020),rz(t*(i%2?-.020:.024)+i*.08),sc(q,q,q)));
      draw(ring,M,al[i],i===4?[.80,.14,1.06]:[.08,.98,1.08],t,i*.45);
    }
    gl.depthMask(true);
    root.dataset.fxMagV47FrameMs=dt.toFixed(1);
    requestAnimationFrame(frame);
  }

  const hero=document.getElementById('hero');
  if(hero&&'IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting&&e.intersectionRatio>.01)},{threshold:[0,.01,.08]}).observe(hero);
  canvas.addEventListener('webglcontextlost',()=>{run=false},{once:true});

  root.dataset.fxMagReferenceV47='ready';
  root.dataset.fxCoreVisualRevision='v47-solid-glass-reference-crystal';
  root.dataset.fxCoreReferenceMaterial='filled-prismatic-fresnel-glass-v47';
  root.dataset.fxCoreReferenceGeometry='broad-four-tip-reference-crystal-v47';
  root.dataset.fxCoreInternalReactor='large-reactor-six-rings-v47';
  requestAnimationFrame(frame);
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());

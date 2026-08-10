(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV37==='ready')return;

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
  if(!stage||!canvas){if(tries++<360)requestAnimationFrame(mount);return}
  const gl=canvas.getContext('webgl2');
  if(!gl||gl.isContextLost())return;

  stage.dataset.active='false';
  const holdOldRenderer=new MutationObserver(()=>{
    if(stage.dataset.active!=='false')stage.dataset.active='false';
  });
  holdOldRenderer.observe(stage,{attributes:true,attributeFilter:['data-active']});

  const VS=`#version 300 es
precision highp float;
layout(location=0)in vec3 aP;
layout(location=1)in vec3 aN;
uniform mat4 uP,uM;
uniform float uT;
out vec3 vW,vP,vN;
void main(){
  vec3 p=aP;
  float r=length(p.xy);
  float a=atan(p.y,p.x);
  float breathe=sin(a*4.0+r*9.0-uT*.16)*.0045*smoothstep(.10,.86,r)*(1.-smoothstep(.86,1.05,r));
  p.z+=breathe;
  vec4 w=uM*vec4(p,1.);
  vW=w.xyz;vP=p;
  vN=normalize(transpose(inverse(mat3(uM)))*aN);
  gl_Position=uP*w;
}`;

  const FS=`#version 300 es
precision highp float;
in vec3 vW,vP,vN;
uniform float uT,uA,uGlow;
uniform vec3 uTint;
out vec4 O;
float S(float x){return clamp(x,0.,1.);}
float band(float x,float c,float w){return exp(-pow(abs(x-c)/w,1.35));}
void main(){
  vec3 V=normalize(-vW);
  vec3 N=normalize(vN);
  vec3 F=normalize(cross(dFdx(vW),dFdy(vW)));
  if(!gl_FrontFacing)F=-F;
  N=normalize(mix(N,F,.34));

  float nv=S(abs(dot(N,V)));
  float fres=.03+.97*pow(1.-nv,3.7);
  vec3 L1=normalize(vec3(-.32,.79,.51));
  vec3 L2=normalize(vec3(.58,-.18,.79));
  float spec1=pow(S(dot(reflect(-L1,N),V)),92.);
  float spec2=pow(S(dot(reflect(-L2,N),V)),54.)*.55;

  vec2 p=vec2(vP.x,vP.y/1.08);
  float r=length(p);
  float a=atan(p.y,p.x);
  float d=pow(pow(abs(p.x),.70)+pow(abs(p.y),.70),1./.70);

  float membrane=
      band(d,.31,.010)*.70+
      band(d,.49,.013)*.58+
      band(d,.67,.015)*.48+
      band(d,.84,.018)*.40;

  float circular=
      band(r,.21,.010)*.43+
      band(r,.31,.011)*.34+
      band(r,.43,.013)*.27+
      band(r,.57,.016)*.17;

  float axis=(exp(-abs(p.x)*35.)+exp(-abs(p.y)*33.))*.16;

  float curveA=pow(max(0.,1.-abs(sin(a*4.+d*17.-uT*.045))),30.);
  float curveB=pow(max(0.,1.-abs(sin(a*6.-d*23.+sin(d*7.)*.45+uT*.035))),34.);
  float branch=pow(max(0.,1.-abs(sin(a*5.+sin(a*2.+d*9.)*.72+d*13.-uT*.028))),38.);

  float violet=pow(.5+.5*cos(a*4.-r*9.+uT*.075),16.)*
               smoothstep(.26,.46,r)*(1.-smoothstep(.58,.86,r));

  float edgeSpark=pow(fres,2.1)*(0.50+0.50*pow(.5+.5*cos(a*8.0),8.0));
  float centerFade=1.-smoothstep(.06,.28,r);

  vec3 deep=vec3(.006,.055,.15);
  vec3 cyan=vec3(.035,.92,1.52);
  vec3 blue=vec3(.015,.28,.92);
  vec3 vio=vec3(.72,.06,1.24);

  vec3 col=mix(deep,vec3(.025,.38,.82),fres*.84);
  col+=cyan*(membrane*.54+circular*.43+axis+curveA*.32+branch*.30);
  col+=blue*(curveB*.35+circular*.18);
  col+=vio*(violet*.63+branch*.12+membrane*.07);
  col+=vec3(1.18,1.46,1.56)*(spec1*1.46+spec2*.72+edgeSpark*.23);
  col+=uTint*(.08+.20*uGlow);
  col+=vec3(.18,.78,1.0)*centerFade*.08;

  float alpha=uA*S(.105+.46*fres+.11*membrane+.065*circular+.045*(curveA+branch)+uGlow*.10);
  O=vec4(col*(1.08+uGlow*.28),alpha);
}`;

  const LVS=`#version 300 es
precision highp float;
layout(location=0)in vec3 aP;
uniform mat4 uP,uM;
void main(){gl_Position=uP*uM*vec4(aP,1.);}`;
  const LFS=`#version 300 es
precision highp float;
uniform vec3 uTint;
uniform float uA,uE;
out vec4 O;
void main(){O=vec4(uTint*(1.15+uE*.62),uA);}`;

  function shader(type,src){
    const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');
    return s;
  }
  function program(vs,fs){
    const p=gl.createProgram(),v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs);
    gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');
    return p;
  }

  let mp,lp;
  try{mp=program(VS,FS);lp=program(LVS,LFS)}catch(e){
    root.dataset.fxMagReferenceV37='shader-failed';
    root.dataset.fxMagReferenceV37Error=String(e?.message||e).slice(0,200);
    return;
  }

  function normals(P,Ix){
    const N=new Float32Array(P.length);
    for(let i=0;i<Ix.length;i+=3){
      const a=Ix[i]*3,b=Ix[i+1]*3,c=Ix[i+2]*3;
      const ab=[P[b]-P[a],P[b+1]-P[a+1],P[b+2]-P[a+2]];
      const ac=[P[c]-P[a],P[c+1]-P[a+1],P[c+2]-P[a+2]];
      const n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
      for(const o of[a,b,c]){N[o]+=n[0];N[o+1]+=n[1];N[o+2]+=n[2]}
    }
    for(let i=0;i<N.length;i+=3){
      const l=Math.hypot(N[i],N[i+1],N[i+2])||1;N[i]/=l;N[i+1]/=l;N[i+2]/=l;
    }
    return N;
  }

  function boundary(a){
    const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a)),p=.70;
    let q=1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);
    const cardinal=Math.pow(Math.abs(Math.cos(a*2)),12);
    q*=1+.055*cardinal;
    return q;
  }

  function crystal(A=mobile?88:120,R=mobile?18:24){
    const P=[],Ix=[],L=[],starts=[];
    for(const sign of[1,-1]){
      const st=P.length/3;starts.push(st);
      P.push(0,0,sign*.050);
      for(let k=1;k<=R;k++){
        const t=k/R;
        const e=Math.pow(t,.78);
        for(let i=0;i<A;i++){
          const a=i/A*Math.PI*2;
          const br=boundary(a);
          const rr=br*e;
          const x=Math.cos(a)*rr;
          const y=Math.sin(a)*rr*1.085;
          const dome=Math.pow(Math.sin(Math.PI*t),.62);
          const ridge=.78+.22*(1-br);
          const z=sign*(.025+.405*dome*ridge);
          P.push(x,y,z);
        }
      }
      for(let i=0;i<A;i++)Ix.push(st,st+1+i,st+1+(i+1)%A);
      for(let k=1;k<R;k++){
        const a0=st+1+(k-1)*A,a1=st+1+k*A;
        for(let i=0;i<A;i++){
          const n=(i+1)%A;
          Ix.push(a0+i,a1+i,a1+n,a0+i,a1+n,a0+n);
        }
      }
    }
    const f=starts[0]+1+(R-1)*A,b=starts[1]+1+(R-1)*A;
    for(let i=0;i<A;i++){
      const n=(i+1)%A;Ix.push(f+i,b+n,b+i,f+i,f+n,b+n);
    }

    for(const st of starts){
      for(const ring of[5,9,13,R]){
        const k=Math.min(R,ring),s=st+1+(k-1)*A;
        for(let i=0;i<A;i+=2)L.push(s+i,s+(i+2)%A);
      }
      const stride=Math.max(1,Math.floor(A/12));
      for(let seed=0;seed<A;seed+=stride){
        let prev=st;
        for(let k=2;k<=R;k+=2){
          const drift=Math.round(Math.sin(k*.71+seed*.19)*1.25);
          const idx=(seed+drift+A)%A;
          const cur=st+1+(k-1)*A+idx;
          L.push(prev,cur);prev=cur;
        }
      }
    }
    return{P,Ix,L,N:normals(P,Ix)};
  }

  function torus(S=mobile?56:72,T=mobile?8:10,t=.012){
    const P=[],Ix=[];
    for(let i=0;i<=S;i++){
      const a=i/S*Math.PI*2;
      for(let j=0;j<=T;j++){
        const b=j/T*Math.PI*2,r=1+t*Math.cos(b);
        P.push(r*Math.cos(a),r*Math.sin(a),t*Math.sin(b));
      }
    }
    const row=T+1;
    for(let i=0;i<S;i++)for(let j=0;j<T;j++){
      const a=i*row+j,b=(i+1)*row+j;Ix.push(a,b,b+1,a,b+1,a+1);
    }
    return{P,Ix,L:[],N:normals(P,Ix)};
  }

  function sphere(X=mobile?20:28,Y=mobile?14:18){
    const P=[],N=[],Ix=[];
    for(let y=0;y<=Y;y++){
      const ph=y/Y*Math.PI;
      for(let x=0;x<=X;x++){
        const th=x/X*Math.PI*2,n=[Math.cos(th)*Math.sin(ph),Math.cos(ph),Math.sin(th)*Math.sin(ph)];
        P.push(...n);N.push(...n);
      }
    }
    const row=X+1;
    for(let y=0;y<Y;y++)for(let x=0;x<X;x++){
      const a=y*row+x,b=(y+1)*row+x;Ix.push(a,b,a+1,a+1,b,b+1);
    }
    return{P,N,Ix,L:[]};
  }

  function upload(g){
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    let b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.P),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.N),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
    const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.Ix),gl.STATIC_DRAW);
    let lb=null;
    if(g.L?.length){
      lb=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,lb);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.L),gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
    }
    gl.bindVertexArray(null);
    return{vao,ib,lb,count:g.Ix.length,lines:g.L?.length||0};
  }

  let shell,ring,ball;
  try{shell=upload(crystal());ring=upload(torus());ball=upload(sphere())}
  catch(e){root.dataset.fxMagReferenceV37='geometry-failed';return}

  const U={
    P:gl.getUniformLocation(mp,'uP'),M:gl.getUniformLocation(mp,'uM'),
    T:gl.getUniformLocation(mp,'uT'),A:gl.getUniformLocation(mp,'uA'),
    G:gl.getUniformLocation(mp,'uGlow'),t:gl.getUniformLocation(mp,'uTint')
  };
  const Q={
    P:gl.getUniformLocation(lp,'uP'),M:gl.getUniformLocation(lp,'uM'),
    t:gl.getUniformLocation(lp,'uTint'),A:gl.getUniformLocation(lp,'uA'),
    E:gl.getUniformLocation(lp,'uE')
  };

  let P=persp((mobile?39.5:39)*Math.PI/180,1,.1,20);
  let renderScale=1,last=performance.now(),ema=16.7,frames=0,pending=true;
  let pointerX=0,pointerY=0,targetX=0,targetY=0;
  let visible=true,run=true,energy=.42,surge=0;

  function resize(){
    const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight);
    const d=Math.min(devicePixelRatio||1,mobile?1.42:1.70);
    const budget=mobile?1700000:2500000;
    const k=Math.min(1,Math.sqrt(budget/(w*h*d*d)));
    const s=clamp(renderScale*k,.56,1);
    canvas.width=Math.max(1,Math.round(w*d*s));
    canvas.height=Math.max(1,Math.round(h*d*s));
    gl.viewport(0,0,canvas.width,canvas.height);
    P=persp((mobile?39.5:39)*Math.PI/180,w/h,.1,20);
    root.dataset.fxCoreRenderScale=s.toFixed(3);
  }

  function base(t){
    const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight),a=w/h;
    const vh=2*Math.tan((mobile?39.5:39)*Math.PI/360)*3.02,vw=vh*a;
    const portrait=a<1.08;
    const s=portrait?clamp(vw*.485,.47,1.02):.90;
    const breathe=reduced.matches?1:1+Math.sin(t*.52)*.0045;
    pointerX+=(targetX-pointerX)*.030;
    pointerY+=(targetY-pointerY)*.030;
    return compose(
      tr(portrait?0:vw*.17,portrait?.025:.01,-3.02),
      rx(reduced.matches?0:pointerY*.028+Math.sin(t*.12)*.009),
      ry(reduced.matches?0:-pointerX*.040+Math.sin(t*.10)*.013),
      rz(reduced.matches?0:Math.sin(t*.07)*.006),
      sc(s*breathe,s*breathe,s*breathe)
    );
  }

  function drawMesh(m,M,A,tint,t,glow){
    gl.useProgram(mp);
    gl.uniformMatrix4fv(U.P,false,P);gl.uniformMatrix4fv(U.M,false,M);
    gl.uniform1f(U.T,t);gl.uniform1f(U.A,A);gl.uniform1f(U.G,glow);
    gl.uniform3fv(U.t,tint);
    gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);
    gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);
  }
  function drawLines(m,M,A,tint){
    if(!m.lb)return;
    gl.useProgram(lp);
    gl.uniformMatrix4fv(Q.P,false,P);gl.uniformMatrix4fv(Q.M,false,M);
    gl.uniform3fv(Q.t,tint);gl.uniform1f(Q.A,A);gl.uniform1f(Q.E,energy+surge*.5);
    gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.lb);
    gl.drawElements(gl.LINES,m.lines,gl.UNSIGNED_INT,0);
  }

  function frame(now){
    if(!run)return;
    const dt=clamp(now-last,.1,80);last=now;
    ema=ema*.94+dt*.06;
    if(++frames%90===0){
      if(ema>18.8&&renderScale>.60){renderScale=Math.max(.56,renderScale-.05);pending=true}
      else if(ema<15.1&&renderScale<1){renderScale=Math.min(1,renderScale+.025);pending=true}
      root.dataset.fxCoreFrameMs=ema.toFixed(2);
    }
    if(pending){pending=false;resize()}
    if(!visible||document.hidden){requestAnimationFrame(frame);return}

    const t=reduced.matches?0:now*.001;
    surge*=Math.pow(.14,dt/1000);
    energy+=(.42+surge*.34-energy)*Math.min(1,dt*.003);

    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    const B=base(t);
    gl.depthMask(false);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    drawMesh(shell,B,.82,[.03,.72,1.0],t,.12);
    drawMesh(shell,mul(B,sc(.86,.86,.86)),.26,[.05,.52,1.0],t,.20);
    drawMesh(shell,mul(B,sc(.70,.70,.70)),.13,[.54,.08,1.0],t,.16);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    drawMesh(shell,mul(B,sc(1.008,1.008,1.014)),.19,[.05,.90,1.0],t,.56);
    drawMesh(shell,mul(B,sc(.988,.988,.988)),.12,[.52,.07,1.0],t,.36);
    drawLines(shell,B,.105,[.22,.96,1.0]);
    drawLines(shell,mul(B,rz(.0025)),.035,[.68,.11,1.0]);

    const drift=reduced.matches?[0,0,.052]:[
      Math.sin(t*.63)*.012,
      Math.cos(t*.51)*.010,
      .052+Math.sin(t*.59)*.012
    ];
    const C=mul(B,tr(...drift));
    const pulse=reduced.matches?1:1+Math.sin(t*2.0)*.035+Math.sin(t*4.0)*.012;
    drawMesh(ball,mul(C,sc(.043*pulse,.043*pulse,.043*pulse)),.98,[1.12,1.30,1.34],t,.78);
    drawMesh(ball,mul(C,sc(.088*pulse,.088*pulse,.088*pulse)),.30,[.12,1.00,1.0],t,.80);
    drawMesh(ball,mul(C,sc(.145*pulse,.145*pulse,.145*pulse)),.11,[.08,.66,1.0],t,.64);

    const rs=[.17,.235,.315,.405,.505];
    const tilt=[[0,0,0],[.11,.03,.02],[-.10,.07,-.025],[.045,-.11,.03],[-.06,.13,-.02]];
    const alpha=[.34,.28,.22,.16,.105];
    for(let i=0;i<rs.length;i++){
      const wob=reduced.matches?1:1+Math.sin(t*1.08+i*.7)*.006;
      const q=rs[i]*wob,r=tilt[i];
      const M=mul(C,compose(rx(r[0]),ry(r[1]),rz(r[2]+t*(i%2?-.032:.028)),sc(q,q,q)));
      drawMesh(ring,M,alpha[i],i===3?[.60,.08,1.0]:[.05,.90,1.0],t,.72);
    }

    for(const o of[
      [.70,.42,.24,t*.018,[.04,.70,1.0],.046],
      [.82,-.28,.46,-t*.015,[.62,.08,1.0],.036],
      [.91,.61,-.17,t*.012,[.08,.76,1.0],.028]
    ]){
      drawMesh(ring,mul(B,compose(rx(o[1]),ry(o[2]),rz(o[3]),sc(o[0],o[0],o[0]))),o[5],o[4],t,.46);
    }

    gl.depthMask(true);
    requestAnimationFrame(frame);
  }

  addEventListener('pointermove',e=>{
    if(reduced.matches)return;
    targetX=clamp((e.clientX/Math.max(1,innerWidth)-.5)*2,-1,1);
    targetY=clamp((e.clientY/Math.max(1,innerHeight)-.5)*2,-1,1);
  },{passive:true});
  addEventListener('resize',()=>{pending=true},{passive:true});
  visualViewport?.addEventListener('resize',()=>{pending=true},{passive:true});

  for(const n of['formatx:organismactivation','formatx:organismresponse','formatx:organismspeech','formatx:corewake']){
    addEventListener(n,()=>{surge=Math.max(surge,n.includes('speech')?.80:.64)});
  }

  const hero=document.getElementById('hero');
  if(hero&&'IntersectionObserver'in window){
    new IntersectionObserver(es=>{
      visible=es.some(e=>e.isIntersecting&&e.intersectionRatio>.01);
    },{threshold:[0,.01,.08]}).observe(hero);
  }

  canvas.addEventListener('webglcontextlost',()=>{run=false},{once:true});

  root.dataset.fxMagReferenceV37='ready';
  root.dataset.fxCoreVisualRevision='v37-native-volumetric-reference';
  root.dataset.fxCoreReferenceMaterial='layered-fresnel-glass-v37';
  root.dataset.fxCoreReferenceGeometry='deep-four-sail-superellipse-v37';
  root.dataset.fxCoreInternalReactor='micro-star-five-rings-v37';
  root.dataset.fxCoreOverlayMode='none-native-webgl-only';
  resize();
  requestAnimationFrame(frame);
}

if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());
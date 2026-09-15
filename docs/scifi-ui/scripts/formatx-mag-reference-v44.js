(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV44==='ready')return;

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
  const holdOldRenderer=new MutationObserver(()=>{if(stage.dataset.active!=='false')stage.dataset.active='false';});
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
  float micro=sin(a*8.0+r*18.0-uT*.17)*.0022;
  p.z+=micro*smoothstep(.15,.80,r)*(1.-smoothstep(.82,1.05,r));
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
float band(float x,float c,float w){return exp(-pow(abs(x-c)/w,1.5));}
void main(){
  vec3 V=normalize(-vW);
  vec3 N=normalize(vN);
  vec3 F=normalize(cross(dFdx(vW),dFdy(vW)));
  if(!gl_FrontFacing)F=-F;
  N=normalize(mix(N,F,.68));

  float nv=S(abs(dot(N,V)));
  float fres=.018+.982*pow(1.-nv,3.05);
  vec3 L1=normalize(vec3(-.34,.78,.53));
  vec3 L2=normalize(vec3(.62,-.20,.76));
  vec3 L3=normalize(vec3(.10,.24,.97));
  float spec1=pow(S(dot(reflect(-L1,N),V)),150.);
  float spec2=pow(S(dot(reflect(-L2,N),V)),82.)*.68;
  float spec3=pow(S(dot(reflect(-L3,N),V)),36.)*.34;

  vec2 p=vec2(vP.x,vP.y/1.015);
  float r=length(p);
  float a=atan(p.y,p.x);
  float d=pow(pow(abs(p.x),.80)+pow(abs(p.y),.80),1./.80);

  float ribs=
      band(d,.26,.008)*.78+
      band(d,.42,.009)*.70+
      band(d,.58,.010)*.61+
      band(d,.74,.012)*.51+
      band(d,.89,.014)*.42;
  float rings=
      band(r,.17,.008)*.48+
      band(r,.27,.009)*.40+
      band(r,.39,.011)*.31+
      band(r,.53,.013)*.22;

  float cardinal=pow(abs(cos(a*2.0)),24.);
  float corner=pow(abs(cos(a*4.0)),18.);
  float axis=(exp(-abs(p.x)*52.)+exp(-abs(p.y)*50.))*.18;
  float facetA=pow(max(0.,1.-abs(sin(a*8.0+d*10.0))),38.);
  float facetB=pow(max(0.,1.-abs(sin(a*12.0-d*14.0+uT*.018))),44.);
  float filamentA=pow(max(0.,1.-abs(sin(a*5.0+d*22.0+sin(a*3.0)*.72-uT*.040))),46.);
  float filamentB=pow(max(0.,1.-abs(sin(a*9.0-d*31.0+sin(d*7.0)*.54+uT*.052))),58.);
  float violet=pow(.5+.5*cos(a*4.-r*11.+uT*.070),20.)*smoothstep(.24,.38,r)*(1.-smoothstep(.64,.92,r));
  float center=1.-smoothstep(.04,.27,r);
  float edgeSpark=pow(fres,1.9)*(0.45+0.55*pow(.5+.5*cos(a*8.0),12.0));

  vec3 deep=vec3(.003,.026,.095);
  vec3 cyan=vec3(.02,1.02,1.58);
  vec3 ice=vec3(.52,1.22,1.34);
  vec3 blue=vec3(.02,.33,1.02);
  vec3 vio=vec3(.78,.08,1.26);

  vec3 col=mix(deep,vec3(.016,.26,.66),fres*.88);
  col+=cyan*(ribs*.62+rings*.42+axis+filamentA*.38+filamentB*.28);
  col+=ice*(facetA*.72+facetB*.50+cardinal*.14+corner*.08);
  col+=blue*(rings*.18+facetB*.16+filamentB*.20);
  col+=vio*(violet*.78+filamentA*.18+filamentB*.15+ribs*.08);
  col+=vec3(1.25,1.52,1.62)*(spec1*1.86+spec2*.95+spec3*.44+edgeSpark*.34);
  col+=uTint*(.07+.20*uGlow);
  col+=vec3(.20,.92,1.10)*center*.14;

  float glass=.075+.46*fres+.13*ribs+.065*rings+.052*(filamentA+filamentB)+.045*facetA;
  float alpha=uA*S(glass+uGlow*.11);
  O=vec4(col*(1.08+uGlow*.30),alpha);
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
void main(){O=vec4(uTint*(1.28+uE*.72),uA);}`;

  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s}
  function program(vs,fs){const p=gl.createProgram(),v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs);gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p}

  let mp,lp;
  try{mp=program(VS,FS);lp=program(LVS,LFS)}catch(e){root.dataset.fxMagReferenceV44='shader-failed';root.dataset.fxMagReferenceV44Error=String(e?.message||e).slice(0,200);return}

  function normals(P,Ix){
    const N=new Float32Array(P.length);
    for(let i=0;i<Ix.length;i+=3){const a=Ix[i]*3,b=Ix[i+1]*3,c=Ix[i+2]*3,ab=[P[b]-P[a],P[b+1]-P[a+1],P[b+2]-P[a+2]],ac=[P[c]-P[a],P[c+1]-P[a+1],P[c+2]-P[a+2]],n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];for(const o of[a,b,c]){N[o]+=n[0];N[o+1]+=n[1];N[o+2]+=n[2]}}
    for(let i=0;i<N.length;i+=3){const l=Math.hypot(N[i],N[i+1],N[i+2])||1;N[i]/=l;N[i+1]/=l;N[i+2]/=l}return N;
  }

  function boundary(a){
    const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a)),p=.82;
    let q=1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);
    const cardinal=Math.pow(Math.abs(Math.cos(a*2)),20);
    q*=1+.045*cardinal;
    return q;
  }

  function crystal(A=mobile?72:88,R=mobile?14:18){
    const P=[],Ix=[],L=[],starts=[];
    for(const sign of[1,-1]){
      const st=P.length/3;starts.push(st);P.push(0,0,sign*.055);
      for(let k=1;k<=R;k++){
        const t=k/R,e=Math.pow(t,.78);
        for(let i=0;i<A;i++){
          const a=i/A*Math.PI*2,br=boundary(a),rr=br*e;
          const x=Math.cos(a)*rr,y=Math.sin(a)*rr*1.00;
          const dome=Math.pow(Math.sin(Math.PI*t),.78);
          const ridge=.79+.21*(1-br);
          const face=.94+.06*Math.pow(Math.abs(Math.cos(a*4)),2.2);
          const shoulder=1+.055*Math.exp(-Math.pow((t-.52)/.19,2));
          const z=sign*(.028+.405*dome*ridge*face*shoulder);
          P.push(x,y,z);
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

    for(const st of starts){
      const ringSet=[2,4,6,8,10,12,R].filter((v,i,a)=>v<=R&&a.indexOf(v)===i);
      for(const ring of ringSet){const s=st+1+(ring-1)*A;for(let i=0;i<A;i+=2)L.push(s+i,s+(i+2)%A)}
      const stride=Math.max(1,Math.floor(A/16));
      for(let seed=0;seed<A;seed+=stride){
        let prev=st;
        for(let k=2;k<=R;k+=2){const drift=Math.round(Math.sin(k*.63+seed*.21)*1.15);const idx=(seed+drift+A)%A,cur=st+1+(k-1)*A+idx;L.push(prev,cur);prev=cur}
      }
    }
    return{P,Ix,L,N:normals(P,Ix)};
  }

  function torus(S=mobile?64:80,T=mobile?8:10,t=.009){
    const P=[],Ix=[];for(let i=0;i<=S;i++){const a=i/S*Math.PI*2;for(let j=0;j<=T;j++){const b=j/T*Math.PI*2,r=1+t*Math.cos(b);P.push(r*Math.cos(a),r*Math.sin(a),t*Math.sin(b))}}
    const row=T+1;for(let i=0;i<S;i++)for(let j=0;j<T;j++){const a=i*row+j,b=(i+1)*row+j;Ix.push(a,b,b+1,a,b+1,a+1)}return{P,Ix,L:[],N:normals(P,Ix)};
  }

  function sphere(X=mobile?22:30,Y=mobile?16:20){
    const P=[],N=[],Ix=[];for(let y=0;y<=Y;y++){const ph=y/Y*Math.PI;for(let x=0;x<=X;x++){const th=x/X*Math.PI*2,n=[Math.cos(th)*Math.sin(ph),Math.cos(ph),Math.sin(th)*Math.sin(ph)];P.push(...n);N.push(...n)}}
    const row=X+1;for(let y=0;y<Y;y++)for(let x=0;x<X;x++){const a=y*row+x,b=(y+1)*row+x;Ix.push(a,b,a+1,a+1,b,b+1)}return{P,N,Ix,L:[]};
  }

  function upload(g){
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    let b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.P),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.N),gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
    const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.Ix),gl.STATIC_DRAW);
    let lb=null;if(g.L?.length){lb=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,lb);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.L),gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib)}gl.bindVertexArray(null);return{vao,ib,lb,count:g.Ix.length,lines:g.L?.length||0};
  }

  let shell,ring,ball;
  try{shell=upload(crystal());ring=upload(torus());ball=upload(sphere())}catch(e){root.dataset.fxMagReferenceV44='geometry-failed';return}

  const U={P:gl.getUniformLocation(mp,'uP'),M:gl.getUniformLocation(mp,'uM'),T:gl.getUniformLocation(mp,'uT'),A:gl.getUniformLocation(mp,'uA'),G:gl.getUniformLocation(mp,'uGlow'),t:gl.getUniformLocation(mp,'uTint')};
  const Q={P:gl.getUniformLocation(lp,'uP'),M:gl.getUniformLocation(lp,'uM'),t:gl.getUniformLocation(lp,'uTint'),A:gl.getUniformLocation(lp,'uA'),E:gl.getUniformLocation(lp,'uE')};

  let P=persp((mobile?39.5:39)*Math.PI/180,1,.1,20),renderScale=1,last=performance.now(),ema=16.7,frames=0,pending=true;
  let pointerX=0,pointerY=0,targetX=0,targetY=0,visible=true,run=true,energy=.50,surge=0;

  function resize(){
    const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight),d=Math.min(devicePixelRatio||1,mobile?1.45:1.72),budget=mobile?1800000:2700000;
    const k=Math.min(1,Math.sqrt(budget/(w*h*d*d))),s=clamp(renderScale*k,.56,1);canvas.width=Math.max(1,Math.round(w*d*s));canvas.height=Math.max(1,Math.round(h*d*s));gl.viewport(0,0,canvas.width,canvas.height);P=persp((mobile?39.5:39)*Math.PI/180,w/h,.1,20);root.dataset.fxCoreRenderScale=s.toFixed(3);
  }

  function base(t){
    const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight),a=w/h,vh=2*Math.tan((mobile?39.5:39)*Math.PI/360)*3.02,vw=vh*a,portrait=a<1.08;
    const s=portrait?clamp(vw*.455,.45,.96):.86,breathe=reduced.matches?1:1+Math.sin(t*.48)*.0035;
    pointerX+=(targetX-pointerX)*.028;pointerY+=(targetY-pointerY)*.028;
    return compose(tr(portrait?0:vw*.17,portrait?.012:.01,-3.02),rx(reduced.matches?0:pointerY*.024+Math.sin(t*.11)*.006),ry(reduced.matches?0:-pointerX*.034+Math.sin(t*.095)*.010),rz(reduced.matches?0:Math.sin(t*.065)*.004),sc(s*breathe,s*breathe,s*breathe));
  }

  function drawMesh(m,M,A,tint,t,glow){gl.useProgram(mp);gl.uniformMatrix4fv(U.P,false,P);gl.uniformMatrix4fv(U.M,false,M);gl.uniform1f(U.T,t);gl.uniform1f(U.A,A);gl.uniform1f(U.G,glow);gl.uniform3fv(U.t,tint);gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0)}
  function drawLines(m,M,A,tint){if(!m.lb)return;gl.useProgram(lp);gl.uniformMatrix4fv(Q.P,false,P);gl.uniformMatrix4fv(Q.M,false,M);gl.uniform3fv(Q.t,tint);gl.uniform1f(Q.A,A);gl.uniform1f(Q.E,energy+surge*.5);gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.lb);gl.drawElements(gl.LINES,m.lines,gl.UNSIGNED_INT,0)}

  function frame(now){
    if(!run)return;const dt=clamp(now-last,.1,80);last=now;ema=ema*.94+dt*.06;
    if(++frames%90===0){if(ema>18.8&&renderScale>.60){renderScale=Math.max(.56,renderScale-.05);pending=true}else if(ema<15.1&&renderScale<1){renderScale=Math.min(1,renderScale+.025);pending=true}root.dataset.fxCoreFrameMs=ema.toFixed(2)}
    if(pending){pending=false;resize()}if(!visible||document.hidden){requestAnimationFrame(frame);return}

    const t=reduced.matches?0:now*.001;surge*=Math.pow(.14,dt/1000);energy+=(.50+surge*.38-energy)*Math.min(1,dt*.003);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const B=base(t);gl.depthMask(false);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    drawMesh(shell,B,.78,[.03,.84,1.06],t,.18);
    drawMesh(shell,mul(B,sc(.82,.82,.82)),.29,[.06,.62,1.04],t,.27);
    drawMesh(shell,mul(B,compose(rz(Math.PI/4),sc(.61,.61,.61))),.17,[.62,.09,1.05],t,.26);
    drawMesh(shell,mul(B,sc(.48,.48,.48)),.11,[.10,.70,1.05],t,.24);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    drawMesh(shell,mul(B,sc(1.010,1.010,1.014)),.22,[.05,.98,1.06],t,.72);
    drawMesh(shell,mul(B,compose(rz(Math.PI/4),sc(.68,.68,.68))),.11,[.72,.11,1.06],t,.48);
    drawLines(shell,B,.22,[.26,1.00,1.08]);
    drawLines(shell,mul(B,rz(Math.PI/4)),.085,[.76,.16,1.04]);

    const drift=reduced.matches?[0,0,.050]:[Math.sin(t*.63)*.012,Math.cos(t*.51)*.009,.050+Math.sin(t*.59)*.010];
    const C=mul(B,tr(...drift)),pulse=reduced.matches?1:1+Math.sin(t*2.1)*.035+Math.sin(t*4.2)*.012;
    drawMesh(ball,mul(C,sc(.075*pulse,.075*pulse,.075*pulse)),1.00,[1.24,1.40,1.44],t,1.00);
    drawMesh(ball,mul(C,sc(.145*pulse,.145*pulse,.145*pulse)),.42,[.18,1.08,1.05],t,.96);
    drawMesh(ball,mul(C,sc(.225*pulse,.225*pulse,.225*pulse)),.17,[.10,.82,1.04],t,.76);

    const rs=[.19,.27,.36,.46,.57],tilt=[[0,0,0],[.11,.03,.02],[-.09,.07,-.022],[.045,-.10,.026],[-.055,.12,-.018]],alpha=[.44,.35,.27,.20,.13];
    for(let i=0;i<rs.length;i++){const wob=reduced.matches?1:1+Math.sin(t*1.04+i*.71)*.005,q=rs[i]*wob,r=tilt[i],M=mul(C,compose(rx(r[0]),ry(r[1]),rz(r[2]+t*(i%2?-.030:.027)),sc(q,q,q)));drawMesh(ring,M,alpha[i],i===3?[.70,.11,1.04]:[.06,.98,1.04],t,.82)}
    gl.depthMask(true);requestAnimationFrame(frame);
  }

  addEventListener('pointermove',e=>{if(reduced.matches)return;targetX=clamp((e.clientX/Math.max(1,innerWidth)-.5)*2,-1,1);targetY=clamp((e.clientY/Math.max(1,innerHeight)-.5)*2,-1,1)},{passive:true});
  addEventListener('resize',()=>{pending=true},{passive:true});visualViewport?.addEventListener('resize',()=>{pending=true},{passive:true});
  for(const n of['formatx:organismactivation','formatx:organismresponse','formatx:organismspeech','formatx:corewake'])addEventListener(n,()=>{surge=Math.max(surge,n.includes('speech')?.84:.68)});
  const hero=document.getElementById('hero');if(hero&&'IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting&&e.intersectionRatio>.01)},{threshold:[0,.01,.08]}).observe(hero);
  canvas.addEventListener('webglcontextlost',()=>{run=false},{once:true});

  root.dataset.fxMagReferenceV44='ready';
  root.dataset.fxCoreVisualRevision='v44-faceted-reference-crystal';
  root.dataset.fxCoreReferenceMaterial='faceted-prismatic-fresnel-glass-v44';
  root.dataset.fxCoreReferenceGeometry='fuller-four-tip-prismatic-crystal-v44';
  root.dataset.fxCoreInternalReactor='bright-orb-five-rings-v44';
  root.dataset.fxCoreOverlayMode='none-native-webgl-only';
  resize();requestAnimationFrame(frame);
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());
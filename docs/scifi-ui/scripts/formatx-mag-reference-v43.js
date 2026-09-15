(function(){
'use strict';
const root=document.documentElement;
if(new URLSearchParams(location.search).get('lighthouse')==='1')return;
if(root.dataset.fxMagReferenceV43==='ready')return;

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
  float ripple=sin(a*8.0+r*14.0-uT*.19)*.0032;
  float breathe=sin(a*4.0+r*8.0-uT*.14)*.0038;
  p.z+=(ripple+breathe)*smoothstep(.10,.90,r)*(1.-smoothstep(.90,1.08,r));
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
float band(float x,float c,float w){return exp(-pow(abs(x-c)/w,1.42));}
void main(){
  vec3 V=normalize(-vW);
  vec3 N=normalize(vN);
  vec3 F=normalize(cross(dFdx(vW),dFdy(vW)));
  if(!gl_FrontFacing)F=-F;
  N=normalize(mix(N,F,.40));

  float nv=S(abs(dot(N,V)));
  float fres=.025+.975*pow(1.-nv,3.25);
  vec3 L1=normalize(vec3(-.28,.82,.50));
  vec3 L2=normalize(vec3(.62,-.12,.77));
  vec3 L3=normalize(vec3(.04,.28,.96));
  float spec1=pow(S(dot(reflect(-L1,N),V)),120.);
  float spec2=pow(S(dot(reflect(-L2,N),V)),62.)*.62;
  float spec3=pow(S(dot(reflect(-L3,N),V)),30.)*.28;

  vec2 p=vec2(vP.x,vP.y/1.06);
  float r=length(p);
  float a=atan(p.y,p.x);
  float d=pow(pow(abs(p.x),.58)+pow(abs(p.y),.58),1./.58);

  float membrane=
      band(d,.22,.008)*.66+
      band(d,.34,.009)*.62+
      band(d,.47,.010)*.58+
      band(d,.61,.012)*.52+
      band(d,.75,.014)*.46+
      band(d,.89,.016)*.40;

  float circular=
      band(r,.15,.008)*.46+
      band(r,.23,.009)*.41+
      band(r,.32,.010)*.34+
      band(r,.43,.012)*.28+
      band(r,.56,.014)*.19;

  float cardinal=pow(abs(cos(a*2.0)),18.);
  float diagonal=pow(abs(cos(a*4.0)),22.);
  float axis=(exp(-abs(p.x)*46.)+exp(-abs(p.y)*44.))*.18;
  float facet=pow(max(0.,1.-abs(sin(a*8.0+d*9.5))),28.)*.20;
  float facet2=pow(max(0.,1.-abs(sin(a*12.0-d*13.0))),34.)*.12;

  float curveA=pow(max(0.,1.-abs(sin(a*4.0+d*20.0-uT*.052))),34.);
  float curveB=pow(max(0.,1.-abs(sin(a*6.0-d*27.0+sin(d*8.0)*.50+uT*.038))),38.);
  float branch=pow(max(0.,1.-abs(sin(a*5.0+sin(a*2.0+d*10.0)*.76+d*15.0-uT*.030))),42.);
  float filament=pow(max(0.,1.-abs(sin(a*9.0+d*31.0+sin(a*3.0)*.68-uT*.061))),52.);

  float violet=pow(.5+.5*cos(a*4.-r*10.+uT*.082),18.)*
               smoothstep(.22,.38,r)*(1.-smoothstep(.62,.90,r));
  float edgeSpark=pow(fres,2.0)*(0.44+0.56*pow(.5+.5*cos(a*8.0),10.0));
  float centerFade=1.-smoothstep(.05,.30,r);

  vec3 deep=vec3(.004,.035,.115);
  vec3 cyan=vec3(.025,1.02,1.62);
  vec3 ice=vec3(.36,1.14,1.30);
  vec3 blue=vec3(.018,.34,1.08);
  vec3 vio=vec3(.82,.07,1.34);

  vec3 col=mix(deep,vec3(.018,.32,.78),fres*.94);
  col+=cyan*(membrane*.68+circular*.52+axis+curveA*.42+branch*.34+filament*.30);
  col+=ice*(facet*.58+facet2*.46+cardinal*.10+diagonal*.06);
  col+=blue*(curveB*.42+circular*.20+facet2*.14);
  col+=vio*(violet*.74+branch*.17+filament*.13+membrane*.09);
  col+=vec3(1.20,1.50,1.62)*(spec1*1.72+spec2*.86+spec3*.40+edgeSpark*.30);
  col+=uTint*(.10+.22*uGlow);
  col+=vec3(.18,.88,1.08)*centerFade*.12;

  float glass=.12+.52*fres+.15*membrane+.08*circular+.055*(curveA+branch)+.035*filament+.05*facet;
  float alpha=uA*S(glass+uGlow*.12);
  O=vec4(col*(1.12+uGlow*.34),alpha);
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
void main(){O=vec4(uTint*(1.22+uE*.70),uA);}`;

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
    root.dataset.fxMagReferenceV43='shader-failed';
    root.dataset.fxMagReferenceV43Error=String(e?.message||e).slice(0,200);
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
    for(let i=0;i<N.length;i+=3){const l=Math.hypot(N[i],N[i+1],N[i+2])||1;N[i]/=l;N[i+1]/=l;N[i+2]/=l;}
    return N;
  }

  function boundary(a){
    const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a)),p=.58;
    let q=1/Math.pow(Math.pow(c,p)+Math.pow(s,p),1/p);
    const cardinal=Math.pow(Math.abs(Math.cos(a*2)),18);
    q*=1+.105*cardinal;
    return q;
  }

  function crystal(A=mobile?96:128,R=mobile?20:28){
    const P=[],Ix=[],L=[],starts=[];
    for(const sign of[1,-1]){
      const st=P.length/3;starts.push(st);
      P.push(0,0,sign*.042);
      for(let k=1;k<=R;k++){
        const t=k/R,e=Math.pow(t,.72);
        for(let i=0;i<A;i++){
          const a=i/A*Math.PI*2,br=boundary(a),rr=br*e;
          const x=Math.cos(a)*rr,y=Math.sin(a)*rr*1.075;
          const dome=Math.pow(Math.sin(Math.PI*t),.56);
          const cardinal=Math.pow(Math.abs(Math.cos(a*2)),16);
          const facets=.90+.10*Math.pow(Math.abs(Math.cos(a*4)),3.0);
          const ridge=.72+.28*(1-br)+cardinal*.05;
          const z=sign*(.018+.455*dome*ridge*facets);
          P.push(x,y,z);
        }
      }
      for(let i=0;i<A;i++)Ix.push(st,st+1+i,st+1+(i+1)%A);
      for(let k=1;k<R;k++){
        const a0=st+1+(k-1)*A,a1=st+1+k*A;
        for(let i=0;i<A;i++){const n=(i+1)%A;Ix.push(a0+i,a1+i,a1+n,a0+i,a1+n,a0+n);}
      }
    }
    const f=starts[0]+1+(R-1)*A,b=starts[1]+1+(R-1)*A;
    for(let i=0;i<A;i++){const n=(i+1)%A;Ix.push(f+i,b+n,b+i,f+i,f+n,b+n);}
    for(const st of starts){
      const ringSet=[3,5,7,10,13,16,R].filter((v,i,arr)=>v<=R&&arr.indexOf(v)===i);
      for(const ring of ringSet){
        const s=st+1+(ring-1)*A;
        for(let i=0;i<A;i+=2)L.push(s+i,s+(i+2)%A);
      }
      const stride=Math.max(1,Math.floor(A/16));
      for(let seed=0;seed<A;seed+=stride){
        let prev=st;
        for(let k=2;k<=R;k+=2){
          const drift=Math.round(Math.sin(k*.79+seed*.23)*1.45+Math.sin(k*.31+seed*.11)*.55);
          const idx=(seed+drift+A)%A,cur=st+1+(k-1)*A+idx;
          L.push(prev,cur);prev=cur;
        }
      }
    }
    return{P,Ix,L,N:normals(P,Ix)};
  }

  function torus(S=mobile?64:80,T=mobile?8:10,t=.010){
    const P=[],Ix=[];
    for(let i=0;i<=S;i++){
      const a=i/S*Math.PI*2;
      for(let j=0;j<=T;j++){const b=j/T*Math.PI*2,r=1+t*Math.cos(b);P.push(r*Math.cos(a),r*Math.sin(a),t*Math.sin(b));}
    }
    const row=T+1;
    for(let i=0;i<S;i++)for(let j=0;j<T;j++){const a=i*row+j,b=(i+1)*row+j;Ix.push(a,b,b+1,a,b+1,a+1);}
    return{P,Ix,L:[],N:normals(P,Ix)};
  }

  function sphere(X=mobile?22:30,Y=mobile?16:20){
    const P=[],N=[],Ix=[];
    for(let y=0;y<=Y;y++){
      const ph=y/Y*Math.PI;
      for(let x=0;x<=X;x++){const th=x/X*Math.PI*2,n=[Math.cos(th)*Math.sin(ph),Math.cos(ph),Math.sin(th)*Math.sin(ph)];P.push(...n);N.push(...n);}
    }
    const row=X+1;
    for(let y=0;y<Y;y++)for(let x=0;x<X;x++){const a=y*row+x,b=(y+1)*row+x;Ix.push(a,b,a+1,a+1,b,b+1);}
    return{P,N,Ix,L:[]};
  }

  function upload(g){
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    let b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.P),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
    b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.N),gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);
    const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.Ix),gl.STATIC_DRAW);
    let lb=null;
    if(g.L?.length){lb=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,lb);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.L),gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);}
    gl.bindVertexArray(null);return{vao,ib,lb,count:g.Ix.length,lines:g.L?.length||0};
  }

  let shell,ring,ball;
  try{shell=upload(crystal());ring=upload(torus());ball=upload(sphere())}catch(e){root.dataset.fxMagReferenceV43='geometry-failed';return}

  const U={P:gl.getUniformLocation(mp,'uP'),M:gl.getUniformLocation(mp,'uM'),T:gl.getUniformLocation(mp,'uT'),A:gl.getUniformLocation(mp,'uA'),G:gl.getUniformLocation(mp,'uGlow'),t:gl.getUniformLocation(mp,'uTint')};
  const Q={P:gl.getUniformLocation(lp,'uP'),M:gl.getUniformLocation(lp,'uM'),t:gl.getUniformLocation(lp,'uTint'),A:gl.getUniformLocation(lp,'uA'),E:gl.getUniformLocation(lp,'uE')};

  let P=persp((mobile?39.5:39)*Math.PI/180,1,.1,20);
  let renderScale=1,last=performance.now(),ema=16.7,frames=0,pending=true;
  let pointerX=0,pointerY=0,targetX=0,targetY=0;
  let visible=true,run=true,energy=.48,surge=0;

  function resize(){
    const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight);
    const d=Math.min(devicePixelRatio||1,mobile?1.45:1.72),budget=mobile?1800000:2700000;
    const k=Math.min(1,Math.sqrt(budget/(w*h*d*d))),s=clamp(renderScale*k,.56,1);
    canvas.width=Math.max(1,Math.round(w*d*s));canvas.height=Math.max(1,Math.round(h*d*s));
    gl.viewport(0,0,canvas.width,canvas.height);P=persp((mobile?39.5:39)*Math.PI/180,w/h,.1,20);root.dataset.fxCoreRenderScale=s.toFixed(3);
  }

  function base(t){
    const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight),a=w/h;
    const vh=2*Math.tan((mobile?39.5:39)*Math.PI/360)*3.02,vw=vh*a,portrait=a<1.08;
    const s=portrait?clamp(vw*.49,.48,1.03):.88,breathe=reduced.matches?1:1+Math.sin(t*.50)*.0042;
    pointerX+=(targetX-pointerX)*.030;pointerY+=(targetY-pointerY)*.030;
    return compose(tr(portrait?0:vw*.17,portrait?.018:.01,-3.02),rx(reduced.matches?0:pointerY*.026+Math.sin(t*.12)*.008),ry(reduced.matches?0:-pointerX*.038+Math.sin(t*.10)*.012),rz(reduced.matches?0:Math.sin(t*.07)*.005),sc(s*breathe,s*breathe,s*breathe));
  }

  function drawMesh(m,M,A,tint,t,glow){
    gl.useProgram(mp);gl.uniformMatrix4fv(U.P,false,P);gl.uniformMatrix4fv(U.M,false,M);gl.uniform1f(U.T,t);gl.uniform1f(U.A,A);gl.uniform1f(U.G,glow);gl.uniform3fv(U.t,tint);gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);
  }
  function drawLines(m,M,A,tint){
    if(!m.lb)return;gl.useProgram(lp);gl.uniformMatrix4fv(Q.P,false,P);gl.uniformMatrix4fv(Q.M,false,M);gl.uniform3fv(Q.t,tint);gl.uniform1f(Q.A,A);gl.uniform1f(Q.E,energy+surge*.5);gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.lb);gl.drawElements(gl.LINES,m.lines,gl.UNSIGNED_INT,0);
  }

  function frame(now){
    if(!run)return;
    const dt=clamp(now-last,.1,80);last=now;ema=ema*.94+dt*.06;
    if(++frames%90===0){if(ema>18.8&&renderScale>.60){renderScale=Math.max(.56,renderScale-.05);pending=true}else if(ema<15.1&&renderScale<1){renderScale=Math.min(1,renderScale+.025);pending=true}root.dataset.fxCoreFrameMs=ema.toFixed(2);}
    if(pending){pending=false;resize()}if(!visible||document.hidden){requestAnimationFrame(frame);return}

    const t=reduced.matches?0:now*.001;surge*=Math.pow(.14,dt/1000);energy+=(.48+surge*.36-energy)*Math.min(1,dt*.003);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const B=base(t);gl.depthMask(false);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    drawMesh(shell,B,.94,[.035,.86,1.08],t,.20);
    drawMesh(shell,mul(B,sc(.88,.88,.88)),.34,[.06,.62,1.08],t,.28);
    drawMesh(shell,mul(B,sc(.74,.74,.74)),.17,[.66,.10,1.08],t,.22);

    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    drawMesh(shell,mul(B,sc(1.010,1.010,1.016)),.26,[.055,.98,1.08],t,.68);
    drawMesh(shell,mul(B,sc(.982,.982,.982)),.16,[.70,.10,1.10],t,.44);
    drawLines(shell,B,.155,[.24,1.00,1.08]);
    drawLines(shell,mul(B,rz(.0024)),.060,[.78,.16,1.05]);

    const drift=reduced.matches?[0,0,.050]:[Math.sin(t*.67)*.014,Math.cos(t*.53)*.011,.050+Math.sin(t*.61)*.014];
    const C=mul(B,tr(...drift)),pulse=reduced.matches?1:1+Math.sin(t*2.15)*.040+Math.sin(t*4.3)*.014;
    drawMesh(ball,mul(C,sc(.055*pulse,.055*pulse,.055*pulse)),1.00,[1.20,1.38,1.42],t,.92);
    drawMesh(ball,mul(C,sc(.112*pulse,.112*pulse,.112*pulse)),.40,[.16,1.06,1.04],t,.94);
    drawMesh(ball,mul(C,sc(.185*pulse,.185*pulse,.185*pulse)),.16,[.10,.80,1.04],t,.74);

    const rs=[.18,.245,.325,.415,.515],tilt=[[0,0,0],[.12,.035,.02],[-.10,.08,-.025],[.05,-.12,.03],[-.06,.14,-.02]],alpha=[.40,.33,.26,.19,.13];
    for(let i=0;i<rs.length;i++){
      const wob=reduced.matches?1:1+Math.sin(t*1.12+i*.72)*.006,q=rs[i]*wob,r=tilt[i];
      const M=mul(C,compose(rx(r[0]),ry(r[1]),rz(r[2]+t*(i%2?-.034:.030)),sc(q,q,q)));
      drawMesh(ring,M,alpha[i],i===3?[.68,.10,1.05]:[.06,.96,1.04],t,.80);
    }
    for(const o of[[.72,.40,.22,t*.018,[.05,.78,1.04],.052],[.84,-.26,.44,-t*.015,[.70,.10,1.05],.042],[.93,.58,-.16,t*.012,[.10,.82,1.04],.032]]){
      drawMesh(ring,mul(B,compose(rx(o[1]),ry(o[2]),rz(o[3]),sc(o[0],o[0],o[0]))),o[5],o[4],t,.52);
    }
    gl.depthMask(true);requestAnimationFrame(frame);
  }

  addEventListener('pointermove',e=>{if(reduced.matches)return;targetX=clamp((e.clientX/Math.max(1,innerWidth)-.5)*2,-1,1);targetY=clamp((e.clientY/Math.max(1,innerHeight)-.5)*2,-1,1);},{passive:true});
  addEventListener('resize',()=>{pending=true},{passive:true});visualViewport?.addEventListener('resize',()=>{pending=true},{passive:true});
  for(const n of['formatx:organismactivation','formatx:organismresponse','formatx:organismspeech','formatx:corewake'])addEventListener(n,()=>{surge=Math.max(surge,n.includes('speech')?.84:.68)});
  const hero=document.getElementById('hero');
  if(hero&&'IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting&&e.intersectionRatio>.01);},{threshold:[0,.01,.08]}).observe(hero);
  canvas.addEventListener('webglcontextlost',()=>{run=false},{once:true});

  root.dataset.fxMagReferenceV43='ready';
  root.dataset.fxCoreVisualRevision='v43-reference-crystal-native';
  root.dataset.fxCoreReferenceMaterial='faceted-fresnel-glass-v43';
  root.dataset.fxCoreReferenceGeometry='sharp-four-tip-crystal-v43';
  root.dataset.fxCoreInternalReactor='bright-orb-five-rings-v43';
  root.dataset.fxCoreOverlayMode='none-native-webgl-only';
  resize();requestAnimationFrame(frame);
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}());
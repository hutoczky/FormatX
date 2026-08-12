(function () {
  'use strict';

  const root = document.documentElement;
  const mode = root.dataset.fxCoreRendererMode === 'mobile' ? 'mobile' : 'desktop';
  const mobile = mode === 'mobile';
  const READY = 'reference-core-cinematic-v1';

  if (root.dataset.fxReferenceCoreCinematic === READY) return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxReferenceCoreCinematic = 'audit-skip';
    return;
  }
  if (typeof WebGL2RenderingContext === 'undefined') {
    root.dataset.fxReferenceCoreCinematic = 'webgl2-unavailable';
    return;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const I = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  function mul(a,b){
    const o=new Float32Array(16);
    for(let c=0;c<4;c++) for(let r=0;r<4;r++) {
      o[r+c*4]=a[r]*b[c*4]+a[r+4]*b[c*4+1]+a[r+8]*b[c*4+2]+a[r+12]*b[c*4+3];
    }
    return o;
  }
  const C=(...m)=>m.reduce((a,b)=>mul(a,b),I());
  function tr(x,y,z){const o=I();o[12]=x;o[13]=y;o[14]=z;return o;}
  function sc(x,y,z){const o=I();o[0]=x;o[5]=y;o[10]=z;return o;}
  function rx(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o;}
  function ry(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o;}
  function rz(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o;}
  function persp(fov,aspect,near,far){
    const f=1/Math.tan(fov/2),nf=1/(near-far),o=new Float32Array(16);
    o[0]=f/aspect;o[5]=f;o[10]=(far+near)*nf;o[11]=-1;o[14]=2*far*near*nf;
    return o;
  }
  function normal(a,b,c){
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
    const vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;
    const l=Math.hypot(x,y,z)||1;
    return [x/l,y/l,z/l];
  }

  function outlineRadius(t) {
    const ax=Math.abs(Math.cos(t)), ay=Math.abs(Math.sin(t));
    const cardinal=Math.pow(Math.max(ax,ay),18);
    const diagonal=Math.pow(Math.abs(Math.sin(t*2)),1.22);
    const vertical=1+0.16*Math.pow(ay,8);
    return (0.59 + 0.79*cardinal - 0.17*diagonal) * vertical;
  }
  function surfacePoint(t,u,side) {
    const eased=Math.pow(u,0.78);
    const edge=outlineRadius(t);
    const diagonal=Math.pow(Math.abs(Math.sin(t*2)),1.15);
    const facet=1 + 0.035*Math.cos(t*8)*(1-u) + 0.018*Math.cos(t*16+u*7);
    const r=edge*eased*facet;
    const lens=Math.pow(Math.sin(Math.PI*u),0.66);
    const z=side*(0.075*(1-u)+0.34*lens*(1-0.19*diagonal));
    return [r*Math.cos(t), r*Math.sin(t), z];
  }
  function buildShell(A=mobile?64:96,R=mobile?7:10) {
    const d=[];
    function tri(a,b,c,flip=false){
      const n=normal(a,b,c);
      if(flip){n[0]*=-1;n[1]*=-1;n[2]*=-1;}
      for(const p of [a,b,c]) d.push(...p,...n);
    }
    function quad(a,b,c,e,flip=false){
      if(flip){tri(a,c,b,true);tri(a,e,c,true);}
      else {tri(a,b,c);tri(a,c,e);}
    }
    for(const side of [-1,1]) {
      for(let j=0;j<R;j++) {
        const u0=j/R,u1=(j+1)/R;
        for(let i=0;i<A;i++) {
          const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;
          quad(surfacePoint(t0,u0,side),surfacePoint(t0,u1,side),surfacePoint(t1,u1,side),surfacePoint(t1,u0,side),side<0);
        }
      }
    }
    for(let i=0;i<A;i++) {
      const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;
      quad(surfacePoint(t0,1,1),surfacePoint(t0,1,-1),surfacePoint(t1,1,-1),surfacePoint(t1,1,1));
    }
    return new Float32Array(d);
  }
  function starContour(u,segments=mobile?72:108,z=0.025) {
    const d=[];
    for(let i=0;i<segments;i++) {
      const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
      const pa=surfacePoint(a,u,1),pb=surfacePoint(b,u,1);
      pa[2]+=z;pb[2]+=z;d.push(...pa,...pb);
    }
    return new Float32Array(d);
  }
  function radialFacets() {
    const d=[];
    const rayCount=16;
    for(let i=0;i<rayCount;i++) {
      const t=i/rayCount*Math.PI*2;
      let prev=surfacePoint(t,.12,1);prev[2]+=.03;
      for(let j=1;j<=8;j++) {
        const next=surfacePoint(t,.12+.88*j/8,1);next[2]+=.03;
        d.push(...prev,...next);prev=next;
      }
    }
    return new Float32Array(d);
  }
  function ring(rad,segments=mobile?72:112,z=.39) {
    const d=[];
    for(let i=0;i<segments;i++) {
      const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
      d.push(Math.cos(a)*rad,Math.sin(a)*rad,z,Math.cos(b)*rad,Math.sin(b)*rad,z);
    }
    return new Float32Array(d);
  }
  function arc(rad,start,len,segments=mobile?44:68,z=.40) {
    const d=[];
    for(let i=0;i<segments;i++) {
      const a=start+len*i/segments,b=start+len*(i+1)/segments;
      d.push(Math.cos(a)*rad,Math.sin(a)*rad,z,Math.cos(b)*rad,Math.sin(b)*rad,z);
    }
    return new Float32Array(d);
  }
  function crossRays() {
    return new Float32Array([
      -1.58,0,.41, 1.58,0,.41,
      0,-1.82,.41, 0,1.82,.41,
      -.70,-.70,.39, .70,.70,.39,
      -.70,.70,.39, .70,-.70,.39
    ]);
  }
  function particles(count=mobile?70:130) {
    const d=[];
    let seed=24681357;
    const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    for(let i=0;i<count;i++){
      const a=rand()*Math.PI*2;
      const r=.72+rand()*.88;
      const yStretch=.78+rand()*.36;
      d.push(Math.cos(a)*r,Math.sin(a)*r*yStretch,(rand()-.5)*.55+.05);
    }
    return new Float32Array(d);
  }

  function boot(attempt=0) {
    const hero=document.getElementById('hero');
    const host=hero?.querySelector('.hero-space');
    if(!hero || (mobile && !host)) {
      if(attempt<120){requestAnimationFrame(()=>boot(attempt+1));return;}
      root.dataset.fxReferenceCoreCinematic='host-unavailable';
      return;
    }

    document.querySelectorAll('.fx-core-reference-v53-stage,.fx-core-mobile-v55-stage').forEach(n=>n.remove());

    const stage=document.createElement('div');
    stage.className=mobile?'fx-core-mobile-v55-stage':'fx-core-reference-v53-stage';
    stage.dataset.active='true';
    stage.setAttribute('aria-hidden','true');

    const canvas=document.createElement('canvas');
    canvas.className=mobile?'fx-core-mobile-v55-canvas':'fx-core-reference-v53-canvas';
    canvas.setAttribute('aria-hidden','true');
    stage.appendChild(canvas);
    (mobile?host:document.body).prepend(stage);

    let gl;
    try {
      gl=canvas.getContext('webgl2',{
        alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:true,
        preserveDrawingBuffer:false,powerPreference:mobile?'default':'high-performance',desynchronized:true
      });
    } catch(e) {}
    if(!gl){stage.remove();root.dataset.fxReferenceCoreCinematic='context-unavailable';return;}

    const VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP,uM;
uniform float uT,uEnergy;
out vec3 vP,vW,vN;
void main(){
  vec3 p=aP;
  float ang=atan(p.y,p.x);
  float ripple=1.0+sin(uT*0.72+ang*4.0+length(p.xy)*8.0)*(.0025+.006*uEnergy);
  p.xy*=ripple;
  p.z*=1.0+sin(uT*.51+ang*3.0)*(.008+.018*uEnergy);
  vec4 w=uM*vec4(p,1.0);
  vP=p;vW=w.xyz;vN=normalize(transpose(inverse(mat3(uM)))*aN);
  gl_Position=uP*w;
}`;
    const FS=`#version 300 es
precision highp float;
in vec3 vP,vW,vN;
uniform float uT,uAlpha,uEnergy,uPhase;
out vec4 O;
float sat(float x){return clamp(x,0.0,1.0);}
void main(){
  vec3 N=normalize(vN),V=normalize(-vW);
  vec3 L1=normalize(vec3(-.55,.78,.92)),L2=normalize(vec3(.76,-.20,.66));
  float ndv=abs(dot(N,V));
  float fres=pow(1.0-sat(ndv),1.25);
  float d1=sat(dot(N,L1)),d2=sat(dot(N,L2));
  float spec=pow(sat(dot(N,normalize(L1+V))),72.0);
  float a=atan(vP.y,vP.x),r=length(vP.xy);
  float vein=.5+.5*cos(a*8.0+r*19.0-vP.z*13.0-uT*.74+uPhase);
  float vein2=.5+.5*cos(a*4.0-r*11.0+vP.z*17.0+uT*.42-uPhase*.6);
  float facet=.5+.5*cos(a*16.0+r*8.0-uT*.16);
  float hot=smoothstep(.93,1.0,vein)*(.55+.45*smoothstep(.72,1.0,facet));
  float violet=smoothstep(.94,1.0,vein2);
  vec3 cyan=vec3(.02,.92,1.55);
  vec3 blue=vec3(.01,.20,.86);
  vec3 vio=vec3(.75,.08,1.34);
  vec3 ice=vec3(.88,1.08,1.20);
  vec3 col=blue*(.12+.16*d2)
          +cyan*(.16+.62*fres+.22*d1+.62*hot)
          +vio*(.05+.48*violet+.10*uEnergy)
          +ice*(.035+.78*spec+.26*fres);
  float alpha=uAlpha*sat(.105+.43*fres+.085*d1+.085*spec+.11*hot+.075*violet);
  alpha*=1.0+.34*uEnergy;
  O=vec4(col*alpha,alpha);
}`;
    const LVS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
uniform mat4 uP,uM;
uniform float uPoint;
void main(){gl_Position=uP*uM*vec4(aP,1.0);gl_PointSize=uPoint;}`;
    const LFS=`#version 300 es
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uRound;
out vec4 O;
void main(){
  float a=uAlpha;
  if(uRound>0.5){
    vec2 p=gl_PointCoord*2.0-1.0;
    float d=dot(p,p);
    if(d>1.0) discard;
    a*=pow(1.0-d,1.8);
  }
  O=vec4(uColor*a,a);
}`;

    function shader(type,src){
      const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)||'shader');
      return s;
    }
    function program(v,f){
      const p=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,v),fs=shader(gl.FRAGMENT_SHADER,f);
      gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);
      gl.deleteShader(vs);gl.deleteShader(fs);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)||'link');
      return p;
    }

    let shellProgram,lineProgram;
    try { shellProgram=program(VS,FS); lineProgram=program(LVS,LFS); }
    catch(e){stage.remove();root.dataset.fxReferenceCoreCinematic='shader-failed';return;}

    function uploadShell(data){
      const vao=gl.createVertexArray();gl.bindVertexArray(vao);
      const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
      gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
      gl.bindVertexArray(null);
      return {vao,count:data.length/6};
    }
    function uploadLine(data){
      const vao=gl.createVertexArray();gl.bindVertexArray(vao);
      const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);
      gl.bindVertexArray(null);
      return {vao,count:data.length/3};
    }

    const shell=uploadShell(buildShell());
    const facets=uploadLine(radialFacets());
    const contours=[.34,.52,.69,.84,1].map(u=>uploadLine(starContour(u)));
    const innerRings=[.14,.21,.29,.38,.48].map(r=>uploadLine(ring(r)));
    const outerArcs=[
      uploadLine(arc(.61,.12,2.78)),uploadLine(arc(.72,2.25,2.38)),
      uploadLine(arc(.82,4.02,1.95)),uploadLine(arc(.92,5.18,1.28))
    ];
    const cross=uploadLine(crossRays());
    const dust=uploadLine(particles());
    const center=uploadLine(new Float32Array([0,0,.46]));

    const SU={
      P:gl.getUniformLocation(shellProgram,'uP'),M:gl.getUniformLocation(shellProgram,'uM'),
      T:gl.getUniformLocation(shellProgram,'uT'),A:gl.getUniformLocation(shellProgram,'uAlpha'),
      E:gl.getUniformLocation(shellProgram,'uEnergy'),Q:gl.getUniformLocation(shellProgram,'uPhase')
    };
    const LU={
      P:gl.getUniformLocation(lineProgram,'uP'),M:gl.getUniformLocation(lineProgram,'uM'),
      C:gl.getUniformLocation(lineProgram,'uColor'),A:gl.getUniformLocation(lineProgram,'uAlpha'),
      S:gl.getUniformLocation(lineProgram,'uPoint'),R:gl.getUniformLocation(lineProgram,'uRound')
    };

    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0,0,0,0);

    let P=I(),dpr=1,renderScale=1,last=performance.now(),ema=16.7,frames=0;
    let targetX=0,targetY=0,pointerX=0,pointerY=0,energy=0,visible=true,raf=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');

    const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};
    cinematic.version='reference-four-point-crystal-v1';
    cinematic.corePosition=[0,0,0];
    cinematic.energy=0;

    function view(){
      if(mobile){
        const r=stage.getBoundingClientRect();
        return {w:Math.max(1,r.width||host.clientWidth),h:Math.max(1,r.height||host.clientHeight)};
      }
      return {w:Math.max(1,innerWidth),h:Math.max(1,visualViewport?.height||innerHeight)};
    }
    function resize(){
      const {w,h}=view(),cap=mobile?1.30:1.70,budget=mobile?1100000:2500000;
      dpr=Math.min(devicePixelRatio||1,cap)*renderScale;
      const pixels=w*h*dpr*dpr;
      if(pixels>budget)dpr*=Math.sqrt(budget/pixels);
      dpr=clamp(dpr,.72,cap);
      const cw=Math.max(1,Math.round(w*dpr)),ch=Math.max(1,Math.round(h*dpr));
      if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
      gl.viewport(0,0,cw,ch);
      P=persp((mobile?36.5:38)*Math.PI/180,w/h,.1,30);
    }
    function base(t){
      const {w,h}=view();
      const idle=reduced.matches?0:t;
      const portrait=mobile||h>w*1.08;
      const pulse=1+energy*.035;
      const scale=(mobile?.63:portrait?.62:.66)*pulse;
      const x=mobile?0:.58;
      const z=mobile?-3.18:-3.58;
      return C(
        tr(x,mobile?.01:.015,z),
        rx(-.045-pointerY*.24+Math.sin(idle*.20)*.012),
        ry(.075+pointerX*.31+Math.sin(idle*.17)*.025),
        rz(Math.sin(idle*.13)*.008+pointerX*.018),
        sc(scale,scale*1.04,scale*.98)
      );
    }
    function shellPass(m,t,alpha,phase){
      gl.useProgram(shellProgram);
      gl.uniformMatrix4fv(SU.P,false,P);gl.uniformMatrix4fv(SU.M,false,m);
      gl.uniform1f(SU.T,t);gl.uniform1f(SU.A,alpha);gl.uniform1f(SU.E,energy);gl.uniform1f(SU.Q,phase);
      gl.bindVertexArray(shell.vao);gl.drawArrays(gl.TRIANGLES,0,shell.count);
    }
    function linePass(g,m,color,alpha,drawMode=gl.LINES,point=1,round=0){
      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(LU.P,false,P);gl.uniformMatrix4fv(LU.M,false,m);
      gl.uniform3fv(LU.C,color);gl.uniform1f(LU.A,alpha);
      gl.uniform1f(LU.S,point);gl.uniform1f(LU.R,round);
      gl.bindVertexArray(g.vao);gl.drawArrays(drawMode,0,g.count);
    }
    const cyan=new Float32Array([.04,.86,1.38]);
    const ice=new Float32Array([.74,1.04,1.18]);
    const violet=new Float32Array([.72,.10,1.25]);
    const blue=new Float32Array([.04,.26,.92]);
    const white=new Float32Array([1,1,1]);

    function render(now){
      raf=requestAnimationFrame(render);
      if(!visible||document.hidden)return;
      const dt=Math.min(50,now-last);last=now;
      ema=ema*.94+dt*.06;frames++;
      if(frames%90===0){
        if(ema>21&&renderScale>.76){renderScale=Math.max(.76,renderScale-.08);resize();}
        else if(ema<16.8&&renderScale<1){renderScale=Math.min(1,renderScale+.04);resize();}
      }
      pointerX+=(targetX-pointerX)*.085;
      pointerY+=(targetY-pointerY)*.085;
      targetX*=.993;targetY*=.993;
      energy*=reduced.matches?.93:.965;
      cinematic.energy=energy;

      const t=now*.001;
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const m=base(t);

      gl.depthMask(false);
      shellPass(C(m,sc(1.012,1.012,1.012)),t,.82,.0);
      shellPass(C(m,rz(Math.PI/4),sc(.79,.79,.90)),t,.34,1.8);

      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      linePass(facets,m,cyan,.28+.26*energy);
      contours.forEach((g,i)=>linePass(g,m,i%2?violet:cyan,.19+i*.035+.18*energy));
      linePass(cross,m,ice,.52+.30*energy);

      innerRings.forEach((g,i)=>{
        const rm=C(m,rz((i%2?1:-1)*t*(.20+i*.035)+i*.38),rx((i-2)*.025));
        linePass(g,rm,i%2?violet:cyan,.32+.055*i+.24*energy);
      });
      outerArcs.forEach((g,i)=>{
        const rm=C(m,rz((i%2?1:-1)*t*(.12+i*.028)+i*1.17),ry((i-1.5)*.045));
        linePass(g,rm,i%2?violet:blue,.22+.06*i+.20*energy);
      });

      linePass(dust,C(m,rz(-t*.035)),cyan,.26+.12*energy,gl.POINTS,mobile?1.35:1.7,1);
      linePass(center,m,cyan,.20+.24*energy,gl.POINTS,mobile?92:132,1);
      linePass(center,m,ice,.78+.20*energy,gl.POINTS,mobile?26:34,1);
      linePass(center,m,white,1,gl.POINTS,mobile?8:11,1);

      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(true);
    }

    function interaction(e){
      const d=e.detail||{};
      if(Number.isFinite(d.x))targetX=clamp(d.x,-1,1);
      if(Number.isFinite(d.y))targetY=clamp(d.y,-1,1);
      const phase=String(d.phase||'');
      let add=.28;
      if(phase==='burst')add=1;
      else if(phase==='press'||phase==='press-sustain')add=.70;
      else if(phase==='drag')add=.36;
      else if(phase==='hover')add=.20;
      energy=clamp(Math.max(energy,add),0,1);
    }
    addEventListener('formatx:coreinteraction',interaction,{passive:true});
    addEventListener('formatx:organismcoreactivate',e=>{
      const d=e.detail||{};
      if(Number.isFinite(d.x))targetX=clamp(d.x,-1,1);
      if(Number.isFinite(d.y))targetY=clamp(d.y,-1,1);
      energy=Math.max(energy,String(d.phase||'')==='burst'?1:.48);
    },{passive:true});

    const io=new IntersectionObserver(entries=>{
      visible=entries.some(e=>e.isIntersecting);
      stage.dataset.active=visible?'true':'false';
      if(visible)last=performance.now();
    },{rootMargin:'18% 0px'});
    io.observe(hero);

    addEventListener('resize',resize,{passive:true});
    visualViewport?.addEventListener('resize',resize,{passive:true});
    canvas.addEventListener('webglcontextlost',e=>{
      e.preventDefault();cancelAnimationFrame(raf);
      root.dataset.fxReferenceCoreCinematic='context-lost';
    },{passive:false});

    resize();
    root.dataset.fxReferenceCoreCinematic=READY;
    if(mobile){
      root.dataset.fxCoreMobileV55='ready-v55';
      root.dataset.fxCoreReferenceLock='ready-v55';
      root.dataset.fxCoreReal3d='ready-v20';
    } else {
      root.dataset.fxCoreReferenceV53='ready-v53';
      root.dataset.fxCoreReferenceLock='ready-v53';
      root.dataset.fxCoreReal3d='ready-v20';
    }
    dispatchEvent(new CustomEvent('formatx:core3dready',{detail:{renderer:'reference-four-point-crystal-v1',mode}}));
    raf=requestAnimationFrame(render);
  }

  boot();
}());
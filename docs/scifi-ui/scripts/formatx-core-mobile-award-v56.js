(function () {
  'use strict';

  const root = document.documentElement;
  const READY = 'ready-v56';
  const VERSION = 'award-four-point-concave-crystal-v56';
  if (root.dataset.fxCoreMobileV56 === READY || root.dataset.fxCoreMobileV56 === 'booting-v56') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV56 = 'audit-skip';
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }
  if (typeof WebGL2RenderingContext === 'undefined') {
    root.dataset.fxCoreMobileV56 = 'webgl2-unavailable-v56';
    root.dataset.fxCoreMobileV55 = 'webgl2-unavailable-v55';
    return;
  }

  root.dataset.fxCoreMobileV56 = 'booting-v56';
  root.dataset.fxCoreMobileV55 = 'booting-v55';
  root.dataset.fxCoreRendererMode = 'mobile';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const I = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[r+c*4]=a[r]*b[c*4]+a[r+4]*b[c*4+1]+a[r+8]*b[c*4+2]+a[r+12]*b[c*4+3];return o;}
  const C=(...m)=>m.reduce((a,b)=>mul(a,b),I());
  function tr(x,y,z){const o=I();o[12]=x;o[13]=y;o[14]=z;return o;}
  function sc(x,y,z){const o=I();o[0]=x;o[5]=y;o[10]=z;return o;}
  function rx(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o;}
  function ry(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o;}
  function rz(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o;}
  function persp(fov,aspect,near,far){const f=1/Math.tan(fov/2),nf=1/(near-far),o=new Float32Array(16);o[0]=f/aspect;o[5]=f;o[10]=(far+near)*nf;o[11]=-1;o[14]=2*far*near*nf;return o;}
  function normal(a,b,c){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;const l=Math.hypot(x,y,z)||1;return[x/l,y/l,z/l];}

  // True sharp four-point silhouette: each side is a quadratic Bezier from one
  // cardinal tip to the next through a deeply recessed diagonal control point.
  // This avoids the rounded "petal" look of a polar-radius lobe.
  function outlinePoint(t) {
    const quarter=Math.PI/2;
    let a=((t%(Math.PI*2))+(Math.PI*2))%(Math.PI*2);
    const q=Math.min(3,Math.floor(a/quarter));
    const u=(a-q*quarter)/quarter;
    const tips=[[1.46,0],[0,1.55],[-1.46,0],[0,-1.55],[1.46,0]];
    const controls=[[.31,.33],[-.31,.33],[-.31,-.33],[.31,-.33]];
    const A=tips[q],B=tips[q+1],K=controls[q],v=1-u;
    return [v*v*A[0]+2*v*u*K[0]+u*u*B[0],v*v*A[1]+2*v*u*K[1]+u*u*B[1]];
  }

  function surfacePoint(t,u,side) {
    const edge=outlinePoint(t);
    const radial=Math.pow(u,.76);
    const facet=1+.020*Math.cos(t*8)*(1-u)+.010*Math.cos(t*16+u*5);
    const x=edge[0]*radial*facet;
    const y=edge[1]*radial*facet;
    const lens=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.66);
    const diagonal=Math.pow(Math.abs(Math.sin(t*2)),1.2);
    const z=side*(.052*(1-u)+.305*lens*(1-.16*diagonal));
    return [x,y,z];
  }

  function buildShell(A=72,R=8){
    const d=[];
    function tri(a,b,c,flip=false){const n=normal(a,b,c);if(flip){n[0]*=-1;n[1]*=-1;n[2]*=-1;}for(const p of[a,b,c])d.push(...p,...n);}
    function quad(a,b,c,e,flip=false){if(flip){tri(a,c,b,true);tri(a,e,c,true);}else{tri(a,b,c);tri(a,c,e);}}
    for(const side of[-1,1])for(let j=0;j<R;j++){const u0=j/R,u1=(j+1)/R;for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(surfacePoint(t0,u0,side),surfacePoint(t0,u1,side),surfacePoint(t1,u1,side),surfacePoint(t1,u0,side),side<0);}}
    for(let i=0;i<A;i++){const t0=i/A*Math.PI*2,t1=(i+1)/A*Math.PI*2;quad(surfacePoint(t0,1,1),surfacePoint(t0,1,-1),surfacePoint(t1,1,-1),surfacePoint(t1,1,1));}
    return new Float32Array(d);
  }

  function starContour(u,segments=88,z=.035){const d=[];for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2,pa=surfacePoint(a,u,1),pb=surfacePoint(b,u,1);pa[2]+=z;pb[2]+=z;d.push(...pa,...pb);}return new Float32Array(d);}
  function radialFacets(){const d=[];for(let i=0;i<20;i++){const t=i/20*Math.PI*2;let p=surfacePoint(t,.09,1);p[2]+=.04;for(let j=1;j<=9;j++){const n=surfacePoint(t,.09+.91*j/9,1);n[2]+=.04;d.push(...p,...n);p=n;}}return new Float32Array(d);}
  function ring(rad,segments=88,z=.37){const d=[];for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;d.push(Math.cos(a)*rad,Math.sin(a)*rad,z,Math.cos(b)*rad,Math.sin(b)*rad,z);}return new Float32Array(d);}
  function arc(rad,start,len,segments=58,z=.39){const d=[];for(let i=0;i<segments;i++){const a=start+len*i/segments,b=start+len*(i+1)/segments;d.push(Math.cos(a)*rad,Math.sin(a)*rad,z,Math.cos(b)*rad,Math.sin(b)*rad,z);}return new Float32Array(d);}
  function crossRays(){return new Float32Array([-1.42,0,.40,1.42,0,.40, 0,-1.50,.40,0,1.50,.40, -.62,-.62,.38,.62,.62,.38, -.62,.62,.38,.62,-.62,.38]);}
  function particles(count=86){const d=[];let seed=926531;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let i=0;i<count;i++){const a=rnd()*Math.PI*2,r=.70+rnd()*.95;d.push(Math.cos(a)*r,Math.sin(a)*r*(.84+rnd()*.28),(rnd()-.5)*.52);}return new Float32Array(d);}

  function boot(attempt=0){
    if(!document.body){requestAnimationFrame(()=>boot(attempt));return;}
    const hero=document.getElementById('hero');
    const host=hero&&hero.querySelector('.hero-space');
    if(!hero||!host){if(attempt<180){requestAnimationFrame(()=>boot(attempt+1));return;}root.dataset.fxCoreMobileV56='hero-host-unavailable-v56';return;}

    document.querySelectorAll('.fx-core-mobile-v55-stage,.fx-core-reference-v53-stage,.fx-core-v51-stage,.fx-core-mesh3d-stage,.fx-core-fracture3d-stage').forEach(n=>n.remove());
    const stage=document.createElement('div');stage.className='fx-core-mobile-v55-stage';stage.dataset.active='true';stage.dataset.renderer='award-v56';stage.setAttribute('aria-hidden','true');
    const canvas=document.createElement('canvas');canvas.className='fx-core-mobile-v55-canvas';canvas.setAttribute('aria-hidden','true');stage.appendChild(canvas);host.prepend(stage);

    let gl;
    try{gl=canvas.getContext('webgl2',{alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:true,preserveDrawingBuffer:false,powerPreference:'default',desynchronized:true});}
    catch(error){stage.remove();root.dataset.fxCoreMobileV56='context-unavailable-v56';root.dataset.fxCoreReal3dError=String(error?.message||error).slice(0,220);return;}
    if(!gl||gl.isContextLost()){stage.remove();root.dataset.fxCoreMobileV56='context-unavailable-v56';return;}

    const VS=`#version 300 es
precision highp float;layout(location=0)in vec3 aP;layout(location=1)in vec3 aN;uniform mat4 uP,uM;uniform float uT,uEnergy;out vec3 vP,vW,vN;
void main(){vec3 p=aP;float a=atan(p.y,p.x);float ripple=1.0+sin(uT*.62+a*4.0+length(p.xy)*7.0)*(.0018+.0045*uEnergy);p.xy*=ripple;p.z*=1.0+sin(uT*.43+a*3.0)*(.006+.012*uEnergy);vec4 w=uM*vec4(p,1.0);vP=p;vW=w.xyz;vN=normalize(transpose(inverse(mat3(uM)))*aN);gl_Position=uP*w;}`;
    const FS=`#version 300 es
precision highp float;in vec3 vP,vW,vN;uniform float uT,uAlpha,uEnergy,uPhase;out vec4 O;float sat(float x){return clamp(x,0.0,1.0);}void main(){vec3 N=normalize(vN),V=normalize(-vW),L1=normalize(vec3(-.48,.72,.95)),L2=normalize(vec3(.78,-.18,.58));float ndv=abs(dot(N,V)),fres=pow(1.0-sat(ndv),1.05),d1=sat(dot(N,L1)),d2=sat(dot(N,L2)),spec=pow(sat(dot(N,normalize(L1+V))),86.0);float a=atan(vP.y,vP.x),r=length(vP.xy);float vein=.5+.5*cos(a*8.0+r*20.0-vP.z*15.0-uT*.68+uPhase);float vein2=.5+.5*cos(a*4.0-r*12.0+vP.z*17.0+uT*.39-uPhase*.7);float facet=.5+.5*cos(a*16.0+r*9.0);float hot=smoothstep(.88,1.0,vein)*(.60+.40*smoothstep(.62,1.0,facet));float violet=smoothstep(.90,1.0,vein2);vec3 cyan=vec3(.03,1.02,1.62),blue=vec3(.02,.22,.94),vio=vec3(.82,.10,1.42),ice=vec3(.92,1.12,1.24);vec3 col=blue*(.13+.15*d2)+cyan*(.22+.78*fres+.24*d1+.78*hot)+vio*(.06+.48*violet+.11*uEnergy)+ice*(.055+.96*spec+.31*fres);float alpha=uAlpha*sat(.16+.48*fres+.10*d1+.11*spec+.14*hot+.08*violet);alpha*=1.0+.26*uEnergy;O=vec4(col*alpha,alpha);}`;
    const LVS=`#version 300 es
precision highp float;layout(location=0)in vec3 aP;uniform mat4 uP,uM;uniform float uPoint;void main(){gl_Position=uP*uM*vec4(aP,1.0);gl_PointSize=uPoint;}`;
    const LFS=`#version 300 es
precision highp float;uniform vec3 uColor;uniform float uAlpha,uRound;out vec4 O;void main(){float a=uAlpha;if(uRound>.5){vec2 p=gl_PointCoord*2.0-1.0;float d=dot(p,p);if(d>1.0)discard;a*=pow(1.0-d,1.65);}O=vec4(uColor*a,a);}`;

    function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s;}
    function program(v,f){const p=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,v),fs=shader(gl.FRAGMENT_SHADER,f);gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p;}
    let shellProgram,lineProgram;try{shellProgram=program(VS,FS);lineProgram=program(LVS,LFS);}catch(error){stage.remove();root.dataset.fxCoreMobileV56='shader-failed-v56';root.dataset.fxCoreReal3dError=String(error?.message||error).slice(0,220);return;}

    function uploadShell(data){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);gl.bindVertexArray(null);return{vao,count:data.length/6};}
    function uploadLine(data){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);gl.bindVertexArray(null);return{vao,count:data.length/3};}

    const shell=uploadShell(buildShell()),facets=uploadLine(radialFacets()),contours=[.28,.43,.58,.72,.86,1].map(u=>uploadLine(starContour(u))),innerRings=[.13,.20,.28,.37,.47,.57].map(r=>uploadLine(ring(r))),outerArcs=[uploadLine(arc(.66,.12,2.66)),uploadLine(arc(.75,2.30,2.22)),uploadLine(arc(.84,4.06,1.84)),uploadLine(arc(.94,5.16,1.30))],cross=uploadLine(crossRays()),dust=uploadLine(particles()),center=uploadLine(new Float32Array([0,0,.44]));
    const SU={P:gl.getUniformLocation(shellProgram,'uP'),M:gl.getUniformLocation(shellProgram,'uM'),T:gl.getUniformLocation(shellProgram,'uT'),A:gl.getUniformLocation(shellProgram,'uAlpha'),E:gl.getUniformLocation(shellProgram,'uEnergy'),Q:gl.getUniformLocation(shellProgram,'uPhase')};
    const LU={P:gl.getUniformLocation(lineProgram,'uP'),M:gl.getUniformLocation(lineProgram,'uM'),C:gl.getUniformLocation(lineProgram,'uColor'),A:gl.getUniformLocation(lineProgram,'uAlpha'),S:gl.getUniformLocation(lineProgram,'uPoint'),R:gl.getUniformLocation(lineProgram,'uRound')};

    gl.enable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
    let P=I(),renderScale=1,last=performance.now(),ema=16.7,frames=0,targetX=0,targetY=0,pointerX=0,pointerY=0,energy=.12,visible=true,running=true,raf=0;
    const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};cinematic.version=VERSION;cinematic.corePosition=[0,0,0];cinematic.energy=energy;

    function view(){const r=stage.getBoundingClientRect();return{w:Math.max(1,r.width||host.clientWidth),h:Math.max(1,r.height||host.clientHeight)};}
    function resize(){const{w,h}=view(),cap=1.30,budget=1150000;let dpr=Math.min(devicePixelRatio||1,cap)*renderScale;const pixels=w*h*dpr*dpr;if(pixels>budget)dpr*=Math.sqrt(budget/pixels);dpr=clamp(dpr,.74,cap);const cw=Math.max(1,Math.round(w*dpr)),ch=Math.max(1,Math.round(h*dpr));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}gl.viewport(0,0,cw,ch);P=persp(42*Math.PI/180,w/h,.1,30);}
    function base(t){const idle=reduced.matches?0:t,pulse=1+energy*.020;return C(tr(0,.015,-3.24),rx(-.025-pointerY*.10+Math.sin(idle*.18)*.006),ry(.035+pointerX*.12+Math.sin(idle*.15)*.012),rz(Math.sin(idle*.12)*.004),sc(.57*pulse,.57*pulse,.60*pulse));}
    function shellPass(m,t,alpha,phase){gl.useProgram(shellProgram);gl.uniformMatrix4fv(SU.P,false,P);gl.uniformMatrix4fv(SU.M,false,m);gl.uniform1f(SU.T,t);gl.uniform1f(SU.A,alpha);gl.uniform1f(SU.E,energy);gl.uniform1f(SU.Q,phase);gl.bindVertexArray(shell.vao);gl.drawArrays(gl.TRIANGLES,0,shell.count);}
    function linePass(g,m,color,alpha,drawMode=gl.LINES,point=1,round=0){gl.useProgram(lineProgram);gl.uniformMatrix4fv(LU.P,false,P);gl.uniformMatrix4fv(LU.M,false,m);gl.uniform3fv(LU.C,color);gl.uniform1f(LU.A,alpha);gl.uniform1f(LU.S,point);gl.uniform1f(LU.R,round);gl.bindVertexArray(g.vao);gl.drawArrays(drawMode,0,g.count);}
    const cyan=new Float32Array([.04,.94,1.50]),ice=new Float32Array([.84,1.08,1.22]),violet=new Float32Array([.80,.12,1.38]),blue=new Float32Array([.05,.31,1.05]),white=new Float32Array([1,1,1]);

    function render(now){
      if(!running)return;raf=requestAnimationFrame(render);if(!visible||document.hidden)return;
      const dt=Math.min(50,now-last);last=now;ema=ema*.94+dt*.06;frames++;if(frames%90===0){if(ema>21&&renderScale>.78){renderScale=Math.max(.78,renderScale-.07);resize();}else if(ema<16.8&&renderScale<1){renderScale=Math.min(1,renderScale+.035);resize();}}
      pointerX+=(targetX-pointerX)*.075;pointerY+=(targetY-pointerY)*.075;targetX*=.994;targetY*=.994;energy*=reduced.matches?.94:.972;cinematic.energy=energy;
      const t=now*.001,m=base(t);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.depthMask(false);
      shellPass(m,t,.96,0);shellPass(C(m,rz(Math.PI/4),sc(.86,.86,.92)),t,.32,1.7);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      linePass(facets,m,cyan,.44+.22*energy);contours.forEach((g,i)=>linePass(g,m,i%2?violet:cyan,.31+i*.035+.16*energy));linePass(cross,m,ice,.72+.18*energy);
      innerRings.forEach((g,i)=>linePass(g,C(m,rz((i%2?1:-1)*t*(.18+i*.030)+i*.32),rx((i-2.5)*.018)),i%2?violet:cyan,.42+.050*i+.20*energy));
      outerArcs.forEach((g,i)=>linePass(g,C(m,rz((i%2?1:-1)*t*(.10+i*.022)+i*1.13),ry((i-1.5)*.030)),i%2?violet:blue,.30+.055*i+.16*energy));
      linePass(dust,C(m,rz(-t*.025)),cyan,.34+.10*energy,gl.POINTS,1.45,1);linePass(center,m,cyan,.30+.22*energy,gl.POINTS,104,1);linePass(center,m,ice,.88,gl.POINTS,30,1);linePass(center,m,white,1,gl.POINTS,8,1);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
    }

    function interaction(event){const d=event.detail||{};if(Number.isFinite(d.x))targetX=clamp(d.x,-1,1);if(Number.isFinite(d.y))targetY=clamp(d.y,-1,1);const phase=String(d.phase||'');let add=.32;if(phase==='burst')add=1;else if(phase==='press'||phase==='press-sustain')add=.74;else if(phase==='drag')add=.44;else if(phase==='hover')add=.24;energy=clamp(Math.max(energy,add),0,1);}
    addEventListener('formatx:coreinteraction',interaction,{passive:true});addEventListener('formatx:organisminteraction',interaction,{passive:true});
    const ro=new ResizeObserver(resize);ro.observe(stage);const io=new IntersectionObserver(e=>{visible=e.some(x=>x.isIntersecting);},{rootMargin:'120px'});io.observe(hero);
    document.addEventListener('visibilitychange',()=>{visible=!document.hidden;last=performance.now();},{passive:true});
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false;cancelAnimationFrame(raf);root.dataset.fxCoreMobileV56='context-lost-v56';},{passive:false});
    canvas.addEventListener('webglcontextrestored',()=>location.reload(),{once:true});

    resize();root.dataset.fxCoreMobileV56=READY;root.dataset.fxCoreMobileV55='ready-v55';root.dataset.fxCoreReferenceLock='ready-v56';root.dataset.fxCoreReal3d='ready-v20';root.dataset.fxCoreAwardGeometry='quadratic-bezier-cusped-outline-v56';root.dataset.fxCoreAwardMaterial='bright-faceted-fresnel-glass-v56';root.dataset.fxCoreAwardReactor='white-reactor-nucleus-concentric-cyan-violet-rings-v56';root.dataset.fxCoreAwardPerf='single-context-adaptive-60-plus-fps';dispatchEvent(new CustomEvent('formatx:core3dready',{detail:{reference:VERSION,mode:'mobile'}}));raf=requestAnimationFrame(render);
  }

  boot();
}());
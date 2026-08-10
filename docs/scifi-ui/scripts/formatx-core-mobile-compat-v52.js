(function () {
  'use strict';

  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches;
  if (!mobile || root.dataset.fxCoreMobileCompat === 'ready-v52') return;

  const READY = 'ready-v51';
  const VERSION = 'v52-mobile-safe-volumetric-crystal';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  root.dataset.fxCoreMobileCompat = 'booting-v52';

  function fail(reason, message) {
    root.dataset.fxCoreMobileCompat = reason;
    root.dataset.fxCoreV51 = reason;
    root.dataset.fxCoreReal3d = reason;
    if (message) root.dataset.fxCoreReal3dError = String(message).slice(0, 220);
    dispatchEvent(new CustomEvent('formatx:core3dfallback', {
      detail: { reason, message: message || '', reference: VERSION }
    }));
  }

  function I() {
    return new Float32Array([
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1
    ]);
  }
  function mul(a,b){
    const o=new Float32Array(16);
    for(let c=0;c<4;c+=1) for(let r=0;r<4;r+=1){
      o[r+c*4]=a[r]*b[c*4]+a[r+4]*b[c*4+1]+a[r+8]*b[c*4+2]+a[r+12]*b[c*4+3];
    }
    return o;
  }
  function tr(x,y,z){const o=I();o[12]=x;o[13]=y;o[14]=z;return o;}
  function sc(x,y,z){const o=I();o[0]=x;o[5]=y;o[10]=z;return o;}
  function rx(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o;}
  function ry(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o;}
  function rz(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o;}
  function compose(...m){return m.reduce((a,b)=>mul(a,b),I());}
  function persp(fov,aspect,near,far){
    const q=1/Math.tan(fov/2),r=1/(near-far),o=new Float32Array(16);
    o[0]=q/aspect;o[5]=q;o[10]=(far+near)*r;o[11]=-1;o[14]=2*far*near*r;
    return o;
  }

  function normal(a,b,c){
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
    const vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;
    const l=Math.hypot(x,y,z)||1;
    return[x/l,y/l,z/l];
  }

  function starRadius(theta){
    const c=Math.max(1e-5,Math.abs(Math.cos(theta)));
    const s=Math.max(1e-5,Math.abs(Math.sin(theta)));
    return 1.055*Math.pow(Math.pow(c,2/3)+Math.pow(s,2/3),-1.5);
  }

  function makeCrystal(angleSegments=72, radialSegments=8){
    const data=[];
    const inner=.10;
    function point(th,u,side){
      const curve=Math.pow(u,.82);
      const r=inner+(starRadius(th)-inner)*curve;
      const lens=Math.pow(Math.sin(Math.PI*u),.62);
      const facet=1+.10*Math.cos(th*8)+.045*Math.cos(th*16+u*4);
      const z=side*(.075+.285*lens*facet);
      const pinch=1-.035*Math.sin(Math.PI*u)*Math.cos(th*4);
      return[r*Math.cos(th)*pinch,r*Math.sin(th)*1.12*pinch,z];
    }
    function tri(a,b,c,flip){
      const n=normal(a,b,c);
      if(flip){n[0]*=-1;n[1]*=-1;n[2]*=-1;}
      for(const p of[a,b,c]) data.push(p[0],p[1],p[2],n[0],n[1],n[2]);
    }
    function quad(a,b,c,d,flip){
      if(!flip){tri(a,b,c,false);tri(a,c,d,false);}
      else{tri(a,c,b,false);tri(a,d,c,false);}
    }
    for(const side of[-1,1]){
      for(let j=0;j<radialSegments;j+=1){
        const u0=j/radialSegments,u1=(j+1)/radialSegments;
        for(let i=0;i<angleSegments;i+=1){
          const t0=i/angleSegments*Math.PI*2,t1=(i+1)/angleSegments*Math.PI*2;
          quad(point(t0,u0,side),point(t0,u1,side),point(t1,u1,side),point(t1,u0,side),side<0);
        }
      }
    }
    for(let i=0;i<angleSegments;i+=1){
      const t0=i/angleSegments*Math.PI*2,t1=(i+1)/angleSegments*Math.PI*2;
      quad(point(t0,1,1),point(t0,1,-1),point(t1,1,-1),point(t1,1,1),false);
    }
    return new Float32Array(data);
  }

  function makeWire(angleSegments=72){
    const out=[];
    const inner=.10;
    function p(th,u,z=.305){
      const r=inner+(starRadius(th)-inner)*Math.pow(u,.82);
      const pinch=1-.035*Math.sin(Math.PI*u)*Math.cos(th*4);
      return[r*Math.cos(th)*pinch,r*Math.sin(th)*1.12*pinch,z*(.35+.65*Math.sin(Math.PI*u))];
    }
    for(let spoke=0;spoke<16;spoke+=1){
      const th=spoke/16*Math.PI*2;
      for(let j=0;j<8;j+=1){out.push(...p(th,j/8),...p(th,(j+1)/8));}
    }
    for(const u of[.22,.39,.56,.74,.90,1]){
      for(let i=0;i<angleSegments;i+=1){
        out.push(...p(i/angleSegments*Math.PI*2,u),...p((i+1)/angleSegments*Math.PI*2,u));
      }
    }
    return new Float32Array(out);
  }

  function makeRing(radius,segments=96,z=.34){
    const out=[];
    for(let i=0;i<segments;i+=1){
      const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
      out.push(Math.cos(a)*radius,Math.sin(a)*radius,z,Math.cos(b)*radius,Math.sin(b)*radius,z);
    }
    return new Float32Array(out);
  }

  function start(){
    if(!document.body) return;

    document.querySelectorAll('.fx-core-real3d-stage').forEach(n=>n.remove());

    const stage=document.createElement('div');
    stage.className='fx-core-real3d-stage fx-core-v51-stage fx-core-mobile-safe-v52-stage';
    stage.dataset.active='true';
    stage.dataset.fxCoreVersion=VERSION;
    stage.dataset.fxMobileVisible='true';
    stage.setAttribute('aria-hidden','true');

    const canvas=document.createElement('canvas');
    canvas.className='fx-core-real3d-canvas fx-core-v51-canvas fx-core-mobile-safe-v52-canvas';
    canvas.setAttribute('aria-hidden','true');
    stage.append(canvas);
    document.body.append(stage);

    let gl;
    try{
      gl=canvas.getContext('webgl2',{
        alpha:true,antialias:true,depth:true,stencil:false,premultipliedAlpha:false,
        preserveDrawingBuffer:false,powerPreference:'default'
      });
    }catch(error){stage.remove();fail('context-unavailable',error?.message||error);return;}
    if(!gl){stage.remove();fail('context-unavailable');return;}

    const VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP,uM;
out vec3 vP,vN,vW;
void main(){
  vec4 w=uM*vec4(aP,1.0);
  vP=aP;
  vW=w.xyz;
  vN=normalize(mat3(uM)*aN);
  gl_Position=uP*w;
}`;

    const FS=`#version 300 es
precision highp float;
in vec3 vP,vN,vW;
uniform float uT,uAlpha;
out vec4 O;
float sat(float x){return clamp(x,0.0,1.0);}
void main(){
  vec3 N=normalize(vN);
  vec3 V=normalize(-vW);
  vec3 L1=normalize(vec3(-.55,.72,.88));
  vec3 L2=normalize(vec3(.74,-.25,.66));
  float d1=sat(dot(N,L1));
  float d2=sat(dot(N,L2));
  float fres=pow(1.0-sat(abs(dot(N,V))),2.0);
  float sp=pow(sat(dot(N,normalize(L1+V))),38.0);
  float a=atan(vP.y,vP.x),r=length(vP.xy);
  float veins=pow(.5+.5*cos(a*16.0+r*31.0+vP.z*14.0-uT*.22),18.0);
  float violet=pow(.5+.5*cos(a*8.0-r*11.0+uT*.15),10.0);
  vec3 cyan=vec3(.02,.78,1.36);
  vec3 blue=vec3(.02,.20,.82);
  vec3 purple=vec3(.68,.10,1.16);
  vec3 ice=vec3(.78,1.08,1.22);
  vec3 col=cyan*(.18+.52*d1+.28*fres+.10*veins);
  col+=blue*(.08+.18*d2);
  col+=purple*(.05+.18*violet);
  col+=ice*(.10+.88*sp+.20*pow(fres,1.5));
  float alpha=uAlpha*sat(.26+.34*fres+.16*d1+.10*d2+.11*sp+.06*veins);
  O=vec4(col,alpha);
}`;

    const LVS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
uniform mat4 uP,uM;
void main(){gl_Position=uP*uM*vec4(aP,1.0);}`;

    const LFS=`#version 300 es
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
out vec4 O;
void main(){O=vec4(uColor,uAlpha);}`;

    const PVS=`#version 300 es
precision highp float;
uniform mat4 uP,uM;
uniform float uSize;
void main(){gl_Position=uP*uM*vec4(0.0,0.0,.05,1.0);gl_PointSize=uSize;}`;

    const PFS=`#version 300 es
precision highp float;
uniform float uPulse;
out vec4 O;
void main(){
  vec2 p=gl_PointCoord*2.0-1.0;
  float r=dot(p,p);
  if(r>1.0) discard;
  float core=pow(1.0-r,4.0);
  float halo=pow(1.0-r,1.35);
  O=vec4(vec3(1.0,.98,.94)*core+vec3(.20,.85,1.0)*halo*.78,(core+.62*halo)*uPulse);
}`;

    function compile(type,source){
      const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');
      return s;
    }
    function program(vs,fs){
      const p=gl.createProgram(),a=compile(gl.VERTEX_SHADER,vs),b=compile(gl.FRAGMENT_SHADER,fs);
      gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);gl.deleteShader(a);gl.deleteShader(b);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');
      return p;
    }

    let shellProgram,lineProgram,pointProgram;
    try{
      shellProgram=program(VS,FS);
      lineProgram=program(LVS,LFS);
      pointProgram=program(PVS,PFS);
    }catch(error){stage.remove();fail('shader-failed',error?.message||error);return;}

    const shellData=makeCrystal();
    const wireData=makeWire();
    const ringData=[
      makeRing(.19),makeRing(.27),makeRing(.36),makeRing(.46),makeRing(.58)
    ];

    const shellBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,shellBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,shellData,gl.STATIC_DRAW);

    const wireBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,wireBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,wireData,gl.STATIC_DRAW);

    const ringBuffers=ringData.map(data=>{
      const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      return{buffer:b,count:data.length/3};
    });

    const SU={
      P:gl.getUniformLocation(shellProgram,'uP'),
      M:gl.getUniformLocation(shellProgram,'uM'),
      T:gl.getUniformLocation(shellProgram,'uT'),
      A:gl.getUniformLocation(shellProgram,'uAlpha')
    };
    const LU={
      P:gl.getUniformLocation(lineProgram,'uP'),
      M:gl.getUniformLocation(lineProgram,'uM'),
      C:gl.getUniformLocation(lineProgram,'uColor'),
      A:gl.getUniformLocation(lineProgram,'uAlpha')
    };
    const PU={
      P:gl.getUniformLocation(pointProgram,'uP'),
      M:gl.getUniformLocation(pointProgram,'uM'),
      S:gl.getUniformLocation(pointProgram,'uSize'),
      pulse:gl.getUniformLocation(pointProgram,'uPulse')
    };

    let projection=I(),dpr=1,running=true;
    const hero=document.getElementById('hero');

    function resize(){
      const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight);
      dpr=Math.min(devicePixelRatio||1,1.35);
      const budget=1500000;
      if(w*h*dpr*dpr>budget)dpr*=Math.sqrt(budget/(w*h*dpr*dpr));
      canvas.width=Math.max(1,Math.round(w*dpr));
      canvas.height=Math.max(1,Math.round(h*dpr));
      gl.viewport(0,0,canvas.width,canvas.height);
      projection=persp(40*Math.PI/180,w/h,.1,20);
    }

    function model(t){
      const w=Math.max(320,innerWidth);
      const s=clamp(w*.00112,.43,.47);
      return compose(
        tr(0,.16+Math.sin(t*.31)*.012,-3.05),
        rx(-.10+Math.sin(t*.23)*.025),
        ry(.17+Math.sin(t*.19)*.10),
        rz(Math.sin(t*.17)*.018),
        sc(s,s,s)
      );
    }

    function bindShell(){
      gl.bindBuffer(gl.ARRAY_BUFFER,shellBuffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
    }
    function bindLine(buffer){
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);
      gl.disableVertexAttribArray(1);
    }

    function drawLines(base,t){
      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(LU.P,false,projection);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      gl.disable(gl.DEPTH_TEST);

      bindLine(wireBuffer);
      gl.uniformMatrix4fv(LU.M,false,base);
      gl.uniform3f(LU.C,.05,.88,1.0);
      gl.uniform1f(LU.A,.34+.04*Math.sin(t*.9));
      gl.drawArrays(gl.LINES,0,wireData.length/3);

      const colors=[
        [.02,.95,1.0],[.08,.72,1.0],[.30,.36,1.0],[.66,.16,1.0],[.04,.78,1.0]
      ];
      for(let i=0;i<ringBuffers.length;i+=1){
        const spin=t*(.10+i*.035)*(i%2?-1:1);
        const rm=mul(base,compose(rx((i-2)*.035),ry((2-i)*.028),rz(spin)));
        bindLine(ringBuffers[i].buffer);
        gl.uniformMatrix4fv(LU.M,false,rm);
        gl.uniform3fv(LU.C,colors[i]);
        gl.uniform1f(LU.A,.54-i*.055);
        gl.drawArrays(gl.LINES,0,ringBuffers[i].count);
      }
    }

    function drawNucleus(base,t){
      gl.useProgram(pointProgram);
      gl.uniformMatrix4fv(PU.P,false,projection);
      gl.uniformMatrix4fv(PU.M,false,mul(base,tr(Math.sin(t*.72)*.012,Math.cos(t*.66)*.011,0)));
      gl.uniform1f(PU.S,46*dpr*(1+.05*Math.sin(t*1.4)));
      gl.uniform1f(PU.pulse,.92+.08*Math.sin(t*1.7));
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      gl.disable(gl.DEPTH_TEST);
      gl.drawArrays(gl.POINTS,0,1);
    }

    function syncVisibility(){
      if(!hero){stage.dataset.active='true';stage.dataset.fxMobileVisible='true';return;}
      const r=hero.getBoundingClientRect();
      const h=visualViewport?.height||innerHeight;
      const on=r.bottom>40&&r.top<h-20;
      stage.dataset.active=on?'true':'false';
      stage.dataset.fxMobileVisible=on?'true':'false';
    }

    function render(now){
      if(!running)return;
      const t=now*.001;
      syncVisibility();
      if(stage.dataset.fxMobileVisible!=='true'||document.hidden){
        requestAnimationFrame(render);return;
      }

      gl.clearColor(0,0,0,0);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

      const base=model(t);
      gl.useProgram(shellProgram);
      gl.uniformMatrix4fv(SU.P,false,projection);
      gl.uniformMatrix4fv(SU.M,false,base);
      gl.uniform1f(SU.T,t);
      gl.uniform1f(SU.A,.92);
      bindShell();
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(false);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.CULL_FACE);
      gl.drawArrays(gl.TRIANGLES,0,shellData.length/6);

      const inner=mul(base,sc(.91,.91,.91));
      gl.uniformMatrix4fv(SU.M,false,inner);
      gl.uniform1f(SU.A,.42);
      gl.drawArrays(gl.TRIANGLES,0,shellData.length/6);

      drawLines(base,t);
      drawNucleus(base,t);

      gl.depthMask(true);
      requestAnimationFrame(render);
    }

    canvas.addEventListener('webglcontextlost',e=>{
      e.preventDefault();
      running=false;
      fail('context-lost');
    },{passive:false});

    addEventListener('resize',()=>{resize();syncVisibility();},{passive:true});
    addEventListener('scroll',syncVisibility,{passive:true});
    visualViewport?.addEventListener('resize',()=>{resize();syncVisibility();},{passive:true});

    resize();
    syncVisibility();

    root.dataset.fxCoreV51=READY;
    root.dataset.fxCoreReal3d='ready-v20';
    root.dataset.fxCoreRenderer='single-webgl2-reference-crystal-v51';
    root.dataset.fxCoreReferenceLock='ready-v51';
    root.dataset.fxCoreReferenceRevision='reference-image-20260810-v52-mobile-safe';
    root.dataset.fxCoreReferenceGeometry='sharp-four-tip-concave-crystal-v51';
    root.dataset.fxCoreReferenceMaterial='layered-faceted-refractive-glass-v51';
    root.dataset.fxCoreInternalReactor='moving-white-nucleus-concentric-spectral-rings-v51';
    root.dataset.fxCoreResponsive='desktop-mobile-reference-framing-v51';
    root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';
    root.dataset.fxCoreImageBacked='false';
    root.dataset.fxCoreDepth='closed-volumetric-shell-with-sidewalls';
    root.dataset.fxCoreMobileCompat='ready-v52';

    dispatchEvent(new CustomEvent('formatx:core3dready',{
      detail:{
        renderer:root.dataset.fxCoreRenderer,
        geometry:root.dataset.fxCoreReferenceGeometry,
        material:root.dataset.fxCoreReferenceMaterial,
        reactor:root.dataset.fxCoreInternalReactor,
        reference:VERSION
      }
    }));

    requestAnimationFrame(render);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
}());

(function () {
  'use strict';

  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)').matches;
  if (!mobile || root.dataset.fxCoreMobileCompat === 'ready-v52') return;

  const READY = 'ready-v51';
  const VERSION = 'v52-mobile-safe-hero-local-volumetric-crystal-r5';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

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
    for(let c=0;c<4;c+=1){
      for(let r=0;r<4;r+=1){
        o[r+c*4]=a[r]*b[c*4]+a[r+4]*b[c*4+1]+a[r+8]*b[c*4+2]+a[r+12]*b[c*4+3];
      }
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
    o[0]=q/aspect;
    o[5]=q;
    o[10]=(far+near)*r;
    o[11]=-1;
    o[14]=2*far*near*r;
    return o;
  }

  function normal(a,b,c){
    const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
    const vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx;
    const l=Math.hypot(x,y,z)||1;
    return [x/l,y/l,z/l];
  }

  function starRadius(theta){
    const c=Math.max(1e-5,Math.abs(Math.cos(theta)));
    const s=Math.max(1e-5,Math.abs(Math.sin(theta)));
    const astroid=Math.pow(Math.pow(c,2/3)+Math.pow(s,2/3),-1.5);
    return 1.055*astroid+.004*Math.cos(theta*8);
  }

  function crystalPoint(th,u,side){
    const inner=.085;
    const curve=Math.pow(u,.86);
    const r=inner+(starRadius(th)-inner)*curve;
    const lens=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.70);
    const facet=1+.11*Math.cos(th*8)*lens+.045*Math.cos(th*16+u*4.2);
    const z=side*(.055+.270*lens*facet+.045*(1-u));
    const pinch=1-.032*Math.sin(Math.PI*u)*Math.cos(th*4);
    return [r*Math.cos(th)*pinch,r*Math.sin(th)*1.115*pinch,z];
  }

  function makeCrystal(angleSegments=80,radialSegments=9){
    const data=[];

    function tri(a,b,c,flip=false){
      const n=normal(a,b,c);
      if(flip){n[0]*=-1;n[1]*=-1;n[2]*=-1;}
      for(const p of [a,b,c]) data.push(p[0],p[1],p[2],n[0],n[1],n[2]);
    }

    function quad(a,b,c,d,flip=false){
      if(!flip){tri(a,b,c);tri(a,c,d);}
      else{tri(a,c,b);tri(a,d,c);}
    }

    for(const side of [-1,1]){
      for(let j=0;j<radialSegments;j+=1){
        const u0=j/radialSegments,u1=(j+1)/radialSegments;
        for(let i=0;i<angleSegments;i+=1){
          const t0=i/angleSegments*Math.PI*2,t1=(i+1)/angleSegments*Math.PI*2;
          quad(
            crystalPoint(t0,u0,side),
            crystalPoint(t0,u1,side),
            crystalPoint(t1,u1,side),
            crystalPoint(t1,u0,side),
            side<0
          );
        }
      }
    }

    for(let i=0;i<angleSegments;i+=1){
      const t0=i/angleSegments*Math.PI*2,t1=(i+1)/angleSegments*Math.PI*2;
      quad(
        crystalPoint(t0,1,1),
        crystalPoint(t0,1,-1),
        crystalPoint(t1,1,-1),
        crystalPoint(t1,1,1)
      );
      quad(
        crystalPoint(t0,0,-1),
        crystalPoint(t0,0,1),
        crystalPoint(t1,0,1),
        crystalPoint(t1,0,-1)
      );
    }

    return new Float32Array(data);
  }

  function makeWire(angleSegments=80){
    const out=[];

    function front(th,u){
      const p=crystalPoint(th,u,1);
      p[2]+=.006;
      return p;
    }

    for(let spoke=0;spoke<20;spoke+=1){
      const th=spoke/20*Math.PI*2;
      for(let j=0;j<9;j+=1){
        out.push(...front(th,j/9),...front(th,(j+1)/9));
      }
    }

    for(const u of [.18,.31,.45,.59,.73,.87,1]){
      for(let i=0;i<angleSegments;i+=1){
        out.push(
          ...front(i/angleSegments*Math.PI*2,u),
          ...front((i+1)/angleSegments*Math.PI*2,u)
        );
      }
    }

    return new Float32Array(out);
  }

  function makeRing(radius,segments=112,z=.355){
    const out=[];
    for(let i=0;i<segments;i+=1){
      const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
      out.push(
        Math.cos(a)*radius,Math.sin(a)*radius,z,
        Math.cos(b)*radius,Math.sin(b)*radius,z
      );
    }
    return new Float32Array(out);
  }

  function makeCross(){
    return new Float32Array([
      -1.11,0,.365, 1.11,0,.365,
      0,-1.22,.365, 0,1.22,.365,
      -.64,-.64,.360, .64,.64,.360,
      -.64,.64,.360, .64,-.64,.360
    ]);
  }

  function start(attempt=0){
    if(!document.body) return;

    const hero=document.getElementById('hero');
    const host=hero && hero.querySelector('.hero-space');
    if(!hero || !host){
      if(attempt<120){requestAnimationFrame(()=>start(attempt+1));return;}
      fail('mobile-host-unavailable');
      return;
    }

    /* Claim v51 ownership before any expensive WebGL work. This closes the
       startup window in which another v51 instance could create a second stage. */
    root.dataset.fxCoreV51=READY;
    root.dataset.fxCoreMobileCompat='claiming-v52';

    document.querySelectorAll('.fx-core-real3d-stage').forEach(n=>n.remove());

    host.style.setProperty('position','relative','important');
    host.style.setProperty('min-height','clamp(500px, 58svh, 660px)','important');
    host.style.setProperty('overflow','hidden','important');

    const stage=document.createElement('div');
    stage.className='fx-core-real3d-stage fx-core-v51-stage fx-core-mobile-safe-v52-stage';
    stage.dataset.active='true';
    stage.dataset.fxCoreVersion=VERSION;
    stage.dataset.fxMobileVisible='true';
    stage.setAttribute('aria-hidden','true');

    stage.style.setProperty('position','absolute','important');
    stage.style.setProperty('inset','0','important');
    stage.style.setProperty('width','100%','important');
    stage.style.setProperty('height','100%','important');
    stage.style.setProperty('z-index','2','important');
    stage.style.setProperty('display','block','important');
    stage.style.setProperty('visibility','visible','important');
    stage.style.setProperty('opacity','1','important');
    stage.style.setProperty('overflow','hidden','important');
    stage.style.setProperty('pointer-events','none','important');
    stage.style.setProperty('background','transparent','important');
    stage.style.setProperty('contain','none','important');
    stage.style.setProperty('isolation','auto','important');
    stage.style.setProperty('transform','none','important');

    const canvas=document.createElement('canvas');
    canvas.className='fx-core-real3d-canvas fx-core-v51-canvas fx-core-mobile-safe-v52-canvas';
    canvas.setAttribute('aria-hidden','true');
    canvas.style.setProperty('position','absolute','important');
    canvas.style.setProperty('inset','0','important');
    canvas.style.setProperty('width','100%','important');
    canvas.style.setProperty('height','100%','important');
    canvas.style.setProperty('display','block','important');
    canvas.style.setProperty('opacity','1','important');
    canvas.style.setProperty('visibility','visible','important');
    canvas.style.setProperty('filter','none','important');
    canvas.style.setProperty('mix-blend-mode','normal','important');
    canvas.style.setProperty('transform','none','important');
    canvas.style.setProperty('backface-visibility','visible','important');
    canvas.style.setProperty('will-change','auto','important');
    canvas.style.setProperty('pointer-events','none','important');

    stage.append(canvas);
    host.prepend(stage);

    function pruneDuplicateCoreNodes(){
      document.querySelectorAll('.fx-core-v51-stage').forEach(node=>{
        if(node!==stage) node.remove();
      });
      document.querySelectorAll('.fx-core-v51-canvas').forEach(node=>{
        if(node!==canvas && !stage.contains(node)) node.remove();
      });
    }

    pruneDuplicateCoreNodes();
    const duplicateObserver=('MutationObserver' in window) ? new MutationObserver(()=>pruneDuplicateCoreNodes()) : null;
    duplicateObserver?.observe(document.body,{childList:true,subtree:true});

    let gl;
    try{
      gl=canvas.getContext('webgl2',{
        alpha:true,
        antialias:true,
        depth:true,
        stencil:false,
        premultipliedAlpha:true,
        preserveDrawingBuffer:false,
        powerPreference:'high-performance'
      });
    }catch(error){
      duplicateObserver?.disconnect();
      stage.remove();
      fail('context-unavailable',error && error.message ? error.message : error);
      return;
    }

    if(!gl || gl.isContextLost()){
      duplicateObserver?.disconnect();
      stage.remove();
      fail('context-unavailable');
      return;
    }

    const SHELL_VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP,uM;
uniform float uT;
out vec3 vP,vN,vW;
void main(){
  vec3 p=aP;
  float breathe=1.0+sin(uT*.38+atan(p.y,p.x)*4.0)*.0025;
  p.xy*=breathe;
  vec4 w=uM*vec4(p,1.0);
  vP=p;
  vW=w.xyz;
  vN=normalize(mat3(uM)*aN);
  gl_Position=uP*w;
}`;

    const SHELL_FS=`#version 300 es
precision highp float;
in vec3 vP,vN,vW;
uniform float uT,uAlpha,uPhase;
uniform vec3 uTint;
out vec4 O;
float sat(float x){return clamp(x,0.0,1.0);}
void main(){
  vec3 N=normalize(vN);
  vec3 V=normalize(-vW);
  vec3 L1=normalize(vec3(-.52,.72,.88));
  vec3 L2=normalize(vec3(.76,-.28,.64));
  float d1=sat(dot(N,L1));
  float d2=sat(dot(N,L2));
  float fres=pow(1.0-sat(abs(dot(N,V))),2.05);
  float spec=pow(sat(dot(N,normalize(L1+V))),42.0);
  float a=atan(vP.y,vP.x);
  float r=length(vP.xy);
  float facetA=pow(.5+.5*cos(a*16.0+r*29.0+vP.z*15.0-uT*.20+uPhase),18.0);
  float facetB=pow(.5+.5*cos(a*28.0-r*23.0-vP.z*12.0+uT*.11+uPhase*.7),24.0);
  float violet=pow(.5+.5*cos(a*8.0-r*10.0+vP.z*8.0+uT*.14+uPhase),10.0);
  vec3 cyan=vec3(.02,.82,1.38);
  vec3 blue=vec3(.02,.23,.92);
  vec3 purple=vec3(.72,.10,1.22);
  vec3 ice=vec3(.88,1.12,1.28);
  vec3 col=uTint*.10;
  col+=cyan*(.18+.56*d1+.34*fres+.11*facetA);
  col+=blue*(.08+.20*d2+.08*facetB);
  col+=purple*(.045+.19*violet+.07*facetB);
  col+=ice*(.10+.98*spec+.22*pow(fres,1.45));
  float alpha=uAlpha*sat(.30+.38*fres+.18*d1+.11*d2+.12*spec+.055*facetA);
  O=vec4(col,alpha);
}`;

    const LINE_VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
uniform mat4 uP,uM;
void main(){gl_Position=uP*uM*vec4(aP,1.0);}`;

    const LINE_FS=`#version 300 es
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
out vec4 O;
void main(){O=vec4(uColor*uAlpha,uAlpha);}`;

    const POINT_VS=`#version 300 es
precision highp float;
uniform mat4 uP,uM;
uniform float uSize;
void main(){
  gl_Position=uP*uM*vec4(0.0,0.0,.39,1.0);
  gl_PointSize=uSize;
}`;

    const POINT_FS=`#version 300 es
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
out vec4 O;
void main(){
  vec2 p=gl_PointCoord*2.0-1.0;
  float d=dot(p,p);
  if(d>1.0) discard;
  float core=pow(1.0-d,4.5);
  float halo=pow(1.0-d,1.35);
  float a=(core+.62*halo)*uAlpha;
  vec3 c=mix(uColor,vec3(1.0),core*.88);
  O=vec4(c*a,a);
}`;

    function compile(type,source){
      const shader=gl.createShader(type);
      gl.shaderSource(shader,source);
      gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        const message=gl.getShaderInfoLog(shader)||'shader compile failed';
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    }

    function makeProgram(vsSource,fsSource){
      const p=gl.createProgram();
      const vs=compile(gl.VERTEX_SHADER,vsSource);
      const fs=compile(gl.FRAGMENT_SHADER,fsSource);
      gl.attachShader(p,vs);
      gl.attachShader(p,fs);
      gl.linkProgram(p);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS)){
        const message=gl.getProgramInfoLog(p)||'program link failed';
        gl.deleteProgram(p);
        throw new Error(message);
      }
      return p;
    }

    let shellProgram,lineProgram,pointProgram;
    try{
      shellProgram=makeProgram(SHELL_VS,SHELL_FS);
      lineProgram=makeProgram(LINE_VS,LINE_FS);
      pointProgram=makeProgram(POINT_VS,POINT_FS);
    }catch(error){
      duplicateObserver?.disconnect();
      stage.remove();
      fail('shader-failed',error && error.message ? error.message : error);
      return;
    }

    const shellData=makeCrystal();
    const wireData=makeWire();
    const crossData=makeCross();
    const ringData=[.18,.26,.35,.45,.56,.68].map(r=>makeRing(r));

    function makeBuffer(data){
      const buffer=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      return {buffer,count:data.length/3};
    }

    const shellBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,shellBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,shellData,gl.STATIC_DRAW);
    const shellCount=shellData.length/6;

    const wire=makeBuffer(wireData);
    const cross=makeBuffer(crossData);
    const rings=ringData.map(makeBuffer);

    const SU={
      P:gl.getUniformLocation(shellProgram,'uP'),
      M:gl.getUniformLocation(shellProgram,'uM'),
      T:gl.getUniformLocation(shellProgram,'uT'),
      A:gl.getUniformLocation(shellProgram,'uAlpha'),
      phase:gl.getUniformLocation(shellProgram,'uPhase'),
      tint:gl.getUniformLocation(shellProgram,'uTint')
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
      C:gl.getUniformLocation(pointProgram,'uColor'),
      A:gl.getUniformLocation(pointProgram,'uAlpha')
    };

    let projection=I();
    let running=true;
    let visible=true;
    let renderScale=1;
    let last=performance.now();
    let frameEma=16.7;
    let frameCount=0;
    let dpr=1;
    let pointMax=64;

    const pointRange=gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
    if(pointRange && pointRange.length>1) pointMax=pointRange[1];

    function resize(){
      const rect=stage.getBoundingClientRect();
      const cssW=Math.max(1,Math.round(rect.width||host.clientWidth||innerWidth));
      const cssH=Math.max(1,Math.round(rect.height||host.clientHeight||Math.max(500,innerHeight*.58)));
      const dprCap=1.35;
      const budget=1150000;
      dpr=Math.min(devicePixelRatio||1,dprCap)*renderScale;
      const px=cssW*cssH*dpr*dpr;
      if(px>budget) dpr*=Math.sqrt(budget/px);
      dpr=clamp(dpr,.76,dprCap);
      const w=Math.max(1,Math.round(cssW*dpr));
      const h=Math.max(1,Math.round(cssH*dpr));
      if(canvas.width!==w||canvas.height!==h){
        canvas.width=w;
        canvas.height=h;
      }
      gl.viewport(0,0,w,h);
      projection=persp(39*Math.PI/180,cssW/cssH,.1,20);
      root.dataset.fxCoreMobileViewport=`${cssW}x${cssH}`;
    }

    function baseModel(t){
      const cssW=Math.max(320,stage.clientWidth||innerWidth);
      const s=clamp(.675*(cssW/390),.62,.73);
      const idle=reduced.matches ? .8 : t;
      return compose(
        tr(0,-.015+Math.sin(idle*.29)*.010,-3.08),
        rx(-.075+Math.sin(idle*.19)*.020),
        ry(.105+Math.sin(idle*.23)*.050),
        rz(Math.sin(idle*.17)*.010),
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

    function shellPass(t,model,tint,alpha,phase,additive=false){
      gl.useProgram(shellProgram);
      gl.uniformMatrix4fv(SU.P,false,projection);
      gl.uniformMatrix4fv(SU.M,false,model);
      gl.uniform1f(SU.T,t);
      gl.uniform1f(SU.A,alpha);
      gl.uniform1f(SU.phase,phase);
      gl.uniform3fv(SU.tint,tint);
      bindShell();
      gl.blendFunc(gl.SRC_ALPHA,additive?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES,0,shellCount);
    }

    function drawLine(buffer,count,model,color,alpha){
      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(LU.P,false,projection);
      gl.uniformMatrix4fv(LU.M,false,model);
      gl.uniform3fv(LU.C,color);
      gl.uniform1f(LU.A,alpha);
      bindLine(buffer);
      gl.drawArrays(gl.LINES,0,count);
    }

    function drawPoint(model,size,color,alpha){
      gl.useProgram(pointProgram);
      gl.uniformMatrix4fv(PU.P,false,projection);
      gl.uniformMatrix4fv(PU.M,false,model);
      gl.uniform1f(PU.S,Math.min(pointMax,size));
      gl.uniform3fv(PU.C,color);
      gl.uniform1f(PU.A,alpha);
      gl.drawArrays(gl.POINTS,0,1);
    }

    function render(now){
      if(!running) return;
      const dt=Math.min(60,now-last);
      last=now;
      frameEma=frameEma*.94+dt*.06;
      frameCount+=1;

      if(frameCount%120===0){
        if(frameEma>21.5 && renderScale>.80){
          renderScale=Math.max(.80,renderScale-.08);
          resize();
        }else if(frameEma<16.2 && renderScale<1){
          renderScale=Math.min(1,renderScale+.04);
          resize();
        }
        root.dataset.fxCoreFrameMs=frameEma.toFixed(1);
      }

      if(!visible||document.hidden){
        requestAnimationFrame(render);
        return;
      }

      const t=reduced.matches?.8:now*.001;
      gl.clearColor(0,0,0,0);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);

      const base=baseModel(t);
      shellPass(t,base,[.02,.22,.58],.74,0,false);
      shellPass(t,mul(base,compose(sc(.925,.925,.925),rz(-.018))),[.23,.05,.70],.34,1.7,true);

      gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE);

      drawLine(wire.buffer,wire.count,base,[.09,.78,1.0],.50+.05*Math.sin(t*.8));
      drawLine(
        wire.buffer,
        wire.count,
        mul(base,compose(sc(.945,.945,.945),rz(.017))),
        [.60,.16,1.0],
        .20
      );

      const ringColors=[
        [.12,.96,1.0],
        [.04,.78,1.0],
        [.11,.58,1.0],
        [.60,.18,1.0],
        [.05,.70,1.0],
        [.66,.14,.94]
      ];

      for(let i=0;i<rings.length;i+=1){
        const spin=t*(.12+i*.021)*(i%2?-1:1);
        const wobble=Math.sin(t*(.26+i*.05))*.018;
        const ringModel=mul(base,compose(
          rx((i%2?.055:-.045)+wobble),
          ry((i%3-.9)*.035-wobble*.6),
          rz(spin)
        ));
        drawLine(rings[i].buffer,rings[i].count,ringModel,ringColors[i],.72-i*.075);
      }

      drawLine(cross.buffer,cross.count,base,[.18,.90,1.0],.68+.08*Math.sin(t*1.1));

      const pulse=1+.07*Math.sin(t*1.45);
      drawPoint(base,Math.min(pointMax,82*dpr*pulse),[.12,.82,1.0],.32);
      drawPoint(base,Math.min(pointMax,48*dpr*pulse),[1.0,.98,.94],1.0);

      const orbiters=[
        [.34,.72,0,[.16,.95,1.0]],
        [.48,-.54,2.1,[.72,.18,1.0]],
        [.62,.38,4.0,[.12,.70,1.0]]
      ];

      for(let i=0;i<orbiters.length;i+=1){
        const [radius,speed,phase,color]=orbiters[i];
        const a=t*speed+phase;
        const orbit=mul(base,compose(
          tr(Math.cos(a)*radius,Math.sin(a)*radius*.93,Math.sin(a*1.7)*.10),
          sc(.60,.60,.60)
        ));
        drawPoint(orbit,Math.min(pointMax,(7-i)*dpr),color,.82);
      }

      gl.depthMask(true);
      gl.disable(gl.BLEND);
      requestAnimationFrame(render);
    }

    const observer=('IntersectionObserver' in window) ? new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting);
      stage.dataset.active=visible?'true':'false';
      stage.dataset.fxMobileVisible=visible?'true':'false';
    },{rootMargin:'22% 0px 22% 0px',threshold:.01}) : null;

    if(observer) observer.observe(hero);

    const ro=('ResizeObserver' in window) ? new ResizeObserver(()=>resize()) : null;
    if(ro) ro.observe(host);

    addEventListener('resize',resize,{passive:true});
    if(window.visualViewport) visualViewport.addEventListener('resize',resize,{passive:true});

    canvas.addEventListener('webglcontextlost',event=>{
      event.preventDefault();
      running=false;
      duplicateObserver?.disconnect();
      stage.dataset.active='false';
      fail('context-lost');
    },{passive:false});

    canvas.addEventListener('webglcontextrestored',()=>location.reload(),{once:true});

    root.dataset.fxCoreV51=READY;
    root.dataset.fxCoreReal3d='ready-v20';
    root.dataset.fxCoreRenderer='single-webgl2-reference-crystal-v51';
    root.dataset.fxCoreReferenceLock='ready-v51';
    root.dataset.fxCoreReferenceRevision='reference-image-20260811-mobile-hero-local-v52-r5';
    root.dataset.fxCoreReferenceGeometry='sharp-four-tip-concave-crystal-v51';
    root.dataset.fxCoreReferenceMaterial='layered-faceted-refractive-glass-v51';
    root.dataset.fxCoreInternalReactor='moving-white-nucleus-concentric-spectral-rings-v51';
    root.dataset.fxCoreResponsive='desktop-mobile-reference-framing-v51';
    root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';
    root.dataset.fxCoreImageBacked='false';
    root.dataset.fxCoreDepth='closed-volumetric-shell-with-sidewalls';
    root.dataset.fxCoreMobileCompat='ready-v52';
    root.dataset.fxCoreMobileHost='hero-space-local-webgl2';
    root.dataset.fxCoreMobileOwner='exclusive-v52-r5';
    stage.dataset.active='true';

    pruneDuplicateCoreNodes();

    dispatchEvent(new CustomEvent('formatx:core3dready',{
      detail:{
        renderer:root.dataset.fxCoreRenderer,
        geometry:root.dataset.fxCoreReferenceGeometry,
        material:root.dataset.fxCoreReferenceMaterial,
        reactor:root.dataset.fxCoreInternalReactor,
        reference:VERSION,
        mobileHost:root.dataset.fxCoreMobileHost
      }
    }));

    requestAnimationFrame(()=>{
      resize();
      requestAnimationFrame(render);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>start(),{once:true});
  else start();
}());

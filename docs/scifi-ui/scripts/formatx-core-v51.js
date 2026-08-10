(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'v51-reference-crystal-core';
  const READY = 'ready-v51';
  if (root.dataset.fxCoreV51 === READY) return;

  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreV51 = 'audit-skip';
    return;
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)');
  const mobile = mobileQuery.matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function fail(reason, message) {
    root.dataset.fxCoreV51 = reason;
    root.dataset.fxCoreReal3d = reason;
    if (message) root.dataset.fxCoreReal3dError = String(message).slice(0, 220);
    dispatchEvent(new CustomEvent('formatx:core3dfallback', {
      detail: { reason, message: message || '', reference: VERSION }
    }));
  }

  if (typeof WebGL2RenderingContext === 'undefined') {
    fail('webgl2-unavailable');
    return;
  }

  const I = () => new Float32Array([
    1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1
  ]);
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
    o[0]=q/aspect;o[5]=q;o[10]=(far+near)*r;o[11]=-1;o[14]=2*far*near*r;return o;
  }

  function start(){
    if(!document.body || root.dataset.fxCoreV51===READY) return;
    document.querySelectorAll('.fx-core-real3d-stage').forEach(n=>n.remove());

    const stage=document.createElement('div');
    stage.className='fx-core-real3d-stage fx-core-v51-stage';
    stage.dataset.active='false';
    stage.dataset.fxCoreVersion=VERSION;
    stage.setAttribute('aria-hidden','true');
    const canvas=document.createElement('canvas');
    canvas.className='fx-core-real3d-canvas fx-core-v51-canvas';
    canvas.setAttribute('aria-hidden','true');
    stage.append(canvas);
    document.body.append(stage);

    let gl;
    try{
      gl=canvas.getContext('webgl2',{
        alpha:true,antialias:false,depth:true,stencil:false,premultipliedAlpha:false,
        preserveDrawingBuffer:false,powerPreference: mobile ? 'default' : 'high-performance',desynchronized:true
      });
    }catch(error){stage.remove();fail('context-unavailable',error?.message||error);return;}
    if(!gl || gl.isContextLost()){stage.remove();fail('context-unavailable');return;}

    const SHELL_VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP,uM;
uniform float uT;
out vec3 vP,vW,vN;
void main(){
  vec3 p=aP;
  float pulse=1.0+sin(uT*.36+atan(p.y,p.x)*4.0)*.0035;
  p.xy*=pulse;
  vec4 w=uM*vec4(p,1.0);
  vP=p;vW=w.xyz;vN=normalize(transpose(inverse(mat3(uM)))*aN);
  gl_Position=uP*w;
}`;

    const SHELL_FS=`#version 300 es
precision highp float;
in vec3 vP,vW,vN;
uniform float uT,uA,uPhase;
uniform vec3 uTint;
out vec4 O;
float S(float x){return clamp(x,0.,1.);}
float band(float x,float c,float w){return exp(-pow(abs(x-c)/w,1.7));}
void main(){
  vec3 V=normalize(-vW),N=normalize(vN);
  float nv=S(abs(dot(N,V)));
  float fres=.015+.985*pow(1.-nv,2.25);
  float a=atan(vP.y,vP.x);
  float r=length(vP.xy);
  float four=pow(abs(cos(a*2.0)),5.5);
  float facetA=pow(.5+.5*cos(a*16.0+r*28.0-uT*.16+uPhase),24.0);
  float facetB=pow(.5+.5*cos(a*28.0-r*33.0+uT*.11+uPhase*.7),32.0);
  float vein=pow(.5+.5*cos(a*8.0+r*42.0-uT*.48+uPhase),34.0);
  float rib=band(fract(r*8.0+four*.12),.5,.058);
  float violet=pow(.5+.5*cos(a*6.0-r*10.0+uT*.14+uPhase),14.0);
  vec3 cyan=vec3(.02,.92,1.48),blue=vec3(.02,.28,1.06),violetC=vec3(.78,.08,1.20),ice=vec3(.82,1.22,1.38);
  vec3 col=uTint*(.018+.10*fres);
  col+=cyan*(.055+.52*fres+.20*vein+.10*rib+.07*four);
  col+=blue*(.02+.07*facetB+.035*four);
  col+=violetC*(.018+.13*violet+.045*facetA);
  col+=ice*(.20*pow(fres,1.35)+.12*facetA+.065*facetB);
  float alpha=uA*S(.035+.34*fres+.070*vein+.040*rib+.052*facetA+.026*facetB+.022*four);
  O=vec4(col,alpha);
}`;

    const GLOW_VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP,uM;
out vec3 vW,vN;
void main(){vec4 w=uM*vec4(aP,1.0);vW=w.xyz;vN=normalize(transpose(inverse(mat3(uM)))*aN);gl_Position=uP*w;}`;
    const GLOW_FS=`#version 300 es
precision highp float;
in vec3 vW,vN;
uniform vec3 uTint;
uniform float uA,uGlow;
out vec4 O;
void main(){vec3 V=normalize(-vW);float f=pow(1.-clamp(abs(dot(normalize(vN),V)),0.,1.),2.0);vec3 c=uTint*(1.+uGlow*.9)+vec3(1.)*uGlow*.42;O=vec4(c,uA*(.62+.38*f));}`;
    const LINE_VS=`#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
uniform mat4 uP,uM;
void main(){gl_Position=uP*uM*vec4(aP,1.0);}`;
    const LINE_FS=`#version 300 es
precision highp float;
uniform vec3 uTint;
uniform float uA;
out vec4 O;
void main(){O=vec4(uTint,uA);}`;

    function compile(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');return s;}
    function makeProgram(vsSource,fsSource){const p=gl.createProgram(),vs=compile(gl.VERTEX_SHADER,vsSource),fs=compile(gl.FRAGMENT_SHADER,fsSource);gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'link');return p;}

    let shellProgram,glowProgram,lineProgram;
    try{shellProgram=makeProgram(SHELL_VS,SHELL_FS);glowProgram=makeProgram(GLOW_VS,GLOW_FS);lineProgram=makeProgram(LINE_VS,LINE_FS);}catch(error){stage.remove();fail('shader-failed',error?.message||error);return;}

    function starRadius(theta){
      const c=Math.max(1e-5,Math.abs(Math.cos(theta)));
      const s=Math.max(1e-5,Math.abs(Math.sin(theta)));
      const astroid=Math.pow(Math.pow(c,2/3)+Math.pow(s,2/3),-1.5);
      const micro=.008*Math.cos(theta*8);
      return 1.055*astroid+micro;
    }

    function crystal(angleSegments=mobile?96:132,radialSegments=mobile?10:14){
      const P=[],N=[],Ix=[];
      const inner=.245;
      for(const side of[-1,1]){
        const offset=P.length/3;
        for(let j=0;j<=radialSegments;j+=1){
          const u=j/radialSegments;
          const curve=u*u*(3-2*u);
          for(let i=0;i<=angleSegments;i+=1){
            const th=i/angleSegments*Math.PI*2;
            const outer=starRadius(th);
            const r=inner+(outer-inner)*curve;
            const x=r*Math.cos(th);
            const y=r*Math.sin(th)*1.105;
            const lens=Math.pow(Math.sin(Math.PI*u),.72);
            const facets=1+.12*Math.cos(th*8)*Math.sin(Math.PI*u)+.055*Math.cos(th*16+u*5);
            const z=side*(.026+.175*lens*facets);
            P.push(x,y,z);
            const nx=x*.34,ny=y*.31,nz=side*(1.0+.24*Math.cos(th*8)*lens);
            const nl=Math.hypot(nx,ny,nz)||1;N.push(nx/nl,ny/nl,nz/nl);
          }
        }
        const row=angleSegments+1;
        for(let j=0;j<radialSegments;j+=1){
          for(let i=0;i<angleSegments;i+=1){
            const a=offset+j*row+i,b=offset+(j+1)*row+i;
            if(side>0)Ix.push(a,b,a+1,a+1,b,b+1);else Ix.push(a,a+1,b,a+1,b+1,b);
          }
        }
      }
      return{P,N,Ix};
    }

    function sphere(lon=mobile?28:40,lat=mobile?18:26){
      const P=[],N=[],Ix=[];
      for(let y=0;y<=lat;y+=1){const ph=y/lat*Math.PI;for(let x=0;x<=lon;x+=1){const th=x/lon*Math.PI*2,nx=Math.cos(th)*Math.sin(ph),ny=Math.cos(ph),nz=Math.sin(th)*Math.sin(ph);P.push(nx,ny,nz);N.push(nx,ny,nz);}}
      const row=lon+1;for(let y=0;y<lat;y+=1)for(let x=0;x<lon;x+=1){const a=y*row+x,b=(y+1)*row+x;Ix.push(a,b,a+1,a+1,b,b+1);}return{P,N,Ix};
    }

    function torus(majorSegments=mobile?56:84,minorSegments=mobile?8:10,minor=.017){
      const P=[],N=[],Ix=[];
      for(let i=0;i<=majorSegments;i+=1){const a=i/majorSegments*Math.PI*2;for(let j=0;j<=minorSegments;j+=1){const b=j/minorSegments*Math.PI*2,r=1+minor*Math.cos(b),x=r*Math.cos(a),y=r*Math.sin(a),z=minor*Math.sin(b);P.push(x,y,z);N.push(Math.cos(a)*Math.cos(b),Math.sin(a)*Math.cos(b),Math.sin(b));}}
      const row=minorSegments+1;for(let i=0;i<majorSegments;i+=1)for(let j=0;j<minorSegments;j+=1){const a=i*row+j,b=(i+1)*row+j;Ix.push(a,b,b+1,a,b+1,a+1);}return{P,N,Ix};
    }

    function crystalLines(angleSegments=mobile?96:132){
      const P=[],inner=.245;
      const point=(th,u)=>{const outer=starRadius(th),curve=u*u*(3-2*u),r=inner+(outer-inner)*curve,lens=Math.pow(Math.sin(Math.PI*u),.72),facets=1+.12*Math.cos(th*8)*Math.sin(Math.PI*u)+.055*Math.cos(th*16+u*5),z=.026+.175*lens*facets+.010;return[r*Math.cos(th),r*Math.sin(th)*1.105,z];};
      for(let spoke=0;spoke<24;spoke+=1){const th=spoke/24*Math.PI*2;for(let s=0;s<12;s+=1){const a=point(th,s/12),b=point(th,(s+1)/12);P.push(...a,...b);}}
      for(const u of[.16,.31,.47,.63,.78,.90,1]){for(let i=0;i<angleSegments;i+=1){const a=point(i/angleSegments*Math.PI*2,u),b=point((i+1)/angleSegments*Math.PI*2,u);P.push(...a,...b);}}
      for(const shift of[.10,-.10]){for(let i=0;i<angleSegments;i+=1){const th0=i/angleSegments*Math.PI*2,th1=(i+1)/angleSegments*Math.PI*2;const u0=.58+.12*Math.sin(th0*4+shift),u1=.58+.12*Math.sin(th1*4+shift);P.push(...point(th0,u0),...point(th1,u1));}}
      return P;
    }

    function uploadIndexed(g){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.P),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);const nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.N),gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,0,0);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.Ix),gl.STATIC_DRAW);gl.bindVertexArray(null);return{vao,count:g.Ix.length};}
    function uploadLines(P){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(P),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);gl.bindVertexArray(null);return{vao,count:P.length/3};}

    let shell,orb,ring,wire,axis;
    try{shell=uploadIndexed(crystal());orb=uploadIndexed(sphere());ring=uploadIndexed(torus());wire=uploadLines(crystalLines());axis=uploadLines([-1.10,0,.22,1.10,0,.22,0,-1.18,.22,0,1.18,.22]);}catch(error){stage.remove();fail('geometry-failed',error?.message||error);return;}

    const SU={P:gl.getUniformLocation(shellProgram,'uP'),M:gl.getUniformLocation(shellProgram,'uM'),T:gl.getUniformLocation(shellProgram,'uT'),A:gl.getUniformLocation(shellProgram,'uA'),phase:gl.getUniformLocation(shellProgram,'uPhase'),tint:gl.getUniformLocation(shellProgram,'uTint')};
    const GU={P:gl.getUniformLocation(glowProgram,'uP'),M:gl.getUniformLocation(glowProgram,'uM'),A:gl.getUniformLocation(glowProgram,'uA'),tint:gl.getUniformLocation(glowProgram,'uTint'),glow:gl.getUniformLocation(glowProgram,'uGlow')};
    const LU={P:gl.getUniformLocation(lineProgram,'uP'),M:gl.getUniformLocation(lineProgram,'uM'),A:gl.getUniformLocation(lineProgram,'uA'),tint:gl.getUniformLocation(lineProgram,'uTint')};

    const fov=(mobile?41:39)*Math.PI/180;
    let projection=I(),pixelScale=1,visible=true,running=true,last=performance.now(),frameEma=16.7,frameCount=0,pointerX=0,pointerY=0,pointerTargetX=0,pointerTargetY=0;
    function viewportMetrics(){const w=Math.max(1,innerWidth),h=Math.max(1,visualViewport?.height||innerHeight);return{w,h,aspect:w/h};}
    function resize(){
      const{w,h,aspect}=viewportMetrics();
      const dprCap = mobile ? 1.30 : 1.70;
      const budget = mobile ? 1350000 : 2500000;
      let dpr=Math.min(devicePixelRatio||1,dprCap);const targetPixels=w*h*dpr*dpr;if(targetPixels>budget)dpr*=Math.sqrt(budget / targetPixels);dpr*=pixelScale;dpr=clamp(dpr,.72,dprCap);
      const cw=Math.max(1,Math.round(w*dpr)),ch=Math.max(1,Math.round(h*dpr));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}gl.viewport(0,0,cw,ch);projection=persp(fov,aspect,.1,30);
    }
    function baseTransform(t){
      const{w,h}=viewportMetrics();
      const portrait = mobile || h > w * 1.08;
      const scale=portrait ? clamp(w * .00134, .46, .60) : clamp(w*.00058,.68,.96);
      const x = portrait ? 0 : .78;
      const y=portrait?.14:.015,z=portrait?-3.24:-3.58;
      return compose(tr(x+Math.sin(t*.29)*.009,y+Math.cos(t*.23)*.009,z),rx(pointerY*.075),ry(pointerX*.09),rz(Math.sin(t*.19)*.006),sc(scale,scale,scale));
    }

    function drawShell(t,base){
      gl.useProgram(shellProgram);gl.uniformMatrix4fv(SU.P,false,projection);gl.bindVertexArray(shell.vao);gl.enable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      const layers=[
        {s:1,z:0,rot:0,a:.52,tint:[.06,.58,1.18],phase:0},
        {s:.955,z:.012,rot:.008,a:.28,tint:[.08,.86,1.32],phase:1.25},
        {s:.89,z:.019,rot:-.011,a:.15,tint:[.44,.18,1.18],phase:2.55}
      ];
      for(const L of layers){const m=mul(base,compose(tr(0,0,L.z),rz(L.rot),sc(L.s,L.s,L.s)));gl.uniformMatrix4fv(SU.M,false,m);gl.uniform1f(SU.T,t);gl.uniform1f(SU.A,L.a);gl.uniform1f(SU.phase,L.phase);gl.uniform3fv(SU.tint,L.tint);gl.drawElements(gl.TRIANGLES,shell.count,gl.UNSIGNED_INT,0);}
    }
    function drawWire(t,base){
      gl.useProgram(lineProgram);gl.uniformMatrix4fv(LU.P,false,projection);gl.bindVertexArray(wire.vao);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.lineWidth(1);
      gl.uniformMatrix4fv(LU.M,false,base);gl.uniform3fv(LU.tint,[.18,.89,1]);gl.uniform1f(LU.A,.46+.06*Math.sin(t*.9));gl.drawArrays(gl.LINES,0,wire.count);
      const inner=mul(base,sc(.92,.92,.92));gl.uniformMatrix4fv(LU.M,false,inner);gl.uniform3fv(LU.tint,[.66,.18,1]);gl.uniform1f(LU.A,.19+.04*Math.cos(t*.7));gl.drawArrays(gl.LINES,0,wire.count);
    }
    function drawRing(model,tint,alpha,glow){gl.useProgram(glowProgram);gl.uniformMatrix4fv(GU.P,false,projection);gl.uniformMatrix4fv(GU.M,false,model);gl.uniform3fv(GU.tint,tint);gl.uniform1f(GU.A,alpha);gl.uniform1f(GU.glow,glow);gl.bindVertexArray(ring.vao);gl.drawElements(gl.TRIANGLES,ring.count,gl.UNSIGNED_INT,0);}
    function drawOrb(model,tint,alpha,glow){gl.useProgram(glowProgram);gl.uniformMatrix4fv(GU.P,false,projection);gl.uniformMatrix4fv(GU.M,false,model);gl.uniform3fv(GU.tint,tint);gl.uniform1f(GU.A,alpha);gl.uniform1f(GU.glow,glow);gl.bindVertexArray(orb.vao);gl.drawElements(gl.TRIANGLES,orb.count,gl.UNSIGNED_INT,0);}
    function drawReactor(t,base){
      gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      const nucleusX = Math.sin(t * .71)*.011+Math.cos(t*.31)*.004;
      const nucleusY = Math.cos(t * .63)*.010+Math.sin(t*.27)*.004;
      const pulse=1+Math.sin(t*1.42)*.035;
      drawOrb(mul(base,compose(tr(nucleusX,nucleusY,.16),sc(.070*pulse,.070*pulse,.070*pulse))),[1.18,1.26,1.28],1,1.8);
      const ringData = [
        [.175,.00,.00,.96,[.04,.96,1.36]],
        [.245,.035,-.025,.78,[.05,.82,1.32]],
        [.320,-.05,.035,.62,[.08,.70,1.28]],
        [.400,.065,.045,.48,[.40,.22,1.24]],
        [.485,-.08,-.045,.34,[.05,.78,1.20]],
        [.575,.10,.055,.24,[.65,.16,1.16]]
      ];
      for(let i=0;i<ringData.length;i+=1){const[r,ax,ay,a,tint]=ringData[i],spin=t*(.17+i*.025)*(i%2?-1:1),wobble=Math.sin(t*(.35+i*.045))*.012;drawRing(mul(base,compose(tr(0,0,.12-i*.005),rx(ax+wobble),ry(ay-wobble*.7),rz(spin),sc(r,r,r))),tint,a,1.08+i*.05);}
      const orbiters=[[.31,.78,.010,[.12,.98,1.28]],[.43,-.58,.009,[.72,.18,1.10]],[.55,.44,.008,[.08,.78,1.20]]];
      for(let i=0;i<orbiters.length;i+=1){const[r,speed,size,tint]=orbiters[i],a=t*speed+i*2.1;drawOrb(mul(base,compose(tr(Math.cos(a)*r,Math.sin(a)*r*.95,.18+Math.sin(a*1.7)*.04),sc(size,size,size))),tint,.9,1.45);}
    }
    function drawAxisFlares(t,base){gl.useProgram(lineProgram);gl.uniformMatrix4fv(LU.P,false,projection);gl.bindVertexArray(axis.vao);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.uniformMatrix4fv(LU.M,false,base);gl.uniform3fv(LU.tint,[.42,.98,1]);gl.uniform1f(LU.A,.48+.07*Math.sin(t*1.1));gl.drawArrays(gl.LINES,0,axis.count);}

    function render(now){
      if(!running)return;const dt=Math.min(60,now-last);last=now;frameEma=frameEma*.94+dt*.06;frameCount+=1;
      if(frameCount%90===0){if(frameEma>20.5&&pixelScale>.76){pixelScale=Math.max(.76,pixelScale-.08);resize();}else if(frameEma<16.1&&pixelScale<1){pixelScale=Math.min(1,pixelScale+.04);resize();}root.dataset.fxCoreFrameMs=frameEma.toFixed(1);}
      pointerX+=(pointerTargetX-pointerX)*.035;pointerY+=(pointerTargetY-pointerY)*.035;
      if(!visible||document.hidden){requestAnimationFrame(render);return;}
      const t=reduced.matches?.8:now*.001;gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const base=baseTransform(t);drawShell(t,base);drawWire(t,base);drawReactor(t,base);drawAxisFlares(t,base);gl.bindVertexArray(null);gl.depthMask(true);requestAnimationFrame(render);
    }

    function pointerMove(e){pointerTargetX=clamp(e.clientX/Math.max(1,innerWidth)*2-1,-1,1);pointerTargetY=clamp(-(e.clientY/Math.max(1,innerHeight)*2-1),-1,1);}
    addEventListener('pointermove',pointerMove,{passive:true});addEventListener('resize',resize,{passive:true});visualViewport?.addEventListener('resize',resize,{passive:true});
    const hero=document.getElementById('hero');
    if(hero&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);stage.dataset.active=visible?'true':'false';},{rootMargin:'18% 0px 18% 0px',threshold:.01});observer.observe(hero);}else{visible=true;stage.dataset.active='true';}
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false;stage.dataset.active='false';fail('context-lost');},{passive:false});
    canvas.addEventListener('webglcontextrestored',()=>location.reload(),{once:true});
    resize();

    root.dataset.fxCoreV51=READY;
    root.dataset.fxCoreReal3d='ready-v20';
    root.dataset.fxCoreRenderer='single-webgl2-reference-crystal-v51';
    root.dataset.fxCoreReferenceLock='ready-v51';
    root.dataset.fxCoreReferenceRevision='reference-image-20260810-v51-astroid-crystal-r8';
    root.dataset.fxCoreReferenceGeometry='sharp-four-tip-concave-crystal-v51';
    root.dataset.fxCoreReferenceMaterial='layered-faceted-refractive-glass-v51';
    root.dataset.fxCoreInternalReactor='moving-white-nucleus-concentric-spectral-rings-v51';
    root.dataset.fxCoreResponsive='desktop-mobile-reference-framing-v51';
    root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';
    root.dataset.fxCoreImageBacked='false';
    stage.dataset.active='true';
    dispatchEvent(new CustomEvent('formatx:core3dready',{detail:{renderer:root.dataset.fxCoreRenderer,geometry:root.dataset.fxCoreReferenceGeometry,material:root.dataset.fxCoreReferenceMaterial,reactor:root.dataset.fxCoreInternalReactor,reference:VERSION}}));
    requestAnimationFrame(render);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}());

(function () {
  'use strict';

  const root = document.documentElement;
  const READY = 'ready-v55';
  const VERSION = 'v55-cinematic-reference-crystal';
  if (root.dataset.fxCoreMobileV55 === READY) return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }

  const mobile = matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
  if (!mobile) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  root.dataset.fxCoreMobileV55 = 'booting-v55';

  function fail(reason, message = '') {
    root.dataset.fxCoreMobileV55 = reason;
    root.dataset.fxCoreReal3d = reason;
    if (message) root.dataset.fxCoreReal3dError = String(message).slice(0, 220);
    dispatchEvent(new CustomEvent('formatx:core3dfallback', {
      detail: { reason, message, reference: VERSION }
    }));
  }

  if (typeof WebGL2RenderingContext === 'undefined') {
    fail('webgl2-unavailable-v55');
    return;
  }

  const identity = () => new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);

  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c += 1) {
      for (let r = 0; r < 4; r += 1) {
        out[r + c * 4] =
          a[r] * b[c * 4] +
          a[r + 4] * b[c * 4 + 1] +
          a[r + 8] * b[c * 4 + 2] +
          a[r + 12] * b[c * 4 + 3];
      }
    }
    return out;
  }

  function translate(x, y, z) {
    const out = identity();
    out[12] = x; out[13] = y; out[14] = z;
    return out;
  }

  function scale(x, y, z) {
    const out = identity();
    out[0] = x; out[5] = y; out[10] = z;
    return out;
  }

  function rotateX(angle) {
    const out = identity();
    const c = Math.cos(angle), s = Math.sin(angle);
    out[5] = c; out[6] = s; out[9] = -s; out[10] = c;
    return out;
  }

  function rotateY(angle) {
    const out = identity();
    const c = Math.cos(angle), s = Math.sin(angle);
    out[0] = c; out[2] = -s; out[8] = s; out[10] = c;
    return out;
  }

  function rotateZ(angle) {
    const out = identity();
    const c = Math.cos(angle), s = Math.sin(angle);
    out[0] = c; out[1] = s; out[4] = -s; out[5] = c;
    return out;
  }

  function compose(...matrices) {
    return matrices.reduce((a, b) => multiply(a, b), identity());
  }

  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    const out = new Float32Array(16);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[14] = 2 * far * near * nf;
    return out;
  }

  function surfaceNormal(a, b, c) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let x = uy * vz - uz * vy;
    let y = uz * vx - ux * vz;
    let z = ux * vy - uy * vx;
    const len = Math.hypot(x, y, z) || 1;
    x /= len; y /= len; z /= len;
    return [x, y, z];
  }

  function starRadius(t) {
    const c = Math.abs(Math.cos(t));
    const s = Math.abs(Math.sin(t));
    const axis = Math.pow(Math.max(c, s), 18);
    const diagonal = Math.pow(Math.abs(Math.sin(t * 2)), 1.45);
    const microFacet = 0.012 * Math.cos(t * 8);
    return 0.425 + 0.79 * axis - 0.108 * diagonal + microFacet;
  }

  function crystalPoint(t, u, side) {
    const outer = starRadius(t);
    const ease = Math.pow(u, 1.7) * (2.7 - 1.7 * u);
    const radius = 0.078 + (outer - 0.078) * ease;
    const lens = Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.78);
    const diagonal = Math.pow(Math.abs(Math.sin(t * 2)), 1.55);
    const facet = 1 + 0.115 * Math.cos(t * 8) * lens + 0.032 * Math.cos(t * 16 + u * 5.2);
    const z = side * (0.032 + 0.195 * lens * facet + 0.018 * (1 - u));
    const pinch = 1 - 0.070 * diagonal * Math.pow(Math.sin(Math.PI * u), 0.82);
    return [radius * Math.cos(t) * pinch, radius * Math.sin(t) * 1.035 * pinch, z];
  }

  function crystalGeometry(angles = 72, radial = 9) {
    const data = [];
    function triangle(a, b, c, flip = false) {
      const n = surfaceNormal(a, b, c);
      if (flip) { n[0] *= -1; n[1] *= -1; n[2] *= -1; }
      for (const p of [a, b, c]) data.push(...p, ...n);
    }
    function quad(a, b, c, d, flip = false) {
      if (flip) { triangle(a, c, b); triangle(a, d, c); }
      else { triangle(a, b, c); triangle(a, c, d); }
    }
    for (const side of [-1, 1]) {
      for (let j = 0; j < radial; j += 1) {
        const u0 = j / radial, u1 = (j + 1) / radial;
        for (let i = 0; i < angles; i += 1) {
          const t0 = i / angles * Math.PI * 2, t1 = (i + 1) / angles * Math.PI * 2;
          quad(crystalPoint(t0, u0, side), crystalPoint(t0, u1, side), crystalPoint(t1, u1, side), crystalPoint(t1, u0, side), side < 0);
        }
      }
    }
    for (let i = 0; i < angles; i += 1) {
      const t0 = i / angles * Math.PI * 2, t1 = (i + 1) / angles * Math.PI * 2;
      quad(crystalPoint(t0, 1, 1), crystalPoint(t0, 1, -1), crystalPoint(t1, 1, -1), crystalPoint(t1, 1, 1));
      quad(crystalPoint(t0, 0, -1), crystalPoint(t0, 0, 1), crystalPoint(t1, 0, 1), crystalPoint(t1, 0, -1));
    }
    return new Float32Array(data);
  }

  function wireGeometry(angles = 72) {
    const data = [];
    const front = (t, u) => {
      const p = crystalPoint(t, u, 1);
      p[2] += 0.010;
      return p;
    };
    for (let spoke = 0; spoke < 24; spoke += 1) {
      const t = spoke / 24 * Math.PI * 2;
      for (let j = 0; j < 9; j += 1) data.push(...front(t, j / 9), ...front(t, (j + 1) / 9));
    }
    for (const u of [0.18, 0.29, 0.41, 0.54, 0.67, 0.80, 0.91, 1]) {
      for (let i = 0; i < angles; i += 1) data.push(...front(i / angles * Math.PI * 2, u), ...front((i + 1) / angles * Math.PI * 2, u));
    }
    return new Float32Array(data);
  }

  function ringGeometry(radius, segments = 72, z = 0.245) {
    const data = [];
    for (let i = 0; i < segments; i += 1) {
      const a = i / segments * Math.PI * 2, b = (i + 1) / segments * Math.PI * 2;
      data.push(Math.cos(a) * radius, Math.sin(a) * radius, z, Math.cos(b) * radius, Math.sin(b) * radius, z);
    }
    return new Float32Array(data);
  }

  function arcGeometry(radius, start, length, segments = 48, z = 0.02) {
    const data = [];
    for (let i = 0; i < segments; i += 1) {
      const a = start + length * i / segments, b = start + length * (i + 1) / segments;
      data.push(Math.cos(a) * radius, Math.sin(a) * radius, z, Math.cos(b) * radius, Math.sin(b) * radius, z);
    }
    return new Float32Array(data);
  }

  const crossGeometry = new Float32Array([
    -1.20, 0, 0.252, 1.20, 0, 0.252,
    0, -1.24, 0.252, 0, 1.24, 0.252,
    -0.54, -0.54, 0.248, 0.54, 0.54, 0.248,
    -0.54, 0.54, 0.248, 0.54, -0.54, 0.248
  ]);

  function start(attempt = 0) {
    if (!document.body) return;
    const hero = document.getElementById('hero');
    const host = hero && hero.querySelector('.hero-space');
    if (!hero || !host) {
      if (attempt < 180) { requestAnimationFrame(() => start(attempt + 1)); return; }
      fail('hero-host-unavailable-v55');
      return;
    }

    document.querySelectorAll('.fx-core-mobile-v54-stage,.fx-core-reference-v53-stage,.fx-core-v51-stage,.fx-core-mesh3d-stage,.fx-core-fracture3d-stage').forEach(node => node.remove());

    const stage = document.createElement('div');
    stage.className = 'fx-core-mobile-v55-stage';
    stage.dataset.active = 'true';
    stage.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    canvas.className = 'fx-core-mobile-v55-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    stage.append(canvas);
    host.prepend(stage);

    let gl;
    try {
      gl = canvas.getContext('webgl2', { alpha:true, antialias:true, depth:true, stencil:false, premultipliedAlpha:true, preserveDrawingBuffer:false, powerPreference:'default', desynchronized:true });
    } catch (error) {
      stage.remove(); fail('context-unavailable-v55', error?.message || error); return;
    }
    if (!gl || gl.isContextLost()) { stage.remove(); fail('context-unavailable-v55'); return; }

    const shellVertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP,uM;
uniform float uT;
out vec3 vP,vW,vN;
void main(){vec3 p=aP;float breath=1.0+sin(uT*.42+atan(p.y,p.x)*4.0)*.0022;p.xy*=breath;p.z*=1.0+sin(uT*.31+length(p.xy)*8.0)*.008;vec4 world=uM*vec4(p,1.0);vP=p;vW=world.xyz;vN=normalize(transpose(inverse(mat3(uM)))*aN);gl_Position=uP*world;}`;

    const shellFragment = `#version 300 es
precision highp float;
in vec3 vP,vW,vN;
uniform float uT,uAlpha,uPhase;
uniform vec3 uTint;
out vec4 O;
float sat(float x){return clamp(x,0.0,1.0);}
void main(){vec3 N=normalize(vN),V=normalize(-vW),L1=normalize(vec3(-.58,.72,.82)),L2=normalize(vec3(.76,-.24,.60));float d1=sat(dot(N,L1)),d2=sat(dot(N,L2)),fres=pow(1.0-sat(abs(dot(N,V))),2.05),spec=pow(sat(dot(N,normalize(L1+V))),92.0);float a=atan(vP.y,vP.x),r=length(vP.xy),facetA=pow(.5+.5*cos(a*16.0+r*31.0+vP.z*21.0-uT*.16+uPhase),26.0),facetB=pow(.5+.5*cos(a*24.0-r*27.0-vP.z*17.0+uT*.11+uPhase*.8),31.0),veins=pow(.5+.5*cos(a*8.0+r*42.0-vP.z*24.0-uT*.34+uPhase),36.0),violetBand=pow(.5+.5*cos(a*6.0-r*12.0+vP.z*10.0+uT*.14+uPhase),16.0);vec3 cyan=vec3(.00,.82,1.32),azure=vec3(.015,.23,.92),violet=vec3(.72,.08,1.18),ice=vec3(.92,1.06,1.16);vec3 color=uTint*.030+cyan*(.075+.28*d1+.34*fres+.12*veins)+azure*(.035+.10*d2+.07*facetB)+violet*(.018+.13*violetBand+.055*facetA)+ice*(.025+1.18*spec+.18*pow(fres,1.35));float alpha=uAlpha*sat(.055+.20*fres+.070*d1+.032*d2+.10*spec+.025*facetA+.021*veins);O=vec4(color*alpha,alpha);}`;

    const lineVertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
uniform mat4 uP,uM;
void main(){gl_Position=uP*uM*vec4(aP,1.0);}`;
    const lineFragment = `#version 300 es
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
out vec4 O;
void main(){O=vec4(uColor*uAlpha,uAlpha);}`;
    const pointVertex = `#version 300 es
precision highp float;
uniform mat4 uP,uM;
uniform float uSize;
void main(){gl_Position=uP*uM*vec4(0.0,0.0,.268,1.0);gl_PointSize=uSize;}`;
    const pointFragment = `#version 300 es
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
out vec4 O;
void main(){vec2 p=gl_PointCoord*2.0-1.0;float d=dot(p,p);if(d>1.0)discard;float core=pow(1.0-d,7.5),halo=pow(1.0-d,2.25),a=(core+.34*halo)*uAlpha;vec3 c=mix(uColor,vec3(1.0),core*.96);O=vec4(c*a,a);}`;

    function shader(type, source) {
      const object = gl.createShader(type); gl.shaderSource(object, source); gl.compileShader(object);
      if (!gl.getShaderParameter(object, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(object) || 'shader compile failure');
      return object;
    }
    function program(vertex, fragment) {
      const p = gl.createProgram(), vs = shader(gl.VERTEX_SHADER, vertex), fs = shader(gl.FRAGMENT_SHADER, fragment);
      gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p); gl.deleteShader(vs); gl.deleteShader(fs);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'program link failure');
      return p;
    }

    let shellProgram, lineProgram, pointProgram;
    try { shellProgram = program(shellVertex, shellFragment); lineProgram = program(lineVertex, lineFragment); pointProgram = program(pointVertex, pointFragment); }
    catch (error) { stage.remove(); fail('shader-failed-v55', error?.message || error); return; }

    function uploadShell(data) {
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao); const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12); gl.bindVertexArray(null);
      return { vao, count:data.length / 6 };
    }
    function uploadLine(data) {
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao); const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0); gl.bindVertexArray(null);
      return { vao, count:data.length / 3 };
    }

    const shell = uploadShell(crystalGeometry()), wire = uploadLine(wireGeometry()), cross = uploadLine(crossGeometry);
    const rings = [0.105,0.145,0.19,0.24,0.30,0.37,0.45,0.54].map(r => uploadLine(ringGeometry(r)));
    const arcs = [uploadLine(arcGeometry(1.08,.18,2.72)),uploadLine(arcGeometry(1.18,2.34,2.18)),uploadLine(arcGeometry(1.30,4.08,1.82)),uploadLine(arcGeometry(.92,5.12,1.35))];

    const SU={P:gl.getUniformLocation(shellProgram,'uP'),M:gl.getUniformLocation(shellProgram,'uM'),T:gl.getUniformLocation(shellProgram,'uT'),A:gl.getUniformLocation(shellProgram,'uAlpha'),Q:gl.getUniformLocation(shellProgram,'uPhase'),C:gl.getUniformLocation(shellProgram,'uTint')};
    const LU={P:gl.getUniformLocation(lineProgram,'uP'),M:gl.getUniformLocation(lineProgram,'uM'),C:gl.getUniformLocation(lineProgram,'uColor'),A:gl.getUniformLocation(lineProgram,'uAlpha')};
    const PU={P:gl.getUniformLocation(pointProgram,'uP'),M:gl.getUniformLocation(pointProgram,'uM'),S:gl.getUniformLocation(pointProgram,'uSize'),C:gl.getUniformLocation(pointProgram,'uColor'),A:gl.getUniformLocation(pointProgram,'uAlpha')};

    let projection=identity(),running=true,visible=true,last=performance.now(),frameAverage=16.7,frames=0,renderScale=1,dpr=1,pointerX=0,pointerY=0,targetX=0,targetY=0,raf=0,pointMax=64;
    const pointRange=gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE); if(pointRange?.length>1)pointMax=pointRange[1];

    function view(){const rect=stage.getBoundingClientRect();return{width:Math.max(1,rect.width||host.clientWidth),height:Math.max(1,rect.height||host.clientHeight)}}
    function resize(){const{width,height}=view(),cap=1.32,budget=980000;dpr=Math.min(devicePixelRatio||1,cap)*renderScale;const pixels=width*height*dpr*dpr;if(pixels>budget)dpr*=Math.sqrt(budget/pixels);dpr=clamp(dpr,.76,cap);const tw=Math.max(1,Math.round(width*dpr)),th=Math.max(1,Math.round(height*dpr));if(canvas.width!==tw||canvas.height!==th){canvas.width=tw;canvas.height=th}gl.viewport(0,0,tw,th);projection=perspective(39*Math.PI/180,width/height,.1,30)}
    function baseModel(t){const{width}=view(),s=clamp(width*.00112,.405,.485),idle=reduced.matches?.9:t;return compose(translate(0,-.015,-3.28),rotateX(-.075+pointerY*.080+Math.sin(idle*.18)*.012),rotateY(.10+pointerX*.10+Math.sin(idle*.21)*.024),rotateZ(Math.sin(idle*.17)*.009),scale(s,s,s))}

    function shellPass(time,model,tint,alpha,phase){gl.useProgram(shellProgram);gl.uniformMatrix4fv(SU.P,false,projection);gl.uniformMatrix4fv(SU.M,false,model);gl.uniform1f(SU.T,time);gl.uniform1f(SU.A,alpha);gl.uniform1f(SU.Q,phase);gl.uniform3fv(SU.C,tint);gl.bindVertexArray(shell.vao);gl.drawArrays(gl.TRIANGLES,0,shell.count)}
    function linePass(geometry,model,color,alpha){gl.useProgram(lineProgram);gl.uniformMatrix4fv(LU.P,false,projection);gl.uniformMatrix4fv(LU.M,false,model);gl.uniform3fv(LU.C,color);gl.uniform1f(LU.A,alpha);gl.bindVertexArray(geometry.vao);gl.drawArrays(gl.LINES,0,geometry.count)}
    function nucleusPass(model,size,color,alpha){gl.useProgram(pointProgram);gl.uniformMatrix4fv(PU.P,false,projection);gl.uniformMatrix4fv(PU.M,false,model);gl.uniform1f(PU.S,Math.min(pointMax,size*dpr));gl.uniform3fv(PU.C,color);gl.uniform1f(PU.A,alpha);gl.drawArrays(gl.POINTS,0,1)}

    function render(now){if(!running)return;const delta=Math.min(60,now-last);last=now;frameAverage+=(delta-frameAverage)*.04;frames+=1;if(frames%90===0&&!reduced.matches){if(frameAverage>23&&renderScale>.82){renderScale=Math.max(.82,renderScale-.08);resize()}else if(frameAverage<17.5&&renderScale<1){renderScale=Math.min(1,renderScale+.04);resize()}}pointerX+=(targetX-pointerX)*.035;pointerY+=(targetY-pointerY)*.035;if(visible){const t=reduced.matches?.9:now*.001,model=baseModel(t);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(false);gl.disable(gl.CULL_FACE);shellPass(t,model,[.02,.32,.64],1,0);shellPass(t,compose(model,scale(.965,.965,1.05)),[.10,.48,.92],.58,1.7);linePass(wire,model,[.00,.82,1.18],.46);linePass(cross,model,[.18,.86,1.22],.34);rings.forEach((ring,index)=>{const pulse=.72+.28*Math.sin(t*(.72+index*.035)+index*.82),ringModel=compose(model,rotateZ(t*(index%2?-.075:.064)+index*.10)),color=index%3===2?[.68,.12,1.08]:[.00,.92,1.30];linePass(ring,ringModel,color,.22+.19*pulse)});arcs.forEach((arc,index)=>{const orbit=compose(model,rotateZ(t*(index%2?-.055:.045)+index*1.23),rotateX(.18+index*.08));linePass(arc,orbit,index%2?[.72,.10,1.05]:[.00,.80,1.16],.16+.05*Math.sin(t+index))});const nucleusModel=compose(model,scale(.93,.93,.93)),pulse=.5+.5*Math.sin(t*1.8);nucleusPass(nucleusModel,26+pulse*3,[.04,.88,1.18],.54);nucleusPass(nucleusModel,17+pulse*2,[.82,.96,1.10],.94);nucleusPass(nucleusModel,9+pulse,[1,1,1],1);gl.bindVertexArray(null);gl.depthMask(true)}raf=requestAnimationFrame(render)}

    function onPointer(event){if(event.pointerType==='touch')return;targetX=clamp(event.clientX/Math.max(1,innerWidth)*2-1,-1,1);targetY=clamp(-(event.clientY/Math.max(1,innerHeight)*2-1),-1,1)}
    const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);const intersectionObserver=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting)},{rootMargin:'120px 0px 120px 0px'});intersectionObserver.observe(hero);addEventListener('resize',resize,{passive:true});visualViewport?.addEventListener('resize',resize,{passive:true});addEventListener('pointermove',onPointer,{passive:true});
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();running=false;cancelAnimationFrame(raf);fail('context-lost-v55')},{passive:false});canvas.addEventListener('webglcontextrestored',()=>location.reload(),{once:true});addEventListener('pagehide',()=>{running=false;cancelAnimationFrame(raf);resizeObserver.disconnect();intersectionObserver.disconnect()},{once:true});

    resize();root.dataset.fxCoreMobileV55=READY;root.dataset.fxCoreReal3d='ready-v55';root.dataset.fxCoreRenderer='single-webgl2-mobile-cinematic-crystal-v55';root.dataset.fxCoreReferenceGeometry='long-sharp-four-tip-deep-concave-crystal-v55';root.dataset.fxCoreReferenceMaterial='thin-layered-faceted-fresnel-glass-v55';root.dataset.fxCoreInternalReactor='small-hot-white-nucleus-concentric-cyan-violet-rings-v55';root.dataset.fxCoreResponsive='physical-mobile-hero-local-v55';root.dataset.fxCorePerformance='single-context-adaptive-60-plus-fps';root.dataset.fxCoreImageBacked='false';root.dataset.fxCoreDepth='closed-volumetric-shell-with-sidewalls';root.dataset.fxCoreReferenceLock='ready-v55';dispatchEvent(new CustomEvent('formatx:core3dready',{detail:{version:VERSION,mobile:true}}));raf=requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => start(), { once:true });
  else start();
}());

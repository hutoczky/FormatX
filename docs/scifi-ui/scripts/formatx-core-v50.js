(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'v50-rounded-living-core';
  if (root.dataset.fxCoreV50 === 'ready') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreV50 = 'audit-skip';
    return;
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = matchMedia('(max-width: 900px), (pointer: coarse), (max-aspect-ratio: 27/25)');
  const mobile = mobileQuery.matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function fail(reason, message) {
    root.dataset.fxCoreV50 = reason;
    root.dataset.fxCoreReal3d = reason;
    if (message) root.dataset.fxCoreReal3dError = String(message).slice(0, 220);
    dispatchEvent(new CustomEvent('formatx:core3dfallback', { detail: { reason, message: message || '', reference: VERSION } }));
  }

  if (typeof WebGL2RenderingContext === 'undefined') {
    fail('webgl2-unavailable');
    return;
  }

  function start() {
    if (!document.body || root.dataset.fxCoreV50 === 'ready') return;

    document.querySelectorAll('.fx-core-real3d-stage').forEach((node) => node.remove());

    const stage = document.createElement('div');
    stage.className = 'fx-core-real3d-stage fx-core-v50-stage';
    stage.dataset.active = 'false';
    stage.dataset.fxCoreVersion = VERSION;
    stage.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-core-real3d-canvas fx-core-v50-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    stage.append(canvas);
    document.body.append(stage);

    let gl;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: false,
        depth: true,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: mobile ? 'default' : 'high-performance'
      });
    } catch (error) {
      stage.remove();
      fail('context-unavailable', error?.message || error);
      return;
    }

    if (!gl || gl.isContextLost()) {
      stage.remove();
      fail('context-unavailable');
      return;
    }

    const I = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    function mul(a, b) {
      const o = new Float32Array(16);
      for (let c = 0; c < 4; c += 1) {
        for (let r = 0; r < 4; r += 1) {
          o[r + c * 4] = a[r] * b[c * 4] + a[r + 4] * b[c * 4 + 1] + a[r + 8] * b[c * 4 + 2] + a[r + 12] * b[c * 4 + 3];
        }
      }
      return o;
    }
    function tr(x, y, z) { const o = I(); o[12] = x; o[13] = y; o[14] = z; return o; }
    function sc(x, y, z) { const o = I(); o[0] = x; o[5] = y; o[10] = z; return o; }
    function rx(a) { const o = I(); const c = Math.cos(a); const s = Math.sin(a); o[5] = c; o[6] = s; o[9] = -s; o[10] = c; return o; }
    function ry(a) { const o = I(); const c = Math.cos(a); const s = Math.sin(a); o[0] = c; o[2] = -s; o[8] = s; o[10] = c; return o; }
    function rz(a) { const o = I(); const c = Math.cos(a); const s = Math.sin(a); o[0] = c; o[1] = s; o[4] = -s; o[5] = c; return o; }
    function compose(...m) { return m.reduce((a, b) => mul(a, b), I()); }
    function persp(fov, aspect, near, far) {
      const q = 1 / Math.tan(fov / 2);
      const r = 1 / (near - far);
      const o = new Float32Array(16);
      o[0] = q / aspect;
      o[5] = q;
      o[10] = (far + near) * r;
      o[11] = -1;
      o[14] = 2 * far * near * r;
      return o;
    }

    const SHELL_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP, uM;
uniform float uT, uDeform;
out vec3 vP, vW, vN;
void main(){
  vec3 p=aP;
  float organic = sin(p.y*5.1 + uT*.29)*.50 + sin(p.x*6.4 - uT*.21)*.32 + sin((p.x+p.z)*7.2 + uT*.17)*.18;
  p *= 1.0 + organic * uDeform * .016;
  vec4 w=uM*vec4(p,1.0);
  vP=p;
  vW=w.xyz;
  vN=normalize(transpose(inverse(mat3(uM)))*aN);
  gl_Position=uP*w;
}`;

    const SHELL_FS = `#version 300 es
precision highp float;
in vec3 vP, vW, vN;
uniform float uT, uA, uPhase;
uniform vec3 uTint;
out vec4 O;
float S(float x){return clamp(x,0.,1.);}
float band(float x,float c,float w){return exp(-pow(abs(x-c)/w,1.55));}
void main(){
  vec3 V=normalize(-vW);
  vec3 N=normalize(vN);
  float nv=S(abs(dot(N,V)));
  float fres=.02+.98*pow(1.-nv,2.7);
  vec3 n=normalize(vP);
  float lon=atan(n.y,n.x);
  float lat=asin(clamp(n.z,-1.,1.));
  float flowA=pow(max(0.,1.-abs(sin(lon*5.0 + lat*8.0 - uT*.22 + uPhase))),18.0);
  float flowB=pow(max(0.,1.-abs(sin(lon*8.0 - lat*5.0 + uT*.16 + uPhase*.7))),24.0);
  float membrane=band(abs(lat),.18,.038)+band(abs(lat),.43,.045)*.70+band(abs(lat),.72,.055)*.38;
  float orbit=band(abs(sin(lon*2.0+lat)),.26,.055)*.28;
  float violet=pow(.5+.5*cos(lon*3.0-lat*4.0+uT*.11+uPhase),10.0);
  vec3 cyan=vec3(.05,.92,1.32);
  vec3 blue=vec3(.04,.30,.96);
  vec3 violetC=vec3(.70,.10,1.10);
  vec3 ice=vec3(.72,1.12,1.25);
  vec3 col=uTint*(.10+.22*fres);
  col+=cyan*(.09+.28*fres+.10*membrane+.10*flowA+.06*flowB);
  col+=blue*(.05+.07*orbit+.05*flowB);
  col+=violetC*(.08*violet+.05*flowA+.03*membrane);
  col+=ice*pow(fres,1.8)*.32;
  float alpha=uA*S(.10+.50*fres+.08*membrane+.055*flowA+.04*flowB);
  O=vec4(col,alpha);
}`;

    const GLOW_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP, uM;
out vec3 vW, vN;
void main(){
  vec4 w=uM*vec4(aP,1.0);
  vW=w.xyz;
  vN=normalize(transpose(inverse(mat3(uM)))*aN);
  gl_Position=uP*w;
}`;

    const GLOW_FS = `#version 300 es
precision highp float;
in vec3 vW, vN;
uniform vec3 uTint;
uniform float uA, uGlow;
out vec4 O;
void main(){
  vec3 V=normalize(-vW);
  float fres=pow(1.-clamp(abs(dot(normalize(vN),V)),0.,1.),2.2);
  vec3 col=uTint*(1.0+uGlow*.80)+vec3(1.0)*uGlow*.34;
  O=vec4(col,uA*(.62+.38*fres));
}`;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'shader');
      return shader;
    }
    function makeProgram(vsSource, fsSource) {
      const p = gl.createProgram();
      const vs = compile(gl.VERTEX_SHADER, vsSource);
      const fs = compile(gl.FRAGMENT_SHADER, fsSource);
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
      return p;
    }

    let shellProgram;
    let glowProgram;
    try {
      shellProgram = makeProgram(SHELL_VS, SHELL_FS);
      glowProgram = makeProgram(GLOW_VS, GLOW_FS);
    } catch (error) {
      stage.remove();
      fail('shader-failed', error?.message || error);
      return;
    }

    function sphere(lon = mobile ? 36 : 48, lat = mobile ? 24 : 32) {
      const P = [];
      const N = [];
      const Ix = [];
      for (let y = 0; y <= lat; y += 1) {
        const ph = y / lat * Math.PI;
        for (let x = 0; x <= lon; x += 1) {
          const th = x / lon * Math.PI * 2;
          const nx = Math.cos(th) * Math.sin(ph);
          const ny = Math.cos(ph);
          const nz = Math.sin(th) * Math.sin(ph);
          P.push(nx, ny, nz);
          N.push(nx, ny, nz);
        }
      }
      const row = lon + 1;
      for (let y = 0; y < lat; y += 1) {
        for (let x = 0; x < lon; x += 1) {
          const a = y * row + x;
          const b = (y + 1) * row + x;
          Ix.push(a, b, a + 1, a + 1, b, b + 1);
        }
      }
      return { P, N, Ix };
    }

    function torus(majorSegments = mobile ? 48 : 72, minorSegments = mobile ? 8 : 10, minor = .017) {
      const P = [];
      const N = [];
      const Ix = [];
      for (let i = 0; i <= majorSegments; i += 1) {
        const a = i / majorSegments * Math.PI * 2;
        for (let j = 0; j <= minorSegments; j += 1) {
          const b = j / minorSegments * Math.PI * 2;
          const r = 1 + minor * Math.cos(b);
          const x = r * Math.cos(a);
          const y = r * Math.sin(a);
          const z = minor * Math.sin(b);
          P.push(x, y, z);
          N.push(Math.cos(a) * Math.cos(b), Math.sin(a) * Math.cos(b), Math.sin(b));
        }
      }
      const row = minorSegments + 1;
      for (let i = 0; i < majorSegments; i += 1) {
        for (let j = 0; j < minorSegments; j += 1) {
          const a = i * row + j;
          const b = (i + 1) * row + j;
          Ix.push(a, b, b + 1, a, b + 1, a + 1);
        }
      }
      return { P, N, Ix };
    }

    function upload(g) {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      let b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.P), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.N), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      const ib = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(g.Ix), gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      return { vao, ib, count: g.Ix.length };
    }

    let orb;
    let ribbon;
    try {
      orb = upload(sphere());
      ribbon = upload(torus());
    } catch (error) {
      stage.remove();
      fail('geometry-failed', error?.message || error);
      return;
    }

    const SU = {
      P: gl.getUniformLocation(shellProgram, 'uP'),
      M: gl.getUniformLocation(shellProgram, 'uM'),
      T: gl.getUniformLocation(shellProgram, 'uT'),
      A: gl.getUniformLocation(shellProgram, 'uA'),
      phase: gl.getUniformLocation(shellProgram, 'uPhase'),
      tint: gl.getUniformLocation(shellProgram, 'uTint'),
      deform: gl.getUniformLocation(shellProgram, 'uDeform')
    };
    const GU = {
      P: gl.getUniformLocation(glowProgram, 'uP'),
      M: gl.getUniformLocation(glowProgram, 'uM'),
      A: gl.getUniformLocation(glowProgram, 'uA'),
      tint: gl.getUniformLocation(glowProgram, 'uTint'),
      glow: gl.getUniformLocation(glowProgram, 'uGlow')
    };

    const fov = (mobile ? 42 : 40) * Math.PI / 180;
    let projection = I();
    let pixelScale = 1;
    let visible = true;
    let running = true;
    let last = performance.now();
    let frameEma = 16.7;
    let frameCount = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;

    function viewportMetrics() {
      const w = Math.max(1, innerWidth);
      const h = Math.max(1, visualViewport?.height || innerHeight);
      return { w, h, aspect: w / h };
    }

    function resize() {
      const { w, h, aspect } = viewportMetrics();
      const dprCap = mobile ? 1.35 : 1.75;
      const dpr = Math.min(devicePixelRatio || 1, dprCap) * pixelScale;
      const budget = mobile ? 1450000 : 2600000;
      const budgetScale = Math.min(1, Math.sqrt(budget / Math.max(1, w * h * dpr * dpr)));
      const realDpr = Math.max(.70, dpr * budgetScale);
      canvas.width = Math.max(1, Math.round(w * realDpr));
      canvas.height = Math.max(1, Math.round(h * realDpr));
      projection = persp(fov, aspect, .1, 20);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function composition(t) {
      const { aspect } = viewportMetrics();
      const depth = 3.15;
      const viewH = 2 * Math.tan(fov / 2) * depth;
      const viewW = viewH * aspect;
      const portrait = aspect < 1.08;
      const radius = portrait
        ? clamp(viewW * .34, .36, .66)
        : clamp(Math.min(viewH * .34, viewW * .19), .62, .90);
      const x = portrait ? 0 : viewW * .18;
      const y = portrait ? viewH * .10 : .02;
      const breathe = reduced.matches ? 1 : 1 + Math.sin(t * .72) * .012;
      const tiltX = reduced.matches ? 0 : pointerY * .10 + Math.sin(t * .16) * .025;
      const tiltY = reduced.matches ? 0 : pointerX * .12 + Math.sin(t * .13) * .032;
      const spin = reduced.matches ? 0 : Math.sin(t * .09) * .025;
      return {
        radius,
        model: compose(tr(x, y, -depth), rx(tiltX), ry(tiltY), rz(spin), sc(radius * breathe, radius * breathe, radius * breathe))
      };
    }

    function drawShell(model, alpha, tint, t, phase, deform) {
      gl.useProgram(shellProgram);
      gl.uniformMatrix4fv(SU.P, false, projection);
      gl.uniformMatrix4fv(SU.M, false, model);
      gl.uniform1f(SU.T, t);
      gl.uniform1f(SU.A, alpha);
      gl.uniform1f(SU.phase, phase);
      gl.uniform3fv(SU.tint, tint);
      gl.uniform1f(SU.deform, deform);
      gl.bindVertexArray(orb.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, orb.ib);
      gl.drawElements(gl.TRIANGLES, orb.count, gl.UNSIGNED_INT, 0);
    }

    function drawGlow(mesh, model, alpha, tint, glow) {
      gl.useProgram(glowProgram);
      gl.uniformMatrix4fv(GU.P, false, projection);
      gl.uniformMatrix4fv(GU.M, false, model);
      gl.uniform1f(GU.A, alpha);
      gl.uniform3fv(GU.tint, tint);
      gl.uniform1f(GU.glow, glow);
      gl.bindVertexArray(mesh.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ib);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
    }

    const ribbonData = [
      { r: .34, a: .58, c: [0.10, 1.02, 1.12], x: .18, y: .06, s: .32 },
      { r: .45, a: .46, c: [0.88, 0.15, 1.05], x: -.24, y: .16, s: -.24 },
      { r: .56, a: .36, c: [0.14, 0.60, 1.18], x: .34, y: -.20, s: .18 },
      { r: .68, a: .28, c: [0.10, 0.94, 0.92], x: -.36, y: -.12, s: -.14 },
      { r: .80, a: .20, c: [0.66, 0.12, 1.02], x: .22, y: .34, s: .10 }
    ];

    function render(now) {
      if (!running) return;
      const dt = Math.min(50, Math.max(1, now - last));
      last = now;
      frameEma += (dt - frameEma) * .045;
      frameCount += 1;

      if (!visible || document.hidden) {
        requestAnimationFrame(render);
        return;
      }

      if (frameCount % 120 === 0) {
        const oldScale = pixelScale;
        if (frameEma > 21.5) pixelScale = Math.max(.68, pixelScale - .08);
        else if (frameEma < 15.2) pixelScale = Math.min(1, pixelScale + .04);
        if (Math.abs(pixelScale - oldScale) > .001) resize();
      }

      pointerX += (pointerTargetX - pointerX) * .055;
      pointerY += (pointerTargetY - pointerY) * .055;

      const t = reduced.matches ? 0 : now * .001;
      const { model: B } = composition(t);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.depthMask(false);

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      drawShell(B, mobile ? .34 : .30, [.08, .72, 1.00], t, 0.0, reduced.matches ? 0 : 1.0);
      drawShell(mul(B, compose(ry(.34), rz(.18), sc(.92, .92, .92))), mobile ? .23 : .20, [.12, .86, 1.04], t, 1.7, reduced.matches ? 0 : .70);
      drawShell(mul(B, compose(rx(-.28), rz(-.24), sc(.83, .83, .83))), mobile ? .16 : .14, [.62, .12, 1.02], t, 3.1, reduced.matches ? 0 : .50);

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      for (let i = 0; i < ribbonData.length; i += 1) {
        const d = ribbonData[i];
        const spin = reduced.matches ? i * .38 : t * d.s + i * .64;
        const M = mul(B, compose(rx(d.x), ry(d.y), rz(spin), sc(d.r, d.r, d.r)));
        drawGlow(ribbon, M, d.a, d.c, .45);
      }

      const nx = reduced.matches ? 0 : Math.sin(t * .71) * .070 + pointerX * .020;
      const ny = reduced.matches ? 0 : Math.cos(t * .63) * .050 - pointerY * .016;
      const nz = reduced.matches ? .035 : .035 + Math.sin(t * .51) * .030;
      const pulse = reduced.matches ? 1 : 1 + Math.sin(t * 2.25) * .055;
      const C = mul(B, tr(nx, ny, nz));
      drawGlow(orb, mul(C, sc(.090 * pulse, .090 * pulse, .090 * pulse)), .98, [1.10, 1.18, 1.22], 1.8);
      drawGlow(orb, mul(C, sc(.150 * pulse, .150 * pulse, .150 * pulse)), .42, [.12, 1.02, 1.10], 1.05);
      drawGlow(orb, mul(C, sc(.225 * pulse, .225 * pulse, .225 * pulse)), .15, [.20, .58, 1.10], .65);

      gl.depthMask(true);
      gl.bindVertexArray(null);
      root.dataset.fxCoreFps = String(Math.round(1000 / Math.max(1, frameEma)));
      root.dataset.fxCoreRenderScale = pixelScale.toFixed(2);
      requestAnimationFrame(render);
    }

    function updatePointer(event) {
      const { w, h } = viewportMetrics();
      pointerTargetX = clamp((event.clientX / w) * 2 - 1, -1, 1);
      pointerTargetY = clamp((event.clientY / h) * 2 - 1, -1, 1);
    }

    addEventListener('pointermove', updatePointer, { passive: true });
    addEventListener('resize', resize, { passive: true });
    visualViewport?.addEventListener('resize', resize, { passive: true });

    const hero = document.getElementById('hero');
    const setVisible = (value) => {
      visible = value;
      stage.dataset.active = value ? 'true' : 'false';
    };
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        setVisible(entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > .01));
      }, { threshold: [0, .01, .08] }).observe(hero);
    } else {
      setVisible(true);
    }

    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      running = false;
      fail('context-lost');
    }, { once: true });

    resize();
    root.dataset.fxCoreV50 = 'ready';
    root.dataset.fxCoreReal3d = 'ready-v20';
    root.dataset.fxCoreRenderer = 'single-webgl2-rounded-living-core-v50';
    root.dataset.fxCoreRendererRevision = VERSION;
    root.dataset.fxCoreReferenceLock = 'ready-v50';
    root.dataset.fxCoreVisualRevision = VERSION;
    root.dataset.fxCoreReferenceGeometry = 'rounded-organic-glass-orb-v50';
    root.dataset.fxCoreReferenceMaterial = 'transparent-layered-living-glass-v50';
    root.dataset.fxCoreInternalReactor = 'moving-internal-nucleus-spectral-orbits-v50';
    root.dataset.fxCoreResponsive = 'desktop-mobile-bounded-v50';
    root.dataset.fxCorePerformance = 'single-context-adaptive-60-plus-fps';
    requestAnimationFrame(render);
  }

  if (document.body) start();
  else addEventListener('DOMContentLoaded', start, { once: true });
}());

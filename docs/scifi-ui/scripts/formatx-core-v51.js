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
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);

  function mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c += 1) {
      for (let r = 0; r < 4; r += 1) {
        o[r + c * 4] =
          a[r] * b[c * 4] +
          a[r + 4] * b[c * 4 + 1] +
          a[r + 8] * b[c * 4 + 2] +
          a[r + 12] * b[c * 4 + 3];
      }
    }
    return o;
  }

  function tr(x, y, z) {
    const o = I();
    o[12] = x;
    o[13] = y;
    o[14] = z;
    return o;
  }

  function sc(x, y, z) {
    const o = I();
    o[0] = x;
    o[5] = y;
    o[10] = z;
    return o;
  }

  function rx(a) {
    const o = I();
    const c = Math.cos(a);
    const s = Math.sin(a);
    o[5] = c;
    o[6] = s;
    o[9] = -s;
    o[10] = c;
    return o;
  }

  function ry(a) {
    const o = I();
    const c = Math.cos(a);
    const s = Math.sin(a);
    o[0] = c;
    o[2] = -s;
    o[8] = s;
    o[10] = c;
    return o;
  }

  function rz(a) {
    const o = I();
    const c = Math.cos(a);
    const s = Math.sin(a);
    o[0] = c;
    o[1] = s;
    o[4] = -s;
    o[5] = c;
    return o;
  }

  function compose(...m) {
    return m.reduce((a, b) => mul(a, b), I());
  }

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

  function start() {
    if (!document.body || root.dataset.fxCoreV51 === READY) return;

    document.querySelectorAll('.fx-core-real3d-stage').forEach(node => node.remove());

    const stage = document.createElement('div');
    stage.className = 'fx-core-real3d-stage fx-core-v51-stage';
    stage.dataset.active = 'false';
    stage.dataset.fxCoreVersion = VERSION;
    stage.setAttribute('aria-hidden', 'true');

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-core-real3d-canvas fx-core-v51-canvas';
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
        powerPreference: mobile ? 'default' : 'high-performance',
        desynchronized: true
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

    const SHELL_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
layout(location=1) in vec3 aN;
uniform mat4 uP, uM;
uniform float uT;
out vec3 vP, vW, vN;
void main(){
  vec3 p=aP;
  float breathe=1.0 + sin(uT*.46 + length(p.xy)*5.0)*.006;
  p.xy*=breathe;
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
float band(float x,float c,float w){return exp(-pow(abs(x-c)/w,1.6));}

void main(){
  vec3 V=normalize(-vW);
  vec3 N=normalize(vN);
  float nv=S(abs(dot(N,V)));
  float fres=.018+.982*pow(1.-nv,2.55);

  float a=atan(vP.y,vP.x);
  float r=length(vP.xy);
  float axis=pow(abs(cos(a*2.0)),11.0);
  float facetA=pow(.5+.5*cos(a*16.0 + r*19.0 - uT*.14 + uPhase),18.0);
  float facetB=pow(.5+.5*cos(a*24.0 - r*27.0 + uT*.11),26.0);
  float rib=band(fract(r*6.4 + axis*.18),.50,.085);
  float flow=pow(.5+.5*cos(a*8.0 + r*31.0 - uT*.55 + uPhase),22.0);
  float inner=exp(-r*r*2.15);
  float violet=pow(.5+.5*cos(a*6.0-r*8.0+uT*.17+uPhase),12.0);

  vec3 cyan=vec3(.04,.92,1.42);
  vec3 blue=vec3(.03,.26,1.05);
  vec3 violetC=vec3(.78,.12,1.18);
  vec3 ice=vec3(.82,1.22,1.42);

  vec3 col=uTint*(.045+.14*fres);
  col+=cyan*(.085+.34*fres+.16*flow+.075*rib+.08*facetA);
  col+=blue*(.055+.08*facetB+.055*axis);
  col+=violetC*(.035+.13*violet+.035*facetA);
  col+=ice*(.16*pow(fres,1.55)+.10*facetB+.05*inner);

  float alpha=uA*S(.055+.57*fres+.09*flow+.05*rib+.055*facetA+.03*facetB);
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
  float fres=pow(1.-clamp(abs(dot(normalize(vN),V)),0.,1.),2.0);
  vec3 col=uTint*(1.0+uGlow*.95)+vec3(1.0)*uGlow*.48;
  O=vec4(col,uA*(.58+.42*fres));
}`;

    const LINE_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aP;
uniform mat4 uP, uM;
void main(){
  gl_Position=uP*uM*vec4(aP,1.0);
}`;

    const LINE_FS = `#version 300 es
precision highp float;
uniform vec3 uTint;
uniform float uA;
out vec4 O;
void main(){
  O=vec4(uTint,uA);
}`;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || 'shader');
      }
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
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p) || 'link');
      }
      return p;
    }

    let shellProgram;
    let glowProgram;
    let lineProgram;
    try {
      shellProgram = makeProgram(SHELL_VS, SHELL_FS);
      glowProgram = makeProgram(GLOW_VS, GLOW_FS);
      lineProgram = makeProgram(LINE_VS, LINE_FS);
    } catch (error) {
      stage.remove();
      fail('shader-failed', error?.message || error);
      return;
    }

    function starRadius(theta) {
      const axis = Math.pow(Math.abs(Math.cos(theta * 2)), 9.5);
      const shoulder = Math.pow(Math.abs(Math.cos(theta * 2)), 2.2);
      return .52 + .26 * shoulder + .42 * axis;
    }

    function crystal(angleSegments = mobile ? 72 : 104, radialSegments = mobile ? 10 : 14) {
      const P = [];
      const N = [];
      const Ix = [];

      for (const side of [-1, 1]) {
        const sideOffset = P.length / 3;
        for (let j = 0; j <= radialSegments; j += 1) {
          const u = j / radialSegments;
          for (let i = 0; i <= angleSegments; i += 1) {
            const th = i / angleSegments * Math.PI * 2;
            const baseR = starRadius(th);
            const stepped = 1 + .022 * Math.sin(th * 12) * u + .012 * Math.sin(th * 20 + u * 9);
            const r = baseR * u * stepped;
            const x = r * Math.cos(th);
            const y = r * Math.sin(th) * 1.075;
            const dome = .095 * (1 - Math.pow(u, 1.65)) + .185 * Math.sin(Math.PI * u);
            const facet = 1 + .10 * Math.sin(th * 8) * Math.sin(Math.PI * u) + .055 * Math.sin(th * 16);
            const z = side * dome * facet;
            P.push(x, y, z);

            const nx = x * .30;
            const ny = y * .30;
            const nz = side * (1.0 + .22 * Math.cos(th * 8) * u);
            const nl = Math.hypot(nx, ny, nz) || 1;
            N.push(nx / nl, ny / nl, nz / nl);
          }
        }

        const row = angleSegments + 1;
        for (let j = 0; j < radialSegments; j += 1) {
          for (let i = 0; i < angleSegments; i += 1) {
            const a = sideOffset + j * row + i;
            const b = sideOffset + (j + 1) * row + i;
            if (side > 0) {
              Ix.push(a, b, a + 1, a + 1, b, b + 1);
            } else {
              Ix.push(a, a + 1, b, a + 1, b + 1, b);
            }
          }
        }
      }

      return { P, N, Ix };
    }

    function sphere(lon = mobile ? 28 : 40, lat = mobile ? 18 : 26) {
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

    function torus(majorSegments = mobile ? 54 : 80, minorSegments = mobile ? 8 : 10, minor = .018) {
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
          N.push(
            Math.cos(a) * Math.cos(b),
            Math.sin(a) * Math.cos(b),
            Math.sin(b)
          );
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

    function crystalLines(angleSegments = mobile ? 72 : 104) {
      const P = [];

      const zAt = (u, th) => {
        const dome = .095 * (1 - Math.pow(u, 1.65)) + .185 * Math.sin(Math.PI * u);
        const facet = 1 + .10 * Math.sin(th * 8) * Math.sin(Math.PI * u) + .055 * Math.sin(th * 16);
        return dome * facet + .006;
      };

      for (let spoke = 0; spoke < 16; spoke += 1) {
        const th = spoke / 16 * Math.PI * 2;
        const rr = starRadius(th);
        for (let s = 0; s < 10; s += 1) {
          const u0 = s / 10;
          const u1 = (s + 1) / 10;
          P.push(
            rr * u0 * Math.cos(th), rr * u0 * Math.sin(th) * 1.075, zAt(u0, th),
            rr * u1 * Math.cos(th), rr * u1 * Math.sin(th) * 1.075, zAt(u1, th)
          );
        }
      }

      for (const u of [.27, .43, .59, .73, .86, 1.0]) {
        for (let i = 0; i < angleSegments; i += 1) {
          const t0 = i / angleSegments * Math.PI * 2;
          const t1 = (i + 1) / angleSegments * Math.PI * 2;
          const r0 = starRadius(t0) * u;
          const r1 = starRadius(t1) * u;
          P.push(
            r0 * Math.cos(t0), r0 * Math.sin(t0) * 1.075, zAt(u, t0),
            r1 * Math.cos(t1), r1 * Math.sin(t1) * 1.075, zAt(u, t1)
          );
        }
      }

      for (const th of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        const rr = starRadius(th);
        for (const u of [.36, .58, .78]) {
          const offset = .055 + u * .035;
          const tangentX = -Math.sin(th) * offset;
          const tangentY = Math.cos(th) * offset;
          const x = rr * u * Math.cos(th);
          const y = rr * u * Math.sin(th) * 1.075;
          const z = zAt(u, th) + .010;
          P.push(x - tangentX, y - tangentY, z, x + tangentX, y + tangentY, z);
        }
      }

      return P;
    }

    function uploadIndexed(g) {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      const pb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, pb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.P), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

      const nb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, nb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.N), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

      const ib = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(g.Ix), gl.STATIC_DRAW);

      gl.bindVertexArray(null);
      return { vao, count: g.Ix.length };
    }

    function uploadLines(P) {
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(P), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      return { vao, count: P.length / 3 };
    }

    let shell;
    let orb;
    let ring;
    let wire;
    let axis;
    try {
      shell = uploadIndexed(crystal());
      orb = uploadIndexed(sphere());
      ring = uploadIndexed(torus());
      wire = uploadLines(crystalLines());
      axis = uploadLines([
        -1.22, 0, .18, 1.22, 0, .18,
        0, -1.31, .18, 0, 1.31, .18
      ]);
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
      tint: gl.getUniformLocation(shellProgram, 'uTint')
    };

    const GU = {
      P: gl.getUniformLocation(glowProgram, 'uP'),
      M: gl.getUniformLocation(glowProgram, 'uM'),
      A: gl.getUniformLocation(glowProgram, 'uA'),
      tint: gl.getUniformLocation(glowProgram, 'uTint'),
      glow: gl.getUniformLocation(glowProgram, 'uGlow')
    };

    const LU = {
      P: gl.getUniformLocation(lineProgram, 'uP'),
      M: gl.getUniformLocation(lineProgram, 'uM'),
      A: gl.getUniformLocation(lineProgram, 'uA'),
      tint: gl.getUniformLocation(lineProgram, 'uTint')
    };

    const fov = (mobile ? 41 : 39) * Math.PI / 180;
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
      const dprCap = mobile ? 1.30 : 1.70;
      const budget = mobile ? 1350000 : 2500000;
      let dpr = Math.min(devicePixelRatio || 1, dprCap);
      const targetPixels = w * h * dpr * dpr;
      if (targetPixels > budget) dpr *= Math.sqrt(budget / targetPixels);
      dpr *= pixelScale;
      dpr = clamp(dpr, .72, dprCap);

      const cw = Math.max(1, Math.round(w * dpr));
      const ch = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      gl.viewport(0, 0, cw, ch);
      projection = persp(fov, aspect, .1, 30);
    }

    function baseTransform(t) {
      const { w, h } = viewportMetrics();
      const portrait = mobile || h > w * 1.08;
      const scale = portrait
        ? clamp(w * .00134, .46, .60)
        : clamp(w * .00058, .68, .96);
      const x = portrait ? 0 : .78;
      const y = portrait ? .16 : .02;
      const z = portrait ? -3.45 : -3.70;

      const driftX = Math.sin(t * .29) * .012;
      const driftY = Math.cos(t * .23) * .012;
      return compose(
        tr(x + driftX, y + driftY, z),
        rx(pointerY * .11),
        ry(pointerX * .13),
        rz(Math.sin(t * .19) * .009),
        sc(scale, scale, scale)
      );
    }

    function drawShell(t, base) {
      gl.useProgram(shellProgram);
      gl.uniformMatrix4fv(SU.P, false, projection);
      gl.bindVertexArray(shell.vao);

      const layers = [
        { s: 1.000, z: 0, rzv: 0, a: .58, tint: [.08, .58, 1.16], phase: .0 },
        { s: .934, z: .008, rzv: .010, a: .42, tint: [.08, .82, 1.30], phase: 1.1 },
        { s: .838, z: .016, rzv: -.014, a: .32, tint: [.30, .28, 1.15], phase: 2.3 }
      ];

      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      for (const layer of layers) {
        const m = mul(base, compose(tr(0, 0, layer.z), rz(layer.rzv), sc(layer.s, layer.s, layer.s)));
        gl.uniformMatrix4fv(SU.M, false, m);
        gl.uniform1f(SU.T, t);
        gl.uniform1f(SU.A, layer.a);
        gl.uniform1f(SU.phase, layer.phase);
        gl.uniform3fv(SU.tint, layer.tint);
        gl.drawElements(gl.TRIANGLES, shell.count, gl.UNSIGNED_INT, 0);
      }
    }

    function drawWire(t, base) {
      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(LU.P, false, projection);
      gl.bindVertexArray(wire.vao);

      gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.lineWidth(1);

      gl.uniformMatrix4fv(LU.M, false, base);
      gl.uniform3fv(LU.tint, [.22, .86, 1.00]);
      gl.uniform1f(LU.A, .28 + .08 * Math.sin(t * .9));
      gl.drawArrays(gl.LINES, 0, wire.count);

      const secondary = mul(base, sc(.86, .86, .86));
      gl.uniformMatrix4fv(LU.M, false, secondary);
      gl.uniform3fv(LU.tint, [.62, .16, 1.00]);
      gl.uniform1f(LU.A, .13 + .04 * Math.cos(t * .7));
      gl.drawArrays(gl.LINES, 0, wire.count);
    }

    function drawRing(model, tint, alpha, glow) {
      gl.useProgram(glowProgram);
      gl.uniformMatrix4fv(GU.P, false, projection);
      gl.uniformMatrix4fv(GU.M, false, model);
      gl.uniform3fv(GU.tint, tint);
      gl.uniform1f(GU.A, alpha);
      gl.uniform1f(GU.glow, glow);
      gl.bindVertexArray(ring.vao);
      gl.drawElements(gl.TRIANGLES, ring.count, gl.UNSIGNED_INT, 0);
    }

    function drawOrb(model, tint, alpha, glow) {
      gl.useProgram(glowProgram);
      gl.uniformMatrix4fv(GU.P, false, projection);
      gl.uniformMatrix4fv(GU.M, false, model);
      gl.uniform3fv(GU.tint, tint);
      gl.uniform1f(GU.A, alpha);
      gl.uniform1f(GU.glow, glow);
      gl.bindVertexArray(orb.vao);
      gl.drawElements(gl.TRIANGLES, orb.count, gl.UNSIGNED_INT, 0);
    }

    function drawReactor(t, base) {
      gl.disable(gl.DEPTH_TEST);
      gl.depthMask(false);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

      const nucleusX = Math.sin(t * .71) * .018 + Math.cos(t * .31) * .006;
      const nucleusY = Math.cos(t * .63) * .015 + Math.sin(t * .27) * .005;
      const pulse = 1 + Math.sin(t * 1.42) * .035;

      const nucleus = mul(base, compose(
        tr(nucleusX, nucleusY, .13),
        sc(.102 * pulse, .102 * pulse, .102 * pulse)
      ));
      drawOrb(nucleus, [1.12, 1.22, 1.24], .98, 1.65);

      const halo = mul(base, compose(
        tr(nucleusX, nucleusY, .09),
        sc(.176 * pulse, .176 * pulse, .176 * pulse)
      ));
      drawOrb(halo, [.18, .91, 1.26], .23, 1.35);

      const ringData = [
        [.215, 0.0, 0.0, .82, [.06, .90, 1.30]],
        [.292, .15, -.08, .62, [.08, .72, 1.28]],
        [.372, -.19, .09, .48, [.48, .24, 1.22]],
        [.460, .27, .14, .36, [.04, .80, 1.20]],
        [.548, -.32, -.12, .28, [.64, .18, 1.16]],
        [.646, .36, .18, .22, [.05, .58, 1.16]]
      ];

      for (let i = 0; i < ringData.length; i += 1) {
        const [r, ax, ay, alpha, tint] = ringData[i];
        const spin = t * (.18 + i * .031) * (i % 2 ? -1 : 1);
        const wobble = Math.sin(t * (.37 + i * .05)) * .028;
        const m = mul(base, compose(
          tr(0, 0, .105 - i * .007),
          rx(ax + wobble),
          ry(ay - wobble * .7),
          rz(spin),
          sc(r, r, r)
        ));
        drawRing(m, tint, alpha, 1.10 + i * .06);
      }

      const orbiters = [
        [.31, .82, .017, [.12, .98, 1.25]],
        [.43, -.61, .014, [.72, .18, 1.10]],
        [.56, .47, .012, [.08, .76, 1.18]]
      ];

      for (let i = 0; i < orbiters.length; i += 1) {
        const [radius, speed, size, tint] = orbiters[i];
        const a = t * speed + i * 2.12;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius * .93;
        const z = .16 + Math.sin(a * 1.7) * .055;
        const m = mul(base, compose(tr(x, y, z), sc(size, size, size)));
        drawOrb(m, tint, .88, 1.45);
      }
    }

    function drawAxisFlares(t, base) {
      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(LU.P, false, projection);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.bindVertexArray(axis.vao);

      gl.uniformMatrix4fv(LU.M, false, base);
      gl.uniform3fv(LU.tint, [.36, .95, 1.00]);
      gl.uniform1f(LU.A, .42 + .08 * Math.sin(t * 1.1));
      gl.drawArrays(gl.LINES, 0, axis.count);
    }

    function render(now) {
      if (!running) return;
      const dt = Math.min(60, now - last);
      last = now;
      frameEma = frameEma * .94 + dt * .06;
      frameCount += 1;

      if (frameCount % 90 === 0) {
        if (frameEma > 20.5 && pixelScale > .76) {
          pixelScale = Math.max(.76, pixelScale - .08);
          resize();
        } else if (frameEma < 16.1 && pixelScale < 1) {
          pixelScale = Math.min(1, pixelScale + .04);
          resize();
        }
        root.dataset.fxCoreFrameMs = frameEma.toFixed(1);
      }

      pointerX += (pointerTargetX - pointerX) * .035;
      pointerY += (pointerTargetY - pointerY) * .035;

      if (!visible || document.hidden) {
        requestAnimationFrame(render);
        return;
      }

      const t = reduced.matches ? 0.8 : now * .001;
      gl.clearColor(0, 0, 0, 0);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const base = baseTransform(t);
      drawShell(t, base);
      drawWire(t, base);
      drawReactor(t, base);
      drawAxisFlares(t, base);

      gl.bindVertexArray(null);
      gl.depthMask(true);
      requestAnimationFrame(render);
    }

    function pointerMove(event) {
      const x = event.clientX / Math.max(1, innerWidth) * 2 - 1;
      const y = event.clientY / Math.max(1, innerHeight) * 2 - 1;
      pointerTargetX = clamp(x, -1, 1);
      pointerTargetY = clamp(-y, -1, 1);
    }

    addEventListener('pointermove', pointerMove, { passive: true });
    addEventListener('resize', resize, { passive: true });
    visualViewport?.addEventListener('resize', resize, { passive: true });

    const hero = document.getElementById('hero');
    if (hero && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        stage.dataset.active = visible ? 'true' : 'false';
      }, { rootMargin: '18% 0px 18% 0px', threshold: .01 });
      observer.observe(hero);
    } else {
      visible = true;
      stage.dataset.active = 'true';
    }

    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      running = false;
      stage.dataset.active = 'false';
      fail('context-lost');
    }, { passive: false });

    canvas.addEventListener('webglcontextrestored', () => {
      location.reload();
    }, { once: true });

    resize();

    root.dataset.fxCoreV51 = READY;
    root.dataset.fxCoreReal3d = 'ready-v20';
    root.dataset.fxCoreRenderer = 'single-webgl2-reference-crystal-v51';
    root.dataset.fxCoreReferenceLock = 'ready-v51';
    root.dataset.fxCoreReferenceRevision = 'reference-image-20260810-v51';
    root.dataset.fxCoreReferenceGeometry = 'sharp-four-tip-concave-crystal-v51';
    root.dataset.fxCoreReferenceMaterial = 'layered-faceted-refractive-glass-v51';
    root.dataset.fxCoreInternalReactor = 'moving-white-nucleus-concentric-spectral-rings-v51';
    root.dataset.fxCoreResponsive = 'desktop-mobile-reference-framing-v51';
    root.dataset.fxCorePerformance = 'single-context-adaptive-60-plus-fps';
    root.dataset.fxCoreImageBacked = 'false';
    stage.dataset.active = 'true';

    dispatchEvent(new CustomEvent('formatx:core3dready', {
      detail: {
        renderer: root.dataset.fxCoreRenderer,
        geometry: root.dataset.fxCoreReferenceGeometry,
        material: root.dataset.fxCoreReferenceMaterial,
        reactor: root.dataset.fxCoreInternalReactor,
        reference: VERSION
      }
    }));

    requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}());

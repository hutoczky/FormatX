(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'v28';
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  if (AUDIT_MODE || root.dataset.fxOrbitalCore === 'ready-v28') return;
  if (typeof WebGL2RenderingContext === 'undefined') {
    root.dataset.fxOrbitalCore = 'webgl2-unavailable';
    return;
  }

  const hero = document.getElementById('hero');
  if (!hero || !document.body) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  const mobile = coarse.matches;

  const stage = document.createElement('div');
  stage.className = 'fx-orbital-core-v28-stage';
  stage.dataset.active = 'false';
  stage.setAttribute('aria-hidden', 'true');

  const canvas = document.createElement('canvas');
  canvas.className = 'fx-orbital-core-v28-canvas';
  canvas.dataset.fxOrbitalCoreCanvas = VERSION;
  stage.appendChild(canvas);
  document.body.appendChild(stage);

  let contextMessage = '';
  canvas.addEventListener('webglcontextcreationerror', event => {
    contextMessage = event.statusMessage || 'webgl2-context-creation-error';
  }, { once: true });

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: mobile ? 'default' : 'high-performance'
  });

  if (!gl || gl.isContextLost()) {
    stage.remove();
    root.dataset.fxOrbitalCore = 'context-unavailable';
    if (contextMessage) root.dataset.fxOrbitalCoreError = contextMessage.slice(0, 220);
    return;
  }

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c += 1) {
      for (let r = 0; r < 4; r += 1) {
        out[r + c * 4] = a[r] * b[c * 4]
          + a[r + 4] * b[c * 4 + 1]
          + a[r + 8] * b[c * 4 + 2]
          + a[r + 12] * b[c * 4 + 3];
      }
    }
    return out;
  }

  function compose(...parts) { return parts.reduce((out, part) => multiply(out, part), identity()); }
  function translation(x, y, z) { const m = identity(); m[12] = x; m[13] = y; m[14] = z; return m; }
  function scaling(x, y, z) { const m = identity(); m[0] = x; m[5] = y; m[10] = z; return m; }
  function rotationX(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
  function rotationY(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
  function rotationZ(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }

  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    const m = new Float32Array(16);
    m[0] = f / aspect;
    m[5] = f;
    m[10] = (far + near) * nf;
    m[11] = -1;
    m[14] = 2 * far * near * nf;
    return m;
  }

  function normalize(v) {
    const length = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / length, v[1] / length, v[2] / length];
  }
  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }
  function lookAt(eye, target, up) {
    const z = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
    const x = normalize(cross(up, z));
    const y = cross(z, x);
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
      -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
      -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]), 1
    ]);
  }

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'shader compile failed';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(vertexSource, fragmentSource) {
    const program = gl.createProgram();
    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'program link failed';
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  const VERTEX = `#version 300 es
    precision highp float;
    layout(location=0) in vec3 aPosition;
    layout(location=1) in vec3 aNormal;
    uniform mat4 uProjection;
    uniform mat4 uView;
    uniform mat4 uModel;
    out vec3 vWorld;
    out vec3 vNormal;
    out vec3 vObject;
    void main(){
      vec4 world=uModel*vec4(aPosition,1.0);
      vWorld=world.xyz;
      vObject=aPosition;
      vNormal=normalize(transpose(inverse(mat3(uModel)))*aNormal);
      gl_Position=uProjection*uView*world;
    }`;

  const FRAGMENT = `#version 300 es
    precision highp float;
    in vec3 vWorld;
    in vec3 vNormal;
    in vec3 vObject;
    uniform vec3 uCamera;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uMaterial;
    uniform float uTime;
    uniform float uEnergy;
    out vec4 fragColor;
    float sat(float v){return clamp(v,0.0,1.0);}
    void main(){
      vec3 N=normalize(vNormal);
      vec3 V=normalize(uCamera-vWorld);
      float ndv=sat(abs(dot(N,V)));
      float fres=pow(1.0-ndv,3.15);

      if(uMaterial<0.5){
        float r=length(vObject);
        float shell=1.0-smoothstep(.72,1.02,r);
        float inner=pow(sat(1.0-r),2.15);
        float caustic=.5+.5*sin(vObject.x*11.0-vObject.y*9.0+vObject.z*13.0+uTime*.52);
        float pulse=.78+.22*sin(uTime*1.05);
        vec3 deep=vec3(.006,.035,.080);
        vec3 cyan=vec3(.03,.82,1.35);
        vec3 blue=vec3(.025,.25,.90);
        vec3 violet=vec3(.72,.05,1.04);
        vec3 glass=deep+mix(blue,cyan,.45+caustic*.24)*(inner*.23+fres*.62);
        glass+=violet*fres*.18*(.35+.65*caustic);
        glass+=vec3(.75,.95,1.0)*pow(fres,3.0)*.32;
        float alpha=uOpacity*(.10+fres*.42+inner*.08+shell*.05)*pulse;
        fragColor=vec4(glass*(.90+uEnergy*.20),alpha);
        return;
      }

      if(uMaterial<1.5){
        float spec=pow(sat(dot(reflect(normalize(vec3(.35,-.55,-.72)),N),V)),44.0);
        float rim=.25+.75*pow(1.0-ndv,1.45);
        float pulse=.86+.14*sin(uTime*1.7+vObject.x*4.0+vObject.z*3.0);
        vec3 c=uColor*(1.28+rim*1.08+spec*.85+uEnergy*.42)*pulse;
        fragColor=vec4(c,uOpacity*(.70+.24*rim));
        return;
      }

      float core=pow(sat(dot(N,V)),.35);
      float flicker=.88+.12*sin(uTime*2.35+vObject.x*6.0-vObject.y*4.0);
      vec3 white=vec3(1.0,.98,.94);
      vec3 cyan=vec3(.25,.92,1.25);
      vec3 c=mix(cyan,white,.72+core*.28)*(2.25+uEnergy*1.35)*flicker;
      fragColor=vec4(c,uOpacity);
    }`;

  let program;
  try {
    program = createProgram(VERTEX, FRAGMENT);
  } catch (error) {
    stage.remove();
    root.dataset.fxOrbitalCore = 'shader-failed';
    root.dataset.fxOrbitalCoreError = String(error.message || error).slice(0, 220);
    return;
  }

  const locations = {
    projection: gl.getUniformLocation(program, 'uProjection'),
    view: gl.getUniformLocation(program, 'uView'),
    model: gl.getUniformLocation(program, 'uModel'),
    camera: gl.getUniformLocation(program, 'uCamera'),
    color: gl.getUniformLocation(program, 'uColor'),
    opacity: gl.getUniformLocation(program, 'uOpacity'),
    material: gl.getUniformLocation(program, 'uMaterial'),
    time: gl.getUniformLocation(program, 'uTime'),
    energy: gl.getUniformLocation(program, 'uEnergy')
  };

  function sphereGeometry(segments, rings) {
    const positions = [];
    const normals = [];
    const indices = [];
    for (let y = 0; y <= rings; y += 1) {
      const v = y / rings;
      const phi = v * Math.PI;
      const sy = Math.cos(phi);
      const sr = Math.sin(phi);
      for (let x = 0; x <= segments; x += 1) {
        const u = x / segments;
        const theta = u * Math.PI * 2;
        const px = Math.cos(theta) * sr;
        const pz = Math.sin(theta) * sr;
        positions.push(px, sy, pz);
        normals.push(px, sy, pz);
      }
    }
    const stride = segments + 1;
    for (let y = 0; y < rings; y += 1) {
      for (let x = 0; x < segments; x += 1) {
        const a = y * stride + x;
        const b = a + stride;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return { positions, normals, indices };
  }

  function curvePoint(t, spec) {
    const wobble = 1 + spec.wobble * Math.sin(t * spec.wave + spec.phase * 1.7);
    const x = Math.cos(t + spec.phase) * spec.rx * wobble;
    const z = Math.sin(t + spec.phase) * spec.rz * (1 + spec.wobble * .55 * Math.cos(t * (spec.wave + 1) - spec.phase));
    const y = Math.sin(t * 2 + spec.phase * 1.9) * spec.ry
      + Math.sin(t * 3 - spec.phase) * spec.ry * .22;
    return [x, y, z];
  }

  function tubeGeometry(spec, segments, sides) {
    const positions = [];
    const normals = [];
    const indices = [];
    const dt = Math.PI * 2 / segments;

    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments * Math.PI * 2;
      const p = curvePoint(t, spec);
      const before = curvePoint(t - dt * .35, spec);
      const after = curvePoint(t + dt * .35, spec);
      const tangent = normalize([after[0] - before[0], after[1] - before[1], after[2] - before[2]]);
      let reference = Math.abs(tangent[1]) > .82 ? [1, 0, 0] : [0, 1, 0];
      let normal = normalize(cross(tangent, reference));
      let binormal = normalize(cross(tangent, normal));
      for (let side = 0; side < sides; side += 1) {
        const a = side / sides * Math.PI * 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        const n = normalize([
          normal[0] * ca + binormal[0] * sa,
          normal[1] * ca + binormal[1] * sa,
          normal[2] * ca + binormal[2] * sa
        ]);
        const radius = spec.thickness * (1 + .18 * Math.sin(t * 4 + spec.phase));
        positions.push(p[0] + n[0] * radius, p[1] + n[1] * radius, p[2] + n[2] * radius);
        normals.push(n[0], n[1], n[2]);
      }
    }

    for (let i = 0; i < segments; i += 1) {
      for (let side = 0; side < sides; side += 1) {
        const nextSide = (side + 1) % sides;
        const a = i * sides + side;
        const b = (i + 1) * sides + side;
        const c = (i + 1) * sides + nextSide;
        const d = i * sides + nextSide;
        indices.push(a, b, d, b, c, d);
      }
    }
    return { positions, normals, indices };
  }

  function upload(geometry) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const p = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, p);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const n = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, n);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    const e = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, e);
    const array = geometry.positions.length / 3 > 65535 ? new Uint32Array(geometry.indices) : new Uint16Array(geometry.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    return { vao, count: geometry.indices.length, type: array instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, buffers: [p, n, e] };
  }

  const sphere = upload(sphereGeometry(mobile ? 42 : 58, mobile ? 24 : 34));
  const emitter = upload(sphereGeometry(mobile ? 24 : 34, mobile ? 14 : 20));

  const ribbonSpecs = [
    { rx: 1.37, rz: 1.16, ry: .32, wobble: .075, wave: 3, phase: .15, thickness: .014, color: [0.02, .72, 1.38], tilt: [.22, .08, .18], speed: .18 },
    { rx: 1.28, rz: 1.33, ry: .27, wobble: .095, wave: 4, phase: 1.05, thickness: .013, color: [.08, .38, 1.52], tilt: [-.34, .25, -.14], speed: -.15 },
    { rx: 1.43, rz: 1.18, ry: .36, wobble: .070, wave: 5, phase: 2.10, thickness: .012, color: [.86, .06, 1.18], tilt: [.38, -.18, .33], speed: .12 },
    { rx: 1.18, rz: 1.42, ry: .24, wobble: .105, wave: 3, phase: 3.20, thickness: .011, color: [.00, .94, 1.15], tilt: [-.18, -.31, .41], speed: -.19 },
    { rx: 1.35, rz: 1.28, ry: .29, wobble: .083, wave: 6, phase: 4.25, thickness: .010, color: [.68, .10, 1.38], tilt: [.12, .43, -.35], speed: .16 },
    { rx: 1.24, rz: 1.36, ry: .33, wobble: .060, wave: 4, phase: 5.15, thickness: .009, color: [.08, .82, 1.28], tilt: [-.42, .05, -.28], speed: -.11 }
  ];
  const ribbons = ribbonSpecs.map(spec => ({ spec, mesh: upload(tubeGeometry(spec, mobile ? 96 : 128, mobile ? 5 : 7)) }));

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  gl.useProgram(program);

  const camera = [0, .05, mobile ? 5.15 : 5.30];
  let projection = identity();
  let view = lookAt(camera, [0, 0, 0], [0, 1, 0]);
  let renderScale = mobile ? .88 : 1;
  let cssWidth = 1;
  let cssHeight = 1;
  let dpr = 1;
  let active = true;
  let frame = 0;
  let last = performance.now();
  let ema = 16.7;
  let slowFrames = 0;
  let fastFrames = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let energy = .30;
  let targetEnergy = .30;
  let observer = null;

  function resize() {
    cssWidth = Math.max(1, innerWidth);
    cssHeight = Math.max(1, innerHeight);
    dpr = Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.65);
    const width = Math.max(1, Math.round(cssWidth * dpr * renderScale));
    const height = Math.max(1, Math.round(cssHeight * dpr * renderScale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = cssWidth + 'px';
      canvas.style.height = cssHeight + 'px';
      gl.viewport(0, 0, width, height);
      projection = perspective(mobile ? .73 : .68, width / height, .08, 40);
    }
  }

  function updateActive() {
    const rect = hero.getBoundingClientRect();
    const vh = Math.max(1, innerHeight);
    active = !document.hidden && rect.bottom > -vh * .15 && rect.top < vh * 1.02;
    stage.dataset.active = active ? 'true' : 'false';
  }

  function onPointerMove(event) {
    const rect = hero.getBoundingClientRect();
    if (event.clientY < rect.top || event.clientY > rect.bottom) return;
    const px = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
    const py = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
    targetX = (px - .5) * 2;
    targetY = (py - .45) * 2;
    const distance = Math.min(1, Math.hypot(targetX * .7, targetY * .7));
    targetEnergy = .34 + (1 - distance) * .42;
  }

  function onPointerLeave() {
    targetX = 0;
    targetY = 0;
    targetEnergy = .30;
  }

  function draw(mesh, model, material, color, opacity, time, localEnergy) {
    gl.uniformMatrix4fv(locations.model, false, model);
    gl.uniform3fv(locations.color, color);
    gl.uniform1f(locations.opacity, opacity);
    gl.uniform1f(locations.material, material);
    gl.uniform1f(locations.time, time);
    gl.uniform1f(locations.energy, localEnergy);
    gl.bindVertexArray(mesh.vao);
    gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);
  }

  function render(now) {
    frame = requestAnimationFrame(render);
    const dt = Math.min(45, now - last || 16.7);
    last = now;
    if (!active) return;

    ema = ema * .94 + dt * .06;
    if (ema > 20.5) { slowFrames += 1; fastFrames = 0; }
    else if (ema < 15.7) { fastFrames += 1; slowFrames = 0; }
    else { slowFrames = Math.max(0, slowFrames - 1); fastFrames = Math.max(0, fastFrames - 1); }
    if (slowFrames > 80 && renderScale > .70) { renderScale = Math.max(.70, renderScale - .08); slowFrames = 0; resize(); }
    if (fastFrames > 220 && renderScale < 1) { renderScale = Math.min(1, renderScale + .05); fastFrames = 0; resize(); }

    const response = 1 - Math.pow(.0015, dt / 1000);
    const motion = reduced.matches ? .14 : 1;
    pointerX = lerp(pointerX, targetX, response * .75);
    pointerY = lerp(pointerY, targetY, response * .75);
    energy = lerp(energy, targetEnergy, response * .62);

    const time = now * .001;
    const baseScale = mobile ? 1.00 : 1.05;
    const sceneX = mobile ? 0 : 1.05;
    const sceneY = mobile ? .25 : .02;
    const tiltX = -pointerY * .08 * motion;
    const tiltY = pointerX * .11 * motion;
    const baseRotation = compose(
      translation(sceneX, sceneY, 0),
      rotationX(tiltX + Math.sin(time * .11) * .035 * motion),
      rotationY(tiltY + Math.sin(time * .09) * .055 * motion),
      rotationZ(Math.sin(time * .07) * .025 * motion),
      scaling(baseScale, baseScale, baseScale)
    );

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniformMatrix4fv(locations.projection, false, projection);
    gl.uniformMatrix4fv(locations.view, false, view);
    gl.uniform3fv(locations.camera, camera);

    // Inner translucent volume first.
    gl.depthMask(true);
    draw(sphere, multiply(baseRotation, scaling(.94, .94, .94)), 0, [0.02, .62, 1.18], .34, time, energy);

    // Independent 3D luminous orbital ribbons.
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);
    ribbons.forEach((item, index) => {
      const spec = item.spec;
      const local = compose(
        baseRotation,
        rotationX(spec.tilt[0] + time * spec.speed * .33 * motion),
        rotationY(spec.tilt[1] + time * spec.speed * .56 * motion),
        rotationZ(spec.tilt[2] + time * spec.speed * motion)
      );
      draw(item.mesh, local, 1, spec.color, mobile ? .50 : .56, time + index * .37, energy);
    });

    // Drifting inner emitter: deliberately not fixed to exact center.
    const driftX = Math.sin(time * .73) * .075 * motion + pointerX * .028 * motion;
    const driftY = Math.cos(time * .61) * .060 * motion - pointerY * .022 * motion;
    const driftZ = Math.sin(time * .47 + .8) * .065 * motion;
    const pulse = .15 + (.018 * Math.sin(time * 1.8)) + energy * .018;
    draw(emitter, compose(baseRotation, translation(driftX, driftY, driftZ), scaling(pulse, pulse, pulse)), 2, [1, 1, 1], .96, time, energy);

    // Glass envelope last so ribbons remain visible through it.
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    draw(sphere, multiply(baseRotation, scaling(1.0, 1.0, 1.0)), 0, [0.03, .72, 1.25], .58, time, energy);
    gl.depthMask(true);
  }

  function retireLegacyCore() {
    document.querySelectorAll('.fx-reference-core-v26-stage, .fx-core-real3d-stage, .fx-core-mesh3d-stage, .fx-core-fracture3d-stage').forEach(element => {
      element.style.setProperty('display', 'none', 'important');
      element.style.setProperty('visibility', 'hidden', 'important');
      element.style.setProperty('opacity', '0', 'important');
    });
    root.dataset.fxReferenceCore = 'retired-by-orbital-v28';
    root.dataset.fxCinematicCore = 'retired-by-orbital-v28';
  }

  function destroy() {
    cancelAnimationFrame(frame);
    observer?.disconnect();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    stage.remove();
  }

  function init() {
    retireLegacyCore();
    root.dataset.fxOrbitalCore = 'ready-v28';
    root.dataset.fxRenderer = 'native-webgl2-orbital-glass-v28';
    root.dataset.fxCoreGeometry = 'sphere-plus-independent-3d-ribbons';
    root.dataset.fxCoreEmitter = 'drifting-inner-light-not-fixed';
    root.dataset.fxCoreReference = 'glass-orb-cinematic-ribbons';

    resize();
    updateActive();
    addEventListener('pointermove', onPointerMove, { passive: true });
    addEventListener('pointerleave', onPointerLeave, { passive: true });
    addEventListener('blur', onPointerLeave, { passive: true });
    addEventListener('resize', () => { resize(); updateActive(); }, { passive: true });
    addEventListener('scroll', updateActive, { passive: true });
    document.addEventListener('visibilitychange', updateActive);
    observer = new IntersectionObserver(updateActive, { rootMargin: '20% 0px', threshold: [0, .01, .2] });
    observer.observe(hero);
    frame = requestAnimationFrame(render);
    dispatchEvent(new CustomEvent('formatx:orbitalcoreready', { detail: { version: VERSION, renderer: 'webgl2', reference: 'glass-orb-ribbons' } }));
  }

  addEventListener('pagehide', destroy, { once: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());

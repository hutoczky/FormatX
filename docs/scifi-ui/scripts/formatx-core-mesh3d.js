(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  if (!body || root.dataset.fxCoreMesh3d === 'ready-v1') return;
  if (!window.WebGL2RenderingContext) {
    root.dataset.fxCoreMesh3d = 'webgl2-unavailable';
    return;
  }

  document.querySelectorAll('.fx-core-mesh3d-stage[data-fx-core-mesh3d]').forEach(node => node.remove());

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  const stage = document.createElement('div');
  stage.className = 'fx-core-mesh3d-stage';
  stage.dataset.fxCoreMesh3d = 'true';
  stage.dataset.active = 'false';
  stage.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-core-mesh3d-canvas';
  canvas.dataset.fxCoreMesh3dCanvas = 'true';
  stage.appendChild(canvas);
  body.appendChild(stage);

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    depth: true,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance'
  });
  if (!gl) {
    root.dataset.fxCoreMesh3d = 'context-unavailable';
    stage.remove();
    return;
  }

  const vertexSource = `#version 300 es
    precision highp float;
    in vec3 aPosition;
    in vec3 aNormal;
    uniform mat4 uView;
    uniform mat4 uProjection;
    uniform vec3 uTilt;
    uniform vec3 uGlobalRotation;
    uniform float uScale;
    uniform float uPulse;
    uniform float uYOffset;
    out vec3 vNormal;
    out vec3 vWorld;

    mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
    mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
    mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0.,s,c,0.,0.,0.,1.);}

    void main(){
      mat3 localRotation=rz(uTilt.z)*ry(uTilt.y)*rx(uTilt.x);
      mat3 globalRotation=rz(uGlobalRotation.z)*ry(uGlobalRotation.y)*rx(uGlobalRotation.x);
      vec3 p=globalRotation*(localRotation*(aPosition*uScale*uPulse));
      p.y+=uYOffset;
      vWorld=p;
      vNormal=normalize(globalRotation*(localRotation*aNormal));
      gl_Position=uProjection*uView*vec4(p,1.);
    }
  `;

  const fragmentSource = `#version 300 es
    precision highp float;
    in vec3 vNormal;
    in vec3 vWorld;
    out vec4 outColor;
    uniform vec3 uCamera;
    uniform vec3 uBaseColor;
    uniform vec3 uEmissionColor;
    uniform float uOpacity;
    uniform float uTime;
    uniform float uHeart;
    uniform float uMode;

    float sat(float x){return clamp(x,0.,1.);}

    void main(){
      vec3 n=normalize(vNormal);
      vec3 v=normalize(uCamera-vWorld);
      vec3 key=normalize(vec3(-.42,.76,.62));
      float diffuse=max(dot(n,key),0.);
      float fresnel=pow(1.-sat(dot(n,v)),3.2);

      if(uMode<.5){
        float radial=length(vWorld.xy);
        float angle=atan(vWorld.y,vWorld.x);
        float caustic=pow(.5+.5*sin(vWorld.x*11.8+vWorld.y*15.2-vWorld.z*18.4+uTime*.24),13.);
        float veins=pow(.5+.5*cos(angle*8.+radial*12.8-uTime*.07),24.);
        float axial=exp(-abs(vWorld.x)*18.)+exp(-abs(vWorld.y)*18.);
        float inner=exp(-radial*2.15)*(1.-sat(abs(vWorld.z)*1.8));
        vec3 glass=mix(uBaseColor,vec3(.08,.62,.92),.22+fresnel*.62);
        vec3 color=glass*(.18+.42*diffuse);
        color+=vec3(.30,1.05,1.62)*fresnel*1.85;
        color+=vec3(.08,.48,.86)*caustic*(.08+.24*(1.-fresnel));
        color+=vec3(.10,.70,1.10)*veins*(.08+.28*fresnel);
        color+=vec3(.18,.92,1.38)*axial*.08;
        color+=vec3(.04,.34,.62)*inner*.28;
        color+=uEmissionColor*(.08+.14*uHeart);
        float alpha=uOpacity*(.24+.50*fresnel+.10*caustic+.08*inner);
        outColor=vec4(color,clamp(alpha,.08,.88));
        return;
      }

      float facing=.55+.45*sat(dot(n,v));
      vec3 emission=uEmissionColor*(1.10+uHeart*.90)*facing;
      emission+=uBaseColor*.24;
      float alpha=uOpacity*(.70+.28*fresnel);
      outColor=vec4(emission,clamp(alpha,0.,1.));
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'mesh shader compile failed';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram() {
    const program = gl.createProgram();
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'mesh program link failed';
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function normalize3(x, y, z) {
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length];
  }

  function computeNormals(positions, indices) {
    const normals = new Float32Array(positions.length);
    for (let i = 0; i < indices.length; i += 3) {
      const ia = indices[i] * 3;
      const ib = indices[i + 1] * 3;
      const ic = indices[i + 2] * 3;
      const ax = positions[ia], ay = positions[ia + 1], az = positions[ia + 2];
      const bx = positions[ib], by = positions[ib + 1], bz = positions[ib + 2];
      const cx = positions[ic], cy = positions[ic + 1], cz = positions[ic + 2];
      const abx = bx - ax, aby = by - ay, abz = bz - az;
      const acx = cx - ax, acy = cy - ay, acz = cz - az;
      const nx = aby * acz - abz * acy;
      const ny = abz * acx - abx * acz;
      const nz = abx * acy - aby * acx;
      for (const offset of [ia, ib, ic]) {
        normals[offset] += nx;
        normals[offset + 1] += ny;
        normals[offset + 2] += nz;
      }
    }
    for (let i = 0; i < normals.length; i += 3) {
      const n = normalize3(normals[i], normals[i + 1], normals[i + 2]);
      normals[i] = n[0]; normals[i + 1] = n[1]; normals[i + 2] = n[2];
    }
    return normals;
  }

  function catmull(points, index, t) {
    const count = points.length;
    const p0 = points[(index - 1 + count) % count];
    const p1 = points[index % count];
    const p2 = points[(index + 1) % count];
    const p3 = points[(index + 2) % count];
    const tension = .34;
    const m1x = (p2[0] - p0[0]) * tension;
    const m1y = (p2[1] - p0[1]) * tension;
    const m2x = (p3[0] - p1[0]) * tension;
    const m2y = (p3[1] - p1[1]) * tension;
    const t2 = t * t, t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return [
      h00 * p1[0] + h10 * m1x + h01 * p2[0] + h11 * m2x,
      h00 * p1[1] + h10 * m1y + h01 * p2[1] + h11 * m2y
    ];
  }

  function buildCrystalGeometry() {
    const controls = [
      [0,1],[.115,.705],[.305,.325],[.705,.115],
      [1,0],[.705,-.115],[.305,-.325],[.115,-.705],
      [0,-1],[-.115,-.705],[-.305,-.325],[-.705,-.115],
      [-1,0],[-.705,.115],[-.305,.325],[-.115,.705]
    ];
    const boundary = [];
    const subdivisions = 7;
    for (let i = 0; i < controls.length; i += 1) {
      for (let s = 0; s < subdivisions; s += 1) boundary.push(catmull(controls, i, s / subdivisions));
    }

    const positions = [];
    const indices = [];
    const rings = 16;
    const radius = 1.46;
    const depth = .46;
    const front = [];
    const back = [];

    const add = (x, y, z) => {
      positions.push(x, y, z);
      return positions.length / 3 - 1;
    };

    const frontCenter = add(0, 0, depth);
    const backCenter = add(0, 0, -depth);

    for (let ring = 1; ring <= rings; ring += 1) {
      const t = ring / rings;
      const z = depth * (.10 + .90 * Math.pow(Math.max(0, 1 - Math.pow(t, 1.65)), .58));
      const frontRing = [];
      const backRing = [];
      for (const point of boundary) {
        const x = point[0] * radius * t;
        const y = point[1] * radius * t;
        frontRing.push(add(x, y, z));
        backRing.push(add(x, y, -z));
      }
      front.push(frontRing);
      back.push(backRing);
    }

    const count = boundary.length;
    for (let i = 0; i < count; i += 1) {
      const next = (i + 1) % count;
      indices.push(frontCenter, front[0][i], front[0][next]);
      indices.push(backCenter, back[0][next], back[0][i]);
    }

    for (let ring = 1; ring < rings; ring += 1) {
      const previousFront = front[ring - 1], currentFront = front[ring];
      const previousBack = back[ring - 1], currentBack = back[ring];
      for (let i = 0; i < count; i += 1) {
        const next = (i + 1) % count;
        indices.push(previousFront[i], currentFront[i], currentFront[next]);
        indices.push(previousFront[i], currentFront[next], previousFront[next]);
        indices.push(previousBack[i], currentBack[next], currentBack[i]);
        indices.push(previousBack[i], previousBack[next], currentBack[next]);
      }
    }

    const outerFront = front[rings - 1], outerBack = back[rings - 1];
    for (let i = 0; i < count; i += 1) {
      const next = (i + 1) % count;
      indices.push(outerFront[i], outerBack[i], outerBack[next]);
      indices.push(outerFront[i], outerBack[next], outerFront[next]);
    }

    return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
  }

  function buildTorusGeometry(major, minor, majorSegments = 84, minorSegments = 10) {
    const positions = [];
    const indices = [];
    for (let i = 0; i <= majorSegments; i += 1) {
      const u = i / majorSegments * Math.PI * 2;
      const cu = Math.cos(u), su = Math.sin(u);
      for (let j = 0; j <= minorSegments; j += 1) {
        const v = j / minorSegments * Math.PI * 2;
        const cv = Math.cos(v), sv = Math.sin(v);
        const r = major + minor * cv;
        positions.push(r * cu, r * su, minor * sv);
      }
    }
    const stride = minorSegments + 1;
    for (let i = 0; i < majorSegments; i += 1) {
      for (let j = 0; j < minorSegments; j += 1) {
        const a = i * stride + j;
        const b = (i + 1) * stride + j;
        indices.push(a, b, b + 1, a, b + 1, a + 1);
      }
    }
    return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
  }

  function buildSphereGeometry(radius, latitude = 22, longitude = 30) {
    const positions = [];
    const indices = [];
    for (let y = 0; y <= latitude; y += 1) {
      const v = y / latitude;
      const phi = v * Math.PI;
      const sp = Math.sin(phi), cp = Math.cos(phi);
      for (let x = 0; x <= longitude; x += 1) {
        const u = x / longitude;
        const theta = u * Math.PI * 2;
        positions.push(radius * sp * Math.cos(theta), radius * cp, radius * sp * Math.sin(theta));
      }
    }
    const stride = longitude + 1;
    for (let y = 0; y < latitude; y += 1) {
      for (let x = 0; x < longitude; x += 1) {
        const a = y * stride + x;
        const b = (y + 1) * stride + x;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
  }

  let program;
  try {
    program = createProgram();
  } catch (error) {
    console.warn('FormatX true 3D core mesh unavailable:', error);
    root.dataset.fxCoreMesh3d = 'shader-failed';
    stage.remove();
    return;
  }

  const attributes = {
    position: gl.getAttribLocation(program, 'aPosition'),
    normal: gl.getAttribLocation(program, 'aNormal')
  };
  const uniforms = {};
  [
    'uView','uProjection','uTilt','uGlobalRotation','uScale','uPulse','uYOffset',
    'uCamera','uBaseColor','uEmissionColor','uOpacity','uTime','uHeart','uMode'
  ].forEach(name => { uniforms[name] = gl.getUniformLocation(program, name); });

  function upload(geometry) {
    const normals = computeNormals(geometry.positions, geometry.indices);
    const vao = gl.createVertexArray();
    const positionBuffer = gl.createBuffer();
    const normalBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attributes.position);
    gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attributes.normal);
    gl.vertexAttribPointer(attributes.normal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return { vao, positionBuffer, normalBuffer, indexBuffer, count: geometry.indices.length };
  }

  const crystal = upload(buildCrystalGeometry());
  const reactorSphere = upload(buildSphereGeometry(.165));
  const reactorHalo = upload(buildSphereGeometry(.245, 18, 26));
  const reactorRings = [
    upload(buildTorusGeometry(.29, .012)),
    upload(buildTorusGeometry(.42, .010)),
    upload(buildTorusGeometry(.56, .009))
  ];
  const outerOrbits = [
    upload(buildTorusGeometry(.88, .008)),
    upload(buildTorusGeometry(1.02, .006))
  ];

  function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
      f / aspect,0,0,0,
      0,f,0,0,
      0,0,(far + near) * nf,-1,
      0,0,2 * far * near * nf,0
    ]);
  }

  function lookAt(eye, center, up) {
    let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    let len = Math.hypot(zx, zy, zz) || 1; zx /= len; zy /= len; zz /= len;
    let xx = up[1] * zz - up[2] * zy;
    let xy = up[2] * zx - up[0] * zz;
    let xz = up[0] * zy - up[1] * zx;
    len = Math.hypot(xx, xy, xz) || 1; xx /= len; xy /= len; xz /= len;
    const yx = zy * xz - zz * xy;
    const yy = zz * xx - zx * xz;
    const yz = zx * xy - zy * xx;
    return new Float32Array([
      xx,yx,zx,0,
      xy,yy,zy,0,
      xz,yz,zz,0,
      -(xx*eye[0]+xy*eye[1]+xz*eye[2]),
      -(yx*eye[0]+yy*eye[1]+yz*eye[2]),
      -(zx*eye[0]+zy*eye[1]+zz*eye[2]),1
    ]);
  }

  const camera = coarse.matches ? [0, 0, 4.55] : [0, 0, 4.72];
  let view = lookAt(camera, [0, -.02, 0], [0, 1, 0]);
  let projection = perspective(coarse.matches ? .70 : .66, Math.max(.1, innerWidth / Math.max(1, innerHeight)), .1, 20);
  let width = 1;
  let height = 1;
  let raf = 0;
  const started = performance.now();

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, coarse.matches ? 1.50 : 1.75);
    width = Math.max(2, Math.floor(innerWidth * dpr));
    height = Math.max(2, Math.floor(innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    projection = perspective(coarse.matches ? .70 : .66, width / Math.max(1, height), .1, 20);
    view = lookAt(camera, [0, -.02, 0], [0, 1, 0]);
    gl.viewport(0, 0, width, height);
  }

  function smoothstep(edge0, edge1, value) {
    const t = Math.max(0, Math.min(1, (value - edge0) / Math.max(.0001, edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function setVec3(location, value) {
    gl.uniform3f(location, value[0], value[1], value[2]);
  }

  function draw(mesh, mode, scale, pulse, tilt, baseColor, emissionColor, opacity, globalRotation, time, heart) {
    gl.bindVertexArray(mesh.vao);
    gl.uniform3f(uniforms.uTilt, tilt[0], tilt[1], tilt[2]);
    gl.uniform3f(uniforms.uGlobalRotation, globalRotation[0], globalRotation[1], globalRotation[2]);
    gl.uniform1f(uniforms.uScale, scale);
    gl.uniform1f(uniforms.uPulse, pulse);
    gl.uniform1f(uniforms.uYOffset, -.055);
    setVec3(uniforms.uBaseColor, baseColor);
    setVec3(uniforms.uEmissionColor, emissionColor);
    gl.uniform1f(uniforms.uOpacity, opacity);
    gl.uniform1f(uniforms.uTime, time);
    gl.uniform1f(uniforms.uHeart, heart);
    gl.uniform1f(uniforms.uMode, mode);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  }

  function render(now) {
    raf = requestAnimationFrame(render);
    const scene = Number.parseFloat(root.dataset.fxApexMappedScene || '0');
    const visible = 1 - smoothstep(.56, .92, Number.isFinite(scene) ? scene : 0);
    stage.dataset.active = visible > .015 ? 'true' : 'false';
    stage.style.opacity = String(visible);
    if (visible <= .002 || document.hidden || root.dataset.fxImmersive !== 'active') return;

    resize();
    const time = reducedMotion.matches ? 0 : (now - started) * .001;
    const beatA = .5 + .5 * Math.sin(time * 1.55);
    const beatB = .5 + .5 * Math.sin(time * 3.10 - .78);
    const heart = Math.pow(beatA, 4) * .72 + Math.pow(beatB, 9) * .28;
    const breath = .5 + .5 * Math.sin(time * .62 - .4);
    const pulse = 1 + heart * .026 + breath * .006;
    const globalRotation = reducedMotion.matches
      ? [.035, .055, 0]
      : [
          .035 + Math.sin(time * .20) * .040,
          .060 + Math.sin(time * .24) * .085,
          Math.sin(time * .16) * .012
        ];

    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.useProgram(program);
    gl.uniformMatrix4fv(uniforms.uView, false, view);
    gl.uniformMatrix4fv(uniforms.uProjection, false, projection);
    setVec3(uniforms.uCamera, camera);

    gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    draw(crystal, 0, 1, pulse, [0,0,0], [.008,.10,.18], [.05,.52,.88], .92 * visible, globalRotation, time, heart);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    draw(reactorHalo, 1, 1 + heart * .12, 1, [0,0,0], [.15,.75,1.0], [.22,1.12,1.55], .18 * visible, globalRotation, time, heart);
    draw(reactorSphere, 1, 1 + heart * .11, 1, [0,0,0], [.65,1.15,1.35], [1.30,2.10,2.55], .92 * visible, globalRotation, time, heart);

    const ringPulse = 1 + heart * .045 + breath * .009;
    draw(reactorRings[0], 1, ringPulse, 1, [0,0,.04 + time*.035], [.05,.72,1.0], [.18,1.12,1.58], .82 * visible, globalRotation, time, heart);
    draw(reactorRings[1], 1, ringPulse, 1, [.08,-.10,-.03 - time*.022], [.14,.58,1.0], [.38,.84,1.62], .72 * visible, globalRotation, time, heart);
    draw(reactorRings[2], 1, ringPulse, 1, [-.10,.14,.02 + time*.016], [.32,.30,1.0], [.70,.22,1.36], .62 * visible, globalRotation, time, heart);

    draw(outerOrbits[0], 1, ringPulse, 1, [.62,.10,.22 + time*.018], [.18,.42,1.0], [.56,.24,1.42], .46 * visible, globalRotation, time, heart);
    draw(outerOrbits[1], 1, ringPulse, 1, [-.42,.52,-.18 - time*.014], [.05,.62,1.0], [.18,.70,1.36], .34 * visible, globalRotation, time, heart);
    gl.depthMask(true);
    gl.bindVertexArray(null);
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    root.dataset.fxCoreMesh3d = 'context-lost';
    cancelAnimationFrame(raf);
  });
  addEventListener('resize', resize, { passive: true });
  resize();

  root.dataset.fxCoreMesh3d = 'ready-v1';
  root.dataset.fxCoreGeometry = 'indexed-triangle-mesh';
  root.dataset.fxCoreDepthBuffer = 'enabled';
  root.dataset.fxCoreNormals = 'per-vertex';
  root.dataset.fxCoreCamera = 'perspective';
  root.dataset.fxCoreReference = 'four-tip-concave-crystal';
  root.dataset.fxCoreRenderer = 'webgl2-indexed-mesh';
  const mode = document.querySelector('[data-fx-apex-mode]');
  if (mode) mode.textContent = 'WEBGL2 / INDEXED MESH 3D';
  dispatchEvent(new CustomEvent('formatx:coremesh3dready', { detail: { geometry: 'indexed-triangle-mesh', depth: true, reference: 'four-tip-concave-crystal' } }));
  raf = requestAnimationFrame(render);

  addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    [crystal, reactorSphere, reactorHalo, ...reactorRings, ...outerOrbits].forEach(mesh => {
      gl.deleteBuffer(mesh.positionBuffer);
      gl.deleteBuffer(mesh.normalBuffer);
      gl.deleteBuffer(mesh.indexBuffer);
      gl.deleteVertexArray(mesh.vao);
    });
    gl.deleteProgram(program);
  }, { once: true });
}());
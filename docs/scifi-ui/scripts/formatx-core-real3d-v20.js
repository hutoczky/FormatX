(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'v20';
  if (!document.body || root.dataset.fxCoreReal3d === 'ready-' + VERSION) return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    return;
  }
  if (typeof WebGL2RenderingContext === 'undefined') {
    root.dataset.fxCoreReal3d = 'webgl2-unavailable';
    return;
  }

  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = document.createElement('div');
  stage.className = 'fx-core-real3d-stage';
  stage.dataset.fxCoreReal3dStage = VERSION;
  stage.dataset.active = 'false';
  stage.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-core-real3d-canvas';
  canvas.dataset.fxCoreReal3dCanvas = VERSION;
  stage.appendChild(canvas);
  document.body.appendChild(stage);

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: true,
    stencil: false,
    desynchronized: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance'
  });
  if (!gl || gl.isContextLost()) {
    root.dataset.fxCoreReal3d = 'context-unavailable';
    stage.remove();
    return;
  }

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let column = 0; column < 4; column += 1) {
      for (let row = 0; row < 4; row += 1) {
        out[row + column * 4] = a[row] * b[column * 4]
          + a[row + 4] * b[column * 4 + 1]
          + a[row + 8] * b[column * 4 + 2]
          + a[row + 12] * b[column * 4 + 3];
      }
    }
    return out;
  }
  function translation(x, y, z) {
    const out = identity();
    out[12] = x; out[13] = y; out[14] = z;
    return out;
  }
  function scaling(x, y, z) {
    const out = identity();
    out[0] = x; out[5] = y; out[10] = z;
    return out;
  }
  function rotationX(angle) {
    const out = identity(), cosine = Math.cos(angle), sine = Math.sin(angle);
    out[5] = cosine; out[6] = sine; out[9] = -sine; out[10] = cosine;
    return out;
  }
  function rotationY(angle) {
    const out = identity(), cosine = Math.cos(angle), sine = Math.sin(angle);
    out[0] = cosine; out[2] = -sine; out[8] = sine; out[10] = cosine;
    return out;
  }
  function rotationZ(angle) {
    const out = identity(), cosine = Math.cos(angle), sine = Math.sin(angle);
    out[0] = cosine; out[1] = sine; out[4] = -sine; out[5] = cosine;
    return out;
  }
  function perspective(fieldOfView, aspect, near, far) {
    const f = 1 / Math.tan(fieldOfView / 2), range = 1 / (near - far);
    const out = new Float32Array(16);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) * range;
    out[11] = -1;
    out[14] = 2 * far * near * range;
    return out;
  }
  function compose(parts) {
    return parts.reduce((matrix, part) => multiply(matrix, part), identity());
  }

  const MESH_VERTEX = `#version 300 es
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
      vNormal=normalize(mat3(uModel)*aNormal);
      gl_Position=uProjection*uView*world;
    }`;
  const MESH_FRAGMENT = `#version 300 es
    precision highp float;
    in vec3 vWorld;
    in vec3 vNormal;
    in vec3 vObject;
    uniform vec3 uCamera;
    uniform float uTime;
    uniform float uEnergy;
    uniform float uSurge;
    uniform float uSpeech;
    uniform float uOpacity;
    uniform float uMaterial;
    uniform float uLayer;
    out vec4 fragColor;
    float sat(float value){return clamp(value,0.0,1.0);}
    void main(){
      vec3 viewDir=normalize(uCamera-vWorld);
      vec3 smoothNormal=normalize(vNormal);
      vec3 faceNormal=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
      if(!gl_FrontFacing)faceNormal=-faceNormal;
      vec3 normal=normalize(mix(smoothNormal,faceNormal,.58));
      float ndv=sat(abs(dot(normal,viewDir)));
      float fresnel=pow(1.0-ndv,2.35);
      vec3 lightA=normalize(vec3(-.32,.82,.48));
      vec3 lightB=normalize(vec3(.68,-.12,.70));
      float specA=pow(sat(dot(reflect(-lightA,normal),viewDir)),74.0);
      float specB=pow(sat(dot(reflect(-lightB,normal),viewDir)),42.0);
      float film=.5+.5*sin(16.0*fresnel+vObject.y*4.6-vObject.x*3.1+uLayer*2.2);
      float facet=pow(sat(abs(dot(faceNormal,lightA))),3.2);
      float radial=length(vObject.xy);
      float pulse=.5+.5*sin(uTime*1.48);
      float activity=sat(uEnergy*.72+uSurge*.55+uSpeech*.32);
      if(uMaterial<.5){
        vec3 cyan=vec3(.025,.55,1.22);
        vec3 blue=vec3(.10,.23,.92);
        vec3 violet=vec3(.72,.12,1.18);
        vec3 color=mix(blue,cyan,sat(.28+normal.y*.24+film*.52));
        color=mix(color,violet,sat((1.0-film)*.34+normal.x*.18+.12*uLayer));
        float inner=exp(-radial*1.65)*(.22+.28*activity);
        float spine=(exp(-abs(vObject.x)*18.0)+exp(-abs(vObject.y)*22.0))*(.075+.075*activity);
        float caustic=pow(abs(sin(vObject.x*11.0-vObject.y*8.0+uLayer)),18.0)*.32;
        color*=.38+1.02*fresnel+.28*facet;
        color+=vec3(.24,.76,1.20)*(.10+specA*1.25+specB*.70+caustic+inner+spine);
        color+=violet*film*(.12+fresnel*.30);
        float alpha=uOpacity*(.420+.46*fresnel+.18*facet+.08*activity);
        vec3 exposed=color*vec3(1.60,2.92,3.65);
        exposed+=vec3(.03,.90,1.80)*(specA*2.3+specB*1.0+caustic*.70+spine*.45);
        fragColor=vec4(exposed,alpha);
      }else if(uMaterial<1.5){
        float center=pow(ndv,.7);
        float rim=pow(1.0-ndv,1.7);
        vec3 core=mix(vec3(.10,.72,1.38),vec3(1.20,1.62,1.72),center);
        core+=vec3(.50,.16,1.15)*rim*(.45+.55*film);
        core*=.54+activity*.42+pulse*.08;
        fragColor=vec4(core*1.18,uOpacity*(.40+.30*center));
      }else{
        vec3 ring=mix(vec3(.08,.78,1.42),vec3(.74,.18,1.28),film*.48+uLayer*.08);
        ring*=1.05+activity*.62+specA*.82;
        fragColor=vec4(ring*1.24,uOpacity*(.58+.34*fresnel));
      }
    }`;
  const LINE_VERTEX = `#version 300 es
    precision highp float;
    layout(location=0) in vec3 aPosition;
    uniform mat4 uProjection;
    uniform mat4 uView;
    uniform mat4 uModel;
    void main(){gl_Position=uProjection*uView*uModel*vec4(aPosition,1.0);}`;
  const LINE_FRAGMENT = `#version 300 es
    precision highp float;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uEnergy;
    out vec4 fragColor;
    void main(){fragColor=vec4(uColor*(1.0+uEnergy*.75),uOpacity);}`;
  const POINT_VERTEX = `#version 300 es
    precision highp float;
    layout(location=0) in vec3 aPosition;
    uniform mat4 uProjection;
    uniform mat4 uView;
    uniform mat4 uModel;
    uniform float uTime;
    uniform float uDpr;
    out float vPulse;
    void main(){
      float phase=float(gl_VertexID)*1.618;
      vec3 point=aPosition;
      point.z+=sin(uTime*.24+phase)*.055;
      gl_Position=uProjection*uView*uModel*vec4(point,1.0);
      vPulse=.55+.45*sin(uTime*.52+phase*2.1);
      gl_PointSize=(1.2+vPulse*1.9)*uDpr;
    }`;
  const POINT_FRAGMENT = `#version 300 es
    precision highp float;
    in float vPulse;
    out vec4 fragColor;
    void main(){
      vec2 p=gl_PointCoord-.5;
      float glow=smoothstep(.5,0.0,length(p));
      if(glow<=.01)discard;
      fragColor=vec4(mix(vec3(.12,.56,1.0),vec3(.72,.25,1.0),vPulse),glow*glow*.72);
    }`;

  function shader(type, source) {
    const output = gl.createShader(type);
    gl.shaderSource(output, source);
    gl.compileShader(output);
    if (!gl.getShaderParameter(output, gl.COMPILE_STATUS)) {
      const reason = gl.getShaderInfoLog(output) || 'shader compile failed';
      gl.deleteShader(output);
      throw new Error(reason);
    }
    return output;
  }
  function program(vertexSource, fragmentSource) {
    const output = gl.createProgram();
    const vertex = shader(gl.VERTEX_SHADER, vertexSource);
    const fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(output, vertex);
    gl.attachShader(output, fragment);
    gl.linkProgram(output);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(output, gl.LINK_STATUS)) {
      const reason = gl.getProgramInfoLog(output) || 'program link failed';
      gl.deleteProgram(output);
      throw new Error(reason);
    }
    return output;
  }

  let meshProgram, lineProgram, pointProgram;
  try {
    meshProgram = program(MESH_VERTEX, MESH_FRAGMENT);
    lineProgram = program(LINE_VERTEX, LINE_FRAGMENT);
    pointProgram = program(POINT_VERTEX, POINT_FRAGMENT);
  } catch (error) {
    root.dataset.fxCoreReal3dError = String(error?.message || error).slice(0, 240);
    console.warn('FormatX real 3D core could not compile: ' + root.dataset.fxCoreReal3dError);
    root.dataset.fxCoreReal3d = 'shader-failed';
    stage.remove();
    return;
  }

  function calculateNormals(positions, indices) {
    const normals = new Float32Array(positions.length);
    for (let index = 0; index < indices.length; index += 3) {
      const ia = indices[index] * 3, ib = indices[index + 1] * 3, ic = indices[index + 2] * 3;
      const abx = positions[ib] - positions[ia], aby = positions[ib + 1] - positions[ia], abz = positions[ib + 2] - positions[ia + 2];
      const acx = positions[ic] - positions[ia], acy = positions[ic + 1] - positions[ia + 1], acz = positions[ic + 2] - positions[ia + 2];
      const nx = aby * acz - abz * acy, ny = abz * acx - abx * acz, nz = abx * acy - aby * acx;
      for (const offset of [ia, ib, ic]) {
        normals[offset] += nx; normals[offset + 1] += ny; normals[offset + 2] += nz;
      }
    }
    for (let index = 0; index < normals.length; index += 3) {
      const length = Math.hypot(normals[index], normals[index + 1], normals[index + 2]) || 1;
      normals[index] /= length; normals[index + 1] /= length; normals[index + 2] /= length;
    }
    return normals;
  }

  function starGeometry(angularSegments, radialSegments) {
    const positions = [], indices = [], lineIndices = [];
    const sides = [];
    for (const sign of [1, -1]) {
      const sideStart = positions.length / 3;
      sides.push(sideStart);
      positions.push(0, 0, sign * .31);
      for (let ring = 1; ring <= radialSegments; ring += 1) {
        const t = ring / radialSegments;
        for (let segment = 0; segment < angularSegments; segment += 1) {
          const angle = segment / angularSegments * Math.PI * 2;
          const cardinal = Math.pow(Math.abs(Math.cos(angle * 2)), 5.8);
          const radius = .43 + .57 * cardinal;
          const x = Math.cos(angle) * radius * t * .96;
          const y = Math.sin(angle) * radius * t * 1.31;
          const lens = Math.pow(Math.max(0, 1 - t * t), .68);
          const ridge = .82 + .18 * Math.pow(Math.abs(Math.cos(angle * 2)), 1.8);
          const z = sign * (.018 + .30 * lens * ridge);
          positions.push(x, y, z);
        }
      }
      const firstRing = sideStart + 1;
      for (let segment = 0; segment < angularSegments; segment += 1) {
        const next = (segment + 1) % angularSegments;
        if (sign > 0) indices.push(sideStart, firstRing + segment, firstRing + next);
        else indices.push(sideStart, firstRing + next, firstRing + segment);
      }
      for (let ring = 1; ring < radialSegments; ring += 1) {
        const current = sideStart + 1 + (ring - 1) * angularSegments;
        const nextRing = current + angularSegments;
        for (let segment = 0; segment < angularSegments; segment += 1) {
          const next = (segment + 1) % angularSegments;
          if (sign > 0) {
            indices.push(current + segment, nextRing + segment, nextRing + next, current + segment, nextRing + next, current + next);
          } else {
            indices.push(current + segment, nextRing + next, nextRing + segment, current + segment, current + next, nextRing + next);
          }
        }
      }
    }
    const frontEdge = sides[0] + 1 + (radialSegments - 1) * angularSegments;
    const backEdge = sides[1] + 1 + (radialSegments - 1) * angularSegments;
    for (let segment = 0; segment < angularSegments; segment += 1) {
      const next = (segment + 1) % angularSegments;
      indices.push(frontEdge + segment, backEdge + segment, backEdge + next, frontEdge + segment, backEdge + next, frontEdge + next);
    }
    const frontStart = sides[0];
    for (const ring of [3, 6, 9, radialSegments]) {
      if (ring > radialSegments) continue;
      const start = frontStart + 1 + (ring - 1) * angularSegments;
      for (let segment = 0; segment < angularSegments; segment += 1) {
        lineIndices.push(start + segment, start + (segment + 1) % angularSegments);
      }
    }
    for (let segment = 0; segment < angularSegments; segment += Math.max(4, Math.round(angularSegments / 16))) {
      let previous = frontStart;
      for (let ring = 1; ring <= radialSegments; ring += 1) {
        const current = frontStart + 1 + (ring - 1) * angularSegments + segment;
        lineIndices.push(previous, current);
        previous = current;
      }
    }
    return { positions: new Float32Array(positions), normals: calculateNormals(positions, indices), indices: new Uint16Array(indices), lineIndices: new Uint16Array(lineIndices) };
  }

  function sphereGeometry(longitudes, latitudes) {
    const positions = [], normals = [], indices = [];
    for (let latitude = 0; latitude <= latitudes; latitude += 1) {
      const v = latitude / latitudes, phi = v * Math.PI;
      for (let longitude = 0; longitude <= longitudes; longitude += 1) {
        const u = longitude / longitudes, theta = u * Math.PI * 2;
        const x = Math.sin(phi) * Math.cos(theta), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(theta);
        positions.push(x, y, z); normals.push(x, y, z);
      }
    }
    for (let latitude = 0; latitude < latitudes; latitude += 1) {
      for (let longitude = 0; longitude < longitudes; longitude += 1) {
        const a = latitude * (longitudes + 1) + longitude, b = a + longitudes + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
  }

  function torusGeometry(radialSegments, tubeSegments, radius, tube) {
    const positions = [], normals = [], indices = [];
    for (let radial = 0; radial <= radialSegments; radial += 1) {
      const u = radial / radialSegments * Math.PI * 2, cu = Math.cos(u), su = Math.sin(u);
      for (let side = 0; side <= tubeSegments; side += 1) {
        const v = side / tubeSegments * Math.PI * 2, cv = Math.cos(v), sv = Math.sin(v);
        positions.push((radius + tube * cv) * cu, (radius + tube * cv) * su, tube * sv);
        normals.push(cv * cu, cv * su, sv);
      }
    }
    for (let radial = 0; radial < radialSegments; radial += 1) {
      for (let side = 0; side < tubeSegments; side += 1) {
        const a = radial * (tubeSegments + 1) + side, b = a + tubeSegments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
  }

  function boxGeometry() {
    const positions = [], normals = [], indices = [];
    const faces = [
      [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1], [0, 0, 1]],
      [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1], [0, 0, -1]],
      [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1], [1, 0, 0]],
      [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, 0, 0]],
      [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1], [0, 1, 0]],
      [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1], [0, -1, 0]]
    ];
    for (const face of faces) {
      const start = positions.length / 3;
      for (let index = 0; index < 4; index += 1) {
        positions.push(...face[index]);
        normals.push(...face[4]);
      }
      indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
    }
    return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
  }

  function particleGeometry(count) {
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const angle = index * 2.399963, radius = .70 + (index % 17) / 17 * 1.05;
      positions[index * 3] = Math.cos(angle) * radius * 1.08;
      positions[index * 3 + 1] = Math.sin(angle) * radius * 1.27;
      positions[index * 3 + 2] = -.28 + (index % 11) / 11 * .48;
    }
    return positions;
  }

  function uploadMesh(geometry) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    const normal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    const index = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
    let lineIndex = null;
    if (geometry.lineIndices?.length) {
      lineIndex = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndex);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.lineIndices, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    }
    gl.bindVertexArray(null);
    return { vao, position, normal, index, lineIndex, count: geometry.indices.length, lineCount: geometry.lineIndices?.length || 0 };
  }
  function uploadParticles(positions) {
    const vao = gl.createVertexArray(), buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return { vao, buffer, count: positions.length / 3 };
  }

  const mobile = coarse.matches;
  const star = uploadMesh(starGeometry(mobile ? 88 : 112, mobile ? 10 : 12));
  const sphere = uploadMesh(sphereGeometry(mobile ? 24 : 32, mobile ? 16 : 22));
  const torus = uploadMesh(torusGeometry(mobile ? 44 : 64, mobile ? 6 : 8, .43, .008));
  const beam = uploadMesh(boxGeometry());
  const particles = uploadParticles(particleGeometry(mobile ? 52 : 88));
  const meshUniforms = Object.fromEntries(['uProjection', 'uView', 'uModel', 'uCamera', 'uTime', 'uEnergy', 'uSurge', 'uSpeech', 'uOpacity', 'uMaterial', 'uLayer'].map(name => [name, gl.getUniformLocation(meshProgram, name)]));
  const lineUniforms = Object.fromEntries(['uProjection', 'uView', 'uModel', 'uColor', 'uOpacity', 'uEnergy'].map(name => [name, gl.getUniformLocation(lineProgram, name)]));
  const pointUniforms = Object.fromEntries(['uProjection', 'uView', 'uModel', 'uTime', 'uDpr'].map(name => [name, gl.getUniformLocation(pointProgram, name)]));

  const cinematic = {
    version: 'film-reactive-v1',
    energy: .34,
    targetEnergy: .34,
    surge: 0,
    speech: 0,
    heart: 0,
    pulse: 1,
    rotation: [0, 0, 0]
  };
  window.FormatXCoreCinematic = cinematic;
  function wake(energy, surge, speech) {
    cinematic.energy = Math.max(cinematic.energy, energy);
    cinematic.targetEnergy = Math.max(cinematic.targetEnergy, energy);
    cinematic.surge = Math.max(cinematic.surge, surge);
    if (typeof speech === 'number') cinematic.speech = speech;
    root.dataset.fxCoreCinematicImmediate = 'frame-rate-independent-v1';
    ensureRunning();
  }
  addEventListener('formatx:organismcoreactivate', () => wake(.78, .68));
  addEventListener('formatx:organismresponse', () => wake(.82, .72));
  addEventListener('formatx:organismspeechstart', () => wake(.86, .64, 1));
  addEventListener('formatx:organismspeechend', () => { cinematic.speech = 0; cinematic.targetEnergy = .42; });
  addEventListener('formatx:immersiveactivate', () => wake(.72, .52));

  let cssWidth = 0, cssHeight = 0, bufferWidth = 0, bufferHeight = 0;
  let renderScale = mobile ? .82 : .92;
  let projection = identity();
  const view = translation(0, 0, -4.6);
  const camera = [0, 0, 4.6];
  let raf = 0, started = performance.now(), lastTime = started;
  let sampleStarted = started, sampleFrames = 0, introComplete = root.classList.contains('fx-intro-complete');
  let heroVisible = true, pointerX = 0, pointerY = 0;

  function resize(force) {
    const nextWidth = Math.max(1, innerWidth), nextHeight = Math.max(1, innerHeight);
    const dprCap = mobile ? 1.18 : 1.45;
    const dpr = Math.min(devicePixelRatio || 1, dprCap);
    let width = Math.round(nextWidth * dpr * renderScale), height = Math.round(nextHeight * dpr * renderScale);
    const pixelBudget = mobile ? 1450000 : 2350000;
    const budgetScale = Math.min(1, Math.sqrt(pixelBudget / Math.max(1, width * height)));
    width = Math.max(2, Math.round(width * budgetScale));
    height = Math.max(2, Math.round(height * budgetScale));
    if (!force && nextWidth === cssWidth && nextHeight === cssHeight && width === bufferWidth && height === bufferHeight) return;
    cssWidth = nextWidth; cssHeight = nextHeight; bufferWidth = width; bufferHeight = height;
    canvas.width = width; canvas.height = height;
    gl.viewport(0, 0, width, height);
    projection = perspective((mobile ? 52 : 43) * Math.PI / 180, nextWidth / nextHeight, .1, 20);
    root.dataset.fxCoreReal3dResolution = width + 'x' + height;
    root.dataset.fxCoreReal3dScale = renderScale.toFixed(2);
  }

  function baseModel(time, pulse) {
    const x = mobile ? 0 : .86;
    const y = mobile ? .25 : .03;
    const pointerFactor = mobile || reduced.matches ? 0 : 1;
    const rx = (reduced.matches ? .025 : .035 + Math.sin(time * .19) * .035) + pointerY * .10 * pointerFactor;
    const ry = (reduced.matches ? -.055 : -.065 + Math.sin(time * .23) * .085) + pointerX * .13 * pointerFactor;
    const rz = reduced.matches ? 0 : Math.sin(time * .14) * .012;
    const scale = (mobile ? .94 : .98) * pulse;
    cinematic.rotation = [rx, ry, rz];
    return compose([translation(x, y, 0), rotationX(rx), rotationY(ry), rotationZ(rz), scaling(scale, scale, scale)]);
  }

  function bindCommon(programObject, uniforms, model, time) {
    gl.useProgram(programObject);
    gl.uniformMatrix4fv(uniforms.uProjection, false, projection);
    gl.uniformMatrix4fv(uniforms.uView, false, view);
    gl.uniformMatrix4fv(uniforms.uModel, false, model);
    if (uniforms.uCamera) gl.uniform3f(uniforms.uCamera, camera[0], camera[1], camera[2]);
    if (uniforms.uTime) gl.uniform1f(uniforms.uTime, time);
  }
  function drawMesh(mesh, model, material, opacity, layer, time) {
    bindCommon(meshProgram, meshUniforms, model, time);
    gl.uniform1f(meshUniforms.uEnergy, cinematic.energy);
    gl.uniform1f(meshUniforms.uSurge, cinematic.surge);
    gl.uniform1f(meshUniforms.uSpeech, cinematic.speech);
    gl.uniform1f(meshUniforms.uOpacity, opacity);
    gl.uniform1f(meshUniforms.uMaterial, material);
    gl.uniform1f(meshUniforms.uLayer, layer);
    gl.bindVertexArray(mesh.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index);
    gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  }
  function drawLines(mesh, model, color, opacity, time) {
    if (!mesh.lineIndex || !mesh.lineCount) return;
    bindCommon(lineProgram, lineUniforms, model, time);
    gl.uniform3f(lineUniforms.uColor, color[0], color[1], color[2]);
    gl.uniform1f(lineUniforms.uOpacity, opacity);
    gl.uniform1f(lineUniforms.uEnergy, cinematic.energy + cinematic.surge * .5);
    gl.bindVertexArray(mesh.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.lineIndex);
    gl.drawElements(gl.LINES, mesh.lineCount, gl.UNSIGNED_SHORT, 0);
  }
  function drawParticles(model, time) {
    bindCommon(pointProgram, pointUniforms, model, time);
    gl.uniform1f(pointUniforms.uDpr, Math.min(devicePixelRatio || 1, 1.5));
    gl.bindVertexArray(particles.vao);
    gl.drawArrays(gl.POINTS, 0, particles.count);
  }

  function updateCinematic(delta, time) {
    const heartA = .5 + .5 * Math.sin(time * 1.52);
    const heartB = .5 + .5 * Math.sin(time * 3.04 - .72);
    cinematic.heart = Math.pow(heartA, 5) * .72 + Math.pow(heartB, 9) * .28;
    cinematic.pulse = 1 + cinematic.heart * .023 + Math.sin(time * .58) * .004;
    const rate = 1 - Math.exp(-delta * 2.6);
    cinematic.energy += (cinematic.targetEnergy - cinematic.energy) * rate;
    cinematic.surge *= Math.exp(-delta * .72);
    cinematic.targetEnergy += (.34 - cinematic.targetEnergy) * (1 - Math.exp(-delta * .34));
  }

  function drawFrame(now) {
    const delta = Math.min(.05, Math.max(.001, (now - lastTime) / 1000));
    lastTime = now;
    const time = reduced.matches ? 1.8 : (now - started) / 1000;
    updateCinematic(delta, time);
    resize(false);
    const base = baseModel(time, cinematic.pulse);

    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.depthMask(false);

    gl.disable(gl.CULL_FACE);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    drawParticles(base, time);

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    drawMesh(star, base, 0, .70, 0, time);
    gl.cullFace(gl.BACK);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    drawMesh(star, base, 0, .82, 0, time);

    const inner = multiply(base, compose([rotationZ(Math.PI / 4), scaling(.73, .73, .73)]));
    gl.cullFace(gl.FRONT);
    drawMesh(star, inner, 0, .18, 1, time);
    gl.cullFace(gl.BACK);
    drawMesh(star, inner, 0, .28, 1, time);

    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    drawLines(star, base, [.08, .72, 1.28], .29 + cinematic.energy * .16, time);
    drawLines(star, inner, [.66, .12, 1.16], .16 + cinematic.energy * .08, time);

    const horizontalBeam = multiply(base, scaling(.94, .006, .014));
    const verticalBeam = multiply(base, scaling(.006, 1.24, .014));
    drawMesh(beam, horizontalBeam, 2, .16, 0, time);
    drawMesh(beam, verticalBeam, 2, .12, 1, time);

    const ringPulse = 1 + cinematic.heart * .035;
    const ringModels = [
      multiply(base, compose([rotationX(.28 + time * .055), scaling(ringPulse, ringPulse, ringPulse)])),
      multiply(base, compose([rotationY(.72), rotationX(-.55 + time * -.038), scaling(.82, .82, .82)])),
      multiply(base, compose([rotationY(-.62), rotationX(.88 + time * .028), scaling(.62, .62, .62)]))
    ];
    drawMesh(torus, ringModels[0], 2, .42, 0, time);
    drawMesh(torus, ringModels[1], 2, .34, 1, time);
    drawMesh(torus, ringModels[2], 2, .28, 2, time);

    const halo = multiply(base, scaling(.215, .215, .215));
    const reactorScale = .105 * (1 + cinematic.heart * .08);
    const reactor = multiply(base, scaling(reactorScale, reactorScale, reactorScale));
    drawMesh(sphere, halo, 1, .12, 1, time);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    drawMesh(sphere, reactor, 1, .78, 0, time);

    gl.depthMask(true);
    gl.bindVertexArray(null);
    sampleFrames += 1;
    const elapsed = now - sampleStarted;
    if (elapsed >= 2400) {
      const fps = sampleFrames / (elapsed / 1000);
      root.dataset.fxCoreReal3dFps = fps.toFixed(1);
      sampleFrames = 0;
      sampleStarted = now;
      const oldScale = renderScale;
      if (fps < 56) renderScale = clamp(renderScale - (fps < 45 ? .10 : .06), mobile ? .56 : .60, 1);
      else if (fps > 72) renderScale = clamp(renderScale + .035, mobile ? .56 : .60, 1);
      if (Math.abs(oldScale - renderScale) > .001) resize(true);
      root.dataset.fxCoreReal3dQuality = fps < 56 ? 'adapting-for-60fps' : fps >= 59 ? '60fps-ready' : 'balanced';
    }
  }

  function shouldRun() {
    if (document.hidden || !introComplete || !heroVisible) return false;
    if (root.classList.contains('fx-organism-menu-open') || document.body.classList.contains('fx-organism-panel-open')) return false;
    return true;
  }
  function frame(now) {
    raf = 0;
    if (!shouldRun()) {
      stage.dataset.active = 'false';
      return;
    }
    stage.dataset.active = 'true';
    drawFrame(now);
    if (!reduced.matches) raf = requestAnimationFrame(frame);
  }
  function ensureRunning() {
    if (!shouldRun()) {
      stage.dataset.active = 'false';
      return;
    }
    stage.dataset.active = 'true';
    if (!raf) {
      sampleStarted = performance.now();
      sampleFrames = 0;
      lastTime = sampleStarted;
      raf = requestAnimationFrame(frame);
    }
  }
  function refreshVisibility() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const rectangle = hero.getBoundingClientRect();
    heroVisible = rectangle.bottom > innerHeight * .04 && rectangle.top < innerHeight * .96;
    if (!heroVisible && raf) { cancelAnimationFrame(raf); raf = 0; stage.dataset.active = 'false'; }
    else ensureRunning();
  }

  document.addEventListener('formatx:introcomplete', () => { introComplete = true; ensureRunning(); }, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; stage.dataset.active = 'false'; }
    else ensureRunning();
  });
  addEventListener('resize', () => { resize(true); refreshVisibility(); }, { passive: true });
  addEventListener('orientationchange', () => { resize(true); refreshVisibility(); }, { passive: true });
  addEventListener('scroll', refreshVisibility, { passive: true });
  if (!mobile) addEventListener('pointermove', event => {
    pointerX = clamp(event.clientX / Math.max(1, innerWidth) * 2 - 1, -1, 1);
    pointerY = clamp(event.clientY / Math.max(1, innerHeight) * 2 - 1, -1, 1);
  }, { passive: true });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    root.dataset.fxCoreReal3d = 'context-lost';
    stage.dataset.active = 'false';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    root.dataset.fxCoreReal3d = 'context-restored-reload-required';
  });

  resize(true);
  root.dataset.fxCoreReal3d = 'ready-' + VERSION;
  root.dataset.fxCoreRenderer = 'single-webgl2-indexed-3d-v20';
  root.dataset.fxCoreGeometry = 'indexed-triangle-shell-sphere-tori';
  root.dataset.fxCoreDepthBuffer = 'enabled';
  root.dataset.fxCoreCamera = 'perspective';
  root.dataset.fxCoreNormals = 'per-vertex-plus-faceted-derivatives';
  root.dataset.fxCoreImageBacked = 'false';
  root.dataset.fxCoreContexts = '1';
  root.dataset.fxCoreDrawCalls = '14-max';
  root.dataset.fxCoreTriangles = String(Math.round((star.count * 4 + sphere.count * 2 + torus.count * 3 + beam.count * 2) / 3));
  root.dataset.fxCoreIndexType = 'uint16-elements';
  root.dataset.fxCoreFrameCap = 'display-refresh-uncapped';
  root.dataset.fxCoreVisibility = 'hero-only-raf-paused';
  root.dataset.fxCorePerformanceTarget = 'adaptive-60-plus-fps';
  root.dataset.fxCoreMobileComposition = 'single-webgl2-real3d-v20';
  root.dataset.fxNativeApexRenderer = 'single-webgl2-indexed-3d-v20';
  root.dataset.fxNativeApexVisual = 'cinematic-four-tip-glass-reactor-v20';

  root.dataset.fxCoreMeshMaterial = 'physically-inspired-fresnel-glass-v20';
  root.dataset.fxCoreHighlightModel = 'faceted-fresnel-environment-v20';
  root.dataset.fxCoreMaterialCenter = 'centered-object-space';
  root.dataset.fxCoreShapeMesh = 'generated-four-tip-shell-v20';
  root.dataset.fxCoreShapeFracture = 'integrated-indexed-lines-v20';
  root.dataset.fxCoreGeometryScale = mobile ? '0.94-real3d-mobile' : '0.98-real3d-desktop';
  root.dataset.fxCoreMesh3d = 'ready-real3d-v20';
  root.dataset.fxCoreFracture3d = 'integrated-real3d-v20';
  root.dataset.fxCoreCinematicGrade = 'shader-native-v20';

  dispatchEvent(new CustomEvent('formatx:coremesh3dready', {
    detail: { version: VERSION, geometry: 'indexed-triangle-mesh', depth: true, contexts: 1, targetFps: 60 }
  }));
  refreshVisibility();
  ensureRunning();
}());

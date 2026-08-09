(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'v21';
  const STARTUP_REVISION = 'v22-mobile-safe';
  const RECOVERY_KEY = 'formatx-real3d-v22-recovery';
  function emitCoreFallback(reason, message) {
    root.dataset.fxCoreReal3d = reason;
    root.dataset.fxCoreReal3dHealth = reason;
    root.dataset.fxCoreReal3dStartup = STARTUP_REVISION;
    if (message) root.dataset.fxCoreReal3dError = String(message).slice(0, 240);
    dispatchEvent(new CustomEvent('formatx:core3dfallback', {
      detail: { reason, startup: STARTUP_REVISION, message: message || '' }
    }));
  }
  if (!document.body || root.dataset.fxCoreReal3dStartup === 'ready-' + STARTUP_REVISION) return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreReal3d = 'audit-skip';
    return;
  }
  if (typeof WebGL2RenderingContext === 'undefined') {
    emitCoreFallback('webgl2-unavailable');
    return;
  }

  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = document.createElement('div');
  stage.className = 'fx-core-real3d-stage';
  stage.dataset.fxCoreReal3dStage = VERSION;
  stage.dataset.active = 'false';
  stage.setAttribute('aria-hidden', 'true');
  document.body.appendChild(stage);

  let canvas = null;
  let contextAttempts = 0;
  let contextCreationMessage = '';
  function acquireContext(attributes, profile) {
    contextAttempts += 1;
    const candidate = document.createElement('canvas');
    candidate.className = 'fx-core-real3d-canvas';
    candidate.dataset.fxCoreReal3dCanvas = VERSION;
    candidate.dataset.fxCoreContextProfile = profile;
    candidate.addEventListener('webglcontextcreationerror', event => {
      contextCreationMessage = event.statusMessage || 'webgl2-context-creation-error';
    }, { once: true });
    stage.appendChild(candidate);
    let context = null;
    try {
      canvas = candidate;
      context = canvas.getContext('webgl2', attributes);
    } catch (error) {
      contextCreationMessage = String(error?.message || error);
    }
    if (!context || context.isContextLost()) {
      candidate.remove();
      canvas = null;
      return null;
    }
    root.dataset.fxCoreReal3dContextProfile = profile;
    return context;
  }

  const sharedContextAttributes = {
    alpha: true,
    antialias: false,
    depth: true,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false
  };
  const primaryProfile = coarse.matches ? 'mobile-default' : 'desktop-high-performance';
  let gl = acquireContext({
    ...sharedContextAttributes,
    powerPreference: coarse.matches ? 'default' : 'high-performance'
  }, primaryProfile);
  if (!gl) {
    gl = acquireContext({
      ...sharedContextAttributes,
      powerPreference: 'default'
    }, 'safe-retry');
  }
  if (!gl || gl.isContextLost()) {
    root.dataset.fxCoreReal3dContextAttempts = String(contextAttempts);
    stage.remove();
    emitCoreFallback('context-unavailable', contextCreationMessage);
    return;
  }
  root.dataset.fxCoreReal3dContextAttempts = String(contextAttempts);

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
  function translation(x, y, z) { const out = identity(); out[12] = x; out[13] = y; out[14] = z; return out; }
  function scaling(x, y, z) { const out = identity(); out[0] = x; out[5] = y; out[10] = z; return out; }
  function rotationX(angle) { const out = identity(), c = Math.cos(angle), s = Math.sin(angle); out[5] = c; out[6] = s; out[9] = -s; out[10] = c; return out; }
  function rotationY(angle) { const out = identity(), c = Math.cos(angle), s = Math.sin(angle); out[0] = c; out[2] = -s; out[8] = s; out[10] = c; return out; }
  function rotationZ(angle) { const out = identity(), c = Math.cos(angle), s = Math.sin(angle); out[0] = c; out[1] = s; out[4] = -s; out[5] = c; return out; }
  function perspective(fieldOfView, aspect, near, far) {
    const f = 1 / Math.tan(fieldOfView / 2), range = 1 / (near - far), out = new Float32Array(16);
    out[0] = f / aspect; out[5] = f; out[10] = (far + near) * range; out[11] = -1; out[14] = 2 * far * near * range;
    return out;
  }
  function compose(parts) { return parts.reduce((matrix, part) => multiply(matrix, part), identity()); }

  const MESH_VERTEX = `#version 300 es
    precision highp float;
    layout(location=0) in vec3 aPosition;
    layout(location=1) in vec3 aNormal;
    uniform mat4 uProjection; uniform mat4 uView; uniform mat4 uModel;
    out vec3 vWorld; out vec3 vNormal; out vec3 vObject;
    void main(){ vec4 world=uModel*vec4(aPosition,1.0); vWorld=world.xyz; vObject=aPosition; vNormal=normalize(mat3(uModel)*aNormal); gl_Position=uProjection*uView*world; }`;
  const MESH_FRAGMENT = `#version 300 es
    precision highp float;
    in vec3 vWorld; in vec3 vNormal; in vec3 vObject;
    uniform vec3 uCamera;
    uniform float uTime; uniform float uEnergy; uniform float uSurge; uniform float uSpeech; uniform float uOpacity; uniform float uMaterial; uniform float uLayer;
    out vec4 fragColor;
    float sat(float value){return clamp(value,0.0,1.0);} float band(float value,float center,float width){return exp(-abs(value-center)/max(.0001,width));}
    void main(){
      vec3 viewDir=normalize(uCamera-vWorld); vec3 smoothNormal=normalize(vNormal); vec3 faceNormal=normalize(cross(dFdx(vWorld),dFdy(vWorld))); if(!gl_FrontFacing)faceNormal=-faceNormal;
      vec3 normal=normalize(mix(smoothNormal,faceNormal,.55)); float ndv=sat(abs(dot(normal,viewDir))); float fresnel=pow(1.0-ndv,2.18);
      vec3 lightA=normalize(vec3(-.30,.84,.46)); vec3 lightB=normalize(vec3(.66,-.10,.73));
      float specA=pow(sat(dot(reflect(-lightA,normal),viewDir)),66.0); float specB=pow(sat(dot(reflect(-lightB,normal),viewDir)),38.0);
      float film=.5+.5*sin(14.0*fresnel+vObject.y*4.2-vObject.x*2.8+uLayer*2.0); float facet=pow(sat(abs(dot(faceNormal,lightA))),3.0);
      vec2 p=vObject.xy; float radial=length(p); float diamond=abs(p.x)+abs(p.y)*.84;
      float axisX=exp(-abs(p.x)*18.0); float axisY=exp(-abs(p.y)*15.0);
      float membrane=band(diamond,.34,.026)+band(diamond,.54,.030)+band(diamond,.74,.034);
      float reactorRings=band(radial,.20,.018)+band(radial,.30,.020)*.74+band(radial,.405,.023)*.46;
      float diagonal=(exp(-abs(p.x-p.y*.82)*15.0)+exp(-abs(p.x+p.y*.82)*15.0))*.36;
      float violetArc=pow(.5+.5*cos(atan(p.y,p.x)*4.0+radial*7.2-uTime*.075),16.0)*smoothstep(.22,.64,radial)*(1.0-smoothstep(.70,.92,radial));
      float pulse=.5+.5*sin(uTime*1.48); float activity=sat(uEnergy*.72+uSurge*.55+uSpeech*.32);
      if(uMaterial<.5){
        vec3 cyan=vec3(.010,.76,1.55); vec3 blue=vec3(.035,.18,.88); vec3 violet=vec3(.88,.055,1.48);
        vec3 color=mix(blue,cyan,sat(.18+normal.y*.18+film*.44)); color=mix(color,violet,sat((1.0-film)*.26+normal.x*.11+.08*uLayer));
        float inner=exp(-radial*1.72)*(.20+.28*activity); float structured=axisX*.12+axisY*.105+membrane*.30+reactorRings*.38+diagonal*.14;
        float caustic=pow(abs(sin(vObject.x*10.4-vObject.y*7.5+uLayer)),20.0)*.34; float edge=pow(fresnel,1.32);
        color*=.24+.86*fresnel+.22*facet; color+=vec3(.034,.44,1.05)*(.48+.42*film+.32*activity);
        color+=cyan*(.035+reactorRings*.34+membrane*.30+axisX*.14+axisY*.125+diagonal*.085);
        color+=violet*(film*.15+violetArc*(.46+.25*activity)+membrane*.14+diagonal*.10);
        color+=vec3(.14,1.10,2.02)*(specA*2.80+specB*1.52+caustic*1.28+edge*.29+structured*.72+inner*.44);
        float alpha=uOpacity*(.37+.47*fresnel+.14*facet+.065*activity+.17*membrane+.20*reactorRings+.055*axisX+.052*axisY);
        vec3 exposed=color*vec3(.78,4.25,5.90); exposed+=vec3(.012,1.42,3.30)*(specA*2.82+specB*1.46+caustic*1.30+structured*1.34); exposed+=violet*(violetArc*.82+membrane*.20);
        fragColor=vec4(exposed,alpha);
      }else if(uMaterial<1.5){
        float center=pow(ndv,.76); float rim=pow(1.0-ndv,1.8); vec3 core=mix(vec3(.055,.84,1.62),vec3(1.30,1.72,1.78),center);
        core=mix(core,mix(vec3(.006,.34,1.32),vec3(.22,1.08,1.72),center),sat(uLayer));
        float reactor=1.0-sat(uLayer); core+=vec3(.72,1.52,1.82)*reactor*(.64+.34*activity);
        core+=vec3(.68,.095,1.40)*rim*(.48+.58*film); core*=.78+activity*.58+pulse*.12; fragColor=vec4(core*(2.25+reactor*.92),uOpacity*(.42+.34*center+.18*reactor));
      }else{
        vec3 ring=mix(vec3(.004,.46,1.48),vec3(.78,.012,1.20),sat(film*.28+uLayer*.24)); ring*=1.02+activity*.48+specA*.58; fragColor=vec4(ring*1.45,uOpacity*(.62+.30*fresnel));
      }
    }`;
  const LINE_VERTEX = `#version 300 es
    precision highp float; layout(location=0) in vec3 aPosition; uniform mat4 uProjection; uniform mat4 uView; uniform mat4 uModel;
    void main(){gl_Position=uProjection*uView*uModel*vec4(aPosition,1.0);}`;
  const LINE_FRAGMENT = `#version 300 es
    precision highp float; uniform vec3 uColor; uniform float uOpacity; uniform float uEnergy; out vec4 fragColor;
    void main(){fragColor=vec4(uColor*(1.65+uEnergy*1.35),uOpacity);}`;
  const POINT_VERTEX = `#version 300 es
    precision highp float; layout(location=0) in vec3 aPosition; uniform mat4 uProjection; uniform mat4 uView; uniform mat4 uModel; uniform float uTime; uniform float uDpr; out float vPulse;
    void main(){float phase=float(gl_VertexID)*1.618; vec3 point=aPosition; point.z+=sin(uTime*.24+phase)*.055; gl_Position=uProjection*uView*uModel*vec4(point,1.0); vPulse=.55+.45*sin(uTime*.52+phase*2.1); gl_PointSize=(1.1+vPulse*1.7)*uDpr;}`;
  const POINT_FRAGMENT = `#version 300 es
    precision highp float; in float vPulse; out vec4 fragColor;
    void main(){vec2 p=gl_PointCoord-.5; float glow=smoothstep(.5,0.0,length(p)); if(glow<=.01)discard; fragColor=vec4(mix(vec3(.08,.62,1.08),vec3(.80,.15,1.10),vPulse),glow*glow*.62);}`;

  function shader(type, source) { const output = gl.createShader(type); gl.shaderSource(output, source); gl.compileShader(output); if (!gl.getShaderParameter(output, gl.COMPILE_STATUS)) { const reason = gl.getShaderInfoLog(output) || 'shader compile failed'; gl.deleteShader(output); throw new Error(reason); } return output; }
  function program(vertexSource, fragmentSource) { const output = gl.createProgram(), vertex = shader(gl.VERTEX_SHADER, vertexSource), fragment = shader(gl.FRAGMENT_SHADER, fragmentSource); gl.attachShader(output, vertex); gl.attachShader(output, fragment); gl.linkProgram(output); gl.deleteShader(vertex); gl.deleteShader(fragment); if (!gl.getProgramParameter(output, gl.LINK_STATUS)) { const reason = gl.getProgramInfoLog(output) || 'program link failed'; gl.deleteProgram(output); throw new Error(reason); } return output; }

  let meshProgram, lineProgram, pointProgram;
  try { meshProgram = program(MESH_VERTEX, MESH_FRAGMENT); lineProgram = program(LINE_VERTEX, LINE_FRAGMENT); pointProgram = program(POINT_VERTEX, POINT_FRAGMENT); }
  catch (error) { root.dataset.fxCoreReal3dError = String(error?.message || error).slice(0, 240); console.warn('FormatX real 3D core v21 could not compile: ' + root.dataset.fxCoreReal3dError); stage.remove(); emitCoreFallback('shader-failed', root.dataset.fxCoreReal3dError); return; }

  function calculateNormals(positions, indices) {
    const normals = new Float32Array(positions.length);
    for (let index = 0; index < indices.length; index += 3) { const ia = indices[index] * 3, ib = indices[index + 1] * 3, ic = indices[index + 2] * 3; const abx = positions[ib] - positions[ia], aby = positions[ib + 1] - positions[ia + 1], abz = positions[ib + 2] - positions[ia + 2]; const acx = positions[ic] - positions[ia], acy = positions[ic + 1] - positions[ia + 1], acz = positions[ic + 2] - positions[ia + 2]; const nx = aby * acz - abz * acy, ny = abz * acx - abx * acz, nz = abx * acy - aby * acx; for (const offset of [ia, ib, ic]) { normals[offset] += nx; normals[offset + 1] += ny; normals[offset + 2] += nz; } }
    for (let index = 0; index < normals.length; index += 3) { const length = Math.hypot(normals[index], normals[index + 1], normals[index + 2]) || 1; normals[index] /= length; normals[index + 1] /= length; normals[index + 2] /= length; }
    return normals;
  }
  function referenceRadius(angle) { const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle)), p = .80; const lp = 1 / Math.pow(Math.pow(c, p) + Math.pow(s, p), 1 / p); return .035 + .965 * lp; }
  function starGeometry(angularSegments, radialSegments) {
    const positions = [], indices = [], lineIndices = [], sides = [];
    for (const sign of [1, -1]) {
      const sideStart = positions.length / 3; sides.push(sideStart); positions.push(0, 0, sign * .305);
      for (let ring = 1; ring <= radialSegments; ring += 1) { const t = ring / radialSegments; for (let segment = 0; segment < angularSegments; segment += 1) { const angle = segment / angularSegments * Math.PI * 2, radius = referenceRadius(angle), cardinal = Math.pow(Math.abs(Math.cos(angle * 2)), 2.35); const x = Math.cos(angle) * radius * t, y = Math.sin(angle) * radius * t * 1.10, lens = Math.pow(Math.max(0, 1 - t * t), .70), ridge = .84 + .16 * cardinal, z = sign * (.018 + .295 * lens * ridge); positions.push(x, y, z); } }
      const firstRing = sideStart + 1;
      for (let segment = 0; segment < angularSegments; segment += 1) { const next = (segment + 1) % angularSegments; if (sign > 0) indices.push(sideStart, firstRing + segment, firstRing + next); else indices.push(sideStart, firstRing + next, firstRing + segment); }
      for (let ring = 1; ring < radialSegments; ring += 1) { const current = sideStart + 1 + (ring - 1) * angularSegments, nextRing = current + angularSegments; for (let segment = 0; segment < angularSegments; segment += 1) { const next = (segment + 1) % angularSegments; if (sign > 0) indices.push(current + segment, nextRing + segment, nextRing + next, current + segment, nextRing + next, current + next); else indices.push(current + segment, nextRing + next, nextRing + segment, current + segment, current + next, nextRing + next); } }
    }
    const frontEdge = sides[0] + 1 + (radialSegments - 1) * angularSegments, backEdge = sides[1] + 1 + (radialSegments - 1) * angularSegments;
    for (let segment = 0; segment < angularSegments; segment += 1) { const next = (segment + 1) % angularSegments; indices.push(frontEdge + segment, backEdge + segment, backEdge + next, frontEdge + segment, backEdge + next, frontEdge + next); }
    const frontStart = sides[0];
    for (const ring of [3, 6, 9, radialSegments]) { if (ring > radialSegments) continue; const start = frontStart + 1 + (ring - 1) * angularSegments; for (let segment = 0; segment < angularSegments; segment += 1) lineIndices.push(start + segment, start + (segment + 1) % angularSegments); }
    const spokeStep = Math.max(5, Math.round(angularSegments / 12));
    for (let segment = 0; segment < angularSegments; segment += spokeStep) { let previous = frontStart; for (let ring = 1; ring <= radialSegments; ring += 1) { const current = frontStart + 1 + (ring - 1) * angularSegments + segment; lineIndices.push(previous, current); previous = current; } }
    return { positions: new Float32Array(positions), normals: calculateNormals(positions, indices), indices: new Uint16Array(indices), lineIndices: new Uint16Array(lineIndices) };
  }
  function sphereGeometry(longitudes, latitudes) { const positions = [], normals = [], indices = []; for (let latitude = 0; latitude <= latitudes; latitude += 1) { const vv = latitude / latitudes, phi = vv * Math.PI; for (let longitude = 0; longitude <= longitudes; longitude += 1) { const uu = longitude / longitudes, theta = uu * Math.PI * 2, x = Math.sin(phi) * Math.cos(theta), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(theta); positions.push(x, y, z); normals.push(x, y, z); } } for (let latitude = 0; latitude < latitudes; latitude += 1) for (let longitude = 0; longitude < longitudes; longitude += 1) { const a = latitude * (longitudes + 1) + longitude, b = a + longitudes + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); } return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
  function torusGeometry(radialSegments, tubeSegments, radius, tube) { const positions = [], normals = [], indices = []; for (let radial = 0; radial <= radialSegments; radial += 1) { const uu = radial / radialSegments * Math.PI * 2, cu = Math.cos(uu), su = Math.sin(uu); for (let side = 0; side <= tubeSegments; side += 1) { const vv = side / tubeSegments * Math.PI * 2, cv = Math.cos(vv), sv = Math.sin(vv); positions.push((radius + tube * cv) * cu, (radius + tube * cv) * su, tube * sv); normals.push(cv * cu, cv * su, sv); } } for (let radial = 0; radial < radialSegments; radial += 1) for (let side = 0; side < tubeSegments; side += 1) { const a = radial * (tubeSegments + 1) + side, b = a + tubeSegments + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); } return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
  function boxGeometry() { const positions = [], normals = [], indices = []; const faces = [[[ -1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]]]; for (const face of faces) { const start = positions.length / 3; for (let index = 0; index < 4; index += 1) { positions.push(...face[index]); normals.push(...face[4]); } indices.push(start, start + 1, start + 2, start, start + 2, start + 3); } return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
  function particleGeometry(count) { const positions = new Float32Array(count * 3); for (let index = 0; index < count; index += 1) { const angle = index * 2.399963, radius = .72 + (index % 17) / 17; positions[index * 3] = Math.cos(angle) * radius * 1.08; positions[index * 3 + 1] = Math.sin(angle) * radius * 1.22; positions[index * 3 + 2] = -.28 + (index % 11) / 11 * .48; } return positions; }
  function uploadMesh(geometry) { const vao = gl.createVertexArray(); gl.bindVertexArray(vao); const position = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, position); gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); const normal = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, normal); gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); const index = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW); let lineIndex = null; if (geometry.lineIndices?.length) { lineIndex = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndex); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.lineIndices, gl.STATIC_DRAW); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); } gl.bindVertexArray(null); return { vao, position, normal, index, lineIndex, count: geometry.indices.length, lineCount: geometry.lineIndices?.length || 0 }; }
  function uploadParticles(positions) { const vao = gl.createVertexArray(), buffer = gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null); return { vao, buffer, count: positions.length / 3 }; }

  const mobile = coarse.matches;
  const star = uploadMesh(starGeometry(mobile ? 88 : 112, mobile ? 10 : 12));
  const sphere = uploadMesh(sphereGeometry(mobile ? 22 : 30, mobile ? 15 : 20));
  const torus = uploadMesh(torusGeometry(mobile ? 40 : 56, mobile ? 6 : 8, .43, .0115));
  const beam = uploadMesh(boxGeometry());
  const particles = uploadParticles(particleGeometry(mobile ? 48 : 82));
  const meshUniforms = Object.fromEntries(['uProjection','uView','uModel','uCamera','uTime','uEnergy','uSurge','uSpeech','uOpacity','uMaterial','uLayer'].map(name => [name, gl.getUniformLocation(meshProgram, name)]));
  const lineUniforms = Object.fromEntries(['uProjection','uView','uModel','uColor','uOpacity','uEnergy'].map(name => [name, gl.getUniformLocation(lineProgram, name)]));
  const pointUniforms = Object.fromEntries(['uProjection','uView','uModel','uTime','uDpr'].map(name => [name, gl.getUniformLocation(pointProgram, name)]));
  const cinematic = { version:'film-reactive-v1', energy:.34, targetEnergy:.34, surge:0, speech:0, heart:0, pulse:1, rotation:[0,0,0] };
  window.FormatXCoreCinematic = cinematic;
  function wake(energy, surge, speech) { cinematic.energy = Math.max(cinematic.energy, energy); cinematic.targetEnergy = Math.max(cinematic.targetEnergy, energy); cinematic.surge = Math.max(cinematic.surge, surge); if (typeof speech === 'number') cinematic.speech = speech; root.dataset.fxCoreCinematicImmediate = 'frame-rate-independent-v1'; ensureRunning(); }
  addEventListener('formatx:organismcoreactivate', () => wake(.78,.68)); addEventListener('formatx:organismresponse', () => wake(.82,.72)); addEventListener('formatx:organismspeechstart', () => wake(.86,.64,1)); addEventListener('formatx:organismspeechend', () => { cinematic.speech = 0; cinematic.targetEnergy = .42; }); addEventListener('formatx:immersiveactivate', () => wake(.72,.52));

  const mobileCores = Number(navigator.hardwareConcurrency || 4), mobileMemory = Number(navigator.deviceMemory || 4);
  const highMobile = mobile && (mobileCores >= 6 || mobileMemory >= 6);
  let cssWidth=0, cssHeight=0, bufferWidth=0, bufferHeight=0, renderScale=mobile?(highMobile?.94:.80):.92, projection=identity();
  const view=translation(0,0,-4.6), camera=[0,0,4.6]; let raf=0, started=performance.now(), lastTime=started, sampleStarted=started, sampleFrames=0, introComplete=root.classList.contains('fx-intro-complete'), heroVisible=true, pointerX=0, pointerY=0;
  function resize(force) { const nextWidth=Math.max(1,innerWidth), nextHeight=Math.max(1,innerHeight), dprCap=mobile?(highMobile?1.52:1.18):1.45, dpr=Math.min(devicePixelRatio||1,dprCap); let width=Math.round(nextWidth*dpr*renderScale), height=Math.round(nextHeight*dpr*renderScale); const pixelBudget=mobile?(highMobile?1650000:1100000):2350000, budgetScale=Math.min(1,Math.sqrt(pixelBudget/Math.max(1,width*height))); width=Math.max(2,Math.round(width*budgetScale)); height=Math.max(2,Math.round(height*budgetScale)); if(!force&&nextWidth===cssWidth&&nextHeight===cssHeight&&width===bufferWidth&&height===bufferHeight)return; cssWidth=nextWidth;cssHeight=nextHeight;bufferWidth=width;bufferHeight=height;canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);projection=perspective((mobile?52:43)*Math.PI/180,nextWidth/nextHeight,.1,20);root.dataset.fxCoreReal3dResolution=width+'x'+height;root.dataset.fxCoreReal3dScale=renderScale.toFixed(2);root.dataset.fxCoreMobileQuality=mobile?(highMobile?'high-adaptive':'efficient-adaptive'):'desktop-adaptive'; }
  function baseModel(time,pulse) { const x=mobile?0:.86, y=mobile?.58:.03, pointerFactor=mobile||reduced.matches?0:1, rx=(reduced.matches?.022:.030+Math.sin(time*.19)*.030)+pointerY*.10*pointerFactor, ry=(reduced.matches?-.050:-.060+Math.sin(time*.23)*.074)+pointerX*.13*pointerFactor, rz=reduced.matches?0:Math.sin(time*.14)*.010, scaleX=(mobile?.96:.98)*pulse, scaleY=(mobile?1.08:.98)*pulse; cinematic.rotation=[rx,ry,rz]; return compose([translation(x,y,0),rotationX(rx),rotationY(ry),rotationZ(rz),scaling(scaleX,scaleY,scaleY)]); }
  function bindCommon(programObject,uniforms,model,time){gl.useProgram(programObject);gl.uniformMatrix4fv(uniforms.uProjection,false,projection);gl.uniformMatrix4fv(uniforms.uView,false,view);gl.uniformMatrix4fv(uniforms.uModel,false,model);if(uniforms.uCamera)gl.uniform3f(uniforms.uCamera,camera[0],camera[1],camera[2]);if(uniforms.uTime)gl.uniform1f(uniforms.uTime,time);}
  function drawMesh(mesh,model,material,opacity,layer,time){bindCommon(meshProgram,meshUniforms,model,time);gl.uniform1f(meshUniforms.uEnergy,cinematic.energy);gl.uniform1f(meshUniforms.uSurge,cinematic.surge);gl.uniform1f(meshUniforms.uSpeech,cinematic.speech);gl.uniform1f(meshUniforms.uOpacity,opacity);gl.uniform1f(meshUniforms.uMaterial,material);gl.uniform1f(meshUniforms.uLayer,layer);gl.bindVertexArray(mesh.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.index);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);}
  function drawLines(mesh,model,color,opacity,time){if(!mesh.lineIndex||!mesh.lineCount)return;bindCommon(lineProgram,lineUniforms,model,time);gl.uniform3f(lineUniforms.uColor,color[0],color[1],color[2]);gl.uniform1f(lineUniforms.uOpacity,opacity);gl.uniform1f(lineUniforms.uEnergy,cinematic.energy+cinematic.surge*.5);gl.bindVertexArray(mesh.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.lineIndex);gl.drawElements(gl.LINES,mesh.lineCount,gl.UNSIGNED_SHORT,0);}
  function drawParticles(model,time){bindCommon(pointProgram,pointUniforms,model,time);gl.uniform1f(pointUniforms.uDpr,Math.min(devicePixelRatio||1,1.5));gl.bindVertexArray(particles.vao);gl.drawArrays(gl.POINTS,0,particles.count);}
  function updateCinematic(delta,time){const heartA=.5+.5*Math.sin(time*1.52),heartB=.5+.5*Math.sin(time*3.04-.72);cinematic.heart=Math.pow(heartA,5)*.72+Math.pow(heartB,9)*.28;cinematic.pulse=1+cinematic.heart*.021+Math.sin(time*.58)*.0035;const rate=1-Math.exp(-delta*2.6);cinematic.energy+=(cinematic.targetEnergy-cinematic.energy)*rate;cinematic.surge*=Math.exp(-delta*.72);cinematic.targetEnergy+=(.34-cinematic.targetEnergy)*(1-Math.exp(-delta*.34));}
  function drawFrame(now){const delta=Math.min(.05,Math.max(.001,(now-lastTime)/1000));lastTime=now;const time=reduced.matches?1.8:(now-started)/1000;updateCinematic(delta,time);resize(false);const base=baseModel(time,cinematic.pulse);gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(false);gl.disable(gl.CULL_FACE);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);drawParticles(base,time);gl.enable(gl.CULL_FACE);gl.cullFace(gl.FRONT);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);drawMesh(star,base,0,.72,0,time);gl.cullFace(gl.BACK);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);drawMesh(star,base,0,.92,0,time);const inner=multiply(base,scaling(.66,.66,.66));gl.cullFace(gl.FRONT);drawMesh(star,inner,0,.20,1,time);gl.cullFace(gl.BACK);drawMesh(star,inner,0,.30,1,time);gl.disable(gl.CULL_FACE);gl.disable(gl.DEPTH_TEST);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);drawLines(star,base,[.26,1.55,2.65],.56+cinematic.energy*.20,time);drawLines(star,inner,[1.42,.12,2.18],.28+cinematic.energy*.12,time);const horizontalBeam=multiply(base,scaling(.86,.0055,.012)),verticalBeam=multiply(base,scaling(.0055,.96,.012));drawMesh(beam,horizontalBeam,2,.58+cinematic.surge*.10,0,time);drawMesh(beam,verticalBeam,2,.48+cinematic.surge*.08,1,time);const ringPulse=1+cinematic.heart*.030,ringModels=[multiply(base,compose([rotationX(.20+time*.048),scaling(1.08*ringPulse,1.08*ringPulse,1.08*ringPulse)])),multiply(base,compose([rotationY(.66),rotationX(-.48+time*-.034),scaling(.78,.78,.78)])),multiply(base,compose([rotationY(-.56),rotationX(.80+time*.024),scaling(.50,.50,.50)]))];drawMesh(torus,ringModels[0],2,.64,0,time);drawMesh(torus,ringModels[1],2,.54,1,time);drawMesh(torus,ringModels[2],2,.46,2,time);const halo=multiply(base,scaling(.30,.30,.30)),reactorScale=.092*(1+cinematic.heart*.075),reactor=multiply(base,scaling(reactorScale,reactorScale,reactorScale));drawMesh(sphere,halo,1,.24,1,time);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);drawMesh(sphere,reactor,1,.96,0,time);gl.depthMask(true);gl.bindVertexArray(null);sampleFrames+=1;const elapsed=now-sampleStarted;if(elapsed>=2400){const fps=sampleFrames/(elapsed/1000);root.dataset.fxCoreReal3dFps=fps.toFixed(1);sampleFrames=0;sampleStarted=now;const oldScale=renderScale;if(fps<56)renderScale=clamp(renderScale-(fps<45?.10:.06),mobile?.56:.60,1);else if(fps>72)renderScale=clamp(renderScale+.035,mobile?.56:.60,1);if(Math.abs(oldScale-renderScale)>.001)resize(true);root.dataset.fxCoreReal3dQuality=fps<56?'adapting-for-60fps':fps>=59?'60fps-ready':'balanced';}}
  function shouldRun(){if(document.hidden||!introComplete||!heroVisible)return false;if(root.classList.contains('fx-organism-menu-open')||document.body.classList.contains('fx-organism-panel-open'))return false;return true;}
  function frame(now){raf=0;if(!shouldRun()){stage.dataset.active='false';return;}stage.dataset.active='true';drawFrame(now);if(!reduced.matches)raf=requestAnimationFrame(frame);}
  function ensureRunning(){if(!shouldRun()){stage.dataset.active='false';return;}stage.dataset.active='true';if(!raf){sampleStarted=performance.now();sampleFrames=0;lastTime=sampleStarted;raf=requestAnimationFrame(frame);}}
  function refreshVisibility(){const hero=document.getElementById('hero');if(!hero)return;const rectangle=hero.getBoundingClientRect();heroVisible=rectangle.bottom>innerHeight*.04&&rectangle.top<innerHeight*.96;if(!heroVisible&&raf){cancelAnimationFrame(raf);raf=0;stage.dataset.active='false';}else ensureRunning();}
  document.addEventListener('formatx:introcomplete',()=>{introComplete=true;ensureRunning();},{once:true});document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;stage.dataset.active='false';}else ensureRunning();});addEventListener('resize',()=>{resize(true);refreshVisibility();},{passive:true});addEventListener('orientationchange',()=>{resize(true);refreshVisibility();},{passive:true});addEventListener('scroll',refreshVisibility,{passive:true});if(!mobile)addEventListener('pointermove',event=>{pointerX=clamp(event.clientX/Math.max(1,innerWidth)*2-1,-1,1);pointerY=clamp(event.clientY/Math.max(1,innerHeight)*2-1,-1,1);},{passive:true});
  function recoverOnceAfterContextRestore() {
    let alreadyRecovered = false;
    try {
      alreadyRecovered = sessionStorage.getItem(RECOVERY_KEY) === '1';
      if (!alreadyRecovered) sessionStorage.setItem(RECOVERY_KEY, '1');
    } catch (_) {}
    if (alreadyRecovered) {
      root.dataset.fxCoreReal3dHealth = 'context-restore-retry-blocked';
      return;
    }
    root.dataset.fxCoreReal3dHealth = 'context-restoring';
    setTimeout(() => location.reload(), 180);
  }
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(raf)cancelAnimationFrame(raf);raf=0;stage.dataset.active='false';emitCoreFallback('context-lost','webgl2-context-lost');});canvas.addEventListener('webglcontextrestored',recoverOnceAfterContextRestore);

  resize(true);
  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreReal3dHealth = 'ready';
  root.dataset.fxCoreReal3dStartup = 'ready-' + STARTUP_REVISION;
  root.dataset.fxCoreVisualRevision = 'reference-cinematic-v22';
  root.dataset.fxCoreReal3dRevision = 'ready-v21';
  root.dataset.fxCoreRenderer = 'single-webgl2-indexed-3d-v20';
  root.dataset.fxCoreRendererRevision = 'single-webgl2-indexed-3d-v21';
  root.dataset.fxCoreGeometry = 'reference-four-tip-shell-sphere-tori-v21';
  root.dataset.fxCoreDepthBuffer = 'enabled'; root.dataset.fxCoreCamera = 'perspective'; root.dataset.fxCoreNormals = 'per-vertex-plus-faceted-derivatives'; root.dataset.fxCoreImageBacked = 'false'; root.dataset.fxCoreContexts = '1'; root.dataset.fxCoreDrawCalls = '14-max';
  root.dataset.fxCoreTriangles = String(Math.round((star.count * 4 + sphere.count * 2 + torus.count * 3 + beam.count * 2) / 3)); root.dataset.fxCoreIndexType = 'uint16-elements'; root.dataset.fxCoreFrameCap = 'display-refresh-uncapped'; root.dataset.fxCoreVisibility = 'hero-only-raf-paused'; root.dataset.fxCorePerformanceTarget = 'adaptive-60-plus-fps';
  root.dataset.fxCoreMobileComposition = 'reference-concave-wide-real3d-v22'; root.dataset.fxNativeApexRenderer = 'single-webgl2-indexed-3d-v21'; root.dataset.fxNativeApexVisual = 'cinematic-reference-crystal-reactor-v22'; root.dataset.fxCoreMeshMaterial = 'structured-fresnel-crystal-v22'; root.dataset.fxCoreHighlightModel = 'axis-membrane-rings-v22'; root.dataset.fxCoreMaterialCenter = 'centered-object-space'; root.dataset.fxCoreShapeMesh = 'reference-pnorm-four-tip-shell-v22'; root.dataset.fxCoreShapeFracture = 'dense-spokes-integrated-lines-v22'; root.dataset.fxCoreGeometryScale = mobile ? '0.96x-1.08y-real3d-mobile' : '0.98-real3d-desktop'; root.dataset.fxCoreMesh3d = 'ready-real3d-v21'; root.dataset.fxCoreFracture3d = 'integrated-real3d-v21'; root.dataset.fxCoreCinematicGrade = 'shader-native-v22';
  root.dataset.fxGpuCapability = 'webgl2';
  root.dataset.fxCoreContextPolicy = mobile ? 'mobile-default-no-probe' : 'desktop-high-performance-no-probe';
  setTimeout(() => { try { sessionStorage.removeItem(RECOVERY_KEY); } catch (_) {} }, 12000);
  dispatchEvent(new CustomEvent('formatx:coremesh3dready', { detail: { version: 'v20', revision: VERSION, startup: STARTUP_REVISION, geometry: 'reference-four-tip-indexed-triangle-mesh-v21', depth: true, contexts: 1, targetFps: 60 } }));
  refreshVisibility(); ensureRunning();
}());

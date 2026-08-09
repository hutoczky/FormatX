(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'v21';
  const STARTUP_REVISION = 'v22-mobile-safe';
  const VISUAL_REVISION = 'v24-volumetric-crystal';
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
  const mobile = coarse.matches;
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
    void main(){
      vec4 world=uModel*vec4(aPosition,1.0);
      vWorld=world.xyz;
      vObject=aPosition;
      vNormal=normalize(transpose(inverse(mat3(uModel)))*aNormal);
      gl_Position=uProjection*uView*world;
    }`;
  const MESH_FRAGMENT = `#version 300 es
    #define FX_MOBILE ${mobile ? 1 : 0}
    precision highp float;
    in vec3 vWorld; in vec3 vNormal; in vec3 vObject;
    uniform vec3 uCamera;
    uniform float uTime; uniform float uEnergy; uniform float uSurge; uniform float uSpeech; uniform float uOpacity; uniform float uMaterial; uniform float uLayer;
    out vec4 fragColor;
    float sat(float value){return clamp(value,0.0,1.0);}
    float band(float value,float center,float width){return exp(-abs(value-center)/max(.0001,width));}
    float fifth(float value){float squared=value*value;return squared*squared*value;}
    vec3 environmentRadiance(vec3 direction){
      vec3 ray=normalize(direction);
      float horizon=fifth(1.0-abs(ray.y));
      float cyanKey=pow(sat(dot(ray,normalize(vec3(-.46,.34,.82)))),30.0);
      float violetKey=pow(sat(dot(ray,normalize(vec3(.58,-.18,.79)))),24.0);
      float floorBase=sat(-ray.y*.72+ray.z*.28);
      float floorGlow=floorBase*floorBase*floorBase*floorBase;
      return vec3(.004,.018,.060)
        +vec3(.018,.48,1.18)*(horizon*.20+cyanKey*1.28+floorGlow*.12)
        +vec3(.64,.025,1.12)*(violetKey*.72+horizon*.075);
    }
    void main(){
      vec3 viewDir=normalize(uCamera-vWorld);
      vec3 smoothNormal=normalize(vNormal);
      vec3 faceNormal=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
      if(!gl_FrontFacing)faceNormal=-faceNormal;
      vec3 normal=normalize(mix(smoothNormal,faceNormal,.58));
      float ndv=sat(abs(dot(normal,viewDir)));
      float fresnel=.04+.96*fifth(1.0-ndv);
      vec3 lightA=normalize(vec3(-.38,.82,.56));
      vec3 lightB=normalize(vec3(.72,-.18,.62));
      float specA=pow(sat(dot(reflect(-lightA,normal),viewDir)),82.0);
      float specB=pow(sat(dot(reflect(-lightB,normal),viewDir)),46.0);
      vec2 p=vObject.xy;
      float radial=length(p);
      float polar=atan(p.y,p.x);
      float diamond=pow(pow(abs(p.x),.72)+pow(abs(p.y)*.88,.72),1.0/.72);
      float axisX=exp(-abs(p.x)*22.0);
      float axisY=exp(-abs(p.y)*18.0);
      float diagonal=(exp(-abs(p.x-p.y*.82)*19.0)+exp(-abs(p.x+p.y*.82)*19.0))*.28;
      float membrane=band(diamond,.31,.018)+band(diamond,.48,.022)*.82+band(diamond,.66,.026)*.64+band(diamond,.82,.030)*.42;
      float reactorRings=band(radial,.16,.013)+band(radial,.245,.016)*.80+band(radial,.34,.020)*.56+band(radial,.45,.025)*.32;
      float spectral=.5+.5*sin(polar*4.0+radial*16.0-uTime*.18+uLayer*1.7);
      float violetArc=pow(.5+.5*cos(polar*4.0-radial*10.0+uTime*.10),18.0)*smoothstep(.18,.54,radial)*(1.0-smoothstep(.58,.88,radial));
      float caustic=pow(abs(sin(vObject.x*13.0-vObject.y*9.0+normal.z*3.0+uLayer)),28.0);
      float facet=pow(sat(abs(dot(faceNormal,lightA))),4.0);
      float pulse=.5+.5*sin(uTime*1.48);
      float activity=sat(uEnergy*.72+uSurge*.52+uSpeech*.34);
      vec3 cyan=vec3(.01,.66,1.42);
      vec3 electric=vec3(.02,.24,.96);
      vec3 violet=vec3(.74,.045,1.30);
      if(uMaterial<.5){
        vec3 incident=-viewDir;
        vec3 reflected=environmentRadiance(reflect(incident,normal));
        #if FX_MOBILE
          vec3 transmission=environmentRadiance(refract(incident,normal,.684));
        #else
          vec3 refractedR=environmentRadiance(refract(incident,normal,.676));
          vec3 refractedB=environmentRadiance(refract(incident,normal,.694));
          vec3 transmission=vec3(refractedR.r,mix(refractedR.g,refractedB.g,.5),refractedB.b);
        #endif
        float opticalDepth=.10+.34*(1.0-sat(abs(vObject.z)/.44))+.16*(1.0-ndv);
        vec3 absorption=exp(-vec3(1.65,.34,.095)*opticalDepth);
        float body=.14+.34*fresnel+.12*facet+.055*activity;
        vec3 glass=mix(transmission*absorption,reflected,fresnel);
        glass+=vec3(.006,.070,.190)*(1.0-fresnel);
        glass+=mix(electric,cyan,sat(.14+spectral*.34+normal.y*.12))*(.10+.18*(1.0-absorption.r));
        glass=mix(glass,glass+violet*.36,sat((1.0-spectral)*.18+violetArc*.38+normal.x*.06));
        vec3 emission=cyan*(membrane*.58+reactorRings*.70+axisX*.24+axisY*.22+diagonal*.14);
        emission+=violet*(violetArc*.88+membrane*.20+diagonal*.18);
        emission+=vec3(.18,.78,1.44)*(specA*2.38+specB*1.24+caustic*.52);
        vec3 color=(glass*(.82+body+.14*spectral)+emission)*1.44;
        float alpha=uOpacity*(.24+.58*fresnel+.15*facet+.15*membrane+.18*reactorRings+.18*(1.0-absorption.r)+.05*activity);
        fragColor=vec4(color,alpha);
      }else if(uMaterial<1.5){
        float center=pow(ndv,1.55);
        float rim=pow(1.0-ndv,2.2);
        float reactor=1.0-sat(uLayer);
        vec3 core=mix(cyan,vec3(1.0,1.0,1.0),pow(center,3.0)*reactor);
        core=mix(core,violet,sat(rim*.42+spectral*.08*uLayer));
        core+=cyan*(.45+.48*activity+.18*pulse)*reactor;
        core+=electric*(.20+.34*activity)*uLayer;
        float alpha=uOpacity*(reactor*(.62+.30*center)+uLayer*(.08+.20*rim));
        fragColor=vec4(core*mix(1.0,2.2,reactor),alpha);
      }else{
        vec3 ring=mix(cyan,violet,sat(uLayer*.18+spectral*.24));
        float edgeSpec=specA*1.10+specB*.64;
        float filamentMask=1.0-smoothstep(.10,.24,abs(uLayer-.45));
        float railGlint=filamentMask*pow(.5+.5*cos((vObject.x*1.14+vObject.y)*52.0),8.0);
        ring+=vec3(.025,.58,1.45)*(.27+edgeSpec*.90);
        ring+=vec3(.46,.98,1.30)*edgeSpec*1.15;
        ring+=vec3(.42,1.42,1.82)*railGlint*2.20;
        ring*=1.34+activity*.55+pulse*.09;
        fragColor=vec4(ring,uOpacity*(.52+.38*fresnel+.14*activity));
      }
    }`;
  const LINE_VERTEX = `#version 300 es
    precision highp float; layout(location=0) in vec3 aPosition; uniform mat4 uProjection; uniform mat4 uView; uniform mat4 uModel;
    void main(){gl_Position=uProjection*uView*uModel*vec4(aPosition,1.0);}`;
  const LINE_FRAGMENT = `#version 300 es
    precision highp float; uniform vec3 uColor; uniform float uOpacity; uniform float uEnergy; out vec4 fragColor;
    void main(){fragColor=vec4(uColor*(.72+uEnergy*.58),uOpacity);}`;
  const POINT_VERTEX = `#version 300 es
    precision highp float; layout(location=0) in vec3 aPosition; uniform mat4 uProjection; uniform mat4 uView; uniform mat4 uModel; uniform float uTime; uniform float uDpr; out float vPulse;
    void main(){float phase=float(gl_VertexID)*1.618; vec3 point=aPosition; point.z+=sin(uTime*.24+phase)*.055; gl_Position=uProjection*uView*uModel*vec4(point,1.0); vPulse=.55+.45*sin(uTime*.52+phase*2.1); gl_PointSize=(1.1+vPulse*1.7)*uDpr;}`;
  const POINT_FRAGMENT = `#version 300 es
    precision highp float; in float vPulse; out vec4 fragColor;
    void main(){vec2 p=gl_PointCoord-.5; float glow=smoothstep(.5,0.0,length(p)); if(glow<=.01)discard; fragColor=vec4(mix(vec3(.03,.46,1.0),vec3(.68,.08,1.08),vPulse),glow*glow*.48);}`;
  const POST_VERTEX = `#version 300 es
    precision highp float;
    out vec2 vUv;
    void main(){
      vec2 point=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));
      vUv=point;
      gl_Position=vec4(point*2.0-1.0,0.0,1.0);
    }`;
  const BLOOM_FRAGMENT = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uInput;
    uniform vec2 uTexel;
    uniform vec2 uDirection;
    uniform float uExtract;
    out vec4 fragColor;
    vec3 source(vec2 uv){
      vec4 sampleColor=texture(uInput,uv);
      float peak=max(max(sampleColor.r,sampleColor.g),sampleColor.b);
      float mask=smoothstep(.34,.86,peak)*smoothstep(.015,.18,sampleColor.a);
      return mix(sampleColor.rgb,sampleColor.rgb*mask,uExtract);
    }
    void main(){
      vec2 offset=uTexel*uDirection;
      vec3 color=source(vUv)*.227027;
      color+=source(vUv+offset*1.384615)*.316216;
      color+=source(vUv-offset*1.384615)*.316216;
      color+=source(vUv+offset*3.230769)*.070270;
      color+=source(vUv-offset*3.230769)*.070270;
      fragColor=vec4(color,1.0);
    }`;
  const COMPOSITE_FRAGMENT = `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uScene;
    uniform sampler2D uBloom;
    uniform float uEnergy;
    out vec4 fragColor;
    void main(){
      vec4 scene=texture(uScene,vUv);
      vec3 bloom=texture(uBloom,vUv).rgb;
      vec3 color=scene.rgb+bloom*(1.76+uEnergy*.46);
      color=vec3(1.0)-exp(-color*(1.34+uEnergy*.13));
      color=pow(max(color,vec3(0.0)),vec3(.92));
      float luminance=dot(color,vec3(.2126,.7152,.0722));
      color=max(vec3(0.0),mix(vec3(luminance),color,1.65));
      float aura=max(max(bloom.r,bloom.g),bloom.b);
      fragColor=vec4(color,clamp(scene.a+aura*.36,0.0,1.0));
    }`;

  function shader(type, source) { const output = gl.createShader(type); gl.shaderSource(output, source); gl.compileShader(output); if (!gl.getShaderParameter(output, gl.COMPILE_STATUS)) { const reason = gl.getShaderInfoLog(output) || 'shader compile failed'; gl.deleteShader(output); throw new Error(reason); } return output; }
  function program(vertexSource, fragmentSource) { const output = gl.createProgram(), vertex = shader(gl.VERTEX_SHADER, vertexSource), fragment = shader(gl.FRAGMENT_SHADER, fragmentSource); gl.attachShader(output, vertex); gl.attachShader(output, fragment); gl.linkProgram(output); gl.deleteShader(vertex); gl.deleteShader(fragment); if (!gl.getProgramParameter(output, gl.LINK_STATUS)) { const reason = gl.getProgramInfoLog(output) || 'program link failed'; gl.deleteProgram(output); throw new Error(reason); } return output; }

  let meshProgram, lineProgram, pointProgram, bloomProgram, compositeProgram;
  try {
    meshProgram = program(MESH_VERTEX, MESH_FRAGMENT);
    lineProgram = program(LINE_VERTEX, LINE_FRAGMENT);
    pointProgram = program(POINT_VERTEX, POINT_FRAGMENT);
    bloomProgram = program(POST_VERTEX, BLOOM_FRAGMENT);
    compositeProgram = program(POST_VERTEX, COMPOSITE_FRAGMENT);
  }
  catch (error) { root.dataset.fxCoreReal3dError = String(error?.message || error).slice(0, 240); console.warn('FormatX real 3D core v21 could not compile: ' + root.dataset.fxCoreReal3dError); stage.remove(); emitCoreFallback('shader-failed', root.dataset.fxCoreReal3dError); return; }

  function calculateNormals(positions, indices) {
    const normals = new Float32Array(positions.length);
    for (let index = 0; index < indices.length; index += 3) { const ia = indices[index] * 3, ib = indices[index + 1] * 3, ic = indices[index + 2] * 3; const abx = positions[ib] - positions[ia], aby = positions[ib + 1] - positions[ia + 1], abz = positions[ib + 2] - positions[ia + 2]; const acx = positions[ic] - positions[ia], acy = positions[ic + 1] - positions[ia + 1], acz = positions[ic + 2] - positions[ia + 2]; const nx = aby * acz - abz * acy, ny = abz * acx - abx * acz, nz = abx * acy - aby * acx; for (const offset of [ia, ib, ic]) { normals[offset] += nx; normals[offset + 1] += ny; normals[offset + 2] += nz; } }
    for (let index = 0; index < normals.length; index += 3) { const length = Math.hypot(normals[index], normals[index + 1], normals[index + 2]) || 1; normals[index] /= length; normals[index + 1] /= length; normals[index + 2] /= length; }
    return normals;
  }
  function referenceRadius(angle) { const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle)), p = .68; const lp = 1 / Math.pow(Math.pow(c, p) + Math.pow(s, p), 1 / p); return .025 + .975 * lp; }
  function starGeometry(angularSegments, radialSegments) {
    const positions = [], indices = [], lineIndices = [], sides = [];
    for (const sign of [1, -1]) {
      const sideStart = positions.length / 3; sides.push(sideStart); positions.push(0, 0, sign * .43);
      for (let ring = 1; ring <= radialSegments; ring += 1) {
        const t = ring / radialSegments;
        for (let segment = 0; segment < angularSegments; segment += 1) {
          const angle = segment / angularSegments * Math.PI * 2;
          const radius = referenceRadius(angle);
          const cardinal = Math.pow(Math.abs(Math.cos(angle * 2)), 3.2);
          const flowing = 1 + Math.sin(Math.PI * t) * Math.cos(angle * 4) * .035;
          const x = Math.cos(angle) * radius * t * flowing;
          const y = Math.sin(angle) * radius * t * 1.12 * flowing;
          const lens = Math.pow(Math.max(0, 1 - t), 1.10);
          const shoulder = Math.exp(-Math.pow((t - .43) / .22, 2));
          const sail = Math.sin(angle * 4) * Math.sin(Math.PI * t) * (1 - t) * .035;
          const z = sign * (.024 + .406 * lens * (.76 + .24 * cardinal) + .048 * shoulder + sail);
          positions.push(x, y, z);
        }
      }
      const firstRing = sideStart + 1;
      for (let segment = 0; segment < angularSegments; segment += 1) { const next = (segment + 1) % angularSegments; if (sign > 0) indices.push(sideStart, firstRing + segment, firstRing + next); else indices.push(sideStart, firstRing + next, firstRing + segment); }
      for (let ring = 1; ring < radialSegments; ring += 1) { const current = sideStart + 1 + (ring - 1) * angularSegments, nextRing = current + angularSegments; for (let segment = 0; segment < angularSegments; segment += 1) { const next = (segment + 1) % angularSegments; if (sign > 0) indices.push(current + segment, nextRing + segment, nextRing + next, current + segment, nextRing + next, current + next); else indices.push(current + segment, nextRing + next, nextRing + segment, current + segment, current + next, nextRing + next); } }
    }
    const frontEdge = sides[0] + 1 + (radialSegments - 1) * angularSegments, backEdge = sides[1] + 1 + (radialSegments - 1) * angularSegments;
    for (let segment = 0; segment < angularSegments; segment += 1) { const next = (segment + 1) % angularSegments; indices.push(frontEdge + segment, backEdge + segment, backEdge + next, frontEdge + segment, backEdge + next, frontEdge + next); }
    const frontStart = sides[0];
    for (const ring of [2, 4, 7, 10, radialSegments]) { if (ring > radialSegments) continue; const start = frontStart + 1 + (ring - 1) * angularSegments; for (let segment = 0; segment < angularSegments; segment += 1) lineIndices.push(start + segment, start + (segment + 1) % angularSegments); }
    const spokeStep = Math.max(4, Math.round(angularSegments / 16));
    for (let segment = 0; segment < angularSegments; segment += spokeStep) { let previous = frontStart; for (let ring = 1; ring <= radialSegments; ring += 1) { const current = frontStart + 1 + (ring - 1) * angularSegments + segment; lineIndices.push(previous, current); previous = current; } }
    return { positions: new Float32Array(positions), normals: calculateNormals(positions, indices), indices: new Uint16Array(indices), lineIndices: new Uint16Array(lineIndices) };
  }
  function sphereGeometry(longitudes, latitudes) { const positions = [], normals = [], indices = []; for (let latitude = 0; latitude <= latitudes; latitude += 1) { const vv = latitude / latitudes, phi = vv * Math.PI; for (let longitude = 0; longitude <= longitudes; longitude += 1) { const uu = longitude / longitudes, theta = uu * Math.PI * 2, x = Math.sin(phi) * Math.cos(theta), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(theta); positions.push(x, y, z); normals.push(x, y, z); } } for (let latitude = 0; latitude < latitudes; latitude += 1) for (let longitude = 0; longitude < longitudes; longitude += 1) { const a = latitude * (longitudes + 1) + longitude, b = a + longitudes + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); } return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
  function torusGeometry(radialSegments, tubeSegments, radius, tube) { const positions = [], normals = [], indices = []; for (let radial = 0; radial <= radialSegments; radial += 1) { const uu = radial / radialSegments * Math.PI * 2, cu = Math.cos(uu), su = Math.sin(uu); for (let side = 0; side <= tubeSegments; side += 1) { const vv = side / tubeSegments * Math.PI * 2, cv = Math.cos(vv), sv = Math.sin(vv); positions.push((radius + tube * cv) * cu, (radius + tube * cv) * su, tube * sv); normals.push(cv * cu, cv * su, sv); } } for (let radial = 0; radial < radialSegments; radial += 1) for (let side = 0; side < tubeSegments; side += 1) { const a = radial * (tubeSegments + 1) + side, b = a + tubeSegments + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); } return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
  function crystalSurfacePoint(angle, t, lift) {
    const radius = referenceRadius(angle);
    const cardinal = Math.pow(Math.abs(Math.cos(angle * 2)), 3.2);
    const flowing = 1 + Math.sin(Math.PI * t) * Math.cos(angle * 4) * .035;
    const lens = Math.pow(Math.max(0, 1 - t), 1.10);
    const shoulder = Math.exp(-Math.pow((t - .43) / .22, 2));
    const sail = Math.sin(angle * 4) * Math.sin(Math.PI * t) * (1 - t) * .035;
    return [
      Math.cos(angle) * radius * t * flowing,
      Math.sin(angle) * radius * t * 1.12 * flowing,
      .024 + .406 * lens * (.76 + .24 * cardinal) + .048 * shoulder + sail + lift
    ];
  }
  function crystalFilamentGeometry(angularSegments, tubeSides) {
    const positions = [], normals = [], indices = [];
    function addTube(path, closed, radius) {
      const start = positions.length / 3, rings = path.length;
      for (let pointIndex = 0; pointIndex < rings; pointIndex += 1) {
        const previous = path[closed ? (pointIndex - 1 + rings) % rings : Math.max(0, pointIndex - 1)];
        const current = path[pointIndex];
        const next = path[closed ? (pointIndex + 1) % rings : Math.min(rings - 1, pointIndex + 1)];
        let tx = next[0] - previous[0], ty = next[1] - previous[1], tz = next[2] - previous[2];
        const tangentLength = Math.hypot(tx, ty, tz) || 1; tx /= tangentLength; ty /= tangentLength; tz /= tangentLength;
        let sx = ty, sy = -tx, sz = 0, sideLength = Math.hypot(sx, sy, sz);
        if (sideLength < .0001) { sx = 1; sy = 0; sz = 0; sideLength = 1; }
        sx /= sideLength; sy /= sideLength; sz /= sideLength;
        let bx = ty * sz - tz * sy, by = tz * sx - tx * sz, bz = tx * sy - ty * sx;
        const binormalLength = Math.hypot(bx, by, bz) || 1; bx /= binormalLength; by /= binormalLength; bz /= binormalLength;
        const taper = current[3] || 1;
        for (let side = 0; side < tubeSides; side += 1) {
          const angle = side / tubeSides * Math.PI * 2, cosine = Math.cos(angle), sine = Math.sin(angle);
          const nx = sx * cosine + bx * sine, ny = sy * cosine + by * sine, nz = sz * cosine + bz * sine;
          positions.push(current[0] + nx * radius * taper, current[1] + ny * radius * taper, current[2] + nz * radius * taper);
          normals.push(nx, ny, nz);
        }
      }
      const links = closed ? rings : rings - 1;
      for (let ring = 0; ring < links; ring += 1) {
        const nextRing = (ring + 1) % rings;
        for (let side = 0; side < tubeSides; side += 1) {
          const nextSide = (side + 1) % tubeSides;
          const a = start + ring * tubeSides + side, b = start + nextRing * tubeSides + side;
          indices.push(a, b, start + nextRing * tubeSides + nextSide, a, start + nextRing * tubeSides + nextSide, start + ring * tubeSides + nextSide);
        }
      }
    }
    const outer = [];
    for (let segment = 0; segment < angularSegments; segment += 1) outer.push([...crystalSurfacePoint(segment / angularSegments * Math.PI * 2, 1, .008), 1]);
    addTube(outer, true, .0125);
    for (const contour of [.43, .68]) {
      const path = [], segments = Math.round(angularSegments * .72);
      for (let segment = 0; segment < segments; segment += 1) path.push([...crystalSurfacePoint(segment / segments * Math.PI * 2, contour, .010), .72]);
      addTube(path, true, .0105);
    }
    for (let spoke = 0; spoke < 8; spoke += 1) {
      const cardinal = spoke % 2 === 0, end = cardinal ? 1 : .78, samples = cardinal ? 18 : 13, path = [];
      for (let sample = 0; sample < samples; sample += 1) {
        const t = .055 + (end - .055) * sample / (samples - 1);
        path.push([...crystalSurfacePoint(spoke * Math.PI / 4, t, .012), cardinal ? 1.10 - t * .24 : .58]);
      }
      addTube(path, false, cardinal ? .0125 : .0100);
    }
    return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
  }
  function boxGeometry() { const positions = [], normals = [], indices = []; const faces = [[[ -1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1],[1,0,0]],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,0,0]],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1],[0,1,0]],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[0,-1,0]]]; for (const face of faces) { const start = positions.length / 3; for (let index = 0; index < 4; index += 1) { positions.push(...face[index]); normals.push(...face[4]); } indices.push(start, start + 1, start + 2, start, start + 2, start + 3); } return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) }; }
  function particleGeometry(count) { const positions = new Float32Array(count * 3); for (let index = 0; index < count; index += 1) { const angle = index * 2.399963, radius = .72 + (index % 17) / 17; positions[index * 3] = Math.cos(angle) * radius * 1.08; positions[index * 3 + 1] = Math.sin(angle) * radius * 1.22; positions[index * 3 + 2] = -.28 + (index % 11) / 11 * .48; } return positions; }
  function uploadMesh(geometry) { const vao = gl.createVertexArray(); gl.bindVertexArray(vao); const position = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, position); gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); const normal = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, normal); gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); const index = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW); let lineIndex = null; if (geometry.lineIndices?.length) { lineIndex = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndex); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.lineIndices, gl.STATIC_DRAW); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); } gl.bindVertexArray(null); return { vao, position, normal, index, lineIndex, count: geometry.indices.length, lineCount: geometry.lineIndices?.length || 0 }; }
  function uploadParticles(positions) { const vao = gl.createVertexArray(), buffer = gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null); return { vao, buffer, count: positions.length / 3 }; }

  const star = uploadMesh(starGeometry(mobile ? 76 : 104, mobile ? 12 : 14));
  const sphere = uploadMesh(sphereGeometry(mobile ? 26 : 36, mobile ? 18 : 24));
  const torus = uploadMesh(torusGeometry(mobile ? 44 : 64, mobile ? 7 : 10, .43, .0145));
  const filaments = uploadMesh(crystalFilamentGeometry(mobile ? 64 : 88, mobile ? 6 : 7));
  const beam = uploadMesh(boxGeometry());
  const particles = uploadParticles(particleGeometry(mobile ? 64 : 112));
  const meshUniforms = Object.fromEntries(['uProjection','uView','uModel','uCamera','uTime','uEnergy','uSurge','uSpeech','uOpacity','uMaterial','uLayer'].map(name => [name, gl.getUniformLocation(meshProgram, name)]));
  const lineUniforms = Object.fromEntries(['uProjection','uView','uModel','uColor','uOpacity','uEnergy'].map(name => [name, gl.getUniformLocation(lineProgram, name)]));
  const pointUniforms = Object.fromEntries(['uProjection','uView','uModel','uTime','uDpr'].map(name => [name, gl.getUniformLocation(pointProgram, name)]));
  const bloomUniforms = Object.fromEntries(['uInput','uTexel','uDirection','uExtract'].map(name => [name, gl.getUniformLocation(bloomProgram, name)]));
  const compositeUniforms = Object.fromEntries(['uScene','uBloom','uEnergy'].map(name => [name, gl.getUniformLocation(compositeProgram, name)]));
  const postVao = gl.createVertexArray();
  const sceneFramebuffer = gl.createFramebuffer();
  const sceneTexture = gl.createTexture();
  const sceneDepth = gl.createRenderbuffer();
  const bloomFramebufferA = gl.createFramebuffer();
  const bloomTextureA = gl.createTexture();
  const bloomFramebufferB = gl.createFramebuffer();
  const bloomTextureB = gl.createTexture();
  let bloomWidth = 0, bloomHeight = 0, postReady = false;
  function allocateColorTexture(texture, width, height) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  function attachColorTarget(framebuffer, texture, width, height) {
    allocateColorTexture(texture, width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }
  function resizePostTargets(width, height) {
    bloomWidth = Math.max(96, Math.round(width * (mobile ? .25 : .34)));
    bloomHeight = Math.max(96, Math.round(height * (mobile ? .25 : .34)));
    try {
      allocateColorTexture(sceneTexture, width, height);
      gl.bindRenderbuffer(gl.RENDERBUFFER, sceneDepth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFramebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, sceneDepth);
      const sceneComplete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      const bloomAComplete = attachColorTarget(bloomFramebufferA, bloomTextureA, bloomWidth, bloomHeight);
      const bloomBComplete = attachColorTarget(bloomFramebufferB, bloomTextureB, bloomWidth, bloomHeight);
      postReady = sceneComplete && bloomAComplete && bloomBComplete;
    } catch (error) {
      postReady = false;
      root.dataset.fxCoreBloomError = String(error?.message || error).slice(0, 160);
    }
    root.dataset.fxCoreBloom = postReady ? 'quarter-resolution-separable-v23' : 'direct-render-safe-fallback';
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  const cinematic = { version:'film-reactive-v1', energy:.34, targetEnergy:.34, surge:0, speech:0, heart:0, pulse:1, rotation:[0,0,0] };
  window.FormatXCoreCinematic = cinematic;
  function wake(energy, surge, speech) { cinematic.energy = Math.max(cinematic.energy, energy); cinematic.targetEnergy = Math.max(cinematic.targetEnergy, energy); cinematic.surge = Math.max(cinematic.surge, surge); if (typeof speech === 'number') cinematic.speech = speech; root.dataset.fxCoreCinematicImmediate = 'frame-rate-independent-v1'; ensureRunning(); }
  addEventListener('formatx:organismcoreactivate', () => wake(.78,.68)); addEventListener('formatx:organismresponse', () => wake(.82,.72)); addEventListener('formatx:organismspeechstart', () => wake(.86,.64,1)); addEventListener('formatx:organismspeechend', () => { cinematic.speech = 0; cinematic.targetEnergy = .42; }); addEventListener('formatx:immersiveactivate', () => wake(.72,.52));

  const mobileCores = Number(navigator.hardwareConcurrency || 4), mobileMemory = Number(navigator.deviceMemory || 4);
  const highMobile = mobile && (mobileCores >= 6 || mobileMemory >= 6);
  let cssWidth=0, cssHeight=0, bufferWidth=0, bufferHeight=0, renderScale=mobile?(highMobile?.90:.76):.88, projection=identity();
  const view=translation(0,0,-4.35), camera=[0,0,4.35]; let raf=0, started=performance.now(), lastTime=started, sampleStarted=started, sampleFrames=0, introComplete=root.classList.contains('fx-intro-complete'), heroVisible=true, pointerX=0, pointerY=0;
  function resize(force) { const nextWidth=Math.max(1,innerWidth), nextHeight=Math.max(1,innerHeight), dprCap=mobile?(highMobile?1.45:1.12):1.35, dpr=Math.min(devicePixelRatio||1,dprCap); let width=Math.round(nextWidth*dpr*renderScale), height=Math.round(nextHeight*dpr*renderScale); const pixelBudget=mobile?(highMobile?1450000:950000):2050000, budgetScale=Math.min(1,Math.sqrt(pixelBudget/Math.max(1,width*height))); width=Math.max(2,Math.round(width*budgetScale)); height=Math.max(2,Math.round(height*budgetScale)); if(!force&&nextWidth===cssWidth&&nextHeight===cssHeight&&width===bufferWidth&&height===bufferHeight)return; cssWidth=nextWidth;cssHeight=nextHeight;bufferWidth=width;bufferHeight=height;canvas.width=width;canvas.height=height;resizePostTargets(width,height);gl.viewport(0,0,width,height);projection=perspective((mobile?50:42)*Math.PI/180,nextWidth/nextHeight,.1,20);root.dataset.fxCoreReal3dResolution=width+'x'+height;root.dataset.fxCoreReal3dScale=renderScale.toFixed(2);root.dataset.fxCoreMobileQuality=mobile?(highMobile?'high-adaptive-bloom':'efficient-adaptive-bloom'):'desktop-adaptive-bloom'; }
  function baseModel(time,pulse) { const x=mobile?0:.84, y=mobile?.40:.01, pointerFactor=mobile||reduced.matches?0:1, rx=(reduced.matches?.035:.055+Math.sin(time*.17)*.035)+pointerY*.11*pointerFactor, ry=(reduced.matches?-.095:-.115+Math.sin(time*.21)*.060)+pointerX*.15*pointerFactor, rz=reduced.matches?0:Math.sin(time*.13)*.014, scaleX=(mobile?.88:1.14)*pulse, scaleY=(mobile?.94:1.14)*pulse; cinematic.rotation=[rx,ry,rz]; return compose([translation(x,y,0),rotationX(rx),rotationY(ry),rotationZ(rz),scaling(scaleX,scaleY,scaleY)]); }
  function bindCommon(programObject,uniforms,model,time){gl.useProgram(programObject);gl.uniformMatrix4fv(uniforms.uProjection,false,projection);gl.uniformMatrix4fv(uniforms.uView,false,view);gl.uniformMatrix4fv(uniforms.uModel,false,model);if(uniforms.uCamera)gl.uniform3f(uniforms.uCamera,camera[0],camera[1],camera[2]);if(uniforms.uTime)gl.uniform1f(uniforms.uTime,time);}
  function drawMesh(mesh,model,material,opacity,layer,time){bindCommon(meshProgram,meshUniforms,model,time);gl.uniform1f(meshUniforms.uEnergy,cinematic.energy);gl.uniform1f(meshUniforms.uSurge,cinematic.surge);gl.uniform1f(meshUniforms.uSpeech,cinematic.speech);gl.uniform1f(meshUniforms.uOpacity,opacity);gl.uniform1f(meshUniforms.uMaterial,material);gl.uniform1f(meshUniforms.uLayer,layer);gl.bindVertexArray(mesh.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.index);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);}
  function drawLines(mesh,model,color,opacity,time){if(!mesh.lineIndex||!mesh.lineCount)return;bindCommon(lineProgram,lineUniforms,model,time);gl.uniform3f(lineUniforms.uColor,color[0],color[1],color[2]);gl.uniform1f(lineUniforms.uOpacity,opacity);gl.uniform1f(lineUniforms.uEnergy,cinematic.energy+cinematic.surge*.5);gl.bindVertexArray(mesh.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.lineIndex);gl.drawElements(gl.LINES,mesh.lineCount,gl.UNSIGNED_SHORT,0);}
  function drawParticles(model,time){bindCommon(pointProgram,pointUniforms,model,time);gl.uniform1f(pointUniforms.uDpr,Math.min(devicePixelRatio||1,1.5));gl.bindVertexArray(particles.vao);gl.drawArrays(gl.POINTS,0,particles.count);}
  function bloomPass(framebuffer,input,dirX,dirY,extract){gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,bloomWidth,bloomHeight);gl.useProgram(bloomProgram);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,input);gl.uniform1i(bloomUniforms.uInput,0);gl.uniform2f(bloomUniforms.uTexel,1/Math.max(1,bloomWidth),1/Math.max(1,bloomHeight));gl.uniform2f(bloomUniforms.uDirection,dirX,dirY);gl.uniform1f(bloomUniforms.uExtract,extract);gl.bindVertexArray(postVao);gl.drawArrays(gl.TRIANGLES,0,3);}
  function compositeBloom(){
    gl.disable(gl.BLEND);gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.depthMask(false);
    bloomPass(bloomFramebufferA,sceneTexture,1,0,1);
    bloomPass(bloomFramebufferB,bloomTextureA,0,1,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,bufferWidth,bufferHeight);gl.useProgram(compositeProgram);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,sceneTexture);gl.uniform1i(compositeUniforms.uScene,0);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,bloomTextureB);gl.uniform1i(compositeUniforms.uBloom,1);
    gl.uniform1f(compositeUniforms.uEnergy,cinematic.energy+cinematic.surge*.35);gl.bindVertexArray(postVao);gl.drawArrays(gl.TRIANGLES,0,3);
  }
  function updateCinematic(delta,time){const heartA=.5+.5*Math.sin(time*1.52),heartB=.5+.5*Math.sin(time*3.04-.72);cinematic.heart=Math.pow(heartA,5)*.72+Math.pow(heartB,9)*.28;cinematic.pulse=1+cinematic.heart*.021+Math.sin(time*.58)*.0035;const rate=1-Math.exp(-delta*2.6);cinematic.energy+=(cinematic.targetEnergy-cinematic.energy)*rate;cinematic.surge*=Math.exp(-delta*.72);cinematic.targetEnergy+=(.34-cinematic.targetEnergy)*(1-Math.exp(-delta*.34));}
  function drawFrame(now){
    const delta=Math.min(.05,Math.max(.001,(now-lastTime)/1000));lastTime=now;
    const time=reduced.matches?1.8:(now-started)/1000;
    updateCinematic(delta,time);resize(false);
    const base=baseModel(time,cinematic.pulse);
    gl.bindFramebuffer(gl.FRAMEBUFFER,postReady?sceneFramebuffer:null);gl.viewport(0,0,bufferWidth,bufferHeight);
    gl.clearColor(0,0,0,0);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    drawParticles(base,time);

    const ringPulse=1+cinematic.heart*.026;
    const ringModels=[
      multiply(base,compose([translation(0,0,.015),rotationX(.045),rotationZ(time*.030),scaling(1.08*ringPulse,1.08*ringPulse,1.08*ringPulse)])),
      multiply(base,compose([translation(0,0,.005),rotationY(.18),rotationX(-.16),rotationZ(-time*.024),scaling(.82,.82,.82)])),
      multiply(base,compose([translation(0,0,.025),rotationY(-.24),rotationX(.26),rotationZ(time*.020),scaling(.60,.60,.60)])),
      multiply(base,compose([translation(0,0,.04),rotationX(-.08),rotationZ(-time*.038),scaling(.40,.40,.40)]))
    ];
    const halo=multiply(base,scaling(.20,.20,.20));
    const reactorScale=.052*(1+cinematic.heart*.10),reactor=multiply(base,scaling(reactorScale,reactorScale,reactorScale));
    const horizontalBeam=multiply(base,scaling(.93,.0028,.006)),verticalBeam=multiply(base,scaling(.0028,1.02,.006));
    const inner=multiply(base,scaling(.69,.69,.69));
    gl.disable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.cullFace(gl.FRONT);drawMesh(star,inner,0,.40,1,time);gl.cullFace(gl.BACK);drawMesh(star,inner,0,.52,1,time);
    gl.cullFace(gl.FRONT);drawMesh(star,base,0,.64,0,time);gl.cullFace(gl.BACK);drawMesh(star,base,0,.80,0,time);

    gl.disable(gl.CULL_FACE);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    drawMesh(torus,ringModels[0],2,.74,0,time);drawMesh(torus,ringModels[1],2,.66,1,time);drawMesh(torus,ringModels[2],2,.58,2,time);drawMesh(torus,ringModels[3],2,.50,3,time);
    drawMesh(filaments,base,2,.72,.45,time);
    gl.disable(gl.DEPTH_TEST);gl.depthMask(false);drawMesh(sphere,halo,1,.30,1,time);drawMesh(sphere,reactor,1,.96,0,time);
    drawMesh(beam,horizontalBeam,2,.30+cinematic.surge*.05,0,time);drawMesh(beam,verticalBeam,2,.26+cinematic.surge*.045,1,time);
    gl.depthMask(true);gl.bindVertexArray(null);
    if(postReady)compositeBloom();

    sampleFrames+=1;const elapsed=now-sampleStarted;
    if(elapsed>=2400){const fps=sampleFrames/(elapsed/1000);root.dataset.fxCoreReal3dFps=fps.toFixed(1);sampleFrames=0;sampleStarted=now;const oldScale=renderScale;if(fps<56)renderScale=clamp(renderScale-(fps<45?.10:.06),mobile?.52:.58,1);else if(fps>72)renderScale=clamp(renderScale+.035,mobile?.52:.58,1);if(Math.abs(oldScale-renderScale)>.001)resize(true);root.dataset.fxCoreReal3dQuality=fps<56?'adapting-for-60fps':fps>=59?'60fps-ready':'balanced';}
  }
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
  root.dataset.fxCoreVisualRevision = VISUAL_REVISION;
  root.dataset.fxCoreReal3dRevision = 'ready-v21';
  root.dataset.fxCoreRenderer = 'single-webgl2-indexed-3d-v20';
  root.dataset.fxCoreRendererRevision = 'single-webgl2-indexed-3d-v21';
  root.dataset.fxCoreGeometry = 'concave-four-sail-volumetric-crystal-v24';
  root.dataset.fxCoreDepthBuffer = 'enabled'; root.dataset.fxCoreCamera = 'perspective'; root.dataset.fxCoreNormals = 'inverse-transpose-plus-faceted-derivatives'; root.dataset.fxCoreImageBacked = 'false'; root.dataset.fxCoreContexts = '1'; root.dataset.fxCoreDrawCalls = '17-max';
  root.dataset.fxCoreTriangles = String(Math.round((star.count * 4 + sphere.count * 2 + torus.count * 4 + filaments.count + beam.count * 2) / 3)); root.dataset.fxCoreIndexType = 'uint16-elements'; root.dataset.fxCoreFrameCap = 'display-refresh-uncapped'; root.dataset.fxCoreVisibility = 'hero-only-raf-paused'; root.dataset.fxCorePerformanceTarget = 'adaptive-60-plus-fps'; root.dataset.fxCorePostProcess = postReady ? 'quarter-resolution-separable-bloom-v23' : 'direct-render-safe-fallback';
  root.dataset.fxCoreMobileComposition = 'reference-crystal-portal-v24'; root.dataset.fxNativeApexRenderer = 'single-webgl2-indexed-3d-v21'; root.dataset.fxNativeApexVisual = 'cinematic-volumetric-crystal-portal-v24'; root.dataset.fxCoreMeshMaterial = 'fresnel-chromatic-refraction-glass-v24'; root.dataset.fxCoreHighlightModel = 'physical-crystal-ribs-and-caustics-v24'; root.dataset.fxCoreMaterialCenter = 'centered-object-space'; root.dataset.fxCoreShapeMesh = 'concave-pnorm-four-sail-volume-v24'; root.dataset.fxCoreShapeFracture = 'physical-tube-filaments-v24'; root.dataset.fxCoreGeometryScale = mobile ? '0.88x-0.94y-real3d-mobile' : '1.14-real3d-desktop'; root.dataset.fxCoreMesh3d = 'ready-real3d-v24'; root.dataset.fxCoreFracture3d = 'integrated-real3d-v24'; root.dataset.fxCoreCinematicGrade = 'separable-bloom-filmic-v24'; root.dataset.fxCorePhysicalGlass = 'schlick-fresnel-chromatic-refraction-v24'; root.dataset.fxCoreVolumeAbsorption = 'beer-lambert-approximation-v24';
  root.dataset.fxGpuCapability = 'webgl2';
  root.dataset.fxCoreContextPolicy = mobile ? 'mobile-default-no-probe' : 'desktop-high-performance-no-probe';
  setTimeout(() => { try { sessionStorage.removeItem(RECOVERY_KEY); } catch (_) {} }, 12000);
  dispatchEvent(new CustomEvent('formatx:coremesh3dready', { detail: { version: 'v20', revision: VERSION, startup: STARTUP_REVISION, visual: VISUAL_REVISION, geometry: 'concave-four-sail-indexed-volume-v24', bloom: postReady, depth: true, contexts: 1, targetFps: 60 } }));
  refreshVisibility(); ensureRunning();
}());

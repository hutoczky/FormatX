(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'v26';
  const AUDIT_MODE = new URLSearchParams(location.search).get('lighthouse') === '1';
  if (AUDIT_MODE || root.dataset.fxReferenceCore === 'ready-v26') return;
  if (typeof WebGL2RenderingContext === 'undefined') {
    root.dataset.fxReferenceCore = 'webgl2-unavailable';
    return;
  }

  const hero = document.getElementById('hero');
  if (!hero || !document.body) return;

  const coarse = matchMedia('(max-width: 820px), (pointer: coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = coarse.matches;
  const stage = document.createElement('div');
  stage.className = 'fx-reference-core-v26-stage';
  stage.dataset.active = 'false';
  stage.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-reference-core-v26-canvas';
  canvas.dataset.fxReferenceCoreCanvas = VERSION;
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
    root.dataset.fxReferenceCore = 'context-unavailable';
    if (contextMessage) root.dataset.fxReferenceCoreError = contextMessage.slice(0, 220);
    return;
  }

  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c += 1) for (let r = 0; r < 4; r += 1) {
      out[r + c * 4] = a[r] * b[c * 4] + a[r + 4] * b[c * 4 + 1] + a[r + 8] * b[c * 4 + 2] + a[r + 12] * b[c * 4 + 3];
    }
    return out;
  }
  function compose(...parts) { return parts.reduce((out, item) => multiply(out, item), identity()); }
  function translation(x, y, z) { const out = identity(); out[12] = x; out[13] = y; out[14] = z; return out; }
  function scaling(x, y, z) { const out = identity(); out[0] = x; out[5] = y; out[10] = z; return out; }
  function rotationX(a) { const out = identity(), c = Math.cos(a), s = Math.sin(a); out[5] = c; out[6] = s; out[9] = -s; out[10] = c; return out; }
  function rotationY(a) { const out = identity(), c = Math.cos(a), s = Math.sin(a); out[0] = c; out[2] = -s; out[8] = s; out[10] = c; return out; }
  function rotationZ(a) { const out = identity(), c = Math.cos(a), s = Math.sin(a); out[0] = c; out[1] = s; out[4] = -s; out[5] = c; return out; }
  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far), out = new Float32Array(16);
    out[0] = f / aspect; out[5] = f; out[10] = (far + near) * nf; out[11] = -1; out[14] = 2 * far * near * nf;
    return out;
  }
  function normalize3(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function lookAt(eye, target, up) {
    const z = normalize3([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
    const x = normalize3(cross(up, z));
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

  function shader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s) || 'shader compile failed';
      gl.deleteShader(s);
      throw new Error(log);
    }
    return s;
  }
  function program(vertexSource, fragmentSource) {
    const p = gl.createProgram();
    const vs = shader(gl.VERTEX_SHADER, vertexSource), fs = shader(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(p) || 'program link failed';
      gl.deleteProgram(p);
      throw new Error(log);
    }
    return p;
  }

  const MESH_VERTEX = `#version 300 es
    precision highp float;
    layout(location=0) in vec3 aPosition;
    layout(location=1) in vec3 aNormal;
    uniform mat4 uProjection, uView, uModel;
    uniform float uTime, uMaterial, uPulse;
    out vec3 vWorld, vNormal, vObject;
    void main(){
      vec3 p=aPosition;
      if(uMaterial<.5){
        float r=length(p.xy);
        float edge=smoothstep(.10,.88,r)*(1.0-smoothstep(.89,1.08,r));
        p.z+=sin(atan(p.y,p.x)*4.0+r*18.0-uTime*.42)*.009*edge*uPulse;
        p.xy+=normalize(p.xy+vec2(.0001))*sin(r*24.0+uTime*.31)*.0028*edge*uPulse;
      }
      vec4 world=uModel*vec4(p,1.0);
      vWorld=world.xyz; vObject=p;
      vNormal=normalize(transpose(inverse(mat3(uModel)))*aNormal);
      gl_Position=uProjection*uView*world;
    }`;

  const MESH_FRAGMENT = `#version 300 es
    precision highp float;
    in vec3 vWorld, vNormal, vObject;
    uniform vec3 uCamera;
    uniform float uTime, uMaterial, uOpacity, uEnergy, uLayer;
    out vec4 fragColor;
    float sat(float v){return clamp(v,0.0,1.0);}
    float band(float v,float c,float w){return exp(-abs(v-c)/max(w,.0001));}
    float linef(float v,float k){return pow(max(0.0,1.0-abs(sin(v))),k);}
    vec3 env(vec3 d){
      d=normalize(d);
      float h=pow(1.0-abs(d.y),4.0);
      float c=pow(sat(dot(d,normalize(vec3(-.45,.30,.84)))),26.0);
      float m=pow(sat(dot(d,normalize(vec3(.54,-.12,.83)))),22.0);
      return vec3(.004,.020,.065)+vec3(.025,.62,1.42)*(h*.22+c*1.06)+vec3(.78,.035,1.34)*(m*.76+h*.075);
    }
    void main(){
      vec3 V=normalize(uCamera-vWorld);
      vec3 N=normalize(vNormal);
      vec3 F=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
      if(!gl_FrontFacing)F=-F;
      N=normalize(mix(N,F,.28));
      float ndv=sat(abs(dot(N,V)));
      float fres=pow(1.0-ndv,4.2);
      vec3 cyan=vec3(.018,.84,1.72);
      vec3 blue=vec3(.010,.26,1.22);
      vec3 violet=vec3(.86,.045,1.52);

      if(uMaterial<.5){
        vec2 p=vObject.xy;
        float r=length(p);
        float a=atan(p.y,p.x);
        float diamond=pow(pow(abs(p.x)/1.12,.62)+pow(abs(p.y)/1.26,.62),1.0/.62);
        float inside=1.0-smoothstep(.44,1.02,diamond);
        float membrane=band(diamond,.20,.020)+band(diamond,.38,.023)*.88+band(diamond,.57,.027)*.72+band(diamond,.76,.032)*.54;
        float rings=band(r,.15,.013)+band(r,.24,.016)*.84+band(r,.34,.020)*.62+band(r,.46,.025)*.40;
        float axes=exp(-abs(p.x)*23.0)+exp(-abs(p.y)*20.0);
        float diagonal=(exp(-abs(p.x-p.y*.88)*21.0)+exp(-abs(p.x+p.y*.88)*21.0))*.40;
        float veins=(linef(a*3.0+diamond*31.0-uTime*.18,17.0)*.76+linef(a*5.0-diamond*37.0+uTime*.13,21.0)*.60+linef((p.x*.8+p.y)*34.0+uTime*.15,23.0)*.34)*smoothstep(.10,.25,r)*(1.0-smoothstep(.80,1.02,diamond));
        float spectrum=.5+.5*sin(a*5.0+r*14.0-uTime*.31+uLayer);
        float purple=pow(.5+.5*cos(a*4.0-r*11.0+uTime*.24),13.0)*smoothstep(.16,.70,r)*(1.0-smoothstep(.72,.98,diamond));
        float coreLight=exp(-r*r*5.2)*(1.0-smoothstep(.32,.88,abs(vObject.z)));
        vec3 I=-V;
        vec3 reflected=env(reflect(I,N));
        vec3 refracted=env(refract(I,N,.68));
        float depth=.10+.34*(1.0-sat(abs(vObject.z)/.48))+.15*(1.0-ndv);
        vec3 absorb=exp(-vec3(1.55,.30,.075)*depth);
        vec3 glass=mix(refracted*absorb,reflected,.16+fres*.74);
        glass+=cyan*(.070+.105*inside+.080*fres)+blue*.040;
        glass+=mix(blue,cyan,spectrum)*(.085+.20*fres);
        glass+=violet*(purple*.24+(1.0-spectrum)*.045);
        vec3 emission=cyan*(membrane*.78+rings*.72+axes*.20+diagonal*.20+veins*.92+coreLight*.30+fres*.22);
        emission+=violet*(purple*.94+veins*.24+membrane*(1.0-spectrum)*.14+diagonal*.05);
        float spec=pow(sat(dot(reflect(-normalize(vec3(-.35,.74,.57)),N),V)),66.0);
        emission+=vec3(1.0,.99,.96)*spec*1.38;
        float alpha=uOpacity*(.31+.26*fres+.12*inside+.10*membrane+.07*veins+.07*spec);
        fragColor=vec4(glass*.96+emission*(.72+.22*uEnergy),sat(alpha));
        return;
      }
      if(uMaterial<1.5){
        float facing=.45+.55*sat(dot(N,V));
        float pulse=.72+.28*sin(uTime*2.15+uLayer*2.0);
        vec3 c=mix(cyan,violet,sat(.5+.5*sin(uTime*.74+uLayer)));
        float core=pow(facing,1.7)+pow(fres,2.0)*1.4;
        fragColor=vec4(c*(1.08+core*2.15+uEnergy*.62)*pulse,uOpacity*(.72+.28*facing));
        return;
      }
      if(uMaterial<2.5){
        float rim=pow(1.0-ndv,2.4);
        vec3 c=mix(cyan,violet,sat(.5+.5*sin(uTime*.55+uLayer*1.9)));
        fragColor=vec4(c*(.92+rim*2.10+uEnergy*.44),uOpacity*(.60+rim*.28));
        return;
      }
      if(uMaterial<3.5){
        vec2 g=vWorld.xz;
        float grid=(1.0-smoothstep(.0,.035,abs(fract(g.x*.42)-.5)))+(1.0-smoothstep(.0,.035,abs(fract(g.y*.42)-.5)));
        float rr=length(g);
        float ring=band(fract(rr*.55-uTime*.055),.5,.06);
        float glow=exp(-rr*.64);
        vec3 c=cyan*(grid*.045+ring*.075)+violet*ring*.025+cyan*glow*.11;
        fragColor=vec4(c,uOpacity*(.08+grid*.025+glow*.09));
        return;
      }
      vec3 c=mix(cyan,violet,sat(.5+.5*sin(vObject.x*8.0+vObject.y*7.0+uTime*.7+uLayer)));
      fragColor=vec4(c*(1.36+uEnergy*.74),uOpacity);
    }`;

  const POINT_VERTEX = `#version 300 es
    precision highp float;
    layout(location=0) in vec3 aPosition;
    uniform mat4 uProjection,uView,uModel;
    uniform float uTime,uPointScale;
    out float vSeed;
    void main(){
      vec3 p=aPosition;
      float seed=fract(sin(dot(p.xy,vec2(12.9898,78.233)))*43758.5453);
      p.x+=sin(uTime*.18+seed*8.0)*.035;
      p.y+=cos(uTime*.15+seed*11.0)*.030;
      vec4 view=uView*uModel*vec4(p,1.0);
      gl_Position=uProjection*view;
      gl_PointSize=clamp(uPointScale*(1.8+seed*2.9)/max(.45,-view.z),1.0,7.0);
      vSeed=seed;
    }`;
  const POINT_FRAGMENT = `#version 300 es
    precision highp float;
    in float vSeed; out vec4 fragColor;
    void main(){
      vec2 p=gl_PointCoord-.5; float d=length(p); if(d>.5)discard;
      float a=smoothstep(.5,.05,d);
      vec3 c=mix(vec3(.08,.58,1.55),vec3(.78,.08,1.40),step(.72,vSeed));
      fragColor=vec4(c*(1.0+a*1.4),a*(.20+vSeed*.38));
    }`;

  const POST_VERTEX = `#version 300 es
    precision highp float;
    const vec2 P[3]=vec2[3](vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));
    out vec2 vUv;
    void main(){vec2 p=P[gl_VertexID];vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
  const POST_FRAGMENT = `#version 300 es
    precision highp float;
    in vec2 vUv; uniform sampler2D uScene; uniform vec2 uTexel; uniform float uBloom;
    out vec4 fragColor;
    vec4 s(vec2 o){return texture(uScene,vUv+o*uTexel);}
    float bright(vec3 c){return smoothstep(.18,1.05,max(c.r,max(c.g,c.b)));}
    void main(){
      vec4 base=texture(uScene,vUv);
      vec3 bloom=vec3(0.0); float ba=0.0;
      vec2 dirs[8]=vec2[8](vec2(1,0),vec2(-1,0),vec2(0,1),vec2(0,-1),vec2(.707,.707),vec2(-.707,.707),vec2(.707,-.707),vec2(-.707,-.707));
      for(int i=0;i<8;i++){
        vec4 a=s(dirs[i]*2.5), b=s(dirs[i]*6.5), c=s(dirs[i]*12.0);
        bloom+=a.rgb*bright(a.rgb)*.055+b.rgb*bright(b.rgb)*.038+c.rgb*bright(c.rgb)*.021;
        ba=max(ba,max(a.a,max(b.a,c.a)));
      }
      vec3 color=base.rgb+bloom*uBloom;
      float alpha=max(base.a,ba*.34);
      fragColor=vec4(color,alpha);
    }`;

  let meshProgram, pointProgram, postProgram;
  try {
    meshProgram = program(MESH_VERTEX, MESH_FRAGMENT);
    pointProgram = program(POINT_VERTEX, POINT_FRAGMENT);
    postProgram = program(POST_VERTEX, POST_FRAGMENT);
  } catch (error) {
    stage.remove();
    root.dataset.fxReferenceCore = 'shader-failed';
    root.dataset.fxReferenceCoreError = String(error.message || error).slice(0, 220);
    return;
  }

  function calculateNormals(positions, indices) {
    const normals = new Float32Array(positions.length);
    for (let i = 0; i < indices.length; i += 3) {
      const ia = indices[i] * 3, ib = indices[i + 1] * 3, ic = indices[i + 2] * 3;
      const abx = positions[ib] - positions[ia], aby = positions[ib + 1] - positions[ia + 1], abz = positions[ib + 2] - positions[ia + 2];
      const acx = positions[ic] - positions[ia], acy = positions[ic + 1] - positions[ia + 1], acz = positions[ic + 2] - positions[ia + 2];
      const nx = aby * acz - abz * acy, ny = abz * acx - abx * acz, nz = abx * acy - aby * acx;
      for (const o of [ia, ib, ic]) { normals[o] += nx; normals[o + 1] += ny; normals[o + 2] += nz; }
    }
    for (let i = 0; i < normals.length; i += 3) {
      const l = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
      normals[i] /= l; normals[i + 1] /= l; normals[i + 2] /= l;
    }
    return normals;
  }
  function referenceRadius(angle) {
    const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle)), p = .62;
    const lp = 1 / Math.pow(Math.pow(c, p) + Math.pow(s, p), 1 / p);
    return .035 + .965 * lp;
  }
  function crystalGeometry(angularSegments, radialSegments) {
    const positions = [], indices = [], lineIndices = [], sides = [];
    for (const sign of [1, -1]) {
      const center = positions.length / 3;
      sides.push(center);
      positions.push(0, 0, sign * .49);
      for (let ring = 1; ring <= radialSegments; ring += 1) {
        const t = ring / radialSegments;
        const lens = Math.pow(1 - t, 1.18);
        for (let seg = 0; seg < angularSegments; seg += 1) {
          const a = seg / angularSegments * Math.PI * 2;
          const radius = referenceRadius(a);
          const cardinal = Math.pow(Math.abs(Math.cos(a * 2)), 4.4);
          const shoulder = Math.sin(Math.PI * t) * (.020 + .030 * cardinal);
          const x = Math.cos(a) * radius * t * 1.12;
          const y = Math.sin(a) * radius * t * 1.26;
          const z = sign * (.025 + .455 * lens * (.74 + .26 * cardinal) + shoulder);
          positions.push(x, y, z);
        }
      }
      const first = center + 1;
      for (let seg = 0; seg < angularSegments; seg += 1) {
        const next = (seg + 1) % angularSegments;
        if (sign > 0) indices.push(center, first + seg, first + next);
        else indices.push(center, first + next, first + seg);
      }
      for (let ring = 1; ring < radialSegments; ring += 1) {
        const current = center + 1 + (ring - 1) * angularSegments;
        const nextRing = current + angularSegments;
        for (let seg = 0; seg < angularSegments; seg += 1) {
          const next = (seg + 1) % angularSegments;
          if (sign > 0) indices.push(current + seg, nextRing + seg, nextRing + next, current + seg, nextRing + next, current + next);
          else indices.push(current + seg, nextRing + next, nextRing + seg, current + seg, current + next, nextRing + next);
        }
      }
    }
    const frontEdge = sides[0] + 1 + (radialSegments - 1) * angularSegments;
    const backEdge = sides[1] + 1 + (radialSegments - 1) * angularSegments;
    for (let seg = 0; seg < angularSegments; seg += 1) {
      const next = (seg + 1) % angularSegments;
      indices.push(frontEdge + seg, backEdge + seg, backEdge + next, frontEdge + seg, backEdge + next, frontEdge + next);
    }
    const front = sides[0];
    for (const ring of [2, 4, 7, 10, radialSegments]) {
      if (ring > radialSegments) continue;
      const start = front + 1 + (ring - 1) * angularSegments;
      for (let seg = 0; seg < angularSegments; seg += 1) lineIndices.push(start + seg, start + (seg + 1) % angularSegments);
    }
    const step = Math.max(6, Math.round(angularSegments / 16));
    for (let seg = 0; seg < angularSegments; seg += step) {
      let previous = front;
      for (let ring = 1; ring <= radialSegments; ring += 1) {
        const current = front + 1 + (ring - 1) * angularSegments + seg;
        lineIndices.push(previous, current); previous = current;
      }
    }
    return { positions: new Float32Array(positions), normals: calculateNormals(positions, indices), indices: new Uint16Array(indices), lineIndices: new Uint16Array(lineIndices) };
  }
  function sphereGeometry(longitudes, latitudes) {
    const positions = [], normals = [], indices = [];
    for (let lat = 0; lat <= latitudes; lat += 1) {
      const v = lat / latitudes, phi = v * Math.PI;
      for (let lon = 0; lon <= longitudes; lon += 1) {
        const u = lon / longitudes, theta = u * Math.PI * 2;
        const x = Math.sin(phi) * Math.cos(theta), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(theta);
        positions.push(x, y, z); normals.push(x, y, z);
      }
    }
    for (let lat = 0; lat < latitudes; lat += 1) for (let lon = 0; lon < longitudes; lon += 1) {
      const a = lat * (longitudes + 1) + lon, b = a + longitudes + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
  }
  function torusGeometry(radialSegments, tubeSegments) {
    const positions = [], normals = [], indices = [], radius = 1, tube = .0135;
    for (let r = 0; r <= radialSegments; r += 1) {
      const u = r / radialSegments * Math.PI * 2, cu = Math.cos(u), su = Math.sin(u);
      for (let s = 0; s <= tubeSegments; s += 1) {
        const v = s / tubeSegments * Math.PI * 2, cv = Math.cos(v), sv = Math.sin(v);
        positions.push((radius + tube * cv) * cu, (radius + tube * cv) * su, tube * sv);
        normals.push(cv * cu, cv * su, sv);
      }
    }
    for (let r = 0; r < radialSegments; r += 1) for (let s = 0; s < tubeSegments; s += 1) {
      const a = r * (tubeSegments + 1) + s, b = a + tubeSegments + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
  }
  function planeGeometry() {
    return {
      positions: new Float32Array([-1,0,-1, 1,0,-1, 1,0,1, -1,0,1]),
      normals: new Float32Array([0,1,0, 0,1,0, 0,1,0, 0,1,0]),
      indices: new Uint16Array([0,1,2,0,2,3])
    };
  }
  function particlesGeometry(count) {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const a = i * 2.399963 + Math.sin(i * 1.17) * .31;
      const r = .55 + (i % 41) / 41 * 1.72;
      data[i * 3] = Math.cos(a) * r * 1.18;
      data[i * 3 + 1] = Math.sin(a) * r * 1.10;
      data[i * 3 + 2] = -.72 + ((i * 13) % 47) / 47 * 1.44;
    }
    return data;
  }
  function uploadMesh(g) {
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const position = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, position); gl.bufferData(gl.ARRAY_BUFFER, g.positions, gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    const normal = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, normal); gl.bufferData(gl.ARRAY_BUFFER, g.normals, gl.STATIC_DRAW); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    const index = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.indices, gl.STATIC_DRAW);
    let lineIndex = null;
    if (g.lineIndices?.length) { lineIndex = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndex); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.lineIndices, gl.STATIC_DRAW); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); }
    gl.bindVertexArray(null);
    return { vao, index, lineIndex, count: g.indices.length, lineCount: g.lineIndices?.length || 0 };
  }
  function uploadParticles(data) {
    const vao = gl.createVertexArray(), buffer = gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null); return { vao, count: data.length / 3 };
  }

  const crystal = uploadMesh(crystalGeometry(mobile ? 80 : 112, mobile ? 14 : 18));
  const sphere = uploadMesh(sphereGeometry(mobile ? 24 : 34, mobile ? 16 : 22));
  const torus = uploadMesh(torusGeometry(mobile ? 44 : 64, mobile ? 7 : 10));
  const plane = uploadMesh(planeGeometry());
  const particles = uploadParticles(particlesGeometry(mobile ? 120 : 190));

  const meshLoc = {
    projection: gl.getUniformLocation(meshProgram, 'uProjection'), view: gl.getUniformLocation(meshProgram, 'uView'), model: gl.getUniformLocation(meshProgram, 'uModel'), camera: gl.getUniformLocation(meshProgram, 'uCamera'), time: gl.getUniformLocation(meshProgram, 'uTime'), material: gl.getUniformLocation(meshProgram, 'uMaterial'), opacity: gl.getUniformLocation(meshProgram, 'uOpacity'), energy: gl.getUniformLocation(meshProgram, 'uEnergy'), layer: gl.getUniformLocation(meshProgram, 'uLayer'), pulse: gl.getUniformLocation(meshProgram, 'uPulse')
  };
  const pointLoc = {
    projection: gl.getUniformLocation(pointProgram, 'uProjection'), view: gl.getUniformLocation(pointProgram, 'uView'), model: gl.getUniformLocation(pointProgram, 'uModel'), time: gl.getUniformLocation(pointProgram, 'uTime'), pointScale: gl.getUniformLocation(pointProgram, 'uPointScale')
  };
  const postLoc = { scene: gl.getUniformLocation(postProgram, 'uScene'), texel: gl.getUniformLocation(postProgram, 'uTexel'), bloom: gl.getUniformLocation(postProgram, 'uBloom') };

  let framebuffer = null, colorTexture = null, depthBuffer = null;
  let renderScale = 1;
  let width = 1, height = 1;
  function destroyTarget() {
    if (framebuffer) gl.deleteFramebuffer(framebuffer);
    if (colorTexture) gl.deleteTexture(colorTexture);
    if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
    framebuffer = colorTexture = depthBuffer = null;
  }
  function resize(force) {
    const dprCap = mobile ? 1.35 : 1.8;
    const dpr = Math.min(devicePixelRatio || 1, dprCap) * renderScale;
    const nextW = Math.max(2, Math.round(innerWidth * dpr));
    const nextH = Math.max(2, Math.round(innerHeight * dpr));
    if (!force && nextW === width && nextH === height) return;
    width = nextW; height = nextH; canvas.width = width; canvas.height = height;
    destroyTarget();
    colorTexture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, colorTexture); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    depthBuffer = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    framebuffer = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('reference-core-framebuffer-incomplete');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    root.dataset.fxReferenceCorePixels = width + 'x' + height;
  }

  function setMeshCommon(projection, view, camera, time, energy) {
    gl.useProgram(meshProgram);
    gl.uniformMatrix4fv(meshLoc.projection, false, projection); gl.uniformMatrix4fv(meshLoc.view, false, view); gl.uniform3fv(meshLoc.camera, camera); gl.uniform1f(meshLoc.time, time); gl.uniform1f(meshLoc.energy, energy); gl.uniform1f(meshLoc.pulse, reduced.matches ? .12 : 1);
  }
  function drawMesh(mesh, model, material, opacity, layer) {
    gl.uniformMatrix4fv(meshLoc.model, false, model); gl.uniform1f(meshLoc.material, material); gl.uniform1f(meshLoc.opacity, opacity); gl.uniform1f(meshLoc.layer, layer);
    gl.bindVertexArray(mesh.vao); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index); gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  }
  function drawCrystalLines(model, opacity, layer) {
    if (!crystal.lineIndex) return;
    gl.uniformMatrix4fv(meshLoc.model, false, model); gl.uniform1f(meshLoc.material, 4); gl.uniform1f(meshLoc.opacity, opacity); gl.uniform1f(meshLoc.layer, layer);
    gl.bindVertexArray(crystal.vao); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, crystal.lineIndex); gl.drawElements(gl.LINES, crystal.lineCount, gl.UNSIGNED_SHORT, 0); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, crystal.index);
  }

  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  addEventListener('pointermove', event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    targetX = clamp(event.clientX / Math.max(1, innerWidth) * 2 - 1, -1, 1);
    targetY = clamp(event.clientY / Math.max(1, innerHeight) * 2 - 1, -1, 1);
  }, { passive: true });

  let active = true, destroyed = false, frameHandle = 0, last = performance.now(), ema = 16.7, samples = 0;
  function updateVisibility() {
    const rect = hero.getBoundingClientRect(), vh = Math.max(1, innerHeight);
    const visible = rect.bottom > -vh * .18 && rect.top < vh * .96;
    const fade = clamp((rect.bottom + vh * .12) / (vh * .72), 0, 1);
    active = visible && !document.hidden;
    stage.dataset.active = String(visible);
    stage.style.setProperty('--fx-reference-opacity', fade.toFixed(3));
  }
  addEventListener('scroll', updateVisibility, { passive: true });
  addEventListener('resize', () => { resize(false); updateVisibility(); }, { passive: true });
  document.addEventListener('visibilitychange', updateVisibility);

  function retireLegacyStages() {
    document.querySelectorAll('.fx-core-real3d-stage').forEach(oldStage => {
      if (oldStage === stage) return;
      const oldCanvas = oldStage.querySelector('canvas');
      try {
        const oldGl = oldCanvas?.getContext('webgl2');
        oldGl?.getExtension('WEBGL_lose_context')?.loseContext();
      } catch (_) {}
      oldStage.remove();
    });
  }

  function render(now) {
    if (destroyed) return;
    frameHandle = requestAnimationFrame(render);
    const dt = Math.min(50, now - last || 16.7); last = now;
    if (!active) return;

    ema = ema * .94 + dt * .06; samples += 1;
    if (samples % 180 === 0) {
      const before = renderScale;
      if (ema > 19.8) renderScale = Math.max(.68, renderScale * .88);
      else if (ema < 12.2) renderScale = Math.min(1, renderScale * 1.06);
      if (Math.abs(before - renderScale) > .025) resize(true);
      root.dataset.fxReferenceCoreFrameMs = ema.toFixed(2);
      root.dataset.fxReferenceCoreRenderScale = renderScale.toFixed(2);
    }

    const motion = reduced.matches ? .13 : 1;
    const time = now * .001 * motion;
    pointerX += (targetX - pointerX) * .035;
    pointerY += (targetY - pointerY) * .035;

    const aspect = width / Math.max(1, height);
    const fov = (mobile ? 39 : 38) * Math.PI / 180;
    const cameraZ = mobile ? 5.25 : 5.15;
    const horizontalHalf = Math.tan(fov / 2) * cameraZ * aspect;
    const baseX = mobile ? 0 : horizontalHalf * .37;
    const baseY = mobile ? .18 : .02;
    const scale = mobile ? .84 : 1.02;
    const energy = .78 + Math.sin(time * 1.34) * .10;
    const camera = new Float32Array([pointerX * .10, -pointerY * .075, cameraZ]);
    const projection = perspective(fov, aspect, .1, 40);
    const view = lookAt(camera, [0, 0, 0], [0, 1, 0]);
    const driftX = Math.sin(time * .73) * .018, driftY = Math.cos(time * .61) * .020;
    const shellModel = compose(
      translation(baseX + driftX, baseY + driftY, 0),
      rotationZ(Math.sin(time * .19) * .024),
      rotationY(Math.sin(time * .27) * .16 + pointerX * .10),
      rotationX(Math.cos(time * .23) * .045 - pointerY * .055),
      scaling(scale * (1 + Math.sin(time * .84) * .008), scale, scale)
    );
    const coreOffset = [baseX + Math.sin(time * 1.09) * .036, baseY + Math.cos(time * .91) * .031, Math.sin(time * .67) * .042];

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.CULL_FACE);

    setMeshCommon(projection, view, camera, time, energy);
    gl.depthMask(false);
    const floorModel = compose(translation(baseX, baseY - 1.40 * scale, -.18), scaling(4.8, 1, 4.8));
    drawMesh(plane, floorModel, 3, .78, 0);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    const ringPulse = 1 + Math.sin(time * 1.4) * .015;
    drawMesh(torus, compose(translation(...coreOffset), rotationX(.52 + time * .11), rotationY(.26 + time * .13), rotationZ(time * .24), scaling(.36 * ringPulse, .36 * ringPulse, .36 * ringPulse)), 2, .40, .2);
    drawMesh(torus, compose(translation(...coreOffset), rotationX(1.02 + time * .16), rotationY(-.38 + time * .10), rotationZ(-time * .18), scaling(.275, .275, .275)), 2, .44, 1.4);
    drawMesh(torus, compose(translation(...coreOffset), rotationX(-.68 + time * .14), rotationY(.74 - time * .13), rotationZ(time * .12), scaling(.195, .195, .195)), 2, .50, 2.6);
    drawMesh(sphere, compose(translation(...coreOffset), scaling(.145, .145, .145)), 1, .16, 1.0);
    const reactorScale = .078 + Math.sin(time * 2.1) * .005;
    drawMesh(sphere, compose(translation(...coreOffset), scaling(reactorScale, reactorScale, reactorScale)), 1, .96, 2.0);

    gl.useProgram(pointProgram);
    gl.uniformMatrix4fv(pointLoc.projection, false, projection); gl.uniformMatrix4fv(pointLoc.view, false, view); gl.uniformMatrix4fv(pointLoc.model, false, compose(translation(baseX, baseY, -.12), rotationZ(time * .026), scaling(scale, scale, scale))); gl.uniform1f(pointLoc.time, time); gl.uniform1f(pointLoc.pointScale, Math.min(devicePixelRatio || 1, 1.6) * 8.5);
    gl.bindVertexArray(particles.vao); gl.drawArrays(gl.POINTS, 0, particles.count);

    gl.useProgram(meshProgram); setMeshCommon(projection, view, camera, time, energy);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.FRONT); drawMesh(crystal, shellModel, 0, .70, .35);
    gl.cullFace(gl.BACK); drawMesh(crystal, shellModel, 0, .94, .95);
    gl.disable(gl.CULL_FACE);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); drawCrystalLines(shellModel, .44 + energy * .08, 1.7);
    gl.depthMask(true);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
    gl.useProgram(postProgram); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, colorTexture); gl.uniform1i(postLoc.scene, 0); gl.uniform2f(postLoc.texel, 1 / width, 1 / height); gl.uniform1f(postLoc.bloom, mobile ? .82 : .94); gl.bindVertexArray(null); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frameHandle);
    destroyTarget();
    try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (_) {}
    stage.remove();
  }
  addEventListener('pagehide', destroy, { once: true });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); root.dataset.fxReferenceCore = 'context-lost';
  });

  try { resize(true); } catch (error) {
    destroy(); root.dataset.fxReferenceCore = 'framebuffer-failed'; root.dataset.fxReferenceCoreError = String(error.message || error).slice(0, 220); return;
  }
  updateVisibility();
  root.dataset.fxCoreReal3dStartup = 'ready-v22-mobile-safe';
  root.dataset.fxCoreReal3d = 'ready-v20';
  root.dataset.fxCoreReal3dRevision = 'ready-v26';
  root.dataset.fxCoreRendererRevision = 'native-webgl2-reference-crystal-v26';
  root.dataset.fxReferenceCore = 'ready-v26';
  root.dataset.fxReferenceCoreGeometry = 'true-indexed-four-tip-concave-crystal';
  root.dataset.fxReferenceCoreDepth = 'depth-buffer-perspective';
  root.dataset.fxReferenceCoreAnimation = 'independent-shell-reactor-orbits';
  root.dataset.fxReferenceCoreVisual = 'reference-glass-calibration-2';
  retireLegacyStages();
  const observer = new MutationObserver(retireLegacyStages);
  observer.observe(document.body, { childList: true });
  setTimeout(() => observer.disconnect(), 3500);
  dispatchEvent(new CustomEvent('formatx:referencecoreready', { detail: { version: VERSION, renderer: 'native-webgl2', imageBacked: false } }));
  frameHandle = requestAnimationFrame(render);
}());

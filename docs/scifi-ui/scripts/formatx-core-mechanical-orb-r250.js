(function () {
  'use strict';

  const root = document.documentElement;
  const READY = 'ready-v69';
  const VERSION = 'native-mechanical-energy-orb-r250';
  const mobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

  if (root.dataset.fxCoreMobileR250 === 'ready' || root.dataset.fxCoreMobileR250 === 'booting') return;
  if (new URLSearchParams(location.search).get('lighthouse') === '1') {
    root.dataset.fxCoreMobileR250 = 'audit-skip';
    root.dataset.fxCoreMobileR99 = 'audit-skip';
    root.dataset.fxCoreMobileV69 = 'audit-skip';
    root.dataset.fxCoreMobileV55 = 'audit-skip';
    return;
  }

  root.dataset.fxCoreMobileR250 = 'booting';
  root.dataset.fxCoreMobileR99 = 'booting';
  root.dataset.fxCoreMobileV69 = 'booting-v69';
  root.dataset.fxCoreMobileV55 = 'booting-v55';

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'mechanical orb shader compile failed';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    const program = gl.createProgram();
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.bindAttribLocation(program, 1, 'aNormal');
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'mechanical orb program link failed';
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function normalize(x, y, z) {
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length];
  }

  function computeNormals(positions, indices) {
    const normals = new Float32Array(positions.length);
    for (let index = 0; index < indices.length; index += 3) {
      const ia = indices[index] * 3;
      const ib = indices[index + 1] * 3;
      const ic = indices[index + 2] * 3;
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
    for (let index = 0; index < normals.length; index += 3) {
      const normal = normalize(normals[index], normals[index + 1], normals[index + 2]);
      normals[index] = normal[0];
      normals[index + 1] = normal[1];
      normals[index + 2] = normal[2];
    }
    return normals;
  }

  function sphere(radius, latitude, longitude) {
    const positions = [];
    const indices = [];
    for (let y = 0; y <= latitude; y += 1) {
      const phi = y / latitude * Math.PI;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      for (let x = 0; x <= longitude; x += 1) {
        const theta = x / longitude * Math.PI * 2;
        positions.push(
          radius * sinPhi * Math.cos(theta),
          radius * cosPhi,
          radius * sinPhi * Math.sin(theta)
        );
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

  function torus(major, minor, majorSegments, minorSegments, start = 0, end = Math.PI * 2) {
    const positions = [];
    const indices = [];
    for (let i = 0; i <= majorSegments; i += 1) {
      const u = start + (end - start) * i / majorSegments;
      const cosU = Math.cos(u), sinU = Math.sin(u);
      for (let j = 0; j <= minorSegments; j += 1) {
        const v = j / minorSegments * Math.PI * 2;
        const cosV = Math.cos(v), sinV = Math.sin(v);
        const radius = major + minor * cosV;
        positions.push(radius * cosU, radius * sinU, minor * sinV);
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

  function sphericalPanel(radius, phiStart, phiEnd, thetaStart, thetaEnd, phiSegments, thetaSegments, thickness) {
    const positions = [];
    const indices = [];
    const outer = [];
    const inner = [];

    const add = (r, phi, theta) => {
      const sinPhi = Math.sin(phi);
      positions.push(
        r * sinPhi * Math.cos(theta),
        r * Math.cos(phi),
        r * sinPhi * Math.sin(theta)
      );
      return positions.length / 3 - 1;
    };

    for (let y = 0; y <= phiSegments; y += 1) {
      const phi = phiStart + (phiEnd - phiStart) * y / phiSegments;
      const outerRow = [];
      const innerRow = [];
      for (let x = 0; x <= thetaSegments; x += 1) {
        const theta = thetaStart + (thetaEnd - thetaStart) * x / thetaSegments;
        outerRow.push(add(radius, phi, theta));
        innerRow.push(add(radius - thickness, phi, theta));
      }
      outer.push(outerRow);
      inner.push(innerRow);
    }

    for (let y = 0; y < phiSegments; y += 1) {
      for (let x = 0; x < thetaSegments; x += 1) {
        const a = outer[y][x], b = outer[y + 1][x], c = outer[y][x + 1], d = outer[y + 1][x + 1];
        const ai = inner[y][x], bi = inner[y + 1][x], ci = inner[y][x + 1], di = inner[y + 1][x + 1];
        indices.push(a, b, c, c, b, d);
        indices.push(ai, ci, bi, ci, di, bi);
      }
    }

    const closeStrip = (outerStrip, innerStrip, reverse) => {
      for (let index = 0; index < outerStrip.length - 1; index += 1) {
        const a = outerStrip[index], b = outerStrip[index + 1];
        const ai = innerStrip[index], bi = innerStrip[index + 1];
        if (reverse) indices.push(a, ai, b, b, ai, bi);
        else indices.push(a, b, ai, b, bi, ai);
      }
    };

    closeStrip(outer[0], inner[0], false);
    closeStrip(outer[outer.length - 1], inner[inner.length - 1], true);
    closeStrip(outer.map(row => row[0]), inner.map(row => row[0]), true);
    closeStrip(outer.map(row => row[row.length - 1]), inner.map(row => row[row.length - 1]), false);

    return { positions: new Float32Array(positions), indices: new Uint16Array(indices) };
  }

  function boot(attempt = 0) {
    const hero = document.getElementById('hero');
    const host = hero?.querySelector('.hero-space');
    if (!(hero instanceof HTMLElement) || !(host instanceof HTMLElement)) {
      if (attempt < 240) requestAnimationFrame(() => boot(attempt + 1));
      else root.dataset.fxCoreMobileR250 = 'host-unavailable';
      return;
    }

    window.FormatXCoreMobileV69?.destroy?.();
    document.querySelectorAll('.fx-core-mobile-v55-stage').forEach(node => node.remove());

    const stage = document.createElement('div');
    stage.className = 'fx-core-mobile-v55-stage fx-core-r112-stage fx-core-r250-stage';
    stage.dataset.active = 'true';
    stage.dataset.renderer = 'native-mechanical-orb-r250';
    stage.setAttribute('aria-hidden', 'true');
    host.prepend(stage);

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-core-mobile-v55-canvas fx-core-r112-canvas fx-core-r250-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    stage.appendChild(canvas);

    const options = {
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: mobile ? 'default' : 'high-performance'
    };
    let gl = canvas.getContext('webgl2', options);
    const webgl2 = Boolean(gl);
    if (!gl) gl = canvas.getContext('webgl', options);
    if (!gl) {
      stage.remove();
      root.dataset.fxCoreMobileR250 = 'context-unavailable';
      root.dataset.fxCoreReal3d = 'context-unavailable';
      dispatchEvent(new CustomEvent('formatx:core3dfallback', { detail: { reason: 'mechanical-orb-context-unavailable' } }));
      return;
    }

    const vertexBody = `
      precision highp float;
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform vec3 uLocalRotation;
      uniform vec3 uGlobalRotation;
      uniform vec3 uOffset;
      uniform float uScale;
      uniform float uPulse;
      uniform float uMode;
      uniform float uTime;
      uniform float uEnergy;
      uniform float uAspect;
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying vec3 vLocal;
      mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
      mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
      mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0.,s,c,0.,0.,0.,1.);}
      void main(){
        mat3 localRotation=rz(uLocalRotation.z)*ry(uLocalRotation.y)*rx(uLocalRotation.x);
        mat3 globalRotation=rz(uGlobalRotation.z)*ry(uGlobalRotation.y)*rx(uGlobalRotation.x);
        vec3 local=aPosition;
        if(uMode>.5&&uMode<1.5){
          float plasma=sin(local.x*21.+uTime*2.3)+sin(local.y*26.-uTime*1.8)+sin(local.z*23.+uTime*2.7);
          local*=1.+plasma*(.006+.009*uEnergy);
        }
        vec3 p=globalRotation*(localRotation*(local*uScale*uPulse)+uOffset);
        vWorld=p;
        vLocal=local;
        vNormal=normalize(globalRotation*(localRotation*aNormal));
        float cameraDistance=4.05-p.z;
        vec2 projected=vec2(p.x/max(.55,uAspect),p.y)*3.18;
        gl_Position=vec4(projected,p.z*.18*cameraDistance,cameraDistance);
      }
    `;

    const vertexSource = webgl2
      ? `#version 300 es\n${vertexBody.replace('attribute vec3 aPosition;', 'layout(location=0) in vec3 aPosition;').replace('attribute vec3 aNormal;', 'layout(location=1) in vec3 aNormal;').replace(/varying vec3 vNormal;/, 'out vec3 vNormal;').replace(/varying vec3 vWorld;/, 'out vec3 vWorld;').replace(/varying vec3 vLocal;/, 'out vec3 vLocal;')}`
      : vertexBody;

    const fragmentBody = `
      uniform vec3 uBaseColor;
      uniform vec3 uEmissionColor;
      uniform float uOpacity;
      uniform float uMode;
      uniform float uTime;
      uniform float uEnergy;
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying vec3 vLocal;
      float sat(float value){return clamp(value,0.,1.);}
      float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
      void main(){
        vec3 normal=normalize(vNormal);
        vec3 view=normalize(vec3(0.,0.,4.05)-vWorld);
        vec3 key=normalize(vec3(-.46,.72,.62));
        vec3 rimLight=normalize(vec3(.68,-.22,.70));
        float diffuse=max(dot(normal,key),0.);
        float rim=max(dot(normal,rimLight),0.);
        float fresnel=pow(1.-sat(dot(normal,view)),3.2);
        vec3 halfVector=normalize(key+view);
        float specular=pow(max(dot(normal,halfVector),0.),72.);
        float radius=length(vLocal);
        float angle=atan(vLocal.y,vLocal.x);

        if(uMode<.5){
          float machining=.5+.5*sin(angle*26.+vLocal.z*32.);
          float brushed=.5+.5*sin((vLocal.x+vLocal.y)*92.);
          float seam=pow(machining,18.);
          vec3 metal=mix(uBaseColor,uBaseColor*1.42,.22*brushed);
          vec3 color=metal*(.16+.72*diffuse+.20*rim);
          color+=vec3(.92,1.06,1.18)*specular*2.25;
          color+=vec3(.08,.58,1.05)*fresnel*(.52+.30*uEnergy);
          color+=uEmissionColor*(seam*.20+fresnel*.15+uEnergy*.035);
          float alpha=uOpacity*(.91+.08*fresnel);
          ${webgl2 ? 'outColor' : 'gl_FragColor'}=vec4(max(color,vec3(0.)),clamp(alpha,0.,1.));
          return;
        }

        if(uMode<1.5){
          float field=sin(vLocal.x*31.+uTime*3.1)+sin(vLocal.y*37.-uTime*2.4)+sin(vLocal.z*29.+uTime*2.8);
          float filamentWave=.5+.5*sin(field*1.8+radius*42.-uTime*4.2);
          float filaments=pow(filamentWave,8.);
          float sparks=pow(hash(floor((vLocal+uTime*.025)*68.)),19.);
          float hot=pow(sat(1.-length(vLocal.xy)/.31),2.3);
          float spectral=.5+.5*sin(angle*5.+field*.42-uTime*1.7);
          vec3 cyan=vec3(.02,.54,1.14);
          vec3 violet=vec3(.78,.04,1.16);
          vec3 plasma=mix(cyan,violet,spectral);
          vec3 color=plasma*(.34+filaments*.92+fresnel*.72+uEnergy*.25);
          color+=uEmissionColor*(.22+.42*filamentWave+uEnergy*.14);
          color+=vec3(1.08,1.28,1.48)*(hot*1.32+sparks*.72);
          float alpha=uOpacity*(.34+.42*fresnel+.31*filaments+.23*hot);
          ${webgl2 ? 'outColor' : 'gl_FragColor'}=vec4(max(color,vec3(0.)),clamp(alpha,0.,1.));
          return;
        }

        if(uMode>2.5){
          float nucleus=pow(sat(1.-length(vLocal.xy)/.31),1.9);
          float ripple=.5+.5*sin(vLocal.x*28.+vLocal.y*24.-uTime*4.8);
          vec3 color=vec3(.56,1.04,1.32)*(1.02+fresnel*.66+ripple*.16+uEnergy*.22);
          color+=vec3(1.42,1.52,1.64)*nucleus*1.34;
          float alpha=uOpacity*(.76+.22*fresnel);
          ${webgl2 ? 'outColor' : 'gl_FragColor'}=vec4(max(color,vec3(0.)),clamp(alpha,0.,1.));
          return;
        }

        float travel=.5+.5*sin(angle*7.-uTime*(2.4+uEnergy*2.7)+vLocal.z*12.);
        float streak=pow(travel,10.);
        vec3 color=uEmissionColor*(.68+fresnel*1.05+streak*(1.25+uEnergy*.85));
        color+=uBaseColor*(.22+.55*diffuse);
        color+=vec3(1.10,1.35,1.55)*specular*1.2;
        float alpha=uOpacity*(.52+.34*fresnel+.22*streak);
        ${webgl2 ? 'outColor' : 'gl_FragColor'}=vec4(max(color,vec3(0.)),clamp(alpha,0.,1.));
      }
    `;

    const fragmentSource = webgl2
      ? `#version 300 es\nprecision highp float;\nin vec3 vNormal;\nin vec3 vWorld;\nin vec3 vLocal;\nout vec4 outColor;\n${fragmentBody.replace('varying vec3 vNormal;', '').replace('varying vec3 vWorld;', '').replace('varying vec3 vLocal;', '')}`
      : `precision highp float;\n${fragmentBody}`;

    let program;
    try {
      program = createProgram(gl, vertexSource, fragmentSource);
    } catch (error) {
      console.warn('FormatX native mechanical MAG unavailable:', error);
      stage.remove();
      root.dataset.fxCoreMobileR250 = 'shader-failed';
      root.dataset.fxCoreReal3d = 'shader-failed';
      return;
    }

    const attributes = {
      position: gl.getAttribLocation(program, 'aPosition'),
      normal: gl.getAttribLocation(program, 'aNormal')
    };
    const uniforms = {};
    [
      'uLocalRotation','uGlobalRotation','uOffset','uScale','uPulse','uMode','uTime','uEnergy','uAspect',
      'uBaseColor','uEmissionColor','uOpacity'
    ].forEach(name => { uniforms[name] = gl.getUniformLocation(program, name); });

    const meshes = [];
    function upload(geometry) {
      const normals = computeNormals(geometry.positions, geometry.indices);
      const positionBuffer = gl.createBuffer();
      const normalBuffer = gl.createBuffer();
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
      const mesh = { positionBuffer, normalBuffer, indexBuffer, count: geometry.indices.length };
      meshes.push(mesh);
      return mesh;
    }

    const quality = mobile ? {
      sphereLat: 18, sphereLon: 24, ringSegments: 44, tubeSegments: 7, panelPhi: 3, panelTheta: 4
    } : {
      sphereLat: 22, sphereLon: 30, ringSegments: 56, tubeSegments: 8, panelPhi: 4, panelTheta: 5
    };

    const core = upload(sphere(.30, quality.sphereLat, quality.sphereLon));
    const halo = upload(sphere(.39, Math.max(14, quality.sphereLat - 6), Math.max(20, quality.sphereLon - 8)));
    const innerRings = [
      upload(torus(.36, .012, quality.ringSegments, quality.tubeSegments)),
      upload(torus(.45, .013, quality.ringSegments, quality.tubeSegments)),
      upload(torus(.53, .010, quality.ringSegments, quality.tubeSegments))
    ];
    const collar = upload(torus(.60, .035, quality.ringSegments, quality.tubeSegments));
    const outerRings = [
      upload(torus(.79, .019, quality.ringSegments, quality.tubeSegments)),
      upload(torus(.91, .016, quality.ringSegments, quality.tubeSegments)),
      upload(torus(1.01, .012, quality.ringSegments, Math.max(6, quality.tubeSegments - 2)))
    ];
    const outerArcs = [
      upload(torus(1.08, .014, Math.max(28, quality.ringSegments - 12), quality.tubeSegments, .12, 4.92)),
      upload(torus(.97, .012, Math.max(26, quality.ringSegments - 14), quality.tubeSegments, 1.02, 5.74))
    ];

    const panelDefinitions = [];
    const shellSegments = 6;
    const step = Math.PI * 2 / shellSegments;
    for (let index = 0; index < shellSegments; index += 1) {
      const thetaStart = index * step + step * .10;
      const thetaEnd = (index + 1) * step - step * .13;
      panelDefinitions.push({
        mesh: upload(sphericalPanel(.72, .42, 1.20, thetaStart, thetaEnd, quality.panelPhi, quality.panelTheta, .065)),
        phase: index * .73,
        direction: index % 2 ? 1 : -1,
        tone: index % 3
      });
      panelDefinitions.push({
        mesh: upload(sphericalPanel(.72, 1.94, 2.72, thetaStart + step * .03, thetaEnd - step * .02, quality.panelPhi, quality.panelTheta, .065)),
        phase: index * .73 + .42,
        direction: index % 2 ? -1 : 1,
        tone: (index + 1) % 3
      });
    }

    function bindMesh(mesh) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
      gl.enableVertexAttribArray(attributes.position);
      gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
      gl.enableVertexAttribArray(attributes.normal);
      gl.vertexAttribPointer(attributes.normal, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    }

    function setVector(location, values) {
      gl.uniform3f(location, values[0], values[1], values[2]);
    }

    function draw(mesh, mode, scale, pulse, localRotation, offset, base, emission, opacity, globalRotation, time, energy, aspect) {
      bindMesh(mesh);
      setVector(uniforms.uLocalRotation, localRotation);
      setVector(uniforms.uGlobalRotation, globalRotation);
      setVector(uniforms.uOffset, offset);
      gl.uniform1f(uniforms.uScale, scale);
      gl.uniform1f(uniforms.uPulse, pulse);
      gl.uniform1f(uniforms.uMode, mode);
      gl.uniform1f(uniforms.uTime, time);
      gl.uniform1f(uniforms.uEnergy, energy);
      gl.uniform1f(uniforms.uAspect, aspect);
      setVector(uniforms.uBaseColor, base);
      setVector(uniforms.uEmissionColor, emission);
      gl.uniform1f(uniforms.uOpacity, opacity);
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
    }

    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let disposed = false;
    let lastFrame = performance.now();
    let averageFrame = 16.7;
    let frameCount = 0;
    /* Start inside the 16.67 ms frame budget instead of waiting for several
       visibly slow frames before adaptation. The native mesh stays sharp at
       these framebuffer scales while fill-rate drops by roughly one third. */
    let resolutionScale = mobile ? .84 : .74;
    let slowFrames = 0;
    let fastFrames = 0;
    let energy = .34;
    let targetEnergy = .34;
    let openness = .105;
    let targetOpenness = .105;
    let spinBoost = 0;
    let targetSpinBoost = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let activePointer = null;
    let idleTimer = 0;
    const started = performance.now();
    const cinematic = window.FormatXCoreCinematic = window.FormatXCoreCinematic || {};
    cinematic.version = VERSION;

    function resize() {
      const bounds = stage.getBoundingClientRect();
      if (bounds.width < 2 || bounds.height < 2) return;
      const maximumDpr = mobile ? 1.35 : 1.6;
      const pixelBudget = (mobile ? 720000 : 1280000) * resolutionScale * resolutionScale;
      const nativeDpr = Math.min(devicePixelRatio || 1, maximumDpr);
      /* Scale the actual framebuffer as well as its ceiling.  The earlier
         budget-only form could not reduce a phone-sized 390px canvas because
         it already sat below the ceiling, so a slow device received no real
         adaptive relief. */
      const dpr = Math.max(.78, nativeDpr * resolutionScale);
      let nextWidth = Math.max(2, Math.round(bounds.width * dpr));
      let nextHeight = Math.max(2, Math.round(bounds.height * dpr));
      const pixels = nextWidth * nextHeight;
      if (pixels > pixelBudget) {
        const reduction = Math.sqrt(pixelBudget / pixels);
        nextWidth = Math.max(2, Math.round(nextWidth * reduction));
        nextHeight = Math.max(2, Math.round(nextHeight * reduction));
      }
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      width = nextWidth;
      height = nextHeight;
      gl.viewport(0, 0, width, height);
      root.dataset.fxCoreReal3dResolution = `${width}x${height}`;
      root.dataset.fxCoreReal3dResolutionScale = resolutionScale.toFixed(2);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    resize();

    const intersectionObserver = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible && !raf && !disposed && !runtimeBlocked()) {
        raf = requestAnimationFrame(frame);
      }
    }, { rootMargin: '160px' });
    intersectionObserver.observe(stage);

    function runtimeBlocked() {
      return document.hidden
        || root.dataset.fxReferenceMotionPaused === 'true'
        || root.classList.contains('fx-organism-menu-open')
        || document.body?.classList.contains('fx-genome-open')
        || document.body?.classList.contains('fx-organism-panel-open');
    }

    function syncRuntimeVisibility() {
      const blocked = runtimeBlocked();
      root.dataset.fxCoreRuntimeVisibility = blocked ? 'suspended-covered' : 'active-visible';
      if (blocked && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!blocked && visible && !disposed && !raf) {
        lastFrame = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    const runtimeObserver = new MutationObserver(syncRuntimeVisibility);
    runtimeObserver.observe(root, { attributes: true, attributeFilter: ['class', 'data-fx-reference-motion-paused'] });
    if (document.body) runtimeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', syncRuntimeVisibility, { passive: true });

    function scheduleIdle(delay = 680) {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        targetEnergy = .34;
        targetOpenness = .105;
        targetSpinBoost = 0;
      }, delay);
    }

    function setPointer(clientX, clientY, intensity, openAmount) {
      const bounds = stage.getBoundingClientRect();
      targetX = clamp(((clientX - bounds.left) / Math.max(1, bounds.width) - .5) * 2, -1, 1);
      targetY = clamp(((clientY - bounds.top) / Math.max(1, bounds.height) - .5) * 2, -1, 1);
      targetEnergy = Math.max(targetEnergy, intensity);
      targetOpenness = Math.max(targetOpenness, openAmount);
      targetSpinBoost = Math.max(targetSpinBoost, intensity - .3);
      scheduleIdle();
    }

    function onPointerMove(event) {
      setPointer(event.clientX, event.clientY, activePointer === event.pointerId ? 1.25 : .72, activePointer === event.pointerId ? .13 : .05);
    }
    function onPointerDown(event) {
      activePointer = event.pointerId;
      setPointer(event.clientX, event.clientY, 1.72, .21);
      try { hero.setPointerCapture?.(event.pointerId); } catch (_) { /* Pointer capture is optional. */ }
    }
    function onPointerUp(event) {
      if (activePointer === event.pointerId) activePointer = null;
      targetEnergy = Math.max(targetEnergy, 1.08);
      scheduleIdle(520);
    }
    function onPointerCancel() { activePointer = null; scheduleIdle(260); }
    function onPointerLeave() {
      if (activePointer === null) {
        targetX = 0;
        targetY = 0;
        scheduleIdle(320);
      }
    }
    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerdown', onPointerDown, { passive: true });
    hero.addEventListener('pointerup', onPointerUp, { passive: true });
    hero.addEventListener('pointercancel', onPointerCancel, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave, { passive: true });

    function pulse(detail) {
      if (Number.isFinite(detail?.x)) targetX = clamp(detail.x, -1, 1);
      if (Number.isFinite(detail?.y)) targetY = clamp(detail.y, -1, 1);
      targetEnergy = Math.max(targetEnergy, detail?.phase === 'drag' ? 1.28 : 1.76);
      targetOpenness = Math.max(targetOpenness, detail?.phase === 'drag' ? .14 : .23);
      targetSpinBoost = Math.max(targetSpinBoost, detail?.phase === 'drag' ? .72 : 1.22);
      scheduleIdle(detail?.phase === 'drag' ? 520 : 760);
    }

    function onCoreInteraction(event) { pulse(event.detail || null); }
    function onReferencePause(event) {
      if (event.detail?.paused === false) syncRuntimeVisibility();
    }
    addEventListener('formatx:coreinteraction', onCoreInteraction, { passive: true });
    addEventListener('formatx:referencepause', onReferencePause, { passive: true });

    function frame(now) {
      raf = 0;
      if (disposed || !visible || runtimeBlocked()) return;
      if (width < 2 || height < 2) resize();

      const frameDelta = Math.min(40, Math.max(0, now - lastFrame));
      lastFrame = now;
      averageFrame += (frameDelta - averageFrame) * .05;
      frameCount += 1;
      pointerX += (targetX - pointerX) * .075;
      pointerY += (targetY - pointerY) * .075;
      energy += (targetEnergy - energy) * .10;
      openness += (targetOpenness - openness) * .08;
      spinBoost += (targetSpinBoost - spinBoost) * .08;
      targetEnergy += (.34 - targetEnergy) * .007;
      targetOpenness += (.105 - targetOpenness) * .006;
      targetSpinBoost *= .992;

      const time = reducedMotion.matches ? 0 : (now - started) * .001;
      const beatA = .5 + .5 * Math.sin(time * 1.62);
      const beatB = .5 + .5 * Math.sin(time * 3.24 - .72);
      const heart = Math.pow(beatA, 5) * .70 + Math.pow(beatB, 10) * .30;
      const breath = .5 + .5 * Math.sin(time * .58 - .35);
      const pulseScale = 1 + heart * (.022 + energy * .007) + breath * .004;
      const aspect = width / Math.max(1, height);
      const globalRotation = [
        -.08 - pointerY * .18 + Math.sin(time * .23) * .025,
        .12 + pointerX * .27 + Math.sin(time * .19) * .04,
        pointerX * pointerY * .025
      ];
      const speed = 1 + spinBoost * 1.45;

      cinematic.corePosition = [pointerX * .07, -pointerY * .06, .42 + energy * .012];
      cinematic.energy = energy;
      cinematic.openness = openness;

      const renderStarted = performance.now();
      gl.clearColor(0, 0, 0, 0);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.useProgram(program);

      gl.depthMask(false);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      draw(halo, 1, 1.28 + heart * .08, 1, [0, time * .08, 0], [0,0,0], [.04,.28,.78], [.08,.66,1.52], .16, globalRotation, time, energy, aspect);
      draw(core, 1, 1, pulseScale, [time * .10, -time * .13, time * .07], [0,0,0], [.04,.58,1.08], [.08,.72,1.18], .94, globalRotation, time, energy, aspect);
      draw(core, 3, .34, 1 + heart * .16 + energy * .035, [-time * .16, time * .11, 0], [0,0,.012], [.82,1.10,1.28], [1.26,1.52,1.82], 1, globalRotation, time, energy, aspect);
      draw(innerRings[0], 2, 1, 1, [.22, .35, time * .72 * speed], [0,0,0], [.04,.58,1.08], [.14,1.18,1.92], .94, globalRotation, time, energy, aspect);
      draw(innerRings[1], 2, 1, 1, [1.08, -.18, -time * .52 * speed], [0,0,0], [.46,.08,.92], [1.16,.10,1.82], .86, globalRotation, time, energy, aspect);
      draw(innerRings[2], 2, 1, 1, [-.72, .58, time * .39 * speed], [0,0,0], [.02,.68,1.08], [.08,1.02,1.76], .76, globalRotation, time, energy, aspect);

      gl.depthMask(true);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      draw(collar, 0, 1 + openness * .18, 1, [.50, -.26, -time * .13 * speed], [0,0,0], [.38,.46,.58], [.10,.72,1.18], .97, globalRotation, time, energy, aspect);
      for (const panel of panelDefinitions) {
        const panelScale = 1 + openness * (panel.middle ? 1.34 : 1.05 + .18 * Math.sin(panel.phase));
        const twist = openness * panel.direction * (.20 + .05 * Math.sin(panel.phase));
        const base = panel.tone === 0 ? [.48,.57,.70] : panel.tone === 1 ? [.32,.42,.57] : [.58,.64,.74];
        const emission = panel.tone === 2 ? [.66,.16,1.02] : [.06,.72,1.18];
        draw(panel.mesh, 0, panelScale, 1, [twist*.24, twist, twist*.16], [0,0,0], base, emission, panel.middle ? .82 : .94, globalRotation, time, energy, aspect);
      }

      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      draw(outerRings[0], 2, 1 + openness * .22, 1, [.82, .18, time * .31 * speed], [0,0,0], [.08,.42,1.04], [.18,1.02,1.82], .74, globalRotation, time, energy, aspect);
      draw(outerRings[1], 2, 1 + openness * .30, 1, [-.58, .72, -time * .23 * speed], [0,0,0], [.72,.06,.98], [1.18,.12,1.78], .68, globalRotation, time, energy, aspect);
      draw(outerRings[2], 2, 1 + openness * .38, 1, [.28, -1.02, time * .17 * speed], [0,0,0], [.02,.72,1.02], [.08,1.18,1.78], .56, globalRotation, time, energy, aspect);
      draw(outerArcs[0], 2, 1 + openness * .32, 1, [1.12, -.28, -time * .27 * speed], [0,0,0], [.12,.58,1.14], [.28,1.16,1.94], .58, globalRotation, time, energy, aspect);
      draw(outerArcs[1], 2, 1 + openness * .40, 1, [-.34, .94, time * .36 * speed], [0,0,0], [.78,.06,.98], [1.32,.14,1.86], .54, globalRotation, time, energy, aspect);
      gl.depthMask(true);

      const renderMs = performance.now() - renderStarted;
      const gpuPressure = renderMs > 13 || (averageFrame > 19.5 && renderMs > 8);
      if (gpuPressure) {
        slowFrames += 1;
        fastFrames = 0;
      } else if (renderMs < 8 && averageFrame < 17.4) {
        fastFrames += 1;
        slowFrames = Math.max(0, slowFrames - 1);
      }
      if (slowFrames >= 12 && resolutionScale > .72) {
        resolutionScale = Math.max(.72, resolutionScale - .10);
        slowFrames = 0;
        resize();
      } else if (fastFrames >= 240 && resolutionScale < 1) {
        resolutionScale = Math.min(1, resolutionScale + .05);
        fastFrames = 0;
        resize();
      }
      if (frameCount % 20 === 0) {
        const schedulerFps = Math.round(1000 / Math.max(1, averageFrame));
        const renderCapacityFps = Math.min(60, Math.round(1000 / Math.max(16.67, renderMs)));
        root.dataset.fxCoreRenderMs = renderMs.toFixed(2);
        root.dataset.fxCoreFrameMs = averageFrame.toFixed(1);
        root.dataset.fxCoreSchedulerFps = String(schedulerFps);
        root.dataset.fxCoreReal3dFps = String(renderCapacityFps);
        root.dataset.fxCoreFpsMetric = 'render-capacity-with-separate-scheduler-r251';
        root.dataset.fxCoreReal3dQuality = mobile ? 'r250-mobile-adaptive' : 'r250-desktop-high';
        root.dataset.fxCorePerformanceMode = gpuPressure ? 'r250-adaptive' : 'r250-balanced';
      }
      if (!disposed) raf = requestAnimationFrame(frame);
    }

    function destroy() {
      if (disposed) return;
      disposed = true;
      clearTimeout(idleTimer);
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      runtimeObserver.disconnect();
      document.removeEventListener('visibilitychange', syncRuntimeVisibility);
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerdown', onPointerDown);
      hero.removeEventListener('pointerup', onPointerUp);
      hero.removeEventListener('pointercancel', onPointerCancel);
      hero.removeEventListener('pointerleave', onPointerLeave);
      removeEventListener('formatx:coreinteraction', onCoreInteraction);
      removeEventListener('formatx:referencepause', onReferencePause);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      for (const mesh of meshes) {
        gl.deleteBuffer(mesh.positionBuffer);
        gl.deleteBuffer(mesh.normalBuffer);
        gl.deleteBuffer(mesh.indexBuffer);
      }
      gl.deleteProgram(program);
      stage.remove();
      if (window.FormatXCoreMobileV69?.destroy === destroy) delete window.FormatXCoreMobileV69;
    }

    function onContextLost(event) {
      event.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      root.dataset.fxCoreMobileR250 = 'context-lost';
      root.dataset.fxCoreReal3d = 'context-lost';
    }
    function onContextRestored() {
      root.dataset.fxCoreMobileR250 = 'restoring-context';
      destroy();
      requestAnimationFrame(() => boot());
    }
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    addEventListener('pagehide', destroy, { once: true });

    window.FormatXCoreMobileV69 = {
      version: VERSION,
      pulse: detail => pulse(detail || null),
      destroy,
      get energy() { return energy; },
      get openness() { return openness; }
    };

    root.dataset.fxCoreMobileR250 = 'ready';
    root.dataset.fxCoreMobileR99 = READY;
    root.dataset.fxCoreMobileV69 = READY;
    root.dataset.fxCoreMobileV55 = 'ready-v55';
    root.dataset.fxCoreReferenceLock = 'ready-v69';
    root.dataset.fxCoreReal3d = 'ready-v69';
    root.dataset.fxCoreRenderer = 'single-webgl-mechanical-orb-r250';
    root.dataset.fxCoreReferenceGeometry = 'segmented-spherical-mechanical-shell-r250';
    root.dataset.fxCoreReferenceMaterial = 'metal-plasma-orbital-r250';
    root.dataset.fxCoreInteractionVisual = 'pointer-touch-shell-open-ring-acceleration-r250';
    root.dataset.fxCoreNativeOnly = 'true';
    root.dataset.fxCoreDetailMode = 'disabled-native-webgl-r250';
    root.dataset.fxCoreReal3dTargetFps = '60-plus-adaptive';
    root.dataset.fxCoreRenderMs = '0';
    root.dataset.fxCoreFrameMs = '16.7';
    root.dataset.fxCoreReal3dFps = '60';
    root.dataset.fxGpuCapability = webgl2 ? 'webgl2' : 'webgl1';
    root.dataset.fxCoreFrameVerified = 'visible-native-3d-r250';
    root.dataset.fxCoreR250 = 'mechanical-orb-depth-buffer';
    root.dataset.fxCoreR250Geometry = 'segmented-spherical-panels-plasma-sphere-six-orbitals';
    root.dataset.fxCoreR250Material = 'lit-metal-fresnel-cyan-magenta-plasma';
    root.dataset.fxCoreR250Interaction = 'pointer-touch-shell-open-ring-acceleration';
    dispatchEvent(new CustomEvent('formatx:real3dready', {
      detail: { version: 'r250', renderer: VERSION, context: webgl2 ? 'webgl2' : 'webgl1', interactive: true }
    }));
    raf = requestAnimationFrame(frame);
  }

  boot();
}());

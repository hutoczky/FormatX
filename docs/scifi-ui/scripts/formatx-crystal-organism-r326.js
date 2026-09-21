(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'crystal-organism-r326';
  const REVISION = 'living-luminous-electric-crystal-r454';
  const READY = 'ready-v69';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const auditMode = new URLSearchParams(location.search).get('lighthouse') === '1';
  const hardwareConcurrency = Math.max(1, Number(navigator.hardwareConcurrency || 8));
  const deviceMemory = Math.max(1, Number(navigator.deviceMemory || 8));
  const constrained = hardwareConcurrency <= 4 || deviceMemory <= 4;
  const constrainedMobile = mobile && constrained;
  const IDLE_ENERGY = mobile ? .50 : .43;
  const SURFACE_PULSE_MS = 1160;
  const SURFACE_PULSE_WINDOW_MS = mobile ? SURFACE_PULSE_MS : 1880;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const optics = mobile ? Object.freeze({
    fresnelPower: '1.62',
    innerExposure: '2.58',
    outerExposure: '2.28'
  }) : Object.freeze({
    fresnelPower: '1.74',
    innerExposure: '2.40',
    outerExposure: '2.12'
  });

  if (root.dataset.fxCrystalOrganismR326 === 'ready' || root.dataset.fxCrystalOrganismR326 === 'booting') return;
  root.dataset.fxCrystalOrganismR326 = 'booting';
  root.dataset.fxCoreMobileV55 = 'booting-v55';
  root.dataset.fxCoreMobileV69 = 'booting-v69';
  root.dataset.fxNativeMagVisualR1350 = 'organic-video-final-silhouette-dark-crown-large-iris-smooth-eight-tendrils';
  root.dataset.fxNativeMagVisualR1360 = 'cortical-rounded-body-dark-diamond-cradle-glassy-eight-tendrils';
  root.dataset.fxNativeMagVisualR1380 = 'premium-organic-cortex-defined-diamond-iris-smooth-glass-tendrils';
  root.dataset.fxNativeMagVisualR1390 = 'premium-cortical-biomech-broad-metal-cradle-optical-iris-eight-tendrils';
  root.dataset.fxNativeMagVisualR1400 = 'irregular-crystal-biomech-cortex-optical-iris-eight-tendrils';
  root.dataset.fxNativeMagVisualR1404 = 'irregular-crystal-only-no-round-endpoint-crisp-mobile';
  root.dataset.fxNativeMagVisualR1405 = 'smaller-elevated-irregular-crystal-compact-optical-cradle-refined-eight-tendrils';
  root.dataset.fxNativeMagVisualR1401 = 'sharp-asymmetric-crystal-black-gunmetal-optical-iris-eight-tendrils-mobile';
  root.dataset.fxNativeMagVisualR1410 = 'sculpted-asymmetric-shard-crystal-visible-metal-facets-optical-iris-eight-tendrils';
  root.dataset.fxNativeMagVisualR1412 = 'vertical-asymmetric-black-crystal-offset-shards-silver-crown-cyan-optic';
  root.dataset.fxNativeMagVisualR1414 = 'premium-asymmetric-shard-cluster-titanium-facets-glass-optic-smooth-tendrils';
  root.dataset.fxNativeMagVisualR1420 = 'dark-irregular-shard-cluster-no-kite-silhouette-controlled-titanium-cyan-optic';
  root.dataset.fxNativeMagVisualR1440 = 'coherent-irregular-crystal-broad-facets-dark-glass-clean-titanium-cradle-cyan-reactor';
  root.dataset.fxNativeMagVisualR1450 = 'asymmetric-shard-cluster-solid-gunmetal-cyan-optic-long-smooth-eight-tendrils';
  root.dataset.fxNativeMagVisualR1460 = 'coherent-cut-crystal-asymmetric-gunmetal-silver-cyan-optic-eight-tendrils';
  root.dataset.fxNativeMagVisualR1470 = 'obsidian-cut-crystal-broad-facets-titanium-cradle-cyan-iris-controlled-eight-tendrils';
  root.dataset.fxNativeMagVisualR1480 = 'realistic-obsidian-crystal-broad-cut-facets-integrated-cradle-lens-eight-tendrils';
  root.dataset.fxNativeMagVisualR1490 = 'single-body-asymmetric-obsidian-crystal-no-detached-armor-optical-lens-eight-tendrils';
  root.dataset.fxNativeMagVisualR1500 = 'photoreal-asymmetric-obsidian-mineral-local-optical-lens-eight-tendrils';
  root.dataset.fxNativeMagVisualR1510 = 'photoreal-obsidian-physical-lens-no-hud-rings-organic-tendrils';
  root.dataset.fxNativeMagVisualR1520 = 'photoreal-irregular-obsidian-visible-facets-no-orbit-ring';
  root.dataset.fxNativeMagVisualR1530 = 'photoreal-microfacet-obsidian-physical-lens-living-habitat';
  root.dataset.fxNativeMagVisualR1531 = 'exposed-obsidian-facets-round-recessed-physical-lens-no-local-hud';
  root.dataset.fxNativeMagAuditR1391 = auditMode ? 'reduced-shader-no-autonomous-sweep' : 'normal';

  function beginProgram(gl, vertexSource, fragmentSource) {
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    const program = gl.createProgram();
    const vertex = gl.createShader(gl.VERTEX_SHADER);
    const fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertex, vertexSource);
    gl.shaderSource(fragment, fragmentSource);
    gl.compileShader(vertex);
    gl.compileShader(fragment);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'aSphere');
    gl.bindAttribLocation(program, 1, 'aCrystal');
    gl.bindAttribLocation(program, 2, 'aSphereNormal');
    gl.bindAttribLocation(program, 3, 'aCrystalNormal');
    gl.bindAttribLocation(program, 4, 'aUv');
    gl.bindAttribLocation(program, 5, 'aBary');
    gl.bindAttribLocation(program, 6, 'aFacet');
    gl.linkProgram(program);
    return { program, vertex, fragment, parallel };
  }

  function finishProgram(gl, pending) {
    const { program, vertex, fragment, parallel } = pending;
    if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) return null;
    const vertexOk = gl.getShaderParameter(vertex, gl.COMPILE_STATUS);
    const fragmentOk = gl.getShaderParameter(fragment, gl.COMPILE_STATUS);
    const linkOk = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!vertexOk || !fragmentOk || !linkOk) {
      const message = (!vertexOk && gl.getShaderInfoLog(vertex))
        || (!fragmentOk && gl.getShaderInfoLog(fragment))
        || gl.getProgramInfoLog(program)
        || 'crystal organism shader compile/link failed';
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteProgram(program);
      throw new Error(message);
    }
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return program;
  }

  function normalize(vector) {
    const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
    return [vector[0] / length, vector[1] / length, vector[2] / length];
  }

  function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  /* One closed topology owns both endpoints. r442 uses a lighter phone mesh:
     the silhouette and morph remain fully 3D, but the larger native facets need
     fewer fragment invocations and also avoid the razor-fine edge impression. */
  function buildOrganismGeometry() {
    const latitudeSegments = auditMode ? 8 : constrainedMobile ? 7 : mobile ? 8 : constrained ? 9 : 10;
    const longitudeSegments = auditMode ? 14 : constrainedMobile ? 14 : mobile ? 16 : constrained ? 18 : 20;
    const tendrilCount = auditMode ? 4 : 8;
    const tendrilSegments = auditMode ? 5 : constrainedMobile ? 18 : mobile ? 28 : constrained ? 26 : 36;
    const tendrilSides = auditMode ? 3 : constrainedMobile ? 5 : mobile || constrained ? 7 : 9;
    const sphere = [];
    const crystal = [];
    const sphereNormals = [];
    const crystalNormals = [];
    const uvs = [];
    const barycentrics = [];
    const facets = [];

    function random(x, y) {
      const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      return value - Math.floor(value);
    }

    function vertex(latitudeIndex, longitudeIndex) {
      const latitude = latitudeIndex / latitudeSegments;
      const longitude = longitudeIndex / longitudeSegments;
      const phi = latitude * Math.PI;
      const theta = longitude * Math.PI * 2;
      const sinPhi = Math.sin(phi);
      const direction = [sinPhi * Math.cos(theta), Math.cos(phi), sinPhi * Math.sin(theta)];
      /* R1404 compatibility endpoint: internal id remains "sphere" for
         existing controls/tests, but visually it is a softer irregular crystal.
         The hero therefore never falls back to a round/egg silhouette. */
      const softAx=.82,softAy=.88,softAz=.72;
      const softL1=Math.abs(direction[0])/softAx+Math.abs(direction[1])/softAy+Math.abs(direction[2])/softAz;
      const softRadius=1/Math.max(.001,softL1);
      const softBias=1
        +Math.sin(theta*2.73+phi*1.17)*.032
        +Math.cos(theta*4.61-phi*2.09)*.020;
      const spherePosition=[
        direction[0]*softRadius*1.04*softBias,
        direction[1]*softRadius*1.06*softBias+Math.pow(Math.max(direction[1],0),6.0)*.045,
        direction[2]*softRadius*.96*softBias
      ];

      /* R614 compatibility contract retained. R730 maps the same closed
         topology to the supplied final MAG reference: a compact, opaque,
         rounded-diamond armored pod with a tall crown and broad shoulders. */
      /* R1080: reference-locked closed armored diamond-pod.
         Keep one native topology, but use a sub-L1 superellipsoid so the hero
         reads as the supplied tall rhombic machine rather than an egg. */
      /* R1400 — irregular crystal, not an orb.
         The closed sphere topology intersects an asymmetric octahedral envelope,
         then receives restrained biological distortion. This keeps the MAG alive
         while the silhouette reads as a unique faceted crystal from every angle. */
      /* R1470 — coherent obsidian cut crystal.
         p≈1 keeps a true rhombic/crystalline silhouette. Broad low-frequency
         asymmetry prevents a logo-perfect diamond without falling back to a
         swollen egg or a pile of torn shards. */
      const upper=direction[1]>=0;
      const right=direction[0]>=0;
      const front=direction[2]>=0;
      // R1520 — deliberately uneven mineral envelope, not a logo-perfect kite.
      const ax=upper?(right?.70:.83):(right?.79:.67);
      const ay=upper?(right?.96:.88):(right?.83:.73);
      const az=front?(right?.58:.71):(right?.63:.74);
      const p=1.16;
      const lp=
        Math.pow(Math.abs(direction[0])/ax,p)+
        Math.pow(Math.abs(direction[1])/ay,p)+
        Math.pow(Math.abs(direction[2])/az,p);
      const baseRadius=1/Math.pow(Math.max(.001,lp),1/p);
      const broadBias=
        1
        +Math.sin(theta*2.05+phi*.93)*.058
        +Math.cos(theta*3.17-phi*1.41)*.034
        +Math.sin(theta*4.73+phi*.57)*.016;
      const plane=(x,y,z,power,amount)=>
        Math.pow(Math.max(0,direction[0]*x+direction[1]*y+direction[2]*z),power)*amount;
      const mass=
        plane(-.62,.72,.22,4.5,.070)+
        plane(.76,.49,-.05,4.5,.048)+
        plane(-.88,-.05,.16,5.0,.058)+
        plane(.86,-.20,.10,5.0,.044)+
        plane(-.10,-.88,.18,5.2,.052);
      const crystalRadius=baseRadius*broadBias+mass;
      const crystalPosition=[
        direction[0]*crystalRadius*1.08,
        direction[1]*crystalRadius*1.05,
        direction[2]*crystalRadius*.95
      ];
      crystalPosition[0]+=direction[1]*-.032+direction[2]*direction[1]*.020-Math.pow(Math.max(-direction[0],0),4.0)*.020;
      crystalPosition[1]+=Math.pow(Math.max(direction[1],0),5.0)*.066-Math.pow(Math.max(-direction[1],0),4.0)*.018+direction[0]*direction[2]*.012;
      crystalPosition[2]+=direction[0]*direction[1]*.017+Math.pow(Math.max(direction[2],0),4.0)*.012;
      return {
        sphere: spherePosition,
        crystal: crystalPosition,
        sphereNormal: direction,
        uv: [longitude, latitude]
      };
    }

    function triangle(vertices, facet) {
      let crystalNormal = normalize(cross(
        subtract(vertices[1].crystal, vertices[0].crystal),
        subtract(vertices[2].crystal, vertices[0].crystal)
      ));
      const centre = [0, 1, 2].map(index => (
        vertices[0].crystal[index] + vertices[1].crystal[index] + vertices[2].crystal[index]
      ) / 3);
      if (dot(crystalNormal, centre) < 0) crystalNormal = crystalNormal.map(value => -value);
      const barycentric = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
      vertices.forEach((item, index) => {
        sphere.push(...item.sphere);
        crystal.push(...item.crystal);
        sphereNormals.push(...item.sphereNormal);
        crystalNormals.push(...crystalNormal);
        uvs.push(...item.uv);
        barycentrics.push(...barycentric[index]);
        facets.push(facet);
      });
    }

    for (let latitude = 0; latitude < latitudeSegments; latitude += 1) {
      for (let longitude = 0; longitude < longitudeSegments; longitude += 1) {
        const a = vertex(latitude, longitude);
        const b = vertex(latitude, longitude + 1);
        const c = vertex(latitude + 1, longitude);
        const d = vertex(latitude + 1, longitude + 1);
        if (latitude > 0) triangle([a, b, c], .08 + .92 * random(longitude, latitude * 2));
        if (latitude < latitudeSegments - 1) triangle([b, d, c], .08 + .92 * random(longitude + 37, latitude * 2 + 1));
      }
    }

    /* The reference's cable/tentacle silhouette is still one native R326 draw.
       Each appendage is appended to the same buffers and collapses back into the
       sphere endpoint during morph, so no duplicate canvas/core is introduced. */
    function tendrilPath(index, t) {
      const baseAngle = index / tendrilCount * Math.PI * 2 + Math.sin(index*2.17)*.16 + (index % 2 ? .045 : -.035);
      const sideAngle = baseAngle + Math.PI * .5;
      const root = .48;
      const reach = .40 + ((index*3)%5) * .030;
      const radius = root + reach * t;
      const wave = (Math.sin(t * Math.PI * 1.62 + index * .83)*(.014+.070*t))
        +Math.sin(t*Math.PI*.72+index*.47)*.018*t;
      const depth = Math.sin(t * Math.PI * 1.42 + index * .97) * (.018 + .060 * t);
      return [
        Math.cos(baseAngle) * radius + Math.cos(sideAngle) * wave,
        Math.sin(baseAngle) * radius + Math.sin(sideAngle) * wave,
        depth
      ];
    }

    function tendrilRing(index, segment) {
      const t = segment / tendrilSegments;
      const p = tendrilPath(index, t);
      const before = tendrilPath(index, Math.max(0, t - .015));
      const after = tendrilPath(index, Math.min(1, t + .015));
      const tangent = normalize(subtract(after, before));
      const guide = Math.abs(tangent[1]) > .86 ? [1, 0, 0] : [0, 1, 0];
      const sideA = normalize(cross(tangent, guide));
      const sideB = normalize(cross(tangent, sideA));
      const tubeRadius = (.0108 * (1 - t * .84) + .0025) * (mobile ? .94 : 1);
      const rootDirection = normalize([p[0], p[1], p[2] * .72]);
      return Array.from({ length: tendrilSides }, (_, sideIndex) => {
        const a = sideIndex / tendrilSides * Math.PI * 2;
        const offset = [
          sideA[0] * Math.cos(a) * tubeRadius + sideB[0] * Math.sin(a) * tubeRadius,
          sideA[1] * Math.cos(a) * tubeRadius + sideB[1] * Math.sin(a) * tubeRadius,
          sideA[2] * Math.cos(a) * tubeRadius + sideB[2] * Math.sin(a) * tubeRadius
        ];
        const collapsed = [
          rootDirection[0] * .86 + offset[0] * .30 * (1 - t),
          rootDirection[1] * .86 + offset[1] * .30 * (1 - t),
          rootDirection[2] * .86 + offset[2] * .30 * (1 - t)
        ];
        return {
          sphere: collapsed,
          crystal: [p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]],
          sphereNormal: normalize(collapsed),
          uv: [(index + sideIndex / tendrilSides) / tendrilCount, t]
        };
      });
    }

    for (let index = 0; index < tendrilCount; index += 1) {
      let previous = tendrilRing(index, 0);
      for (let segment = 1; segment <= tendrilSegments; segment += 1) {
        const current = tendrilRing(index, segment);
        for (let side = 0; side < tendrilSides; side += 1) {
          const next = (side + 1) % tendrilSides;
          const facet = .20 + .78 * random(index * 17 + segment, side * 31 + index);
          triangle([previous[side], previous[next], current[side]], facet);
          triangle([previous[next], current[next], current[side]], facet);
        }
        previous = current;
      }
    }

    /* R1100 — real front armor plates in the existing single native draw. */
    function armorVertex(position, uv=[.5,.5]) {
      const dir=normalize(position);
      return {
        sphere: dir.map(value => value * .91),
        crystal: position,
        sphereNormal: dir,
        uv
      };
    }
    function armorTri(a,b,c,facet=2.40) {
      triangle([
        armorVertex(a,[0,0]),
        armorVertex(b,[1,0]),
        armorVertex(c,[.5,1])
      ],facet);
    }
    function armorQuad(a,b,c,d,facet=2.40) {
      armorTri(a,b,c,facet);
      armorTri(a,c,d,facet);
    }

    // R1490 — single coherent crystal body.
    // Metallic cradle/crown detail is shader-owned on the closed crystal surface.
    // Free-standing armor triangles are intentionally not appended: they caused
    // the detached side shard visible in real phone captures.

    return {
      arrays: [sphere, crystal, sphereNormals, crystalNormals, uvs, barycentrics, facets]
        .map(values => new Float32Array(values)),
      sizes: [3, 3, 3, 3, 2, 3, 1],
      count: facets.length,
      tendrils: tendrilCount,
      topology: `${latitudeSegments}x${longitudeSegments}-armored-closed-core-plus-${tendrilCount}-native-tendrils-r614`
    };
  }

  function boot(attempt=0) {
    const hero = document.getElementById('hero');
    const host = hero?.querySelector('.hero-space');
    if (!(hero instanceof HTMLElement) || !(host instanceof HTMLElement)) {
      if (attempt < 180) requestAnimationFrame(() => boot(attempt+1));
      else root.dataset.fxCrystalOrganismR326 = 'host-unavailable';
      return;
    }

    window.FormatXCoreMobileV69?.destroy?.();
    host.querySelectorAll(':scope > .fx-core-mobile-v55-stage').forEach(node => node.remove());

    const stage = document.createElement('div');
    stage.className = 'fx-core-mobile-v55-stage fx-crystal-organism-r326-stage';
    stage.dataset.renderer = VERSION;
    stage.dataset.revision = REVISION;
    stage.dataset.active = 'true';
    stage.setAttribute('aria-hidden','true');
    host.prepend(stage);

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-core-mobile-v55-canvas fx-crystal-organism-r326-canvas';
    canvas.setAttribute('aria-hidden','true');
    stage.appendChild(canvas);

    const options = {
      alpha:true,
      antialias:!constrainedMobile,
      depth:true,
      stencil:false,
      premultipliedAlpha:false,
      preserveDrawingBuffer:false,
      powerPreference:'high-performance'
    };
    let gl = canvas.getContext('webgl2', options);
    const webgl2 = Boolean(gl);
    if (!gl) gl = canvas.getContext('webgl', options);
    if (!gl) {
      stage.remove();
      root.dataset.fxCrystalOrganismR326 = 'context-unavailable';
      root.dataset.fxCoreReal3d = 'context-unavailable';
      dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'r326-webgl-unavailable',fallback:'none'}}));
      return;
    }

    const vertexIn = webgl2 ? 'in' : 'attribute';
    const vertexOut = webgl2 ? 'out' : 'varying';
    const fragmentIn = webgl2 ? 'in' : 'varying';
    const outputName = webgl2 ? 'outColor' : 'gl_FragColor';
    const versionLine = webgl2 ? '#version 300 es\n' : '';
    const vertexSource = `${versionLine}precision highp float;
      ${vertexIn} vec3 aSphere;
      ${vertexIn} vec3 aCrystal;
      ${vertexIn} vec3 aSphereNormal;
      ${vertexIn} vec3 aCrystalNormal;
      ${vertexIn} vec2 aUv;
      ${vertexIn} vec3 aBary;
      ${vertexIn} float aFacet;
      uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uAspect,uSiteProgress;
      uniform vec2 uPointer;
      uniform vec3 uRotation;
      ${vertexOut} vec3 vNormal;
      ${vertexOut} vec3 vLocal;
      ${vertexOut} vec2 vUv;
      ${vertexOut} vec3 vBary;
      ${vertexOut} float vFacet;
      ${vertexOut} float vMorph;
      mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
      mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
      mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,-s,0.,s,c,0.,0.,0.,1.);}
      void main(){
        float morph=uMorph*uMorph*(3.0-2.0*uMorph);
        vec3 normal=normalize(mix(aCrystalNormal,aSphereNormal,morph));
        vec3 base=mix(aCrystal,aSphere,morph);
        float cell=sin(uTime*.71+dot(aSphereNormal,vec3(5.7,4.1,6.3))+uSiteProgress*6.28318);
        float membrane=sin(uTime*1.17+aUv.x*12.566-aUv.y*9.2+sin(aUv.y*6.283)*1.4);
        float living=(cell*.018+membrane*.009)*(.42+.58*uEnergy)*mix(.72,1.34,morph);
        float layerScale=uLayer>.5?.50:1.0;
        float heartbeat=1.0+uBreath*(uLayer>.5?.040:.018);
        vec3 local=(base+normal*living)*layerScale*heartbeat;
        local.xy+=uPointer*.038*uLayer;
        float yaw=.08+uRotation.y+uPointer.x*.23+uTime*.021;
        float pitch=-.055+uRotation.x-uPointer.y*.16+.014*sin(uTime*.19);
        float roll=uRotation.z+uPointer.x*uPointer.y*.035+.010*sin(uTime*.23);
        mat3 rotation=rz(roll)*ry(yaw)*rx(pitch);
        vec3 world=rotation*local;
        vNormal=normalize(rotation*normal);
        vLocal=world;
        vUv=aUv;
        vBary=aBary;
        vFacet=aFacet;
        vMorph=morph;
        float camera=3.12-world.z*.70;
        float perspective=2.76/max(1.72,camera);
        vec2 silhouetteScale=vec2(mix(1.02,1.0,morph),mix(1.03,1.0,morph));
        vec2 projected=vec2(world.x/max(.56,uAspect),world.y)*silhouetteScale*perspective;
        projected*= ${mobile?'.635':'.655'};
        projected.y+=${mobile?'.055':'.028'};
        gl_Position=vec4(projected,world.z*.13,1.0);
      }`;

    const fullFragmentSource = `${versionLine}precision highp float;
      uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uSiteProgress,uSurfacePulse;
      uniform vec2 uPointer;
      ${fragmentIn} vec3 vNormal;
      ${fragmentIn} vec3 vLocal;
      ${fragmentIn} vec2 vUv;
      ${fragmentIn} vec3 vBary;
      ${fragmentIn} float vFacet;
      ${fragmentIn} float vMorph;
      ${webgl2 ? 'out vec4 outColor;' : ''}
      float sat(float v){return clamp(v,0.,1.);}
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
      float ridge(float v,float p){return pow(sat(1.-abs(fract(v)-.5)*2.),p);}
      vec3 filmic(vec3 c){return 1.0-exp(-max(c,vec3(0.)));}
      vec3 fresnelSchlick(float cosTheta,vec3 F0){
        return F0+(1.0-F0)*pow(1.0-clamp(cosTheta,0.0,1.0),5.0);
      }
      float distributionGGX(vec3 N,vec3 H,float roughness){
        float a=roughness*roughness;
        float a2=a*a;
        float ndh=max(dot(N,H),0.0);
        float ndh2=ndh*ndh;
        float denom=ndh2*(a2-1.0)+1.0;
        return a2/max(3.14159265*denom*denom,.0001);
      }
      float geometrySchlickGGX(float ndv,float roughness){
        float r=roughness+1.0;
        float k=(r*r)/8.0;
        return ndv/max(ndv*(1.0-k)+k,.0001);
      }
      float geometrySmith(vec3 N,vec3 V,vec3 L,float roughness){
        return geometrySchlickGGX(max(dot(N,V),0.0),roughness)
          *geometrySchlickGGX(max(dot(N,L),0.0),roughness);
      }
      void main(){
        vec3 n=normalize(vNormal);
        vec3 view=normalize(vec3(-vLocal.xy,2.9-vLocal.z));
        vec3 key=normalize(vec3(-.42,.73,.54));
        vec3 side=normalize(vec3(.72,-.18,.66));
        float facetRand=fract(sin(vFacet*91.73+13.17)*43758.5453);
        float ndl=max(dot(n,key),0.);
        float sideLight=max(dot(n,side),0.);
        float ndv=max(dot(n,view),0.0);
        vec3 halfKey=normalize(key+view);
        float roughness=mix(.17,.43,facetRand);
        vec3 mineralF0=mix(vec3(.034),vec3(.30,.35,.37),.82);
        float microD=distributionGGX(n,halfKey,roughness);
        float microG=geometrySmith(n,view,key,roughness);
        vec3 microF=fresnelSchlick(max(dot(halfKey,view),0.0),mineralF0);
        vec3 microSpec=min(vec3(2.4),(microD*microG*microF)/max(4.0*ndl*ndv,.001));
        float facing=sat(abs(dot(n,view)));
        float fresnel=pow(1.0-facing,${optics.fresnelPower});
        float specular=pow(max(dot(n,normalize(key+view)),0.),42.0);
        specular+=.72*pow(max(dot(n,normalize(side+view)),0.),24.0);
        float facetPulse=.5+.5*sin(vFacet*23.0+uTime*.42+uSiteProgress*5.0);
        float edge=1.0-smoothstep(${mobile?'.004':'.010'},${mobile?'.095':'.050'},min(vBary.x,min(vBary.y,vBary.z)));
        edge*=pow(1.0-vMorph,1.7)*(${mobile?'.006':'.026'}+${mobile?'.026':'.13'}*fresnel)*smoothstep(.38,.88,facetPulse);
        vec2 field=vec2(vUv.x*8.0+vLocal.z*2.1,vUv.y*5.0+vLocal.x*1.7);
        float cloud=noise(field*2.2+vec2(-uTime*.08,uTime*.05));
        float warp=noise(field*1.34+vec2(uTime*.025,-uTime*.018));
        float veins=ridge(vLocal.y*3.4-vLocal.x*5.1+cloud*2.4+warp*1.6-uTime*.13,21.0);
        veins+=.72*ridge(vLocal.y*5.7+vLocal.z*4.8-cloud*1.7-warp*1.2+uTime*.09,24.0);
        veins*=.40+.82*fresnel;
        float cellField=noise(vec2(vLocal.x*5.1+vLocal.z*2.7,vLocal.y*5.8-vLocal.z*1.9)+vec2(uTime*.045,-uTime*.032));
        float membrane=ridge(cellField*2.2+vLocal.y*1.7-vLocal.x*.8-uTime*.055,10.0);
        membrane*=.24+.76*fresnel;
        /* R1380 broad cortical folds: dark valleys + soft violet lobe tops. */
        float cortexPhase=vUv.x*37.70+sin(vUv.y*18.85)*1.65+vUv.y*11.20+cloud*.65;
        float cortexPhase2=vUv.y*28.30-vUv.x*12.40+warp*1.10;
        float cortexGroove=pow(1.0-abs(sin(cortexPhase)),7.0);
        cortexGroove+=.58*pow(1.0-abs(sin(cortexPhase2)),8.0);
        cortexGroove=sat(cortexGroove);
        float cortexLobe=sat(.55+.34*sin(cortexPhase*.50)+.22*sin(cortexPhase2*.62));

        /* R614 — the native R326 MAG keeps the genetic origin visible.
           These are shader-native double-helix filaments, not an overlay or
           second renderer. The two strands wind around the Y axis and the
           bridge field creates intermittent base-pair-like cross energy. */
        float dnaAngle=atan(vLocal.z,vLocal.x);
        float dnaPhase=dnaAngle-vLocal.y*7.65-uTime*.055;
        float dnaStrandA=exp(-pow(sin(dnaPhase*.5)/.105,2.0));
        float dnaStrandB=exp(-pow(sin((dnaPhase-3.14159265)*.5)/.105,2.0));
        float dnaDepth=.34+.66*fresnel;
        float dnaFlow=.76+.24*sin(uTime*.44+vLocal.y*10.8+vFacet*3.1);
        float dnaHelix=(dnaStrandA+dnaStrandB)*dnaDepth*dnaFlow;
        float dnaBridge=ridge(vLocal.y*5.45+uTime*.018,22.0)
          *(.22+.78*pow(sat(1.0-abs(vLocal.x)*.92),2.0))
          *(.28+.72*fresnel);
        float genomePulse=.62+.38*sin(uTime*.23+vLocal.y*5.4+dnaAngle*2.0);
        vec2 heartOffset=vec2(uPointer.x*${mobile?'.070':'.045'},uPointer.y*${mobile?'.058':'.036'});
        vec2 heartLocal=vec2(vLocal.x,vLocal.y*1.025)-heartOffset;
        float radial=length(heartLocal);
        float angle=atan(heartLocal.y,heartLocal.x);
        float visualEnergy=sat(.36+uEnergy*.48);
        float heart=pow(sat(1.0-radial/.45),3.05);
        float nucleus=pow(sat(1.0-radial/.185),4.35);
        // R1510 — physical lens, not a HUD iris.
        float rings=0.0;
        float iris=0.0;
        float axisV=0.0;
        float axisH=0.0;
        float hue=.5+.5*sin(vFacet*7.0+uSiteProgress*9.0+uTime*.12);
        float armorSeam=ridge(vUv.x*4.0+vUv.y*.18+uSiteProgress*.08,17.0)*(1.0-smoothstep(.62,.98,abs(vLocal.y)));
        float armorRib=ridge(vUv.y*3.0+vUv.x*.11,20.0)*(.32+.68*fresnel);
        float podMask=1.0-vMorph;
        float diamondCoord=length(vec2(heartLocal.x,heartLocal.y*1.035));
        float diamondFace=(1.0-smoothstep(.126,.194,diamondCoord))*smoothstep(.18,.46,vLocal.z)*podMask;
        float diamondInner=(1.0-smoothstep(.069,.108,diamondCoord))*smoothstep(.18,.46,vLocal.z)*podMask;
        float diamondFrame=max(0.0,diamondFace-diamondInner);
        float diamondRim=(1.0-smoothstep(.004,.013,abs(diamondCoord-.162)))*smoothstep(.18,.46,vLocal.z)*podMask;
        float cradlePlate=diamondFrame*podMask;
        float pupil=1.0-smoothstep(.016,.034,radial);
        float coreDisc=1.0-smoothstep(.050,.104,radial);
        float coreRing=1.0-smoothstep(.007,.019,abs(radial-.098));
        float irisRays=0.0;
        float lensCaustic=exp(-pow(length(heartLocal-vec2(-.030,.034))/.036,2.0))*coreDisc;
        float realArmorPlate=0.0;
        float realDarkPlate=0.0;
        float crownMask=smoothstep(.34,.68,vLocal.y)
          *(1.0-smoothstep(.27,.49,abs(vLocal.x)))*podMask;
        float shoulderMask=smoothstep(.31,.42,abs(vLocal.x))
          *(1.0-smoothstep(.58,.72,abs(vLocal.x)))
          *(1.0-smoothstep(.16,.50,abs(vLocal.y)))*podMask;
        float jawMask=smoothstep(.22,.66,-vLocal.y)
          *(1.0-smoothstep(.30,.58,abs(vLocal.x)))*podMask;
        float opticalWell=(1.0-smoothstep(.22,.43,radial))*podMask;
        float tendrilMask=smoothstep(.62,.82,length(vLocal.xy))*podMask;
        float tendrilSegment=(.58+.42*ridge(vUv.y*4.8+vUv.x*1.15,7.0))*tendrilMask;
        vec3 cyan=vec3(.012,.34,.52);
        vec3 violet=vec3(.024,.030,.060);
        vec3 ice=vec3(.40,.49,.52);
        vec3 gunmetal=vec3(.003,.005,.006);
        vec3 steel=vec3(.023,.032,.037);
        vec3 silver=vec3(.160,.180,.190);
        vec3 spectral=mix(cyan,ice,.10+.28*hue);
        float surfaceSweep=0.0;
        float surfaceFilament=0.0;
        if(uSurfacePulse>=0.0){
          float pathWarp=.075*sin(vLocal.y*8.4+vLocal.z*5.7-uTime*5.1)
            +.038*sin(vLocal.y*17.0-vLocal.z*9.0+uTime*7.3);
          float mainPath=abs(vLocal.x+pathWarp);
          float branchPath=abs(vLocal.x*.72-vLocal.z*.30
            +.11*sin(vLocal.y*13.0+uTime*4.4));
          float trunk=exp(-pow(mainPath/.032,2.0));
          float branches=exp(-pow(branchPath/.025,2.0))
            *smoothstep(.10,.92,abs(vLocal.y))
            *(.45+.55*ridge(vLocal.y*3.2+vLocal.z*2.1,7.0));
          float electricFlicker=.78+.22*sin(uTime*46.0+vLocal.y*31.0+vFacet*5.0);
          surfaceFilament=(trunk+.68*branches)*electricFlicker;
          float sweepCoordinate=.5+(vLocal.y*.60+vLocal.x*.16+vLocal.z*.24)*.5;
          float sweepHead=mix(-.18,1.18,sat(uSurfacePulse));
          float sweepBand=exp(-pow((sweepCoordinate-sweepHead)/.052,2.0));
          float sweepTail=.30*exp(-pow((sweepCoordinate-(sweepHead-.10))/.095,2.0));
          surfaceSweep=(sweepBand+sweepTail)
            *(.28+.72*fresnel)
            *(.72+.28*facetPulse)
            *(.44+1.12*surfaceFilament);
        }

        if(uLayer>.5){
          vec3 organ=mix(vec3(.007,.020,.030),steel,.16+.18*visualEnergy);
          organ*=.78+.34*cloud;
          organ+=cyan*heart*(.10+.10*uBreath);
          organ+=ice*nucleus*(1.78+.62*visualEnergy);
          organ+=cyan*(rings*.32+iris*.42+veins*.12);
          organ+=ice*(armorSeam*.10+armorRib*.06);
          organ+=(cyan*.22+ice*.06)*(axisV*.22+axisH*.12)*visualEnergy;
          organ+=(cyan*.16+violet*.08)*dnaHelix*(.07+.10*visualEnergy)*genomePulse;
          organ+=(ice*.58+cyan*.30)*surfaceSweep*(.72+.30*visualEnergy);
          float alpha=.10+.10*heart+.08*visualEnergy+rings*.045+iris*.040+nucleus*.20+veins*.022+surfaceSweep*.08;
          ${outputName}=vec4(filmic(organ*(${optics.innerExposure}*.62)),clamp(alpha,.10,.46));
          return;
        }

        float broadSpec=pow(max(dot(n,normalize(key+view)),0.),12.0);
        float mineralLift=.25+.82*ndl+.42*sideLight+.20*fresnel;
        vec3 glass=mix(vec3(.010,.014,.017),vec3(.086,.105,.112),mineralLift);
        glass+=vec3(.110,.118,.116)*broadSpec*.24;
        glass+=vec3(.040,.047,.049)*sideLight*.28;
        glass+=microSpec*(.090+.060*sideLight);
        glass+=ice*fresnel*.028;
        float environmentTop=smoothstep(-.38,.86,n.y);
        float environmentSide=smoothstep(.12,.92,abs(n.x));
        glass+=vec3(.030,.040,.043)*environmentTop+vec3(.014,.021,.024)*environmentSide;
        float armorBlock=sat(realArmorPlate+realDarkPlate+crownMask+shoulderMask+jawMask+diamondFace);
        float tissueMask=podMask*(1.0-sat(armorBlock))*(1.0-tendrilMask);
        vec3 tissue=mix(vec3(.014,.019,.022),vec3(.108,.132,.139),.24+.64*ndl+.30*sideLight);
        tissue+=vec3(.010,.013,.015)*(.10+.12*cloud);
        float bodyFacetRand=facetRand;
        float mineralGrain=noise(field*5.8+vec2(vFacet*.17,-vFacet*.11));
        tissue*=.82+.30*bodyFacetRand;
        tissue*=.90+.18*mineralGrain;
        tissue+=steel*(.24+.36*ndl)+ice*.075*specular;
        tissue+=ice*smoothstep(.70,.96,bodyFacetRand)*(.020+.032*ndl);
        tissue+=cyan*fresnel*(.002+.004*visualEnergy);
        glass=mix(glass,tissue,tissueMask*.992);
        glass+=mix(steel,silver,.28)*crownMask*(.11+.16*ndl+.08*specular);
        glass+=mix(steel,silver,.18)*shoulderMask*(.08+.13*ndl+.06*specular);
        glass=mix(glass,steel*(.76+.24*ndl)+silver*.22+ice*.012*specular,realArmorPlate*.94);
        glass=mix(glass,steel*(.72+.36*ndl)+gunmetal*.26+silver*.14*specular,realDarkPlate*.92);
        glass=mix(glass,vec3(.004,.010,.017)+steel*.18,diamondFace*.94);
        glass=mix(glass,steel*.68+silver*.34+ice*.08*specular,diamondFrame*.92);
        glass=mix(glass,steel*.62+silver*.18*specular,cradlePlate*.74);
        glass+=gunmetal*jawMask*.34;
        glass-=vec3(.018,.024,.032)*opticalWell*.92;
        glass+=(ice*.18+cyan*.16)*diamondRim*(.24+.18*specular);
        glass+=cyan*fresnel*(.005+.007*visualEnergy);
        glass+=cyan*veins*(.0014+.0015*uBreath);
        glass+=cyan*membrane*(.0008+.0012*visualEnergy);
        glass+=cyan*iris*.035;
        float lensGlint=pow(max(dot(n,normalize(vec3(-.28,.62,.73)+view)),0.),54.0)*coreDisc;
        glass+=cyan*(rings*.020+nucleus*1.28+irisRays*.018)+ice*(heart*.002+nucleus*.24+coreRing*.31);
        glass=mix(glass,vec3(.001,.002,.003),pupil*.76);
        glass+=cyan*coreDisc*.82+ice*coreDisc*.26;
        glass+=ice*lensGlint*.76;
        glass+=(ice*.30+cyan*.08)*lensCaustic;
        glass+=mix(steel,ice,.28)*coreRing*.34;
        glass+=ice*specular*(.096+.042*visualEnergy);
        glass+=(cyan*.045+ice*.018)*(axisV*.045+axisH*.028)*visualEnergy;
        glass+=(cyan*.014+ice*.008)*dnaHelix*(.006+.008*fresnel)*genomePulse;
        glass+=(ice*.034+cyan*.016)*dnaBridge*(.010+.014*visualEnergy);
        glass+=(cyan*.016+ice*.018)*edge*(.18+.22*(1.0-vMorph));
        glass+=ice*(armorSeam*.050+armorRib*.034)*(1.0-vMorph*.72);
        glass+=(ice*.40+cyan*.18)*surfaceSweep*(.68+.24*fresnel);
        glass=mix(glass,vec3(.008,.020,.024)+steel*.18,tendrilMask*.80);
        glass+=(cyan*.14+ice*.08)*tendrilSegment*(.22+.28*fresnel);
        float alpha=.982+.008*ndl+.005*fresnel+specular*.004+surfaceSweep*.006+tendrilMask*.005;
        ${outputName}=vec4(filmic(glass*(${optics.outerExposure}*.72)),clamp(alpha,.990,.999));
      }`;

    /* R622 constrained-mobile material: same biomechanical identity with a
       cheaper fragment path on low-core / low-memory phones. */
    const constrainedFragmentSource = `${versionLine}precision highp float;
      uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uSiteProgress,uSurfacePulse;
      uniform vec2 uPointer;
      ${fragmentIn} vec3 vNormal;
      ${fragmentIn} vec3 vLocal;
      ${fragmentIn} vec2 vUv;
      ${fragmentIn} vec3 vBary;
      ${fragmentIn} float vFacet;
      ${fragmentIn} float vMorph;
      ${webgl2 ? 'out vec4 outColor;' : ''}
      float sat(float v){return clamp(v,0.,1.);}
      vec3 filmic(vec3 c){return 1.0-exp(-max(c,vec3(0.)));}
      void main(){
        vec3 n=normalize(vNormal);
        vec3 view=normalize(vec3(-vLocal.xy,2.85-vLocal.z));
        vec3 key=normalize(vec3(-.42,.72,.55));
        float ndl=max(dot(n,key),0.);
        float fresnel=pow(1.0-sat(abs(dot(n,view))),1.55);
        float spec=pow(max(dot(n,normalize(key+view)),0.),24.0);
        vec2 heartLocal=vec2(vLocal.x,vLocal.y)-vec2(uPointer.x*.06,uPointer.y*.05);
        float radial=length(heartLocal);
        float angle=atan(heartLocal.y,heartLocal.x);
        float heart=pow(sat(1.0-radial/.45),3.0);
        float nucleus=pow(sat(1.0-radial/.185),4.15);
        float ring=0.0;
        float dnaA=pow(.5+.5*cos(angle-vLocal.y*7.2-uTime*.045),16.0);
        float dnaB=pow(.5+.5*cos(angle-vLocal.y*7.2-uTime*.045-3.14159265),16.0);
        float dna=(dnaA+dnaB)*(.32+.68*fresnel);
        float seam=pow(.5+.5*cos(vUv.x*25.1327+vUv.y*1.1),20.0)*(1.0-vMorph*.72);
        float podMask=1.0-vMorph;
        float cortex=.5+.5*sin(vUv.x*31.4+sin(vUv.y*18.8)*1.35+vUv.y*10.2);
        float cortexGroove=pow(1.0-abs(sin(vUv.x*32.0+vUv.y*12.0)),6.0);
        float diamondCoord=length(vec2(heartLocal.x,heartLocal.y*1.035));
        float diamondFace=(1.0-smoothstep(.128,.198,diamondCoord))*smoothstep(.18,.46,vLocal.z)*podMask;
        float diamondInner=(1.0-smoothstep(.071,.110,diamondCoord))*smoothstep(.18,.46,vLocal.z)*podMask;
        float diamondFrame=max(0.0,diamondFace-diamondInner);
        float diamondRim=(1.0-smoothstep(.005,.014,abs(diamondCoord-.165)))*smoothstep(.18,.46,vLocal.z)*podMask;
        float pupil=1.0-smoothstep(.018,.038,radial);
        float coreDisc=1.0-smoothstep(.038,.078,radial);
        float coreRing=1.0-smoothstep(.006,.016,abs(radial-.072));
        float realArmorPlate=0.0;
        float realDarkPlate=0.0;
        float crownMask=smoothstep(.38,.69,vLocal.y)
          *(1.0-smoothstep(.22,.39,abs(vLocal.x)))*podMask;
        float shoulderMask=smoothstep(.26,.34,abs(vLocal.x))
          *(1.0-smoothstep(.44,.52,abs(vLocal.x)))
          *(1.0-smoothstep(.10,.36,abs(vLocal.y)))*podMask;
        float tendrilMask=smoothstep(.62,.82,length(vLocal.xy))*podMask;
        float tendrilSegment=(.58+.42*(.5+.5*cos(vUv.y*18.85+vUv.x*3.14)))*tendrilMask;
        float pulse=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(vLocal.y*.62+vLocal.x*.14+vLocal.z*.20)*.5;
          float head=mix(-.18,1.18,sat(uSurfacePulse));
          pulse=exp(-pow((coordinate-head)/.065,2.0))*(.35+.65*fresnel);
        }
        float energy=sat(.45+uEnergy*.72);
        vec3 cyan=vec3(.012,.36,.56);
        vec3 violet=vec3(.024,.030,.060);
        vec3 ice=vec3(.44,.53,.55);
        vec3 silver=vec3(.34,.38,.39);
        vec3 steel=vec3(.040,.058,.064);
        vec3 metal=vec3(.004,.007,.009);
        vec3 tissue=mix(vec3(.016,.021,.024),vec3(.112,.135,.141),.30+.60*ndl+.22*fresnel);
        tissue*=1.0-.10*cortexGroove;
        tissue+=steel*cortex*.24;
        vec3 c=mix(metal,tissue,.97);
        c+=ice*fresnel*.028;
        c+=silver*crownMask*(.14+.18*ndl+.08*spec);
        c+=steel*shoulderMask*(.11+.15*ndl+.07*spec);
        c=mix(c,silver*(.86+.76*ndl+.50*spec)+ice*.06*spec,realArmorPlate*.94);
        c=mix(c,metal*.72+steel*.46,realDarkPlate*.90);
        c=mix(c,metal*.66+steel*.34,diamondFace*.90);
        c=mix(c,silver*.70+steel*.18,diamondFrame*.88);
        c+=(ice*.38+cyan*.42)*diamondRim;
        c+=cyan*fresnel*(.010+.012*energy);
        c+=(cyan*.035+violet*.018)*dna*(.008+.010*energy);
        c+=cyan*(nucleus*1.72+ring*.032)+ice*(heart*.006+nucleus*.28+coreRing*.46+spec*.34);
        c=mix(c,metal,pupil*.58);
        c+=cyan*coreDisc*.94+ice*coreDisc*.36;
        c+=cyan*coreRing*.58;
        c+=ice*seam*.026;
        c+=(ice*.44+cyan*.16)*pulse;
        c=mix(c,vec3(.010,.027,.031),tendrilMask*.82);
        c+=(cyan*.20+ice*.12)*tendrilSegment*(.28+.32*fresnel);
        float alpha=.982+.007*ndl+.005*fresnel+nucleus*.006+pulse*.006+tendrilMask*.005+realArmorPlate*.012+realDarkPlate*.010;
        ${outputName}=vec4(filmic(c*1.28),clamp(alpha,.986,.999));
      }`;
    const fragmentSource = (constrainedMobile || auditMode) ? constrainedFragmentSource : fullFragmentSource;

    let pendingProgram;
    try { pendingProgram=beginProgram(gl,vertexSource,fragmentSource); }
    catch(error){
      console.warn('FormatX crystal organism unavailable:',error);
      stage.remove();
      root.dataset.fxCrystalOrganismR326='shader-failed';
      root.dataset.fxCoreReal3d='shader-failed';
      return;
    }

    root.dataset.fxCoreShaderCompileR600 = pendingProgram.parallel ? 'parallel-pending' : 'sync-pending';
    let shaderPollCount = 0;
    function failShader(error) {
      console.warn('FormatX crystal organism unavailable:',error);
      if(stage.isConnected)stage.remove();
      root.dataset.fxCoreShaderCompileR600='failed';
      root.dataset.fxCrystalOrganismR326='shader-failed';
      root.dataset.fxCoreReal3d='shader-failed';
    }
    function finishWhenReady() {
      if(!stage.isConnected)return;
      let program;
      try { program=finishProgram(gl,pendingProgram); }
      catch(error){ failShader(error); return; }
      if(!program){
        shaderPollCount+=1;
        if(shaderPollCount>750){failShader(new Error('crystal organism parallel shader compile timeout'));return;}
        setTimeout(finishWhenReady,16);
        return;
      }
      root.dataset.fxCoreShaderCompileR600 = pendingProgram.parallel ? 'parallel-ready' : 'sync-ready';
      finishBoot(program);
    }
    finishWhenReady();
    return;

    function finishBoot(program) {
    const geometry=buildOrganismGeometry();
    const buffers=geometry.arrays.map(()=>gl.createBuffer());
    const attributeNames=['aSphere','aCrystal','aSphereNormal','aCrystalNormal','aUv','aBary','aFacet'];
    const attributes=attributeNames.map(name=>gl.getAttribLocation(program,name));
    const uniforms={};
    ['uTime','uEnergy','uBreath','uLayer','uMorph','uPointer','uAspect','uSiteProgress','uSurfacePulse','uRotation']
      .forEach(name=>{uniforms[name]=gl.getUniformLocation(program,name);});

    function upload(buffer,data,index,size){
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(index,size,gl.FLOAT,false,0,0);
    }
    gl.useProgram(program);
    buffers.forEach((buffer,index)=>upload(buffer,geometry.arrays[index],attributes[index],geometry.sizes[index]));
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0,0,0,0);

    const controller=new AbortController();
    const listen=(target,type,handler,options={})=>target.addEventListener(type,handler,{...options,signal:controller.signal});
    const delayed=new Set();
    const later=(handler,delay)=>{
      const timer=setTimeout(()=>{delayed.delete(timer);handler();},delay);
      delayed.add(timer);
      return timer;
    };
    const initialShape='crystal';
    root.dataset.fxCoreShapeR337='crystal';
    root.dataset.fxCoreDefaultShapeR1401='irregular-crystal';
    let disposed=false,contextLost=false,visible=true,paused=false;
    let raf=0,burstFrames=0,width=0,height=0,aspect=1,surfaceFrameTimer=0,slowRenderer=constrained;
    let px=0,py=0,tx=0,ty=0;
    let energy=IDLE_ENERGY,targetEnergy=IDLE_ENERGY,breath=.12,targetBreath=.12;
    let morph=initialShape==='sphere'?1:0,targetMorph=morph;
    let rotationX=-.070,rotationY=-.145,rotationZ=.032;
    let targetRotationX=rotationX,targetRotationY=rotationY,targetRotationZ=rotationZ,angularVelocityY=0;
    let siteProgress=0,targetSiteProgress=0;
    let last=performance.now(),simulationTime=0,renderAverage=0;
    let heartbeatTimer=0,surfacePulseTimer=0,autonomousTimer=0,scrollFrame=0,tapCandidate=null;
    let surfacePulseStart=-Infinity,lastSurfacePulseAt=-Infinity,surfacePulseCount=0;
    let activeOrgan='hero',shapeLockUntil=0;
    const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};
    cinematic.version=REVISION;
    cinematic.corePosition=[0,0,.52];

    function resize(){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return false;
      const cap=auditMode?1:constrainedMobile?1.12:mobile?1.50:constrained?1.15:1.65;
      const dpr=Math.min(devicePixelRatio||1,cap);
      const budget=auditMode?390000:constrainedMobile?340000:mobile?760000:constrained?520000:1150000;
      let w=Math.max(2,Math.round(rect.width*dpr));
      let h=Math.max(2,Math.round(rect.height*dpr));
      if(w*h>budget){const k=Math.sqrt(budget/(w*h));w=Math.round(w*k);h=Math.round(h*k);}
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      width=w;height=h;aspect=rect.width/Math.max(1,rect.height);gl.viewport(0,0,w,h);
      root.dataset.fxCoreReal3dResolution=`${w}x${h}`;
      root.dataset.fxCoreReal3dScale=(w/Math.max(1,rect.width)).toFixed(2);
      root.dataset.fxCoreViewportAspect=aspect.toFixed(4);
      return true;
    }

    function blocked(){return disposed||contextLost||document.hidden||!visible||paused||root.dataset.fxReferenceMotionPaused==='true';}
    function queueFrame(delay=0){
      if(blocked()||raf)return;
      if(delay<=0){
        if(surfaceFrameTimer){clearTimeout(surfaceFrameTimer);delayed.delete(surfaceFrameTimer);surfaceFrameTimer=0;}
        last=performance.now();raf=requestAnimationFrame(frame);return;
      }
      if(surfaceFrameTimer)return;
      surfaceFrameTimer=later(()=>{
        surfaceFrameTimer=0;
        if(!blocked()&&!raf){last=performance.now();raf=requestAnimationFrame(frame);}
      },delay);
    }
    function schedule(frames=1){
      if(blocked())return;
      const frameCap=mobile?4:24;
      burstFrames=Math.max(burstFrames,Math.min(frameCap,Math.max(1,frames)));
      queueFrame(0);
    }
    function boost(value=.84,frames=8){
      targetEnergy=Math.max(targetEnergy,value);
      targetBreath=Math.max(targetBreath,.38+value*.48);
      schedule(reduced.matches?1:frames);
    }
    function shapeName(value=targetMorph){return value>=.5?'sphere':'crystal';}
    function publishShape(source='renderer'){
      const target=shapeName();
      const settled=Math.abs(morph-targetMorph)<.008;
      root.dataset.fxCoreShapeR337=target;
      root.dataset.fxCoreTargetShape=target;
      root.dataset.fxCoreShape=settled?target:`morphing-to-${target}`;
      root.dataset.fxCoreMorph=morph.toFixed(3);
      root.dataset.fxCoreMorphSource=source;
      root.dataset.fxCoreMorphEngine='native-webgl-closed-volume-r413';
      stage.dataset.shape=root.dataset.fxCoreShape;
    }
    function setMorph(value,source='api-morph',announce=true){
      const next=clamp(Number(value)||0,0,1);
      const changed=Math.abs(next-targetMorph)>.001;
      targetMorph=next;
      if(/mag-button|api|keyboard|core-tap/.test(source))shapeLockUntil=performance.now()+7600;
      if(reduced.matches)morph=targetMorph;
      publishShape(source);
      const cinematicBirth=/^r533-/.test(source);
      boost(changed?1.04:.68,cinematicBirth?1:(changed?8:3));
      if(changed&&announce)dispatchEvent(new CustomEvent('formatx:coreshapechange',{detail:{
        shape:shapeName(next),source,revision:'r413',renderer:VERSION,geometry:'closed-3d-volume'
      }}));
      return targetMorph;
    }
    function setShape(shape,source='api'){return setMorph(shape==='sphere'||shape===1||shape===true?1:0,source,true);}
    function toggleShape(source='interaction'){return setShape(targetMorph>=.5?'crystal':'sphere',source);}
    function rotateBy(x,y,source='api-rotate'){
      targetRotationX=clamp(targetRotationX+x,-1.02,1.02);
      targetRotationY+=y;
      root.dataset.fxCoreRotationSource=source;
      boost(.84,mobile?5:8);
    }

    /* heartbeat-and-interaction-bursts-no-idle-loop-r326.
       R484 has one bounded native surface sweep every five to six seconds.
       Its timeout is suspended when hidden, offscreen, user-paused or reduced.
       Between sweeps the renderer returns to zero idle frames. */
    function scheduleHeartbeat(){
      clearTimeout(heartbeatTimer);heartbeatTimer=0;
      root.dataset.fxCoreIdleHeartbeatR441='disabled-no-continuous-rendering';
    }
    function startSurfacePulse(source='autonomous'){
      const now=performance.now();
      const explicitInteraction=/interaction|direct|shape|tap|keyboard|r538|r619/i.test(String(source||''));
      if(disposed||contextLost||reduced.matches||document.hidden||!visible||paused
        ||document.querySelector('.fx-reference-pause')?.dataset.paused==='true'
        ||(!explicitInteraction&&now-lastSurfacePulseAt<2200))return false;
      // The mobile governor's idle flag is not the user's PAUSE control.
      // Reserve the full sweep before asking the single renderer to draw it.
      dispatchEvent(new CustomEvent('formatx:coresurfacesweep',{
        detail:{phase:'start',source,duration:SURFACE_PULSE_WINDOW_MS}
      }));
      if(blocked())return false;
      surfacePulseStart=lastSurfacePulseAt=now;
      surfacePulseCount+=1;
      const pulseId=surfacePulseCount;
      targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.24);
      targetBreath=Math.max(targetBreath,.42);
      root.dataset.fxCoreSurfacePulseR454=`sweep-${surfacePulseCount}-${source}`;
      root.dataset.fxCoreEnergyBoltR455=`surface-sweep-${source}-${surfacePulseCount}`;
      root.dataset.fxCoreSurfaceCountR484=String(surfacePulseCount);
      // surfacePulseActive keeps RAF alive for the bounded duration. Do not
      // leave a second frame quota behind it on slower desktop renderers.
      schedule(1);
      later(()=>{
        if(pulseId!==surfacePulseCount)return;
        surfacePulseStart=-Infinity;
        if(surfaceFrameTimer){clearTimeout(surfaceFrameTimer);delayed.delete(surfaceFrameTimer);surfaceFrameTimer=0;}
        root.dataset.fxCoreSurfacePulseR454='idle';
        schedule(1);
        dispatchEvent(new CustomEvent('formatx:coresurfacesweep',{
          detail:{phase:'end',source,duration:SURFACE_PULSE_WINDOW_MS}
        }));
      },SURFACE_PULSE_WINDOW_MS);
      return true;
    }
    function scheduleSurfacePulse(){
      clearTimeout(surfacePulseTimer);surfacePulseTimer=0;
      if(auditMode){
        root.dataset.fxCoreSurfaceSchedulerR484='lighthouse-audit-disabled';
        return;
      }
      if(disposed||contextLost||reduced.matches||document.hidden||!visible||paused
        ||document.querySelector('.fx-reference-pause')?.dataset.paused==='true'){
        root.dataset.fxCoreSurfaceSchedulerR484='suspended';
        return;
      }
      // R588: the first autonomous sweep is a post-interactive warm-up.
      // The CSS heartbeat and direct interaction remain immediate, while the
      // expensive native sweep no longer competes with first-load interactivity.
      const delay=surfacePulseCount===0
        ? 13000
        : (mobile?5400:4900)+(surfacePulseCount%3)*520;
      root.dataset.fxCoreSurfaceSchedulerR484='armed-single-native-timer';
      surfacePulseTimer=setTimeout(()=>{
        surfacePulseTimer=0;
        startSurfacePulse('autonomous');
        scheduleSurfacePulse();
      },delay);
    }
    function scheduleAutonomousMorph(){
      clearTimeout(autonomousTimer);autonomousTimer=0;
      root.dataset.fxCoreAutonomousMorphR441='disabled-until-explicit-interaction';
    }

    function render(now){
      const begin=performance.now();
      const dt=Math.min(48,Math.max(1,now-last));last=now;
      if(!reduced.matches)simulationTime+=dt*.001;
      const pointerEase=1-Math.exp(-dt*.018);
      const rotationEase=1-Math.exp(-dt*.011);
      px+=(tx-px)*pointerEase;py+=(ty-py)*pointerEase;
      rotationX+=(targetRotationX-rotationX)*rotationEase;
      rotationY+=(targetRotationY-rotationY)*rotationEase;
      rotationZ+=(targetRotationZ-rotationZ)*rotationEase;
      if(Math.abs(angularVelocityY)>.00002){targetRotationY+=angularVelocityY*dt;angularVelocityY*=Math.exp(-dt*.010);}
      energy+=(targetEnergy-energy)*(1-Math.exp(-dt*.026));
      breath+=(targetBreath-breath)*(1-Math.exp(-dt*.032));
      targetEnergy+=(IDLE_ENERGY-targetEnergy)*(1-Math.exp(-dt*.006));
      targetBreath+=(.12-targetBreath)*(1-Math.exp(-dt*.007));
      morph+=(targetMorph-morph)*(reduced.matches?1:1-Math.exp(-dt*.0078));
      if(Math.abs(morph-targetMorph)<.0008)morph=targetMorph;
      siteProgress+=(targetSiteProgress-siteProgress)*(1-Math.exp(-dt*.005));
      cinematic.energy=energy;
      cinematic.openness=.08+breath*.025;
      cinematic.corePosition=[px*.055,-py*.045,.52+energy*.012];
      cinematic.morph=morph;
      cinematic.shape=shapeName();
      cinematic.rotation=[rotationX,rotationY,rotationZ];
      cinematic.siteProgress=siteProgress;
      publishShape();

      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(uniforms.uTime,simulationTime);
      gl.uniform1f(uniforms.uEnergy,energy);
      gl.uniform1f(uniforms.uBreath,breath);
      gl.uniform1f(uniforms.uMorph,morph);
      gl.uniform2f(uniforms.uPointer,px,py);
      gl.uniform3f(uniforms.uRotation,rotationX,rotationY,rotationZ);
      gl.uniform1f(uniforms.uAspect,aspect);
      gl.uniform1f(uniforms.uSiteProgress,siteProgress);
      const surfacePulseElapsed=(now-surfacePulseStart)/SURFACE_PULSE_WINDOW_MS;
      const surfacePulse=surfacePulseElapsed>=0&&surfacePulseElapsed<=1?surfacePulseElapsed:-1;
      gl.uniform1f(uniforms.uSurfacePulse,surfacePulse);

      /* R1450 — one solid outer pass on every device.
         The old additive inner/front passes made the crystal look translucent,
         bruised and overexposed on desktop. All optical detail now lives in the
         physically coherent outer shader, which is also cheaper and crisper. */
      gl.depthMask(true);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.cullFace(gl.BACK);
      gl.uniform1f(uniforms.uLayer,0);
      gl.drawArrays(gl.TRIANGLES,0,geometry.count);
      root.dataset.fxCorePassModelR1450='single-solid-outer-pass';

      const ms=performance.now()-begin;
      renderAverage=renderAverage?renderAverage*.82+ms*.18:ms;
      if(renderAverage>(mobile?24:42)){
        slowRenderer=true;
        root.dataset.fxCoreAdaptiveOpticsR588=mobile?'one-pass-mobile-slow-renderer':'two-pass-slow-renderer';
        root.dataset.fxCoreSurfaceCadenceR1392=mobile?'bounded-slow-renderer-full-window':'desktop-bounded';
        root.dataset.fxCoreSurfaceCadenceR1403=mobile?'full-window-fast-cadence':'desktop-bounded';
        root.dataset.fxCoreSurfaceCadenceR1441=mobile?'midpoint-safe-68ms-cap':'desktop-bounded';
      }else if(!slowRenderer){
        root.dataset.fxCoreAdaptiveOpticsR588=mobile?'two-pass-mobile-capable':'three-pass-capable';
      }
      root.dataset.fxCoreRenderMs=renderAverage.toFixed(2);
      root.dataset.fxCoreFrameMs=dt.toFixed(2);
      root.dataset.fxCoreReal3dFps=String(Math.min(60,Math.round(1000/Math.max(16.67,renderAverage))));
    }

    function settleAfterBurst(){
      px=tx;py=ty;
      rotationX=targetRotationX;rotationY=targetRotationY;rotationZ=targetRotationZ;
      angularVelocityY=0;
      energy=targetEnergy=IDLE_ENERGY;
      breath=targetBreath=.12;
      morph=targetMorph;
      siteProgress=targetSiteProgress;
      cinematic.energy=energy;
      cinematic.openness=.08+breath*.025;
      cinematic.corePosition=[px*.055,-py*.045,.52+energy*.012];
      cinematic.morph=morph;
      cinematic.shape=shapeName();
      cinematic.rotation=[rotationX,rotationY,rotationZ];
      cinematic.siteProgress=siteProgress;
      publishShape('burst-settle-r442');
      root.dataset.fxCoreIdleRenderR441='zero-frame';
    }

    function frame(now){
      raf=0;if(blocked())return;
      render(now);burstFrames=Math.max(0,burstFrames-1);
      const surfacePulseActive=now-surfacePulseStart>=0&&now-surfacePulseStart<=SURFACE_PULSE_WINDOW_MS;
      if(burstFrames>0){
        const burstDelay=renderAverage>42?Math.min(260,Math.max(80,renderAverage*2.2)):0;
        queueFrame(burstDelay);
      }else if(surfacePulseActive){
        const sweepDelay=mobile
          ? (renderAverage>34?Math.min(68,Math.max(24,renderAverage*.34)):0)
          : (renderAverage>60?Math.min(96,Math.max(32,renderAverage*.35)):0);
        root.dataset.fxCoreAdaptiveSurfaceCadenceR588=sweepDelay?('paced-'+Math.round(sweepDelay)+'ms'):'native-raf';
        root.dataset.fxCoreSurfaceCadenceR643=mobile?'mobile-budget-preserved':'desktop-midpoint-safe-bounded-no-idle';
        queueFrame(sweepDelay);
      }else settleAfterBurst();
    }

    function point(event){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return null;
      return{x:clamp(((event.clientX-rect.left)/rect.width-.5)*2,-1,1),y:clamp(-((event.clientY-rect.top)/rect.height-.5)*2,-1,1)};
    }
    function onMove(event){if(event.pointerType==='touch')return;const q=point(event);if(!q)return;tx=q.x;ty=q.y;targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.12);schedule(2);}
    function onDown(event){const q=point(event);if(q){tx=q.x;ty=q.y;}shapeLockUntil=performance.now()+4800;boost(.82,mobile?4:6);}
    function onLeave(){tx=0;ty=0;targetEnergy=IDLE_ENERGY;targetBreath=.12;schedule(2);}
    function pulse(detail){
      if(Number.isFinite(detail?.x))tx=clamp(detail.x,-1,1);
      if(Number.isFinite(detail?.y))ty=clamp(detail.y,-1,1);
      const drag=detail?.phase==='drag';
      targetEnergy=Math.max(targetEnergy,drag ? .58 : .88);
      targetBreath=Math.max(targetBreath,drag ? .58 : .92);
      cinematic.corePosition=[tx*.055,-ty*.045,.52+targetEnergy*.012];
      cinematic.interaction=[tx,ty];
      cinematic.lastInteractionAt=performance.now();
      root.dataset.fxCoreInteractionStateR454=`${detail?.phase||'pulse'}-synced`;
      schedule(drag?(mobile?3:5):(mobile?8:14));
    }
    function onCoreInteraction(event){
      const detail=event.detail||{};pulse(detail);
      const x=Number(detail.x)||0,y=Number(detail.y)||0;
      if(detail.phase==='press')tapCandidate={x,y,lastX:x,lastY:y,started:performance.now(),moved:false};
      else if(detail.phase==='drag'&&tapCandidate){
        const totalX=x-tapCandidate.x,totalY=y-tapCandidate.y;
        const deltaX=x-tapCandidate.lastX,deltaY=y-tapCandidate.lastY;
        tapCandidate.lastX=x;tapCandidate.lastY=y;
        if(Math.hypot(totalX,totalY)>.075)tapCandidate.moved=true;
        targetRotationY+=deltaX*2.4;
        targetRotationX=clamp(targetRotationX-deltaY*1.8,-1.02,1.02);
        angularVelocityY=deltaX*.020;
      }else if(detail.phase==='release'){
        const candidate=tapCandidate;tapCandidate=null;
        if(candidate&&!candidate.moved&&performance.now()-candidate.started<720)toggleShape('core-tap');
      }else if(detail.phase==='cancel')tapCandidate=null;
    }
    function onPause(event){
      paused=event.detail?.paused===true||root.dataset.fxReferenceMotionPaused==='true';
      if(paused){
        surfacePulseStart=-Infinity;
        root.dataset.fxCoreSurfacePulseR454='idle';
        if(!disposed&&!contextLost&&resize())render(performance.now());
      }else schedule(1);
      scheduleSurfacePulse();
    }
    function onReducedMotionChange(){
      clearTimeout(surfacePulseTimer);surfacePulseTimer=0;
      surfacePulseStart=-Infinity;
      root.dataset.fxCoreSurfacePulseR454='idle';
      scheduleSurfacePulse();
      schedule(1);
    }
    function onScroll(){
      if(scrollFrame)return;
      scrollFrame=requestAnimationFrame(()=>{
        scrollFrame=0;
        const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);
        targetSiteProgress=clamp(scrollY/range,0,1);
        root.dataset.fxCoreSiteProgress=targetSiteProgress.toFixed(3);
        targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.08+Math.sin(targetSiteProgress*Math.PI)*.12);
        schedule(mobile?1:2);
      });
    }
    function signalShape(shape,source){
      if(performance.now()<shapeLockUntil)return;
      setShape(shape,source);
    }

    listen(hero,'pointermove',onMove,{passive:true});
    listen(hero,'pointerdown',onDown,{passive:true});
    listen(hero,'pointerleave',onLeave,{passive:true});
    listen(window,'formatx:coreinteraction',onCoreInteraction,{passive:true});
    listen(window,'formatx:referencepause',onPause,{passive:true});
    listen(reduced,'change',onReducedMotionChange,{passive:true});
    listen(window,'scroll',onScroll,{passive:true});
    listen(window,'resize',resize,{passive:true});
    listen(window,'orientationchange',resize,{passive:true});
    listen(window,'formatx:organismpanelopen',()=>signalShape('sphere','organism-listening'),{passive:true});
    listen(window,'formatx:organismresponse',()=>signalShape('crystal','organism-response'),{passive:true});
    listen(window,'formatx:open-live-os',()=>signalShape('sphere','live-os-open'),{passive:true});
    listen(window,'formatx:loop',()=>{signalShape('crystal','site-loop');boost(.92,mobile?4:6);},{passive:true});
    listen(window,'formatx:menustatechange',event=>{boost(event.detail?.open ? .76 : .52,mobile?2:4);},{passive:true});
    listen(window,'formatx:languagechange',()=>boost(.62,mobile?2:3),{passive:true});
    listen(document,'visibilitychange',()=>{
      if(!document.hidden)schedule(1);
      scheduleSurfacePulse();
    },{passive:true});
    listen(document,'click',event=>{
      if(!(event.target instanceof Element))return;
      const action=event.target.closest('a,button,[role="button"]');
      if(!action||action.closest('.fx-reference-mag-button'))return;
      if(action.matches('.fx-reference-ask,[data-fx-organism-question]'))signalShape('sphere','site-question');
      else if(action.matches('a[href*="download"],[data-release-download]'))signalShape('crystal','release-action');
      boost(action.matches('a[href*="download"],[data-release-download]') ? .92 : .62,mobile?2:4);
    },{passive:true});
    listen(document,'focusin',event=>{
      if(event.target instanceof Element&&event.target.matches('a,button,input,select,textarea,[tabindex]'))boost(.48,mobile?1:2);
    },{passive:true});
    listen(canvas,'webglcontextlost',event=>{
      event.preventDefault();contextLost=true;if(raf)cancelAnimationFrame(raf);raf=0;
      scheduleSurfacePulse();
      root.dataset.fxCoreReal3d='context-lost';root.dataset.fxCrystalOrganismR326='context-lost';
    });
    listen(canvas,'webglcontextrestored',()=>{
      root.dataset.fxCrystalOrganismR326='restoring';destroy();requestAnimationFrame(()=>boot());
    });

    const ro=new ResizeObserver(()=>{if(resize())schedule(1);});
    ro.observe(stage);
    const io=new IntersectionObserver(entries=>{
      visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>.04);
      if(visible)schedule(1);else if(raf){cancelAnimationFrame(raf);raf=0;}
      scheduleSurfacePulse();
    },{threshold:[0,.04]});
    io.observe(stage);
    const sectionShapes={hero:'crystal',experience:'sphere',capabilities:'crystal',pricing:'sphere',system:'crystal',resources:'sphere'};
    const organObserver=new IntersectionObserver(entries=>{
      const candidate=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      const id=candidate?.target?.id;
      if(!id||id===activeOrgan)return;
      activeOrgan=id;root.dataset.fxCoreActiveOrgan=id;cinematic.activeOrgan=id;
      if(sectionShapes[id])signalShape(sectionShapes[id],'site-section');
      boost(.54,mobile?2:3);
    },{rootMargin:'-22% 0px -54% 0px',threshold:[0,.15,.35,.6]});
    document.querySelectorAll('main > section[id],main section.scene[id]').forEach(section=>organObserver.observe(section));

    function destroy(){
      if(disposed)return;disposed=true;
      clearTimeout(heartbeatTimer);clearTimeout(surfacePulseTimer);clearTimeout(autonomousTimer);delayed.forEach(clearTimeout);delayed.clear();
      if(raf)cancelAnimationFrame(raf);if(scrollFrame)cancelAnimationFrame(scrollFrame);
      controller.abort();ro.disconnect();io.disconnect();organObserver.disconnect();
      if(!contextLost){buffers.forEach(buffer=>gl.deleteBuffer(buffer));gl.deleteProgram(program);}
      stage.remove();
      if(window.FormatXCoreMobileV69?.destroy===destroy)delete window.FormatXCoreMobileV69;
      if(window.FormatXLivingCore?.destroy===destroy)delete window.FormatXLivingCore;
    }

    resize();
    const publicApi={
      version:VERSION,
      revision:REVISION,
      renderer:'single-webgl-crystal-organism-r326',
      material:'biomechanical-gunmetal-living-core-r614',
      geometry:'armored-four-lobe-core-with-native-tendrils-r614',
      referenceGeometry:'unified-armored-diamond-pod-r669',
      referenceGeometryR730:'compact-dark-armored-pod-eight-radial-native-tendrils',
      referenceGeometryR1080:'tall-rhombic-armored-pod-silver-crown-large-optical-core-long-segmented-tendrils',
      referenceGeometryR1100:'single-draw-rhombic-pod-real-silver-crown-shoulders-dark-jaw',
      referenceGeometryR1120:'compact-titanium-crown-shoulders-dark-jaw-large-cyan-eye',
      referenceGeometryR1150:'integrated-dark-titanium-armor-compact-optical-core',
      referenceGeometryR1220:'broad-split-titanium-crown-wide-shoulders-large-cyan-optical-core-dark-segmented-tendrils',
      referenceGeometryR1310:'compact-dark-shoulders-local-silver-crown-small-blue-optical-core-short-tendrils',
      referenceGeometryR1260:'tall-narrow-armored-pod-bright-titanium-crown-large-blue-optical-core-reference-tendrils',
      referenceGeometryR810:'opaque-gunmetal-compact-pod-silver-crown-local-cyan-eye-short-tendrils',
      referenceGeometryR830:'narrow-silver-crown-compact-thick-cyan-segmented-native-tendrils-single-optical-orb',
      referenceGeometryR910:'broad-shoulder-compact-armored-pod-large-optical-orb-short-segmented-tendrils',
      referenceGeometryR951:'r950-matched-tall-armored-pod-large-optical-orb-native-tendrils',
      referenceGeometryR1010:'pointed-armored-diamond-pod-bright-silver-crown-large-blue-optical-core-long-segmented-tendrils',
      referenceGeometryR1030:'compact-rounded-diamond-pod-local-silver-crown-shoulders-medium-cyan-eye-segmented-tendrils',
      referenceGeometryR1050:'closed-dark-armored-pod-small-silver-crown-shoulders-medium-optical-eye-controlled-tendrils',
      referenceGeometryR1070:'smooth-closed-biomechanical-pod-local-silver-armor-recessed-cyan-eye-eight-tendrils',
      genome:'native-double-helix-energy-lattice-r614',
      scheduler:'interaction-bursts-idle-zero-frame-r441',
      pulse,
      surfacePulse:source=>startSurfacePulse(typeof source==='string'?source:'api'),
      surfacePulseDurationMs:SURFACE_PULSE_WINDOW_MS,
      setMorph:(value,source)=>setMorph(value,source||'api-morph',true),
      setShape:(shape,source)=>setShape(shape,source||'api-set'),
      toggleShape:source=>toggleShape(source||'api-toggle'),
      rotateBy:(x,y,source)=>rotateBy(Number(x)||0,Number(y)||0,source||'api-rotate'),
      requestRender:schedule,
      destroy,
      canvas,
      stage,
      get energy(){return energy;},
      get openness(){return .08+breath*.025;},
      get morph(){return morph;},
      get shape(){return shapeName();},
      get rotation(){return[rotationX,rotationY,rotationZ];},
      get vertexCount(){return geometry.count;}
    };
    window.FormatXCoreMobileV69=publicApi;
    window.FormatXLivingCore=publicApi;

    root.dataset.fxCrystalOrganismR326='ready';
    root.dataset.fxLivingOrganicCoreR413='ready';
    root.dataset.fxLivingOrganicCoreR454='luminous-electric-single-webgl-ready';
    root.dataset.fxCoreMobileR99=READY;
    root.dataset.fxCoreMobileV69=READY;
    root.dataset.fxCoreMobileV55='ready-v55';
    root.dataset.fxCoreReferenceLock=READY;
    root.dataset.fxCoreReal3d=READY;
    root.dataset.fxCoreRenderer='single-webgl-crystal-organism-r326';
    root.dataset.fxCoreCapabilityTierR620=constrainedMobile?'mobile-constrained-one-pass':constrained?'desktop-constrained-two-pass':mobile?'mobile-full-two-pass':'desktop-full-three-pass';
    root.dataset.fxCoreCapabilityR620=`${hardwareConcurrency}c-${deviceMemory}gb`;
    root.dataset.fxCoreMaterial='biomechanical-gunmetal-living-core-r614';
    root.dataset.fxCoreGeometry='armored-four-lobe-core-with-native-tendrils-r614';
    root.dataset.fxCoreGenesisMagR614='dna-to-cell-to-biomechanical-native-mag';
    root.dataset.fxCoreNativeTendrilsR614=String(geometry.tendrils||0);
    root.dataset.fxCoreGenomeR614='native-double-helix-energy-lattice';
    root.dataset.fxCoreGenomeContinuityR614='r533-dna-genesis-to-same-r326-native-core';
    root.dataset.fxCoreRendererVersion=REVISION;
    root.dataset.fxCoreGeometryTopology=geometry.topology;
    root.dataset.fxCoreVertexCount=String(geometry.count);
    root.dataset.fxCoreDimension='native-closed-3d-volume-r413';
    root.dataset.fxCoreMorphGeometryR413='closed-sphere-and-four-tip-crystal-same-topology';
    root.dataset.fxCoreMorphNormalsR413='sphere-smooth-to-crystal-faceted-native-shader';
    root.dataset.fxCoreReferenceGeometry='armored-four-lobe-core-native-tendrils-r614';
    root.dataset.fxCoreReferenceGeometryR669='unified-armored-diamond-pod-silver-crown-cyan-optical-well-native-tendrils';
    root.dataset.fxCoreReferenceGeometryR673='convex-compact-armored-pod-no-star-silhouette';
    root.dataset.fxCoreReferenceGeometryR730='compact-dark-armored-pod-eight-radial-native-tendrils';
    root.dataset.fxCoreReferenceGeometryR1080='tall-rhombic-armored-pod-silver-crown-large-optical-core-long-segmented-tendrils';
    root.dataset.fxCoreReferenceGeometryR1100='single-draw-rhombic-pod-real-silver-crown-shoulders-dark-jaw';
    root.dataset.fxCoreReferenceGeometryR1120='compact-titanium-crown-shoulders-dark-jaw-large-cyan-eye';
    root.dataset.fxCoreReferenceGeometryR1150='integrated-dark-titanium-armor-compact-optical-core';
    root.dataset.fxCoreReferenceGeometryR1220='broad-split-titanium-crown-wide-shoulders-large-cyan-optical-core-dark-segmented-tendrils';
    root.dataset.fxCoreReferenceGeometryR1310='compact-dark-shoulders-local-silver-crown-small-blue-optical-core-short-tendrils';
    root.dataset.fxCoreReferenceMaterialR1310='opaque-gunmetal-dark-side-armor-local-titanium-crown-controlled-cyan-eye';
    root.dataset.fxCoreReferenceGeometryR1500='single-asymmetric-faceted-mineral-body-integrated-lens-eight-tendrils';
    root.dataset.fxCoreReferenceMaterialR1500='photoreal-obsidian-mineral-localized-optical-emission';
    root.dataset.fxCoreOpticsR1500='neutral-mineral-keylight-local-emission-no-css-glow';
    root.dataset.fxCoreSurfaceEnergyR1503='localized-travelling-electric-sweep-visible-then-zero-idle';
    root.dataset.fxCoreOpticsR1510='physical-lens-no-hud-rings-no-crosshair-mineral-dominant';
    root.dataset.fxCoreOpticsR1520='visible-neutral-mineral-facets-irregular-silhouette-no-orbit-ring';
    root.dataset.fxCoreOpticsR1530='ggx-microfacet-obsidian-physical-lens-controlled-fresnel';
    root.dataset.fxCoreHabitatR1530='continuous-page-living-habitat-integration';
    root.dataset.fxCoreOpticsR1531='exposed-mineral-facets-round-recessed-optical-socket-no-hud-diamond';
    root.dataset.fxCoreReferenceGeometryR1260='tall-narrow-armored-pod-bright-titanium-crown-large-blue-optical-core-reference-tendrils';
    root.dataset.fxCoreReferenceMaterialR1260='opaque-gunmetal-bright-titanium-panels-local-blue-optical-core';
    root.dataset.fxCoreReferenceMaterialR1220='opaque-gunmetal-bright-titanium-armor-local-blue-optic-dark-tendrils';
    root.dataset.fxCoreReferenceMaterialR1080='opaque-gunmetal-bright-silver-local-cyan-eye';
    root.dataset.fxCoreReferenceGeometryR810='opaque-gunmetal-compact-pod-silver-crown-local-cyan-eye-short-tendrils';
    root.dataset.fxCoreReferenceGeometryR830='narrow-silver-crown-compact-thick-cyan-segmented-native-tendrils-single-optical-orb';
    root.dataset.fxCoreReferenceGeometryR910='broad-shoulder-compact-armored-pod-large-optical-orb-short-segmented-tendrils';
    root.dataset.fxCoreReferenceGeometryR951='r950-matched-tall-armored-pod-large-optical-orb-native-tendrils';
    root.dataset.fxCoreReferenceGeometryR1010='pointed-armored-diamond-pod-bright-silver-crown-large-blue-optical-core-long-segmented-tendrils';
    root.dataset.fxCoreReferenceGeometryR1030='compact-rounded-diamond-pod-local-silver-crown-shoulders-medium-cyan-eye-segmented-tendrils';
    root.dataset.fxCoreReferenceGeometryR1050='closed-dark-armored-pod-small-silver-crown-shoulders-medium-optical-eye-controlled-tendrils';
    root.dataset.fxCoreReferenceGeometryR1070='smooth-closed-biomechanical-pod-local-silver-armor-recessed-cyan-eye-eight-tendrils';
    root.dataset.fxCoreReferenceMaterialR1070='dark-opaque-pod-local-silver-crown-shoulders-recessed-cyan-core';
    root.dataset.fxCoreReferenceMaterialR1050='dark-opaque-gunmetal-local-silver-panels-local-cyan-eye';
    root.dataset.fxCoreReferenceMaterialR1030='dark-gunmetal-localized-silver-panels-controlled-cyan-optical-core';
    root.dataset.fxCoreReferenceMaterialR1010='near-opaque-gunmetal-bright-silver-panels-local-cyan-optical-core';
    root.dataset.fxCoreReferenceMaterialR910='opaque-gunmetal-shoulders-small-silver-crown-blue-optical-orb';
    root.dataset.fxCoreReferenceMaterialR830='opaque-gunmetal-local-blue-optical-core-segmented-tendril-energy';
    root.dataset.fxCoreReferenceMaterialR810='near-opaque-dark-armor-silver-crown-local-cyan-optical-core';
    root.dataset.fxCoreReferenceMaterialR730='opaque-gunmetal-silver-crown-local-cyan-optical-core';
    root.dataset.fxCoreReferenceMaterial='dark-metal-ice-cyan-living-core-r614';
    root.dataset.fxCoreReferenceMaterialR669='gunmetal-silver-cyan-armored-living-pod';
    root.dataset.fxCoreReferenceMaterialR673='dark-gunmetal-local-cyan-optical-core';
    root.dataset.fxCoreInteractionVisual='pointer-drag-tap-keyboard-scroll-site-state-r413';
    root.dataset.fxCoreLivingBehavior='interaction-and-intermittent-native-electric-surface-r454';
    root.dataset.fxCoreSiteRole='primary-living-site-interface-r413';
    root.dataset.fxCoreContexts='1';
    root.dataset.fxCoreScheduler='interaction-bursts-idle-zero-frame-r441';
    root.dataset.fxCoreSchedulerCompatibility='heartbeat-and-interaction-bursts-no-idle-loop-r326';
    root.dataset.fxCoreSchedulerR442='mobile-two-pass-lower-density-idle-zero';
    root.dataset.fxCoreCompositionR285='pure-webgl3d-no-2d-overlays';
    root.dataset.fxCoreCompositionRevisionR326='new-crystal-organism-no-legacy-fallback';
    root.dataset.fxCoreMobileVisualR326=mobile?'soft-translucent-organic-rim':'desktop-translucent-organic-rim';
    root.dataset.fxCoreMobileLightingR375=mobile?'superseded-r454-luminous-native-webgl':'desktop-r454-luminous-native-webgl';
    root.dataset.fxCoreMobileOpticsR414=mobile?'superseded-r454-native-shader-optics':'desktop-r454-native-shader-optics';
    root.dataset.fxCoreVisualR424=mobile?'r454-luminous-translucent-electric-caustics':'desktop-r454-luminous-electric-caustics';
    root.dataset.fxCoreVisualR440=mobile?'superseded-by-r454-sharp-readable-living-volume':'desktop-superseded-by-r454';
    root.dataset.fxCoreMobileLightingR374=mobile?'idle-visible-high-density-r454':'desktop-high-contrast-volume-r454';
    root.dataset.fxCoreOpticsR424='native-webgl-filmic-caustics-no-bitmap-no-css-core';
    root.dataset.fxCoreOpticsR454='single-luminous-webgl-material-owner';
    root.dataset.fxCoreSurfaceMotionR454='intermittent-native-electric-filament-every-five-to-six-seconds';
    root.dataset.fxCoreSurfacePulseR454='idle';
    root.dataset.fxCoreSurfaceEnergyR484='periodic-native-surface-energy';
    root.dataset.fxCoreSurfaceCountR484='0';
    if(constrainedMobile){
      /* R624: the authored constrained shader already implements the R465
         low-bloom / no-edge / no-noise material contract directly. The legacy
         precompile hook cannot pattern-patch that intentionally smaller shader,
         so publish the same semantic surface contract from the real renderer. */
      root.dataset.fxCoreSurfaceR456='r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics';
      root.dataset.fxCoreMobileSurfaceR456=root.dataset.fxCoreSurfaceR456;
      root.dataset.fxCoreNormalR456='continuous-volume-99.8-percent-smooth';
      root.dataset.fxCoreMobileNormalR456=root.dataset.fxCoreNormalR456;
      root.dataset.fxCoreTriangleEdgesR456='disabled';
      root.dataset.fxCoreMobileTriangleEdgesR456='disabled';
      root.dataset.fxCoreOuterNoiseR456='disabled-on-glass-shell';
      root.dataset.fxCoreInnerLifeR456='preserved-low-cost-mobile-field';
      root.dataset.fxCoreSpecularR456='soft-broad-low-gain-highlight-r465';
      root.dataset.fxCoreMobileOpticalBalanceR465='soft-perimeter-low-bloom-low-cost-shader';
      root.dataset.fxCoreConstrainedSurfaceOwnerR624='native-r326-equivalent-r465-contract';
    }
    root.dataset.fxCoreMobileResolutionR424=mobile?'r1383-dpr-cap-1.50-pixel-budget-760k-adaptive':'r454-desktop-dpr-cap-1.65-pixel-budget-1150k';
    root.dataset.fxCoreMobileOpticsR435=mobile?'superseded-by-r454-visible-native-surface':'desktop-preserved-r454';
    root.dataset.fxCoreMobileOpticsR440=mobile?'superseded-by-r454-luminous-electric-surface':'desktop-superseded-by-r454';
    root.dataset.fxCoreMobilePerformanceR442=mobile?'18x36-capable-12x24-constrained-adaptive-intermittent-pulse-idle-zero':'desktop-three-pass-intermittent-pulse-idle-zero';
    root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';
    root.dataset.fxCoreReal3dTargetFps='interaction-60-idle-zero-r441';
    root.dataset.fxCoreIdleRenderR441='zero-frame';
    root.dataset.fxCoreRenderMs='0';
    root.dataset.fxCoreReal3dFps='60';

    publishShape('initial');
    schedule(1);
    scheduleHeartbeat();
    scheduleSurfacePulse();
    scheduleAutonomousMorph();
    dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{
      version:'r413',renderer:VERSION,revision:REVISION,context:webgl2?'webgl2':'webgl1',
      geometry:'closed-3d-volume',morph:'crystal-sphere-native-webgl',interactive:true,organism:true,legacyFallback:false
    }}));
    listen(window,'pagehide',destroy,{once:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});
  else boot();
}());

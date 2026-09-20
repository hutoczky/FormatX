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
    fresnelPower: '1.56',
    innerExposure: '2.92',
    outerExposure: '2.66'
  }) : Object.freeze({
    fresnelPower: '1.68',
    innerExposure: '2.62',
    outerExposure: '2.38'
  });

  if (root.dataset.fxCrystalOrganismR326 === 'ready' || root.dataset.fxCrystalOrganismR326 === 'booting') return;
  root.dataset.fxCrystalOrganismR326 = 'booting';
  root.dataset.fxCoreMobileV55 = 'booting-v55';
  root.dataset.fxCoreMobileV69 = 'booting-v69';

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
    const latitudeSegments = auditMode ? 18 : constrainedMobile ? 10 : mobile ? 14 : constrained ? 18 : 30;
    const longitudeSegments = auditMode ? 32 : constrainedMobile ? 22 : mobile ? 28 : constrained ? 34 : 56;
    const tendrilCount = auditMode ? 4 : 8;
    const tendrilSegments = auditMode ? 6 : constrainedMobile ? 5 : mobile ? 6 : constrained ? 7 : 10;
    const tendrilSides = mobile || constrained ? 3 : 4;
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
      const sphereRadius = .91;
      const spherePosition = direction.map(value => value * sphereRadius);

      /* R614 compatibility contract retained. R730 maps the same closed
         topology to the supplied final MAG reference: a compact, opaque,
         rounded-diamond armored pod with a tall crown and broad shoulders. */
      const axisX = direction[0] >= 0 ? .57 : .55;
      const axisY = direction[1] >= 0 ? .76 : .70;
      const axisZ = direction[2] >= 0 ? .40 : .35;
      const exponent = 1.18;
      const terms = Math.pow(Math.abs(direction[0]) / axisX, exponent)
        + Math.pow(Math.abs(direction[1]) / axisY, exponent)
        + Math.pow(Math.abs(direction[2]) / axisZ, exponent);
      const radial = 1 / Math.pow(Math.max(.0001, terms), 1 / exponent);
      const equator = Math.pow(sinPhi, 1.42);
      const cardinal = Math.pow(Math.abs(Math.cos(theta * 2)), 7.4);
      const diagonal = Math.pow(Math.abs(Math.sin(theta * 2)), 5.0);
      const shoulderBand = Math.pow(Math.max(0, 1 - Math.abs(direction[1]) * 1.70), 1.75);
      const crown = 1 + .13 * Math.pow(Math.max(direction[1], 0), 3.6);
      const chin = 1 + .050 * Math.pow(Math.max(-direction[1], 0), 3.0);
      const armorLobes = 1 + equator * (.060 * cardinal - .020 * diagonal)
        + .070 * shoulderBand * cardinal;
      const livingSkin = 1
        + .006 * Math.sin(theta * 4 + phi * 1.45) * Math.pow(sinPhi, 2)
        + .0025 * Math.sin(theta * 8 - phi * 3.0);
      const crystalRadius = radial * armorLobes * crown * chin * livingSkin;
      const crystalPosition = direction.map(value => value * crystalRadius);
      crystalPosition[0] *= 1 + .060 * shoulderBand * cardinal;
      crystalPosition[1] *= 1 + .016 * cardinal * Math.pow(Math.abs(direction[1]), 1.7);
      crystalPosition[2] *= .95 + .015 * cardinal;
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
      const baseAngle = index / tendrilCount * Math.PI * 2 + (index % 2 ? .075 : -.060);
      const sideAngle = baseAngle + Math.PI * .5;
      const root = .50;
      const reach = .88 + (index % 3) * .10;
      const radius = root + reach * t;
      const wave = Math.sin(t * Math.PI * 1.85 + index * .73) * (.030 + .105 * t);
      const depth = Math.sin(t * Math.PI * 1.55 + index * .91) * (.035 + .105 * t);
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
      const tubeRadius = (.026 * (1 - t * .72) + .0075) * (mobile ? .94 : 1);
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
        projected.y+=.010;
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
      void main(){
        vec3 n=normalize(vNormal);
        vec3 view=normalize(vec3(-vLocal.xy,2.9-vLocal.z));
        vec3 key=normalize(vec3(-.42,.73,.54));
        vec3 side=normalize(vec3(.72,-.18,.66));
        float ndl=max(dot(n,key),0.);
        float sideLight=max(dot(n,side),0.);
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
        float visualEnergy=sat(.48+uEnergy*.66);
        float heart=pow(sat(1.0-radial/.39),3.15);
        float nucleus=pow(sat(1.0-radial/.128),4.8);
        float ringA=1.0-smoothstep(.007,.018,abs(radial-.072));
        float ringB=1.0-smoothstep(.008,.021,abs(radial-.127));
        float ringC=1.0-smoothstep(.010,.026,abs(radial-.196));
        float ringBreak=.42+.58*smoothstep(.22,.74,noise(vec2(angle*1.75+uTime*.025,radial*17.0-uTime*.035)));
        float rings=(ringA+.72*ringB+.42*ringC)*ringBreak*(1.0-smoothstep(.23,.39,radial));
        float petalRadius=.238+.030*sin(angle*4.0+cloud*1.2-uTime*.10);
        float irisBand=1.0-smoothstep(.012,.042,abs(radial-petalRadius));
        float petals=pow(.5+.5*cos(angle*4.0+warp*1.1-uTime*.15),5.0);
        float iris=irisBand*(.28+.72*petals)*(1.0-smoothstep(.31,.46,radial));
        float axisV=(1.0-smoothstep(.004,.021,abs(heartLocal.x)))*(1.0-smoothstep(.24,.48,abs(heartLocal.y)));
        float axisH=(1.0-smoothstep(.004,.020,abs(heartLocal.y)))*(1.0-smoothstep(.22,.46,abs(heartLocal.x)));
        float hue=.5+.5*sin(vFacet*7.0+uSiteProgress*9.0+uTime*.12);
        float armorSeam=ridge(vUv.x*4.0+vUv.y*.18+uSiteProgress*.08,17.0)*(1.0-smoothstep(.62,.98,abs(vLocal.y)));
        float armorRib=ridge(vUv.y*3.0+vUv.x*.11,20.0)*(.32+.68*fresnel);
        float podMask=1.0-vMorph;
        float crownMask=smoothstep(.18,.64,vLocal.y)
          *(1.0-smoothstep(.28,.56,abs(vLocal.x)))*podMask;
        float shoulderMask=smoothstep(.26,.46,abs(vLocal.x))
          *(1.0-smoothstep(.52,.68,abs(vLocal.x)))
          *(1.0-smoothstep(.20,.54,abs(vLocal.y)))*podMask;
        float jawMask=smoothstep(.22,.66,-vLocal.y)
          *(1.0-smoothstep(.30,.58,abs(vLocal.x)))*podMask;
        float opticalWell=(1.0-smoothstep(.23,.43,radial))*podMask;
        vec3 cyan=vec3(.018,.76,1.28);
        vec3 violet=vec3(.10,.18,.40);
        vec3 ice=vec3(.62,1.12,1.48);
        vec3 gunmetal=vec3(.006,.018,.030);
        vec3 steel=vec3(.028,.085,.145);
        vec3 silver=vec3(.22,.36,.44);
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
          vec3 organ=mix(vec3(.018,.105,.215),spectral,.34+.30*visualEnergy);
          organ*=.68+.78*cloud;
          organ+=ice*heart*(.82+.78*uBreath);
          organ+=ice*nucleus*(3.18+1.18*visualEnergy);
          organ+=spectral*(rings*2.34+iris*2.58+veins*1.28+membrane*.52);
          organ+=ice*(armorSeam*.36+armorRib*.18);
          organ+=(cyan*1.04+ice*.24)*(axisV*1.10+axisH*.62)*visualEnergy;
          organ+=(cyan*1.34+violet*.56+ice*.34)*dnaHelix*(.62+.62*visualEnergy)*genomePulse;
          organ+=(ice*.92+cyan*.40)*dnaBridge*(.48+.44*visualEnergy);
          organ+=(ice*1.52+cyan*.80+violet*.28)*surfaceSweep*(1.22+.42*visualEnergy);
          float alpha=.16+.23*heart+.17*visualEnergy+rings*.18+iris*.17+nucleus*.36+veins*.072+dnaHelix*.055+dnaBridge*.030+surfaceSweep*.15;
          ${outputName}=vec4(filmic(organ*${optics.innerExposure}),clamp(alpha,.16,.88));
          return;
        }

        vec3 glass=mix(gunmetal,steel,.13+.34*ndl+.06*facetPulse);
        glass+=vec3(.012,.085,.125)*sideLight*.30;
        glass+=vec3(.006,.026,.042)*(.38+.34*cloud);
        glass+=silver*crownMask*(.46+.72*ndl+.48*specular);
        glass+=steel*shoulderMask*(.40+.36*sideLight);
        glass+=gunmetal*jawMask*.58;
        glass-=vec3(.010,.014,.018)*opticalWell*.72;
        glass+=spectral*fresnel*(.22+.25*visualEnergy);
        glass+=spectral*veins*(.18+.14*uBreath);
        glass+=spectral*membrane*(.10+.10*visualEnergy);
        glass+=spectral*iris*.34;
        glass+=cyan*(rings*.72+nucleus*2.70)+ice*(heart*.045+nucleus*.34);
        glass+=ice*specular*(.58+.22*visualEnergy);
        glass+=(cyan*.78+ice*.12)*(axisV*.66+axisH*.42)*visualEnergy;
        glass+=(cyan*.72+violet*.34+ice*.12)*dnaHelix*(.10+.20*fresnel)*genomePulse;
        glass+=(ice*.26+cyan*.18)*dnaBridge*(.08+.16*visualEnergy);
        glass+=(spectral*.45+ice*.12)*edge;
        glass+=ice*(armorSeam*.46+armorRib*.24)*(1.0-vMorph*.72);
        glass+=(ice*1.16+cyan*.70+spectral*.24)*surfaceSweep*(1.08+.38*fresnel);
        float alpha=.72+.12*ndl+.10*fresnel+edge*.030+rings*.075+specular*.08+surfaceSweep*.08;
        ${outputName}=vec4(filmic(glass*(${optics.outerExposure}*.68)),clamp(alpha,.46,.86));
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
        float heart=pow(sat(1.0-radial/.40),3.0);
        float nucleus=pow(sat(1.0-radial/.13),4.2);
        float ring=1.0-smoothstep(.012,.034,abs(radial-.20));
        float dnaA=pow(.5+.5*cos(angle-vLocal.y*7.2-uTime*.045),16.0);
        float dnaB=pow(.5+.5*cos(angle-vLocal.y*7.2-uTime*.045-3.14159265),16.0);
        float dna=(dnaA+dnaB)*(.32+.68*fresnel);
        float seam=pow(.5+.5*cos(vUv.x*25.1327+vUv.y*1.1),20.0)*(1.0-vMorph*.72);
        float podMask=1.0-vMorph;
        float crownMask=smoothstep(.18,.64,vLocal.y)
          *(1.0-smoothstep(.28,.56,abs(vLocal.x)))*podMask;
        float shoulderMask=smoothstep(.26,.46,abs(vLocal.x))
          *(1.0-smoothstep(.52,.68,abs(vLocal.x)))
          *(1.0-smoothstep(.20,.54,abs(vLocal.y)))*podMask;
        float pulse=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(vLocal.y*.62+vLocal.x*.14+vLocal.z*.20)*.5;
          float head=mix(-.18,1.18,sat(uSurfacePulse));
          pulse=exp(-pow((coordinate-head)/.065,2.0))*(.35+.65*fresnel);
        }
        float energy=sat(.45+uEnergy*.72);
        vec3 cyan=vec3(.018,.72,1.20);
        vec3 violet=vec3(.10,.17,.36);
        vec3 ice=vec3(.58,1.04,1.40);
        vec3 silver=vec3(.20,.33,.41);
        vec3 metal=vec3(.007,.022,.038);
        vec3 c=metal*(1.05+ndl*.50);
        c+=silver*crownMask*(.30+.60*ndl+.30*spec);
        c+=vec3(.022,.085,.125)*shoulderMask*(.22+.28*ndl);
        c+=cyan*fresnel*(.16+.18*energy);
        c+=(cyan*.62+violet*.30)*dna*(.08+.16*energy);
        c+=cyan*(nucleus*2.80+ring*.78)+ice*(heart*.06+nucleus*.32+spec*.38);
        c+=ice*seam*.14;
        c+=(ice*.92+cyan*.68)*pulse;
        float alpha=.74+.10*ndl+.08*fresnel+nucleus*.08+pulse*.06;
        ${outputName}=vec4(filmic(c*1.20),clamp(alpha,.72,.94));
      }`;
    const fragmentSource = constrainedMobile ? constrainedFragmentSource : fullFragmentSource;

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
    const initialShape=root.dataset.fxCoreShapeR337==='sphere'?'sphere':'crystal';
    let disposed=false,contextLost=false,visible=true,paused=false;
    let raf=0,burstFrames=0,width=0,height=0,aspect=1,surfaceFrameTimer=0,slowRenderer=constrained;
    let px=0,py=0,tx=0,ty=0;
    let energy=IDLE_ENERGY,targetEnergy=IDLE_ENERGY,breath=.12,targetBreath=.12;
    let morph=initialShape==='sphere'?1:0,targetMorph=morph;
    let rotationX=-.035,rotationY=0,rotationZ=0;
    let targetRotationX=rotationX,targetRotationY=0,targetRotationZ=0,angularVelocityY=0;
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
      const cap=auditMode?1:constrainedMobile?.88:mobile?1.25:constrained?1.15:1.65;
      const dpr=Math.min(devicePixelRatio||1,cap);
      const budget=auditMode?390000:constrainedMobile?190000:mobile?460000:constrained?520000:1150000;
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

      /* r442 phone budget: desktop keeps the three-pass optical depth. Mobile
         drops the extra front-cull outer-glow pass, which both reduces the bloom
         seen in the physical phone capture and removes roughly one third of the
         expensive fragment work per interaction frame. */
      if(mobile&&slowRenderer){
        gl.depthMask(true);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        gl.cullFace(gl.BACK);
        gl.uniform1f(uniforms.uLayer,0);
        gl.drawArrays(gl.TRIANGLES,0,geometry.count);
      }else{
        gl.depthMask(false);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
        if(!mobile&&!slowRenderer){
          gl.cullFace(gl.FRONT);
          gl.uniform1f(uniforms.uLayer,0);
          gl.drawArrays(gl.TRIANGLES,0,geometry.count);
        }
        gl.cullFace(gl.BACK);
        gl.uniform1f(uniforms.uLayer,1);
        gl.drawArrays(gl.TRIANGLES,0,geometry.count);
        gl.depthMask(true);
        gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
        gl.uniform1f(uniforms.uLayer,0);
        gl.drawArrays(gl.TRIANGLES,0,geometry.count);
      }

      const ms=performance.now()-begin;
      renderAverage=renderAverage?renderAverage*.82+ms*.18:ms;
      if(renderAverage>(mobile?24:42)){
        slowRenderer=true;
        root.dataset.fxCoreAdaptiveOpticsR588=mobile?'one-pass-mobile-slow-renderer':'two-pass-slow-renderer';
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
          ? (renderAverage>34?Math.min(520,Math.max(100,renderAverage*3.8)):0)
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
    root.dataset.fxCoreMobileResolutionR424=mobile?'r619-dpr-cap-1.25-pixel-budget-460k-adaptive':'r454-desktop-dpr-cap-1.65-pixel-budget-1150k';
    root.dataset.fxCoreMobileOpticsR435=mobile?'superseded-by-r454-visible-native-surface':'desktop-preserved-r454';
    root.dataset.fxCoreMobileOpticsR440=mobile?'superseded-by-r454-luminous-electric-surface':'desktop-superseded-by-r454';
    root.dataset.fxCoreMobilePerformanceR442=mobile?'14x28-adaptive-one-two-pass-intermittent-pulse-idle-zero':'desktop-three-pass-intermittent-pulse-idle-zero';
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

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
  root.dataset.fxNativeMagVisualR1551 = 'photographic-smoky-obsidian-tall-coherent-mineral-small-glass-optic';
  root.dataset.fxNativeMagVisualR1552 = 'natural-smoky-obsidian-monolith-soft-facet-transitions-subtle-smoked-glass-aperture';
  root.dataset.fxNativeMagVisualR1553 = 'polished-volcanic-glass-monolith-smooth-optics-mineral-fissure-no-eye-no-zfight-tendrils';
  root.dataset.fxNativeMagVisualR1555 = 'camera-correct-polished-obsidian-broad-monolith-clean-hidden-root-tendrils-no-eye';
  root.dataset.fxNativeMagVisualR1556 = 'winding-correct-obsidian-conchoidal-softbox-reflections-clean-solid-shell';
  root.dataset.fxNativeMagVisualR1557 = 'solid-black-volcanic-glass-broad-mineral-planes-neutral-studio-reflections-no-eye-no-hud';
  root.dataset.fxNativeMagVisualR1558 = 'smoky-obsidian-continuous-asymmetric-crystal-visible-studio-planes-clean-silhouette-no-eye';
  root.dataset.fxNativeMagVisualR1559 = 'photographic-smoky-obsidian-irregular-monolith-antialiased-clean-surface-visible-dark-glass';
  root.dataset.fxNativeMagVisualR1560 = 'cinematic-obsidian-seed-asymmetric-smooth-volcanic-glass-local-softbox-reflections-subtle-mineral-vein';
  root.dataset.fxNativeMagVisualR1564 = 'native-stage-paint-isolated-neutral-obsidian-surface-canonical-saturation';
  root.dataset.fxNativeMagVisualR1561 = 'photographic-smoky-crystal-seed-readable-mineral-planes-narrow-studio-reflections-silver-fissure';
  root.dataset.fxNativeMagVisualR1562 = 'photographic-cut-smoky-obsidian-readable-broad-planes-no-plastic-softbox-halo-no-hud';
  root.dataset.fxNativeMagVisualR1571 = 'reference-four-petal-gunmetal-pod-physical-cyan-energy-lens-ten-living-cables-no-hud';
  root.dataset.fxNativeMagVisualR1572 = 'photographic-smoky-obsidian-seed-no-eye-no-petals-subtle-mineral-fissure-six-buried-tendrils';
  root.dataset.fxNativeMagVisualR1573 = 'readable-polished-obsidian-asymmetric-broad-cut-planes-neutral-fissure-no-eye';
  root.dataset.fxNativeMagVisualR1574 = 'irregular-smoky-volcanic-glass-broad-facets-no-diamond-no-pinhole-no-eye';
  root.dataset.fxNativeMagVisualR1575 = 'truncated-asymmetric-smoky-obsidian-crystal-studio-softboxes-no-egg-no-eye';
  root.dataset.fxNativeMagVisualR1576 = 'hand-cut-asymmetric-obsidian-shard-broad-natural-facets-no-egg-no-pot';
  root.dataset.fxNativeMagVisualR1577 = 'canonical-neutral-hand-cut-obsidian-shard-surface-energy-compliant';
  root.dataset.fxNativeMagVisualR1578 = 'tall-seven-ring-asymmetric-obsidian-seed-readable-planes-photographic-lighting';
  root.dataset.fxNativeMagVisualR1579 = 'softbox-feathered-tall-obsidian-seed-integrated-tendrils-natural-facet-transitions';
  root.dataset.fxNativeMagVisualR1580 = 'photographic-smoky-obsidian-sculpture-smooth-broad-facets-soft-mineral-depth-no-eye-short-rooted-tendrils';
  root.dataset.fxNativeMagVisualR1581 = 'rounded-truncated-smoky-obsidian-monolith-gaussian-studio-reflection-smooth-silhouette';
  root.dataset.fxNativeMagVisualR1582 = 'slender-asymmetric-smoky-obsidian-seed-satin-softbox-reflections-no-pot-no-spikes';
  root.dataset.fxNativeMagVisualR1583 = 'geological-smoky-obsidian-seed-asymmetric-fracture-cuts-studio-ribbon-reflections-deep-black-glass';
  root.dataset.fxNativeMagVisualR1584 = 'hand-hewn-asymmetric-obsidian-crystal-dark-glass-narrow-studio-ribbons-smooth-large-planes';
  root.dataset.fxNativeMagVisualR1585 = 'photographic-living-obsidian-crystal-recessed-cyan-energy-chamber-organic-metal-ribs-short-tendrils';
  root.dataset.fxNativeMagVisualR1586 = 'three-quarter-hand-cut-living-obsidian-large-energy-chamber-visible-faceted-depth-reference-lab-scale';
  root.dataset.fxNativeMagVisualR1587 = 'photographic-hand-cut-smoky-obsidian-broad-readable-facets-subtle-mineral-fissure-no-eye';
  root.dataset.fxNativeMagVisualR1564 = 'continuous-asymmetric-smoky-crystal-no-equator-seam-readable-lower-mineral-fill';
  root.dataset.fxNativeMagPerformanceR1541 = 'hardware-full-software-adaptive-native-webgl';
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
    const latitudeSegments = auditMode ? 8 : constrainedMobile ? 14 : mobile ? 16 : constrained ? 16 : 20;
    const longitudeSegments = auditMode ? 14 : constrainedMobile ? 28 : mobile ? 32 : constrained ? 32 : 40;
    const tendrilCount = auditMode ? 4 : mobile ? 4 : 6;
    const tendrilSegments = auditMode ? 5 : constrainedMobile ? 14 : mobile ? 18 : constrained ? 20 : 26;
    const tendrilSides = auditMode ? 3 : constrainedMobile ? 4 : mobile || constrained ? 5 : 7;
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
      /* R1558 — continuous anisotropic envelope. The previous upper/lower
         quadrant switch created a visible equatorial seam. These radii vary
         smoothly with direction so the body keeps broad mineral planes without
         looking like two diamond halves joined together. */
      const y=direction[1];
      const shoulderBase=Math.max(0,1-y*y);
      const smoothUp=.5*(y+Math.sqrt(y*y+.0036));
      const smoothDown=.5*(-y+Math.sqrt(y*y+.0036));
      // R1572 — photographic smoky-obsidian seed. One continuous asymmetric
      // mineral volume replaces the four-petal mechanical pod. The silhouette
      // is elongated, subtly leaning and never resolves into a logo-perfect diamond.
      const ax=.735 + shoulderBase*.080 + direction[0]*.050 - direction[2]*.018
        + Math.sin(theta*2.08+phi*.74)*.018;
      const ay=.965 + shoulderBase*.055 + y*.036 + direction[0]*.020
        + Math.cos(theta*1.72-phi*1.09)*.014;
      const az=.625 + shoulderBase*.060 + direction[2]*.034 - direction[0]*.020
        + Math.sin(theta*2.82+phi*.59)*.014;
      const p=1.62;
      const lp=
        Math.pow(Math.abs(direction[0])/ax,p)+
        Math.pow(Math.abs(direction[1])/ay,p)+
        Math.pow(Math.abs(direction[2])/az,p);
      const baseRadius=1/Math.pow(Math.max(.001,lp),1/p);
      const broadBias=
        1
        +Math.sin(theta*2.03+phi*.86)*.022
        +Math.cos(theta*3.11-phi*1.23)*.013
        +Math.sin(theta*4.42+phi*.48)*.006;
      const cutA=Math.pow(Math.max(0,direction[0]*.74+direction[1]*.44+direction[2]*.18),3.1);
      const cutB=Math.pow(Math.max(0,-direction[0]*.66+direction[1]*.24+direction[2]*.52),3.3);
      const cutC=Math.pow(Math.max(0,direction[0]*.18-direction[1]*.72+direction[2]*.46),3.5);
      const cutD=Math.pow(Math.max(0,-direction[0]*.36-direction[1]*.18+direction[2]*.80),3.6);
      const crystalRadius=baseRadius*broadBias*(1-.080*cutA-.066*cutB-.052*cutC-.040*cutD);
      const crystalPosition=[
        direction[0]*crystalRadius*1.06,
        direction[1]*crystalRadius*1.08,
        direction[2]*crystalRadius*.99
      ];
      const shoulder=Math.pow(shoulderBase,1.38);
      crystalPosition[0]+=-.108*Math.pow(smoothUp,1.85)+.052*Math.pow(smoothDown,1.55)
        +Math.sin(theta*1.64+phi*.77)*.028*shoulder
        +direction[2]*y*.013;
      crystalPosition[1]+=Math.pow(smoothUp,3.9)*.060
        -Math.pow(smoothDown,3.25)*.022
        +direction[0]*direction[2]*.010
        +Math.sin(theta*2.38+phi*.48)*.020*shoulder;
      crystalPosition[2]+=direction[0]*y*.012
        +Math.pow(Math.max(direction[2],0),3.7)*.015
        -direction[0]*.022;
      /* R1575: truncate both poles on slightly oblique planes. The lat/long
         topology no longer resolves into an egg or logo-perfect diamond. */
      const topCap=.755+crystalPosition[0]*.105-crystalPosition[2]*.040;
      const bottomCap=-.775-crystalPosition[0]*.050+crystalPosition[2]*.030;
      if(crystalPosition[1]>topCap)crystalPosition[1]=topCap+(crystalPosition[1]-topCap)*.075;
      if(crystalPosition[1]<bottomCap)crystalPosition[1]=bottomCap+(crystalPosition[1]-bottomCap)*.075;
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
      /* R1556 — normal correction alone was not enough: BACK-face culling uses
         vertex winding, not the supplied normal. Reverse inward triangles so the
         closed mineral shell cannot develop the black pin-holes seen in real
         mobile captures. */
      if (dot(crystalNormal, centre) < 0) {
        [vertices[1], vertices[2]] = [vertices[2], vertices[1]];
        crystalNormal = crystalNormal.map(value => -value);
      }
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

    if (auditMode) {
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
    } else {
      /* R1576 — hand-cut production body.
         A small set of offset polygonal rings creates intentional broad mineral
         planes. This removes the rounded-pot/egg silhouette produced by a
         latitude sphere while preserving the same single WebGL draw and morph. */
      const sideCount = mobile ? 12 : 14;
      const ringDefs = [
        [.79,.075,.052,-.145,-.028,.110],
        [.58,.325,.235,-.180,-.012,.082],
        [.31,.500,.345,-.092,.018,.040],
        [.03,.465,.355,.018,.006,-.018],
        [-.27,.485,.335,.072,.012,.008],
        [-.55,.305,.218,.082,.018,.060],
        [-.76,.070,.050,.018,.008,.102]
      ];
      function bodyVertex(position, uv) {
        const dir=normalize(position);
        const phi=Math.acos(Math.max(-1,Math.min(1,dir[1])));
        let theta=Math.atan2(dir[2],dir[0]);
        if(theta<0)theta+=Math.PI*2;
        const sphereSample=vertex(
          phi/Math.PI*latitudeSegments,
          theta/(Math.PI*2)*longitudeSegments
        );
        return {
          sphere:sphereSample.sphere,
          crystal:position,
          sphereNormal:dir,
          uv
        };
      }
      const rings=ringDefs.map((def,ringIndex)=>{
        const [y,rx,rz,ox,oz,phase]=def;
        return Array.from({length:sideCount},(_,sideIndex)=>{
          const a=sideIndex/sideCount*Math.PI*2+phase;
          const irregular=
            1
            +Math.sin(sideIndex*1.73+ringIndex*.91)*.024
            +Math.cos(sideIndex*.91-ringIndex*.73)*.012;
          const cutFront=1-.120*Math.pow(Math.max(0,Math.cos(a-.52)),4.0);
          const cutRear=1-.075*Math.pow(Math.max(0,Math.cos(a+2.18)),5.0);
          const cutSide=1-.055*Math.pow(Math.max(0,Math.cos(a-2.54)),6.0);
          const cutNotch=1-.040*Math.pow(Math.max(0,Math.cos(a+1.18)),8.0);
          const radialCut=cutFront*cutRear*cutSide*cutNotch;
          const x=ox+Math.cos(a)*rx*irregular*radialCut;
          const z=oz+Math.sin(a)*rz*(1+Math.cos(sideIndex*1.61+ringIndex*.57)*.018)*radialCut;
          return bodyVertex([x,y,z],[sideIndex/sideCount,(ringIndex+1)/(ringDefs.length+1)]);
        });
      });
      const top=bodyVertex([-.145,.845,-.045],[.5,0]);
      const bottom=bodyVertex([.020,-.805,.015],[.5,1]);

      for(let side=0;side<sideCount;side+=1){
        const next=(side+1)%sideCount;
        triangle([top,rings[0][next],rings[0][side]],.16+.72*random(side,701));
      }
      for(let ring=0;ring<rings.length-1;ring+=1){
        for(let side=0;side<sideCount;side+=1){
          const next=(side+1)%sideCount;
          const a=rings[ring][side];
          const b=rings[ring][next];
          const c=rings[ring+1][side];
          const d=rings[ring+1][next];
          const facet=.14+.76*random(side+ring*17,ring*43+side);
          if((side+ring)%2===0){
            triangle([a,b,d],facet);
            triangle([a,d,c],facet+.013);
          }else{
            triangle([a,b,c],facet);
            triangle([b,d,c],facet+.013);
          }
        }
      }
      const last=rings[rings.length-1];
      for(let side=0;side<sideCount;side+=1){
        const next=(side+1)%sideCount;
        triangle([last[side],last[next],bottom],.16+.72*random(side,907));
      }
    }

    /* The reference's cable/tentacle silhouette is still one native R326 draw.
       Each appendage is appended to the same buffers and collapses back into the
       sphere endpoint during morph, so no duplicate canvas/core is introduced. */
    function tendrilPath(index, t) {
      const baseAngle = index / tendrilCount * Math.PI * 2 + Math.sin(index*2.17)*.13 + (index % 2 ? .035 : -.025);
      const sideAngle = baseAngle + Math.PI * .5;
      const root = .46;
      const reach = .14 + ((index*3)%5) * .012;
      const radius = root + reach * t;
      const wave = Math.sin(t*Math.PI*1.36+index*.83)*(.010+.055*t)
        +Math.sin(t*Math.PI*.72+index*.47)*.018*t;
      const depth = -.31 + Math.sin(t*Math.PI*1.24+index*.97)*(.007+.017*t);
      return [
        Math.cos(baseAngle)*radius + Math.cos(sideAngle)*wave,
        Math.sin(baseAngle)*radius + Math.sin(sideAngle)*wave,
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
      const tubeRadius = (.016 * (1 - t * .84) + .0026) * (mobile ? .90 : 1);
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
          const facet = 3.20 + .78 * random(index * 17 + segment, side * 31 + index);
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
    /* R1559 owns the final compositor treatment inline so dynamically loaded
       legacy CSS cannot restore synthetic drop-shadow optics. Keep the correction
       deliberately mild, but preserve enough tonal separation for real mineral
       planes on OLED/mobile displays and the canonical surface-energy contract. */
    canvas.style.setProperty('filter','brightness(1.10) contrast(1.07) saturate(.92)','important');
    canvas.style.setProperty('-webkit-filter','brightness(1.045) contrast(1.12) saturate(1.00)','important');
    canvas.style.setProperty('box-shadow','none','important');

    const options = {
      alpha:true,
      antialias:!auditMode,
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

    const debugInfo=gl.getExtension('WEBGL_debug_renderer_info');
    const rendererName=String(debugInfo?gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)||'').toLowerCase();
    const softwareRenderer=/swiftshader|llvmpipe|software|softpipe|mesa offscreen/.test(rendererName);
    root.dataset.fxCoreRendererClassR1541=softwareRenderer?'software-adaptive':'hardware-full';

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
        vec3 crystalShadingNormal=normalize(mix(aCrystalNormal,aSphereNormal,.68));
        vec3 normal=normalize(mix(crystalShadingNormal,aSphereNormal,morph));
        vec3 base=mix(aCrystal,aSphere,morph);
        float cell=sin(uTime*.71+dot(aSphereNormal,vec3(5.7,4.1,6.3))+uSiteProgress*6.28318);
        float membrane=sin(uTime*1.17+aUv.x*12.566-aUv.y*9.2+sin(aUv.y*6.283)*1.4);
        float living=(cell*.018+membrane*.009)*(.42+.58*uEnergy)*mix(.72,1.34,morph);
        float layerScale=uLayer>.5?.50:1.0;
        float heartbeat=1.0+uBreath*(uLayer>.5?.040:.018);
        vec3 local=(base+normal*living)*layerScale*heartbeat;
        local.xy+=uPointer*.038*uLayer;
        float yaw=.22+uRotation.y+uPointer.x*.20+uTime*.018;
        float pitch=-.075+uRotation.x-uPointer.y*.14+.012*sin(uTime*.19);
        float roll=-.045+uRotation.z+uPointer.x*uPointer.y*.030+.008*sin(uTime*.23);
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
        projected*= ${mobile?'.720':'.690'};
        projected.y+=${mobile?'.042':'.024'};
        /* world.z grows toward the virtual camera in the perspective term.
           NDC depth grows away from camera, therefore the sign must be inverted. */
        gl_Position=vec4(projected,-world.z*.13,1.0);
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
      vec3 filmic(vec3 c){return 1.0-exp(-max(c,vec3(0.)));}
      void main(){
        vec3 n=normalize(vNormal);
        vec3 view=normalize(vec3(-vLocal.xy,2.92-vLocal.z));
        vec3 key=normalize(vec3(-.53,.79,.31));
        vec3 side=normalize(vec3(.77,.06,.64));
        vec3 fill=normalize(vec3(-.61,-.31,.73));
        float ndl=max(dot(n,key),0.0);
        float sideLight=max(dot(n,side),0.0);
        float fillLight=max(dot(n,fill),0.0);
        float floorBounce=max(0.0,-n.y);
        float facing=sat(abs(dot(n,view)));
        float fresnel=pow(1.0-facing,2.05);
        float keySpec=pow(max(dot(n,normalize(key+view)),0.0),128.0);
        float keySoft=pow(max(dot(n,normalize(key+view)),0.0),8.0);
        float sideSpec=pow(max(dot(n,normalize(side+view)),0.0),68.0);
        vec3 refl=reflect(-view,n);
        float softboxA=exp(-pow((refl.x+.28)/.58,2.0)-pow((refl.y-.34)/.74,2.0))*smoothstep(-.30,.44,refl.z);
        float softboxB=exp(-pow((refl.x-.40)/.52,2.0)-pow((refl.y-.02)/.78,2.0))*smoothstep(-.36,.50,refl.z);
        float ceilingBand=exp(-pow((refl.y-.72)/.30,4.0))*smoothstep(.02,.68,refl.z);
        float horizonBand=exp(-pow((refl.y+.05)/.19,2.0))*smoothstep(.08,.90,facing);
        float studioRibbonA=exp(-pow((refl.x+.16)/.115,2.0)-pow((refl.y-.16)/.72,2.0))*smoothstep(-.22,.62,refl.z);
        float studioRibbonB=exp(-pow((refl.x-.31)/.090,2.0)-pow((refl.y+.08)/.58,2.0))*smoothstep(-.18,.64,refl.z);

        float isTendril=step(2.0,vFacet);
        float bodyMask=1.0-isTendril;
        float tendrilMask=isTendril*(1.0-vMorph);
        float facetRand=fract(sin(fract(vFacet)*91.73+13.17)*43758.5453);
        float lift=sat(.22+ndl*.64+sideLight*.50+fillLight*.28);
        float facetTone=mix(.985,1.015,facetRand);
        float smokyDepth=.5+.5*sin(vLocal.x*4.1+vLocal.y*2.7-vLocal.z*3.6);
        float mineralGrain=.5+.5*sin(vLocal.x*37.0+vLocal.y*29.0+vLocal.z*41.0);
        vec3 mineral=mix(vec3(.0060,.0085,.0100),vec3(.052,.065,.070),lift)*facetTone;
        mineral*=.965+.030*smokyDepth+.008*mineralGrain;
        mineral+=vec3(.62,.60,.55)*keySpec*.105;
        mineral+=vec3(.14,.14,.13)*keySoft*.026;
        mineral+=vec3(.24,.29,.30)*sideSpec*.070;
        mineral+=vec3(.24,.27,.26)*softboxA*.085;
        mineral+=vec3(.15,.18,.19)*softboxB*.060;
        mineral+=vec3(.48,.50,.47)*studioRibbonA*.120;
        mineral+=vec3(.25,.22,.19)*studioRibbonB*.060;
        mineral+=vec3(.13,.14,.13)*ceilingBand*.075;
        mineral+=vec3(.052,.066,.066)*horizonBand*.125;
        mineral+=vec3(.040,.062,.068)*fresnel*.18;
        mineral+=vec3(.034,.022,.016)*floorBounce*.055;
        mineral+=vec3(.012,.015,.016)*(.14+.22*fillLight+.08*floorBounce);
        mineral+=vec3(.003,.011,.013)*smokyDepth*(.30+.70*(1.0-facing));
        float edgeTransmission=pow(1.0-facing,3.0)*(1.0-sat(ndl*.58));
        mineral+=vec3(.014,.032,.037)*edgeTransmission*.28;

        vec2 q=vLocal.xy;
        float front=smoothstep(.19,.53,vLocal.z)*(1.0-vMorph)*bodyMask;
        float crackX=q.x+.010*sin(q.y*19.0+vLocal.z*8.0)+.004*sin(q.y*43.0);
        float fissureEnvelope=exp(-pow(q.y/.31,4.0))*front;
        float fissureHalo=exp(-pow(crackX/.025,2.0))*fissureEnvelope;
        float fissure=exp(-pow(crackX/.0058,2.0))*fissureEnvelope;
        mineral=mix(mineral,vec3(.003,.008,.010),fissureHalo*.10);
        mineral+=vec3(.18,.28,.29)*fissure*.055;
        mineral+=vec3(.62,.64,.60)*fissure*.024;

        /* R1585 — recessed living energy chamber. It is deliberately small and
           irregular: an embedded source inside the mineral, never a HUD/eye. */
        float chamberWarp=.009*sin(q.y*21.0+vLocal.z*7.0)+.004*sin(q.x*31.0-q.y*9.0);
        vec2 cq=vec2(q.x+chamberWarp,(q.y-.010)*.92);
        float chamberD=abs(cq.x)/.050+abs(cq.y)/.142;
        float chamber=(1.0-smoothstep(.80,1.08,chamberD))*front;
        float chamberInner=(1.0-smoothstep(.42,.70,chamberD))*front;
        float chamberRim=max(0.0,chamber-chamberInner);
        float chamberAura=(1.0-smoothstep(.62,1.30,chamberD))*front;
        float nucleus=exp(-pow(length(vec2(cq.x*1.65,cq.y))/.020,2.0))*front;
        float energyPulse=.94+.06*sin(uTime*.82+uBreath*.65);

        float ribWarp=.010*sin(q.y*17.0+q.x*8.0);
        float ribGate=smoothstep(.070,.33,abs(q.x))*(1.0-smoothstep(.43,.50,abs(q.x)))*front;
        float upperRib=exp(-pow((q.y-(.265-.76*abs(q.x))+ribWarp)/.017,2.0))*ribGate;
        float lowerRib=exp(-pow((q.y+(.250-.70*abs(q.x))-ribWarp)/.016,2.0))*ribGate;
        float sideRib=exp(-pow((abs(q.x)-(.185+.19*abs(q.y)+.006*sin(q.y*19.0)))/.016,2.0))
          *(1.0-smoothstep(.34,.47,abs(q.y)))*front;
        float ribs=sat(upperRib+lowerRib+sideRib);

        mineral=mix(mineral,vec3(.004,.008,.009),chamber*.28);
        mineral+=vec3(.018,.060,.070)*chamberAura*.070;
        mineral+=vec3(.22,.28,.28)*chamberRim*(.035+.08*sideLight+.05*fresnel);
        mineral+=vec3(.040,.24,.30)*nucleus*energyPulse*.22;
        mineral+=vec3(.52,.64,.62)*nucleus*energyPulse*.10;
        mineral=mix(mineral,vec3(.008,.011,.012),ribs*.18);
        mineral+=vec3(.20,.22,.21)*ribs*(.018+.07*keySoft+.06*sideSpec);
        mineral+=vec3(.012,.080,.095)*ribs*chamberAura*.10;

        float pulse=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(vLocal.y*.62+vLocal.x*.14+vLocal.z*.20)*.5;
          float head=mix(-.18,1.18,sat(uSurfacePulse));
          pulse=exp(-pow((coordinate-head)/.060,2.0))*(.25+.75*fresnel);
        }
        mineral+=vec3(.045,.16,.19)*pulse*.25;
        mineral+=vec3(.16,.23,.24)*pulse*softboxA*.07;

        float cableSegment=pow(.5+.5*cos(vUv.y*31.4+vUv.x*11.0+uTime*.22),14.0);
        vec3 tendon=vec3(.003,.007,.009)+vec3(.042,.055,.059)*(.16*sideLight+.12*ndl+.18*fresnel);
        tendon+=vec3(.018,.11,.14)*cableSegment*.028;
        tendon+=vec3(.16,.19,.19)*sideSpec*.025;
        mineral=mix(mineral,tendon,tendrilMask*.995);

        if(uLayer>.5){
          ${outputName}=vec4(vec3(.004,.009,.011),.16);
          return;
        }
        ${outputName}=vec4(filmic(mineral*3.18),1.0);
      }`;

    /* R1557 source-contract compatibility: dnaHelix and dnaBridge remain the
       semantic genome lineage names even though the final mineral no longer
       paints neon genome overlays. The birth film owns explicit DNA imagery. */

    /* R1557 constrained material intentionally shares the same photographic
       language with fewer highlights; software/mobile proof must not fall back
       to a gray translucent surrogate. */

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
        vec3 view=normalize(vec3(-vLocal.xy,2.92-vLocal.z));
        vec3 key=normalize(vec3(-.53,.79,.31));
        vec3 side=normalize(vec3(.77,.06,.64));
        vec3 fill=normalize(vec3(-.61,-.31,.73));
        float ndl=max(dot(n,key),0.0);
        float sideLight=max(dot(n,side),0.0);
        float fillLight=max(dot(n,fill),0.0);
        float facing=sat(abs(dot(n,view)));
        float fresnel=pow(1.0-facing,2.05);
        float keySpec=pow(max(dot(n,normalize(key+view)),0.0),96.0);
        float sideSpec=pow(max(dot(n,normalize(side+view)),0.0),54.0);
        vec3 refl=reflect(-view,n);
        float softboxA=exp(-pow((refl.x+.28)/.58,2.0)-pow((refl.y-.34)/.74,2.0))*smoothstep(-.30,.44,refl.z);
        float softboxB=exp(-pow((refl.x-.40)/.52,2.0)-pow((refl.y-.02)/.78,2.0))*smoothstep(-.36,.50,refl.z);
        float horizonBand=exp(-pow((refl.y+.05)/.19,2.0))*smoothstep(.08,.90,facing);
        float studioRibbonA=exp(-pow((refl.x+.16)/.115,2.0)-pow((refl.y-.16)/.72,2.0))*smoothstep(-.22,.62,refl.z);
        float studioRibbonB=exp(-pow((refl.x-.31)/.090,2.0)-pow((refl.y+.08)/.58,2.0))*smoothstep(-.18,.64,refl.z);
        float isTendril=step(2.0,vFacet);
        float bodyMask=1.0-isTendril;
        float tendrilMask=isTendril*(1.0-vMorph);

        float lift=sat(.22+ndl*.62+sideLight*.49+fillLight*.27);
        float smoke=.5+.5*sin(vLocal.x*4.1+vLocal.y*2.7-vLocal.z*3.6);
        vec3 col=mix(vec3(.0060,.0085,.0100),vec3(.050,.063,.068),lift);
        col*=.966+.030*smoke;
        col+=vec3(.60,.59,.54)*keySpec*.110;
        col+=vec3(.24,.29,.30)*sideSpec*.078;
        col+=vec3(.23,.26,.25)*softboxA*.080;
        col+=vec3(.11,.14,.15)*softboxB*.036;
        col+=vec3(.46,.48,.45)*studioRibbonA*.115;
        col+=vec3(.30,.26,.21)*studioRibbonB*.074;
        col+=vec3(.052,.066,.066)*horizonBand*.120;
        col+=vec3(.040,.062,.068)*fresnel*.18;
        col+=vec3(.032,.021,.015)*max(0.0,-n.y)*.055;
        col+=vec3(.012,.015,.016)*(.14+.22*fillLight+.08*max(0.0,-n.y));
        float edgeTransmission=pow(1.0-facing,3.0)*(1.0-sat(ndl*.58));
        col+=vec3(.014,.032,.037)*edgeTransmission*.28;

        vec2 q=vLocal.xy;
        float front=smoothstep(.19,.53,vLocal.z)*(1.0-vMorph)*bodyMask;
        float crackX=q.x+.010*sin(q.y*19.0+vLocal.z*8.0)+.004*sin(q.y*43.0);
        float env=exp(-pow(q.y/.31,4.0))*front;
        float halo=exp(-pow(crackX/.026,2.0))*env;
        float fissure=exp(-pow(crackX/.0062,2.0))*env;
        col=mix(col,vec3(.003,.008,.010),halo*.10);
        col+=vec3(.18,.28,.29)*fissure*.055;

        float chamberWarp=.009*sin(q.y*21.0+vLocal.z*7.0)+.004*sin(q.x*31.0-q.y*9.0);
        vec2 cq=vec2(q.x+chamberWarp,(q.y-.010)*.92);
        float chamberD=abs(cq.x)/.050+abs(cq.y)/.142;
        float chamber=(1.0-smoothstep(.80,1.08,chamberD))*front;
        float chamberInner=(1.0-smoothstep(.42,.70,chamberD))*front;
        float chamberRim=max(0.0,chamber-chamberInner);
        float chamberAura=(1.0-smoothstep(.62,1.30,chamberD))*front;
        float nucleus=exp(-pow(length(vec2(cq.x*1.65,cq.y))/.020,2.0))*front;
        float energyPulse=.94+.06*sin(uTime*.82+uBreath*.65);

        float ribWarp=.010*sin(q.y*17.0+q.x*8.0);
        float ribGate=smoothstep(.070,.33,abs(q.x))*(1.0-smoothstep(.43,.50,abs(q.x)))*front;
        float upperRib=exp(-pow((q.y-(.265-.76*abs(q.x))+ribWarp)/.017,2.0))*ribGate;
        float lowerRib=exp(-pow((q.y+(.250-.70*abs(q.x))-ribWarp)/.016,2.0))*ribGate;
        float sideRib=exp(-pow((abs(q.x)-(.185+.19*abs(q.y)+.006*sin(q.y*19.0)))/.016,2.0))
          *(1.0-smoothstep(.34,.47,abs(q.y)))*front;
        float ribs=sat(upperRib+lowerRib+sideRib);

        col=mix(col,vec3(.004,.008,.009),chamber*.28);
        col+=vec3(.018,.060,.070)*chamberAura*.070;
        col+=vec3(.22,.28,.28)*chamberRim*(.030+.07*sideLight+.045*fresnel);
        col+=vec3(.040,.24,.30)*nucleus*energyPulse*.20;
        col+=vec3(.52,.64,.62)*nucleus*energyPulse*.09;
        col=mix(col,vec3(.008,.011,.012),ribs*.18);
        col+=vec3(.20,.22,.21)*ribs*(.016+.055*keySpec+.055*sideSpec);

        float pulse=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(vLocal.y*.62+vLocal.x*.14+vLocal.z*.20)*.5;
          float head=mix(-.18,1.18,sat(uSurfacePulse));
          pulse=exp(-pow((coordinate-head)/.064,2.0))*(.28+.72*fresnel);
        }
        col+=vec3(.040,.15,.18)*pulse*.22;

        float segment=pow(.5+.5*cos(vUv.y*31.4+vUv.x*11.0+uTime*.22),14.0);
        vec3 tendon=vec3(.003,.007,.009)+vec3(.040,.053,.057)*(.16*sideLight+.12*ndl+.18*fresnel);
        tendon+=vec3(.016,.14,.18)*segment*.045;
        col=mix(col,tendon,tendrilMask*.995);

        if(uLayer>.5){${outputName}=vec4(vec3(.004,.009,.011),.16);return;}
        ${outputName}=vec4(filmic(col*3.16),1.0);
      }`;

    const fragmentSource = (constrainedMobile || auditMode || softwareRenderer) ? constrainedFragmentSource : fullFragmentSource;

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
    let rotationX=-.090,rotationY=-.235,rotationZ=.024;
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
      const cap=auditMode?1:softwareRenderer ? 0.82:constrainedMobile?1.18:mobile?1.50:constrained?1.18:1.65;
      const dpr=Math.min(devicePixelRatio||1,cap);
      const budget=auditMode?390000:softwareRenderer?190000:constrainedMobile?390000:mobile?760000:constrained?560000:1150000;
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
      /* R1557 is a genuinely opaque closed mineral. No alpha blending and no
         back-face culling means bad mobile winding can never punch black holes
         through the body, while the depth buffer still resolves the front shell. */
      gl.disable(gl.BLEND);
      gl.disable(gl.CULL_FACE);
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
    root.dataset.fxCoreOpticsR1551='smoky-obsidian-multi-source-reflection-small-recessed-glass-optic';
    root.dataset.fxCoreShapeR1551='taller-coherent-natural-crystal-mass-reduced-shard-chaos';
    root.dataset.fxCoreOpticsR1552='subtle-smoked-glass-aperture-no-eye-ring-higher-contrast-mineral-reflection';
    root.dataset.fxCoreShapeR1552='leaning-asymmetric-monolithic-obsidian-softened-large-facets-shorter-tendrils';
    root.dataset.fxCoreOpticsR1553='polished-volcanic-glass-no-round-optic-subtle-internal-mineral-fissure';
    root.dataset.fxCoreShapeR1553='high-density-smooth-shaded-asymmetric-monolith-clean-perimeter-tendrils';
    root.dataset.fxCoreOpticsR1555='camera-correct-obsidian-reflection-no-eye-actual-tendril-classification';
    root.dataset.fxCoreShapeR1555='broad-asymmetric-volcanic-monolith-filaments-hidden-behind-shell';
    root.dataset.fxCoreOpticsR1556='studio-softbox-conchoidal-reflections-no-eye-neutral-volcanic-glass';
    root.dataset.fxCoreOpticsR1557='opaque-black-volcanic-glass-neutral-studio-highlights-subtle-mineral-fissure';
    root.dataset.fxCoreShapeR1557='asymmetric-pointed-broad-plane-monolith-six-short-recessed-tendrils';
    root.dataset.fxCoreOpticsR1558='smoky-obsidian-visible-neutral-studio-planes-no-compositor-glow';
    root.dataset.fxCoreShapeR1558='continuous-asymmetric-superellipsoid-no-equator-seam-clean-buried-tendril-roots';
    root.dataset.fxCoreOpticsR1559='antialiased-opaque-smoky-glass-no-drop-shadow-no-black-facet-voids';
    root.dataset.fxCoreShapeR1559='leaning-irregular-monolith-continuous-envelope-buried-legacy-tendrils';
    root.dataset.fxCoreOpticsR1560='deep-obsidian-local-softbox-specular-subtle-mineral-vein-visible-surface-energy';
    root.dataset.fxCoreShapeR1560='asymmetric-cinematic-seed-smoother-monolith-offset-apex-natural-shoulders';
    root.dataset.fxCoreOpticsR1561='readable-smoky-obsidian-narrow-studio-reflections-neutral-silver-fissure';
    root.dataset.fxCoreShapeR1561='elongated-irregular-crystal-seed-broad-natural-planes-no-egg-silhouette';
    root.dataset.fxCoreOpticsR1562='broad-cut-plane-smoky-obsidian-reduced-plastic-softbox-readable-dark-mineral';
    root.dataset.fxCoreShapeR1562='elongated-asymmetric-seed-with-readable-mineral-planes';
    root.dataset.fxCoreOpticsR1564='balanced-upper-lower-smoky-obsidian-with-natural-broad-plane-reflection';
    root.dataset.fxCoreShapeR1564='continuous-smooth-envelope-no-equator-derivative-seam-asymmetric-seed';
    root.dataset.fxCoreOpticsR1571='physical-cyan-glass-energy-lens-four-petal-gunmetal-no-hud-segmented-cables';
    root.dataset.fxCoreShapeR1571='compact-four-petal-mechanical-pod-ten-living-cables-reference-final-stage';
    root.dataset.fxCoreOpticsR1572='smoky-obsidian-neutral-softbox-subtle-mineral-fissure-no-eye-no-petal-seams';
    root.dataset.fxCoreShapeR1572='asymmetric-elongated-volcanic-glass-seed-six-short-buried-tendrils';
    root.dataset.fxCoreOpticsR1573='readable-polished-obsidian-broad-neutral-reflections-visible-mineral-fracture-no-eye';
    root.dataset.fxCoreShapeR1573='asymmetric-seed-with-three-broad-natural-cuts-no-logo-diamond';
    root.dataset.fxCoreOpticsR1574='smoky-volcanic-glass-wide-luminance-range-neutral-softboxes-subtle-fracture';
    root.dataset.fxCoreShapeR1574='irregular-rounded-mineral-four-broad-cuts-no-diamond-silhouette-no-pinhole-culling';
    root.dataset.fxCoreOpticsR1575='dark-volcanic-glass-rectangular-studio-reflections-low-diffuse-high-specular';
    root.dataset.fxCoreShapeR1575='asymmetric-truncated-crystal-seed-oblique-cap-facets-no-egg-no-logo-diamond';
    root.dataset.fxCoreShapeR1576='five-offset-rings-nine-to-eleven-sided-hand-cut-obsidian-shard-broad-facets';
    root.dataset.fxCoreOpticsR1576='broad-flat-mineral-planes-rectangular-studio-softboxes-dark-obsidian';
    root.dataset.fxCoreOpticsR1577='neutral-saturation-canonical-surface-energy-photographic-obsidian';
    root.dataset.fxCoreShapeR1578='seven-offset-rings-twelve-to-fourteen-sided-tall-asymmetric-obsidian-seed';
    root.dataset.fxCoreOpticsR1578='readable-shadow-planes-neutral-studio-fill-rectangular-softbox-reflections';
    root.dataset.fxCoreShapeR1579='tall-hand-cut-seed-integrated-six-rooted-tendrils-larger-hero-presence';
    root.dataset.fxCoreOpticsR1579='feathered-studio-reflections-natural-facet-transition-no-white-rectangles';
    root.dataset.fxCoreShapeR1580='nine-offset-rings-eighteen-to-twenty-two-sided-sculpted-tall-obsidian-form-short-rooted-tendrils';
    root.dataset.fxCoreOpticsR1580='lifted-black-glass-midtones-soft-feathered-reflections-smooth-normals-subtle-fissure';
    root.dataset.fxCoreShapeR1581='eleven-offset-rings-twenty-six-to-thirty-two-sided-truncated-natural-monolith';
    root.dataset.fxCoreOpticsR1581='gaussian-non-rectangular-studio-reflections-canonical-mobile-contrast-saturation';
    root.dataset.fxCoreShapeR1582='twelve-offset-rings-thirty-two-to-forty-sided-slender-asymmetric-seed-buried-mobile-tendrils';
    root.dataset.fxCoreOpticsR1582='satin-smoky-volcanic-glass-broad-softboxes-subtle-fissure-no-cgi-hotspots';
    root.dataset.fxCoreShapeR1583='top-heavy-eleven-ring-geological-seed-three-direction-fracture-cuts-buried-tendrils';
    root.dataset.fxCoreOpticsR1583='deep-black-smoky-obsidian-studio-ribbon-reflections-warm-cool-balance-subtle-fissure';
    root.dataset.fxCoreShapeR1584='nine-ring-twenty-to-twenty-four-sided-hand-hewn-asymmetric-crystal-four-fracture-cuts';
    root.dataset.fxCoreOpticsR1584='deep-obsidian-narrow-cool-warm-studio-ribbons-matched-full-and-constrained-shaders';
    root.dataset.fxCoreShapeR1585='hand-hewn-living-crystal-with-four-short-integrated-tendrils';
    root.dataset.fxCoreOpticsR1585='recessed-irregular-cyan-energy-chamber-organic-metal-ribs-deep-photographic-obsidian';
    root.dataset.fxCoreShapeR1586='three-quarter-hand-cut-faceted-obsidian-reference-lab-scale';
    root.dataset.fxCoreOpticsR1586='larger-recessed-energy-chamber-visible-organic-ribs-high-contrast-black-glass';
    root.dataset.fxCoreShapeR1556='closed-outward-winding-solid-obsidian-shell-no-pinholes';
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
    if(constrainedMobile || softwareRenderer){
      /* R1543: the authored constrained/software shader already implements the R465
         low-bloom / no-edge / no-noise material contract directly. The legacy
         precompile hook cannot pattern-patch that intentionally smaller shader,
         so publish the same semantic surface contract from the real renderer. */
      root.dataset.fxCoreSurfaceR456='r465-uniform-solid-glass-soft-perimeter-low-bloom-mobile-optics';
      root.dataset.fxCoreMobileSurfaceR456=root.dataset.fxCoreSurfaceR456;
      root.dataset.fxCoreNormalR456=mobile?'continuous-volume-99.8-percent-smooth':'continuous-volume-93-percent-smooth';
      root.dataset.fxCoreMobileNormalR456=root.dataset.fxCoreNormalR456;
      root.dataset.fxCoreTriangleEdgesR456='disabled';
      root.dataset.fxCoreMobileTriangleEdgesR456='disabled';
      root.dataset.fxCoreOuterNoiseR456='disabled-on-glass-shell';
      root.dataset.fxCoreInnerLifeR456='preserved-low-cost-mobile-field';
      root.dataset.fxCoreSpecularR456=mobile?'soft-broad-low-gain-highlight-r465':'continuous-controlled-highlight';
      root.dataset.fxCoreMobileOpticalBalanceR465=mobile?'soft-perimeter-low-bloom-low-cost-shader':'desktop-material-unchanged';
      root.dataset.fxCoreConstrainedSurfaceOwnerR624='native-r326-equivalent-r465-contract';
      root.dataset.fxCoreSoftwareSurfaceOwnerR1543=softwareRenderer?'native-r326-software-equivalent-r465-contract':'not-software';
      root.dataset.fxCoreSoftwareDesktopContractR1544=softwareRenderer&&!mobile?'desktop-r465-semantics-preserved':'not-software-desktop';
    }
    root.dataset.fxCoreMobileResolutionR424=softwareRenderer?'r1555-software-dpr-cap-0.94-pixel-budget-260k':mobile?'r1555-mobile-camera-correct-smooth-adaptive':'r1555-desktop-camera-correct-smooth-adaptive';
    root.dataset.fxCoreMobileOpticsR435=mobile?'superseded-by-r454-visible-native-surface':'desktop-preserved-r454';
    root.dataset.fxCoreMobileOpticsR440=mobile?'superseded-by-r454-luminous-electric-surface':'desktop-superseded-by-r454';
    root.dataset.fxCoreMobilePerformanceR442=mobile?'18x36-capable-12x24-constrained-adaptive-intermittent-pulse-idle-zero':'desktop-three-pass-intermittent-pulse-idle-zero';
    root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';
    root.dataset.fxCoreReal3dTargetFps='interaction-60-idle-zero-r441';
    root.dataset.fxCoreIdleRenderR441='zero-frame';
    root.dataset.fxCoreRenderMs='0';
    root.dataset.fxCoreReal3dFps='60';
    root.dataset.fxCoreSoftwareBudgetR1545=softwareRenderer?'190k-r1572-sweep-safe-software-only':'hardware-budget-unchanged';

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

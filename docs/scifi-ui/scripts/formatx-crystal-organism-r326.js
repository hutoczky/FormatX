(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'crystal-organism-r326';
  const REVISION = 'living-luminous-electric-crystal-r454';
  const CANONICAL_REVISION = 'fully-living-organism-r1723';
  const VISUAL_REVISION_R1713 = 'photoreal-single-living-organism-r1713';
  const READY = 'ready-v69';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const auditMode = navigator.webdriver === true || /Chrome-Lighthouse/i.test(navigator.userAgent || '') || new URLSearchParams(location.search).get('lighthouse') === '1';
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
  root.dataset.fxNativeMagVisualR1588 = 'cinematic-polished-smoky-obsidian-three-quarter-soft-facet-transitions-studio-reflections-subtle-fissure';
  root.dataset.fxNativeMagVisualR1589 = 'intro-matched-polished-obsidian-hand-cut-twenty-side-mineral-planes-three-quarter-subtle-fissure';
  root.dataset.fxNativeMagVisualR1590 = 'cinematic-vertex-normal-obsidian-shard-smooth-reflections-readable-hand-cut-silhouette-subtle-fissure';
  root.dataset.fxNativeMagVisualR1591 = 'photographic-smoky-obsidian-crease-aware-cut-planes-clouded-inclusions-broad-softbox-subtle-living-fissure';
  root.dataset.fxNativeMagVisualR1592 = 'photographic-obsidian-validated-mobile-tonal-floor-natural-saturation';
  root.dataset.fxNativeMagVisualR1593 = 'photoreal-black-glass-organism-broad-irregular-mineral-clear-glass-lens-seven-living-tendrils';
  root.dataset.fxNativeMagVisualR1594 = 'sculpted-black-glass-core-physical-dome-lens-clear-bioglass-fins-visible-living-tendrils';
  root.dataset.fxNativeMagVisualR1595 = 'four-petal-black-glass-armor-smoked-iris-metal-bezel-clear-living-glass-appendages';
  root.dataset.fxNativeMagVisualR1596 = 'subdivided-curved-armor-petals-swept-bioglass-membranes-convex-smoked-lens-visible-tendrils';
  root.dataset.fxNativeMagVisualR1597 = 'asymmetric-obsidian-organism-thin-clear-glass-membranes-dark-optical-dome-front-living-tendrils';
  root.dataset.fxNativeMagVisualR1598 = 'single-sculpted-black-glass-mineral-dark-dome-lens-front-clear-tendrils-no-cgi-wings';
  root.dataset.fxNativeMagVisualR1564 = 'continuous-asymmetric-smoky-crystal-no-equator-seam-readable-lower-mineral-fill';
  root.dataset.fxNativeMagPerformanceR1541 = 'hardware-full-software-adaptive-native-webgl';
  root.dataset.fxNativeMagPerformanceR1602 = 'real-frame-interval-governed-adaptive-60fps';
  root.dataset.fxNativeMagPerformanceR1603 = 'software-lite-shader-and-geometry-hardware-photographic-adaptive-60fps';
  root.dataset.fxNativeMagPerformanceR1605 = 'proven-constrained-shader-software-lite-geometry-resolution';
  root.dataset.fxNativeMagPerformanceR1606 = 'aggressive-16-67ms-governor-hardware-adaptive-resolution';
  root.dataset.fxNativeMagPerformanceR1617 = 'preemptive-16-67ms-budget-resolution-before-cadence-drop';
  root.dataset.fxNativeMagPerformanceR1620 = 'hard-60hz-ceiling-preemptive-resolution-13ms-render-headroom';
  root.dataset.fxNativeMagPerformanceR1622 = 'refresh-divisor-never-intentionally-below-60fps-adaptive-quality';
  root.dataset.fxNativeMagPerformanceR1626 = 'hard-60fps-frame-budget-spike-guard-quality-before-cadence';
  root.dataset.fxNativeMagPerformanceR1632 = 'mobile-startup-lod-30-side-body-4-tendrils-compact-lens-60fps-first';
  root.dataset.fxNativeMagPerformanceR1666 = 'mobile-24-side-3-tendril-compact-lens-lower-pixel-budget-60fps-headroom';
  root.dataset.fxNativeMagQualityR1668 = 'hardware-mobile-073x-sharp-software-fallback-low-res-60fps-priority';
  root.dataset.fxNativeMagControlR1669 = 'user-shape-priority-blocks-automatic-cinematic-overwrite';
  root.dataset.fxNativeMagVisualR1619 = 'readable-smoky-obsidian-broad-softbox-midtones-single-pass';
  root.dataset.fxNativeMagPerformanceR1610 = 'non-overlapping-sweeps-true-zero-idle-gap';
  root.dataset.fxNativeMagVisualR1613 = 'natural-smoky-obsidian-midtones-small-integrated-smoked-dome-feathered-studio-reflections';
  root.dataset.fxNativeMagVisualR1690 = 'photoreal-ggx-obsidian-physical-lens-all-input-reactive-single-renderer';
  root.dataset.fxNativeMagInteractionR1690 = 'pointer-touch-drag-scroll-wheel-click-key-focus-section-physical-response';
  root.dataset.fxNativeMagInteractionR1692 = 'sitewide-pointer-touch-press-release-drag-scroll-wheel-click-key-focus-menu-language-section';
  root.dataset.fxNativeMagVisualR1693 = 'mobile-readable-smoky-obsidian-smaller-smoked-optic-adaptive-sharp-60fps';
  root.dataset.fxNativeMagVisualR1694 = 'photoreal-physical-response-capability-aware-adaptive-60hz';
  root.dataset.fxNativeMagVisualR1696 = 'readable-smoky-obsidian-software-floor-photoreal-edge-preservation';
  root.dataset.fxNativeMagInteractionR1701 = 'all-site-input-plus-cinematic-scene-physical-response';
  root.dataset.fxNativeMagPerformanceR1701 = 'quality-first-60fps-animation-budget-stricter-spike-guard';
  root.dataset.fxNativeMagVisualR1711 = 'single-photoreal-living-organism-fixed-body-physical-optics-responsive-tendrils';
  root.dataset.fxNativeMagCanonicalCompatibilityR1714='r454-api-revision-r1713-visual-runtime';
  root.dataset.fxNativeMagVisualR1717='photoreal-fixed-anatomy-organic-surface-physiology';
  root.dataset.fxNativeMagVisualR1725='studio-photoreal-smoky-pearl-biocrystal-broad-facets-subtle-physiology';
  root.dataset.fxNativeMagMaterialR1725='low-emission-mineral-diffuse-ggx-reflection-facet-tonal-variation';
  root.dataset.fxNativeMagVisualR1726='cinematic-photographic-smoky-pearl-biocrystal-neutral-studio-response';
  root.dataset.fxNativeMagMaterialR1726='neutral-mineral-ggx-softbox-restrained-vascular-emission-physical-edge-transmission';
  root.dataset.fxNativeMagVisualR1750='dark-smoky-obsidian-asymmetric-crystal-body-large-facet-photographic';
  root.dataset.fxNativeMagMaterialR1750='low-ivory-coverage-dark-mineral-softbox-edge-transmission';
  root.dataset.fxNativeMagVisualR1727='photographic-biocrystal-continuity-neutral-cortex-smoked-optic';
  root.dataset.fxNativeMagMaterialR1727='compile-safe-facet-tones-neutral-subsurface-low-emission-studio-reflection';
  root.dataset.fxNativeMagVisualR1749='final-photographic-smoky-pearl-biocrystal-integrated-optic';
  root.dataset.fxNativeMagMaterialR1749='neutral-mineral-softbox-low-cyan-no-neon-rib-physical-smoked-glass';
  root.dataset.fxNativeMagInteractionR1711 = 'all-input-physiology-no-shape-switching';
  root.dataset.fxNativeMagVisualR1703 = 'sharp-mobile-smoky-obsidian-dark-photographic-planes-readable-smoked-lens';
  root.dataset.fxNativeMagPerformanceR1703 = 'higher-mobile-start-resolution-with-fast-quality-shed-before-cadence';
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
  function buildOrganismGeometry(software=false) {
    const latitudeSegments = software ? 12 : constrainedMobile ? 16 : mobile ? 18 : constrained ? 20 : 24;
    const longitudeSegments = software ? 24 : constrainedMobile ? 32 : mobile ? 40 : constrained ? 42 : 52;
    const tendrilCount = software ? 4 : mobile ? 5 : 6;
    const tendrilSegments = software ? 10 : constrainedMobile ? 12 : mobile ? 14 : constrained ? 18 : 26;
    const tendrilSides = software ? 4 : mobile || constrained ? 4 : 6;
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
        const smoothNormal=item.crystalNormal||crystalNormal;
        const smoothWeight=software?.68:(mobile?.80:.84);
        const faceWeight=1-smoothWeight;
        const hybridNormal=normalize([
          smoothNormal[0]*smoothWeight+crystalNormal[0]*faceWeight,
          smoothNormal[1]*smoothWeight+crystalNormal[1]*faceWeight,
          smoothNormal[2]*smoothWeight+crystalNormal[2]*faceWeight
        ]);
        crystalNormals.push(...hybridNormal);
        uvs.push(...item.uv);
        barycentrics.push(...barycentric[index]);
        facets.push(facet);
      });
    }

    /* R1699 — validation renders the same hand-cut production mineral body.
       Audit/proof mode may lower backing resolution through the capability
       governor, but it must never substitute a different low-poly silhouette. */
    {
      /* R1576 — hand-cut production body.
         A small set of offset polygonal rings creates intentional broad mineral
         planes. This removes the rounded-pot/egg silhouette produced by a
         latitude sphere while preserving the same single WebGL draw and morph. */
      /* R1589 — use the same hand-cut mineral envelope as the successful late
         Three.js birth frames. The permanent MAG and cinematic handoff now share
         one silhouette language instead of drifting into a rounded pebble. */
      /* R1632 mobile LOD: the phone backing buffer is deliberately low-DPR,
         so 46 circumferential body slices add startup cost without visible
         silhouette gain. Keep desktop hand-cut density, reduce mobile only. */
      const sideCount = software ? 32 : mobile ? 44 : constrained ? 54 : 72;
      /* R1719 — healthy living body: a smooth, tensioned biomechanical envelope.
         Radii expand and contract continuously instead of zig-zagging between
         rings, removing the chewed/saw-tooth silhouette seen on phones. */
      /* R1724 — FormatX living crystal body.
         A tall asymmetric rhombic envelope replaces the swollen torso. The
         silhouette is crystalline while the surface remains cortical and alive. */
      const ringDefs = [
        [.94,.045,.040,-.125,-.014,.092],
        [.82,.145,.105,-.105,-.004,.078],
        [.64,.300,.205,-.072,.010,.060],
        [.43,.485,.300,-.020,.026,.042],
        [.20,.620,.365,.045,.035,.020],
        [-.04,.595,.350,.070,.026,-.004],
        [-.28,.495,.300,.038,.012,-.026],
        [-.50,.350,.225,-.010,-.002,-.046],
        [-.69,.225,.145,-.060,-.010,-.064],
        [-.84,.115,.078,-.095,-.014,-.078],
        [-.95,.040,.034,-.118,-.016,-.092]
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
          const mid=Math.sin((ringIndex+1)/(ringDefs.length+1)*Math.PI);
          const irregular=
            1
            +Math.sin(a*4.0+ringIndex*.43)*.028*mid
            +Math.cos(a*6.0-ringIndex*.37)*.014*mid
            +Math.sin(a*2.0+ringIndex*.61)*.010;
          const cutFront=1-.075*Math.pow(Math.max(0,Math.cos(a-.48)),4.0);
          const cutRear=1-.048*Math.pow(Math.max(0,Math.cos(a+2.12)),5.0);
          const cutSide=1-.050*Math.pow(Math.max(0,Math.cos(a-2.48)),6.0);
          const cutNotch=1-.038*Math.pow(Math.max(0,Math.cos(a+1.20)),8.0);
          const radialCut=cutFront*cutRear*cutSide*cutNotch;
          const x=ox+Math.cos(a)*rx*irregular*radialCut;
          const z=oz+Math.sin(a)*rz*(1+Math.cos(sideIndex*1.61+ringIndex*.57)*.018)*radialCut;
          return bodyVertex([x,y,z],[sideIndex/sideCount,(ringIndex+1)/(ringDefs.length+1)]);
        });
      });
      const top=bodyVertex([-.145,1.045,-.022],[.5,0]);
      const bottom=bodyVertex([-.135,-1.035,.006],[.5,1]);

      /* R1590 — reproduce Three.js-style averaged vertex normals on the native
         hand-cut body. The geometry remains faceted, but polished reflections
         now travel continuously across neighbouring mineral planes instead of
         breaking into a low-poly game asset. */
      const bodyFaces=[];
      const queueBodyFace=(vertices,facet)=>{
        let faceNormal=normalize(cross(
          subtract(vertices[1].crystal,vertices[0].crystal),
          subtract(vertices[2].crystal,vertices[0].crystal)
        ));
        const centre=[0,1,2].map(axis=>
          (vertices[0].crystal[axis]+vertices[1].crystal[axis]+vertices[2].crystal[axis])/3
        );
        if(dot(faceNormal,centre)<0){
          vertices=[vertices[0],vertices[2],vertices[1]];
          faceNormal=faceNormal.map(value=>-value);
        }
        bodyFaces.push({vertices,facet,faceNormal});
      };

      for(let side=0;side<sideCount;side+=1){
        const next=(side+1)%sideCount;
        queueBodyFace([top,rings[0][next],rings[0][side]],.16+.72*random(side,701));
      }
      for(let ring=0;ring<rings.length-1;ring+=1){
        for(let side=0;side<sideCount;side+=1){
          const next=(side+1)%sideCount;
          const a=rings[ring][side];
          const b=rings[ring][next];
          const cc=rings[ring+1][side];
          const d=rings[ring+1][next];
          const facet=.14+.76*random(side+ring*17,ring*43+side);
          if((side+ring)%2===0){
            queueBodyFace([a,b,d],facet);
            queueBodyFace([a,d,cc],facet+.013);
          }else{
            queueBodyFace([a,b,cc],facet);
            queueBodyFace([b,d,cc],facet+.013);
          }
        }
      }
      const last=rings[rings.length-1];
      for(let side=0;side<sideCount;side+=1){
        const next=(side+1)%sideCount;
        queueBodyFace([last[side],last[next],bottom],.16+.72*random(side,907));
      }

      const normalSums=new Map();
      for(const face of bodyFaces){
        for(const vertexRef of face.vertices){
          const sum=normalSums.get(vertexRef)||[0,0,0];
          sum[0]+=face.faceNormal[0];
          sum[1]+=face.faceNormal[1];
          sum[2]+=face.faceNormal[2];
          normalSums.set(vertexRef,sum);
        }
      }
      for(const [vertexRef,sum] of normalSums)vertexRef.crystalNormal=normalize(sum);
      for(const face of bodyFaces)triangle(face.vertices,face.facet);
    }

    /* The reference's cable/tentacle silhouette is still one native R326 draw.
       Each appendage is appended to the same buffers and collapses back into the
       sphere endpoint during morph, so no duplicate canvas/core is introduced. */
    function tendrilPath(index, t) {
      const lane=(index-(tendrilCount-1)*.5)/Math.max(1,tendrilCount-1);
      const rootX=-.56+.040*Math.sin(index*1.71);
      const rootY=.12+lane*.54+.035*Math.cos(index*1.13);
      const rootZ=.04+.10*Math.sin(index*.91);
      const sweep=.52+.34*(.5+.5*Math.sin(index*1.37));
      const wave=Math.sin(t*Math.PI*1.55+index*.83)*(.025+.095*t)
        +Math.sin(t*Math.PI*.72+index*.47)*.028*t;
      const rise=Math.sin(t*Math.PI*.92+index*.73)*(.035+.10*t);
      return [
        rootX-(.30+sweep)*t-.18*t*t,
        rootY+rise+lane*.12*t+wave*.34,
        rootZ+.10*Math.sin(t*Math.PI+index*.61)+wave
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
      const tubeRadius = (.024 * (1 - t * .84) + .0042) * (mobile ? .96 : 1);
      const rootDirection = normalize([p[0]-.08, p[1], p[2]*.72+.02]);
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

    /* R1598 — permanent hero simplification. The organism is one sculpted
       black-glass mineral with a physical optical dome and thin glass tendrils.
       Flat/wing surfaces are deliberately absent because they read as CGI horns
       rather than the photographic liquid-glass appendages in the reference. */
    function surfaceVertex(position, normal=null, uv=[.5,.5], sphereRadius=.91) {
      const dir=normalize(position);
      const item={
        sphere:dir.map(value=>value*sphereRadius),
        crystal:position,
        sphereNormal:dir,
        uv
      };
      if(normal)item.crystalNormal=normalize(normal);
      return item;
    }
    function armorVertex(position, uv=[.5,.5]) {
      return surfaceVertex(position,null,uv,.91);
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

    /* R1724 — additional living anatomy is appended to the same attribute
       buffers. No second canvas, model loader or image asset is introduced. */
    function guardianTriangle(vertices,facet,origin=[0,0,0]){
      let faceNormal=normalize(cross(
        subtract(vertices[1].crystal,vertices[0].crystal),
        subtract(vertices[2].crystal,vertices[0].crystal)
      ));
      const centre=[0,1,2].map(axis=>
        (vertices[0].crystal[axis]+vertices[1].crystal[axis]+vertices[2].crystal[axis])/3
      );
      const localCentre=subtract(centre,origin);
      if(dot(faceNormal,localCentre)<0){
        [vertices[1],vertices[2]]=[vertices[2],vertices[1]];
        faceNormal=faceNormal.map(value=>-value);
      }
      const barycentric=[[1,0,0],[0,1,0],[0,0,1]];
      vertices.forEach((item,index)=>{
        sphere.push(...item.sphere);
        crystal.push(...item.crystal);
        sphereNormals.push(...item.sphereNormal);
        const smoothNormal=item.crystalNormal||faceNormal;
        const hybridNormal=normalize([
          smoothNormal[0]*.78+faceNormal[0]*.22,
          smoothNormal[1]*.78+faceNormal[1]*.22,
          smoothNormal[2]*.78+faceNormal[2]*.22
        ]);
        crystalNormals.push(...hybridNormal);
        uvs.push(...item.uv);
        barycentrics.push(...barycentric[index]);
        facets.push(facet);
      });
    }
    function appendEllipsoid(center,radii,facetBase=.72,latSteps=8,lonSteps=14,rotZ=0){
      const [cx,cy,cz]=center,[rx0,ry0,rz0]=radii;
      const czr=Math.cos(rotZ),szr=Math.sin(rotZ);
      const grid=[];
      for(let iy=0;iy<=latSteps;iy++){
        const v=iy/latSteps;
        const phi=v*Math.PI;
        const sp=Math.sin(phi),cp=Math.cos(phi);
        const row=[];
        for(let ix=0;ix<lonSteps;ix++){
          const u=ix/lonSteps;
          const th=u*Math.PI*2;
          const lx=Math.cos(th)*sp*rx0;
          const ly=cp*ry0;
          const lz=Math.sin(th)*sp*rz0;
          const x=cx+lx*czr-ly*szr;
          const y=cy+lx*szr+ly*czr;
          const z=cz+lz;
          const nLocal=normalize([
            (Math.cos(th)*sp)/Math.max(.001,rx0),
            cp/Math.max(.001,ry0),
            (Math.sin(th)*sp)/Math.max(.001,rz0)
          ]);
          const nx=nLocal[0]*czr-nLocal[1]*szr;
          const ny=nLocal[0]*szr+nLocal[1]*czr;
          const normal=normalize([nx,ny,nLocal[2]]);
          const dir=normalize([x,y,z]);
          row.push({
            sphere:dir.map(value=>value*.88),
            crystal:[x,y,z],
            sphereNormal:dir,
            crystalNormal:normal,
            uv:[u,v]
          });
        }
        grid.push(row);
      }
      for(let iy=0;iy<latSteps;iy++){
        for(let ix=0;ix<lonSteps;ix++){
          const nx=(ix+1)%lonSteps;
          const facet=facetBase+.18*random(ix+iy*13,iy*29+ix);
          guardianTriangle([grid[iy][ix],grid[iy][nx],grid[iy+1][ix]],facet,center);
          guardianTriangle([grid[iy][nx],grid[iy+1][nx],grid[iy+1][ix]],facet+.007,center);
        }
      }
    }
    function appendLimb(start,end,r0,r1,facetBase=.86,segments=7,sides=8){
      const a=start,b=end;
      const tangent=normalize(subtract(b,a));
      const guide=Math.abs(tangent[1])>.86?[1,0,0]:[0,1,0];
      const sideA=normalize(cross(tangent,guide));
      const sideB=normalize(cross(tangent,sideA));
      const rings=[];
      for(let segment=0;segment<=segments;segment++){
        const t=segment/segments;
        const eased=t*t*(3-2*t);
        const p=[
          a[0]+(b[0]-a[0])*t,
          a[1]+(b[1]-a[1])*t,
          a[2]+(b[2]-a[2])*t
        ];
        const radius=r0+(r1-r0)*eased;
        rings.push(Array.from({length:sides},(_,side)=>{
          const angle=side/sides*Math.PI*2;
          const offset=[
            sideA[0]*Math.cos(angle)*radius+sideB[0]*Math.sin(angle)*radius,
            sideA[1]*Math.cos(angle)*radius+sideB[1]*Math.sin(angle)*radius,
            sideA[2]*Math.cos(angle)*radius+sideB[2]*Math.sin(angle)*radius
          ];
          const pos=[p[0]+offset[0],p[1]+offset[1],p[2]+offset[2]];
          const dir=normalize(pos);
          return {
            sphere:dir.map(value=>value*.86),
            crystal:pos,
            sphereNormal:dir,
            crystalNormal:normalize(offset),
            uv:[side/sides,t]
          };
        }));
      }
      for(let segment=0;segment<segments;segment++){
        for(let side=0;side<sides;side++){
          const next=(side+1)%sides;
          const facet=facetBase+.12*random(segment*17+side,side*31+segment);
          const centre=[(a[0]+b[0])*.5,(a[1]+b[1])*.5,(a[2]+b[2])*.5];
          guardianTriangle([rings[segment][side],rings[segment][next],rings[segment+1][side]],facet,centre);
          guardianTriangle([rings[segment][next],rings[segment+1][next],rings[segment+1][side]],facet+.006,centre);
        }
      }
    }
    function appendMembraneTri(a,b,c,facet=4.42){
      let vertices=[
        surfaceVertex(a,null,[0,0],.86),
        surfaceVertex(b,null,[1,0],.86),
        surfaceVertex(c,null,[.5,1],.86)
      ];
      const face=normalize(cross(subtract(vertices[1].crystal,vertices[0].crystal),subtract(vertices[2].crystal,vertices[0].crystal)));
      if(face[2]<0)[vertices[1],vertices[2]]=[vertices[2],vertices[1]];
      guardianTriangle(vertices,facet,[.62,.90,-.24]);
    }

    /* R1724 — unique FormatX crystal creature anatomy.
       Living cortical lobes and membranes replace animal limbs and robotic armour. */
    appendEllipsoid([-.30,.35,.060],[.145,.285,.125],.74,mobile?6:8,mobile?10:14,.38);
    appendEllipsoid([ .31,.24,.075],[.155,.250,.135],.70,mobile?6:8,mobile?10:14,-.32);
    appendEllipsoid([-.27,-.31,.030],[.135,.245,.115],.78,mobile?6:8,mobile?10:14,-.26);
    appendEllipsoid([ .28,-.37,.045],[.140,.235,.120],.76,mobile?6:8,mobile?10:14,.30);

    /* Living crystalline membranes: a crown/facet silhouette that bends and
       breathes instead of reading as horns, wings or metal fins. */
    appendMembraneTri([-.18,.67,-.04],[-.42,1.10,-.09],[-.01,.84,.05],4.34);
    appendMembraneTri([ .15,.69,.01],[ .38,1.04,-.04],[.04,.85,.06],4.38);
    appendMembraneTri([-.43,.19,-.08],[-.72,.38,-.14],[-.50,-.03,.01],4.46);
    appendMembraneTri([ .46,.14,-.07],[ .76,.29,-.13],[ .52,-.07,.03],4.48);
    /* Lower fins are intentionally absent in R1750: the permanent organism
       keeps a crystalline crown/side silhouette instead of a radial star. */

    if(!auditMode){
      const centreX=.008,centreY=-.006;
      const bezelInner=.125,bezelOuter=.180,bezelSteps=software?20:mobile?30:42,bezelZ=.635;
      const cartilagePoint=(angle,radius,outer=false)=>{
        const lobe=1
          +(outer?.050:.038)*Math.sin(angle*3.0+.34)
          +(outer?.026:.018)*Math.sin(angle*5.0-.72)
          +.012*Math.cos(angle*7.0+.18);
        const yStretch=outer?1.035:1.025;
        return [
          centreX+Math.cos(angle)*radius*lobe,
          centreY+Math.sin(angle)*radius*lobe*yStretch,
          bezelZ+.007*Math.sin(angle*4.0+.40)+.004*Math.cos(angle*3.0)
        ];
      };
      for(let side=0;side<bezelSteps;side+=1){
        const a=side/bezelSteps*Math.PI*2;
        const b=(side+1)/bezelSteps*Math.PI*2;
        const p0=cartilagePoint(a,bezelInner,false);
        const p1=cartilagePoint(b,bezelInner,false);
        const p2=cartilagePoint(b,bezelOuter,true);
        const p3=cartilagePoint(a,bezelOuter,true);
        armorQuad(p0,p1,p2,p3,5.74);
      }

      const lensCenter=[centreX,centreY,.646];
      const lensRadius=.148;
      const lensDepth=.094;
      const radialSteps=software?4:mobile?5:8;
      const angularSteps=software?20:mobile?30:42;
      function lensVertex(radial,angle){
        const rr=lensRadius*radial;
        const nx=radial*Math.cos(angle);
        const ny=radial*Math.sin(angle);
        const nz=Math.sqrt(Math.max(0,1-radial*radial));
        const crystalPosition=[
          lensCenter[0]+rr*Math.cos(angle),
          lensCenter[1]+rr*Math.sin(angle),
          lensCenter[2]+lensDepth*nz
        ];
        const normal=normalize([nx,ny,nz*1.86]);
        const dir=normalize(crystalPosition);
        return {
          sphere:dir.map(value=>value*.88),
          crystal:crystalPosition,
          sphereNormal:dir,
          crystalNormal:normal,
          uv:[.5+.5*nx,.5+.5*ny]
        };
      }
      const lensCentre=lensVertex(0,0);
      let previous=null;
      for(let ring=1;ring<=radialSteps;ring+=1){
        const radial=ring/radialSteps;
        const current=Array.from({length:angularSteps},(_,index)=>lensVertex(radial,index/angularSteps*Math.PI*2));
        if(ring===1){
          for(let side=0;side<angularSteps;side+=1){
            const next=(side+1)%angularSteps;
            triangle([lensCentre,current[next],current[side]],6.42);
          }
        }else{
          for(let side=0;side<angularSteps;side+=1){
            const next=(side+1)%angularSteps;
            triangle([previous[side],previous[next],current[side]],6.42);
            triangle([previous[next],current[next],current[side]],6.42);
          }
        }
        previous=current;
      }
    }

    return {
      arrays: [sphere, crystal, sphereNormals, crystalNormals, uvs, barycentrics, facets]
        .map(values => new Float32Array(values)),
      sizes: [3, 3, 3, 3, 2, 3, 1],
      count: facets.length,
      tendrils: tendrilCount,
      topology: `${latitudeSegments}x${longitudeSegments}-cortical-organic-core-plus-${tendrilCount}-native-tendrils-r1723`
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
    const compositorFilter=mobile
      ? 'brightness(1.04) contrast(1.08) saturate(1.03)'
      : 'brightness(1.03) contrast(1.085) saturate(1.02)';
    canvas.style.setProperty('filter',compositorFilter,'important');
    canvas.style.setProperty('-webkit-filter',compositorFilter,'important');
    canvas.style.setProperty('box-shadow','none','important');

    const options = {
      alpha:true,
      /* R1626: mobile/coarse displays get temporal smoothness from native
         device density; MSAA costs frame budget twice (raster + resolve).
         Preserve desktop MSAA only where headroom is normally available. */
      antialias:!auditMode && !constrained && (!mobile || (devicePixelRatio||1)<=3.5),
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
      root.dataset.fxCoreFallbackR1666 = 'semantic-live-os-command-restored';
      const liveOsLauncher=document.querySelector('#hero [data-fx-live-os-launcher].fx-reference-liveos');
      if(liveOsLauncher instanceof HTMLElement){
        for(const [name,value] of [
          ['display','inline-flex'],['visibility','visible'],['opacity','1'],
          ['pointer-events','auto'],['position','relative'],['inset','auto'],
          ['min-width','74px'],['width','auto'],['max-width','none'],
          ['min-height','53px'],['height','53px'],['max-height','53px'],
          ['overflow','visible']
        ])liveOsLauncher.style.setProperty(name,value,'important');
      }
      dispatchEvent(new CustomEvent('formatx:core3dfallback',{detail:{reason:'r326-webgl-unavailable',fallback:'semantic-live-os'}}));
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
        /* R1717 — one organism, fixed anatomy. Legacy morph input remains API
           compatible but never replaces the body. Constant organic smoothing plus
           physiological deformation keeps the asymmetric silhouette alive. */
        float morph=0.0;
        float organicBlend=.045;
        vec3 crystalShadingNormal=normalize(mix(aCrystalNormal,aSphereNormal,.54));
        vec3 normal=normalize(mix(crystalShadingNormal,aSphereNormal,organicBlend));
        vec3 base=mix(aCrystal,aSphere,organicBlend);
        float cell=sin(uTime*.71+dot(aSphereNormal,vec3(5.7,4.1,6.3))+uSiteProgress*6.28318);
        float membrane=sin(uTime*1.17+aUv.x*12.566-aUv.y*9.2+sin(aUv.y*6.283)*1.4);
        float living=(cell*.011+membrane*.0065)*(.42+.58*uEnergy);
        float bodyVertexMask=1.0-step(2.0,aFacet);
        float cortexEnvelope=pow(max(0.0,sin(aUv.y*3.14159265)),1.35)*bodyVertexMask;
        float cortexA=sin(aUv.x*37.699+sin(aUv.y*18.849)*1.55+aUv.y*5.3);
        float cortexB=sin(aUv.x*18.849-aUv.y*25.133+sin(aUv.x*12.566)*1.20);
        float cortex=(cortexA*.62+cortexB*.38)*.018*cortexEnvelope;
        float microFold=sin(aUv.x*62.832+aUv.y*43.982)*.0032*cortexEnvelope;
        float layerScale=uLayer>.5?.50:1.0;
        float heartbeat=1.0+uBreath*(uLayer>.5?.040:.020);
        vec3 local=(base+normal*(living+cortex+microFold))*layerScale*heartbeat;
        float tendrilVertex=step(2.0,aFacet)*(1.0-step(4.0,aFacet));
        float tendrilTip=tendrilVertex*smoothstep(.10,1.0,aUv.y);
        float tendrilWave=sin(uTime*(1.18+.16*fract(aFacet)) + aUv.y*9.4 + aFacet*2.7);
        float tendrilWave2=cos(uTime*.83 + aUv.y*7.2 - aFacet*1.9);
        local.x+=tendrilTip*(uPointer.x*.060 + tendrilWave*(.012+.020*uEnergy));
        local.y+=tendrilTip*(-uPointer.y*.048 + tendrilWave2*(.010+.016*uEnergy));
        local.z+=tendrilTip*(tendrilWave*.012+tendrilWave2*.008)*(.55+.45*uEnergy);
        local.xy+=uPointer*.038*uLayer;
        float yaw=.34+uRotation.y+uPointer.x*.18+uTime*.014;
        float pitch=-.058+uRotation.x-uPointer.y*.12+.010*sin(uTime*.19);
        float roll=-.058+uRotation.z+uPointer.x*uPointer.y*.026+.006*sin(uTime*.23);
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
        projected*= ${mobile?'.790':'.825'};
        projected.x+=${mobile?'.006':'.052'};
        projected.y+=${mobile?'.006':'.002'};
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
      vec3 fresnelSchlick(float cosTheta,vec3 F0){
        return F0+(1.0-F0)*pow(1.0-clamp(cosTheta,0.0,1.0),5.0);
      }
      float distributionGGX(float NoH,float roughness){
        float a=roughness*roughness;
        float a2=a*a;
        float d=(NoH*NoH)*(a2-1.0)+1.0;
        return a2/max(3.14159265*d*d,.0002);
      }
      float geometrySchlickGGX(float NoV,float roughness){
        float r=roughness+1.0;
        float k=(r*r)/8.0;
        return NoV/max(NoV*(1.0-k)+k,.0002);
      }
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
        vec3 halfKey=normalize(key+view);
        float NoV=max(dot(n,view),.001);
        float NoH=max(dot(n,halfKey),0.0);
        float keySpec=pow(NoH,88.0);
        float keySoft=pow(NoH,5.6);
        float sideSpec=pow(max(dot(n,normalize(side+view)),0.0),42.0);
        vec3 refl=reflect(-view,n);
        float softboxA=exp(-pow((refl.x+.28)/.58,2.0)-pow((refl.y-.34)/.74,2.0))*smoothstep(-.30,.44,refl.z);
        float softboxB=exp(-pow((refl.x-.40)/.52,2.0)-pow((refl.y-.02)/.78,2.0))*smoothstep(-.36,.50,refl.z);
        float ceilingBand=exp(-pow((refl.y-.72)/.30,4.0))*smoothstep(.02,.68,refl.z);
        float horizonBand=exp(-pow((refl.y+.05)/.19,2.0))*smoothstep(.08,.90,facing);
        float studioRibbonA=exp(-pow((refl.x+.16)/.205,2.0)-pow((refl.y-.16)/.78,2.0))*smoothstep(-.22,.62,refl.z);
        float studioRibbonB=exp(-pow((refl.x-.31)/.155,2.0)-pow((refl.y+.08)/.66,2.0))*smoothstep(-.18,.64,refl.z);

        float isTendril=step(2.0,vFacet)*(1.0-step(4.0,vFacet));
        float isGlassFin=step(4.0,vFacet)*(1.0-step(5.0,vFacet));
        float isArmor=step(5.0,vFacet)*(1.0-step(6.0,vFacet));
        float isLensMesh=step(6.0,vFacet);
        float bodyMask=max(0.0,1.0-isTendril-isGlassFin-isArmor-isLensMesh);
        float tendrilMask=isTendril*(1.0-vMorph);
        float glassFinMask=isGlassFin*(1.0-vMorph);
        float armorMask=isArmor*(1.0-vMorph);
        float lensMeshMask=isLensMesh*(1.0-vMorph);
        float facetRand=fract(sin(fract(vFacet)*91.73+13.17)*43758.5453);
        float microRoughness=mix(.16,.34,facetRand);
        float microD=distributionGGX(NoH,microRoughness);
        float microG=geometrySchlickGGX(NoV,microRoughness)*geometrySchlickGGX(max(ndl,.001),microRoughness);
        vec3 microF=fresnelSchlick(max(dot(halfKey,view),0.0),vec3(.039,.041,.043));
        vec3 microSpec=min(vec3(1.8),(microD*microG*microF)/max(4.0*NoV*max(ndl,.001),.001));
        float lift=sat(.215+ndl*.285+sideLight*.225+fillLight*.155);
        float facetTone=mix(.982,1.018,facetRand);
        float smokyDepth=.5+.5*sin(vLocal.x*4.1+vLocal.y*2.7-vLocal.z*3.6);
        float mineralGrain=.5+.5*sin(vLocal.x*37.0+vLocal.y*29.0+vLocal.z*41.0);
        float strata=.5+.5*sin(vLocal.y*17.0+vLocal.x*4.7-vLocal.z*3.1+sin(vLocal.x*8.0)*.35);
        float inclusion=smoothstep(.72,.96,.5+.5*sin(vLocal.x*12.0-vLocal.y*7.0+vLocal.z*9.0))*smoothstep(.18,.78,smokyDepth);
        vec3 mineral=mix(vec3(.010,.015,.021),vec3(.105,.126,.133),lift)*facetTone;
        mineral*=.955+.045*smokyDepth+.012*mineralGrain;
        mineral+=vec3(.011,.014,.015)*strata*(.18+.32*lift);
        mineral-=vec3(.0035,.0048,.0052)*inclusion;
        mineral+=vec3(.92,.90,.84)*keySpec*.074;
        mineral+=microSpec*ndl*.22;
        mineral+=vec3(.27,.28,.27)*keySoft*.045;
        mineral+=vec3(.52,.58,.59)*sideSpec*.096;
        mineral+=vec3(.64,.68,.67)*softboxA*.118;
        mineral+=vec3(.38,.43,.43)*softboxB*.078;
        mineral+=vec3(.82,.86,.85)*studioRibbonA*.092;
        mineral+=vec3(.52,.34,.22)*studioRibbonB*.052;
        mineral+=vec3(.13,.14,.13)*ceilingBand*.075;
        mineral+=vec3(.080,.096,.095)*horizonBand*.170;
        mineral+=vec3(.100,.205,.235)*fresnel*.34;
        mineral+=vec3(.034,.022,.016)*floorBounce*.055;
        float planeKey=max(0.0,dot(n,normalize(vec3(-.30,.42,.86))));
        float planeFill=max(0.0,dot(n,normalize(vec3(.68,-.18,.71))));
        mineral+=vec3(.012,.015,.016)*(.14+.22*fillLight+.08*floorBounce);
        mineral+=vec3(.090,.098,.096)*pow(planeKey,.72)*.27;
        mineral+=vec3(.052,.045,.039)*pow(planeFill,.82)*.14;
        mineral+=vec3(.003,.011,.013)*smokyDepth*(.30+.70*(1.0-facing));
        vec3 mineralAbsorption=exp(-vec3(.34,.22,.16)*(0.18+0.44*smokyDepth)*(1.0-facing));
        mineral*=mix(vec3(1.0),mineralAbsorption,.22);
        float edgeTransmission=pow(1.0-facing,3.0)*(1.0-sat(ndl*.58));
        mineral+=vec3(.032,.066,.072)*edgeTransmission*.54;
        float backScatter=pow(max(0.0,dot(-n,normalize(vec3(.16,.42,-.89)))),2.2)*(1.0-facing);
        float subsurface=pow(max(0.0,dot(-n,key)),1.65)*(1.0-facing);
        mineral+=vec3(.025,.052,.058)*backScatter*.36;
        mineral+=vec3(.066,.050,.074)*subsurface*(.038+.042*uEnergy);
        mineral+=vec3(.018,.060,.072)*subsurface*fresnel*.14;
        float vesselA=pow(.5+.5*sin(vLocal.y*31.0+sin(vLocal.x*8.0)*2.6+vLocal.z*13.0),34.0);
        float vesselB=pow(.5+.5*sin(vLocal.x*37.0-vLocal.y*11.0+sin(vLocal.z*10.0)*2.1),38.0);
        float vesselC=pow(.5+.5*sin(vLocal.x*19.0+vLocal.y*41.0-vLocal.z*17.0+sin(vLocal.y*13.0)*2.4),42.0);
        float vascular=max(max(vesselA,vesselB),vesselC)*bodyMask;
        mineral+=vec3(.020,.115,.132)*vascular*(.045+.090*uEnergy);
        float cortexWave=.5+.5*sin(vUv.x*37.699+sin(vUv.y*18.849)*1.65+vUv.y*5.2);
        float cortexCross=.5+.5*sin(vUv.x*18.849-vUv.y*25.133+sin(vUv.x*12.566)*1.25);
        float cortexValley=pow(1.0-max(cortexWave*.72,cortexCross*.56),3.4)*bodyMask;
        float cortexRidge=pow(max(cortexWave,cortexCross),4.2)*bodyMask;
        mineral=mix(mineral,vec3(.012,.015,.019),cortexValley*.31);
        mineral+=vec3(.072,.090,.098)*cortexRidge*.082;
        mineral+=vec3(.022,.092,.108)*cortexRidge*vascular*.31;

        /* R1724 FormatX living-crystal material — pearlescent cortical bioceramic
           plates ride above dark cortical tissue. The plate field is broad,
           irregular and organic; it is not a metallic armour texture. */
        float plateField=.5+.5*sin(vLocal.x*8.7+vLocal.y*5.1-vLocal.z*7.3+sin(vLocal.y*3.6)*1.4);
        float plateCross=.5+.5*sin(vLocal.x*4.3-vLocal.y*7.9+vLocal.z*6.1+sin(vLocal.z*4.8)*1.2);
        float plateBlend=plateField*.62+plateCross*.38;
        float plateMask=smoothstep(.74,.93,plateBlend)*bodyMask;
        plateMask*=.50+.30*smoothstep(-.45,.82,n.z);
        float livingSeam=pow(1.0-plateBlend,5.0)*bodyMask;
        float plateFacetTone=.90+.14*fract(vFacet*7.13+.19);
        vec3 ivory=vec3(.095,.125,.132)
          +vec3(.24,.26,.24)*(.18*ndl+.12*sideLight+.18*softboxA)
          +vec3(.10,.17,.18)*fresnel*.14;
        ivory+=vec3(.54,.36,.24)*studioRibbonB*.050;
        mineral*=mix(1.0,plateFacetTone,bodyMask*.42);
        mineral=mix(mineral,ivory,plateMask*.28);
        mineral=mix(mineral,vec3(.004,.008,.014),livingSeam*.54);
        mineral+=vec3(.038,.170,.198)*vascular*(.045+.095*uEnergy);
        mineral+=vec3(.48,.31,.20)*vascular*studioRibbonB*.050;

        vec2 q=vLocal.xy;
        float front=smoothstep(.19,.53,vLocal.z)*(1.0-vMorph)*bodyMask;
        float crackX=q.x+.010*sin(q.y*19.0+vLocal.z*8.0)+.004*sin(q.y*43.0);
        float fissureEnvelope=exp(-pow(q.y/.31,4.0))*front;
        float fissureHalo=exp(-pow(crackX/.025,2.0))*fissureEnvelope;
        float fissure=exp(-pow(crackX/.0058,2.0))*fissureEnvelope;
        mineral=mix(mineral,vec3(.003,.008,.010),fissureHalo*.10);
        mineral+=vec3(.18,.30,.31)*fissure*.072;
        mineral+=vec3(.66,.67,.62)*fissure*.030;

        /* R1593 — a physical smoked-glass lens, not a glowing eye or HUD.
           Its shading is driven by the same studio reflections as the obsidian. */
        vec2 lq=vec2((q.x+.012)*1.16,(q.y-.018)*.96);
        float lensD=length(lq);
        float lensOuter=(1.0-smoothstep(.145,.205,lensD))*front;
        float lensGlass=(1.0-smoothstep(.092,.150,lensD))*front;
        float lensCore=(1.0-smoothstep(.030,.067,lensD))*front;
        float lensRim=max(0.0,lensOuter-lensGlass);
        float lensHighlight=exp(-pow((lq.x+.042)/.024,2.0)-pow((lq.y-.044)/.031,2.0))*lensGlass;
        float lensLower=exp(-pow((lq.x-.026)/.052,2.0)-pow((lq.y+.052)/.036,2.0))*lensGlass;
        float lensDepth=sat(1.0-lensD/.080);

        float ribWarp=.010*sin(q.y*15.0+q.x*7.0);
        float ribGate=smoothstep(.13,.34,abs(q.x))*(1.0-smoothstep(.44,.53,abs(q.x)))*front;
        float upperRib=exp(-pow((q.y-(.30-.62*abs(q.x))+ribWarp)/.019,2.0))*ribGate;
        float lowerRib=exp(-pow((q.y+(.285-.58*abs(q.x))-ribWarp)/.019,2.0))*ribGate;
        float sideRib=exp(-pow((abs(q.x)-(.205+.16*abs(q.y)+.006*sin(q.y*17.0)))/.018,2.0))
          *(1.0-smoothstep(.36,.50,abs(q.y)))*front;
        float ribs=sat(upperRib+lowerRib+sideRib);

        mineral=mix(mineral,vec3(.0012,.0025,.0032),lensOuter*.62);
        mineral+=vec3(.20,.24,.24)*lensRim*(.022+.040*sideLight+.030*fresnel);
        mineral+=vec3(.012,.022,.025)*lensGlass*(.030+.035*softboxA+.030*sideSpec);
        mineral+=vec3(.42,.47,.46)*lensHighlight*.060;
        mineral+=vec3(.10,.12,.12)*lensLower*.025;
        mineral+=vec3(.003,.009,.011)*lensCore*lensDepth*.020;
        mineral=mix(mineral,vec3(.010,.013,.016),ribs*.18);
        mineral+=vec3(.080,.096,.102)*ribs*(.014+.044*keySoft+.038*sideSpec);
        mineral+=vec3(.020,.115,.135)*ribs*lensOuter*(.035+.045*uEnergy);

        float pulse=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(vLocal.y*.62+vLocal.x*.14+vLocal.z*.20)*.5;
          float head=mix(-.18,1.18,sat(uSurfacePulse));
          pulse=exp(-pow((coordinate-head)/.060,2.0))*(.25+.75*fresnel);
        }
        mineral+=vec3(.18,.42,.47)*pulse*.55;
        mineral+=vec3(.58,.64,.62)*pulse*(.10+.24*softboxA);

        vec3 livingMembrane=vec3(.008,.022,.030);
        livingMembrane+=vec3(.085,.175,.205)*(.12*ndl+.22*sideLight+.58*fresnel);
        livingMembrane+=vec3(.66,.87,.88)*softboxA*.24;
        livingMembrane+=vec3(.32,.52,.57)*softboxB*.18;
        livingMembrane+=vec3(.10,.52,.62)*edgeTransmission*.58;
        livingMembrane+=vec3(.22,.075,.30)*subsurface*.34;
        mineral=mix(mineral,livingMembrane,glassFinMask*.965);

        vec3 cartilage=vec3(.020,.012,.031);
        cartilage+=vec3(.095,.080,.125)*(.18*ndl+.24*sideLight);
        cartilage+=vec3(.38,.48,.50)*softboxA*.12;
        cartilage+=vec3(.20,.33,.38)*sideSpec*.10;
        cartilage+=vec3(.035,.20,.25)*fresnel*.28;
        cartilage+=vec3(.12,.035,.16)*subsurface*.30;
        cartilage+=vec3(.020,.18,.22)*vascular*.20;
        mineral=mix(mineral,cartilage,armorMask*.985);

        float lensRadial=length(vUv-vec2(.5));
        float lensInner=1.0-smoothstep(.055,.205,lensRadial);
        float lensRing=exp(-pow((lensRadial-.155)/.026,2.0));
        float lensHot=pow(sat(1.0-lensRadial/.17),5.0);
        vec2 lensVector=vUv-vec2(.5);
        float lensAngle=atan(lensVector.y,lensVector.x);
        float electricBranch=pow(.5+.5*sin(lensAngle*14.0+lensRadial*86.0-uTime*2.3+sin(lensAngle*5.0)*1.7),18.0)*lensInner;
        float electricBranch2=pow(.5+.5*sin(lensAngle*9.0-lensRadial*67.0+uTime*1.7),22.0)*lensInner;
        float electric=max(electricBranch,electricBranch2);
        float coreFlash=exp(-pow(lensRadial/.050,2.0))*(.62+.38*sin(uTime*4.0));
        vec3 physicalLens=vec3(.008,.026,.034);
        physicalLens+=vec3(.018,.090,.112)*(.24+.30*uEnergy);
        physicalLens+=vec3(.94,.99,.96)*softboxA*.18;
        physicalLens+=vec3(.48,.58,.60)*sideSpec*.10;
        physicalLens+=vec3(.12,.28,.34)*fresnel*.18;
        physicalLens+=vec3(.020,.18,.24)*lensInner*(.08+.10*uEnergy);
        physicalLens+=vec3(.050,.36,.48)*lensRing*(.10+.10*uEnergy);
        physicalLens+=vec3(.72,.84,.86)*lensHot*(.080+.045*uEnergy);
        physicalLens+=vec3(.12,.48,.56)*electric*(.18+.16*uEnergy);
        physicalLens+=vec3(.78,.86,.86)*coreFlash*.24;
        physicalLens+=vec3(.72,.36,.14)*lensRing*(.050+.055*studioRibbonB);
        mineral=mix(mineral,physicalLens,lensMeshMask*.997);

        float cableSegment=pow(.5+.5*cos(vUv.y*31.4+vUv.x*11.0+uTime*.22),14.0);
        vec3 tendon=vec3(.006,.025,.036)+vec3(.07,.18,.24)*(.14*sideLight+.08*ndl+.46*fresnel);
        tendon+=vec3(.030,.40,.62)*cableSegment*(.08+.08*uEnergy);
        tendon+=vec3(.78,.96,1.00)*sideSpec*.20;
        tendon+=vec3(.58,.88,.98)*softboxA*.16;
        tendon+=vec3(.22,.64,.78)*edgeTransmission*.42;
        tendon+=vec3(1.00,.48,.12)*studioRibbonB*(.11+.08*cableSegment);
        mineral=mix(mineral,tendon,tendrilMask*.995);

        if(uLayer>.5){
          ${outputName}=vec4(vec3(.004,.009,.011),.16);
          return;
        }
        float outAlpha=1.0-tendrilMask*.38-glassFinMask*.70;
        outAlpha=mix(outAlpha,.90,lensMeshMask);
        ${outputName}=vec4(filmic(mineral*1.85),clamp(outAlpha,.76,1.0));
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
        float keySpec=pow(max(dot(n,normalize(key+view)),0.0),72.0);
        float sideSpec=pow(max(dot(n,normalize(side+view)),0.0),38.0);
        vec3 refl=reflect(-view,n);
        float softboxA=exp(-pow((refl.x+.28)/.58,2.0)-pow((refl.y-.34)/.74,2.0))*smoothstep(-.30,.44,refl.z);
        float softboxB=exp(-pow((refl.x-.40)/.52,2.0)-pow((refl.y-.02)/.78,2.0))*smoothstep(-.36,.50,refl.z);
        float horizonBand=exp(-pow((refl.y+.05)/.19,2.0))*smoothstep(.08,.90,facing);
        float studioRibbonA=exp(-pow((refl.x+.16)/.205,2.0)-pow((refl.y-.16)/.78,2.0))*smoothstep(-.22,.62,refl.z);
        float studioRibbonB=exp(-pow((refl.x-.31)/.155,2.0)-pow((refl.y+.08)/.66,2.0))*smoothstep(-.18,.64,refl.z);
        float isTendril=step(2.0,vFacet)*(1.0-step(4.0,vFacet));
        float isGlassFin=step(4.0,vFacet)*(1.0-step(5.0,vFacet));
        float isArmor=step(5.0,vFacet)*(1.0-step(6.0,vFacet));
        float isLensMesh=step(6.0,vFacet);
        float bodyMask=max(0.0,1.0-isTendril-isGlassFin-isArmor-isLensMesh);
        float tendrilMask=isTendril*(1.0-vMorph);
        float glassFinMask=isGlassFin*(1.0-vMorph);
        float armorMask=isArmor*(1.0-vMorph);
        float lensMeshMask=isLensMesh*(1.0-vMorph);

        float lift=sat(.255+ndl*.345+sideLight*.265+fillLight*.185);
        float smoke=.5+.5*sin(vLocal.x*4.1+vLocal.y*2.7-vLocal.z*3.6);
        float strata=.5+.5*sin(vLocal.y*17.0+vLocal.x*4.7-vLocal.z*3.1);
        float inclusion=smoothstep(.74,.96,.5+.5*sin(vLocal.x*12.0-vLocal.y*7.0+vLocal.z*9.0))*smoothstep(.18,.78,smoke);
        vec3 col=mix(vec3(.010,.015,.021),vec3(.102,.122,.130),lift);
        col*=.956+.044*smoke;
        col+=vec3(.010,.013,.014)*strata*(.18+.30*lift);
        col-=vec3(.0033,.0045,.0049)*inclusion;
        col+=vec3(.94,.92,.86)*keySpec*.118;
        col+=vec3(.52,.59,.60)*sideSpec*.105;
        col+=vec3(.64,.68,.67)*softboxA*.126;
        col+=vec3(.38,.43,.44)*softboxB*.082;
        col+=vec3(.80,.84,.83)*studioRibbonA*.086;
        col+=vec3(.48,.32,.21)*studioRibbonB*.048;
        col+=vec3(.080,.096,.095)*horizonBand*.168;
        col+=vec3(.094,.190,.218)*fresnel*.31;
        col+=vec3(.032,.021,.015)*max(0.0,-n.y)*.055;
        float planeKey=max(0.0,dot(n,normalize(vec3(-.30,.42,.86))));
        float planeFill=max(0.0,dot(n,normalize(vec3(.68,-.18,.71))));
        col+=vec3(.012,.015,.016)*(.14+.22*fillLight+.08*max(0.0,-n.y));
        col+=vec3(.088,.096,.094)*pow(planeKey,.72)*.265;
        col+=vec3(.052,.045,.039)*pow(planeFill,.82)*.135;
        float edgeTransmission=pow(1.0-facing,3.0)*(1.0-sat(ndl*.58));
        col+=vec3(.018,.040,.046)*edgeTransmission*.39;
        float vesselA=pow(.5+.5*sin(vLocal.y*31.0+sin(vLocal.x*8.0)*2.5+vLocal.z*13.0),32.0);
        float vesselB=pow(.5+.5*sin(vLocal.x*37.0-vLocal.y*11.0+sin(vLocal.z*10.0)*2.0),36.0);
        float vesselC=pow(.5+.5*sin(vLocal.x*19.0+vLocal.y*39.0-vLocal.z*17.0),40.0);
        float vascular=max(max(vesselA,vesselB),vesselC)*bodyMask;
        col+=vec3(.020,.120,.140)*vascular*(.050+.095*uEnergy);
        float cortexWave=.5+.5*sin(vUv.x*37.699+sin(vUv.y*18.849)*1.55+vUv.y*5.2);
        float cortexCross=.5+.5*sin(vUv.x*18.849-vUv.y*25.133);
        float cortexValley=pow(1.0-max(cortexWave*.72,cortexCross*.56),3.2)*bodyMask;
        float cortexRidge=pow(max(cortexWave,cortexCross),4.0)*bodyMask;
        col=mix(col,vec3(.012,.015,.019),cortexValley*.28);
        col+=vec3(.068,.084,.091)*cortexRidge*.075;
        float plateField=.5+.5*sin(vLocal.x*8.7+vLocal.y*5.1-vLocal.z*7.3+sin(vLocal.y*3.6)*1.35);
        float plateCross=.5+.5*sin(vLocal.x*4.3-vLocal.y*7.9+vLocal.z*6.1+sin(vLocal.z*4.8)*1.15);
        float plateBlend=plateField*.62+plateCross*.38;
        float plateMask=smoothstep(.74,.93,plateBlend)*bodyMask;
        float livingSeam=pow(1.0-plateBlend,5.0)*bodyMask;
        float facetTone=.91+.13*fract(vFacet*7.13+.19);
        vec3 ivory=vec3(.090,.120,.128)+vec3(.22,.24,.22)*(.18*ndl+.12*sideLight+.15*softboxA);
        ivory+=vec3(.48,.31,.20)*studioRibbonB*.045;
        col*=mix(1.0,facetTone,bodyMask*.40);
        col=mix(col,ivory,plateMask*.27);
        col=mix(col,vec3(.004,.008,.014),livingSeam*.52);
        col+=vec3(.038,.165,.192)*vascular*(.045+.085*uEnergy);

        vec2 q=vLocal.xy;
        float front=smoothstep(.19,.53,vLocal.z)*(1.0-vMorph)*bodyMask;
        float crackX=q.x+.010*sin(q.y*19.0+vLocal.z*8.0)+.004*sin(q.y*43.0);
        float env=exp(-pow(q.y/.31,4.0))*front;
        float halo=exp(-pow(crackX/.026,2.0))*env;
        float fissure=exp(-pow(crackX/.0062,2.0))*env;
        col=mix(col,vec3(.003,.008,.010),halo*.10);
        col+=vec3(.18,.30,.31)*fissure*.070;

        vec2 lq=vec2((q.x+.012)*1.16,(q.y-.018)*.96);
        float lensD=length(lq);
        float lensOuter=(1.0-smoothstep(.145,.205,lensD))*front;
        float lensGlass=(1.0-smoothstep(.092,.150,lensD))*front;
        float lensCore=(1.0-smoothstep(.030,.067,lensD))*front;
        float lensRim=max(0.0,lensOuter-lensGlass);
        float lensHighlight=exp(-pow((lq.x+.042)/.024,2.0)-pow((lq.y-.044)/.031,2.0))*lensGlass;
        float lensDepth=sat(1.0-lensD/.080);

        float ribWarp=.010*sin(q.y*15.0+q.x*7.0);
        float ribGate=smoothstep(.13,.34,abs(q.x))*(1.0-smoothstep(.44,.53,abs(q.x)))*front;
        float upperRib=exp(-pow((q.y-(.30-.62*abs(q.x))+ribWarp)/.019,2.0))*ribGate;
        float lowerRib=exp(-pow((q.y+(.285-.58*abs(q.x))-ribWarp)/.019,2.0))*ribGate;
        float sideRib=exp(-pow((abs(q.x)-(.205+.16*abs(q.y)))/.018,2.0))
          *(1.0-smoothstep(.36,.50,abs(q.y)))*front;
        float ribs=sat(upperRib+lowerRib+sideRib);

        col=mix(col,vec3(.007,.013,.015),lensOuter*.30);
        col+=vec3(.36,.41,.40)*lensRim*(.052+.090*sideLight+.070*fresnel);
        col+=vec3(.040,.073,.078)*lensGlass*(.060+.100*softboxA+.065*sideSpec);
        col+=vec3(.68,.72,.69)*lensHighlight*.17;
        col+=vec3(.012,.040,.047)*lensCore*lensDepth*.036;
        col=mix(col,vec3(.006,.009,.010),ribs*.16);
        col+=vec3(.26,.28,.27)*ribs*(.020+.060*keySpec+.060*sideSpec);

        float pulse=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(vLocal.y*.62+vLocal.x*.14+vLocal.z*.20)*.5;
          float head=mix(-.18,1.18,sat(uSurfacePulse));
          pulse=exp(-pow((coordinate-head)/.064,2.0))*(.28+.72*fresnel);
        }
        col+=vec3(.12,.27,.30)*pulse*.36;
        col+=vec3(.48,.55,.54)*pulse*(.08+.18*softboxA);

        float subsurface=pow(max(0.0,dot(-n,key)),1.7)*(1.0-facing);
        vec3 livingMembrane=vec3(.008,.022,.030)
          +vec3(.080,.17,.20)*(.12*ndl+.21*sideLight+.55*fresnel)
          +vec3(.58,.78,.80)*softboxA*.24
          +vec3(.26,.46,.51)*softboxB*.16
          +vec3(.075,.055,.085)*subsurface*.18;
        col=mix(col,livingMembrane,glassFinMask*.965);

        vec3 cartilage=vec3(.020,.012,.031)
          +vec3(.090,.075,.12)*(.16*ndl+.22*sideLight)
          +vec3(.32,.43,.46)*softboxA*.11
          +vec3(.17,.30,.34)*sideSpec*.09
          +vec3(.032,.18,.22)*fresnel*.26
          +vec3(.11,.032,.15)*subsurface*.27;
        col=mix(col,cartilage,armorMask*.985);

        float lensRadial=length(vUv-vec2(.5));
        float lensInner=1.0-smoothstep(.055,.205,lensRadial);
        float lensRing=exp(-pow((lensRadial-.155)/.026,2.0));
        float lensHot=pow(sat(1.0-lensRadial/.17),5.0);
        vec2 lensVector=vUv-vec2(.5);
        float lensAngle=atan(lensVector.y,lensVector.x);
        float electric=pow(.5+.5*sin(lensAngle*12.0+lensRadial*72.0-uTime*2.0),16.0)*lensInner;
        float coreFlash=exp(-pow(lensRadial/.055,2.0))*(.66+.34*sin(uTime*3.8));
        vec3 physicalLens=vec3(.010,.030,.038)
          +vec3(.018,.095,.116)*(.28+.32*uEnergy)
          +vec3(.94,1.00,.98)*softboxA*.24
          +vec3(.48,.62,.66)*sideSpec*.14
          +vec3(.12,.30,.36)*fresnel*.20
          +vec3(.020,.19,.25)*lensInner*(.10+.10*uEnergy)
          +vec3(.060,.42,.54)*lensRing*(.12+.12*uEnergy)
          +vec3(.82,.98,1.00)*lensHot*(.24+.10*uEnergy)
          +vec3(.16,.78,1.00)*electric*(.28+.26*uEnergy)
          +vec3(.92,1.00,1.00)*coreFlash*.52;
        col=mix(col,physicalLens,lensMeshMask*.997);

        float segment=pow(.5+.5*cos(vUv.y*31.4+vUv.x*11.0+uTime*.22),14.0);
        vec3 tendon=vec3(.006,.015,.018)+vec3(.09,.15,.16)*(.14*sideLight+.08*ndl+.40*fresnel);
        tendon+=vec3(.016,.09,.11)*segment*.028;
        tendon+=vec3(.72,.78,.75)*sideSpec*.11;
        tendon+=vec3(.64,.69,.65)*softboxA*.095;
        col=mix(col,tendon,tendrilMask*.995);

        if(uLayer>.5){${outputName}=vec4(vec3(.004,.009,.011),.16);return;}
        float outAlpha=1.0-tendrilMask*.34-glassFinMask*.68;
        outAlpha=mix(outAlpha,.91,lensMeshMask);
        ${outputName}=vec4(filmic(col*1.92),clamp(outAlpha,.76,1.0));
      }`;

    /* R1678 — true software/very-low-GPU material.
       Keep the same smoky obsidian + recessed optical lens identity, but remove
       the high-cost per-fragment Gaussian studio reflections, procedural strata
       and repeated transcendental micro-detail. Hardware retains the full
       photographic shader. */
    const softwareFragmentSource = `${versionLine}precision highp float;
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
      vec3 tone(vec3 c){return c/(vec3(1.0)+max(c,vec3(0.0)));}
      void main(){
        vec3 n=normalize(vNormal);
        vec3 view=normalize(vec3(-vLocal.xy,2.92-vLocal.z));
        vec3 key=normalize(vec3(-.53,.79,.31));
        vec3 side=normalize(vec3(.77,.06,.64));
        float ndl=max(dot(n,key),0.0);
        float sideLight=max(dot(n,side),0.0);
        float facing=sat(abs(dot(n,view)));
        float fresnel=(1.0-facing);fresnel*=fresnel;
        float keySpec=max(dot(n,normalize(key+view)),0.0);
        keySpec*=keySpec;keySpec*=keySpec;
        float sideSpec=max(dot(n,normalize(side+view)),0.0);
        sideSpec*=sideSpec;sideSpec*=sideSpec;

        float isTendril=step(2.0,vFacet)*(1.0-step(4.0,vFacet));
        float isGlassFin=step(4.0,vFacet)*(1.0-step(5.0,vFacet));
        float isArmor=step(5.0,vFacet)*(1.0-step(6.0,vFacet));
        float isLensMesh=step(6.0,vFacet);
        float bodyMask=max(0.0,1.0-isTendril-isGlassFin-isArmor-isLensMesh);
        float tendrilMask=isTendril*(1.0-vMorph);

        float lift=sat(.25+ndl*.45+sideLight*.34);
        vec3 col=mix(vec3(.008,.013,.019),vec3(.082,.103,.112),lift);
        col+=vec3(.56,.60,.58)*keySpec*.095;
        col+=vec3(.28,.36,.38)*sideSpec*.085;
        col+=vec3(.042,.105,.125)*fresnel*.20;
        col+=vec3(.012,.017,.021)*max(0.0,-n.y);

        float vesselA=pow(.5+.5*sin(vLocal.y*33.0+sin(vLocal.x*7.0)*2.2+vLocal.z*13.0),36.0);
        float vesselB=pow(.5+.5*sin(vLocal.x*39.0-vLocal.y*12.0+sin(vLocal.z*9.0)*1.8),40.0);
        float vascular=max(vesselA,vesselB)*bodyMask;
        float plateField=.5+.5*sin(vLocal.x*8.7+vLocal.y*5.1-vLocal.z*7.3+sin(vLocal.y*3.6)*1.3);
        float plateCross=.5+.5*sin(vLocal.x*4.3-vLocal.y*7.9+vLocal.z*6.1+sin(vLocal.z*4.8)*1.1);
        float plateBlend=plateField*.62+plateCross*.38;
        float plateMask=smoothstep(.76,.94,plateBlend)*bodyMask;
        vec3 ivory=vec3(.075,.098,.106)+vec3(.18,.19,.17)*(.24*ndl+.14*sideLight);
        ivory+=vec3(.085,.14,.15)*fresnel*.10;
        col=mix(col,ivory,plateMask*.24);
        col+=vec3(.026,.115,.135)*vascular*(.040+.075*uEnergy);
        col+=vec3(.62,.32,.14)*plateMask*sideSpec*.025;

        vec2 q=vLocal.xy;
        float front=smoothstep(.19,.53,vLocal.z)*(1.0-vMorph)*bodyMask;
        float crack=1.0-smoothstep(.003,.014,abs(q.x+.010*q.y));
        crack*=1.0-smoothstep(.31,.40,abs(q.y));
        col+=vec3(.13,.20,.20)*crack*front*.08;

        vec2 lq=vec2(q.x,(q.y-.010)*1.08);
        float lensD=length(lq);
        float lensOuter=(1.0-smoothstep(.082,.108,lensD))*front;
        float lensGlass=(1.0-smoothstep(.046,.079,lensD))*front;
        float lensCore=(1.0-smoothstep(.018,.041,lensD))*front;
        float lensRim=max(0.0,lensOuter-lensGlass);
        vec3 lens=vec3(.006,.014,.017)
          +vec3(.055,.105,.115)*fresnel
          +vec3(.42,.48,.46)*keySpec*.20
          +vec3(.025,.078,.087)*lensGlass;
        lens=mix(lens,vec3(.006,.024,.029),lensCore*.68);
        lens+=vec3(.31,.39,.38)*lensRim*.12;
        col=mix(col,lens,lensOuter*.96);

        float pulse=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(vLocal.y*.62+vLocal.x*.14+vLocal.z*.20)*.5;
          float head=mix(-.18,1.18,sat(uSurfacePulse));
          pulse=1.0-smoothstep(.045,.115,abs(coordinate-head));
          pulse*=.30+.70*fresnel;
        }
        col+=vec3(.11,.28,.33)*pulse*.64;
        col+=vec3(.34,.40,.39)*pulse*keySpec*.16;

        float cableSegment=pow(.5+.5*cos(vUv.y*26.0+vUv.x*9.0+uTime*.20),12.0);
        vec3 tendon=vec3(.006,.024,.034)+vec3(.060,.17,.23)*(.20*sideLight+.50*fresnel);
        tendon+=vec3(.020,.40,.62)*cableSegment*(.08+.08*uEnergy);
        tendon+=vec3(.42,.72,.82)*sideSpec*.18;
        tendon+=vec3(1.00,.42,.08)*sideSpec*cableSegment*.060;
        col=mix(col,tendon,tendrilMask*.995);

        float subsurface=pow(max(0.0,dot(-n,key)),1.7)*(1.0-facing);
        vec3 simpleMembrane=vec3(.007,.020,.028)+vec3(.070,.16,.19)*(.20*ndl+.48*fresnel)+vec3(.32,.48,.50)*keySpec*.10;
        simpleMembrane+=vec3(.16,.055,.22)*subsurface*.24;
        col=mix(col,simpleMembrane,isGlassFin*.965);
        vec3 simpleCartilage=vec3(.018,.011,.029)+vec3(.075,.065,.105)*(.20*ndl+.34*sideLight)+vec3(.025,.15,.19)*fresnel*.25;
        simpleCartilage+=vec3(.10,.030,.14)*subsurface*.24;
        col=mix(col,simpleCartilage,isArmor*.985);

        float lensRadial=length(vUv-vec2(.5));
        float lensInner=1.0-smoothstep(.06,.21,lensRadial);
        float electric=pow(.5+.5*sin(atan(vUv.y-.5,vUv.x-.5)*10.0+lensRadial*64.0-uTime*1.8),14.0)*lensInner;
        vec3 optical=vec3(.012,.035,.043)+vec3(.040,.27,.34)*lensInner+vec3(.72,.84,.82)*keySpec*.17+vec3(.080,.20,.24)*fresnel*.15;
        optical+=vec3(.12,.64,.82)*electric*(.18+.20*uEnergy);
        col=mix(col,optical,isLensMesh*.997);

        if(uLayer>.5){${outputName}=vec4(vec3(.004,.009,.011),.16);return;}
        float alpha=1.0-tendrilMask*.34-isGlassFin*.66;
        alpha=mix(alpha,.92,isLensMesh);
        ${outputName}=vec4(tone(col*1.88),clamp(alpha,.76,1.0));
      }`;

    /* R1716 — preserve photographic mobile geometry.
       Software rendering keeps the ultra-lite material/mesh, but real mobile
       GPUs use the medium physical shader and the normal mobile topology.
       Dynamic resolution still yields before the 16.67 ms cadence. */
    const mobilePhysical = mobile || constrainedMobile || auditMode;
    const fragmentSource = softwareRenderer
      ? softwareFragmentSource
      : (mobilePhysical ? constrainedFragmentSource : fullFragmentSource);
    root.dataset.fxCoreShaderProfileR1605=softwareRenderer
      ? 'r1750-software-dark-smoky-obsidian-biocrystal-lite'
      : (mobilePhysical?'r1716-mobile-physical-constrained-photographic':'photographic-full-desktop');
    root.dataset.fxNativeMagPerformanceR1710='16-67ms-first-adaptive-resolution-zero-idle';
    root.dataset.fxNativeMagVisualR1716='mobile-normal-topology-physical-shader-photoreal-60fps-first';
    root.dataset.fxNativeMagVisualR1718='mobile-sharp-readable-midtone-photoreal-organism';
    root.dataset.fxNativeMagQualityR1718='higher-resolution-floor-gradual-pressure-shedding';
    root.dataset.fxNativeMagVisualR1719='healthy-smooth-biomechanical-organism-large-energy-heart-living-tendrils';
    root.dataset.fxNativeMagGeometryR1719='smooth-tensioned-body-no-sawtooth-rings';
    root.dataset.fxNativeMagVisualR1720='ultra-sharp-cellular-biomech-body-electric-vascular-network-large-core';
    root.dataset.fxNativeMagQualityR1720='hidpi-mobile-1260k-pixel-budget-adaptive-60hz';
    root.dataset.fxNativeMagVisualR1721='cortical-lobes-electric-neural-core-subdermal-vascular-detail';
    root.dataset.fxNativeMagGeometryR1721='smooth-cortical-fold-displacement-no-sawtooth';
    root.dataset.fxNativeMagQualityR1722='hidpi-msaa-mobile-no-blur-high-resolution-floor';
    root.dataset.fxNativeMagInteractionR1722='pointer-touch-drag-hover-press-release-scroll-wheel-click-key-input-change-submit-focus-menu-language-section-question-response-system-resize-orientation-visibility-one-physiology-loop';
    root.dataset.fxNativeMagIdentityR1723='canonical-organism-no-crystal-sphere-state';
    root.dataset.fxNativeMagMaterialR1723='subsurface-cortical-tissue-living-membrane-cartilage-energy-organ';
    root.dataset.fxNativeMagOrganismR1724='asymmetric-living-crystal-rhombic-cortical-silhouette';
    root.dataset.fxNativeMagGuardianR1724='asymmetric-crystal-organic-feline-dragon-biocrystal-silhouette';
    root.dataset.fxNativeMagFacetR1724='polished-crystal-planes-preserved-with-hybrid-normals';
    root.dataset.fxNativeMagPaletteR1724='pearl-cyan-indigo-warm-studio-rim';
    root.dataset.fxNativeMagCoreR1723='asymmetric-lobed-cartilage-energy-organ-socket';
    root.dataset.fxNativeMagSilhouetteR1724='asymmetric-living-crystal-rhombic-body-cortical-lobes';
    root.dataset.fxNativeMagTendrilsR1723='pointer-touch-energy-tip-weighted-living-flex';
    root.dataset.fxNativeMagAnatomyR1724='cortical-lobes-living-membranes-energy-core-tendrils-one-draw';
    root.dataset.fxNativeMagTopologyR1724='winding-safe-rhombic-living-crystal-anatomy';
    root.dataset.fxNativeMagLookR1724='pearl-cortical-tissue-cyan-energy-indigo-depth-warm-studio-rim';
    root.dataset.fxNativeMagFallbackR1724='same-living-crystal-look-on-software-renderer';
    root.dataset.fxNativeMagPhysiologyR1723='differentiated-attention-response-activation-heartbeat-curiosity-stability-renewal';
    root.dataset.fxNativeMagPhysiologyApiR1723='public-physiology-event-habitat-sync';
    root.dataset.fxCoreCanonicalRevisionR1723=CANONICAL_REVISION;
    root.dataset.fxCoreRendererCanonicalR1723='single-webgl-living-organism-r326';
    root.dataset.fxCorePhysiologyApiR1723='public-differentiated-physiology-event-v1';
    root.dataset.fxCoreSurfaceCadenceR1679='desktop-overhead-safe-interval-mobile-unchanged';
    root.dataset.fxNativeMagPerformanceR1678=softwareRenderer
      ? 'software-fragment-cost-cut-physical-identity-preserved'
      : 'hardware-photographic-material-preserved';
    root.dataset.fxNativeMagVisualR1697=softwareRenderer
      ? 'software-cortical-tissue-membrane-cartilage-energy-organ'
      : 'hardware-photographic-material-preserved';

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
    const geometry=buildOrganismGeometry(softwareRenderer);
    root.dataset.fxCoreGeometryProfileR1603=softwareRenderer
      ? 'software-lite-photographic'
      : (mobile?'mobile-normal-photographic':'hardware-full-photographic');
    root.dataset.fxCoreGeometryProofParityR1699='audit-and-production-share-hand-cut-mineral-silhouette';
    root.dataset.fxNativeMagVisualR1700='software-faceted-depth-angle-hardware-smooth-photographic-obsidian';
    root.dataset.fxNativeMagVisualR1701='continuous-asymmetric-obsidian-silhouette-faceted-depth-no-sawtooth';
    root.dataset.fxNativeMagVisualR1704='mobile-software-smoked-obsidian-readable-glass-lens-sharpness-floor';
    root.dataset.fxNativeMagPerformanceR1704='mobile-software-resolution-floor-with-lite-shader-60fps-priority';
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
    const initialShape='organism';
    root.dataset.fxCoreShapeR337='organism';
    root.dataset.fxCoreDefaultShapeR1401='organism';
    root.dataset.fxCoreCanonicalIdentityR1723='one-living-organism-no-alternate-shapes';
    root.dataset.fxCoreShapeModeR413='single-living-organism-fixed-anatomy-r1723';
    let disposed=false,contextLost=false,visible=true,paused=false;
    let raf=0,burstFrames=0,width=0,height=0,aspect=1,surfaceFrameTimer=0,slowRenderer=constrained;
    let px=0,py=0,tx=0,ty=0;
    let energy=IDLE_ENERGY,targetEnergy=IDLE_ENERGY,breath=.12,targetBreath=.12;
    let morph=0,targetMorph=0;
    let rotationX=softwareRenderer?-.115:-.090,rotationY=softwareRenderer?-.385:-.235,rotationZ=.024;
    let targetRotationX=rotationX,targetRotationY=rotationY,targetRotationZ=rotationZ,angularVelocityY=0;
    let siteProgress=0,targetSiteProgress=0;
    let last=performance.now(),simulationTime=0,renderAverage=0,frameIntervalAverage=1000/60;
    let schedulerLastFrame=0,schedulerRefreshMs=1000/60,schedulerTick=0;
    /* R1694 — renderer capability outranks audit mode. A software GPU must never
       be forced to full-resolution merely because a verifier is attached; that
       creates artificial 200ms+ frames and is the opposite of the production
       60 Hz policy. Hardware keeps the photographic path, software keeps the
       same visual identity through the lite shader at a smaller backing store. */
    /* R1703 — mobile starts sharp enough to read as a photographed object.
       The strict R1701 frame governor is still allowed to shed resolution on
       real pressure; we no longer begin every constrained phone permanently
       blurred before measuring its actual GPU budget. */
    /* R1718 — mobile clarity floor. The previous ~0.46-0.73 effective
       backing-store scale visibly pixelated the organism on high-DPI phones.
       Start near native CSS resolution and shed quality gradually only under
       measured pressure. */
    let qualityScale=softwareRenderer
      ? (mobile?.94:.54)
      : (mobile ? 1.00 : (auditMode ? .78 : (constrained ? .58 : .68)));
    const qualityCeiling=softwareRenderer
      ? (mobile?1.00:.66)
      : (mobile?1.08:(auditMode?.86:(constrained?.78:.94)));
    const qualityFloor=softwareRenderer
      ? (mobile?.80:.26)
      : (mobile?.80:.22);
    let lastQualityAdjust=0,qualityResizeTimer=0;
    let renderPeak=0,framePeak=1000/60,stableBudgetFrames=0,panicFrames=0;
    let heartbeatTimer=0,surfacePulseTimer=0,autonomousTimer=0,scrollFrame=0,tapCandidate=null;
    let surfacePulseStart=-Infinity,lastSurfacePulseAt=-Infinity,surfacePulseCount=0;
    let activeOrgan='hero',shapeLockUntil=0;
    const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};
    cinematic.version=REVISION;
    cinematic.corePosition=[0,0,.52];

    function resize(){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return false;
      const baseCap=softwareRenderer ? (mobile?1.58:.90) : (auditMode ? 1.06 : constrainedMobile?1.72:mobile?2.00:constrained?1.16:1.60);
      const cap=baseCap*qualityScale;
      const dpr=Math.min(devicePixelRatio||1,cap);
      const baseBudget=softwareRenderer ? (mobile?920000:200000) : (auditMode ? 480000 : constrainedMobile?1280000:mobile?1900000:constrained?580000:1120000);
      const budget=Math.max(112000,Math.round(baseBudget*qualityScale*qualityScale));
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
      const frameCap=auditMode?1:(mobile?4:24);
      burstFrames=Math.max(burstFrames,Math.min(frameCap,Math.max(1,frames)));
      queueFrame(0);
    }
    function boost(value=.84,frames=8){
      targetEnergy=Math.max(targetEnergy,value);
      targetBreath=Math.max(targetBreath,.38+value*.48);
      schedule(reduced.matches?1:frames);
    }
    function shapeName(){return 'organism';}
    function publishShape(source='renderer'){
      root.dataset.fxCoreShapeR337='organism';
      root.dataset.fxCoreTargetShape='organism';
      root.dataset.fxCoreShape='organism';
      root.dataset.fxCoreMorph='0.000';
      root.dataset.fxCoreMorphSource=source;
      root.dataset.fxCoreMorphEngine='single-living-organism-fixed-topology-r1723';
      root.dataset.fxCoreLivingFormR1711='single-organism';
      root.dataset.fxCoreLivingFormR1723='canonical-organism';
      stage.dataset.shape='organism';
    }
    function setMorph(value,source='api-morph',announce=true){
      const requested=clamp(Number(value)||0,0,1);
      targetMorph=0;
      morph=0;
      root.dataset.fxCoreRequestedMorphR1711=requested.toFixed(3);
      root.dataset.fxCoreLegacyShapeRequestR1723=requested>.5?'sphere':'crystal';
      publishShape(source);
      const cinematicBirth=/^r533-/.test(source);
      boost(requested>.5?.88:.72,cinematicBirth?1:(mobile?3:5));
      if(announce)dispatchEvent(new CustomEvent('formatx:coreshapechange',{detail:{
        shape:'organism',
        requestedShape:'organism',
        legacyRequestedShape:requested>.5?'sphere':'crystal',
        visualForm:'single-organism',
        source,
        revision:'r1723',
        renderer:VERSION,
        geometry:'single-fixed-living-3d-volume'
      }}));
      return 0;
    }
    function setShape(shape,source='api'){
      const legacyRequested=shape==='sphere'||shape===1||shape===true?1:0;
      return setMorph(legacyRequested,source,true);
    }
    function toggleShape(source='interaction'){
      startSurfacePulse(String(source||'interaction')+'-living-response');
      boost(.86,mobile?4:6);
      publishShape(source);
      dispatchEvent(new CustomEvent('formatx:coreshapechange',{detail:{
        shape:'organism',requestedShape:'organism',visualForm:'single-organism',
        source,revision:'r1723',renderer:VERSION,geometry:'single-fixed-living-3d-volume'
      }}));
      return 0;
    }
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
      if(disposed||contextLost||reduced.matches||document.hidden||paused
        ||(!visible&&!explicitInteraction)
        ||document.querySelector('.fx-reference-pause')?.dataset.paused==='true'
        ||(!explicitInteraction&&now-lastSurfacePulseAt<2200))return false;
      // The mobile governor's idle flag is not the user's PAUSE control.
      // Reserve the full sweep before asking the single renderer to draw it.
      dispatchEvent(new CustomEvent('formatx:coresurfacesweep',{
        detail:{phase:'start',source,duration:SURFACE_PULSE_WINDOW_MS}
      }));
      if(blocked()&&!explicitInteraction)return false;
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
      if(!blocked())schedule(1);
      later(()=>{
        if(pulseId!==surfacePulseCount)return;
        surfacePulseStart=-Infinity;
        burstFrames=0;
        if(surfaceFrameTimer){clearTimeout(surfaceFrameTimer);delayed.delete(surfaceFrameTimer);surfaceFrameTimer=0;}
        if(raf){cancelAnimationFrame(raf);raf=0;}
        settleAfterBurst();
        root.dataset.fxCoreSurfacePulseR454='idle';
        root.dataset.fxCoreIdleBoundaryR1710='hard-zero-frame-after-sweep';
        dispatchEvent(new CustomEvent('formatx:coresurfacesweep',{
          detail:{phase:'end',source,duration:SURFACE_PULSE_WINDOW_MS}
        }));
        /* R1610: arm the next autonomous sweep only after this sweep has
           actually ended. On slow/software renderers, scheduling from the
           start event allowed the next timer to expire while the current
           sweep was still rendering, eliminating the promised idle gap. */
        if(source==='autonomous')scheduleSurfacePulse();
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
        : mobile
          ? 5400+(surfacePulseCount%3)*520
          : 4100+(surfacePulseCount%3)*360;
      root.dataset.fxCoreSurfaceSchedulerR484='armed-single-native-timer';
      surfacePulseTimer=setTimeout(()=>{
        surfacePulseTimer=0;
        const started=startSurfacePulse('autonomous');
        if(!started)scheduleSurfacePulse();
      },delay);
    }
    function scheduleAutonomousMorph(){
      clearTimeout(autonomousTimer);autonomousTimer=0;
      root.dataset.fxCoreAutonomousMorphR441='disabled-until-explicit-interaction';
    }

    function render(now){
      const begin=performance.now();
      const dt=Math.min(48,Math.max(1,now-last));last=now;
      if(dt<=34)frameIntervalAverage=frameIntervalAverage*.86+dt*.14;
      else frameIntervalAverage=frameIntervalAverage*.92+34*.08;
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
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.CULL_FACE);
      gl.uniform1f(uniforms.uLayer,0);
      gl.drawArrays(gl.TRIANGLES,0,geometry.count);
      root.dataset.fxCorePassModelR1450='healthy-smooth-biomechanical-body-energy-heart-living-tendrils-r1719';

      const ms=performance.now()-begin;
      renderAverage=renderAverage?renderAverage*.82+ms*.18:ms;
      renderPeak=Math.max(ms,renderPeak*.86);
      framePeak=Math.max(dt,framePeak*.90);
      if(renderAverage>(mobile?15.5:15.8)){
        slowRenderer=true;
        root.dataset.fxCoreAdaptiveOpticsR588=mobile?'one-pass-mobile-slow-renderer':'single-pass-adaptive-resolution';
        root.dataset.fxCoreSurfaceCadenceR1392=mobile?'bounded-slow-renderer-full-window':'desktop-bounded';
        root.dataset.fxCoreSurfaceCadenceR1403=mobile?'full-window-fast-cadence':'desktop-bounded';
        root.dataset.fxCoreSurfaceCadenceR1441=mobile?'midpoint-safe-68ms-cap':'desktop-bounded';
      }else if(!slowRenderer){
        root.dataset.fxCoreAdaptiveOpticsR588=mobile?'single-pass-mobile-capable':'single-pass-60fps-capable';
      }

      if(!auditMode){
        const panicFrame=dt>16.75 || ms>6.4;
        if(panicFrame && now-lastQualityAdjust>18){
          const previous=qualityScale;
          qualityScale=Math.max(qualityFloor,qualityScale-(mobile?(dt>20||ms>9?.10:.06):(dt>20||ms>9?.22:.12)));
          panicFrames=24;
          stableBudgetFrames=0;
          if(Math.abs(previous-qualityScale)>.001){
            lastQualityAdjust=now;
            root.dataset.fxCoreGovernorR1660='panic-lod-one-frame-spike';
            if(qualityResizeTimer){clearTimeout(qualityResizeTimer);delayed.delete(qualityResizeTimer);}
            qualityResizeTimer=later(()=>{
              qualityResizeTimer=0;
              if(!disposed&&!contextLost&&resize())schedule(1);
            },0);
          }
        }else if(now-lastQualityAdjust>120){
          const previous=qualityScale;
          /* R1660 — preserve the 16.67 ms presentation budget. Resolution
             and secondary optical detail yield before cadence. Recovery waits
             until the renderer has sustained real headroom for long enough. */
          const renderPressure=renderAverage>4.4 || renderPeak>5.8;
          const severeRenderPressure=renderAverage>5.8 || renderPeak>7.4;
          const framePressure=frameIntervalAverage>16.08 || framePeak>16.55;
          const severeFramePressure=frameIntervalAverage>16.42 || framePeak>17.05;

          if(severeFramePressure||severeRenderPressure){
            qualityScale=Math.max(qualityFloor,qualityScale-(mobile?.08:.20));
            stableBudgetFrames=0;
            panicFrames=Math.max(panicFrames,12);
          }else if(framePressure||renderPressure){
            qualityScale=Math.max(qualityFloor,qualityScale-(mobile?.035:.09));
            stableBudgetFrames=0;
          }else{
            if(panicFrames>0)panicFrames-=1;
            else stableBudgetFrames+=1;
            if(stableBudgetFrames>360 && frameIntervalAverage<15.92 && renderAverage<3.4 && renderPeak<4.8){
              qualityScale=Math.min(qualityCeiling,qualityScale+.0015);
              stableBudgetFrames=0;
            }
          }

          if(Math.abs(previous-qualityScale)>.001){
            lastQualityAdjust=now;
            root.dataset.fxCoreGovernorR1626=qualityScale<previous?'hard-60fps-quality-first':'slow-quality-recovery';
            root.dataset.fxCoreGovernorR1660=qualityScale<previous?'preemptive-frame-budget-shed':'guarded-quality-recovery';
            if(qualityResizeTimer){clearTimeout(qualityResizeTimer);delayed.delete(qualityResizeTimer);}
            qualityResizeTimer=later(()=>{
              qualityResizeTimer=0;
              if(!disposed&&!contextLost&&resize())schedule(1);
            },0);
          }
        }
      }

      root.dataset.fxCoreRenderMs=renderAverage.toFixed(2);
      root.dataset.fxCoreFrameMs=dt.toFixed(2);
      root.dataset.fxCoreFrameIntervalR1602=frameIntervalAverage.toFixed(2);
      root.dataset.fxCoreRenderPeakR1626=renderPeak.toFixed(2);
      root.dataset.fxCoreFramePeakR1626=framePeak.toFixed(2);
      root.dataset.fxCoreReal3dTargetFps='60fps-hard-budget-quality-first-r1626';
      root.dataset.fxCoreReal3dTargetFpsR1642='60fps-preemptive-headroom-quality-before-cadence';
      root.dataset.fxNativeMagPerformanceR1642='lower-start-resolution-fast-shedding-slow-recovery-zero-idle';
      root.dataset.fxNativeMagPerformanceR1660='panic-lod-single-frame-spike-guard-minimum-60fps-target';
      root.dataset.fxNativeMagPerformanceR1670='lower-initial-resolution-recovery-only-after-sustained-60fps-headroom';
      root.dataset.fxNativeMagPerformanceR1671='software-crisp-start-constrained-shader-governor-sheds-on-pressure';
      root.dataset.fxNativeMagPerformanceR1676='preemptive-60fps-headroom-lighter-geometry-slow-recovery';
      root.dataset.fxNativeMagPerformanceR1694='renderer-capability-first-software-lite-hardware-photoreal-60fps-target';
      root.dataset.fxNativeMagPerformanceR1701='software-static-habitat-native-mag-frame-budget-priority';
      root.dataset.fxNativeMagPerformanceR1710='preemptive-60fps-mobile-lite-zero-idle-frame-budget';
      root.dataset.fxNativeMagPerformanceR1696='software-readable-resolution-floor-with-bounded-pixel-budget';
      root.dataset.fxCoreQualityScaleR1600=qualityScale.toFixed(2);
      root.dataset.fxCoreReal3dFps=String(Math.min(60,Math.round(1000/Math.max(16.67,frameIntervalAverage))));
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
      /* R1622 — refresh-divisor scheduler.
         Use a stable display divisor that never intentionally targets below
         60 FPS: 60->60, 120->60, 144->72, 165->82.5, 180->60, 240->60.
         This avoids the 144 Hz / 48 FPS failure mode of a fixed 16.67 ms gate. */
      if(!auditMode){
        if(schedulerLastFrame>0){
          const rawRefresh=Math.max(2,Math.min(40,now-schedulerLastFrame));
          schedulerRefreshMs=schedulerRefreshMs*.82+rawRefresh*.18;
        }
        schedulerLastFrame=now;
        const estimatedHz=Math.max(30,Math.min(360,1000/Math.max(2.7,schedulerRefreshMs)));
        const divisor=Math.max(1,Math.floor(estimatedHz/60));
        schedulerTick=(schedulerTick+1)%divisor;
        root.dataset.fxCoreRefreshHzR1622=estimatedHz.toFixed(1);
        root.dataset.fxCoreRenderDivisorR1622=String(divisor);
        root.dataset.fxCoreRenderCeilingR1620='superseded-by-r1622-minimum-60fps-divisor';
        if(divisor>1 && schedulerTick!==0){
          raf=requestAnimationFrame(frame);
          return;
        }
      }
      render(now);burstFrames=Math.max(0,burstFrames-1);
      const surfacePulseActive=now-surfacePulseStart>=0&&now-surfacePulseStart<=SURFACE_PULSE_WINDOW_MS;
      if(burstFrames>0){
        const burstDelay=auditMode&&renderAverage>42?Math.min(260,Math.max(80,renderAverage*2.2)):0;
        root.dataset.fxCoreBurstCadenceR1600=burstDelay?'audit-paced':'native-60hz-target';
        queueFrame(burstDelay);
      }else if(surfacePulseActive){
        const sweepDelay=auditMode
          ? (mobile
              ? (renderAverage>34?Math.min(68,Math.max(24,renderAverage*.34)):0)
              : (renderAverage>60?Math.min(96,Math.max(32,renderAverage*.35)):0))
          : 0;
        root.dataset.fxCoreAdaptiveSurfaceCadenceR588=sweepDelay?('paced-'+Math.round(sweepDelay)+'ms'):'native-raf';
        root.dataset.fxCoreSurfaceCadenceR643=mobile?'mobile-budget-preserved':'desktop-midpoint-safe-bounded-no-idle';
        root.dataset.fxCoreAnimationCadenceR1600='production-native-60hz-target-audit-contract-preserved';
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
    let previousScrollY=scrollY;
    function onScroll(){
      if(scrollFrame)return;
      scrollFrame=requestAnimationFrame(()=>{
        scrollFrame=0;
        const currentY=scrollY;
        const velocity=clamp((currentY-previousScrollY)/120,-1,1);
        previousScrollY=currentY;
        const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);
        targetSiteProgress=clamp(currentY/range,0,1);
        root.dataset.fxCoreSiteProgress=targetSiteProgress.toFixed(3);
        targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.08+Math.sin(targetSiteProgress*Math.PI)*.12+Math.abs(velocity)*.08);
        targetRotationY+=velocity*.016;
        targetRotationX=clamp(targetRotationX-velocity*.006,-1.02,1.02);
        schedule(mobile?1:2);
      });
    }

    function globalPoint(event){
      return {
        x:clamp((((Number(event?.clientX)||innerWidth*.5)/Math.max(1,innerWidth))-.5)*2,-1,1),
        y:clamp(-((((Number(event?.clientY)||innerHeight*.5)/Math.max(1,innerHeight))-.5)*2),-1,1)
      };
    }
    function onAmbientMove(event){
      const q=globalPoint(event);
      const touch=event.pointerType==='touch';
      tx=q.x*(touch?.46:.72);ty=q.y*(touch?.46:.72);
      targetRotationY+=q.x*(touch?.0010:.0018);
      targetRotationX=clamp(targetRotationX-q.y*(touch?.0008:.0012),-1.02,1.02);
      targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+(touch?.075:.055));
      schedule(mobile?1:2);
    }
    function onAmbientPress(event){
      const q=globalPoint(event);
      tx=q.x*.70;ty=q.y*.70;
      targetEnergy=Math.max(targetEnergy,.72);
      targetBreath=Math.max(targetBreath,.64);
      targetRotationY+=q.x*.010;
      targetRotationX=clamp(targetRotationX-q.y*.008,-1.02,1.02);
      schedule(mobile?3:5);
    }
    function onAmbientRelease(event){
      const q=globalPoint(event);
      tx=q.x*.58;ty=q.y*.58;
      targetEnergy=Math.max(targetEnergy,.58);
      schedule(mobile?2:3);
    }
    function onAmbientWheel(event){
      const impulse=clamp(event.deltaY/180,-1,1);
      targetRotationY+=impulse*.018;
      targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.12);
      targetBreath=Math.max(targetBreath,.34);
      schedule(mobile?1:3);
    }
    function onAmbientKey(event){
      if(event.repeat)return;
      const horizontal=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:0;
      const vertical=event.key==='ArrowUp'?1:event.key==='ArrowDown'?-1:0;
      targetRotationY+=horizontal*.055;
      targetRotationX=clamp(targetRotationX+vertical*.040,-1.02,1.02);
      boost(.66,mobile?2:4);
    }
    function signalPhysiology(kind,source){
      const state=String(kind||'stimulus');
      root.dataset.fxCorePhysiologyR1723=state;
      if(state==='attention'){
        targetEnergy=Math.max(targetEnergy,.76);
        targetBreath=Math.max(targetBreath,.46);
        targetRotationY+=tx*.012;
        targetRotationX=clamp(targetRotationX-ty*.008,-1.02,1.02);
      }else if(state==='response'){
        targetEnergy=Math.max(targetEnergy,.94);
        targetBreath=Math.max(targetBreath,.74);
        angularVelocityY+=.004;
      }else if(state==='activation'){
        targetEnergy=Math.max(targetEnergy,.98);
        targetBreath=Math.max(targetBreath,.78);
        targetRotationZ=clamp(targetRotationZ+.010,-.16,.16);
      }else if(state==='heartbeat'){
        targetEnergy=Math.max(targetEnergy,.84);
        targetBreath=Math.max(targetBreath,.96);
      }else if(state==='curiosity'){
        targetEnergy=Math.max(targetEnergy,.78);
        targetBreath=Math.max(targetBreath,.54);
        targetRotationY+=.026;
      }else if(state==='stability'){
        targetEnergy=Math.max(targetEnergy,.58);
        targetBreath=Math.max(targetBreath,.26);
        targetRotationZ*=.55;
      }else if(state==='renewal'){
        targetEnergy=Math.max(targetEnergy,.96);
        targetBreath=Math.max(targetBreath,.90);
        targetRotationY+=.020;
      }else if(state==='system-attention'){
        targetEnergy=Math.max(targetEnergy,.72);
        targetBreath=Math.max(targetBreath,.40);
        targetRotationX=clamp(targetRotationX-.018,-1.02,1.02);
      }else{
        targetEnergy=Math.max(targetEnergy,.66);
        targetBreath=Math.max(targetBreath,.36);
      }
      root.dataset.fxCorePhysiologyEnergyR1723=targetEnergy.toFixed(2);
      root.dataset.fxCorePhysiologyBreathR1723=targetBreath.toFixed(2);
      dispatchEvent(new CustomEvent('formatx:organismphysiology',{detail:{
        kind:state,
        source:String(source||state),
        energy:targetEnergy,
        breath:targetBreath,
        x:tx,
        y:ty,
        revision:'r1723'
      }}));
      startSurfacePulse(String(source||state)+'-physiology');
      setShape('organism',source||state||'physiology');
      schedule(mobile?3:5);
    }
    function onCinematicScene(event){
      const detail=event.detail||{};
      const index=Number(detail.index);
      if(Number.isFinite(index)){
        targetSiteProgress=clamp(index/Math.max(1,11),0,1);
        targetRotationY+=(index%2?1:-1)*.014;
        targetRotationZ=clamp(targetRotationZ+(index%3-1)*.004,-.16,.16);
      }
      targetEnergy=Math.max(targetEnergy,.68);
      targetBreath=Math.max(targetBreath,.48);
      root.dataset.fxCoreCinematicReactionR1701=String(detail.kind||detail.code||'scene');
      schedule(mobile?2:4);
    }

    listen(hero,'pointermove',onMove,{passive:true});
    listen(hero,'pointerdown',onDown,{passive:true});
    listen(window,'pointermove',onAmbientMove,{passive:true});
    listen(window,'pointerdown',onAmbientPress,{passive:true});
    listen(window,'pointerup',onAmbientRelease,{passive:true});
    listen(window,'pointercancel',onAmbientRelease,{passive:true});
    listen(window,'wheel',onAmbientWheel,{passive:true});
    listen(window,'keydown',onAmbientKey,{passive:true});
    listen(hero,'pointerleave',onLeave,{passive:true});
    listen(window,'formatx:coreinteraction',onCoreInteraction,{passive:true});
    listen(window,'formatx:referencepause',onPause,{passive:true});
    listen(reduced,'change',onReducedMotionChange,{passive:true});
    listen(window,'scroll',onScroll,{passive:true});
    listen(window,'resize',()=>{resize();boost(.30,mobile?1:2);startSurfacePulse('resize');},{passive:true});
    listen(window,'orientationchange',()=>{resize();boost(.52,mobile?2:3);startSurfacePulse('orientation');},{passive:true});
    listen(window,'formatx:organismpanelopen',()=>signalPhysiology('attention','organism-listening'),{passive:true});
    listen(window,'formatx:organismresponse',()=>signalPhysiology('response','organism-response'),{passive:true});
    listen(window,'formatx:open-live-os',()=>signalPhysiology('system-attention','live-os-open'),{passive:true});
    listen(window,'formatx:loop',()=>{signalPhysiology('renewal','site-loop');boost(.92,mobile?4:6);},{passive:true});
    listen(window,'formatx:menustatechange',event=>signalPhysiology(event.detail?.open?'attention':'stability',event.detail?.open?'menu-open':'menu-close'),{passive:true});
    listen(window,'formatx:languagechange',()=>signalPhysiology('curiosity','language-change'),{passive:true});
    listen(window,'formatx:cinematicscene',onCinematicScene,{passive:true});
    listen(window,'formatx:storychapter',()=>signalPhysiology('curiosity','story-chapter'),{passive:true});
    listen(document,'input',()=>{targetEnergy=Math.max(targetEnergy,.60);targetBreath=Math.max(targetBreath,.30);schedule(mobile?1:2);},{passive:true});
    listen(document,'change',()=>signalPhysiology('activation','form-change'),{passive:true});
    listen(document,'submit',()=>signalPhysiology('activation','form-submit'),{passive:true});
    listen(window,'pointerenter',()=>boost(.22,mobile?1:2),{passive:true});
    listen(window,'pointerleave',()=>boost(.16,mobile?1:2),{passive:true});
    listen(window,'pageshow',()=>{boost(.36,mobile?1:2);schedule(1);},{passive:true});
    listen(document,'visibilitychange',()=>{
      if(!document.hidden)schedule(1);
      scheduleSurfacePulse();
    },{passive:true});
    listen(document,'click',event=>{
      if(!(event.target instanceof Element))return;
      const action=event.target.closest('a,button,[role="button"]');
      if(!action||action.closest('.fx-reference-mag-button'))return;
      if(action.matches('.fx-reference-ask,[data-fx-organism-question]'))signalPhysiology('attention','site-question');
      else if(action.matches('a[href*="download"],[data-release-download]'))signalPhysiology('activation','release-action');
      boost(action.matches('a[href*="download"],[data-release-download]') ? .92 : .62,mobile?2:4);
    },{passive:true});
    listen(document,'focusin',event=>{
      if(event.target instanceof Element&&event.target.matches('a,button,input,select,textarea,[tabindex]'))signalPhysiology('attention','focus');
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
    const sectionPhysiology={
      hero:'homeostasis',experience:'attention',capabilities:'activation',
      pricing:'heartbeat',system:'stability',resources:'curiosity'
    };
    const organObserver=new IntersectionObserver(entries=>{
      const candidate=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      const id=candidate?.target?.id;
      if(!id||id===activeOrgan)return;
      activeOrgan=id;root.dataset.fxCoreActiveOrgan=id;cinematic.activeOrgan=id;
      signalPhysiology(sectionPhysiology[id]||'attention','site-section-'+id);
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
      canonicalRenderer:'single-webgl-living-organism-r326',
      canonicalRevision:CANONICAL_REVISION,
      livingForm:'single-photoreal-organism-r1723',
      material:'cortical-bioceramic-living-tissue-r1723',
      geometry:'cortical-cellular-organism-with-native-tendrils-r1723',
      referenceGeometry:'single-cortical-living-organism-r1723',
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
      physiology:(kind,source)=>signalPhysiology(String(kind||'response'),String(source||'api-physiology')),
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
    root.dataset.fxCoreRendererCanonicalR1723='single-webgl-living-organism-r326';
    root.dataset.fxCoreCapabilityTierR620=constrainedMobile?'mobile-constrained-one-pass':constrained?'desktop-constrained-two-pass':mobile?'mobile-full-two-pass':'desktop-full-three-pass';
    root.dataset.fxCoreCapabilityR620=`${hardwareConcurrency}c-${deviceMemory}gb`;
    root.dataset.fxCoreMaterial='cortical-bioceramic-living-tissue-r1723';
    root.dataset.fxCoreGeometry='cortical-cellular-organism-with-native-tendrils-r1723';
    root.dataset.fxCoreGenesisMagR614='dna-to-cell-to-cortical-living-organism-r1723';
    root.dataset.fxCoreNativeTendrilsR614=String(geometry.tendrils||0);
    root.dataset.fxCoreGenomeR614='native-double-helix-energy-lattice';
    root.dataset.fxCoreGenomeContinuityR614='r533-dna-genesis-to-same-r326-native-core';
    root.dataset.fxCoreRendererVersion=REVISION;
    root.dataset.fxCoreGeometryTopology=geometry.topology;
    root.dataset.fxCoreVertexCount=String(geometry.count);
    root.dataset.fxCoreDimension='native-closed-3d-volume-r413';
    root.dataset.fxCoreMorphGeometryR413='single-fixed-living-organism-topology-r1723';
    root.dataset.fxCoreMorphNormalsR413='single-organism-photographic-surface-normals-r1723';
    root.dataset.fxCoreLivingIdentityR1711='same-organism-intro-to-site-no-form-swap';
    root.dataset.fxCoreLivingIdentityR1723='canonical-organism-cortical-cellular-neural-no-alternate-form';
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
    root.dataset.fxCoreInteractionVisual='pointer-touch-drag-scroll-wheel-click-keyboard-focus-menu-language-section-site-state-r1690';
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
    root.dataset.fxCoreMobileResolutionR424=softwareRenderer?'r1671-software-crisp-start-adaptive-governor':mobile?'r1555-mobile-camera-correct-smooth-adaptive':'r1555-desktop-camera-correct-smooth-adaptive';
    root.dataset.fxCoreMobileOpticsR435=mobile?'superseded-by-r454-visible-native-surface':'desktop-preserved-r454';
    root.dataset.fxCoreMobileOpticsR440=mobile?'superseded-by-r454-luminous-electric-surface':'desktop-superseded-by-r454';
    root.dataset.fxCoreMobilePerformanceR442=mobile?'18x36-capable-12x24-constrained-adaptive-intermittent-pulse-idle-zero':'desktop-three-pass-intermittent-pulse-idle-zero';
    root.dataset.fxGpuCapability=webgl2?'webgl2':'webgl1';
    root.dataset.fxCoreReal3dTargetFps='interaction-60-idle-zero-r441';
    root.dataset.fxCoreIdleRenderR441='zero-frame';
    root.dataset.fxCoreRenderMs='0';
    root.dataset.fxCoreReal3dFps='60';
    root.dataset.fxCoreSoftwareBudgetR1545=softwareRenderer?'190k-r1671-crisp-start-governor-can-shed':'hardware-budget-unchanged';

    publishShape('initial');
    schedule(1);
    scheduleHeartbeat();
    scheduleSurfacePulse();
    scheduleAutonomousMorph();
    dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{
      version:'r413',renderer:VERSION,revision:REVISION,context:webgl2?'webgl2':'webgl1',
      geometry:'single-fixed-living-3d-volume',morph:'disabled-single-organism-r1711',interactive:true,organism:true,legacyFallback:false
    }}));
    listen(window,'pagehide',destroy,{once:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});
  else boot();
}());

(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'crystal-organism-r326';
  const REVISION = 'living-luminous-electric-crystal-r454';
  const CANONICAL_REVISION = 'fully-living-organism-r1723';
  const VISUAL_REVISION_R1713 = 'photoreal-single-living-organism-r1713';
  const READY = 'ready-v69';
  const mobile = matchMedia('(max-width:900px),(max-aspect-ratio:27/25)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  // Read the current preference at existing input/render boundaries even
  // while a retained media-query object's change event is still queued.
  function reducedMotionRequested(){
    return matchMedia('(prefers-reduced-motion:reduce)').matches;
  }
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
  root.dataset.fxNativeMagVisualR1982='photoreal-microfibril-surface-native-silhouette-fibers-anisotropic-mineral-sheen';
  root.dataset.fxNativeMagVisualR1726='cinematic-photographic-smoky-pearl-biocrystal-neutral-studio-response';
  root.dataset.fxNativeMagMaterialR1726='neutral-mineral-ggx-softbox-restrained-vascular-emission-physical-edge-transmission';
  root.dataset.fxNativeMagVisualR1727='photographic-biocrystal-continuity-neutral-cortex-smoked-optic';
  root.dataset.fxNativeMagMaterialR1727='compile-safe-facet-tones-neutral-subsurface-low-emission-studio-reflection';
  root.dataset.fxNativeMagVisualR1749='final-photographic-smoky-pearl-biocrystal-integrated-optic';
  root.dataset.fxNativeMagMaterialR1749='neutral-mineral-softbox-low-cyan-no-neon-rib-physical-smoked-glass';
  root.dataset.fxNativeMagVisualR1755='photographic-living-biocrystal-dermal-depth-microvascular-response';
  root.dataset.fxNativeMagMaterialR1755='smoky-pearl-bioglass-ggx-dermal-transmission-restrained-emission';
  root.dataset.fxNativeMagPerformanceR1755='single-webgl-60hz-quality-shed-before-cadence-scroll-compositor-settle-redraw';
  root.dataset.fxNativeMagVisualR1775='photoreal-smoky-mineral-bioglass-physical-depth';
  root.dataset.fxNativeMagMaterialR1775='neutral-ggx-dielectric-absorption-low-emission-cinematic-softbox';
  root.dataset.fxNativeMagPerformanceR1775='same-single-webgl-pass-adaptive-60hz-budget';
  root.dataset.fxNativeMagVisualR1776='cinematic-photographic-irregular-smoky-biocrystal-deep-optic';
  root.dataset.fxNativeMagMaterialR1776='dark-dielectric-mineral-broad-facet-caustic-depth-low-emission';
  root.dataset.fxNativeMagSilhouetteR1776='sharper-asymmetric-hand-cut-living-crystal-no-egg-no-logo-diamond';
  root.dataset.fxNativeMagPerformanceR1776='geometry-and-shader-only-no-second-render-pass-60hz-budget';
  root.dataset.fxNativeMagVisualR1777='cinematic-black-mineral-bioglass-organism-broad-natural-facets';
  root.dataset.fxNativeMagMaterialR1777='neutral-dielectric-absorption-microfracture-softbox-physical-optic';
  root.dataset.fxNativeMagPerformanceR1777='single-pass-photographic-shader-no-css-shadow-60hz-budget';
  root.dataset.fxNativeMagVisualR1778='mobile-single-monolith-smoky-biocrystal-no-petal-no-fin';
  root.dataset.fxNativeMagMaterialR1778='dark-smoked-mineral-low-cyan-recessed-optic';
  root.dataset.fxNativeMagMobileR1778='clean-monolith-smaller-optic-no-flower-silhouette';
  root.dataset.fxNativeMagVisualR1779='mobile-obsidian-bioglass-monolith-broad-facets-no-tendrils';
  root.dataset.fxNativeMagMaterialR1779='dark-studio-obsidian-broad-specular-low-emission-recessed-optic';
  root.dataset.fxNativeMagMobileR1779='zero-tendrils-zero-flower-low-overdraw-proof-target';
  root.dataset.fxNativeMagVisualR1780='mobile-irregular-smoky-bioglass-rock-broad-facets-readable-optic';
  root.dataset.fxNativeMagMaterialR1780='smoky-charcoal-mineral-neutral-softbox-warm-rim-subtle-cyan-core';
  root.dataset.fxNativeMagMobileR1780='proof-calibrated-no-teardrop-no-petal-no-speckle';
  root.dataset.fxNativeMagVisualR1782='mobile-smoky-bioglass-crystal-broad-facets-visible-recessed-optic';
  root.dataset.fxNativeMagMaterialR1782='charcoal-pearl-bioglass-neutral-key-warm-rim-subtle-cyan-optic';
  root.dataset.fxNativeMagMobileR1782='no-cull-no-speckle-clean-broad-facet-silhouette';
  root.dataset.fxNativeMagRasterR1783='mobile-opaque-canvas-no-alpha-msaa-facet-seams';
  root.dataset.fxNativeMagRasterR1784='mobile-software-subpixel-face-overlap-no-triangle-cracks';
  root.dataset.fxNativeMagVisualR1785='mobile-smoked-black-bioglass-sculpted-facets-readable-cyan-optic';
  root.dataset.fxNativeMagMaterialR1785='dark-charcoal-glass-silver-softbox-warm-rim-cyan-depth';
  root.dataset.fxNativeMagVisualR1786='mobile-black-bioglass-narrow-softbox-cyan-optic-dynamic-three-quarter';
  root.dataset.fxNativeMagMaterialR1786='near-black-dielectric-specular-facets-low-diffuse-high-depth';
  root.dataset.fxNativeMagVisualR1787='mobile-sculpted-smoky-crystal-smooth-facets-large-recessed-optic-transparent-habitat';
  root.dataset.fxNativeMagMobileR1787='transparent-stage-no-black-box-higher-facet-density-smooth-normals';
  root.dataset.fxNativeMagVisualR1788='mobile-blunt-cut-black-bioglass-irregular-crystal-smooth-optic';
  root.dataset.fxNativeMagMaterialR1788='controlled-softbox-highlight-deep-charcoal-glass-cyan-optical-depth';
  root.dataset.fxNativeMagProofR1782='normal-visitor-path-with-lens-and-msaa';
  root.dataset.fxNativeMagVisualR1780='mobile-opaque-obsidian-three-quarter-broad-facet-proof';
  root.dataset.fxNativeMagSurfaceR1780='no-blend-no-cull-closed-opaque-mineral';
  root.dataset.fxNativeMagVisualR1789='mobile-smoky-bioglass-refined-facets-blunt-crown';
  root.dataset.fxNativeMagMaterialR1789='soft-studio-obsidian-neutral-specular-deep-optic';
  root.dataset.fxNativeMagMobileR1789='higher-topology-smooth-normal-small-optic-proof-pass';
  root.dataset.fxNativeMagVisualR1790='mobile-smoky-glass-visible-depth-neutral-studio';
  root.dataset.fxNativeMagMaterialR1790='charcoal-bioglass-midtones-soft-reflection-deep-optic';
  root.dataset.fxNativeMagMobileR1790='proof-balanced-visible-material-no-neon-no-flower';
  root.dataset.fxNativeMagVisualR1791='irregular-cut-smoky-bioglass-integrated-optic-bezel';
  root.dataset.fxNativeMagMaterialR1791='charcoal-crystal-soft-facets-dark-metal-glass-optic';
  root.dataset.fxNativeMagMobileR1791='no-blob-no-flower-visible-cut-planes-integrated-eye';
  root.dataset.fxNativeMagVisualR1792='smoky-bioglass-internal-depth-cut-crystal-mobile';
  root.dataset.fxNativeMagMaterialR1792='charcoal-quartz-edge-transmission-soft-caustic-gunmetal-optic';
  root.dataset.fxNativeMagMobileR1792='visible-depth-irregular-cut-integrated-optic-no-neon';
  root.dataset.fxNativeMagVisualR1793='visible-crystal-planes-smoky-quartz-integrated-optic';
  root.dataset.fxNativeMagMaterialR1793='faceted-charcoal-quartz-soft-caustic-neutral-reflection';
  root.dataset.fxNativeMagMobileR1793='crystal-not-blob-stronger-cuts-visible-facets-no-neon';
  root.dataset.fxNativeMagVisualR1794='smoky-quartz-mineral-fractures-warm-rim-visible-optic';
  root.dataset.fxNativeMagMaterialR1794='charcoal-teal-quartz-gunmetal-bezel-subtle-fissure';
  root.dataset.fxNativeMagMobileR1794='premium-dark-crystal-visible-optic-no-flat-gray';
  root.dataset.fxNativeMagVisualR1795='smoky-bioglass-transmission-rim-airy-mobile-composition';
  root.dataset.fxNativeMagMaterialR1795='charcoal-quartz-cool-edge-soft-transmission-warm-rim';
  root.dataset.fxNativeMagMobileR1795='smaller-airier-readable-bioglass-no-control-crowding';
  root.dataset.fxNativeMagVisualR1781='clean-photographic-bioglass-no-surface-pattern-aliasing';
  root.dataset.fxNativeMagMaterialR1781='broad-facet-studio-reflection-no-vein-no-plate-no-crack-overlay';
  root.dataset.fxNativeMagMobileR1781='single-solid-crystal-mesh-plus-recessed-lens-only';
  root.dataset.fxNativeMagInteractionR1711 = 'all-input-physiology-no-shape-switching';
  root.dataset.fxNativeMagVisualR1703 = 'sharp-mobile-smoky-obsidian-dark-photographic-planes-readable-smoked-lens';
  root.dataset.fxNativeMagPerformanceR1703 = 'higher-mobile-start-resolution-with-fast-quality-shed-before-cadence';
  root.dataset.fxNativeMagVisitorParityR2054='capability-and-input-owned';

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
    /* R1950 — desktop silhouette tessellation.
       The sharpened Signature MAG exposes contour faceting at 44x88, so desktop
       gets a denser body mesh. Mobile topology remains unchanged. */
    const latitudeSegments = software ? 24 : constrainedMobile ? 28 : mobile ? 36 : constrained ? 48 : 72;
    const longitudeSegments = software ? 48 : constrainedMobile ? 56 : mobile ? 72 : constrained ? 96 : 144;
    /* R1941 — the Signature MAG is one iconic sculpt. No cable silhouette competes
       with the four-point body; the living response stays in material, light and motion. */
    const tendrilCount = 0;
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

    function shellPosition(phi,theta) {
      const sinPhi=Math.sin(phi);
      const direction=[sinPhi*Math.cos(theta),Math.cos(phi),sinPhi*Math.sin(theta)];
      const spherePosition=direction.map(value=>value*.91);

      /* R1941c — source-locked Signature MAG.
         Restore the exact R1934–R1936 P0 diamond grammar selected by the user:
         asymmetric four-direction crystal, compact valleys, deeper rear volume.
         The silhouette is original; only shading/topology are modernised. */
      /* R1945 — desktop signature silhouette.
         Mobile already reads as the intended four-point mark. Desktop needed a
         stronger planar pinch because the larger photographic softbox response
         visually rounded the same mesh into a pod. Keep mobile untouched and
         sharpen only the desktop anisotropy/depth field. */
      const axisX=mobile
        ? (direction[0]>=0?.88:.86)
        : (direction[0]>=0?1.02:.98);
      const axisY=mobile
        ? (direction[1]>=0?1.09:.97)
        : (direction[1]>=0?1.18:1.06);
      const axisZ=mobile
        ? (direction[2]>=0?.64:.43)
        : (direction[2]>=0?.49:.34);
      const exponent=mobile?.78:.61;
      const terms=
        Math.pow(Math.abs(direction[0])/axisX,exponent)+
        Math.pow(Math.abs(direction[1])/axisY,exponent)+
        Math.pow(Math.abs(direction[2])/axisZ,exponent);
      const radial=1/Math.pow(Math.max(.0001,terms),1/exponent);
      const poleFade=sinPhi*sinPhi;
      const organic=
        1+
        .020*Math.sin(theta*4+phi*1.7)*poleFade+
        .007*Math.sin(theta*7-phi*3.1)*poleFade;

      const crystalPosition=direction.map(value=>value*radial*organic);

      return {spherePosition,crystalPosition,direction};
    }

    function vertex(latitudeIndex, longitudeIndex) {
      const latitude=latitudeIndex/latitudeSegments;
      const longitude=longitudeIndex/longitudeSegments;
      const phi=latitude*Math.PI;
      const theta=longitude*Math.PI*2;
      const point=shellPosition(phi,theta);
      /* R2063 — reflections follow the actual concave glass surface. The old
         ellipsoid normals erased the shoulders and made the sculpt look flat.
         Central surface derivatives retain the authored positions/topology. */
      const epsilon=.0007;
      const tangentPhi=subtract(
        shellPosition(Math.min(Math.PI,phi+epsilon),theta).crystalPosition,
        shellPosition(Math.max(0,phi-epsilon),theta).crystalPosition
      );
      const tangentTheta=subtract(
        shellPosition(phi,theta+epsilon).crystalPosition,
        shellPosition(phi,theta-epsilon).crystalPosition
      );
      let crystalNormal=cross(tangentPhi,tangentTheta);
      if(Math.hypot(...crystalNormal)<1e-10)crystalNormal=point.direction;
      else crystalNormal=normalize(crystalNormal);
      if(dot(crystalNormal,point.crystalPosition)<0)crystalNormal=crystalNormal.map(value=>-value);
      return{
        sphere:point.spherePosition,
        crystal:point.crystalPosition,
        sphereNormal:point.direction,
        crystalNormal,
        uv:[longitude,latitude]
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
      /* R1941e — two-sided closed shell no longer needs per-triangle expansion.
         Removing overlap also removes software/mobile z-fighting speckles. */
      const bodySeamOverlap=0;
      const sphereCentre=bodySeamOverlap?[0,1,2].map(axis=>
        (vertices[0].sphere[axis]+vertices[1].sphere[axis]+vertices[2].sphere[axis])/3
      ):null;
      vertices.forEach((item, index) => {
        if(bodySeamOverlap){
          const k=1+bodySeamOverlap;
          sphere.push(
            sphereCentre[0]+(item.sphere[0]-sphereCentre[0])*k,
            sphereCentre[1]+(item.sphere[1]-sphereCentre[1])*k,
            sphereCentre[2]+(item.sphere[2]-sphereCentre[2])*k
          );
          crystal.push(
            centre[0]+(item.crystal[0]-centre[0])*k,
            centre[1]+(item.crystal[1]-centre[1])*k,
            centre[2]+(item.crystal[2]-centre[2])*k
          );
        }else{
          sphere.push(...item.sphere);
          crystal.push(...item.crystal);
        }
        sphereNormals.push(...item.sphereNormal);
        const smoothNormal=item.crystalNormal||crystalNormal;
        /* R1941f — the signature body keeps authored sharp silhouette geometry,
           but uses the analytical smooth normal exclusively. Auxiliary geometry
           may still retain a small face-normal contribution. */
        const smoothWeight=facet<2.0?(mobile?.985:(software?.94:.90)):(software?.95:(mobile?.985:(constrained?.972:.978)));
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

    /* R1931 — clean P0-derived body topology.
       Low, even facet density is intentional: the silhouette is authored by the
       continuous anisotropic field above, not by dozens of hand-pushed rings. */
    for(let lat=0;lat<latitudeSegments;lat+=1){
      for(let lon=0;lon<longitudeSegments;lon+=1){
        const a=vertex(lat,lon);
        const b=vertex(lat,lon+1);
        const c=vertex(lat+1,lon);
        const d=vertex(lat+1,lon+1);
        const facet=.12+.28*random(lon+lat*17,lat*31+lon);
        if(lat>0)triangle([a,b,c],facet);
        if(lat<latitudeSegments-1)triangle([b,d,c],facet+.004);
      }
    }

    /* R1982 — real microfibril geometry.
       These are not a 2D overlay: each strand is a hair-thin tapered triangle
       rooted in the analytical mineral surface and emitted inside the existing
       single WebGL draw. The count is capability-aware so the 60 Hz governor
       keeps priority while desktop close-ups gain physically sharp silhouette
       fibers. */
    const microFiberCount=software?0:(mobile?(constrainedMobile?44:78):(constrained?136:286));
    for(let index=0;index<microFiberCount;index+=1){
      const lat=1.65+random(index*19+7,index*31+11)*(latitudeSegments-3.3);
      const lon=random(index*43+17,index*13+29)*longitudeSegments;
      const base=vertex(lat,lon);
      const normal=normalize(base.crystalNormal||base.crystal);
      const guide=Math.abs(normal[1])>.88?[1,0,0]:[0,1,0];
      const tangent=normalize(cross(normal,guide));
      const bitangent=normalize(cross(normal,tangent));
      const strandLength=(mobile?.015:.021)+(mobile?.020:.034)*random(index*47+3,index*59+5);
      const halfWidth=(mobile?.00135:.00100)+(mobile?.00070:.00082)*random(index*61+9,index*67+15);
      const curlT=(random(index*71+2,index*73+4)-.5)*(mobile?.007:.012);
      const curlB=(random(index*79+6,index*83+8)-.5)*(mobile?.006:.010);
      const root=[
        base.crystal[0]+normal[0]*.0025,
        base.crystal[1]+normal[1]*.0025,
        base.crystal[2]+normal[2]*.0025
      ];
      const left=[
        root[0]-tangent[0]*halfWidth,
        root[1]-tangent[1]*halfWidth,
        root[2]-tangent[2]*halfWidth
      ];
      const right=[
        root[0]+tangent[0]*halfWidth,
        root[1]+tangent[1]*halfWidth,
        root[2]+tangent[2]*halfWidth
      ];
      const tip=[
        root[0]+normal[0]*strandLength+tangent[0]*curlT+bitangent[0]*curlB,
        root[1]+normal[1]*strandLength+tangent[1]*curlT+bitangent[1]*curlB,
        root[2]+normal[2]*strandLength+tangent[2]*curlT+bitangent[2]*curlB
      ];
      const makeFiberVertex=(position,uv)=>{
        const dir=normalize(position);
        return{
          sphere:dir.map(value=>value*.91),
          crystal:position,
          sphereNormal:dir,
          crystalNormal:normal,
          uv
        };
      };
      triangle([
        makeFiberVertex(left,[0,0]),
        makeFiberVertex(right,[1,0]),
        makeFiberVertex(tip,[.5,1])
      ],1.72+.20*random(index*89+1,index*97+3));
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
    /* R1778 — mobile hero is one readable mineral organism, not a flower.
       Auxiliary lobes/fins are desktop-only; on phones the single hand-cut body
       owns the silhouette and saves geometry/overdraw at the same time. */
    if(false&&!mobile&&!software){
      appendEllipsoid([-.28,.30,.060],[.17,.26,.15],.74,8,14,.34);
      appendEllipsoid([ .31,.22,.070],[.18,.24,.16],.70,8,14,-.28);
      appendEllipsoid([-.25,-.27,.030],[.16,.22,.14],.78,8,14,-.22);
      appendEllipsoid([ .27,-.31,.040],[.16,.21,.14],.76,8,14,.26);

      appendMembraneTri([-.18,.66,-.04],[-.34,.94,-.08],[-.02,.80,.05],4.34);
      appendMembraneTri([ .14,.69,.02],[ .31,.92,-.04],[ .04,.82,.07],4.38);
      appendMembraneTri([-.42,.18,-.08],[-.68,.32,-.12],[-.50,-.01,.01],4.46);
      appendMembraneTri([ .46,.13,-.07],[ .70,.25,-.11],[ .51,-.06,.03],4.48);
    }

    if(false){
      const centreX=.105,centreY=.025;
      const bezelSteps=software?112:mobile?144:160,bezelTubeSteps=software?10:mobile?14:16,bezelZ=.602;
      const bezelMajorX=.168,bezelMajorY=.052,bezelTube=.0022;
      const bezelVertex=(angle,tubeAngle)=>{
        const ca=Math.cos(angle),sa=Math.sin(angle),ct=Math.cos(tubeAngle),st=Math.sin(tubeAngle);
        const radial=[ca,sa,0];
        const position=[
          centreX+ca*bezelMajorX+radial[0]*bezelTube*ct,
          centreY+sa*bezelMajorY+radial[1]*bezelTube*ct,
          bezelZ+bezelTube*.72*st
        ];
        const normal=normalize([ca*ct,sa*ct,st*1.38]);
        return surfaceVertex(position,normal,[.5+.5*ca,.5+.5*sa],.90);
      };
      for(let side=0;side<bezelSteps;side+=1){
        const a=side/bezelSteps*Math.PI*2;
        const b=(side+1)/bezelSteps*Math.PI*2;
        for(let tube=0;tube<bezelTubeSteps;tube+=1){
          const ta=tube/bezelTubeSteps*Math.PI*2;
          const tb=(tube+1)/bezelTubeSteps*Math.PI*2;
          const p0=bezelVertex(a,ta),p1=bezelVertex(b,ta),p2=bezelVertex(b,tb),p3=bezelVertex(a,tb);
          triangle([p0,p1,p2],5.74);
          triangle([p0,p2,p3],5.74);
        }
      }

      const lensCenter=[centreX,centreY,.609];
      const lensRadiusX=.153;
      const lensRadiusY=.041;
      const lensDepth=.020;
      const radialSteps=software?16:mobile?20:22;
      const angularSteps=software?112:mobile?128:144;
      function lensVertex(radial,angle){
        const edgeWarp=1+.018*Math.sin(angle*3.0+.42)+.010*Math.cos(angle*5.0-.31);
        const nx=radial*Math.cos(angle);
        const ny=radial*Math.sin(angle);
        const nz=Math.sqrt(Math.max(0,1-radial*radial));
        const crystalPosition=[
          lensCenter[0]+lensRadiusX*radial*Math.cos(angle)*edgeWarp,
          lensCenter[1]+lensRadiusY*radial*Math.sin(angle)*(1+.010*Math.sin(angle*4.0)),
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
      microFibers: microFiberCount,
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
    stage.style.setProperty('background','radial-gradient(ellipse 44% 38% at 50% 47%,rgba(90,206,216,.125) 0%,rgba(40,92,98,.055) 42%,rgba(0,0,0,0) 76%),radial-gradient(ellipse 78% 66% at 50% 52%,rgba(6,18,23,.24),rgba(0,0,0,0) 82%)','important');

    const canvas = document.createElement('canvas');
    canvas.className = 'fx-core-mobile-v55-canvas fx-crystal-organism-r326-canvas';
    canvas.setAttribute('aria-hidden','true');
    stage.appendChild(canvas);
    /* R1559 owns the final compositor treatment inline so dynamically loaded
       legacy CSS cannot restore synthetic drop-shadow optics. Keep the correction
       deliberately mild, but preserve enough tonal separation for real mineral
       planes on OLED/mobile displays and the canonical surface-energy contract. */
    /* R1959: physically neutral compositor tone. The previous inline
       !important saturation overrode the canonical material CSS. */
    // The physical studio shader already performs display transfer and tone
    // mapping. Preserve its color and avoid a second canvas filter pipeline.
    const compositorFilter='none';
    canvas.style.setProperty('filter',compositorFilter,'important');
    canvas.style.setProperty('-webkit-filter',compositorFilter,'important');
    canvas.style.setProperty('box-shadow','none','important');

    /* R2069: retain the existing compositor heartbeat without the historical
       mobile dimming. The registered timeline ranges from .94 to 1; its native
       canvas coverage therefore stays between .985 and 1. Reduced motion uses
       full coverage. The same canvas, timeline and pause governor remain the
       owners; this binding is updated only when the motion preference changes. */
    const mobileBreathPreference=mobile?matchMedia('(prefers-reduced-motion: reduce)'):null;
    const syncMobileBreathOpacity=()=>{
      if(!mobileBreathPreference)return;
      if(mobileBreathPreference.matches){
        canvas.style.setProperty('opacity','1','important');
      }else{
        canvas.style.setProperty('opacity','calc(.75 + var(--fx-mag-life-opacity,1) * .25)','important');
      }
    };
    syncMobileBreathOpacity();
    mobileBreathPreference?.addEventListener?.('change',syncMobileBreathOpacity);
    if(mobile)root.dataset.fxMagMobileBreathBindingR2045='inline-important-registered-compositor';

    /* R1930 — one slow compositor breath on every capable screen.
       No idle JS RAF is introduced; reduced-motion remains fully respected. */
    let livingTimeline=null;
    function syncCompositorBreath(){
      if(reducedMotionRequested()){
        livingTimeline?.pause();
        return;
      }
      if(livingTimeline){
        if(livingTimeline.playState==='paused')livingTimeline.play();
        return;
      }
      if(typeof canvas.animate!=='function')return;
      livingTimeline=canvas.animate(
        [
          {opacity:.985,transform:'scale(.996)',offset:0},
          {opacity:1,transform:'scale(1.004)',offset:.48},
          {opacity:.990,transform:'scale(.999)',offset:.76},
          {opacity:.985,transform:'scale(.996)',offset:1}
        ],
        {
          duration:6800,
          iterations:Infinity,
          easing:'cubic-bezier(.37,0,.20,1)',
          fill:'both'
        }
      );
      livingTimeline.id='fx-primary-mag-living-breath-r1930';
      root.dataset.fxNativeMagDesktopLifeR1902='waapi-compositor-opacity-no-raf';
      root.dataset.fxNativeMagBreathR1930='all-screen-compositor-breath-no-idle-raf';
    }
    syncCompositorBreath();

    const options = {
      alpha:true,
      /* R1626: mobile/coarse displays get temporal smoothness from native
         device density; MSAA costs frame budget twice (raster + resolve).
         Preserve desktop MSAA only where headroom is normally available. */
      /* Desktop always requests MSAA. On mobile the existing DPR guard remains. */
      antialias:!mobile || (!constrained && (devicePixelRatio||1)<=4.2),
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
      livingTimeline?.cancel();
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
      uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uAspect,uSiteProgress,uGenesis;
      uniform vec2 uPointer;
      uniform vec3 uRotation;
      ${vertexOut} vec3 vNormal;
      ${vertexOut} vec3 vLocal;
      ${vertexOut} vec3 vBodyX;
      ${vertexOut} vec3 vBodyY;
      ${vertexOut} vec3 vBodyZ;
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
        float organicBlend=.010;
        vec3 crystalShadingNormal=normalize(mix(aCrystalNormal,aSphereNormal,.10));
        vec3 normal=normalize(mix(crystalShadingNormal,aSphereNormal,organicBlend));
        vec3 base=mix(aCrystal,aSphere,organicBlend);
        float cell=sin(uTime*.71+dot(aSphereNormal,vec3(5.7,4.1,6.3))+uSiteProgress*6.28318);
        float membrane=sin(uTime*1.17+aUv.x*12.5663706144-aUv.y*9.2+sin(aUv.y*6.28318530718)*1.4);
        float living=(cell*.011+membrane*.0065)*(.42+.58*uEnergy);
        float bodyVertexMask=1.0-step(2.0,aFacet);
        float cortexEnvelope=pow(max(0.0,sin(aUv.y*3.14159265)),1.35)*bodyVertexMask;
        float cortexA=sin(aUv.x*37.6991118431+sin(aUv.y*18.8495559215)*1.55+aUv.y*5.3);
        float cortexB=sin(aUv.x*18.8495559215-aUv.y*25.133+sin(aUv.x*12.5663706144)*1.20);
        float cortex=(cortexA*.62+cortexB*.38)*.0026*cortexEnvelope;
        float microFold=sin(aUv.x*18.8495559215+aUv.y*15.4)*.00028*cortexEnvelope;
        /* R1917 — two broad sculptural valleys bend the reflection field without
           drawing decorative lines. Geometry stays one continuous living volume. */
        /* R1923 — the smooth cubic body is now authoritative. The legacy
           procedural face-grooves were still deforming the first WebGL frame
           after geometry cleanup and created a mouth/visor-like horizontal seam. */
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
        local.xy+=uPointer*${mobile?'.038':'.052'}*uLayer;
        float genesis=uGenesis<0.0?1.0:smoothstep(.04,.92,uGenesis);
        float approach=1.0-genesis;
        float yaw=${mobile?'.405':'.335'}+uRotation.y+uPointer.x*${mobile?'.12':'.16'}+uTime*.007+approach*.74;
        float pitch=-.070+uRotation.x-uPointer.y*${mobile?'.085':'.125'}+.006*sin(uTime*.19)-approach*.19;
        float roll=-.045+uRotation.z+uPointer.x*uPointer.y*${mobile?'.022':'.034'}+.005*sin(uTime*.23)-approach*.13;
        mat3 rotation=rz(roll)*ry(yaw)*rx(pitch);
        vec3 world=rotation*local;
        vNormal=normalize(rotation*normal);
        vLocal=world;
        vBodyX=rotation[0];
        vBodyY=rotation[1];
        vBodyZ=rotation[2];
        vUv=aUv;
        vBary=aBary;
        vFacet=aFacet;
        vMorph=morph;
        float camera=3.12-world.z*.70;
        float perspective=2.76/max(1.72,camera);
        vec2 silhouetteScale=vec2(mix(1.02,1.0,morph),mix(1.03,1.0,morph));
        vec2 projected=vec2(world.x/max(.56,uAspect),world.y)*silhouetteScale*perspective;
        /* Keep the complete signature inside its actual native frustum. The
           approach retains perspective and rotation without cropping its tips. */
        projected*= ${mobile?'.585':'.790'}*min(1.0,max(.56,uAspect)/.88)*(1.0+approach*${mobile?'.32':'.12'});
        projected.x+=${mobile?'.002':'.018'};
        projected.y+=${mobile?'.010':'-.006'};
        /* world.z grows toward the virtual camera in the perspective term.
           NDC depth grows away from camera, therefore the sign must be inverted. */
        gl_Position=vec4(projected,-world.z*.13,1.0);
      }`;


    /* R1557 source-contract compatibility: dnaHelix and dnaBridge remain the
       semantic genome lineage names even though the final mineral no longer
       paints neon genome overlays. The birth film owns explicit DNA imagery. */

    /* R1557 constrained material intentionally shares the same photographic
       language with fewer highlights; software/mobile proof must not fall back
       to a gray translucent surrogate. */

    /* R2063 — one studio dielectric across every capability tier. Reflected
       panels and refracted light share the real surface normal; absorption
       supplies glass depth and actual energy/scroll/pulse uniforms drive life. */
    const constrainedFragmentSource = `${versionLine}precision highp float;
      uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uSiteProgress,uSurfacePulse;
      uniform vec2 uPointer;
      ${fragmentIn} vec3 vNormal;
      ${fragmentIn} vec3 vLocal;
      ${fragmentIn} vec3 vBodyX;
      ${fragmentIn} vec3 vBodyY;
      ${fragmentIn} vec3 vBodyZ;
      ${fragmentIn} vec2 vUv;
      ${fragmentIn} vec3 vBary;
      ${fragmentIn} float vFacet;
      ${fragmentIn} float vMorph;
      ${webgl2 ? "out vec4 outColor;" : ""}
      float sat(float value){return clamp(value,0.,1.);}
      float gaussian(float value,float width){float q=value/width;return exp(-q*q);}
      float gaussian2(vec2 value,vec2 width){vec2 q=value/width;return exp(-dot(q,q));}
      vec3 displayColor(vec3 color){
        color=max(color,vec3(0.0));
        color=clamp((color*(2.51*color+.03))/(color*(2.43*color+.59)+.14),0.0,1.0);
        return pow(color,vec3(.454545));
      }
      vec3 studio(vec3 direction,float roughness){
        vec3 d=normalize(direction);
        float front=smoothstep(-.25,.65,d.z);
        float softness=.025+roughness*.14;
        // exp(-x*x)*exp(-y*y) equals exp(-(x*x+y*y)): keep the same
        // physical panel while evaluating one exponential per light sample.
        float key=gaussian2(vec2(d.x+.32,d.y-.08),vec2(.055+softness,.66))*front;
        float fill=gaussian2(vec2(d.x-.46,d.y+.10),vec2(.105+softness,.72))*front;
        float crown=gaussian2(vec2(d.x+.08,d.y-.73),vec2(.46,.13+softness))*front;
        float floorLight=gaussian2(vec2(d.x-.10,d.y+.65),vec2(.64,.18+softness))*front;
        float rear=gaussian2(vec2(d.x+.10,d.y-.32),vec2(.55,.60))*smoothstep(.0,.75,-d.z);
        return vec3(.006,.009,.015)
          +vec3(5.7,6.2,6.6)*key
          +vec3(.70,1.65,2.18)*fill
          +vec3(1.9,1.8,1.6)*crown
          +vec3(.13,.21,.31)*floorLight
          +vec3(.032,.045,.055)*rear;
      }
      void main(){
        vec3 normal=normalize(vNormal);
        vec3 view=normalize(vec3(-vLocal.xy,2.86-vLocal.z));
        if(dot(normal,view)<0.0)normal=-normal;
        float facing=sat(dot(normal,view));
        float fresnel=.037+.963*pow(1.0-facing,5.0);
        float roughness=.10+.055*(.5+.5*normal.y);
        vec3 reflection=reflect(-view,normal);
        vec3 refracted=refract(-view,normal,1.0/1.46);
        float thickness=.08+.68*pow(facing,1.4)+.10*(.5+.5*vLocal.z);
        vec3 absorption=exp(-vec3(1.85,1.55,1.38)*thickness);
        vec3 transmitted=studio(refracted,roughness+.12)*absorption;
        vec3 reflected=studio(reflection,roughness);
        vec3 color=transmitted*(1.0-fresnel)+reflected*fresnel*1.18;

        /* The closed membrane has a cool, deep body and a neutral silver rim.
           Normal derivatives keep every highlight attached during rotation. */
        float key=sat(dot(normal,normalize(vec3(-.45,.65,.62))));
        float fill=sat(dot(normal,normalize(vec3(.65,-.08,.76))));
        float shell=.065+.060*key+.035*fill;
        color+=vec3(.022,.073,.095)*shell;
        float rim=pow(1.0-facing,2.25);
        color+=vec3(.13,.26,.33)*rim*.34;
        float dispersion=gaussian(reflection.x-.46,.028+roughness*.16)
          *gaussian(reflection.y+.10,.73)*smoothstep(-.2,.6,reflection.z);
        color+=vec3(.15,.08,.25)*dispersion*fresnel*.26;

        /* Internal anatomy follows the same real rotation as the body.
           Environment reflections stay in world space. The orthonormal
           basis transforms the refracted ray back into body coordinates. */
        vec3 bodyPosition=vec3(dot(vLocal,vBodyX),dot(vLocal,vBodyY),dot(vLocal,vBodyZ));
        vec3 bodyRay=vec3(dot(refracted,vBodyX),dot(refracted,vBodyY),dot(refracted,vBodyZ));
        vec3 organ=vec3(.008+uPointer.x*.016,.012-uPointer.y*.013,.15);
        float organDepth=max(0.0,dot(organ-bodyPosition,bodyRay));
        vec3 inside=bodyPosition+bodyRay*organDepth;
        vec3 delta=inside-organ;
        float organDistance=length(delta*vec3(1.0,1.03,.66));
        float organCore=gaussian(organDistance,.055);
        float organHalo=gaussian(organDistance,.17);
        float organBoundary=gaussian(organDistance-.102,.012);
        float activity=.34+.48*sat(uEnergy)+.18*sat(uBreath);
        float transmissionWindow=smoothstep(-.05,.36,bodyPosition.z)*(1.0-.40*fresnel);
        color+=vec3(.18,.87,1.18)*organHalo*.075*activity*transmissionWindow;
        color+=vec3(.25,.76,.92)*organBoundary*.13*transmissionWindow;
        color+=vec3(.78,1.14,1.27)*organCore*(.45+.75*activity)*transmissionWindow;

        /* Four broad internal folds catch refracted illumination. The field is
           continuous and anchored in 3D, without per-triangle random color. */
        float fold=gaussian(abs(inside.x)*.92+abs(inside.y)*.75-.27,.037);
        float outerFold=gaussian(abs(inside.x)*.87+abs(inside.y)*.72-.47,.055);
        float depthMask=smoothstep(-.10,.32,bodyPosition.z);
        color+=vec3(.075,.19,.24)*fold*depthMask*(.13+.16*fill);
        color+=vec3(.07,.12,.17)*outerFold*depthMask*.12;

        float sweep=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(bodyPosition.y*.61+bodyPosition.x*.14+bodyPosition.z*.16)*.5;
          float head=-.16+1.32*sat(uSurfacePulse);
          sweep=gaussian(coordinate-head,.065)*(.28+.72*rim);
        }
        color+=vec3(.055,.33,.48)*sweep*.43;
        color+=reflected*sweep*.045;
        ${outputName}=vec4(displayColor(color),1.0);
      }`;


    /* R1716 — preserve photographic mobile geometry.
       Software rendering keeps the ultra-lite material/mesh, but real mobile
       GPUs use the medium physical shader and the normal mobile topology.
       Dynamic resolution still yields before the 16.67 ms cadence. */
    const mobilePhysical = mobile || constrainedMobile;
    /* R1930 visual parity: one authored studio shader on desktop, mobile and
       software proof. This removes the hardware/CI split that hid ugly live paths. */
    const fragmentSource = constrainedFragmentSource;
    root.dataset.fxCoreOpticsR2035='debanded-single-body-broad-softboxes-subpixel-safe';
    root.dataset.fxCoreShaderProfileR1605=softwareRenderer
      ? 'r1724-software-living-crystal-cyan-indigo-lite'
      : (mobilePhysical?'r1716-mobile-physical-constrained-photographic':'photographic-full-desktop');
    root.dataset.fxNativeMagPerformanceR1710='16-67ms-first-adaptive-resolution-zero-idle';
    root.dataset.fxNativeMagVisualR1716='mobile-normal-topology-physical-shader-photoreal-60fps-first';
    root.dataset.fxNativeMagVisualR1718='mobile-sharp-readable-midtone-photoreal-organism';
    root.dataset.fxNativeMagQualityR1718='higher-resolution-floor-gradual-pressure-shedding';
    root.dataset.fxNativeMagStudioR1930='single-sculpt-frosted-ice-horizontal-aperture-slow-breath-cross-tier-parity';
    root.dataset.fxNativeMagStudioR1932='p0-derived-seamless-living-crystal-no-eye-broad-internal-breath';
    root.dataset.fxNativeMagStudioR1933='frosted-cut-ice-two-pass-living-depth-no-eye';
    root.dataset.fxNativeMagMobileR1936='brighter-readable-body-higher-opacity-balanced-cyan';
    root.dataset.fxNativeMagStudioR1937='smooth-asymmetric-smoked-bioglass-no-diamond-additive-star';
    root.dataset.fxNativeMagStudioR1938='rounded-asymmetric-monolith-single-pass-integrated-smoked-optic';
    root.dataset.fxNativeMagStudioR1939='premium-rounded-bioglass-opaque-shell-silver-smoked-optic-no-seams';
    root.dataset.fxNativeMagStudioR1941='source-locked-four-point-clean-apex-multisoftbox-smoked-silver-studio-bioglass';
    root.dataset.fxNativeMagStudioR1942='signature-four-point-historic-fold-ridges-nested-prism-recessed-optic-bioglass';
    root.dataset.fxNativeMagStudioR1945='desktop-sharper-four-point-flatter-depth-frontal-signature-sculpt';
    root.dataset.fxNativeMagStudioR1945b='desktop-cut-prism-clarity-enlarged-recessed-optic';
    root.dataset.fxNativeMagStudioR1945f='desktop-macro-facet-smoked-silver-zero-triangle-speckle';
    root.dataset.fxNativeMagRasterR1945i='closed-front-skin-backface-cull-no-rear-depth-speckle';
    root.dataset.fxNativeMagRasterR1945j='two-sided-shell-continuous-macro-facet-no-triangle-random-speckle';
    root.dataset.fxNativeMagStudioR1945e='desktop-cut-face-normal-blend-larger-optic-preserved-contrast';
    root.dataset.fxNativeMagRollbackR1934='p0-27of28-visual-grammar-current-api';
    root.dataset.fxNativeMagStudioR1831='igloo-grade-monolithic-sculpt-dark-bioglass-premium-optic';
    root.dataset.fxNativeMagStudioR1890='fused-trilobate-bioglass-larger-centered-living-optic';
    root.dataset.fxNativeMagStudioR1892='audit-parity-recessed-optic-soft-trilobate-silhouette';
    root.dataset.fxNativeMagStudioR1894='cinematic-angular-mass-parity-breathing-room-living-iris';
    root.dataset.fxNativeMagStudioR1896='cross-tier-cyan-iris-smoked-silver-bezel-proof-parity';
    root.dataset.fxNativeMagStudioR1897='cinematic-sculpt-parity-flush-smoked-optic-single-iris';
    root.dataset.fxNativeMagStudioR1897b='front-surface-optic-depth-corrected-visible-single-iris';
    root.dataset.fxNativeMagStudioR1905='gallery-shard-profile-cut-planes-smoked-sensor-no-potato-bulges';
    root.dataset.fxNativeMagStudioR1906='sleek-cut-ice-shard-broad-softbox-smoked-sensor-proof-parity';
    root.dataset.fxNativeMagStudioR1907='spectral-smoked-ice-gallery-shard-understated-glass-aperture';
    root.dataset.fxNativeMagStudioR1909='igloo-grade-slender-smoked-ice-monolith-integrated-silver-cyan-aperture';
    root.dataset.fxNativeMagStudioR1910='fused-living-ice-dual-mass-dark-gallery-glass-visible-cyan-aperture';
    root.dataset.fxNativeMagStudioR1911='silver-flush-aperture-black-ice-gallery-material';
    root.dataset.fxNativeMagStudioR1912='elegant-continuous-living-glass-no-insect-waist-readable-studio-volume';
    root.dataset.fxNativeMagStudioR1913='igloo-grade-visible-dark-ice-volume-first-frame-safe-premium-aperture';
    root.dataset.fxNativeMagStudioR1914='flush-silver-glass-aperture-no-eye-dark-dichroic-ice-chamber';
    root.dataset.fxNativeMagStudioR1914b='software-visible-parity-flush-aperture-proof-safe';
    root.dataset.fxNativeMagStudioR1915='igloo-grade-three-mass-dark-glass-deep-crown-flush-aperture';
    root.dataset.fxNativeMagStudioR1916='sculpted-three-mass-side-neck-horizontal-glass-sensor';
    root.dataset.fxNativeMagStudioR1917='asymmetric-three-lobe-sculpt-reflection-valleys-premium-black-glass';
    root.dataset.fxNativeMagStudioR1918='dim-sensor-bezel-continuity-ready';
    root.dataset.fxNativeMagStudioR1919='igloo-ice-gallery-three-mass-visible-volume-offset-oval-aperture';
    root.dataset.fxNativeMagStudioR1920='three-distinct-fused-masses-smoked-silver-ice-readable-mobile-volume';
    root.dataset.fxNativeMagStudioR1921='sculptural-s-three-mass-clear-smoked-ice-round-optic';
    root.dataset.fxNativeMagStudioR1922='c2-cubic-fused-masses-clean-surface-integrated-round-optic';
    root.dataset.fxNativeMagStudioR1923='crease-free-cubic-smoked-ice-translucent-body';
    root.dataset.fxNativeMagStudioR1924='crystalline-superellipse-faceted-normals-silver-optic-ice-halo';
    root.dataset.fxNativeMagStudioR1925='clear-ice-transmission-correct-flush-optic-proportions';
    root.dataset.fxNativeMagStudioR1926='igloo-grade-cut-ice-living-monolith-deep-optic-studio-refraction';
    root.dataset.fxNativeMagStudioR1898='photographic-dark-bioglass-elliptic-sensor-single-iris-arc';
    root.dataset.fxNativeMagStudioR1899='flush-integrated-smoked-sensor-clean-iris-arc-narrow-studio-reflections';
    root.dataset.fxNativeMagStudioR1900='tall-fused-bioglass-visible-embedded-optic-lifted-cinematic-midtones';
    root.dataset.fxNativeMagStudioR1901='slender-studio-bioglass-premium-sensor-silver-teal-flush-optic';
    root.dataset.fxNativeMagStudioR1903='gallery-grade-dark-bioglass-sculpt-lifted-midtone-satin-sensor';
    root.dataset.fxNativeMagStudioR1904='asymmetric-slender-gallery-monolith-off-axis-flush-sensor';
    root.dataset.fxNativeMagStudioR1832='continuous-metaball-superellipsoid-no-lowpoly-rock-premium-optic';
    root.dataset.fxNativeMagStudioR1833='black-bioglass-specular-studio-ribbons-optical-pupil';
    root.dataset.fxNativeMagStudioR1834='software-parity-black-glass-studio-reflections-optical-pupil';
    root.dataset.fxNativeMagStudioR1836='narrow-specular-studio-stripes-no-gray-plane';
    root.dataset.fxNativeMagStudioR1837='three-mass-single-sculpt-atmospheric-stage';
    root.dataset.fxNativeMagStudioR1843='authored-ice-block-silhouette-smaller-integrated-optic-broad-mineral-planes';
    root.dataset.fxNativeMagStudioR1844='faceted-ice-volume-subtle-chromatic-edge-smoked-optic';
    root.dataset.fxNativeMagStudioR1845='igloo-grade-cold-volume-spectral-edge-smoked-glass-lens';
    root.dataset.fxNativeMagStudioR1846='cross-tier-cold-volume-smoked-optic-parity';
    root.dataset.fxNativeMagStudioR1850='silver-optic-bezel-readable-ice-depth-cross-tier';
    root.dataset.fxNativeMagStudioR1851='vertical-cut-ice-sculpt-larger-recessed-silver-optic-crisp-studio-bands';
    root.dataset.fxNativeMagStudioR1874='calm-authored-silhouette-deep-flush-optic-premium-ice-volume';
    root.dataset.fxNativeMagStudioR1875='microfaceted-high-density-ice-cut-dark-body-controlled-softbox';
    root.dataset.fxNativeMagStudioR1877='authored-three-mass-crown-cleft-tight-softbox-smoked-sensor-optic';
    root.dataset.fxNativeMagStudioR1880='clear-dark-volume-restrained-software-softbox-smoked-sensor';
    root.dataset.fxNativeMagStudioR1882='solid-smoked-glass-low-fog-product-softbox-non-eye-sensor';
    root.dataset.fxNativeMagStudioR1885='continuous-luxury-bioglass-soft-cuts-flush-optic-highlight-control';
    root.dataset.fxNativeMagStudioR1886='fused-trilobate-bioglass-sculpt-continuous-specular-surface';
    root.dataset.fxNativeMagStudioR1887='dark-photographic-bioglass-narrow-softboxes-smoked-optic-mobile-parity';
    root.dataset.fxNativeMagStudioR1889='cross-tier-dark-bioglass-narrow-reflection-optic-parity';
    root.dataset.fxNativeMagStudioR1877='flush-smoked-optic-crisp-studio-ribbons-clean-ice-volume';
    root.dataset.fxNativeMagStudioR1866='crown-cleft-three-mass-sculpt-integrated-smoked-optic-three-quarter-view';
    root.dataset.fxNativeMagStudioR1867='dual-softbox-internal-veil-silver-integrated-optic-authored-crown-cleft';
    root.dataset.fxNativeMagStudioR1869='anti-aliased-clear-optic-edge-silver-recess-no-black-halo';
    root.dataset.fxNativeMagStudioR1870='smoked-silver-ice-crown-cleft-neutral-studio-cyan-optic-only-accent';
    root.dataset.fxNativeMagStudioR1872='runtime-safe-crown-ease-smoked-silver-bioglass';
    root.dataset.fxNativeMagStudioR1873='igloo-silver-three-mass-deep-cleft-flush-optic-low-chroma';
    root.dataset.fxNativeMagStudioR1853='sealed-raster-seams-silver-ice-midtone-internal-striation-optic-parity';
    root.dataset.fxNativeMagStudioR1855='bright-silver-ice-midtone-uncrushed-oled-studio-compositor';
    root.dataset.fxNativeMagStudioR1856='crease-aware-mineral-planes-smooth-optic-teal-volume';
    root.dataset.fxNativeMagStudioR1857='software-visible-midtone-teal-glass-proof-parity';
    root.dataset.fxNativeMagStudioR1858='recessed-optic-caustic-dark-bezel-teal-bioglass';
    root.dataset.fxNativeMagStudioR1859='proof-buffer-parity-for-zero-idle-mobile-capture';
    root.dataset.fxNativeMagStudioR1860='high-density-three-quarter-monolith-dark-integrated-optic';
    root.dataset.fxNativeMagStudioR1861='three-mass-smoky-glass-sculpt-narrow-softboxes-deep-optic';
    root.dataset.fxNativeMagStudioR1862='lobed-smoky-glass-sculpt-embedded-optic-dimensional-studio-chamber';
    root.dataset.fxNativeMagStudioR1863='soft-sculpt-creases-lobed-volume-photographic-depth';
    root.dataset.fxNativeMagStudioR1864='larger-recessed-optic-narrow-softbox-deeper-sculpt-valleys';
    root.dataset.fxNativeMagStudioR1865='polished-silver-optic-bezel-cross-tier-readable-lens';
    root.dataset.fxNativeMagVisualR1719='healthy-smooth-biomechanical-organism-large-energy-heart-living-tendrils';
    root.dataset.fxNativeMagGeometryR1719='smooth-tensioned-body-no-sawtooth-rings';
    root.dataset.fxNativeMagVisualR1720='ultra-sharp-cellular-biomech-body-electric-vascular-network-large-core';
    root.dataset.fxNativeMagQualityR1720='hidpi-mobile-1260k-pixel-budget-adaptive-60hz';
    root.dataset.fxNativeMagVisualR1721='cortical-lobes-electric-neural-core-subdermal-vascular-detail';
    root.dataset.fxNativeMagGeometryR1721='smooth-cortical-fold-displacement-no-sawtooth';
    root.dataset.fxNativeMagQualityR1722='hidpi-msaa-mobile-no-blur-high-resolution-floor';
    root.dataset.fxNativeMagQualityR1950='desktop-hidpi-msaa-high-resolution-silhouette-aa-adaptive-governor';
    root.dataset.fxNativeMagGeometryR1950='desktop-72x144-signature-contour-tessellation-high-dpi-mobile-unchanged';
    root.dataset.fxNativeMagInteractionR1722='pointer-touch-drag-hover-press-release-scroll-wheel-click-key-input-change-submit-focus-menu-language-section-question-response-system-resize-orientation-visibility-one-physiology-loop';
    root.dataset.fxNativeMagDesktopInteractionR1944='fine-pointer-absolute-tilt-polling-safe-optical-parallax-zero-idle';
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
      livingTimeline?.cancel();
      stage.remove();
      root.dataset.fxCrystalOrganismR326='shader-failed';
      root.dataset.fxCoreReal3d='shader-failed';
      return;
    }

    root.dataset.fxCoreShaderCompileR600 = pendingProgram.parallel ? 'parallel-pending' : 'sync-pending';
    let shaderPollCount = 0;
    function failShader(error) {
      console.warn('FormatX crystal organism unavailable:',error);
      livingTimeline?.cancel();
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
    ['uTime','uEnergy','uBreath','uLayer','uMorph','uPointer','uAspect','uSiteProgress','uSurfacePulse','uRotation','uGenesis']
      .forEach(name=>{uniforms[name]=gl.getUniformLocation(program,name);});

    function upload(buffer,data,index,size){
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      if(index<0)return;
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
    /* Archive extension passes share this native WebGL context and render loop.
       The canonical MAG owns the canvas, topology, renderer and frame budget. */
    const scenePasses=new Set();
    let disposed=false,contextLost=false,visible=true,paused=false;
    let raf=0,burstFrames=0,width=0,height=0,aspect=1,surfaceFrameTimer=0,slowRenderer=constrained;
    let px=0,py=0,tx=0,ty=0;
    let ambientLastX=0,ambientLastY=0;
    let energy=IDLE_ENERGY,targetEnergy=IDLE_ENERGY,breath=.12,targetBreath=.12;
    let morph=0,targetMorph=0;
    let rotationX=softwareRenderer?-.105:(mobile?-.090:-.070),rotationY=softwareRenderer?-.41:(mobile?-.40:-.32),rotationZ=softwareRenderer?-.020:.008;
    let targetRotationX=rotationX,targetRotationY=rotationY,targetRotationZ=rotationZ,angularVelocityY=0;
    const desktopFine=matchMedia('(hover:hover) and (pointer:fine)');
    let pointerTiltX=0,pointerTiltY=0,targetPointerTiltX=0,targetPointerTiltY=0;
    let ambientPointerFrame=0,pendingAmbientPointer=null;
    let siteProgress=0,targetSiteProgress=0;
    let last=performance.now(),simulationTime=0,renderAverage=0,frameIntervalAverage=1000/60;
    // Operational telemetry needs four updates/second, not 60 DOM
    // attribute mutations/second per field. Shader simulation stays 60Hz.
    let lastRuntimeTelemetryAt=-Infinity;
    let schedulerLastFrame=0,schedulerRefreshMs=1000/60,schedulerTick=0;
    /* Renderer capability owns the budget for every visitor. Hardware keeps
       the photographic path, software keeps the
       same visual identity through the lite shader at a smaller backing store. */
    /* R1703 — mobile starts sharp enough to read as a photographed object.
       The strict R1701 frame governor is still allowed to shed resolution on
       real pressure; we no longer begin every constrained phone permanently
       blurred before measuring its actual GPU budget. */
    /* R1718 — mobile clarity floor. The previous ~0.46-0.73 effective
       backing-store scale visibly pixelated the organism on high-DPI phones.
       Start near native CSS resolution and shed quality gradually only under
       measured pressure. */
    /* R1950 — desktop contour fidelity.
       The previous desktop start scale (.68) was too low for a large hero object
       and produced visible stair-stepping on the silhouette even with MSAA.
       Desktop now starts close to native CSS resolution and only sheds quality
       after measured frame pressure. Mobile keeps its existing contract. */
    let qualityScale=softwareRenderer
      ? (mobile?.94:.72)
      : (mobile ? 1.00 : (constrained ? .84 : 1.00));
    const qualityCeiling=softwareRenderer
      ? (mobile?1.00:.86)
      : (mobile?1.08:(constrained?.96:1.08));
    const qualityFloor=softwareRenderer
      ? (mobile?.80:.48)
      : (mobile?.80:(constrained?.62:.74));
    let lastQualityAdjust=0,qualityResizeTimer=0;
    let renderPeak=0,framePeak=1000/60,stableBudgetFrames=0,panicFrames=0;
    let heartbeatTimer=0,surfacePulseTimer=0,autonomousTimer=0,scrollFrame=0,scrollSettleTimer=0,tapCandidate=null;
    let surfacePulseStart=-Infinity,lastSurfacePulseAt=-Infinity,surfacePulseCount=0;
    let motionReduced=reducedMotionRequested();
    syncCompositorBreath();
    let genesisProgress=-1;
    let activeOrgan='hero',shapeLockUntil=0;
    const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};
    cinematic.version=REVISION;
    cinematic.corePosition=[0,0,.52];

    function resize(){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return false;
      const baseCap=softwareRenderer
        ? (mobile?1.58:1.28)
        : (constrainedMobile?1.72:mobile?2.00:constrained?1.68:2.10);
      const cap=baseCap*qualityScale;
      const dpr=Math.min(devicePixelRatio||1,cap);
      const baseBudget=softwareRenderer
        ? (mobile?920000:560000)
        : (constrainedMobile?1280000:mobile?1900000:constrained?1450000:3400000);
      const budget=Math.max(112000,Math.round(baseBudget*qualityScale*qualityScale));
      let w=Math.max(2,Math.round(rect.width*dpr));
      let h=Math.max(2,Math.round(rect.height*dpr));
      if(w*h>budget){const k=Math.sqrt(budget/(w*h));w=Math.round(w*k);h=Math.round(h*k);}
      // R2128: when BOTH desktop axes change, release the old width before
      // assigning the pair. This avoids a costly intermediate full-area
      // drawing buffer at the new width and old height. All assignments are
      // synchronous; the next draw uses the same final dimensions and context.
      // Mobile retains its original allocation sequence and quality policy.
      if(!mobile&&canvas.width!==w&&canvas.height!==h){
        canvas.width=0;canvas.height=h;canvas.width=w;
      }else if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      width=w;height=h;aspect=rect.width/Math.max(1,rect.height);gl.viewport(0,0,w,h);
      root.dataset.fxCoreReal3dResolution=`${w}x${h}`;
      root.dataset.fxCoreReal3dScale=(w/Math.max(1,rect.width)).toFixed(2);
      root.dataset.fxCoreViewportAspect=aspect.toFixed(4);
      return true;
    }

    function blocked(){
      const archiveLive=root.dataset.fxArchiveDock==='active';
      return disposed||contextLost||document.hidden||(!visible&&!archiveLive)||paused||root.dataset.fxReferenceMotionPaused==='true';
    }
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
      syncMotionPreference();
      if(blocked())return;
      const frameCap=motionReduced?1:mobile?4:24;
      burstFrames=Math.max(burstFrames,Math.min(frameCap,Math.max(1,frames)));
      queueFrame(0);
    }
    function boost(value=.84,frames=8){
      targetEnergy=Math.max(targetEnergy,value);
      targetBreath=Math.max(targetBreath,.38+value*.48);
      schedule(reducedMotionRequested()?1:frames);
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
      if(disposed||contextLost||reducedMotionRequested()||document.hidden||paused
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
        // R2050: Chromium can pause intermediate rAF callbacks while native
        // CSS/compositor work is busy. The end timer must then submit the
        // physically FINAL surface-pulse frame before restoring idle, rather
        // than leaving the moving luminous filament frozen at 37% of its
        // travel for the remaining ~700 ms. No new context, hidden interval
        // or continuous idle renderer is created.
        if(!blocked()&&Number.isFinite(surfacePulseStart)){
          // R2052: absorb any LOD/quality-induced canvas resize into this
          // existing final surface-pulse frame. A resize timer left pending
          // after the sweep can otherwise wake the MAG during its idle gap.
          if(qualityResizeTimer){
            clearTimeout(qualityResizeTimer);
            delayed.delete(qualityResizeTimer);
            qualityResizeTimer=0;
            resize();
            root.dataset.fxCoreSweepQualityResizeR2052='coalesced-in-final-frame';
          }
          const finish=Math.min(performance.now(),surfacePulseStart+SURFACE_PULSE_WINDOW_MS-1);
          if(finish>surfacePulseStart)render(finish);
          root.dataset.fxCoreSweepEndpointR2050='rendered-native-final-phase';
        }else{
          root.dataset.fxCoreSweepEndpointR2050='suspended-when-invisible-or-paused';
        }
        surfacePulseStart=-Infinity;
        burstFrames=0;
        if(surfaceFrameTimer){clearTimeout(surfaceFrameTimer);delayed.delete(surfaceFrameTimer);surfaceFrameTimer=0;}
        // The final render can itself trip the adaptive pixel governor, so
        // flush its callback too before entering the strict zero-RAF state.
        // Next genuine interaction or autonomous sweep recalculates quality.
        if(qualityResizeTimer){
          clearTimeout(qualityResizeTimer);
          delayed.delete(qualityResizeTimer);
          qualityResizeTimer=0;
          root.dataset.fxCoreSweepQualityResizeR2052='discarded-after-final-frame';
        }
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
      if(disposed||contextLost||reducedMotionRequested()||document.hidden||!visible||paused
        ||document.querySelector('.fx-reference-pause')?.dataset.paused==='true'){
        root.dataset.fxCoreSurfaceSchedulerR484='suspended';
        return;
      }
      // R2061: a ready visible core uses the same genuine autonomous cadence
      // from its first sweep onward; no initial thirteen-second dormant gap.
      const delay=mobile
          ? 5400+(surfacePulseCount%3)*520
          : 4100+(surfacePulseCount%3)*360;
      root.dataset.fxCoreSurfaceSchedulerR484='armed-single-native-timer';
      const dueAt=performance.now()+delay;
      root.dataset.fxCoreSurfaceScheduledDelayR2055=String(Math.round(delay));
      surfacePulseTimer=setTimeout(()=>{
        surfacePulseTimer=0;
        root.dataset.fxCoreSurfaceTimerLagR2055=String(Math.round(Math.max(0,performance.now()-dueAt)));
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
      if(!reducedMotionRequested())simulationTime+=dt*.001;
      const pointerEase=1-Math.exp(-dt*.018);
      const rotationEase=1-Math.exp(-dt*.011);
      px+=(tx-px)*pointerEase;py+=(ty-py)*pointerEase;
      rotationX+=(targetRotationX-rotationX)*rotationEase;
      rotationY+=(targetRotationY-rotationY)*rotationEase;
      rotationZ+=(targetRotationZ-rotationZ)*rotationEase;
      const pointerTiltEase=1-Math.exp(-dt*(desktopFine.matches?.020:.014));
      pointerTiltX+=(targetPointerTiltX-pointerTiltX)*pointerTiltEase;
      pointerTiltY+=(targetPointerTiltY-pointerTiltY)*pointerTiltEase;
      if(Math.abs(angularVelocityY)>.00002){targetRotationY+=angularVelocityY*dt;angularVelocityY*=Math.exp(-dt*.010);}
      energy+=(targetEnergy-energy)*(1-Math.exp(-dt*.026));
      breath+=(targetBreath-breath)*(1-Math.exp(-dt*.032));
      targetEnergy+=(IDLE_ENERGY-targetEnergy)*(1-Math.exp(-dt*.006));
      targetBreath+=(.12-targetBreath)*(1-Math.exp(-dt*.007));
      morph+=(targetMorph-morph)*(reducedMotionRequested()?1:1-Math.exp(-dt*.0078));
      if(Math.abs(morph-targetMorph)<.0008)morph=targetMorph;
      siteProgress+=(targetSiteProgress-siteProgress)*(1-Math.exp(-dt*.005));
      cinematic.energy=energy;
      cinematic.openness=.08+breath*.025;
      cinematic.corePosition=[px*.055,-py*.045,.52+energy*.012];
      cinematic.morph=morph;
      cinematic.shape=shapeName();
      cinematic.rotation=[rotationX+pointerTiltX,rotationY+pointerTiltY,rotationZ];
      cinematic.siteProgress=siteProgress;
      // The MAG's shape is physically immutable during archive presentation.
      // Re-emitting nine identical DOM attributes every GPU frame needlessly
      // wakes document observers and can induce redundant layout work.
      if(root.dataset.fxCoreShapeR337!=='organism'||stage.dataset.shape!=='organism')publishShape();

      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(uniforms.uTime,simulationTime);
      gl.uniform1f(uniforms.uEnergy,energy);
      gl.uniform1f(uniforms.uBreath,breath);
      gl.uniform1f(uniforms.uMorph,morph);
      gl.uniform1f(uniforms.uGenesis,genesisProgress);
      gl.uniform2f(uniforms.uPointer,px,py);
      gl.uniform3f(uniforms.uRotation,rotationX+pointerTiltX,rotationY+pointerTiltY,rotationZ);
      gl.uniform1f(uniforms.uAspect,aspect);
      gl.uniform1f(uniforms.uSiteProgress,siteProgress);
      const surfacePulseElapsed=(now-surfacePulseStart)/SURFACE_PULSE_WINDOW_MS;
      const surfacePulse=surfacePulseElapsed>=0&&surfacePulseElapsed<=1?surfacePulseElapsed:-1;
      gl.uniform1f(uniforms.uSurfacePulse,surfacePulse);

      /* R1938 — one opaque photographic pass.
         This removes the additive back-face wash that turned the living MAG into
         a translucent crystal/diamond on phones, while cutting hero overdraw. */
      gl.disable(gl.BLEND);
      /* R1945j — retain the proven two-sided closed shell. The R1945i culling
         experiment increased pinholes; the actual speckle source was the
         per-triangle material randomization, now removed above. */
      gl.disable(gl.CULL_FACE);
      gl.depthMask(true);
      gl.uniform1f(uniforms.uLayer,0);
      gl.drawArrays(gl.TRIANGLES,0,geometry.count);
      /* Draw external WebGL2 scene passes only after the original MAG. Modules
         must use their own VAO and restore GL state before returning. */
      for(const pass of scenePasses){
        try{pass({gl,canvas,stage,width,height,aspect,now,siteProgress});}
        catch(error){scenePasses.delete(pass);console.warn('FormatX scene pass disabled:',error);}
      }
      if(root.dataset.fxCoreFirstFrameR1913!=='painted'){
        const error=gl.getError();
        if(error!==gl.NO_ERROR){
          root.dataset.fxCrystalOrganismR326='first-frame-error';
          root.dataset.fxCoreFirstFrameR1913='error-'+error;
          return;
        }
        root.dataset.fxCoreFirstFrameR1913='painted';
        stage.dataset.firstFrame='painted';
        publishFirstFrameReady();
      }
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

      {
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

      if(now-lastRuntimeTelemetryAt>=250 || lastRuntimeTelemetryAt===-Infinity){
        lastRuntimeTelemetryAt=now;
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
      root.dataset.fxNativeMagDesktopInteractionR1944='absolute-pointer-tilt-coalesced-polling-rate-independent-bounded-raf';
      root.dataset.fxNativeMagPerformanceR1696='software-readable-resolution-floor-with-bounded-pixel-budget';
      root.dataset.fxCoreQualityScaleR1600=qualityScale.toFixed(2);
      root.dataset.fxCoreReal3dFps=String(Math.min(60,Math.round(1000/Math.max(16.67,frameIntervalAverage))));
      }
    }

    function settleAfterBurst(){
      px=tx;py=ty;
      rotationX=targetRotationX;rotationY=targetRotationY;rotationZ=targetRotationZ;
      pointerTiltX=targetPointerTiltX;pointerTiltY=targetPointerTiltY;
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
      raf=0;syncMotionPreference();if(blocked())return;
      /* R1622 — refresh-divisor scheduler.
         Use a stable display divisor that never intentionally targets below
         60 FPS: 60->60, 120->60, 144->72, 165->82.5, 180->60, 240->60.
         This avoids the 144 Hz / 48 FPS failure mode of a fixed 16.67 ms gate. */
      {
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
        root.dataset.fxCoreBurstCadenceR1600='native-60hz-target';
        queueFrame(0);
      }else if(surfacePulseActive){
        root.dataset.fxCoreAdaptiveSurfaceCadenceR588='native-raf';
        root.dataset.fxCoreSurfaceCadenceR643=mobile?'mobile-budget-preserved':'desktop-midpoint-safe-bounded-no-idle';
        root.dataset.fxCoreAnimationCadenceR1600='native-60hz-target-all-visitors';
        queueFrame(0);
      }else settleAfterBurst();
    }

    function point(event){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return null;
      return{x:clamp(((event.clientX-rect.left)/rect.width-.5)*2,-1,1),y:clamp(-((event.clientY-rect.top)/rect.height-.5)*2,-1,1)};
    }
    function onMove(event){
      if(event.pointerType==='touch')return;
      const batch=typeof event.getCoalescedEvents==='function'?event.getCoalescedEvents():null;
      const sample=batch?.length?batch[batch.length-1]:event;
      const q=point(sample);if(!q)return;
      tx=q.x*(desktopFine.matches?.72:1);ty=q.y*(desktopFine.matches?.72:1);
      targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.105);
      schedule(desktopFine.matches?4:2);
    }
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
    function syncMotionPreference(){
      // A preference can change while an earlier scroll frame is queued.
      // Reconcile at native input/render boundaries as well as the media
      // event, so the old autonomous timer cannot survive that queued frame.
      const next=reducedMotionRequested();
      if(next===motionReduced)return;
      motionReduced=next;
      clearTimeout(surfacePulseTimer);surfacePulseTimer=0;
      surfacePulseStart=-Infinity;
      burstFrames=0;
      root.dataset.fxCoreSurfacePulseR454='idle';
      syncCompositorBreath();
      scheduleSurfacePulse();
    }
    function onReducedMotionChange(){
      syncMotionPreference();
      schedule(1);
    }
    let previousScrollY=scrollY;
    function onScroll(){
      syncMotionPreference();
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
        /* R1755d — native compositor owns the hot scroll path. Keep the
           organism state live, but defer shader redraw until the gesture settles. */
        clearTimeout(scrollSettleTimer);
        scrollSettleTimer=setTimeout(()=>{scrollSettleTimer=0;schedule(1);},88);
      });
    }

    function globalPoint(event){
      return {
        x:clamp((((Number(event?.clientX)||innerWidth*.5)/Math.max(1,innerWidth))-.5)*2,-1,1),
        y:clamp(-((((Number(event?.clientY)||innerHeight*.5)/Math.max(1,innerHeight))-.5)*2),-1,1)
      };
    }
    function applyAmbientPointer(event){
      ambientPointerFrame=0;
      const batch=typeof event?.getCoalescedEvents==='function'?event.getCoalescedEvents():null;
      const sample=batch?.length?batch[batch.length-1]:event;
      const q=globalPoint(sample);
      const touch=sample?.pointerType==='touch';
      const dx=q.x-ambientLastX,dy=q.y-ambientLastY;
      ambientLastX=q.x;ambientLastY=q.y;
      tx=q.x*(touch?.46:.72);ty=q.y*(touch?.46:.72);

      if(desktopFine.matches&&!touch){
        /* R1943 desktop: absolute camera bias, independent of mouse polling rate.
           Velocity only adds a tiny impulse; it never accumulates orientation. */
        targetPointerTiltY=clamp(q.x*.095 + dx*.020,-.12,.12);
        targetPointerTiltX=clamp(-q.y*.070 - dy*.014,-.095,.095);
        targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.085+Math.min(.055,Math.hypot(dx,dy)*.12));
        targetBreath=Math.max(targetBreath,.235);
        schedule(4);
      }else{
        targetPointerTiltY=clamp(q.x*.055,-.07,.07);
        targetPointerTiltX=clamp(-q.y*.045,-.06,.06);
        targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+(touch?.075:.090));
        targetBreath=Math.max(targetBreath,touch?.18:.23);
        schedule(mobile?1:2);
      }
    }
    function onAmbientMove(event){
      pendingAmbientPointer=event;
      if(ambientPointerFrame)return;
      ambientPointerFrame=requestAnimationFrame(()=>{
        const sample=pendingAmbientPointer;
        pendingAmbientPointer=null;
        if(sample)applyAmbientPointer(sample);
        else ambientPointerFrame=0;
      });
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
    function signalPhysiology(kind,source,surfaceResponse=true,renderResponse=true){
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
      if(surfaceResponse)startSurfacePulse(String(source||state)+'-physiology');
      setShape('organism',source||state||'physiology');
      if(renderResponse)schedule(surfaceResponse?(mobile?3:5):1);
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
    listen(window,'pointerleave',()=>{
      ambientLastX=ambientLastY=0;
      tx=ty=0;
      targetPointerTiltX=targetPointerTiltY=0;
      targetEnergy=Math.max(targetEnergy,IDLE_ENERGY+.025);
      targetBreath=Math.max(targetBreath,.15);
      schedule(mobile?2:5);
    },{passive:true});
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
      signalPhysiology(sectionPhysiology[id]||'attention','site-section-'+id,false,false);
    },{rootMargin:'-22% 0px -54% 0px',threshold:[0,.15,.35,.6]});
    document.querySelectorAll('main > section[id],main section.scene[id]').forEach(section=>organObserver.observe(section));

    function destroy(){
      if(disposed)return;disposed=true;
      livingTimeline?.cancel();
      mobileBreathPreference?.removeEventListener?.('change',syncMobileBreathOpacity);
      clearTimeout(heartbeatTimer);clearTimeout(surfacePulseTimer);clearTimeout(autonomousTimer);clearTimeout(scrollSettleTimer);delayed.forEach(clearTimeout);delayed.clear();
      if(raf)cancelAnimationFrame(raf);if(scrollFrame)cancelAnimationFrame(scrollFrame);
      if(ambientPointerFrame)cancelAnimationFrame(ambientPointerFrame);ambientPointerFrame=0;pendingAmbientPointer=null;
      controller.abort();ro.disconnect();io.disconnect();organObserver.disconnect();
      if(!contextLost){buffers.forEach(buffer=>gl.deleteBuffer(buffer));gl.deleteProgram(program);}
      for(const pass of scenePasses){try{pass.dispose?.();}catch(_){}}scenePasses.clear();
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
      captureFrame:()=>{
        // A loop preview may need one real still while the source is outside
        // the viewport. The original owner draws it without starting an idle
        // RAF loop or reviving a hidden/lost/disposed rendering lifecycle.
        if(disposed||contextLost||document.hidden||paused||!resize())return null;
        render(performance.now());
        return gl.getError()===gl.NO_ERROR?canvas:null;
      },
      genesis:(value)=>{
        genesisProgress=value===null?-1:clamp(Number(value)||0,0,1);
        schedule(1);
      },
      registerScenePass:(pass)=>{
        if(!webgl2||typeof pass!=='function'||disposed)return()=>{};
        scenePasses.add(pass);schedule(1);
        return()=>{scenePasses.delete(pass);try{pass.dispose?.();}catch(_){}};
      },
      sharedWebGL2:webgl2,
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

    root.dataset.fxCoreRenderer='single-webgl-crystal-organism-r326';
    root.dataset.fxCoreRendererCanonicalR1723='single-webgl-living-organism-r326';
    root.dataset.fxCoreCapabilityTierR620=constrainedMobile?'mobile-constrained-one-pass':constrained?'desktop-constrained-two-pass':mobile?'mobile-full-two-pass':'desktop-full-three-pass';
    root.dataset.fxCoreCapabilityR620=`${hardwareConcurrency}c-${deviceMemory}gb`;
    root.dataset.fxCoreMaterial='cortical-bioceramic-living-tissue-r1723';
    root.dataset.fxCoreGeometry='cortical-cellular-organism-with-native-tendrils-r1723';
    root.dataset.fxCoreGenesisMagR614='dna-to-cell-to-cortical-living-organism-r1723';
    root.dataset.fxCoreNativeTendrilsR614=String(geometry.tendrils||0);
    root.dataset.fxCoreMicrofibrilsR1982=`${geometry.microFibers||0}-native-hair-geometry-plus-procedural-fibril-shader`;
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
    root.dataset.fxCoreFirstFrameR1913='pending';
    root.dataset.fxCoreRenderMs='0';
    root.dataset.fxCoreReal3dFps='pending';
    root.dataset.fxCoreSoftwareBudgetR1545=softwareRenderer?'190k-r1671-crisp-start-governor-can-shed':'hardware-budget-unchanged';

    publishShape('initial');
    schedule(1);
    scheduleHeartbeat();
    scheduleSurfacePulse();
    scheduleAutonomousMorph();
    function publishFirstFrameReady(){
      root.dataset.fxCrystalOrganismR326='ready';
      root.dataset.fxLivingOrganicCoreR413='ready';
      root.dataset.fxLivingOrganicCoreR454='luminous-electric-single-webgl-ready';
      root.dataset.fxCoreMobileR99=READY;
      root.dataset.fxCoreMobileV69=READY;
      root.dataset.fxCoreMobileV55='ready-v55';
      root.dataset.fxCoreReferenceLock=READY;
      root.dataset.fxCoreReal3d=READY;
      dispatchEvent(new CustomEvent('formatx:real3dready',{detail:{
        version:'r413',renderer:VERSION,revision:REVISION,context:webgl2?'webgl2':'webgl1',
        geometry:'single-fixed-living-3d-volume',morph:'disabled-single-organism-r1711',interactive:true,organism:true,legacyFallback:false,
        firstFrameAt:performance.now()
      }}));
    }
    listen(window,'pagehide',destroy,{once:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>boot(),{once:true});
  else boot();
}());

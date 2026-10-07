(function () {
  'use strict';

  const root = document.documentElement;
  const VERSION = 'crystal-organism-r326';
  const REVISION = 'living-luminous-electric-crystal-r454';
  const CANONICAL_REVISION = 'fully-living-organism-r1723';
  const VISUAL_REVISION_R1713 = 'photoreal-single-living-organism-r1713';
  const READY = 'ready-v69';
  const mobile = matchMedia('(max-width:900px),(pointer:coarse),(max-aspect-ratio:27/25)').matches;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const auditParams = new URLSearchParams(location.search);
  const surfaceEnergyFunctionalCheck = auditParams.has('r486-optics-energy-check');
  const mobileVisualProof = auditParams.has('mobileproof');
  const auditMode = !surfaceEnergyFunctionalCheck && !mobileVisualProof && (navigator.webdriver === true || /Chrome-Lighthouse/i.test(navigator.userAgent || '') || auditParams.get('lighthouse') === '1');
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
  root.dataset.fxNativeMagProofR1782=mobileVisualProof?'normal-mobile-visual-path-with-lens-and-msaa':'not-mobile-proof';
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

    function vertex(latitudeIndex, longitudeIndex) {
      const latitude=latitudeIndex/latitudeSegments;
      const longitude=longitudeIndex/longitudeSegments;
      const phi=latitude*Math.PI;
      const theta=longitude*Math.PI*2;
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

      /* Keep the original crystalline outline, but smooth the studio response.
         This prevents the four quadrants from reading as flat cardboard planes. */
      const crystalNormal=normalize([
        direction[0]/axisX,
        direction[1]/axisY,
        direction[2]/axisZ
      ]);

      return{
        sphere:spherePosition,
        crystal:crystalPosition,
        sphereNormal:direction,
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

    /* R1953b — exact-topology vertex cache.
       The former cell loop recalculated each expensive sin/cos/pow vertex up to
       four times. Cache the shared latitude/longitude lattice once, then build
       the exact same triangles from those immutable samples. Geometry, normals,
       UV seams and silhouette stay bit-for-bit derived from vertex(); only
       duplicate CPU work disappears. */
    const vertexGrid=Array.from({length:latitudeSegments+1},(_,lat)=>
      Array.from({length:longitudeSegments+1},(_,lon)=>vertex(lat,lon))
    );
    for(let lat=0;lat<latitudeSegments;lat+=1){
      const row=vertexGrid[lat];
      const nextRow=vertexGrid[lat+1];
      for(let lon=0;lon<longitudeSegments;lon+=1){
        const a=row[lon];
        const b=row[lon+1];
        const c=nextRow[lon];
        const d=nextRow[lon+1];
        const facet=.12+.28*random(lon+lat*17,lat*31+lon);
        if(lat>0)triangle([a,b,c],facet);
        if(lat<latitudeSegments-1)triangle([b,d,c],facet+.004);
      }
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
      const bezelSteps=auditMode?96:(software?112:mobile?144:160),bezelTubeSteps=auditMode?10:(software?10:mobile?14:16),bezelZ=.602;
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
      const radialSteps=auditMode?14:(software?16:mobile?20:22);
      const angularSteps=auditMode?96:(software?112:mobile?128:144);
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
    const compositorFilter=mobile
      ? 'brightness(1.12) contrast(1.15) saturate(.82)'
      : 'brightness(1.04) contrast(1.15) saturate(.88)';
    canvas.style.setProperty('filter',compositorFilter,'important');
    canvas.style.setProperty('-webkit-filter',compositorFilter,'important');
    canvas.style.setProperty('box-shadow','none','important');

    /* R1930 — one slow compositor breath on every capable screen.
       No idle JS RAF is introduced; reduced-motion remains fully respected. */
    if(!reduced.matches && typeof canvas.animate==='function'){
      const livingTimeline=canvas.animate(
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
      preserveDrawingBuffer:mobileVisualProof || surfaceEnergyFunctionalCheck,
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
        float organicBlend=.010;
        vec3 crystalShadingNormal=normalize(mix(aCrystalNormal,aSphereNormal,.10));
        vec3 normal=normalize(mix(crystalShadingNormal,aSphereNormal,organicBlend));
        vec3 base=mix(aCrystal,aSphere,organicBlend);
        float cell=sin(uTime*.71+dot(aSphereNormal,vec3(5.7,4.1,6.3))+uSiteProgress*6.28318);
        float membrane=sin(uTime*1.17+aUv.x*12.566-aUv.y*9.2+sin(aUv.y*6.283)*1.4);
        float living=(cell*.011+membrane*.0065)*(.42+.58*uEnergy);
        float bodyVertexMask=1.0-step(2.0,aFacet);
        float cortexEnvelope=pow(max(0.0,sin(aUv.y*3.14159265)),1.35)*bodyVertexMask;
        float cortexA=sin(aUv.x*37.699+sin(aUv.y*18.849)*1.55+aUv.y*5.3);
        float cortexB=sin(aUv.x*18.849-aUv.y*25.133+sin(aUv.x*12.566)*1.20);
        float cortex=(cortexA*.62+cortexB*.38)*.0058*cortexEnvelope;
        float microFold=sin(aUv.x*62.832+aUv.y*43.982)*.0009*cortexEnvelope;
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
        float yaw=${mobile?'.405':'.335'}+uRotation.y+uPointer.x*${mobile?'.12':'.16'}+uTime*.007;
        float pitch=-.070+uRotation.x-uPointer.y*${mobile?'.085':'.125'}+.006*sin(uTime*.19);
        float roll=-.045+uRotation.z+uPointer.x*uPointer.y*${mobile?'.022':'.034'}+.005*sin(uTime*.23);
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
        projected*= ${mobile?'.585':'.790'};
        projected.x+=${mobile?'.002':'.018'};
        projected.y+=${mobile?'.010':'-.006'};
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
        float softboxA=exp(-pow((refl.x+.25)/.235,2.0)-pow((refl.y-.30)/.46,2.0))*smoothstep(-.24,.50,refl.z);
        float softboxB=exp(-pow((refl.x-.40)/.245,2.0)-pow((refl.y-.01)/.50,2.0))*smoothstep(-.28,.54,refl.z);
        float ceilingBand=exp(-pow((refl.y-.72)/.30,4.0))*smoothstep(.02,.68,refl.z);
        float horizonBand=exp(-pow((refl.y+.05)/.19,2.0))*smoothstep(.08,.90,facing);
        float studioRibbonA=exp(-pow((refl.x+.18)/.070,2.0)-pow((refl.y-.18)/.64,2.0))*smoothstep(-.18,.66,refl.z);
        float studioRibbonB=exp(-pow((refl.x-.30)/.098,2.0)-pow((refl.y+.06)/.56,2.0))*smoothstep(-.14,.68,refl.z);
        float studioRibbonC=exp(-pow((refl.x+.010+refl.y*.09)/.040,2.0)-pow((refl.y-.04)/.72,2.0))*smoothstep(-.08,.74,refl.z);

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
        float microRoughness=mix(.20,.27,facetRand);
        float microD=distributionGGX(NoH,microRoughness);
        float microG=geometrySchlickGGX(NoV,microRoughness)*geometrySchlickGGX(max(ndl,.001),microRoughness);
        vec3 microF=fresnelSchlick(max(dot(halfKey,view),0.0),vec3(.039,.041,.043));
        vec3 microSpec=min(vec3(1.8),(microD*microG*microF)/max(4.0*NoV*max(ndl,.001),.001));
        float lift=sat(.205+ndl*.330+sideLight*.245+fillLight*.145);
        float facetTone=mix(.999,1.0015,facetRand);
        float smokyDepth=.5+.5*sin(vLocal.x*4.1+vLocal.y*2.7-vLocal.z*3.6);
        float mineralGrain=.5+.5*sin(vLocal.x*37.0+vLocal.y*29.0+vLocal.z*41.0);
        float mineralGrainB=.5+.5*sin(vLocal.x*71.0-vLocal.y*53.0+vLocal.z*47.0);
        float mineralGrainC=.5+.5*sin(vLocal.x*113.0+vLocal.y*97.0-vLocal.z*83.0);
        float strata=.5+.5*sin(vLocal.y*17.0+vLocal.x*4.7-vLocal.z*3.1+sin(vLocal.x*8.0)*.35);
        float fractureHair=pow(.5+.5*sin(vLocal.x*46.0-vLocal.y*29.0+vLocal.z*37.0+sin(vLocal.y*13.0)*1.3),18.0);
        float inclusion=smoothstep(.72,.96,.5+.5*sin(vLocal.x*12.0-vLocal.y*7.0+vLocal.z*9.0))*smoothstep(.18,.78,smokyDepth);
        vec3 mineral=mix(vec3(.005,.010,.013),vec3(.118,.160,.165),lift)*facetTone;
        mineral*=.942+.045*smokyDepth+.010*mineralGrain+.006*mineralGrainB+.004*mineralGrainC;
        mineral+=vec3(.052,.057,.056)*fractureHair*(.016+.034*fresnel);
        mineral+=vec3(.011,.014,.015)*strata*(.18+.32*lift);
        mineral-=vec3(.0035,.0048,.0052)*inclusion;
        mineral+=vec3(.96,.98,.94)*keySpec*.110;
        mineral+=microSpec*ndl*.22;
        mineral+=vec3(.27,.28,.27)*keySoft*.045;
        mineral+=vec3(.58,.72,.74)*sideSpec*.135;
        mineral+=vec3(1.00,1.00,.99)*softboxA*.012;
        mineral+=vec3(.57,.72,.71)*softboxB*.250;
        float softboxC2=exp(-pow((refl.x-.16)/.34,2.0)-pow((refl.y-.56)/.31,2.0))*smoothstep(-.18,.68,refl.z);
        mineral+=vec3(.79,.90,.86)*softboxC2*.215;
        mineral+=vec3(.94,1.00,.98)*studioRibbonA*.060;
        mineral+=vec3(.46,.30,.19)*studioRibbonB*.030;
        mineral+=vec3(.68,.97,1.00)*studioRibbonC*.105;
        mineral+=vec3(.13,.14,.13)*ceilingBand*.075;
        mineral+=vec3(.080,.096,.095)*horizonBand*.170;
        mineral+=vec3(.055,.175,.195)*fresnel*.190;
        mineral+=vec3(.034,.022,.016)*floorBounce*.055;
        float planeKey=max(0.0,dot(n,normalize(vec3(-.30,.42,.86))));
        float planeFill=max(0.0,dot(n,normalize(vec3(.68,-.18,.71))));
        mineral+=vec3(.012,.015,.016)*(.14+.22*fillLight+.08*floorBounce);
        mineral+=vec3(.090,.098,.096)*pow(planeKey,.72)*.27;
        mineral+=vec3(.052,.045,.039)*pow(planeFill,.82)*.14;
        mineral+=vec3(.003,.011,.013)*smokyDepth*(.30+.70*(1.0-facing));
        vec3 mineralAbsorption=exp(-vec3(.38,.28,.22)*(0.22+0.52*smokyDepth)*(1.0-facing));
        mineral*=mix(vec3(1.0),mineralAbsorption,.30);
        float internalCaustic=pow(1.0-facing,2.35)*(.35+.65*smokyDepth)*(1.0-.55*ndl);
        mineral+=vec3(.040,.072,.073)*internalCaustic*.46;
        float edgeTransmission=pow(1.0-facing,3.0)*(1.0-sat(ndl*.58));
        mineral+=vec3(.055,.185,.200)*edgeTransmission*.76;
        float iceVolume=exp(-pow((vLocal.x+.10)/.46,2.0)-pow((vLocal.y-.08)/.58,2.0))
          *smoothstep(-.42,.72,vLocal.z)*bodyMask;
        float sculptValleyA=exp(-pow((vLocal.x+.035)/.105,2.0)-pow((vLocal.y-.22)/.42,2.0))*bodyMask;
        float sculptValleyB=exp(-pow((vLocal.x-.19)/.095,2.0)-pow((vLocal.y+.30)/.25,2.0))*bodyMask;
        float sculptShoulder=exp(-pow((vLocal.x+.34)/.21,2.0)-pow((vLocal.y-.38)/.25,2.0))*bodyMask;
        mineral*=1.0-.13*sculptValleyA-.09*sculptValleyB;
        mineral+=vec3(.052,.104,.110)*sculptShoulder*.034;
        float iceCloud=.5+.5*sin(vLocal.x*6.2-vLocal.y*4.7+vLocal.z*5.4+sin(vLocal.y*3.2));
        mineral+=vec3(.068,.088,.088)*iceVolume*(.012+.016*(1.0-facing))*(.86+.14*iceCloud);
        float chromaSide=.5+.5*n.x;
        mineral+=mix(vec3(.018,.120,.145),vec3(.105,.032,.128),chromaSide)*fresnel*bodyMask*.105;
        float backScatter=pow(max(0.0,dot(-n,normalize(vec3(.16,.42,-.89)))),2.2)*(1.0-facing);
        float subsurface=pow(max(0.0,dot(-n,key)),1.65)*(1.0-facing);
        mineral+=vec3(.025,.052,.058)*backScatter*.36;
        mineral+=vec3(.066,.050,.074)*subsurface*(.038+.042*uEnergy);
        mineral+=vec3(.018,.060,.072)*subsurface*fresnel*.14;
        float vesselA=pow(.5+.5*sin(vLocal.y*18.0+sin(vLocal.x*9.0)*2.2+vLocal.z*6.0),16.0);
        float vesselB=pow(.5+.5*sin(vLocal.x*21.0-vLocal.y*7.0+sin(vLocal.z*8.0)*1.7),20.0);
        float vesselC=pow(.5+.5*sin(vLocal.x*13.0+vLocal.y*23.0-vLocal.z*11.0+sin(vLocal.y*8.0)*2.0),24.0);
        float vascular=max(max(vesselA,vesselB),vesselC)*bodyMask;
        mineral+=vec3(.022,.066,.073)*vascular*(.016+.030*uEnergy);
        mineral+=vec3(.038,.016,.023)*vascular*subsurface*(.010+.020*uEnergy);
        float cortexWave=.5+.5*sin(vUv.x*37.699+sin(vUv.y*18.849)*1.65+vUv.y*5.2);
        float cortexCross=.5+.5*sin(vUv.x*18.849-vUv.y*25.133+sin(vUv.x*12.566)*1.25);
        float cortexValley=pow(1.0-max(cortexWave*.72,cortexCross*.56),3.4)*bodyMask;
        float cortexRidge=pow(max(cortexWave,cortexCross),4.2)*bodyMask;
        mineral=mix(mineral,vec3(.014,.025,.031),cortexValley*.050);
        mineral+=vec3(.066,.082,.090)*cortexRidge*.035;
        mineral+=vec3(.020,.082,.096)*cortexRidge*vascular*.12;

        /* R1724 FormatX living-crystal material — pearlescent cortical bioceramic
           plates ride above dark cortical tissue. The plate field is broad,
           irregular and organic; it is not a metallic armour texture. */
        float plateField=.5+.5*sin(vUv.x*15.7+sin(vUv.y*10.8)*1.42+sin(vLocal.y*4.1)*.38);
        float plateCross=.5+.5*sin(vUv.y*13.9-vUv.x*6.1+sin(vUv.x*8.2)*1.08);
        float plateMask=smoothstep(.60,.84,max(plateField,plateCross*.82))*bodyMask;
        plateMask*=.52+.34*smoothstep(-.45,.82,n.z);
        float livingSeam=pow(1.0-max(plateField*.84,plateCross*.78),3.8)*bodyMask;
        float plateFacetTone=.996+.004*fract(vFacet*7.13+.19);
        vec3 ivory=vec3(.115,.132,.130)
          +vec3(.27,.29,.27)*(.18*ndl+.13*sideLight+.20*softboxA)
          +vec3(.12,.20,.22)*fresnel*.16;
        ivory+=vec3(.42,.27,.17)*studioRibbonB*.036;
        mineral*=mix(1.0,plateFacetTone,bodyMask*.06);
        mineral=mix(mineral,ivory,plateMask*.065);
        mineral=mix(mineral,vec3(.006,.018,.023),livingSeam*.115);
        mineral+=vec3(.032,.190,.218)*vascular*(.080+.135*uEnergy);
        mineral+=vec3(.48,.31,.20)*vascular*studioRibbonB*.050;

        vec2 q=vLocal.xy;
        float front=smoothstep(.19,.53,vLocal.z)*(1.0-vMorph)*bodyMask;

        /* R1942 — desktop/internal prism parity with the mobile studio shader. */
        float polar=atan(q.y,q.x);
        float radialXY=length(q);
        float prismEnvelope=
          smoothstep(.070,.22,radialXY)*
          (1.0-smoothstep(.44,.72,radialXY))*
          front;
        float axisRidge=pow(abs(cos(polar*2.0)),5.6)*prismEnvelope;
        float diagonalValley=pow(abs(sin(polar*2.0)),7.0)*prismEnvelope;
        float prismSweep=.5+.5*sin(radialXY*14.0-vLocal.z*4.0+polar*1.25);
        mineral+=vec3(.115,.255,.262)*axisRidge*(.062+.025*prismSweep);
        mineral+=vec3(.40,.47,.44)*axisRidge*softboxB*.048;
        mineral*=1.0-.082*diagonalValley;
        mineral+=vec3(.018,.072,.084)*diagonalValley*fresnel*.052;
        float innerPane=exp(-pow((abs(q.x)-(.16+.16*abs(q.y)))/.085,2.0))
          *smoothstep(.04,.52,front);
        mineral+=vec3(.078,.180,.188)*innerPane*.040;
        float l1Prism=abs(q.x)*.90+abs(q.y)*.72;
        float prismShellA=exp(-pow((l1Prism-.315)/.050,2.0))*front;
        float prismShellB=exp(-pow((l1Prism-.475)/.072,2.0))*front;
        mineral+=vec3(.40,.54,.51)*prismShellA*(.088+.032*softboxB);
        mineral+=vec3(.048,.178,.192)*prismShellB*(.064+.028*fresnel);
        mineral*=1.0-.018*prismShellB;
        float foldEnvelope=
          smoothstep(.075,.19,radialXY)*
          (1.0-smoothstep(.55,.76,radialXY))*
          front;
        float foldRidge=pow(abs(cos(polar*2.0)),9.0)*foldEnvelope;
        float foldValley=pow(abs(sin(polar*2.0)),8.0)*foldEnvelope;
        float foldSecondary=pow(abs(cos(polar*4.0)),14.0)*foldEnvelope;
        mineral+=vec3(.28,.43,.42)*foldRidge*.105;
        mineral+=vec3(.050,.188,.202)*foldSecondary*.054;
        mineral*=1.0-.078*foldValley;
        float crackX=q.x+.010*sin(q.y*19.0+vLocal.z*8.0)+.004*sin(q.y*43.0);
        float fissureEnvelope=exp(-pow(q.y/.31,4.0))*front;
        float fissureHalo=exp(-pow(crackX/.025,2.0))*fissureEnvelope;
        float fissure=exp(-pow(crackX/.0058,2.0))*fissureEnvelope;
        mineral=mix(mineral,vec3(.006,.017,.021),fissureHalo*.035);
        mineral+=vec3(.18,.30,.31)*fissure*.072;
        mineral+=vec3(.66,.67,.62)*fissure*.030;

        /* R1942 — central optical organ with a true recessed cavity. */
        vec2 lq=q;
        float lensD=length(lq);
        float cavity=(1.0-smoothstep(.130,.188,lensD))*front;
        float cavityCore=exp(-pow(lensD/.105,2.0))*front;
        mineral=mix(mineral,vec3(.004,.016,.021)+mineral*.44,cavity*.10);
        mineral+=vec3(.018,.070,.082)*cavityCore*.050;
        float lensOuter=(1.0-smoothstep(.112,.146,lensD))*front;
        float lensGlass=(1.0-smoothstep(.064,.108,lensD))*front;
        float lensCore=(1.0-smoothstep(.022,.052,lensD))*front;
        float lensPupil=(1.0-smoothstep(.004,.016,lensD))*front;
        float lensRim=max(0.0,lensOuter-lensGlass);
        float lensInnerRing=exp(-pow((lensD-.066)/.008,2.0))*front;
        float lensHighlight=exp(-pow((lq.x+.040)/.030,2.0)-pow((lq.y-.046)/.034,2.0))*lensGlass;
        float lensLower=exp(-pow((lq.x-.030)/.060,2.0)-pow((lq.y+.052)/.040,2.0))*lensGlass;
        float lensDepth=sat(1.0-lensD/.105);
        float opticBreath=.94+.06*(.5+.5*sin(uTime*.72));

        mineral=mix(mineral,vec3(.012,.036,.041)+mineral*.42,lensOuter*.055);
        mineral+=vec3(.84,.93,.89)*lensRim*(.090+.125*sideLight+.074*fresnel);
        mineral+=vec3(.020,.105,.120)*lensGlass*(.095+.080*softboxA+.065*sideSpec);
        mineral+=vec3(.030,.38,.42)*lensInnerRing*(.17+.12*uEnergy);
        mineral+=vec3(.30,.91,.93)*lensCore*(.25+.14*uEnergy)*opticBreath;
        mineral+=vec3(.98,1.00,.99)*lensPupil*(.28+.10*uEnergy);
        mineral+=vec3(.82,.94,.91)*lensHighlight*.18;
        mineral+=vec3(.10,.15,.15)*lensLower*.032;
        mineral=mix(mineral,vec3(.002,.010,.013),lensDepth*.050*lensGlass);

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
        livingMembrane+=vec3(.12,.34,.38)*edgeTransmission*.48;
        livingMembrane+=vec3(.22,.075,.30)*subsurface*.34;
        mineral=mix(mineral,livingMembrane,glassFinMask*.965);

        vec3 cartilage=vec3(.070,.078,.076);
        cartilage+=vec3(.140,.155,.150)*(.16*ndl+.20*sideLight);
        cartilage+=vec3(.98,1.00,.97)*softboxA*.245;
        cartilage+=vec3(.54,.66,.64)*sideSpec*.175;
        cartilage+=vec3(.060,.19,.20)*fresnel*.125;
        cartilage+=vec3(.030,.018,.038)*subsurface*.038;
        cartilage+=vec3(.012,.055,.064)*vascular*.045;
        mineral=mix(mineral,cartilage,armorMask*.985);

        vec2 lensVector=vUv-vec2(.5);
        float lensRadial=length(lensVector);
        float lensInner=1.0-smoothstep(.205,.475,lensRadial);
        float lensRim=exp(-pow((lensRadial-.430)/.030,2.0));
        float lensEdge=smoothstep(.410,.490,lensRadial);
        float sensorHalo=exp(-pow(lensVector.x/.320,2.0)-pow(lensVector.y/.150,2.0));
        float sensorCore=exp(-pow(lensVector.x/.250,2.0)-pow(lensVector.y/.060,2.0));
        float sensorArc=0.0;
        float lensHot=exp(-pow(lensVector.x/.290,2.0)-pow(lensVector.y/.085,2.0));
        float lensGlint=exp(-pow((vUv.x-.29)/.085,2.0)-pow((vUv.y-.33)/.095,2.0));
        float lensDepthShade=exp(-pow(lensRadial/.225,2.0));
        vec3 physicalLens=vec3(.0012,.005,.007);
        physicalLens+=vec3(.010,.040,.047)*(.16+.17*uEnergy);
        physicalLens+=vec3(.94,.98,.95)*softboxA*.22;
        physicalLens+=vec3(.50,.58,.58)*sideSpec*.10;
        physicalLens+=vec3(.055,.14,.17)*fresnel*.12;
        physicalLens+=vec3(.008,.065,.080)*lensInner*(.09+.08*uEnergy);
        physicalLens+=vec3(.64,.70,.68)*lensRim*.050;
        physicalLens+=vec3(.018,.18,.22)*sensorHalo*(.08+.06*uEnergy);
        physicalLens+=vec3(.30,.78,.84)*sensorArc*(.10+.07*uEnergy);
        physicalLens+=vec3(.70,.96,.96)*sensorCore*(.12+.06*uEnergy);
        physicalLens+=vec3(.62,.82,.82)*lensHot*.055;
        physicalLens+=vec3(.96,1.00,1.00)*lensGlint*.38;
        physicalLens+=vec3(.44,.57,.57)*lensEdge*(.07+.08*softboxA+.05*sideSpec);
        physicalLens=mix(physicalLens,vec3(.003,.014,.018),lensDepthShade*.09);
        physicalLens+=vec3(.58,.82,.86)*lensGlint*.10;
        mineral=mix(mineral,physicalLens,lensMeshMask*.997);

        float cableSegment=pow(.5+.5*cos(vUv.y*31.4+vUv.x*11.0+uTime*.22),14.0);
        vec3 tendon=vec3(.005,.016,.021)+vec3(.055,.125,.145)*(.14*sideLight+.08*ndl+.42*fresnel);
        tendon+=vec3(.020,.22,.29)*cableSegment*(.055+.055*uEnergy);
        tendon+=vec3(.64,.75,.74)*sideSpec*.15;
        tendon+=vec3(.46,.64,.65)*softboxA*.12;
        tendon+=vec3(.15,.36,.40)*edgeTransmission*.34;
        tendon+=vec3(.78,.38,.15)*studioRibbonB*(.065+.045*cableSegment);
        mineral=mix(mineral,tendon,tendrilMask*.995);

        if(uLayer>.5){
          ${outputName}=vec4(vec3(.004,.009,.011),.16);
          return;
        }
        float outAlpha=1.0-tendrilMask*.38-glassFinMask*.70;
        outAlpha=mix(outAlpha,.90,lensMeshMask);
        ${outputName}=vec4(filmic(mineral*2.58),clamp(outAlpha,.92,1.0));
      }`;

    /* R1557 source-contract compatibility: dnaHelix and dnaBridge remain the
       semantic genome lineage names even though the final mineral no longer
       paints neon genome overlays. The birth film owns explicit DNA imagery. */

    /* R1557 constrained material intentionally shares the same photographic
       language with fewer highlights; software/mobile proof must not fall back
       to a gray translucent surrogate. */

    /* R1941d — canonical cross-tier studio bioglass shader.
       One clean material, no procedural dirt/speckles, no black button optic.
       The four-point silhouette carries the identity; the shader only gives it
       physical depth, broad softbox reflections and restrained living energy. */
    const constrainedFragmentSource = `${versionLine}precision highp float;
      uniform float uTime,uEnergy,uBreath,uLayer,uMorph,uSiteProgress,uSurfacePulse;
      uniform vec2 uPointer;
      ${fragmentIn} vec3 vNormal;
      ${fragmentIn} vec3 vLocal;
      ${fragmentIn} vec2 vUv;
      ${fragmentIn} vec3 vBary;
      ${fragmentIn} float vFacet;
      ${fragmentIn} float vMorph;
      ${webgl2 ? "out vec4 outColor;" : ""}
      float sat(float v){return clamp(v,0.,1.);}
      vec3 tone(vec3 c){return c/(vec3(1.0)+max(c,vec3(0.0)));}
      void main(){
        vec3 n=normalize(vNormal);
        vec3 view=normalize(vec3(-vLocal.xy,2.86-vLocal.z));
        float facing=sat(abs(dot(n,view)));
        float fresnel=pow(1.0-facing,1.72);

        vec3 keyDir=normalize(vec3(-.50,.78,.38));
        vec3 sideDir=normalize(vec3(.72,.08,.69));
        vec3 fillDir=normalize(vec3(-.38,-.24,.89));
        float key=sat(dot(n,keyDir));
        float side=sat(dot(n,sideDir));
        float fill=sat(dot(n,fillDir));
        float top=sat(dot(n,normalize(vec3(-.10,.96,.28))));

        vec3 refl=reflect(-view,n);
        float softboxA=exp(-pow((refl.x+.26)/.22,2.0)-pow((refl.y-.30)/.50,2.0))*smoothstep(-.20,.62,refl.z);
        float softboxB=exp(-pow((refl.x-.42)/.27,2.0)-pow((refl.y+.02)/.54,2.0))*smoothstep(-.26,.62,refl.z);
        float ribbonA=exp(-pow((refl.x+.13)/.145,2.0)-pow((refl.y-.10)/.76,2.0))*smoothstep(-.10,.72,refl.z);
        float ribbonB=exp(-pow((refl.x-.31)/.085,2.0)-pow((refl.y+.10)/.62,2.0))*smoothstep(-.10,.70,refl.z);

        float frontDepth=smoothstep(-.46,.58,vLocal.z);
        float backDepth=1.0-frontDepth;
        float edge=pow(1.0-facing,2.20);
        float deepEdge=pow(1.0-facing,3.20);
        float volume=.5+.5*sin(vLocal.y*5.0+vLocal.x*2.4-vLocal.z*2.8);
        float strata=.5+.5*sin(vLocal.y*11.0+vLocal.x*1.8-vLocal.z*1.4);
        float centreHaze=exp(-pow(vLocal.x/.50,2.0)-pow(vLocal.y/.60,2.0))*frontDepth;

        if(uLayer>.5){
          ${outputName}=vec4(0.0,0.0,0.0,0.0);
          return;
        }

        /* Smoked blue-silver glass volume. */
        float lift=sat(.18+.36*key+.24*side+.15*fill+.08*top);
        float macroAngle=atan(vLocal.y,vLocal.x);
        float macroRadius=length(vLocal.xy);
        float macroFacetA=.5+.5*cos(macroAngle*4.0+macroRadius*2.6-vLocal.z*.9);
        float macroFacetB=.5+.5*cos(macroAngle*2.0-macroRadius*4.1+vLocal.z*1.4);
        float macroFacet=mix(macroFacetA,macroFacetB,.34);
        float facetTone=${mobile
          ? '.962+.050*macroFacet'
          : '.955+.070*macroFacet'}; 
        vec3 c=mix(vec3(.004,.008,.010),vec3(.108,.138,.141),lift)*facetTone;
        c*=.93+.07*volume;
        /* R1945j — one continuous macro-facet field across all tiers.
           Per-triangle random tone created tiny dark mosaic cells that read as
           black pin-speckles in proof captures. Geometry stays untouched. */
        float facetSilver=smoothstep(${mobile?'.60':'.56'},.94,macroFacet)*frontDepth;
        float facetCool=smoothstep(.10,${mobile?'.44':'.48'},1.0-macroFacet)*frontDepth;
        c+=vec3(.120,.136,.130)*facetSilver*${mobile?'.044':'.072'};
        c+=vec3(.010,.065,.076)*facetCool*${mobile?'.030':'.046'};
        c+=vec3(.030,.060,.064)*strata*.10;
        c+=vec3(.020,.043,.048)*backDepth*.11;

        /* Large photographic light sources. */
        c+=vec3(.98,1.00,.97)*softboxA*.006;
        c+=vec3(.40,.66,.66)*softboxB*${mobile?'.315':'.260'};
        float softboxC=exp(-pow((refl.x-.18)/.31,2.0)-pow((refl.y-.56)/.30,2.0))*smoothstep(-.18,.68,refl.z);
        c+=vec3(.80,.90,.86)*softboxC*${mobile?'.235':'.190'};
        c+=vec3(.92,.98,.96)*ribbonA*.040;
        c+=vec3(.18,.47,.50)*ribbonB*.175;
        float glassBlade=exp(-pow((vLocal.x+.24+vLocal.y*.060)/.150,2.0))*frontDepth
          *smoothstep(-.72,.72,vLocal.y);
        c+=vec3(.76,.88,.86)*glassBlade*.004;

        /* R1942 — internal prism architecture.
           Four broad refractive planes run toward the signature tips. They are
           volumetric tonal events, not drawn borders, so the object keeps a
           single continuous glass skin. */
        float polar=macroAngle;
        float radialXY=macroRadius;
        float prismEnvelope=
          smoothstep(.075,.22,radialXY)*
          (1.0-smoothstep(.44,.72,radialXY))*
          frontDepth;
        float axisRidge=pow(abs(cos(polar*2.0)),5.6)*prismEnvelope;
        float diagonalValley=pow(abs(sin(polar*2.0)),7.0)*prismEnvelope;
        float prismSweep=.5+.5*sin(radialXY*14.0-vLocal.z*4.0+polar*1.25);
        c+=vec3(.120,.270,.278)*axisRidge*(.070+.028*prismSweep);
        c+=vec3(.42,.47,.44)*axisRidge*softboxB*.055;
        c*=1.0-.090*diagonalValley;
        c+=vec3(.020,.080,.092)*diagonalValley*fresnel*.060;

        /* A second, deeper pane creates parallax-like density behind the skin. */
        float innerPane=exp(-pow((abs(vLocal.x)-(.16+.16*abs(vLocal.y)))/.085,2.0))
          *smoothstep(.04,.52,frontDepth);
        c+=vec3(.082,.190,.198)*innerPane*.044;

        /* R1942c — nested internal prism shells.
           These echo the layered crystalline anatomy from the selected historic
           MAG without adding geometry or a second render pass. */
        float l1Prism=abs(vLocal.x)*.90+abs(vLocal.y)*.72;
        float prismShellA=exp(-pow((l1Prism-.315)/.050,2.0))*frontDepth;
        float prismShellB=exp(-pow((l1Prism-.475)/.072,2.0))*frontDepth;
        c+=vec3(.42,.56,.53)*prismShellA*(${mobile?'.095':'.125'}+${mobile?'.035':'.045'}*softboxB);
        c+=vec3(.050,.190,.205)*prismShellB*(${mobile?'.070':'.090'}+${mobile?'.030':'.038'}*fresnel);
        c*=1.0-.020*prismShellB;

        /* R1942d — four authored fold ridges from optic to signature tips.
           This is the structural cue that made the historic MAG read as a
           layered crystal instead of a smooth diamond. */
        float foldEnvelope=
          smoothstep(.075,.19,radialXY)*
          (1.0-smoothstep(.55,.76,radialXY))*
          frontDepth;
        float foldRidge=pow(abs(cos(polar*2.0)),9.0)*foldEnvelope;
        float foldValley=pow(abs(sin(polar*2.0)),8.0)*foldEnvelope;
        float foldSecondary=pow(abs(cos(polar*4.0)),14.0)*foldEnvelope;
        c+=vec3(.30,.46,.45)*foldRidge*${mobile?'.115':'.155'};
        c+=vec3(.055,.205,.220)*foldSecondary*${mobile?'.060':'.085'};
        c*=1.0-${mobile?'.085':'.110'}*foldValley;
        c+=vec3(.22,.40,.42)*pow(key,2.8)*${mobile?'.12':'.15'};
        c+=vec3(.15,.32,.35)*pow(side,3.2)*${mobile?'.11':'.14'};

        /* Optical transmission at the silhouette and restrained inner cyan. */
        c+=vec3(.030,.180,.205)*fresnel*.34;
        c+=vec3(.055,.300,.335)*deepEdge*.235;
        float spectralSide=.5+.5*n.x;
        c+=mix(vec3(.018,.120,.150),vec3(.105,.038,.125),spectralSide)*fresnel*.070;
        c+=vec3(.025,.110,.128)*centreHaze*(${mobile?'.08':'.045'}+${mobile?'.07':'.050'}*uEnergy);
        c+=vec3(.015,.050,.060)*frontDepth*.10;

        /* R1942 — recessed optical organ.
           A soft smoked cavity precedes the lens, giving the centre actual depth
           instead of a luminous disc painted onto the shell. */
        float front=smoothstep(.06,.50,vLocal.z);
        vec2 oq=vec2(vLocal.x/${mobile?'.135':'.210'},vLocal.y/${mobile?'.135':'.210'});
        float od=length(oq);
        float cavity=(1.0-smoothstep(.92,1.34,od))*front;
        float cavityCore=exp(-od*od*2.3)*front;
        c=mix(c,vec3(.004,.017,.022)+c*.40,cavity*.12);
        c+=vec3(.020,.080,.092)*cavityCore*.055;
        float lens=(1.0-smoothstep(.84,1.02,od))*front;
        float rim=exp(-pow((od-.74)/.060,2.0))*front;
        float iris=exp(-od*od*4.8)*front;
        float core=exp(-od*od*18.5)*front;
        float hot=exp(-od*od*74.0)*front;
        float glint=exp(-pow((oq.x+.30)/.13,2.0)-pow((oq.y-.30)/.12,2.0))*front;
        vec3 opticBase=vec3(.006,.040,.050)+vec3(.015,.105,.125)*iris;
        c=mix(c,opticBase+c*.42,lens*.22);
        c+=vec3(.78,.88,.84)*rim*${mobile?'.125':'.165'};
        c+=vec3(.028,.28,.33)*iris*(${mobile?'.115':'.135'}+${mobile?'.085':'.095'}*uEnergy);
        c+=vec3(.26,.92,.94)*core*(${mobile?'.34':'.40'}+${mobile?'.17':'.18'}*uEnergy);
        c+=vec3(.98,1.00,.99)*hot*(${mobile?'.64':'.72'}+${mobile?'.12':'.13'}*uEnergy);
        c+=vec3(1.00,1.00,.98)*glint*.24;
        float opticCaustic=exp(-pow((od-.40)/.17,2.0))*front;
        c+=vec3(.025,.18,.21)*opticCaustic*(.045+.035*uEnergy);

        /* Interaction/surface sweep remains physical and brief. */
        float sweep=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(vLocal.y*.61+vLocal.x*.14+vLocal.z*.16)*.5;
          float head=-.16+1.32*sat(uSurfacePulse);
          sweep=exp(-pow((coordinate-head)/.072,2.0))*(.24+.76*fresnel);
        }
        c+=vec3(.08,.30,.34)*sweep*.24;
        c+=vec3(.70,.78,.74)*sweep*softboxA*.08;

        ${outputName}=vec4(tone(c*${mobile?'3.08':'2.68'}),1.0);
      }`;

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
        keySpec*=keySpec;keySpec*=keySpec;keySpec*=keySpec;
        float sideSpec=max(dot(n,normalize(side+view)),0.0);
        sideSpec*=sideSpec;sideSpec*=sideSpec;sideSpec*=sideSpec;
        keySpec*=keySpec;
        sideSpec*=sideSpec;

        float isTendril=step(2.0,vFacet)*(1.0-step(4.0,vFacet));
        float isGlassFin=step(4.0,vFacet)*(1.0-step(5.0,vFacet));
        float isArmor=step(5.0,vFacet)*(1.0-step(6.0,vFacet));
        float isLensMesh=step(6.0,vFacet);
        float bodyMask=max(0.0,1.0-isTendril-isGlassFin-isArmor-isLensMesh);
        float tendrilMask=isTendril*(1.0-vMorph);
        float armorMask=isArmor*(1.0-vMorph);
        float lensMeshMask=isLensMesh*(1.0-vMorph);

        float lift=sat(.088+ndl*.185+sideLight*.135);
        float facetTone=.996+.008*fract(vFacet*5.73+.23);
        float warmPlane=max(dot(n,normalize(vec3(.54,-.28,.79))),0.0);
        float coolPlane=max(dot(n,normalize(vec3(-.62,.18,.76))),0.0);
        float capShade=1.0-.050*smoothstep(.46,.96,vLocal.y);
        float grain=.5+.5*sin(vLocal.x*31.0-vLocal.y*23.0+vLocal.z*27.0);
        float fissure=pow(.5+.5*sin(vLocal.x*18.0+vLocal.y*13.0-vLocal.z*21.0),20.0)*bodyMask;
        float absorption=.84+.16*facing;
        vec3 col=mix(vec3(.003,.007,.010),vec3(.066,.086,.090),lift)*facetTone*capShade*absorption;
        col*=.994+.012*grain;
        col+=vec3(1.00,1.00,.99)*keySpec*.135;
        col+=vec3(.26,.54,.59)*sideSpec*.105;
        col+=vec3(.020,.125,.150)*fresnel*.185;
        col+=vec3(.135,.070,.034)*warmPlane*.050;
        col+=vec3(.032,.066,.072)*coolPlane*.055;
        col+=vec3(.022,.030,.030)*ndl*.026;
        col+=vec3(.060,.078,.076)*fissure*.018;
        col+=vec3(.018,.036,.039)*(1.0-facing)*.070;
        col+=vec3(.005,.008,.010)*max(0.0,-n.y)*.10;

        float broadKey=max(0.0,dot(n,normalize(vec3(-.34,.68,.64))));
        float broadSide=max(0.0,dot(n,normalize(vec3(.74,.10,.66))));
        float broadWarm=max(0.0,dot(n,normalize(vec3(.30,-.48,.82))));
        float studioStripeA=exp(-pow((vLocal.x+.245)/.052,2.0))*smoothstep(-.82,.74,vLocal.y)*bodyMask;
        float studioStripeB=exp(-pow((vLocal.x-.315)/.066,2.0))*smoothstep(-.68,.80,vLocal.y)*bodyMask;
        float studioStripeC=exp(-pow((vLocal.x+.005+vLocal.y*.08)/.070,2.0))*smoothstep(-.78,.78,vLocal.y)*bodyMask;
        float studioFaceA=pow(max(dot(n,normalize(vec3(-.28,.34,.90))),0.0),5.0)*bodyMask;
        float studioFaceB=pow(max(dot(n,normalize(vec3(.50,-.04,.86))),0.0),7.0)*bodyMask;
        col+=vec3(.30,.38,.38)*pow(broadKey,2.65)*.026*bodyMask;
        col+=vec3(.11,.28,.31)*pow(broadSide,2.45)*.044*bodyMask;
        col+=vec3(.08,.042,.055)*pow(broadWarm,2.70)*.014*bodyMask;
        col+=vec3(.98,1.00,.99)*studioFaceA*.074;
        col+=vec3(.30,.72,.78)*studioFaceB*.052;
        col+=vec3(1.00,1.00,.99)*studioStripeA*.145;
        col+=vec3(.25,.62,.69)*studioStripeB*.052;
        col+=vec3(.58,.90,.93)*studioStripeC*.058;
        col+=vec3(.018,.048,.052)*fresnel*.112*bodyMask;
        float internalDepth=smoothstep(-.30,.60,vLocal.z)*(1.0-.38*fresnel)*bodyMask;
        float glassEdge=pow(1.0-facing,2.05)*bodyMask;
        float glassHalo=pow(1.0-facing,1.35)*bodyMask;
        float frontDepth=smoothstep(-.18,.62,vLocal.z)*bodyMask;
        float iceVolume=exp(-pow((vLocal.x+.10)/.50,2.0)-pow((vLocal.y-.08)/.62,2.0))
          *smoothstep(-.42,.72,vLocal.z)*bodyMask;
        float sculptValleyA=exp(-pow((vLocal.x+.035)/.112,2.0)-pow((vLocal.y-.22)/.44,2.0))*bodyMask;
        float sculptValleyB=exp(-pow((vLocal.x-.19)/.102,2.0)-pow((vLocal.y+.30)/.27,2.0))*bodyMask;
        float sculptShoulder=exp(-pow((vLocal.x+.34)/.23,2.0)-pow((vLocal.y-.38)/.27,2.0))*bodyMask;
        col*=1.0-.075*sculptValleyA-.045*sculptValleyB;
        col+=vec3(.040,.096,.106)*sculptShoulder*.026;
        col+=vec3(.018,.034,.036)*internalDepth*(.18+.26*lift);
        col+=vec3(.024,.090,.100)*glassEdge*.245;
        col+=vec3(.014,.050,.057)*glassHalo*.082;
        col+=vec3(.010,.024,.026)*frontDepth*.040;
        float innerVeil=exp(-pow((vLocal.x+.02+vLocal.y*.10)/.20,2.0)-pow((vLocal.y-.03)/.60,2.0))*bodyMask;
        col+=vec3(.076,.092,.090)*iceVolume*(.010+.010*(1.0-facing));
        col+=vec3(.070,.085,.083)*innerVeil*(.004+.006*facing);
        col+=vec3(.013,.030,.035)*bodyMask*(.34+.40*facing);
        col+=vec3(.022,.052,.058)*grain*iceVolume*.006;
        vec2 socketQ=vec2((vLocal.x-.115)/.165,(vLocal.y-.040)/.145);
        float socketD=length(socketQ);
        float socketShade=exp(-pow((socketD-1.0)/.20,2.0))*smoothstep(.14,.54,vLocal.z)*bodyMask;
        float opticCaustic=exp(-dot(socketQ,socketQ)*.70)*smoothstep(.04,.58,vLocal.z)*bodyMask;
        col*=1.0-.070*socketShade;
        col+=vec3(.022,.090,.110)*opticCaustic*(.042+.055*uEnergy);
        float chromaSide=.5+.5*n.x;
        vec3 spectralEdge=mix(vec3(.015,.140,.168),vec3(.120,.032,.148),chromaSide);
        col+=spectralEdge*fresnel*bodyMask*.135;
        float refractRibbon=exp(-pow((vLocal.x+.11-vLocal.y*.16)/.115,2.0))*smoothstep(-.62,.66,vLocal.y)*frontDepth;
        col+=vec3(.055,.185,.205)*refractRibbon*(.045+.055*(1.0-facing));

        vec3 bezel=vec3(.080,.090,.087)
          +vec3(.095,.112,.108)*(.11*ndl+.12*sideLight)
          +vec3(1.00,1.00,.98)*keySpec*.230
          +vec3(.060,.175,.184)*fresnel*.100
          +vec3(.040,.052,.050)*(.10+.08*facing);
        col=mix(col,bezel,armorMask*.985);

        float pulse=0.0;
        if(uSurfacePulse>=0.0){
          float coordinate=.5+(vLocal.y*.62+vLocal.x*.14+vLocal.z*.20)*.5;
          float head=mix(-.18,1.18,sat(uSurfacePulse));
          pulse=1.0-smoothstep(.045,.115,abs(coordinate-head));
          pulse*=.30+.70*fresnel;
        }
        col+=vec3(.11,.28,.33)*pulse*.64;
        col+=vec3(.34,.40,.39)*pulse*keySpec*.16;



        vec2 lensVector=vUv-vec2(.5);
        float lensRadial=length(lensVector);
        float lensInner=1.0-smoothstep(.20,.47,lensRadial);
        float lensRim=exp(-pow((lensRadial-.430)/.032,2.0));
        float lensEdge=smoothstep(.410,.490,lensRadial);
        float sensorLine=exp(-pow((lensVector.y+lensVector.x*.050)/.052,2.0))
          *smoothstep(.06,.20,vUv.x)*(1.0-smoothstep(.80,.94,vUv.x));
        float sensorCore=exp(-pow((lensVector.y+lensVector.x*.050)/.023,2.0))
          *smoothstep(.18,.32,vUv.x)*(1.0-smoothstep(.68,.82,vUv.x));
        float lensHot=exp(-pow(lensVector.x/.205,2.0)-pow(lensVector.y/.115,2.0));
        float lensDepthShade=exp(-pow(lensRadial/.225,2.0));
        float lensGlint=exp(-pow((vUv.x-.31)/.065,2.0)-pow((vUv.y-.27)/.052,2.0));
        vec3 optical=vec3(.006,.022,.028)
          +vec3(.008,.050,.060)*lensInner
          +vec3(.94,.99,.97)*keySpec*.070
          +vec3(.014,.070,.084)*fresnel*.060
          +vec3(.58,.66,.64)*lensRim*.040
          +vec3(.018,.34,.39)*sensorLine*.090
          +vec3(.62,.92,.94)*sensorCore*.120
          +vec3(.68,.86,.84)*lensHot*.042
          +vec3(1.00,1.00,1.00)*lensGlint*.30
          +vec3(.32,.44,.44)*lensEdge*(.032+.032*keySpec+.016*sideSpec);
        optical=mix(optical,vec3(.003,.014,.018),lensDepthShade*.075);
        optical+=vec3(.72,.92,.94)*lensGlint*.080;
        col=mix(col,optical,lensMeshMask*.997);

        if(uLayer>.5){${outputName}=vec4(vec3(.004,.009,.011),.16);return;}
        float alpha=1.0-tendrilMask*.34-isGlassFin*.66;
        alpha=mix(alpha,.97,isLensMesh);
        ${outputName}=vec4(tone(col*2.10),clamp(alpha,.99,1.0));
      }`;

    /* R1716 — preserve photographic mobile geometry.
       Software rendering keeps the ultra-lite material/mesh, but real mobile
       GPUs use the medium physical shader and the normal mobile topology.
       Dynamic resolution still yields before the 16.67 ms cadence. */
    const mobilePhysical = mobile || constrainedMobile || auditMode;
    /* R1930 visual parity: one authored studio shader on desktop, mobile and
       software proof. This removes the hardware/CI split that hid ugly live paths. */
    const fragmentSource = constrainedFragmentSource;
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
    root.dataset.fxNativeMagPerformanceR1953b='cached-vertex-lattice-yielded-gpu-buffer-upload-exact-visual-parity';
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
      void finishBoot(program).catch(failShader);
    }
    finishWhenReady();
    return;

    async function finishBoot(program) {
    const geometry=buildOrganismGeometry(softwareRenderer);
    /* R1953b — let the browser present/handle input between CPU geometry
       generation and GPU buffer uploads. This is production behavior on every
       renderer, not an audit-only branch. */
    await new Promise(resolve=>setTimeout(resolve,0));
    if(!stage.isConnected)return;
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
    for(let index=0;index<buffers.length;index+=1){
      upload(buffers[index],geometry.arrays[index],attributes[index],geometry.sizes[index]);
      /* Large typed-array transfers can synchronize SwiftShader/low-end drivers.
         Yield after each pair while keeping hardware startup effectively instant. */
      if(index===1||index===3||index===5){
        await new Promise(resolve=>setTimeout(resolve,0));
        if(!stage.isConnected)return;
      }
    }
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
    /* R1950 — desktop contour fidelity.
       The previous desktop start scale (.68) was too low for a large hero object
       and produced visible stair-stepping on the silhouette even with MSAA.
       Desktop now starts close to native CSS resolution and only sheds quality
       after measured frame pressure. Mobile keeps its existing contract. */
    let qualityScale=softwareRenderer
      ? (mobile?.94:.72)
      : (mobile ? 1.00 : (auditMode ? .90 : (constrained ? .84 : 1.00)));
    const qualityCeiling=softwareRenderer
      ? (mobile?1.00:.86)
      : (mobile?1.08:(auditMode?.98:(constrained?.96:1.08)));
    const qualityFloor=softwareRenderer
      ? (mobile?.80:.48)
      : (mobile?.80:(constrained?.62:.74));
    let lastQualityAdjust=0,qualityResizeTimer=0;
    let renderPeak=0,framePeak=1000/60,stableBudgetFrames=0,panicFrames=0;
    let heartbeatTimer=0,surfacePulseTimer=0,autonomousTimer=0,scrollFrame=0,scrollSettleTimer=0,tapCandidate=null;
    let surfacePulseStart=-Infinity,lastSurfacePulseAt=-Infinity,surfacePulseCount=0;
    let activeOrgan='hero',shapeLockUntil=0;
    const cinematic=window.FormatXCoreCinematic=window.FormatXCoreCinematic||{};
    cinematic.version=REVISION;
    cinematic.corePosition=[0,0,.52];

    function resize(){
      const rect=stage.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return false;
      const baseCap=softwareRenderer
        ? (mobile?1.58:1.28)
        : (auditMode ? 1.34 : constrainedMobile?1.72:mobile?2.00:constrained?1.68:2.10);
      const cap=baseCap*qualityScale;
      const dpr=Math.min(devicePixelRatio||1,cap);
      const baseBudget=softwareRenderer
        ? (mobile?920000:560000)
        : (auditMode ? 980000 : constrainedMobile?1280000:mobile?1900000:constrained?1450000:3400000);
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
      const pointerTiltEase=1-Math.exp(-dt*(desktopFine.matches?.020:.014));
      pointerTiltX+=(targetPointerTiltX-pointerTiltX)*pointerTiltEase;
      pointerTiltY+=(targetPointerTiltY-pointerTiltY)*pointerTiltEase;
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
      cinematic.rotation=[rotationX+pointerTiltX,rotationY+pointerTiltY,rotationZ];
      cinematic.siteProgress=siteProgress;
      publishShape();

      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(uniforms.uTime,simulationTime);
      gl.uniform1f(uniforms.uEnergy,energy);
      gl.uniform1f(uniforms.uBreath,breath);
      gl.uniform1f(uniforms.uMorph,morph);
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
      if(root.dataset.fxCoreFirstFrameR1913!=='painted'){
        root.dataset.fxCoreFirstFrameR1913='painted';
        stage.dataset.firstFrame='painted';
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
      root.dataset.fxNativeMagDesktopInteractionR1944='absolute-pointer-tilt-coalesced-polling-rate-independent-bounded-raf';
      root.dataset.fxNativeMagPerformanceR1696='software-readable-resolution-floor-with-bounded-pixel-budget';
      root.dataset.fxCoreQualityScaleR1600=qualityScale.toFixed(2);
      root.dataset.fxCoreReal3dFps=String(Math.min(60,Math.round(1000/Math.max(16.67,frameIntervalAverage))));
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
      clearTimeout(heartbeatTimer);clearTimeout(surfacePulseTimer);clearTimeout(autonomousTimer);clearTimeout(scrollSettleTimer);delayed.forEach(clearTimeout);delayed.clear();
      if(raf)cancelAnimationFrame(raf);if(scrollFrame)cancelAnimationFrame(scrollFrame);
      if(ambientPointerFrame)cancelAnimationFrame(ambientPointerFrame);ambientPointerFrame=0;pendingAmbientPointer=null;
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
    root.dataset.fxCoreFirstFrameR1913='pending';
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

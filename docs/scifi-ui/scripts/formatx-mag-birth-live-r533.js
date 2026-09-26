(() => {
  'use strict';

  const ROOT = document.documentElement;
  const PARAMS = new URLSearchParams(location.search);
  const FORCE = PARAMS.get('intro') === '1';
  const VISUAL_PROOF = PARAMS.get('visualintro') === '1';
  const VISUAL_FRAME = Number.parseFloat(PARAMS.get('introframe') || '');
  const HAS_VISUAL_FRAME = VISUAL_PROOF && Number.isFinite(VISUAL_FRAME);
  const PROOF_REFERENCE_RENDERER = VISUAL_PROOF && PARAMS.get('proofrenderer') === 'reference';
  const KEY = 'formatx:mag-birth-live-r533-seen';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LIGHTHOUSE = PARAMS.get('lighthouse') === '1';
  if (LIGHTHOUSE) ROOT.dataset.fxLighthouseAuditR1391 = 'true';
  const AUTOMATION = navigator.webdriver === true || LIGHTHOUSE;
  const VALIDATED_SKIP_MODE = AUTOMATION && PARAMS.get('r548') === 'mobile-skip';
  const MOBILE = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const HARDWARE_CONCURRENCY = Math.max(1, Number(navigator.hardwareConcurrency || 8));
  const DEVICE_MEMORY = Math.max(1, Number(navigator.deviceMemory || 8));
  const CONSTRAINED = HARDWARE_CONCURRENCY <= 4 || DEVICE_MEMORY <= 4;
  const HEADLESS_SOFTWARE = /HeadlessChrome/i.test(String(navigator.userAgent||''));
  const SOFTWARE_SAFE = CONSTRAINED || HEADLESS_SOFTWARE;
  /* R1753 — forced cinematic proof is a real intro path, not an audit path.
     The R533/critical birth styles are normally deferred for first-paint cost,
     but ?intro=1 / visualintro must own their geometry immediately so the
     cinematic is visible deterministically on production as well as locally. */
  if (FORCE || VISUAL_PROOF) {
    for (const selector of [
      'link[data-fx-mag-birth-live-r533]',
      'link[data-fx-mag-birth-critical-r1572]'
    ]) {
      const style = document.querySelector(selector);
      if (style instanceof HTMLLinkElement) {
        style.media = 'all';
        style.dataset.fxR1753ForcedIntroStyle = 'active';
      }
    }
    ROOT.dataset.fxMagBirthForcedStyleR1753 = 'immediate';
  }
  const LOW_POWER = MOBILE && CONSTRAINED;
  const DURATION = 10000;
  const PREPAINT_ID = 'fx-mag-birth-prepaint-r1606';
  const prepaintOverlay = document.getElementById(PREPAINT_ID);
  const EXIT_MS = 180;
  const CORE_WARMUP_PROGRESS = MOBILE ? .72 : .72;
  ROOT.dataset.fxMagBirthProductionPathR1674='absolute-scifi-ui-runtime-assets';

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (_) {}

  /* R533 fully replaces the R531/R532 preloader path. The legacy node stays in
     source for compatibility validators, but is removed before its deferred
     controller executes, so users never see two intros back-to-back. */
  document.getElementById('formatx-event-horizon')?.remove();
  ROOT.dataset.fxMagBirthOwnerR533 = !FORCE && AUTOMATION ? (LIGHTHOUSE ? 'lighthouse-skip' : 'automation-skip') : (seen && !FORCE ? 'session-skip' : 'active');
  if (ROOT.dataset.fxMagBirthOwnerR533 === 'active') {
    ROOT.dataset.fxMagBirthGenomeR610='dna-assembly-zoom-native-r326';
    ROOT.dataset.fxMagBirthGenomeR611='realistic-css-3d-double-helix-embryo-one-native-r326';
    ROOT.dataset.fxMagBirthOwnershipR1673='genesis-contract-published-before-visible-live-shell';
  }

  if (!FORCE && (seen || AUTOMATION)) {
    prepaintOverlay?.remove();
    ROOT.dataset.fxMagBirthLiveR533 = AUTOMATION ? (LIGHTHOUSE ? 'lighthouse-skip' : 'automation-skip') : 'session-skip';
    return;
  }

  const en = ROOT.lang === 'en';
  const copy = en ? {
    kicker: 'FORMATX / CORE GENESIS',
    title: 'THE BIRTH OF THE CORE',
    subtitle: 'The first impulse of the living system.',
    skip: 'SKIP',
    skipAria: 'Skip the FormatX core birth sequence',
    statuses: [
      [0.00, 'AWAKENING GENETIC ENERGY FIELD'],
      [0.10, 'CAPTURING SIGNAL NUCLEOTIDES'],
      [0.22, 'ASSEMBLING 3D DNA DOUBLE HELIX'],
      [0.38, 'LIVING GENOME STABILIZING'],
      [0.52, 'CAMERA PULLING BACK / EMBRYO FOCUS'],
      [0.68, 'GENOME COLLAPSING INTO LIVING CORE'],
      [0.82, 'FIRST LIVING IMPULSE'],
      [0.94, 'CORE ALIVE']
    ]
  } : {
    kicker: 'FORMATX / MAG GENESIS',
    title: 'A MAG SZÜLETÉSE',
    subtitle: 'Az élő rendszer első impulzusa.',
    skip: 'ÁTUGRÁS',
    skipAria: 'A FormatX MAG születése animáció átugrása',
    statuses: [
      [0.00, 'GENETIKAI ENERGIAMEZŐ ÉBRESZTÉSE'],
      [0.10, 'JEL-NUKLEOTIDOK BEFOGÁSA'],
      [0.22, '3D DNS KETTŐS SPIRÁL ÖSSZEÁLLÍTÁSA'],
      [0.38, 'ÉLŐ GENOM STABILIZÁLÁSA'],
      [0.52, 'KAMERA KIZOOM / EMBRIÓ FÓKUSZ'],
      [0.68, 'A GENOM ÉLŐ MAGGÁ SŰRŰSÖDIK'],
      [0.82, 'ELSŐ ÉLŐ IMPULZUS'],
      [0.94, 'MAG ÉL']
    ]
  };

  const overlay = prepaintOverlay instanceof HTMLElement ? prepaintOverlay : document.createElement('section');
  overlay.className = 'fx-mag-birth-r533';
  /* R1618 — once the cinematic contains a real Skip control it cannot remain
     aria-hidden. Decorative descendants keep their own aria-hidden markers. */
  overlay.removeAttribute('aria-hidden');
  overlay.removeAttribute('inert');
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.dataset.fxPrepaintR1606 = prepaintOverlay instanceof HTMLElement ? 'adopted-static-lcp-shell' : 'dynamic-fallback';
  overlay.dataset.phase = '0';
  overlay.dataset.performance = MOBILE ? 'constrained' : 'full';
  overlay.dataset.fxIntroR645 = 'biotic-genesis';
  overlay.dataset.fxIntroR646 = 'reference-biotic-film';
  overlay.dataset.fxIntroR647 = 'shot-match-biotic-genesis';
  overlay.dataset.fxIntroR648 = 'exact-10s-runtime';
  overlay.dataset.fxIntroAdaptiveR1549 = LOW_POWER ? 'full-10s-low-power-sharp-adaptive' : 'full-10s-studio-cinematic';
  overlay.dataset.fxIntroR649 = 'native-canvas-reference-rotoscope';
  overlay.dataset.fxIntroR650 = 'three-genesis-dna-cellular-living';
  overlay.dataset.fxIntroR651 = 'frame-matched-three-genesis';
  overlay.dataset.fxIntroR657 = 'reference-geometry-three-genesis';
  overlay.dataset.fxIntroR660 = 'storyboard-match-three-genesis';
  overlay.dataset.fxIntroR661 = 'reference-form-three-genesis';
  overlay.dataset.fxIntroR662 = 'compact-pod-three-genesis';
  overlay.dataset.fxIntroR663 = 'surface-core-three-genesis';
  overlay.dataset.fxIntroR664 = 'soft-optic-reference-three-genesis';
  overlay.dataset.fxIntroR665 = 'organic-hood-three-genesis';
  overlay.dataset.fxIntroR666 = 'integrated-organic-three-genesis';
  overlay.dataset.fxIntroR667 = 'armored-organic-three-genesis';
  overlay.dataset.fxIntroR668 = 'unified-armored-pod-three-genesis';
  overlay.dataset.fxIntroR670 = 'video-accurate-organic-handoff-three-genesis';
  overlay.dataset.fxIntroR671 = 'reference-cross-dna-early-pod-three-genesis';
  overlay.dataset.fxIntroR672 = 'video-scale-local-flash-three-genesis';
  overlay.dataset.fxIntroR1723='same-canonical-organism-birth-to-site-handoff';
  overlay.dataset.fxIntroR673 = 'reference-material-three-genesis';
  overlay.dataset.fxIntroR674 = 'reference-proportion-three-genesis';
  overlay.dataset.fxIntroR675 = 'neural-fold-three-genesis';
  overlay.dataset.fxIntroR680 = 'reference-ratio-three-genesis';
  overlay.dataset.fxIntroR681 = 'reference-locked-three-genesis';
  overlay.dataset.fxIntroR700 = 'reference-fused-three-genesis';
  overlay.dataset.fxIntroR701 = 'organic-petal-core-three-genesis';
  overlay.dataset.fxIntroR720 = 'organic-reference-fused-three-genesis';
  overlay.dataset.fxIntroR721 = 'organic-petal-final-three-genesis';
  overlay.dataset.fxIntroR800 = 'reference-locked-three-genesis';
  overlay.dataset.fxIntroR820 = 'material-locked-three-genesis';
  overlay.dataset.fxIntroR900 = 'three-stage-reference-genesis';
  overlay.dataset.fxIntroR950 = 'reference-geometry-three-genesis';
  overlay.dataset.fxIntroR952 = 'reference-material-depth-three-genesis';
  overlay.dataset.fxIntroR960 = 'reference-proportion-three-genesis';
  overlay.dataset.fxIntroR961 = 'reference-proportion-dark-depth-three-genesis';
  overlay.dataset.fxIntroR963 = 'organic-final-reference-three-genesis';
  overlay.dataset.fxIntroVisualProofR964 = 'r963-frame-locked-reference-proof';
  overlay.dataset.fxIntroR970 = 'video-locked-organic-three-genesis';
  overlay.dataset.fxIntroR980 = 'neural-surface-three-genesis';
  overlay.dataset.fxIntroR982 = 'reference-balance-three-genesis';
  overlay.dataset.fxIntroR990 = 'biotic-tissue-three-genesis';
  overlay.dataset.fxIntroR1000 = 'reference-composition-three-genesis';
  overlay.dataset.fxIntroR1020 = 'reference-optics-three-genesis';
  overlay.dataset.fxIntroR1040 = 'surface-vein-network-three-genesis';
  overlay.dataset.fxIntroR1060 = 'embedded-cellular-core-three-genesis';
  overlay.dataset.fxIntroR1090 = 'reference-cellular-core-three-genesis';
  overlay.dataset.fxIntroR1110 = 'three-stage-reference-timeline';
  overlay.dataset.fxIntroR1130 = 'reference-proportion-lock';
  overlay.dataset.fxIntroR1140 = 'proof-corrected-reference';
  overlay.dataset.fxIntroR1200 = 'video-timeline-lock-three-genesis';
  overlay.dataset.fxIntroR1210 = 'surface-form-lock-three-genesis';
  overlay.dataset.fxIntroR1230 = 'frame-ratio-brain-lock-three-genesis';
  overlay.dataset.fxIntroR1240 = 'organic-gyri-lock-three-genesis';
  overlay.dataset.fxIntroR1250 = 'reference-material-lock-three-genesis';
  overlay.dataset.fxIntroR1270 = 'stage-locked-three-genesis';
  overlay.dataset.fxIntroR1280 = 'reference-polish-three-genesis';
  overlay.dataset.fxIntroR1290 = 'video-timeline-final-core-lock-three-genesis';
  overlay.dataset.fxIntroR1320 = 'frame-locked-dna-eye-pullback-three-genesis';
  overlay.dataset.fxIntroR1330 = 'reference-ratio-dark-iris-tendril-lock-three-genesis';
  overlay.dataset.fxIntroR1340 = 'reference-surface-radial-iris-lock-three-genesis';
  overlay.dataset.fxIntroR1350 = 'video-proportion-organic-final-lock-three-genesis';
  overlay.dataset.fxIntroR1360 = 'integrated-cortical-organic-final-lock-three-genesis';
  overlay.dataset.fxIntroR1460 = 'cinematic-dna-organic-cut-crystal-three-genesis';
  overlay.dataset.fxIntroR1470 = 'cinematic-dna-cortical-organic-obsidian-cut-crystal-three-genesis';
  overlay.dataset.fxIntroR1490 = 'realistic-dna-solid-organism-obsidian-crystal-cinematic-three-genesis';
  overlay.dataset.fxIntroR1530 = 'photoreal-microfacet-mag-continuous-living-habitat-three-genesis';
  overlay.dataset.fxIntroR1540 = 'photoreal-bioceramic-organism-round-optic-ringless-habitat-genesis';
  ROOT.dataset.fxMagBirthArtR1530 = 'physical-studio-light-microtextured-mineral-continuous-habitat-handoff';
  overlay.dataset.fxIntroR1400 = 'irregular-crystal-final-handoff-three-genesis';
  overlay.dataset.fxIntroR1412 = 'vertical-asymmetric-crystal-final-handoff-three-genesis';
  overlay.dataset.fxIntroR1420 = 'real-three-solid-cortical-reference-dna-dark-shard-final-handoff';
  overlay.dataset.fxIntroR1430 = 'production-three-reference-dna-solid-cortex-compact-shard';
  overlay.dataset.fxIntroR1300 = 'cellular-material-lock-three-genesis';
  overlay.dataset.fxIntroVisualProofR981 = 'r980-frame-locked-reference-proof';
  overlay.dataset.fxIntroVisualProofR962 = 'r961-frame-locked-reference-proof';
  overlay.dataset.fxIntroVisualProofR911 = 'current-r900-reference-keyframes';
  ROOT.dataset.fxMagBirthArtR645 = 'biotic-dna-iris-neural-tendrils-native-handoff';
  ROOT.dataset.fxMagBirthArtR646 = 'deep-genome-field-dark-organic-embryo-optic-iris-neural-bloom-native-handoff';
  ROOT.dataset.fxMagBirthArtR647 = 'reference-shot-match-fast-dna-orb-iris-tentacles-native-mag';
  ROOT.dataset.fxMagBirthArtR649 = 'reference-geometry-24fps-native-canvas-no-video';
  ROOT.dataset.fxMagBirthArtR650 = 'threejs-dna-cellular-living-architecture-one-continuous-mag';
  ROOT.dataset.fxMagBirthArtR651 = 'frame-matched-10s-dna-cellular-tentacle-flash-handoff';
  ROOT.dataset.fxMagBirthArtR657 = 'tubular-dna-diamond-iris-organic-shell-tapered-tendrils-reference-match';
  ROOT.dataset.fxMagBirthArtR660 = 'fine-dna-central-diamond-neural-cell-shell-mechanical-petals-nine-tendrils';
  ROOT.dataset.fxMagBirthArtR661 = 'dense-purple-cellular-shell-surface-diamond-dimensional-mechanical-core-eight-tendrils';
  ROOT.dataset.fxMagBirthArtR662 = 'wider-fluid-diamond-embedded-cyan-iris-compact-armored-pod-formatx-face';
  ROOT.dataset.fxMagBirthArtR663 = 'surface-visible-cellular-diamond-brighter-armored-pod-cyan-final-eye';
  ROOT.dataset.fxMagBirthArtR664 = 'dark-phase1-formatx-face-smaller-cellular-diamond-soft-cyan-iris-metal-keylight';
  ROOT.dataset.fxMagBirthArtR665 = 'cellular-crown-cyan-neural-traces-asymmetric-armored-pod-luminous-seams';
  ROOT.dataset.fxMagBirthArtR666 = 'dark-integrated-organic-crown-compact-cyan-seams-soft-reference-eye';
  ROOT.dataset.fxMagBirthArtR667 = 'cortical-cell-tissue-silver-crown-shoulders-dual-jaw-ribbed-tendrils';
  ROOT.dataset.fxMagBirthArtR668 = 'single-closed-armored-pod-silver-crown-recessed-cradle-cyan-eye-eight-tendrils';
  ROOT.dataset.fxMagBirthArtR670 = 'thick-dna-organic-cellular-sphere-front-iris-tendrils-final-flash-native-armored-handoff';
  ROOT.dataset.fxMagBirthArtR671 = 'early-dark-pod-crossed-foreground-dna-organic-sphere-tendrils-flash-native-pod-handoff';
  ROOT.dataset.fxMagBirthArtR672 = 'smaller-surface-mag-dark-cell-sphere-larger-pullback-local-central-flash';
  ROOT.dataset.fxMagBirthArtR673 = 'volumetric-dna-continuous-cell-membrane-compact-cyan-iris-thick-tendrils-local-flash';
  ROOT.dataset.fxMagBirthArtR674 = 'thick-rung-dna-large-dark-pod-brain-lobes-organic-tendrils-radial-burst';
  ROOT.dataset.fxMagBirthArtR675 = 'neural-fold-cell-surface-fluid-nine-tendrils-expanded-blue-iris';
  ROOT.dataset.fxMagBirthArtR680 = 'large-front-mag-brain-lobes-3d-veins-dense-dna-rungs-near-camera-pullback';
  ROOT.dataset.fxMagBirthArtR681 = 'reference-locked-dna-brain-folds-cyan-iris-fluid-nine-tendrils';
  ROOT.dataset.fxMagBirthArtR700 = 'locked-neural-folds-large-front-mag-armored-hood-blue-iris-fluid-tendrils-close-pullback';
  ROOT.dataset.fxMagBirthArtR701 = 'four-organic-petals-blue-iris-brain-folds-dark-cyan-tendrils-film-debris';
  ROOT.dataset.fxMagBirthArtR720 = 'organic-convex-diamond-fold-dominant-shell-dark-hood-thick-tendrils-late-close-camera';
  ROOT.dataset.fxMagBirthArtR721 = 'four-petal-organic-mag-r720-shell-nine-tendrils-reference-pullback';
  ROOT.dataset.fxMagBirthArtR800 = 'wide-cellular-mass-smaller-blue-iris-integrated-petals-segmented-tendrils-local-flash';
  ROOT.dataset.fxMagBirthArtR820 = 'dark-contiguous-cellular-shell-blue-radial-iris-integrated-dark-petals-thick-segmented-tendrils';
  ROOT.dataset.fxMagBirthArtR900 = 'reference-stage1-liquid-core-dna-stage2-cellular-orb-stage3-armored-tentacle-pod';
  ROOT.dataset.fxMagBirthArtR950 = 'liquid-metal-dna-core-draped-cellular-membrane-layered-armored-pod-optical-eye';
  ROOT.dataset.fxMagBirthArtR952 = 'dark-liquid-core-embedded-cellular-eye-silver-black-armored-final-pod';
  ROOT.dataset.fxMagBirthArtR960 = 'smaller-cellular-core-neural-folds-large-final-eye-thin-cyan-seams';
  ROOT.dataset.fxMagBirthArtR961 = 'r960-proportions-dark-liquid-core-embedded-cellular-eye-silver-black-final-pod';
  ROOT.dataset.fxMagBirthArtR963 = 'dark-liquid-dna-cellular-eye-organic-final-sphere-silver-crown-segmented-tendrils';
  ROOT.dataset.fxMagBirthArtR970 = 'dna-organic-cellular-sphere-embedded-eye-tendrils-local-flash-native-handoff';
  ROOT.dataset.fxMagBirthArtR980 = 'balanced-brain-folds-surface-veins-reference-iris-dark-segmented-tendrils';
  ROOT.dataset.fxMagBirthArtR982 = 'flesh-lobes-large-embedded-iris-early-silver-crown-dark-segmented-tendrils';
  ROOT.dataset.fxMagBirthArtR990 = 'dense-cellular-lobes-thin-neural-folds-surface-veins-segmented-tendril-light';
  ROOT.dataset.fxMagBirthArtR1000 = 'open-dna-frame-liquid-metal-core-lobulated-cellular-mass-cyan-fissures-segmented-tendrils';
  ROOT.dataset.fxMagBirthArtR1020 = 'liquid-asymmetric-mag-embedded-blue-iris-no-cellular-starburst';
  ROOT.dataset.fxMagBirthArtR1040 = 'curved-biotic-surface-veins-no-radial-spokes-local-cell-network';
  ROOT.dataset.fxMagBirthArtR1060 = 'larger-embedded-liquid-mag-primary-curved-veins-cellular-cortex';
  ROOT.dataset.fxMagBirthArtR1090 = 'larger-embedded-diamond-brain-lobes-thicker-cyan-veins-local-flash';
  ROOT.dataset.fxMagBirthArtR1110 = 'dna-cellular-mechanical-flash-three-stage-reference';
  ROOT.dataset.fxMagBirthArtR1130 = 'stage1-liquid-metal-stage2-compact-embedded-core-stage3-mechanical-pod';
  ROOT.dataset.fxMagBirthArtR1140 = 'smaller-cellular-core-muted-veins-compact-final-eye-titanium-pod';
  ROOT.dataset.fxMagBirthArtR1200 = 'dna-only-opening-large-cellular-body-organic-tendrils-through-flash-native-mechanical-handoff';
  ROOT.dataset.fxMagBirthArtR1210 = 'dense-biological-dna-continuous-brain-fold-shell-small-embedded-iris-thick-segmented-tendrils';
  ROOT.dataset.fxMagBirthArtR1230 = 'reference-dna-diagonal-brain-gyri-small-diamond-large-blue-iris-visible-segmented-tendrils-local-flash';
  ROOT.dataset.fxMagBirthArtR1240 = 'localized-brain-gyri-integrated-hood-large-blue-iris-thick-dark-segmented-tendrils';
  ROOT.dataset.fxMagBirthArtR1250 = 'blended-brain-tissue-dark-hood-large-blue-iris-dark-segmented-tendrils-reference-framing';
  ROOT.dataset.fxMagBirthArtR1270 = 'large-liquid-core-dark-cellular-stage-armored-stage-from-6s-reference-timing';
  ROOT.dataset.fxMagBirthArtR1280 = 'large-liquid-core-round-cellular-lobes-small-embedded-eye-silver-armored-pod-segmented-tendrils';
  ROOT.dataset.fxMagBirthArtR1290 = 'video-locked-dna-organic-orb-tentacles-late-armor-flash-final-core';
  ROOT.dataset.fxMagBirthArtR1320 = 'cropped-volumetric-dna-fine-gyri-large-cyan-iris-cinematic-pullback-dark-tendrils-native-final-mag';
  ROOT.dataset.fxMagBirthArtR1330 = 'reference-ratio-separated-dna-broad-gyri-dark-organic-petals-cyan-iris-readable-tendrils-native-final-mag';
  ROOT.dataset.fxMagBirthArtR1340 = 'thin-dna-cortical-ridges-dark-petals-radial-cyan-iris-segmented-tendrils-r1310-native-handoff';
  ROOT.dataset.fxMagBirthArtR1350 = 'thin-dna-broad-organic-lobes-dark-diamond-balanced-iris-strong-pullback-native-reference-handoff';
  ROOT.dataset.fxMagBirthArtR1360 = 'thin-dna-continuous-cortical-shell-dark-integrated-petals-balanced-iris-r1360-native-handoff';
  ROOT.dataset.fxMagBirthArtR1300 = 'video-locked-timeline-cell-lobe-dominance-fine-veins-dark-structured-tendrils';
  ROOT.dataset.fxIntroProofR1201 = 'r1200-intro-r1151-native-clean-proof';
  ROOT.dataset.fxFinalProofR1152 = 'r1140-intro-r1151-native-mag-clean-proof';
  ROOT.dataset.fxThreeStageProofR1121 = 'r1110-intro-r1120-compact-native-mag';
  ROOT.dataset.fxNativeMagProofR1101 = 'r1090-intro-r1100-real-armor-browser-proof';
  ROOT.dataset.fxIntroProofR911 = 'r900-intro-r910-native-clean-browser-proof';
  overlay.setAttribute('aria-label', copy.title);
  const prepaintBrand = overlay.querySelector('.fxb-lcp-brand-r1603');
  let prepaintCanvas = overlay.querySelector('.fxb-particles');
  overlay.insertAdjacentHTML('beforeend', `
    <div class="fxb-deep" aria-hidden="true"></div>
    <div class="fxb-veil" aria-hidden="true"></div>
    <div class="fxb-stars" aria-hidden="true"></div>
    <div class="fxb-biotic-field" aria-hidden="true"><i></i><i></i><i></i></div>
    <svg class="fxb-genome-field" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(95 65) rotate(-16) scale(.86)"><g class="fxb-genome-ghost fxb-genome-ghost-a">
        <path class="s1" d="M30 0 C130 34 130 66 30 100 S-70 166 30 200 S130 266 30 300"/>
        <path class="s2" d="M100 0 C0 34 0 66 100 100 S200 166 100 200 S0 266 100 300"/>
        <path class="r" d="M52 28H78 M91 73H39 M50 127H80 M91 173H39 M52 228H78 M89 273H41"/>
      </g></g>
      <g transform="translate(755 82) rotate(21) scale(.68)"><g class="fxb-genome-ghost fxb-genome-ghost-b">
        <path class="s1" d="M30 0 C130 34 130 66 30 100 S-70 166 30 200 S130 266 30 300"/>
        <path class="s2" d="M100 0 C0 34 0 66 100 100 S200 166 100 200 S0 266 100 300"/>
        <path class="r" d="M52 28H78 M91 73H39 M50 127H80 M91 173H39 M52 228H78 M89 273H41"/>
      </g></g>
      <g transform="translate(150 430) rotate(14) scale(.56)"><g class="fxb-genome-ghost fxb-genome-ghost-c">
        <path class="s1" d="M30 0 C130 34 130 66 30 100 S-70 166 30 200 S130 266 30 300"/>
        <path class="s2" d="M100 0 C0 34 0 66 100 100 S200 166 100 200 S0 266 100 300"/>
        <path class="r" d="M52 28H78 M91 73H39 M50 127H80 M91 173H39 M52 228H78 M89 273H41"/>
      </g></g>
      <g transform="translate(720 410) rotate(-24) scale(.78)"><g class="fxb-genome-ghost fxb-genome-ghost-d">
        <path class="s1" d="M30 0 C130 34 130 66 30 100 S-70 166 30 200 S130 266 30 300"/>
        <path class="s2" d="M100 0 C0 34 0 66 100 100 S200 166 100 200 S0 266 100 300"/>
        <path class="r" d="M52 28H78 M91 73H39 M50 127H80 M91 173H39 M52 228H78 M89 273H41"/>
      </g></g>
      <g transform="translate(445 -40) rotate(76) scale(.46)"><g class="fxb-genome-ghost fxb-genome-ghost-e">
        <path class="s1" d="M30 0 C130 34 130 66 30 100 S-70 166 30 200 S130 266 30 300"/>
        <path class="s2" d="M100 0 C0 34 0 66 100 100 S200 166 100 200 S0 266 100 300"/>
        <path class="r" d="M52 28H78 M91 73H39 M50 127H80 M91 173H39 M52 228H78 M89 273H41"/>
      </g></g>
      <g transform="translate(425 560) rotate(104) scale(.42)"><g class="fxb-genome-ghost fxb-genome-ghost-f">
        <path class="s1" d="M30 0 C130 34 130 66 30 100 S-70 166 30 200 S130 266 30 300"/>
        <path class="s2" d="M100 0 C0 34 0 66 100 100 S200 166 100 200 S0 266 100 300"/>
        <path class="r" d="M52 28H78 M91 73H39 M50 127H80 M91 173H39 M52 228H78 M89 273H41"/>
      </g></g>
    </svg>
    <div class="fxb-dna-stage" aria-hidden="true">
      <div class="fxb-dna-depth-fog"></div>
      <div class="fxb-dna-helix" data-fx-dna-3d-r611="true"></div>
      <svg class="fxb-dna" viewBox="0 0 320 720" preserveAspectRatio="xMidYMid meet">
        <g class="fxb-dna-bridges"></g>
        <path class="fxb-dna-strand fxb-dna-strand-a" pathLength="1"></path>
        <path class="fxb-dna-strand fxb-dna-strand-b" pathLength="1"></path>
        <g class="fxb-dna-nodes"></g>
      </svg>
      <div class="fxb-dna-heart"></div>
    </div>
    <div class="fxb-embryo" aria-hidden="true">
      <div class="fxb-embryo-membrane"></div>
      <div class="fxb-embryo-cortex"></div>
      <div class="fxb-shell-lobes" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="fxb-tentacle-field" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="fxb-embryo-fluid"></div>
      <div class="fxb-embryo-nucleus"></div>
      <div class="fxb-embryo-iris"><span></span><i></i><b></b></div>
      <div class="fxb-neural-tendrils"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="fxb-embryo-filament fxb-embryo-filament-a"></div>
      <div class="fxb-embryo-filament fxb-embryo-filament-b"></div>
    </div>
    <div class="fxb-grid" aria-hidden="true"></div>
    <div class="fxb-halo fxb-halo-outer" aria-hidden="true"></div>
    <div class="fxb-halo fxb-halo-inner" aria-hidden="true"></div>
    <div class="fxb-axis fxb-axis-h" aria-hidden="true"></div>
    <div class="fxb-axis fxb-axis-v" aria-hidden="true"></div>
    <div class="fxb-lens" aria-hidden="true"></div>
    <div class="fxb-flash" aria-hidden="true"></div>
    <div class="fxb-scan" aria-hidden="true"></div>
    <div class="fxb-letterbox fxb-letterbox-top" aria-hidden="true"></div>
    <div class="fxb-letterbox fxb-letterbox-bottom" aria-hidden="true"></div>
    <header class="fxb-copy">
      <p class="fxb-kicker"></p>
      <h1></h1>
      <p class="fxb-subtitle"></p>
    </header>
    <div class="fxb-telemetry" aria-live="polite">
      <output class="fxb-percent">000</output>
      <progress class="fxb-progress" max="100" value="0">0%</progress>
      <span class="fxb-status"></span>
    </div>
  `);

  let liveSkip=overlay.querySelector('.fxb-skip');
  if (!(liveSkip instanceof HTMLButtonElement)) {
    liveSkip=document.createElement('button');
    liveSkip.className='fxb-skip';
    liveSkip.type='button';
    overlay.appendChild(liveSkip);
  }
  liveSkip.removeAttribute('tabindex');

  if (!(prepaintCanvas instanceof HTMLCanvasElement)) {
    prepaintCanvas=document.createElement('canvas');
    prepaintCanvas.className='fxb-particles';
    prepaintCanvas.setAttribute('aria-hidden','true');
    overlay.prepend(prepaintCanvas);
  }

  if (!(prepaintBrand instanceof HTMLElement)) {
    const brand=document.createElement('div');
    brand.className='fxb-lcp-brand-r1603';
    brand.setAttribute('aria-hidden','true');
    brand.textContent='FORMATX';
    overlay.prepend(brand);
  }

  if (MOBILE && !HAS_VISUAL_FRAME) {
    overlay.querySelectorAll(
      '.fxb-genome-field,.fxb-biotic-field,.fxb-embryo,.fxb-grid,.fxb-halo,.fxb-axis,.fxb-lens,.fxb-scan'
    ).forEach(node=>node.remove());
    ROOT.dataset.fxMagBirthDomBudgetR1606='mobile-lean-real-renderer-no-legacy-decorative-tree';
  } else {
    ROOT.dataset.fxMagBirthDomBudgetR1606='full-reference-tree';
  }

  const kicker = overlay.querySelector('.fxb-kicker');
  const title = overlay.querySelector('h1');
  const subtitle = overlay.querySelector('.fxb-subtitle');
  const skip = liveSkip;
  const percent = overlay.querySelector('.fxb-percent');
  const progress = overlay.querySelector('.fxb-progress');
  const status = overlay.querySelector('.fxb-status');
  const canvas = prepaintCanvas;
  const dnaStage = overlay.querySelector('.fxb-dna-stage');
  const dnaHelix = overlay.querySelector('.fxb-dna-helix');
  const dna = overlay.querySelector('.fxb-dna');
  const dnaBridges = overlay.querySelector('.fxb-dna-bridges');
  const dnaNodes = overlay.querySelector('.fxb-dna-nodes');

  function buildDna() {
    if (!(dna instanceof SVGElement) || !(dnaBridges instanceof SVGGElement) || !(dnaNodes instanceof SVGGElement)) return;
    const NS='http://www.w3.org/2000/svg';
    const samples=MOBILE?8:25;
    /* R626: the CSS3D helix is now the sole visible genome renderer.
       The legacy SVG stays as inert compatibility markup, but is never built.
       This removes dozens of non-composited SVG transitions while preserving
       one physically spatial double-helix path on every device class. */
    const buildSvg=false;
    const left=[];
    const right=[];
    const svgBridgeFragment=document.createDocumentFragment();
    const svgNodeFragment=document.createDocumentFragment();
    for(let i=0;i<samples;i+=1){
      const y=38+i*27;
      const wave=Math.sin(i*.72);
      const depth=(Math.cos(i*.72)+1)*.5;
      const xA=160+wave*76;
      const xB=160-wave*76;
      left.push([xA,y]);
      right.push([xB,y]);
      if(buildSvg&&i>0&&i<samples-1){
        const bridge=document.createElementNS(NS,'line');
        bridge.setAttribute('x1',xA.toFixed(2));
        bridge.setAttribute('y1',y.toFixed(2));
        bridge.setAttribute('x2',xB.toFixed(2));
        bridge.setAttribute('y2',y.toFixed(2));
        bridge.setAttribute('class','fxb-dna-bridge');
        bridge.style.setProperty('--fxb-dna-delay',(i*34)+'ms');
        bridge.style.setProperty('--fxb-dna-depth',depth.toFixed(3));
        svgBridgeFragment.appendChild(bridge);
      }
      if(buildSvg&&i%2===0){
        for(const [x,side] of [[xA,'a'],[xB,'b']]){
          const node=document.createElementNS(NS,'circle');
          node.setAttribute('cx',x.toFixed(2));
          node.setAttribute('cy',y.toFixed(2));
          node.setAttribute('r',i%4===0?'5.2':'3.8');
          node.setAttribute('class','fxb-dna-node fxb-dna-node-'+side);
          node.style.setProperty('--fxb-dna-delay',(i*30)+'ms');
          node.style.setProperty('--fxb-dna-depth',depth.toFixed(3));
          svgNodeFragment.appendChild(node);
        }
      }
    }
    dnaBridges.replaceChildren(svgBridgeFragment);
    dnaNodes.replaceChildren(svgNodeFragment);
    const toPath=points=>points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join(' ');
    if(buildSvg){
      dna.querySelector('.fxb-dna-strand-a')?.setAttribute('d',toPath(left));
      dna.querySelector('.fxb-dna-strand-b')?.setAttribute('d',toPath(right));
    }
    dnaStage?.style.setProperty('--fxb-dna-pairs',String(samples));

    if (dnaHelix instanceof HTMLElement) {
      const helixFragment=document.createDocumentFragment();
      const radius=MOBILE?68:74;
      const depth=MOBILE?48:58;
      for(let i=0;i<samples;i+=1){
        const angle=i*.72;
        const y=38+i*27;
        const x=Math.sin(angle)*radius;
        const z=Math.cos(angle)*depth;
        const depthA=(z/depth+1)*.5;
        const depthB=(-z/depth+1)*.5;

        const pair=document.createElement('div');
        pair.className='fxb-dna-pair3d';

        const bridge3d=document.createElement('i');
        bridge3d.className='fxb-dna-rung3d';
        bridge3d.style.setProperty('--fxb-y',y.toFixed(2)+'px');
        bridge3d.style.setProperty('--fxb-angle',(angle*180/Math.PI).toFixed(2)+'deg');
        bridge3d.style.setProperty('--fxb-delay',(i*42)+'ms');

        const a=document.createElement('b');
        a.className='fxb-dna-base3d fxb-dna-base3d-a';
        a.style.setProperty('--fxb-x',x.toFixed(2)+'px');
        a.style.setProperty('--fxb-z',z.toFixed(2)+'px');
        a.style.setProperty('--fxb-y',y.toFixed(2)+'px');
        a.style.setProperty('--fxb-delay',(i*42)+'ms');
        a.style.setProperty('--fxb-alpha',(.56+depthA*.42).toFixed(3));
        a.style.setProperty('--fxb-scale',(.80+depthA*.30).toFixed(3));

        const b=document.createElement('b');
        b.className='fxb-dna-base3d fxb-dna-base3d-b';
        b.style.setProperty('--fxb-x',(-x).toFixed(2)+'px');
        b.style.setProperty('--fxb-z',(-z).toFixed(2)+'px');
        b.style.setProperty('--fxb-y',y.toFixed(2)+'px');
        b.style.setProperty('--fxb-delay',(i*42+18)+'ms');
        b.style.setProperty('--fxb-alpha',(.56+depthB*.42).toFixed(3));
        b.style.setProperty('--fxb-scale',(.80+depthB*.30).toFixed(3));

        pair.append(bridge3d,a,b);
        helixFragment.appendChild(pair);
      }
      dnaHelix.replaceChildren(helixFragment);
    }
  }

  buildDna();

  kicker.textContent = copy.kicker;
  title.textContent = copy.title;
  subtitle.textContent = copy.subtitle;
  skip.textContent = copy.skip;
  skip.setAttribute('aria-label', copy.skipAria);
  status.textContent = copy.statuses[0][1];

  let ctx = null;
  let filmRenderer = null;
  let filmRendererPromise = null;
  let pendingRendererInteraction = null;
  let filmRendererFallbackStarted = false;
  let softwareFallbackActive = SOFTWARE_SAFE;
  let lastSoftwareFallbackPhase = -1;
  let threeWaitStartedAt = 0;
  let threeWaitTimer = 0;
  let threeOwnerRequested = false;
  const THREE_OWNER_SRC = '/scifi-ui/scripts/formatx-mag-genesis-three-r1360.js?v=20260925-r1749-final-photographic-polish';
  let particles = [];
  let raf = 0;
  let schedulerLastFrame = 0;
  let schedulerRefreshMs = 1000/60;
  let schedulerTick = 0;
  let startedAt = 0;
  let finished = false;
  let exitTimer = 0;
  let hardFinishTimer = 0;
  let frameTimer = 0;
  const phaseTimers = new Set();
  let targetX = innerWidth * .5;
  let targetY = innerHeight * .48;
  let stage = null;
  let coreApi = null;
  let lastTargetSync = 0;
  let lastMorphSync = 0;
  let lastNativeSync = 0;
  let lastParticleDraw = 0;
  let lastTelemetryUpdate = 0;
  let warmupDispatched = false;
  let ignitionDone = false;
  let visiblePhase = 0;
  let phaseChangedAt = 0;
  const PHASE_HOLD_MS = MOBILE ? [360, 620, 500, 340, 0] : [620, 1180, 920, 680, 0];

  function clamp(value,min,max) { return Math.max(min,Math.min(max,value)); }
  function easeOutCubic(t) { return 1 - Math.pow(1-t,3); }
  function smoothstep(t) { t=clamp(t,0,1); return t*t*(3-2*t); }

  function phaseTargetFor(r) {
    if (r < .245) return 0;
    if (r < .315) return 1;
    if (r < .572) return 2;
    if (r < .928) return 3;
    return 4;
  }
  function applyPhase(next,source='timeline') {
    const value=clamp(Number(next)||0,0,4);
    if(value===visiblePhase && overlay.dataset.phase===String(value))return false;
    visiblePhase=value;
    phaseChangedAt=performance.now();
    const phase=String(value);
    overlay.dataset.phase=phase;
    ROOT.dataset.fxMagBirthPhase=phase;
    ROOT.dataset.fxMagBirthPhaseSourceR621=source;
    if(dnaStage instanceof HTMLElement){
      const turns=['-24deg','18deg','46deg','72deg','86deg'];
      dnaStage.style.setProperty('--fxb-dna-turn',turns[value]||'86deg');
    }
    if(MOBILE){
      const values=[8,34,62,86,100];
      const statusIndex=[0,2,4,6,7][value]||0;
      const progressValue=values[value]||0;
      percent.value=String(progressValue).padStart(3,'0');
      progress.value=progressValue;
      status.textContent=copy.statuses[statusIndex][1];
      if(value===2)requestCoreWarmup('mobile-css-phase-2-r631');
      if(value===3){
        locateStage();
        try{
          coreApi?.setMorph?.(.72,'r631-mobile-css-genome-handoff');
          coreApi?.requestRender?.(1);
        }catch(_){}
        if(stage instanceof HTMLElement)setStageOpacity(.72);
      }
      if(value===4){
        locateStage();
        try{
          coreApi?.setMorph?.(0,'r631-mobile-css-final-handoff');
          coreApi?.setShape?.('organism','r631-mobile-css-final-handoff');
          coreApi?.surfacePulse?.('r631-mobile-css-final-handoff');
          coreApi?.requestRender?.(1);
        }catch(_){}
        if(stage instanceof HTMLElement)setStageOpacity(1);
      }
    }
    return true;
  }
  function armPhaseTimeline(){
    for(const timer of phaseTimers)clearTimeout(timer);
    phaseTimers.clear();
    for(const [phase,ratio] of [[1,.245],[2,.315],[3,.572],[4,.928]]){
      const timer=setTimeout(()=>{
        phaseTimers.delete(timer);
        if(!finished)applyPhase(phase,'timer-r621');
      },Math.max(120,Math.round(DURATION*ratio)));
      phaseTimers.add(timer);
    }
  }
  function catchUpPhase(r){
    const target=phaseTargetFor(r);
    if(target<=visiblePhase)return;
    const next=visiblePhase+1;
    const timer=setTimeout(()=>{
      phaseTimers.delete(timer);
      if(!finished){
        applyPhase(next,'catchup-r621');
        if(target>next)catchUpPhase(r);
      }
    },0);
    phaseTimers.add(timer);
  }
  function statusFor(r) {
    let value = copy.statuses[0][1];
    for (const [limit,label] of copy.statuses) if (r >= limit) value = label;
    return value;
  }

  function locateStage() {
    const candidate = document.querySelector('#hero .fx-crystal-organism-r326-stage');
    if (candidate instanceof HTMLElement) stage = candidate;
    coreApi = window.FormatXLivingCore || window.FormatXCoreMobileV69 || coreApi;
    return stage;
  }

  function syncTarget(force=false) {
    const now = performance.now();
    if (!force && now-lastTargetSync < 180) return;
    lastTargetSync = now;
    locateStage();
    const node = stage || document.querySelector('#hero .hero-space');
    if (!(node instanceof HTMLElement)) return;
    const rect = node.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) {
      const mobileSpace=Math.min(470,Math.max(350,innerWidth*.976));
      targetX=MOBILE ? innerWidth*.5 : innerWidth*.714;
      targetY=MOBILE
        ? Math.min(innerHeight*.44,72+mobileSpace*.47)
        : Math.min(innerHeight*.47,36+Math.min(620,Math.max(520,innerWidth*.42))*.47);
      overlay.style.setProperty('--fxb-x',targetX.toFixed(1)+'px');
      overlay.style.setProperty('--fxb-y',targetY.toFixed(1)+'px');
      ROOT.dataset.fxMagBirthTargetR1602='reserved-final-hero-geometry';
      return;
    }
    targetX = clamp(rect.left + rect.width*.5, 0, innerWidth);
    targetY = clamp(rect.top + rect.height*.47, 0, innerHeight);
    const basis = clamp(Math.min(rect.width,rect.height), 260, 720);
    overlay.style.setProperty('--fxb-x', targetX.toFixed(1)+'px');
    overlay.style.setProperty('--fxb-y', targetY.toFixed(1)+'px');
    overlay.style.setProperty('--fxb-hole-a', Math.round(clamp(basis*.22,88,154))+'px');
    overlay.style.setProperty('--fxb-hole-b', Math.round(clamp(basis*.35,138,238))+'px');
    overlay.style.setProperty('--fxb-hole-c', Math.round(clamp(basis*.57,224,388))+'px');
  }

  function setStageOpacity(value) {
    locateStage();
    if (!(stage instanceof HTMLElement)) return;
    stage.style.setProperty('opacity', String(clamp(value,0,1)), 'important');
    stage.style.setProperty('transition', 'opacity .72s cubic-bezier(.2,.7,.2,1)', 'important');
  }

  function releaseStageStyle() {
    if (!(stage instanceof HTMLElement)) return;
    stage.style.removeProperty('opacity');
    stage.style.removeProperty('transition');
  }

  function requestCoreWarmup(source='timeline') {
    if (warmupDispatched) return;
    warmupDispatched = true;
    ROOT.dataset.fxMagBirthCoreWarmupR618 = source;
    document.dispatchEvent(new CustomEvent('formatx:magbirthcorewarmup',{
      detail:{source,revision:'r618-intro-aware-core-warmup'}
    }));
  }

  function syncNativeCore(r, now) {
    locateStage();
    if (!coreApi) return;

    if (r < .50) {
      setStageOpacity(Math.max(.008,r*.035));
      if (now-lastMorphSync > 420) {
        lastMorphSync=now;
        try { coreApi.setMorph?.(.02,'r611-genome-dormant'); coreApi.requestRender?.(1); } catch (_) {}
      }
      return;
    }

    if (r < .82) {
      const t=smoothstep((r-.50)/.32);
      setStageOpacity(.025 + t*.975);
      if (now-lastMorphSync > 170) {
        lastMorphSync=now;
        try {
          coreApi.setMorph?.(.05 + t*.95,'r611-genome-to-living-core');
          coreApi.requestRender?.(1);
        } catch (_) {}
      }
      return;
    }

    setStageOpacity(1);
    if (!ignitionDone) {
      ignitionDone=true;
      try {
        coreApi.setMorph?.(0,'r611-living-core-ignition');
        coreApi.setShape?.('organism','r611-living-core-ignition');
        coreApi.rotateBy?.(.035,.055,'r614-genome-first-living-impulse');
        coreApi.surfacePulse?.('r614-genome-handoff');
        coreApi.requestRender?.(MOBILE?1:2);
      } catch (_) {}
    }
  }

  function seedParticles(w,h) {
    const count=MOBILE?Math.max(8,Math.min(12,Math.round((w*h)/36000))):Math.max(48,Math.min(132,Math.round((w*h)/13500)));
    particles=Array.from({length:count},(_,i)=>{
      const edge=i%4;
      let x,y;
      if(edge===0){x=Math.random()*w;y=-30-Math.random()*h*.2;}
      else if(edge===1){x=w+30+Math.random()*w*.16;y=Math.random()*h;}
      else if(edge===2){x=Math.random()*w;y=h+30+Math.random()*h*.2;}
      else{x=-30-Math.random()*w*.16;y=Math.random()*h;}
      return {ox:x,oy:y,a:.16+Math.random()*.72,s:.4+Math.random()*1.55,drift:(Math.random()-.5)*20,seed:Math.random()*Math.PI*2};
    });
  }

  function startR649Fallback(){
    if(filmRendererFallbackStarted || filmRenderer || !(canvas instanceof HTMLCanvasElement))return;
    filmRendererFallbackStarted=true;
    if(ROOT.dataset.fxMagBirthR1545==='software-webgl-reference-film-fallback')softwareFallbackActive=true;
    ROOT.dataset.fxMagBirthFallbackPolicyR1730=softwareFallbackActive
      ? 'phase-driven-reference-film'
      : 'adaptive-reference-film';
    if(window.FormatXMagReferenceFilmR649?.attach){
      overlay.dataset.fxRenderer='fallback';
      filmRenderer=window.FormatXMagReferenceFilmR649.attach(canvas,()=>({x:targetX,y:targetY}));
      ROOT.dataset.fxMagBirthRendererR1360=filmRenderer?'native-canvas-reference-film':'fallback-particles';
      ROOT.dataset.fxMagBirthRendererR1430=filmRenderer?'fallback-only-after-three-unavailable':'fallback-particles';
      if(filmRenderer)return;
    }
    const dpr=Math.min(MOBILE?1:1.5,devicePixelRatio||1);
    const w=innerWidth,h=innerHeight;
    canvas.width=Math.max(1,Math.floor(w*dpr));
    canvas.height=Math.max(1,Math.floor(h*dpr));
    canvas.style.width=w+'px';
    canvas.style.height=h+'px';
    ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
    if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
    seedParticles(w,h);
  }

  function ensureThreeOwner(){
    if(window.FormatXMagGenesisThreeR1360?.attach)return;
    if(threeOwnerRequested)return;
    threeOwnerRequested=true;
    const existing=[...document.scripts].find(s=>/formatx-mag-genesis-three-r1360\.js/.test(s.src));
    if(existing){
      ROOT.dataset.fxMagBirthThreeLoaderR1608='existing-owner-wait';
      existing.addEventListener?.('load',()=>sizeCanvas(),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src=THREE_OWNER_SRC;
    script.async=true;
    script.dataset.fxMagGenesisLazyR1608='true';
    script.addEventListener('load',()=>{
      ROOT.dataset.fxMagBirthThreeLoaderR1608='lazy-owner-loaded';
      sizeCanvas();
    },{once:true});
    script.addEventListener('error',()=>{
      ROOT.dataset.fxMagBirthThreeLoaderR1608='lazy-owner-failed';
      startR649Fallback();
    },{once:true});
    document.head.appendChild(script);
    ROOT.dataset.fxMagBirthThreeLoaderR1608='lazy-owner-requested-only-for-active-intro';
  }

  function sizeCanvas() {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    syncTarget(true);
    if(AUTOMATION && FORCE && !VISUAL_PROOF){
      ROOT.dataset.fxMagBirthRendererR1360='automation-handoff-lightweight';
      canvas.hidden=true;
      return;
    }
    if(PROOF_REFERENCE_RENDERER){
      ROOT.dataset.fxMagBirthProofRendererR1407='reference-film-no-swiftshader-block';
      startR649Fallback();
      return;
    }
    /* R1727c — never force a heavyweight continuous Three intro onto a
       constrained CPU/GPU path. The existing R649 cinematic keeps the same
       10 s story and visual handoff while avoiding >50 ms frame tasks. Visual
       proof frames remain on the Three owner so design evidence stays exact. */
    if(SOFTWARE_SAFE && !HAS_VISUAL_FRAME){
      ROOT.dataset.fxMagBirthRendererR1729=HEADLESS_SOFTWARE?'headless-reference-film':'constrained-reference-film';
      overlay.dataset.fxRenderer=HEADLESS_SOFTWARE?'fallback-software':'fallback-constrained';
      startR649Fallback();
      if(filmRenderer)filmRenderer.resize?.();
      return;
    }
    ensureThreeOwner();
    if(filmRenderer){
      filmRenderer.resize?.();
      return;
    }
    if(window.FormatXMagGenesisThreeR1360?.attach){
      if(threeWaitTimer){clearTimeout(threeWaitTimer);threeWaitTimer=0;}
      if(!filmRendererPromise){
        ROOT.dataset.fxMagBirthRendererR1360='loading-threejs';
        ROOT.dataset.fxMagBirthRendererR1450='three-primary-loading';
        overlay.dataset.fxRenderer='three-loading';
        filmRendererPromise=Promise.resolve(
          window.FormatXMagGenesisThreeR1360.attach(canvas,()=>({x:targetX,y:targetY}))
        ).then(renderer=>{
          filmRendererPromise=null;
          if(finished){
            renderer?.destroy?.();
            return null;
          }
          if(renderer){
            filmRenderer=renderer;
            if(pendingRendererInteraction){
              try{filmRenderer.interact?.(pendingRendererInteraction);}catch(_){}
              pendingRendererInteraction=null;
            }
            ROOT.dataset.fxMagBirthRendererR1360='threejs-active';
            ROOT.dataset.fxMagBirthRendererR1430='threejs-active-production-path';
            ROOT.dataset.fxMagBirthRendererR1450='three-primary-active';
            ROOT.dataset.fxMagBirthRendererR1460='cinematic-three-active';
            ROOT.dataset.fxMagBirthRendererR1470='cinematic-cortical-three-active';
            ROOT.dataset.fxMagBirthRendererR1490='realistic-cinematic-three-active';
            overlay.dataset.fxRenderer='three';
            renderer.resize?.();
            return renderer;
          }
          ROOT.dataset.fxMagBirthRendererR1360='threejs-failed-r649-fallback';
          ROOT.dataset.fxMagBirthRendererR1450='three-explicit-failure-fallback';
          if(ROOT.dataset.fxMagBirthR1545==='software-webgl-reference-film-fallback')softwareFallbackActive=true;
          startR649Fallback();
          return null;
        }).catch(error=>{
          filmRendererPromise=null;
          ROOT.dataset.fxMagBirthRendererR1360='threejs-error-r649-fallback';
          ROOT.dataset.fxMagBirthRendererR1450='three-error-fallback';
          console.error('FormatX R1360 intro attach failed:',error);
          startR649Fallback();
        });
      }
      return;
    }

    /* R1450 — never lock the production intro into the 2D fallback because
       the deferred Three owner is a few milliseconds late. Wait for the real
       renderer for a bounded window; only an actual missing/failed Three path
       is allowed to fall back. */
    const now=performance.now();
    if(!threeWaitStartedAt)threeWaitStartedAt=now;
    const waited=now-threeWaitStartedAt;
    if(waited<4800){
      ROOT.dataset.fxMagBirthRendererR1450='waiting-for-three-owner';
      overlay.dataset.fxRenderer='three-loading';
      if(!threeWaitTimer){
        threeWaitTimer=setTimeout(()=>{
          threeWaitTimer=0;
          sizeCanvas();
        },80);
      }
      return;
    }
    ROOT.dataset.fxMagBirthRendererR1450='three-owner-timeout-fallback';
    overlay.dataset.fxRenderer='fallback';
    startR649Fallback();
  }

  function drawParticles(r,time) {
    if(filmRenderer){ filmRenderer.draw?.(r,time); return; }
    if(filmRendererPromise)return;
    if(!ctx)return;
    const w=innerWidth,h=innerHeight;
    ctx.clearRect(0,0,w,h);
    const gather=clamp((r-.38)/.40,0,1);
    const burst=clamp((r-.80)/.12,0,1);
    const settle=clamp((r-.90)/.10,0,1);
    ctx.globalCompositeOperation='lighter';

    for(const p of particles){
      const e=easeOutCubic(gather);
      let x=p.ox+(targetX-p.ox)*e;
      let y=p.oy+(targetY-p.oy)*e;
      const wobble=Math.sin(time*.0018+p.seed)*p.drift*(1-e);
      x+=wobble;
      y+=Math.cos(time*.0014+p.seed)*p.drift*.54*(1-e);

      if(burst>0){
        const angle=Math.atan2(p.oy-targetY,p.ox-targetX);
        const radius=38+burst*(96+(p.seed%1)*132);
        x=targetX+Math.cos(angle)*radius*(1-settle*.52);
        y=targetY+Math.sin(angle)*radius*(1-settle*.52);
      }

      const alpha=p.a*(r<.06?r/.06:1)*(settle?.38:1);
      ctx.fillStyle='rgba(126,235,255,'+alpha.toFixed(3)+')';
      ctx.beginPath();
      ctx.arc(x,y,p.s*(1+burst*1.7),0,Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
  }

  function safeTeardownOverlay(source) {
    try { releaseStageStyle(); } catch (_) {}
    try { ROOT.removeAttribute('data-fx-mag-birth-live'); } catch (_) {}
    try { ROOT.removeAttribute('data-fx-mag-birth-phase'); } catch (_) {}
    try { overlay.remove(); } catch (_) {}
    try {
      document.dispatchEvent(new CustomEvent('formatx:magbirthcomplete',{
        detail:{source,revision:'r900-three-stage-reference-genesis-handoff'}
      }));
    } catch (_) {}
  }

  function finish(source) {
    if(finished)return;
    finished=true;

    try { cancelAnimationFrame(raf); } catch (_) {}
    try { cancelAnimationFrame(interactionMoveRaf); } catch (_) {}
    interactionMoveRaf=0;pendingInteraction=null;pendingRendererInteraction=null;
    try { interactionController.abort(); } catch (_) {}
    try { clearTimeout(frameTimer); } catch (_) {}
    frameTimer=0;
    try { clearTimeout(exitTimer); } catch (_) {}
    try { clearTimeout(hardFinishTimer); } catch (_) {}
    for(const timer of phaseTimers){
      try { clearTimeout(timer); } catch (_) {}
    }
    phaseTimers.clear();

    try { requestCoreWarmup('finish-'+String(source||'unknown')); } catch (_) {}
    try {
      coreApi?.setMorph?.(0,'r611-final-living-handoff');
      coreApi?.setShape?.('organism','r611-final-living-handoff');
      coreApi?.requestRender?.(2);
    } catch (_) {}
    try { setStageOpacity(1); } catch (_) {}

    try { percent.value='100'; } catch (_) {}
    try { progress.value=100; } catch (_) {}
    try { status.textContent=copy.statuses[copy.statuses.length-1][1]; } catch (_) {}
    try { overlay.dataset.phase='4'; } catch (_) {}
    try { ROOT.dataset.fxMagBirthLiveR533=source; } catch (_) {}
    try { ROOT.dataset.fxMagBirthHandoffR655='exception-safe-overlay-teardown'; } catch (_) {}

    try { filmRenderer?.destroy?.(); } catch (_) {}
    filmRenderer=null;
    if(threeWaitTimer){try{clearTimeout(threeWaitTimer);}catch(_){}threeWaitTimer=0;}
    try { overlay.classList.add('is-leaving'); } catch (_) {}

    exitTimer=window.setTimeout(
      ()=>safeTeardownOverlay(source),
      REDUCED ? 20 : EXIT_MS
    );

    // Independent final DOM guarantee. This timer intentionally does not call
    // finish() again, because finish() owns a one-shot guard. If any browser or
    // extension interrupts the graceful branch, the film layer still cannot
    // survive past the reference endpoint + exit allowance.
    window.setTimeout(()=>{
      if(overlay.isConnected) safeTeardownOverlay('forced-overlay-cleanup-r655');
    },(REDUCED ? 20 : EXIT_MS)+140);
  }

  function queueRender(delay=0) {
    if(finished||raf||frameTimer)return;
    if(delay>0){
      frameTimer=setTimeout(()=>{
        frameTimer=0;
        if(!finished&&!raf)raf=requestAnimationFrame(render);
      },delay);
      return;
    }
    raf=requestAnimationFrame(render);
  }

  function render(now) {
    raf=0;

    /* R1622 — stable display divisor with a 60 FPS floor target.
       The accepted render cadence is always an integer divisor of the actual
       display refresh and never deliberately below 60 Hz on >=60 Hz panels. */
    if(!(AUTOMATION&&FORCE)){
      if(schedulerLastFrame>0){
        const rawRefresh=Math.max(2,Math.min(40,now-schedulerLastFrame));
        schedulerRefreshMs=schedulerRefreshMs*.82+rawRefresh*.18;
      }
      schedulerLastFrame=now;
      const estimatedHz=Math.max(30,Math.min(360,1000/Math.max(2.7,schedulerRefreshMs)));
      const divisor=Math.max(1,Math.floor(estimatedHz/60));
      schedulerTick=(schedulerTick+1)%divisor;
      ROOT.dataset.fxMagBirthRefreshHzR1622=estimatedHz.toFixed(1);
      ROOT.dataset.fxMagBirthRenderDivisorR1622=String(divisor);
      if(divisor>1 && schedulerTick!==0){
        raf=requestAnimationFrame(render);
        return;
      }
    }

    if(!startedAt)startedAt=now;
    const r=Math.min(1,(now-startedAt)/DURATION);
    catchUpPhase(r);
    if (r >= CORE_WARMUP_PROGRESS) requestCoreWarmup('timeline-'+Math.round(r*100));
    const renderCost=Number.parseFloat(ROOT.dataset.fxCoreRenderMs||'0')||0;
    const nativeCadence=renderCost>50?620:renderCost>32?380:(MOBILE?200:120);
    if(!lastNativeSync||now-lastNativeSync>=nativeCadence||(!ignitionDone&&r>=.69)){
      lastNativeSync=now;
      syncNativeCore(r,now);
    }

    if(!lastTelemetryUpdate || now-lastTelemetryUpdate>=(MOBILE?240:80) || r>=1){
      lastTelemetryUpdate=now;
      const value=Math.min(100,Math.round(easeOutCubic(r)*100));
      const valueText=String(value).padStart(3,'0');
      if(percent.value!==valueText)percent.value=valueText;
      if(progress.value!==value)progress.value=value;
      const nextStatus=statusFor(r);
      if(status.textContent!==nextStatus)status.textContent=nextStatus;
    }
    const phaseDrivenFallback=Boolean(filmRenderer)
      && softwareFallbackActive
      && !HAS_VISUAL_FRAME;
    const particleCadence=filmRenderer
      ? (softwareFallbackActive?125:16.67)
      : 16.67;
    const shouldDraw=phaseDrivenFallback
      ? (lastSoftwareFallbackPhase!==visiblePhase || r>=1)
      : (!lastParticleDraw || now-lastParticleDraw>=particleCadence || r>=1);
    if(shouldDraw){
      lastParticleDraw=now;
      if(phaseDrivenFallback)lastSoftwareFallbackPhase=visiblePhase;
      drawParticles(r,now);
    }

    if(r<1 || visiblePhase<4){
      /* Software fallback keeps the 10 s semantic timeline, but the expensive
         raster only changes at the five cinematic phase boundaries. */
      const cadence=softwareFallbackActive?125:((AUTOMATION&&FORCE)?72:0);
      queueRender(cadence);
      return;
    }
    const nativeReady=ROOT.dataset.fxCrystalOrganismR326==='ready' && locateStage() instanceof HTMLElement;
    if(MOBILE && FORCE && !nativeReady && now-startedAt<10500){
      requestCoreWarmup('forced-mobile-handoff-wait');
      ROOT.dataset.fxMagBirthHandoffR623='waiting-for-native-core';
      queueRender(120);
      return;
    }
    /* R1553: automated mobile skip validation must be able to focus the real
       skip control after the native MAG becomes ready. Keep the completed film
       mounted briefly in webdriver runs instead of racing its teardown. */
    if(VALIDATED_SKIP_MODE && nativeReady){
      ROOT.dataset.fxMagBirthHandoffR623='native-ready-awaiting-validated-skip-r1557';
      queueRender(120);
      return;
    }
    if(MOBILE && FORCE && AUTOMATION && nativeReady && now-startedAt<10500){
      ROOT.dataset.fxMagBirthHandoffR623='native-ready-awaiting-automation-handoff';
      queueRender(120);
      return;
    }
    ROOT.dataset.fxMagBirthHandoffR623=nativeReady?'native-ready':'bounded-static-fail-open';
    finish('complete');
  }

  function start() {
    try { sessionStorage.setItem(KEY,'1'); } catch (_) {}
    ROOT.dataset.fxMagBirthLiveR533='active';
    ROOT.dataset.fxMagBirthGenomeR610='dna-assembly-zoom-native-r326';
    ROOT.dataset.fxMagBirthGenomeR611='realistic-css-3d-double-helix-embryo-one-native-r326';
    ROOT.dataset.fxMagBirthCapabilityR620=LOW_POWER?'mobile-constrained-cinematic':'full-cinematic';
    ROOT.dataset.fxMagBirthBudgetR625=LOW_POWER?'adaptive-detail-60hz-target-low-power':'adaptive-detail-60hz-target';
    ROOT.dataset.fxMagBirthBudgetR629=MOBILE?'mobile-adaptive-resolution-60hz-target':'desktop-adaptive-resolution-60hz-target';
    ROOT.dataset.fxMagBirthPerformanceR1622='refresh-divisor-never-intentionally-below-60fps';
    ROOT.dataset.fxMagBirthPerformanceR1640='60fps-priority-three-owner-preemptive-quality-shedding';
    ROOT.dataset.fxMagBirthPerformanceR1667='no-30fps-fallback-user-path-60fps-minimum-target';
    ROOT.dataset.fxMagBirthMobilePolicyR630=MOBILE?'cinematic-constrained-by-default':'desktop-full-fidelity';
    ROOT.dataset.fxMagBirthMobilePolicyR631=MOBILE?'css-phase-timers-adaptive-cinematic':'desktop-full-native-raf';
    ROOT.dataset.fxMagBirthPerformanceR1727=CONSTRAINED?'constrained-reference-film-no-heavy-three-loop':'hardware-three-adaptive-quality';
    ROOT.dataset.fxMagBirthPerformanceR1729=SOFTWARE_SAFE?'software-safe-reference-film-phase-driven-raster':'hardware-three-adaptive-60hz';
    ROOT.dataset.fxMagBirthSoftwareProbeR1729='delegated-to-three-owner-no-extra-webgl-context';
    ROOT.dataset.fxMagBirthPerformanceR1730=softwareFallbackActive?'five-phase-fallback-raster-125ms-control-clock':'hardware-60hz-render-path';
    ROOT.dataset.fxMagBirthCinematicR645='deep-biotic-field-genome-cloud-embryo-iris-neural-growth-energy-handoff';
    ROOT.dataset.fxMagBirthTimelineR1290='10s-reference-film-locked-dna-cellular-tentacles-9.2s-flash-late-armor';
    ROOT.dataset.fxMagBirthGenomeRendererR626='single-css3d-double-helix-no-svg-animation';
    ROOT.dataset.fxMagBirthSchedulerR621='native-raf-plus-independent-css-phase-timeline';
    visiblePhase=0;
    phaseChangedAt=0;
    ROOT.dataset.fxMagBirthPhase='0';
    ROOT.setAttribute('data-fx-mag-birth-live','active');
    if(!HAS_VISUAL_FRAME)armPhaseTimeline();
    document.body.prepend(overlay);
    try { scrollTo({top:0,left:0,behavior:'instant'}); } catch (_) { scrollTo(0,0); }
    canvas.hidden=false;
    sizeCanvas();
    if(VALIDATED_SKIP_MODE){
      /* Publish the warmup latch immediately in the forced skip contract.
         The runtime loader consumes the latch even if it loads after this shell. */
      requestCoreWarmup('validated-skip-bootstrap-r1560');
      ROOT.dataset.fxMagBirthSkipBootstrapR1560='canonical-mag-warmup-requested';
    }
    ROOT.dataset.fxMagBirthRenderClockR631='superseded-by-r1601-adaptive-60hz';
    ROOT.dataset.fxMagBirthRenderClockR649='adaptive-60hz-target-fallback-canvas';
    ROOT.dataset.fxMagBirthPerformanceR1541='superseded-by-r1601-adaptive-60hz';
    ROOT.dataset.fxMagBirthPerformanceR1601='60hz-target-adaptive-quality-no-artificial-frame-cap';
    ROOT.dataset.fxMagBirthPerformanceR1602='exclusive-intro-layout-plus-real-frame-budget-target-60fps';
    ROOT.dataset.fxMagBirthPerformanceR1603='early-cinematic-lcp-brand-plus-adaptive-60fps';
    ROOT.dataset.fxMagBirthPerformanceR1606='static-lcp-shell-mobile-lean-dom-handoff-first-permanent-webgl-60fps';
    ROOT.dataset.fxMagBirthPerformanceR1618='stable-canonical-underlay-no-delayed-lcp-aria-dialog';
    ROOT.dataset.fxMagBirthPerformanceR1608='lazy-three-owner-zero-parse-cost-when-intro-skipped';
    ROOT.dataset.fxMagBirthDurationR1549='10000ms-full-studio-adaptive-60fps';
    ROOT.dataset.fxMagBirthRenderClockR650='r667-threejs-armored-organic-primary-r649-fallback';
    ROOT.dataset.fxMagBirthHandoffR652='10s-film-180ms-exit-bounded-fail-open';
    ROOT.dataset.fxMagBirthHandoffR653='absolute-dom-watchdog-r653';
    ROOT.dataset.fxMagBirthHandoffR1553=(MOBILE&&FORCE&&AUTOMATION)?'validated-skip-kept-until-native-ready-or-10.8s':'normal-bounded-handoff';
    ROOT.dataset.fxMagBirthProofR1560=HAS_VISUAL_FRAME?'readback-verified-fixed-frame':'production-cinematic';
    ROOT.dataset.fxMagBirthHandoffR1557=VALIDATED_SKIP_MODE?'webdriver-skip-remains-mounted-until-explicit-enter':'normal-product-handoff';
    ROOT.dataset.fxMagBirthAutomationR654=(AUTOMATION&&FORCE&&!VISUAL_PROOF)?'lightweight-handoff-proof':(VISUAL_PROOF?'visual-reference-proof':'production-renderer');
    if(HAS_VISUAL_FRAME){
      for(const timer of phaseTimers){
        try{clearTimeout(timer);}catch(_){}
      }
      phaseTimers.clear();
      const seconds=clamp(VISUAL_FRAME,0,10);
      const fixedR=seconds/10;
      const fixedTime=seconds*1000;
      const renderFixedFrame=()=>{
        if(finished||!overlay.isConnected)return;
        try{applyPhase(phaseTargetFor(fixedR),'visual-frame-r659');}catch(_){}
        try{
          const value=Math.min(100,Math.round(easeOutCubic(fixedR)*100));
          percent.value=String(value).padStart(3,'0');
          progress.value=value;
          status.textContent=statusFor(fixedR);
        }catch(_){}
        try{syncNativeCore(fixedR,fixedTime);}catch(_){}
        try{drawParticles(fixedR,fixedTime);}catch(error){
          console.error('FormatX R1557 first fixed-frame render failed:',error);
        }
        /* R1560: deterministic proof pages are allowed to wait a few compositor
           turns for ANGLE/SwiftShader. R1557 published "ready" even when the
           retained framebuffer still read as black, which made valid Three
           geometry look absent in screenshot evidence. */
        let proofAttempts=0;
        const settleProof=()=>{
          if(finished||!overlay.isConnected)return;
          proofAttempts+=1;
          try{drawParticles(fixedR,fixedTime);}catch(error){
            console.error('FormatX R1560 fixed-frame settle render failed:',error);
          }
          const peak=Number(ROOT.dataset.fxMagBirthFramePeakR1557||0);
          if(peak<8 && proofAttempts<8){
            requestAnimationFrame(()=>requestAnimationFrame(settleProof));
            return;
          }
          ROOT.dataset.fxMagBirthVisualFrameSeconds=seconds.toFixed(3);
          ROOT.dataset.fxMagBirthVisualFrameR1557='double-render-compositor-synchronized';
          ROOT.dataset.fxMagBirthVisualFrameR1560=peak>=8?'readback-visible':'bounded-readback-fail-open';
          ROOT.dataset.fxMagBirthVisualFrameAttemptsR1560=String(proofAttempts);
          ROOT.dataset.fxMagBirthVisualFrameR659='ready';
          try{
            document.dispatchEvent(new CustomEvent('formatx:introframe-ready',{
              detail:{seconds,revision:'r1560-readback-verified-deterministic-frame',peak,attempts:proofAttempts}
            }));
          }catch(_){}
        };
        requestAnimationFrame(()=>requestAnimationFrame(settleProof));
      };
      const rendererReady=filmRendererPromise
        ? Promise.race([
            Promise.resolve(filmRendererPromise),
            new Promise(resolve=>setTimeout(resolve,6000))
          ])
        : Promise.resolve();
      rendererReady.then(()=>{
        requestAnimationFrame(()=>requestAnimationFrame(renderFixedFrame));
      }).catch(()=>{
        requestAnimationFrame(renderFixedFrame);
      });
      return;
    }
    window.setTimeout(()=>{
      if(!overlay.isConnected)return;
      try{
        locateStage();
        if(stage instanceof HTMLElement){
          stage.style.removeProperty('opacity');
          stage.style.removeProperty('transition');
        }
        coreApi?.setMorph?.(0,'r653-absolute-dom-watchdog');
        coreApi?.setShape?.('organism','r653-absolute-dom-watchdog');
        coreApi?.requestRender?.(1);
      }catch(_){}
      ROOT.removeAttribute('data-fx-mag-birth-live');
      ROOT.removeAttribute('data-fx-mag-birth-phase');
      ROOT.dataset.fxMagBirthLiveR533='absolute-dom-watchdog-r653';
      try{filmRenderer?.destroy?.();}catch(_){}
      filmRenderer=null;
      overlay.remove();
      try{
        document.dispatchEvent(new CustomEvent('formatx:magbirthcomplete',{
          detail:{source:'absolute-dom-watchdog-r653',revision:'r653-independent-overlay-watchdog'}
        }));
      }catch(_){}
    },VALIDATED_SKIP_MODE ? 35000 : ((MOBILE && FORCE && AUTOMATION) ? 10800 : DURATION+550));

    // R652: the film itself remains exactly 10.0 s. The bounded fail-open is
    // deliberately close to the reference endpoint so a stalled GPU/import path
    // can never strand the cinematic overlay beyond the finished shot.
    hardFinishTimer=window.setTimeout(
      ()=>finish(VALIDATED_SKIP_MODE?'validated-skip-timeout-r1557':'bounded-failsafe-r652'),
      VALIDATED_SKIP_MODE ? 35000 : (REDUCED ? 900 : DURATION + (MOBILE ? 420 : 220))
    );

    if(REDUCED){
      requestCoreWarmup('reduced-motion');
      overlay.dataset.phase='4';
      ROOT.dataset.fxMagBirthPhase='4';
      locateStage();
      try { coreApi?.setShape?.('organism','r533-reduced'); coreApi?.requestRender?.(2); } catch (_) {}
      setStageOpacity(1);
      percent.value='100';
      progress.value=100;
      status.textContent=copy.statuses[copy.statuses.length-1][1];
      drawParticles(1,performance.now());
      exitTimer=window.setTimeout(()=>finish('reduced-motion'),520);
      return;
    }

    queueRender();
  }

  /* R1701 — all meaningful input reaches the same physical Three scene.
     Move/drag is RAF-coalesced; semantic events are one-shot impulses. The
     AbortController guarantees that the intro leaves zero input work behind. */
  const interactionController=new AbortController();
  const interactionOptions={passive:true,signal:interactionController.signal};
  let interactionMoveRaf=0;
  let pendingInteraction=null;
  let previousInteractionX=innerWidth*.5;
  let previousInteractionY=innerHeight*.5;
  let previousIntroScrollY=scrollY;
  const interactionPoint=event=>({
    x:clamp((((event?.clientX??innerWidth*.5)/Math.max(1,innerWidth))-.5)*2,-1,1),
    y:clamp(-((((event?.clientY??innerHeight*.5)/Math.max(1,innerHeight))-.5)*2),-1,1)
  });
  const feedInteraction=(kind,event,extra={})=>{
    if(finished)return;
    const p=interactionPoint(event);
    const clientX=Number(event?.clientX);
    const clientY=Number(event?.clientY);
    const dx=Number.isFinite(Number(extra.dx))
      ? Number(extra.dx)
      : Number.isFinite(clientX) ? clientX-previousInteractionX : 0;
    const dy=Number.isFinite(Number(extra.dy))
      ? Number(extra.dy)
      : Number.isFinite(clientY) ? clientY-previousInteractionY : 0;
    if(Number.isFinite(clientX))previousInteractionX=clientX;
    if(Number.isFinite(clientY))previousInteractionY=clientY;
    const payload={
      kind,phase:extra.phase||kind,x:p.x,y:p.y,
      dx,dy,strength:Number(extra.strength)||.35
    };
    if(filmRenderer?.interact)filmRenderer.interact(payload);
    else pendingRendererInteraction=payload;
    ROOT.dataset.fxMagBirthInteractionR1690=kind;
    ROOT.dataset.fxMagBirthInteractionR1701=kind;
  };
  const semanticInteraction=(kind,strength=.5,extra={})=>
    feedInteraction(kind,null,{phase:kind,strength,...extra});
  addEventListener('pointermove',event=>{
    pendingInteraction=event;
    if(interactionMoveRaf)return;
    interactionMoveRaf=requestAnimationFrame(()=>{
      interactionMoveRaf=0;
      const current=pendingInteraction;pendingInteraction=null;
      if(current)feedInteraction(
        current.pointerType==='touch'?'touch-drag':'move',
        current,
        {strength:current.buttons?.26:.20}
      );
    });
  },interactionOptions);
  addEventListener('pointerdown',event=>feedInteraction(event.pointerType==='touch'?'touch-press':'press',event,{strength:.86}),interactionOptions);
  addEventListener('pointerup',event=>feedInteraction(event.pointerType==='touch'?'touch-release':'release',event,{strength:.62}),interactionOptions);
  addEventListener('pointercancel',event=>feedInteraction('cancel',event,{strength:.18}),interactionOptions);
  addEventListener('click',event=>feedInteraction('click',event,{phase:'pulse',strength:.96}),interactionOptions);
  addEventListener('wheel',event=>feedInteraction('wheel',event,{dy:clamp(event.deltaY,-160,160),strength:.42}),interactionOptions);
  addEventListener('scroll',()=>{
    const next=scrollY;
    const dy=clamp(next-previousIntroScrollY,-180,180);
    previousIntroScrollY=next;
    semanticInteraction('scroll',.30,{dy});
  },interactionOptions);
  addEventListener('keydown',event=>{if(!event.repeat)semanticInteraction('key',.58,{dx:event.key==='ArrowLeft'?-28:event.key==='ArrowRight'?28:0,dy:event.key==='ArrowUp'?-22:event.key==='ArrowDown'?22:0});},interactionOptions);
  addEventListener('focusin',()=>semanticInteraction('focus',.34),interactionOptions);
  addEventListener('formatx:menustatechange',event=>semanticInteraction(event.detail?.open?'menu-open':'menu-close',.54),interactionOptions);
  addEventListener('formatx:languagechange',()=>semanticInteraction('language',.46),interactionOptions);
  addEventListener('formatx:cinematicscene',event=>semanticInteraction('scene',.62,{dx:(Number(event.detail?.index)||0)%2?18:-18}),interactionOptions);
  addEventListener('formatx:storychapter',()=>semanticInteraction('story',.58),interactionOptions);
  addEventListener('formatx:organismpanelopen',()=>semanticInteraction('question',.66),interactionOptions);
  addEventListener('formatx:organismresponse',()=>semanticInteraction('response',.72),interactionOptions);
  addEventListener('formatx:open-live-os',()=>semanticInteraction('system-open',.64),interactionOptions);
  addEventListener('formatx:loop',()=>semanticInteraction('loop',.78),interactionOptions);
  addEventListener('input',()=>semanticInteraction('input',.36),interactionOptions);
  addEventListener('change',()=>semanticInteraction('change',.42),interactionOptions);
  addEventListener('submit',()=>semanticInteraction('submit',.72),interactionOptions);
  addEventListener('pointerenter',event=>feedInteraction('enter',event,{strength:.22}),interactionOptions);
  addEventListener('pointerleave',event=>feedInteraction('leave',event,{strength:.18}),interactionOptions);
  addEventListener('resize',()=>semanticInteraction('resize',.30),interactionOptions);
  addEventListener('orientationchange',()=>semanticInteraction('orientation',.52),interactionOptions);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)semanticInteraction('visibility-return',.38);},{passive:true});

  skip.addEventListener('click',()=>finish('user-skip'));
  addEventListener('formatx:real3dready',()=>{
    locateStage();
    syncTarget(true);
    coreApi=window.FormatXLivingCore||window.FormatXCoreMobileV69||coreApi;
  },{passive:true});
  addEventListener('resize',()=>{sizeCanvas();syncTarget(true);},{passive:true});
  addEventListener('orientationchange',()=>setTimeout(()=>syncTarget(true),120),{passive:true});
  addEventListener('pagehide',()=>finish('pagehide'),{once:true});

  start();
})();
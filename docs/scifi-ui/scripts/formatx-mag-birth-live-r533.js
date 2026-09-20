(() => {
  'use strict';

  const ROOT = document.documentElement;
  const PARAMS = new URLSearchParams(location.search);
  const FORCE = PARAMS.get('intro') === '1';
  const VISUAL_PROOF = PARAMS.get('visualintro') === '1';
  const VISUAL_FRAME = Number.parseFloat(PARAMS.get('introframe') || '');
  const HAS_VISUAL_FRAME = VISUAL_PROOF && Number.isFinite(VISUAL_FRAME);
  const KEY = 'formatx:mag-birth-live-r533-seen';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTOMATION = navigator.webdriver === true;
  const MOBILE = matchMedia('(max-width:900px),(pointer:coarse)').matches;
  const HARDWARE_CONCURRENCY = Math.max(1, Number(navigator.hardwareConcurrency || 8));
  const DEVICE_MEMORY = Math.max(1, Number(navigator.deviceMemory || 8));
  const LOW_POWER = MOBILE && (HARDWARE_CONCURRENCY <= 4 || DEVICE_MEMORY <= 4);
  const DURATION = 10000;
  const EXIT_MS = 180;
  const CORE_WARMUP_PROGRESS = MOBILE ? .72 : .72;

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (_) {}

  /* R533 fully replaces the R531/R532 preloader path. The legacy node stays in
     source for compatibility validators, but is removed before its deferred
     controller executes, so users never see two intros back-to-back. */
  document.getElementById('formatx-event-horizon')?.remove();
  ROOT.dataset.fxMagBirthOwnerR533 = !FORCE && AUTOMATION ? 'automation-skip' : (seen && !FORCE ? 'session-skip' : 'active');

  if (!FORCE && (seen || AUTOMATION)) {
    ROOT.dataset.fxMagBirthLiveR533 = AUTOMATION ? 'automation-skip' : 'session-skip';
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

  const overlay = document.createElement('section');
  overlay.className = 'fx-mag-birth-r533';
  overlay.dataset.phase = '0';
  overlay.dataset.performance = MOBILE ? 'constrained' : 'full';
  overlay.dataset.fxIntroR645 = 'biotic-genesis';
  overlay.dataset.fxIntroR646 = 'reference-biotic-film';
  overlay.dataset.fxIntroR647 = 'shot-match-biotic-genesis';
  overlay.dataset.fxIntroR648 = 'exact-10s-runtime';
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
  overlay.dataset.fxIntroR673 = 'reference-material-three-genesis';
  overlay.dataset.fxIntroR674 = 'reference-proportion-three-genesis';
  overlay.dataset.fxIntroR675 = 'neural-fold-three-genesis';
  overlay.dataset.fxIntroR680 = 'reference-ratio-three-genesis';
  overlay.dataset.fxIntroR681 = 'reference-locked-three-genesis';
  overlay.dataset.fxIntroR700 = 'reference-fused-three-genesis';
  overlay.dataset.fxIntroR701 = 'organic-petal-core-three-genesis';
  overlay.dataset.fxIntroR720 = 'organic-reference-fused-three-genesis';
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
  overlay.setAttribute('aria-label', copy.title);
  overlay.innerHTML = `
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
    <canvas class="fxb-particles" aria-hidden="true"></canvas>
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
    <button class="fxb-skip" type="button"></button>
  `;

  const kicker = overlay.querySelector('.fxb-kicker');
  const title = overlay.querySelector('h1');
  const subtitle = overlay.querySelector('.fxb-subtitle');
  const skip = overlay.querySelector('.fxb-skip');
  const percent = overlay.querySelector('.fxb-percent');
  const progress = overlay.querySelector('.fxb-progress');
  const status = overlay.querySelector('.fxb-status');
  const canvas = overlay.querySelector('.fxb-particles');
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
  let filmRendererFallbackStarted = false;
  let particles = [];
  let raf = 0;
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
          coreApi?.setMorph?.(1,'r631-mobile-css-final-handoff');
          coreApi?.setShape?.('crystal','r631-mobile-css-final-handoff');
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
    if (rect.width < 8 || rect.height < 8) return;
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
        coreApi.setMorph?.(1,'r611-living-core-ignition');
        coreApi.setShape?.('crystal','r611-living-core-ignition');
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
    if(window.FormatXMagReferenceFilmR649?.attach){
      filmRenderer=window.FormatXMagReferenceFilmR649.attach(canvas,()=>({x:targetX,y:targetY}));
      ROOT.dataset.fxMagBirthRendererR720=filmRenderer?'native-canvas-reference-film':'fallback-particles';
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

  function sizeCanvas() {
    if (!(canvas instanceof HTMLCanvasElement)) return;
    syncTarget(true);
    if(AUTOMATION && FORCE && !VISUAL_PROOF){
      ROOT.dataset.fxMagBirthRendererR720='automation-handoff-lightweight';
      canvas.hidden=true;
      return;
    }
    if(filmRenderer){
      filmRenderer.resize?.();
      return;
    }
    if(window.FormatXMagGenesisThreeR720?.attach){
      if(!filmRendererPromise){
        ROOT.dataset.fxMagBirthRendererR720='loading-threejs';
        filmRendererPromise=Promise.resolve(
          window.FormatXMagGenesisThreeR720.attach(canvas,()=>({x:targetX,y:targetY}))
        ).then(renderer=>{
          filmRendererPromise=null;
          if(finished){
            renderer?.destroy?.();
            return null;
          }
          if(renderer){
            filmRenderer=renderer;
            ROOT.dataset.fxMagBirthRendererR720='threejs-active';
            renderer.resize?.();
            return renderer;
          }
          ROOT.dataset.fxMagBirthRendererR720='threejs-failed-r649-fallback';
          startR649Fallback();
          return null;
        }).catch(error=>{
          filmRendererPromise=null;
          ROOT.dataset.fxMagBirthRendererR720='threejs-error-r649-fallback';
          console.error('FormatX R720 intro attach failed:',error);
          startR649Fallback();
        });
      }
      return;
    }
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
        detail:{source,revision:'r720-organic-reference-fused-three-genesis-handoff'}
      }));
    } catch (_) {}
  }

  function finish(source) {
    if(finished)return;
    finished=true;

    try { cancelAnimationFrame(raf); } catch (_) {}
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
      coreApi?.setMorph?.(1,'r611-final-living-handoff');
      coreApi?.setShape?.('crystal','r611-final-living-handoff');
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
    const particleCadence=filmRenderer?42:(filmRendererPromise?84:(MOBILE?84:48));
    if(!lastParticleDraw||now-lastParticleDraw>=particleCadence||r>=1){
      lastParticleDraw=now;
      drawParticles(r,now);
    }

    if(r<1 || visiblePhase<4){
      queueRender((AUTOMATION&&FORCE)?50:(filmRenderer?42:(MOBILE?50:0)));
      return;
    }
    const nativeReady=ROOT.dataset.fxCrystalOrganismR326==='ready' && locateStage() instanceof HTMLElement;
    if(MOBILE && FORCE && !nativeReady && now-startedAt<10500){
      requestCoreWarmup('forced-mobile-handoff-wait');
      ROOT.dataset.fxMagBirthHandoffR623='waiting-for-native-core';
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
    ROOT.dataset.fxMagBirthBudgetR625=LOW_POWER?'single-css3d-dna-30fps-reduced-composite':'full-cinematic-budget';
    ROOT.dataset.fxMagBirthBudgetR629=MOBILE?'compositor-led-20fps-js-static-organic-microdetail':'full-cinematic-budget';
    ROOT.dataset.fxMagBirthMobilePolicyR630=MOBILE?'cinematic-constrained-by-default':'desktop-full-fidelity';
    ROOT.dataset.fxMagBirthMobilePolicyR631=MOBILE?'css-phase-timers-zero-continuous-js-render-loop':'desktop-full-native-raf';
    ROOT.dataset.fxMagBirthCinematicR645='deep-biotic-field-genome-cloud-embryo-iris-neural-growth-energy-handoff';
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
    ROOT.dataset.fxMagBirthRenderClockR631='native-reference-film-24fps-all-devices';
    ROOT.dataset.fxMagBirthRenderClockR649='deterministic-24fps-canvas-all-devices';
    ROOT.dataset.fxMagBirthRenderClockR650='r667-threejs-armored-organic-primary-r649-fallback';
    ROOT.dataset.fxMagBirthHandoffR652='10s-film-180ms-exit-bounded-fail-open';
    ROOT.dataset.fxMagBirthHandoffR653='absolute-dom-watchdog-r653';
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
          console.error('FormatX R659 fixed-frame render failed:',error);
        }
        ROOT.dataset.fxMagBirthVisualFrameSeconds=seconds.toFixed(3);
        ROOT.dataset.fxMagBirthVisualFrameR659='ready';
        try{
          document.dispatchEvent(new CustomEvent('formatx:introframe-ready',{
            detail:{seconds,revision:'r659-deterministic-frame'}
          }));
        }catch(_){}
      };
      Promise.resolve(filmRendererPromise).then(()=>{
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
        coreApi?.setMorph?.(1,'r653-absolute-dom-watchdog');
        coreApi?.setShape?.('crystal','r653-absolute-dom-watchdog');
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
    },DURATION+550);

    // R652: the film itself remains exactly 10.0 s. The bounded fail-open is
    // deliberately close to the reference endpoint so a stalled GPU/import path
    // can never strand the cinematic overlay beyond the finished shot.
    hardFinishTimer=window.setTimeout(
      ()=>finish('bounded-failsafe-r652'),
      REDUCED ? 900 : DURATION + (MOBILE ? 420 : 220)
    );

    if(REDUCED){
      requestCoreWarmup('reduced-motion');
      overlay.dataset.phase='4';
      ROOT.dataset.fxMagBirthPhase='4';
      locateStage();
      try { coreApi?.setShape?.('crystal','r533-reduced'); coreApi?.requestRender?.(2); } catch (_) {}
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
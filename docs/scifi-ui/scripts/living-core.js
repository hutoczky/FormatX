import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js';

const NODE_DATA = Object.freeze([
  {
    title: 'ISO → USB',
    kicker: 'WRITE & VERIFY',
    accent: '#6eeaff',
    position: [-2.72, 1.25, 0.18],
    description: 'Blokkszintű képfájl-írás, célmeghajtó-azonosítás és visszaolvasásos integritás-ellenőrzés egyetlen ellenőrzött munkafolyamatban.',
    metrics: [['HASH ENGINE', 'SHA-256'], ['WRITE MODE', 'BLOCK STREAM'], ['VERIFY', 'READ-BACK'], ['BOOT MAP', 'UEFI / HYBRID']],
    log: ['Célmeghajtó ujjlenyomat rögzítve', 'Képfájl-struktúra előellenőrizve', 'Írási sor és visszaolvasás készenlétben']
  },
  {
    title: 'Formázás',
    kicker: 'MULTI-FS ENGINE',
    accent: '#43f0b1',
    position: [2.72, 1.18, -0.08],
    description: 'Fájlrendszer-, címke-, klaszter- és igazítási paraméterek összehangolt kezelése a célplatform és az adathordozó képességei alapján.',
    metrics: [['FILESYSTEMS', 'FAT32 / NTFS'], ['EXTENDED FS', 'EXFAT / EXT4'], ['ALIGNMENT', '1 MiB'], ['MODE', 'QUICK / FULL']],
    log: ['Eszközképességek beolvasva', 'Fájlrendszer-opciók szűrve', 'Végrehajtási terv ellenőrzésre kész']
  },
  {
    title: 'Partíciótervező',
    kicker: 'PLAN & PREVIEW',
    accent: '#6eeaff',
    position: [-3.04, -0.3, 0.34],
    description: 'A partíciós műveletek végrehajtás előtt vizuális tervvé állnak össze, így a méret, sorrend, igazítás és rendszerpartíciók egyetlen nézetben ellenőrizhetők.',
    metrics: [['TABLE', 'GPT / MBR'], ['PREVIEW', 'NON-DESTRUCTIVE'], ['ALIGNMENT', 'SECTOR SAFE'], ['GUARD', 'CONFLICT SCAN']],
    log: ['Jelenlegi partíciós tábla feltérképezve', 'Ütközések észlelése aktív', 'Előnézet nem módosítja a lemezt']
  },
  {
    title: 'Biztonságos törlés',
    kicker: 'CONFIRM & ERASE',
    accent: '#ff6075',
    position: [3.02, -0.38, 0.26],
    description: 'Többlépcsős célazonosítás, kockázati kapuk és egyértelmű megerősítés választja el a tervet a visszafordíthatatlan törlési művelettől.',
    metrics: [['TARGET LOCK', 'FINGERPRINT'], ['CONFIRM', 'MULTI-STAGE'], ['ERASE', 'DEVICE AWARE'], ['AUDIT', 'EVENT LOG']],
    log: ['Rendszermeghajtó-védelem aktív', 'Célazonosító összehasonlítva', 'Végrehajtás explicit jóváhagyásra vár']
  },
  {
    title: 'SMART Diagnosztika',
    kicker: 'READ & ANALYSE',
    accent: '#43f0b1',
    position: [-2.36, -1.72, -0.1],
    description: 'SMART, NVMe és hőmérsékleti telemetria értelmezése kizárólag olvasási módban, közérthető állapotjelzéssel és nyers mérési részletekkel.',
    metrics: [['PROTOCOL', 'SMART / NVMe'], ['MODE', 'READ ONLY'], ['HEALTH', 'NORMALISED'], ['THERMAL', 'LIVE SENSOR']],
    log: ['Attribútumkészlet beolvasva', 'Kopás- és hibajelzők normalizálva', 'Diagnosztikai összefoglaló frissítve']
  },
  {
    title: 'AI Segítség',
    kicker: 'EXPLAIN & GUIDE',
    accent: '#a98cff',
    position: [2.34, -1.7, 0.02],
    description: 'A technikai állapotokat, hibakódokat és műveleti kockázatokat magyarázó réteg, amely javaslatot ad, de a veszélyes műveletek kontrollját nem veszi át.',
    metrics: [['CONTEXT', 'SYSTEM AWARE'], ['OUTPUT', 'EXPLAINABLE'], ['CONTROL', 'HUMAN GATE'], ['RISK', 'VISIBLE']],
    log: ['Aktív rendszerkontextus összeállítva', 'Kockázati korlátok alkalmazva', 'Magyarázó válaszcsatorna készen áll']
  }
]);

const MOBILE_HUD_ANCHORS = Object.freeze([
  [0.24, 0.37], [0.76, 0.37],
  [0.20, 0.52], [0.80, 0.52],
  [0.26, 0.67], [0.74, 0.67]
]);

const RELEASE_API = '/api/public-release';
const RELEASE_DOWNLOAD = '/download/multiplatform';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class LivingCoreSynth {
  constructor(button) {
    this.button = button;
    this.context = null;
    this.master = null;
    this.filter = null;
    this.hum = null;
    this.pulse = null;
    this.enabled = false;
    this.lastHover = 0;
  }

  build() {
    if (this.context) return true;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return false;

    this.context = new Context({ latencyHint: 'interactive' });
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.context.destination);

    this.filter = this.context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 430;
    this.filter.Q.value = 1.1;
    this.filter.connect(this.master);

    const humGain = this.context.createGain();
    humGain.gain.value = 0.055;
    this.hum = this.context.createOscillator();
    this.hum.type = 'sine';
    this.hum.frequency.value = 43.65;
    this.hum.connect(humGain).connect(this.filter);
    this.hum.start();

    const pulseGain = this.context.createGain();
    pulseGain.gain.value = 0.012;
    this.pulse = this.context.createOscillator();
    this.pulse.type = 'triangle';
    this.pulse.frequency.value = 65.41;
    this.pulse.connect(pulseGain).connect(this.filter);
    this.pulse.start();

    const lfo = this.context.createOscillator();
    const lfoGain = this.context.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.16;
    lfoGain.gain.value = 130;
    lfo.connect(lfoGain).connect(this.filter.frequency);
    lfo.start();
    return true;
  }

  setEnabled(next) {
    if (!this.build()) return;
    void this.context.resume();
    this.enabled = Boolean(next);
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(this.enabled ? 0.16 : 0, now + (this.enabled ? 0.46 : 0.18));
    this.button.setAttribute('aria-pressed', String(this.enabled));
    this.button.setAttribute('aria-label', this.enabled ? 'Generatív hang kikapcsolása' : 'Generatív hang bekapcsolása');
    const label = this.button.querySelector('span');
    if (label) label.textContent = this.enabled ? 'SOUND ON' : 'SOUND OFF';
    if (this.enabled) this.tone(880, 0.18, 0.035, 0);
  }

  tone(frequency, duration, volume, delay = 0) {
    if (!this.enabled || !this.context) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime + delay;
    oscillator.type = frequency < 180 ? 'sine' : frequency > 760 ? 'triangle' : 'sawtooth';
    oscillator.frequency.setValueAtTime(Math.max(28, frequency), now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(28, frequency * 0.66), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(this.filter);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    }, { once: true });
  }

  hover(index) {
    if (!this.enabled || !this.context) return;
    const now = performance.now();
    if (now - this.lastHover < 80) return;
    this.lastHover = now;
    this.tone(720 + index * 54, 0.075, 0.012, 0);
  }

  select(index) {
    if (!this.enabled || !this.context) return;
    const base = [98, 130.81, 164.81, 73.42, 110, 196][index] || 110;
    this.filter.frequency.setTargetAtTime(index === 3 ? 820 : 470 + index * 65, this.context.currentTime, 0.08);
    this.hum.frequency.setTargetAtTime(41 + index * 3.1, this.context.currentTime, 0.16);
    this.pulse.frequency.setTargetAtTime(index === 3 ? 78 : 61 + index * 2.2, this.context.currentTime, 0.12);
    this.tone(base, 0.32, 0.045, 0);
    this.tone(base * 1.5, 0.22, 0.024, 0.055);
    this.tone(base * 2.01, 0.18, 0.014, 0.1);
  }

  close() {
    if (this.enabled) this.tone(440, 0.14, 0.018, 0);
  }

  destroy() {
    if (this.context) void this.context.close();
    this.context = null;
  }
}

class LivingCoreExperience {
  constructor() {
    this.canvas = document.getElementById('living-core-canvas');
    this.stage = document.querySelector('.lc-stage');
    this.panel = document.getElementById('lc-panel');
    this.panelClose = document.getElementById('lc-panel-close');
    this.nodeButtons = Array.from(document.querySelectorAll('.lc-node'));
    this.lineElements = Array.from(document.querySelectorAll('[data-link]'));
    this.soundButton = document.getElementById('lc-sound');
    this.fpsNode = document.getElementById('lc-fps');
    this.releaseLink = document.getElementById('lc-full-download');
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.coarsePointer = matchMedia('(pointer: coarse)').matches;
    this.mobile = matchMedia('(max-width: 820px)').matches;
    this.deviceMemory = Number(navigator.deviceMemory || 4);
    this.cores = Number(navigator.hardwareConcurrency || 4);
    this.activeIndex = -1;
    this.hoverIndex = -1;
    this.frame = 0;
    this.frameSamples = 0;
    this.frameTime = 0;
    this.previousFrameTime = performance.now();
    this.disposed = false;
    this.width = innerWidth;
    this.height = innerHeight;
    this.dpr = Math.min(devicePixelRatio || 1, this.mobile ? 1.4 : 1.75);
    this.pointer = new THREE.Vector2(0, 0);
    this.pointerTarget = new THREE.Vector2(0, 0);
    this.lookTarget = new THREE.Vector3(0, 0, 0);
    this.defaultCamera = new THREE.Vector3(0, 0.18, 8.1);
    this.projected = new THREE.Vector3();
    this.coreProjected = new THREE.Vector3();
    this.worldPosition = new THREE.Vector3();
    this.cameraDestination = new THREE.Vector3();
    this.lookDestination = new THREE.Vector3();
    this.colorTarget = new THREE.Color('#6eeaff');
    this.targetWorldRotationX = 0;
    this.targetWorldRotationY = 0;
    this.qualityStep = 0;
    this.maxParticles = this.chooseParticleBudget();
    this.drawCounts = this.maxParticles >= 24000
      ? [this.maxParticles, 16000, 9000, 5200]
      : this.maxParticles >= 12000
        ? [this.maxParticles, 8500, 5200, 3200]
        : [this.maxParticles, 5200, 3200, 2200];
    this.animate = this.animate.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onContextLost = this.onContextLost.bind(this);
    this.onContextRestored = this.onContextRestored.bind(this);
    this.synth = new LivingCoreSynth(this.soundButton);
  }

  chooseParticleBudget() {
    if (this.reducedMotion) return 4200;
    if (this.deviceMemory >= 8 && this.cores >= 8 && !this.mobile) return 28000;
    if (this.deviceMemory >= 6 && this.cores >= 6) return 18000;
    if (this.mobile || this.coarsePointer) return 9200;
    return 12500;
  }

  init() {
    if (!(this.canvas instanceof HTMLCanvasElement)) throw new Error('Living Core canvas is missing.');
    this.buildRenderer();
    this.buildWorld();
    this.bindInteractions();
    this.onResize();
    this.loadLatestRelease();
    gsap.set(this.panel, { autoAlpha: 0 });
    window.__FORMATX_LIVING_CORE__ = this;
    this.frame = requestAnimationFrame(this.animate);
  }

  buildRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.mobile && this.deviceMemory >= 6,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
    this.renderer.setClearColor(0x010409, 1);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
  }

  buildWorld() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010409);
    this.scene.fog = new THREE.FogExp2(0x010409, 0.036);

    this.camera = new THREE.PerspectiveCamera(46, this.width / this.height, 0.05, 80);
    this.camera.position.copy(this.defaultCamera);

    this.world = new THREE.Group();
    this.scene.add(this.world);

    this.buildCore();
    this.buildSynapses();
    this.buildEnvironment();
  }

  buildCore() {
    const random = seededRandom(0xF04A7C);
    const positions = new Float32Array(this.maxParticles * 3);
    const phases = new Float32Array(this.maxParticles);
    const sizes = new Float32Array(this.maxParticles);
    const energies = new Float32Array(this.maxParticles);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let index = 0; index < this.maxParticles; index += 1) {
      const ratio = (index + 0.5) / this.maxParticles;
      const y = 1 - ratio * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const angle = index * golden + random() * 0.08;
      const shell = 1.34 + (random() - 0.5) * 0.34;
      const offset = index * 3;
      positions[offset] = Math.cos(angle) * radius * shell;
      positions[offset + 1] = y * shell;
      positions[offset + 2] = Math.sin(angle) * radius * shell;
      phases[index] = random() * Math.PI * 2;
      sizes[index] = 0.48 + random() * 0.82;
      energies[index] = random();
    }

    this.coreGeometry = new THREE.BufferGeometry();
    this.coreGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.coreGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    this.coreGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.coreGeometry.setAttribute('aEnergy', new THREE.BufferAttribute(energies, 1));
    this.coreGeometry.setDrawRange(0, this.drawCounts[0]);

    this.coreUniforms = {
      uTime: { value: 0 },
      uPointer: { value: this.pointer },
      uFocus: { value: 0 },
      uPixelRatio: { value: this.dpr },
      uBaseColor: { value: new THREE.Color('#51d7ef') },
      uAccentColor: { value: new THREE.Color('#6eeaff') }
    };

    this.coreMaterial = new THREE.ShaderMaterial({
      uniforms: this.coreUniforms,
      vertexShader: `
        attribute float aPhase;
        attribute float aSize;
        attribute float aEnergy;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uFocus;
        uniform float uPixelRatio;
        varying float vEnergy;
        varying float vProximity;
        varying float vDepth;

        void main() {
          vec3 normalised = normalize(position);
          float breath = sin(uTime * 1.24 + aPhase) * 0.052 + sin(uTime * 0.43 + aPhase * 0.37) * 0.026;
          float nervous = sin(position.y * 7.0 + uTime * 1.8 + aPhase) * 0.022 * (0.35 + aEnergy);
          vec3 p = position + normalised * (breath + nervous);
          p.xz *= mat2(cos(uTime * 0.035), -sin(uTime * 0.035), sin(uTime * 0.035), cos(uTime * 0.035));

          vec4 initialView = modelViewMatrix * vec4(p, 1.0);
          vec4 initialClip = projectionMatrix * initialView;
          vec2 ndc = initialClip.xy / max(0.001, initialClip.w);
          float proximity = smoothstep(0.62, 0.03, distance(ndc, uPointer));
          p += normalised * proximity * (0.13 + aEnergy * 0.12) * (1.0 - uFocus * 0.42);
          p *= 1.0 - uFocus * (0.075 + aEnergy * 0.035);
          p += normalised * sin(aPhase * 2.0 + uTime * 5.0) * uFocus * 0.018;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = (aSize + proximity * 0.72 + uFocus * aEnergy * 0.48) * uPixelRatio * (38.0 / max(1.0, -mvPosition.z));
          vEnergy = aEnergy;
          vProximity = proximity;
          vDepth = clamp((-mvPosition.z - 4.0) / 8.0, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uAccentColor;
        uniform float uFocus;
        varying float vEnergy;
        varying float vProximity;
        varying float vDepth;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float distanceToCenter = length(uv);
          float disc = smoothstep(0.5, 0.08, distanceToCenter);
          float hot = smoothstep(0.32, 0.0, distanceToCenter);
          vec3 colour = mix(uBaseColor, uAccentColor, clamp(vEnergy * 0.76 + vProximity * 0.62 + uFocus * 0.22, 0.0, 1.0));
          colour += hot * (0.08 + vProximity * 0.3);
          float alpha = disc * (0.11 + vEnergy * 0.31 + vProximity * 0.13 + uFocus * 0.045) * (1.0 - vDepth * 0.44);
          if (alpha < 0.012) discard;
          gl_FragColor = vec4(colour, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.corePoints = new THREE.Points(this.coreGeometry, this.coreMaterial);
    this.corePoints.frustumCulled = false;
    this.world.add(this.corePoints);

    this.shellGeometry = new THREE.IcosahedronGeometry(1.08, this.mobile ? 2 : 3);
    this.shellMaterial = new THREE.MeshBasicMaterial({
      color: 0x54dff4,
      wireframe: true,
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.shell = new THREE.Mesh(this.shellGeometry, this.shellMaterial);
    this.world.add(this.shell);

    this.rings = [];
    for (let index = 0; index < 3; index += 1) {
      const geometry = new THREE.TorusGeometry(1.62 + index * 0.18, 0.008 + index * 0.003, 5, this.mobile ? 72 : 120);
      const material = new THREE.MeshBasicMaterial({
        color: index === 1 ? 0x43f0b1 : 0x58dff3,
        transparent: true,
        opacity: 0.18 - index * 0.035,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.set(Math.PI * (0.22 + index * 0.14), Math.PI * (0.1 + index * 0.23), index * 0.7);
      this.rings.push(ring);
      this.world.add(ring);
    }
  }

  buildSynapses() {
    this.nodeGroups = [];
    this.nodeMeshes = [];
    this.synapseLines = [];

    NODE_DATA.forEach((data, index) => {
      const accent = new THREE.Color(data.accent);
      const group = new THREE.Group();
      group.position.set(data.position[0], data.position[1], data.position[2]);

      const outerGeometry = new THREE.IcosahedronGeometry(0.12, 1);
      const outerMaterial = new THREE.MeshBasicMaterial({
        color: accent,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const outer = new THREE.Mesh(outerGeometry, outerMaterial);
      const innerGeometry = new THREE.SphereGeometry(0.038, 10, 8);
      const innerMaterial = new THREE.MeshBasicMaterial({ color: accent });
      const inner = new THREE.Mesh(innerGeometry, innerMaterial);
      group.add(outer, inner);
      this.world.add(group);
      this.nodeGroups.push(group);
      this.nodeMeshes.push({ outer, inner, outerGeometry, innerGeometry, outerMaterial, innerMaterial, accent });

      const points = new Float32Array([0, 0, 0, data.position[0], data.position[1], data.position[2]]);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      this.synapseLines.push({ line, geometry: lineGeometry, material: lineMaterial });
      this.world.add(line);

      const hudLine = this.lineElements[index];
      if (hudLine) hudLine.style.setProperty('--line-accent', data.accent);
    });
  }

  buildEnvironment() {
    const random = seededRandom(0xC0FFEE);
    const count = this.reducedMotion ? 260 : this.mobile ? 620 : 1250;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      positions[offset] = (random() - 0.5) * 28;
      positions[offset + 1] = (random() - 0.5) * 16;
      positions[offset + 2] = -2 - random() * 22;
    }
    this.dustGeometry = new THREE.BufferGeometry();
    this.dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dustMaterial = new THREE.PointsMaterial({
      color: 0x4ab8cd,
      size: this.mobile ? 0.018 : 0.024,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.dust = new THREE.Points(this.dustGeometry, this.dustMaterial);
    this.scene.add(this.dust);

    this.grid = new THREE.GridHelper(32, this.mobile ? 34 : 58, 0x176476, 0x08242c);
    this.grid.position.set(0, -2.48, -1.8);
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.2;
    this.grid.material.depthWrite = false;
    this.scene.add(this.grid);
  }

  bindInteractions() {
    addEventListener('resize', this.onResize, { passive: true });
    addEventListener('pointermove', this.onPointerMove, { passive: true });
    addEventListener('keydown', this.onKeyDown);
    addEventListener('pagehide', () => this.dispose(), { once: true });
    this.canvas.addEventListener('webglcontextlost', this.onContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored, false);

    this.nodeButtons.forEach((button, index) => {
      button.addEventListener('pointerenter', () => this.hoverNode(index));
      button.addEventListener('pointerleave', () => this.leaveNode(index));
      button.addEventListener('focus', () => this.hoverNode(index));
      button.addEventListener('blur', () => this.leaveNode(index));
      button.addEventListener('click', () => this.selectNode(index));
    });

    this.panelClose.addEventListener('click', () => this.closePanel());
    this.soundButton.addEventListener('click', () => this.synth.setEnabled(!this.synth.enabled));
    document.addEventListener('pointerdown', () => {
      if (this.synth.context) void this.synth.context.resume();
    }, { passive: true });
  }

  onPointerMove(event) {
    this.pointerTarget.x = event.clientX / Math.max(1, this.width) * 2 - 1;
    this.pointerTarget.y = -(event.clientY / Math.max(1, this.height) * 2 - 1);
    if (this.activeIndex < 0) {
      this.targetWorldRotationY = this.pointerTarget.x * 0.13;
      this.targetWorldRotationX = -this.pointerTarget.y * 0.075;
    }
  }

  onKeyDown(event) {
    if (event.key === 'Escape') {
      this.closePanel();
      return;
    }
    if (/^[1-6]$/.test(event.key)) {
      event.preventDefault();
      this.selectNode(Number(event.key) - 1);
    }
  }

  hoverNode(index) {
    this.hoverIndex = index;
    this.setNodeVisual(index, true);
    const data = NODE_DATA[index];
    this.colorTarget.set(data.accent);
    gsap.to(this.coreUniforms.uFocus, { value: this.activeIndex >= 0 ? 1 : 0.43, duration: 0.32, ease: 'power2.out' });
    gsap.to(this.coreUniforms.uAccentColor.value, {
      r: this.colorTarget.r,
      g: this.colorTarget.g,
      b: this.colorTarget.b,
      duration: 0.32,
      ease: 'power2.out'
    });
    this.synth.hover(index);
  }

  leaveNode(index) {
    if (this.hoverIndex === index) this.hoverIndex = -1;
    if (this.activeIndex !== index) this.setNodeVisual(index, false);
    if (this.activeIndex < 0) {
      this.colorTarget.set('#6eeaff');
      gsap.to(this.coreUniforms.uFocus, { value: 0, duration: 0.5, ease: 'power2.out' });
      gsap.to(this.coreUniforms.uAccentColor.value, {
        r: this.colorTarget.r,
        g: this.colorTarget.g,
        b: this.colorTarget.b,
        duration: 0.45,
        ease: 'power2.out'
      });
    }
  }

  setNodeVisual(index, active) {
    const button = this.nodeButtons[index];
    const line = this.lineElements[index];
    const mesh = this.nodeMeshes[index];
    if (button) button.classList.toggle('is-active', active);
    if (line) line.classList.toggle('is-active', active);
    if (!mesh) return;
    gsap.to(mesh.outer.scale, { x: active ? 1.55 : 1, y: active ? 1.55 : 1, z: active ? 1.55 : 1, duration: 0.28, ease: 'power2.out' });
    gsap.to(mesh.outerMaterial, { opacity: active ? 1 : 0.75, duration: 0.25 });
    const synapse = this.synapseLines[index];
    if (synapse) gsap.to(synapse.material, { opacity: active ? 0.82 : 0.16, duration: 0.28 });
  }

  selectNode(index) {
    const data = NODE_DATA[index];
    const group = this.nodeGroups[index];
    if (!data || !group) return;

    if (this.activeIndex >= 0 && this.activeIndex !== index) this.setNodeVisual(this.activeIndex, false);
    this.activeIndex = index;
    this.hoverIndex = index;
    this.setNodeVisual(index, true);
    document.body.classList.add('lc-panel-open');
    this.panel.setAttribute('aria-hidden', 'false');
    this.populatePanel(index);
    this.synth.select(index);

    this.colorTarget.set(data.accent);
    gsap.to(this.coreUniforms.uFocus, { value: 1, duration: 0.58, ease: 'power3.inOut' });
    gsap.to(this.coreUniforms.uAccentColor.value, {
      r: this.colorTarget.r,
      g: this.colorTarget.g,
      b: this.colorTarget.b,
      duration: 0.5,
      ease: 'power2.inOut'
    });

    this.cameraDestination.set(group.position.x * 0.42, group.position.y * 0.34 + 0.1, 5.05);
    this.lookDestination.set(group.position.x * 0.66, group.position.y * 0.6, group.position.z * 0.4);
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.lookTarget);
    gsap.to(this.camera.position, {
      x: this.cameraDestination.x,
      y: this.cameraDestination.y,
      z: this.cameraDestination.z,
      duration: this.reducedMotion ? 0.01 : 1.08,
      ease: 'power3.inOut'
    });
    gsap.to(this.lookTarget, {
      x: this.lookDestination.x,
      y: this.lookDestination.y,
      z: this.lookDestination.z,
      duration: this.reducedMotion ? 0.01 : 1.08,
      ease: 'power3.inOut'
    });
    this.targetWorldRotationX = 0;
    this.targetWorldRotationY = 0;

    const mobilePanel = matchMedia('(max-width: 820px)').matches;
    gsap.killTweensOf(this.panel);
    gsap.fromTo(this.panel,
      mobilePanel
        ? { autoAlpha: 0, y: 34, yPercent: 0, scale: 0.98, rotationY: 0 }
        : { autoAlpha: 0, x: 52, yPercent: -50, scale: 0.96, rotationY: -8 },
      mobilePanel
        ? { autoAlpha: 1, y: 0, yPercent: 0, scale: 1, duration: 0.62, ease: 'power3.out' }
        : { autoAlpha: 1, x: 0, yPercent: -50, scale: 1, rotationY: 0, duration: 0.62, ease: 'power3.out' }
    );
  }

  populatePanel(index) {
    const data = NODE_DATA[index];
    document.getElementById('lc-panel-index').textContent = `NODE / ${String(index + 1).padStart(2, '0')}`;
    document.getElementById('lc-panel-kicker').textContent = data.kicker;
    document.getElementById('lc-panel-title').textContent = data.title;
    document.getElementById('lc-panel-description').textContent = data.description;
    this.panel.style.setProperty('--panel-accent', data.accent);

    const metrics = document.getElementById('lc-panel-metrics');
    metrics.replaceChildren();
    data.metrics.forEach(([label, value]) => {
      const article = document.createElement('article');
      const labelNode = document.createElement('span');
      const valueNode = document.createElement('strong');
      labelNode.textContent = label;
      valueNode.textContent = value;
      article.append(labelNode, valueNode);
      metrics.appendChild(article);
    });

    const log = document.getElementById('lc-panel-log');
    log.replaceChildren();
    data.log.forEach((message, logIndex) => {
      const item = document.createElement('li');
      item.dataset.time = `T+0${logIndex}.${index + 2}${logIndex}`;
      item.textContent = message;
      log.appendChild(item);
    });
  }

  closePanel() {
    if (this.activeIndex < 0) return;
    const previous = this.activeIndex;
    this.activeIndex = -1;
    this.hoverIndex = -1;
    this.setNodeVisual(previous, false);
    document.body.classList.remove('lc-panel-open');
    this.panel.setAttribute('aria-hidden', 'true');
    this.synth.close();

    this.colorTarget.set('#6eeaff');
    gsap.to(this.coreUniforms.uFocus, { value: 0, duration: 0.52, ease: 'power2.inOut' });
    gsap.to(this.coreUniforms.uAccentColor.value, {
      r: this.colorTarget.r,
      g: this.colorTarget.g,
      b: this.colorTarget.b,
      duration: 0.5
    });
    gsap.to(this.camera.position, {
      x: this.defaultCamera.x,
      y: this.defaultCamera.y,
      z: this.defaultCamera.z,
      duration: this.reducedMotion ? 0.01 : 1,
      ease: 'power3.inOut'
    });
    gsap.to(this.lookTarget, {
      x: 0,
      y: 0,
      z: 0,
      duration: this.reducedMotion ? 0.01 : 1,
      ease: 'power3.inOut'
    });
    const mobilePanel = matchMedia('(max-width: 820px)').matches;
    gsap.to(this.panel, {
      autoAlpha: 0,
      x: mobilePanel ? 0 : 46,
      y: mobilePanel ? 34 : 0,
      yPercent: mobilePanel ? 0 : -50,
      scale: 0.97,
      rotationY: mobilePanel ? 0 : -7,
      duration: 0.38,
      ease: 'power2.in'
    });
  }

  onResize() {
    this.width = Math.max(1, innerWidth);
    this.height = Math.max(1, innerHeight);
    this.mobile = matchMedia('(max-width: 820px)').matches;
    this.dpr = Math.min(devicePixelRatio || 1, this.mobile ? 1.35 : 1.75 - this.qualityStep * 0.18);
    if (!this.renderer || !this.camera) return;
    this.renderer.setPixelRatio(Math.max(0.8, this.dpr));
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.coreUniforms.uPixelRatio.value = Math.max(0.8, this.dpr);
  }

  onContextLost(event) {
    event.preventDefault();
    this.fpsNode.textContent = 'GPU CONTEXT LOST';
    this.fpsNode.style.color = '#ff6075';
    cancelAnimationFrame(this.frame);
  }

  onContextRestored() {
    location.reload();
  }

  updateHud() {
    this.coreProjected.set(0, 0, 0).applyMatrix4(this.world.matrixWorld).project(this.camera);
    const coreX = (this.coreProjected.x * 0.5 + 0.5) * this.width;
    const coreY = (-this.coreProjected.y * 0.5 + 0.5) * this.height;

    for (let index = 0; index < this.nodeGroups.length; index += 1) {
      const group = this.nodeGroups[index];
      group.getWorldPosition(this.worldPosition);
      this.projected.copy(this.worldPosition).project(this.camera);
      let x = (this.projected.x * 0.5 + 0.5) * this.width;
      let y = (-this.projected.y * 0.5 + 0.5) * this.height;
      if (this.mobile) {
        const anchor = MOBILE_HUD_ANCHORS[index];
        x = anchor[0] * this.width;
        y = anchor[1] * this.height;
      }
      const button = this.nodeButtons[index];
      const line = this.lineElements[index];
      if (button) {
        button.style.setProperty('--node-x', `${x.toFixed(1)}px`);
        button.style.setProperty('--node-y', `${y.toFixed(1)}px`);
        const hidden = !this.mobile && (this.projected.z > 1 || x < -180 || x > this.width + 180 || y < -90 || y > this.height + 90);
        button.style.visibility = hidden ? 'hidden' : 'visible';
      }
      if (line) {
        line.setAttribute('x1', (coreX / this.width * 100).toFixed(3));
        line.setAttribute('y1', (coreY / this.height * 100).toFixed(3));
        line.setAttribute('x2', (x / this.width * 100).toFixed(3));
        line.setAttribute('y2', (y / this.height * 100).toFixed(3));
      }
    }
  }

  updatePerformance(delta) {
    this.frameSamples += 1;
    this.frameTime += delta;
    if (this.frameSamples < 90) return;
    const fps = this.frameSamples / Math.max(0.001, this.frameTime);
    this.fpsNode.textContent = `${Math.round(fps)} FPS / Q${4 - this.qualityStep}`;
    if (fps < 47 && this.qualityStep < this.drawCounts.length - 1) {
      this.qualityStep += 1;
      this.coreGeometry.setDrawRange(0, this.drawCounts[this.qualityStep]);
      this.onResize();
    } else if (fps > 58 && this.qualityStep > 0 && !this.mobile) {
      this.qualityStep -= 1;
      this.coreGeometry.setDrawRange(0, this.drawCounts[this.qualityStep]);
      this.onResize();
    }
    this.frameSamples = 0;
    this.frameTime = 0;
  }

  animate(now) {
    if (this.disposed) return;
    const delta = Math.min((now - this.previousFrameTime) / 1000, 0.05);
    this.previousFrameTime = now;
    const seconds = now * 0.001;
    const smoothPointer = 1 - Math.exp(-delta * 8.5);
    const smoothWorld = 1 - Math.exp(-delta * 4.2);

    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * smoothPointer;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * smoothPointer;
    this.world.rotation.x += (this.targetWorldRotationX - this.world.rotation.x) * smoothWorld;
    this.world.rotation.y += (this.targetWorldRotationY - this.world.rotation.y) * smoothWorld;

    this.coreUniforms.uTime.value = seconds;
    this.corePoints.rotation.y = seconds * 0.055;
    this.corePoints.rotation.x = Math.sin(seconds * 0.19) * 0.05;
    this.shell.rotation.y = -seconds * 0.08;
    this.shell.rotation.x = seconds * 0.035;
    this.shell.scale.setScalar(0.96 + Math.sin(seconds * 1.25) * 0.018 - this.coreUniforms.uFocus.value * 0.045);

    for (let index = 0; index < this.rings.length; index += 1) {
      const ring = this.rings[index];
      ring.rotation.z += delta * (0.04 + index * 0.018) * (index % 2 ? -1 : 1);
      ring.material.opacity = 0.12 + Math.sin(seconds * (0.65 + index * 0.2) + index) * 0.045 + this.coreUniforms.uFocus.value * 0.05;
    }

    for (let index = 0; index < this.nodeGroups.length; index += 1) {
      const group = this.nodeGroups[index];
      group.rotation.x = seconds * (0.22 + index * 0.018);
      group.rotation.y = seconds * (0.32 + index * 0.024);
      const pulse = 1 + Math.sin(seconds * 2 + index * 1.3) * 0.07;
      if (index !== this.activeIndex && index !== this.hoverIndex) group.scale.setScalar(pulse);
    }

    this.dust.rotation.y = seconds * 0.008;
    this.grid.position.z = -1.8 + Math.sin(seconds * 0.12) * 0.35;
    this.camera.lookAt(this.lookTarget);
    this.scene.updateMatrixWorld();
    this.updateHud();
    this.renderer.render(this.scene, this.camera);
    this.updatePerformance(delta);
    this.frame = requestAnimationFrame(this.animate);
  }

  async loadLatestRelease() {
    if (!(this.releaseLink instanceof HTMLAnchorElement)) return;
    try {
      const response = await fetch(RELEASE_API, {
        headers: { Accept: 'application/vnd.github+json' },
        cache: 'no-store'
      });
      if (!response.ok) return;
      const payload = await response.json();
      if (!payload || payload.draft || payload.prerelease || !Array.isArray(payload.assets)) return;
      const match = String(payload.tag_name || '').match(/^v?(\d+)$/i);
      if (!match) return;
      const version = `V${match[1]}`;
      const expected = `FormatX-Suite-Pro-${version}.zip`;
      const asset = payload.assets.find(candidate => candidate && candidate.name === expected);
      if (!asset || asset.browser_download_url !== RELEASE_DOWNLOAD) return;
      this.releaseLink.href = RELEASE_DOWNLOAD;
      const versionNode = this.releaseLink.querySelector('strong');
      if (versionNode) versionNode.textContent = version;
      this.releaseLink.dataset.releaseVerified = 'true';
    } catch (_) {
      // The verified release-page fallback remains usable without the API.
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    removeEventListener('resize', this.onResize);
    removeEventListener('pointermove', this.onPointerMove);
    removeEventListener('keydown', this.onKeyDown);
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
    gsap.killTweensOf('*');
    this.synth.destroy();

    this.coreGeometry.dispose();
    this.coreMaterial.dispose();
    this.shellGeometry.dispose();
    this.shellMaterial.dispose();
    this.rings.forEach(ring => {
      ring.geometry.dispose();
      ring.material.dispose();
    });
    this.nodeMeshes.forEach(node => {
      node.outerGeometry.dispose();
      node.innerGeometry.dispose();
      node.outerMaterial.dispose();
      node.innerMaterial.dispose();
    });
    this.synapseLines.forEach(line => {
      line.geometry.dispose();
      line.material.dispose();
    });
    this.dustGeometry.dispose();
    this.dustMaterial.dispose();
    this.grid.geometry.dispose();
    this.grid.material.dispose();
    this.renderer.dispose();
    try { delete window.__FORMATX_LIVING_CORE__; } catch (_) {}
  }
}

try {
  const experience = new LivingCoreExperience();
  experience.init();
} catch (error) {
  console.error('FormatX Living Core failed to initialise:', error);
  const status = document.getElementById('lc-fps');
  if (status) status.textContent = 'ENGINE ERROR';
}

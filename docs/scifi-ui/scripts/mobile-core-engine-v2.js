const THREE_SOURCES = [
  'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js',
  'https://unpkg.com/three@0.185.1/build/three.module.js?module'
];

const INDEX = Object.freeze({
  SCENE: 0,
  SCROLL: 1,
  VELOCITY: 2,
  POINTER_X: 3,
  POINTER_Y: 4,
  POINTER_VX: 5,
  POINTER_VY: 6,
  ORBIT_X: 7,
  ORBIT_Y: 8,
  SCALE: 9,
  WIDTH: 10,
  HEIGHT: 11,
  DPR: 12,
  REDUCED: 13,
  VISIBLE: 14,
  QUALITY_HINT: 15
});

async function loadThree() {
  let lastError = null;
  for (const source of THREE_SOURCES) {
    try {
      return await import(source);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Three.js could not be loaded');
}

function parentRoot() {
  try { return parent.document.documentElement; } catch (_) { return null; }
}

function runtimeState() {
  try {
    const shared = parent.__FORMATX_3D_STATE__;
    if (shared && ArrayBuffer.isView(shared) && shared.length >= 16) return shared;
  } catch (_) {}

  const fallback = new Float32Array(16);
  fallback[INDEX.SCALE] = 1;
  fallback[INDEX.WIDTH] = innerWidth;
  fallback[INDEX.HEIGHT] = innerHeight;
  fallback[INDEX.DPR] = devicePixelRatio || 1;
  fallback[INDEX.VISIBLE] = 1;
  return fallback;
}

function reportError(error) {
  const message = error instanceof Error ? error.message : String(error);
  const root = parentRoot();
  if (root) {
    root.dataset.fxThree = 'error';
    root.dataset.fxThreeError = message.slice(0, 180);
    root.dataset.fxMobile3dEngine = 'error';
  }
  try {
    parent.dispatchEvent(new CustomEvent('formatx:threeerror', { detail: { message } }));
  } catch (_) {}
  console.error('FormatX living organism engine failed:', error);
}

const MEMBRANE_VERTEX = `
  precision highp float;
  uniform float uTime;
  uniform float uPulse;
  uniform float uLayer;
  uniform vec2 uPointer;
  varying vec3 vNormalWorld;
  varying vec3 vWorld;
  varying float vFlow;

  void main() {
    vec3 p = position;
    float breath = sin(uTime * 0.86 + uLayer * 1.71) * 0.035 + uPulse * 0.035;
    float waveA = sin(p.y * 3.15 + p.x * 1.55 - uTime * (0.42 + uLayer * 0.06));
    float waveB = sin(p.z * 3.55 - p.y * 1.72 + uTime * (0.31 + uLayer * 0.05));
    float waveC = sin((p.x + p.z) * 4.1 + uTime * 0.24 + uLayer);
    float flow = waveA * 0.48 + waveB * 0.34 + waveC * 0.18;

    p *= vec3(0.96 + breath, 1.16 + breath * 0.42, 0.91 + breath * 0.62);
    p += normal * flow * (0.052 + uLayer * 0.012);
    p.x += uPointer.x * (0.045 + uLayer * 0.009) * (0.45 + normal.z * 0.55);
    p.y += uPointer.y * (0.035 + uLayer * 0.007) * (0.45 + normal.z * 0.55);

    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    vNormalWorld = normalize(mat3(modelMatrix) * normal);
    vFlow = flow * 0.5 + 0.5;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const MEMBRANE_FRAGMENT = `
  precision highp float;
  uniform float uTime;
  uniform float uPulse;
  uniform float uLayer;
  uniform vec3 uColor;
  varying vec3 vNormalWorld;
  varying vec3 vWorld;
  varying float vFlow;

  void main() {
    vec3 n = normalize(vNormalWorld);
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float facing = abs(dot(n, viewDir));
    float fresnel = pow(1.0 - facing, 2.05);
    float veinA = sin(vWorld.y * 6.2 + vWorld.x * 2.4 - uTime * 0.72 + uLayer);
    float veinB = sin(vWorld.z * 7.1 - vWorld.y * 2.1 + uTime * 0.41);
    float vein = smoothstep(0.79, 0.985, (veinA * 0.64 + veinB * 0.36) * 0.5 + 0.5);
    float light = 0.34 + max(dot(n, normalize(vec3(-0.38, 0.74, 0.58))), 0.0) * 0.52;

    vec3 color = uColor * (light + vFlow * 0.18);
    color += vec3(0.56, 0.96, 1.0) * fresnel * (0.72 - uLayer * 0.09);
    color += vec3(0.24, 1.0, 0.86) * vein * (0.26 + uPulse * 0.16);

    float alpha = 0.15 + fresnel * (0.38 - uLayer * 0.045) + vein * 0.055;
    alpha *= 1.0 - uLayer * 0.075;
    gl_FragColor = vec4(color, clamp(alpha, 0.12, 0.62));
  }
`;

class LivingCoreEngine {
  constructor(THREE) {
    this.THREE = THREE;
    this.state = runtimeState();
    this.root = parentRoot();
    this.running = true;
    this.ready = false;
    this.lastTime = performance.now();
    this.lastRender = 0;
    this.pointerX = 0;
    this.pointerY = 0;
    this.clickPulse = 0;
    this.scrollValue = 0;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.38;
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    Object.assign(this.renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block'
    });
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 80);
    this.camera.position.set(0, 0.18, 5.05);

    this.world = new THREE.Group();
    this.scene.add(this.world);

    this.buildCore();
    this.buildParticles();
    this.resize();

    this.frame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.frame);
    addEventListener('resize', () => this.resize(), { passive: true });
    addEventListener('pagehide', () => this.dispose(), { once: true });
    addEventListener('webglcontextlost', event => {
      event.preventDefault();
      reportError(new Error('WebGL context lost'));
    }, { passive: false });

    try {
      parent.addEventListener('formatx:coreclick', () => { this.clickPulse = 1; });
    } catch (_) {}
  }

  buildCore() {
    const THREE = this.THREE;
    const geometry = new THREE.SphereGeometry(1.28, 96, 72);
    geometry.computeVertexNormals();
    this.membranes = [];

    const layers = [
      { scale: [1.13, 1.09, 1.16], z: -0.18, color: '#54d9eb', layer: 2 },
      { scale: [1.02, 1.03, 1.01], z: 0.0, color: '#25e5df', layer: 1 },
      { scale: [0.88, 0.95, 0.84], z: 0.19, color: '#7affd8', layer: 0 }
    ];

    for (const data of layers) {
      const uniforms = {
        uTime: { value: 0 },
        uPulse: { value: 0 },
        uLayer: { value: data.layer },
        uPointer: { value: new THREE.Vector2() },
        uColor: { value: new THREE.Color(data.color) }
      };
      const material = new THREE.ShaderMaterial({
        vertexShader: MEMBRANE_VERTEX,
        fragmentShader: MEMBRANE_FRAGMENT,
        uniforms,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending
      });
      const mesh = new THREE.Mesh(geometry.clone(), material);
      mesh.scale.set(...data.scale);
      mesh.position.z = data.z;
      mesh.frustumCulled = false;
      mesh.renderOrder = 4 - data.layer;
      this.world.add(mesh);
      this.membranes.push({ mesh, uniforms, baseZ: data.z, layer: data.layer });
    }

    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0x063944,
      emissive: 0x09ead7,
      emissiveIntensity: 2.45,
      roughness: 0.2,
      metalness: 0.02,
      transparent: true,
      opacity: 0.98,
      depthWrite: true
    });
    this.nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.74, 64, 48), nucleusMaterial);
    this.nucleus.scale.set(0.86, 1.18, 0.78);
    this.nucleus.renderOrder = 1;
    this.world.add(this.nucleus);

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x36f4e7,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      side: THREE.BackSide
    });
    this.glow = new THREE.Mesh(new THREE.SphereGeometry(1.02, 64, 48), glowMaterial);
    this.glow.scale.set(1.0, 1.16, 0.94);
    this.glow.renderOrder = 8;
    this.world.add(this.glow);

    this.halos = [];
    for (let index = 0; index < 3; index += 1) {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.58 + index * 0.23, 0.014 + index * 0.003, 10, 128),
        new THREE.MeshBasicMaterial({
          color: index === 1 ? 0x6e66ff : 0x7cf4ff,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      halo.rotation.set(0.54 + index * 0.58, index * 0.79, 0.26 + index * 0.41);
      halo.renderOrder = 7;
      this.world.add(halo);
      this.halos.push(halo);
    }

    this.scene.add(new THREE.AmbientLight(0x8fe8f4, 0.82));
    const key = new THREE.DirectionalLight(0xb4fbff, 3.25);
    key.position.set(-3.2, 4.8, 6.4);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x695dff, 8.0, 18, 2);
    rim.position.set(3.1, -0.5, 3.4);
    this.scene.add(rim);
  }

  buildParticles() {
    const THREE = this.THREE;
    const count = 220;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const radius = 2.0 + Math.random() * 4.2;
      const angle = Math.random() * Math.PI * 2;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 6.6;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 7.0;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x74dbe8,
      size: 0.028,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    this.particles = new THREE.Points(geometry, material);
    this.particles.frustumCulled = false;
    this.scene.add(this.particles);
  }

  resize() {
    const width = Math.max(1, innerWidth);
    const height = Math.max(1, innerHeight);
    const dpr = Math.min(1.35, Math.max(0.8, devicePixelRatio || 1));
    const desktop = width >= 901 && width / height > 1.2;

    this.camera.aspect = width / height;
    this.camera.position.z = desktop ? 4.85 : 5.45;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);

    this.baseWorldX = desktop ? 1.05 : 0;
    this.baseWorldY = desktop ? 0.1 : 0.42;
    this.baseScale = desktop ? 1.08 : 0.96;
    this.world.position.set(this.baseWorldX, this.baseWorldY, 0);
  }

  signalReady() {
    if (this.ready) return;
    this.ready = true;
    if (this.root) {
      this.root.dataset.fxThree = 'ready';
      this.root.dataset.fxThreeRenderer = 'three-webgl-living-core-v2';
      this.root.dataset.fxMobile3dEngine = 'living-core-v2-running';
      this.root.dataset.fxCoreForm = 'visible-organic-living-core-v2';
      this.root.classList.add('fx-three-engine-ready');
    }
    try {
      parent.dispatchEvent(new CustomEvent('formatx:threeready'));
      parent.document.dispatchEvent(new CustomEvent('formatx:threeready'));
    } catch (_) {}
  }

  frame(now) {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    if (this.state[INDEX.VISIBLE] < 0.5) {
      this.lastTime = now;
      return;
    }
    if (now - this.lastRender < 33) return;
    this.lastRender = now;

    const delta = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
    this.lastTime = now;
    const smooth = 1 - Math.exp(-delta * 6.0);
    this.pointerX += ((this.state[INDEX.POINTER_X] || 0) - this.pointerX) * smooth;
    this.pointerY += ((this.state[INDEX.POINTER_Y] || 0) - this.pointerY) * smooth;
    this.scrollValue += ((this.state[INDEX.SCROLL] || 0) - this.scrollValue) * smooth;
    this.clickPulse += (0 - this.clickPulse) * (1 - Math.exp(-delta * 5.6));

    const time = now * 0.001;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.8) * Math.sin(time * 1.33 + 0.72);
    const scrollKick = Math.min(1, Math.abs(this.state[INDEX.VELOCITY] || 0));
    const externalScale = Math.max(0.84, Math.min(1.18, this.state[INDEX.SCALE] || 1));

    this.world.rotation.y = time * 0.08 + (this.state[INDEX.ORBIT_X] || 0) + this.pointerX * 0.1;
    this.world.rotation.x = Math.sin(time * 0.24) * 0.052 + (this.state[INDEX.ORBIT_Y] || 0) + this.pointerY * 0.06;
    this.world.position.x = this.baseWorldX + this.pointerX * 0.1;
    this.world.position.y = this.baseWorldY + this.pointerY * 0.07;
    this.world.position.z = -scrollKick * 0.16;
    this.world.scale.setScalar((this.baseScale + pulse * 0.035 + this.clickPulse * 0.07) * externalScale);

    for (const entry of this.membranes) {
      entry.uniforms.uTime.value = time;
      entry.uniforms.uPulse.value = pulse + this.clickPulse * 0.65;
      entry.uniforms.uPointer.value.set(this.pointerX, this.pointerY);
      entry.mesh.position.z = entry.baseZ + Math.sin(time * (0.34 + entry.layer * 0.05) + entry.layer) * 0.035;
      entry.mesh.rotation.y = time * (entry.layer === 1 ? -0.032 : 0.024 + entry.layer * 0.009);
      entry.mesh.rotation.z = Math.sin(time * 0.22 + entry.layer) * 0.045;
    }

    this.nucleus.rotation.y = -time * 0.15;
    this.nucleus.rotation.x = Math.sin(time * 0.42) * 0.12;
    this.nucleus.scale.set(
      0.86 + pulse * 0.035 + this.clickPulse * 0.04,
      1.18 + pulse * 0.055 + this.clickPulse * 0.07,
      0.78 + pulse * 0.03
    );
    this.nucleus.material.emissiveIntensity = 1.9 + pulse * 1.2 + this.clickPulse * 2.0;
    this.glow.material.opacity = 0.15 + pulse * 0.13 + this.clickPulse * 0.12;
    this.glow.scale.setScalar(1.0 + pulse * 0.045 + this.clickPulse * 0.08);

    this.halos.forEach((halo, index) => {
      halo.rotation.x += 0.0012 * (index + 1);
      halo.rotation.y += 0.0018 * (index % 2 === 0 ? 1 : -1);
      halo.material.opacity = 0.1 + pulse * 0.09 + this.clickPulse * 0.1;
    });

    this.particles.rotation.y = time * 0.014 + this.scrollValue * 0.2;
    this.particles.position.y = -this.scrollValue * 0.45;
    this.camera.position.x = this.pointerX * 0.13;
    this.camera.position.y = 0.18 + this.pointerY * 0.09;
    this.camera.lookAt(this.baseWorldX * 0.58, this.baseWorldY, 0);

    this.renderer.render(this.scene, this.camera);
    this.signalReady();
  }

  dispose() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.membranes.forEach(entry => {
      entry.mesh.geometry.dispose();
      entry.mesh.material.dispose();
    });
    this.nucleus.geometry.dispose();
    this.nucleus.material.dispose();
    this.glow.geometry.dispose();
    this.glow.material.dispose();
    this.halos.forEach(halo => {
      halo.geometry.dispose();
      halo.material.dispose();
    });
    this.particles.geometry.dispose();
    this.particles.material.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

export async function startMobileCore() {
  const root = parentRoot();
  if (root) {
    root.dataset.fxThree = 'loading';
    root.dataset.fxMobile3dEngine = 'living-core-v2-loading';
  }
  try {
    const THREE = await loadThree();
    return new LivingCoreEngine(THREE);
  } catch (error) {
    reportError(error);
    throw error;
  }
}

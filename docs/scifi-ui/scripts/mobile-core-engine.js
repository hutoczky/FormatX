const THREE_SOURCES = [
  'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js',
  'https://unpkg.com/three@0.185.1/build/three.module.js?module'
];

const INDEX = Object.freeze({
  SCENE: 0, SCROLL: 1, VELOCITY: 2, POINTER_X: 3, POINTER_Y: 4,
  POINTER_VX: 5, POINTER_VY: 6, ORBIT_X: 7, ORBIT_Y: 8,
  SCALE: 9, WIDTH: 10, HEIGHT: 11, DPR: 12, REDUCED: 13,
  VISIBLE: 14, QUALITY_HINT: 15
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
  fallback[INDEX.WIDTH] = innerWidth;
  fallback[INDEX.HEIGHT] = innerHeight;
  fallback[INDEX.DPR] = devicePixelRatio || 1;
  fallback[INDEX.SCALE] = 1;
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
  console.error('FormatX direct mobile 3D engine failed:', error);
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
    float breath = sin(uTime * 0.82 + uLayer * 1.7) * 0.025 + uPulse * 0.022;
    float waveA = sin(p.y * 2.65 + p.x * 1.2 - uTime * (0.34 + uLayer * 0.05));
    float waveB = sin(p.z * 3.1 - p.y * 1.45 + uTime * (0.25 + uLayer * 0.04));
    float flow = waveA * 0.62 + waveB * 0.38;
    p *= vec3(0.96 + breath, 1.13 + breath * 0.5, 0.91 + breath * 0.7);
    p += normal * flow * (0.035 + uLayer * 0.009);
    p.x += uPointer.x * (0.035 + uLayer * 0.008) * (0.35 + normal.z * 0.65);
    p.y += uPointer.y * (0.026 + uLayer * 0.006) * (0.35 + normal.z * 0.65);
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
    float facing = max(dot(n, viewDir), 0.0);
    float fresnel = pow(1.0 - facing, 2.25);
    float vein = smoothstep(0.84, 0.995,
      sin(vWorld.y * 5.2 + vWorld.x * 2.1 - uTime * 0.62 + uLayer) * 0.5 + 0.5);
    float softLight = 0.25 + max(dot(n, normalize(vec3(-0.35, 0.7, 0.6))), 0.0) * 0.42;
    vec3 color = uColor * (softLight + vFlow * 0.12);
    color += vec3(0.48, 0.94, 1.0) * fresnel * (0.42 - uLayer * 0.055);
    color += uColor * vein * (0.18 + uPulse * 0.1);
    float alpha = 0.075 + fresnel * (0.23 - uLayer * 0.025) + vein * 0.025;
    alpha *= 1.0 - uLayer * 0.1;
    gl_FragColor = vec4(color, clamp(alpha, 0.045, 0.34));
  }
`;

class MobileCoreEngine {
  constructor(THREE) {
    this.THREE = THREE;
    this.state = runtimeState();
    this.root = parentRoot();
    this.width = Math.max(1, this.state[INDEX.WIDTH] || innerWidth);
    this.height = Math.max(1, this.state[INDEX.HEIGHT] || innerHeight);
    this.running = true;
    this.ready = false;
    this.lastTime = performance.now();
    this.lastRender = 0;
    this.clickPulse = 0;
    this.pointerX = 0;
    this.pointerY = 0;
    this.sceneValue = 0;
    this.scrollValue = 0;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(43, this.width / this.height, 0.05, 60);
    this.camera.position.set(0, 0.28, 5.7);

    this.world = new THREE.Group();
    this.world.position.set(0, 0.62, -0.15);
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
    const geometry = new THREE.SphereGeometry(1.34, 64, 48);
    geometry.computeVertexNormals();
    this.membranes = [];

    const layerData = [
      { scale: [1.08, 1.04, 1.12], positionZ: -0.17, color: '#4ccfe0', layer: 2 },
      { scale: [1.0, 1.0, 1.0], positionZ: 0.0, color: '#32d8dd', layer: 1 },
      { scale: [0.88, 0.94, 0.84], positionZ: 0.18, color: '#6ef6e3', layer: 0 }
    ];

    for (const data of layerData) {
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
        side: THREE.FrontSide,
        blending: THREE.NormalBlending
      });
      const mesh = new THREE.Mesh(geometry.clone(), material);
      mesh.scale.set(...data.scale);
      mesh.position.z = data.positionZ;
      mesh.frustumCulled = false;
      mesh.renderOrder = 4 - data.layer;
      this.world.add(mesh);
      this.membranes.push({ mesh, uniforms, baseZ: data.positionZ, layer: data.layer });
    }

    const nucleusMaterial = new THREE.MeshStandardMaterial({
      color: 0x063f49,
      emissive: 0x06d8ca,
      emissiveIntensity: 1.25,
      roughness: 0.28,
      metalness: 0.02,
      transparent: true,
      opacity: 0.94,
      depthWrite: true
    });
    this.nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.68, 48, 36), nucleusMaterial);
    this.nucleus.scale.set(0.84, 1.15, 0.76);
    this.nucleus.renderOrder = 1;
    this.world.add(this.nucleus);

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x79f4ff,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.halos = [];
    for (let index = 0; index < 3; index += 1) {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.58 + index * 0.24, 0.012 + index * 0.003, 8, 96),
        haloMaterial.clone()
      );
      halo.rotation.set(0.52 + index * 0.56, index * 0.83, 0.24 + index * 0.39);
      halo.renderOrder = 6;
      this.world.add(halo);
      this.halos.push(halo);
    }

    this.scene.add(new THREE.AmbientLight(0x87dff0, 0.55));
    const key = new THREE.DirectionalLight(0x9ff8ff, 2.2);
    key.position.set(-2.8, 4.2, 5.8);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x6554ff, 5.5, 16, 2);
    rim.position.set(2.6, -0.4, 2.8);
    this.scene.add(rim);
  }

  buildParticles() {
    const THREE = this.THREE;
    const count = 620;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const radius = 2.0 + Math.random() * 4.6;
      const angle = Math.random() * Math.PI * 2;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = (Math.random() - 0.45) * 7.5;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 8.0;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x74dbe8,
      size: 0.025,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    this.particles = new THREE.Points(geometry, material);
    this.particles.frustumCulled = false;
    this.scene.add(this.particles);
  }

  signalReady() {
    if (this.ready) return;
    this.ready = true;
    if (this.root) {
      this.root.dataset.fxThree = 'ready';
      this.root.dataset.fxThreeRenderer = 'three-webgl-direct-mobile';
      this.root.dataset.fxMobile3dEngine = 'direct-webgl-running';
      this.root.dataset.fxCoreForm = 'true-depth-direct-mobile';
      this.root.classList.add('fx-three-engine-ready');
    }
    try {
      parent.dispatchEvent(new CustomEvent('formatx:threeready'));
      parent.document.dispatchEvent(new CustomEvent('formatx:threeready'));
    } catch (_) {}
  }

  resize() {
    this.width = Math.max(1, this.state[INDEX.WIDTH] || innerWidth);
    this.height = Math.max(1, this.state[INDEX.HEIGHT] || innerHeight);
    const dpr = Math.min(1.25, Math.max(0.75, this.state[INDEX.DPR] || devicePixelRatio || 1));
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
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
    this.sceneValue += ((this.state[INDEX.SCENE] || 0) - this.sceneValue) * smooth;
    this.scrollValue += ((this.state[INDEX.SCROLL] || 0) - this.scrollValue) * smooth;
    this.clickPulse += (0 - this.clickPulse) * (1 - Math.exp(-delta * 5.8));

    const time = now * 0.001;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.9) * Math.sin(time * 1.31 + 0.7);
    const scrollKick = Math.min(1, Math.abs(this.state[INDEX.VELOCITY] || 0));
    const scale = Math.max(0.78, Math.min(1.24, this.state[INDEX.SCALE] || 1));

    this.world.rotation.y = time * 0.075 + (this.state[INDEX.ORBIT_X] || 0) + this.pointerX * 0.09;
    this.world.rotation.x = Math.sin(time * 0.23) * 0.045 + (this.state[INDEX.ORBIT_Y] || 0) + this.pointerY * 0.055;
    this.world.position.z = -0.15 - scrollKick * 0.18;
    this.world.scale.setScalar((0.92 + pulse * 0.025 + this.clickPulse * 0.055) * scale);

    for (const entry of this.membranes) {
      entry.uniforms.uTime.value = time;
      entry.uniforms.uPulse.value = pulse + this.clickPulse * 0.6;
      entry.uniforms.uPointer.value.set(this.pointerX, this.pointerY);
      entry.mesh.position.z = entry.baseZ + Math.sin(time * (0.32 + entry.layer * 0.05) + entry.layer) * 0.028;
      entry.mesh.rotation.y = time * (entry.layer === 1 ? -0.027 : 0.019 + entry.layer * 0.008);
      entry.mesh.rotation.z = Math.sin(time * 0.21 + entry.layer) * 0.035;
    }

    this.nucleus.rotation.y = -time * 0.13;
    this.nucleus.rotation.x = Math.sin(time * 0.41) * 0.1;
    this.nucleus.scale.set(
      0.84 + pulse * 0.025 + this.clickPulse * 0.03,
      1.15 + pulse * 0.04 + this.clickPulse * 0.05,
      0.76 + pulse * 0.02
    );
    this.nucleus.material.emissiveIntensity = 1.0 + pulse * 0.7 + this.clickPulse * 1.4;

    this.halos.forEach((halo, index) => {
      halo.rotation.x += 0.0011 * (index + 1);
      halo.rotation.y += 0.0016 * (index % 2 === 0 ? 1 : -1);
      halo.material.opacity = 0.075 + pulse * 0.055 + this.clickPulse * 0.08;
    });

    this.particles.rotation.y = time * 0.012 + this.scrollValue * 0.22;
    this.particles.position.y = -this.scrollValue * 0.6;
    this.camera.position.x = this.pointerX * 0.16;
    this.camera.position.y = 0.28 + this.pointerY * 0.11;
    this.camera.lookAt(0, 0.55, 0);

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
    root.dataset.fxMobile3dEngine = 'direct-webgl-loading';
  }
  try {
    const THREE = await loadThree();
    return new MobileCoreEngine(THREE);
  } catch (error) {
    reportError(error);
    throw error;
  }
}

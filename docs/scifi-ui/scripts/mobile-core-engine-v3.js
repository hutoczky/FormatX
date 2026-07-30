import { startMobileCore as startLivingCoreV2 } from './mobile-core-engine-v2.js?v=20260729-living-core-v2';

const MORPH_VERTEX = `
  precision highp float;
  uniform float uTime;
  uniform float uPulse;
  uniform float uLayer;
  uniform float uFormA;
  uniform float uFormB;
  uniform float uMorph;
  uniform float uThought;
  uniform vec2 uPointer;
  varying vec3 vNormalWorld;
  varying vec3 vWorld;
  varying float vFlow;

  vec3 coreForm(vec3 p) {
    return p * vec3(0.96, 1.16, 0.91);
  }

  vec3 neuralForm(vec3 p) {
    float angle = atan(p.y, p.x);
    float lobe = sin(angle * 6.0 + p.z * 3.2) * 0.105;
    p *= vec3(1.18, 1.03, 0.86);
    p += normal * lobe * (0.38 + abs(p.z) * 0.46);
    p.z += sin(p.y * 4.0) * 0.055;
    return p;
  }

  vec3 organForm(vec3 p) {
    float angle = atan(p.z, p.x);
    float petal = cos(angle * 6.0) * 0.16 * (0.38 + 0.62 * (1.0 - abs(p.y)));
    p *= vec3(1.04, 0.94, 1.04);
    p += normal * petal;
    p.y += sin(angle * 3.0) * 0.035;
    return p;
  }

  vec3 heartForm(vec3 p) {
    float upper = smoothstep(-0.18, 0.82, p.y);
    float lower = smoothstep(-1.0, 0.12, p.y);
    p.x *= mix(0.70, 1.18, lower);
    p.z *= 0.84 + upper * 0.08;
    p.y *= 1.10;
    p.y -= exp(-18.0 * p.x * p.x) * upper * 0.16;
    p.y += (1.0 - abs(p.x)) * upper * 0.055;
    p.x += sign(p.x) * upper * 0.035;
    return p;
  }

  vec3 skeletonForm(vec3 p) {
    vec3 n = normalize(p);
    float longitude = atan(n.z, n.x);
    float latitude = asin(clamp(n.y, -1.0, 1.0));
    float ridge = pow(abs(cos(longitude * 4.0)), 8.0) * 0.18
      + pow(abs(sin(latitude * 5.0)), 9.0) * 0.11;
    p *= vec3(0.89, 1.31, 0.89);
    p += normal * ridge;
    return p;
  }

  vec3 beaconForm(vec3 p) {
    float vertical = abs(p.y);
    float taper = 0.54 + (1.0 - vertical) * 0.56;
    p.xz *= taper;
    p.y *= 1.48;
    float ribs = cos(atan(p.z, p.x) * 3.0) * 0.08 * (1.0 - vertical);
    p += normal * ribs;
    p.y += sign(p.y) * pow(vertical, 3.0) * 0.10;
    return p;
  }

  vec3 selectForm(vec3 p, float mode) {
    if (mode < 0.5) return coreForm(p);
    if (mode < 1.5) return neuralForm(p);
    if (mode < 2.5) return organForm(p);
    if (mode < 3.5) return heartForm(p);
    if (mode < 4.5) return skeletonForm(p);
    return beaconForm(p);
  }

  void main() {
    float blend = smoothstep(0.0, 1.0, uMorph);
    vec3 p = mix(selectForm(position, uFormA), selectForm(position, uFormB), blend);
    float breath = sin(uTime * 0.86 + uLayer * 1.71) * 0.034 + uPulse * 0.032;
    float waveA = sin(p.y * 3.15 + p.x * 1.55 - uTime * (0.42 + uLayer * 0.06));
    float waveB = sin(p.z * 3.55 - p.y * 1.72 + uTime * (0.31 + uLayer * 0.05));
    float waveC = sin((p.x + p.z) * 4.1 + uTime * 0.24 + uLayer);
    float flow = waveA * 0.48 + waveB * 0.34 + waveC * 0.18;

    p *= 1.0 + breath + uThought * 0.018;
    p += normal * flow * (0.050 + uLayer * 0.011 + uThought * 0.018);
    p.x += uPointer.x * (0.043 + uLayer * 0.008) * (0.45 + normal.z * 0.55);
    p.y += uPointer.y * (0.034 + uLayer * 0.006) * (0.45 + normal.z * 0.55);

    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    vNormalWorld = normalize(mat3(modelMatrix) * normal);
    vFlow = flow * 0.5 + 0.5;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

function clampForm(value) {
  return Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
}

function seededColor(THREE, fingerprint) {
  const value = Number(fingerprint) >>> 0;
  const hue = ((value % 360) + 168) % 360;
  return new THREE.Color().setHSL(hue / 360, 0.84, 0.66);
}

function addOuterMembrane(engine) {
  const THREE = engine.THREE;
  const source = engine.membranes?.[0];
  if (!source?.mesh?.geometry || !source?.mesh?.material) return;

  const material = source.mesh.material.clone();
  material.uniforms = THREE.UniformsUtils.clone(source.mesh.material.uniforms);
  material.uniforms.uLayer.value = 3;
  material.uniforms.uColor.value = new THREE.Color('#398fc8');
  material.vertexShader = MORPH_VERTEX;
  material.needsUpdate = true;

  const mesh = new THREE.Mesh(source.mesh.geometry.clone(), material);
  mesh.scale.set(1.21, 1.16, 1.22);
  mesh.position.z = -0.30;
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  engine.world.add(mesh);
  engine.membranes.unshift({ mesh, uniforms: material.uniforms, baseZ: -0.30, layer: 3, fxAdded: true });
}

function installMorphUniforms(engine) {
  for (const entry of engine.membranes || []) {
    const uniforms = entry.uniforms || entry.mesh?.material?.uniforms;
    if (!uniforms) continue;
    uniforms.uFormA ||= { value: 0 };
    uniforms.uFormB ||= { value: 0 };
    uniforms.uMorph ||= { value: 1 };
    uniforms.uThought ||= { value: 0 };
    entry.mesh.material.vertexShader = MORPH_VERTEX;
    entry.mesh.material.needsUpdate = true;
  }
}

function buildSynapses(engine) {
  const THREE = engine.THREE;
  const colors = [0x7af6ff, 0x77bfff, 0x52ffe1, 0xff6fb8, 0xb98cff, 0xffd66e];
  engine.fxSynapses = [];

  for (let index = 0; index < 6; index += 1) {
    const angle = -Math.PI * 0.63 + index * (Math.PI * 1.26 / 5);
    const end = new THREE.Vector3(Math.cos(angle) * 2.38, Math.sin(angle) * 1.82, -0.25 + (index % 2) * 0.34);
    const control = new THREE.Vector3(
      Math.cos(angle) * 1.28 + Math.sin(index * 1.7) * 0.24,
      Math.sin(angle) * 0.88 + Math.cos(index * 1.3) * 0.20,
      0.32 + Math.sin(index) * 0.28
    );
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0.05), control, end]);
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: colors[index],
      transparent: true,
      opacity: 0.045,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 42, 0.009, 8, false), tubeMaterial);
    tube.renderOrder = 6;
    engine.world.add(tube);

    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: colors[index],
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const node = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 2), nodeMaterial);
    node.position.copy(end);
    node.renderOrder = 7;
    engine.world.add(node);
    engine.fxSynapses.push({ tube, node });
  }
}

function buildConstellation(engine) {
  const THREE = engine.THREE;
  const count = 12;
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  pointsGeometry.setDrawRange(0, 0);
  engine.fxGenomeStars = new THREE.Points(
    pointsGeometry,
    new THREE.PointsMaterial({
      color: 0xc9fbff,
      size: 0.065,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
  );
  engine.fxGenomeStars.frustumCulled = false;
  engine.fxGenomeStars.renderOrder = 10;
  engine.world.add(engine.fxGenomeStars);

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  lineGeometry.setDrawRange(0, 0);
  engine.fxGenomeLine = new THREE.Line(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: 0x86ecff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  engine.fxGenomeLine.frustumCulled = false;
  engine.fxGenomeLine.renderOrder = 9;
  engine.world.add(engine.fxGenomeLine);
}

function updateConstellation(engine, history) {
  const entries = Array.isArray(history) ? history.slice(-12) : [];
  const stars = engine.fxGenomeStars.geometry.attributes.position;
  const line = engine.fxGenomeLine.geometry.attributes.position;

  entries.forEach((entry, index) => {
    const fingerprint = Number(entry.fingerprint) >>> 0;
    const scene = clampForm(entry.scene);
    const base = -Math.PI * 0.63 + scene * (Math.PI * 1.26 / 5);
    const jitter = ((fingerprint % 997) / 997 - 0.5) * 0.74;
    const radius = 1.52 + ((fingerprint >>> 8) % 1000) / 1000 * 1.12;
    const angle = base + jitter;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.72 + (((fingerprint >>> 16) % 1000) / 1000 - 0.5) * 0.36;
    const z = -0.18 + (((fingerprint >>> 22) % 1000) / 1000) * 0.86;
    stars.setXYZ(index, x, y, z);
    line.setXYZ(index, x, y, z);
  });

  stars.needsUpdate = true;
  line.needsUpdate = true;
  engine.fxGenomeStars.geometry.setDrawRange(0, entries.length);
  engine.fxGenomeLine.geometry.setDrawRange(0, entries.length);
  engine.fxGenomeStars.material.opacity = entries.length ? 0.74 : 0;
  engine.fxGenomeLine.material.opacity = entries.length > 1 ? 0.22 : 0;
}

function setForm(engine, form, fingerprint, source) {
  const next = clampForm(form);
  const current = engine.fxMorph < 0.55 ? engine.fxFormA : engine.fxFormB;
  if (next !== engine.fxFormB || engine.fxMorph < 0.99) {
    engine.fxFormA = current;
    engine.fxFormB = next;
    engine.fxMorph = 0;
  }
  if (fingerprint !== undefined) {
    engine.fxSignalColor.copy(seededColor(engine.THREE, fingerprint));
    engine.nucleus.material.emissive.copy(engine.fxSignalColor);
    engine.glow.material.color.copy(engine.fxSignalColor);
    engine.fxGenomeStars.material.color.copy(engine.fxSignalColor);
    engine.fxGenomeLine.material.color.copy(engine.fxSignalColor);
  }
  if (engine.root) {
    engine.root.dataset.fxCoreMorph = String(next);
    engine.root.dataset.fxCoreMorphSource = String(source || 'system');
  }
}

function enhance(engine) {
  if (!engine || engine.fxMorphingOrganism === 'ready-v3') return engine;

  engine.fxMorphingOrganism = 'ready-v3';
  engine.fxFormA = 0;
  engine.fxFormB = 0;
  engine.fxMorph = 1;
  engine.fxThoughtPulse = 0;
  engine.fxGenomeEnabled = true;
  engine.fxActiveSynapse = -1;
  engine.fxSignalColor = new engine.THREE.Color(0x7af6ff);

  addOuterMembrane(engine);
  installMorphUniforms(engine);
  buildSynapses(engine);
  buildConstellation(engine);

  const originalFrame = engine.frame;
  cancelAnimationFrame(engine.raf);
  engine.frame = function morphingFrame(now) {
    const delta = Math.min(0.05, Math.max(0.001, (now - (this.fxLastMorphTime || now)) / 1000));
    this.fxLastMorphTime = now;
    this.fxMorph = Math.min(1, this.fxMorph + delta * 0.88);
    this.fxThoughtPulse += (0 - this.fxThoughtPulse) * (1 - Math.exp(-delta * 2.9));

    for (const entry of this.membranes || []) {
      const uniforms = entry.uniforms || entry.mesh?.material?.uniforms;
      if (!uniforms) continue;
      uniforms.uFormA.value = this.fxFormA;
      uniforms.uFormB.value = this.fxFormB;
      uniforms.uMorph.value = this.fxMorph;
      uniforms.uThought.value = this.fxThoughtPulse;
    }

    const time = now * 0.001;
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.8) * Math.sin(time * 1.33 + 0.72);
    const currentForm = this.fxMorph < 0.5 ? this.fxFormA : this.fxFormB;
    const nucleusShapeY = [1.18, 1.06, 0.94, 1.12, 1.34, 1.48][currentForm] || 1.18;
    this.nucleus.scale.y = nucleusShapeY + pulse * 0.052 + this.clickPulse * 0.07;
    this.nucleus.material.emissiveIntensity = 2.05 + pulse * 1.25 + this.clickPulse * 2.0 + this.fxThoughtPulse * 2.1;
    this.glow.material.opacity = 0.14 + pulse * 0.13 + this.clickPulse * 0.12 + this.fxThoughtPulse * 0.10;

    this.fxSynapses.forEach((entry, index) => {
      const active = this.fxGenomeEnabled && index === this.fxActiveSynapse;
      entry.tube.material.opacity = active
        ? 0.42 + pulse * 0.34 + this.fxThoughtPulse * 0.28
        : (this.fxGenomeEnabled ? 0.045 : 0.012);
      entry.node.material.opacity = active ? 0.70 + pulse * 0.25 : (this.fxGenomeEnabled ? 0.13 : 0.03);
      entry.node.scale.setScalar(active ? 1.0 + pulse * 0.32 + this.fxThoughtPulse * 0.48 : 0.84 + pulse * 0.05);
      entry.node.rotation.x += 0.003 * (index + 1);
      entry.node.rotation.y -= 0.0022 * (index + 1);
    });

    this.fxGenomeStars.rotation.y = -time * 0.035;
    this.fxGenomeLine.rotation.y = -time * 0.035;
    return originalFrame(now);
  }.bind(engine);
  engine.raf = requestAnimationFrame(engine.frame);

  try {
    parent.addEventListener('formatx:thoughtgenome', event => {
      const detail = event.detail || {};
      engine.fxGenomeEnabled = detail.enabled !== false;
      if (!engine.fxGenomeEnabled) return;
      engine.fxActiveSynapse = clampForm(detail.scene);
      engine.fxThoughtPulse = 1;
      engine.clickPulse = Math.max(engine.clickPulse, 0.72);
      setForm(engine, detail.form ?? detail.scene ?? 0, detail.fingerprint, detail.source || 'thought');
      updateConstellation(engine, detail.history);
    });
    parent.addEventListener('formatx:organismshape', event => {
      const detail = event.detail || {};
      engine.fxGenomeEnabled = detail.genomeEnabled !== false;
      if (!engine.fxGenomeEnabled) engine.fxActiveSynapse = -1;
      setForm(engine, engine.fxGenomeEnabled ? (detail.form ?? detail.scene ?? 0) : 0, detail.fingerprint, detail.source || 'control');
    });
  } catch (_) {}

  if (engine.root) {
    engine.root.dataset.fxThreeRenderer = 'three-webgl-morphing-organism-v3';
    engine.root.dataset.fxMobile3dEngine = 'morphing-organism-v3-running';
    engine.root.dataset.fxCoreForm = 'synaptic-thought-genome-v1';
    engine.root.dataset.fxCoreMorph = '0';
  }

  const originalDispose = engine.dispose.bind(engine);
  engine.dispose = function disposeMorphingEngine() {
    for (const entry of this.fxSynapses || []) {
      entry.tube.geometry.dispose();
      entry.tube.material.dispose();
      entry.node.geometry.dispose();
      entry.node.material.dispose();
    }
    this.fxGenomeStars?.geometry?.dispose();
    this.fxGenomeStars?.material?.dispose();
    this.fxGenomeLine?.geometry?.dispose();
    this.fxGenomeLine?.material?.dispose();
    return originalDispose();
  }.bind(engine);

  return engine;
}

export async function startMobileCore() {
  const engine = await startLivingCoreV2();
  return enhance(engine);
}

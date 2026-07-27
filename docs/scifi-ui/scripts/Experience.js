import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';

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

const runtimeState = (() => {
  try {
    const shared = window.parent && window.parent.__FORMATX_3D_STATE__;
    if (shared instanceof Float32Array && shared.length >= 16) return shared;
  } catch (_) {}
  const fallback = new Float32Array(16);
  fallback[INDEX.WIDTH] = innerWidth;
  fallback[INDEX.HEIGHT] = innerHeight;
  fallback[INDEX.DPR] = devicePixelRatio || 1;
  fallback[INDEX.SCALE] = 1;
  fallback[INDEX.VISIBLE] = 1;
  return fallback;
})();

const CORE_VERTEX = `
  precision highp float;
  uniform float uTime;
  uniform float uScene;
  uniform float uPulse;
  uniform float uQuality;
  uniform vec2 uPointer;
  attribute float aSeed;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vEnergy;
  varying float vState;
  varying float vSeed;

  #define PI 3.14159265359

  float hash11(float p) {
    return fract(sin(p * 127.13) * 43758.5453123);
  }

  float weight(float scene, float target) {
    return max(1.0 - abs(scene - target), 0.0);
  }

  vec3 safeTangent(vec3 n) {
    vec3 axis = abs(n.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    return normalize(cross(n, axis));
  }

  void main() {
    vec3 n = normalize(normal);
    vec3 tangent = safeTangent(n);
    vec3 bitangent = normalize(cross(n, tangent));
    float phase = position.x * 5.7 + position.y * 7.1 + position.z * 4.3 + aSeed * 11.0;
    float wave = sin(phase + uTime * 0.72) * sin(position.y * 8.0 - uTime * 0.46);
    float fine = sin(phase * 2.13 - uTime * 0.33) * 0.5 + 0.5;

    vec3 coreShape = position + n * (wave * 0.075 + uPulse * 0.045);

    float nerveSignal = sin(position.y * 17.0 + uTime * 2.1 + aSeed * 8.0);
    vec3 nervousShape = position;
    nervousShape.xz *= 0.72 + nerveSignal * 0.08;
    nervousShape.y *= 1.55;
    nervousShape += tangent * nerveSignal * 0.22 + bitangent * sin(phase * 0.68) * 0.08;

    vec3 planShape = position;
    planShape = sign(planShape) * pow(abs(planShape), vec3(0.72));
    float segment = floor((position.y + 1.4) * 3.5);
    planShape.xz *= 1.08 + step(0.5, fract(segment * 0.37 + aSeed)) * 0.18;
    planShape.y += sin(segment * 2.1 + uTime * 0.42) * 0.055;

    float beat = 0.5 + 0.5 * sin(uTime * 3.2) * sin(uTime * 1.6 + 0.6);
    vec3 heartShape = position;
    heartShape.x *= 1.12 + beat * 0.1;
    heartShape.y *= 1.16 - abs(position.x) * 0.14;
    heartShape.z *= 0.86;
    heartShape.y += 0.08 * (1.0 - abs(n.x));
    heartShape += n * beat * 0.08;

    float facets = floor((wave * 0.5 + 0.5) * mix(3.0, 7.0, uQuality)) / mix(3.0, 7.0, uQuality);
    vec3 aiShape = position + n * (facets * 0.24 - 0.08);
    aiShape += tangent * sin(aSeed * 31.0 + uTime) * 0.075;
    aiShape.xz *= 1.08;

    vec3 beaconShape = position;
    beaconShape.xz *= 0.62 + fine * 0.08;
    beaconShape.y *= 1.78;
    beaconShape += n * sin(phase + uTime * 1.4) * 0.045;

    float w0 = weight(uScene, 0.0);
    float w1 = weight(uScene, 1.0);
    float w2 = weight(uScene, 2.0);
    float w3 = weight(uScene, 3.0);
    float w4 = weight(uScene, 4.0);
    float w5 = weight(uScene, 5.0);
    float totalWeight = max(w0 + w1 + w2 + w3 + w4 + w5, 0.0001);

    vec3 transformed = (
      coreShape * w0 +
      nervousShape * w1 +
      planShape * w2 +
      heartShape * w3 +
      aiShape * w4 +
      beaconShape * w5
    ) / totalWeight;

    float localTransition = fract(max(uScene, 0.0));
    float transitionArc = sin(localTransition * PI);
    float fragmentDirection = hash11(aSeed * 91.0) * 2.0 - 1.0;
    float breakup = transitionArc * (0.18 + uQuality * 0.34);
    transformed += n * fragmentDirection * breakup * (0.32 + aSeed * 0.46);
    transformed += tangent * transitionArc * fragmentDirection * 0.12;
    transformed += bitangent * transitionArc * sin(aSeed * 19.0) * 0.07;

    float pointerDistance = length(transformed.xy - uPointer * vec2(0.72, 0.44));
    float pointerWarp = smoothstep(1.55, 0.0, pointerDistance) * 0.09;
    transformed += n * pointerWarp * sin(uTime * 2.0 + phase);

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * n);
    vEnergy = wave * 0.5 + 0.5;
    vState = uScene;
    vSeed = aSeed;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const CORE_FRAGMENT = `
  precision highp float;
  uniform float uTime;
  uniform float uScene;
  uniform float uPulse;
  uniform float uQuality;
  uniform vec3 uCoreColor;
  uniform vec3 uAccentColor;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying float vEnergy;
  varying float vState;
  varying float vSeed;

  float weight(float scene, float target) {
    return max(1.0 - abs(scene - target), 0.0);
  }

  void main() {
    vec3 normalDirection = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(normalDirection, viewDirection), 0.0), 2.65);
    float scanline = 0.5 + 0.5 * sin(vWorldPosition.y * 42.0 - uTime * 3.6);
    float circuit = smoothstep(0.76, 1.0, sin(vWorldPosition.x * 23.0 + vWorldPosition.z * 19.0 + vSeed * 17.0) * 0.5 + 0.5);
    float micro = smoothstep(0.86, 1.0, sin((vWorldPosition.x - vWorldPosition.y + vWorldPosition.z) * 51.0 + uTime) * 0.5 + 0.5);

    float nervous = weight(uScene, 1.0);
    float plan = weight(uScene, 2.0);
    float commerce = weight(uScene, 3.0);
    float ai = weight(uScene, 4.0);
    float beacon = weight(uScene, 5.0);

    vec3 color = uCoreColor;
    color = mix(color, vec3(0.08, 0.76, 1.0), nervous);
    color = mix(color, vec3(0.18, 1.0, 0.54), plan);
    color = mix(color, vec3(1.0, 0.045, 0.018), commerce);
    color = mix(color, vec3(0.52, 0.18, 1.0), ai);
    color = mix(color, vec3(0.78, 0.95, 1.0), beacon);

    vec3 emission = color * (0.17 + vEnergy * 0.4);
    emission += uAccentColor * fresnel * (1.2 + uQuality * 0.65);
    emission += color * circuit * 0.58;
    emission += color * scanline * 0.085;
    emission += mix(vec3(0.0), color, micro * uQuality) * 0.18;
    emission += color * uPulse * (0.08 + commerce * 0.2);

    float alpha = clamp(0.48 + fresnel * 0.48 + circuit * 0.12, 0.0, 0.96);
    gl_FragColor = vec4(emission, alpha);
  }
`;

const ENERGY_VERTEX = `
  precision highp float;
  uniform float uTime;
  uniform float uPulse;
  uniform float uScene;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec3 p = position + normal * (sin(position.y * 11.0 + uTime * 2.4) * 0.035 + uPulse * 0.05);
    p *= 1.0 + 0.035 * sin(uTime * 1.7 + uScene);
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const ENERGY_FRAGMENT = `
  precision highp float;
  uniform float uTime;
  uniform float uScene;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vWorld;
  float weight(float scene, float target) { return max(1.0 - abs(scene - target), 0.0); }
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorld);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDirection), 0.0), 2.0);
    vec3 color = vec3(0.0, 0.9, 0.78);
    color = mix(color, vec3(0.05, 0.55, 1.0), weight(uScene, 1.0));
    color = mix(color, vec3(1.0, 0.03, 0.01), weight(uScene, 3.0));
    color = mix(color, vec3(0.52, 0.12, 1.0), weight(uScene, 4.0));
    float pulse = 0.55 + uPulse * 0.45;
    gl_FragColor = vec4(color * (0.45 + fresnel * 1.8) * pulse, (0.12 + fresnel * 0.34) * pulse);
  }
`;

const PARTICLE_VERTEX = `
  precision highp float;
  attribute vec4 aSeed;
  uniform float uTime;
  uniform float uScene;
  uniform float uScroll;
  uniform float uVelocity;
  uniform float uPixelRatio;
  uniform float uQuality;
  uniform vec2 uPointer;
  uniform vec2 uPointerVelocity;
  varying float vAlpha;
  varying float vEnergy;
  varying float vCommerce;
  varying float vAI;

  void main() {
    vec3 p = position;
    float phase = aSeed.w * 6.2831853;
    float nervous = max(1.0 - abs(uScene - 1.0), 0.0);
    float commerce = max(1.0 - abs(uScene - 3.0), 0.0);
    float ai = max(1.0 - abs(uScene - 4.0), 0.0);
    float beacon = max(1.0 - abs(uScene - 5.0), 0.0);

    p.z = mod(p.z + uScroll * 34.0 + uTime * (0.06 + aSeed.x * 0.16) + 12.0, 24.0) - 12.0;
    float flowX = sin(p.y * 0.62 + p.z * 0.41 + uTime * 0.24 + phase);
    float flowY = cos(p.x * 0.58 - p.z * 0.34 + uTime * 0.18 + phase);
    p.x += flowX * (0.15 + aSeed.y * 0.36);
    p.y += flowY * (0.1 + aSeed.z * 0.3);
    p.z += uVelocity * (0.55 + aSeed.x * 2.1);

    float lane = floor((p.x + 4.0) * 2.4) / 2.4 - 4.0;
    p.x = mix(p.x, lane, nervous * 0.72);
    p.y += nervous * sin(p.z * 2.3 + phase) * 0.18;
    p.z -= nervous * uTime * (0.5 + aSeed.y * 1.4);

    p.xy *= mix(1.0, 0.62 + aSeed.x * 0.22, commerce);
    p.y += commerce * sin(uTime * 3.2 + phase) * 0.12;
    p.xz *= mix(1.0, 1.08 + sin(phase * 3.0) * 0.1, ai);
    p.y *= mix(1.0, 1.45, beacon);

    vec2 projectedPointer = uPointer * vec2(3.5, 2.0);
    vec2 difference = p.xy - projectedPointer;
    float distanceToPointer = length(difference) + 0.001;
    float pointerForce = smoothstep(2.7, 0.0, distanceToPointer) * (0.12 + length(uPointerVelocity) * 0.035);
    vec2 tangent = vec2(-difference.y, difference.x) / distanceToPointer;
    p.xy += tangent * pointerForce;
    p.xy += normalize(difference) * pointerForce * 0.22;

    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    float perspective = 95.0 / max(-viewPosition.z, 0.45);
    gl_PointSize = (0.8 + aSeed.w * 2.1) * uPixelRatio * clamp(perspective, 0.45, 4.5) * mix(0.82, 1.12, uQuality);
    gl_Position = projectionMatrix * viewPosition;
    vAlpha = smoothstep(12.0, 1.0, abs(p.z));
    vEnergy = aSeed.y;
    vCommerce = commerce;
    vAI = ai;
  }
`;

const PARTICLE_FRAGMENT = `
  precision highp float;
  varying float vAlpha;
  varying float vEnergy;
  varying float vCommerce;
  varying float vAI;
  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float radius = length(point);
    if (radius > 0.5) discard;
    float glow = pow(1.0 - radius * 2.0, 2.25);
    vec3 color = mix(vec3(0.08, 0.82, 1.0), vec3(0.5, 0.18, 1.0), vAI * 0.82);
    color = mix(color, vec3(1.0, 0.045, 0.018), vCommerce);
    gl_FragColor = vec4(color * (0.62 + glow * 1.5), glow * vAlpha * (0.12 + vEnergy * 0.48));
  }
`;

class CyberCore {
  constructor(mobile) {
    this.group = new THREE.Group();
    this.group.position.set(0, 0.05, 0);
    const detail = mobile ? 4 : 5;
    this.geometry = new THREE.IcosahedronGeometry(1.28, detail);
    const count = this.geometry.attributes.position.count;
    const seeds = new Float32Array(count);
    for (let index = 0; index < count; index += 1) seeds[index] = Math.random();
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uScene: { value: 0 },
      uPulse: { value: 0 },
      uQuality: { value: mobile ? 0.42 : 0.72 },
      uPointer: { value: new THREE.Vector2() },
      uCoreColor: { value: new THREE.Color('#00f0bd') },
      uAccentColor: { value: new THREE.Color('#83eaff') }
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader: CORE_VERTEX,
      fragmentShader: CORE_FRAGMENT,
      uniforms: this.uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    this.shell = new THREE.Mesh(this.geometry, this.material);
    this.shell.frustumCulled = false;
    this.group.add(this.shell);

    this.energyUniforms = {
      uTime: this.uniforms.uTime,
      uScene: this.uniforms.uScene,
      uPulse: this.uniforms.uPulse
    };
    this.energyGeometry = new THREE.IcosahedronGeometry(0.64, mobile ? 3 : 4);
    this.energyMaterial = new THREE.ShaderMaterial({
      vertexShader: ENERGY_VERTEX,
      fragmentShader: ENERGY_FRAGMENT,
      uniforms: this.energyUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    this.energy = new THREE.Mesh(this.energyGeometry, this.energyMaterial);
    this.group.add(this.energy);

    this.wireGeometry = new THREE.WireframeGeometry(this.geometry);
    this.wireMaterial = new THREE.LineBasicMaterial({
      color: '#72e8ff',
      transparent: true,
      opacity: 0.085,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.wire = new THREE.LineSegments(this.wireGeometry, this.wireMaterial);
    this.wire.scale.setScalar(1.006);
    this.group.add(this.wire);

    this.rings = [];
    const ringColors = ['#65f5ff', '#805dff', '#29ffad'];
    for (let index = 0; index < 3; index += 1) {
      const geometry = new THREE.TorusGeometry(1.62 + index * 0.28, 0.012 + index * 0.004, 6, mobile ? 72 : 112);
      const material = new THREE.MeshBasicMaterial({
        color: ringColors[index],
        transparent: true,
        opacity: 0.22 - index * 0.035,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.set(index * 0.72, index * 1.05, index * 0.44);
      this.rings.push(ring);
      this.group.add(ring);
    }

    this.maxFragments = mobile ? 48 : 96;
    this.fragmentGeometry = new THREE.OctahedronGeometry(0.065, 0);
    this.fragmentMaterial = new THREE.MeshBasicMaterial({
      color: '#9cecff',
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.fragments = new THREE.InstancedMesh(this.fragmentGeometry, this.fragmentMaterial, this.maxFragments);
    this.fragments.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.fragmentSeeds = new Float32Array(this.maxFragments * 5);
    for (let index = 0; index < this.maxFragments; index += 1) {
      const offset = index * 5;
      this.fragmentSeeds[offset] = Math.random() * Math.PI * 2;
      this.fragmentSeeds[offset + 1] = Math.acos(Math.random() * 2 - 1);
      this.fragmentSeeds[offset + 2] = 1.55 + Math.random() * 1.75;
      this.fragmentSeeds[offset + 3] = 0.2 + Math.random() * 0.85;
      this.fragmentSeeds[offset + 4] = 0.5 + Math.random() * 1.5;
    }
    this.fragmentDummy = new THREE.Object3D();
    this.group.add(this.fragments);
    this.fragmentCount = mobile ? 36 : 72;
    this.fragments.count = this.fragmentCount;
  }

  setQuality(value, fragmentCount) {
    this.uniforms.uQuality.value = value;
    this.fragmentCount = Math.min(this.maxFragments, fragmentCount);
    this.fragments.count = this.fragmentCount;
    this.wireMaterial.opacity = 0.045 + value * 0.07;
  }

  update(time, scene, pulse, pointerX, pointerY, orbitX, orbitY, scale) {
    this.uniforms.uTime.value = time;
    this.uniforms.uScene.value = scene;
    this.uniforms.uPulse.value = pulse;
    this.uniforms.uPointer.value.set(pointerX, pointerY);
    this.group.rotation.y = time * 0.085 + orbitX;
    this.group.rotation.x = Math.sin(time * 0.19) * 0.055 + orbitY;
    this.group.scale.setScalar(scale);
    this.energy.scale.setScalar(0.96 + pulse * 0.075);
    this.wire.rotation.y = -time * 0.035;
    const commerce = Math.max(0, 1 - Math.abs(scene - 3));
    this.fragmentMaterial.color.setRGB(0.55 + commerce * 0.45, 0.9 - commerce * 0.76, 1 - commerce * 0.9);
    const local = scene - Math.floor(scene);
    const transition = Math.sin(local * Math.PI);
    for (let index = 0; index < this.fragmentCount; index += 1) {
      const offset = index * 5;
      const azimuth = this.fragmentSeeds[offset] + time * (0.04 + this.fragmentSeeds[offset + 3] * 0.08);
      const polar = this.fragmentSeeds[offset + 1] + Math.sin(time * 0.13 + index) * 0.08;
      const radius = this.fragmentSeeds[offset + 2] + transition * (0.45 + this.fragmentSeeds[offset + 3] * 0.9);
      const sinPolar = Math.sin(polar);
      this.fragmentDummy.position.set(
        Math.cos(azimuth) * sinPolar * radius,
        Math.cos(polar) * radius,
        Math.sin(azimuth) * sinPolar * radius
      );
      this.fragmentDummy.rotation.set(azimuth * 0.7, polar + time * 0.1, azimuth - polar);
      const fragmentScale = (0.55 + this.fragmentSeeds[offset + 4] * 0.35) * (0.72 + transition * 0.45);
      this.fragmentDummy.scale.setScalar(fragmentScale);
      this.fragmentDummy.updateMatrix();
      this.fragments.setMatrixAt(index, this.fragmentDummy.matrix);
    }
    this.fragments.instanceMatrix.needsUpdate = true;
    for (let index = 0; index < this.rings.length; index += 1) {
      const ring = this.rings[index];
      ring.rotation.x += 0.0008 * (index + 1);
      ring.rotation.y += 0.0012 * (index % 2 === 0 ? 1 : -1);
      ring.scale.setScalar(1 + transition * 0.08 + pulse * commerce * 0.04);
      ring.material.opacity = 0.1 + transition * 0.16 + (index === 0 ? pulse * commerce * 0.08 : 0);
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.energyGeometry.dispose();
    this.energyMaterial.dispose();
    this.wireGeometry.dispose();
    this.wireMaterial.dispose();
    this.fragmentGeometry.dispose();
    this.fragmentMaterial.dispose();
    for (let index = 0; index < this.rings.length; index += 1) {
      this.rings[index].geometry.dispose();
      this.rings[index].material.dispose();
    }
  }
}

class ParticleField {
  constructor(mobile) {
    this.maxCount = mobile ? 7000 : 14000;
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxCount * 3);
    const seeds = new Float32Array(this.maxCount * 4);
    for (let index = 0; index < this.maxCount; index += 1) {
      const p = index * 3;
      const s = index * 4;
      const radius = 1.2 + Math.random() * 5.6;
      const angle = Math.random() * Math.PI * 2;
      positions[p] = Math.cos(angle) * radius;
      positions[p + 1] = (Math.random() - 0.5) * 7.5;
      positions[p + 2] = (Math.random() - 0.5) * 24;
      seeds[s] = Math.random();
      seeds[s + 1] = Math.random();
      seeds[s + 2] = Math.random();
      seeds[s + 3] = Math.random();
    }
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    this.uniforms = {
      uTime: { value: 0 },
      uScene: { value: 0 },
      uScroll: { value: 0 },
      uVelocity: { value: 0 },
      uPixelRatio: { value: 1 },
      uQuality: { value: mobile ? 0.4 : 0.72 },
      uPointer: { value: new THREE.Vector2() },
      uPointerVelocity: { value: new THREE.Vector2() }
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.setCount(mobile ? 3200 : 8500);
  }

  setCount(count) {
    this.count = Math.max(800, Math.min(this.maxCount, count));
    this.geometry.setDrawRange(0, this.count);
  }

  setQuality(value, pixelRatio) {
    this.uniforms.uQuality.value = value;
    this.uniforms.uPixelRatio.value = pixelRatio;
  }

  update(time, scene, scroll, velocity, pointerX, pointerY, pointerVX, pointerVY) {
    this.uniforms.uTime.value = time;
    this.uniforms.uScene.value = scene;
    this.uniforms.uScroll.value = scroll;
    this.uniforms.uVelocity.value = velocity;
    this.uniforms.uPointer.value.set(pointerX, pointerY);
    this.uniforms.uPointerVelocity.value.set(pointerVX, pointerVY);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.positionCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.28, 6.6),
      new THREE.Vector3(-0.35, 0.12, 4.7),
      new THREE.Vector3(0.1, 0.02, 3.05),
      new THREE.Vector3(2.15, 0.38, 4.15),
      new THREE.Vector3(0.02, 0.02, 2.68),
      new THREE.Vector3(-1.75, 0.72, 4.35),
      new THREE.Vector3(0.0, 1.12, 6.9)
    ], false, 'catmullrom', 0.32);
    this.targetCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0, 0.02, -0.35),
      new THREE.Vector3(0, 0, -1.6),
      new THREE.Vector3(0.3, 0, -0.45),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.18, -0.8),
      new THREE.Vector3(0, 0.45, -1.8)
    ], false, 'catmullrom', 0.32);
    this.desiredPosition = new THREE.Vector3();
    this.desiredTarget = new THREE.Vector3();
    this.rotationMatrix = new THREE.Matrix4();
    this.desiredQuaternion = new THREE.Quaternion();
  }

  update(progress, delta, pointerX, pointerY, velocity) {
    this.positionCurve.getPointAt(progress, this.desiredPosition);
    this.targetCurve.getPointAt(progress, this.desiredTarget);
    this.desiredPosition.x += pointerX * 0.16;
    this.desiredPosition.y += pointerY * 0.1;
    this.desiredPosition.z -= Math.min(Math.abs(velocity), 1.5) * 0.12;
    const positionalSmoothing = 1 - Math.exp(-delta * 5.8);
    const rotationalSmoothing = 1 - Math.exp(-delta * 7.4);
    this.camera.position.lerp(this.desiredPosition, positionalSmoothing);
    this.rotationMatrix.lookAt(this.camera.position, this.desiredTarget, this.camera.up);
    this.desiredQuaternion.setFromRotationMatrix(this.rotationMatrix);
    this.camera.quaternion.slerp(this.desiredQuaternion, rotationalSmoothing);
  }
}

class QualityGovernor {
  constructor(experience, mobile) {
    this.experience = experience;
    this.mobile = mobile;
    this.tier = mobile ? 1 : 2;
    this.frames = 0;
    this.elapsed = 0;
    this.highWindows = 0;
    this.apply();
  }

  sample(delta) {
    this.frames += 1;
    this.elapsed += delta;
    if (this.elapsed < 2.2) return;
    const fps = this.frames / this.elapsed;
    if (fps < 45 && this.tier > 0) {
      this.tier -= 1;
      this.highWindows = 0;
      this.apply();
    } else if (fps > 58 && this.tier < 3) {
      this.highWindows += 1;
      if (this.highWindows >= 2) {
        this.tier += 1;
        this.highWindows = 0;
        this.apply();
      }
    } else {
      this.highWindows = 0;
    }
    this.experience.reportFps(fps, this.tier);
    this.frames = 0;
    this.elapsed = 0;
  }

  apply() {
    const ratios = this.mobile ? [0.62, 0.78, 0.92, 1.0] : [0.68, 0.9, 1.08, 1.25];
    const particles = this.mobile ? [1300, 2400, 4000, 6200] : [2200, 4800, 8500, 12500];
    const fragments = this.mobile ? [18, 28, 40, 48] : [28, 48, 72, 92];
    const quality = [0.25, 0.46, 0.72, 1.0][this.tier];
    this.experience.applyQuality(ratios[this.tier], particles[this.tier], fragments[this.tier], quality);
  }
}

class Experience {
  constructor() {
    this.mobile = matchMedia('(max-width: 820px), (pointer: coarse)').matches;
    this.reduced = Boolean(runtimeState[INDEX.REDUCED]);
    this.width = Math.max(1, runtimeState[INDEX.WIDTH] || innerWidth);
    this.height = Math.max(1, runtimeState[INDEX.HEIGHT] || innerHeight);
    this.baseDpr = Math.max(1, runtimeState[INDEX.DPR] || devicePixelRatio || 1);
    this.sceneValue = runtimeState[INDEX.SCENE] || 0;
    this.scrollValue = runtimeState[INDEX.SCROLL] || 0;
    this.pointerX = 0;
    this.pointerY = 0;
    this.pointerVX = 0;
    this.pointerVY = 0;
    this.scale = 1;
    this.previousTime = performance.now();
    this.running = true;
    this.frameHandle = 0;

    this.renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: false,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
    this.renderer.setClearColor(0x010307, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010307);
    this.scene.fog = new THREE.FogExp2(0x010307, 0.055);
    this.camera = new THREE.PerspectiveCamera(47, this.width / this.height, 0.05, 80);
    this.camera.position.set(0, 0.28, 6.6);

    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.core = new CyberCore(this.mobile);
    this.world.add(this.core.group);
    this.particles = new ParticleField(this.mobile);
    this.world.add(this.particles.points);

    this.grid = new THREE.GridHelper(38, this.mobile ? 46 : 76, 0x15798a, 0x09252f);
    this.grid.position.y = -2.05;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.17;
    this.grid.material.depthWrite = false;
    this.world.add(this.grid);

    this.backGrid = new THREE.GridHelper(34, this.mobile ? 38 : 64, 0x5a1aff, 0x0d2632);
    this.backGrid.rotation.x = Math.PI * 0.5;
    this.backGrid.position.z = -8;
    this.backGrid.material.transparent = true;
    this.backGrid.material.opacity = 0.085;
    this.backGrid.material.depthWrite = false;
    this.world.add(this.backGrid);

    this.cameraRig = new CameraRig(this.camera);
    this.governor = new QualityGovernor(this, this.mobile);
    this.resize();
    this.signalReady();
    this.frame = this.frame.bind(this);
    this.frameHandle = requestAnimationFrame(this.frame);
    addEventListener('resize', () => this.resize(), { passive: true });
    addEventListener('pagehide', () => this.dispose(), { once: true });
  }

  signalReady() {
    try {
      const root = window.parent.document.documentElement;
      root.dataset.fxThree = 'ready';
      root.dataset.fxThreeRenderer = 'three-webgl';
      window.parent.dispatchEvent(new CustomEvent('formatx:threeready'));
    } catch (_) {}
  }

  reportFps(fps, tier) {
    try {
      const root = window.parent.document.documentElement;
      root.dataset.fxThreeQuality = String(tier);
      root.style.setProperty('--fx-three-fps', String(Math.round(fps)));
      const output = window.parent.document.querySelector('[data-fx-three-telemetry]');
      if (output) output.textContent = 'THREE / Q' + tier + ' / ' + Math.round(fps) + ' FPS';
    } catch (_) {}
  }

  applyQuality(ratio, particleCount, fragmentCount, quality) {
    this.pixelRatio = Math.min(this.baseDpr, ratio);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height, false);
    this.particles.setCount(particleCount);
    this.particles.setQuality(quality, this.pixelRatio);
    this.core.setQuality(quality, fragmentCount);
  }

  resize() {
    this.width = Math.max(1, runtimeState[INDEX.WIDTH] || innerWidth);
    this.height = Math.max(1, runtimeState[INDEX.HEIGHT] || innerHeight);
    this.baseDpr = Math.max(1, runtimeState[INDEX.DPR] || devicePixelRatio || 1);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
  }

  frame(now) {
    if (!this.running) return;
    this.frameHandle = requestAnimationFrame(this.frame);
    if (runtimeState[INDEX.VISIBLE] < 0.5) {
      this.previousTime = now;
      return;
    }
    const delta = Math.min((now - this.previousTime) / 1000, 0.05);
    this.previousTime = now;
    const stateSmoothing = 1 - Math.exp(-delta * 5.6);
    const pointerSmoothing = 1 - Math.exp(-delta * 9.0);
    this.sceneValue += (runtimeState[INDEX.SCENE] - this.sceneValue) * stateSmoothing;
    this.scrollValue += (runtimeState[INDEX.SCROLL] - this.scrollValue) * stateSmoothing;
    this.pointerX += (runtimeState[INDEX.POINTER_X] - this.pointerX) * pointerSmoothing;
    this.pointerY += (runtimeState[INDEX.POINTER_Y] - this.pointerY) * pointerSmoothing;
    this.pointerVX += (runtimeState[INDEX.POINTER_VX] - this.pointerVX) * pointerSmoothing;
    this.pointerVY += (runtimeState[INDEX.POINTER_VY] - this.pointerVY) * pointerSmoothing;
    this.scale += ((runtimeState[INDEX.SCALE] || 1) - this.scale) * stateSmoothing;
    const time = now * 0.001;
    const pulse = 0.5 + 0.5 * Math.sin(time * 3.2) * Math.sin(time * 1.6 + 0.6);
    const orbitX = runtimeState[INDEX.ORBIT_X];
    const orbitY = runtimeState[INDEX.ORBIT_Y];
    const velocity = runtimeState[INDEX.VELOCITY];

    this.core.update(time, this.sceneValue, pulse, this.pointerX, this.pointerY, orbitX, orbitY, this.scale);
    this.particles.update(time, this.sceneValue, this.scrollValue, velocity, this.pointerX, this.pointerY, this.pointerVX, this.pointerVY);
    this.cameraRig.update(Math.min(1, Math.max(0, this.sceneValue / 5)), delta, this.pointerX, this.pointerY, velocity);
    this.grid.position.z = (this.scrollValue * 18) % 1.0;
    this.grid.material.opacity = 0.09 + Math.max(0, 1 - Math.abs(this.sceneValue - 2)) * 0.16;
    this.backGrid.material.opacity = 0.035 + Math.max(0, 1 - Math.abs(this.sceneValue - 1)) * 0.16;
    this.backGrid.position.z = -8 + Math.sin(time * 0.18) * 0.22;
    this.renderer.render(this.scene, this.camera);
    this.governor.sample(delta);
  }

  dispose() {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.frameHandle);
    this.core.dispose();
    this.particles.dispose();
    this.grid.geometry.dispose();
    this.grid.material.dispose();
    this.backGrid.geometry.dispose();
    this.backGrid.material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}

try {
  new Experience();
} catch (error) {
  console.error('FormatX Three engine failed:', error);
  try {
    window.parent.document.documentElement.dataset.fxThree = 'error';
  } catch (_) {}
}

// @ts-check
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.webgpu.js';
import {
  Fn,
  If,
  Break,
  Loop,
  PI,
  TWO_PI,
  uniform,
  float,
  vec2,
  vec3,
  vec4,
  color,
  mix,
  min,
  max,
  smoothstep,
  step,
  hash,
  shapeCircle,
  instancedArray,
  instanceIndex,
  deltaTime,
  positionLocal,
  positionGeometry,
  normalLocal,
  positionWorld,
  normalWorld,
  cameraPosition,
  modelWorldMatrixInverse,
  varying
} from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.tsl.js';
import { WebXRDirector } from './WebXRDirector.js?v=20260727-webgpu-1';

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
    if (shared && ArrayBuffer.isView(shared) && shared.BYTES_PER_ELEMENT === 4 && shared.length >= 16) return shared;
  } catch (_) {}
  const fallback = new Float32Array(16);
  fallback[INDEX.WIDTH] = innerWidth;
  fallback[INDEX.HEIGHT] = innerHeight;
  fallback[INDEX.DPR] = devicePixelRatio || 1;
  fallback[INDEX.SCALE] = 1;
  fallback[INDEX.VISIBLE] = 1;
  return fallback;
})();

const tslFn = Fn;
const clampNumber = (value, low, high) => Math.max(low, Math.min(high, value));

function stateWeight(scene, target) {
  return float(1).sub(scene.sub(target).abs()).max(0);
}

function stateColor(scene) {
  let result = mix(color(0x00f0c8), color(0x18a8ff), stateWeight(scene, 1));
  result = mix(result, color(0x27ff82), stateWeight(scene, 2));
  result = mix(result, color(0xff1607), stateWeight(scene, 3));
  result = mix(result, color(0x8a42ff), stateWeight(scene, 4));
  return mix(result, color(0xd8f7ff), stateWeight(scene, 5));
}

const hitBox = tslFn(({ orig, dir }) => {
  const boxMin = vec3(-0.5);
  const boxMax = vec3(0.5);
  const inverseDirection = dir.reciprocal();
  const tMinTemporary = boxMin.sub(orig).mul(inverseDirection);
  const tMaxTemporary = boxMax.sub(orig).mul(inverseDirection);
  const tMin = min(tMinTemporary, tMaxTemporary);
  const tMax = max(tMinTemporary, tMaxTemporary);
  return vec2(
    max(tMin.x, max(tMin.y, tMin.z)),
    min(tMax.x, min(tMax.y, tMax.z))
  );
});

function raymarchBox(steps, callback) {
  const origin = varying(vec3(modelWorldMatrixInverse.mul(vec4(cameraPosition, 1))));
  const direction = varying(positionGeometry.sub(origin));
  const rayDirection = direction.normalize();
  const bounds = vec2(hitBox({ orig: origin, dir: rayDirection })).toVar();
  bounds.x.greaterThan(bounds.y).discard();
  bounds.assign(vec2(max(bounds.x, 0), bounds.y));
  const increment = vec3(rayDirection.abs().reciprocal()).toVar();
  const delta = float(min(increment.x, min(increment.y, increment.z))).toVar();
  delta.divAssign(float(steps));
  const rayPosition = vec3(origin.add(bounds.x.mul(rayDirection))).toVar();
  Loop({ type: 'float', start: bounds.x, end: bounds.y, update: delta }, () => {
    callback({ rayPosition, rayDirection, delta });
    rayPosition.addAssign(rayDirection.mul(delta));
  });
}

class CyberCoreTSL {
  constructor(mobile) {
    this.group = new THREE.Group();
    this.time = uniform(0);
    this.scene = uniform(0);
    this.pulse = uniform(0);
    this.explode = uniform(1);
    this.quality = uniform(mobile ? 0.52 : 0.8);
    this.pointer = uniform(new THREE.Vector2());

    const geometry = new THREE.IcosahedronGeometry(1.72, mobile ? 5 : 6);
    const material = new THREE.MeshBasicNodeMaterial();
    material.transparent = true;
    material.depthWrite = false;
    material.side = THREE.DoubleSide;
    material.blending = THREE.AdditiveBlending;

    const deformCore = tslFn(({ position }) => {
      const p = vec3(position);
      const n = normalLocal.normalize();
      const tangent = vec3(n.z.negate(), 0.17, n.x).normalize();
      const bitangent = n.cross(tangent).normalize();
      const phase = p.x.mul(5.7).add(p.y.mul(7.1)).add(p.z.mul(4.3));
      const seed = phase.mul(12.9898).sin().mul(43758.5453).fract();
      const wave = phase.add(this.time.mul(0.72)).sin().mul(p.y.mul(8).sub(this.time.mul(0.46)).sin());
      const fine = phase.mul(2.13).sub(this.time.mul(0.33)).sin().mul(0.5).add(0.5);

      const coreShape = p.add(n.mul(wave.mul(0.075).add(this.pulse.mul(0.045))));

      const nerveSignal = p.y.mul(17).add(this.time.mul(2.1)).add(seed.mul(8)).sin();
      const nerveScale = float(0.72).add(nerveSignal.mul(0.08));
      const nervousShape = vec3(p.x.mul(nerveScale), p.y.mul(1.55), p.z.mul(nerveScale))
        .add(tangent.mul(nerveSignal.mul(0.22)))
        .add(bitangent.mul(phase.mul(0.68).sin().mul(0.08)));

      const planBase = p.abs().pow(vec3(0.72)).mul(p.sign());
      const segment = p.y.add(1.4).mul(3.5).floor();
      const segmentGate = step(0.5, segment.mul(0.37).add(seed).fract());
      const planScale = float(1.08).add(segmentGate.mul(0.18));
      const organsShape = vec3(
        planBase.x.mul(planScale),
        planBase.y.add(segment.mul(2.1).add(this.time.mul(0.42)).sin().mul(0.055)),
        planBase.z.mul(planScale)
      );

      const beat = float(0.5).add(this.time.mul(3.2).sin().mul(this.time.mul(1.6).add(0.6).sin()).mul(0.5));
      const heartShape = vec3(
        p.x.mul(float(1.12).add(beat.mul(0.1))),
        p.y.mul(float(1.16).sub(p.x.abs().mul(0.14))).add(float(0.08).mul(float(1).sub(n.x.abs()))),
        p.z.mul(0.86)
      ).add(n.mul(beat.mul(0.08)));

      const facetSteps = mix(float(3), float(7), this.quality);
      const facets = wave.mul(0.5).add(0.5).mul(facetSteps).floor().div(facetSteps);
      const skeletonShape = p.add(n.mul(facets.mul(0.24).sub(0.08)))
        .add(tangent.mul(seed.mul(31).add(this.time).sin().mul(0.075)))
        .mul(vec3(1.08, 1, 1.08));

      const beaconScale = float(0.62).add(fine.mul(0.08));
      const beaconShape = vec3(p.x.mul(beaconScale), p.y.mul(1.78), p.z.mul(beaconScale))
        .add(n.mul(phase.add(this.time.mul(1.4)).sin().mul(0.045)));

      const w0 = stateWeight(this.scene, 0);
      const w1 = stateWeight(this.scene, 1);
      const w2 = stateWeight(this.scene, 2);
      const w3 = stateWeight(this.scene, 3);
      const w4 = stateWeight(this.scene, 4);
      const w5 = stateWeight(this.scene, 5);
      const total = w0.add(w1).add(w2).add(w3).add(w4).add(w5).max(0.0001);
      const transformed = coreShape.mul(w0)
        .add(nervousShape.mul(w1))
        .add(organsShape.mul(w2))
        .add(heartShape.mul(w3))
        .add(skeletonShape.mul(w4))
        .add(beaconShape.mul(w5))
        .div(total)
        .toVar();

      const transitionArc = this.scene.max(0).fract().mul(PI).sin();
      const fragmentDirection = hash(seed.mul(91)).mul(2).sub(1);
      const breakup = transitionArc.mul(this.explode).mul(float(0.18).add(this.quality.mul(0.34)));
      transformed.addAssign(n.mul(fragmentDirection.mul(breakup).mul(float(0.32).add(seed.mul(0.46)))));
      transformed.addAssign(tangent.mul(transitionArc.mul(fragmentDirection).mul(0.12)));
      transformed.addAssign(bitangent.mul(transitionArc.mul(seed.mul(19).sin()).mul(0.07)));

      const pointerDistance = transformed.xy.sub(this.pointer.mul(vec2(0.72, 0.44))).length();
      const pointerWarp = smoothstep(1.55, 0, pointerDistance).mul(0.09);
      transformed.addAssign(n.mul(pointerWarp.mul(this.time.mul(2).add(phase).sin())));
      return transformed;
    });

    material.positionNode = deformCore({ position: positionLocal });
    material.colorNode = tslFn(() => {
      const viewDirection = cameraPosition.sub(positionWorld).normalize();
      const fresnel = float(1).sub(normalWorld.normalize().dot(viewDirection).max(0)).pow(2.65);
      const baseColor = stateColor(this.scene);
      const scanline = positionWorld.y.mul(42).sub(this.time.mul(3.6)).sin().mul(0.5).add(0.5);
      const circuit = smoothstep(0.76, 1, positionWorld.x.mul(23).add(positionWorld.z.mul(19)).sin().mul(0.5).add(0.5));
      return baseColor.mul(float(0.18).add(circuit.mul(0.58)).add(scanline.mul(0.085)))
        .add(color(0xb8ffff).mul(fresnel.mul(float(1.2).add(this.quality.mul(0.65)))))
        .add(baseColor.mul(this.pulse.mul(float(0.08).add(stateWeight(this.scene, 3).mul(0.2)))));
    })();
    material.opacityNode = tslFn(() => {
      const viewDirection = cameraPosition.sub(positionWorld).normalize();
      const fresnel = float(1).sub(normalWorld.normalize().dot(viewDirection).max(0)).pow(2.4);
      return float(0.42).add(fresnel.mul(0.48)).clamp(0, 0.94);
    })();

    this.shell = new THREE.Mesh(geometry, material);
    this.shell.frustumCulled = false;
    this.group.add(this.shell);

    const energyMaterial = new THREE.MeshBasicNodeMaterial();
    energyMaterial.transparent = true;
    energyMaterial.depthWrite = false;
    energyMaterial.blending = THREE.AdditiveBlending;
    energyMaterial.positionNode = positionLocal.add(normalLocal.mul(positionLocal.y.mul(11).add(this.time.mul(2.4)).sin().mul(0.035).add(this.pulse.mul(0.05))));
    energyMaterial.colorNode = stateColor(this.scene).mul(float(0.45).add(this.pulse.mul(0.65)));
    energyMaterial.opacityNode = float(0.12).add(this.pulse.mul(0.16));
    this.energy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.28, mobile ? 3 : 4), energyMaterial);
    this.group.add(this.energy);
  }

  update(timeValue, sceneValue, pointerX, pointerY, quality) {
    this.time.value = timeValue;
    this.scene.value = sceneValue;
    this.pulse.value = 0.5 + 0.5 * Math.sin(timeValue * 3.2) * Math.sin(timeValue * 1.6 + 0.6);
    this.explode.value = 0.75 + quality * 0.5;
    this.quality.value = quality;
    this.pointer.value.set(pointerX, pointerY);
  }

  dispose() {
    this.group.traverse(object => {
      if (!object.isMesh) return;
      object.geometry.dispose();
      object.material.dispose();
    });
  }
}

class ComputeParticleField {
  constructor(renderer, mobile, reduced) {
    this.renderer = renderer;
    this.maxCount = reduced ? 60000 : mobile ? 260000 : 500000;
    this.counts = reduced ? [18000, 30000, 45000, 60000] : mobile ? [45000, 90000, 160000, 260000] : [80000, 170000, 320000, 500000];
    this.time = uniform(0);
    this.scene = uniform(0);
    this.pointer = uniform(new THREE.Vector3());
    this.pointerVelocity = uniform(new THREE.Vector2());
    this.scrollVelocity = uniform(0);
    this.fieldStrength = uniform(1);
    this.pointScale = uniform(mobile ? 0.034 : 0.028);

    this.positions = instancedArray(this.maxCount, 'vec3');
    this.velocities = instancedArray(this.maxCount, 'vec3');
    this.seeds = instancedArray(this.maxCount, 'vec4');

    const curlField = tslFn(({ position, timeNode }) => {
      const p0 = position.mul(0.42);
      const p1 = position.mul(0.93).add(vec3(7.1, -3.2, 4.7));
      const curl0 = vec3(
        p0.y.sub(timeNode).sin().mul(-0.42).sub(p0.z.add(timeNode).cos().mul(0.42)),
        p0.z.sub(timeNode).sin().mul(-0.42).sub(p0.x.add(timeNode).cos().mul(0.42)),
        p0.x.sub(timeNode).sin().mul(-0.42).sub(p0.y.add(timeNode).cos().mul(0.42))
      );
      const curl1 = vec3(
        p1.y.add(timeNode.mul(0.7)).sin().mul(-0.93).sub(p1.z.sub(timeNode).cos().mul(0.93)),
        p1.z.add(timeNode.mul(0.6)).sin().mul(-0.93).sub(p1.x.sub(timeNode).cos().mul(0.93)),
        p1.x.add(timeNode.mul(0.8)).sin().mul(-0.93).sub(p1.y.sub(timeNode).cos().mul(0.93))
      );
      return curl0.add(curl1.mul(0.38)).normalize();
    });

    this.computeInit = tslFn(() => {
      const position = this.positions.element(instanceIndex);
      const velocity = this.velocities.element(instanceIndex);
      const seed = this.seeds.element(instanceIndex);
      const r0 = hash(instanceIndex.add(1));
      const r1 = hash(instanceIndex.add(17));
      const r2 = hash(instanceIndex.add(53));
      const r3 = hash(instanceIndex.add(101));
      const direction = vec3(r0.mul(2).sub(1), r1.mul(2).sub(1), r2.mul(2).sub(1)).normalize();
      const radius = r3.pow(0.34).mul(13.5).add(0.8);
      position.assign(direction.mul(radius));
      velocity.assign(curlField({ position, timeNode: r2.mul(TWO_PI) }).mul(0.12));
      seed.assign(vec4(r0, r1, r2, r3));
    })().compute(this.maxCount).setName('FormatX particle initialization');

    const updateFn = tslFn(() => {
      const position = this.positions.element(instanceIndex);
      const velocity = this.velocities.element(instanceIndex);
      const seed = this.seeds.element(instanceIndex);
      const dt = deltaTime.min(0.033).toVar();
      const nervous = stateWeight(this.scene, 1);
      const commerce = stateWeight(this.scene, 3);
      const beacon = stateWeight(this.scene, 5);
      const fieldTime = this.time.mul(0.22).add(seed.w.mul(TWO_PI));
      const acceleration = curlField({ position, timeNode: fieldTime }).mul(this.fieldStrength.mul(float(0.7).add(nervous.mul(1.2)).add(beacon.mul(0.45))));
      velocity.addAssign(acceleration.mul(dt));

      const toParticle = position.sub(this.pointer).toVar();
      const pointerDistance = toParticle.length().max(0.001);
      const pointerInfluence = smoothstep(4.2, 0, pointerDistance).mul(float(1).add(this.pointerVelocity.length().mul(1.8)));
      velocity.addAssign(toParticle.div(pointerDistance).mul(pointerInfluence.mul(7.5).mul(dt)));
      velocity.addAssign(position.negate().normalize().mul(commerce.mul(1.4).mul(dt)));
      velocity.z.addAssign(this.scrollVelocity.mul(0.045).mul(dt));
      velocity.mulAssign(float(0.986).pow(dt.mul(60)));
      position.addAssign(velocity.mul(dt));

      If(position.length().greaterThan(18.5), () => {
        position.mulAssign(0.26);
        velocity.mulAssign(0.22);
      });
    });

    this.computeNodes = this.counts.map(count => updateFn().compute(count).setName(`FormatX particle update ${count}`));
    renderer.compute(this.computeInit);

    const material = new THREE.SpriteNodeMaterial();
    const seedNode = this.seeds.element(instanceIndex);
    const velocityNode = this.velocities.element(instanceIndex);
    material.positionNode = this.positions.toAttribute();
    material.scaleNode = this.pointScale.mul(float(0.55).add(seedNode.w.mul(1.35)));
    material.colorNode = mix(
      stateColor(this.scene).mul(float(0.42).add(seedNode.y.mul(0.58))),
      color(0xffffff),
      velocityNode.length().mul(0.85).clamp(0, 1).mul(0.45)
    );
    material.opacityNode = shapeCircle().mul(float(0.14).add(seedNode.z.mul(0.5)));
    material.transparent = true;
    material.depthWrite = false;
    material.blending = THREE.AdditiveBlending;
    material.alphaToCoverage = true;

    this.sprite = new THREE.Sprite(material);
    this.sprite.count = this.counts[1];
    this.sprite.frustumCulled = false;
    this.tier = 1;
  }

  setTier(tier) {
    this.tier = clampNumber(tier, 0, 3);
    this.sprite.count = this.counts[this.tier];
    this.fieldStrength.value = [0.65, 0.82, 1, 1.18][this.tier];
    this.pointScale.value = [0.022, 0.027, 0.032, 0.036][this.tier];
  }

  update(timeValue, sceneValue, pointerX, pointerY, pointerVX, pointerVY, scrollVelocity) {
    this.time.value = timeValue;
    this.scene.value = sceneValue;
    this.pointer.value.set(pointerX * 5.5, pointerY * 3.2, -1.5 + sceneValue * -0.8);
    this.pointerVelocity.value.set(pointerVX, pointerVY);
    this.scrollVelocity.value = scrollVelocity;
    this.renderer.compute(this.computeNodes[this.tier]);
  }

  dispose() {
    this.sprite.material.dispose();
    if (typeof this.positions.dispose === 'function') this.positions.dispose();
    if (typeof this.velocities.dispose === 'function') this.velocities.dispose();
    if (typeof this.seeds.dispose === 'function') this.seeds.dispose();
  }
}

class CyberVolume {
  constructor(mobile, core) {
    this.time = core.time;
    this.scene = core.scene;
    this.pulse = core.pulse;
    this.density = uniform(mobile ? 0.105 : 0.135);
    this.beam = uniform(mobile ? 0.3 : 0.46);
    const steps = mobile ? 38 : 62;

    const volumeNode = tslFn(() => {
      const finalColor = vec4(0).toVar();
      raymarchBox(steps, ({ rayPosition, rayDirection }) => {
        const p = rayPosition.mul(2).toVar();
        const radius = p.length();
        const shell = smoothstep(1.24, 0.08, radius);
        const flowA = p.x.mul(4.1).add(p.y.mul(3.3)).add(this.time.mul(0.38)).sin();
        const flowB = p.z.mul(5.2).sub(p.y.mul(2.7)).sub(this.time.mul(0.27)).cos();
        const flowC = p.x.add(p.z).mul(7.4).add(this.time.mul(0.19)).sin();
        const noise = flowA.mul(0.42).add(flowB.mul(0.36)).add(flowC.mul(0.22)).mul(0.5).add(0.5);
        const heart = stateWeight(this.scene, 3);
        const beacon = stateWeight(this.scene, 5);
        const density = smoothstep(0.34, 0.9, noise.add(this.pulse.mul(0.16)))
          .mul(shell)
          .mul(this.density)
          .mul(float(0.62).add(heart.mul(0.85)).add(beacon.mul(0.38)));
        const axis = float(1).sub(p.xz.length().clamp(0, 1));
        const cameraAlignment = rayDirection.z.abs().pow(2.5);
        const godRay = axis.pow(4).mul(cameraAlignment).mul(this.beam).mul(float(0.35).add(this.pulse.mul(0.65)));
        const sampleColor = stateColor(this.scene).mul(float(0.34).add(noise.mul(0.82))).add(color(0xbffcff).mul(godRay));
        const alpha = density.add(godRay.mul(0.08)).clamp(0, 0.18);
        finalColor.rgb.addAssign(finalColor.a.oneMinus().mul(alpha).mul(sampleColor));
        finalColor.a.addAssign(finalColor.a.oneMinus().mul(alpha));
        If(finalColor.a.greaterThanEqual(0.92), () => Break());
      });
      return finalColor;
    });

    const material = new THREE.MeshBasicNodeMaterial();
    material.fragmentNode = volumeNode();
    material.side = THREE.BackSide;
    material.transparent = true;
    material.depthWrite = false;
    material.blending = THREE.AdditiveBlending;
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.2, 5.2), material);
    this.mesh.frustumCulled = false;
  }

  setTier(tier) {
    this.density.value = [0.065, 0.095, 0.125, 0.15][tier];
    this.beam.value = [0.18, 0.3, 0.44, 0.58][tier];
    this.mesh.visible = tier > 0;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.positionCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.28, 6.6),
      new THREE.Vector3(-0.35, 0.18, 4.1),
      new THREE.Vector3(0.18, 0.05, 1.7),
      new THREE.Vector3(2.1, 0.34, -0.9),
      new THREE.Vector3(0.05, 0.02, -3.25),
      new THREE.Vector3(-1.7, 0.76, -5.25),
      new THREE.Vector3(0, 1.08, -7.35)
    ]);
    this.targetCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -0.4),
      new THREE.Vector3(0, 0, -1.9),
      new THREE.Vector3(0.3, 0, -2.8),
      new THREE.Vector3(0, 0, -4.2),
      new THREE.Vector3(0, 0.18, -6),
      new THREE.Vector3(0, 0.45, -8.4)
    ]);
    this.desiredPosition = new THREE.Vector3();
    this.desiredTarget = new THREE.Vector3();
    this.lookMatrix = new THREE.Matrix4();
    this.desiredQuaternion = new THREE.Quaternion();
  }

  update(progress, delta) {
    this.positionCurve.getPointAt(clampNumber(progress, 0, 1), this.desiredPosition);
    this.targetCurve.getPointAt(clampNumber(progress, 0, 1), this.desiredTarget);
    const positionMix = 1 - Math.exp(-delta * 7.2);
    const rotationMix = 1 - Math.exp(-delta * 8.4);
    this.camera.position.lerp(this.desiredPosition, positionMix);
    this.lookMatrix.lookAt(this.camera.position, this.desiredTarget, this.camera.up);
    this.desiredQuaternion.setFromRotationMatrix(this.lookMatrix);
    this.camera.quaternion.slerp(this.desiredQuaternion, rotationMix);
  }
}

class QualityGovernor {
  constructor(experience, mobile, reduced) {
    this.experience = experience;
    this.mobile = mobile;
    this.tier = reduced ? 0 : mobile ? 1 : 2;
    this.frames = 0;
    this.elapsed = 0;
    this.stableWindows = 0;
    this.apply();
  }

  sample(delta) {
    this.frames += 1;
    this.elapsed += delta;
    if (this.elapsed < 2) return;
    const fps = this.frames / this.elapsed;
    if (fps < 45 && this.tier > 0) {
      this.tier -= 1;
      this.stableWindows = 0;
      this.apply();
    } else if (fps > 108 && this.tier < 3) {
      this.stableWindows += 1;
      if (this.stableWindows >= 2) {
        this.tier += 1;
        this.stableWindows = 0;
        this.apply();
      }
    } else {
      this.stableWindows = 0;
    }
    this.experience.reportFps(fps, this.tier);
    this.frames = 0;
    this.elapsed = 0;
  }

  apply() {
    const ratios = this.mobile ? [0.58, 0.72, 0.88, 1] : [0.62, 0.82, 1, 1.2];
    const quality = [0.34, 0.55, 0.78, 1][this.tier];
    this.experience.applyQuality(this.tier, ratios[this.tier], quality);
  }
}

export class FormatXWebGPUExperience {
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
    this.disposed = false;
    this.quality = 0.72;
    this.onResize = () => this.resize();
    this.onPageHide = () => this.dispose();
  }

  async init() {
    this.renderer = new THREE.WebGPURenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      multiview: true
    });
    this.renderer.setClearColor(0x010307, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.setSize(this.width, this.height, false);
    document.body.appendChild(this.renderer.domElement);
    await this.renderer.init();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010307);
    this.scene.fog = new THREE.FogExp2(0x010307, 0.047);
    this.camera = new THREE.PerspectiveCamera(47, this.width / this.height, 0.05, 90);
    this.camera.position.set(0, 0.28, 6.6);
    this.world = new THREE.Group();
    this.scene.add(this.world);

    this.core = new CyberCoreTSL(this.mobile);
    this.world.add(this.core.group);
    this.particles = new ComputeParticleField(this.renderer, this.mobile, this.reduced);
    this.world.add(this.particles.sprite);
    this.volume = new CyberVolume(this.mobile, this.core);
    this.world.add(this.volume.mesh);

    this.grid = new THREE.GridHelper(38, this.mobile ? 42 : 72, 0x15798a, 0x09252f);
    this.grid.position.y = -2.05;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.14;
    this.grid.material.depthWrite = false;
    this.world.add(this.grid);

    this.cameraRig = new CameraRig(this.camera);
    this.xrDirector = new WebXRDirector({ renderer: this.renderer, world: this.world, scene: this.scene });
    this.governor = new QualityGovernor(this, this.mobile, this.reduced);
    this.resize();
    this.signalReady();
    addEventListener('resize', this.onResize, { passive: true });
    addEventListener('pagehide', this.onPageHide, { once: true });
    await this.renderer.setAnimationLoop(timeValue => this.frame(timeValue));
    return this;
  }

  signalReady() {
    try {
      const root = window.parent.document.documentElement;
      root.dataset.fxThree = 'ready';
      root.dataset.fxThreeRenderer = 'webgpu-tsl';
      root.dataset.fxWebgpu = 'ready';
      window.parent.dispatchEvent(new CustomEvent('formatx:threeready'));
    } catch (_) {}
  }

  reportFps(fps, tier) {
    try {
      const root = window.parent.document.documentElement;
      root.dataset.fxThreeQuality = String(tier);
      root.style.setProperty('--fx-three-fps', String(Math.round(fps)));
      const output = window.parent.document.querySelector('[data-fx-three-telemetry]');
      if (output) output.textContent = `WEBGPU / Q${tier} / ${Math.round(fps)} FPS`;
    } catch (_) {}
  }

  applyQuality(tier, ratio, quality) {
    this.pixelRatio = Math.min(this.baseDpr, ratio);
    if (this.renderer) {
      this.renderer.setPixelRatio(this.pixelRatio);
      this.renderer.setSize(this.width, this.height, false);
    }
    if (this.particles) this.particles.setTier(tier);
    if (this.volume) this.volume.setTier(tier);
    this.quality = quality;
  }

  resize() {
    this.width = Math.max(1, runtimeState[INDEX.WIDTH] || innerWidth);
    this.height = Math.max(1, runtimeState[INDEX.HEIGHT] || innerHeight);
    this.baseDpr = Math.max(1, runtimeState[INDEX.DPR] || devicePixelRatio || 1);
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
  }

  frame(now) {
    if (!this.running || this.disposed) return;
    if (runtimeState[INDEX.VISIBLE] < 0.5) {
      this.previousTime = now;
      return;
    }
    const delta = Math.min((now - this.previousTime) / 1000, 0.05);
    this.previousTime = now;
    const stateSmoothing = 1 - Math.exp(-delta * 5.6);
    const pointerSmoothing = 1 - Math.exp(-delta * 9);
    this.sceneValue += (runtimeState[INDEX.SCENE] - this.sceneValue) * stateSmoothing;
    this.scrollValue += (runtimeState[INDEX.SCROLL] - this.scrollValue) * stateSmoothing;
    this.pointerX += (runtimeState[INDEX.POINTER_X] - this.pointerX) * pointerSmoothing;
    this.pointerY += (runtimeState[INDEX.POINTER_Y] - this.pointerY) * pointerSmoothing;
    this.pointerVX += (runtimeState[INDEX.POINTER_VX] - this.pointerVX) * pointerSmoothing;
    this.pointerVY += (runtimeState[INDEX.POINTER_VY] - this.pointerVY) * pointerSmoothing;
    this.scale += ((runtimeState[INDEX.SCALE] || 1) - this.scale) * stateSmoothing;
    const seconds = now * 0.001;

    if (!this.renderer.xr.isPresenting) {
      this.world.rotation.x = runtimeState[INDEX.ORBIT_Y] || 0;
      this.world.rotation.y = runtimeState[INDEX.ORBIT_X] || 0;
      this.core.group.scale.setScalar(this.scale);
      this.cameraRig.update(this.scrollValue, delta);
    }

    this.core.update(seconds, this.sceneValue, this.pointerX, this.pointerY, this.quality);
    this.particles.update(
      seconds,
      this.sceneValue,
      this.pointerX,
      this.pointerY,
      this.pointerVX,
      this.pointerVY,
      runtimeState[INDEX.VELOCITY] || 0
    );
    this.volume.mesh.rotation.y = seconds * -0.035;
    this.grid.position.z = -this.scrollValue * 4.2;
    this.renderer.render(this.scene, this.camera);
    this.governor.sample(delta);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.running = false;
    removeEventListener('resize', this.onResize);
    this.renderer?.setAnimationLoop(null);
    this.xrDirector?.dispose();
    this.core?.dispose();
    this.particles?.dispose();
    this.volume?.dispose();
    this.grid?.geometry.dispose();
    this.grid?.material.dispose();
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}

export async function startWebGPUExperience() {
  const experience = new FormatXWebGPUExperience();
  try {
    return await experience.init();
  } catch (error) {
    experience.dispose();
    throw error;
  }
}

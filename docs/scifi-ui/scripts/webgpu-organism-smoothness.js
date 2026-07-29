// Final-source refinement for the FormatX WebGPU organism.
// The live core keeps one proven node material and one render loop while using
// a denser mesh and three gently offset membrane surfaces.
(() => {
  'use strict';

  if (window.__FORMATX_ORGANISM_SMOOTHNESS__) return;
  window.__FORMATX_ORGANISM_SMOOTHNESS__ = true;

  const NativeBlob = window.Blob;

  function replaceRequired(source, search, replacement, label) {
    if (!source.includes(search)) {
      throw new Error('FormatX smooth organism marker missing: ' + label);
    }
    return source.replace(search, replacement);
  }

  function refineOrganism(source) {
    source = replaceRequired(
      source,
      'const geometry = new THREE.SphereGeometry(1.56, mobile ? 36 : 56, mobile ? 24 : 40);',
      `const geometry = new THREE.SphereGeometry(1.56, mobile ? 64 : 128, mobile ? 48 : 96);
    geometry.computeVertexNormals();
    geometry.normalizeNormals();`,
      'high resolution membrane geometry'
    );

    source = replaceRequired(
      source,
      `const breathing = this.time.mul(1.15).sin().mul(0.035).add(this.pulse.mul(0.055));
      const organicWave = phase.add(this.time.mul(0.72)).sin().mul(0.055)
        .add(p.y.mul(4.5).sub(this.time.mul(0.31)).sin().mul(0.03));
      const coreShape = vec3(
        p.x.mul(float(0.96).add(breathing)),
        p.y.mul(float(1.12).add(breathing.mul(0.65))),
        p.z.mul(float(0.92).add(breathing.mul(0.8)))
      ).add(n.mul(organicWave));`,
      `const breathing = this.time.mul(0.92).sin().mul(0.018).add(this.pulse.mul(0.032));
      const broadFlow = p.y.mul(2.6).add(p.x.mul(1.35)).sub(this.time.mul(0.28)).sin().mul(0.026);
      const crossFlow = p.z.mul(3.1).sub(p.y.mul(1.4)).add(this.time.mul(0.19)).sin().mul(0.018);
      const crownFlow = p.x.mul(2.2).add(p.z.mul(2.7)).add(this.time.mul(0.22)).cos().mul(0.014);
      const membraneWave = broadFlow.add(crossFlow).add(crownFlow);
      const coreShape = vec3(
        p.x.mul(float(0.96).add(breathing)),
        p.y.mul(float(1.12).add(breathing.mul(0.45))),
        p.z.mul(float(0.94).add(breathing.mul(0.7)))
      ).add(n.mul(membraneWave));`,
      'continuous biomorphic deformation'
    );

    source = replaceRequired(
      source,
      `const pointerWarp = smoothstep(1.82, 0, pointerDistance).mul(0.17);
      transformed.addAssign(n.mul(pointerWarp.mul(this.time.mul(2).add(phase).sin())));
      transformed.addAssign(tangent.mul(this.pointer.x.mul(pointerWarp).mul(0.16)));
      transformed.addAssign(bitangent.mul(this.pointer.y.mul(pointerWarp).mul(0.12)));`,
      `const pointerWarp = smoothstep(1.9, 0, pointerDistance).mul(0.08);
      transformed.addAssign(n.mul(pointerWarp.mul(this.time.mul(1.45).add(phase.mul(0.48)).sin())));
      transformed.addAssign(tangent.mul(this.pointer.x.mul(pointerWarp).mul(0.055)));
      transformed.addAssign(bitangent.mul(this.pointer.y.mul(pointerWarp).mul(0.045)));`,
      'soft pointer membrane response'
    );

    source = replaceRequired(
      source,
      `const scanline = positionWorld.y.mul(42).sub(this.time.mul(3.6)).sin().mul(0.5).add(0.5);
      const circuit = smoothstep(0.76, 1, positionWorld.x.mul(23).add(positionWorld.z.mul(19)).sin().mul(0.5).add(0.5));
      return baseColor.mul(float(0.28).add(circuit.mul(0.22)).add(scanline.mul(0.04)))
        .add(color(0xb8ffff).mul(fresnel.mul(float(0.42).add(this.quality.mul(0.18)))))
        .add(baseColor.mul(this.pulse.mul(float(0.14).add(stateWeight(this.scene, 3).mul(0.18)))));`,
      `const flowA = positionWorld.y.mul(3.1).add(positionWorld.x.mul(1.7)).sub(this.time.mul(0.52)).sin().mul(0.5).add(0.5);
      const flowB = positionWorld.z.mul(4.2).sub(positionWorld.y.mul(1.9)).add(this.time.mul(0.34)).sin().mul(0.5).add(0.5);
      const filament = smoothstep(0.82, 0.98, flowA.mul(0.62).add(flowB.mul(0.38)));
      return baseColor.mul(float(0.16).add(flowA.mul(0.075)).add(this.pulse.mul(0.1)))
        .add(color(0xd5ffff).mul(fresnel.mul(float(0.5).add(this.quality.mul(0.1)))))
        .add(color(0x4dfff2).mul(filament.mul(0.24)))
        .add(baseColor.mul(flowB.mul(0.06)));`,
      'flowing membrane light'
    );

    source = replaceRequired(
      source,
      'return float(0.16).add(fresnel.mul(0.42)).add(this.pulse.mul(0.06)).clamp(0.08, 0.68);',
      'return float(0.055).add(fresnel.mul(0.24)).add(this.pulse.mul(0.02)).clamp(0.04, 0.34);',
      'glass membrane opacity'
    );

    source = replaceRequired(
      source,
      `this.shell = new THREE.Mesh(geometry, material);
    this.shell.frustumCulled = false;
    this.group.add(this.shell);`,
      `this.shell = new THREE.Mesh(geometry, material);
    this.shell.frustumCulled = false;
    this.group.add(this.shell);

    // The veils deliberately share the same stable node material. Only their
    // transforms differ, producing depth without extra shader pipelines.
    this.outerVeil = new THREE.Mesh(geometry.clone(), material);
    this.outerVeil.frustumCulled = false;
    this.outerVeil.scale.set(1.04, 1.018, 1.032);
    this.outerVeil.rotation.set(0.11, -0.19, 0.075);
    this.group.add(this.outerVeil);

    this.innerVeil = new THREE.Mesh(geometry.clone(), material);
    this.innerVeil.frustumCulled = false;
    this.innerVeil.scale.set(0.92, 0.955, 0.9);
    this.innerVeil.rotation.set(-0.15, 0.23, -0.09);
    this.group.add(this.innerVeil);`,
      'stable layered living membranes'
    );

    source = replaceRequired(
      source,
      'this.energy = new THREE.Mesh(new THREE.SphereGeometry(1.18, mobile ? 26 : 40, mobile ? 18 : 28), energyMaterial);',
      'this.energy = new THREE.Mesh(new THREE.SphereGeometry(1.1, mobile ? 40 : 80, mobile ? 30 : 60), energyMaterial);',
      'smooth inner energy geometry'
    );

    source = replaceRequired(
      source,
      '    this.pointer.value.set(pointerX, pointerY);',
      `    this.pointer.value.set(pointerX, pointerY);
    const layerBreath = 1 + Math.sin(timeValue * 0.78) * 0.006;
    this.outerVeil.scale.set(1.04 * layerBreath, 1.018 / layerBreath, 1.032 * layerBreath);
    this.outerVeil.rotation.y = -0.19 + timeValue * 0.03 + pointerX * 0.03;
    this.outerVeil.rotation.z = 0.075 + Math.sin(timeValue * 0.37) * 0.04;
    this.innerVeil.rotation.x = -0.15 - timeValue * 0.023 + pointerY * 0.026;
    this.innerVeil.rotation.y = 0.23 - timeValue * 0.038;`,
      'independent membrane drift'
    );

    return source;
  }

  function FormatXRefinedBlob(parts, options) {
    let nextParts = parts;
    let transformed = false;

    try {
      const source = Array.isArray(parts) && parts.length === 1 && typeof parts[0] === 'string'
        ? parts[0]
        : '';
      if (source.includes('class CyberCoreTSL')
        && source.includes('const geometry = new THREE.SphereGeometry(1.56, mobile ? 36 : 56, mobile ? 24 : 40);')) {
        nextParts = [refineOrganism(source)];
        transformed = true;
      }
    } catch (error) {
      console.error('FormatX smooth organism source patch failed:', error);
      throw error;
    }

    const blob = new NativeBlob(nextParts, options);
    if (transformed) window.Blob = NativeBlob;
    return blob;
  }

  FormatXRefinedBlob.prototype = NativeBlob.prototype;
  window.Blob = FormatXRefinedBlob;
})();
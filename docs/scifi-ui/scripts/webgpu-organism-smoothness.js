// Final-source refinement for the FormatX WebGPU organism.
// It runs after the interaction fetch patch and before experience-entry creates
// the executable module Blob, so the live model is refined without a second
// canvas, renderer or animation loop.
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
      `const geometry = new THREE.SphereGeometry(1.56, mobile ? 72 : 144, mobile ? 54 : 108);
    geometry.computeVertexNormals();
    geometry.normalizeNormals();`,
      'high resolution membrane geometry'
    );

    source = replaceRequired(
      source,
      'material.blending = THREE.NormalBlending;',
      `material.blending = THREE.NormalBlending;
    material.alphaToCoverage = true;
    material.premultipliedAlpha = true;`,
      'smooth membrane compositing'
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
      return baseColor.mul(float(0.18).add(flowA.mul(0.08)).add(this.pulse.mul(0.11)))
        .add(color(0xd5ffff).mul(fresnel.mul(float(0.58).add(this.quality.mul(0.12)))))
        .add(color(0x4dfff2).mul(filament.mul(0.32)))
        .add(baseColor.mul(flowB.mul(0.08)));`,
      'flowing membrane light'
    );

    source = replaceRequired(
      source,
      'return float(0.16).add(fresnel.mul(0.42)).add(this.pulse.mul(0.06)).clamp(0.08, 0.68);',
      'return float(0.1).add(fresnel.mul(0.34)).add(this.pulse.mul(0.025)).clamp(0.06, 0.52);',
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

    const outerVeilMaterial = material.clone();
    outerVeilMaterial.opacityNode = material.opacityNode.mul(0.24);
    outerVeilMaterial.colorNode = material.colorNode.mul(0.72).add(color(0xd7ffff).mul(0.045));
    this.outerVeil = new THREE.Mesh(geometry.clone(), outerVeilMaterial);
    this.outerVeil.frustumCulled = false;
    this.outerVeil.scale.set(1.045, 1.02, 1.035);
    this.outerVeil.rotation.set(0.12, -0.2, 0.08);
    this.group.add(this.outerVeil);

    const innerVeilMaterial = material.clone();
    innerVeilMaterial.opacityNode = material.opacityNode.mul(0.34);
    innerVeilMaterial.colorNode = material.colorNode.mul(0.62).add(color(0x2ffff0).mul(0.07));
    this.innerVeil = new THREE.Mesh(geometry.clone(), innerVeilMaterial);
    this.innerVeil.frustumCulled = false;
    this.innerVeil.scale.set(0.91, 0.95, 0.89);
    this.innerVeil.rotation.set(-0.16, 0.24, -0.1);
    this.group.add(this.innerVeil);

    const filamentMaterial = new THREE.MeshBasicNodeMaterial();
    filamentMaterial.transparent = true;
    filamentMaterial.depthWrite = false;
    filamentMaterial.blending = THREE.AdditiveBlending;
    filamentMaterial.colorNode = stateColor(this.scene).mul(float(0.42).add(this.pulse.mul(0.48)));
    filamentMaterial.opacityNode = float(0.08).add(this.pulse.mul(0.07));

    this.filamentA = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.83, 0.012, mobile ? 96 : 180, mobile ? 8 : 12, 2, 3),
      filamentMaterial
    );
    this.filamentA.scale.set(0.9, 1.18, 0.78);
    this.group.add(this.filamentA);

    this.filamentB = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.68, 0.009, mobile ? 84 : 156, mobile ? 7 : 10, 3, 2),
      filamentMaterial.clone()
    );
    this.filamentB.scale.set(0.78, 1.24, 0.92);
    this.filamentB.rotation.set(0.46, -0.28, 0.3);
    this.group.add(this.filamentB);`,
      'layered living membranes and inner filaments'
    );

    source = replaceRequired(
      source,
      'this.energy = new THREE.Mesh(new THREE.SphereGeometry(1.18, mobile ? 26 : 40, mobile ? 18 : 28), energyMaterial);',
      'this.energy = new THREE.Mesh(new THREE.SphereGeometry(1.12, mobile ? 52 : 96, mobile ? 38 : 72), energyMaterial);',
      'smooth inner energy geometry'
    );

    source = replaceRequired(
      source,
      '    this.pointer.value.set(pointerX, pointerY);',
      `    this.pointer.value.set(pointerX, pointerY);
    const layerBreath = 1 + Math.sin(timeValue * 0.78) * 0.006;
    this.outerVeil.scale.set(1.045 * layerBreath, 1.02 / layerBreath, 1.035 * layerBreath);
    this.outerVeil.rotation.y = -0.2 + timeValue * 0.032 + pointerX * 0.035;
    this.outerVeil.rotation.z = 0.08 + Math.sin(timeValue * 0.37) * 0.045;
    this.innerVeil.rotation.x = -0.16 - timeValue * 0.025 + pointerY * 0.03;
    this.innerVeil.rotation.y = 0.24 - timeValue * 0.041;
    this.filamentA.rotation.x = timeValue * 0.052;
    this.filamentA.rotation.y = timeValue * -0.064;
    this.filamentB.rotation.y = 0.3 + timeValue * 0.073;
    this.filamentB.rotation.z = timeValue * -0.046;`,
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
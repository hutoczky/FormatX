// True-depth refinement for the FormatX WebGPU organism.
// The live core remains one WebGPU scene and one animation loop, but now uses
// spatially separated membranes, a depth-writing nucleus and rotating 3D orbits.
(() => {
  'use strict';

  if (window.__FORMATX_ORGANISM_SMOOTHNESS__) return;
  window.__FORMATX_ORGANISM_SMOOTHNESS__ = true;

  const NativeBlob = window.Blob;

  function replaceRequired(source, search, replacement, label) {
    if (!source.includes(search)) {
      throw new Error('FormatX 3D organism marker missing: ' + label);
    }
    return source.replace(search, replacement);
  }

  function refineOrganism(source) {
    source = replaceRequired(
      source,
      'const geometry = new THREE.SphereGeometry(1.56, mobile ? 36 : 56, mobile ? 24 : 40);',
      `const geometry = new THREE.SphereGeometry(1.56, mobile ? 56 : 104, mobile ? 42 : 78);
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
      `const breathing = this.time.mul(0.86).sin().mul(0.016).add(this.pulse.mul(0.026));
      const broadFlow = p.y.mul(2.35).add(p.x.mul(1.2)).sub(this.time.mul(0.24)).sin().mul(0.022);
      const crossFlow = p.z.mul(2.8).sub(p.y.mul(1.25)).add(this.time.mul(0.17)).sin().mul(0.016);
      const crownFlow = p.x.mul(2.05).add(p.z.mul(2.35)).add(this.time.mul(0.2)).cos().mul(0.012);
      const membraneWave = broadFlow.add(crossFlow).add(crownFlow);
      const coreShape = vec3(
        p.x.mul(float(0.94).add(breathing)),
        p.y.mul(float(1.1).add(breathing.mul(0.42))),
        p.z.mul(float(0.98).add(breathing.mul(0.62)))
      ).add(n.mul(membraneWave));`,
      'continuous biomorphic deformation'
    );

    source = replaceRequired(
      source,
      `const pointerWarp = smoothstep(1.82, 0, pointerDistance).mul(0.17);
      transformed.addAssign(n.mul(pointerWarp.mul(this.time.mul(2).add(phase).sin())));
      transformed.addAssign(tangent.mul(this.pointer.x.mul(pointerWarp).mul(0.16)));
      transformed.addAssign(bitangent.mul(this.pointer.y.mul(pointerWarp).mul(0.12)));`,
      `const pointerWarp = smoothstep(1.9, 0, pointerDistance).mul(0.065);
      transformed.addAssign(n.mul(pointerWarp.mul(this.time.mul(1.3).add(phase.mul(0.42)).sin())));
      transformed.addAssign(tangent.mul(this.pointer.x.mul(pointerWarp).mul(0.046)));
      transformed.addAssign(bitangent.mul(this.pointer.y.mul(pointerWarp).mul(0.038)));`,
      'soft pointer membrane response'
    );

    source = replaceRequired(
      source,
      `const scanline = positionWorld.y.mul(42).sub(this.time.mul(3.6)).sin().mul(0.5).add(0.5);
      const circuit = smoothstep(0.76, 1, positionWorld.x.mul(23).add(positionWorld.z.mul(19)).sin().mul(0.5).add(0.5));
      return baseColor.mul(float(0.28).add(circuit.mul(0.22)).add(scanline.mul(0.04)))
        .add(color(0xb8ffff).mul(fresnel.mul(float(0.42).add(this.quality.mul(0.18)))))
        .add(baseColor.mul(this.pulse.mul(float(0.14).add(stateWeight(this.scene, 3).mul(0.18)))));`,
      `const flowA = positionWorld.y.mul(2.8).add(positionWorld.x.mul(1.55)).sub(this.time.mul(0.46)).sin().mul(0.5).add(0.5);
      const flowB = positionWorld.z.mul(3.7).sub(positionWorld.y.mul(1.65)).add(this.time.mul(0.31)).sin().mul(0.5).add(0.5);
      const filament = smoothstep(0.84, 0.985, flowA.mul(0.58).add(flowB.mul(0.42)));
      const depthShade = normalWorld.normalize().z.abs().mul(0.16);
      return baseColor.mul(float(0.12).add(flowA.mul(0.065)).add(depthShade).add(this.pulse.mul(0.085)))
        .add(color(0xd9ffff).mul(fresnel.mul(float(0.48).add(this.quality.mul(0.08)))))
        .add(color(0x45fff1).mul(filament.mul(0.2)))
        .add(baseColor.mul(flowB.mul(0.05)));`,
      'flowing membrane light and depth shading'
    );

    source = replaceRequired(
      source,
      'return float(0.16).add(fresnel.mul(0.42)).add(this.pulse.mul(0.06)).clamp(0.08, 0.68);',
      'return float(0.045).add(fresnel.mul(0.22)).add(this.pulse.mul(0.018)).clamp(0.035, 0.3);',
      'glass membrane opacity'
    );

    source = replaceRequired(
      source,
      `this.shell = new THREE.Mesh(geometry, material);
    this.shell.frustumCulled = false;
    this.group.add(this.shell);`,
      `this.shell = new THREE.Mesh(geometry, material);
    this.shell.frustumCulled = false;
    this.shell.renderOrder = 3;
    this.group.add(this.shell);

    // These are actual spatial shells, not a 2D overlay. Their positions,
    // rotations and scales differ on all three axes.
    this.outerVeil = new THREE.Mesh(geometry.clone(), material);
    this.outerVeil.frustumCulled = false;
    this.outerVeil.position.z = -0.16;
    this.outerVeil.scale.set(1.045, 1.018, 1.075);
    this.outerVeil.rotation.set(0.11, -0.22, 0.075);
    this.outerVeil.renderOrder = 2;
    this.group.add(this.outerVeil);

    this.innerVeil = new THREE.Mesh(geometry.clone(), material);
    this.innerVeil.frustumCulled = false;
    this.innerVeil.position.z = 0.18;
    this.innerVeil.scale.set(0.9, 0.95, 0.84);
    this.innerVeil.rotation.set(-0.16, 0.26, -0.1);
    this.innerVeil.renderOrder = 4;
    this.group.add(this.innerVeil);`,
      'spatially separated living membranes'
    );

    source = replaceRequired(
      source,
      `energyMaterial.opacityNode = float(0.12).add(this.pulse.mul(0.16));
    this.energy = new THREE.Mesh(new THREE.SphereGeometry(1.18, mobile ? 26 : 40, mobile ? 18 : 28), energyMaterial);
    this.group.add(this.energy);`,
      `energyMaterial.opacityNode = float(0.12).add(this.pulse.mul(0.16));
    this.energy = new THREE.Mesh(new THREE.SphereGeometry(1.08, mobile ? 40 : 72, mobile ? 30 : 54), energyMaterial);
    this.energy.renderOrder = 5;
    this.group.add(this.energy);

    const nucleusMaterial = energyMaterial.clone();
    nucleusMaterial.blending = THREE.NormalBlending;
    nucleusMaterial.depthWrite = true;
    nucleusMaterial.depthTest = true;
    nucleusMaterial.side = THREE.FrontSide;
    nucleusMaterial.colorNode = stateColor(this.scene)
      .mul(float(0.22).add(this.pulse.mul(0.28)))
      .add(color(0x061824).mul(0.7));
    nucleusMaterial.opacityNode = float(0.72).add(this.pulse.mul(0.1)).clamp(0.65, 0.9);
    this.nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.64, mobile ? 32 : 56, mobile ? 24 : 42),
      nucleusMaterial
    );
    this.nucleus.scale.set(0.88, 1.14, 0.78);
    this.nucleus.renderOrder = 1;
    this.group.add(this.nucleus);

    // Real 3D orbital geometry gives the eye a clear depth and parallax cue.
    this.orbitA = new THREE.Mesh(
      new THREE.TorusGeometry(1.02, 0.014, mobile ? 8 : 12, mobile ? 72 : 128),
      energyMaterial
    );
    this.orbitA.scale.set(1, 1.22, 0.82);
    this.orbitA.rotation.set(0.48, 0.2, -0.24);
    this.orbitA.renderOrder = 6;
    this.group.add(this.orbitA);

    this.orbitB = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.01, mobile ? 7 : 10, mobile ? 64 : 112),
      energyMaterial
    );
    this.orbitB.scale.set(0.8, 1.32, 1.08);
    this.orbitB.rotation.set(-0.28, 0.72, 0.34);
    this.orbitB.renderOrder = 6;
    this.group.add(this.orbitB);`,
      'depth-writing nucleus and real 3D energy orbits'
    );

    source = replaceRequired(
      source,
      '    this.pointer.value.set(pointerX, pointerY);',
      `    this.pointer.value.set(pointerX, pointerY);
    const layerBreath = 1 + Math.sin(timeValue * 0.74) * 0.006;
    this.shell.rotation.y = timeValue * 0.018 + pointerX * 0.035;
    this.shell.rotation.x = pointerY * 0.025;
    this.outerVeil.scale.set(1.045 * layerBreath, 1.018 / layerBreath, 1.075 * layerBreath);
    this.outerVeil.position.z = -0.16 + Math.sin(timeValue * 0.43) * 0.035;
    this.outerVeil.rotation.y = -0.22 + timeValue * 0.034 + pointerX * 0.055;
    this.outerVeil.rotation.z = 0.075 + Math.sin(timeValue * 0.31) * 0.045;
    this.innerVeil.position.z = 0.18 + Math.cos(timeValue * 0.39) * 0.03;
    this.innerVeil.rotation.x = -0.16 - timeValue * 0.026 + pointerY * 0.045;
    this.innerVeil.rotation.y = 0.26 - timeValue * 0.044;
    this.nucleus.rotation.y = timeValue * -0.11;
    this.nucleus.rotation.x = Math.sin(timeValue * 0.37) * 0.12;
    this.orbitA.rotation.y = 0.2 + timeValue * 0.12;
    this.orbitA.rotation.z = -0.24 + timeValue * -0.075;
    this.orbitB.rotation.x = -0.28 + timeValue * -0.09;
    this.orbitB.rotation.y = 0.72 + timeValue * 0.14;`,
      'independent true-depth layer animation'
    );

    source = replaceRequired(
      source,
      'this.core.group.scale.setScalar(this.scale);',
      'this.core.group.scale.setScalar(this.scale * (this.mobile ? 0.72 : 0.9));',
      'mobile depth-preserving core scale'
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
      console.error('FormatX true-depth organism source patch failed:', error);
      throw error;
    }

    const blob = new NativeBlob(nextParts, options);
    if (transformed) window.Blob = NativeBlob;
    return blob;
  }

  FormatXRefinedBlob.prototype = NativeBlob.prototype;
  window.Blob = FormatXRefinedBlob;
})();
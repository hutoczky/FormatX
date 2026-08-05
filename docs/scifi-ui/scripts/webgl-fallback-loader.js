const WEBGL_SOURCE_URL = new URL('./Experience.js?v=20260729-true-depth-fallback-1', import.meta.url).href;
const PRIMARY_THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';
const FALLBACK_THREE_URL = 'https://unpkg.com/three@0.185.1/build/three.module.js?module';

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error('FormatX WebGL true-depth marker missing: ' + label);
  }
  return source.replace(search, replacement);
}

export async function startWebGLExperience() {
  const response = await fetch(WEBGL_SOURCE_URL, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error('FormatX WebGL2 Experience source could not be loaded: ' + response.status + ' ' + WEBGL_SOURCE_URL);
  }

  let source = await response.text();
  const importLine = "import * as THREE from '" + PRIMARY_THREE_URL + "';";
  const resilientImport = [
    'let THREE;',
    'try {',
    "  THREE = await import('" + PRIMARY_THREE_URL + "');",
    '} catch (primaryError) {',
    "  console.warn('Primary Three.js source failed; using fallback.', primaryError);",
    "  THREE = await import('" + FALLBACK_THREE_URL + "');",
    '}',
  ].join('\n');

  source = replaceRequired(source, importLine, resilientImport, 'Three.js import');
  source = replaceRequired(
    source,
    'if (shared instanceof Float32Array && shared.length >= 16) return shared;',
    'if (shared && ArrayBuffer.isView(shared) && shared.BYTES_PER_ELEMENT === 4 && shared.length >= 16) return shared;',
    'shared runtime state'
  );

  source = replaceRequired(
    source,
    `    const detail = mobile ? 4 : 5;
    this.geometry = new THREE.IcosahedronGeometry(1.28, detail);`,
    `    this.geometry = new THREE.SphereGeometry(1.28, mobile ? 56 : 96, mobile ? 42 : 72);
    this.geometry.computeVertexNormals();
    this.geometry.normalizeNormals();`,
    'smooth fallback shell geometry'
  );

  source = replaceRequired(
    source,
    '    vec3 coreShape = position + n * (wave * 0.075 + uPulse * 0.045);',
    `    float breathing = sin(uTime * 0.86) * 0.016 + uPulse * 0.026;
    float broadFlow = sin(position.y * 2.35 + position.x * 1.2 - uTime * 0.24) * 0.022;
    float crossFlow = sin(position.z * 2.8 - position.y * 1.25 + uTime * 0.17) * 0.016;
    vec3 coreShape = vec3(
      position.x * (0.94 + breathing),
      position.y * (1.1 + breathing * 0.42),
      position.z * (0.98 + breathing * 0.62)
    ) + n * (broadFlow + crossFlow);`,
    'smooth fallback living deformation'
  );

  source = replaceRequired(
    source,
    `    float facets = floor((wave * 0.5 + 0.5) * mix(3.0, 7.0, uQuality)) / mix(3.0, 7.0, uQuality);
    vec3 aiShape = position + n * (facets * 0.24 - 0.08);
    aiShape += tangent * sin(aSeed * 31.0 + uTime) * 0.075;
    aiShape.xz *= 1.08;`,
    `    float skeletonFlow = sin(phase * 0.72 + uTime * 0.34);
    vec3 aiShape = position + n * skeletonFlow * 0.055;
    aiShape += tangent * sin(aSeed * 17.0 + uTime * 0.42) * 0.028;
    aiShape *= vec3(1.035, 1.07, 1.035);`,
    'remove fallback faceting'
  );

  source = replaceRequired(
    source,
    `    float fragmentDirection = hash11(aSeed * 91.0) * 2.0 - 1.0;
    float breakup = transitionArc * (0.18 + uQuality * 0.34);
    transformed += n * fragmentDirection * breakup * (0.32 + aSeed * 0.46);
    transformed += tangent * transitionArc * fragmentDirection * 0.12;
    transformed += bitangent * transitionArc * sin(aSeed * 19.0) * 0.07;`,
    `    float transitionWave = sin(phase * 0.54 + uTime * 0.38);
    float transitionFlow = transitionArc * (0.024 + uQuality * 0.018);
    transformed += n * transitionWave * transitionFlow;
    transformed += tangent * uPointer.x * transitionFlow * 0.08;
    transformed += bitangent * uPointer.y * transitionFlow * 0.07;`,
    'fluid fallback state transition'
  );

  source = replaceRequired(
    source,
    `    float pointerWarp = smoothstep(1.55, 0.0, pointerDistance) * 0.09;
    transformed += n * pointerWarp * sin(uTime * 2.0 + phase);`,
    `    float pointerWarp = smoothstep(1.9, 0.0, pointerDistance) * 0.06;
    transformed += n * pointerWarp * sin(uTime * 1.3 + phase * 0.42);`,
    'soft fallback pointer response'
  );

  source = replaceRequired(
    source,
    `    float scanline = 0.5 + 0.5 * sin(vWorldPosition.y * 42.0 - uTime * 3.6);
    float circuit = smoothstep(0.76, 1.0, sin(vWorldPosition.x * 23.0 + vWorldPosition.z * 19.0 + vSeed * 17.0) * 0.5 + 0.5);
    float micro = smoothstep(0.86, 1.0, sin((vWorldPosition.x - vWorldPosition.y + vWorldPosition.z) * 51.0 + uTime) * 0.5 + 0.5);`,
    `    float flowA = 0.5 + 0.5 * sin(vWorldPosition.y * 2.8 + vWorldPosition.x * 1.55 - uTime * 0.46);
    float flowB = 0.5 + 0.5 * sin(vWorldPosition.z * 3.7 - vWorldPosition.y * 1.65 + uTime * 0.31);
    float circuit = smoothstep(0.84, 0.985, flowA * 0.58 + flowB * 0.42);
    float micro = smoothstep(0.9, 1.0, sin((vWorldPosition.x + vWorldPosition.z) * 6.0 + uTime * 0.55) * 0.5 + 0.5);`,
    'fallback flowing membrane light'
  );

  source = replaceRequired(
    source,
    `    vec3 emission = color * (0.17 + vEnergy * 0.4);
    emission += uAccentColor * fresnel * (1.2 + uQuality * 0.65);
    emission += color * circuit * 0.58;
    emission += color * scanline * 0.085;
    emission += mix(vec3(0.0), color, micro * uQuality) * 0.18;
    emission += color * uPulse * (0.08 + commerce * 0.2);

    float alpha = clamp(0.48 + fresnel * 0.48 + circuit * 0.12, 0.0, 0.96);`,
    `    float depthShade = abs(normalDirection.z) * 0.16;
    vec3 emission = color * (0.11 + flowA * 0.07 + depthShade);
    emission += uAccentColor * fresnel * (0.46 + uQuality * 0.1);
    emission += color * circuit * 0.2;
    emission += mix(vec3(0.0), color, micro * uQuality) * 0.06;
    emission += color * uPulse * (0.07 + commerce * 0.12);

    float alpha = clamp(0.045 + fresnel * 0.22 + circuit * 0.035, 0.035, 0.3);`,
    'fallback glass material'
  );

  source = replaceRequired(
    source,
    `      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending`,
    `      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending`,
    'fallback membrane render state'
  );

  source = replaceRequired(
    source,
    `    this.shell = new THREE.Mesh(this.geometry, this.material);
    this.shell.frustumCulled = false;
    this.group.add(this.shell);`,
    `    this.shell = new THREE.Mesh(this.geometry, this.material);
    this.shell.frustumCulled = false;
    this.shell.renderOrder = 3;
    this.group.add(this.shell);

    this.outerVeil = new THREE.Mesh(this.geometry.clone(), this.material);
    this.outerVeil.frustumCulled = false;
    this.outerVeil.position.z = -0.16;
    this.outerVeil.scale.set(1.045, 1.018, 1.075);
    this.outerVeil.rotation.set(0.11, -0.22, 0.075);
    this.outerVeil.renderOrder = 2;
    this.group.add(this.outerVeil);

    this.innerVeil = new THREE.Mesh(this.geometry.clone(), this.material);
    this.innerVeil.frustumCulled = false;
    this.innerVeil.position.z = 0.18;
    this.innerVeil.scale.set(0.9, 0.95, 0.84);
    this.innerVeil.rotation.set(-0.16, 0.26, -0.1);
    this.innerVeil.renderOrder = 4;
    this.group.add(this.innerVeil);

    this.nucleusMaterial = new THREE.MeshBasicMaterial({
      color: '#063f49',
      transparent: true,
      opacity: 0.82,
      depthWrite: true,
      depthTest: true,
      blending: THREE.NormalBlending
    });
    this.nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, mobile ? 32 : 56, mobile ? 24 : 42),
      this.nucleusMaterial
    );
    this.nucleus.scale.set(0.88, 1.14, 0.78);
    this.nucleus.renderOrder = 1;
    this.group.add(this.nucleus);`,
    'fallback true-depth shell layers and nucleus'
  );

  source = replaceRequired(
    source,
    'this.energyGeometry = new THREE.IcosahedronGeometry(0.64, mobile ? 3 : 4);',
    'this.energyGeometry = new THREE.SphereGeometry(0.64, mobile ? 36 : 64, mobile ? 28 : 48);',
    'smooth fallback energy geometry'
  );

  source = replaceRequired(
    source,
    `    this.wire = new THREE.LineSegments(this.wireGeometry, this.wireMaterial);
    this.wire.scale.setScalar(1.006);
    this.group.add(this.wire);`,
    `    this.wire = new THREE.LineSegments(this.wireGeometry, this.wireMaterial);
    this.wire.scale.setScalar(1.006);
    this.wire.visible = false;`,
    'remove triangular fallback wireframe'
  );

  source = replaceRequired(
    source,
    '    this.maxFragments = mobile ? 48 : 96;',
    '    this.maxFragments = 1;',
    'disable fallback shard field capacity'
  );
  source = replaceRequired(
    source,
    `    this.fragmentCount = mobile ? 36 : 72;
    this.fragments.count = this.fragmentCount;`,
    `    this.fragmentCount = 0;
    this.fragments.count = 0;
    this.fragments.visible = false;`,
    'disable fallback shard field'
  );
  source = replaceRequired(
    source,
    `    this.fragmentCount = Math.min(this.maxFragments, fragmentCount);
    this.fragments.count = this.fragmentCount;
    this.wireMaterial.opacity = 0.045 + value * 0.07;`,
    `    this.fragmentCount = 0;
    this.fragments.count = 0;
    this.fragments.visible = false;
    this.wireMaterial.opacity = 0;`,
    'lock fallback shards and wireframe off'
  );

  source = replaceRequired(
    source,
    `    this.group.rotation.y = time * 0.085 + orbitX;
    this.group.rotation.x = Math.sin(time * 0.19) * 0.055 + orbitY;
    this.group.scale.setScalar(scale);
    this.energy.scale.setScalar(0.96 + pulse * 0.075);
    this.wire.rotation.y = -time * 0.035;`,
    `    this.group.rotation.y = time * 0.085 + orbitX;
    this.group.rotation.x = Math.sin(time * 0.19) * 0.055 + orbitY;
    this.group.scale.setScalar(scale * (this.mobile ? 0.72 : 0.9));
    this.shell.rotation.y = time * 0.018 + pointerX * 0.035;
    this.shell.rotation.x = pointerY * 0.025;
    this.outerVeil.position.z = -0.16 + Math.sin(time * 0.43) * 0.035;
    this.outerVeil.rotation.y = -0.22 + time * 0.034 + pointerX * 0.055;
    this.outerVeil.rotation.z = 0.075 + Math.sin(time * 0.31) * 0.045;
    this.innerVeil.position.z = 0.18 + Math.cos(time * 0.39) * 0.03;
    this.innerVeil.rotation.x = -0.16 - time * 0.026 + pointerY * 0.045;
    this.innerVeil.rotation.y = 0.26 - time * 0.044;
    this.nucleus.rotation.y = time * -0.11;
    this.nucleus.rotation.x = Math.sin(time * 0.37) * 0.12;
    this.nucleus.scale.set(0.88 + pulse * 0.025, 1.14 + pulse * 0.035, 0.78 + pulse * 0.018);
    this.nucleusMaterial.color.setRGB(0.02 + pulse * 0.03, 0.23 + pulse * 0.16, 0.27 + pulse * 0.17);
    this.energy.scale.setScalar(0.96 + pulse * 0.075);
    this.wire.rotation.y = -time * 0.035;`,
    'fallback spatial animation and mobile framing'
  );

  source = replaceRequired(
    source,
    `    this.geometry.dispose();
    this.material.dispose();`,
    `    this.outerVeil.geometry.dispose();
    this.innerVeil.geometry.dispose();
    this.nucleus.geometry.dispose();
    this.nucleusMaterial.dispose();
    this.geometry.dispose();
    this.material.dispose();`,
    'fallback true-depth resource cleanup'
  );

  source = replaceRequired(
    source,
    'p.z = mod(p.z + uScroll * 34.0 + uTime * (0.06 + aSeed.x * 0.16) + 12.0, 24.0) - 12.0;',
    'float streamSpeed = 0.06 + aSeed.x * 0.16 + nervous * (0.5 + aSeed.y * 1.4);\n    p.z = mod(p.z + uScroll * 34.0 + uTime * streamSpeed + 12.0, 24.0) - 12.0;',
    'particle stream speed'
  );
  source = replaceRequired(
    source,
    '    p.z -= nervous * uTime * (0.5 + aSeed.y * 1.4);\n',
    '',
    'duplicate nervous movement'
  );
  source = replaceRequired(
    source,
    'float pointerForce = smoothstep(2.7, 0.0, distanceToPointer) * (0.12 + length(uPointerVelocity) * 0.035);',
    'float pointerForce = smoothstep(2.2, 0.0, distanceToPointer) * (0.07 + length(uPointerVelocity) * 0.018);',
    'pointer movement strength'
  );
  source = replaceRequired(
    source,
    'gl_PointSize = (0.8 + aSeed.w * 2.1) * uPixelRatio * clamp(perspective, 0.45, 4.5) * mix(0.82, 1.12, uQuality);',
    'gl_PointSize = (0.42 + aSeed.w * 0.92) * uPixelRatio * clamp(perspective, 0.45, 3.8) * mix(0.7, 0.92, uQuality);',
    'particle point size'
  );
  source = replaceRequired(
    source,
    'gl_FragColor = vec4(color * (0.62 + glow * 1.5), glow * vAlpha * (0.12 + vEnergy * 0.48));',
    'gl_FragColor = vec4(color * (0.5 + glow * 1.08), glow * vAlpha * (0.055 + vEnergy * 0.22));',
    'particle opacity'
  );
  source = replaceRequired(
    source,
    'this.maxCount = mobile ? 7000 : 14000;',
    'this.maxCount = mobile ? 1200 : 2400;',
    'maximum particle count'
  );
  source = replaceRequired(
    source,
    'this.setCount(mobile ? 3200 : 8500);',
    'this.setCount(mobile ? 520 : 1250);',
    'initial particle count'
  );
  source = replaceRequired(
    source,
    'const particles = this.mobile ? [1300, 2400, 4000, 6200] : [2200, 4800, 8500, 12500];',
    'const particles = this.mobile ? [260, 450, 760, 1150] : [420, 760, 1300, 2200];',
    'particle quality tiers'
  );
  source = replaceRequired(
    source,
    '} else if (fps > 58 && this.tier < 3) {',
    '} else if (false && fps > 58 && this.tier < 3) {',
    'upward quality scaling lock'
  );

  const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    await import(moduleUrl);
    try {
      const root = parent.document.documentElement;
      root.dataset.fxParticleProfile = 'focus-half-stable';
      root.dataset.fxParticleTierLock = 'upward-disabled';
      root.dataset.fxCoreForm = 'true-depth-webgl-organism';
    } catch (_) {}
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

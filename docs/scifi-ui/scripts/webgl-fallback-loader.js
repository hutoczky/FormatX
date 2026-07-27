const WEBGL_SOURCE_URL = new URL('./Experience.js?v=20260727-particles-focus-2', import.meta.url).href;
const PRIMARY_THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';
const FALLBACK_THREE_URL = 'https://unpkg.com/three@0.185.1/build/three.module.js?module';

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error('FormatX WebGL particle marker missing: ' + label);
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
    'gl_PointSize = (0.58 + aSeed.w * 1.38) * uPixelRatio * clamp(perspective, 0.45, 4.2) * mix(0.74, 1.0, uQuality);',
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
    'this.maxCount = mobile ? 1800 : 3500;',
    'maximum particle count'
  );
  source = replaceRequired(
    source,
    'this.setCount(mobile ? 3200 : 8500);',
    'this.setCount(mobile ? 800 : 1900);',
    'initial particle count'
  );
  source = replaceRequired(
    source,
    'const particles = this.mobile ? [1300, 2400, 4000, 6200] : [2200, 4800, 8500, 12500];',
    'const particles = this.mobile ? [400, 650, 1100, 1700] : [600, 1200, 1900, 3100];',
    'particle quality tiers'
  );

  const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    await import(moduleUrl);
    try {
      parent.document.documentElement.dataset.fxParticleProfile = 'focus-half';
    } catch (_) {}
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

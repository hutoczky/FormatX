const WEBGL_SOURCE_URL = new URL('./Experience.js?v=20260727-three-4', import.meta.url).href;
const PRIMARY_THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';
const FALLBACK_THREE_URL = 'https://unpkg.com/three@0.185.1/build/three.module.js?module';

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

  if (!source.includes(importLine)) {
    throw new Error('FormatX Experience Three.js import marker is missing');
  }

  source = source.replace(importLine, resilientImport);
  source = source.replace(
    'if (shared instanceof Float32Array && shared.length >= 16) return shared;',
    'if (shared && ArrayBuffer.isView(shared) && shared.BYTES_PER_ELEMENT === 4 && shared.length >= 16) return shared;'
  );
  source = source.replace(
    'p.z = mod(p.z + uScroll * 34.0 + uTime * (0.06 + aSeed.x * 0.16) + 12.0, 24.0) - 12.0;',
    'float streamSpeed = 0.06 + aSeed.x * 0.16 + nervous * (0.5 + aSeed.y * 1.4);\n    p.z = mod(p.z + uScroll * 34.0 + uTime * streamSpeed + 12.0, 24.0) - 12.0;'
  );
  source = source.replace('    p.z -= nervous * uTime * (0.5 + aSeed.y * 1.4);\n', '');

  const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    await import(moduleUrl);
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

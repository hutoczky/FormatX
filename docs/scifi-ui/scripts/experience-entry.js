const SOURCE_URL = new URL('./Experience.js?v=20260727-three-3', import.meta.url).href;

async function startExperience() {
  const response = await fetch(SOURCE_URL, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error('FormatX Experience source could not be loaded: ' + response.status + ' ' + SOURCE_URL);
  }

  let source = await response.text();

  source = source.replace(
    "if (shared instanceof Float32Array && shared.length >= 16) return shared;",
    "if (shared && ArrayBuffer.isView(shared) && shared.BYTES_PER_ELEMENT === 4 && shared.length >= 16) return shared;"
  );

  source = source.replace(
    "p.z = mod(p.z + uScroll * 34.0 + uTime * (0.06 + aSeed.x * 0.16) + 12.0, 24.0) - 12.0;",
    "float streamSpeed = 0.06 + aSeed.x * 0.16 + nervous * (0.5 + aSeed.y * 1.4);\n    p.z = mod(p.z + uScroll * 34.0 + uTime * streamSpeed + 12.0, 24.0) - 12.0;"
  );

  source = source.replace(
    "    p.z -= nervous * uTime * (0.5 + aSeed.y * 1.4);\n",
    ""
  );

  const moduleUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    await import(moduleUrl);
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

startExperience().catch(error => {
  console.error('FormatX Three engine bootstrap failed:', error);
  try {
    window.parent.document.documentElement.dataset.fxThree = 'error';
  } catch (_) {}
});

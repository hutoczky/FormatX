const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));

const wrapperPath = 'docs/scifi-ui/scripts/formatx-live-os.js';
const runtimePath = 'docs/scifi-ui/scripts/formatx-live-os-core.js';
const fallbackPath = 'docs/scifi-ui/scripts/formatx-live-os-fallback.js';
const stylePath = 'docs/scifi-ui/styles/formatx-live-os.css';
const loaderPath = 'docs/scifi-ui/scripts/formatx-origin-proof.js';

for (const file of [wrapperPath, runtimePath, fallbackPath, stylePath]) {
  assert.ok(exists(file), `Live OS file missing: ${file}`);
}

const wrapper = read(wrapperPath);
const runtime = read(runtimePath);
const fallback = read(fallbackPath);
const styles = read(stylePath);
const loader = read(loaderPath);

assert.match(wrapper, /formatx-live-os-core\.js/, 'Live OS core bundle loader missing');
assert.match(wrapper, /formatx-live-os-fallback\.js/, 'Live OS fallback bundle loader missing');

assert.match(runtime, /const COMMANDS = \[/, 'natural-language command registry missing');
assert.match(runtime, /runDiagnostics/, 'live diagnostics missing');
assert.match(runtime, /navigator\.hardwareConcurrency/, 'real browser hardware capability reading missing');
assert.match(runtime, /measureFrames/, 'display cadence measurement missing');
assert.match(runtime, /requestAnimationFrame/, 'refresh-rate animation loop missing');
assert.match(runtime, /await import\(THREE_URL\)/, 'on-demand Three.js functional 3D missing');
assert.match(runtime, /Raycaster/, 'interactive 3D selection missing');
assert.match(runtime, /SMART/, 'SMART state representation missing');
assert.match(runtime, /startDemo/, 'interactive guided product demo missing');
assert.match(runtime, /Independent review: not published yet|Független értékelés: még nincs publikálva/, 'honest external-review state missing');
assert.match(runtime, /no command upload|nincs parancsfeltöltés/, 'local privacy statement missing');

assert.match(fallback, /getContext\('2d'/, 'Canvas fallback context missing');
assert.match(fallback, /data-state.*fallback|dataset\.state = 'fallback'/, 'Canvas fallback state missing');
assert.match(fallback, /SMART/, 'fallback SMART representation missing');
assert.match(fallback, /drawFlows/, 'fallback verification flow missing');
assert.match(fallback, /pointerdown/, 'fallback interaction missing');

assert.match(styles, /content-visibility:\s*auto/, 'offscreen rendering optimisation missing');
assert.match(styles, /prefers-reduced-motion:\s*reduce/, 'reduced-motion mode missing');
assert.match(styles, /\[data-fx-live-os-launcher\]/, 'command launcher styling missing');

assert.match(loader, /formatx-live-os\.css\?v=20260806-live-os-1/, 'versioned Live OS stylesheet loader missing');
assert.match(loader, /formatx-live-os\.js\?v=20260806-live-os-1/, 'versioned Live OS runtime loader missing');
assert.match(loader, /ctrlKey \|\| event\.metaKey/, 'keyboard command launcher missing');
assert.match(loader, /IntersectionObserver/, 'near-viewport lazy loading missing');

console.log('FormatX Live OS validation passed.');

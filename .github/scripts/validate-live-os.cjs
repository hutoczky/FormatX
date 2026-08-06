const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));

const runtimePath = 'docs/scifi-ui/scripts/formatx-live-os.js';
const stylePath = 'docs/scifi-ui/styles/formatx-live-os.css';
const loaderPath = 'docs/scifi-ui/scripts/formatx-origin-proof.js';

assert.ok(exists(runtimePath), 'live operating system runtime missing');
assert.ok(exists(stylePath), 'live operating system stylesheet missing');

const runtime = read(runtimePath);
const styles = read(stylePath);
const loader = read(loaderPath);

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

assert.match(styles, /content-visibility:\s*auto/, 'offscreen rendering optimisation missing');
assert.match(styles, /prefers-reduced-motion:\s*reduce/, 'reduced-motion mode missing');
assert.match(styles, /\[data-fx-live-os-launcher\]/, 'command launcher styling missing');

assert.match(loader, /formatx-live-os\.css\?v=20260806-live-os-1/, 'versioned Live OS stylesheet loader missing');
assert.match(loader, /formatx-live-os\.js\?v=20260806-live-os-1/, 'versioned Live OS runtime loader missing');
assert.match(loader, /ctrlKey \|\| event\.metaKey/, 'keyboard command launcher missing');
assert.match(loader, /IntersectionObserver/, 'near-viewport lazy loading missing');

console.log('FormatX Live OS validation passed.');

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const bootstrap = read('docs/scifi-ui/scripts/formatx-core-real3d-v20.js');
const runtime = read('docs/scifi-ui/scripts/formatx-reference-lock-v30.js');
const style = read('docs/scifi-ui/styles/formatx-reference-lock-v30.css');
const homepage = read('docs/scifi-ui/index.html');
const loader = read('docs/scifi-ui/scripts/igloo-parity.js');
const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const premium = read('docs/scifi-ui/scripts/formatx-premium-finish.js');
const referenceBootstrap = read('docs/scifi-ui/scripts/formatx-reference-core-v26.js');
const contract = JSON.parse(read('docs/scifi-ui/data/public-platform-contract.json'));

assert.match(bootstrap, /reference-lock-v30/, 'production bootstrap must select reference-lock v30');
assert.match(bootstrap, /formatx-reference-lock-v30\.js\?v=20260810-uploaded-reference-lock-3/, 'reference-lock runtime cache revision 3 missing');
assert.match(bootstrap, /formatx-reference-lock-v30\.css\?v=20260810-uploaded-reference-lock-3/, 'reference-lock style cache revision 3 missing');
assert.equal((bootstrap.match(/getContext\('webgl2'/g) || []).length, 0, 'compatibility bootstrap must not create a second WebGL2 context');
assert.equal((runtime.match(/getContext\('webgl2'/g) || []).length, 1, 'the production MAG renderer must own exactly one WebGL2 context');

for (const token of [
  'gl.enable(gl.DEPTH_TEST)',
  'gl.drawElements(gl.TRIANGLES',
  'gl.drawElements(gl.LINES',
  'function persp(',
  'function crystal(',
  'function sphere(',
  'function torus(',
  "fxCoreVisualRevision='v30-reference-lock'",
  "fxCorePerformance='adaptive-60-plus-fps'",
  "fxCoreImageBacked='false'",
  'uploaded-reference-20260810',
  'dense-luminous-glass-filaments-v30',
  'translucent-volume-pass-r3',
  'IntersectionObserver',
  'webglcontextlost'
]) assert.ok(runtime.includes(token), `reference-lock real 3D contract missing: ${token}`);
assert.ok(runtime.includes('ready-v30'), 'reference-lock runtime ready marker missing');

assert.match(runtime, /p=\.68/, 'reference concave four-tip p-norm geometry missing');
assert.match(runtime, /mobile\?1\.50:1/, 'reference mobile vertical shell calibration missing');
assert.match(runtime, /t=\.018/, 'thin reference reactor/orbit torus calibration missing');
assert.match(runtime, /for\(let k=1;k<=R;k\+\+\)/, 'dense shell contour calibration missing');
assert.match(runtime, /mesh\(shell,mul\(B,sc\(\.990,\.990,\.990\)\),1,\.16/, 'cyan translucent glass volume pass missing');
assert.match(runtime, /mesh\(shell,mul\(B,sc\(\.982,\.982,\.982\)\),1,\.075/, 'violet translucent glass volume pass missing');
assert.match(runtime, /const rs=\[\.20,\.29,\.39,\.51\]/, 'four real 3D inner reactor rings missing');
assert.match(runtime, /const drift=/, 'moving central energy core missing');
assert.match(runtime, /for\(const o of\[\[\.70/, 'outer cyan/violet 3D spectral rings missing');
assert.doesNotMatch(runtime, /drawImage\s*\(|new\s+Image\s*\(|createImageBitmap\s*\(|backgroundImage/i, 'the production MAG must not be image-backed');
assert.doesNotMatch(runtime, /https?:\/\//, 'the production MAG runtime must remain first-party and self-contained');
assert.doesNotMatch(runtime, /THREE\b|three\.js|babylon|playcanvas|model-viewer/i, 'third-party 3D engine is forbidden');
assert.doesNotMatch(runtime, /addEventListener\(['"](?:wheel|touchmove)['"][\s\S]{0,300}preventDefault/, 'renderer must not capture scrolling');

assert.ok(homepage.includes('formatx-core-real3d-v20.css') && homepage.includes('formatx-core-real3d-v20.js'), 'stable compatibility assets are not bootstrapped');
assert.ok(homepage.includes('v=20260809-real3d-v24-volumetric-crystal-r3-moving-core-r11'), 'stable cache-compatible bootstrap revision is missing');
assert.match(style, /pointer-events:none/, 'reference stage must not capture input');
assert.match(style, /100dvh/, 'dynamic viewport sizing missing');
assert.match(style, /--fx-core-x:50%/, 'mobile/portrait reference centering missing');
assert.match(style, /perspective\(560px\) rotateX\(63deg\)/, 'reference energy-floor perspective missing');
assert.match(style, /saturate\(1\.42\) contrast\(1\.06\) brightness\(1\.24\)/, 'stable luminous reference grade missing');
assert.ok(loader.includes("root.dataset.fxCoreReal3d === 'ready-v20'"), 'legacy multi-context loader retirement is missing');
assert.ok(mapper.includes("root.dataset.fxCoreReal3d==='ready-v20'"), 'legacy mesh mapper guard is missing');
assert.ok(premium.includes("addEventListener('formatx:coremesh3dready', syncRendererState)"), 'Canvas2D fallback retirement hook is missing');

assert.match(referenceBootstrap, /const WEBGPU_PREVIEW = params\.get\('webgpu'\) === '1'/, 'WebGPU v29 must require explicit ?webgpu=1 preview opt-in');
assert.match(referenceBootstrap, /production-v30-reference-lock-authority/, 'v30 reference-lock must be declared production authority');
assert.doesNotMatch(referenceBootstrap, /if \(navigator\.gpu\)[\s\S]{0,500}webgpu-primary/, 'WebGPU must not automatically replace production v30 MAG');

const quality = contract.quality_contract;
assert.equal(quality.mag_image_backed, false);
assert.equal(quality.mag_webgl_context_count, 1);
assert.equal(quality.mag_frame_rate_target, '60-plus-display-refresh-uncapped');
assert.equal(quality.mag_paused_outside_hero, true);
assert.equal(quality.mag_reference_target, 'four-tip-luminous-crystal-sci-fi-film-core');

console.log('PASS: FormatX production uses one indexed WebGL2 context in translucent-volume uploaded-reference lock v30 cache revision 3, with real glass surface passes, a moving inner reactor, thin 3D rings and no image-backed core.');

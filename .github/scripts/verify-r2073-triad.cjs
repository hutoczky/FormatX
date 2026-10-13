'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const project = path.resolve(__dirname, '../..');
const script = fs.readFileSync(path.join(project, 'docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js'), 'utf8');
const html = fs.readFileSync(path.join(project, 'docs/scifi-ui/index.html'), 'utf8');

new vm.Script(script, {filename: 'formatx-cinematic-archive-r1987.js'});
assert.match(script, /cinematic-archive-r2073-single-world-director-optics/);
assert.match(script, /registerScenePass\(drawPass\)/);
assert.match(script, /gl\.getUniformLocation/);
assert.match(script, /const reduced=matchMedia/);
assert.match(script, /if\(reduced\.matches\|\|requestedHtmlFallback\)/);
assert.match(script, /restoreExistingFinalCta\(\)/);
assert.match(script, /cameraTrack:'single-reversible-scroll-rail-r2073'/);
assert.match(script, /pointerTargetX=clamp/);
assert.match(script, /removeEventListener\('pointermove',trackDirectorPointer\)/);
assert.match(script, /float filmPhase=16\.0\*facing/);
assert.match(script, /float clearCoat=pow/);
assert.match(script, /float edgeWidth=max\(fwidth/);
assert.match(script, /uShadow/);
assert.match(html, /formatx-cinematic-archive-r1987\.js\?v=20261014-r2073-triad-cinema/);
assert.match(html, /formatx-ai-core-ident-r1951\.js/);

const blueprint = script.match(/const blueprint=\[([\s\S]*?)\n  \];/);
assert.ok(blueprint, 'Eight native archival definitions must exist');
const keys = [...blueprint[1].matchAll(/key:'([^']+)'/g)].map(match => match[1]);
assert.equal(keys.length, 8, 'All eight original archive sources must stay present');
assert.equal(new Set(keys).size, 8, 'Every source retains unique identity');

const from = script.indexOf('  class CameraDirector {');
const until = script.indexOf('\n  function cubeGeometry()', from);
assert.ok(from >= 0 && until > from, 'The one-world director must exist');
const director = script.slice(from, until);
const evaluate = new vm.Script(director + '\nCameraDirector.forScene(null, phase);', {
  filename: 'r2073-camera-director'
});

function frame(distance, px = 0, py = 0, phase = 0) {
  const context = {
    Math,
    scrollY: distance * 900,
    innerHeight: 900,
    pointerX: px,
    pointerY: py,
    phase,
    clamp: (v, a, b) => Math.max(a, Math.min(b, v))
  };
  return evaluate.runInNewContext(context);
}
for (let i = 0; i <= 320; i++) {
  const d = i / 10;
  const before = frame(d);
  const after = frame(d + 1 / 900);
  assert.equal(before.length, 3);
  assert.ok(before.every(Number.isFinite), 'Camera coordinates must remain finite');
  assert.ok(before.every((value, axis) => Math.abs(value - after[axis]) < 0.001),
    'Native scrolling must not cut the physical camera path');
  const otherChapter = frame(d, 0, 0, 1);
  assert.deepEqual([...before], [...otherChapter], 'Chapter handoff must not teleport the camera');
  assert.deepEqual([...before], [...frame(d)], 'Reverse scroll must return to exactly the same camera');
}
const left = frame(12, -1, -1);
const right = frame(12, 1, 1);
assert.ok(right[0] > left[0] && right[1] > left[1],
  'Real 3D perspective must respond to fine-pointer movement');
assert.ok(right.every((value, axis) => Math.abs(value) <= [0.20, 0.12, 0.19][axis]),
  'Pointer and scroll motion must remain within readability-safe limits');

console.log('R2073 PASS: one WebGL world, eight native sections, no camera cuts, angle-dependent glass, CSS AA, in-film identity, reduced-motion and lifecycle contracts.');

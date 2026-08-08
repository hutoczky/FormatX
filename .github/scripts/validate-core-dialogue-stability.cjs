'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const mesh = read('docs/scifi-ui/scripts/formatx-core-mesh3d.js');
const meshCss = read('docs/scifi-ui/styles/formatx-core-mesh3d.css');
const apex = read('docs/scifi-ui/scripts/formatx-apex-native.js');
const mobile = read('docs/scifi-ui/styles/formatx-mobile-apex-composition.css');
const voice = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');

// The old raymarched core must be suppressed while the true mesh owns MAG.
assert.match(mapper, /fxApexSceneStability === 'ready-v9'/, 'true mesh background revision missing');
assert.match(mapper, /if\(uScene<\.92\)return vec2\(10\.,1\.\)/, 'SDF MAG suppression missing');
assert.match(mapper, /fxSdfCore = 'disabled-before-scene-0\.92'/, 'SDF ownership marker missing');
assert.match(mapper, /formatx-core-mesh3d\.js\?v=20260808-true-mesh3d-v1/, 'true mesh runtime bootstrap missing');
assert.match(mapper, /formatx-core-mesh3d\.css\?v=20260808-true-mesh3d-v1/, 'true mesh stylesheet bootstrap missing');
assert.match(mapper, /formatx:nativeapexready/, 'true mesh must start only after Native Apex');
assert.doesNotMatch(mapper, /scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/, 'scene mapper must not capture scroll');

// Actual GPU mesh requirements: indexed triangles, vertex normals, depth buffer and perspective.
assert.match(mesh, /getContext\('webgl2'/, 'WebGL2 mesh context missing');
assert.match(mesh, /depth: true/, 'depth buffer request missing');
assert.match(mesh, /gl\.enable\(gl\.DEPTH_TEST\)/, 'depth testing missing');
assert.match(mesh, /gl\.depthFunc\(gl\.LEQUAL\)/, 'depth function missing');
assert.match(mesh, /gl\.bindBuffer\(gl\.ELEMENT_ARRAY_BUFFER/, 'indexed element buffer missing');
assert.match(mesh, /gl\.drawElements\(gl\.TRIANGLES/, 'indexed triangle rendering missing');
assert.match(mesh, /aPosition/, 'vertex position attribute missing');
assert.match(mesh, /aNormal/, 'vertex normal attribute missing');
assert.match(mesh, /computeNormals\(/, 'generated mesh normals missing');
assert.match(mesh, /function perspective\(/, 'perspective projection missing');
assert.match(mesh, /function lookAt\(/, '3D view matrix missing');
assert.match(mesh, /uProjection\*uView\*vec4\(p,1\.\)/, 'vertex projection pipeline missing');
assert.match(mesh, /buildCrystalGeometry\(/, 'crystal mesh generator missing');
assert.match(mesh, /buildTorusGeometry\(/, '3D torus geometry missing');
assert.match(mesh, /buildSphereGeometry\(/, '3D reactor sphere missing');

// Reference silhouette is geometry, not a 2D image or canvas imitation.
assert.match(mesh, /\[0,1\],\[\.115,\.705\],\[\.305,\.325\],\[\.705,\.115\]/, 'reference upper-right contour missing');
assert.match(mesh, /\[1,0\]/, 'reference right tip missing');
assert.match(mesh, /\[0,-1\]/, 'reference bottom tip missing');
assert.match(mesh, /\[-1,0\]/, 'reference left tip missing');
assert.match(mesh, /const depth = \.46/, 'true crystal Z depth missing');
assert.match(mesh, /frontCenter = add\(0, 0, depth\)/, 'front 3D surface missing');
assert.match(mesh, /backCenter = add\(0, 0, -depth\)/, 'back 3D surface missing');
assert.match(mesh, /outerFront.*outerBack/s, 'side wall geometry missing');
assert.doesNotMatch(mesh, /drawImage\s*\(|new Image\s*\(|background-image/i, 'MAG must not be image-backed');
assert.doesNotMatch(mesh, /THREE\b|three\.js|gsap/i, 'MAG must remain first-party dependency-free');

// Living animation and luminous reactor.
assert.match(mesh, /Math\.pow\(beatA, 4\) \* \.72 \+ Math\.pow\(beatB, 9\) \* \.28/, 'double heartbeat pulse missing');
assert.match(mesh, /const pulse = 1 \+ heart \* \.026 \+ breath \* \.006/, 'mesh breathing pulse missing');
assert.match(mesh, /reactorSphere/, 'reactor sphere missing');
assert.match(mesh, /reactorRings/, 'reactor rings missing');
assert.match(mesh, /outerOrbits/, 'outer 3D orbits missing');
assert.match(mesh, /uGlobalRotation/, 'global 3D rotation missing');
assert.match(mesh, /reference-locked-true-mesh3d-v10|four-tip-concave-crystal/, 'reference-lock marker missing');

// Mobile stage remains transparent, non-interactive and full viewport.
assert.match(meshCss, /position: fixed/, 'mesh stage must be viewport-bound');
assert.match(meshCss, /height: 100dvh/, 'dynamic viewport height missing');
assert.match(meshCss, /pointer-events: none/, 'mesh stage must never capture input');
assert.match(meshCss, /background: transparent/, 'mesh overlay must preserve Apex background');
assert.match(mobile, /translate3d\(0, -\.8svh, 0\) scale\(1\)/, 'native Apex background framing regressed');

// Existing runtime safety contracts remain intact.
assert.match(apex, /quality: coarse\.matches \? 0\.82 : 0\.88/, 'Apex adaptive quality floor regressed');
assert.doesNotMatch(apex, /scrollTo\s*\(/, 'Native Apex must not own page position');
assert.match(voice, /window\.visualViewport/, 'dialogue must use Visual Viewport API');
assert.match(voice, /keyboardInset/, 'keyboard inset guard missing');
assert.doesNotMatch(voice, /scrollTo\s*\(|scrollIntoView\s*\(/, 'dialogue guard must not move page');
assert.match(infinite, /const VERSION = 'seamless-v7'/, 'seamless-v7 regressed');
assert.match(infinite, /root\.dataset\.fxInfiniteInput = 'native'/, 'native momentum contract regressed');

console.log('PASS: MAG is a real indexed WebGL2 triangle mesh with normals, perspective, depth testing, pulsing 3D reactor/orbits, reference-locked geometry and no SDF/image ownership.');

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const mesh = read('docs/scifi-ui/scripts/formatx-core-mesh3d-v5.js');
const meshCss = read('docs/scifi-ui/styles/formatx-core-mesh3d.css');
const apex = read('docs/scifi-ui/scripts/formatx-apex-native.js');
const voice = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');

assert.match(mapper, /fxApexSceneStability === 'ready-v13'/, 'reference-bright mapper revision missing');
assert.match(mapper, /formatx-core-mesh3d-v5\.js\?v=20260808-true-mesh3d-v5/, 'mesh v5 runtime bootstrap missing');
assert.match(mapper, /if\(uScene<\.92\)return vec2\(10\.,1\.\)/, 'SDF core suppression missing');
assert.match(mapper, /reference-bright-faceted-true-mesh3d-v14/, 'v5 runtime marker missing');
assert.match(mapper, /coreDistance-\.050/, 'concentrated screen-space inner reactor missing');
assert.match(mapper, /coreDistance-\.090/, 'concentrated screen-space middle reactor missing');
assert.match(mapper, /coreDistance-\.145/, 'concentrated screen-space outer reactor missing');
assert.doesNotMatch(mapper, /scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/, 'mapper must not capture scrolling');

assert.match(mesh, /getContext\('webgl2'/, 'WebGL2 context missing');
assert.match(mesh, /depth:true/, 'depth buffer missing');
assert.match(mesh, /gl\.enable\(gl\.DEPTH_TEST\)/, 'depth test missing');
assert.match(mesh, /gl\.drawElements\(gl\.TRIANGLES/, 'indexed triangle rendering missing');
assert.match(mesh, /gl\.drawElements\(gl\.LINES/, 'indexed 3D light grid missing');
assert.match(mesh, /cross\(dFdx\(vP\),dFdy\(vP\)\)/, 'facet normals missing');
assert.match(mesh, /mix\(faceN,smoothN,\.12\)/, 'facet normal dominance missing');
assert.match(mesh, /ys=1\.18/, 'reference vertical aspect missing');
assert.match(mesh, /dep=\.34/, 'glass body depth missing');
assert.match(mesh, /for\(const r of \[2,4,6,8,10,12,14\]\)/, 'dense contour grid missing');
assert.match(mesh, /for\(let i=0;i<N;i\+=4\)/, 'dense radial grid missing');
assert.match(mesh, /core=up\(sphere\(\.064\)\)/, 'small reactor core missing');
assert.match(mesh, /lines\(crystal,\.550,pulse/, 'primary cyan grid draw missing');
assert.match(mesh, /lines\(crystal,\.553,pulse/, 'violet iridescent grid draw missing');
assert.match(mesh, /lines\(crystal,\.547,pulse/, 'cyan glow grid draw missing');
assert.match(mesh, /latticeA=pow/, 'cyan internal lattice missing');
assert.match(mesh, /latticeB=pow/, 'violet internal lattice missing');
assert.match(mesh, /vec3\(\.34,1\.30,2\.02\)\*f\*3\.85/, 'reference-bright Fresnel missing');
assert.match(mesh, /fxCoreMesh3d='ready-v5'/, 'mesh v5 ready marker missing');
assert.match(mesh, /fxCoreGeometry='indexed-triangle-mesh-v5'/, 'mesh v5 geometry marker missing');
assert.match(mesh, /fxCoreLineGeometry='dense-indexed-3d-grid'/, 'dense 3D grid marker missing');
assert.doesNotMatch(mesh, /drawImage\s*\(|new Image\s*\(|background-image/i, 'MAG must not be image-backed');
assert.doesNotMatch(mesh, /THREE\b|three\.js|gsap/i, 'MAG must remain first-party dependency-free');

assert.match(meshCss, /pointer-events: none/, 'mesh must not capture input');
assert.match(meshCss, /height: 100dvh/, 'dynamic viewport missing');
assert.match(meshCss, /background: transparent/, 'transparent overlay missing');
assert.match(apex, /quality: coarse\.matches \? 0\.82 : 0\.88/, 'Apex background quality regressed');
assert.match(voice, /window\.visualViewport/, 'dialogue viewport guard missing');
assert.match(voice, /keyboardInset/, 'keyboard inset guard missing');
assert.match(infinite, /const VERSION = 'seamless-v7'/, 'seamless-v7 regressed');
assert.match(infinite, /root\.dataset\.fxInfiniteInput = 'native'/, 'native momentum regressed');

console.log('PASS: MAG v5 is a bright faceted real indexed WebGL2 crystal with dense 3D cyan/violet grid geometry, concentrated reactor and seamless-v7 ownership.');

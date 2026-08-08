'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const mesh = read('docs/scifi-ui/scripts/formatx-core-mesh3d-v3.js');
const meshCss = read('docs/scifi-ui/styles/formatx-core-mesh3d.css');
const apex = read('docs/scifi-ui/scripts/formatx-apex-native.js');
const voice = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');

assert.match(mapper, /fxApexSceneStability === 'ready-v11'/, 'luminous mesh mapper revision missing');
assert.match(mapper, /formatx-core-mesh3d-v3\.js\?v=20260808-true-mesh3d-v3/, 'luminous mesh runtime bootstrap missing');
assert.match(mapper, /if\(uScene<\.92\)return vec2\(10\.,1\.\)/, 'SDF core suppression missing');
assert.match(mapper, /reference-luminous-true-mesh3d-v12/, 'luminous runtime marker missing');
assert.doesNotMatch(mapper, /scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/, 'mapper must not capture scrolling');

assert.match(mesh, /getContext\('webgl2'/, 'WebGL2 context missing');
assert.match(mesh, /depth:true/, 'depth buffer missing');
assert.match(mesh, /gl\.enable\(gl\.DEPTH_TEST\)/, 'depth test missing');
assert.match(mesh, /gl\.bindBuffer\(gl\.ELEMENT_ARRAY_BUFFER/, 'element index buffer missing');
assert.match(mesh, /gl\.drawElements\(gl\.TRIANGLES/, 'indexed triangle rendering missing');
assert.match(mesh, /aPosition/, 'vertex positions missing');
assert.match(mesh, /aNormal/, 'vertex normals missing');
assert.match(mesh, /function norms\(/, 'normal generation missing');
assert.match(mesh, /uProjection\*uView\*vec4\(p,1\.\)/, 'projected vertex pipeline missing');

assert.match(mesh, /\[0,1\],\[\.10,\.76\],\[\.27,\.40\],\[\.67,\.11\]/, 'reference upper contour missing');
assert.match(mesh, /\[1,0\]/, 'right tip missing');
assert.match(mesh, /\[0,-1\]/, 'bottom tip missing');
assert.match(mesh, /\[-1,0\]/, 'left tip missing');
assert.match(mesh, /ys=1\.20/, 'reference vertical elongation missing');
assert.match(mesh, /dep=\.40/, 'true Z depth missing');
assert.match(mesh, /fc=add\(0,0,dep\)/, 'front surface missing');
assert.match(mesh, /bc=add\(0,0,-dep\)/, 'back surface missing');
assert.match(mesh, /of=fr\[R-1\],ob=br\[R-1\]/, 'side wall geometry missing');

assert.match(mesh, /core=up\(sphere\(\.068\)\)/, 'small bright reactor core missing');
assert.match(mesh, /up\(torus\(\.19,\.0055\)\)/, 'inner reactor torus missing');
assert.match(mesh, /up\(torus\(\.74,\.004\)\)/, 'outer orbit missing');
assert.match(mesh, /draw\(crystal,0,\.55,pulse/, 'reference geometric scale missing');
assert.match(mesh, /latticeA=pow/, 'cyan internal lattice missing');
assert.match(mesh, /latticeB=pow/, 'violet internal lattice missing');
assert.match(mesh, /vec3\(\.24,1\.06,1\.70\)\*f\*3\.10/, 'strong Fresnel edge light missing');
assert.match(mesh, /Math\.pow\(a,4\)\*\.72\+Math\.pow\(b,9\)\*\.28/, 'heartbeat envelope missing');
assert.match(mesh, /pulse=1\+heart\*\.022\+breath\*\.005/, 'living pulse missing');
assert.match(mesh, /fxCoreMesh3d='ready-v3'/, 'mesh v3 ready marker missing');
assert.match(mesh, /fxCoreGeometry='indexed-triangle-mesh-v3'/, 'mesh v3 geometry marker missing');
assert.match(mesh, /fxCoreCamera='perspective'/, 'perspective marker missing');
assert.doesNotMatch(mesh, /drawImage\s*\(|new Image\s*\(|background-image/i, 'MAG must not be image-backed');
assert.doesNotMatch(mesh, /THREE\b|three\.js|gsap/i, 'MAG must remain dependency-free');

assert.match(meshCss, /pointer-events: none/, 'mesh must not capture input');
assert.match(meshCss, /height: 100dvh/, 'dynamic viewport missing');
assert.match(meshCss, /background: transparent/, 'transparent overlay missing');
assert.match(apex, /quality: coarse\.matches \? 0\.82 : 0\.88/, 'Apex background quality regressed');
assert.match(voice, /window\.visualViewport/, 'dialogue visual viewport guard missing');
assert.match(voice, /keyboardInset/, 'keyboard inset guard missing');
assert.match(infinite, /const VERSION = 'seamless-v7'/, 'seamless-v7 regressed');
assert.match(infinite, /root\.dataset\.fxInfiniteInput = 'native'/, 'native momentum regressed');

console.log('PASS: luminous MAG v3 keeps real indexed WebGL2 geometry while enforcing the taller reference silhouette, brighter cyan/violet lattice, small reactor and seamless-v7 ownership.');

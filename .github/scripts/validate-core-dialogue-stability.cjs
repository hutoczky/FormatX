'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const mesh = read('docs/scifi-ui/scripts/formatx-core-mesh3d-v6.js');
const meshCss = read('docs/scifi-ui/styles/formatx-core-mesh3d.css');
const apex = read('docs/scifi-ui/scripts/formatx-apex-native.js');
const voice = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const infinite = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');

assert.match(mapper, /fxApexSceneStability === 'ready-v14'/, 'layered glass mapper revision missing');
assert.match(mapper, /formatx-core-mesh3d-v6\.js\?v=20260808-true-mesh3d-v6/, 'mesh v6 runtime bootstrap missing');
assert.match(mapper, /if\(uScene<\.92\)return vec2\(10\.,1\.\)/, 'SDF MAG suppression missing');
assert.match(mapper, /reference-layered-glass-true-mesh3d-v15/, 'v6 runtime marker missing');
assert.doesNotMatch(mapper, /scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/, 'mapper must not capture scrolling');

// Real 3D geometry remains mandatory.
assert.match(mesh, /getContext\('webgl2'/, 'WebGL2 context missing');
assert.match(mesh, /depth:true/, 'depth buffer missing');
assert.match(mesh, /gl\.enable\(gl\.DEPTH_TEST\)/, 'depth testing missing');
assert.match(mesh, /gl\.bindBuffer\(gl\.ELEMENT_ARRAY_BUFFER/, 'indexed element buffer missing');
assert.match(mesh, /gl\.drawElements\(gl\.TRIANGLES/, 'indexed triangle rendering missing');
assert.match(mesh, /gl\.drawElements\(gl\.LINES/, 'indexed crystal line geometry missing');
assert.match(mesh, /aPosition/, 'vertex position attribute missing');
assert.match(mesh, /aNormal/, 'vertex normal attribute missing');
assert.match(mesh, /cross\(dFdx\(vP\),dFdy\(vP\)\)/, 'faceted derivative normals missing');
assert.match(mesh, /uProjection\*uView\*vec4\(p,1\.\)/, 'perspective vertex pipeline missing');

// Reference silhouette and true front/back volume.
assert.match(mesh, /\[0,1\],\[\.10,\.77\],\[\.28,\.42\],\[\.66,\.12\]/, 'reference upper contour missing');
assert.match(mesh, /\[1,0\]/, 'right tip missing');
assert.match(mesh, /\[0,-1\]/, 'bottom tip missing');
assert.match(mesh, /\[-1,0\]/, 'left tip missing');
assert.match(mesh, /ys=1\.18/, 'reference vertical aspect missing');
assert.match(mesh, /dep=\.34/, 'real Z depth missing');
assert.match(mesh, /fc=add\(0,0,dep\)/, 'front surface missing');
assert.match(mesh, /bc=add\(0,0,-dep\)/, 'back surface missing');
assert.match(mesh, /of=fr\[R-1\],ob=br\[R-1\]/, 'side-wall geometry missing');

// Three actual nested triangle-mesh glass membranes, not a shader silhouette trick.
assert.match(mesh, /draw\(crystal,0,\.455,pulse/, 'inner violet glass mesh missing');
assert.match(mesh, /draw\(crystal,0,\.505,pulse/, 'inner cyan glass mesh missing');
assert.match(mesh, /draw\(crystal,0,\.55,pulse/, 'outer glass mesh missing');
assert.match(mesh, /3-real-mesh-layers/, 'three real mesh layers marker missing');
assert.match(mesh, /lines\(crystal,\.551,pulse/, 'cyan facet line mesh missing');
assert.match(mesh, /lines\(crystal,\.548,pulse/, 'violet facet line mesh missing');
assert.match(mesh, /latticeA=pow/, 'cyan internal lattice missing');
assert.match(mesh, /latticeB=pow/, 'violet internal lattice missing');

// 3D reactor and motion remain actual geometry.
assert.match(mesh, /core=up\(sphere\(\.064\)\)/, 'reactor sphere missing');
assert.match(mesh, /up\(torus\(\.18,\.005\)\)/, 'inner reactor torus missing');
assert.match(mesh, /up\(torus\(\.72,\.0038\)\)/, 'outer orbit torus missing');
assert.match(mesh, /Math\.pow\(a,4\)\*\.72\+Math\.pow\(b,9\)\*\.28/, 'double heartbeat missing');
assert.match(mesh, /pulse=1\+heart\*\.022\+breath\*\.005/, 'breathing pulse missing');
assert.match(mesh, /fxCoreMesh3d='ready-v6'/, 'v6 ready marker missing');
assert.match(mesh, /fxCoreGeometry='indexed-triangle-mesh-v6'/, 'v6 geometry marker missing');
assert.match(mesh, /fxCoreGlassLayers='3-real-mesh-layers'/, 'glass layer marker missing');
assert.doesNotMatch(mesh, /drawImage\s*\(|new Image\s*\(|background-image/i, 'MAG must never be image-backed');
assert.doesNotMatch(mesh, /THREE\b|three\.js|gsap/i, 'MAG must remain first-party and dependency-free');

assert.match(meshCss, /pointer-events: none/, 'mesh must not capture input');
assert.match(meshCss, /height: 100dvh/, 'dynamic viewport missing');
assert.match(meshCss, /background: transparent/, 'transparent overlay missing');
assert.match(apex, /quality: coarse\.matches \? 0\.82 : 0\.88/, 'Apex background quality regressed');
assert.match(voice, /window\.visualViewport/, 'dialogue visual viewport guard missing');
assert.match(voice, /keyboardInset/, 'keyboard inset guard missing');
assert.match(infinite, /const VERSION = 'seamless-v7'/, 'seamless-v7 regressed');
assert.match(infinite, /root\.dataset\.fxInfiniteInput = 'native'/, 'native momentum regressed');

console.log('PASS: layered glass MAG v6 uses three real indexed WebGL2 crystal surfaces with true depth, perspective, reactor/orbit geometry and seamless-v7 ownership.');

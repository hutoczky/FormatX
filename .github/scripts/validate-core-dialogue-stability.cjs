'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const mapper=read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const mesh=read('docs/scifi-ui/scripts/formatx-core-mesh3d-v7.js');
const meshCss=read('docs/scifi-ui/styles/formatx-core-mesh3d.css');
const apex=read('docs/scifi-ui/scripts/formatx-apex-native.js');
const voice=read('docs/scifi-ui/scripts/organism-voice-stability.js');
const infinite=read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');

assert.match(mapper,/fxApexSceneStability === 'ready-v15'/,'v7 mapper revision missing');
assert.match(mapper,/formatx-core-mesh3d-v7\.js\?v=20260808-true-mesh3d-v7/,'v7 runtime bootstrap missing');
assert.match(mapper,/if\(uScene<\.92\)return vec2\(10\.,1\.\)/,'SDF MAG suppression missing');
assert.match(mapper,/retired-for-real-3d-reactor/,'2D reactor retirement marker missing');
assert.match(mapper,/reference-additive-layered-true-mesh3d-v16/,'v7 runtime marker missing');
assert.doesNotMatch(mapper,/scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/,'mapper must not capture scroll');

assert.match(mesh,/getContext\('webgl2'/,'WebGL2 context missing');
assert.match(mesh,/depth: true/,'depth buffer missing');
assert.match(mesh,/gl\.enable\(gl\.DEPTH_TEST\)/,'depth testing missing');
assert.match(mesh,/gl\.bindBuffer\(gl\.ELEMENT_ARRAY_BUFFER/,'indexed element buffer missing');
assert.match(mesh,/gl\.drawElements\(gl\.TRIANGLES/,'indexed triangle rendering missing');
assert.match(mesh,/gl\.drawElements\(gl\.LINES/,'indexed line rendering missing');
assert.match(mesh,/aPosition/,'vertex positions missing');
assert.match(mesh,/aNormal/,'vertex normals missing');
assert.match(mesh,/cross\(dFdx\(vWorld\),dFdy\(vWorld\)\)/,'faceted derivative normals missing');
assert.match(mesh,/uProjection\*uView\*vec4\(p,1\.\)/,'perspective vertex pipeline missing');

assert.match(mesh,/\[0,1\],\[\.10,\.77\],\[\.28,\.42\],\[\.66,\.12\]/,'reference contour missing');
assert.match(mesh,/depth=\.34/,'real Z depth missing');
assert.match(mesh,/yStretch=1\.18/,'reference vertical aspect missing');
assert.match(mesh,/frontCenter=add\(0,0,depth\)/,'front surface missing');
assert.match(mesh,/backCenter=add\(0,0,-depth\)/,'back surface missing');
assert.match(mesh,/outerFront=front\[rings-1\],outerBack=back\[rings-1\]/,'side wall geometry missing');

assert.match(mesh,/gl\.blendFunc\(gl\.SRC_ALPHA,gl\.ONE\)/,'additive glass blending missing');
assert.match(mesh,/drawTriangles\(crystal,0,\.455,pulse/,'inner violet real mesh layer missing');
assert.match(mesh,/drawTriangles\(crystal,0,\.505,pulse/,'inner cyan real mesh layer missing');
assert.match(mesh,/drawTriangles\(crystal,0,\.550,pulse/,'main real mesh layer missing');
assert.match(mesh,/drawTriangles\(crystal,0,\.563,pulse/,'outer glow real mesh layer missing');
assert.match(mesh,/4-real-mesh-passes/,'real mesh layer marker missing');
assert.match(mesh,/drawLines\(crystal,\.552,pulse/,'sparse cyan mesh lines missing');
assert.match(mesh,/drawLines\(crystal,\.548,pulse/,'sparse violet mesh lines missing');

assert.match(mesh,/buildSphere\(\.080\)/,'real reactor sphere missing');
assert.match(mesh,/buildTorus\(\.34,\.006\)/,'inner real reactor torus missing');
assert.match(mesh,/buildTorus\(\.50,\.0055\)/,'middle real reactor torus missing');
assert.match(mesh,/buildTorus\(\.66,\.005\)/,'outer real reactor torus missing');
assert.match(mesh,/buildTorus\(\.98,\.0045\)/,'real outer orbit missing');
assert.match(mesh,/Math\.pow\(beatA,4\)\*\.72\+Math\.pow\(beatB,9\)\*\.28/,'double heartbeat missing');
assert.match(mesh,/fxCoreMesh3d='ready-v7'/,'v7 ready marker missing');
assert.match(mesh,/fxCoreGeometry='indexed-triangle-mesh-v7'/,'v7 geometry marker missing');
assert.match(mesh,/fxCoreReactorGeometry='sphere-plus-3-tori'/,'real reactor geometry marker missing');
assert.doesNotMatch(mesh,/drawImage\s*\(|new Image\s*\(|background-image/i,'MAG must not be image-backed');
assert.doesNotMatch(mesh,/THREE\b|three\.js|gsap/i,'MAG must remain first-party');

assert.match(meshCss,/pointer-events: none/,'mesh must not capture input');
assert.match(meshCss,/height: 100dvh/,'dynamic viewport missing');
assert.match(apex,/quality: coarse\.matches \? 0\.82 : 0\.88/,'Apex background quality regressed');
assert.match(voice,/window\.visualViewport/,'dialogue viewport guard missing');
assert.match(voice,/keyboardInset/,'keyboard inset guard missing');
assert.match(infinite,/const VERSION = 'seamless-v7'/,'seamless-v7 regressed');
assert.match(infinite,/root\.dataset\.fxInfiniteInput = 'native'/,'native momentum regressed');
console.log('PASS: v7 MAG is real additive layered indexed WebGL2 geometry with real 3D reactor/orbits and no screen-space reactor ownership.');

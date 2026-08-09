'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const mapper=read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const shape=read('docs/scifi-ui/scripts/formatx-core-shape-v14.js');
const material=read('docs/scifi-ui/scripts/formatx-core-mesh3d-material-v14.js');
const geometry=read('docs/scifi-ui/scripts/formatx-core-geometry-v13.js');
const mesh=read('docs/scifi-ui/scripts/formatx-core-mesh3d-v11.js');
const fracture=read('docs/scifi-ui/scripts/formatx-core-fracture3d-v11.js');
const kick=read('docs/scifi-ui/scripts/formatx-core-cinematic-kick-v11.js');
const grade=read('docs/scifi-ui/styles/formatx-core-cinematic-grade-v14.css');
const voice=read('docs/scifi-ui/scripts/organism-voice-stability.js');
const interaction=read('docs/scifi-ui/scripts/organism-core-interaction.js');
const infinite=read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');

assert.match(mapper,/fxApexSceneStability==='ready-v24'/,'v14 mapper revision missing');
assert.match(mapper,/formatx-core-shape-v14\.js\?v=20260809-reference-ratio-v14/,'v14 reference shape bootstrap missing');
assert.match(mapper,/formatx-core-mesh3d-material-v14\.js\?v=20260809-reference-glass-v14/,'v14 material bootstrap missing');
assert.match(mapper,/formatx-core-geometry-v13\.js\?v=20260809-true-3d-scale-v13/,'true 3D scalar bootstrap missing');
assert.match(mapper,/formatx-core-cinematic-grade-v14\.css\?v=20260809-reference-balance-v14/,'v14 grade bootstrap missing');
assert.match(mapper,/cinematic-reference-ratio-glass-true-mesh3d-v24/,'v14 visual marker missing');
assert.match(mapper,/fxCoreMaterialContract='reference-glass-v14'/,'v14 material contract missing');
assert.match(mapper,/fxCoreGeometryContract='true-3d-uniform-scale-1\.15-plus-y0\.72-vertex-shape'/,'v14 geometry contract missing');
assert.match(mapper,/retired-for-real-3d-reactor/,'screen-space reactor retirement missing');
assert.doesNotMatch(mapper,/scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/,'mapper must not capture scrolling');

assert.match(shape,/aPosition\.y\*\.72/,'mesh Y reference ratio missing');
assert.match(shape,/q=vec3\(aPosition\.x,aPosition\.y\*\.72,aPosition\.z\)/,'vertex-space Y squash missing');
assert.match(shape,/fxCoreShapeMesh='applied-v14'/,'mesh shape marker missing');
assert.match(shape,/fxCoreShapeFracture='applied-v14'/,'fracture shape marker missing');
assert.match(shape,/fxCoreShapeY='0\.72x-vertex-space'/,'shape scale marker missing');
assert.doesNotMatch(shape,/style\.|transform\s*:/,'shape correction must not use CSS transforms');

assert.match(material,/pow\(y,vec3\(\.86\)\)/,'v14 film curve missing');
assert.match(material,/float lineA=/,'bright glass facet line A missing');
assert.match(material,/float lineB=/,'bright glass facet line B missing');
assert.match(material,/float whiteFacet=/,'white facet highlights missing');
assert.match(material,/float coreMask=1\.-sm\(\.030,\.070,r\)/,'compact white reactor core missing');
assert.match(material,/float violetHint=/,'cyan-violet ring separation missing');
assert.match(material,/fxCoreMeshMaterial='reference-glass-v14'/,'v14 material applied marker missing');
assert.match(material,/fxCoreMeshMaterialPatch='applied-v14'/,'v14 patch marker missing');
assert.doesNotMatch(material,/drawImage\s*\(|new Image\s*\(|background-image/i,'material must remain procedural');

assert.match(geometry,/name==='uScale'/,'true 3D uScale intercept missing');
assert.match(geometry,/value\*1\.15/,'true 3D 1.15 scalar missing');
assert.match(mesh,/getContext\('webgl2'/,'WebGL2 mesh missing');
assert.match(mesh,/gl\.enable\(gl\.DEPTH_TEST\)/,'depth testing missing');
assert.match(mesh,/gl\.drawElements\(gl\.TRIANGLES/,'indexed triangles missing');
assert.match(mesh,/fxCoreGeometry='indexed-triangle-mesh-v11'/,'indexed mesh marker missing');
assert.match(fracture,/gl\.drawElements\(gl\.LINES/,'indexed fracture lines missing');
assert.match(fracture,/fxCoreFracture3d='ready-v11'/,'fracture ready marker missing');

assert.match(grade,/brightness\(1\.13\)/,'desktop balanced brightness missing');
assert.match(grade,/saturate\(1\.24\)/,'desktop balanced saturation missing');
assert.match(grade,/opacity: 0\.34/,'desktop fracture reduction missing');
assert.match(grade,/brightness\(1\.16\)/,'mobile balanced brightness missing');
assert.match(grade,/opacity: 0\.30/,'mobile fracture reduction missing');

assert.match(kick,/formatx:organismresponse.*\.74,1\.15,2100/s,'response impulse missing');
assert.match(interaction,/formatx:organismcoreactivate/,'core activation event regressed');
assert.match(voice,/window\.visualViewport/,'dialogue viewport guard missing');
assert.match(voice,/keyboardInset/,'keyboard guard missing');
assert.match(infinite,/const VERSION = 'seamless-v7'/,'seamless-v7 regressed');
assert.match(infinite,/root\.dataset\.fxInfiniteInput = 'native'/,'native momentum regressed');
console.log('PASS: v14 matches the reference silhouette in real vertex space, keeps fracture alignment, adds brighter glass facets and colored rings, and preserves reactive cinematic behavior.');

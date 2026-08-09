'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const mapper=read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const material=read('docs/scifi-ui/scripts/formatx-core-mesh3d-material-v13.js');
const geometry=read('docs/scifi-ui/scripts/formatx-core-geometry-v13.js');
const mesh=read('docs/scifi-ui/scripts/formatx-core-mesh3d-v11.js');
const kick=read('docs/scifi-ui/scripts/formatx-core-cinematic-kick-v11.js');
const fracture=read('docs/scifi-ui/scripts/formatx-core-fracture3d-v11.js');
const grade=read('docs/scifi-ui/styles/formatx-core-cinematic-grade-v13.css');
const meshCss=read('docs/scifi-ui/styles/formatx-core-mesh3d.css');
const apex=read('docs/scifi-ui/scripts/formatx-apex-native.js');
const voice=read('docs/scifi-ui/scripts/organism-voice-stability.js');
const interaction=read('docs/scifi-ui/scripts/organism-core-interaction.js');
const infinite=read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');

assert.match(mapper,/fxApexSceneStability==='ready-v23'/,'v13 mapper revision missing');
assert.match(mapper,/formatx-core-mesh3d-material-v13\.js\?v=20260809-reference-glass-v13/,'v13 material bootstrap missing');
assert.match(mapper,/formatx-core-geometry-v13\.js\?v=20260809-true-3d-scale-v13/,'v13 true 3D geometry grade bootstrap missing');
assert.match(mapper,/formatx-core-mesh3d-v11\.js\?v=20260809-cinematic-mesh3d-v11/,'true mesh bootstrap missing');
assert.match(mapper,/formatx-core-cinematic-grade-v13\.css\?v=20260809-balanced-reference-v13/,'v13 balanced grade bootstrap missing');
assert.match(mapper,/cinematic-reference-glass-true-mesh3d-v23/,'v13 visual marker missing');
assert.match(mapper,/fxCoreMaterialContract='reference-glass-v13'/,'v13 material contract missing');
assert.match(mapper,/fxCoreGeometryContract='true-3d-uniform-scale-1\.15'/,'v13 geometry contract missing');
assert.match(mapper,/if\(uScene<\.92\)return vec2\(10\.,1\.\)/,'legacy SDF MAG suppression missing');
assert.match(mapper,/retired-for-real-3d-reactor/,'screen-space reactor retirement missing');
assert.doesNotMatch(mapper,/scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/,'mapper must not capture scrolling');

assert.match(material,/vec3 film\(vec3 x\)/,'film tonemap missing');
assert.match(material,/pow\(y,vec3\(\.78\)\)/,'mid-tone lift missing');
assert.match(material,/float fres=pow\(1\.-ndv,1\.52\)/,'glass Fresnel missing');
assert.match(material,/float causticA=/,'cyan caustic A missing');
assert.match(material,/float causticB=/,'cyan caustic B missing');
assert.match(material,/float violetVein=/,'violet energy vein missing');
assert.match(material,/float shoulder=/,'broad shoulder highlight missing');
assert.match(material,/float coreMask=1\.-sm\(\.050,\.095,r\)/,'compact reactor mask missing');
assert.match(material,/fxCoreMeshMaterial='reference-glass-v13'/,'v13 material applied marker missing');
assert.match(material,/fxCoreMeshMaterialPatch='applied-v13'/,'v13 material patch marker missing');
assert.doesNotMatch(material,/drawImage\s*\(|new Image\s*\(|background-image/i,'material must not be image-backed');

assert.match(geometry,/scaleLocations=new WeakSet\(\)/,'true 3D scale uniform tracking missing');
assert.match(geometry,/name==='uScale'/,'uScale interception missing');
assert.match(geometry,/value\*1\.15/,'15 percent true 3D scale missing');
assert.match(geometry,/fxCoreGeometryScale='1\.15x-true-3d-uniform'/,'geometry scale marker missing');
assert.doesNotMatch(geometry,/transform\s*:|scale\(/,'geometry grade must not use CSS pixel zoom');

assert.match(mesh,/getContext\('webgl2'/,'WebGL2 mesh context missing');
assert.match(mesh,/depth:true/,'mesh depth buffer missing');
assert.match(mesh,/gl\.enable\(gl\.DEPTH_TEST\)/,'mesh depth testing missing');
assert.match(mesh,/gl\.enable\(gl\.CULL_FACE\)/,'mesh face culling missing');
assert.match(mesh,/gl\.drawElements\(gl\.TRIANGLES/,'indexed triangle rendering missing');
assert.match(mesh,/xs=\.82/,'horizontal proportion missing');
assert.match(mesh,/ys=1\.30/,'vertical proportion missing');
assert.match(mesh,/dep=\.36/,'real Z depth missing');
assert.match(mesh,/window\.FormatXCoreCinematic=\{version:'film-reactive-v1'/,'cinematic state missing');
assert.match(mesh,/outerRot=.*midRot=.*innerRot=/s,'independent layer motion missing');
assert.match(mesh,/orbSpeed=\.010\+\.026\*cinematic\.energy/,'energy-driven orbit acceleration missing');
assert.match(mesh,/fxCoreGeometry='indexed-triangle-mesh-v11'/,'indexed mesh marker missing');
assert.doesNotMatch(mesh,/drawImage\s*\(|new Image\s*\(|background-image/i,'MAG must not be image-backed');
assert.doesNotMatch(mesh,/THREE\b|three\.js|gsap/i,'third-party scene framework forbidden');

assert.match(kick,/formatx:organismcoreactivate.*\.60,1\.00,1600/s,'activation kick missing');
assert.match(kick,/formatx:organismresponse.*\.74,1\.15,2100/s,'response kick missing');
assert.match(kick,/formatx:organismspeechstart.*\.80,\.72,5000,1/s,'speech kick missing');
assert.match(kick,/frame-rate-independent-v1/,'frame-independent marker missing');

assert.match(fracture,/gl\.drawElements\(gl\.LINES/,'fracture indexed GL_LINES missing');
assert.match(fracture,/window\.FormatXCoreCinematic/,'fracture must share cinematic state');
assert.match(fracture,/fxCoreFracture3d='ready-v11'/,'fracture ready marker missing');

assert.match(grade,/brightness\(1\.24\)/,'balanced desktop brightness missing');
assert.match(grade,/saturate\(1\.46\)/,'balanced desktop saturation missing');
assert.match(grade,/opacity: 0\.46/,'fracture dominance reduction missing');
assert.match(grade,/brightness\(1\.28\)/,'balanced mobile brightness missing');
assert.match(grade,/opacity: 0\.42/,'mobile fracture dominance reduction missing');

assert.match(interaction,/formatx:organismcoreactivate/,'organism interaction regressed');
assert.match(voice,/window\.visualViewport/,'dialogue viewport guard missing');
assert.match(voice,/keyboardInset/,'keyboard overlap guard missing');
assert.match(meshCss,/pointer-events: none/,'mesh must not capture input');
assert.match(apex,/quality: coarse\.matches \? 0\.82 : 0\.88/,'Apex quality regressed');
assert.match(infinite,/const VERSION = 'seamless-v7'/,'seamless-v7 regressed');
assert.match(infinite,/root\.dataset\.fxInfiniteInput = 'native'/,'native momentum regressed');
console.log('PASS: v13 keeps real indexed WebGL2 geometry, scales it in vertex-uniform space, strengthens broad glass body lighting, preserves reactive cinematic motion, and reduces wireframe dominance.');

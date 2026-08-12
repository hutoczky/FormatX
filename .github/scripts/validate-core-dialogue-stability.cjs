'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const mapper = read('docs/scifi-ui/scripts/formatx-apex-scene-stability.js');
const material = read('docs/scifi-ui/scripts/formatx-core-mesh3d-material-v26.js');
const grade = read('docs/scifi-ui/styles/formatx-core-cinematic-grade-v23.css');
const shape = read('docs/scifi-ui/scripts/formatx-core-shape-v14.js');
const geometry = read('docs/scifi-ui/scripts/formatx-core-geometry-v13.js');
const mesh = read('docs/scifi-ui/scripts/formatx-core-mesh3d-v11.js');
const fracture = read('docs/scifi-ui/scripts/formatx-core-fracture3d-v11.js');
const kick = read('docs/scifi-ui/scripts/formatx-core-cinematic-kick-v11.js');
const voiceStability = read('docs/scifi-ui/scripts/organism-voice-stability.js');
const scrollBootstrap = read('docs/scifi-ui/scripts/formatx-infinite-scroll.js');
const seamlessScroll = read('docs/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js');
const scrollPolicy = JSON.parse(read('docs/scifi-ui/data/scroll-policy.json'));

assert.match(mapper, /ready-v36/);
assert.match(mapper, /formatx-core-mesh3d-material-v26\.js\?v=20260809-balanced-emissive-alpha-v26/);
assert.match(mapper, /reference-glass-v26-balanced-emissive-alpha/);
assert.match(mapper, /reference-balanced-emissive-alpha-v26/);
assert.match(mapper, /cinematic-balanced-emissive-alpha-v36/);
assert.doesNotMatch(mapper, /scrollTo\s*\(|scrollIntoView\s*\(|preventDefault\s*\(/);

assert.match(material, /vec2 cp=vec2\(vP\.x,vP\.y-\.18\)/);
assert.match(material, /float alphaBase=uAlpha\*\(\.27\+\.22\*fres\+\.036\*center\+\.033\*energy\)\+\.014\*fres/);
assert.match(material, /float emissiveAlpha=\.25\*web\+\.20\*axis\+\.16\*ridge\+\.13\*rings\+\.28\*node\+\.34\*spec\+\.11\*violet/);
assert.match(material, /float alpha=clamp\(alphaBase\+emissiveAlpha,\.032,\.94\)/);
assert.match(material, /fxCoreHighlightModel='balanced-emissive-alpha-network-v26'/);
assert.match(material, /fxCoreHighlightCoverage='reference-balanced-network-alpha-v26'/);
assert.match(material, /fxCoreMeshMaterial='reference-glass-v26'/);
assert.match(material, /fxCoreMeshMaterialPatch='applied-v26'/);
assert.match(material, /fxCoreMaterialCenter='object-space-y-minus-0\.18'/);
assert.doesNotMatch(material, /drawImage\s*\(|new Image\s*\(|background-image/i);

assert.match(grade, /brightness\(1\.98\)/);
assert.match(grade, /saturate\(1\.28\)/);
assert.match(grade, /opacity: 0\.68/);
assert.match(shape, /aPosition\.y\*\.72/);
assert.match(shape, /fxCoreShapeMesh='applied-v14'/);
assert.match(shape, /fxCoreShapeFracture='applied-v14'/);
assert.match(geometry, /value\*1\.15/);
assert.match(mesh, /getContext\('webgl2'/);
assert.match(mesh, /gl\.enable\(gl\.DEPTH_TEST\)/);
assert.match(mesh, /gl\.drawElements\(gl\.TRIANGLES/);
assert.match(fracture, /gl\.drawElements\(gl\.LINES/);
assert.match(kick, /formatx:organismresponse.*\.74,1\.15,2100/s);

assert.match(voiceStability, /function interfaceBlocked\(\)/);
assert.match(voiceStability, /function stopSpeech\(\)/);
assert.match(voiceStability, /visualViewport/);

assert.match(scrollBootstrap, /const BOOTSTRAP = 'platform-scroll-v2'/);
assert.match(scrollBootstrap, /mobile-seamless-loading-v1/);
assert.match(scrollBootstrap, /native-momentum-loop-v1/);
assert.match(scrollBootstrap, /root\.dataset\.fxAutomaticLoop = mobile \? 'pending-mobile' : 'desktop-only'/);
assert.doesNotMatch(scrollBootstrap, /scrollTo\s*\(|scrollIntoView\s*\(|cloneNode\s*\(|preventDefault\s*\(/);
assert.match(seamlessScroll, /const VERSION = 'seamless-v7'/);
assert.match(seamlessScroll, /root\.dataset\.fxInfiniteInput = 'native'/);
assert.match(seamlessScroll, /visualBridge: true/);
assert.match(seamlessScroll, /clonedHeroOnly: true/);
assert.match(seamlessScroll, /sourceHero\.cloneNode\(true\)/);
assert.match(seamlessScroll, /window\.scrollTo\(/);
assert.doesNotMatch(seamlessScroll, /addEventListener\(['"](?:wheel|touchmove)['"]/);

assert.equal(scrollPolicy.policy.input_capture, false);
assert.equal(scrollPolicy.policy.section_scroll_snap, false);
assert.equal(scrollPolicy.policy.native_wheel_touch, true);
assert.equal(scrollPolicy.mobile.controller, 'seamless-v7');
assert.equal(scrollPolicy.mobile.automatic_loop, true);
assert.equal(scrollPolicy.mobile.visual_bridge, true);
assert.equal(scrollPolicy.mobile.cloned_content, false);
assert.equal(scrollPolicy.mobile.cloned_hero_only, true);
assert.equal(scrollPolicy.mobile.boundary_handoff_only, true);
assert.equal(scrollPolicy.mobile.native_momentum_preserved, true);
assert.equal(scrollPolicy.mobile.finite_document, false);
assert.equal(scrollPolicy.desktop.controller, 'seamless-v7');
assert.equal(scrollPolicy.desktop.automatic_loop, true);
assert.equal(scrollPolicy.desktop.visual_bridge, true);

console.log('PASS: core visual calibration and dialogue stability remain intact with shared seamless-v7 scrolling and native mobile momentum.');

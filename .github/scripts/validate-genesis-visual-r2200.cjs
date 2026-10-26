'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
assert(source.includes('makeCinematicBiophotons(){'),'DNA and living-cell photon system must remain active');
assert(source.includes('makeEmbryoFilm(){'),'Real 3D organic nucleus must remain active');
assert(source.includes('makeGenomeParticles(){'),'DNA must physically morph into nucleus and MAG');
assert(source.includes('makeEmbryoTexture(){'),'R2200 requires procedural turquoise and coral cytoplasm on 3D cell');
assert(source.includes('this.embryoTexture=this.makeEmbryoTexture();'),'R2200 textured material must be physically connected');
assert(source.includes('[.00,.03,.55,.32,1.48]'),'R2200 desktop helix must fill the cinematic opening shot');
assert(source.includes('[.00,.06,.60,1.28,.95]'),'R2200 portrait helix must remain readable');
const native=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const delivery=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const edge=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const revision='formatx-mag-genesis-three-r1280.js?v=20261026-r2200-dna-cytoplasm-film';
assert(delivery.includes(revision),'R2200 WebGL source must bypass the old DNA/cell cinematic cache');
assert(edge.includes(revision),'Cloudflare must deliver R2200 rather than rewriting an older film');
for(const token of [
  'new T.DataTexture(pixels,width,height,T.RGBAFormat)',
  'color:0xe1f8f8,map:this.embryoTexture',
  'bumpMap:this.embryoTexture,bumpScale:.014',
  'this.embryoTexture.offset.x=time*.0000038;',
  'this.embryoTexture?.dispose?.();'
])assert(source.includes(token),'R2200 mobile/desktop biological membrane regression: '+token);
assert(native.includes("fxNativeMagVisualR2200='organic-coral-cytoplasm-retained-in-four-arm-titanium-optic'"),
  'Native permanent MAG does not share the cyan/coral bioluminescent nucleus');
assert(native.includes('float coralSite=pow(max(0.0,cellNoise-.67)*3.0,2.6);'),
  'Native four-arm MAG lost its coral micro-organic central eye');
console.log('R2200_REFERENCE_GENESIS_VISUAL_PASS');

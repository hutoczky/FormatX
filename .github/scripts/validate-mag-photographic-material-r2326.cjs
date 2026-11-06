/* FormatX R2326: the supplied silver MAG and turquoise/coral live
   nucleus must remain spatially tied to genuine WebGL body geometry.
   This static test complements, NEVER replaces, real Chromium pixels. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const mag=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
assert.match(mag,/float microBevel=exp\(-pow\(\(panelEdge\.y-\.125\)/);
assert.match(mag,/float grazingMachining=microBevel/);
assert.match(mag,/studioSilver\+=vec3\(\.32,\.40,\.44\)\*grazingMachining\*\.24/);
assert.match(mag,/float warmStroma=coralNest/);
assert.match(mag,/float cellRefraction=innerMembrane\*bioticFilament/);
assert.match(mag,/fxNativeMagStudioR2326='single-pass-reflection-coupled-titanium-microbevel-living-coral-stroma-refracted-iris'/);
assert.doesNotMatch(mag,/R2326.*createElement\(['"]canvas/);
console.log('R2326_GENUINE_WEBGL_MAG_MATERIAL_CONTRACT_PASS');

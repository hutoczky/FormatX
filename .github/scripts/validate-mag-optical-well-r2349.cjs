'use strict';
/* R2349: protect the original physically curved WebGL MAG iris.
   Full real Chromium pixels and cold-start checks remain the release gate. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const start=src.indexOf('        float opticalGlass=step(6.0,vFacet);');
const end=src.indexOf('        /* Interaction/surface sweep remains physical and brief. */',start);
assert(start>0&&end>start,'Missing the real curved 3D glass fragment shader');
const lens=src.slice(start,end);
assert.match(lens,/if\(opticalGlass>\.5\)\{/,'Optical shading must remain inside existing glass facets');
for(const token of [
 'float opticalWell=pow(lensHeart,3.0)*(1.0-.20*coralOrganelles);',
 'lensColor*=1.0-.29*opticalWell;',
 'float mineralCaustic=lensCaustic*(.26+.74*softboxC)*',
 'lensColor+=vec3(.35,.45,.49)*mineralCaustic*.25;',
 'lensColor+=vec3(.22,.32,.35)*outerMembrane*softboxB*.16;',
 'lensColor+=vec3(.10,.24,.29)*lensKey*cellRefraction*.14;',
 'float innerMembrane=',
 'float outerMembrane=',
 'float cellRefraction=',
 'c=lensColor;'
])assert(lens.includes(token),'R2349 optical depth lost: '+token);
assert(lens.indexOf('float opticalWell=')>lens.indexOf('float cellRefraction='),
 'R2349 must reuse existing biological refraction, not add a new render source');
assert(lens.indexOf('float mineralCaustic=')<lens.indexOf('c=lensColor;'),
 'Photographic caustics must shade the original glass, not the page');
assert(!/texture2D\s*\(|texture\s*\(|sampler2D|samplerCube|discard\s*;/.test(
 lens.slice(lens.indexOf('/* R2349:'),lens.indexOf('c=lensColor;'))),
 'R2349 may not introduce another texture sample or discard inside the optic');
assert.match(src,/fxNativeMagOpticalWellR2349='recessed-mineral-caustic-and-biological-curved-glass-single-pass'/);
assert.match(src,/const fragmentSource = constrainedFragmentSource;/,
 'Mobile and desktop must retain the one native physical shader');
const oldPart=src.slice(0,start);
assert(oldPart.includes('float panelEnvelope=')&&oldPart.includes('float machinedArmor='),
 'Four-arm machined silver geometry/material ownership was removed');
console.log('MAG_R2349_PHYSICAL_OPTICAL_WELL_SOURCE_PASS',
 JSON.stringify({oneCurvedGlassShader:true,noNewTextureSamples:true,
  originalBiologicalMembranes:true,referenceVisualProofRequired:true}));

/* R2328 real DNA biopolymer and biological ovum-to-MAG continuation. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const find=(token)=>assert(source.includes(token),'R2328 missing: '+token);
find('const T=this.THREE,size=128;');
assert.equal(source.split('bumpMap:phosphateTexture,bumpScale:this.mobileRender?.011:.015,').length-1,2);
find('color:0x408e92,emissive:0x1c656c,emissiveIntensity:.31');
find('metalness:.015,roughness:.32,transmission:.24,thickness:.23,ior:1.36');
find('const bodyScale=.001+.63*grow*mix(fade,.86,handoffCortex);');
find('const handoffCortex=smooth((t-7.28)/1.43);');
find('const opticWake=smooth((t-7.44)/.78);');
console.log('R2328_REAL_DNA_BIOPOLYMER_CELL_CORTEX_CONTINUITY_PASS');

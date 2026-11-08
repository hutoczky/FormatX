/* R2328 real DNA biopolymer and biological ovum-to-MAG continuation. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const find=(token)=>assert(source.includes(token),'R2328 missing: '+token);
find('const T=this.THREE,size=128;');
find('texture.repeat.set(4,2);');
find('fxGenesisSatinMacroR2341=');
// R2337 retains the SAME 128px shared texture and two genuine physical 3D backbones.
assert.equal(source.split('bumpMap:phosphateTexture,bumpScale:this.mobileRender?.023:.031,').length-1,2);
for(const required of [
  'color:0x6683b0,emissive:0x18364f,emissiveIntensity:.37,',
  'roughness:.51,metalness:.025,transparent:true,opacity:.97,',
  'depthWrite:false,clearcoat:.30,clearcoatRoughness:.42',
  'color:0x8974ac,emissive:0x422f65,emissiveIntensity:.37,',
  'roughness:.53,metalness:.025,transparent:true,opacity:.97,',
  'depthWrite:false,clearcoat:.29,clearcoatRoughness:.44',
  "fxGenesisBiopolymerR2337="
])find(required);
assert.equal(source.split('const phosphateTexture=this.makeDNAFiberTexture();').length-1,1,
  'R2337 must generate only the original shared phosphate bump map');
// R2331 retained the R2328 DNA/film contract and upgraded the REAL tissue organelle.
find('color:0xd6eeed,map:this.embryoTexture,');
find('emissive:0x256c71,emissiveMap:this.embryoTexture,emissiveIntensity:.42,');
find('metalness:.012,roughness:.44,transmission:.13,thickness:.17,ior:1.35');
find('const bodyScale=.001+.63*grow*mix(fade,.86,handoffCortex);');
find('const handoffCortex=smooth((t-7.28)/1.43);');
find('const opticWake=smooth((t-7.44)/.78);');
console.log('R2328_REAL_DNA_BIOPOLYMER_CELL_CORTEX_CONTINUITY_PASS');

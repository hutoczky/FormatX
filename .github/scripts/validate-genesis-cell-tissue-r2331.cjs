/* R2331 genuine hydrated 3D biological nucleus: one shared
   existing cytoplasmic texture, no extra canvas or particle budget. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
for(const token of [
  'color:0xd6eeed,map:this.embryoTexture,',
  'bumpMap:this.embryoTexture,bumpScale:.012,',
  'emissive:0x256c71,emissiveMap:this.embryoTexture,emissiveIntensity:.42,',
  'new T.SphereGeometry(.22,32,24),this.embryoNucleusMaterial',
  'this.embryoNucleus.position.set(-.10,.06,.28);',
  'clearcoat:.12,clearcoatRoughness:.49,',
  'this.embryoVesicleMaterial.opacity=.37*visible;',
  'shared-photobiological-cyan-coral-3d-organelle-satin-vesicles',
  "fxGenesisCellMicroR2342=",
  'this.mobileRender?.014:.018,1',
  'roughness:.79',
  'this.embryoChromatinMaterial.opacity=(this.mobileRender?.075:.105)*visible;',
  'this.embryoCapillaryMaterial.opacity=.055*visible;'
])assert.ok(src.includes(token),'R2331 missing genuine 3D tissue '+token);
assert.match(src,/this\.embryoTexture=this\.makeEmbryoTexture\(\);/);
assert.match(src,/const vesicles=new T\.InstancedMesh\(/);
assert.match(src,/const vesicleCount=this\.mobileRender\?42:84/);
// The ten-second film clock is owned by R533, never by R1280.
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
assert.match(birth,/const DURATION = 10000/);
console.log('R2331_PHOTOBIOLOGICAL_3D_CELL_SHARED_TEXTURE_PASS');

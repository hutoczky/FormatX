'use strict';
/* R2361: execute actual authored silver material and 3D bevel configs.
 * Supplemental source guard; original Chromium + device + 3x LHR remain gates.
 * No part of the failed R2360 large-plate tessellation may be present. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
function options(name){
  const anchor='const '+name+'=new T.ExtrudeGeometry(';
  const at=s.indexOf(anchor);
  assert(at>=0,name+' original 3D geometry missing');
  const start=s.indexOf('{',at+anchor.length);
  const end=s.indexOf('});',start);
  assert(start>=0&&end>start&&end-start<500,name+' bevel constructor invalid');
  return new Function('return ('+s.slice(start,end+1)+')')();
}
const expected=[
 ['topPlateGeo',.033,.053,.14],
 ['sideGeo',.028,.046,.14],
 ['lowerGeo',.027,.046,.15]
];
for(const [name,size,thickness,depth] of expected){
  const p=options(name);
  assert.equal(p.bevelEnabled,true,name+' must have real 3D edge bevels');
  assert.equal(p.bevelSize,size,name+' bevel radius');
  assert.equal(p.bevelThickness,thickness,name+' bevel height');
  assert.equal(p.depth,depth,name+' physical body depth');
  assert.equal(p.bevelSegments,3,name+' keep original low-poly mobile budget');
  assert.equal(p.curveSegments,8,name+' keep unchanged original face topology');
}
const anchor='this.silverMaterial=new T.MeshPhysicalMaterial({';
const begin=s.indexOf(anchor),end=s.indexOf('});',begin);
assert(begin>=0&&end>begin&&end-begin<1000,'Original PBR silver material missing');
const ctor=s.slice(begin,end+3);
class Material{constructor(opts){Object.assign(this,opts);}}
for(const mobileRender of [true,false]){
  const owner={mobileRender,microFiberTexture:{original:true}};
  const mat=new Function('T',ctor+'\nreturn this.silverMaterial;').call(owner,{
    Color:class{constructor(c){this.color=c}},
    MeshPhysicalMaterial:Material
  });
  assert.equal(Object.hasOwn(mat,'anisotropy'),false,
    'Keep original isotropic physical shader: anisotropy created checker tiles');
  assert.equal(Object.hasOwn(mat,'anisotropyRotation'),false);
  assert.equal(mat.bumpScale,.004,'Original fine 3D texture must remain');
  assert.strictEqual(mat.bumpMap,owner.microFiberTexture);
  assert.equal(mat.clearcoat,1);
  assert.equal(mat.metalness,.78);
  assert.equal(mat.roughness,.16);
  console.log('MAG_R2361B_ISOTROPIC_PBR_SILVER_MATERIAL_PASS',JSON.stringify({
    mobileRender,existingTextureOnly:true,noExtraShaderPermutation:true
  }));
}
for(const token of [
 'this.sculptMachinedChassisR2359(baseGeo);',
 'this.mechBody=new T.Mesh(baseGeo,this.mechMaterial);',
 'const crownL=new T.Mesh(topPlateGeo,this.silverMaterial);',
 'const crownR=new T.Mesh(topPlateGeo,this.silverMaterial);',
 'const left=new T.Mesh(sideGeo,this.silverMaterial);',
 'const right=new T.Mesh(sideGeo,this.silverMaterial);',
 'this.jaw=new T.Mesh(lowerGeo,this.mechMaterial);',
 'this.updateDNA(t,time);',
 'this.updateOrganic(t,time);',
 'this.updateMechanical(t,time);'
])assert(s.includes(token),'Original real 3D MAG or genesis contract lost: '+token);
assert(!s.includes("sculptMachinedChassisR2359(topPlateGeo,'plate')"));
assert(!s.includes("sculptMachinedChassisR2359(sideGeo,'plate')"));
assert(!s.includes("sculptMachinedChassisR2359(lowerGeo,'plate')"));
console.log('MAG_R2361_ORIGINAL_5_ARMOR_MESHES_BEVEL_ONLY_PASS',
 JSON.stringify({distinctGeometryProfiles:expected.length,extraFrontSubdivision:0,
  originalChassisAndDNA:true,requiresRealChromiumAndPerformanceEvidence:true}));

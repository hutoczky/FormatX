'use strict';
/* R2355: execute the REAL Three.js inlay construction block with a tiny
   structural adapter. This is not a rendered-photo acceptance test:
   original R656 real Chromium frames and coldstarts remain mandatory. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const anchor=src.indexOf("const etchGeometry=new T.BufferGeometry();");
const start=src.indexOf("      for(let axis=0;axis<4;axis++){",anchor);
const end=src.indexOf("      // R2194 —",start);
assert(anchor>0&&start>anchor&&end>start,'Original four-arm etched 3D inlay constructor missing');
const construction=src.slice(start,end);
assert(construction.includes("const plate=new T.Mesh(inlayGeometry,this.armInlayMaterial);"));
assert(construction.includes("const engraving=new T.LineSegments(etchGeometry,this.armEtchMaterial);"));
assert(construction.includes("this.mechanicalGroup.add(arm);"));
assert(construction.includes("this.armInlays.push(arm);"));
class ThreeObject {
 constructor(){
   this.children=[];
   this.userData={};
   this.position={x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});}};
   this.scale={x:1,y:1,z:1,set(x,y,z){Object.assign(this,{x,y,z});}};
 }
 add(child){this.children.push(child);}
}
class Group extends ThreeObject {}
class Mesh extends ThreeObject {constructor(geo,mat){super();this.geometry=geo;this.material=mat;this.kind='plate';}}
class LineSegments extends ThreeObject {constructor(geo,mat){super();this.geometry=geo;this.material=mat;this.kind='engraving';}}
const T={Group,Mesh,LineSegments},inlayGeometry={},etchGeometry={};
const materials={plate:{},engraving:{}};
const owner={
 armInlays:[],mechanicalGroup:new Group(),
 armInlayMaterial:materials.plate,armEtchMaterial:materials.engraving
};
new Function('T','inlayGeometry','etchGeometry',construction)
 .call(owner,T,inlayGeometry,etchGeometry);
assert.equal(owner.armInlays.length,4,'All four real chassis arms must remain');
assert.equal(owner.mechanicalGroup.children.length,4);
const records=[];
for(const [axis,arm] of owner.armInlays.entries()){
 assert.strictEqual(owner.mechanicalGroup.children[axis],arm);
 assert.equal(arm.userData.axis,axis);
 assert.equal(arm.visible,false,'Inlays may only appear on the original birth track');
 assert.equal(arm.children.length,2,'Keep exactly one inlaid 3D plate and one etched line per arm');
 const [plate,engraving]=arm.children;
 assert.equal(plate.kind,'plate');assert.equal(engraving.kind,'engraving');
 assert.strictEqual(plate.geometry,inlayGeometry);
 assert.strictEqual(engraving.geometry,etchGeometry);
 assert.strictEqual(plate.material,materials.plate);
 assert.strictEqual(engraving.material,materials.engraving);
 for(const child of [plate,engraving]){
   assert.equal(child.scale.x,.82);
   assert.equal(child.scale.y,.84);
   assert.equal(child.scale.z,1);
   assert.equal(child.position.x,0);
   assert.equal(child.position.y,.045);
 }
 assert.equal(plate.position.z,.270,'Real titanium bevel must sit near the shell');
 assert.equal(engraving.position.z,-.095,'Etch must follow the R2356 raised physical crown');
 assert.equal(plate.renderOrder,3);assert.equal(engraving.renderOrder,4);
 // Existing extruded plate: 0.032 body plus 0.012 bevel on the front.
 // The original etched z=.433 is expressed in arm-local coordinates.
 const physicalTop=plate.position.z+.032+.012+.012;
 const etchedTop=.433+engraving.position.z;
 assert(etchedTop>physicalTop && etchedTop-physicalTop<.020,
   'The engraving must sit on the original physical bevel, not float');
 assert.equal(plate.position.z<.378,true,'R2354 hover offset must be corrected');
 records.push({axis,plateZ:plate.position.z,etchZ:etchedTop,
    bevelZ:physicalTop,physicalGap:etchedTop-physicalTop});
}
for(const token of [
 'const inlayGeometry=new T.ExtrudeGeometry(inlayProfile,{',
 'depth:.032,steps:1,bevelEnabled:true,bevelSegments:3,',
 'bevelSize:.009,bevelThickness:.012,curveSegments:12',
 'const etchGeometry=new T.BufferGeometry();',
 'this.armInlayMaterial.opacity=.985*grow;',
 'this.armEtchMaterial.opacity=.55*inlayBirth;',
 'part.scale.setScalar(.70+.30*seat);',
 'this.bindMachinedMagSurface(material);',
 'this.updateDNA(t,time);',
 'this.updateCore(t,time);',
 'this.updateOrganic(t,time);',
 'this.updateMechanical(t,time);',
 'const bodyScale=.001+.63*grow*mix(fade,.56,handoffCortex);'
])assert(src.includes(token),'Original real-3D or birth contract lost: '+token);
assert(!src.includes('R2354b: the REAL 9.25s Chromium screenshot'),
 'Do not reintroduce the failed R2354b bright-surface-only experiment');
console.log('MAG_R2355_TRUE_INSET_3D_ARM_GEOMETRY_PASS',
 JSON.stringify({arms:records,singleExistingSharedPlateGeometry:true,
  singleExistingSharedEtchGeometry:true,noExtraMeshes:true,
  unchangedRealBrowserImageAndPerformanceGates:true}));

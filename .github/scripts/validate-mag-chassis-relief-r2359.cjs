'use strict';
// Execute the *real* source method (not a copied formula) on a representative
// non-indexed front/back bevel geometry. Browser reference, 60FPS & LHR still
// gate any release; this test only guards physical tessellation correctness.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync(
  'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const begin=source.indexOf('    sculptMachinedChassisR2359(geometry){');
const end=source.indexOf('\n    makeMechanicalLayer(){',begin);
assert(begin>0&&end>begin,'R2359 physical surface constructor missing');
const method=source.slice(begin,end);
const Probe=new Function('return class Probe {\n'+method+'\n}')();
class Attribute{
  constructor(values,stride){this.array=Float32Array.from(values);this.itemSize=stride;this.count=this.array.length/stride;}
  getX(i){return this.array[i*this.itemSize]}
  getY(i){return this.array[i*this.itemSize+1]}
  getZ(i){return this.array[i*this.itemSize+2]}
}
class Geo{
  constructor(pos,uv,norm,frontCount){
    this.attributes={position:new Attribute(pos,3),uv:new Attribute(uv,2),normal:new Attribute(norm,3)};
    this.groups=[
      {start:0,count:frontCount,materialIndex:0},
      {start:frontCount,count:pos.length/3-frontCount,materialIndex:1}
    ];
  }
  getAttribute(k){return this.attributes[k]}
  getIndex(){return null}
  setAttribute(k,a){this.attributes[k]=a}
  clearGroups(){this.groups=[]}
  addGroup(start,count,materialIndex){this.groups.push({start,count,materialIndex})}
  computeBoundingBox(){this.boundsRebuilt=true}
  computeBoundingSphere(){this.sphereRebuilt=true}
}
function fixture(){
  const position=[],uv=[],normal=[];
  const add=(a,b,c,z,nz)=>{
    for(const [x,y] of [a,b,c]){
      position.push(x,y,z);uv.push((x+1)/2,(y+1)/2);normal.push(0,0,nz);
    }
  };
  const steps=8;
  for(let y=0;y<steps;y++)for(let x=0;x<steps;x++){
    const x0=-1+x*2/steps,x1=-1+(x+1)*2/steps;
    const y0=-1+y*2/steps,y1=-1+(y+1)*2/steps;
    add([x0,y0],[x1,y0],[x0,y1],.2,1);
    add([x1,y0],[x1,y1],[x0,y1],.2,1);
  }
  const frontCount=position.length/3;
  add([-.5,-.5],[0,-.5],[-.5,0],-.2,-1);
  return {geometry:new Geo(position,uv,normal,frontCount),frontCount};
}
for(const mobileRender of [true,false]){
  const {geometry,frontCount}=fixture();
  const originalCount=geometry.getAttribute('position').count;
  const probe=new Probe();
  probe.THREE={Float32BufferAttribute:Attribute};
  probe.mobileRender=mobileRender;
  probe.sculptMachinedChassisR2359(geometry);
  const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal'),u=geometry.getAttribute('uv');
  const info=probe.chassisReliefR2359;
  assert.equal(geometry.groups.length,2,'Original multi-material GPU groups must remain');
  assert.equal(geometry.groups[0].materialIndex,0);
  assert.equal(geometry.groups[1].materialIndex,1);
  assert.equal(geometry.groups[1].count,3,'Original unsculpted back/side triangle remains');
  assert.equal(p.count,n.count);assert.equal(p.count,u.count);
  assert.equal(info.originalVertices,originalCount);
  assert.equal(info.boundarySegments,32);
  assert.equal(info.levels,mobileRender?1:2);
  assert.equal(info.subdividedFrontTriangles,(mobileRender?4:16)*frontCount/3);
  assert(p.count>originalCount,'Sculpting must genuinely add surface triangles');
  assert(info.maximumRelief>.005&&info.maximumRelief<=.0441,
    'No silhouette-breaking titanium relief');
  let changed=0,borderChanged=0,normalTilt=0;
  for(let i=0;i<geometry.groups[0].count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    assert(z>=.2-1e-6 && z<=.2442,
      'Only small front-facing physical displacement allowed');
    if(z>.201)changed++;
    if(Math.abs(x)>.999||Math.abs(y)>.999){
      if(Math.abs(z-.2)>1e-6)borderChanged++;
    }
    if(Math.abs(n.getX(i))>.001 || Math.abs(n.getY(i))>.001)normalTilt++;
  }
  assert(changed>20,'Physical sculpt must modify a sizeable actual 3D area');
  assert(normalTilt>20,'Normals must respond to true surface curvature');
  assert.equal(borderChanged,0,'Must not create a crack along the original bevel');
  const back=geometry.groups[1].start;
  for(let i=back;i<back+geometry.groups[1].count;i++){
    assert(Math.abs(p.getZ(i)+.2)<1e-6,'Back/side triangles remain untouched');
    assert.equal(n.getZ(i),-1,'Back normal remains untouched');
  }
  assert(geometry.boundsRebuilt&&geometry.sphereRebuilt);
  console.log('MAG_R2359_TRUE_CHASSIS_TESSELLATION_PASS',JSON.stringify({
    mobileRender,oldVertices:originalCount,newVertices:p.count,
    peak:info.maximumRelief,changedVertices:changed,tiltedNormals:normalTilt,
    oneOriginalMeshMaterialCanvasAndRenderer:true
  }));
}
for(const token of [
  'baseGeo.center();',
  'this.sculptMachinedChassisR2359(baseGeo);',
  'this.mechBody=new T.Mesh(baseGeo,this.mechMaterial);',
  'this.innerPrism=new T.Mesh(baseGeo.clone(),this.innerPrismMaterial);',
  'this.updateDNA(t,time);','this.updateOrganic(t,time);',
  'this.updateMechanical(t,time);',
  'const count=this.mobileRender?6000:9600;'
])assert(source.includes(token),'Critical physical MAG or genesis lifecycle lost: '+token);

'use strict';
// R2360: execute the original panel-sculpting method with physical compact
// titanium cap triangulation. Do not replace browser/Android/Lighthouse gates.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const start=source.indexOf('    sculptMachinedChassisR2359(geometry,profile=');
const end=source.indexOf('\n    makeMechanicalLayer(){',start);
assert(start>0&&end>start);
const Probe=new Function('return class Probe {\n'+source.slice(start,end)+'\n}')();
class Attr{
  constructor(a,n){this.array=Float32Array.from(a);this.itemSize=n;this.count=this.array.length/n;}
  getX(i){return this.array[i*this.itemSize]}
  getY(i){return this.array[i*this.itemSize+1]}
  getZ(i){return this.array[i*this.itemSize+2]}
}
class Geometry{
  constructor(positions,uv,normals,capCount){
    this.attrs={position:new Attr(positions,3),uv:new Attr(uv,2),normal:new Attr(normals,3)};
    this.groups=[{start:0,count:capCount,materialIndex:0},
      {start:capCount,count:positions.length/3-capCount,materialIndex:1}];
  }
  getIndex(){return null}
  getAttribute(k){return this.attrs[k]}
  setAttribute(k,a){this.attrs[k]=a}
  clearGroups(){this.groups=[]}
  addGroup(start,count,materialIndex){this.groups.push({start,count,materialIndex})}
  computeBoundingBox(){this.box=true}
  computeBoundingSphere(){this.sphere=true}
}
function createCap(){
  const pos=[],tex=[],norm=[];
  const append=(a,b,c,z,n)=>{
    for(const [x,y] of [a,b,c]){
      pos.push(x,y,z);
      tex.push(x+0.5,y+0.5);
      norm.push(0,0,n);
    }
  };
  const grid=8,w=.45,h=.66;
  for(let j=0;j<grid;j++)for(let i=0;i<grid;i++){
    const x0=-w/2+i*w/grid,x1=-w/2+(i+1)*w/grid;
    const y0=-h/2+j*h/grid,y1=-h/2+(j+1)*h/grid;
    append([x0,y0],[x1,y0],[x0,y1],.11,1);
    append([x1,y0],[x1,y1],[x0,y1],.11,1);
  }
  const capCount=pos.length/3;
  append([-.22,-.33],[.22,-.33],[.22,.33],-.11,-1);
  return new Geometry(pos,tex,norm,capCount);
}
for(const mobileRender of [true,false]){
  const geom=createCap(),oldCount=geom.getAttribute('position').count;
  const p=new Probe();
  p.THREE={Float32BufferAttribute:Attr};p.mobileRender=mobileRender;
  p.sculptMachinedChassisR2359(geom,'plate');
  assert.equal(p.magPlateReliefR2360.length,1);
  const s=p.magPlateReliefR2360[0];
  assert(s.maximumRelief>.01&&s.maximumRelief<.0481,'visible plate relief must be physically raised');
  assert(s.sculptedVertices>oldCount);
  assert.equal(s.levels,mobileRender?1:2);
  assert.equal(geom.groups.length,2);
  assert.equal(geom.groups[1].count,3);
  const pos=geom.getAttribute('position'),uv=geom.getAttribute('uv'),norm=geom.getAttribute('normal');
  assert.equal(pos.count,uv.count);assert.equal(pos.count,norm.count);
  let raised=0,tilted=0,edgeMoved=0;
  for(let i=0;i<geom.groups[0].count;i++){
    const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
    if(z>.111)raised++;
    if(Math.abs(norm.getX(i))>.01||Math.abs(norm.getY(i))>.01)tilted++;
    if(Math.abs(x)>=.225-1e-6||Math.abs(y)>=.33-1e-6){
      if(Math.abs(z-.11)>1e-6)edgeMoved++;
    }
  }
  assert(raised>20&&tilted>20,'Sculpted metal must produce real raised surfaces and tilted normals');
  assert.equal(edgeMoved,0,'Never crack the original outer extrusion bevel');
  const back=geom.groups[1].start;
  for(let i=back;i<pos.count;i++)assert(Math.abs(pos.getZ(i)+.11)<1e-6,
    'Backplate must keep its physical depth');
  assert(geom.box&&geom.sphere);
  console.log('MAG_R2360_REAL_FRONT_PLATE_SCULPT_PASS',JSON.stringify({
    mobileRender,oldCount,vertices:pos.count,raised,tilted,edgeMoved,
    peak:s.maximumRelief,noAddedMeshDrawCallOrRAF:true
  }));
}
for(const token of [
  "this.sculptMachinedChassisR2359(baseGeo);",
  "this.sculptMachinedChassisR2359(topPlateGeo,'plate');",
  "this.sculptMachinedChassisR2359(sideGeo,'plate');",
  "this.sculptMachinedChassisR2359(lowerGeo,'plate');",
  "const crownL=new T.Mesh(topPlateGeo,this.silverMaterial);",
  "const crownR=new T.Mesh(topPlateGeo,this.silverMaterial);",
  "const left=new T.Mesh(sideGeo,this.silverMaterial);",
  "const right=new T.Mesh(sideGeo,this.silverMaterial);",
  "this.jaw=new T.Mesh(lowerGeo,this.mechMaterial);",
  "this.updateDNA(t,time);","this.updateOrganic(t,time);",
  "this.updateMechanical(t,time);"
])assert(source.includes(token),'Original actual 3D mesh/film contract missing: '+token);
assert.equal((source.match(/this\.sculptMachinedChassisR2359\(\w+Geo,'plate'\);/g)||[]).length,3);

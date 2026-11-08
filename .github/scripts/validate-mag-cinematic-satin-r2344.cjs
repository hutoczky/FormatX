'use strict';
// R2344 source-executed optical material proof. This is NOT visual acceptance.
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const begin=src.indexOf('      // R2344: machined neutral silver');
const end=src.indexOf('      this.mechMaterial.opacity=',begin);
assert(begin>0&&end>begin,'Missing actual continuous material update');
const update=vm.runInNewContext('(function(finale,mix){'+src.slice(begin,end)+'})');
const make=()=>({color:{setRGB(r,g,b){this.values=[r,g,b];}}});
const materialNames=['mechMaterial','mechMidMaterial','silverMaterial'];
const snapshots=[];
for(const finale of [0,.25,.5,.75,1]){
 const engine={mechMaterial:make(),mechMidMaterial:make(),silverMaterial:make()};
 update.call(engine,finale,(a,b,t)=>a+(b-a)*t);
 const frame={finale};
 for(const name of materialNames){
  const m=engine[name];
  assert(m.color.values.every(v=>Number.isFinite(v)&&v>=0&&v<.80));
  assert(Number.isFinite(m.metalness)&&Number.isFinite(m.roughness)&&Number.isFinite(m.transmission));
  assert(m.transmission>=0&&m.transmission<.10,'Titanium body is too transparent');
  assert(m.metalness>=.4&&m.metalness<=.8);
  assert(m.roughness>.15&&m.roughness<.25);
  frame[name]={color:m.color.values,metalness:m.metalness,roughness:m.roughness,transmission:m.transmission};
 }
 snapshots.push(frame);
}
for(const name of materialNames){
 for(let i=1;i<snapshots.length;i++){
  const a=snapshots[i-1][name],b=snapshots[i][name];
  assert(b.color.every((v,j)=>v>=a.color[j]),'Non-monotonic silver transition '+name);
  assert(b.transmission<=a.transmission,'Metal increasingly turns to glass '+name);
 }
}
assert.deepEqual(snapshots[0].mechMaterial.color,[.135,.155,.173]);
assert.deepEqual(snapshots[4].mechMaterial.color,[.265,.282,.302]);
assert.deepEqual(snapshots[4].mechMidMaterial.color,[.294,.314,.337]);
assert.deepEqual(snapshots[4].silverMaterial.color,[.620,.680,.705]);
assert.equal((src.match(/this\.mechMaterial=new T\.MeshPhysicalMaterial/g)||[]).length,1);
assert.equal((src.match(/this\.mechMidMaterial=new T\.MeshPhysicalMaterial/g)||[]).length,1);
assert.equal((src.match(/this\.silverMaterial=new T\.MeshPhysicalMaterial/g)||[]).length,1);
console.log('MAG_R2344_REAL_CINEMATIC_SATIN_TRANSITION_SOURCE_PASS',JSON.stringify({frames:snapshots.length,oneExistingPhysicalMaterialPerLayer:true,hardwareVisualApproval:false}));

'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('  function filamentTubeGeometry('),b=s.indexOf('  class MAGScene',a);
const {filamentTubeGeometry,filamentPose,filamentStrandOffset}=new Function(s.slice(a,b)+'return {filamentTubeGeometry,filamentPose,filamentStrandOffset};')();
const tube=filamentTubeGeometry();
assert.equal(tube.length/24,32);
assert.equal(tube.byteLength,3072);
for(let i=0;i<tube.length;i+=8){
 assert.ok(Math.abs(Math.hypot(...tube.slice(i+3,i+6))-1)<1e-6);
 assert.ok(Math.hypot(tube[i],tube[i+1])<=.500001);
}
for(let i=0;i<tube.length;i+=24){
 const a=Array.from(tube.slice(i,i+3)),b=Array.from(tube.slice(i+8,i+11)),c=Array.from(tube.slice(i+16,i+19));
 const u=b.map((v,j)=>v-a[j]),v=c.map((v,j)=>v-a[j]);
 const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
 assert.ok(Math.hypot(...cross)>0);
 assert.ok(cross.reduce((sum,v,j)=>sum+v*tube[i+3+j],0)>0,'outward winding');
}
assert.equal(filamentStrandOffset(0,1),0);
assert.deepEqual([0,1,2].map(i=>filamentStrandOffset(i,3)),[-.073,0,.073]);
let count=0;
for(let i=0;i<=2000;i++){
 const a=i/2000*2*Math.PI,prev=[.2,-.1,.3],delta=[Math.cos(a),Math.sin(a*.7)*.8,Math.sin(a)],point=prev.map((v,j)=>v+delta[j]);
 const pose=filamentPose(prev,point,.010),d=Math.hypot(...delta);
 const direction=[Math.sin(pose.rotation)*Math.cos(pose.tilt),-Math.sin(pose.tilt),Math.cos(pose.rotation)*Math.cos(pose.tilt)];
 for(let j=0;j<3;j++){
   assert.ok(Math.abs(direction[j]-delta[j]/d)<1e-10);
   assert.ok(Math.abs(pose.midpoint[j]-(prev[j]+point[j])*.5)<1e-10);
 }
 assert.ok(pose.length>=d&&pose.length<=d+.00600001);
 count++;
}
assert.ok(s.includes('this.mesh(this.filament,pose.midpoint'));
assert.ok(s.includes('gl.deleteBuffer(this.filament.buffer);'));
console.log('R2336 optical conduit geometry, centered strand and axis alignment: PASS '+count);

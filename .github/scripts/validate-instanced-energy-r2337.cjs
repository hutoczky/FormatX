'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('    packFilament('),b=s.indexOf('    render(frame){',a);
const methods=new Function('return ({'+s.slice(a,b).replace('    drawFilaments(count,hue,cam){','    ,drawFilaments(count,hue,cam){')+'})')();
const calls=[];
const ctx={filamentPositions:new Float32Array(72),filamentTransforms:new Float32Array(72),filament:{count:96},
 uniform:{'uFilamentPositions[0]':1,'uFilamentTransforms[0]':2},
 gl:{uniform4fv:(id,v)=>calls.push([id,Array.from(v)])},
 mesh:(...args)=>calls.push(args)};
for(let i=0;i<18;i++){
 const pose={midpoint:[i*.125,-i*.25,i*.5],length:.25+i*.125,rotation:i*.125,tilt:-i*.0625};
 methods.packFilament.call(ctx,i,pose,.015625,.5);
 assert.deepEqual(Array.from(ctx.filamentPositions.slice(i*4,i*4+4),x=>x||0),[...pose.midpoint.map(x=>x||0),.5].map(x=>x||0));
 assert.deepEqual(Array.from(ctx.filamentTransforms.slice(i*4,i*4+4),x=>x||0),[.015625,pose.length,pose.rotation,pose.tilt].map(x=>x||0));
}
for(const count of [2,3,4,18]){
 calls.length=0;methods.drawFilaments.call(ctx,count,[.2,.3,.4],[0,0,0]);
 assert.equal(calls.length,3);assert.equal(calls[2].at(-1),count);
 assert.equal(calls[2].at(-2),96);
}
assert.ok(s.includes('uFilamentPositions[gl_InstanceID]'));
assert.ok(s.includes('flat in float vInstanceOpacity;'));
assert.ok(s.includes('clamp(a*vInstanceOpacity,0.0,1.0)'));
assert.ok(s.includes("this.scalar('uInstanced',instances>0?1:0);"));
assert.ok(s.includes('gl.drawArraysInstanced(gl.TRIANGLES,0,vertexCount,instances)'));
assert.ok(s.includes('segments*strands<=18'));
console.log('R2337 instanced filament uploads and draw counts: PASS');

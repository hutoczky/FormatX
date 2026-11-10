'use strict';
/* R2356: execute the actual 3D shared titanium-crown vertex deformation,
   not a standalone copy of its formula. P0 Chromium pixels are still required. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const start=src.indexOf("      const crownPosR2356=inlayGeometry.getAttribute('position');");
const end=src.indexOf('      const etchGeometry=new T.BufferGeometry();',start);
assert(start>0&&end>start,'Actual R2356 physical inlay surface block absent');
const block=src.slice(start,end);
for(const key of [
 "inlayGeometry.getAttribute('position')",
 'if(cz<=.016)continue;',
 'const cross=Math.max(0,1-Math.pow(Math.min(1,Math.abs(cx)/.10),2));',
 'const axial=Math.max(0,Math.sin(Math.PI*Math.max(0,',
 'const crown=.012*cross*axial;',
 'crownPosR2356.setZ(k,cz+crown);',
 'crownPosR2356.needsUpdate=true;',
 'inlayGeometry.computeVertexNormals();',
 'inlayGeometry.computeBoundingSphere();'
])assert(block.includes(key),'Physical R2356 crown surface lost: '+key);
const base=[
 [0,.55,.044], [.07,.55,.044], [.14,.55,.044],
 [0,.2,.044], [0,.9,.044], [0,.55,0],
 [.05,.51,.032],[-.05,.64,.026],
 [.12,.3,.018],[-.12,.78,.019]
];
const points=base.map(p=>[...p]);let normals=0,bounds=0;
const pos={
 count:points.length,
 getX(i){return points[i][0]},
 getY(i){return points[i][1]},
 getZ(i){return points[i][2]},
 setZ(i,z){points[i][2]=z;}
};
const mesh={getAttribute(name){assert.equal(name,'position');return pos;},
 computeVertexNormals(){normals++},
 computeBoundingSphere(){bounds++}};
new Function('inlayGeometry',block)(mesh);
assert.equal(pos.count,base.length,'The original topology/vertex count must not change');
assert.equal(normals,1,'Surface normal recomputation must happen once');
assert.equal(bounds,1,'Bounding sphere must follow sculpted source mesh');
assert.equal(pos.needsUpdate,true);
const changes=points.map((p,i)=>p[2]-base[i][2]);
assert(Math.abs(changes[0]-.012)<1e-11,'Centre must have a real convex crown peak');
assert(changes[1]>0&&changes[1]<changes[0],'The ridge must grade to the edges');
for(const i of [2,3,4,5])assert(Math.abs(changes[i])<1e-11,
 'Back face and border must remain fixed at index '+i);
for(const dx of changes)assert(dx>=-1e-12&&dx<=.012+1e-12,
 'No vertex may pop outside the original bounded physical micro-crown');
assert(src.includes("plate.scale.set(.82,.84,1);"));
assert(src.includes("plate.position.set(0,.045,.270);"));
assert(src.includes("engraving.scale.set(.82,.84,1);"));
assert(src.includes("engraving.position.set(0,.045,-.101);"));
assert(src.includes("this.bindMachinedMagSurface(material);"));
assert(src.includes("const bodyScale=.001+.63*grow*mix(fade,.56,handoffCortex);"));
assert(src.includes("this.updateDNA(t,time);"));
assert(src.includes("this.updateOrganic(t,time);"));
assert(src.includes("this.updateMechanical(t,time);"));
console.log('MAG_R2356_REAL_3D_CONVEX_TITANIUM_VERTEX_PROOF_PASS',
 JSON.stringify({originalVertexCount:pos.count,normalRebuilds:normals,
  boundsRebuilds:bounds,vertexDisplacements:changes,
  realP0AndHardwareImageReviewRequired:true,noAdditionalMeshOrDrawCall:true}));

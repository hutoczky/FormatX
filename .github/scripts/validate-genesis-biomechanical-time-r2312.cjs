'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const organic=src.slice(src.indexOf('    updateOrganic(t,time){'),src.indexOf('    updateCells(t,time){'));
const cell=src.slice(src.indexOf('    updateCells(t,time){'),src.indexOf('    updateMechanical(t,time){'));
for(const token of ['lobe.userData.baseRotationY=lobe.rotation.y',
 'g.userData.baseRotationY=g.rotation.y',
 'lobe.rotation.y=lobe.userData.baseRotationY+',
 'Math.sin(time*.00042+lobe.userData.phase)*.019*visible',
 'c.rotation.y=c.userData.baseRotationY+',
 'Math.sin(time*.00048+c.userData.phase)*.012*visible'
])assert(src.includes(token),'R2312 frame-rate-independent anatomical motion missing: '+token);
assert(!organic.includes('lobe.rotation.y+='),'lobe frame accumulator invalid');
assert(!cell.includes('c.rotation.y+='),'cell frame accumulator invalid');
const lobe=(t,b,p,v)=>b+Math.sin(t*.00042+p)*.019*v;
const cellPose=(t,b,p,v)=>b+Math.sin(t*.00048+p)*.012*v;
for(const t of [0,100,3500,5500,7500,10000]){
 const l=lobe(t,.37,1.2,.7),c=cellPose(t,.19,.8,.54);
 assert.equal(lobe(t,.37,1.2,.7),l);
 assert.equal(cellPose(t,.19,.8,.54),c);
 assert(Math.abs(l-.37)<=.019&&Math.abs(c-.19)<=.012);
}
assert(src.includes('this.renderer.render(this.scene,this.camera)'));
assert(src.includes('new THREE.PerspectiveCamera(42,1,0.05,80)'));
console.log('R2312_DETERMINISTIC_REAL_3D_CELL_TISSUE_SOURCE_PASS');

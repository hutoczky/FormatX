'use strict';
// R2300 physical photographic detail source gate; never replaces browser proof.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const read=p=>fs.readFileSync(p,'utf8');
const three=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const bootstrap=read('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js');
const html=read('docs/scifi-ui/index.html');
const worker=read('billing-worker/src/production-content-entry.js');
const key='20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis-r2317-smooth-living-cortex-normals';
assert(birth.includes('/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js?v='+key),
  'R533 must load physical R1280 renderer with current cache-key');
assert(bootstrap.includes('/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v='+key),
  'rescue must load current R533 film');
assert(html.includes(key),'parser must request current film revision');
for(const token of [
 'const primaryMolecule=radius>.35;',
 'primaryMolecule?(this.mobileRender?8:10):10',
 'primaryMolecule?6:1,false',
 "rungGeo.setAttribute('color',new T.BufferAttribute(chromaticBond,3))",
 'rungGeo.computeVertexNormals()',
 'vertexColors:radius>.35,',
 'const opticVertices=this.mechEyeCore.geometry.getAttribute',
 'this.mechEyeCore.geometry.computeVertexNormals()',
 'card(.375,.59,.014,.265,-.13',
 'card(.80,.23,.017,.18,.18',
 "fxGenesisStudioR2300='polarized-softbox",
 'this.scene.environment=this.studioEnvTarget.texture',
 'new T.InstancedMesh(rungGeo,rungMat,rungPairs.length)'
])assert(three.includes(token),'R2300 missing physical optics: '+token);
assert.equal((three.match(/this\.mechLight=new T\.PointLight/g)||[]).length,1);
assert(birth.includes('const DURATION = 10000;'));
const inline=html.match(/<script\b[^>]*data-fx-intro-bootstrap-r1629="true"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert(inline);
const digest="'sha256-"+crypto.createHash('sha256').update(inline).digest('base64')+"'";
assert(html.includes(digest),'HTML CSP hash must match exact active parser script');
// Keep source safety independent of the release revision identifier.
// Require a literal current SHA declaration referenced by BOTH Worker CSPs.
const authorized=[...worker.matchAll(/const (INLINE_R\d+_BOOT_HASH) = "([^"]+)";/g)]
  .some(([,name,value])=>value===digest &&
    worker.split(String.fromCharCode(36,123)+name+String.fromCharCode(125)).length===3);
assert(authorized,'both Worker policies must authorize exact current parser SHA256');
console.log('GENESIS_R2300_REAL_PHYSICAL_STUDIO_SOURCE_PASS');

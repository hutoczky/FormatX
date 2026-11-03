'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const film=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const boot=fs.readFileSync('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const begin=film.indexOf('    makeOrganicLayer(){');
const end=film.indexOf('    makeCellularLayer(){',begin);
assert(begin>=0&&end>begin);
const layer=film.slice(begin,end);
for(const part of [
 'new T.IcosahedronGeometry(1.38,4)',
 'shell.geometry.computeVertexNormals();',
 'R2317: this IcosahedronGeometry is NON-INDEXED.',
 "const cortexNormalsR2317=shell.geometry.getAttribute('normal');",
 'for(let i=0;i<shellPosition.count;i++)',
 'const inv=1/Math.max(.00001,Math.hypot(x,y,z))',
 'cortexNormalsR2317.setXYZ(i,x*inv,y*inv,z*inv)',
 'cortexNormalsR2317.needsUpdate=true;',
 'const cortexChromatinR2295=new Float32Array(shellPosition.count*3)'
])assert(layer.includes(part),'R2317 smooth 3D physical cortex must retain: '+part);
assert.equal((layer.match(/new T\.IcosahedronGeometry\(1\.38,4\)/g)||[]).length,1,
 'No new geometry or duplicate draw call');
const render=film.slice(film.indexOf('    render(r,time){'));
assert(!render.includes('cortexNormalsR2317'),
 'No new vertex-normal calculations allowed in the visitor animation loop');
const current='20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis-r2317-smooth-living-cortex-normals-r2318-cell-photon-depth';
assert(birth.includes('/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js?v='+current));
assert(boot.includes('/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v='+current));
const parser=html.match(/<script\b[^>]*data-fx-intro-bootstrap-r1629="true"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert(parser&&parser.includes(current));
const digest="'sha256-"+crypto.createHash('sha256').update(parser).digest('base64')+"'";
assert(html.includes(digest),'HTML CSP must authorize exact R2317 parser');
const currentWorkerCsp=[...worker.matchAll(/const (INLINE_R[0-9]+_BOOT_HASH) = "([^"]+)";/g)]
  .some(([,name,value])=>value===digest &&
    worker.split(String.fromCharCode(36,123)+name+String.fromCharCode(125)).length===3);
assert(currentWorkerCsp,'current cellular film SHA256 must be authorized in both Worker CSP policies');
console.log('R2317_SMOOTH_3D_CORTEX_SAME_MESH_AND_EXACT_CSP_PASS');

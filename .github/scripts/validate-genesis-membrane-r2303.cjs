'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const three=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const boot=fs.readFileSync('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const fragment=three.match(/    makeEmbryoFilm\(\)\{([\s\S]*?)    makeCinematicBiophotons\(/)?.[1]||three;
for(const literal of [
 'R2303: sculpt coherent lamellar microfolds in real 3D coordinates.',
 'const lamella=Math.sin(x*9.4+y*4.2+1.15*Math.sin(z*3.6))',
 'const stromalVein=Math.sin(x*5.8+z*4.2+1.4*Math.sin(y*3.2))',
 'const folded=envelope*(1+.014*lamella+.006*stromalVein)',
 'positions.setXYZ(i,x*folded,y*(1+.024*Math.cos(phi*4.0))*folded,z*folded)',
 'positions.needsUpdate=true;geometry.computeVertexNormals()'
])assert(fragment.includes(literal),'R2303 physical membrane surface lost: '+literal);
assert(three.includes('this.embryoShell=new T.Mesh(geometry,this.embryoMaterial)'),
 'must keep the one original PBR membrane mesh');
assert(birth.includes('const DURATION = 10000;'),'film duration must stay ten seconds');
const active='20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris';
assert(birth.includes('/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js?v='+active),
  'R533 must load the R2303 living surface by the promoted cache key');
assert(boot.includes('/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v='+active),
  'the no-flash bootstrap must load the current R533 film');
assert(html.includes(active),'the live parser must reference the current studio film');
const script=html.match(/<script\b[^>]*data-fx-intro-bootstrap-r1629="true"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert(script);
const digest="'sha256-"+crypto.createHash('sha256').update(script).digest('base64')+"'";
assert(html.includes(digest),'the live HTML CSP must authorize its exact parser');
const authorized=[...worker.matchAll(/const (INLINE_R[0-9]+_BOOT_HASH) = "([^"]+)";/g)]
  .some(([,name,value])=>value===digest &&
    worker.split(String.fromCharCode(36,123)+name+String.fromCharCode(125)).length===3);
assert(authorized,'the active parser SHA must be authorized in both Worker CSP policies');
assert.equal((three.match(/this\.mechLight=new T\.PointLight/g)||[]).length,1);
console.log('R2303_REAL_3D_MEMBRANE_MICROFOLDS_SOURCE_PASS');

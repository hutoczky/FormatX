'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const three=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const boot=fs.readFileSync('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const block=three.slice(three.indexOf('const shutterVertices=[]'),three.indexOf('this.mechInnerMaterial='));
assert(block.includes('R2307: each existing optical shutter has two authentic 3D'));
for(const val of ['const heel=p(.107,-.15,.519)','const leading=p(.178,-.23,.505)',
 'const crease=p(.151,.070,.526)','const trailing=p(.178,.35,.505)',
 '...heel,...leading,...crease,','...heel,...crease,...trailing',
 'shutterGeometry.computeVertexNormals()','flatShading:true'])
 assert(block.includes(val),'R2307 real optical facet lost: '+val);
assert(block.includes('for(let blade=0;blade<8;blade++)'));
assert.equal((block.match(/this\.mechOpticShutters=new T\.Mesh\(/g)||[]).length,1,
 'The iris must keep one physical GPU mesh and one draw call');
const key='20261101-r2295-vascular-cortex-microgeometry-r2298-lightbudget-scratch-r2300-macro-molecule-lens-r2301-cell-depth-r2303-physical-membrane-fold-r2307-faceted-optic-iris-r2309-studio-full-frame-chassis-r2317-smooth-living-cortex-normals';
assert(birth.includes('/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js?v='+key));
assert(boot.includes('/scifi-ui/scripts/formatx-mag-birth-live-r533.js?v='+key));
assert(html.includes(key));
const script=html.match(/<script\b[^>]*data-fx-intro-bootstrap-r1629="true"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert(script);
const digest="'sha256-"+crypto.createHash('sha256').update(script).digest('base64')+"'";
assert(html.includes(digest),'Current HTML CSP parser hash invalid');
const currentAuthorized=[...worker.matchAll(/const (INLINE_R[0-9]+_BOOT_HASH) = "([^"]+)";/g)]
  .some(([,name,value])=>value===digest &&
    worker.split(String.fromCharCode(36,123)+name+String.fromCharCode(125)).length===3);
assert(currentAuthorized,'active parser SHA256 must match both Worker CSPs');
console.log('R2307_REAL_FACETED_OPTICAL_IRIS_CSP_SOURCE_PASS');

'use strict';
// R2208 exact-buffer check: the faster analytical-body loop must keep the
// identical physical normals, lens depth, winding, UVs and facet IDs.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const a=source.indexOf('    /* R2208: keep only two adjacent latitude rows');
const b=source.indexOf('\n    /* R1982 — real microfibril geometry.',a);
assert(a>0&&b>a,'Optimized analytical-body loop missing');
const oldLoop=[
'    for(let lat=0;lat<latitudeSegments;lat+=1){',
'      for(let lon=0;lon<longitudeSegments;lon+=1){',
'        const a=vertex(lat,lon);',
'        const b=vertex(lat,lon+1);',
'        const c=vertex(lat+1,lon);',
'        const d=vertex(lat+1,lon+1);',
'        const facet=.12+.28*random(lon+lat*17,lat*31+lon);',
'        if(lat>0)triangle([a,b,c],facet);',
'        if(lat<latitudeSegments-1)triangle([b,d,c],facet+.004);',
'      }',
'    }'].join('\n');
let legacy=source.slice(0,a)+oldLoop+source.slice(b);
// R2210: compare original and optimized emitted triangles WITHIN the same JS
// engine. Cross-runtime Math trig rounding makes hardcoded V8 fingerprints
// nonportable on Node 22, so never accept or reject shapes using those hashes.
const fixture=fs.readFileSync('.github/fixtures/r2208-original-mag-triangle.jsfrag','utf8');
const triStart=legacy.indexOf('    function triangle(vertices, facet) {');
const triEnd=legacy.indexOf('\n    /* R1931 — clean P0-derived body topology.',triStart);
assert(triStart>=0&&triEnd>triStart,'Original triangle function boundaries missing');
assert(fixture.startsWith('    function triangle(vertices, facet) {'),
  'Original source reference fixture invalid');
legacy=legacy.slice(0,triStart)+fixture+legacy.slice(triEnd);
function compile(text){
  const start=text.indexOf('  function normalize(vector) {');
  const end=text.indexOf('\n  function boot(',start);
  assert(start>=0&&end>start,'Geometry helper section missing');
  return new Function('mobile','constrainedMobile','constrained','auditMode','software',
    'const root={dataset:{}};\n'+text.slice(start,end)+'\nreturn buildOrganismGeometry(software);');
}
const before=compile(legacy),after=compile(source);
const profiles=[
  ['desktop',false,false,false,false,false],
  ['mobile',true,false,false,false,false],
  ['constrained-mobile',true,true,true,false,false],
  ['software',true,true,true,false,true],
  ['audit-mobile',true,false,false,true,false]
];
for(const [name,...args] of profiles){
  const x=before(...args),y=after(...args);
  assert.equal(x.count,y.count,name+' vertex count');
  assert.equal(x.topology,y.topology,name+' topology');
  assert.deepEqual(x.sizes,y.sizes,name+' attribute arity');
  assert.equal(x.arrays.length,y.arrays.length,name+' attribute count');
  for(let i=0;i<x.arrays.length;i++){
    const left=Buffer.from(x.arrays[i].buffer,x.arrays[i].byteOffset,x.arrays[i].byteLength);
    const right=Buffer.from(y.arrays[i].buffer,y.arrays[i].byteOffset,y.arrays[i].byteLength);
    assert.equal(Buffer.compare(left,right),0,name+' original WebGL array '+i+' differs');
  }
  console.log('MAG_R2208_R2210_ENGINE_LOCAL_EXACT_MESH_PASS',name,x.count);
}

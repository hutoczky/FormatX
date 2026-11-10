'use strict';
/* R2363 — Execute the REAL R326 geometry function twice, with cached
   integer grid-angle samples and with the original uncached vertex/row
   expressions reconstructed from source. Require all seven ORIGINAL
   Float32Array attributes to be BYTE IDENTICAL, including normals, lens,
   cortical fibers, facet data and winding. Not a replacement for Chromium. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
let original=source;
const edits=[
 [
  'function vertex(latitudeIndex, longitudeIndex, latitudeTrig=null, longitudeTrig=null) {',
  'function vertex(latitudeIndex, longitudeIndex) {'
 ],
 [
  `      // R2363: integer body lattice shares exact double-precision trig
      // samples; fractional cortical fibers keep the untouched formula.
      const sinPhi=latitudeTrig?latitudeTrig[0]:Math.sin(phi);
      const direction=[
        sinPhi*(longitudeTrig?longitudeTrig[0]:Math.cos(theta)),
        latitudeTrig?latitudeTrig[1]:Math.cos(phi),
        sinPhi*(longitudeTrig?longitudeTrig[1]:Math.sin(theta))
      ];`,
  `      const sinPhi=Math.sin(phi);
      const direction=[sinPhi*Math.cos(theta),Math.cos(phi),sinPhi*Math.sin(theta)];`
 ],
 [
  `    // R2363: cache the original lat/lon angle values exactly once for the
    // existing analytical body rows. No change to topology or shading.
    const rowLatitudeTrig=Array.from({length:latitudeSegments+1},(_,lat)=>{
      const phi=lat/latitudeSegments*Math.PI;
      return [Math.sin(phi),Math.cos(phi)];
    });
    const rowLongitudeTrig=Array.from({length:longitudeSegments+1},(_,lon)=>{
      const theta=lon/longitudeSegments*Math.PI*2;
      return [Math.cos(theta),Math.sin(theta)];
    });
    let upperRow=Array.from({length:longitudeSegments+1},
      (_,lon)=>vertex(0,lon,rowLatitudeTrig[0],rowLongitudeTrig[lon]));`,
  `    let upperRow=Array.from({length:longitudeSegments+1},
      (_,lon)=>vertex(0,lon));`
 ],
 [
  `      const lowerRow=Array.from({length:longitudeSegments+1},
        (_,lon)=>vertex(lat+1,lon,rowLatitudeTrig[lat+1],rowLongitudeTrig[lon]));`,
  `      const lowerRow=Array.from({length:longitudeSegments+1},
        (_,lon)=>vertex(lat+1,lon));`
 ]
];
for(const [modern,legacy] of edits){
 assert.equal(original.split(modern).length-1,1,
  'Could not reconstruct original R2359 vertex source exactly');
 original=original.replace(modern,legacy);
}
assert(!original.includes('rowLatitudeTrig'),'Reconstructed baseline must not use trig table');
assert(source.includes('const latitudeSegments = software ? 28 :'));
assert(source.includes('this'+'DoesNotExist')===false);
function builder(text,profile){
 const begin=text.indexOf('  function normalize(vector) {');
 const end=text.indexOf('  function boot(attempt=0) {',begin);
 assert(begin>0 && end>begin,'R326 real 3D constructor bounds missing');
 return new Function('mobile','constrained','constrainedMobile','auditMode',
   text.slice(begin,end)+'\nreturn buildOrganismGeometry;')(
   profile.mobile,profile.constrained,profile.mobile&&profile.constrained,
   profile.audit
 );
}
const profiles=[
 {name:'desktop-hardware',mobile:false,constrained:false,software:false,audit:false},
 {name:'desktop-constrained',mobile:false,constrained:true,software:false,audit:false},
 {name:'mobile-hardware',mobile:true,constrained:false,software:false,audit:false},
 {name:'mobile-constrained',mobile:true,constrained:true,software:false,audit:false},
 {name:'mobile-software',mobile:true,constrained:true,software:true,audit:false},
 {name:'desktop-audit',mobile:false,constrained:false,software:false,audit:true},
 {name:'mobile-audit',mobile:true,constrained:false,software:false,audit:true}
];
for(const p of profiles){
 const before=builder(original,p),after=builder(source,p);
 const start=performance.now(),x=before(p.software),beforeMs=performance.now()-start;
 const second=performance.now(),y=after(p.software),afterMs=performance.now()-second;
 assert.equal(x.count,y.count,p.name+' vertex count');
 assert.equal(x.topology,y.topology,p.name+' topology');
 assert.equal(x.tendrils,y.tendrils,p.name+' original tendrils');
 assert.equal(x.microFibers,y.microFibers,p.name+' original surface fibers');
 assert.deepEqual(x.sizes,y.sizes,p.name+' original GL vertex arity');
 assert.equal(x.arrays.length,7);assert.equal(y.arrays.length,7);
 const digests=[];
 for(let k=0;k<7;k++){
   const a=x.arrays[k],b=y.arrays[k];
   assert(a instanceof Float32Array && b instanceof Float32Array);
   assert.equal(a.length,b.length,p.name+' GL attribute length '+k);
   const bytesA=Buffer.from(a.buffer,a.byteOffset,a.byteLength);
   const bytesB=Buffer.from(b.buffer,b.byteOffset,b.byteLength);
   assert.equal(Buffer.compare(bytesA,bytesB),0,
     p.name+' real 3D original GL bytes differ in buffer '+k);
   digests.push(crypto.createHash('sha256').update(bytesB).digest('hex').slice(0,12));
 }
 console.log('MAG_R2363_ORIGINAL_SEVEN_GPU_BUFFERS_BIT_IDENTICAL_PASS',
  JSON.stringify({profile:p.name,vertexCount:x.count,hashes:digests,
   baselineMs:+beforeMs.toFixed(2),candidateMs:+afterMs.toFixed(2),
   timingsAreDiagnosticOnly:true,chromiumAndLighthouseStillRequired:true}));
}

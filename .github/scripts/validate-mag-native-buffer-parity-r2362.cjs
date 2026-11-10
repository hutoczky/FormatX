'use strict';
/* R2362: Execute the REAL canonical native MAG geometry constructor twice:
   the newly authored scalar-push path vs reconstructed previous iterable-
   spread push expressions. Compare all seven Float32Array GPU inputs byte
   for byte, including winding, normal, UV and facet data. This is not an
   image/FPS acceptance test; retain original Chromium P0 & Lighthouse x3. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const transforms=[
 ['sphere.push(item.sphere[0],item.sphere[1],item.sphere[2]);','sphere.push(...item.sphere);'],
 ['crystal.push(item.crystal[0],item.crystal[1],item.crystal[2]);','crystal.push(...item.crystal);'],
 ['sphereNormals.push(item.sphereNormal[0],item.sphereNormal[1],item.sphereNormal[2]);','sphereNormals.push(...item.sphereNormal);'],
 ['uvs.push(item.uv[0],item.uv[1]);','uvs.push(...item.uv);']
];
let previous=source;
for(const [current,old] of transforms){
  assert.equal(source.split(current).length-1,2,'Both real mineral and optic loops must be optimized: '+current);
  assert(!source.includes(old),'Do not retain old spread in either geometry path');
  previous=previous.split(current).join(old);
}
assert(source.includes('function buildOrganismGeometry(software=false)'));
assert(source.includes('root.dataset.fxMagBootPhasesR2241=JSON.stringify'));
assert(source.includes('gl.drawArrays(gl.TRIANGLES,0,geometry.count)'));
const getBuilder=(text,profile)=>{
  const begin=text.indexOf('  function normalize(vector) {');
  const end=text.indexOf('  function boot(attempt=0) {',begin);
  assert(begin>0&&end>begin,'Could not extract real native physical geometry');
  const factory=new Function('mobile','constrained','constrainedMobile','auditMode',
    text.slice(begin,end)+'\nreturn buildOrganismGeometry;');
  return factory(profile.mobile,profile.constrained,
    profile.mobile&&profile.constrained,false);
};
for(const profile of [
  {name:'desktop-full',mobile:false,constrained:false,software:false},
  {name:'mobile-hardware',mobile:true,constrained:false,software:false},
  {name:'mobile-constrained',mobile:true,constrained:true,software:false},
  {name:'mobile-software',mobile:true,constrained:true,software:true}
]){
  const oldBuild=getBuilder(previous,profile);
  const newBuild=getBuilder(source,profile);
  const now=performance.now();
  const oldResult=oldBuild(profile.software);
  const oldMs=performance.now()-now;
  const newStarted=performance.now();
  const newResult=newBuild(profile.software);
  const newMs=performance.now()-newStarted;
  assert.equal(newResult.arrays.length,7);
  assert.deepEqual(newResult.sizes,oldResult.sizes);
  assert.equal(newResult.count,oldResult.count);
  assert.equal(newResult.tendrils,oldResult.tendrils);
  assert.equal(newResult.microFibers,oldResult.microFibers);
  assert.equal(newResult.topology,oldResult.topology);
  const digests=[];
  for(let k=0;k<7;k++){
    const a=oldResult.arrays[k],b=newResult.arrays[k];
    assert(a instanceof Float32Array && b instanceof Float32Array);
    assert.equal(a.length,b.length,'Changed canonical GPU attribute length '+k);
    const ba=Buffer.from(a.buffer,a.byteOffset,a.byteLength);
    const bb=Buffer.from(b.buffer,b.byteOffset,b.byteLength);
    assert.equal(Buffer.compare(ba,bb),0,
      'Changed original vertex/normal/UV/barycentric/facet GPU bytes '+k);
    digests.push(crypto.createHash('sha256').update(bb).digest('hex').slice(0,16));
  }
  console.log('MAG_R2362_GPU_BUFFERS_BIT_IDENTICAL_PASS',JSON.stringify({
    profile:profile.name,vertices:newResult.count,attributeHashes:digests,
    previousMs:+oldMs.toFixed(2),optimizedMs:+newMs.toFixed(2),
    unchangedSevenRealGPUBufferUploads:true,
    unchangedVisualQuality:true,realChromiumAndLighthouseStillRequired:true
  }));
}

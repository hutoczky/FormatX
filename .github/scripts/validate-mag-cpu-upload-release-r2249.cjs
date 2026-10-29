'use strict';
// R2249: actual WebGL attribute arrays are no longer retained after upload.
// This guard executes the exact release stanza from the canonical R326 source.
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const upload=source.indexOf('    buffers.forEach((buffer,index)=>upload(buffer,geometry.arrays[index],attributes[index],geometry.sizes[index]));');
const release=source.indexOf('    const releasedCpuBytesR2249=geometry.arrays.reduce(');
const publish=source.indexOf('    root.dataset.fxMagCpuMeshReleasedR2249=String(releasedCpuBytesR2249);',release);
assert(upload>0&&release>upload&&publish>release,'CPU release must follow seven WebGL uploads');
assert(source.indexOf('    const buffers=geometry.arrays.map(()=>gl.createBuffer());')<upload,
  'Seven original GL buffers must still be allocated');
const rest=source.slice(publish+1);
assert(!/geometry\.arrays\s*\[/.test(rest) && !/geometry\.arrays\.(?:map|reduce|forEach)/.test(rest),
  'CPU geometry arrays must not be referenced after being released');
const code=source.slice(release,publish+
  '    root.dataset.fxMagCpuMeshReleasedR2249=String(releasedCpuBytesR2249);'.length);
const free=new Function('geometry','root',code+
  '\nreturn {bytes:releasedCpuBytesR2249,held:geometry.arrays.length};');
for(const lengths of [
  [300,300,300,300,200,300,100],
  [3,3,3,3,2,3,1],
  [300000,300000,300000,300000,200000,300000,100000]
]){
  const arrays=lengths.map(n=>new Float32Array(n));
  const expected=arrays.reduce((acc,a)=>acc+a.byteLength,0);
  const gpuData=arrays.map(a=>new Float32Array(a)); // Simulation of bufferData copy.
  const geometry={arrays,count:arrays[6].length,sizes:[3,3,3,3,2,3,1]};
  const root={dataset:{}};
  const result=free(geometry,root);
  assert.equal(result.bytes,expected);
  assert.equal(result.held,0,'All seven source attributes must be released');
  assert.equal(root.dataset.fxMagCpuMeshReleasedR2249,String(expected));
  assert.equal(geometry.count,lengths[6],'GPU vertex count must be retained');
  assert.deepEqual(gpuData.map(a=>a.length),lengths,'GPU-owned attributes stay intact');
}
console.log('MAG_R2249_CPU_VERTEX_BUFFERS_RELEASED_PASS');

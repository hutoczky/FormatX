'use strict';
// R2264: Production should present the original physical MAG after a real
// GPU-completion fence, not force a CPU/GPU sync readback on every visit.
// Explicit P0 visual proofs must continue reading actual original pixels.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const cold=fs.readFileSync('.github/scripts/validate-mag-cold-handoff-r2226.cjs','utf8');
const capture=fs.readFileSync('.github/scripts/capture-mag-intro-r656.cjs','utf8');
assert.doesNotThrow(()=>new Function(src),'Canonical WebGL source must parse');
const start=src.indexOf('        const proofParamsR2264=new URLSearchParams(location.search);');
const end=src.indexOf('\n        root.dataset.fxMagReadbackPolicyR2264=',start);
assert(start>=0&&end>start,'Readback policy must live in original R326');
const selectProof=new Function('search',
  'const location={search};\n'+src.slice(start,end)+'\nreturn proofReadbackR2264;');
for(const [query,expected] of [
  ['',false],['?intro=1',false],['?lighthouse=1',false],
  ['?intro=0',false],['?intro=1&mobileproof=r1500',false],
  ['?visualintro=0',false],['?visualintro=1',true],
  ['?r2226cold=1',true],['?r720handoff=1',true],
  ['?nativeproof=1',true]
]){
  assert.equal(selectProof(query),expected,'Readback policy '+query);
}
const finish=src.slice(src.indexOf('        const proofPixel=()=>{',end),
  src.indexOf('\n        gl.flush();\n        root.dataset.fxMagNativePresentR2220=',end));
assert(finish.startsWith('        const proofPixel=()=>{'),'GPU completion callback missing');
assert.equal((src.match(/gl\.readPixels\(/g)||[]).length,1,
  'Only one original 8x8 framebuffer readback call is permitted');
assert(finish.includes('if(proofReadbackR2264){')&&
  finish.indexOf('if(proofReadbackR2264){')<finish.indexOf('gl.readPixels('),
  'GPU readback must be strictly opt-in for physical visual proof');
assert(finish.includes("root.dataset.fxMagHandoffPixelR2226='not-sampled'"),
  'Normal visitor path must explicitly avoid GPU readback');
assert(finish.indexOf("root.dataset.fxMagHandoffGpuR2226='finished'")>
       finish.indexOf("root.dataset.fxMagHandoffPixelR2226='not-sampled'"),
  'A completed GPU fence must release the film on both paths');
assert(src.includes('gl.clientWaitSync(fence,0,0)')&&
  src.includes("root.dataset.fxMagHandoffSyncR2253='webgl2-nonblocking-fence'"),
  'Nonblocking GPU gate must stay intact');
assert(cold.includes("url.searchParams.set('visualintro','1')"),
  'Three independent visual cold starts must still enable real pixel readback');
assert(capture.includes("url.searchParams.set('visualintro','1')"),
  'Original film reference frames must still verify real WebGL pixels');
console.log('MAG_R2264_PRODUCTION_FENCE_ONLY_PASS (10 query scenarios)');

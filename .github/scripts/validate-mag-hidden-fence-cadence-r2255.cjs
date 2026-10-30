'use strict';
// R2255: no hidden-frame GPU storms while the original R326 WebGL2
// handoff fence is pending. The visible renderer still uses its original
// motion scheduler after GPU proof, or after a bounded fence failure.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
assert.doesNotThrow(()=>new Function(src),'original R326 must parse');
assert.equal((src.match(/let pendingGpuFenceR2253=null;/g)||[]).length,1);
assert.equal((src.match(/let heldCinematicFramesR2255=0;/g)||[]).length,1);
const start=src.indexOf('    function frame(now){');
const end=src.indexOf('      /* R1622',start);
assert(start>=0&&end>start,'original native frame scheduling missing');
const block=src.slice(start,end);
assert(block.includes('raf=0;if(blocked())return;'),'keep original visibility/pause ownership');
assert(block.includes('if(pendingGpuFenceR2253){'),'only hold while real GPU fence exists');
assert(block.includes("root.dataset.fxMagHandoffCadenceR2255='hidden-gpu-proof-hold'"));
assert(block.indexOf('if(pendingGpuFenceR2253){')<block.lastIndexOf('return;'),
  'return before original RAF scheduler may start a hidden draw');
const proofStart=src.indexOf('        const proofPixel=()=>');
const proofEnd=src.indexOf('        gl.flush();',proofStart);
assert(proofStart>=0&&proofEnd>proofStart,'original GPU pixel proof absent');
const proof=src.slice(proofStart,proofEnd);
assert(proof.includes("root.dataset.fxMagHandoffGpuR2226='finished'"),
  'never publish finished until real GPU readback');
assert(proof.includes('if(heldCinematicFramesR2255){') &&
  proof.includes("root.dataset.fxMagHandoffCadenceR2255='resumed-after-gpu-proof'") &&
  proof.includes('if(!blocked())schedule(2);'),
  'resume original motion after proof, honoring visibility and pause');
for(const failure of ['gpu-fence-failed','gpu-fence-timeout']){
  const i=src.indexOf("root.dataset.fxMagHandoffGpuR2226='"+failure+"'");
  assert(i>=0,'lost existing GPU fence failure path: '+failure);
  const part=src.slice(i,i+480);
  assert(part.includes("root.dataset.fxMagHandoffCadenceR2255='fallback-unblocked'")&&
    part.includes('if(!blocked())schedule(1);'),
    'fence '+failure+' must restore normal scheduler');
}
assert(src.includes('const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0)'),
  'retain original nonblocking GPU gate');
assert(src.includes('gl.readPixels('),
  'retain real GPU pixel proof before cinematic exposure');
assert(src.includes('const pendingGpuFenceR2253')===false,
  'do not introduce second GPU fence owner');
assert(!src.includes('new WebGLRenderingContext('),'do not create extra renderer');
console.log('MAG_R2255_HIDDEN_GPU_FENCE_CADENCE_PASS');

'use strict';
// R2236: test the real deterministic proof scheduler extracted from R533.
// This is NOT a mock of the web renderer; it ensures a real RAF or bounded
// timeout unblocks the same one-shot render without double invocation.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(
  'docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8'
);
const first=source.indexOf('        const proofTurn=callback=>{');
const last=source.indexOf('\n        const settleProof=()=>{',first);
assert(first>0&&last>first,'R2236 proofTurn missing from canonical film');
const turnSource=source.slice(first,last);
assert(source.includes("ROOT.dataset.fxMagBirthProofSchedulerR2236='bounded-raf-or-timeout'"),
  'Proof must identify the bounded scheduling strategy');
assert(source.includes('rendererReady.then(bootProof,bootProof)'),
  'Renderer resolution or failure must settle the deterministic proof');
assert(source.includes("ROOT.dataset.fxMagBirthVisualFrameR659='ready'"),
  'Legacy visual-frame readiness contract must be preserved');
function testPath(name,firstFiring){
  const frames=new Map(),timers=new Map();
  let nextFrame=1,nextTimer=1,calls=0;
  const raf=cb=>{const id=nextFrame++;frames.set(id,cb);return id;};
  const cancel=id=>frames.delete(id);
  const clear=id=>timers.delete(id);
  const win={setTimeout(cb,ms){
    assert.equal(ms,180,'Only bounded 180ms visual-proof fallback allowed');
    const id=nextTimer++;timers.set(id,cb);return id;
  }};
  const proofTurn=new Function(
    'requestAnimationFrame','cancelAnimationFrame','clearTimeout','window',
    turnSource+'\nreturn proofTurn;'
  )(raf,cancel,clear,win);
  proofTurn(()=>calls++);
  assert.equal(frames.size,1,name+' schedules one RAF');
  assert.equal(timers.size,1,name+' schedules one timer');
  const first=firstFiring==='raf'?[...frames.values()][0]:[...timers.values()][0];
  // Simulate a callback already queued by the browser: it may invoke even
  // after cancellation. The delivered latch must reject a second execution.
  const second=firstFiring==='raf'?[...timers.values()][0]:[...frames.values()][0];
  first();
  second();
  assert.equal(calls,1,name+' must call renderer once');
  assert.equal(frames.size,0,name+' cancels RAF');
  assert.equal(timers.size,0,name+' cancels timeout');
  console.log('GENESIS_R2236_PROOF_CLOCK_PASS',name);
}
testPath('timer-fires-when-raf-stalled','timer');
testPath('raf-fires-before-timeout','raf');

'use strict';
/* R2244 regression: overloaded frames must share a single framebuffer
   resize. The final qualityScale is read by the callback at execution. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const start=source.indexOf('    function qualityResizeProtectedR2283(){');
const end=source.indexOf('\n    function blocked(){',start);
assert(start>=0&&end>start,'R2244 coalesced resize helper missing');
const fragment=source.slice(start,end);
assert(fragment.includes('},48);'),'bounded 48ms coalescing window required');
assert.equal((source.match(/requestQualityResizeR2244\(\);/g)||[]).length,2,
  'both panic and steady-state governor paths must coalesce');
const oldPattern='if(qualityResizeTimer){clearTimeout(qualityResizeTimer);delayed.delete(qualityResizeTimer);}';
assert(!source.includes(oldPattern),'do not restart the pending framebuffer-resize timer');
const tasks=[];
let resizeCount=0,renderCount=0;
const later=(fn,ms)=>{tasks.push({fn,ms});return tasks.length;};
const root={dataset:{fxMagBirthLiveR533:''},getAttribute:()=>null};
let now=1000;
const runtime=new Function('later','resize','schedule','root','performance',
  'let qualityResizeTimer=0,disposed=false,contextLost=false;\n'+
  'let pendingGpuFenceR2253=null,nativeExposureLockUntilR2283=0;\n'+fragment+
  '\nreturn {request:requestQualityResizeR2244,pending:()=>qualityResizeTimer,'+
  'dispose:()=>{disposed=true;},lose:()=>{contextLost=true;},'+
  'recover:()=>{contextLost=false;},fence:x=>{pendingGpuFenceR2253=x;},'+
  'lock:x=>{nativeExposureLockUntilR2283=x;}};'
)(later,()=>{resizeCount++;return true;},n=>{renderCount+=n;},root,
  {now:()=>now});
for(let i=0;i<12;i++)runtime.request();
assert.equal(tasks.length,1,'twelve rapid adjustments must schedule one resize');
assert.equal(tasks[0].ms,48);
assert.equal(runtime.pending(),1);
tasks[0].fn();
assert.equal(resizeCount,1);
assert.equal(renderCount,1);
assert.equal(runtime.pending(),0,'timer must clear after firing');
runtime.request();
assert.equal(tasks.length,2,'new burst must be allowed after first resize');
runtime.lose();
tasks[1].fn();
assert.equal(resizeCount,1,'context loss must prevent GPU resize');
assert.equal(renderCount,1,'context loss must not schedule GL frames');
runtime.recover();
// R2284: early cinematic work must STILL adapt GPU resolution. The
// protection starts only after the original film requests a real GPU frame.
root.dataset.fxMagBirthLiveR533='active';
runtime.request();
assert.equal(tasks.length,3,'early-film adaptive quality must remain active');
tasks[2].fn();
assert.equal(resizeCount,2,'early-film quality scaling must not be frozen');
assert.equal(renderCount,2);
root.dataset.fxMagHandoffPrepareR2254='requested';
runtime.request();
assert.equal(tasks.length,3,'prepared physical film must freeze backing buffer');
runtime.fence({live:true});
root.dataset.fxMagBirthLiveR533='';
runtime.request();
assert.equal(tasks.length,3,'pending GPU fence must freeze resize');
runtime.fence(null);
runtime.lock(2000);
runtime.request();
assert.equal(tasks.length,3,'first exposed native frame must be preserved');
runtime.lock(0);
runtime.request();
assert.equal(tasks.length,4,'quality scaling must resume after real exposure');
root.dataset.fxMagBirthLiveR533='active';
tasks[3].fn();
assert.equal(resizeCount,2,
  'film becoming active during 48ms timer must preserve framebuffer');
assert.equal(runtime.pending(),0,'discarded timer must clear');
root.dataset.fxMagBirthLiveR533='';
runtime.request();
assert.equal(tasks.length,5);
tasks[4].fn();
assert.equal(resizeCount,3,'post-film quality scaling must remain operational');
assert.equal(renderCount,3);
console.log('MAG_R2284_PREPARED_ONLY_GPU_RESIZE_GUARD_PASS');

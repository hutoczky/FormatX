'use strict';
/* R2244 regression: overloaded frames must share a single framebuffer
   resize. The final qualityScale is read by the callback at execution. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const start=source.indexOf('    function requestQualityResizeR2244(){');
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
const runtime=new Function('later','resize','schedule',
  'let qualityResizeTimer=0,disposed=false,contextLost=false;\n'+fragment+
  '\nreturn {request:requestQualityResizeR2244,pending:()=>qualityResizeTimer,'+
  'dispose:()=>{disposed=true;},lose:()=>{contextLost=true;}};'
)(later,()=>{resizeCount++;return true;},n=>{renderCount+=n;});
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
console.log('MAG_R2244_COHERENT_FRAMEBUFFER_RESIZE_PASS');

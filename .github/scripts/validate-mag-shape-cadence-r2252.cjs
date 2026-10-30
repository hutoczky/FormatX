'use strict';
// R2252: DOM updates are observable style invalidations. This verifies
// identical original public state with no duplicate writes at 60Hz.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
function portion(start,end) {
  const a=src.indexOf(start),b=src.indexOf(end,a+start.length);
  assert(a>=0&&b>a,'Missing original MAG frame-state source boundary: '+start);
  return src.slice(a,b);
}
let count=0;
const store={},stageStore={};
const proxy=(values)=>new Proxy(values,{
  set(obj,key,value){count++;obj[key]=value;return true;}
});
const root={dataset:proxy(store)},stage={dataset:proxy(stageStore)};
const shape=new Function('root','stage','source',
  portion("    function publishShape(source='renderer'){",'    function setMorph(')+
  '\nreturn publishShape(source);');
shape(root,stage,'burst-settle-r442');
assert.equal(count,9,'First native MAG shape publish retains all nine public fields');
const initial={...store},initialStage={...stageStore};
for(let i=0;i<120;i++)shape(root,stage,'burst-settle-r442');
assert.equal(count,9,'Repeated original MAG bursts must not rewrite stable attributes');
assert.deepEqual(store,initial);
assert.deepEqual(stageStore,initialStage);
shape(root,stage,'touch');
assert.equal(count,10,'Changing the source writes only the source field');
assert.equal(store.fxCoreMorphSource,'touch');
store.fxCoreShape='legacy';
shape(root,stage,'touch');
assert.equal(count,11,'Changed shape state must self-heal');
assert.equal(store.fxCoreShape,'organism');
const burst=new Function('root','burstDelay',
  portion("        const burstCadence=burstDelay?",'        queueFrame(burstDelay);'));
const surface=new Function('root','sweepDelay','mobile',
  portion("        const sweepCadence=sweepDelay?",'        queueFrame(sweepDelay);'));
const refresh=new Function('root','estimatedHz','divisor',
  portion("          const hzText=estimatedHz.toFixed(1);",'        }\n        if(divisor>1'));
let old=count;
for(let i=0;i<120;i++)burst(root,0);
assert.equal(count,old+1,'60Hz burst cadence must publish exactly once');
assert.equal(store.fxCoreBurstCadenceR1600,'native-60hz-target');
old=count;
for(let i=0;i<120;i++)surface(root,0,true);
assert.equal(count,old+3,'Identical active surface cadence publishes three states once');
assert.equal(store.fxCoreAdaptiveSurfaceCadenceR588,'native-raf');
assert.equal(store.fxCoreSurfaceCadenceR643,'mobile-budget-preserved');
old=count;
for(let i=0;i<120;i++)refresh(root,59.96,1);
assert.equal(count,old+3,'Refresh governor must not rewrite unchanged telemetry');
assert.equal(store.fxCoreRefreshHzR1622,'60.0');
assert.equal(store.fxCoreRenderDivisorR1622,'1');
old=count;
burst(root,100);
assert.equal(count,old+1);
assert.equal(store.fxCoreBurstCadenceR1600,'audit-paced');
old=count;
surface(root,26,true);
assert.equal(count,old+1,'Only the changed surface cadence is written');
assert.equal(store.fxCoreAdaptiveSurfaceCadenceR588,'paced-26ms');
old=count;
refresh(root,120.1,2);
assert.equal(count,old+2,'Refresh and divisor change without redundant constant status');
assert.equal(store.fxCoreRefreshHzR1622,'120.1');
assert.equal(store.fxCoreRenderDivisorR1622,'2');
assert(src.includes('gl.drawArrays(gl.TRIANGLES,0,geometry.count);'),
  'Original MAG physical WebGL topology must stay untouched');
console.log('MAG_R2252_SHAPE_CADENCE_DOM_CHANGE_GUARD_PASS',count);

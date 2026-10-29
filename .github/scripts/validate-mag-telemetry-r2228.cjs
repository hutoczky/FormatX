'use strict';
// R2228: telemetry changes must not create duplicate root-attribute mutation
// batches. Verify the exact original public values without running a browser.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const start=src.indexOf('        const nextRenderMs=renderAverage.toFixed(2);');
const endToken='          root.dataset.fxCoreReal3dFps=nextFps;';
const end=src.indexOf(endToken,start)+endToken.length;
assert(start>0&&end>start,'R2228 live telemetry implementation missing');
const publish=new Function('root','renderAverage','dt','frameIntervalAverage','renderPeak','framePeak','qualityScale',src.slice(start,end));
const names=[
  'fxCoreRenderMs','fxCoreFrameMs','fxCoreFrameIntervalR1602',
  'fxCoreRenderPeakR1626','fxCoreFramePeakR1626',
  'fxCoreQualityScaleR1600','fxCoreReal3dFps'
];
let writes=0;
const values={};
const root={dataset:new Proxy(values,{
  set(target,key,value){writes++;target[key]=value;return true;}
})};
function emit(renderAverage=2.751,dt=16.673,frameIntervalAverage=16.679,
  renderPeak=3.214,framePeak=17.311,qualityScale=.961){
  publish(root,renderAverage,dt,frameIntervalAverage,renderPeak,framePeak,qualityScale);
}
emit();
assert.deepEqual(names.map(name=>values[name]),[
  '2.75','16.67','16.68','3.21','17.31','.96','60'
],'The original seven exposed public metrics must remain byte-identical');
assert.equal(writes,7,'first telemetry sample publishes all seven values');
emit();
assert.equal(writes,7,'identical subsequent samples cause zero DOM writes');
emit(3.127);
assert.equal(writes,8,'only the one changed metric should be published');
assert.equal(values.fxCoreRenderMs,'3.13','changed render metric value must update');
emit(3.127,18.031,20.004,5.016,30.21,.724);
assert.equal(writes,14,'remaining changed fields should update, no extras');
assert.equal(values.fxCoreReal3dFps,'50','FPS must stay truthful under load');
assert(!src.includes("root.dataset.fxCoreFrameMs=dt.toFixed(2);"),
  'Old unconditional 250ms DOM writes must not return');
console.log('MAG_R2228_TELEMETRY_CHANGE_GUARD_PASS',writes);

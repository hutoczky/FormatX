'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const start=s.indexOf('    function presentationBudget('),end=s.indexOf('    function render(now)',start);
assert.ok(start>=0&&end>start);
const ctx=vm.createContext({});
vm.runInContext(s.slice(start,end),ctx);
for(const hz of [60,120,144,165,180,240]){
 const budget=vm.runInContext('presentationBudget('+1000/hz+')',ctx);
 assert.ok(budget<=1000/60+1e-8&&budget>0);
 const actual=(1000/hz)*Math.max(1,Math.floor(hz/60));
 assert.ok(actual<=budget*1.10+1e-8,'Healthy cadence must not trigger pressure: '+hz);
 assert.ok(actual*2>budget*1.25,'Missed frame must trigger pressure: '+hz);
}
assert.ok(s.includes('const panicFrame=dt>expectedFrame*1.25 || ms>6.4'));
assert.ok(s.includes('frameIntervalAverage<=expectedFrame*1.04'));
assert.ok(s.includes('const severeRenderPressure=renderAverage>5.8 || renderPeak>7.4'));
console.log('R2299 cadence-aware quality governor: PASS');

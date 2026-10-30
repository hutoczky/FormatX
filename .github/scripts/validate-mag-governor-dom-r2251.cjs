'use strict';
// R2251: keep all existing quality response semantics, but prevent repetitive
// root dataset mutations during GPU panic/recovery from re-matching live CSS.
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const panicStart=src.indexOf("            if(root.dataset.fxCoreGovernorR1660!=='panic-lod-one-frame-spike')");
const panicEnd=src.indexOf("              root.dataset.fxCoreGovernorR1660='panic-lod-one-frame-spike';",panicStart);
assert(panicStart>0&&panicEnd>panicStart,'R2251 single-frame panic guard missing');
const normalStart=src.indexOf("            const governorR1626=qualityScale<previous?");
const normalEnd=src.indexOf("              root.dataset.fxCoreGovernorR1660=governorR1660;",normalStart);
assert(normalStart>0&&normalEnd>normalStart,'R2251 recovery governor guard missing');
const panic=new Function('root',src.slice(panicStart,panicEnd+
  "              root.dataset.fxCoreGovernorR1660='panic-lod-one-frame-spike';".length));
const steady=new Function('root','qualityScale','previous',src.slice(normalStart,normalEnd+
  '              root.dataset.fxCoreGovernorR1660=governorR1660;'.length));
const state={},count={};
const root={dataset:new Proxy(state,{set(target,key,value){
  count[key]=(count[key]||0)+1;target[key]=value;return true;
}})};
for(let i=0;i<24;i++)panic(root);
assert.equal(count.fxCoreGovernorR1660,1,'24 identical panic frames only publish once');
assert.equal(state.fxCoreGovernorR1660,'panic-lod-one-frame-spike');
for(let i=0;i<24;i++)steady(root,.75,.9);
assert.equal(count.fxCoreGovernorR1626,1,'24 quality-shed frames publish R1626 once');
assert.equal(count.fxCoreGovernorR1660,2,'shed transition publishes one R1660 state');
assert.equal(state.fxCoreGovernorR1626,'hard-60fps-quality-first');
assert.equal(state.fxCoreGovernorR1660,'preemptive-frame-budget-shed');
for(let i=0;i<24;i++)steady(root,.91,.90);
assert.equal(count.fxCoreGovernorR1626,2,'recovery state changes R1626 once');
assert.equal(count.fxCoreGovernorR1660,3,'recovery state changes R1660 once');
assert.equal(state.fxCoreGovernorR1626,'slow-quality-recovery');
assert.equal(state.fxCoreGovernorR1660,'guarded-quality-recovery');
panic(root);
assert.equal(count.fxCoreGovernorR1660,4,'a new panic after recovery still publishes');
assert(!src.includes("root.dataset.fxCoreGovernorR1660=qualityScale<previous?"),
  'unconditional per-frame R1660 governor mutations must not return');
console.log('MAG_R2251_GOVERNOR_ATTRIBUTE_DEDUP_PASS',JSON.stringify(count));

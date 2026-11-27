'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const a=s.indexOf('    function resize(onlyChanged=false){'),b=s.indexOf('    function blocked(){',a);
assert.ok(a>=0&&b>a);
const simulate=new Function(s.slice(a,b).includes('const nextAspect')?'': 'unused',`
 let width=0,height=0,aspect=1,qualityScale=1,devicePixelRatio=1,viewportCalls=0,widthWrites=0,heightWrites=0;
 let rect={width:800,height:600},cw=300,ch=150;
 const stage={getBoundingClientRect:()=>rect};
 const softwareRenderer=false,mobile=false,auditMode=false,constrainedMobile=false,constrained=false;
 const canvas={get width(){return cw;},set width(v){cw=v;widthWrites++;},get height(){return ch;},set height(v){ch=v;heightWrites++;}};
 const root={dataset:{}},gl={viewport:()=>viewportCalls++};
 ${s.slice(a,b)}
 return {resize,setRect:(w,h)=>{rect={width:w,height:h};},stats:()=>({widthWrites,heightWrites,viewportCalls,width,height,aspect})};
`);
const t=simulate();
assert.equal(t.resize(true),true);
assert.equal(t.stats().viewportCalls,1);
for(let i=0;i<1000;i++)assert.equal(t.resize(true),false);
assert.equal(t.stats().viewportCalls,1);
t.setRect(801,600);assert.equal(t.resize(true),true);assert.equal(t.stats().widthWrites,2);assert.equal(t.stats().heightWrites,1);
t.setRect(801.1,600);assert.equal(t.resize(true),true);assert.equal(t.stats().widthWrites,2);assert.equal(t.stats().heightWrites,1);
assert.equal(t.stats().viewportCalls,3);
assert.equal(t.resize(),true);assert.equal(t.stats().viewportCalls,4);
t.setRect(0,0);assert.equal(t.resize(true),false);
assert.ok(s.includes('if(!disposed&&!contextLost&&resize(true))schedule(1)'));
console.log('R2311 resize observer regression: PASS (1000 unchanged callbacks, zero extra viewport calls)');

'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
// Missing status is not success. Assess only this exact commit, never
// substitute a previous release's green status for a new untested revision.
const required=[
  'FormatX production validation',
  'FormatX strict live public release audit',
  'FormatX live production probe',
  'FormatX R2226 native scroll budget',
  'FormatX Lighthouse quality gate',
  'FormatX canonical MAG runtime',
  'FormatX R1450 mobile MAG visual proof',
  'FormatX commerce checkout visibility',
  'FormatX semantic first paint',
  'FormatX no-information-occlusion',
  'FormatX full website browser validation'
];
function report(data){
  assert(data&&typeof data.sha==='string'&&Array.isArray(data.statuses),'Invalid commit status response');
  const latest=new Map();
  for(const s of data.statuses){
    if(!s||typeof s.context!=='string')continue;
    if(!latest.has(s.context))latest.set(s.context,s);
  }
  const gates=required.map(context=>{
    const s=latest.get(context);
    return {context,state:s?.state||'missing',url:s?.target_url||null};
  });
  const failed=[...latest.values()].filter(s=>s.state==='failure'||s.state==='error').map(s=>({context:s.context,url:s.target_url||null}));
  return {sha:data.sha,reportedState:data.state,required:gates,
    failed,missing:gates.filter(s=>s.state==='missing').map(s=>s.context),
    pending:gates.filter(s=>s.state==='pending').map(s=>s.context),
    requiredStatusSetGreen:gates.every(s=>s.state==='success')&&failed.length===0,
    finalVisualAndPerformanceAcceptance:'requires measured evidence'};
}
function selfTest(){
  const blank=report({sha:'a',state:'pending',statuses:[]});
  assert.equal(blank.missing.length,required.length);
  assert.equal(blank.requiredStatusSetGreen,false);
  const statuses=required.map(context=>({context,state:'success'}));
  assert.equal(report({sha:'b',state:'success',statuses}).requiredStatusSetGreen,true);
  assert.equal(report({sha:'c',state:'success',statuses:statuses.slice(1)}).requiredStatusSetGreen,false);
  assert.equal(report({sha:'d',state:'failure',statuses:[{context:required[0],state:'failure'},...statuses]}).requiredStatusSetGreen,false);
  assert.equal(report({sha:'e',state:'failure',statuses:[...statuses,{context:'Extra gate',state:'failure'}]}).requiredStatusSetGreen,false);
  return 'R2248_QUALITY_GATE_SELF_TEST_PASS';
}
if(require.main===module){
  if(process.argv[2]==='--self-test')console.log(selfTest());
  else console.log(JSON.stringify(report(JSON.parse(fs.readFileSync(process.argv[2],'utf8'))),null,2));
}
module.exports={report,selfTest};

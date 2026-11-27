'use strict';
// Deterministic, bounded repair. Canonical HTML owns current runtime cache keys.
// Never modify graphics, CSP permissions, checkout, or acceptance thresholds.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const HTML='docs/scifi-ui/index.html';
const ARCHIVE='.github/workflows/measure-mag-scroll-budget-r2226.yml';
const WORKER='billing-worker/src/production-content-entry.js';
const ACTIVE_WORKER='billing-worker/src/production-content-entry-r529.js';
const GATE='.github/scripts/validate-mag-debanding-r2035.cjs';
const JOURNEY='.github/scripts/validate-cinematic-journey-r536.cjs';
const scripts='docs/scifi-ui/scripts/';
const files=[HTML,ARCHIVE,WORKER,scripts+'formatx-p0-motion-scheduler-r490.js',
  scripts+'formatx-motion-runtime-loader-r239.js',scripts+'formatx-current-mag-loader-r422.js',
  scripts+'formatx-core-mobile-v55.js',GATE,ACTIVE_WORKER,JOURNEY];
function revision(text,name){
  const re=new RegExp(name.replace(/\./g,'\\.')+'\\?v=(\\d{8}-r\\d{3,4}(?:-r\\d{3,4})?-[a-z0-9-]+)','g');
  const matches=[...text.matchAll(re)].map(m=>m[1]);
  assert(matches.length===1,'Ambiguous canonical cache owner: '+name);
  return matches[0];
}
function align(text,name,value,count){
  const re=new RegExp('('+name.replace(/\./g,'\\.')+'\\?v=)(\\d{8}-r\\d{3,4}(?:-r\\d{3,4})?-[a-z0-9-]+)','g');
  const matches=[...text.matchAll(re)];
  assert.equal(matches.length,count,'Unexpected reference count for '+name);
  return text.replace(re,(_,prefix)=>prefix+value);
}
function plan(input){
  const out={...input};
  const archive=revision(input[HTML],'formatx-cinematic-archive-r1987.js');
  const scheduler=revision(input[HTML],'formatx-p0-motion-scheduler-r490.js');
  const deferredCss=revision(input[HTML],'formatx-deferred-css-r487.js');
  out[ARCHIVE]=align(input[ARCHIVE],'formatx-cinematic-archive-r1987.js',archive,1);
  // R2242 canonical runtime release chain deliberately uses a single cache key.
  out[WORKER]=align(align(input[WORKER],'formatx-p0-motion-scheduler-r490.js',scheduler,1),
    'formatx-motion-runtime-loader-r239.js',scheduler,1);
  out[WORKER]=align(out[WORKER],'formatx-deferred-css-r487.js',deferredCss,1);
  out[ACTIVE_WORKER]=align(input[ACTIVE_WORKER],'formatx-deferred-css-r487.js',deferredCss,1);
  out[JOURNEY]=align(input[JOURNEY],'formatx-deferred-css-r487.js',deferredCss,1);
  out[files[3]]=align(input[files[3]],'formatx-motion-runtime-loader-r239.js',scheduler,1);
  out[files[4]]=align(align(input[files[4]],'formatx-current-mag-loader-r422.js',scheduler,1),
    'formatx-crystal-organism-r326.js',scheduler,1);
  out[files[5]]=align(input[files[5]],'formatx-crystal-organism-r326.js',scheduler,1);
  out[files[6]]=align(input[files[6]],'formatx-crystal-organism-r326.js',scheduler,1);
  // The strict gate must assert the same exact cache key as the complete
  // runtime chain. Only these six known literal references may be rewritten.
  out[GATE]=input[GATE];
  for(const [name,count] of [
    ['formatx-p0-motion-scheduler-r490.js',2],
    ['formatx-motion-runtime-loader-r239.js',2],
    ['formatx-current-mag-loader-r422.js',1],
    ['formatx-crystal-organism-r326.js',1]
  ])out[GATE]=align(out[GATE],name,scheduler,count);
  return out;
}
function selfTest(){
  const rev='20261126-r2241-software-scroll-settle',old='20261026-r2194-polished-four-arm-mag',archive='20261126-r2058-r2245-trusted-journey',deferredCss='20261126-r2257-single-activation-task';
  const ref=(n,v)=>n+'.js?v='+v;
  const input={
    [HTML]:ref('formatx-cinematic-archive-r1987',archive)+' '+ref('formatx-p0-motion-scheduler-r490',rev)+' '+ref('formatx-deferred-css-r487',deferredCss),
    [ARCHIVE]:ref('formatx-cinematic-archive-r1987',old),
    [WORKER]:ref('formatx-p0-motion-scheduler-r490',old)+' '+ref('formatx-motion-runtime-loader-r239',old)+' '+ref('formatx-deferred-css-r487',old),
    [files[3]]:ref('formatx-motion-runtime-loader-r239',old),
    [files[4]]:ref('formatx-current-mag-loader-r422',old)+' '+ref('formatx-crystal-organism-r326',old),
    [files[5]]:ref('formatx-crystal-organism-r326',old),
    [files[6]]:ref('formatx-crystal-organism-r326',old),
    [GATE]:[ref('formatx-p0-motion-scheduler-r490',old),ref('formatx-p0-motion-scheduler-r490',old),
      ref('formatx-motion-runtime-loader-r239',old),ref('formatx-motion-runtime-loader-r239',old),
      ref('formatx-current-mag-loader-r422',old),ref('formatx-crystal-organism-r326',old)].join('\n'),
    [ACTIVE_WORKER]:ref('formatx-deferred-css-r487',old),
    [JOURNEY]:ref('formatx-deferred-css-r487',old)
  };
  const repaired=plan(input);
  assert(repaired[ARCHIVE].includes(archive));
  assert.equal(Object.keys(repaired).filter(k=>k!==HTML&&repaired[k].includes(old)).length,0);
  assert.deepEqual(plan(repaired),repaired,'Repair must be idempotent');
  assert.equal(repaired[HTML],input[HTML],'Canonical owner must not be changed');
  assert.throws(()=>plan({...input,[HTML]:input[HTML]+' '+input[HTML]}),/Ambiguous/);
  assert.throws(()=>plan({...input,[files[6]]:'missing'}),/Unexpected reference count/);
  assert.throws(()=>plan({...input,[GATE]:input[GATE]+'\n'+input[GATE]}),/Unexpected reference count/);
  assert.equal(repaired[GATE].split(rev).length-1,6,'All six exact gate references must align');
  assert.ok(repaired[WORKER].includes(deferredCss));
  assert.ok(repaired[ACTIVE_WORKER].includes(deferredCss));
  assert.ok(repaired[JOURNEY].includes(deferredCss));
  return 'R2246_AUTO_REPAIR_SELF_TEST_PASS';
}
function main(){
  const mode=process.argv[2]||'--check';
  assert(['--check','--apply','--self-test'].includes(mode),'Expected --check, --apply or --self-test');
  console.log(selfTest());
  if(mode==='--self-test')return;
  const input=Object.fromEntries(files.map(p=>[p,fs.readFileSync(path.resolve(p),'utf8')]));
  const output=plan(input);
  const changed=files.filter(p=>output[p]!==input[p]);
  console.log('FX_AUTO_REPAIR_PLAN '+JSON.stringify({mode,changed}));
  if(mode==='--apply'){
    // All inputs and expected counts are checked before the first write.
    for(const p of changed)fs.writeFileSync(path.resolve(p),output[p],'utf8');
  }else if(changed.length)process.exitCode=1;
}
if(require.main===module)main();
module.exports={plan,selfTest,files};

'use strict';
// R2229: test the real Lighthouse reporter against a representative LHR,
// including out-of-order task timings and a missing optional audit.
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'formatx-r2229-'));
try{
  const lhr={
    categories:{performance:{score:.7},accessibility:{score:1},
      'best-practices':{score:1},seo:{score:1}},
    audits:{
      'first-contentful-paint':{numericValue:1350},
      'largest-contentful-paint':{numericValue:1370},
      'total-blocking-time':{numericValue:1230},
      'cumulative-layout-shift':{numericValue:.03},
      'speed-index':{numericValue:6100},
      'long-tasks':{details:{items:[
        {duration:90,startTime:200,url:'first.js'},
        {duration:320,startTime:400,url:'native-mag.js'},
        {duration:185,startTime:300,url:'layout.js'}
      ]}},
      'bootup-time':{details:{items:[
        {url:'other.js',total:100,scripting:81,scriptParseCompile:12},
        {url:'native-mag.js',total:700,scripting:390,scriptParseCompile:34}
      ]}}
    }
  };
  fs.writeFileSync(path.join(dir,'lhr-r2229.json'),JSON.stringify(lhr));
  const run=spawnSync(process.execPath,
    ['.github/scripts/report-lighthouse-metrics.cjs',dir],
    {encoding:'utf8',env:{...process.env,PROFILE:'mobile'}});
  assert.equal(run.status,0,run.stderr||run.stdout);
  const data=JSON.parse(fs.readFileSync(path.join(dir,'paint-diagnostics.json'),'utf8'));
  assert.equal(data.paintDetails.length,1);
  const row=data.paintDetails[0];
  assert.equal(row.profile,'mobile');
  assert.equal(row.longTasks[0].durationMs,320);
  assert.equal(row.longTasks[0].source,'native-mag.js');
  assert.equal(row.longTasks[2].durationMs,90);
  assert.equal(row.bootupTasks[0].totalMs,700);
  assert.equal(row.bootupTasks[0].scriptingMs,390);
  assert.deepEqual(row.forcedReflows,[],'Missing optional reflow audit must not fail');
  assert(run.stdout.includes('LIGHTHOUSE_DIAG '));
  console.log('LIGHTHOUSE_R2229_REAL_LHR_BOTTLENECK_REPORT_PASS');
}finally{
  fs.rmSync(dir,{recursive:true,force:true});
}

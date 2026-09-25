'use strict';
const fs=require('node:fs');
const dir=process.argv[2];
const profile=process.env.PROFILE||'unknown';
if(!dir) throw new Error('Usage: node report-lighthouse-metrics.cjs <result-dir>');
const files=fs.readdirSync(dir).filter(f=>/^lhr-.*\.json$/.test(f)).sort();
if(!files.length) throw new Error('No Lighthouse LHR files found');
const metric=(lhr,id)=>lhr.audits?.[id]?.numericValue??null;
const rows=files.map((file,index)=>{
  const lhr=JSON.parse(fs.readFileSync(`${dir}/${file}`,'utf8'));
  const row={
    run:index+1,
    performance:lhr.categories?.performance?.score??null,
    accessibility:lhr.categories?.accessibility?.score??null,
    bestPractices:lhr.categories?.['best-practices']?.score??null,
    seo:lhr.categories?.seo?.score??null,
    fcp:metric(lhr,'first-contentful-paint'),
    lcp:metric(lhr,'largest-contentful-paint'),
    tbt:metric(lhr,'total-blocking-time'),
    cls:metric(lhr,'cumulative-layout-shift'),
    speedIndex:metric(lhr,'speed-index'),
    ttfb:metric(lhr,'server-response-time')
  };
  console.log(`LIGHTHOUSE_METRICS profile=${profile} run=${row.run} performance=${row.performance} fcp=${row.fcp} lcp=${row.lcp} tbt=${row.tbt} cls=${row.cls} speedIndex=${row.speedIndex} ttfb=${row.ttfb}`);
  return row;
});
fs.writeFileSync(`${dir}/metrics-summary.json`,JSON.stringify({profile,runs:rows},null,2)+'\n');

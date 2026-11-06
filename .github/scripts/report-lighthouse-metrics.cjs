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

const paintDetails=files.map((file,index)=>{
  const lhr=JSON.parse(fs.readFileSync(`${dir}/${file}`,'utf8'));
  const audits=lhr.audits||{};
  const node=audits['largest-contentful-paint-element']?.details?.items?.[0]?.node;
  const opportunities=Object.values(audits).filter(a=>a?.details?.type==='opportunity')
    .map(a=>({id:a.id,title:a.title,ms:a.details?.overallSavingsMs||0,
      bytes:a.details?.overallSavingsBytes||0}))
    .sort((a,b)=>b.ms-a.ms).slice(0,13);
  const failing=Object.values(audits).filter(a=>a&&typeof a.score==='number'
      &&a.score<.92&&a.scoreDisplayMode!=='informative')
    .map(a=>({id:a.id,score:a.score,title:a.title,
      savingsMs:a.details?.overallSavingsMs||0}))
    .sort((a,b)=>(b.savingsMs-a.savingsMs)||(a.score-b.score)).slice(0,13);
  const result={profile,run:index+1,
    lcpElement:node?.snippet||null,lcpSelector:node?.selector||null,
    lcpBreakdown:audits['lcp-breakdown-insight']?.details?.items?.slice(0,3)||[],
    lcpDiscovery:audits['lcp-discovery-insight']?.details?.items?.slice(0,2)||[],
    mainThread:audits['mainthread-work-breakdown']?.details?.items?.slice(0,8)||[],
    // R2242: expose individual blocking tasks and JS boot cost, rather than
    // attributing aggregate main-thread time to an unverified script.
    longTasks:audits['long-tasks']?.details?.items?.slice(0,12)
      .map(x=>({url:x.url||null,startTime:x.startTime,duration:x.duration}))||[],
    bootup:audits['bootup-time']?.details?.items?.slice(0,12)
      .map(x=>({url:x.url||null,total:x.total,scriptEvaluation:x.scriptEvaluation,
        scriptParseCompile:x.scriptParseCompile}))||[],
    blockers:audits['render-blocking-resources']?.details?.items?.slice(0,12)
      .map(x=>({url:x.url,ms:x.wastedMs}))||[],
    visualProgress:audits['screenshot-thumbnails']?.details?.items?.slice(0,16)
      .map(x=>x.timing)||[],
    layout:audits['layout-shift-elements']?.details?.items?.slice(0,8)
      .map(x=>({score:x.score,selector:x.node?.selector}))||[],
    opportunities,failing
  };
  console.log('LIGHTHOUSE_DIAG '+JSON.stringify(result));
  return result;
});
fs.writeFileSync(`${dir}/paint-diagnostics.json`,JSON.stringify({profile,paintDetails},null,2)+'\n');
fs.writeFileSync(`${dir}/metrics-summary.json`,JSON.stringify({profile,runs:rows},null,2)+'\n');

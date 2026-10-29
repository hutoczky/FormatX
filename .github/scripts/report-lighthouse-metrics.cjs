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
  // R2229: surface specific bottlenecks from the already-collected LHR.
  // No extra page run, synthetic browsing mode or weakened thresholds.
  // Mobile's 2+s Style & Layout must be traceable to a reproducible task.
  const auditRows=id=>{
    const values=audits[id]?.details?.items;
    return Array.isArray(values)?values:[];
  };
  const longTasks=auditRows('long-tasks')
    .map(item=>({
      durationMs:item.duration??null,
      startTimeMs:item.startTime??null,
      source:item.url||item.source||null
    }))
    .sort((a,b)=>(b.durationMs||0)-(a.durationMs||0)).slice(0,12);
  const bootupTasks=auditRows('bootup-time')
    .map(item=>({
      url:item.url||null,
      totalMs:item.total??null,
      scriptingMs:item.scripting??null,
      scriptParseCompileMs:item.scriptParseCompile??null
    }))
    .sort((a,b)=>(b.totalMs||0)-(a.totalMs||0)).slice(0,12);
  const forcedReflows=auditRows('forced-reflow-insight')
    .map(item=>({url:item.url||null,durationMs:item.duration||item.wastedMs||null,
      source:item.source||null})).slice(0,8);
  const result={profile,run:index+1,
    longTasks,bootupTasks,forcedReflows,
    lcpElement:node?.snippet||null,lcpSelector:node?.selector||null,
    lcpBreakdown:audits['lcp-breakdown-insight']?.details?.items?.slice(0,3)||[],
    lcpDiscovery:audits['lcp-discovery-insight']?.details?.items?.slice(0,2)||[],
    mainThread:audits['mainthread-work-breakdown']?.details?.items?.slice(0,8)||[],
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

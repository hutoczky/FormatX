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
  // Lighthouse v13 nests the LCP node in a table at details.items[0].items.
  // The previous direct .node lookup silently wrote null for every run.
  // Legacy and updated shapes are both supported without changing scoring.
  const legacyItems=audits['largest-contentful-paint-element']?.details?.items||[];
  const lcpRows=legacyItems.flatMap(item=>Array.isArray(item?.items)?item.items:[item]);
  const node=lcpRows.find(item=>item?.node)?.node||null;
  const phases=lcpRows.filter(item=>typeof item?.phase==='string').map(item=>({
    phase:item.phase,timing:item.timing,percent:item.percent
  }));
  const delay=phases.find(item=>item.phase==='Render Delay')?.timing??null;
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
    lcpRenderDelayMs:delay,
    lcpBreakdown:audits['lcp-breakdown-insight']?.details?.items?.slice(0,3)||phases,
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
  console.log('LIGHTHOUSE_LCP_DETAIL '+JSON.stringify({
    profile,run:index+1,selector:result.lcpSelector,
    nodeLabel:node?.nodeLabel||null,renderDelayMs:result.lcpRenderDelayMs,
    phases
  }));
  console.log('LIGHTHOUSE_DIAG '+JSON.stringify(result));
  return result;
});
fs.writeFileSync(`${dir}/paint-diagnostics.json`,JSON.stringify({profile,paintDetails},null,2)+'\n');
fs.writeFileSync(`${dir}/metrics-summary.json`,JSON.stringify({profile,runs:rows},null,2)+'\n');

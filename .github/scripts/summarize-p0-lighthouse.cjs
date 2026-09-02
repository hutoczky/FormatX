'use strict';
const fs=require('node:fs');
const dir=process.argv[2];
const profile=process.env.PROFILE||'unknown';
if(!dir) throw new Error('Usage: node summarize-p0-lighthouse.cjs <result-dir>');
const files=fs.readdirSync(dir).filter(f=>/^lhr-.*\.json$/.test(f)).sort();
if(files.length!==3) throw new Error(`Expected exactly 3 Lighthouse runs, got ${files.length}`);
const summary=[];
for(let i=0;i<files.length;i++){
  const lhr=JSON.parse(fs.readFileSync(`${dir}/${files[i]}`,'utf8'));
  const categories={};
  for(const id of ['performance','accessibility','best-practices','seo']){
    const score=lhr.categories?.[id]?.score;
    categories[id]=score;
    console.log(`RUN ${i+1} CATEGORY ${id}: ${score}`);
    if(score!==1){
      for(const ref of lhr.categories?.[id]?.auditRefs||[]){const a=lhr.audits?.[ref.id];if(ref.weight>0&&a&&a.score!==null&&a.score<1)console.log(`FAIL-AUDIT ${ref.id} score=${a.score} title=${a.title} display=${a.displayValue||''}`)}
      throw new Error(`Run ${i+1} ${id} is not 1.0`);
    }
  }
  const metric=id=>lhr.audits?.[id]?.numericValue??null;
  const row={run:i+1,url:lhr.finalDisplayedUrl||lhr.finalUrl,categories,fcp:metric('first-contentful-paint'),lcp:metric('largest-contentful-paint'),cls:metric('cumulative-layout-shift'),tbt:metric('total-blocking-time'),speedIndex:metric('speed-index'),ttfb:metric('server-response-time')};
  if(!(row.lcp<2000))throw new Error(`Run ${i+1} LCP ${row.lcp}ms is not <2000ms`);
  if(!(row.cls<0.05))throw new Error(`Run ${i+1} CLS ${row.cls} is not <0.05`);
  summary.push(row);
  for(const id of ['largest-contentful-paint-element','lcp-breakdown-insight','render-blocking-insight','network-dependency-tree-insight','unused-javascript','unused-css-rules','bootup-time','mainthread-work-breakdown','image-delivery-insight','font-display-insight']){
    const a=lhr.audits?.[id];if(!a)continue;
    console.log(`DIAG run=${i+1} ${id} score=${a.score} numeric=${a.numericValue??''} display=${a.displayValue??''}`);
    if(Array.isArray(a.details?.items)&&a.details.items.length)console.log(`  items=${JSON.stringify(a.details.items.slice(0,8)).slice(0,9000)}`);
  }
}
fs.writeFileSync(`${dir}/p0-summary.json`,JSON.stringify({profile,runs:summary},null,2)+'\n');
console.log(`P0_LIGHTHOUSE_${profile.toUpperCase()}_3X_PASS`);

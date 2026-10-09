'use strict';
const fs=require('node:fs');
const path=require('node:path');
const dir=process.argv[2]||'.lighthouseci';
const files=fs.readdirSync(dir).filter(f=>/^lhr-.*\.json$/.test(f)).sort();
if(!files.length)throw new Error('Lighthouse LHR not present');
const candidates=['render-blocking-resources','unused-css-rules','unused-javascript','modern-image-formats',
 'legacy-javascript','largest-contentful-paint-element','lcp-discovery-insight',
 'lcp-breakdown-insight','render-blocking-insight','network-dependency-tree-insight',
 'mainthread-work-breakdown','bootup-time','third-party-summary','total-byte-weight',
 'layout-shifts','layout-shift-culprits-insight','cls-culprits-insight'];
for(const file of files){
 const lhr=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
 const issue=[];
 for(const id of candidates){
   const a=lhr.audits?.[id];if(!a)continue;
   const savingsMs=a.details?.overallSavingsMs??a.details?.items?.[0]?.wastedMs??null;
   const savingsBytes=a.details?.overallSavingsBytes??null;
   const snippets=(a.details?.items||[]).slice(0,7).map(x=>({
     source:(x.url||x.node?.snippet||x.node?.selector||x.label||'').slice(0,250),
     wastedMs:x.wastedMs??null,wastedBytes:x.wastedBytes??null,
     score:x.score??x.cumulativeScore??null,
     nodes:x.nodes?.slice(0,5).map(n=>({selector:n.node?.selector||n.node?.snippet||null,score:n.node?.score||null})),
     timing:x.timing??null,
     phases:x.phases||undefined
   }));
   if((typeof a.score==='number'&&a.score>.92)&&!savingsMs&&!savingsBytes)continue;
   issue.push({audit:id,score:a.score??null,display:a.displayValue||'',savingsMs,savingsBytes,items:snippets});
 }
 const input={
   profile:process.env.PROFILE||'unknown',file,
   score:lhr.categories?.performance?.score??null,
   metrics:{
     fcp:lhr.audits?.['first-contentful-paint']?.numericValue,
     lcp:lhr.audits?.['largest-contentful-paint']?.numericValue,
     speedIndex:lhr.audits?.['speed-index']?.numericValue,
     tbt:lhr.audits?.['total-blocking-time']?.numericValue,
     cls:lhr.audits?.['cumulative-layout-shift']?.numericValue
   },
   opportunities:issue
 };
 console.log('LIGHTHOUSE_OPPORTUNITIES '+JSON.stringify(input));
}

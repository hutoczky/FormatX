'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('billing-worker/src/production-content-entry-r529.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const tag=html.match(/<link\b[^>]*data-fx-critical-core-r227="true"[^>]*>/)[0];
assert.ok(tag.includes('data-fx-r487-deferred-style="true"'));
assert.ok(tag.includes('media="print"'));
const a=source.indexOf('    let html = await response.text();'),b=source.indexOf('    html = html.replace(DEFERRED_SCHEDULER_RE',a);
assert.ok(a>=0&&b>a);
const run=new Function('response','HOMEPAGE_PATHS','url','restoreCriticalCoreFirstPaint','return (async()=>{'+source.slice(a,b)+'return html;})()');
const aliases=new Set(['/','/index.html','/scifi-ui','/scifi-ui/','/scifi-ui/index.html']);
(async()=>{
 let restored=0;
 const legacy=x=>{restored++;return x.replace('media="print"','media="all"');};
 for(const pathname of aliases){
   assert.equal(await run({text:async()=>tag},aliases,{pathname},legacy),tag);
 }
 assert.equal(restored,0);
 assert.ok((await run({text:async()=>tag},aliases,{pathname:'/other'},legacy)).includes('media="all"'));
 assert.equal(restored,1);
 console.log('R2342 production homepage preserves canonical deferred critical-core CSS: PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});

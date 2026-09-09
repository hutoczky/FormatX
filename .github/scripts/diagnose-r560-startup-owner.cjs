'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROME=process.env.CHROME_BIN;
const OUT=process.env.FORMATX_R560_EVIDENCE_DIR||'artifacts/r560-startup-owner';
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'];
const TRACE_CATEGORIES=[
  'devtools.timeline',
  'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame',
  'disabled-by-default-devtools.timeline.stack',
  'v8',
  'v8.execute',
  'disabled-by-default-v8.runtime_stats',
  'blink',
  'blink.user_timing',
  'loading',
  'toplevel',
  'renderer.scheduler',
  'cc',
  'gpu'
].join(',');
fs.mkdirSync(OUT,{recursive:true});
let TRACE_PAGE_ZERO_MS=0;
const compactData=data=>{if(!data||typeof data!=='object')return null;const out={};for(const key of ['url','scriptName','functionName','frame','type','nodeName','reason','timerId','taskType','queueName','priority','name','id','beginData','endData','sync_id'])if(data[key]!==undefined&&data[key]!==null&&data[key]!=='')out[key]=typeof data[key]==='object'?JSON.stringify(data[key]).slice(0,500):String(data[key]).slice(0,500);const top=data.stackTrace?.[0];if(top)out.stack={functionName:String(top.functionName||''),url:String(top.url||''),lineNumber:top.lineNumber,columnNumber:top.columnNumber};return Object.keys(out).length?out:null;};
const compactArgs=args=>{if(!args||typeof args!=='object')return null;const candidates=[args.data,args.beginData,args.endData,args];for(const candidate of candidates){const compact=compactData(candidate);if(compact)return compact;}return null;};
const asEvent=e=>({name:e.name,cat:e.cat||'',ph:e.ph,startMs:Number((Number(e.ts||0)/1000-TRACE_PAGE_ZERO_MS).toFixed(3)),durationMs:Number((Number(e.dur||0)/1000).toFixed(3)),pid:e.pid,tid:e.tid,data:compactArgs(e.args)});
function summariseProfile(profile,startMs=0,endMs=Infinity,pageZeroFromProfileStartMs=0){
  if(!profile||!Array.isArray(profile.nodes)||!Array.isArray(profile.samples)||!Array.isArray(profile.timeDeltas))return [];
  const nodes=new Map(profile.nodes.map(node=>[node.id,node]));
  const totals=new Map();let elapsedUs=0;
  for(let i=0;i<profile.samples.length;i+=1){
    const deltaUs=Number(profile.timeDeltas[i]||0);elapsedUs+=deltaUs;
    const atMs=elapsedUs/1000-pageZeroFromProfileStartMs;if(atMs<startMs||atMs>endMs)continue;
    const node=nodes.get(profile.samples[i]);if(!node)continue;
    const frame=node.callFrame||{};const url=String(frame.url||'');const fn=String(frame.functionName||'(anonymous)');
    const key=`${url}\n${fn}\n${frame.lineNumber??-1}:${frame.columnNumber??-1}`;
    const entry=totals.get(key)||{url,functionName:fn,lineNumber:frame.lineNumber??-1,columnNumber:frame.columnNumber??-1,selfMs:0,samples:0};
    entry.selfMs+=deltaUs/1000;entry.samples+=1;totals.set(key,entry);
  }
  return [...totals.values()].sort((a,b)=>b.selfMs-a.selfMs).slice(0,40).map(entry=>({...entry,selfMs:Number(entry.selfMs.toFixed(3))}));
}
function buildThreadNames(rawEvents){
  const names=new Map();
  for(const e of rawEvents){
    if(e.ph!=='M'||e.name!=='thread_name')continue;
    const name=e.args?.name||e.args?.data?.name;
    if(name)names.set(`${e.pid}:${e.tid}`,String(name));
  }
  return names;
}
function taskRawEvidence(rawEvents,task,threadNames){
  const start=Number(task.ts),end=start+Number(task.dur||0);
  const inside=rawEvents.filter(e=>e!==task&&e.pid===task.pid&&e.tid===task.tid&&Number(e.ts)>=start&&Number(e.ts)<=end);
  const summary=new Map();
  for(const e of inside){
    const key=`${e.name}|${e.ph}|${e.cat||''}`;
    const current=summary.get(key)||{name:e.name,ph:e.ph,cat:e.cat||'',count:0,totalMs:0,maxMs:0,examples:[]};
    const durationMs=Number(e.dur||0)/1000;
    current.count+=1;current.totalMs+=durationMs;current.maxMs=Math.max(current.maxMs,durationMs);
    const data=compactArgs(e.args);
    if(data&&current.examples.length<3)current.examples.push(data);
    summary.set(key,current);
  }
  const rawSummary=[...summary.values()].sort((a,b)=>(b.totalMs-a.totalMs)||(b.count-a.count)).slice(0,80).map(item=>({...item,totalMs:Number(item.totalMs.toFixed(3)),maxMs:Number(item.maxMs.toFixed(3))}));
  const rawNested=inside.filter(e=>e.name!=='ThreadControllerImpl::RunTask'||e.ph!=='E').sort((a,b)=>Number(a.ts)-Number(b.ts)).slice(0,220).map(asEvent);
  return {threadName:threadNames.get(`${task.pid}:${task.tid}`)||'',rawEventCount:inside.length,rawSummary,rawNested};
}
function releaseWindowThreads(rawEvents,threadNames){
  const grouped=new Map();
  for(const e of rawEvents){
    if(e.ph!=='X'||Number(e.dur||0)<10000)continue;
    const startMs=Number(e.ts||0)/1000-TRACE_PAGE_ZERO_MS;
    const endMs=startMs+Number(e.dur||0)/1000;
    if(endMs<800||startMs>1900)continue;
    const key=`${e.pid}:${e.tid}`;
    const current=grouped.get(key)||{key,threadName:threadNames.get(key)||'',totalMs:0,maxMs:0,events:[]};
    const durationMs=Number(e.dur||0)/1000;
    current.totalMs+=durationMs;current.maxMs=Math.max(current.maxMs,durationMs);
    if(current.events.length<24)current.events.push(asEvent(e));
    grouped.set(key,current);
  }
  return [...grouped.values()].sort((a,b)=>b.totalMs-a.totalMs).slice(0,20).map(item=>({...item,totalMs:Number(item.totalMs.toFixed(3)),maxMs:Number(item.maxMs.toFixed(3))}));
}
(async()=>{
  if(!CHROME)throw new Error('CHROME_BIN is required');
  const browser=await chromium.launch({executablePath:CHROME,headless:true,args:ARGS});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:'hu-HU',colorScheme:'dark',reducedMotion:'no-preference'});
  const page=await context.newPage();
  const client=await context.newCDPSession(page);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const tracingComplete=new Promise(resolve=>client.once('Tracing.tracingComplete',resolve));
  await client.send('Profiler.enable');
  await client.send('Profiler.setSamplingInterval',{interval:500});
  await client.send('Profiler.start');
  await client.send('Tracing.start',{categories:TRACE_CATEGORIES,options:'sampling-frequency=10000',transferMode:'ReturnAsStream'});
  const url=new URL(BASE);url.searchParams.set('r718_trace',Date.now().toString());
  await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
  const anchorId=`fx-r718-page-clock-${Date.now()}`;
  const pageAnchor=await page.evaluate(id=>{performance.mark(id);const mark=performance.getEntriesByName(id,'mark')[0];return{id,startTime:mark?.startTime??performance.now(),now:performance.now()};},anchorId);
  await page.waitForTimeout(3200);
  const runtime=await page.evaluate(()=>({
    now:performance.now(),
    resources:performance.getEntriesByType('resource').filter(e=>/\/scifi-ui\//.test(e.name)).map(e=>({name:e.name.replace(location.origin,''),initiatorType:e.initiatorType,startTime:e.startTime,duration:e.duration,responseEnd:e.responseEnd,transferSize:e.transferSize})).sort((a,b)=>a.startTime-b.startTime),
    paints:performance.getEntriesByType('paint').map(e=>({name:e.name,startTime:e.startTime})),
    navigation:(()=>{const n=performance.getEntriesByType('navigation')[0];return n?{responseStart:n.responseStart,domInteractive:n.domInteractive,domContentLoadedEventStart:n.domContentLoadedEventStart,domContentLoadedEventEnd:n.domContentLoadedEventEnd,loadEventStart:n.loadEventStart,loadEventEnd:n.loadEventEnd}:null;})(),
    state:{preloader:document.documentElement.dataset.fxPreloaderR531||'',release:document.documentElement.dataset.fxPreloaderReleaseR531||'',releaseElapsed:document.documentElement.dataset.fxPreloaderReleaseElapsedR635||'',crystal:document.documentElement.dataset.fxCrystalOrganismR326||'',renderer:document.documentElement.dataset.fxCoreRenderer||'',shaderCompile:document.documentElement.dataset.fxCoreShaderCompileR550||'',offscreen:document.documentElement.dataset.fxMagOffscreenR571||'',transport:document.documentElement.dataset.fxMagOffscreenTransportR598||'',contextPolicy:document.documentElement.dataset.fxMagContextPolicyR561||''}
  }));
  const {profile}=await client.send('Profiler.stop');
  await client.send('Profiler.disable');
  await client.send('Tracing.end');
  const complete=await tracingComplete;const handle=complete.stream;if(!handle)throw new Error('Tracing stream unavailable');
  let raw='';for(;;){const part=await client.send('IO.read',{handle,size:4*1024*1024});raw+=part.data||'';if(part.eof)break;}await client.send('IO.close',{handle});
  const trace=JSON.parse(raw);const rawEvents=trace.traceEvents||[];const threadNames=buildThreadNames(rawEvents);
  const anchorEvent=rawEvents.find(e=>e.name===anchorId);
  if(!anchorEvent)throw new Error(`R718 trace page clock anchor missing: ${anchorId}`);
  TRACE_PAGE_ZERO_MS=Number(anchorEvent.ts||0)/1000-Number(pageAnchor.startTime||0);
  const profilePageZeroMs=Number.isFinite(Number(profile?.startTime))?TRACE_PAGE_ZERO_MS-Number(profile.startTime)/1000:0;
  const interesting=new Set(['RunTask','ThreadControllerImpl::RunTask','EvaluateScript','FunctionCall','EventDispatch','ParseHTML','Layout','UpdateLayoutTree','RecalculateStyles','Paint','PrePaint','Commit','CompositeLayers','FireAnimationFrame','TimerFire','BeginMainThreadFrame','PipelineReporter']);
  const events=rawEvents.filter(e=>e.ph==='X'&&Number(e.dur)>=20000&&interesting.has(e.name)).map(asEvent).sort((a,b)=>b.durationMs-a.durationMs);
  const rendererCandidates=new Map();
  for(const e of rawEvents){
    if(e.ph!=='X'||e.name!=='EvaluateScript')continue;
    const source=String(e.args?.data?.url||'');
    if(!source.includes('/scifi-ui/'))continue;
    const key=`${e.pid}:${e.tid}`;rendererCandidates.set(key,(rendererCandidates.get(key)||0)+Number(e.dur||0));
  }
  const rendererKey=[...rendererCandidates.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
  const [rendererPid,rendererTid]=rendererKey.split(':').map(Number);
  const rendererTasks=Number.isFinite(rendererPid)?rawEvents.filter(e=>e.ph==='X'&&(e.name==='RunTask'||e.name==='ThreadControllerImpl::RunTask')&&e.pid===rendererPid&&e.tid===rendererTid&&Number(e.dur)>=20000).sort((a,b)=>Number(b.dur)-Number(a.dur)).slice(0,12):[];
  const rendererTaskDetails=rendererTasks.map(task=>{
    const start=Number(task.ts),end=start+Number(task.dur||0);
    const nested=rawEvents.filter(e=>e.ph==='X'&&e.pid===task.pid&&e.tid===task.tid&&e!==task&&Number(e.ts)>=start&&Number(e.ts)+Number(e.dur||0)<=end&&Number(e.dur||0)>=200).map(asEvent).sort((a,b)=>a.startMs-b.startMs||b.durationMs-a.durationMs).slice(0,160);
    const totals={};for(const item of nested)totals[item.name]=(totals[item.name]||0)+item.durationMs;
    return {task:asEvent(task),...taskRawEvidence(rawEvents,task,threadNames),nested,totals:Object.entries(totals).sort((a,b)=>b[1]-a[1]).map(([name,durationMs])=>({name,durationMs:Number(durationMs.toFixed(3))})).slice(0,40)};
  });
  const cpuProfile={full:summariseProfile(profile,-1000,Infinity,profilePageZeroMs),releaseWindow:summariseProfile(profile,700,1900,profilePageZeroMs),targetWindow:summariseProfile(profile,1000,1550,profilePageZeroMs)};
  const threadWindow=releaseWindowThreads(rawEvents,threadNames);
  const clock={anchorId,pageAnchor,traceAnchorMs:Number((Number(anchorEvent.ts||0)/1000).toFixed(3)),tracePageZeroMs:Number(TRACE_PAGE_ZERO_MS.toFixed(3)),profileStartMs:Number((Number(profile?.startTime||0)/1000).toFixed(3)),profilePageZeroMs:Number(profilePageZeroMs.toFixed(3))};
  const report={auditedSha:process.env.AUDITED_SHA||'',traceCategories:TRACE_CATEGORIES,clock,runtime,errors,rendererMainThread:rendererKey||null,rendererThreadName:threadNames.get(rendererKey)||'',releaseWindowThreads:threadWindow,rendererTaskDetails,cpuProfile,topEvents:events.slice(0,160)};
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('R718_STARTUP_OWNER '+JSON.stringify({clock,state:runtime.state,paints:runtime.paints,navigation:runtime.navigation,releaseWindowThreads:threadWindow,rendererMainThread:report.rendererMainThread,rendererThreadName:report.rendererThreadName,rendererTaskDetails:rendererTaskDetails.slice(0,4),cpuProfile,topEvents:events.slice(0,45),resources:runtime.resources.filter(r=>r.initiatorType==='script'||r.initiatorType==='link').slice(0,90)},null,2));
  await context.close();await browser.close();
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
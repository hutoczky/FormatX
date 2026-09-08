'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const BASE=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROME=process.env.CHROME_BIN;
const OUT=process.env.FORMATX_R560_EVIDENCE_DIR||'artifacts/r560-startup-owner';
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader'];
fs.mkdirSync(OUT,{recursive:true});
const compactData=data=>{if(!data||typeof data!=='object')return null;const out={};for(const key of ['url','scriptName','functionName','frame','type','nodeName','reason','timerId'])if(data[key]!==undefined&&data[key]!==null&&data[key]!=='')out[key]=String(data[key]);const top=data.stackTrace?.[0];if(top)out.stack={functionName:String(top.functionName||''),url:String(top.url||''),lineNumber:top.lineNumber,columnNumber:top.columnNumber};return Object.keys(out).length?out:null;};
const asEvent=e=>({name:e.name,startMs:e.ts/1000,durationMs:Number(e.dur||0)/1000,pid:e.pid,tid:e.tid,data:compactData(e.args?.data)});
(async()=>{
  if(!CHROME)throw new Error('CHROME_BIN is required');
  const browser=await chromium.launch({executablePath:CHROME,headless:true,args:ARGS});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:'hu-HU',colorScheme:'dark',reducedMotion:'no-preference'});
  const page=await context.newPage();
  const client=await context.newCDPSession(page);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const tracingComplete=new Promise(resolve=>client.once('Tracing.tracingComplete',resolve));
  await client.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,v8.execute,blink.user_timing,loading',options:'sampling-frequency=10000',transferMode:'ReturnAsStream'});
  const url=new URL(BASE);url.searchParams.set('r560_trace',Date.now().toString());
  await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(3200);
  const runtime=await page.evaluate(()=>({
    now:performance.now(),
    resources:performance.getEntriesByType('resource').filter(e=>/\/scifi-ui\//.test(e.name)).map(e=>({name:e.name.replace(location.origin,''),initiatorType:e.initiatorType,startTime:e.startTime,duration:e.duration,responseEnd:e.responseEnd,transferSize:e.transferSize})).sort((a,b)=>a.startTime-b.startTime),
    paints:performance.getEntriesByType('paint').map(e=>({name:e.name,startTime:e.startTime})),
    navigation:(()=>{const n=performance.getEntriesByType('navigation')[0];return n?{responseStart:n.responseStart,domInteractive:n.domInteractive,domContentLoadedEventStart:n.domContentLoadedEventStart,domContentLoadedEventEnd:n.domContentLoadedEventEnd,loadEventStart:n.loadEventStart,loadEventEnd:n.loadEventEnd}:null;})(),
    state:{preloader:document.documentElement.dataset.fxPreloaderR531||'',release:document.documentElement.dataset.fxPreloaderReleaseR531||'',crystal:document.documentElement.dataset.fxCrystalOrganismR326||'',renderer:document.documentElement.dataset.fxCoreRenderer||'',shaderCompile:document.documentElement.dataset.fxCoreShaderCompileR550||''}
  }));
  await client.send('Tracing.end');
  const complete=await tracingComplete;const handle=complete.stream;if(!handle)throw new Error('Tracing stream unavailable');
  let raw='';for(;;){const part=await client.send('IO.read',{handle,size:4*1024*1024});raw+=part.data||'';if(part.eof)break;}await client.send('IO.close',{handle});
  const trace=JSON.parse(raw);const rawEvents=trace.traceEvents||[];
  const interesting=new Set(['RunTask','EvaluateScript','FunctionCall','EventDispatch','ParseHTML','Layout','UpdateLayoutTree','RecalculateStyles','Paint','PrePaint','Commit','CompositeLayers','FireAnimationFrame','TimerFire']);
  const events=rawEvents.filter(e=>e.ph==='X'&&Number(e.dur)>=20000&&interesting.has(e.name)).map(asEvent).sort((a,b)=>b.durationMs-a.durationMs);
  const rendererCandidates=new Map();
  for(const e of rawEvents){
    if(e.ph!=='X'||e.name!=='EvaluateScript'||e.pid!==e.tid)continue;
    const source=String(e.args?.data?.url||'');
    if(!source.includes('/scifi-ui/'))continue;
    const key=`${e.pid}:${e.tid}`;rendererCandidates.set(key,(rendererCandidates.get(key)||0)+Number(e.dur||0));
  }
  const rendererKey=[...rendererCandidates.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
  const [rendererPid,rendererTid]=rendererKey.split(':').map(Number);
  const rendererTasks=Number.isFinite(rendererPid)?rawEvents.filter(e=>e.ph==='X'&&e.name==='RunTask'&&e.pid===rendererPid&&e.tid===rendererTid&&Number(e.dur)>=20000).sort((a,b)=>Number(b.dur)-Number(a.dur)).slice(0,10):[];
  const rendererTaskDetails=rendererTasks.map(task=>{
    const start=Number(task.ts),end=start+Number(task.dur||0);
    const nested=rawEvents.filter(e=>e.ph==='X'&&e.pid===task.pid&&e.tid===task.tid&&e!==task&&Number(e.ts)>=start&&Number(e.ts)+Number(e.dur||0)<=end&&Number(e.dur||0)>=500).map(asEvent).sort((a,b)=>a.startMs-b.startMs||b.durationMs-a.durationMs).slice(0,120);
    const totals={};for(const item of nested)totals[item.name]=(totals[item.name]||0)+item.durationMs;
    return {task:asEvent(task),nested,totals:Object.entries(totals).sort((a,b)=>b[1]-a[1]).map(([name,durationMs])=>({name,durationMs:Number(durationMs.toFixed(3))})).slice(0,30)};
  });
  const report={auditedSha:process.env.AUDITED_SHA||'',runtime,errors,rendererMainThread:rendererKey||null,rendererTaskDetails,topEvents:events.slice(0,120)};
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('R560_STARTUP_OWNER '+JSON.stringify({state:runtime.state,paints:runtime.paints,navigation:runtime.navigation,rendererMainThread:report.rendererMainThread,rendererTaskDetails:rendererTaskDetails.slice(0,6),topEvents:events.slice(0,35),resources:runtime.resources.filter(r=>r.initiatorType==='script'||r.initiatorType==='link').slice(0,80)},null,2));
  await context.close();await browser.close();
})().catch(error=>{console.error(error?.stack||error);process.exit(1);});
#!/usr/bin/env bash
set -euo pipefail

MODE="${CSS_MODE:?CSS_MODE must be batch or sequential}"
REPLICA="${REPLICA:-1}"
CANDIDATE_SHA="0c983b25cbabecbdd73c8df760638c0c7554663b"

case "$MODE" in
  batch|sequential) ;;
  *) echo "invalid CSS_MODE=$MODE" >&2; exit 2 ;;
esac

export MODE REPLICA

test "$(git rev-parse HEAD)" = "$CANDIDATE_SHA"
test -z "$(git status --porcelain)"

npm ci --prefix billing-worker
npm install --no-save --no-package-lock --no-audit --no-fund playwright@1.62.0

CHROME_BIN="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser)"
test -n "$CHROME_BIN"
export CHROME_BIN

python3 - <<'PY'
import os
from pathlib import Path
mode=os.environ['MODE']
assert mode in {'batch','sequential'}
p=Path('docs/scifi-ui/scripts/formatx-deferred-css-r487.js')
s=p.read_text()
a="  let fallback = 0;"
b=a+f"\n  const diagMode = {mode!r};\n  root.dataset.fxDiagCssMode = diagMode;"
assert a in s
s=s.replace(a,b,1)
old="""    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'));
    for (const link of links) {
      if (!(link instanceof HTMLLinkElement)) continue;
      const targetMedia = link.dataset.fxR487Media || 'all';
      if (link.media !== targetMedia) link.media = targetMedia;
      link.removeAttribute('fetchpriority');
    }

    root.dataset.fxDeferredCssR487 = 'ready';
    root.dataset.fxDeferredCssCountR487 = String(links.length);
    dispatchEvent(new CustomEvent('formatx:deferredcssready', {
      detail: { count: links.length, scheduler: 'post-first-paint-r487' }
    }));"""
new="""    const links = Array.from(document.querySelectorAll('link[data-fx-r487-deferred-style]'));
    const applyLink = link => {
      if (!(link instanceof HTMLLinkElement)) return;
      const targetMedia = link.dataset.fxR487Media || 'all';
      if (link.media !== targetMedia) link.media = targetMedia;
      link.removeAttribute('fetchpriority');
    };
    const finish = () => {
      root.dataset.fxDeferredCssR487 = 'ready';
      root.dataset.fxDeferredCssCountR487 = String(links.length);
      root.dataset.fxDiagCssApplied = String(links.filter(link => link instanceof HTMLLinkElement && link.media !== 'print').length);
      dispatchEvent(new CustomEvent('formatx:deferredcssready', {
        detail: { count: links.length, scheduler: diagMode === 'sequential' ? 'diag-one-style-per-frame' : 'post-first-paint-r487' }
      }));
    };
    if (diagMode === 'sequential') {
      let index = 0;
      const step = () => {
        if (index >= links.length) { finish(); return; }
        applyLink(links[index++]);
        requestAnimationFrame(step);
      };
      step();
      return;
    }
    for (const link of links) applyLink(link);
    finish();"""
assert old in s
p.write_text(s.replace(old,new,1))
PY

node --check docs/scifi-ui/scripts/formatx-deferred-css-r487.js

node <<'NODE'
const fs=require('node:fs');
const c=JSON.parse(fs.readFileSync('billing-worker/wrangler.jsonc','utf8'));
delete c.ai; delete c.routes; c.workers_dev=true;
fs.writeFileSync('billing-worker/wrangler.r519-cssab.json',JSON.stringify(c,null,2)+'\n');
NODE

echo '127.0.0.1 formatxsuite.com www.formatxsuite.com' | sudo tee -a /etc/hosts >/dev/null
(cd billing-worker && nohup npx wrangler dev --config wrangler.r519-cssab.json --ip 127.0.0.1 --port 8787 --local-protocol https > "$RUNNER_TEMP/r519-cssab-worker.log" 2>&1 &)

for i in $(seq 1 60); do
  if curl -kfsS -H 'Host: formatxsuite.com' https://127.0.0.1:8787/ >/dev/null 2>&1; then break; fi
  if [ "$i" = 60 ]; then cat "$RUNNER_TEMP/r519-cssab-worker.log" || true; exit 1; fi
  sleep 1
done

mkdir -p "artifacts/r519-css-scheduler/${MODE}-r${REPLICA}"
OUT="artifacts/r519-css-scheduler/${MODE}-r${REPLICA}/results.json"
export OUT

node <<'NODE'
'use strict';
const fs=require('node:fs');
const {chromium}=require('playwright');
const mode=process.env.MODE;
const replica=Number(process.env.REPLICA||1);
const outPath=process.env.OUT;
const median=a=>{const s=[...a].sort((x,y)=>x-y);return s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2};

async function one(run){
  const browser=await chromium.launch({
    executablePath:process.env.CHROME_BIN,
    headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--ignore-certificate-errors']
  });
  const context=await browser.newContext({
    ignoreHTTPSErrors:true,
    viewport:{width:1440,height:900},
    locale:'hu-HU',
    colorScheme:'dark'
  });
  const page=await context.newPage();
  await page.addInitScript(()=>{
    window.__fxm={paint:[],lcp:[],shift:[],long:[]};
    try{new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__fxm.paint.push({n:e.name,t:e.startTime}))).observe({type:'paint',buffered:true})}catch{}
    try{new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__fxm.lcp.push(e.startTime))).observe({type:'largest-contentful-paint',buffered:true})}catch{}
    try{new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__fxm.shift.push(e.value)})).observe({type:'layout-shift',buffered:true})}catch{}
    try{new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__fxm.long.push({s:e.startTime,d:e.duration}))).observe({type:'longtask',buffered:true})}catch{}
  });
  const cdp=await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  const response=await page.goto(`https://formatxsuite.com:8787/?replica=${replica}&run=${run}&ts=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.documentElement.dataset.fxDeferredCssR487==='ready',null,{timeout:10000});
  await page.waitForTimeout(3000);
  const x=await page.evaluate(()=>{
    const nav=performance.getEntriesByType('navigation')[0];
    return {
      search:location.search,
      diagMode:document.documentElement.dataset.fxDiagCssMode||'',
      ready:document.documentElement.dataset.fxDeferredCssR487||'',
      declaredCount:Number(document.documentElement.dataset.fxDeferredCssCountR487||0),
      appliedCount:Number(document.documentElement.dataset.fxDiagCssApplied||0),
      fcp:window.__fxm.paint.find(e=>e.n==='first-contentful-paint')?.t??0,
      lcp:window.__fxm.lcp.at(-1)??0,
      cls:window.__fxm.shift.reduce((a,b)=>a+b,0),
      tbt:window.__fxm.long.reduce((a,e)=>a+Math.max(0,e.d-50),0),
      longtasks:window.__fxm.long,
      ttfb:nav?.responseStart??0,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      firstDeferred:[...document.querySelectorAll('link[data-fx-r487-deferred-style]')].slice(0,3).map(l=>({href:l.getAttribute('href'),media:l.media}))
    };
  });
  const pm=(await cdp.send('Performance.getMetrics')).metrics.reduce((o,m)=>(o[m.name]=m.value,o),{});
  await context.close();
  await browser.close();
  return {
    mode,replica,run,status:response?.status()||0,...x,
    layoutMs:(pm.LayoutDuration||0)*1000,
    recalcMs:(pm.RecalcStyleDuration||0)*1000,
    taskMs:(pm.TaskDuration||0)*1000,
    scriptMs:(pm.ScriptDuration||0)*1000
  };
}

(async()=>{
  const rows=[];
  for(let run=1;run<=5;run++) rows.push(await one(run));
  for(const r of rows){
    if(r.status!==200||r.diagMode!==mode||r.ready!=='ready'||r.declaredCount<8||r.appliedCount!==r.declaredCount||r.overflow>2){
      throw new Error('diagnostic contract failed '+JSON.stringify(r));
    }
  }
  const summary={
    mode,replica,n:rows.length,
    first:rows[0],
    medianTbt:median(rows.map(r=>r.tbt)),maxTbt:Math.max(...rows.map(r=>r.tbt)),
    medianFcp:median(rows.map(r=>r.fcp)),maxFcp:Math.max(...rows.map(r=>r.fcp)),
    medianLcp:median(rows.map(r=>r.lcp)),maxLcp:Math.max(...rows.map(r=>r.lcp)),
    maxCls:Math.max(...rows.map(r=>r.cls)),
    medianLayout:median(rows.map(r=>r.layoutMs)),medianRecalc:median(rows.map(r=>r.recalcMs)),
    medianTask:median(rows.map(r=>r.taskMs)),medianScript:median(rows.map(r=>r.scriptMs))
  };
  console.log('R519_CSS_SCHEDULER_SUMMARY',JSON.stringify(summary,null,2));
  console.log('R519_CSS_SCHEDULER_ROWS',JSON.stringify(rows,null,2));
  fs.writeFileSync(outPath,JSON.stringify({summary,rows},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
NODE

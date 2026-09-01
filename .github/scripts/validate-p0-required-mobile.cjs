'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium, devices } = require('playwright');

const URL = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const EVIDENCE = process.env.P0_EVIDENCE_DIR || 'p0-evidence';
const SHOTS = path.join(EVIDENCE, 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

function fail(message) { throw new Error(message); }

function collect(page) {
  const state = { pageErrors: [], consoleErrors: [], failed: [], http: [] };
  page.on('pageerror', error => state.pageErrors.push(String(error)));
  page.on('console', msg => { if (msg.type() === 'error') state.consoleErrors.push(msg.text()); });
  page.on('requestfailed', req => {
    if (['document','script','stylesheet','image','font','media'].includes(req.resourceType())) state.failed.push(`${req.resourceType()} ${req.url()} ${req.failure()?.errorText || ''}`);
  });
  page.on('response', res => {
    if (res.status() >= 400 && ['document','script','stylesheet','image','font','media'].includes(res.request().resourceType())) state.http.push(`${res.status()} ${res.url()}`);
  });
  return state;
}

async function probe(page, name) {
  await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(900);
  const height = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0));
  const inner = await page.evaluate(() => innerHeight);
  const max = Math.max(0, height - inner);
  for (const ratio of [0,.25,.5,.75,1]) {
    await page.evaluate(y => scrollTo(0,y), Math.round(max * ratio));
    await page.waitForTimeout(130);
  }
  await page.evaluate(() => scrollTo(0,0));
  await page.waitForTimeout(120);
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const clipped = [];
    for (const el of document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,label,[role="button"],[role="link"]')) {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0 || r.width < 1 || r.height < 1 || el.closest('[aria-hidden="true"]')) continue;
      const x = el.scrollWidth > el.clientWidth + 3 && ['hidden','clip'].includes(cs.overflowX);
      const y = el.scrollHeight > el.clientHeight + 3 && ['hidden','clip'].includes(cs.overflowY);
      if (x || y) clipped.push({ tag:el.tagName, id:el.id||null, className:String(el.className||'').slice(0,100), text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,100), client:[el.clientWidth,el.clientHeight], scroll:[el.scrollWidth,el.scrollHeight], x, y });
    }
    const badTouch = [];
    for (const el of document.querySelectorAll('button,a[href],input,select,textarea,[role="button"],[role="link"]')) {
      const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      if (cs.display==='none'||cs.visibility==='hidden'||r.width<1||r.height<1||r.bottom<0||r.top>innerHeight*2) continue;
      const min=el.matches('button,[role="button"],input,select,textarea')?44:24;
      if (r.width+.5<min||r.height+.5<min) badTouch.push({tag:el.tagName,id:el.id||null,size:[Math.round(r.width),Math.round(r.height)],min});
    }
    return {
      overflow: Math.max(root.scrollWidth, body?.scrollWidth || 0) - root.clientWidth,
      clipped: clipped.slice(0,20),
      badTouch: badTouch.slice(0,20),
      textLength: (body?.innerText || '').trim().length,
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      ua: navigator.userAgent,
      platform: navigator.platform,
      touch: navigator.maxTouchPoints
    };
  });
}

async function runCase(browser, spec) {
  const context = await browser.newContext(spec.context);
  const page = await context.newPage();
  const runtime = collect(page);
  try {
    const response = await page.goto(URL, { waitUntil:'domcontentloaded', timeout:45000 });
    if (!response || response.status() >= 400) fail(`${spec.name}: document status ${response?.status()}`);
    const layout = await probe(page, spec.name);
    if (layout.overflow > 1) fail(`${spec.name}: horizontal overflow ${layout.overflow}px`);
    if (layout.clipped.length) fail(`${spec.name}: clipped content ${JSON.stringify(layout.clipped.slice(0,6))}`);
    if (layout.badTouch.length) fail(`${spec.name}: undersized touch targets ${JSON.stringify(layout.badTouch.slice(0,6))}`);
    if (layout.textLength < 300 || layout.h1 < 1 || layout.main < 1) fail(`${spec.name}: readable semantic content missing`);
    if (runtime.pageErrors.length || runtime.consoleErrors.length || runtime.failed.length || runtime.http.length) fail(`${spec.name}: runtime/network errors ${JSON.stringify(runtime)}`);
    if (spec.android && !/Android/i.test(layout.ua)) fail(`${spec.name}: Android user-agent not active (${layout.ua})`);
    await page.screenshot({ path:path.join(SHOTS, `${spec.name}.png`), fullPage:false, animations:'disabled' });
    console.log(`PASS ${spec.name} overflow=${layout.overflow} touch=${layout.touch} ua=${layout.ua}`);
    return { name:spec.name, pass:true, layout, runtime };
  } finally { await context.close(); }
}

(async()=>{
  const browser = await chromium.launch({ headless:true, channel:'chrome' });
  const android = devices['Pixel 7'] || devices['Pixel 5'] || devices['Pixel 4'];
  if (!android) throw new Error('Playwright Android/Pixel device descriptor unavailable');
  try {
    const cases = [
      { name:'chrome-375x812-required', context:{ viewport:{width:375,height:812}, isMobile:true, hasTouch:true, deviceScaleFactor:2, locale:'hu-HU', colorScheme:'dark' } },
      { name:'android-chrome-required', android:true, context:{ ...android, viewport:{width:390,height:844}, locale:'hu-HU', colorScheme:'dark' } }
    ];
    const results=[];
    for (const spec of cases) results.push(await runCase(browser,spec));
    const report={ schema:'formatx-p0-required-mobile/v1', target:URL, generatedAt:new Date().toISOString(), results, pass:results.every(x=>x.pass) };
    fs.writeFileSync(path.join(EVIDENCE,'p0-required-mobile.json'), JSON.stringify(report,null,2)+'\n');
    fs.writeFileSync(path.join(EVIDENCE,'p0-required-mobile.log'), results.map(x=>`PASS ${x.name}`).join('\n')+'\n');
  } finally { await browser.close(); }
})().catch(error=>{ console.error(error); process.exit(1); });

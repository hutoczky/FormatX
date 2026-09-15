'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

const ORIGIN = 'http://127.0.0.1:4186';
const canonical = fs.readFileSync('docs/scifi-ui/index.html', 'utf8');

function compact(r) { return { x:r.x, y:r.y, width:r.width, height:r.height }; }
function diff(a,b) { return { x:b.x-a.x, y:b.y-a.y, width:b.width-a.width, height:b.height-a.height }; }

async function run(browser, language) {
  const context = await browser.newContext({ viewport:{width:1440,height:900}, locale:language==='en'?'en-GB':'hu-HU', reducedMotion:'no-preference' });
  const page = await context.newPage();
  await page.route(`${ORIGIN}/scifi-ui/index.html*`, async route => {
    let html = canonical
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<script\b[^>]*\/>/gi, '')
      .replace(/<link\b[^>]*formatx-first-frame-stability-r283\.css[^>]*>/gi, '');
    if (!html.includes('formatx-p0-first-paint-r490.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/scifi-ui/styles/formatx-p0-first-paint-r490.css?v=r501-local">\n</head>');
    await route.fulfill({ status:200, contentType:'text/html; charset=utf-8', body:html });
  });
  await page.goto(`${ORIGIN}/scifi-ui/index.html?r501=${language}`, { waitUntil:'domcontentloaded' });
  await page.evaluate(lang => {
    document.documentElement.lang=lang;
    document.documentElement.dataset.fxReferenceProductionR244='desktop';
    document.querySelectorAll('[data-hu][data-en]').forEach(el=>{ if(!el.matches('input,textarea')) el.textContent=el.dataset[lang]||el.textContent; });
  }, language);
  await page.waitForFunction(() => Array.from(document.styleSheets).some(s=>String(s.href||'').includes('formatx-p0-first-paint-r490.css')));
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const before=await page.evaluate(()=>{
    const copy=document.querySelector('#hero > .hero-grid > .hero-copy');
    const state=document.querySelector('#hero .fx-hero-product-state');
    const cs=getComputedStyle(copy);
    return { copy:copy.getBoundingClientRect(), display:cs.display, contain:cs.contain, count:document.querySelectorAll('#hero .fx-hero-product-state').length, canonical:state?.dataset.fxCanonicalHeroProductState||'' };
  });
  assert.equal(before.display,'block',`${language}: P0 does not own settled display before r283`);
  assert.match(before.contain,/layout/,`${language}: P0 does not own settled containment before r283`);
  assert.equal(before.count,1,`${language}: product-state count before r283`);
  assert.equal(before.canonical,'true',`${language}: canonical product-state marker missing`);
  await page.evaluate(()=>new Promise((resolve,reject)=>{
    const link=document.createElement('link'); link.rel='stylesheet'; link.href='/scifi-ui/styles/formatx-first-frame-stability-r283.css?v=r501-contract';
    link.onload=()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)); link.onerror=()=>reject(new Error('r283 failed')); document.head.appendChild(link);
  }));
  const after=await page.evaluate(()=>({ copy:document.querySelector('#hero > .hero-grid > .hero-copy').getBoundingClientRect(), count:document.querySelectorAll('#hero .fx-hero-product-state').length }));
  const d=diff(before.copy,after.copy);
  for(const [name,value] of Object.entries(d)) assert.ok(Math.abs(value)<=1,`${language}: hero-copy ${name} changed ${value}px when r283 activated`);
  assert.equal(after.count,1,`${language}: product-state count changed when r283 activated`);
  console.log(JSON.stringify({language,before:compact(before.copy),after:compact(after.copy),delta:d,productStateCount:after.count},null,2));
  await context.close();
}

(async()=>{ const browser=await chromium.launch({headless:true}); try{await run(browser,'hu');await run(browser,'en');}finally{await browser.close();} })().catch(e=>{console.error(e.stack||e);process.exit(1);});

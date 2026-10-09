'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const compact=fs.readFileSync('docs/scifi-ui/styles/formatx-mobile-first-shell-r2035.css','utf8');
const full=fs.readFileSync('docs/scifi-ui/styles/formatx-mobile-first-paint-r358.css','utf8');
const main=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert.match(html,/data-fx-mobile-compact-first-frame-r2037="true"/);
assert.match(html,/data-fx-mag-mobile-critical-r2037="true"/);
assert.match(html,/data-fx-p0-first-paint-r503="true"/);
assert.match(html,/data-fx-r487-media="\(max-width:900px\)" media="print" href="\/scifi-ui\/styles\/formatx-p0-first-paint-r490\.css/);
assert.match(html,/data-fx-mobile-first-paint-r358="true"[^>]*data-fx-r487-deferred-style="true"/);
assert.match(worker,/const FIRST_PAINT_LINK = '[^']*data-fx-r487-deferred-style/);
assert.match(worker,/const P0_FIRST_PAINT_LINK = '[^']*media="\(min-width:901px\)"/);
assert.match(worker,/!\/data-fx-r487-deferred-style\/i\.test\(tag\)/);
assert.match(compact,/min-height:48px!important/);
assert.match(full,/top:11px!important/);
assert.match(full,/height:48px!important/);
assert.match(main,/fxArchiveCinema/);
console.log('R2037_SOURCE_PASS: one real native MAG; mobile heavy CSS deferred; original HTML and 48px targets kept');
(async()=>{
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader']});
try{
for(const width of [320,390,768,1440]){
 const context=await browser.newContext({viewport:{width,height:width===320?568:width===390?844:width===768?1024:900},
  isMobile:width<=768,hasTouch:width<=768,reducedMotion:'no-preference'});
 await context.addInitScript(()=>{try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1')}catch{}});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:4178/scifi-ui/index.html?archive=1',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(2300);
 const data=await page.evaluate(()=>{
  const brand=document.querySelector('.topbar > a.brand');
  const rect=brand?.getBoundingClientRect();
  const root=document.documentElement;
  const styles=[...document.querySelectorAll('link[rel="stylesheet"]')];
  const deferredMobile=styles.filter(x=>x.href.includes('formatx-mobile-first-paint-r358.css'));
  const c=document.querySelector('#hero .fx-crystal-organism-r326-stage');
  return {brand:!!brand,brandHeight:rect?.height||0,brandWidth:rect?.width||0,
    overflow:root.scrollWidth-root.clientWidth,
    mobileCSS:deferredMobile.length,mag:!!c,
    html:document.querySelector('main#main-content')?.textContent?.trim().length||0,
    ready:root.dataset.fxArchiveExperience||'unset',
    url:location.pathname};
 });
 assert.ok(data.mag&&data.html>800,'Lost the native MAG or genuine HTML: '+JSON.stringify(data));
 assert.ok(data.brand&&data.brandHeight>=44,'Brand touch target <44px: '+JSON.stringify({width,...data}));
 assert.ok(data.overflow<=3,'Horizontal overflow: '+JSON.stringify({width,...data}));
 assert.equal(data.mobileCSS,1,'Duplicated mobile stylesheet: '+JSON.stringify({width,...data}));
 console.log('R2037_BROWSER_PASS',JSON.stringify({width,...data}));
 await context.close();
}
}finally{await browser.close();}
})().catch(e=>{console.error('R2037_BROWSER_FAIL',e.stack||String(e));process.exitCode=1;});

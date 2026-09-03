'use strict';
const fs=require('node:fs');
const {chromium}=require('playwright');
const URL=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_R502_OVERFLOW_DIR||'artifacts/r502-overflow';
fs.mkdirSync(OUT,{recursive:true});
function assert(v,m){if(!v)throw new Error(m);}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,locale:'hu-HU',colorScheme:'dark'});
  await context.addInitScript(()=>{try{localStorage.setItem('formatx:intro-seen-v1','1');localStorage.setItem('formatx-thought-genome-enabled','true');localStorage.setItem('formatx-thought-genome-form','auto');localStorage.removeItem('formatx-thought-genome-history-v1');}catch(_){}});
  const page=await context.newPage();
  await page.goto(URL+'?lang=hu&thought-genome-test=1',{waitUntil:'domcontentloaded'});
  const launch=page.locator('.fx-immersive-launch').first();
  if(await launch.count()&&await launch.isVisible()) await launch.click(); else await page.evaluate(()=>{document.documentElement.dataset.fxImmersive='active';dispatchEvent(new CustomEvent('formatx:immersiveactivate',{detail:{source:'r502-overflow'}}));});
  await page.waitForFunction(()=>document.documentElement.dataset.fxThoughtGenome==='ready-v1'&&document.querySelector('.fx-thought-genome-controls'),null,{timeout:30000});
  const ask=page.locator('#hero .fx-reference-controls-r204 .fx-reference-ask').first();
  assert(await ask.count()===1,'canonical ASK missing'); await ask.click();
  await page.waitForFunction(()=>document.querySelector('.fx-organism-thought')?.hidden===false);
  await page.locator('#fx-organism-question-input').fill('Mennyibe kerül a licenc?');
  await page.locator('.fx-organism-ask').click();
  await page.waitForFunction(()=>document.documentElement.dataset.fxThoughtGenomeLastScene==='3',null,{timeout:10000});
  const summary=page.locator('.fx-thought-genome-disclosure > summary').first(); if(await summary.count())await summary.click();
  await page.waitForTimeout(100);
  const report=await page.evaluate(()=>{
    const props=['box-sizing','position','display','left','right','width','min-width','max-width','margin-left','margin-right','padding-left','padding-right','overflow-x','transform'];
    const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
    const matched=e=>{
      const out=[];
      for(const sheet of [...document.styleSheets]){
        let rules;try{rules=sheet.cssRules;}catch(_){continue;}
        const walk=(rs,media='')=>{for(const rule of [...rs]){
          if(rule.cssRules){const m=rule.media?.mediaText||media;if(!rule.media||matchMedia(m).matches)walk(rule.cssRules,m);continue;}
          if(!rule.selectorText||!e.matches(rule.selectorText))continue;
          const hit={sheet:sheet.href||'inline',selector:rule.selectorText,media,decl:{}};
          for(const p of props){const v=rule.style.getPropertyValue(p);if(v)hit.decl[p]=v+(rule.style.getPropertyPriority(p)?' !important':'');}
          if(Object.keys(hit.decl).length)out.push(hit);
        }};walk(rules);}
      return out;
    };
    const item=(sel)=>{const e=document.querySelector(sel);if(!e)return null;const cs=getComputedStyle(e);return {sel,rect:rect(e),computed:Object.fromEntries(props.map(p=>[p,cs.getPropertyValue(p)])),matched:matched(e)};};
    return {viewport:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,items:[item('.site-footer'),item('.footer-brand'),item('#fx-organism-thought-panel'),item('.fx-organism-thought'),item('.fx-thought-genome-disclosure'),item('.fx-thought-genome-controls')]};
  });
  console.log(JSON.stringify(report,null,2));
  fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));
  await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e&&e.stack||e);process.exit(1);});

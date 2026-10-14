'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const { chromium }=require('playwright');

const directory=path.resolve('artifacts/r2094-hero-title-paint');
fs.mkdirSync(directory,{recursive:true});
const ORIGIN=process.env.FORMATX_LOCAL_ORIGIN||'http://127.0.0.1:4186/scifi-ui/index.html';

async function diagnose(browser,name,viewport,isMobile){
  const context=await browser.newContext({
    viewport,deviceScaleFactor:isMobile?2:1,isMobile,hasTouch:isMobile,
    locale:'hu-HU',reducedMotion:'no-preference',colorScheme:'dark'
  });
  await context.addInitScript(()=>{
    const data=window.__fxR2094={
      born:performance.now(),lcps:[],paints:[],mutations:[],snapshots:[],resources:[]
    };
    try{
      new PerformanceObserver(list=>{
        for(const e of list.getEntries()){
          data.lcps.push({
            entryStart:Math.round(e.startTime),size:e.size||0,
            element:e.element?.outerHTML?.slice(0,280)||null,
            id:e.id||null,url:e.url||null
          });
        }
      }).observe({type:'largest-contentful-paint',buffered:true});
    }catch(error){data.lcpError=String(error);}
    try{
      new PerformanceObserver(list=>{
        for(const e of list.getEntries()){
          data.paints.push({name:e.name,ms:Math.round(e.startTime)});
        }
      }).observe({type:'paint',buffered:true});
    }catch(error){data.paintError=String(error);}
    const find=()=>document.querySelector('#hero-title .hero-title-main');
    const snap=()=>{
      if(data.snapshots.length>=110)return;
      const node=find();if(!node)return;
      const title=node.closest('#hero-title');
      const copy=node.closest('.hero-copy');
      const hero=node.closest('#hero');
      const obj=el=>{
        if(!el)return null;
        const s=getComputedStyle(el),r=el.getBoundingClientRect();
        return {
          x:Math.round(r.x),y:Math.round(r.y),
          w:Math.round(r.width),h:Math.round(r.height),
          display:s.display,visibility:s.visibility,opacity:s.opacity,
          font:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,
          transform:s.transform,filter:s.filter,
          contentVisibility:s.contentVisibility
        };
      };
      data.snapshots.push({
        ms:Math.round(performance.now()),main:obj(node),
        h1:obj(title),copy:obj(copy),hero:obj(hero),
        rootClass:document.documentElement.className,
        bodyClass:document.body?.className||'',
        reference:document.documentElement.dataset.fxReferenceProductionR244||null,
        ready:document.readyState
      });
    };
    const observer=new MutationObserver(records=>{
      for(const rec of records){
        if(data.mutations.length>=300)break;
        const t=rec.target;
        if(t?.closest?.('#hero')||t===document.documentElement||t===document.body)
          data.mutations.push({ms:Math.round(performance.now()),
            type:rec.type,node:(t?.id||t?.className||t?.nodeName||'').toString().slice(0,80),
            attr:rec.attributeName||null});
      }
    });
    const begin=()=>{
      observer.observe(document.documentElement,{
        childList:true,subtree:true,attributes:true,
        attributeFilter:['class','style','data-fx-reference-production-r244','data-fx-design-system']
      });
      snap();
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});
    else begin();
    setInterval(snap,50);
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(ORIGIN,{waitUntil:'domcontentloaded',timeout:60000});
  for(const wait of [450,600,850,1450]){
    await page.waitForTimeout(wait);
    await page.screenshot({path:path.join(directory,`${name}-${wait}.png`),animations:'allow'});
  }
  const result=await page.evaluate(()=>{
    const d=window.__fxR2094;
    d.resources=performance.getEntriesByType('resource')
      .filter(e=>/\.css|\.js/.test(e.name))
      .map(e=>({url:e.name.split('/').pop(),start:Math.round(e.startTime),
        duration:Math.round(e.duration),end:Math.round(e.responseEnd)}))
      .sort((a,b)=>a.start-b.start);
    return JSON.parse(JSON.stringify(d));
  });
  assert.ok(result.snapshots.length>=25,`Not enough actual paint samples: ${name}`);
  assert.ok(result.lcps.length>=1,`No actual LCP entries: ${name}`);
  fs.writeFileSync(path.join(directory,`${name}.json`),JSON.stringify({
    name,viewport,errors,...result
  },null,2)+'\n');
  console.log('R2094_REAL_HERO_LCP_DIAG',JSON.stringify({
    name,firstLCP:result.lcps[0],lastLCP:result.lcps.at(-1),
    lcpCandidates:result.lcps,firstPaint:result.paints,
    titleChanges:result.snapshots.reduce((out,x)=>{
      if(!out.length||JSON.stringify(out.at(-1).main)!==JSON.stringify(x.main))
        out.push({ms:x.ms,main:x.main,copy:x.copy});
      return out;
    },[]).slice(0,25),
    errors
  }));
  await context.close();
}

(async()=>{
  const browser=await chromium.launch({
    headless:true,args:['--no-sandbox','--disable-dev-shm-usage']
  });
  try{
    await diagnose(browser,'desktop-1440',{width:1440,height:900},false);
    await diagnose(browser,'mobile-390',{width:390,height:844},true);
  }finally{
    await browser.close();
  }
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});

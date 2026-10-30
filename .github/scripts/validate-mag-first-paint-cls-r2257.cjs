'use strict';
// R2257: read actual *visitor* layout shifts before/after the full
// biological film, without audit-only parameters or screenshot retries.
// Separate from Lighthouse, this gives an explicit mobile first-paint gate.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const url=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const out=process.env.FORMATX_FIRST_PAINT_CLS_DIR||
  'artifacts/r2257-first-paint-cls';
fs.mkdirSync(out,{recursive:true});
const profiles=[
  {name:'mobile-390',width:390,height:844,mobile:true},
  {name:'mobile-412',width:412,height:915,mobile:true}
];
(async()=>{
  const browser=await chromium.launch({
    executablePath:process.env.CHROME_BIN||undefined,headless:true,
    args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl',
      '--ignore-gpu-blocklist','--no-sandbox']
  });
  const results=[];
  try{
    for(const config of profiles){
      const context=await browser.newContext({
        viewport:{width:config.width,height:config.height},
        isMobile:config.mobile,hasTouch:config.mobile,
        deviceScaleFactor:2,reducedMotion:'no-preference',
        colorScheme:'dark',locale:'hu-HU'
      });
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push(String(error)));
      try{
        await page.addInitScript(()=>{
          // Captures standard CLS contributions, not page screenshots.
          window.__fxLayoutShiftsR2257=[];
          try{
            const observer=new PerformanceObserver(list=>{
              for(const entry of list.getEntries()){
                if(entry.hadRecentInput)continue;
                window.__fxLayoutShiftsR2257.push({
                  value:entry.value,startTime:entry.startTime,
                  sources:(entry.sources||[]).slice(0,4).map(source=>({
                    node:source.node?.id||
                      String(source.node?.className||source.node?.nodeName||'').slice(0,85),
                    previous:source.previousRect?
                      {x:source.previousRect.x,y:source.previousRect.y,
                        w:source.previousRect.width,h:source.previousRect.height}:null,
                    current:source.currentRect?
                      {x:source.currentRect.x,y:source.currentRect.y,
                        w:source.currentRect.width,h:source.currentRect.height}:null
                  }))
                });
              }
            });
            observer.observe({type:'layout-shift',buffered:true});
            window.__fxLayoutObserverR2257=observer;
          }catch(error){window.__fxLayoutErrorR2257=String(error);}
        });
        await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
        // Normal page experience: no ?intro=0, no ?audit, no forced motion
        // reduction and no test-side style/scroll/hit-test modification.
        await page.waitForFunction(()=>{
          const root=document.documentElement;
          return root.dataset.fxCrystalOrganismR326==='ready'&&
            !document.querySelector('.fx-mag-birth-r533')&&
            !!document.querySelector('#hero .fx-crystal-organism-r326-canvas');
        },null,{timeout:55000,polling:150});
        await page.waitForTimeout(700);
        const result=await page.evaluate(()=>{
          const root=document.documentElement;
          const items=window.__fxLayoutShiftsR2257||[];
          const cls=items.reduce((sum,item)=>sum+item.value,0);
          const select=selector=>{
            const el=document.querySelector(selector);
            if(!el)return null;
            const rect=el.getBoundingClientRect();
            const css=getComputedStyle(el);
            return {x:rect.x,y:rect.y,w:rect.width,h:rect.height,
              opacity:css.opacity,visibility:css.visibility};
          };
          return {
            cls:Number(cls.toFixed(6)),
            contributions:items.slice().sort((a,b)=>b.value-a.value).slice(0,12),
            totalEntries:items.length,
            observerError:window.__fxLayoutErrorR2257||null,
            nativeStatus:root.dataset.fxCrystalOrganismR326||'',
            gpuProof:root.dataset.fxMagHandoffGpuR2226||'',
            filmCount:document.querySelectorAll('.fx-mag-birth-r533').length,
            header:select('header.topbar'),
            mag:select('#hero .fx-crystal-organism-r326-canvas'),
            hero:select('#hero .hero-grid'),
            copy:select('#hero .hero-copy'),
            viewport:{w:innerWidth,h:innerHeight,scrollY}
          };
        });
        result.profile=config.name;
        result.errors=errors;
        results.push(result);
        await page.screenshot({
          path:path.join(out,config.name+'-normal-visitor.png'),
          fullPage:false
        });
        assert.equal(result.observerError,null,
          config.name+': PerformanceObserver layout-shift failed');
        assert.equal(result.nativeStatus,'ready',
          config.name+': original MAG must remain ready');
        assert.equal(result.filmCount,0,config.name+': film remains attached');
        assert(result.mag&&result.mag.w>100,
          config.name+': original 3D MAG canvas absent');
        assert(result.copy&&result.copy.w>250,
          config.name+': semantic hero-copy collapsed');
        assert(result.cls<=0.10,
          config.name+': real visitor CLS '+result.cls+' > 0.10');
        assert.deepEqual(errors,[],config.name+': browser JS errors');
        console.log('MAG_R2257_MOBILE_FIRST_PAINT_CLS_PASS',
          config.name,JSON.stringify({cls:result.cls,copyWidth:result.copy.w,
            magWidth:result.mag.w,totalEntries:result.totalEntries}));
      }finally{
        await context.close();
      }
    }
  }finally{
    fs.writeFileSync(path.join(out,'report.json'),
      JSON.stringify({commit:process.env.GITHUB_SHA||null,results},null,2));
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});

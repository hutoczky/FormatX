'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const ORIGIN=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2120-layout-shift';
fs.mkdirSync(OUT,{recursive:true});
const profiles=[
  {name:'desktop',width:1440,height:900,mobile:false,deviceScaleFactor:1},
  {name:'mobile',width:390,height:844,mobile:true,deviceScaleFactor:2}
];
const samples=[200,400,700,1000,1500,2000,3000,4200];
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage',
    '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'
  ]});
  try{
    for(const p of profiles){
      const context=await browser.newContext({
        viewport:{width:p.width,height:p.height},
        isMobile:p.mobile,hasTouch:p.mobile,
        deviceScaleFactor:p.deviceScaleFactor,locale:'hu-HU',
        colorScheme:'dark',reducedMotion:'no-preference'
      });
      try{
        await context.addInitScript(()=>{
          const records=window.__r2120={shifts:[],longtasks:[],errors:[]};
          for(const [name,output] of [
            ['layout-shift',records.shifts],
            ['longtask',records.longtasks]
          ]){
            try{
              new PerformanceObserver(list=>{
                for(const entry of list.getEntries()){
                  if(name==='layout-shift'&&entry.hadRecentInput)continue;
                  const data={
                    ms:Math.round(entry.startTime),value:entry.value||0,
                    duration:entry.duration||0,
                    sources:[...(entry.sources||[])].map(source=>{
                      let el=source.node;
                      return {
                        name:el?.tagName||'',
                        id:el?.id||'',
                        className:typeof el?.className==='string'?
                          el.className.slice(0,90):'',
                        before:source.previousRect&&[
                          source.previousRect.x,source.previousRect.y,
                          source.previousRect.width,source.previousRect.height],
                        after:source.currentRect&&[
                          source.currentRect.x,source.currentRect.y,
                          source.currentRect.width,source.currentRect.height]
                      };
                    })
                  };
                  output.push(data);
                }
              }).observe({type:name,buffered:true});
            }catch(error){records.errors.push(String(error))}
          }
        });
        const page=await context.newPage(),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.goto(ORIGIN+'?r2120-layout-audit=1',
          {waitUntil:'domcontentloaded',timeout:60000});
        let at=0;
        const snapshots=[];
        for(const waitMs of samples){
          await page.waitForTimeout(waitMs-at);at=waitMs;
          const state=await page.evaluate(()=>{
            const selectors=[
              '#hero','.hero-grid','.hero-copy','#hero-title',
              '.topbar','.fx-reference-heading','.fx-reference-mag-button',
              '#main-content','body'
            ];
            const elements=Object.fromEntries(selectors.map(sel=>{
              const n=document.querySelector(sel);
              if(!n)return [sel,{missing:true}];
              const b=n.getBoundingClientRect(),s=getComputedStyle(n);
              return [sel,{rect:[b.x,b.y,b.width,b.height].map(x=>Math.round(x)),
                position:s.position,display:s.display,visibility:s.visibility,
                opacity:s.opacity,transform:s.transform,
                fontSize:s.fontSize,contentVisibility:s.contentVisibility}];
            }));
            const root=document.documentElement;
            return {
              ms:Math.round(performance.now()),width:innerWidth,height:innerHeight,
              fonts:document.fonts.status,rootClass:root.className,
              htmlDataset:Object.fromEntries(Object.entries(root.dataset)
                .filter(([k])=>/intro|hero|mag|archive|preload|proof/i.test(k))
                .slice(0,44)),
              elements,
              stylesheetCount:document.styleSheets.length,
              styles:[...document.styleSheets].filter(x=>x.href).map(x=>({
                file:x.href.split('/').pop(),disabled:x.disabled,
                media:x.media?.mediaText||''
              }))
            };
          });
          snapshots.push(state);
          if(waitMs===700||waitMs===1500||waitMs===3000){
            await page.screenshot({
              path:path.join(OUT,p.name+'-'+waitMs+'ms.png'),
              animations:'allow'
            });
          }
        }
        const observed=await page.evaluate(()=>window.__r2120);
        const total=observed.shifts.reduce((sum,x)=>sum+x.value,0);
        const lateShift=observed.shifts
          .filter(x=>x.ms>=1000).reduce((sum,x)=>sum+x.value,0);
        const dock=await page.evaluate(()=>({
          scrollY:Math.round(scrollY),
          stageDocked:!!document.querySelector(
            '#hero .fx-crystal-organism-r326-stage.fx-archive-native-docked'
          ),
          gestureGate:document.documentElement.dataset.fxArchiveScrollEntryR2121||'',
          cinematic:document.documentElement.dataset.fxArchiveCinema||''
        }));
        const report={profile:p.name,snapshots,observed,total,lateShift,dock,errors};
        fs.writeFileSync(path.join(OUT,p.name+'.json'),
          JSON.stringify(report,null,2)+'\n');
        console.log('R2120_LAYOUT_SHIFT_PROFILE',JSON.stringify({
          profile:p.name,total,shiftRecords:observed.shifts,
          changingRects:snapshots.map(s=>({
            ms:s.ms,hero:s.elements['#hero']?.rect,
            grid:s.elements['.hero-grid']?.rect,
            header:s.elements['.topbar']?.rect,
            class:s.rootClass,
            fonts:s.fonts,
            cssCount:s.stylesheetCount
          })),errors
        }));
        assert.deepEqual(errors,[],
          'JS errors during first paint; inspect preserved diagnostics');
        assert.ok(dock.scrollY===0 && !dock.stageDocked,
          'R2121 must not move original live MAG before the visitor scrolls: '+
          JSON.stringify({profile:p.name,dock,observed:observed.shifts}));
        assert.ok(lateShift<.025,
          'Unexpected late idle layout shifts on the first untouched viewport: '+
          JSON.stringify({profile:p.name,lateShift,shifts:observed.shifts}));
      }finally{await context.close();}
    }
  }finally{await browser.close();}
})().catch(err=>{console.error(err.stack||String(err));process.exitCode=1;});

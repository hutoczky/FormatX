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
          // Core Web Vitals CLS is the largest layout-shift SESSION WINDOW,
          // NOT the sum of shifts over an arbitrarily long film. A session
          // ends after >1s quiet or 5s elapsed; recent-input shifts were
          // excluded by the pre-navigation observer.
          let cls=0,session=0,first=-Infinity,previous=-Infinity;
          for(const item of items){
            const at=item.startTime;
            if(at-previous>1000||at-first>5000){
              session=0;
              first=at;
            }
            session+=item.value;
            cls=Math.max(cls,session);
            previous=at;
          }
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
            archiveCinema:root.dataset.fxArchiveCinema||'home',
            archiveHero:root.dataset.fxArchiveLegacyHero||'not-suppressed',
            archiveCurrent:root.dataset.fxArchiveCurrent||'none',
            archiveSceneCount:Number(root.dataset.fxArchiveSceneCount||0),
            activeFolios:[...document.querySelectorAll(
              '.fx-archive-cinema-folio-r2030[data-fx-cinema-panel-active="true"]'
            )].map(el=>({
              textLength:(el.textContent||'').trim().length,
              inert:el.inert
            })),
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
        // R2258: the design deliberately hides the *legacy* hero-copy
        // while the original MAG is retrieving native HTML in its exclusive
        // archive. Its display:none is NOT a 0px layout defect. In that mode
        // require a real active, non-inert HTML folio, never a blank overlay.
        // Only ordinary/home mode must show the original full-width copy.
        const cinemaOwnsPage=result.archiveCinema==='active'
          &&result.archiveHero==='suppressed';
        if(cinemaOwnsPage){
          assert(result.archiveSceneCount>=2,
            config.name+': MAG archive has no native chapters');
          assert.equal(result.activeFolios.length,1,
            config.name+': archive must present precisely one native folio');
          assert(result.activeFolios[0].textLength>=30
            &&result.activeFolios[0].inert===false,
            config.name+': active MAG folio must expose real readable HTML');
          assert(result.copy!==null,
            config.name+': canonical semantic hero-copy removed from DOM');
        }else{
          assert(result.copy&&result.copy.w>250,
            config.name+': semantic hero-copy collapsed outside archive mode '
              +JSON.stringify({copy:result.copy,archive:result.archiveCinema,
                hero:result.archiveHero}));
        }
        assert(result.cls<=0.10,
          config.name+': real visitor CLS '+result.cls+' > 0.10');
        assert.deepEqual(errors,[],config.name+': browser JS errors');
        if(cinemaOwnsPage){
          // R2259: the living MAG must actually retrieve the next original
          // content when a person scrolls. Prevent a false pass where the
          // legacy hero is hidden but no content ever arrives onscreen.
          const targetDelta=await page.evaluate(()=>{
            const first=window.FormatXArchiveExperience?.scenes?.[0];
            const target=first?.id&&document.getElementById(first.id);
            const y=target?target.getBoundingClientRect().top+scrollY:900;
            return Math.max(240,Math.min(2000,Math.round(y-scrollY+80)));
          });
          // R2260: Playwright's emulated mouse wheel is not an Android
          // swipe. Preserve its diagnostic value, but if it fails to move
          // the document, replay an actual Chromium touch gesture along
          // the unobstructed left edge of the original living MAG.
          // Never use scrollTo/scrollBy or test-side CSS: a real visitor
          // must be able to reach the next chapter with touch input.
          await page.mouse.move(12,Math.floor(config.height*.76));
          await page.mouse.wheel(0,targetDelta);
          await page.waitForTimeout(450);
          const wheelY=await page.evaluate(()=>scrollY);
          let touchY=null;
          if(wheelY<100&&config.mobile){
            const session=await context.newCDPSession(page);
            try{
              const x=14;
              for(let swipe=0;swipe<2;swipe++){
                const yStart=Math.round(config.height*.78);
                const yEnd=Math.round(config.height*.24);
                await session.send('Input.dispatchTouchEvent',{
                  type:'touchStart',touchPoints:[{x,y:yStart,id:0}]
                });
                for(let step=1;step<=12;step++){
                  await session.send('Input.dispatchTouchEvent',{
                    type:'touchMove',
                    touchPoints:[{x,y:Math.round(yStart+(yEnd-yStart)*step/12),id:0}]
                  });
                  await page.waitForTimeout(18);
                }
                await session.send('Input.dispatchTouchEvent',{
                  type:'touchEnd',touchPoints:[]
                });
                await page.waitForTimeout(210);
                if((await page.evaluate(()=>scrollY))>=100)break;
              }
              touchY=await page.evaluate(()=>scrollY);
            }finally{await session.detach();}
          }
          await page.waitForTimeout(500);
          const reveal=await page.evaluate(()=>{
            const root=document.documentElement;
            const folio=document.querySelector(
              '.fx-archive-cinema-folio-r2030[data-fx-cinema-panel-active="true"]'
            );
            const box=folio?.getBoundingClientRect();
            const style=folio&&getComputedStyle(folio);
            return {
              scrollY,scene:root.dataset.fxArchiveCurrent||'none',
              camera:root.dataset.fxArchiveCinema||'home',
              viewportH:innerHeight,
              folioPresent:!!folio,
              textLength:(folio?.textContent||'').trim().length,
              inert:folio?.inert??true,
              display:style?.display||'none',
              visibility:style?.visibility||'hidden',
              opacity:Number(style?.opacity||0),
              intersects:!!box&&box.bottom>90&&box.top<innerHeight-25
                &&box.width>190&&box.height>70
            };
          });
          result.scrollInput={targetDelta,wheelY,touchY,
            method:wheelY>=100?'wheel':'real-cdp-touch'};
          result.scrollExtraction=reveal;
          if(reveal.scrollY<100){
            result.scrollInput.scrollContext=await page.evaluate(()=>{
              const html=getComputedStyle(document.documentElement);
              const body=getComputedStyle(document.body);
              return {
                scrollingElement:document.scrollingElement?.tagName||'none',
                scrollHeight:document.scrollingElement?.scrollHeight||0,
                clientHeight:document.scrollingElement?.clientHeight||0,
                htmlOverflowY:html.overflowY,bodyOverflowY:body.overflowY,
                htmlTouchAction:html.touchAction,bodyTouchAction:body.touchAction,
                archive:document.documentElement.dataset.fxArchiveCinema||'none'
              };
            });
          }
          await page.screenshot({
            path:path.join(out,config.name+'-mag-reveals-first-chapter.png'),
            fullPage:false
          });
          assert(reveal.scrollY>=100&&reveal.camera==='active'
            &&reveal.scene!=='none'&&reveal.folioPresent
            &&!reveal.inert&&reveal.display!=='none'
            &&reveal.visibility==='visible'&&reveal.opacity>.10
            &&reveal.intersects&&reveal.textLength>=30,
            config.name+': original MAG did not reveal a readable chapter on scroll '
              +JSON.stringify(reveal));
          console.log('MAG_R2259_SCROLL_MATERIALIZATION_PASS',
            config.name,JSON.stringify(reveal));
        }
        console.log('MAG_R2258_MOBILE_FIRST_PAINT_CLS_PASS',
          config.name,JSON.stringify({cls:result.cls,
            mode:cinemaOwnsPage?'mag-owned-archive':'semantic-hero',
            copyWidth:result.copy?.w||0,folioCount:result.activeFolios.length,
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

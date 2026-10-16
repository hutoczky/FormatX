'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const BASE=process.env.FORMATX_TEST_URL||
  'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT='artifacts/r2120-real-cls-source';
fs.mkdirSync(OUT,{recursive:true});

const viewports=[
  {name:'desktop-1440',width:1440,height:900,isMobile:false,scale:1},
  {name:'phone-390',width:390,height:844,isMobile:true,scale:2}
];

(async()=>{
  const browser=await chromium.launch({
    headless:true,args:['--no-sandbox','--disable-dev-shm-usage']
  });
  const reports=[];
  try{
    for(const profile of viewports){
      const context=await browser.newContext({
        viewport:{width:profile.width,height:profile.height},
        deviceScaleFactor:profile.scale,isMobile:profile.isMobile,
        hasTouch:profile.isMobile,locale:'hu-HU',colorScheme:'dark',
        reducedMotion:'no-preference'
      });
      try{
        await context.addInitScript(()=>{
          window.__fxR2120={shifts:[],changes:[],errors:[],paint:[],introEvents:[]};
          const nameOf=(node)=>{
            if(!node)return '';
            const id=node.id?'#'+node.id:'';
            const cls=String(node.className||'').trim().split(/\s+/)
              .slice(0,3).filter(Boolean).map(s=>'.'+s).join('');
            return (typeof node.tagName==='string'
              ?node.tagName.toLowerCase()
              :'non-element-node')+id+cls;
          };
          try{
            new PerformanceObserver(list=>{
              for(const entry of list.getEntries()){
                if(entry.hadRecentInput)continue;
                const items=[...(entry.sources||[])].map(source=>({
                  selector:nameOf(source.node),
                  old:source.previousRect,
                  next:source.currentRect
                }));
                window.__fxR2120.shifts.push({
                  at:Math.round(entry.startTime),
                  score:entry.value,sources:items
                });
              }
            }).observe({type:'layout-shift',buffered:true});
          }catch(e){window.__fxR2120.errors.push(String(e))}
          /* R2124: associate the real high-CLS shifts with first visible
             content and intro state changes. These observers never change
             application behavior or disable the user's normal animation. */
          try{
            new PerformanceObserver(list=>{
              for(const e of list.getEntries()){
                window.__fxR2120.paint.push({
                  kind:e.entryType,time:Math.round(e.startTime),
                  name:e.name||'',
                  size:e.size||0,
                  element:e.element?.tagName+'#'+(e.element?.id||'')
                });
              }
            }).observe({type:'largest-contentful-paint',buffered:true});
          }catch(e){window.__fxR2120.errors.push(String(e))}
          ['formatx:introfinish','formatx:preloadercomplete',
            'formatx:magbirthcomplete','formatx:immersiveactivate',
            'formatx:hero-ready'].forEach(name=>{
              document.addEventListener(name,()=>{
                window.__fxR2120.introEvents.push({
                  name,time:Math.round(performance.now()),
                  classes:document.documentElement.className,
                  birth:document.documentElement.dataset.fxMagBirthLive||'',
                  cinema:document.documentElement.dataset.fxArchiveCinema||''
                });
              },{passive:true});
            });
          document.addEventListener('DOMContentLoaded',()=>{
            const nodes=[
              document.documentElement,document.body,
              document.querySelector('header.topbar'),
              document.querySelector('#main-content'),
              document.querySelector('#hero'),
              document.querySelector('#hero-title'),
              document.querySelector('.hero-grid'),
              document.querySelector('.fx-rail')
            ].filter(Boolean);
            const snapshot=()=>{
              window.__fxR2120.changes.push({
                at:Math.round(performance.now()),
                nodes:nodes.map(node=>{
                  const b=node.getBoundingClientRect();
                  const st=getComputedStyle(node);
                  return {
                    selector:nameOf(node),
                    rect:[+b.x.toFixed(1),+b.y.toFixed(1),
                      +b.width.toFixed(1),+b.height.toFixed(1)],
                    display:st.display,
                    position:st.position,
                    overflow:st.overflow,
                    visibility:st.visibility,
                    opacity:st.opacity,
                    transform:st.transform
                  };
                }),
                bodyClass:document.body.className,
                rootClass:document.documentElement.className,
                ready:document.readyState
              });
            };
            snapshot();
            [100,300,600,1000,1700,2600,4500,7000].forEach(ms=>{
              setTimeout(snapshot,ms);
            });
          },{once:true});
        });
        const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForTimeout(8200);
        const report=await page.evaluate(()=>({
          evidence:window.__fxR2120,
          fonts:document.fonts.status,
          nodes:[...document.querySelectorAll(
            '#hero,#main-content,header.topbar,.fx-rail'
          )].map(node=>({
            selector:node.tagName+'#'+node.id+'.'+node.className,
            finalRect:node.getBoundingClientRect().toJSON()
          })),
          stylesheetCount:document.styleSheets.length,
          lateStyles:[...performance.getEntriesByType('resource')]
            .filter(x=>/\.css(\?|$)/.test(x.name))
            .map(x=>({name:x.name.split('/').pop(),
              start:Math.round(x.startTime),
              end:Math.round(x.responseEnd)}))
        }));
        report.errors=errors;
        report.profile=profile;
        report.totalCLS=report.evidence.shifts
          .reduce((n,e)=>n+e.score,0);
        /* R2125: measure the exact native WebGL MAG stage as its own shift
           attribution. The historical regression was .074 desktop and
           .254 mobile when the same renderer was resized during docking. */
        report.originalMagStageCLS=report.evidence.shifts
          .filter(entry=>entry.sources.some(source=>
            source.selector.includes('fx-crystal-organism-r326-stage')))
          .reduce((n,e)=>n+e.score,0);
        report.originalMagCanvasCLS=report.evidence.shifts
          .filter(entry=>entry.sources.some(source=>
            source.selector.includes('fx-crystal-organism-r326-canvas')))
          .reduce((n,e)=>n+e.score,0);
        report.handoff=await page.evaluate(()=>{
          const stage=document.querySelector(
            '#hero .fx-crystal-organism-r326-stage');
          const style=stage?getComputedStyle(stage):null;
          return {
            status:document.documentElement.dataset.fxArchiveHandoffR2125||'',
            dock:document.documentElement.dataset.fxArchiveDock||'',
            ownerCount:document.querySelectorAll(
              '#hero .fx-crystal-organism-r326-canvas').length,
            quiet:!!stage?.classList.contains(
              'fx-archive-handoff-quiet-r2125'),
            visibility:style?.visibility,
            display:style?.display
          };
        });
        reports.push(report);
        fs.writeFileSync(
          path.join(OUT,profile.name+'.json'),
          JSON.stringify(report,null,2)+'\n'
        );
        await page.screenshot({
          path:path.join(OUT,profile.name+'-post-load.png'),
          animations:'allow'
        });
        console.log('R2120_REAL_LAYOUT_SHIFTS',JSON.stringify({
          viewport:profile.name,totalCLS:report.totalCLS,
          magStageCLS:report.originalMagStageCLS,
          magCanvasCLS:report.originalMagCanvasCLS,
          handoff:report.handoff,
          largest:[...report.evidence.shifts]
            .sort((a,b)=>b.score-a.score).slice(0,8),
          lastRects:report.nodes.map(n=>({
            selector:n.selector,rect:n.finalRect
          })),
          errors,
          paint:report.evidence.paint.slice(-12),
          introEvents:report.evidence.introEvents
        }));
        assert.deepEqual(errors,[],'Production site throws JS exception');
        assert.ok(report.originalMagStageCLS<.008,
          'R2125 MAG docking still jumps on screen: '+
            JSON.stringify({viewport:profile.name,
              nativeShift:report.originalMagStageCLS,
              largest:report.evidence.shifts.slice(0,7),
              handoff:report.handoff}));
        assert.ok(report.originalMagCanvasCLS<.008,
          'R2126 actual WebGL framebuffer still resizes visibly after docking: '+
            JSON.stringify({viewport:profile.name,
              canvasShift:report.originalMagCanvasCLS,
              handoff:report.handoff,
              sources:report.evidence.shifts.filter(item=>
                item.sources.some(source=>
                  source.selector.includes('fx-crystal-organism-r326-canvas')))}));
        assert.ok(report.handoff.ownerCount===1 &&
          !report.handoff.quiet &&
          report.handoff.visibility==='visible',
          'R2125 briefly hidden original MAG never became visible again: '+
            JSON.stringify(report.handoff));
      }finally{
        await context.close();
      }
    }
  }finally{
    await browser.close();
  }
  fs.writeFileSync(path.join(OUT,'summary.json'),
    JSON.stringify(reports.map(r=>({
      profile:r.profile.name,cls:r.totalCLS,
      originalMagStageCLS:r.originalMagStageCLS,
      originalMagCanvasCLS:r.originalMagCanvasCLS,
      handoff:r.handoff,
      shifts:r.evidence.shifts.length,
      lateStyleCount:r.lateStyles.length
    })),null,2)+'\n');
})().catch(error=>{
  console.error(error.stack||String(error));
  process.exitCode=1;
});

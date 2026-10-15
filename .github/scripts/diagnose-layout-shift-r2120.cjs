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
          window.__fxR2120={shifts:[],changes:[],errors:[]};
          const nameOf=(node)=>{
            if(!node)return '';
            const id=node.id?'#'+node.id:'';
            const cls=String(node.className||'').trim().split(/\s+/)
              .slice(0,3).filter(Boolean).map(s=>'.'+s).join('');
            return node.tagName.toLowerCase()+id+cls;
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
          largest:[...report.evidence.shifts]
            .sort((a,b)=>b.score-a.score).slice(0,8),
          lastRects:report.nodes.map(n=>({
            selector:n.selector,rect:n.finalRect
          })),
          errors
        }));
        assert.deepEqual(errors,[],'Production site throws JS exception');
      }finally{
        await context.close();
      }
    }
  }finally{
    await browser.close();
  }
  fs.writeFileSync(path.join(OUT,'summary.json'),
    JSON.stringify(reports.map(r=>({
      profile:r.profile.name,cls:r.totalCLS,shifts:r.evidence.shifts.length,
      lateStyleCount:r.lateStyles.length
    })),null,2)+'\n');
})().catch(error=>{
  console.error(error.stack||String(error));
  process.exitCode=1;
});

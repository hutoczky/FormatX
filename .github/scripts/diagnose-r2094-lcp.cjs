'use strict';

const fs=require('node:fs');
const path=require('node:path');
const { chromium }=require('playwright');

const origin=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const output='artifacts/r2094-lcp-timeline';
fs.mkdirSync(output,{recursive:true});
const profiles=[
  {name:'desktop',viewport:{width:1440,height:900},mobile:false,deviceScaleFactor:1},
  {name:'mobile',viewport:{width:390,height:844},mobile:true,deviceScaleFactor:2}
];
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    for(const profile of profiles){
      const context=await browser.newContext({
        viewport:profile.viewport,isMobile:profile.mobile,hasTouch:profile.mobile,
        deviceScaleFactor:profile.deviceScaleFactor,locale:'hu-HU',colorScheme:'dark'
      });
      try{
        await context.addInitScript(()=>{
          const diagnostics=window.__r2094={samples:[],paint:[],tasks:[],observerErrors:[]};
          const names=['#hero-title .hero-title-main','#hero .fx-category-definition','#hero .hero-copy','#hero .hero-grid','#hero'];
          const sample=()=>{
            const now=performance.now();
            diagnostics.samples.push({at:Math.round(now),
              nodes:names.map(sel=>{
                const node=document.querySelector(sel);
                if(!node)return {selector:sel,exists:false};
                const s=getComputedStyle(node),r=node.getBoundingClientRect();
                return {selector:sel,exists:true,
                  box:[+r.x.toFixed(1),+r.y.toFixed(1),+r.width.toFixed(1),+r.height.toFixed(1)],
                  opacity:s.opacity,visibility:s.visibility,display:s.display,
                  filter:s.filter,transform:s.transform,
                  color:s.color,fontSize:s.fontSize,animation:s.animationName,
                  contentVisibility:s.contentVisibility
                };
              })
            });
          };
          let count=0;
          const loop=()=>{sample();if(++count<85)window.setTimeout(loop,50);};
          document.addEventListener('DOMContentLoaded',loop,{once:true});
          try{
            const po=new PerformanceObserver(list=>{
              for(const x of list.getEntries()){
                diagnostics.paint.push({type:x.entryType,name:x.name,at:Math.round(x.startTime),size:x.size||0});
              }
            });
            po.observe({type:'paint',buffered:true});
            po.observe({type:'largest-contentful-paint',buffered:true});
          }catch(e){diagnostics.observerErrors.push(String(e))}
          try{
            new PerformanceObserver(list=>{
              for(const x of list.getEntries())diagnostics.tasks.push({at:Math.round(x.startTime),duration:Math.round(x.duration)});
            }).observe({type:'longtask',buffered:true});
          }catch(e){diagnostics.observerErrors.push(String(e))}
        });
        const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForTimeout(4650);
        const report=await page.evaluate(()=>({
          timeline:window.__r2094,
          styles:[...document.styleSheets].map(sh=>({
            href:sh.href,disabled:sh.disabled,media:sh.media?.mediaText||''
          })),
          resources:performance.getEntriesByType('resource').filter(r=>r.initiatorType==='link'||r.initiatorType==='script').map(r=>({
            name:r.name.split('/').pop(),type:r.initiatorType,
            start:Math.round(r.startTime),end:Math.round(r.responseEnd)
          })),
          ready:document.readyState,
          root:Object.fromEntries(Object.entries(document.documentElement.dataset).filter(([k])=>/intro|mag|reference|p0|lcp/i.test(k))),
          stylesheetCount:document.styleSheets.length
        }));
        report.profile=profile.name;report.errors=errors;
        fs.writeFileSync(path.join(output,profile.name+'.json'),JSON.stringify(report,null,2)+'\n');
        const snapshots=report.timeline.samples.filter((_,i)=>i%5===0).map(v=>({
          at:v.at,title:v.nodes[0],category:v.nodes[1],copy:v.nodes[2]
        }));
        console.log('R2094_REAL_PAINT_TIMELINE',JSON.stringify({
          profile:profile.name,paint:report.timeline.paint,
          errors,
          samples:snapshots,
          tasks:report.timeline.tasks.filter(x=>x.duration>50),
          resources:report.resources.filter(x=>x.end>600).slice(0,30)
        }));
      }finally{await context.close();}
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});

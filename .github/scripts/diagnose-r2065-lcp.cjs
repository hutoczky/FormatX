'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const URL='http://127.0.0.1:4178/scifi-ui/index.html';
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
  ]});
  const reports=[];
  try{
    for(const mode of ['normal','lighthouse-user-agent']){
      const context=await browser.newContext({
        viewport:{width:1440,height:900},reducedMotion:'no-preference',
        ...(mode==='lighthouse-user-agent'?{userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Chrome-Lighthouse'}:{})
      });
      await context.addInitScript(()=>{
        window.__lcpR2065={events:[],mutations:[],samples:[],resources:[]};
        try{
          new PerformanceObserver(list=>{
            for(const e of list.getEntries()){
              window.__lcpR2065.events.push({time:Math.round(e.startTime),
                size:e.size,selector:e.element?.id||e.element?.className||e.url||'unknown',
                text:e.element?.textContent?.slice(0,70)||''});
            }
          }).observe({type:'largest-contentful-paint',buffered:true});
          new PerformanceObserver(list=>{
            for(const e of list.getEntries()){
              if(/\.css(?:\?|$)/.test(e.name)){
                window.__lcpR2065.resources.push({name:e.name.split('/').pop(),
                  responseEnd:Math.round(e.responseEnd),duration:Math.round(e.duration)});
              }
            }
          }).observe({type:'resource',buffered:true});
        }catch(_){}
        addEventListener('DOMContentLoaded',()=>{
          const root=document.documentElement;
          const target=document.querySelector('#hero');
          const read=(tag)=>{
            const selectors=[
              '#hero .hero-title-main','#hero-title','#hero .hero-copy',
              '#hero .hero-grid','#hero','body','main#main-content'
            ];
            const state=selectors.map(sel=>{
              const el=document.querySelector(sel);
              if(!el)return {sel,missing:true};
              const cs=getComputedStyle(el),box=el.getBoundingClientRect();
              return {sel,top:Math.round(box.top),width:Math.round(box.width),
                font:cs.fontFamily,fontSize:cs.fontSize,weight:cs.fontWeight,
                lineHeight:cs.lineHeight,letterSpacing:cs.letterSpacing,color:cs.color,
                opacity:cs.opacity,display:cs.display,visibility:cs.visibility,
                filter:cs.filter,transform:cs.transform,contain:cs.contain,
                contentVisibility:cs.contentVisibility,animation:cs.animationName,
                backgroundImage:cs.backgroundImage.slice(0,100),
                textShadow:cs.textShadow,willChange:cs.willChange};
            });
            window.__lcpR2065.samples.push({tag,at:Math.round(performance.now()),
              state,root:{...Object.fromEntries(Object.entries(root.dataset)
                 .filter(([k])=>/fx(Award|Design|Premium|Reference|P0|Intro|Transcend|Archive)/.test(k)))}});
          };
          window.__lcpR2065.sample=read;
          if(target)new MutationObserver(ms=>{
            for(const m of ms){
              const el=m.target;
              if(m.type==='characterData'||el?.closest?.('#hero-title')){
                window.__lcpR2065.mutations.push({
                  time:Math.round(performance.now()),kind:m.type,
                  target:el?.nodeName||'',attribute:m.attributeName||'',
                  text:el?.textContent?.slice(0,90)||''});
              }
            }
          }).observe(target,{subtree:true,attributes:true,characterData:true,childList:true});
          read('dom-ready');
          for(const ms of [100,300,500,800,1200,1500,1800,2200,2800,3400])
            setTimeout(()=>read('t'+ms),ms);
        },{once:true});
      });
      const page=await context.newPage();
      await page.goto(URL+'?r2065-probe='+mode,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForTimeout(3800);
      const results=await page.evaluate(()=>({
        ...window.__lcpR2065,readyState:document.readyState,
        title:document.querySelector('.hero-title-main')?.textContent,
        rootFlags:document.documentElement.dataset.fxArchiveCinema
      }));
      reports.push({mode,...results});
      console.log('R2065_PROBE '+JSON.stringify({mode,lcp:results.events,
        mutations:results.mutations,
        resources:results.resources.filter(v=>v.responseEnd>350),
        timeline:results.samples.map(v=>({at:v.at,tag:v.tag,root:v.root,
          title:v.state[0],parent:v.state[2],grid:v.state[3]}))}));
      await context.close();
    }
  }finally{await browser.close();}
  fs.mkdirSync('artifacts/r2065-lcp-probe',{recursive:true});
  fs.writeFileSync('artifacts/r2065-lcp-probe/results.json',JSON.stringify(reports,null,2)+'\n');
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1});

'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const URL=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const CHROME=process.env.CHROME_BIN||'/usr/bin/google-chrome';
const OUT=process.env.FORMATX_CLS_DEBUG_DIR||'artifacts/r532-cls-probe';

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:CHROME,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:1350,height:940},deviceScaleFactor:1,reducedMotion:'no-preference'});
  await context.addInitScript(()=>{
    window.__fxR532Shifts=[];
    window.__fxR536Frames=[];

    const styleState=node=>{
      if(!(node instanceof Element))return null;
      const rect=node.getBoundingClientRect(),s=getComputedStyle(node);
      return {
        rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},
        display:s.display,position:s.position,
        width:s.width,height:s.height,minHeight:s.minHeight,
        marginTop:s.marginTop,marginRight:s.marginRight,marginBottom:s.marginBottom,marginLeft:s.marginLeft,
        paddingTop:s.paddingTop,paddingRight:s.paddingRight,paddingBottom:s.paddingBottom,paddingLeft:s.paddingLeft,
        gap:s.gap,rowGap:s.rowGap,columnGap:s.columnGap,
        fontFamily:s.fontFamily,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing,
        flex:s.flex,flexBasis:s.flexBasis,gridTemplateRows:s.gridTemplateRows,gridTemplateColumns:s.gridTemplateColumns,
        alignSelf:s.alignSelf,boxSizing:s.boxSizing
      };
    };
    const capture=()=>{
      const root=document.documentElement;
      const selectors={
        topbar:'.topbar',grid:'#hero > .hero-grid',copy:'#hero .hero-copy',kicker:'#hero .kicker',
        category:'#hero .fx-category-definition',title:'#hero-title',titleMain:'#hero .hero-title-main',titleSub:'#hero .hero-title-sub',
        lead:'#hero .hero-lead',product:'#hero .fx-hero-product-state',method:'#hero .fx-method-inline',actions:'#hero .hero-actions',
        download:'#hero-download',space:'#hero .hero-space'
      };
      const nodes={};for(const [key,selector] of Object.entries(selectors))nodes[key]=styleState(document.querySelector(selector));
      const frame={at:performance.now(),reference:root?.dataset?.fxReferenceProductionR244||'',preloader:root?.dataset?.fxPreloaderR531||'',nodes};
      const signature=JSON.stringify({reference:frame.reference,nodes:Object.fromEntries(Object.entries(nodes).map(([k,v])=>[k,v&&{
        rect:v.rect,minHeight:v.minHeight,height:v.height,marginTop:v.marginTop,marginBottom:v.marginBottom,gap:v.gap,fontSize:v.fontSize,lineHeight:v.lineHeight,flexBasis:v.flexBasis,gridTemplateRows:v.gridTemplateRows
      }]))});
      if(window.__fxR536LastSignature!==signature){
        window.__fxR536LastSignature=signature;
        window.__fxR536Frames.push(frame);
        if(window.__fxR536Frames.length>80)window.__fxR536Frames.shift();
      }
      if(performance.now()<1900)requestAnimationFrame(capture);
    };
    requestAnimationFrame(capture);

    try{
      new PerformanceObserver(list=>{
        for(const entry of list.getEntries()){
          if(entry.hadRecentInput)continue;
          const root=document.documentElement;
          const resources=performance.getEntriesByType('resource')
            .filter(item=>/\.css(?:\?|$)/.test(item.name)&&item.responseEnd<=entry.startTime+120&&item.responseEnd>=entry.startTime-180)
            .map(item=>({name:item.name.split('/').pop(),start:item.startTime,responseEnd:item.responseEnd,duration:item.duration}));
          const activeStyles=Array.from(document.styleSheets).map(sheet=>String(sheet.href||'')).filter(Boolean).map(href=>href.split('/').pop());
          window.__fxR532Shifts.push({
            at:entry.startTime,value:entry.value,
            preloader:root?.dataset?.fxPreloaderR531||'',release:root?.dataset?.fxPreloaderReleaseR531||'',
            geometry:root?.dataset?.fxPreloaderGeometryR532||'',reference:root?.dataset?.fxReferenceProductionR244||'',
            referenceRuntime:root?.dataset?.fxReferenceRuntimeR254||'',controlOwner:root?.dataset?.fxControlOwnerR268||'',
            crystal:root?.dataset?.fxCrystalOrganismR326||'',nearbyCss:resources,activeStyles,
            sources:(entry.sources||[]).map(source=>({
              selector:source.node instanceof Element?(()=>{const n=source.node;if(n.id)return '#'+n.id;if(n.classList?.length)return n.tagName.toLowerCase()+'.'+Array.from(n.classList).slice(0,3).join('.');return n.tagName?.toLowerCase()||'';})():'',
              previousRect:source.previousRect?{x:source.previousRect.x,y:source.previousRect.y,width:source.previousRect.width,height:source.previousRect.height}:null,
              currentRect:source.currentRect?{x:source.currentRect.x,y:source.currentRect.y,width:source.currentRect.width,height:source.currentRect.height}:null
            }))
          });
        }
      }).observe({type:'layout-shift',buffered:true});
    }catch(error){window.__fxR532ObserverError=String(error?.message||error);}
  });
  const page=await context.newPage();
  await page.goto(URL,{waitUntil:'load',timeout:30000});
  await page.waitForTimeout(3200);
  const result=await page.evaluate(()=>({
    url:location.href,now:performance.now(),observerError:window.__fxR532ObserverError||'',
    shifts:window.__fxR532Shifts||[],frames:window.__fxR536Frames||[],
    cssResources:performance.getEntriesByType('resource').filter(item=>/\.css(?:\?|$)/.test(item.name))
      .map(item=>({name:item.name.split('/').pop(),start:item.startTime,responseEnd:item.responseEnd,duration:item.duration})).sort((a,b)=>a.responseEnd-b.responseEnd),
    root:{
      preloader:document.documentElement.dataset.fxPreloaderR531||'',release:document.documentElement.dataset.fxPreloaderReleaseR531||'',
      geometry:document.documentElement.dataset.fxPreloaderGeometryR532||'',reference:document.documentElement.dataset.fxReferenceProductionR244||'',
      referenceRuntime:document.documentElement.dataset.fxReferenceRuntimeR254||'',controlOwner:document.documentElement.dataset.fxControlOwnerR268||'',
      crystal:document.documentElement.dataset.fxCrystalOrganismR326||''
    },
    hero:(()=>{const n=document.querySelector('#hero .hero-copy');if(!n)return null;const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};})()
  }));
  fs.writeFileSync(path.join(OUT,'desktop-layout-shifts.json'),JSON.stringify(result,null,2));
  console.log('R536_STYLE_FRAMES '+JSON.stringify(result.frames));
  console.log('R532_CLS_PROBE '+JSON.stringify({...result,frames:undefined}));
  await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});

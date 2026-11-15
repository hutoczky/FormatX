'use strict';
/* Read-only R2219 geometry audit. Chrome's layout-shift attribution
   identifies the actual moving node, including late WebGL stage placement. */
const {chromium}=require('playwright');
const URL=process.env.FORMATX_CLS_URL||'https://www.formatxsuite.com/scifi-ui/';
const profiles=[
  {name:'desktop',width:1366,height:768,mobile:false},
  {name:'mobile',width:390,height:844,mobile:true}
];
async function probe(browser,spec,run){
 const ctx=await browser.newContext({
   viewport:{width:spec.width,height:spec.height},
   isMobile:spec.mobile,hasTouch:spec.mobile,
   deviceScaleFactor:1,reducedMotion:'no-preference',locale:'hu-HU'
 });
 const page=await ctx.newPage();
 await page.addInitScript(()=>{
   const sample=element=>{
     if(!(element instanceof Element))return null;
     const r=element.getBoundingClientRect(),s=getComputedStyle(element);
     return {name:element.id?'#'+element.id:element.tagName.toLowerCase()+'.'+
       [...element.classList].slice(0,4).join('.'),
       x:Math.round(r.x),y:Math.round(r.y),
       w:Math.round(r.width),h:Math.round(r.height),
       position:s.position,display:s.display,visibility:s.visibility};
   };
   window.__fxClsAudit={
     shifts:[],paint:[],snapshots:[],errors:[],
     capture(label){
       const sel=['#hero','#hero>.hero-grid','#hero .hero-space',
         '#hero .fx-mag-first-paint-r1756','#hero .fx-core-mobile-v55-stage',
         '#hero .fx-crystal-organism-r326-stage','#hero-title'];
       this.snapshots.push({t:performance.now(),label,box:sel.map(s=>sample(
         document.querySelector(s))),r487:document.documentElement.dataset.fxDeferredCssR487});
     }
   };
   try{new PerformanceObserver(list=>{
     for(const e of list.getEntries()){
       if(e.hadRecentInput)continue;
       window.__fxClsAudit.shifts.push({
         at:Math.round(e.startTime),value:e.value,
         sources:e.sources.map(k=>({
           node:sample(k.node),
           previous:k.previousRect?{
             x:Math.round(k.previousRect.x),y:Math.round(k.previousRect.y),
             w:Math.round(k.previousRect.width),h:Math.round(k.previousRect.height)}:null,
           next:k.currentRect?{
             x:Math.round(k.currentRect.x),y:Math.round(k.currentRect.y),
             w:Math.round(k.currentRect.width),h:Math.round(k.currentRect.height)}:null
         }))
       });
     }
   }).observe({type:'layout-shift',buffered:true})}catch(e){
     window.__fxClsAudit.errors.push(String(e));
   }
   try{new PerformanceObserver(list=>{
     for(const e of list.getEntries())window.__fxClsAudit.paint.push({
       name:e.name,t:e.startTime
     });
   }).observe({type:'paint',buffered:true})}catch(e){
     window.__fxClsAudit.errors.push(String(e));
   }
   document.addEventListener('DOMContentLoaded',()=>{
     window.__fxClsAudit.capture('dom-ready');
     requestAnimationFrame(()=>{
       window.__fxClsAudit.capture('raf1');
       requestAnimationFrame(()=>window.__fxClsAudit.capture('raf2'));
     });
   },{once:true});
   addEventListener('formatx:deferredcssready',()=>window.__fxClsAudit.capture('css-ready'));
 });
 try{
   const url=new URL(URL);url.searchParams.set('cls-diagnosis','r2219-'+spec.name+'-'+run);
   url.searchParams.set('intro','0');
   const response=await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForTimeout(3200);
   const result=await page.evaluate(()=>{
     window.__fxClsAudit.capture('3200ms');
     const a=window.__fxClsAudit;
     const total=a.shifts.reduce((sum,e)=>sum+e.value,0);
     return {total,shifts:a.shifts.sort((x,y)=>y.value-x.value).slice(0,14),
       paint:a.paint,snapshots:a.snapshots,errors:a.errors};
   });
   console.log('FX_CLS_R2219 '+JSON.stringify({profile:spec.name,run,
     status:response?.status(),...result}));
 }finally{await ctx.close();}
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
   '--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader',
   '--ignore-gpu-blocklist','--enable-webgl'
 ]});
 try{for(const spec of profiles)for(let run=1;run<=2;run++)await probe(browser,spec,run);}
 finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});

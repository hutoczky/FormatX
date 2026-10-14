'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const ROOT=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUTPUT='artifacts/r2072-intro-proof';
(async()=>{
  fs.mkdirSync(OUTPUT,{recursive:true});
  const browser=await chromium.launch({headless:true,args:[
    '--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
  ]});
  const reports=[];
  try{
    for(const vp of [
      {name:'desktop-1440',width:1440,height:900,mobile:false},
      {name:'mobile-390',width:390,height:844,mobile:true}
    ]){
      const context=await browser.newContext({
        viewport:{width:vp.width,height:vp.height},
        isMobile:vp.mobile,hasTouch:vp.mobile,
        reducedMotion:'no-preference',locale:'hu-HU'
      });
      try{
        const page=await context.newPage();
        const errors=[];
        page.on('pageerror',error=>errors.push(String(error.message)));
        // Genuine user-replay route: webdriver is deliberately allowed by
        // the original intro, never simulating an audit-only alternative.
        await page.goto(ROOT+'?intro=1&visualintro=1&r2072-cinematic-proof='+vp.name,
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>
          document.documentElement.dataset.fxMagBirthLiveR533==='active',
          null,{timeout:30000});
        const early=await page.evaluate(()=>({
          film:!!document.querySelector('.fx-mag-birth-r533'),
          labelCount:document.querySelectorAll('.fx-ai-core-ident-r1951').length,
          duration:document.documentElement.dataset.fxMagBirthDurationR1549
        }));
        assert.ok(early.film,'The original 10s R533 film never mounted: '+JSON.stringify(early));
        assert.equal(early.labelCount,0,'AI CORE label appears before the MAG has stabilized');
        await page.waitForFunction(()=>
          document.querySelector('.fx-ai-core-ident-r1951.is-visible')
          &&document.documentElement.dataset.fxMagBirthIdentityR2072==='mag-stabilized-within-film',
          null,{timeout:16000});
        await page.waitForTimeout(440);
        const proof=await page.evaluate(()=>{
          const root=document.documentElement;
          const film=document.querySelector('.fx-mag-birth-r533');
          const badge=document.querySelector('.fx-ai-core-ident-r1951');
          const rect=badge?.getBoundingClientRect();
          const style=badge?getComputedStyle(badge):null;
          const center=rect?rect.left+rect.width*.5:null;
          const coreX=parseFloat(badge?.style.getPropertyValue('--fx-ident-x')||'');
          const coreY=parseFloat(badge?.style.getPropertyValue('--fx-ident-y')||'');
          return {
            introActive:root.dataset.fxMagBirthLiveR533==='active'&&!!film,
            filmExists:!!film,
            owner:root.dataset.fxMagBirthOwnerR533,
            percentage:parseFloat(root.dataset.fxMagBirthIdentityProgressR2072||'0'),
            labelCount:document.querySelectorAll('.fx-ai-core-ident-r1951').length,
            title:badge?.querySelector('.fx-ai-core-ident-r1951__title')?.textContent,
            sub:badge?.querySelector('.fx-ai-core-ident-r1951__sub')?.textContent,
            shot:badge?.dataset.fxAiCoreShot,
            rendered:style?.display!=='none'&&style?.visibility!=='hidden',
            opacity:parseFloat(style?.opacity||'0'),
            styleLoaded:!!document.querySelector('link[data-fx-ai-core-ident-r1951]')?.sheet,
            coreX,coreY,center,
            rect:rect?{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom}:null,
            viewport:{w:innerWidth,h:innerHeight},
            realCTA:!!document.querySelector('#hero .hero-actions #hero-download'),
          actualFilmCanvas:!!film?.querySelector('canvas.fxb-particles:not([hidden])'),
          renderer:root.dataset.fxMagBirthRendererR1360
          };
        });
        assert.equal(proof.title,'MAG // AI CORE');
        assert.equal(proof.sub,'ONLINE · LOCAL INTELLIGENCE');
        assert.ok(proof.introActive&&proof.labelCount===1&&proof.rendered
          &&proof.opacity>.48&&proof.styleLoaded&&proof.realCTA
          &&proof.actualFilmCanvas&&proof.renderer!=='automation-handoff-lightweight',
          'System identity must appear inside ONE live physical film: '+JSON.stringify(proof));
        assert.equal(proof.shot,'inside-the-original-10s-film');
        assert.ok(proof.percentage>=.805&&proof.percentage<.95,
          'System identity was not timed to MAG stabilization: '+JSON.stringify(proof));
        assert.ok(proof.rect?.left>=-2&&proof.rect?.right<=proof.viewport.w+2
          &&proof.rect?.top>=-2&&proof.rect?.bottom<=proof.viewport.h+2
          &&Math.abs(proof.center-proof.coreX)<4,
          'Identity must follow actual MAG position and fit the viewport: '+JSON.stringify(proof));
        await page.screenshot({path:OUTPUT+'/'+vp.name+'-mag-stabilized.png',
          animations:'allow'});
        await page.waitForFunction(()=>
          !document.querySelector('.fx-mag-birth-r533')
          &&!document.querySelector('.fx-ai-core-ident-r1951'),
          null,{timeout:10000});
        const after=await page.evaluate(()=>({
          identity:document.documentElement.dataset.fxAiCoreIdentityR1951,
          filmHandoff:document.documentElement.dataset.fxAiCoreIdentityR2072,
          labelCount:document.querySelectorAll('.fx-ai-core-ident-r1951').length,
          overlayCount:document.querySelectorAll('.fx-mag-birth-r533').length,
          originalCTA:!!document.querySelector('#hero .hero-actions #hero-download'),
          scrollY
        }));
        assert.ok(after.labelCount===0&&after.overlayCount===0
          &&after.originalCTA&&after.scrollY===0
          &&after.filmHandoff==='cleared-exactly-at-film-handoff',
          'Film-to-original-MAG hero handoff failed: '+JSON.stringify(after));
        assert.deepEqual(errors,[],'Real intro JS exceptions: '+JSON.stringify(errors));
        reports.push({viewport:vp.name,proof,after});
        console.log('R2072_INTRO_INSIDE_ONE_MAG_FILM_PASS',JSON.stringify({
          viewport:vp.name,progress:proof.percentage,
          top:Math.round(proof.rect.top),alpha:proof.opacity,
          title:proof.title,overlayCleared:after.overlayCount===0,
          originalCTA:after.originalCTA
        }));
      }finally{await context.close();}
    }
  }finally{await browser.close();}
  fs.writeFileSync(OUTPUT+'/results.json',JSON.stringify(reports,null,2)+'\n');
})().catch(error=>{console.error(error.stack||String(error));process.exitCode=1});

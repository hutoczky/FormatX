'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require('playwright');
const OUT = 'artifacts/r2124-real-post-intro-badge';
const HOST = process.env.FORMATX_TEST_URL ||
  'http://127.0.0.1:4178/scifi-ui/index.html';
fs.mkdirSync(OUT,{recursive:true});

const CASES = [
  {name:'phone-390',width:390,height:844,mobile:true},
  {name:'phone-360',width:360,height:780,mobile:true},
  {name:'desktop-1440',width:1440,height:900,mobile:false}
];

function overlapping(a,b){
  return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*
    Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
}

(async()=>{
  const browser = await chromium.launch({
    headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle',
      '--use-angle=swiftshader','--enable-unsafe-swiftshader']
  });
  const report=[];
  try{
    for(const view of CASES){
      const context=await browser.newContext({
        viewport:{width:view.width,height:view.height},
        hasTouch:view.mobile,isMobile:view.mobile,
        deviceScaleFactor:view.mobile?2:1,
        locale:'hu-HU',reducedMotion:'no-preference',
        colorScheme:'dark'
      });
      try{
        // Normal user visit. Chromium automation flags otherwise disable the
        // cinematic identity entirely, giving an invalid false green result.
        await context.addInitScript(()=>{
          Object.defineProperty(navigator,'webdriver',{
            configurable:true,get:()=>undefined
          });
        });
        const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(HOST+'?intro=1&visualintro=1&proofrenderer=reference',
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForSelector('.fx-ai-core-ident-r1951.is-visible',{
          timeout:45000
        });
        /* The class is set two RAFs BEFORE the .48s CSS fade completes.
           Capture actual readable opacity, not the first zero-alpha frame. */
        await page.waitForFunction(()=>{
          const badge=document.querySelector('.fx-ai-core-ident-r1951.is-visible');
          return !!badge&&Number(getComputedStyle(badge).opacity)>.65;
        },null,{timeout:2400});
        const measured=await page.evaluate(()=>{
          const rect=(e)=>{
            if(!e)return null;
            const r=e.getBoundingClientRect();
            return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
              width:r.width,height:r.height};
          };
          const badge=document.querySelector('.fx-ai-core-ident-r1951');
          const selectors=[
            '.topbar','#hero .hero-copy>.kicker',
            '#hero #hero-title','#hero .fx-category-definition',
            '#hero .hero-actions','#hero .hero-lead'
          ];
          const targets=selectors.map(selector=>({
            selector,rect:rect(document.querySelector(selector))
          }));
          return {
            state:document.documentElement.dataset.fxAiCoreIdentityR1951,
            badge:rect(badge),targets,
            visible:getComputedStyle(badge).opacity,
            stage:document.documentElement.dataset.fxCrystalOrganismR326,
            introCount:document.querySelectorAll('.fx-mag-birth-r533').length,
            viewport:{width:innerWidth,height:innerHeight}
          };
        });
        assert.ok(measured.badge&&Number(measured.visible)>.5,
          'Real post-film identity did not become readable: '+JSON.stringify(measured));
        assert.equal(measured.introCount,0,
          'Film canvas must be completely removed before badge acceptance');
        assert.ok(measured.badge.left>=0&&
          measured.badge.right<=view.width+1&&
          measured.badge.top>=0&&measured.badge.bottom<=view.height,
          'Identity badge outside actual viewport');
        for(const target of measured.targets){
          if(target.rect){
            assert.ok(overlapping(measured.badge,target.rect)<2,
              'Permanent product copy/navigation occluded by transient MAG label: '+
                JSON.stringify({view:view.name,target,measured}));
          }
        }
        if(view.mobile){
          assert.ok(measured.badge.top>=75&&
            measured.badge.bottom<view.height*.22,
            'Mobile identity must occupy upper clear negative space above MAG '+
              'and outside hero copy: '+JSON.stringify(measured));
        }
        await page.screenshot({
          path:OUT+'/'+view.name+'-real-post-film-no-overlap.png',
          animations:'allow'
        });
        await page.waitForFunction(() =>
          !document.querySelector('.fx-ai-core-ident-r1951'),
          null,{timeout:5000});
        assert.deepEqual(errors,[],
          'Normal original MAG browser/runtime JS errors: '+JSON.stringify(errors));
        report.push({view:view.name,measured});
        console.log('PASS_R2124_REAL_NO_OVERLAP',JSON.stringify({
          view:view.name,identity:measured.badge,
          stages:measured.stage,targets:measured.targets
        }));
      } finally {await context.close();}
    }
  } finally {await browser.close();}
  fs.writeFileSync(OUT+'/report.json',JSON.stringify(report,null,2)+'\n');
})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});

'use strict';
/* Behavioral smoke for the actual seven-scene MAG homepage. */
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const base = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const profiles = [
  {name:'narrow-320',width:320,height:568,mobile:true},
  {name:'phone-390',width:390,height:844,mobile:true},
  {name:'desktop-1440',width:1440,height:900,mobile:false}
];
(async () => {
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader',
    '--enable-unsafe-swiftshader'
  ]});
  try {
    for(const profile of profiles) {
      const context=await browser.newContext({
        viewport:{width:profile.width,height:profile.height},
        isMobile:profile.mobile,hasTouch:profile.mobile,
        reducedMotion:'no-preference',locale:'hu-HU'
      });
      try {
        const page=await context.newPage();
        const errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.goto(base+'?intro=0&storybrowser=1',
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(
          () => typeof window.__FORMATX_MAG_STORY_STATUS__ === 'function',
          null,{timeout:30000});
        await page.waitForFunction(() => {
          const nav=document.querySelector('.fx-mag-story-rail');
          return nav && !nav.hidden && getComputedStyle(nav).position==='fixed';
        },null,{timeout:12000});
        const initial=await page.evaluate(()=>{
          const nav=document.querySelector('.fx-mag-story-rail');
          return {
            links:nav?.querySelectorAll('a[href^="#"]').length,
            progress:window.__FORMATX_MAG_STORY_STATUS__().progress
          };
        });
        assert.equal(initial.links,7,profile.name+': chapter rail missing');
        assert.ok(Number.isFinite(initial.progress));
        for(const sectionId of ['experience','capabilities','pricing']){
          await page.evaluate(id=>{
            const element=document.getElementById(id);
            if(!element)throw new Error('Missing section '+id);
            element.scrollIntoView({behavior:'instant',block:'center'});
          },sectionId);
          await page.waitForFunction(id=>
            document.documentElement.dataset.fxMagStoryChapter===id,
            sectionId,{timeout:15000});
          const state=await page.evaluate(()=>{
            const s=window.__FORMATX_MAG_STORY_STATUS__();
            return {active:s.active,progress:s.progress};
          });
          assert.equal(state.active,sectionId,profile.name+' scene '+sectionId);
          assert.ok(state.progress>=0&&state.progress<=1,profile.name+' progress');
        }
        // Check all visible touch targets geometrically; do not count
        // scrollable off-viewport links as touchable.
        if(profile.mobile) {
          await page.evaluate(()=>document.querySelector('.fx-mag-story-rail').scrollIntoView({block:'nearest'}));
          const rail=await page.evaluate(()=>{
            const nav=document.querySelector('.fx-mag-story-rail');
            return [...nav.querySelectorAll('a')].map(link=>{
              const r=link.getBoundingClientRect();
              return {left:r.left,right:r.right,width:r.width,height:r.height};
            });
          });
          for(const [i,link] of rail.entries()) {
            assert.ok(link.width>=44&&link.height>=44,
              profile.name+': undersized touch target '+i);
            if(profile.width<=440){
              assert.ok(link.left>=-1&&link.right<=profile.width+1,
                profile.name+': clipped chapter '+i+': '+JSON.stringify(link));
            }
          }
        }
        await page.evaluate(()=>document.documentElement.lang='en');
        await page.waitForFunction(()=>
          document.querySelector('.fx-mag-story-rail a[data-chapter="experience"]')
            ?.getAttribute('aria-label')==='NERVOUS SYSTEM',null,{timeout:5000});
        assert.deepEqual(errors,[],profile.name+': uncaught browser errors');
        console.log('MAG_SCROLL_BROWSER_PASS',JSON.stringify({profile:profile.name,initial,errors}));
      } finally {await context.close();}
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});

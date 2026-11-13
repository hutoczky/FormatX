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
        // Isolate the 7 native HTML anchor chapters. R1987's 8-scene WebGL
        // archive is checked independently by validate-cinematic-archive.
        await page.goto(base+'?intro=0&archive=off&storybrowser=1',
          {waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(
          () => typeof window.__FORMATX_MAG_STORY_STATUS__ === 'function',
          null,{timeout:30000});
        // R2231: explicitly isolated native-HTML chapter proof. The
        // asynchronous MAG WebGL ready event must NEVER reactivate R1987
        // after ?archive=off, even once the film has fully completed.
        await page.waitForFunction(()=>
          document.documentElement.dataset.fxArchiveExperience==='reduced-html',
          null,{polling:200,timeout:20000});
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
          // R2227: exercise the REAL user-facing native anchor link rather
          // than an artificial scrollIntoView. Native fragment navigation
          // retains the requested chapter during async content reflow and
          // validates the public 44px MAG rail, not just DOM coordinates.
          const navLink=page.locator('.fx-mag-story-rail a[data-chapter="'+sectionId+'"]');
          assert.equal(await navLink.getAttribute('href'),'#'+sectionId,
            profile.name+': MAG rail lost its accessible native fragment link');
          await navLink.click({timeout:20000});
          // Capture the actual URL outcome separately: another FormatX
          // navigation owner may consume the fragment while still performing
          // the correct scroll. The product contract is the visible selected
          // chapter, not a hash mutation at an exact millisecond.
          const clicked=await page.evaluate(id=>({
            id,hash:location.hash,
            chapter:document.documentElement.dataset.fxMagStoryChapter
          }),sectionId);
          console.log('MAG_R2227_NATIVE_RAIL_CLICK',JSON.stringify({profile:profile.name,...clicked}));
          await page.waitForFunction(id=>
            document.documentElement.dataset.fxMagStoryChapter===id,
            sectionId,{polling:200,timeout:20000}).catch(async error=>{
              const state=await page.evaluate(targetId=>({
                targetId,
                active:document.documentElement.dataset.fxMagStoryChapter,
                archive:document.documentElement.dataset.fxArchiveExperience,
                status:window.__FORMATX_MAG_STORY_STATUS__?.(),
                scrollY,viewport:innerHeight,hash:location.hash,
                maxScroll:document.documentElement.scrollHeight-innerHeight,
                chapters:['hero','experience','capabilities','pricing','system','network','resources']
                  .map(id=>{
                    const node=document.getElementById(id);
                    const rect=node?.getBoundingClientRect(),style=node&&getComputedStyle(node);
                    return {id,top:Math.round(rect?.top||0),bottom:Math.round(rect?.bottom||0),
                      height:Math.round(rect?.height||0),display:style?.display,
                      position:style?.position,transform:style?.transform};
                  })
              }),sectionId);
              // SwiftShader can starve rAF while the original 3D MAG is
              // compiling/drawing. A last direct read still has to confirm
              // the requested chapter, never accept a different chapter.
              if(state.active===sectionId && state.status?.active===sectionId){
                console.log('MAG_SCROLL_LATE_CONSISTENT_CHAPTER',
                  JSON.stringify({profile:profile.name,sectionId,scrollY:state.scrollY}));
                return;
              }
              throw new Error(profile.name+': chapter '+sectionId+
                ' did not activate: '+JSON.stringify(state)+' / '+String(error.message||error));
            });
          const state=await page.evaluate(()=>{
            const s=window.__FORMATX_MAG_STORY_STATUS__();
            return {active:s.active,progress:s.progress};
          });
          assert.equal(state.active,sectionId,profile.name+' scene '+sectionId);
          const archiveState=await page.evaluate(()=>
            document.documentElement.dataset.fxArchiveExperience);
          assert.equal(archiveState,'reduced-html',
            profile.name+': archive=off was resurrected by late real3dready');
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
    // The immersive preview must keep one canvas alive across all chapters.
    const previewContext=await browser.newContext({
      viewport:{width:1440,height:900},reducedMotion:'reduce',locale:'hu-HU'
    });
    try {
      const preview=await previewContext.newPage();
      const previewUrl=new URL('/scifi-ui/mag-scroll-preview.html',base).href;
      await preview.goto(previewUrl,{waitUntil:'domcontentloaded',timeout:60000});
      await preview.waitForFunction(()=>
        typeof window.__FORMATX_MAG_SCROLL_PREVIEW__==='function' &&
        document.documentElement.dataset.fxpRuntime!=='initialising',
        null,{timeout:45000});
      const before=await preview.evaluate(()=>window.__FORMATX_MAG_SCROLL_PREVIEW__());
      assert.equal(before.canvases,1,'Multiple canvas nodes on MAG preview');
      assert.equal(before.chapters,7,'Incomplete immersive MAG chapters');
      await preview.evaluate(()=>
        document.getElementById('plan').scrollIntoView({behavior:'instant',block:'center'}));
      await preview.waitForFunction(()=>
        document.documentElement.dataset.fxpChapter==='plan',
        null,{timeout:15000});
      await preview.waitForFunction(()=>window.__FORMATX_MAG_SCROLL_PREVIEW__().filmProgress>.9,null,{timeout:10000});
      const after=await preview.evaluate(()=>window.__FORMATX_MAG_SCROLL_PREVIEW__());
      assert.ok(after.filmProgress>.9,'MAG must be assembled by the system chapters');
      assert.equal(after.canvases,1,'MAG renderer was duplicated after scroll');
      assert.equal(after.chapter,'plan','Camera chapter navigation did not advance');
      const safe=await preview.evaluate(()=>{
        const text=document.querySelector('#cell .fxp-copy').getBoundingClientRect();
        const nav=document.querySelector('.fxp-rail').getBoundingClientRect();
        return {textRight:text.right,railLeft:nav.left};
      });
      assert.ok(safe.textRight+8<safe.railLeft,
        'Desktop MAG chapter rail covers right-side editorial text: '+JSON.stringify(safe));
      console.log('MAG_SINGLE_WORLD_BROWSER_PASS',JSON.stringify({before,after}));
    } finally {await previewContext.close();}
    // 320px portrait: one persistent canvas and seven accessible targets.
    const phoneWorld=await browser.newContext({
      viewport:{width:320,height:568},isMobile:true,hasTouch:true,
      reducedMotion:'reduce',locale:'hu-HU'
    });
    try {
      const phone=await phoneWorld.newPage();
      await phone.goto(new URL('/scifi-ui/mag-scroll-preview.html',base).href,
        {waitUntil:'domcontentloaded',timeout:60000});
      await phone.waitForFunction(()=>document.documentElement.dataset.fxpRuntime!=='initialising',
        null,{timeout:45000});
      const touch=await phone.evaluate(()=>({
        links:[...document.querySelectorAll('.fxp-rail a')].map(a=>{
          const r=a.getBoundingClientRect();
          return {left:r.left,right:r.right,width:r.width,height:r.height};
        }),
        canvases:document.querySelectorAll('#fxp-world').length
      }));
      assert.equal(touch.canvases,1,'Preview mobile renderer duplicated');
      assert.equal(touch.links.length,7);
      for(const [index,link] of touch.links.entries()){
        assert.ok(link.width>=44&&link.height>=44&&link.left>=-1&&link.right<=321,
          'Preview 320px target clipped: '+index+': '+JSON.stringify(link));
      }
      await phone.evaluate(()=>document.querySelector('#core').scrollIntoView({behavior:'instant',block:'center'}));
      await phone.waitForFunction(()=>document.documentElement.dataset.fxpChapter==='core',
        null,{timeout:15000});
      await phone.waitForFunction(()=>window.__FORMATX_MAG_SCROLL_PREVIEW__().filmProgress>.78,
        null,{timeout:10000});
      console.log('MAG_SINGLE_WORLD_MOBILE_PASS',JSON.stringify(touch));
    } finally {await phoneWorld.close();}
  } finally {await browser.close();}
})().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});

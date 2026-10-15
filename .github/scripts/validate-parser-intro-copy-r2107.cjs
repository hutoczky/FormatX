'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const URL=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4178/scifi-ui/index.html';
const OUT=process.env.FORMATX_COPY_EVIDENCE_DIR||'artifacts/r2054-visitor-parity/parser-copy-r2107';
fs.mkdirSync(OUT,{recursive:true});
const report={sha:process.env.AUDITED_SHA||'',url:URL,
  contract:'actual-first-byte-copy-retained-through-delayed-runtime-not-a-timing-certification',cases:[]};

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||undefined,headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
  try{
    for(const profile of ['desktop','mobile','mobile-context-unavailable']){
      const mobile=profile!=='desktop';
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},
        isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1,locale:'hu-HU',colorScheme:'dark'});
      let release;
      const held=new Promise(resolve=>{release=resolve;});
      await context.route('**/formatx-mag-birth-live-r533.js*',async route=>{await held;await route.continue();});
      await context.addInitScript(failContext=>{
        if(failContext){
          const getContext=HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext=function(type,...args){
            if(/webgl/.test(type))return null;
            return Reflect.apply(getContext,this,[type,...args]);
          };
        }
        document.addEventListener('DOMContentLoaded',()=>{
          window.__fxParserCopyR2107=document.querySelector('#fx-mag-birth-prepaint-r1606>.fxb-copy');
          window.__fxParserTitleR2107=window.__fxParserCopyR2107?.querySelector('.fxb-title');
        },{once:true});
      },profile==='mobile-context-unavailable');
      const page=await context.newPage();
      const errors=[];page.on('pageerror',error=>errors.push(String(error)));
      try{
        await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForFunction(()=>window.__fxParserTitleR2107?.getBoundingClientRect().height>0,null,{timeout:5000});
        const before=await page.evaluate(()=>{
          const title=window.__fxParserTitleR2107,copy=window.__fxParserCopyR2107;
          const style=getComputedStyle(title);
          return{title:title.textContent,rect:title.getBoundingClientRect().toJSON(),
            copy:copy.getBoundingClientRect().toJSON(),visible:style.visibility!=='hidden'&&style.display!=='none',
            font:style.font,birthRuntimeStarted:document.documentElement.dataset.fxMagBirthLiveR533||'',
            count:document.querySelectorAll('#fx-mag-birth-prepaint-r1606>.fxb-copy').length};
        });
        assert.equal(before.title,'A MAG SZÜLETÉSE');
        assert.equal(before.count,1);
        assert.equal(before.visible,true);
        assert.equal(before.birthRuntimeStarted,'','The copy must paint before the held runtime executes');
        assert.ok(before.rect.width>0&&before.rect.height>=24&&before.rect.bottom<(mobile?844:900));
        await page.screenshot({path:path.join(OUT,profile+'-before-runtime.png')});
        await page.evaluate(()=>{
          window.__fxDuringCopyR2107=new Promise((resolve,reject)=>{
            const timer=setTimeout(()=>reject(new Error('The released runtime did not start the actual intro')),5000);
            document.addEventListener('formatx:magbirthstart',()=>{
              clearTimeout(timer);
              const title=document.querySelector('#fx-mag-birth-prepaint-r1606 .fxb-title');
              resolve({sameTitle:title===window.__fxParserTitleR2107,
                sameCopy:title?.parentElement===window.__fxParserCopyR2107,
                copyCount:document.querySelectorAll('#fx-mag-birth-prepaint-r1606>.fxb-copy').length,
                title:title?.textContent,rect:title?.getBoundingClientRect().toJSON()});
            },{once:true});
          });
        });
        release();
        const during=await page.evaluate(()=>window.__fxDuringCopyR2107);
        assert.equal(during.sameTitle,true,'The runtime replaced the parser-painted title');
        assert.equal(during.sameCopy,true);
        assert.equal(during.copyCount,1,'Runtime created a duplicate copy block');
        assert.equal(during.title,before.title);
        for(const coordinate of ['x','y','width','height'])assert.ok(Math.abs(during.rect[coordinate]-before.rect[coordinate])<=1,
          'Runtime displaced the painted title: '+coordinate);
        await page.waitForFunction(()=>document.documentElement.dataset.fxMagBirthLiveR533&&
          document.documentElement.dataset.fxMagBirthLiveR533!=='active'&&!document.querySelector('.fx-mag-birth-r533'),null,{timeout:18000});
        if(profile==='mobile-context-unavailable')assert.equal(await page.evaluate(()=>document.documentElement.dataset.fxCrystalOrganismR326),'context-unavailable');
        assert.deepEqual(errors,[]);
        const item={profile,before,during,errors};report.cases.push(item);
        fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
        console.log('PARSER_INTRO_COPY_R2107_PASS',JSON.stringify(item));
      }finally{release();await context.close();}
    }
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

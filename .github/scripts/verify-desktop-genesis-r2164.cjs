'use strict';
// R2164: real desktop WebGL keyframe gate for the homepage birth film.
// The DNA must own the establishing shot; a biological embryo follows;
// the optical titanium MAG may be revealed only after mechanical assembly.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const base = process.env.FORMATX_TEST_URL || 'http://127.0.0.1:4178/scifi-ui/index.html';
const dir = process.env.FORMATX_DESKTOP_GENESIS_DIR || 'artifacts/desktop-genesis-r2164';
const scenes = [
  ['dna', 1.6],
  ['embryo', 4.2],
  ['assembly', 6.8],
  ['mag', 8.3]
];
fs.mkdirSync(dir, {recursive:true});
async function main(){
  const browser=await chromium.launch({
    headless:true,
    executablePath:process.env.CHROME_BIN || undefined,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']
  });
  const outputs=[];
  // R2170: one browser context for all four frames reuses the browser's
  // verified origin session/cache instead of repeatedly cold-starting
  // thirteen production bundles. Each frame still has its own clean page.
  const context=await browser.newContext({
    viewport:{width:1440,height:900},deviceScaleFactor:1.5,
    isMobile:false,hasTouch:false,reducedMotion:'no-preference',
    locale:'hu-HU',colorScheme:'dark'
  });
  try{
    for(const [name,seconds] of scenes){
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push(String(error)));
      const url=new URL(base);
      url.searchParams.set('intro','1');
      url.searchParams.set('visualintro','1');
      url.searchParams.set('introframe',String(seconds));
      await page.goto(url.href,{waitUntil:'domcontentloaded',timeout:30000});
      // Production may canonicalize /scifi-ui/index.html to / and strip
      // query params. A proof without introframe= is NOT a film test.
      const landed=new URL(page.url());
      if(landed.searchParams.get('introframe')!==String(seconds)){
        const canonical=new URL(url.href);
        canonical.pathname='/';
        await page.goto(canonical.href,{waitUntil:'domcontentloaded',timeout:30000});
      }
      // The remote Cloudflare edge occasionally stalls a cold script fetch.
      // Retry ONE real navigation, then demand the same GPU/phase assertions;
      // never accept a static/CSS fallback as a successful film frame.
      const failedRequests=[];
      page.on('requestfailed',request=>{
        if(/formatx-|three-r185/.test(request.url()))
          failedRequests.push({url:request.url(),error:request.failure()?.errorText||'network failure'});
      });
      const awaitGpuFrame=()=>page.waitForFunction(
        ()=>document.documentElement.dataset.fxMagBirthVisualFrameR659==='ready',
        null,{timeout:30000}
      );
      try{
        await awaitGpuFrame();
      }catch(firstError){
        const debug=await page.evaluate(()=>({
          href:location.href,
          intro:document.documentElement.dataset.fxMagBirthLiveR533||'',
          owner:document.documentElement.dataset.fxMagBirthOwnerR533||'',
          phase:document.documentElement.dataset.fxMagBirthPhase||'',
          renderer:document.documentElement.dataset.fxMagBirthRendererR1360||'',
          loader:document.documentElement.dataset.fxMagBirthThreeLoaderR1608||'',
          visualProof:document.documentElement.dataset.fxMagBirthVisualFrameR659||'',
          scripts:[...document.scripts].filter(script=>/formatx-mag-birth-live-r533|formatx-mag-genesis-three-r1280/.test(script.src))
            .map(script=>script.src)
        }));
        fs.writeFileSync(path.join(dir,name+'-first-attempt.json'),JSON.stringify({
          debug,errors,failedRequests,firstError:String(firstError)
        },null,2));
        try{
          await page.reload({waitUntil:'domcontentloaded',timeout:45000});
          await awaitGpuFrame();
        }catch(secondError){
          fs.writeFileSync(path.join(dir,name+'-timeout.json'),JSON.stringify({
            debug,errors,failedRequests,firstError:String(firstError),
            secondError:String(secondError)
          },null,2));
          throw secondError;
        }
      }
      const state=await page.evaluate(()=>{
        const root=document.documentElement;
        const nativeStage=document.querySelector('#hero .fx-crystal-organism-r326-stage');
        const nativeOpacity=nativeStage?Number(getComputedStyle(nativeStage).opacity):0;
        return{
          nativeOpacity,
          nativeTransitionDuration:nativeStage?getComputedStyle(nativeStage).transitionDuration:'',
          nativeConcealed:nativeStage?.dataset.fxBirthConcealedR2174||'not-mounted',
          nativeReveal:root.dataset.fxMagBirthNativeRevealR2173||'',
          renderer:root.dataset.fxMagBirthRendererR1360||'',
          phase:root.dataset.fxMagBirthPhase||'',
          centeredDna:root.dataset.fxMagBirthCenteredDnaR2164||'',
          dnaOpacity:Number(root.dataset.fxMagBirthDnaOpacityR2149||0),
          embryoOpacity:Number(root.dataset.fxMagBirthEmbryoOpacityR2160||0),
          embryoScale:Number(root.dataset.fxMagBirthEmbryoScaleR2149||0),
          armorPieces:Number(root.dataset.fxMagBirthVisibleArmorR2147||0),
          inlayPieces:Number(root.dataset.fxMagBirthArmInlaysR2180||0),
          inlayOpacity:Number(root.dataset.fxMagBirthArmInlayOpacityR2180||0),
          eyeOpacity:Number(root.dataset.fxMagBirthEyeOpacityR2148||0),
          genomeCount:Number(root.dataset.fxMagBirthGenomeParticlesR2160||0),
          peak:Number(root.dataset.fxMagBirthFramePeakR1557||0),
          litPixels:Number(root.dataset.fxMagBirthThreeLitPixelsR2146||0)
        };
      });
      await page.screenshot({path:path.join(dir,name+'-desktop-1440x900.png'),fullPage:false});
      assert.deepEqual(errors,[],name+': browser JavaScript errors');
      assert.equal(state.renderer,'threejs-active',name+': canonical Three.js missing');
      assert.equal(state.centeredDna,'true',name+': DNA origin is off-axis');
      assert.ok(state.peak>35 && state.litPixels>1,name+': actual GPU frame is blank');
      assert.ok(state.genomeCount>=9000,name+': 9600-point GPU genome regressed');
      if(name==='dna'||name==='embryo'||name==='assembly'){
        assert.ok(state.nativeOpacity<.025,
          name+': permanent MAG leaked into birth film before titanium assembly: '+JSON.stringify(state));
        if(state.nativeConcealed!=='not-mounted'){
          assert.equal(state.nativeTransitionDuration,'0s',
            name+': concealing a live native MAG must not fade it from 1 to 0');
          assert.equal(state.nativeConcealed,'true',
            name+': native stage must remain strictly concealed before the titanium seats');
        }
      }
      if(name==='dna'){
        assert.ok(state.dnaOpacity>.45,'DNA does not dominate opening');
        assert.equal(state.armorPieces,0,'Metal appeared during DNA establishing shot');
        assert.equal(state.inlayPieces,0,'R2180 titanium appeared during DNA opening');
        assert.ok(state.embryoOpacity<.01,'Embryo appeared before DNA origin');
      }
      if(name==='embryo'){
        assert.ok(state.embryoOpacity>.45,'Biological nucleus invisible');
        assert.ok(state.embryoScale>.60,'Living cell nucleus must fill the studio close-up');
        assert.ok(state.dnaOpacity<.36,'DNA does not make room for the nucleus');
        assert.equal(state.armorPieces,0,'Metal appeared before the embryo');
        assert.equal(state.inlayPieces,0,'R2180 titanium covered the living nucleus');
      }
      if(name==='assembly'){
        assert.ok(state.armorPieces>=1,'Four-arm chassis did not begin assembling');
        assert.ok(state.inlayPieces>=2,'R2180 titanium inlays did not start seating');
        assert.ok(state.eyeOpacity<.003,'MAG optical organ ignited before assembly');
      }
      if(name==='mag'){
        assert.ok(state.armorPieces>=5,'Permanent titanium chassis is incomplete');
        assert.equal(state.inlayPieces,4,'R2180 four machined arm inlays incomplete');
        assert.ok(state.inlayOpacity>.70,'R2180 optical titanium material missing');
        assert.ok(state.eyeOpacity>.07 && state.eyeOpacity<.25,'MAG eye not visibly awakened');
      }
      outputs.push({name,seconds,...state});
      await page.close();
    }
    fs.writeFileSync(path.join(dir,'timeline.json'),JSON.stringify(outputs,null,2)+'\n');
    console.log('FORMATX_R2164_DESKTOP_GENESIS_STORYBOARD_PASS',JSON.stringify(outputs));
  }finally{await context.close();await browser.close();}
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1;});

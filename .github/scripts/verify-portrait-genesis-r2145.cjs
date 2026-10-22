'use strict';
/* R2145: visual proof of the real 2D / low-power mobile cinematic.
   Three intentionally distinct scenes must remain centered in a 412x915
   portrait crop: DNA at 1.6s, living embryo at 4.2s, metal MAG at 8.3s.
   Screenshots are retained as inspectable CI artifacts. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.FORMATX_TEST_URL||'http://127.0.0.1:4185/scifi-ui/index.html';
const mode=process.env.FORMATX_PORTRAIT_RENDERER==='three'?'three':'reference';
const dir=process.env.FORMATX_PORTRAIT_PROOF_DIR||'artifacts/r2145-portrait-genesis';
fs.mkdirSync(dir,{recursive:true});
// R2148: capture mechanical construction before the optical organ wakes.
const scenes=[['dna',1.6],['embryo',4.2],
  ...(mode==='three'?[['assembly',6.8]]:[]),
  ['mag',8.3]];

async function main(){
  const browser=await chromium.launch({
    headless:true,
    executablePath:process.env.CHROME_BIN||undefined,
    args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']
  });
  const outputs=[];
  try{
    for(const [name,seconds] of scenes){
      const context=await browser.newContext({
        viewport:{width:412,height:915},
        deviceScaleFactor:2,
        isMobile:true,
        hasTouch:true,
        reducedMotion:'no-preference',
        locale:'hu-HU'
      });
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(String(e)));
      const u=new URL(base);
      u.searchParams.set('intro','1');
      u.searchParams.set('visualintro','1');
      u.searchParams.set('introframe',String(seconds));
      if(mode==='reference')u.searchParams.set('proofrenderer','reference');
      await page.goto(u.href,{waitUntil:'domcontentloaded',timeout:30000});
      await page.waitForFunction(
        ()=>document.documentElement.dataset.fxMagBirthVisualFrameR659==='ready',
        null,{timeout:35000}
      );
      const state=await page.evaluate(()=>{
        const cv=document.querySelector('.fx-mag-birth-r533 canvas.fxb-particles');
        if(!(cv instanceof HTMLCanvasElement))return {error:'canvas missing'};
        const rect=cv.getBoundingClientRect();
        const pixels=cv.getContext('2d')?.getImageData(0,0,cv.width,cv.height);
        const root=document.documentElement;
        let count=0,highlight=0,cx=0,cy=0;
        if(pixels){
          const step=Math.max(1,Math.floor(Math.min(cv.width,cv.height)/230));
          const data=pixels.data;
          for(let y=0;y<cv.height;y+=step){
            for(let x=0;x<cv.width;x+=step){
              const i=(y*cv.width+x)*4;
              const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
              const nearCenter=Math.abs(x-cv.width*.5)<cv.width*.28
                && Math.abs(y-cv.height*.5)<cv.height*.37;
              if(nearCenter&&a>15&&b>r*1.10&&g>r*1.10&&(g+b)>80){
                count+=1;cx+=x;cy+=y;
              }
              if(nearCenter&&a>30&&g>95&&b>110)highlight+=1;
            }
          }
        }
        return{
          phase:root.dataset.fxMagBirthPhase,
          renderer:root.dataset.fxMagBirthRendererR1360,
          loader:root.dataset.fxMagBirthThreeLoaderR1608,
          peak:root.dataset.fxMagBirthFramePeakR1557,
          litPixels:root.dataset.fxMagBirthThreeLitPixelsR2146,
          armorPieces:root.dataset.fxMagBirthVisibleArmorR2147,
          eyeOpacity:root.dataset.fxMagBirthEyeOpacityR2148,
          eyeScale:root.dataset.fxMagBirthEyeScaleR2148,
          proof:root.dataset.fxMagBirthVisualFrameR659,
          width:cv.width,height:cv.height,
          rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},
          coloredSamples:count,highlightSamples:highlight,
          colorCentroid:count?[cx/count,cy/count]:null
        };
      });
      await page.screenshot({path:path.join(dir,name+'-portrait-412x915.png'),fullPage:false});
      assert.equal(errors.length,0,name+': browser page errors: '+errors.join(' | '));
      assert.equal(state.error,undefined,name+': '+state.error);
      if(mode==='reference'){
        assert.ok(state.coloredSamples>12,name+': no visible cyan subject in center crop: '+JSON.stringify(state));
        assert.ok(state.highlightSamples>1,name+': insufficient highlights in center crop: '+JSON.stringify(state));
      }else{
        assert.equal(state.renderer,'threejs-active',
          name+': true Three.js renderer did not activate: '+JSON.stringify(state));
        assert.ok(Number(state.peak)>35 && Number(state.litPixels)>1,
          name+': genuine bright Three.js geometry not found in GPU center crop: '+JSON.stringify(state));
        if(name==='dna'){
          assert.equal(Number(state.armorPieces),0,
            'R2147 must establish DNA before showing a single titanium panel');
        }
        if(name==='assembly'){
          assert.ok(Number(state.eyeOpacity)<.003,
            'R2148 pupil must not glow before five-piece metal assembly seats: '+JSON.stringify(state));
        }
        if(name==='mag'){
          assert.ok(Number(state.eyeOpacity)>.07&&Number(state.eyeOpacity)<.25,
            'R2148 central optic must ignite after assembly, with restrained emission: '+JSON.stringify(state));
          assert.ok(Number(state.eyeScale)>.42&&Number(state.eyeScale)<.60,
            'R2148 central eye must retain its authored physical size: '+JSON.stringify(state));
          assert.ok(Number(state.armorPieces)>=5,
            'R2147 metal finale must visibly seat the five authored titanium pieces: '+JSON.stringify(state));
        }
      }
      outputs.push({name,seconds,...state});
      await context.close();
    }
    assert.ok(outputs[0].phase!==''&&outputs[1].phase!==''&&outputs[2].phase!=='','phase telemetry missing');
    fs.writeFileSync(path.join(dir,'proof.json'),JSON.stringify(outputs,null,2)+'\n');
    console.log('FORMATX_PORTRAIT_GENESIS_PASS_'+mode.toUpperCase(),JSON.stringify(outputs));
  }finally{
    await browser.close();
  }
}
main().catch(error=>{console.error(error.stack||error);process.exitCode=1;});

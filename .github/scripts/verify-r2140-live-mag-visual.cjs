'use strict';
// Live mobile/desktop photographic evidence for the *permanent* R326 hero MAG.
// Do not mistake R533's temporary ten-second birth film for the on-page model.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const {PNG}=require('pngjs');
const OUT=process.env.FORMATX_R2140_VISUAL_DIR||'artifacts/r2140-live-mag';
const ORIGIN=process.env.FORMATX_R2140_URL||'https://formatxsuite.com';
fs.mkdirSync(OUT,{recursive:true});
const PROFILES=[
  {name:'mobile-390',viewport:{width:390,height:844},dpr:2,mobile:true},
  {name:'desktop-1440',viewport:{width:1440,height:900},dpr:1,mobile:false}
];
function pixelEvidence(file){
  const {width,height,data}=PNG.sync.read(fs.readFileSync(file));
  let lit=0,chromatic=0,samples=0,maxLuma=0;
  for(let y=Math.floor(height*.15);y<Math.floor(height*.86);y+=2){
    for(let x=Math.floor(width*.18);x<Math.floor(width*.82);x+=2){
      const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2];
      const lum=(r+g+b)/3;
      if(lum>34)lit++;
      if(g>r*1.20&&b>r*1.20&&lum>21)chromatic++;
      maxLuma=Math.max(maxLuma,lum);
      samples++;
    }
  }
  return{width,height,lit,chromatic,samples,maxLuma};
}
(async()=>{
  const browser=await chromium.launch({
    headless:true,
    executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',
    args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']
  });
  const reports=[];
  try{
    for(const p of PROFILES){
      const ctx=await browser.newContext({
        viewport:p.viewport,deviceScaleFactor:p.dpr,
        locale:'hu-HU',colorScheme:'dark',reducedMotion:'no-preference',
        isMobile:p.mobile,hasTouch:p.mobile
      });
      const page=await ctx.newPage();
      const pageErrors=[];
      page.on('pageerror',error=>pageErrors.push(String(error)));
      await page.addInitScript(()=>{
        try{sessionStorage.setItem('formatx:mag-birth-live-r533-seen','1');}catch(_){}
      });
      await page.goto(ORIGIN+'/?mobileproof=1&r2140-permanent-mag=1',{
        waitUntil:'domcontentloaded',timeout:45000
      });
      await page.waitForFunction(
        ()=>document.documentElement.dataset.fxCrystalOrganismR326==='ready',
        {timeout:60000}
      );
      const canvas=page.locator('#hero .hero-space > .fx-crystal-organism-r326-stage > .fx-crystal-organism-r326-canvas');
      await canvas.waitFor({state:'visible',timeout:10000});
      await page.waitForTimeout(1500);
      const state=await page.evaluate(()=>{
        const root=document.documentElement;
        const canvas=document.querySelector('#hero .hero-space > .fx-crystal-organism-r326-stage > .fx-crystal-organism-r326-canvas');
        const box=canvas?.getBoundingClientRect();
        const style=canvas?getComputedStyle(canvas):null;
        return {
          renderer:root.dataset.fxCoreRenderer||'',
          crystal:root.dataset.fxCrystalOrganismR326||'',
          geometry:root.dataset.fxCoreGeometryProfileR1603||'',
          canvasCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-canvas').length,
          stageCount:document.querySelectorAll('#hero .fx-crystal-organism-r326-stage').length,
          canvasPixels:[canvas?.width||0,canvas?.height||0],
          rect:box?{width:box.width,height:box.height,x:box.x,y:box.y}:null,
          display:style?.display||'',visibility:style?.visibility||'',
          birth:root.dataset.fxMagBirthLiveR533||''
        };
      });
      assert.equal(state.crystal,'ready',p.name+': native MAG not ready');
      assert.equal(state.canvasCount,1,p.name+': duplicate MAG canvases');
      assert.equal(state.stageCount,1,p.name+': duplicate MAG stages');
      assert.ok(state.rect?.width>80&&state.rect?.height>80,p.name+': MAG not onscreen');
      assert.ok(state.canvasPixels[0]>80&&state.canvasPixels[1]>80,p.name+': invalid framebuffer');
      const heroFile=path.join(OUT,p.name+'-page.png');
      const magFile=path.join(OUT,p.name+'-mag-canvas.png');
      await page.screenshot({path:heroFile,animations:'disabled'});
      await canvas.screenshot({path:magFile,animations:'disabled'});
      const pixels=pixelEvidence(magFile);
      assert.ok(pixels.lit>100,p.name+': native MAG canvas appears unlit / black');
      reports.push({...p,state,pixels,pageErrors,pageScreenshot:heroFile,magScreenshot:magFile});
      console.log('R2140_LIVE_VISUAL_PASS',JSON.stringify({name:p.name,state,pixels}));
      await ctx.close();
    }
  }finally{await browser.close();}
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(reports,null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1;});

'use strict';
// Exercise the actual light builder and chapter lighting with bundled Three.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');

(async()=>{
 const source=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 assert(source.includes("fxMagCinematicBioticR2221='cell-fill-retired-before-native-metal'"),'Missing R2221 state marker');
 const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
 const start=source.indexOf('  const clamp ='),end=source.indexOf('  function isSoftwareWebGL(){');
 assert(start>0&&end>start,'Missing actual cinematic implementation');
 const {K,smooth}=vm.runInNewContext('(function(){'+source.slice(start,end)+';return {K:FormatXGenesisThree,smooth};})()',{
  document:{documentElement:{dataset:{}}},navigator:{hardwareConcurrency:8},console
 });
 const lightStart=source.indexOf('      const assemblyStudio=smooth((t-5.45)/.95)');
 const lightEnd=source.indexOf('      // Keep the premature embryo optic off;',lightStart);
 assert(lightStart>0&&lightEnd>lightStart,'Missing authored lighting chapter');
 const lighting=vm.runInNewContext('(function(t,smooth,mix){const flash=0,after=0;'+source.slice(lightStart,lightEnd)+'})');
 const rows=[];
 for(const mobileRender of [true,false]){
  const engine=Object.create(K.prototype);
  Object.assign(engine,{THREE:T,mobileRender,width:mobileRender?390:1440,height:mobileRender?844:900,
   scene:new T.Scene(),camera:new T.PerspectiveCamera(42,1,.05,80),renderer:{}});
  engine.makeLights();
  assert(engine.bioticFill?.isPointLight,'The existing biological source must remain a real PointLight');
  const original=engine.bioticFill;
  const lightCount=engine.scene.children.filter(node=>node.isLight).length;
  const samples=[];
  for(const seconds of [0,4.2,5.75,6.0,6.5,7.0,7.25,8.1,10]){
   engine.updateCamera(seconds,seconds*1000);
   lighting.call(engine,seconds,smooth,(a,b,t)=>a+(b-a)*t);
   assert.equal(engine.bioticFill,original,'Do not replace or allocate the biological light per frame');
   assert.equal(engine.scene.children.filter(node=>node.isLight).length,lightCount,'Do not change the studio light count');
   const expected=5.8*(1-smooth((seconds-5.75)/1.50));
   assert(Math.abs(engine.bioticFill.intensity-expected)<1e-12,'Biological fill retirement differs from the authored chapter clock');
   if(seconds<=5.75)assert.equal(engine.bioticFill.intensity,5.8,'Keep the living-cell fill through its chapter');
   if(seconds>=7.25)assert.equal(engine.bioticFill.intensity,0,'Completed titanium must not retain the biological body wash');
   assert(engine.studioKey.intensity>0&&engine.studioFill.intensity>0,'Keep both physical studio directions active');
   samples.push({seconds,intensity:engine.bioticFill.intensity});
  }
  let previous=5.8,maxStep=0;
  for(let i=0;i<=60;i++){
   const seconds=5.75+i*.025;
   engine.updateCamera(seconds,seconds*1000);
   lighting.call(engine,seconds,smooth,(a,b,t)=>a+(b-a)*t);
   assert(engine.bioticFill.intensity<=previous+1e-12,'Biological light must retire monotonically');
   maxStep=Math.max(maxStep,previous-engine.bioticFill.intensity);
   previous=engine.bioticFill.intensity;
  }
  assert(maxStep<.16,'Biological fill must fade continuously without a visible intensity step');
  rows.push({mobileRender,lightCount,maxStep,samples});
 }
 console.log('MAG_BIOTIC_RETIREMENT_R2221_PASS',JSON.stringify({three:T.REVISION,actualPointLightAndLightingMethods:true,noAddedLights:true,cellChapterIntensity:5.8,completedMetalIntensity:0,notRenderedBrightnessOrHardwareAcceptance:true,rows}));
})().catch(error=>{console.error(error);process.exitCode=1;});

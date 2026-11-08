'use strict';
// R2340: exercise actual Three.js perspective camera on the live film builder.
// Insist on intact initial wide DNA, real near-camera macro and uninterrupted
// return into cell and MAG; no cuts or extra cameras.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 for(const token of [
   'const dnaMacro=smooth((t-.88)/.70)*',
   '(1-smooth((t-2.61)/.69));',
   'z-=dnaMacro*(this.mobileRender?1.18:1.52);',
   "fxGenesisMacroR2340="
 ]) assert(source.includes(token),'R2340 macro route missing: '+token);
 const start=source.indexOf('  const clamp ='),end=source.indexOf('  function isSoftwareWebGL(){');
 assert(start>0&&end>start);
 const K=vm.runInNewContext('(function(){'+source.slice(start,end)+';return FormatXGenesisThree;})()',{
  document:{documentElement:{dataset:{}}},navigator:{hardwareConcurrency:8},console
 });
 const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const rows=[];
 for(const mobileRender of [true,false]){
   const engine=Object.create(K.prototype);
   Object.assign(engine,{THREE:T,mobileRender,width:mobileRender?390:1440,
     height:mobileRender?844:900,camera:new T.PerspectiveCamera(42,1,.05,80)});
   const zAt=t=>{engine.updateCamera(t,t*1000);return engine.camera.position.z;};
   const macroAt=t=>smooth((t-.88)/.70)*(1-smooth((t-2.61)/.69));
   const k=smooth(.5/2.70);
   const baseline=(mobileRender?5.15:4.68)+
       (4.88-(mobileRender?5.15:4.68))*k+(mobileRender?.90:0);
   assert(Math.abs(zAt(.5)-baseline)<1e-10,
     'First complete DNA establishing frame must remain unzoomed');
   const k25=smooth(2.50/2.70);
   const wide=(mobileRender?5.15:4.68)+
       (4.88-(mobileRender?5.15:4.68))*k25+(mobileRender?.90:0);
   const macro=zAt(2.50);
   assert(Math.abs(macro-(wide-macroAt(2.50)*(mobileRender?1.18:1.52)))<1e-10);
   assert(wide-macro>(mobileRender?1.0:1.3),
     'Actual camera macro must move closer to physical DNA');
   assert(Math.abs(zAt(3.30)-(3.58+(mobileRender?.90:0)))<1e-10,
     'DNA macro must retire entirely at true biological cell');
   for(const boundary of [2.70,3.30,5.55,7.25,9.10]){
     const before=zAt(boundary-.0001),after=zAt(boundary+.0001);
     assert(Math.abs(after-before)<.003,
       'Camera discontinuity at physical film boundary: '+boundary);
   }
   const endZ=zAt(10.0);
   assert(Math.abs(endZ-(4.40+(mobileRender?.90:0)))<1e-10,
     'Permanent MAG landing camera must not change');
   rows.push({mobileRender,unmodifiedOpening:zAt(.50),macroZ:macro,
     wideEquivalentZ:wide,cellZ:zAt(3.30),endingZ:endZ});
 }
 console.log('GENESIS_R2340_CONTINUOUS_REAL_THREE_CAMERA_PASS',
   JSON.stringify({three:T.REVISION,rows,noExtraCamera:true,
     filmDurationSec:10,actualHardwareOrVisualAcceptance:false}));
})().catch(error=>{console.error(error);process.exitCode=1;});

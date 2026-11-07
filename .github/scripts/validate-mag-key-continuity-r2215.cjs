'use strict';
// Actual chapter lighting and camera methods, with real bundled Three math.
// Browser coverage independently reads the existing draw's uploaded direction.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');

(async()=>{
 const source=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 const native=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
 const match=native.match(/vec3 keyDir=normalize\(vec3\(([-.\d]+),([-.\d]+),([-.\d]+)\)\);/);
 assert(match,'Read the permanent MAG key from the actual native shader');
 const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
 const target=new T.Vector3(...match.slice(1).map(Number)).normalize();
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
  const lightCount=engine.scene.children.filter(node=>node.isLight).length;
  const direction=()=>{
   engine.camera.updateMatrixWorld();engine.scene.updateMatrixWorld(true);
   return engine.studioKey.position.clone().transformDirection(engine.camera.matrixWorldInverse);
  };
  const samples=[];
  for(const seconds of [0,1.6,4.2,6.2,7.25,7.4,7.6,7.9,8.1,8.3,9.5,10]){
   engine.updateCamera(seconds,seconds*1000);
   lighting.call(engine,seconds,smooth,(a,b,t)=>a+(b-a)*t);
   const actual=direction();
   assert(Number.isFinite(engine.studioKey.intensity)&&engine.studioKey.intensity>0);
   assert.equal(engine.scene.children.filter(node=>node.isLight).length,lightCount,'Do not allocate another studio source');
   if(seconds===0)assert.deepEqual(engine.studioKey.position.toArray(),[-3.8,5.4,6.4]);
   if(seconds===1.6)assert.deepEqual(engine.studioKey.position.toArray(),[-4.22,5.4,6.4]);
   if(seconds===4.2)assert.deepEqual(engine.studioKey.position.toArray(),[-3.8,5.74,6.4]);
   if(seconds>=7.25){
    const assembly=smooth((seconds-5.45)/.95)*(1-smooth((seconds-7.15)/1.45));
    const oldPosition=new T.Vector3(-3.8+assembly*1.30,5.4-assembly*.70,6.4);
    const oldFront=oldPosition.clone().normalize().dot(engine.camera.position.clone().normalize())*(1.62+assembly*.70);
    const actualFront=actual.z*engine.studioKey.intensity;
    assert(Math.abs(actualFront-oldFront)<1e-10,'Changing key direction must preserve frontal irradiance');
   }
   if(seconds>=8.1)assert(actual.distanceTo(target)<1e-10,'The cinematic key still differs from the permanent MAG key');
   samples.push({seconds,direction:actual.toArray(),intensity:engine.studioKey.intensity});
  }
  let previous=null,maxDirectionStep=0;
  for(let i=0;i<=40;i++){
   const seconds=7.1+i*.025;
   engine.updateCamera(seconds,seconds*1000);lighting.call(engine,seconds,smooth,(a,b,t)=>a+(b-a)*t);
   const actual=direction();
   if(previous)maxDirectionStep=Math.max(maxDirectionStep,actual.angleTo(previous));
   previous=actual;
  }
  assert(maxDirectionStep<.04,'The physical key must move continuously into the handoff');
  rows.push({mobileRender,lightCount,maxDirectionStep,samples});
 }
 console.log('MAG_KEY_CONTINUITY_R2215_PASS',JSON.stringify({three:T.REVISION,target:target.toArray(),actualCameraAndLightingMethods:true,notRenderedBrightnessOrHardwareAcceptance:true,rows}));
})().catch(error=>{console.error(error);process.exitCode=1;});

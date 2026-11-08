'use strict';
// R2336: exercise the actual film camera, studio lights, and mechanical landing
// with the bundled Three r185 math. This is not a rendered-device visual pass.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');

(async()=>{
 const source=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 assert(source.includes("fxMagStudioContinuityR2336="),'Missing published R2336 pose/lighting state marker');
 const native=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
 const match=native.match(/vec3 sideDir=normalize\(vec3\(([-.\d]+),([-.\d]+),([-.\d]+)\)\);/);
 assert(match,'Read the permanent MAG side light from the actual native shader');
 const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
 const target=new T.Vector3(...match.slice(1).map(Number)).normalize();
 const keyMatch=native.match(/vec3 keyDir=normalize\(vec3\(([-.\d]+),([-.\d]+),([-.\d]+)\)\);/);
 assert(keyMatch,'Read the permanent MAG key light from the actual native shader');
 const keyTarget=new T.Vector3(...keyMatch.slice(1).map(Number)).normalize();
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
  const direction=(source)=>{
   engine.camera.updateMatrixWorld();engine.scene.updateMatrixWorld(true);
   return source.position.clone().transformDirection(engine.camera.matrixWorldInverse);
  };
  const samples=[];
  for(const seconds of [0,1.6,4.2,6.2,7.25,7.4,7.6,7.9,8.1,8.3,9.5,10]){
   engine.updateCamera(seconds,seconds*1000);
   lighting.call(engine,seconds,smooth,(a,b,t)=>a+(b-a)*t);
   const actual=direction(engine.studioFill);
   assert(Number.isFinite(engine.studioFill.intensity)&&engine.studioFill.intensity>0);
   assert.equal(engine.scene.children.filter(node=>node.isLight).length,lightCount,'Do not allocate another studio source');
   if(seconds===0)assert.deepEqual(engine.studioFill.position.toArray(),[4.4,1.8,5.2]);
   if(seconds===1.6)assert.deepEqual(engine.studioFill.position.toArray(),[4.08,1.8,5.2]);
   if(seconds===4.2)assert.deepEqual(engine.studioFill.position.toArray(),[4.4,2.45,5.2]);
   if(seconds>=7.25){
    const assembly=smooth((seconds-5.45)/.95)*(1-smooth((seconds-7.15)/1.45));
    const oldPosition=new T.Vector3(4.4-assembly*1.15,1.8+assembly*.50,5.2);
    const oldFront=oldPosition.clone().normalize().dot(engine.camera.position.clone().normalize())*(.42+assembly*.38);
    const actualFront=actual.z*engine.studioFill.intensity;
    assert(Math.abs(actualFront-oldFront)<1e-10,'Changing fill direction must preserve frontal irradiance');
   }
   if(seconds>=8.1)assert(actual.distanceTo(target)<1e-10,'The cinematic fill still differs from the permanent MAG side light');
   if(seconds>=8.1)assert(direction(engine.studioKey).distanceTo(keyTarget)<1e-10,
     'The cinematic key still differs from the permanent MAG key light');
   samples.push({seconds,direction:actual.toArray(),intensity:engine.studioFill.intensity});
  }
  let previous=null,maxDirectionStep=0;
  for(let i=0;i<=40;i++){
   const seconds=7.1+i*.025;
   engine.updateCamera(seconds,seconds*1000);lighting.call(engine,seconds,smooth,(a,b,t)=>a+(b-a)*t);
   const actual=direction(engine.studioFill);
   if(previous)maxDirectionStep=Math.max(maxDirectionStep,actual.angleTo(previous));
   previous=actual;
  }
  assert(maxDirectionStep<.04,'The physical fill must move continuously into the handoff');
  rows.push({mobileRender,lightCount,maxDirectionStep,samples});
 }

 // Extract and execute the real R2336 pose block, not a copy of its equations.
 const poseStart=source.indexOf('      const nativePose=smooth((t-7.25)/.85)');
 const poseEnd=source.indexOf('      /* R1945k —',poseStart);
 assert(poseStart>0&&poseEnd>poseStart,'Mechanical pose handoff is missing');
 const move=vm.runInNewContext('(function(t,smooth){'+source.slice(poseStart,poseEnd)+'})');
 const poses=[];
 for(const mobileRender of [true,false]){
   const actual={};
   const ctx={mobileRender,mechanicalGroup:{rotation:{set(x,y,z){Object.assign(actual,{x,y,z});}}}};
   const pitch=mobileRender?-.160:-.140,yaw=mobileRender?.135:.145;
   for(const seconds of [0,7.25,7.40,7.675,7.90,8.10,9.50,10.00]){
     move.call(ctx,seconds,smooth);
     const mixPose=smooth((seconds-7.25)/.85);
     for(const [axis,expected] of Object.entries({
       x:pitch*mixPose,y:yaw*mixPose,z:-.037*mixPose
     })){
       assert(Math.abs(actual[axis]-expected)<1e-12,'Incorrect native '+axis+' pose at '+seconds);
     }
     poses.push({mobileRender,seconds,...actual});
   }
 }
 console.log('MAG_POSE_STUDIO_CONTINUITY_R2336_PASS',JSON.stringify({three:T.REVISION,target:target.toArray(),keyTarget:keyTarget.toArray(),poses,actualCameraAndLightingMethods:true,noAddedLights:true,notRenderedBrightnessOrHardwareAcceptance:true,rows}));
})().catch(error=>{console.error(error);process.exitCode=1;});

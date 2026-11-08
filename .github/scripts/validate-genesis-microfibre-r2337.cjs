'use strict';
// R2337: load the real Three r185 source and construct actual physical DNA
// meshes and the common generated phosphatic microfibre texture.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 assert(src.includes('fxGenesisBiopolymerR2337='),'R2337 source marker missing');
 assert(src.includes('fxGenesisSatinMacroR2341='),'R2341 satin material marker missing');
 const start=src.indexOf('  const clamp =');
 const end=src.indexOf('  function isSoftwareWebGL(){');
 assert(start>0&&end>start,'Cannot isolate actual Three scene builder');
 const {K}=vm.runInNewContext('(function(){'+src.slice(start,end)+';return {K:FormatXGenesisThree};})()',{
   document:{documentElement:{dataset:{}}},navigator:{hardwareConcurrency:8},console
 });
 const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
 const results=[];
 for(const mobileRender of [true,false]){
   const engine=Object.create(K.prototype);
   engine.THREE=T;engine.mobileRender=mobileRender;
   const originalCount=engine.dnaFiberTexture?1:0;
   const helix=engine.createHelix(4.7,.42,4.1);
   assert.equal(helix.children.length,7,'Existing physical draw group changed');
   const a=helix.children[2],b=helix.children[3];
   assert(a.isMesh&&b.isMesh&&a.geometry.isBufferGeometry&&b.geometry.isBufferGeometry);
   assert(a.material.isMeshPhysicalMaterial&&b.material.isMeshPhysicalMaterial);
   assert.strictEqual(a.material.bumpMap,b.material.bumpMap,'Biopolymer strands must share one texture');
   assert.strictEqual(a.material.bumpMap,engine.dnaFiberTexture);
   assert.equal(engine.dnaFiberTexture.image.width,128);
   assert.equal(engine.dnaFiberTexture.image.height,128);
   assert.equal(engine.dnaFiberTexture.image.data.length,128*128*4);
   assert.equal(engine.dnaFiberTexture.wrapS,T.RepeatWrapping);
   assert.equal(engine.dnaFiberTexture.minFilter,T.LinearMipmapLinearFilter);
   assert.equal(engine.dnaFiberTexture.generateMipmaps,true);
   assert.equal(engine.dnaFiberTexture.repeat.x,4);
   assert.equal(engine.dnaFiberTexture.repeat.y,2);
   // The shared 128px asset must contain REAL greyscale microfibrils,
   // not a constant texture masquerading as a bump map.
   const greys=engine.dnaFiberTexture.image.data;
   let lo=255,hi=0;
   for(let i=0;i<greys.length;i+=4){
     const v=greys[i];
     assert.equal(greys[i+1],v);
     assert.equal(greys[i+2],v);
     assert.equal(greys[i+3],255);
     lo=Math.min(lo,v);hi=Math.max(hi,v);
   }
   assert(hi-lo>=70,'Macro phosphate texture is effectively flat');

   const actual=[
     [a.material,.51,.30,.42,0x6683b0,.37],
     [b.material,.53,.29,.44,0x8974ac,.37]
   ];
   for(const [m,rough,coat,coatRough,color,emission] of actual){
     assert.equal(m.roughness,rough);
     assert.equal(m.clearcoat,coat);
     assert.equal(m.clearcoatRoughness,coatRough);
     assert.equal(m.color.getHex(),color);
     assert.equal(m.emissiveIntensity,emission);
     assert.equal(m.bumpScale,mobileRender?.023:.031);
     assert.equal(m.transparent,true);
   }
   assert(a.material.roughness>.50&&b.material.roughness>.50,'DNA must be satin, not polished plastic');
   assert(a.material.clearcoat<.35&&b.material.clearcoat<.35,'DNA clearcoat is too glossy');
   assert.equal(helix.userData.baseOpacity[2],.058);
   assert.equal(helix.userData.baseOpacity[3],.052);
   const second=engine.createHelix(2.2,.27,2.8);
   assert.strictEqual(second.children[2].material.bumpMap,engine.dnaFiberTexture,
     'Secondary donor must reuse the same GPU texture');
   assert.equal(originalCount,0);
   results.push({mobileRender,children:helix.children.length,textureBytes:engine.dnaFiberTexture.image.data.byteLength,
     materialCount:helix.userData.materials.length,sharedTexture:true,bumpScale:a.material.bumpScale});
 }
 console.log('GENESIS_REAL_3D_SATIN_PHOSPHATE_R2341_PASS',JSON.stringify({
   three:T.REVISION,results,actualSceneBuilder:true,noExtraTextureOrRenderer:true,
   visualHardwareAcceptance:false
 }));
})().catch(e=>{console.error(e);process.exitCode=1;});

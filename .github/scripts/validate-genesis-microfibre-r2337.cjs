'use strict';
// R2337: load the real Three r185 source and construct actual physical DNA
// meshes and the common generated phosphatic microfibre texture.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 assert(src.includes('fxGenesisBiopolymerR2337='),'R2337 source marker missing');
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
   const actual=[
     [a.material,.355,.72,.18,0x7796c4,.54],
     [b.material,.37,.70,.19,0x987cb8,.53]
   ];
   for(const [m,rough,coat,coatRough,color,emission] of actual){
     assert.equal(m.roughness,rough);
     assert.equal(m.clearcoat,coat);
     assert.equal(m.clearcoatRoughness,coatRough);
     assert.equal(m.color.getHex(),color);
     assert.equal(m.emissiveIntensity,emission);
     assert.equal(m.bumpScale,mobileRender?.014:.020);
     assert.equal(m.transparent,true);
   }
   const second=engine.createHelix(2.2,.27,2.8);
   assert.strictEqual(second.children[2].material.bumpMap,engine.dnaFiberTexture,
     'Secondary donor must reuse the same GPU texture');
   assert.equal(originalCount,0);
   results.push({mobileRender,children:helix.children.length,textureBytes:engine.dnaFiberTexture.image.data.byteLength,
     materialCount:helix.userData.materials.length,sharedTexture:true,bumpScale:a.material.bumpScale});
 }
 console.log('GENESIS_REAL_3D_BIOPOLYMER_R2337_PASS',JSON.stringify({
   three:T.REVISION,results,actualSceneBuilder:true,noExtraTextureOrRenderer:true,
   visualHardwareAcceptance:false
 }));
})().catch(e=>{console.error(e);process.exitCode=1;});

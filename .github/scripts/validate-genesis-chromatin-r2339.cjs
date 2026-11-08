'use strict';
// R2339: execute the real seeded biological 3D cell texture generator with
// bundled Three r185, both viewport profiles, and compare full pixel buffers.
const assert=require('node:assert/strict'),fs=require('node:fs');
const path=require('node:path'),vm=require('node:vm');
const {pathToFileURL}=require('node:url');
(async()=>{
 const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 for(const token of [
   'const grain=(hash(x,y)-.5)*15;',
   'const chromatin=clamp((mineral-.53)*3.2)*(.45+.55*cloud);',
   '(20+72*cloud+155*coral+58*freckle+12*chromatin+grain)/255',
   '(87+165*cloud-36*coral+24*freckle+19*chromatin+grain)/255',
   '(95+169*cloud-54*coral+18*freckle+20*chromatin+grain)/255',
   'metalness:.015,roughness:.43,clearcoat:.72,clearcoatRoughness:.26,',
   'transmission:.065,thickness:.19,ior:1.34,',
   'dataset.fxGenesisTissueR2339='
 ])assert(source.includes(token),'R2339 genuine cell source regression: '+token);
 const start=source.indexOf('  const clamp =');
 const end=source.indexOf('  function isSoftwareWebGL(){');
 assert(start>0&&end>start,'Cannot isolate actual Three builder');
 const K=vm.runInNewContext('(function(){'+source.slice(start,end)+';return FormatXGenesisThree;})()',{
   document:{documentElement:{dataset:{}}},navigator:{hardwareConcurrency:8},console
 });
 const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
 const results=[];
 for(const mobileRender of [true,false]){
   const engine=Object.create(K.prototype);
   Object.assign(engine,{THREE:T,mobileRender,renderer:{capabilities:{getMaxAnisotropy:()=>4}}});
   const first=engine.makeEmbryoTexture();
   const second=engine.makeEmbryoTexture();
   const expected=mobileRender?[384,192]:[512,256];
   for(const texture of [first,second]){
     assert.equal(texture.image.width,expected[0]);
     assert.equal(texture.image.height,expected[1]);
     assert.equal(texture.image.data.length,expected[0]*expected[1]*4);
     assert.equal(texture.colorSpace,T.SRGBColorSpace);
     assert.equal(texture.minFilter,T.LinearMipmapLinearFilter);
     assert.equal(texture.generateMipmaps,true);
   }
   const a=first.image.data,b=second.image.data;
   assert.equal(Buffer.compare(Buffer.from(a),Buffer.from(b)),0,
     'Texture pixels must remain deterministic without network/download');
   let varMin=255,varMax=0,alpha=0;
   for(let i=0;i<a.length;i+=4){
     varMin=Math.min(varMin,a[i+1]);varMax=Math.max(varMax,a[i+1]);
     if(a[i+3]===255)alpha++;
   }
   assert.equal(alpha,expected[0]*expected[1],'Texture must remain fully opaque');
   assert(varMax>varMin+10,'Biological chromatin lost nonuniform visible texture');
   results.push({mobileRender,size:expected,bytes:a.byteLength,greenRange:[varMin,varMax],
     deterministic:true});
 }
 console.log('GENESIS_R2339_REAL_TEXTURE_DETERMINISM_PASS',JSON.stringify({
   three:T.REVISION,results,actualTextureData:true,addedTextures:false,
   visualHardwareAcceptance:false
 }));
})().catch(e=>{console.error(e);process.exitCode=1;});

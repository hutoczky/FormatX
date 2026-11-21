'use strict';
// Exercise the real Three scene builders and chapter updates without a GPU.
// Browser coverage separately observes the actual film and its draw budget.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');

(async()=>{
 const source=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
 const T=await import(pathToFileURL(path.resolve('docs/scifi-ui/scripts/three-r185.module.js')).href);
 const start=source.indexOf('  const clamp ='),end=source.indexOf('  function isSoftwareWebGL(){');
 assert(start>0&&end>start,'Missing actual cinematic implementation');
 const document={documentElement:{dataset:{}}};
 const {K,seeded}=vm.runInNewContext('(function(){'+source.slice(start,end)+';return {K:FormatXGenesisThree,seeded};})()', {document,console});
 const buffers=groups=>{
  const hash=crypto.createHash('sha256'),seen=new Set();
  for(const group of groups)group.traverse(node=>{
   const geometry=node.geometry;if(!geometry||seen.has(geometry))return;seen.add(geometry);
   for(const name of Object.keys(geometry.attributes).sort()){
    const a=geometry.attributes[name].array;hash.update(name);hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));
   }
   if(geometry.index){const a=geometry.index.array;hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}
  });
  return hash.digest('hex');
 };
 const rows=[];
 for(const mobileRender of [true,false]){
  const engine=Object.create(K.prototype);
  Object.assign(engine,{THREE:T,mobileRender,rand:seeded(0xF04A650),organicGroup:new T.Group(),cellGroup:new T.Group(),microFiberTexture:new T.Texture()});
  engine.makeOrganicLayer();engine.makeCellularLayer();
  const groups=[engine.organicGroup,engine.cellGroup],before=buffers(groups),samples=[];
  for(const seconds of [0,1.6,3.7,4.2,5.8,6.2,6.5,7,7.35,8.3,10]){
   engine.updateOrganic(seconds,seconds*1000);engine.updateCells(seconds,seconds*1000);
   const visibleObjects=groups.map(group=>{let n=0;group.traverseVisible(node=>{if(node.isMesh||node.isLine||node.isPoints)n++;});return n;});
   const sample={seconds,organicVisible:engine.organicGroup.visible,cellsVisible:engine.cellGroup.visible,visibleObjects,
    organicOpacity:engine.organicShellMaterial.opacity,cellOpacity:engine.cellMaterial.opacity};
   if(seconds===4.2){
    assert(sample.organicVisible&&sample.cellsVisible,'The living biological chapter must remain present');
    assert(visibleObjects.every(n=>n>20),'The actual supporting meshes must be exercised');
   }
   if(seconds>=7.35){
    assert.equal(sample.organicVisible,false,'Retired organic meshes still submit to the final metal chapter');
    assert.equal(sample.cellsVisible,false,'Retired cell meshes still submit to the final metal chapter');
    assert.equal(sample.organicOpacity,0);assert.equal(sample.cellOpacity,0);
    assert(visibleObjects.every(n=>n===0),'A retired scene branch still contains visible drawables');
   }
   samples.push(sample);
  }
  assert.equal(buffers(groups),before,'Chapter retirement must not rewrite or rebuild geometry buffers');
  rows.push({mobileRender,geometryBuffersUnchanged:true,samples});
  const disposed=new Set();for(const group of groups)group.traverse(node=>{
   if(node.geometry&&!disposed.has(node.geometry)){disposed.add(node.geometry);node.geometry.dispose();}
   const materials=Array.isArray(node.material)?node.material:[node.material];
   for(const m of materials)if(m&&!disposed.has(m)){disposed.add(m);m.dispose();}
  });engine.microFiberTexture.dispose();
 }
 console.log('GENESIS_CHAPTER_RETIREMENT_R2214_PASS',JSON.stringify({three:T.REVISION,actualSceneBuildersAndUpdates:true,notBrowserOrHardwarePerformanceCertification:true,rows}));
})().catch(error=>{console.error(error);process.exitCode=1;});

'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
assert.equal((s.match(/this\.mechLight=new T\.PointLight\(/g)||[]).length,1);
assert.ok(s.includes('this.mechanicalGroup.add(this.mechLight);'));
assert.ok(s.includes('this.mechLight.intensity=(.92+.18*finale)*opticWake*opticPulse;'));
const a=s.indexOf('    studioPixelRatio('),b=s.indexOf('    targetWorld(){',a);
assert.ok(a>=0&&b>a);
const simulate=new Function(`
 let innerWidth=1366,innerHeight=768,devicePixelRatio=1,sets=0,pixelSets=0,projections=0,ratio=1;
 const document={documentElement:{dataset:{}}};
 class Engine{${s.slice(a,b)}}
 const e=new Engine();e.width=e.height=1;e.mobileRender=false;e.studioHardware=true;e.maxRenderSize=8192;
 e.renderer={getPixelRatio:()=>ratio,setPixelRatio:v=>{ratio=v;pixelSets++;},setSize:()=>sets++,getContext:()=>({drawingBufferWidth:Math.floor(innerWidth*ratio),drawingBufferHeight:Math.floor(innerHeight*ratio)})};
 e.camera={updateProjectionMatrix:()=>projections++};
 return {resize:()=>e.resize(),viewport:(w,h,d)=>{innerWidth=w;innerHeight=h;devicePixelRatio=d;},dispose:()=>e.disposed=true,stats:()=>({sets,pixelSets,projections,aspect:e.camera.aspect})};
`)();
simulate.resize();for(let i=0;i<1000;i++)simulate.resize();
assert.equal(simulate.stats().sets,1);assert.equal(simulate.stats().pixelSets,0);assert.equal(simulate.stats().projections,1);
simulate.viewport(1366,768,2);simulate.resize();assert.equal(simulate.stats().sets,2);assert.equal(simulate.stats().pixelSets,1);
simulate.viewport(390,844,2);simulate.resize();assert.equal(simulate.stats().sets,3);assert.equal(simulate.stats().aspect,390/844);
simulate.dispose();simulate.viewport(800,600,1);simulate.resize();assert.equal(simulate.stats().sets,3);
console.log('R2323 GENESIS light and resize contract: PASS');

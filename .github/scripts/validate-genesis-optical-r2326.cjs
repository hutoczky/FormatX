'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('    makeIrisTexture(){'),b=s.indexOf('    makeBurstTexture(){',a);
const make=new Function('document','return ({'+s.slice(a,b)+'}).makeIrisTexture')({createElement:()=>({getContext:()=>new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)})})});
for(const studioHardware of [false,true]){
 let allocations=0;
 const e={studioHardware,THREE:{CanvasTexture:class{constructor(c){this.canvas=c;allocations++}},SRGBColorSpace:'srgb'}};
 const first=make.call(e);assert.equal(first.canvas.width,studioHardware?512:256);assert.equal(make.call(e),first);assert.equal(allocations,1);
}
assert.ok(s.includes('this.studioHardware?1024:512')&&s.includes('const height=width/2'));
assert.ok(s.includes('this.studioHardware?64:42')&&s.includes('this.studioHardware?48:30'));
assert.ok(s.includes('this.irisTexture?.dispose?.()'));
console.log('R2326 optical detail: PASS');

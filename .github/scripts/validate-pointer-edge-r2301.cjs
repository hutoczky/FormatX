'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const a=s.indexOf('    function globalPoint(event){'),b=s.indexOf('    function applyAmbientPointer',a);
assert.ok(a>=0&&b>a);
const ctx=vm.createContext({innerWidth:1920,innerHeight:1080,clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
vm.runInContext(s.slice(a,b),ctx);
for(const [input,x,y] of [[{clientX:0,clientY:0},-1,1],[{clientX:1920,clientY:1080},1,-1],[{clientX:960,clientY:540},0,0],[{},0,0],[{clientX:NaN,clientY:Infinity},0,0],[{clientX:-50,clientY:2000},-1,-1]]){
 ctx.input=input;
 const p=vm.runInContext('globalPoint(input)',ctx);
 assert.equal(p.x,x);assert.ok(p.y===y);
}
console.log('R2301 pointer edge regression: PASS');

'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('    vector3(name,value){'),b=s.indexOf('    programFor(gl){',a);
const vector3=new Function('return ({'+s.slice(a,b)+'}).vector3')();
const calls=[];
const ctx={vectorCache:new Map(),vectorWrites:0,vectorSkips:0,uniform:{uOffset:1,uScale:2,uColor:3},gl:{uniform3fv:(id,v)=>calls.push([id,...v])}};
const v=(name,value)=>vector3.call(ctx,name,value);
const color=[.23,.32,.39];
for(let i=0;i<1000;i++){
 v('uOffset',[i,2,3]);v('uScale',[1,2,3]);v('uColor',color);
}
assert.equal(ctx.vectorWrites,1002);assert.equal(ctx.vectorSkips,1998);
color[2]=.44;v('uColor',color);assert.deepEqual(calls.at(-1),[3,.23,.32,.44]);
v('uScale',new Float32Array([1,2,3]));assert.equal(ctx.vectorSkips,1999);
ctx.vectorCache.clear();v('uScale',[1,2,3]);assert.deepEqual(calls.at(-1),[2,1,2,3]);
assert.equal(ctx.vectorWrites,1004);
assert.ok(s.includes('this.vectorCache.clear();this.vectorWrites=0;this.vectorSkips=0;'));
assert.ok(s.includes("this.vector3('uOffset',pos);this.vector3('uScale',size);this.vector3('uColor',color);"));
console.log('R2334 vector uniform submission: PASS; repeated uploads eliminated without changing values');

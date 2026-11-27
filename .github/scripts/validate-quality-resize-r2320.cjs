'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const callbacks=[...s.matchAll(/qualityResizeTimer=later\(\(\)=>\{([\s\S]*?)\},0\);/g)];
assert.equal(callbacks.length,2);
for(const match of callbacks){
 const simulate=new Function('changed','disposed','contextLost',`
 let qualityResizeTimer=42,draws=0,reads=0;
 const resize=onlyChanged=>{if(onlyChanged!==true)throw Error('not change-only');reads++;return changed;};
 const schedule=()=>draws++;
 const tick=()=>{${match[1]}};
 tick();return {draws,reads,timer:qualityResizeTimer};
 `);
 for(const [changed,disposed,lost,draws,reads] of [[false,false,false,0,1],[true,false,false,1,1],[true,true,false,0,0],[true,false,true,0,0]]){
   const result=simulate(changed,disposed,lost);
   assert.equal(result.draws,draws);assert.equal(result.reads,reads);assert.equal(result.timer,0);
 }
}
console.log('R2320 quality resize callbacks: 8/8 PASS; no redraw for unchanged dimensions');

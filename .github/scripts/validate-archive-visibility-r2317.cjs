'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const a=s.indexOf('    function onStageIntersection('),b=s.indexOf('    const io=new IntersectionObserver(onStageIntersection',a);
assert.ok(a>=0&&b>a);
const simulate=new Function(`
 let visible=true,raf=7,scrollTransitPermit=true,cancels=0,draws=0,pulses=0;
 const root={dataset:{}},schedule=()=>draws++,cancelAnimationFrame=()=>cancels++,scheduleSurfacePulse=()=>pulses++;
 ${s.slice(a,b)}
 return {dock:active=>root.dataset.fxArchiveDock=active?'active':'home',report:(shown)=>onStageIntersection([{isIntersecting:shown,intersectionRatio:shown?1:0}]),stats:()=>({visible,raf,scrollTransitPermit,cancels,draws,pulses})};
`);
const archive=simulate();archive.dock(true);
for(let i=0;i<1000;i++)archive.report(false);
assert.equal(archive.stats().raf,7);assert.equal(archive.stats().scrollTransitPermit,true);assert.equal(archive.stats().cancels,0);assert.equal(archive.stats().draws,0);
archive.dock(false);archive.report(false);assert.equal(archive.stats().raf,0);assert.equal(archive.stats().scrollTransitPermit,false);assert.equal(archive.stats().cancels,1);
archive.report(true);assert.equal(archive.stats().draws,1);
assert.ok(s.includes("(!visible&&!archiveLive)"));
console.log('R2317 archive visibility: PASS (1000 offscreen reports, pending transit retained; normal offscreen cancellation preserved)');

'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
assert.doesNotThrow(()=>new Function(src));
const a=src.indexOf('    function holdSoftwareScroll(){'),b=src.indexOf('    function onScroll(){',a);
assert.ok(a>=0&&b>a);
const simulate=new Function('softwareRenderer',`
 let raf=7,scrollTransitPermit=false,burstFrames=4,scrollSettleTimer=0,surfaceFrameTimer=9;
 let seq=10,draws=0,scheduled=0,blockedFlag=false,clock=0;
 const root={dataset:{fxArchiveDock:'active'}},delayed=new Set([9]),jobs=new Map(),cancelled=new Set();
 const performance={now:()=>180},blocked=()=>blockedFlag;
 const frame=t=>{if(t!==180)throw Error('wrong clock');draws++;};
 const prepareFrameClock=()=>clock++,schedule=()=>{if(!blocked())scheduled++;};
 const cancelAnimationFrame=i=>cancelled.add(i),clearTimeout=i=>jobs.delete(i);
 const setTimeout=(f,ms)=>{if(ms!==180)throw Error('wrong settle delay');jobs.set(++seq,f);return seq;};
 ${src.slice(a,b)}
 return {hold:holdSoftwareScroll,flush:()=>{for(const [i,f] of [...jobs]){jobs.delete(i);f();}},
  pending:()=>{raf=88;scrollTransitPermit=true;},
  block:()=>{blockedFlag=true;},home:()=>{root.dataset.fxArchiveDock='home';},
  state:()=>({draws,scheduled,clock,raf,burstFrames,scrollSettleTimer,surfaceFrameTimer,
    permit:scrollTransitPermit,delayed:delayed.size,timers:jobs.size,cancelled:[...cancelled]})};
`);
let x=simulate(true);x.hold();x.hold();assert.equal(x.state().timers,1);x.pending();x.flush();
assert.equal(x.state().draws,1);assert.equal(x.state().raf,0);assert.equal(x.state().clock,1);
assert.equal(x.state().surfaceFrameTimer,0);assert.equal(x.state().delayed,0);
assert.equal(x.state().permit,false);assert.ok(x.state().cancelled.includes(88));x.flush();assert.equal(x.state().draws,1);
x=simulate(true);x.hold();x.block();x.flush();assert.equal(x.state().draws,0);assert.equal(x.state().scheduled,0);
x=simulate(true);x.home();x.hold();x.flush();assert.equal(x.state().draws,0);assert.equal(x.state().scheduled,1);
x=simulate(false);x.hold();x.flush();assert.equal(x.state().draws,0);assert.equal(x.state().timers,0);
for(const p of ["docs/scifi-ui/scripts/formatx-core-real3d-v20.js","docs/scifi-ui/scripts/formatx-core-mobile-v55.js","docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js","docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js","docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js","docs/scifi-ui/index.html","billing-worker/src/production-content-entry.js"])assert.ok(fs.readFileSync(p,'utf8').includes('r2329-optical-finish-r2352-settled-frame'),p);
assert.ok(src.includes('get renderState(){return {blocked:blocked()'));
assert.ok(fs.readFileSync('.github/scripts/measure-mag-scroll-budget-r2226.cjs','utf8').includes('scheduler:window.FormatXLivingCore?.renderState||null'));
console.log('R2352 settled archive frame, pause/home/hardware safety and cache graph: PASS');

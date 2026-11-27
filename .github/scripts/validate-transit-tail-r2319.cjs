'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const native=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const archive=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const section=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i);return s.slice(i,j);};
const simulate=new Function(`
 let now=100,lastScrollTransit=0,raf=0,scrollTransitPermit=false,burstFrames=0,scrollSettleTimer=1;
 let gpuTailTimer=0,lastGpu=0,disposed=false,archiveActive=true,current={},lastRenderedGate=false,blockedState=false,seq=0,rendered=0;
 const jobs=new Map(),performance={now:()=>now},softwareRenderer=true,blocked=()=>blockedState;
 const document={hidden:false},reduced={matches:false},mobile=()=>true,softwareMagRenderer=()=>true,transitNeedsFrame=()=>true;
 const PerformanceManager={frameInterval:()=>32};
 const queueFrame=()=>{raf=1;},schedule=()=>{raf=1;};
 const setTimeout=(fn,ms)=>{jobs.set(++seq,{fn,due:now+ms});return seq;},clearTimeout=id=>jobs.delete(id);
 ${section(native,'    function requestTransitRender(){','    function boost(')}
 const window={FormatXLivingCore:{requestTransitRender}};
 ${section(archive,'  function requestArchiveFrame(){','  function invalidate(){')}
 const step=t=>{now=t;for(const [id,job] of [...jobs])if(job.due<=now){jobs.delete(id);job.fn();}};
 return {request:requestArchiveFrame,step,render:()=>{if(raf){raf=0;scrollTransitPermit=false;lastScrollTransit=now;rendered++;}},block:()=>blockedState=true,stats:()=>({raf,timers:jobs.size,rendered,permit:scrollTransitPermit})};
`);
const t=simulate();t.request();assert.equal(t.stats().timers,1);assert.equal(t.stats().raf,0);
t.step(150);t.request();assert.equal(t.stats().timers,1);
t.step(239);assert.equal(t.stats().raf,0);t.step(240);assert.equal(t.stats().raf,1);assert.equal(t.stats().timers,0);
t.render();assert.equal(t.stats().rendered,1);
t.step(280);t.request();assert.equal(t.stats().timers,1);
t.block();t.step(480);assert.equal(t.stats().timers,0);assert.equal(t.stats().raf,0);assert.equal(t.stats().rendered,1);
console.log('R2319 trailing gate request PASS: coalesced, 240ms cap preserved, no blocked-state polling');

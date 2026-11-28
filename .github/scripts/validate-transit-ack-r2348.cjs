'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('  function samePaintedSelection('),b=s.indexOf('  function update(){',a);
const make=new Function(`
 let current={s:{key:'diagnostics'},progress:.43,travel:.2},lastPaintedSelection=null,transitAckTimer=0;
 let disposed=false,archiveActive=true,lastRenderedGate=true,software=true,requests=0,id=0;
 const jobs=new Map(),document={hidden:false},reduced={matches:false},root={dataset:{}};
 const softwareMagRenderer=()=>software,mobile=()=>true,transitNeedsFrame=()=>true,setData=()=>{};
 const requestArchiveFrame=()=>requests++;
 const setTimeout=fn=>{jobs.set(++id,fn);return id;},clearTimeout=i=>jobs.delete(i);
 ${s.slice(a,b)}
 return {arm:armTransitAck,cancel:cancelTransitAck,paint:()=>{lastPaintedSelection={...current};},
  change:()=>{current={...current,s:{key:'network'}};},hide:()=>document.hidden=true,
  pause:()=>root.dataset.fxReferenceMotionPaused='true',hardware:()=>software=false,
  step:()=>{for(const [id,fn] of [...jobs]){jobs.delete(id);fn();}},
  stats:()=>[requests,jobs.size]};
`);
let t=make();t.arm();t.step();t.step();t.step();t.step();assert.deepEqual(t.stats(),[2,0]);
t=make();t.arm();t.paint();t.step();assert.deepEqual(t.stats(),[0,0]);
t=make();t.arm();t.step();t.paint();t.step();assert.deepEqual(t.stats(),[1,0]);
for(const method of ['change','hide','pause','cancel']){t=make();t.arm();t[method]();t.step();assert.deepEqual(t.stats(),[0,0]);}
t=make();t.hardware();t.arm();assert.deepEqual(t.stats(),[0,0]);
assert.ok(s.includes('lastPaintedSelection=current;'));
assert.ok(s.includes('cancelTransitAck();lastPaintedSelection=null;'));
assert.ok(s.includes('queueMicrotask(()=>stop());'));
assert.ok(fs.readFileSync('docs/production-revision.txt','utf8').includes('archive_transit_delivery_revision=20261128-r2348-transit-ack'));
console.log('R2348 bounded transit acknowledgement, cancellation and renderer failure recovery: PASS');

 // R2350: validate the actual script src, not a suffix anywhere in HTML.
 const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
 const workerSource=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
 const archiveTags=x=>[...x.matchAll(/<script\b[^>]*\bsrc="[^"]*formatx-cinematic-archive-r1987\.js\?v=([^"]+)"[^>]*>/g)];
 const revision=s.match(/const VERSION='([^']+)'/)[1];
 const required=revision.slice(revision.lastIndexOf('-r2348-')+1);
 assert.equal(required,'r2348-transit-ack-r2350-delivery');
 const verify=x=>{const tags=archiveTags(x);assert.equal(tags.length,1);assert.ok(tags[0][1].endsWith(required),'archive script cache key must match runtime');};
 verify(html);
 const begin=workerSource.indexOf('function cacheBustR502Runtime(html)'),end=workerSource.indexOf('function escapeAttribute',begin);
 assert.ok(begin>=0&&end>begin);
 const rewrite=new Function(workerSource.slice(begin,end)+'return cacheBustR502Runtime;')();
 verify(rewrite(html));
 console.log('R2350 exact archive script cache identity and Worker rewrite: PASS');

'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const start=src.indexOf('  function cubeGeometry()'),end=src.indexOf('  function panelGeometry(');
assert(start>=0&&end>start,'missing reactor geometry/track');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const host={};
const {reactorGeometry,reactorEntry,reactorHandoff,corridorEntry}=new Function('clamp','mix','smooth','entryReactorHost',
  src.slice(start,end)+'return {reactorGeometry,reactorEntry,reactorHandoff,corridorEntry};')(clamp,mix,smooth,host);
const v=reactorGeometry(),counts={};
assert.equal(v.length,576*3*8);
for(let i=0;i<v.length;i+=8){
  for(let j=0;j<8;j++)assert(Number.isFinite(v[i+j]),'nonfinite vertex');
  assert(Math.abs(Math.hypot(v[i+3],v[i+4],v[i+5])-1)<1e-5,'invalid normal');
  assert([2,3,4].includes(v[i+7]),'invalid ring');
  const material=v[i+6]>.6?'guide':'metal';
  const key=v[i+7]+':'+material;
  counts[key]=(counts[key]||0)+1;
}
for(const ring of [2,3,4])for(const material of ['guide','metal'])assert.equal(counts[ring+':'+material],288);
const entry={cinemaHost:host,key:'systems'};
let previous=0;
for(let i=0;i<=100;i++){
  const p=i/100,transfer=reactorHandoff(entry,p);
  assert(transfer.settle>=previous&&transfer.settle<=1,'nonmonotonic handoff');
  previous=transfer.settle;
  const gate=reactorEntry(entry,p);
  if(gate)assert(gate.alpha>=0&&gate.alpha<=1&&gate.z<=1.05);
  else assert(p>=.62);
  assert.equal(reactorHandoff({cinemaHost:{},key:'diagnostics'},p).settle,1);
  assert.equal(reactorHandoff({cinemaHost:host,key:'licensing'},p).settle,1);
}
assert.equal(reactorHandoff(entry,.62).phase,'clear');
assert.equal(reactorHandoff(entry,.62).settle,1);
assert(src.includes('this.mesh(this.reactor,'));
assert(src.includes("gl.deleteBuffer(this.reactor.buffer)"));
assert(src.includes("if(ingress&&ingress.alpha>.001&&k===1)continue;"),'reactor adds a draw call');
console.log('R2264_REACTOR_GEOMETRY_PASS '+JSON.stringify({triangles:v.length/24,materials:counts,scrollSamples:101,oneBatchedDraw:true}));

const next={cinemaHost:{},key:'diagnostics'};
const checkout={cinemaHost:{},key:'licensing'};
assert.equal(corridorEntry(entry,.1),null);
assert.equal(corridorEntry({key:'missing'},.1),null);
assert.equal(corridorEntry(next,0).alpha,0);
assert.equal(corridorEntry(next,.30),null);
let lastZ=-Infinity,lastProgress=-Infinity;
for(let i=0;i<100;i++){
  const p=.30*i/100,a=corridorEntry(next,p),b=corridorEntry(checkout,p);
  assert(a.alpha>=0&&a.alpha<=.66&&b.alpha>=0&&b.alpha<=.38);
  assert(a.z>=lastZ&&a.progress>=lastProgress);
  lastZ=a.z;lastProgress=a.progress;
  assert.equal(reactorHandoff(next,p).settle,1);
  assert.equal(reactorHandoff(checkout,p).settle,1);
}
assert(corridorEntry(next,.29999).alpha<.00001);
console.log('R2265_SYSTEM_CORRIDOR_PASS '+JSON.stringify({samples:100,checkoutIntensityLimit:.38,firstEntryUnchanged:true}));

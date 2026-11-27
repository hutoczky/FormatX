'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('  function cinemaHostsForSync('),b=s.indexOf('  function syncCinema(',a);
const select=new Function(s.slice(a,b)+'return cinemaHostsForSync;')();
const hosts=Array.from({length:8},(_,i)=>({id:i,inert:false}));
let previous,visits=0;
function step(active){
 const list=select(hosts,previous,active);
 for(const host of list){host.inert=host!==active;visits++;}
 previous=active;
 assert.ok(hosts.every(h=>h.inert===(h!==active)));
 return list.length;
}
assert.equal(step(null),8);
for(let i=0;i<1000;i++)assert.equal(step(null),0);
for(const host of [...hosts,...hosts.slice().reverse()]){
 const initial=step(host);assert.ok(initial===1||initial===8);
 for(let i=0;i<1000;i++)assert.equal(step(host),1);
}
assert.equal(step(null),8);
previous=undefined;assert.equal(step(null),8);
assert.ok(s.includes('lastSyncedCinemaHost=activeHost;'));
assert.ok(s.includes('function discover(){\n    lastSyncedCinemaHost=undefined;'));
assert.ok(s.includes('if(event.persisted){\n        lastSyncedCinemaHost=undefined;'));
console.log('R2333 active folio traversal: PASS; '+visits+' visits');

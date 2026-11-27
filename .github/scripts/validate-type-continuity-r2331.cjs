'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t,host={};
const a=s.indexOf('  function cubeGeometry()'),b=s.indexOf('  function panelGeometry(',a);
const {entryTransitProgress,corridorTransitProgress}=new Function('clamp','mix','smooth','entryReactorHost',s.slice(a,b)+'return {entryTransitProgress,corridorTransitProgress};')(clamp,mix,smooth,host);
const x=s.indexOf('  function typographyHandoff('),y=s.indexOf('  function syncCinema(',x);
const {typographyHandoff:reveal,typographyTransfer:transfer,holographicAssembly:assemble}=new Function('clamp','smooth','entryReactorHost','entryTransitProgress','corridorTransitProgress',s.slice(x,y)+'return {typographyHandoff,typographyTransfer,holographicAssembly};')(clamp,smooth,host,entryTransitProgress,corridorTransitProgress);
let count=0;
for(const limited of [false,true])for(const phone of [false,true])for(const scene of [{key:'systems',cinemaHost:host},{key:'diagnostics',cinemaHost:{}},{key:'licensing',cinemaHost:{}}]){
 let previous=[0,0,0];
 for(let i=0;i<=2000;i++){
   const p=i/2000,r=reveal(scene,p,0,limited),t=transfer(...r),g=assemble(scene,t,phone);
   assert.ok(r.every((v,j)=>v>=previous[j]-1e-10&&v>=0&&v<=1));
   assert.ok(r[0]+1e-10>=r[1]&&r[1]+1e-10>=r[2]);
   assert.ok(g.every(Number.isFinite));
   assert.deepEqual(reveal(scene,p,0,limited),r);
   if(p>=.70||scene.key==='licensing')assert.deepEqual(r,[1,1,1]);
   previous=r;count++;
 }
}
const scene={key:'systems',cinemaHost:host};
for(let i=301;i<700;i++){
 const p=i/1000,e=1e-6,L=reveal(scene,p-e),C=reveal(scene,p),R=reveal(scene,p+e);
 for(let j=0;j<3;j++)assert.ok(Math.abs((R[j]-C[j])/e-(C[j]-L[j])/e)<.002,'velocity cusp at '+p);
}
const e=.0001;
for(const phone of [false,true])for(const [axis,begin,end] of [[0,0,.72],[1,.14,.92]]){
 const q=p=>assemble(scene,[p,0],phone)[axis];
 for(const p of [begin,end])assert.ok(Math.abs(q(p+e)-q(p-e))<1e-8,'nonzero endpoint velocity');
}
console.log('R2331 continuous typography and assembly: PASS '+count+' samples');

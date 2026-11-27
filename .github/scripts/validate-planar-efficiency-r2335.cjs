'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('  function panelGeometry('),b=s.indexOf('  class MAGScene',a);
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const {panelGeometry,filamentSamples}=new Function('smooth',s.slice(a,b)+'return {panelGeometry,filamentSamples};')(smooth);
assert.equal(panelGeometry(true).length/24,640);
assert.equal(panelGeometry(false).length/24,180);
const flat=panelGeometry(false,true);
assert.equal(flat.length/24,2);
assert.equal(flat.byteLength,192);
for(let i=0;i<flat.length;i+=8){
 const u=flat[i+6],v=flat[i+7];
 assert.ok(Math.abs(flat[i]-(u-.5)*1.55)<1e-6);
 assert.ok(Math.abs(flat[i+1]-(v-.5)*1.06)<1e-6);
 assert.deepEqual(Array.from(flat.slice(i+2,i+6)),[0,0,0,1]);
}
assert.ok(s.includes('this.mesh(this.shadowPanel,'));
assert.ok(s.includes('gl.deleteBuffer(this.shadowPanel.buffer);'));
const bezier=(a,b,d,e,t)=>{const q=1-t;return q*q*q*a+3*q*q*t*b+3*q*t*t*d+t*t*t*e;};
let count=0;
for(const segments of [2,3,4,6])for(const side of [-1,1])for(let i=0;i<=100;i++){
 const p=i/100,from=[-.16,.02,.56],to=[p*4-2,p,2.3*p],alpha=p,transmission=[p,Math.sin(Math.PI*p)**2];
 const samples=filamentSamples(from,to,side,segments,alpha,transmission);
 for(let k=0;k<=segments;k++){
  const t=k/segments,v=samples[k];
  assert.equal(v.x,bezier(from[0],from[0]+side*.38,to[0]-side*.32,to[0],t));
  assert.equal(v.z,bezier(from[2],from[2]+.33,to[2]-.39,to[2],t));
  assert.equal(v.opacity,alpha*(.18+.19*Math.sin(Math.PI*t)+.42*transmission[1]*(1-smooth(Math.abs(t-transmission[0])/.34))));
  count++;
 }
}
console.log('R2335 two-triangle planar shadow and identical filament samples: PASS '+count);

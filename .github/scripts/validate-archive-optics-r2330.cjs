'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
assert.doesNotThrow(()=>new Function(s));
const vert=s.match(/const vert=`([\s\S]*?)`;/)[1],frag=s.match(/const frag=`([\s\S]*?)`;/)[1];
assert.ok(vert.includes('out vec3 vMaterialPosition;')&&vert.includes('vMaterialPosition=aPosition;'));
assert.ok(frag.includes('in vec3 vMaterialPosition;')&&frag.includes('fwidth(phase)'));
assert.ok(frag.includes('if(uMobile<.5){\n      float phase='));
assert.ok(frag.includes('1.0-smoothstep(.12,.48,aa)')&&frag.includes('1.0-smoothstep(.12,.48,railAA)'));
assert.ok(frag.includes('titanium+=studio/(vec3(1.0)+studio)'));
assert.ok(html.includes('r2309-holographic-assembly-r2319-tail-r2330-studio-transit'));
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
for(const [lo,hi] of [[.55,2.4],[.12,.48]]){
 assert.equal(1-smooth(lo,hi,lo),1);
 assert.equal(1-smooth(lo,hi,hi),0);
 for(let i=0;i<100;i++){const x=lo+(hi-lo)*i/100;assert.ok(smooth(lo,hi,x)<=smooth(lo,hi,x+(hi-lo)/100));}
}
console.log('R2330 material-space transit optics and footprint filtering: PASS');

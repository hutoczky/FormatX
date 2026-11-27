'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
assert.doesNotThrow(()=>new Function(s));
const a=s.indexOf('  function positionCinemaFolio('),b=s.indexOf('  // R2306:',a);
const make=new Function(`
 let phone=false,innerHeight=844,bottom=379.8,reads=0,writes=0;
 const props=new Map(),panel={isConnected:true,dataset:{},style:{
   setProperty(k,v){props.set(k,v);writes++;},
   removeProperty(k){props.delete(k);writes++;},
   getPropertyValue(k){return props.get(k)||'';}
 },getBoundingClientRect(){throw Error('animated folio layout read');}};
 const stage={classList:{contains:()=>true},getBoundingClientRect(){reads++;return {bottom};}};
 const mobile=()=>phone,clearMotionStyle=(n,k)=>{if(n.style.getPropertyValue(k))n.style.removeProperty(k);};
 ${s.slice(a,b)}
 return {run:()=>positionCinemaFolio(panel),configure:(p,h,b)=>{phone=p;innerHeight=h;bottom=b;},props,stats:()=>({reads,writes})};
`);
const t=make();
for(let i=0;i<1000;i++)t.run();
assert.deepEqual(t.stats(),{reads:0,writes:0});
for(const h of [320,390,720,844,915,1080]){
 t.configure(true,h,h*.45);t.run();
 const top=parseFloat(t.props.get('top')),height=parseFloat(t.props.get('max-height'));
 assert.ok(top>=h*.51-.01&&top+height<=h*.97+.02);
 const count=t.stats().writes;t.run();assert.equal(t.stats().writes,count);
}
t.configure(false,1080,486);t.run();
assert.equal(t.props.has('top'),false);assert.equal(t.props.has('max-height'),false);
const count=t.stats();for(let i=0;i<1000;i++)t.run();assert.deepEqual(t.stats(),count);
assert.ok(s.indexOf('positionCinemaFolio(panel);')<s.indexOf("setMotionStyle(panel,'--fx-cinema-materialize'"));
console.log('R2332 reading lane viewport and breakpoint regression: PASS');

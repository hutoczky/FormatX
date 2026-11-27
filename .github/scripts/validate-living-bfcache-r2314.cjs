'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('docs/scifi-ui/scripts/living-architecture.js','utf8');
const section=(a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i);return s.slice(i,j);};
const simulate=new Function(`
 let qrDockActivated=false,qrDockObserver=null,sceneUpdates=0,commerceUpdates=0,observes=0,disconnects=0,qrStarts=0,qrStops=0,clickHandler;
 const events=new Map(),ROOT={dataset:{}},dock={};
 const document={getElementById:()=>dock,addEventListener:(name,fn)=>{if(name==='click')clickHandler=fn;}};
 const addEventListener=(name,fn)=>events.set(name,fn);
 const window={IntersectionObserver:true};
 class Element{}
 class MutationObserver{constructor(fn){this.fn=fn;}observe(){observes++;}disconnect(){disconnects++;}}
 class IntersectionObserver{constructor(fn){this.fn=fn;qrStarts++;}observe(){}disconnect(){qrStops++;}}
 const revealQrDock=()=>{},syncScene=()=>sceneUpdates++,updateCommerce=()=>commerceUpdates++;
 const activateQrDock=()=>{qrDockActivated=true;qrDockObserver?.disconnect();qrDockObserver=null;updateCommerce();};
 ${section('  function prepareQrDock()','  function syncScene()')}
 ${section('  function bind()','  function initialise()')}
 prepareQrDock();bind();
 return {fire:(name,persisted)=>events.get(name)({persisted}),activate:()=>qrDockObserver.fn([{isIntersecting:true}]),click:target=>clickHandler({target}),stats:()=>({observes,disconnects,qrStarts,qrStops,sceneUpdates,commerceUpdates,qrDockActivated,watching:!!qrDockObserver})};
`);
const t=simulate();
t.fire('pageshow',false);assert.equal(t.stats().commerceUpdates,0);
t.click(null);t.click({});
for(let i=0;i<2;i++){
 t.fire('pagehide',true);assert.equal(t.stats().watching,false);
 t.fire('pageshow',true);assert.equal(t.stats().watching,true);
 assert.equal(t.stats().observes,i+2);assert.equal(t.stats().qrStarts,i+2);
}
t.activate();assert.equal(t.stats().qrDockActivated,true);assert.equal(t.stats().watching,false);
t.fire('pagehide',true);t.fire('pageshow',true);
assert.equal(t.stats().qrStarts,3);assert.equal(t.stats().observes,4);
assert.equal(t.stats().commerceUpdates,4);assert.equal(t.stats().disconnects,3);
console.log('R2314 repeated BFCache restoration and deferred QR activation: PASS');

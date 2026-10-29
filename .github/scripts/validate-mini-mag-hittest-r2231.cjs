'use strict';
// R2231: the floating MAG control must not repeatedly measure the same
// unchanged DOM node at 16 nearby hit-test locations per visual update.
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js','utf8');
const start=source.indexOf('  function collidesWithInformation(){');
const end=source.indexOf('\n  function updateContextSafety(',start);
assert(start>0&&end>start,'Collision function must remain in the original MAG controller');
const section=source.slice(start,end);
assert(section.includes('const inspectedTargets=new Set();'),'Per-pass target cache must exist');
assert(section.includes('inspectedTargets.add(target);'),'Cache must record each inspected target');
const build=new Function(
  'host','launcher','document','innerWidth','innerHeight',
  'Element','getComputedStyle','collisionSelector',
  section+'\nreturn collidesWithInformation;'
);
function check(visible){
  class Elem{
    matches(){return true;}
    closest(){return this;}
    getBoundingClientRect(){return {left:40,top:70,width:60,height:60};}
  }
  const item=new Elem();
  const host={dataset:{open:'false'},contains(){return false;}};
  const launcher={getBoundingClientRect(){
    return {left:40,top:70,width:60,height:60};
  }};
  let styleReads=0,hitTests=0;
  const document={elementsFromPoint(){
    hitTests++;return [item];
  }};
  const getComputedStyle=()=>{
    styleReads++;
    return {display:visible?'block':'none',visibility:'visible',opacity:'1'};
  };
  const test=build(host,launcher,document,390,844,Elem,getComputedStyle,'a,button');
  return {hit:test(),styleReads,hitTests};
}
const hidden=check(false),shown=check(true);
assert.equal(hidden.hit,false,'Hidden element must not block launcher');
assert.equal(hidden.hitTests,16,'All 16 points are examined in the no-collision case');
assert.equal(hidden.styleReads,1,'One distinct hidden DOM element is measured only once');
assert.equal(shown.hit,true,'Visible information must still cause collision');
assert.equal(shown.styleReads,1,'The early-visible path remains unchanged');
assert.equal(shown.hitTests,1,'The early-visible path must still short-circuit');
// R2242: verify the expensive hit-test never runs while the canonical
// cinematic layer covers the page. Recheck after the film is gone.
const st=source.indexOf("  function updateContextSafety(source='runtime'){");
const ed=source.indexOf("\n  function scheduleContextSafety(",st);
assert(st>0&&ed>st,'Original context safety update must remain present');
assert(source.includes("addEventListener('formatx:magbirthcomplete',"),
  'The controller must resume safety on the canonical film completion event');
const maker=new Function('root','document','host','hit','report',
  'let contextFrame=0,collisionHidden=false;'+
  'const collidesWithInformation=()=>hit();'+
  'const applyContextSafety=(source)=>report({hidden:collisionHidden,source});'+
  source.slice(st,ed)+';return updateContextSafety;');
let checks=0,reported=[];
const root={dataset:{fxMagBirthLiveR533:'active'}};
let prepaint=true;
const doc={getElementById(){return prepaint?{}:null;}};
const host={dataset:{open:'false'}};
const update=maker(root,doc,host,()=>{checks++;return false;},
  value=>reported.push(value));
update('initial');
assert.equal(checks,0,'No hit tests while cinematic film owns viewport');
assert.deepEqual(reported.at(-1),{hidden:true,source:'cinematic-safe-deferred'});
root.dataset.fxMagBirthLiveR533='complete';prepaint=false;
update('post-genesis');
assert.equal(checks,1,'Collision check must run when real content is visible');
assert.deepEqual(reported.at(-1),{hidden:false,source:'post-genesis'});
root.dataset.fxMagBirthLiveR533='active';host.dataset.open='true';
update('explicit-controller-open');
assert.equal(checks,2,'Open panel still gets normal context checks');
console.log('MINI_MAG_R2242_CINEMATIC_HITTEST_DEFER_PASS',checks);
console.log('MINI_MAG_R2231_DEDUP_HITTEST_PASS',JSON.stringify({hidden,shown}));

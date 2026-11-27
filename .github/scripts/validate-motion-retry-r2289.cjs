const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js','utf8');

function fixture(){
  const root={dataset:{},getAttribute:()=>null};
  const scripts=[], timers=[], listeners=new Map();
  class Element{}
  class HTMLButtonElement extends Element{}
  class HTMLElement extends Element{}
  const ask=new HTMLButtonElement();
  let clicks=0;
  ask.click=()=>{clicks++;};
  ask.closest=()=>ask;
  const document={
    documentElement:root,readyState:'complete',visibilityState:'visible',
    querySelector(selector){
      if(selector.includes('script[src*='))return scripts[0]||null;
      if(selector==='#hero .fx-reference-ask')return ask;
      return null;
    },
    createElement(){
      const handlers={};
      const script={dataset:{},addEventListener:(name,fn)=>{handlers[name]=fn;},
        emit(name){const fn=handlers[name];delete handlers[name];fn?.();},
        remove(){const i=scripts.indexOf(script);if(i>=0)scripts.splice(i,1);}
      };return script;
    },
    head:{appendChild(script){scripts.push(script);}}
  };
  const ctx={document,location:{search:''},navigator:{webdriver:false,userAgent:'Chrome'},URLSearchParams,
    matchMedia:()=>({matches:false}),Element,HTMLElement,HTMLButtonElement,
    addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name),
    requestAnimationFrame:()=>0,queueMicrotask:fn=>fn(),
    setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout:()=>{},window:{}};
  vm.runInNewContext(source,ctx);
  return {root,scripts,timers,clicks:()=>clicks,start:()=>listeners.get('pointerdown')({isTrusted:true,type:'pointerdown',target:ask})};
}
{
 const f=fixture();f.start();assert.equal(f.scripts.length,1);
 f.scripts[0].emit('error');assert.equal(f.scripts.length,0);
 assert.equal(f.root.dataset.fxP0MotionSchedulerR490,'retry-pending-r2289');
 assert.equal(f.timers.length,1);assert.equal(f.timers[0].delay,800);
 f.timers.shift().fn();assert.equal(f.scripts.length,1);assert.match(f.scripts[0].src,/&retry=1$/);
 f.scripts[0].emit('load');assert.equal(f.clicks(),1);assert.equal(f.timers.length,0);
 assert.match(f.root.dataset.fxP0MotionSchedulerR490,/^loaded:/);
}
{
 const f=fixture();f.start();f.scripts[0].emit('error');f.timers.shift().fn();f.scripts[0].emit('error');
 assert.equal(f.scripts.length,0);assert.equal(f.timers.length,0);assert.equal(f.clicks(),0);
 assert.equal(f.root.dataset.fxP0MotionSchedulerR490,'load-failed');
}
{
 const f=fixture();f.start();f.scripts[0].emit('load');assert.equal(f.clicks(),1);assert.equal(f.timers.length,0);
}
{
 const f=fixture();f.start();f.scripts[0].emit('error');f.scripts.push({src:'other-runtime'});f.timers.shift().fn();
 assert.equal(f.scripts.length,1,'must not inject a second runtime');
}
console.log('MAG bounded retry and single-owner regression: PASS');

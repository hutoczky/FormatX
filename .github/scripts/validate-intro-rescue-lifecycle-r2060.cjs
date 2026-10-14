'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('docs/scifi-ui/scripts/formatx-intro-bootstrap-r1629.js','utf8');
function run(completed){
  const listeners=new Map(),timers=new Map();
  let nextTimer=0,created=0,overlay=null,script=null;
  class Element{}
  class Script extends Element{
    constructor(){super();this.dataset={};this.listeners=new Map();}
    addEventListener(name,callback){this.listeners.set(name,callback);}
    remove(){if(script===this)script=null;}
  }
  const root={dataset:{}};
  const context={
    HTMLElement:Element,HTMLScriptElement:Script,HTMLLinkElement:class extends Element{},
    URLSearchParams,location:{search:''},matchMedia:()=>({matches:false}),
    sessionStorage:{getItem:()=>null},window:{},
    setTimeout(callback){const id=++nextTimer;timers.set(id,callback);return id;},
    clearTimeout(id){timers.delete(id);},
    document:{documentElement:root,readyState:'complete',
      addEventListener(name,callback){listeners.set(name,callback);},
      getElementById(){return null;},
      querySelector(selector){return selector==='.fx-mag-birth-r533'?overlay:selector.startsWith('script[')?script:null;},
      createElement(){created++;return new Script();},
      head:{appendChild(node){script=node;}}
    }
  };
  vm.runInNewContext(source,context);
  assert.equal(created,1,'Fresh visitor must request the real intro');
  if(completed){
    overlay=new Element();
    context.window.__formatxMagBirthR533Owner=true;
    overlay=null;
    listeners.get('formatx:magbirthcomplete')();
    assert.equal(timers.size,0,'Completion must cancel the rescue watchdog');
    script.listeners.get('load')();
    for(const callback of [...timers.values()])callback();
    assert.equal(created,1,'A removed completed overlay must never start another intro');
    assert.equal(context.window.__formatxMagBirthR533Owner,true,'Completion must retain the canonical owner latch');
  }else{
    const watchdog=[...timers.values()][0];
    watchdog();
    assert.equal(created,2,'Missing startup must still retry instead of being mistaken for completion');
  }
}
run(true);
run(false);
console.log('INTRO_RESCUE_LIFECYCLE_R2060_PASS: complete never restarts; missing startup still retries');

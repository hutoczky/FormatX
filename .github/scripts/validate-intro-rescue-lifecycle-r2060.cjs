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
const birth=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const teardown=birth.slice(birth.indexOf('  function safeTeardownOverlay(source) {'),birth.indexOf('\n  function finish(source) {'));
assert.ok(teardown.includes('function safeTeardownOverlay'), 'Real teardown function must be present');
for(const sources of [['complete','absolute-dom-watchdog-r653'],['absolute-dom-watchdog-r653','bounded-failsafe-r652']]){
  const trace=[];
  const context={overlayTornDown:false,releaseStageStyle(){trace.push('release');},
    ROOT:{removeAttribute(){}},overlay:{remove(){trace.push('remove');}},
    document:{dispatchEvent(){trace.push('complete');}},
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}
  };
  vm.createContext(context);
  vm.runInContext(teardown,context);
  for(const source of sources)context.safeTeardownOverlay(source);
  assert.deepEqual(trace,['release','remove','complete'],'Both real teardown races must remove the overlay before publishing exactly one completion');
}
const renderer=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const schedule=renderer.slice(renderer.indexOf('    function scheduleSurfacePulse(){'),renderer.indexOf('    function scheduleAutonomousMorph(){'));
assert.ok(schedule.includes('function scheduleSurfacePulse'), 'Real autonomous scheduler must be present');
for(const mobile of [false,true])for(const surfacePulseCount of [0,1,2])for(const visible of [false,true])for(const motionReduced of [false,true]){
  const delays=[];
  const context={mobile,surfacePulseCount,visible,surfacePulseTimer:0,disposed:false,contextLost:false,
    reduced:{matches:motionReduced},paused:false,root:{dataset:{}},performance:{now:()=>0},
    document:{hidden:false,querySelector:()=>null},clearTimeout(){},setTimeout(callback,delay){delays.push(delay);return 1;}
  };
  vm.createContext(context);vm.runInContext(schedule,context);context.scheduleSurfacePulse();
  if(visible&&!motionReduced){assert.equal(delays.length,1);assert.ok(delays[0]>=4100&&delays[0]<=6440,'First visible sweep must use the real recurring cadence');}
  else{
    assert.equal(delays.length,0,'Offscreen or reduced-motion MAG must remain suspended');
    assert.equal(context.root.dataset.fxCoreSurfaceSchedulerR484,'suspended');
  }
}
console.log('INTRO_TEARDOWN_AND_VISIBLE_SWEEP_R2061_PASS');
console.log('INTRO_RESCUE_LIFECYCLE_R2060_PASS: complete never restarts; missing startup still retries');

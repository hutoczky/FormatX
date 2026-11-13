'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||'docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
// Invoke the original product callbacks in both orders. This deliberately has
// no clock model: elapsed-time and actual WebGL ownership stay covered by the
// unchanged reference-film browser oracle, including its one-completion assert.
const first=source.indexOf('  function safeTeardownOverlay(source) {');
const end=source.indexOf('  function queueRender(',first);
assert(first>=0&&end>first,'The canonical teardown functions must be present');
const watchdogStart=source.indexOf('    window.setTimeout(()=>{\n      if(!overlay.isConnected)return;');
const deadline='    },VALIDATED_SKIP_MODE ? 35000 : ((MOBILE && FORCE && AUTOMATION) ? 10800 : DURATION+550));';
const watchdogEnd=source.indexOf(deadline,watchdogStart);
assert(watchdogStart>=0&&watchdogEnd>watchdogStart,'The original absolute watchdog deadline must stay unchanged');
assert(source.includes('VALIDATED_SKIP_MODE ? 35000 : (REDUCED ? 900 : DURATION + (MOBILE ? 420 : 220))'),
 'The original bounded failsafe deadline must stay unchanged');
const watchdog=source.slice(watchdogStart+'    window.setTimeout(()=>{'.length,watchdogEnd);
const cases=[];
for(const reduced of [false,true]){
 for(const order of ['watchdog-first','graceful-first','watchdog-during-exit']){
  const state={events:[],aborts:0,destroys:0,styleReleases:0,rootReleases:0,stageOpacity:'intro',stageTransition:'intro',cancelledFrames:[],clearedTimers:[]};
  const timers=new Map();let timerId=100;
  const c={
   finished:false,completionDispatched:false,raf:13,interactionMoveRaf:14,
   pendingInteraction:{},pendingRendererInteraction:{},frameTimer:15,exitTimer:0,hardFinishTimer:77,
   phaseTimers:new Set([91,92]),REDUCED:reduced,EXIT_MS:180,threeWaitTimer:6,
   ROOT:{dataset:{},removeAttribute(){state.rootReleases++;}},overlay:{isConnected:true,dataset:{},classList:{add(){}},remove(){this.isConnected=false;}},
   document:{dispatchEvent(e){
    state.events.push({type:e.type,source:e.detail.source});
    // The receiving page may immediately claim the native stage at handoff.
    state.stageOpacity='native-page';state.stageTransition='native-page';
   }},
   CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}},
   releaseStageStyle(){state.styleReleases++;state.stageOpacity=null;state.stageTransition=null;},setStageOpacity(){},requestCoreWarmup(){},locateStage(){},stage:null,HTMLElement:class{},
   coreApi:{setMorph(){},setShape(){},requestRender(){}},
   percent:{value:''},progress:{value:0},status:{textContent:''},copy:{statuses:[[1,'MAG BORN']]},
   audioContext:{close(){}},filmRenderer:{destroy(){state.destroys++;}},
   interactionController:{abort(){state.aborts++;}},
   cancelAnimationFrame(id){state.cancelledFrames.push(id);},
   clearTimeout(id){state.clearedTimers.push(id);timers.delete(id);},
   window:{setTimeout(callback,delay){const id=++timerId;timers.set(id,{callback,delay});return id;}}
  };
  vm.createContext(c);
  vm.runInContext(source.slice(first,end)+'\nfunction absoluteWatchdog(){'+watchdog+'\n}',c);
  const graceful=()=>{const entry=[...timers.values()].find(t=>t.delay===(reduced?20:180));assert(entry,'The original graceful exit timer must remain');entry.callback();};
  if(order==='watchdog-first'){
   c.absoluteWatchdog();c.finish('bounded-failsafe-r652');
  }else if(order==='graceful-first'){
   c.finish('complete');graceful();c.absoluteWatchdog();
  }else{
   c.finish('complete');c.absoluteWatchdog();
  }
  for(const t of [...timers.values()])t.callback();
  const result={reduced,order,completions:state.events.length,finished:c.finished,overlayConnected:c.overlay.isConnected,aborts:state.aborts,destroys:state.destroys};
  assert.equal(result.completions,1,'Exactly one completion after '+order);
  assert.equal(result.finished,true,'Every watchdog path must retire the canonical owner');
  assert.equal(result.overlayConnected,false,'The original fail-open DOM guarantee must remain');
  assert.equal(result.aborts,1,'The original input/listener owner must abort once');
  assert.equal(result.destroys,1,'The existing film renderer must be destroyed once');
  assert(state.cancelledFrames.includes(13)&&state.cancelledFrames.includes(14),'Pending film/input RAF work must stop');
  assert(state.clearedTimers.includes(77),'The bounded failsafe must be cancelled');
  assert.equal(state.styleReleases,1,'Retired callbacks must release the intro stage only once');
  assert.equal(state.rootReleases,2,'Retired callbacks must release the intro root attributes only once');
  assert.equal(state.stageOpacity,'native-page','Late intro cleanup must preserve the receiving page opacity');
  assert.equal(state.stageTransition,'native-page','Late intro cleanup must preserve the receiving page transition');
  // Independent DOM cleanup remains retryable after completion, without
  // emitting another public handoff if an extension re-attaches the overlay.
  c.overlay.isConnected=true;c.safeTeardownOverlay('repeat-dom-cleanup');
  assert.equal(c.overlay.isConnected,false);assert.equal(state.events.length,1);
  assert.equal(state.styleReleases,1);assert.equal(state.rootReleases,2);
  assert.equal(state.stageOpacity,'native-page');assert.equal(state.stageTransition,'native-page');
  cases.push(result);
 }
}
console.log('INTRO_FINALIZER_R2209_PASS',JSON.stringify({originalCallbacks:true,noClockOverride:true,deadlinesUnchanged:true,cases}));

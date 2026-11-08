'use strict';
// R2346 – execute the actual compositor exposure owner against CSSOM mocks.
// This catches accidental deletion of scroll/camera transforms after handoff.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const begin=src.indexOf('    const exposeNativeStageLayerR2343=()=>{');
const end=src.indexOf("    listen(document,'formatx:magbirthcomplete',()=>{",begin);
assert(begin>0&&end>begin,'Exact native stage exposure block not found');
assert(src.slice(begin,end).includes('R2346: the compositor probe'),
  'R2346 CSSOM state ownership is not installed');
const make=vm.runInNewContext('(function(stage,root,later){let disposed=false,contextLost=false;'+
  src.slice(begin,end)+';return exposeNativeStageLayerR2343;})');
function caseRun(prior,intervention){
  const state=new Map(),timers=[],root={dataset:{fxMagLayerPromotionR2343:''}};
  if(prior)state.set('transform',{value:prior.value,priority:prior.priority});
  const style={
    setProperty(name,value,priority=''){state.set(name,{value:String(value),priority:String(priority)})},
    getPropertyValue(name){return state.get(name)?.value||''},
    getPropertyPriority(name){return state.get(name)?.priority||''},
    removeProperty(name){state.delete(name)}
  };
  const stage={isConnected:true,style};
  const run=make(stage,root,(f,ms)=>timers.push({f,ms}));
  run();run();
  assert.equal(timers.length,1,'Expose must be one-shot while active');
  assert.equal(timers[0].ms,860,'Bounded compositor exposure changed');
  assert.equal(style.getPropertyPriority('transform'),'important');
  if(intervention)style.setProperty('transform',intervention.value,intervention.priority);
  timers[0].f();
  return {style,root};
}
const clear=caseRun(null);
assert.equal(clear.style.getPropertyValue('transform'),'');
assert.equal(clear.root.dataset.fxMagLayerPromotionR2343,'restored');
const prior=caseRun({value:'translateX(12px) rotate(8deg)',priority:'important'});
assert.equal(prior.style.getPropertyValue('transform'),'translateX(12px) rotate(8deg)');
assert.equal(prior.style.getPropertyPriority('transform'),'important');
const normal=caseRun({value:'matrix(1,0,0,1,9,5)',priority:''});
assert.equal(normal.style.getPropertyValue('transform'),'matrix(1,0,0,1,9,5)');
assert.equal(normal.style.getPropertyPriority('transform'),'');
const intervening=caseRun(null,{value:'translate3d(4px,0,0)',priority:'important'});
assert.equal(intervening.style.getPropertyValue('transform'),'translate3d(4px,0,0)');
assert.equal(intervening.root.dataset.fxMagLayerPromotionR2343,'yielded-to-newer-owner');
console.log('MAG_R2346_NONDESTRUCTIVE_COMPOSITOR_TRANSFORM_OWNER_PASS',
 JSON.stringify({cases:4,oneShot:true,boundedMs:860,previousStylesRestored:true,newerOwnersPreserved:true,noAdditionalRenderer:true,hardwareVisualAcceptance:false}));

'use strict';
// R2348: execute the ACTUAL production autonomous scheduler under a
// simulated cinematic ownership lifecycle. No 2D fallback or audit bypass.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const start=src.indexOf('    function scheduleSurfacePulse(){');
const end=src.indexOf('    function scheduleAutonomousMorph(){',start);
assert(start>0&&end>start,'Original bounded native surface scheduler missing');
const scheduler=src.slice(start,end);
assert(scheduler.includes('filmStillOwnsStageR2348') &&
       scheduler.includes("held-by-physical-genesis"),
  'AUTONOMOUS pulse is not protected by genuine cinematic ownership');
assert(src.includes("listen(document,'formatx:magbirthcomplete',()=>{\n      scheduleSurfacePulse();"),
  'Native scheduler does not rearm after real GENESIS completion');
assert(src.includes("if(source==='autonomous')scheduleSurfacePulse();"),
  'Original bounded autonomous cadence was lost');
assert(src.includes("const delay=surfacePulseCount===0\n        ? 13000"),
  'Autonomous first visible warm-up duration was altered');
assert(src.includes("startSurfacePulse(String(source||'interaction')+'-living-response')"),
  'User-initiated physical response should remain independent');
// The original legacy scheduler contains a dormant audit status string.
// Inspect ONLY the new R2348 block for an illegitimate bot/user-agent gate.
const newStart=scheduler.indexOf('      // R2348: this AUTONOMOUS');
const newEnd=scheduler.indexOf('      // R588: the first autonomous sweep',newStart);
assert(newStart>0&&newEnd>newStart,'Missing source-bounded R2348 policy');
const patch=scheduler.slice(newStart,newEnd);
assert(!patch.includes('navigator.userAgent')&&!patch.includes('lighthouse'),
  'R2348 must not depend on user-agent or Lighthouse state');
const factory=vm.runInNewContext('(function(config){'+
  'let surfacePulseTimer=0,surfacePulseCount=0;'+
  'const root=config.root,document=config.document;'+
  'const reduced={matches:config.reduced},mobile=config.mobile;'+
  'const auditMode=false,disposed=false,contextLost=false,paused=config.paused;'+
  'const visible=config.visible;'+
  'const performance={now:()=>config.now};'+
  'const setTimeout=config.setTimeout,clearTimeout=config.clearTimeout;'+
  'const startSurfacePulse=config.startSurfacePulse;'+
  scheduler+
  ';return {scheduleSurfacePulse,get timer(){return surfacePulseTimer;}};})');
function mock({film=false,paused=false,reduced=false,visible=true,mobile=true}={}){
  const outstanding=new Map(),fired=[];
  let seq=0;
  const root={dataset:{fxMagBirthLiveR533:film?'active':'complete'},
    getAttribute(name){return name==='data-fx-mag-birth-live'&&film?'active':null;}};
  const config={root,paused,reduced,visible,mobile,now:1000,
    document:{hidden:false,querySelector(){return null;}},
    setTimeout(fn,ms){const id=++seq;outstanding.set(id,{fn,ms});return id;},
    clearTimeout(id){outstanding.delete(id);},
    startSurfacePulse(source){fired.push(source);return true;}};
  const engine=factory(config);
  return {root,engine,outstanding,fired,config,
    finishFilm(){film=false;root.dataset.fxMagBirthLiveR533='complete';},
    runTimer(){const [id,item]=outstanding.entries().next().value||[];assert(item);outstanding.delete(id);item.fn();}};
}
const film=mock({film:true});
film.engine.scheduleSurfacePulse();
assert.equal(film.outstanding.size,0,'Film must not arm cosmetic GPU work');
assert.equal(film.root.dataset.fxCoreSurfaceSchedulerR484,'held-by-physical-genesis');
film.engine.scheduleSurfacePulse();
assert.equal(film.outstanding.size,0,'Repeated concealed calls must remain idempotent');
film.finishFilm();
film.engine.scheduleSurfacePulse();
assert.equal(film.outstanding.size,1,'Completion should arm one original native timer');
assert.equal([...film.outstanding.values()][0].ms,13000,'Original first visible warm-up changed');
film.runTimer();
assert.deepEqual(film.fired,['autonomous']);
assert.equal(film.outstanding.size,0);
const skip=mock();
skip.engine.scheduleSurfacePulse();
assert.equal([...skip.outstanding.values()][0].ms,13000,'Intro=0 path changed');
for(const options of [{paused:true},{reduced:true},{visible:false}]){
  const caseRun=mock(options);
  caseRun.engine.scheduleSurfacePulse();
  assert.equal(caseRun.outstanding.size,0,'Lifecycle suspension broken');
  assert.equal(caseRun.root.dataset.fxCoreSurfaceSchedulerR484,'suspended');
}
const repeat=mock();
repeat.engine.scheduleSurfacePulse();repeat.engine.scheduleSurfacePulse();
assert.equal(repeat.outstanding.size,1,'Autonomous clock created duplicate timers');
console.log('MAG_R2348_REAL_FILM_AWARE_SURFACE_SCHEDULER_PASS',
 JSON.stringify({filmHeldWithoutGpuWake:true,completionRearmsOneTimer:true,
  unchangedVisibleWarmupMs:13000,skipAndLifecyclePreserved:true,
  noAdditionalCanvasOrRaf:true,physicalAndroidPerformanceNotCertified:true}));

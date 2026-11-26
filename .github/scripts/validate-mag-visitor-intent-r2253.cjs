'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const journeyPath='docs/scifi-ui/scripts/formatx-cinematic-journey-r536.js';
const archivePath='docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js';
function section(source,start,end){
  const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
  assert(a>=0&&b>a,'Missing production source contract: '+start);
  return source.slice(a,b);
}
function run(journey,archive){
  const bootBlock=section(journey,'  let bootStarted=false;',"\n  addEventListener('pagehide'");
  function simulate({force=false,hash='',events=[]}){
    let boots=0,source=null;
    const handlers=new Map(),docHandlers=new Map();
    const root={dataset:new Proxy({}, {set(o,k,v){o[k]=v;if(k==='fxCinematicJourneyStartR1737')source=v;return true;}})};
    const doc={readyState:'complete',addEventListener:(k,fn)=>docHandlers.set(k,fn)};
    const loc={hash};
    new Function('FORCE','root','document','location','boot','addEventListener','removeEventListener',bootBlock)(
      force,root,doc,loc,()=>boots++,(k,fn)=>handlers.set(k,fn),k=>handlers.delete(k));
    for(const e of events){
      if(e.hash!==undefined)loc.hash=e.hash;
      (handlers.get(e.type)||docHandlers.get(e.type))?.(e);
    }
    return {boots,source};
  }
  const tests=[
    [{events:[{type:'scroll',isTrusted:true}]},0,null],
    [{events:[{type:'wheel',isTrusted:false},{type:'wheel',isTrusted:true}]},1,'intent-wheel'],
    [{events:[{type:'touchstart',isTrusted:true}]},1,'intent-touchstart'],
    [{events:[{type:'keydown',isTrusted:true,repeat:true}]},0,null],
    [{hash:'#pricing'},1,'explicit-hash'],
    [{events:[{type:'hashchange',hash:'#hero'},{type:'hashchange',hash:'#pricing'}]},1,'explicit-hash'],
    [{force:true},1,'forced'],
    [{events:[{type:'formatx:magbirthcomplete'},{type:'wheel',isTrusted:true}]},1,'mag-birth-handoff']
  ];
  for(const [input,boots,source] of tests)assert.deepEqual(simulate(input),{boots,source});
  const initial=new Function(section(archive,'  function initialJourney(', '  let journeyArmed=')+'return initialJourney;')();
  const cases=[
    [false,'',95,'navigate',false],[false,'',95,'reload',false],
    [false,'',95,'back_forward',true],[false,'#pricing',0,'navigate',true],
    [false,'#hero',95,'navigate',false],[true,'',0,'navigate',true],
    [false,'',95,undefined,false]
  ];
  for(const [force,hash,scroll,navigation,expected] of cases)
    assert.equal(initial(force,hash,scroll,navigation),expected);
  return {journey:tests.length,archive:cases.length};
}
if(require.main===module)console.log('R2253_MAG_VISITOR_INTENT_PASS '+JSON.stringify(run(fs.readFileSync(journeyPath,'utf8'),fs.readFileSync(archivePath,'utf8'))));
module.exports={run};

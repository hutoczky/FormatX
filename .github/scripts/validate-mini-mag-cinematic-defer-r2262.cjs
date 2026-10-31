'use strict';
// R2262: secondary controller must not contend with film/native startup.
// The first-party ask bridge must still install immediately on real user intent.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js','utf8');
// Distinct cache keys: refresh the controller's bootstrap chain without
// changing the original physical MAG geometry or Genesis/CSP.
const current=fs.readFileSync('docs/scifi-ui/scripts/formatx-current-mag-loader-r422.js','utf8');
const motion=fs.readFileSync('docs/scifi-ui/scripts/formatx-motion-runtime-loader-r239.js','utf8');
const scheduler=fs.readFileSync('docs/scifi-ui/scripts/formatx-p0-motion-scheduler-r490.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const secondary='20261031-r2265-dom-telemetry-1hz';
const native='20261031-r2265-dom-telemetry-1hz';
for(const [name,value,expected] of [
 ['mini assistant',current,'formatx-mini-mag-assistant-r459.js?v=20261031-r2263-primary-mag-first-idle'],
 ['R422 loader',motion,'formatx-current-mag-loader-r422.js?v='+secondary],
 ['R239 loader',scheduler,'formatx-motion-runtime-loader-r239.js?v='+secondary],
 ['R490 html',html,'formatx-p0-motion-scheduler-r490.js?v='+secondary],
 ['Worker scheduler',worker,'formatx-p0-motion-scheduler-r490.js?v='+secondary],
 ['Worker rewrite',worker,'formatx-motion-runtime-loader-r239.js?v='+secondary],
 ['native R326',current,'formatx-crystal-organism-r326.js?v='+native],
 ['native R239',motion,'formatx-crystal-organism-r326.js?v='+native]
])assert(value.includes(expected),name+' must use correct split cache version');
const a=src.indexOf('function mountAfterCinemaR2262(){');
const b=src.indexOf("\nif(document.readyState==='loading')",a);
assert(a>=0&&b>a,'R2262 cinematic deferral owner missing');
assert(src.includes("installDeferredNow?.();"),'Real user asks must bypass deferral');
assert(src.includes("root.dataset.fxMiniMagHeroBridgeR460='queued-until-ready'"),
  'Hero commands must remain queued and lossless');
assert(src.includes("root.dataset.fxMiniMagAssistantR459='ready'"),
  'Original mini controller must eventually become interactive');
assert(src.includes("const eventTarget=cinematicActive?document:window;"),
  'Film completion belongs to document, native readiness belongs to window');
assert(src.includes("'formatx:currentmagready'"),
  'No-intro path must wait for the actual primary MAG');
assert(src.includes("'primary-deferred'"),
  'No-intro primary-first priority gate missing');
assert(!src.slice(a,b).includes('setInterval('),'No polling loops allowed');
const build=new Function('root','document','window','addStyle','install',
  'setTimeout','clearTimeout','requestIdleCallback',
  'let installDeferredNow=null;'+src.slice(a,b)+
  ';return {mount:mountAfterCinemaR2262,urgent:()=>installDeferredNow?.()};');
function scenario({film=true,hero=true,primaryReady=false,user=false,
  complete=false,watchdog=false}={}){
  const root={dataset:{
    fxMagBirthLiveR533:film?'active':'complete',
    fxCurrentMagRuntimeR422:primaryReady?'ready':'pending',
    fxMiniMagAssistantR459:'booting'
  }};
  const docListeners=new Map(),winListeners=new Map(),timers=new Map(),idles=[];
  let nextTimer=0,styles=0,installs=0,clears=0;
  const listen=(map)=>({
    addEventListener(n,fn){map.set(n,fn);},
    removeEventListener(n){map.delete(n);}
  });
  const doc={
    ...listen(docListeners),body:{dataset:{}},
    getElementById(id){
      if(id==='hero')return hero?{}:null;
      if(id==='fx-mag-birth-prepaint-r1606')return film?{}:null;
      return null;
    }
  };
  const addStyle=()=>{styles++;};
  const install=()=>{installs++;root.dataset.fxMiniMagAssistantR459='ready';};
  const setTimeout=fn=>{const id=++nextTimer;timers.set(id,fn);return id;};
  const clearTimeout=id=>{clears++;timers.delete(id);};
  const requestIdleCallback=fn=>{idles.push(fn);return idles.length;};
  const win={...listen(winListeners),requestIdleCallback};
  const h=build(root,doc,win,addStyle,install,setTimeout,
    clearTimeout,requestIdleCallback);
  h.mount();
  if(hero){
    assert.equal(installs,0,'Primary MAG owns first paint, no mini DOM');
    assert.equal(styles,0,'Secondary script must not inject CSS during boot');
    assert.equal(root.dataset.fxMiniMagAssistantR459,
      film?'cinematic-deferred':'primary-deferred');
    if(user)h.urgent();
    else if(complete){
      const handlers=film?docListeners:winListeners;
      handlers.get(film?'formatx:magbirthcomplete':'formatx:currentmagready')();
    }else if(watchdog)Array.from(timers.values())[0]();
    if(!user)for(const cb of idles.splice(0))cb();
    if(user||complete||watchdog||primaryReady){
      if(primaryReady&&!user&&!complete&&!watchdog)for(const cb of idles.splice(0))cb();
      assert.equal(installs,1,'Controller must mount after priority gate');
    }
    h.urgent(); // cannot install twice
    if(installs===1)assert.equal(styles,1);
  }else{
    assert.equal(installs,1,'Public / no hero fallback mounts immediately');
    assert.equal(styles,1);
  }
  return {styles,installs,clears,live:root.dataset.fxMiniMagAssistantR459};
}
const variants=[
  ['normal-film',scenario({film:true,complete:true})],
  ['cinema-user-request',scenario({film:true,user:true})],
  ['cinema-watchdog',scenario({film:true,watchdog:true})],
  ['primary-native-ready',scenario({film:false,complete:true})],
  ['primary-already-ready',scenario({film:false,primaryReady:true})],
  ['primary-urgent-request',scenario({film:false,user:true})],
  ['primary-watchdog',scenario({film:false,watchdog:true})],
  ['public-fallback',scenario({film:false,hero:false})]
];
for(const [name,result] of variants){
  assert.equal(result.installs,1,name+' must have exactly one controller');
  assert.equal(result.styles,1,name+' must attach one stylesheet');
  console.log('MINI_MAG_R2263_PRIMARY_FIRST_PASS',name,JSON.stringify(result));
}

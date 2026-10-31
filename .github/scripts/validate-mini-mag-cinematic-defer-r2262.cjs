'use strict';
// R2262: secondary controller must not contend with film/native startup.
// The first-party ask bridge must still install immediately on real user intent.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-mini-mag-assistant-r459.js','utf8');
const a=src.indexOf('function mountAfterCinemaR2262(){');
const b=src.indexOf("\nif(document.readyState==='loading')",a);
assert(a>=0&&b>a,'R2262 cinematic deferral owner missing');
assert(src.includes("installDeferredNow?.();"),'Real user asks must bypass deferral');
assert(src.includes("root.dataset.fxMiniMagHeroBridgeR460='queued-until-ready'"),
  'Hero commands must remain queued and lossless');
assert(src.includes("root.dataset.fxMiniMagAssistantR459='ready'"),
  'Original mini controller must eventually become interactive');
assert(src.includes("document.addEventListener('formatx:magbirthcomplete'"),
  'Listen on document: canonical film event does not bubble');
assert(!src.slice(a,b).includes('setInterval('),'No polling loops allowed');
const build=new Function('root','document','window','addStyle','install',
  'setTimeout','clearTimeout','requestIdleCallback',
  'let installDeferredNow=null;'+src.slice(a,b)+
  ';return {mount:mountAfterCinemaR2262,urgent:()=>installDeferredNow?.()};');
function scenario({film=true,user=false,complete=false,watchdog=false}={}){
  const root={dataset:{fxMagBirthLiveR533:film?'active':'complete',
    fxMiniMagAssistantR459:'booting'}};
  const listeners=new Map(),timers=new Map(),idles=[];
  let nextTimer=0,styles=0,installs=0,clears=0;
  const doc={
    getElementById(){return film?{}:null;},
    addEventListener(n,fn){listeners.set(n,fn);},
    removeEventListener(n){listeners.delete(n);}
  };
  const addStyle=()=>{styles++;};
  const install=()=>{installs++;root.dataset.fxMiniMagAssistantR459='ready';};
  const setTimeout=fn=>{const id=++nextTimer;timers.set(id,fn);return id;};
  const clearTimeout=id=>{clears++;timers.delete(id);};
  const requestIdleCallback=fn=>{idles.push(fn);return idles.length;};
  const h=build(root,doc,{requestIdleCallback},addStyle,install,
    setTimeout,clearTimeout,requestIdleCallback);
  h.mount();
  if(film){
    assert.equal(installs,0,'Film must not construct hidden panel');
    assert.equal(styles,0,'Film must not load secondary stylesheet');
    assert.equal(root.dataset.fxMiniMagAssistantR459,'cinematic-deferred');
    if(user)h.urgent();
    else if(complete)listeners.get('formatx:magbirthcomplete')();
    else if(watchdog)Array.from(timers.values())[0]();
    if(user)assert.equal(installs,1,'Real controller request mounts at once');
    else if(complete||watchdog){
      assert.equal(installs,0,'Film end defers panel to real idle slot');
      assert.equal(idles.length,1);
      idles.shift()();
      assert.equal(installs,1);
    }
    if(user||complete||watchdog){
      // No second mount on a repeated completion or delayed timeout.
      h.urgent();
      assert.equal(installs,1,'Controller may only mount once');
    }
  }else assert.equal(installs,1,'No-intro fallback mounts immediately');
  return {styles,installs,clears,pendingIdles:idles.length};
}
const variants=[
  ['normal-film',scenario({film:true,complete:true})],
  ['user-immediate',scenario({film:true,user:true})],
  ['watchdog',scenario({film:true,watchdog:true})],
  ['intro-disabled',scenario({film:false})]
];
for(const [name,result] of variants){
  assert.equal(result.installs,1,name+' must have exactly one controller');
  assert.equal(result.styles,1,name+' must attach one stylesheet');
  console.log('MINI_MAG_R2262_POST_CINEMA_PASS',name,JSON.stringify(result));
}

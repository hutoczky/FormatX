'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const menu=fs.readFileSync('docs/scifi-ui/scripts/formatx-menu-owner-r1956.js','utf8');
const wda=fs.readFileSync('docs/scifi-ui/scripts/formatx-wda-controls-r198.js','utf8');
const start=menu.indexOf("window.addEventListener('click',event=>{"),end=menu.indexOf("document.addEventListener('pointerdown'",start);
assert(start>=0&&end>start);
const simulate=new Function(`
 let listener,blocked=0,loads=0,active=null;
 class Element{closest(){return this;}}
 class HTMLButtonElement extends Element{constructor(){super();this.dataset={};this.isConnected=true;}setAttribute(){}}
 class HTMLScriptElement{constructor(){this.dataset={};}addEventListener(n,f){this[n]=f;}remove(){active=null;}}
 const target=new HTMLButtonElement();
 const root={dataset:{}},window={addEventListener:(n,f)=>listener=f};
 const document={querySelector:()=>active,createElement:()=>new HTMLScriptElement(),head:{appendChild:s=>{active=s;loads++;}}};
 ${menu.slice(start,end)}
 return {root,click:(trusted=true)=>listener({isTrusted:trusted,target,preventDefault:()=>blocked++,stopImmediatePropagation:()=>{}}),fail:()=>active.error(),state:()=>({blocked,loads,active:!!active,target:target.dataset.fxAudioState})};
`);
const t=simulate();t.click(false);assert.equal(t.state().loads,0);
t.click();assert.equal(t.state().loads,1);assert.equal(t.state().blocked,1);
t.fail();assert.equal(t.state().active,false);assert.equal(t.state().target,'blocked');
t.click();assert.equal(t.state().loads,2);
t.root.dataset.fxWdaHardening='r263';t.click();assert.equal(t.state().blocked,2);
t.root.dataset.fxAudioOwner='professional-v6';t.click();assert.equal(t.state().blocked,2);
const a=wda.indexOf('  function requestProfessionalAudio()'),b=wda.indexOf('  // r423:',a);
assert(a>=0&&b>a);
const engine=new Function(`
 let loadingAudio=false,pendingToggleAfterLoad=true,active=null,loads=0;
 const root={dataset:{}},button={dataset:{}},AUDIO_SRC='engine.js';
 const document={querySelector:()=>active,createElement:()=>({dataset:{},addEventListener(n,f){this[n]=f;},remove(){active=null;}}),head:{appendChild:s=>{active=s;loads++;}}};
 const ensureButton=()=>button,sync=()=>{},scheduleLayout=()=>{},replayPendingToggle=()=>{};
 ${wda.slice(a,b)}
 return {request:requestProfessionalAudio,fail:()=>active.error(),state:()=>({loads,active:!!active,loadingAudio,pendingToggleAfterLoad,root:root.dataset.fxAudioState,button:button.dataset.fxAudioState})};
`)();
engine.request();engine.fail();assert.equal(engine.state().active,false);assert.equal(engine.state().root,'blocked');assert.equal(engine.state().button,'blocked');
engine.request();assert.equal(engine.state().loads,2);
console.log('R2318 sound ownership handoff and two failed-load retry paths: PASS');

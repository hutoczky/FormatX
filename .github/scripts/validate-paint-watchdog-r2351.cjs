'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-deferred-css-r487.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const worker=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const key='formatx-deferred-css-r487.js?v=20261126-r2257-single-activation-task-r2351-paint-watchdog';
assert.ok(html.includes(key)&&worker.includes(key));
class Link{
 constructor(){this.media='print';this.dataset={fxR487Media:'all'};this.sheet={};this.handlers={};}
 addEventListener(n,f){this.handlers[n]=f;}
 hasAttribute(){return false;}
}
function run({buffered=false,hidden=false}={}){
 let now=0,id=0,paintObserver=null,disconnects=0,events=0;
 const jobs=new Map(),frames=new Map(),listeners=new Map(),link=new Link(),root={dataset:{}};
 const doc={documentElement:root,visibilityState:hidden?'hidden':'visible',readyState:'complete',
  querySelectorAll:()=>[link],addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n)};
 class PO{static supportedEntryTypes=['paint'];constructor(f){paintObserver=f;}observe(){}disconnect(){disconnects++;}}
 const perf={getEntriesByName:()=>buffered?[{}]:[]};
 new Function('document','navigator','location','window','PerformanceObserver','performance','HTMLLinkElement','requestAnimationFrame','cancelAnimationFrame','setTimeout','clearTimeout','addEventListener','dispatchEvent','CustomEvent','URLSearchParams',src)(doc,{userAgent:''},{search:''},{PerformanceObserver:PO},PO,perf,Link,
  f=>{frames.set(++id,f);return id;},i=>frames.delete(i),
  (f,ms)=>{jobs.set(++id,{f,at:now+ms});return id;},i=>jobs.delete(i),()=>{},()=>events++,class{},class{get(){return null;}});
 return {root,link,doc,events:()=>events,disconnects:()=>disconnects,
  paint:()=>paintObserver?.({getEntries:()=>[{name:'first-contentful-paint'}]}),
  show:()=>{doc.visibilityState='visible';buffered=true;listeners.get('visibilitychange')?.();},
  step:t=>{now=t;for(const [i,j] of [...jobs])if(j.at<=now){jobs.delete(i);j.f();}},
  frame:()=>{for(const [i,f] of [...frames]){frames.delete(i);f();}},
  active:()=>link.media==='all'};
}
let x=run({buffered:true});x.frame();x.step(0);assert.equal(x.active(),true);x.step(2000);assert.equal(x.events(),1);
x=run();x.step(1199);assert.equal(x.active(),false);x.step(1200);assert.equal(x.active(),false);x.frame();x.step(1200);assert.equal(x.active(),true);assert.equal(x.disconnects(),1);
x=run();x.paint();x.frame();x.step(10);x.step(1200);assert.equal(x.events(),1);assert.equal(x.root.dataset.fxDeferredCssReasonR526,'observed-fcp');
x=run({hidden:true});x.step(1200);assert.equal(x.active(),true);assert.equal(x.root.dataset.fxDeferredCssReasonR526,'hidden-tab-fail-open');
x=run({hidden:true});x.show();x.frame();x.step(0);assert.equal(x.active(),true);assert.equal(x.events(),1);assert.equal(x.root.dataset.fxDeferredCssReasonR526,'visibility-buffered-fcp');
console.log('R2351 five paint watchdog paths and exact Worker delivery: PASS');

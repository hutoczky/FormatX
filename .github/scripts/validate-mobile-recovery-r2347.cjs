'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-deferred-reduced-style-r232.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const marker=fs.readFileSync('docs/production-revision.txt','utf8');
assert.ok(marker.includes('production_delivery_revision=20261128-r2347-copy-anchor-mobile-recovery'));
assert.doesNotThrow(()=>new Function(src));
const key=html.match(/<link[^>]*rel="preload"[^>]*href="([^"]*formatx-mobile-first-paint-r358\.css[^"]*)"/)[1];
assert.ok(src.includes("'"+key+"'"));
class Link{
 constructor(href='',sheet=null){this.href=href;this.sheet=sheet;this.dataset={};this.handlers={};}
 addEventListener(type,fn){this.handlers[type]=fn;}
}
function simulate(existing,preload){
 const root={dataset:{},classList:{add(){},remove(){}}};
 const added=[];
 const doc={documentElement:root,head:{appendChild:l=>added.push(l)},querySelector:q=>q.includes('rel="preload"')?preload:q.includes('data-fx-mobile-first-paint-r358')?existing:null,createElement:()=>new Link()};
 new Function('document','matchMedia','HTMLLinkElement',src)(doc,q=>({matches:!q.includes('prefers-reduced-motion')}),Link);
 return {root,added};
}
const ready=new Link(key,{});
let r=simulate(ready,null);
assert.equal(r.added.length,0);assert.equal(r.root.dataset.fxMobileFirstPaintR358,'ready');
const pending=new Link(key);
r=simulate(pending,null);
assert.equal(r.added.length,0);assert.equal(r.root.dataset.fxMobileFirstPaintR358,'loading');
pending.handlers.load();assert.equal(r.root.dataset.fxMobileFirstPaintR358,'ready');
const failed=new Link(key);
r=simulate(failed,null);failed.handlers.error();
assert.equal(r.root.dataset.fxMobileFirstPaintR358,'load-failed');
r=simulate(null,new Link(key+'&canonical=1'));
assert.equal(r.added.length,1);assert.equal(r.added[0].href,key+'&canonical=1');
r.added[0].handlers.load();assert.equal(r.root.dataset.fxMobileFirstPaintR358,'ready');
r=simulate(null,null);
assert.equal(r.added.length,1);assert.equal(r.added[0].href,key);
console.log('R2347 release marker and five mobile recovery paths: PASS');

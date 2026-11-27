'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('billing-worker/src/production-content-entry.js','utf8');
const html=fs.readFileSync('docs/scifi-ui/index.html','utf8');
const a=s.indexOf('function injectReferenceModeBoot('),b=s.indexOf('function injectCriticalFirstPaint(',a);
const constant=s.split('\n').find(l=>l.startsWith('const REFERENCE_MODE_BOOT_SCRIPT ='));
const inject=new Function(constant+'\n'+s.slice(a,b)+'return injectReferenceModeBoot;')();
assert.equal(inject(html),html,'canonical source must not fetch a duplicate boot script');
const legacy='<html><head><title>legacy</title></head><body></body></html>';
const fallback=inject(legacy);
assert.ok(fallback.includes('data-fx-reference-mode-boot-r504="true"'));
assert.equal(inject(fallback),fallback);
const partial='<html><head><script data-fx-intro-bootstrap-r1629="true">r.dataset.fxReferenceProductionR244="desktop";</script></head></html>';
assert.ok(inject(partial).includes('data-fx-reference-mode-boot-r504="true"'));
const inline=html.match(/<script data-fx-intro-bootstrap-r1629="true">([\s\S]*?)<\/script>/)[1];
const dataset={};
for(const mobile of [false,true]){
 for(const key of Object.keys(dataset))delete dataset[key];
 const doc={documentElement:{dataset},head:{},readyState:'loading',addEventListener(){}};
 new Function('document','location','matchMedia','sessionStorage','navigator',inline)(doc,{search:''},()=>({matches:mobile}),{getItem:()=>null},{webdriver:false,userAgent:'normal-browser'});
 assert.equal(dataset.fxReferenceProductionR244,mobile?'ready':'desktop');
 assert.equal(dataset.fxReferenceComposition,mobile?'reference-frame-r244':'desktop-reference-r244');
 assert.equal(dataset.fxReferencePrepaintR1620,mobile?'mobile-ready-first-byte':'desktop-first-byte');
}
console.log('R2340 redundant synchronous reference boot removed; desktop/mobile and legacy fallback: PASS');

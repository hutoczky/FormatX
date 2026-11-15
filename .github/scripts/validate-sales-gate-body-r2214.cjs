'use strict';
// Regression: a legally blocked GET checkout must explain the restriction.
// Never loosen the underlying 503 gate or set merchant readiness flags.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'billing-worker/src/production-entry.js'),'utf8');
assert.ok(!source.includes("request.method === 'HEAD' || !response.ok"),
  'A non-2xx GET must never be treated as HEAD and lose its error-page body');
assert.ok(source.includes("if (request.method === 'HEAD') return withNoStore(response, true);"),
  'HEAD-only body suppression is missing');
assert.ok(source.includes("if (!response.ok) return withNoStore(response, false);"),
  'Non-2xx GET must preserve its HTML/JSON response body');
const fnMatch=source.match(/function withNoStore\(response, withoutBody\) \{[\s\S]*?\n\}/);
assert.ok(fnMatch,'withNoStore helper unavailable');
const withNoStore=vm.runInNewContext('('+fnMatch[0]+')',{Headers,Response});
(async()=>{
  const sample='<main><h1>Az új licencvásárlás átmenetileg nem indítható</h1></main>';
  const error=withNoStore(new Response(sample,{
    status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}
  }),false);
  assert.equal(error.status,503);
  assert.equal(await error.text(),sample,'GET 503 error HTML must remain readable');
  const head=withNoStore(new Response(sample,{status:503}),true);
  assert.equal(head.status,503);
  assert.equal(await head.text(),'','HEAD must not include a body');
  const moduleUrl=pathToFileURL(path.join(root,'billing-worker/src/sales-gate.js')).href;
  const sales=await import(moduleUrl);
  const locked=sales.createSalesUnavailablePage();
  assert.equal(locked.status,503);
  const body=await locked.text();
  assert.match(body,/<main\b/);
  assert.match(body,/licencvásárlás átmenetileg nem indítható/i);
  assert.ok(!body.includes('bankkártyaadatok megadása'));
  console.log('SALES_GATE_503_BODY_PASS: legal lock and readable explanation preserved');
})().catch(e=>{console.error(e);process.exit(1);});

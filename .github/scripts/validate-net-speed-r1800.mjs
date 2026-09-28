import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import worker from '../../billing-worker/src/production-content-entry.js';

const repoRoot=new URL('../../',import.meta.url);
const read=path=>fs.readFile(new URL(path,repoRoot),'utf8');

const [index,client,css,workerSource]=await Promise.all([
  read('docs/scifi-ui/index.html'),
  read('docs/scifi-ui/scripts/formatx-net-speed-r1800.js'),
  read('docs/scifi-ui/styles/formatx-net-speed-r1800.css'),
  read('billing-worker/src/production-content-entry.js'),
]);

assert.match(index,/id="network"/);
assert.match(index,/data-fx-net-speed-r1800="true"/);
assert.match(index,/formatx-net-speed-r1800\.js\?v=20260928-r1800-network-sensor/);
assert.match(index,/formatx-net-speed-r1800\.css\?v=20260928-r1800-network-sensor/);
assert.match(index,/https:\/\/www\.speedtest\.net\//);
assert.match(client,/user-initiated-same-origin-no-idle-network/);
assert.match(client,/\/api\/net\/ping/);
assert.match(client,/\/api\/net\/download/);
assert.match(client,/\/api\/net\/upload/);
assert.match(css,/production-r1800-network-sensor-user-initiated-no-idle-traffic/);
assert.match(workerSource,/production-r1800-network-sensor-speed-test-endpoints/);

const env={};
const ctx={waitUntil(){}};

async function call(path,init={}){
  return worker.fetch(new Request('https://formatxsuite.com'+path,init),env,ctx);
}

{
  const response=await call('/api/net/ping');
  assert.equal(response.status,200);
  assert.match(response.headers.get('cache-control')||'',/no-store/);
  assert.equal(response.headers.get('x-formatx-net-speed'),'r1800-user-initiated-edge-path');
  const json=await response.json();
  assert.equal(json.ok,true);
  assert.equal(typeof json.now,'number');
}

{
  const bytes=192*1024;
  const response=await call('/api/net/download?bytes='+bytes);
  assert.equal(response.status,200);
  assert.equal(Number(response.headers.get('content-length')),bytes);
  const body=await response.arrayBuffer();
  assert.equal(body.byteLength,bytes);
}

{
  const body=new Uint8Array(96*1024);
  const response=await call('/api/net/upload',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body});
  assert.equal(response.status,200);
  const json=await response.json();
  assert.equal(json.ok,true);
  assert.equal(json.bytes,body.byteLength);
}

{
  const tooLarge=new Uint8Array(4*1024*1024+1);
  const response=await call('/api/net/upload',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:tooLarge});
  assert.equal(response.status,413);
}

{
  const response=await call('/api/net/download',{method:'POST',body:'x'});
  assert.equal(response.status,405);
}

console.log('FormatX NET R1800 worker/source contract: OK');

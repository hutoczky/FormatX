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

const lazyLoader=await read('docs/scifi-ui/scripts/formatx-net-speed-on-demand-r2238.js');
assert.doesNotThrow(()=>new Function(lazyLoader),'NET viewport loader JavaScript syntax');
assert.match(index,/formatx-net-speed-on-demand-r2238\.js\?v=20261029-r2240-controller-selector/);
assert.match(lazyLoader,/formatx-net-speed-r1800\.js\?v=20261029-r2240-controller-selector/);
assert.match(lazyLoader,/IntersectionObserver/);
assert.match(lazyLoader,/start\.click\(\)/);
assert.match(lazyLoader,/rootMargin:'800px 0px'/);
assert.match(lazyLoader,/section\.dataset\.fxNetBoundR1800/);
assert.match(client,/document\.querySelector\('section\[data-fx-net-speed-r1800="true"\]'\)/,
  'Controller must target real network section, never a script element');
assert.match(lazyLoader,/script\.dataset\.fxNetControllerBundleR2240='true'/,
  'Dynamic bundle uses its own R2240 identity');
assert.doesNotMatch(lazyLoader,/script\.dataset\.fxNetSpeedR1800\s*=/,
  'Script must never shadow real section selector in head');
assert.match(lazyLoader,/addEventListener\('click'/);
assert.doesNotMatch(index,/<script[^>]+src="\.\/scripts\/formatx-net-speed-r1800\.js/);

assert.match(index,/id="network"/);
assert.match(index,/data-fx-net-speed-r1800="true"/);

assert.match(index,/formatx-net-speed-r1800\.css\?v=20261004-r1902-touch-target/);
assert.match(index,/https:\/\/www\.speedtest\.net\//);
assert.match(client,/user-initiated-same-origin-multistream-gigabit-no-idle-network-r1810/);
assert.match(client,/\/api\/net\/ping/);
assert.match(client,/\/api\/net\/download/);
assert.match(client,/\/api\/net\/upload/);
assert.match(css,/production-r1800-network-sensor-user-initiated-no-idle-traffic/);
assert.match(workerSource,/production-r1800-network-sensor-speed-test-endpoints/);
assert.match(workerSource,/production-r1810-gigabit-multistream-edge-transport/);
assert.match(client,/parallelDownload/);
assert.match(client,/parallelUpload/);
assert.match(client,/loadedLatencyDuring/);

const env={};
const ctx={waitUntil(){}};

async function call(path,init={}){
  return worker.fetch(new Request('https://formatxsuite.com'+path,init),env,ctx);
}

{
  const response=await call('/api/net/ping');
  assert.equal(response.status,200);
  assert.match(response.headers.get('cache-control')||'',/no-store/);
  assert.equal(response.headers.get('x-formatx-net-speed'),'r1810-user-initiated-multistream-edge-path');
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

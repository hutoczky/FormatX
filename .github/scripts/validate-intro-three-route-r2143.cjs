'use strict';
// R2143 regression: the root-domain homepage must load the same native
// Three.js birth engine as /scifi-ui/index.html. A page-relative import
// once resolved to /scripts/three-r185.module.js and forced the 2D fallback.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=path=>fs.readFileSync(path,'utf8');
const engine=read('docs/scifi-ui/scripts/formatx-mag-genesis-three-r1280.js');
const birth=read('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js');
const worker=read('billing-worker/src/production-content-entry.js');
const modulePath='/scifi-ui/scripts/three-r185.module.js';
const revision='formatx-mag-genesis-three-r1280.js?v=20261022-r2143-canonical-threejs-route';
assert.ok(fs.statSync('docs'+modulePath).size>1000,'Real bundled Three.js module absent');
assert.ok(engine.includes("new URL('/scifi-ui/scripts/three-r185.module.js', location.origin).href"),
  '3D cinematic must resolve bundled Three.js against the canonical origin');
assert.ok(!engine.includes("new URL('./scripts/three-r185.module.js', location.href)"),
  'Page-relative Three.js import would break canonical root homepage');
assert.ok(birth.includes(revision),'Intro bootstrap is still caching old Three.js engine');
assert.ok(worker.includes(revision),'Cloudflare asset rewrite would downgrade the canonical 3D intro');
for(const home of [
  'https://formatxsuite.com/',
  'https://formatxsuite.com/scifi-ui/index.html',
  'https://www.formatxsuite.com/'
]){
  const u=new URL(modulePath,new URL(home).origin);
  assert.equal(u.pathname,modulePath,home+' must resolve the exact bundled 3D engine');
}
console.log('FORMATX_R2143_ROOT_THREE_MODULE_ROUTE_PASS');

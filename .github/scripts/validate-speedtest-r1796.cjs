'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

function read(path){return fs.readFileSync(path,'utf8');}
const home=read('docs/scifi-ui/index.html');
const launcher=read('docs/scifi-ui/scripts/formatx-speedtest-launcher-r1796.js');
const engine=read('docs/scifi-ui/scripts/formatx-speedtest-r1796.js');
const css=read('docs/scifi-ui/styles/formatx-speedtest-r1796.css');
const api=read('billing-worker/src/speedtest-api.js');
const entry=read('billing-worker/src/production-content-entry-r529.js');

assert.ok(home.includes('data-fx-speedtest-launcher="true"'),'speed test launcher missing from hero');
assert.ok(home.includes('formatx-speedtest-launcher-r1796.js?v=20260928-r1796-edge-speedtest'),'speed test launcher runtime missing');
assert.ok(launcher.includes('import(MODULE_URL)'),'speed test heavy module must lazy-load after intent');
assert.ok(launcher.includes('armed-zero-measurement-idle'),'zero-idle launcher marker missing');
for(const token of ['/api/speedtest/ping','/api/speedtest/download','/api/speedtest/upload'])assert.ok(engine.includes(token),'speed engine missing '+token);
for(const token of ['Ping','Jitter','Download','Upload','Mbps'])assert.ok(engine.includes(token),'speed UI metric missing '+token);
assert.ok(engine.includes('Estimated data use')&&engine.includes('Becsült adatforgalom'),'data usage disclosure missing');
assert.ok(css.includes('.fx-speedtest-r1796')&&css.includes('.fx-speedtest-grid')&&css.includes('.fx-speedtest-metric'),'speed test studio UI missing');
assert.ok(api.includes('MAX_DOWNLOAD_BYTES = 8 * 1024 * 1024'),'download safety cap missing');
assert.ok(api.includes('MAX_UPLOAD_BYTES = 4 * 1024 * 1024'),'upload safety cap missing');
assert.ok(api.includes('same_origin_required'),'same-origin abuse guard missing');
assert.ok(api.includes('PUBLIC_API_RATE_LIMIT')&&api.includes("'speedtest:'"),'public speed test rate limit missing');
assert.ok(api.includes("crypto.subtle.digest('SHA-256'"),'speed test limiter must hash the network identity');
assert.ok(entry.includes('isSpeedTestPath(url.pathname)'),'production route missing');
assert.ok(entry.indexOf('isSpeedTestPath(url.pathname)')<entry.indexOf('canonicalProduction.fetch'),'speed route must execute before canonical production');
console.log('PASS: FormatX R1796 speed test launcher, lazy UI, same-origin edge API and transfer caps are source-valid.');

'use strict';
/* R2051 first-paint / original MAG scroll stylesheet contract.
 * Fast deterministic source test. The separate Chromium suite validates
 * actual WebGL2 scene rendering, eight original HTML handoffs, and input.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=path=>fs.readFileSync(path,'utf8');
const worker=source('billing-worker/src/production-entry.js');
const runtime=source('docs/scifi-ui/scripts/formatx-infinite-scroll-desktop-v7.js');
const deferred=source('docs/scifi-ui/scripts/formatx-deferred-css-r487.js');
const css=source('docs/scifi-ui/styles/formatx-seamless-loop.css');
const asset=worker.match(/<link\s+[^'\n]*data-fx-seamless-loop-style="true"[^'\n]*>/);
assert.ok(asset,'Production must serve exactly one original seamless-loop stylesheet link');
assert.match(asset[0],/data-fx-r487-deferred-style="true"/);
assert.match(asset[0],/data-fx-r487-media="all"/);
assert.match(asset[0],/media="print"/);
assert.match(asset[0],/href="\/scifi-ui\/styles\/formatx-seamless-loop\.css\?v=20261015-r2105-integrated-visible-native-genesis"/);
assert.equal((worker.match(/data-fx-seamless-loop-style="true"/g)||[]).length,1,
  'Do not add a second competing seamless-loop CSS link');
assert.ok(css.length>4000&&/scroll-snap-type/i.test(css),
  'Original non-hijacking scroll CSS and geometry must be preserved');
assert.match(deferred,/formatx:deferredcssready/);
assert.match(deferred,/data-fx-r487-deferred-style/);
assert.match(runtime,/link\[data-fx-seamless-loop-style\]/);
assert.match(runtime,/addEventListener\('formatx:deferredcssready',scheduleGeometryRefresh/);
assert.match(runtime,/scheduleGeometryRefresh\(\)/);
assert.doesNotMatch(runtime,/addEventListener\('wheel'/);
assert.doesNotMatch(runtime,/addEventListener\('touchmove'/);
console.log('R2051_POST_FCP_SEAMLESS_ARCHIVE_CSS_PASS',
  JSON.stringify({bytes:css.length,productionMedia:'print',activatedMedia:'all',
    source:'original CSS + original scroll runtime',
    browserVerification:'delegated to native eight-source Chromium workflow'}));

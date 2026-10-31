'use strict';
// R2265: keep a true 60 FPS renderer while limiting expensive mutable root
// debug metrics. Do not alter the public metric format, WebGL or PAUSE owner.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const src=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const runtime=src.match(/if\(now-lastRuntimeTelemetryAt>=(\d+) \|\| lastRuntimeTelemetryAt===-Infinity\)/);
const refresh=src.match(/if\(now-lastRefreshTelemetryAt>=(\d+) \|\| lastRefreshTelemetryAt===-Infinity\)/);
assert(runtime,'One-shot + bounded runtime telemetry cadence is missing');
assert(refresh,'One-shot + bounded refresh telemetry cadence is missing');
assert.equal(Number(runtime[1]),1000,'Metric DOM writes must be 1 Hz, not 4 Hz');
assert.equal(Number(refresh[1]),1000,'Refresh diagnostic DOM writes must be 1 Hz');
function shouldSample(now,last,cadence){return now-last>=cadence||last===-Infinity;}
for(const pair of [[0,-Infinity,true],[999,0,false],[1000,0,true],
 [1100,1000,false],[2000,1000,true]]){
 assert.equal(shouldSample(pair[0],pair[1],1000),pair[2],
   'first frame and one-second sample boundary must remain deterministic');
}
assert(src.includes('function render(now){')||src.includes('function render(now) {'),
  'The original WebGL renderer was replaced');
assert(src.includes('gl.drawArrays(gl.TRIANGLES,0,geometry.count);'),
  'The original full-detail mesh must still be drawn');
assert(src.includes('raf=requestAnimationFrame(frame)'),
  'Real rendering cadence must not become telemetry-capped');
assert(src.includes("root.dataset.fxCoreFirstFrameR1913='painted'"),
  'True first-frame proof must remain immediate');
assert(src.includes("root.dataset.fxMagHandoffGpuR2226='finished'"),
  'Original WebGL GPU-fence handoff must remain intact');
console.log('MAG_R2265_TELEMETRY_CADENCE_PASS');

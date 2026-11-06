/* FormatX R2320: the physical native canvas must reach the viewport
   without a CSS filter or animated opacity. Real P0 pixel proof remains
   mandatory; this source guard never substitutes for it. */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const mag=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const capture=fs.readFileSync('.github/scripts/capture-mag-intro-r656.cjs','utf8');
assert.match(mag,/preserveDrawingBuffer:true/);
assert.match(mag,/canvas\.style\.setProperty\('filter','none','important'\)/);
assert.match(mag,/canvas\.style\.setProperty\('-webkit-filter','none','important'\)/);
assert.match(mag,/canvas\.style\.setProperty\('opacity','1','important'\)/);
assert.match(mag,/fxMagCanvasCompositeR2320='direct-unfiltered-opaque-preserved-webgl'/);
assert.match(mag,/livingTimeline\.pause\(\)/);
assert.match(mag,/livingTimeline\?\.play\?\.\(\)/);
assert.doesNotMatch(mag,/canvas\.animate\(\s*\[\s*\{opacity:/);
assert.match(capture,/nativeSurfacePolicy:root\.dataset\.fxMagCanvasCompositeR2320/);
assert.match(capture,/state\.canvasRect\.filter!=='none'/);
assert.match(capture,/R2209 full-viewport MAG is black/);
assert.doesNotMatch(mag,/mobileBreathPreference|syncMobileBreathOpacity/);
assert.match(mag,/livingTimeline\\?\\.cancel\\?\\.\\(\\)/);
console.log('R2321_NATIVE_MAG_CLEANUP_CONTRACT_PASS');

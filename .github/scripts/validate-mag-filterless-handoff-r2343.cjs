'use strict';
// R2343: filtered full-screen film must not own an extra compositor surface
// during native WebGL exposure. This source guard does not replace real pixels.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const film=fs.readFileSync('docs/scifi-ui/scripts/formatx-mag-birth-live-r533.js','utf8');
const native=fs.readFileSync('docs/scifi-ui/scripts/formatx-crystal-organism-r326.js','utf8');
const strictCapture=fs.readFileSync('.github/scripts/capture-mag-intro-r656.cjs','utf8');
const archive=fs.readFileSync('docs/scifi-ui/scripts/formatx-cinematic-archive-r1987.js','utf8');
const fade=film.slice(film.indexOf('  function safeTeardownOverlay('),film.indexOf('  function finish('));
assert(fade.length>1000,'Missing real source film handoff');
assert.match(fade,/NATIVE_CROSSFADE_MS_R2324/);
assert.match(fade,/overlay\.style\.setProperty\('filter','none','important'\)/);
assert.match(fade,/overlay\.style\.setProperty\('transition','opacity \.26s ease','important'\)/);
assert.doesNotMatch(fade,/opacity \.26s ease, filter \.26s ease/);
assert.match(fade,/overlay\.classList\.add\('is-leaving'\)/);
assert.match(fade,/releaseStageStyle\(\)/);
assert.match(fade,/overlay\.remove\(\)/);
assert.match(fade,/formatx:magbirthcomplete/);
// R2343b requires one temporary stage identity layer; it MUST restore
// the original stage CSS, not override the canvas' living WAAPI transform.
assert.match(native,/const exposeNativeStageLayerR2343=\(\)=>\{/);
assert.match(native,/stage\.style\.setProperty\('transform','translate3d\(0,0,0\)','important'\)/);
assert.match(native,/stage\.style\.removeProperty\('transform'\)/);
assert.match(native,/\},860\);/);
assert.match(native,/exposeNativeStageLayerR2343\(\);/);
assert.doesNotMatch(native,/canvas\.style\.setProperty\('transform','translate3d/);
assert.match(native,/preserveDrawingBuffer:true/);
assert.match(native,/canvas\.style\.setProperty\('filter','none','important'\)/);
assert.match(native,/canvas\.style\.setProperty\('opacity','1','important'\)/);
assert.match(strictCapture,/state\.handoffPixels\.bright<40/);
assert.match(strictCapture,/R2209 full-viewport MAG is black/);
const complete=archive.slice(archive.indexOf("document.addEventListener('formatx:magbirthcomplete'"),
  archive.indexOf("addEventListener('formatx:languagechange'"));
assert.match(archive,/function snapshotNativeHomeBeforeCompletionR2343c\(\)/);
assert.match(archive,/formatx:magbirthprepare'/);
assert.match(archive,/nativeHomePreflightR2343c\?\.target===target/);
assert.match(archive,/function prepareNativeHomeR2315\(usePreflightR2343c=false\)/);
assert.match(complete,/prepareNativeHomeR2315\(true\)/);
assert.doesNotMatch(complete,/getBoundingClientRect/);
assert.match(archive,/nativeHomePreflightR2343c=null/);

console.log('R2343_FILTERLESS_HANDOFF_SOURCE_CONTRACT_PASS; full-viewport actual pixels are still required');
